/*
 * transform: A light jQuery cssHooks for 2d transform
 *
 * limitations:
 * - requires jQuery 1.4.3+
 * - Should you use the *translate* property, then your elements need to be absolutely positionned in a relatively positionned wrapper **or it will fail in IE678**.
 * - incompatible with 'matrix(...)' transforms
 * - transformOrigin is not accessible
 *
 * latest version and complete README available on Github:
 * https://github.com/louisremi/jquery.transform.js
 *
 * Copyright 2011 @louis_remi
 * Licensed under the MIT license.
 *
 * This saved you an hour of work?
 * Send me music http://www.amazon.co.uk/wishlist/HNTU0468LQON
 *
 */
(function( $ ) {

/*
 * Feature tests and global variables
 */
var div = document.createElement('div'),
	divStyle = div.style,
	propertyName = 'transform',
	suffix = 'Transform',
	testProperties = [
		'O' + suffix,
		'ms' + suffix,
		'Webkit' + suffix,
		'Moz' + suffix,
		// prefix-less property
		propertyName
	],
	i = testProperties.length,
	supportProperty,
	supportMatrixFilter,
	propertyHook,
	rMatrix = /Matrix([^)]*)/;

// test different vendor prefixes of this property
while ( i-- ) {
	if ( testProperties[i] in divStyle ) {
		$.support[propertyName] = supportProperty = testProperties[i];
		continue;
	}
}
// IE678 alternative
if ( !supportProperty ) {
	$.support.matrixFilter = supportMatrixFilter = divStyle.filter === '';
}
// prevent IE memory leak
div = divStyle = null;

// px isn't the default unit of this property
$.cssNumber[propertyName] = true;

/*
 * fn.css() hooks
 */
$.cssHooks[propertyName] = propertyHook = {
	// One fake getter to rule them all 
	get: function( elem ) {
		var transform = $.data( elem, 'transform' ) || {
      translate: [0,0],
      rotate: 0,
      scale: [1,1],
      skew: [0,0]
    };
    transform.toString = function() {
    	return 'translate('+this.translate[0]+'px,'+this.translate[1]+'px) rotate('+this.rotate+'rad) scale('+this.scale+') skew('+this.skew[0]+'rad,'+this.skew[1]+'rad)';
    }
    return transform;
	},
	set: function( elem, value, animate ) {
		if ( typeof value === 'string' ) {
			value = components(value);
		}
		
		var translate = value.translate,
			rotate = value.rotate,
			scale = value.scale,
			skew = value.skew,
			elemStyle = elem.style,
			currentStyle,
			filter;

		$.data( elem, 'transform', value );

		// We can improve performance by avoiding unnecessary transforms
		// skew is the less likely to be used
		if (!skew[0] && !skew[1]) {
			skew = 0;
		}

    if ( supportProperty ) {
			elemStyle[supportProperty] = 'translate('+translate[0]+'px,'+translate[1]+'px) rotate('+rotate+'rad) scale('+scale+')'+(skew?' skew('+skew[0]+'rad,'+skew[1]+'rad)' : '');

		} else if ( supportMatrixFilter ) {

			if ( !animate ) {
				elemStyle.zoom = 1;
			}

			var cos = Math.cos(rotate),
				sin = Math.sin(rotate),
				M11 = cos*scale[0],
				M12 = -sin*scale[1],
				M21 = sin*scale[0],
				M22 = cos*scale[1],
				tanX,
				tanY,
				Matrix;
				  
			if ( skew ) {
				tanX = Math.tan(skew[0]);
				tanY = Math.tan(skew[1]);
				M11 += M12*tanY;
				M12 += M11*tanX;
				M21 += M22*tanY;
				M22 += M21*tanX;
			}

			Matrix = [
				"Matrix("+
					"M11="+M11,
					"M12="+M12,
					"M21="+M21,
					"M22="+M22,
					"SizingMethod='auto expand'"
			].join();
			filter = ( currentStyle = elem.currentStyle ) && currentStyle.filter || elemStyle.filter || "";

			elemStyle.filter = rMatrix.test(filter) ?
				filter.replace(rMatrix, Matrix) :
				filter + " progid:DXImageTransform.Microsoft." + Matrix + ")";

			// center the transform origin, from pbakaus's Transformie http://github.com/pbakaus/transformie
			if ( (centerOrigin = $.transform.centerOrigin) ) {
				elemStyle[centerOrigin == 'margin' ? 'marginLeft' : 'left'] = -(elem.offsetWidth/2) + (elem.clientWidth/2) + 'px';
				elemStyle[centerOrigin == 'margin' ? 'marginTop' : 'top'] = -(elem.offsetHeight/2) + (elem.clientHeight/2) + 'px';
			}

			// We assume that the elements are absolute positionned inside a relative positionned wrapper
			elemStyle.left = translate[0] + 'px';
			elemStyle.top = translate[1] + 'px';
		}
	}
};

/*
 * fn.animate() hooks
 */
$.fx.step.transform = function( fx ) {
	var elem = fx.elem,
		start = fx.start,
		end = fx.end,
		pos = fx.pos,
		transform = {},
		coef;

	// fx.end and fx.start need to be converted to their translate/rotate/scale/skew components
	// so that we can interpolate them
	if ( !start || typeof end === "string" ) {
		// the following block can be commented out with jQuery 1.5.1+, see #7912
		if (!start) {
			start = propertyHook.get( elem );
		}

		// force layout only once per animation
		if ( supportMatrixFilter ) {
			elem.style.zoom = 1;
		}

		// end has to be parsed
		fx.end = end = components(end);
	}

	/*
	 * We want a fast interpolation algorithm.
	 * This implies avoiding function calls and sacrifying DRY principle:
	 * - avoid $.each(function(){})
	 * - round values using bitewise hacks, see http://jsperf.com/math-round-vs-hack/3
	 */
	transform.translate = [
		(start.translate[0] + (end.translate[0] - start.translate[0]) * pos + .5) | 0,
		(start.translate[1] + (end.translate[1] - start.translate[1]) * pos + .5) | 0
	];
	transform.rotate = start.rotate + (end.rotate - start.rotate) * pos;
	transform.scale = [
		start.scale[0] + (end.scale[0] - start.scale[0]) * pos,
		start.scale[1] + (end.scale[1] - start.scale[1]) * pos
	];
	transform.skew = [
		start.skew[0] + (end.skew[0] - start.skew[0]) * pos,
		start.skew[1] + (end.skew[1] - start.skew[1]) * pos
	];

	propertyHook.set( elem, transform, true );
};

/*
 * Utility functions
 */
// parse tranform components of a transform string not containing 'matrix(...)'
function components( transform ) {
	// split the != transforms
  transform = transform.split(')');

	var translate = [0,0],
    rotate = 0,
    scale = [1,1],
    skew = [0,0],
    i = transform.length -1,
    trim = $.trim,
    split, name, value;

  // add components
  while ( i-- ) {
    split = transform[i].split('(');
    name = trim(split[0]);
    value = split[1];
    
    if (name == 'translateX') {
      translate[0] += parseInt(value, 10);

    } else if (name == 'translateY') {
      translate[1] += parseInt(value, 10);

    } else if (name == 'translate') {
      value = value.split(',');
      translate[0] += parseInt(value[0], 10);
      translate[1] += parseInt(value[1] || 0, 10);

    } else if (name == 'rotate') {
      rotate += toRadian(value);

    } else if (name == 'scaleX') {
      scale[0] *= value;

    } else if (name == 'scaleY') {
      scale[1] *= value;

    } else if (name == 'scale') {
      value = value.split(',');
      scale[0] *= value[0];
      scale[1] *= (value.length>1? value[1] : value[0]);

    } else if (name == 'skewX') {
      skew[0] += toRadian(value);

    } else if (name == 'skewY') {
      skew[1] += toRadian(value);

    } else if (name == 'skew') {
      value = value.split(',');
      skew[0] += toRadian(value[0]);
      skew[1] += toRadian(value[1] || '0');
    }
	}

  return {
    translate: translate,
    rotate: rotate,
    scale: scale,
    skew: skew
  };
}

// converts an angle string in any unit to a radian Float
function toRadian(value) {
	return ~value.indexOf('deg') ?
		parseInt(value,10) * (Math.PI * 2 / 360):
		~value.indexOf('grad') ?
			parseInt(value,10) * (Math.PI/200):
			parseFloat(value);
}

$.transform = {
	centerOrigin: 'margin',
	radToDeg: function( rad ) {
		return rad * 180 / Math.PI;
	}
};

})( jQuery );