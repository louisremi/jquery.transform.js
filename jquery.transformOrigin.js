(function($,window) {

var runits = /^([\+\-]=)?(-?[\d+\.\-]+)([a-z]+|%)?(.*?)$/i,
	_transformOrigin = "transformOrigin",
	_parseFloat = parseFloat;

$.cssHooks[_transformOrigin] = {
	get: function( elem, computed ) {
		return $._data( elem, _transformOrigin ) || "50% 50%";
	},
	set: function( elem, value ) {
		var origin = value,
			matrix = value,
			i = 2,
			ratio, width, height,	matches,
			toCenter, fromCenter, offset, sides,
			cssPosition, usePosition, css = {}, propTop, propLeft,
			top, left, cssTop, cssLeft, currentTop, currentLeft,
			elemStyle, currStyle;

		// Translate components are being set
		if ( value.constructor === Array ) {
			// save matrix
			$._data( elem, "transformTranslate", [ value[4], value[5] ]);
			// get origin
			origin = $._data( elem, _transformOrigin );

		// transformOrigin is being set
		} else {
			// get matrix
			matrix = $.cssHooks["transform"].get( elem, true, true );
			// save origin
			$._data( elem, _transformOrigin, origin );
		}

		// There's nothing to do if matrix is affine
		if ( matrix == "0,1,1,0,0,0" ) {
			return;
		}

		origin = keywordsToPerc( origin );

		// calculate and return the correct size
		// find the real size of the original object
		// (IE reports the size of the transformed object)
		// the ratio is basically the transformed size of 1x1 object
		ratio = transformOffset( matrix, 1, 1 );
		width = +$.css( elem, "width", "border" ) / ratio.width;
		height = +$.css( elem, "height", "border" ) / ratio.height;

		// turn the origin into unitless pixels
		while ( i-- ) {
			matches = origin[i].match( runits );
			if ( matches[3] !== "px" ) {
				origin[i] = matches[3] === "%" ? percentageToPx(origin[i], elem, i, ratio, width, height) : toPx(origin[i], elem);
			} else {
				origin[i] = _parseFloat(origin[i]);
			}
		}

		// find the origin offset
		toCenter = transformVector(matrix, origin[0], origin[1]);
		fromCenter = transformVector(matrix, 0, 0);
		offset = {
			top: fromCenter[1] - (toCenter[1] - origin[1]),
			left: fromCenter[0] - (toCenter[0] - origin[0])
		};
		sides = transformSides(matrix, width, height);

		// apply the css
		cssPosition = $.css( elem, "position" );
		usePosition = cssPosition === "relative" || cssPosition === "static" || $.transform.centerOrigin === "position";
		propTop = usePosition ? "top" : "marginTop";
		propLeft = usePosition ? "left" : "marginLeft";
		top = offset.top + matrix[5] + sides.top;
		left = offset.left + matrix[4] + sides.left;
		cssTop = cssLeft = 0;
		elemStyle = elem.style;
		currStyle = elem.currentStyle;

		if ( cssPosition === "static" ) {
			$.css( elem, "position", cssPosition );

		} else {
			// try to respect an existing top/left if it's in the CSS
			// blank out the inline styles, we're going to overwrite them anyway
			elemStyle[propTop] = elemStyle[propLeft] = null;

			// look up the CSS styles
			currentTop = currStyle[propTop];
			currentLeft = currStyle[propLeft];

			// if they're not "auto" then use those
			// TODO: handle non-pixel units and percentages
			currentTop !== "auto" && ( cssTop = parseInt(currentTop, 10) );
			currentLeft !== "auto" && ( cssLeft = parseInt(currentLeft, 10) );
		}

		$.css( elem, propTop, top + cssTop );
		$.css( elem, propLeft, left + cssLeft );
	}
}

// convert a value for the origin animation, accounting for +=/-=
function convertOriginValue(value, elem, useHeight, useRatio) {
	var matches = value.match(runits);

	value = matches[2] + matches[3];

	if (matches[3] !== "px") {
		value = matches[3] === "%" ? percentageToPx(value, elem, useHeight, useRatio) : toPx(value, elem);
	} else {
		value = _parseFloat(value);
	}

	return value;
}

/*
* Utility functions
*/

// keywords
function keywordsToPerc (value) {
	var _top = "top",
		_right = "right",
		_bottom = "bottom",
		_center = "center",
		_left = "left",
		_space = " ",
		_0 = "0",
		_50 = "50%",
		_100 = "100%",
		split,
		i = 2;

	switch (value) {
		case _top + _space + _left: // no break
		case _left + _space + _top:
			value = _0 + _space + _0;
			break;
		case _top: // no break
		case _top + _space + _center: // no break
		case _center + _space + _top:
			value = _50 + _space + _0;
			break;
		case _right + _space + _top: // no break
		case _top + _space + _right:
			value = _100 + _space + _0;
			break;
		case _left: // no break
		case _left + _space + _center: // no break
		case _center + _space + _left:
			value = _0 + _space + _50;
			break;
		case _right: // no break
		case _right + _space + _center: // no break
		case _center + _space + _right:
			value = _100 + _space + _50;
			break;
		case _bottom + _space + _left: // no break
		case _left + _space + _bottom:
			value = _0 + _space + _100;
			break;
		case _bottom: // no break
		case _bottom + _space + _center: // no break
		case _center + _space + _bottom:
			value = _50 + _space + _100;
			break;
		case _bottom + _space + _right: // no break
		case _right + _space + _bottom:
			value = _100 + _space + _100;
			break;
		case _center: // no break
		case _center + _space + _center:
			value = _50 + _space + _50;
			break;
		default:
			// handle mixed keywords and other units
			// TODO: this isn't 100% to spec. mixed units and keywords require the keyword in the correct position
			split = value.split( _space );
			if ( split[1] === undefined ) {
				split[1] = split[0];
			}
			while( i-- ) {
				switch(split[i]) {
					case _left: // no break
					case _top:
						split[i] = _0;
						break;
					case _right: // no break
					case _bottom:
						split[i] = _100;
						break;
					case _center:
						split[i] = _50;
				}
			}
			value = split.join(_space);
	}
	return value;
}

// convert a vector
function transformVector( a, x, y ) {
	return [
		a[0] * x + a[2] * y,
		a[1] * x + a[3] * y
	];
}

// calculate the corner vectors
function transformCorners( a, x, y ) {
	return [
		/* tl */ transformVector( a, 0, 0 ),
		/* bl */ transformVector( a, 0, y ),
		/* tr */ transformVector( a, x, 0 ),
		/* br */ transformVector( a, x, y )
	];
}

// measure the length of the sides
// TODO: arrays are faster than objects (and compress better)
function transformSides( a, x, y ) {
	// The corners of the box
	var c = transformCorners( a, x, y );

	return {
		top: Math.min( c[0][1], c[2][1], c[3][1], c[1][1] ),
		bottom: Math.max( c[0][1], c[2][1], c[3][1], c[1][1] ),
		left: Math.min( c[0][0], c[2][0], c[3][0], c[1][0] ),
		right: Math.max( c[0][0], c[2][0], c[3][0], c[1][0] )
	};
}

// measure the offset height and width
// TODO: arrays are faster than objects (and compress better)
function transformOffset( a, x, y ) {
	// The sides of the box
	var s = transformSides( a, x, y );

	// return offset
	return {
		height: Math.abs( s.bottom - s.top ),
		width: Math.abs( s.right - s.left )
	};
}

function append( arr1, arr2, value ) {
	while ( value = arr2.shift() ) {
		arr1.push( value );
	}
}

// converts an angle string in any unit to a radian Float
function toRadian(value) {
	var val = _parseFloat(value), PI = Math.PI;
	
	// TODO: why use the tilde here? seems useless, it"s not like you'd ever want to see deg as the first character
	return ~value.indexOf("deg") ?
		val * (PI / 180):
		~value.indexOf("grad") ?
		val * (PI / 200):
		~value.indexOf("turn") ?
		val * (PI / 0.5):
		val;
}

function toPx(value, elem, prop) {
	prop = prop || "left";

	var style = elem.style[prop],
		inStyle = style !== undefined && style !== null,
		curr = $.css(elem, prop), // read the current value
		val;

	// set the style on the target element
	$.style( elem, prop, value);
	val = $.css(elem, prop);

	// reset the style back to what it was
	inStyle ? $.style( this, prop, curr) : elem.style[prop] = null;
	return _parseFloat(val);
}

function percentageToPx(value, elem, useHeight, useRatio, width, height) {
	var ratio = 1,
		$elem = $(elem),
		outer = (useHeight ? height : width) || $elem["outer" + (useHeight ? "Height" : "Width")]();

	// IE doesn"t report the height and width properly
	if ( supportMatrixFilter ) {
		ratio = useRatio[(useHeight ? "height" : "width")];
	}

	// TODO: Chrome appears to use innerHeight/Width
	value = outer * _parseFloat(value) / 100 / ratio;
	return value;
}

})(jQuery,window);