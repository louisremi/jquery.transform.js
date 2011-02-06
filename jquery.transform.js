/*
 * Quick rewrite of jquery.transform.js to make it compatible with jquery.transition.js
 */
(function($) {

var
		div = document.createElement('div')
	, divStyle = div.style
	, support = $.support
	, pxInMatrix
	;

support.transform = 
	divStyle.MozTransform === '' ? 'MozTransform':
	divStyle.msTransform === '' ? 'msTransform':
	divStyle.WebkitTransform === '' ? 'WebkitTransform':
	divStyle.OTransform === '' ? 'OTransform':
	divStyle.transform === '' ? 'transform':
	false;
support.matrixFilter = !support.transform && divStyle.filter === '';
// Firefox requires and adds px unit to translate components of 'matrix(...)'
pxInMatrix = divStyle.MozTransform === '';
// prevent IE memory leak
div = null;

$.cssNumber.transform = true;

if ( support.transform != 'transform' ) {
	$.cssHooks.transform = {
		set: function( elem, value ) {
			var
					_support = support
				, supportTransform = _support.transform
				;

			if (supportTransform) {
				// add px to translate components of 'matrix(...)' if necessary
				elem.style[supportTransform] = pxInMatrix && /matrix[^)p]*\)/.test(value) ?
					value.replace(/matrix((?:[^,]*,){4})([^,]*),([^)]*)/, 'matrix$1$2px,$3px'):
					value;

			// IE678 matrix filter version
			} else if (_support.matrixFilter) {
				value = matrix(value);
				elem.style.filter = [
					"progid:DXImageTransform.Microsoft.Matrix(",
						"M11="+value[0]+",",
						"M12="+value[2]+",",
						"M21="+value[1]+",",
						"M22="+value[3]+",",
						"SizingMethod='auto expand'",
					")"
				].join('');
				// From pbakaus's Transformie http://github.com/pbakaus/transformie
				if (centerOrigin = $.transform.centerOrigin) {
					elem.style[centerOrigin == 'margin' ? 'marginLeft' : 'left'] = -(elem.offsetWidth/2) + (elem.clientWidth/2) + 'px';
					elem.style[centerOrigin == 'margin' ? 'marginTop' : 'top'] = -(elem.offsetHeight/2) + (elem.clientHeight/2) + 'px';
				}
				// We assume that the elements are absolute positionned inside a relative positionned wrapper
				elem.style.left = value[4] + 'px';
				elem.style.top = value[5] + 'px';
			}
		},
		get: function( elem, computed ) {
			var
					_support = support
				, supportTransform = _support.transform
				;

			if (supportTransform) {
				return (computed ? getComputedStyle(elem) : elem.style)[supportTransform].split('px').join();
			
			} else if (_support.matrixFilter) {
				var
						elemStyle = computed && elem.currentStyle ? elem.currentStyle : elem.style
					, matrix
					;
				if ( elemStyle && /Matrix=([^)]*)/.test(elemStyle) ) {
					matrix = RegExp.$1.split(',');
					matrix = [
						matrix[0].split('=')[1],
						matrix[2].split('=')[1],
						matrix[1].split('=')[1],
						matrix[3].split('=')[1]
					];
				} else {
					matrix = [0,0,0,0];
				}
				matrix[4] = elemStyle ? elemStyle.left : 0;
				matrix[5] = elemStyle ? elemStyle.top : 0;
				return "matrix(" + matrix + ")";
			}
		},
		affectedProperty: support.transition
	}
}

$.fx.step.transform = function( fx ) {
	var
			elem = fx.elem
		, start = fx.start
		, end = fx.end
		, pos = fx.pos
		, transform = ''
		, prop
		;

	// fx.end and fx.start need to be converted to their translate/rotate/scale/skew components
	// so that we can interpolate them
	if ( !start || typeof start === "string" ) {
		// $.fx.prototype.cur is still broken in 1.5, see #7912
		if (!start) {
			start = $.cssHooks.transform.get(elem, true);
		}
		// start is either 'none' or a matrix(...) that has to be parsed
		fx.start = start = start == 'none'?
			{
				translate: [0,0],
				rotate: 0,
				scale: [1,1],
				skew: [0,0]
			}:
			unmatrix( toArray(start) );

		// fx.end has to be parsed and decompose as long as we have no animation hook 
		fx.end = end = unmatrix(matrix(end));

		// get rid of properties that do not change
		for ( prop in start) {
			if ( prop == 'rotate' ?
				start[prop] == end[prop]:
				start[prop][0] == end[prop][0] && start[prop][1] == end[prop][1]
			) {
				delete start[prop];
			}
		}
	}

	/*
	 * We want a fast interpolation algorithm.
	 * This implies avoiding function calls and sacrifying DRY principle:
	 * - avoid $.each(function(){})
	 * - round values using bitewise hacks, see http://jsperf.com/math-round-vs-hack/3
	 */
	if ( start.translate ) {
		// round translate to the closest pixel
		transform += 'translate('+
			((start.translate[0] + (end.translate[0] - start.translate[0]) * pos + .5) | 0) +'px,'+
			((start.translate[1] + (end.translate[1] - start.translate[1]) * pos + .5) | 0) +'px'+
		')';
	}
	if ( start.rotate != undefined ) {
		transform += ' rotate('+ (start.rotate + (end.rotate - start.rotate) * pos) +'rad)';
	}
	if ( start.scale ) {
		transform += ' scale('+
			(start.scale[0] + (end.scale[0] - start.scale[0]) * pos) +','+
			(start.scale[1] + (end.scale[1] - start.scale[1]) * pos) +
		')';
	}
	if ( start.skew ) {
		transform += ' skew('+
			(start.skew[0] + (end.skew[0] - start.skew[0]) * pos) +'rad,'+
			(start.skew[1] + (end.skew[1] - start.skew[1]) * pos) +'rad'+
		')';
	}
	$.cssHooks.transform.set( elem, transform );
};

// turns a transform string into its 'matrix(A,B,C,D,X,Y)' form (as an array, though)
function matrix( transform ) {
	transform = transform.split(')');
	var
			trim = $.trim
		// last element of the array is an empty string, get rid of it
		, i = transform.length -1
		, split, prop, val
		, A = 1
		, B = 0
		, C = 0
		, D = 1
		, A_, B_, C_, D_
		, tmp1, tmp2
		, X = 0
		, Y = 0
		;
	// Loop through the transform properties, parse and multiply them
	while (i--) {
		split = transform[i].split('(');
		prop = trim(split[0]);
		val = split[1];
		A_ = B_ = C_ = D_ = 0;
		// switch is not a good idea in js, perf. wise
		if ( prop == 'translateX' ) {
			X += parseInt(val, 10);
			continue;

		} else if ( prop == 'translateY' ) {
			Y += parseInt(val, 10);
			continue;

		} else if ( prop == 'translate' ) {
			val = val.split(',');
			X += parseInt(val[0], 10);
			Y += parseInt(val[1] || 0, 10);
			continue;

		} else if ( prop == 'rotate' ) {
			val = toRadian(val);
			A_ = Math.cos(val);
			B_ = Math.sin(val);
			C_ = -Math.sin(val);
			D_ = Math.cos(val);

		} else if ( prop == 'scaleX' ) {
			A_ = val;
			D_ = 1;

		} else if ( prop == 'scaleY' ) {
			A_ = 1;
			D_ = val;

		} else if ( prop == 'scale' ) {
			val = val.split(',');
			A_ = val[0];
			D_ = val.length>1 ? val[1] : val[0];

		} else if ( prop == 'skewX' ) {
			A_ = D_ = 1;
			C_ = Math.tan(toRadian(val));

		} else if ( prop == 'skewY' ) {
			A_ = D_ = 1;
			B_ = Math.tan(toRadian(val));

		} else if ( prop == 'skew' ) {
			A_ = D_ = 1;
			val = val.split(',');
			C_ = Math.tan(toRadian(val[0]));
			B_ = Math.tan(toRadian(val[1] || 0));

		} else if ( prop == 'matrix' ) {
			val = val.split(',');
			A_ = +val[0];
			B_ = +val[1];
			C_ = +val[2];
			D_ = +val[3];
			X += parseInt(val[4], 10);
			Y += parseInt(val[5], 10);
		}
		// Matrix product
		tmp1 = A * A_ + B * C_;
		B    = A * B_ + B * D_;
		tmp2 = C * A_ + D * C_;
		D    = C * B_ + D * D_;
		A = tmp1;
		C = tmp2;
	}
	return [A,B,C,D,X,Y];
}

// turns a matrix into its rotate, scale and skew components
// algorithm from http://hg.mozilla.org/mozilla-central/file/7cb3e9795d04/layout/style/nsStyleAnimation.cpp
function unmatrix(matrix) {
	var
			scaleX
		, scaleY
		, skew
		, A = matrix[0]
		, B = matrix[1]
		, C = matrix[2]
		, D = matrix[3]
		// round scale, rotate and skew to 6 decimal
		, precision = 1E6
		;

	// Make sure matrix is not singular
	if ( A * D - B * C ) {
		// step (3)
		scaleX = Math.sqrt( A * A + B * B );
		A /= scaleX;
		B /= scaleX;
		// step (4)
		skew = A * C + B * D;
		C -= A * skew;
		D -= B * skew;
		// step (5)
		scaleY = Math.sqrt( C * C + D * D );
		C /= scaleY;
		D /= scaleY;
		skew /= scaleY;
		// step (6)
		if ( A * D < B * C ) {
			//scaleY = -scaleY;
			//skew = -skew;
			A = -A;
			B = -B;
			skew = -skew;
			scaleX = -scaleX;
		}

	// matrix is singular and cannot be interpolated
	} else {
		rotate = scaleX = scaleY = skew = 0;
	}

	return {
		translate: [+matrix[4], +matrix[5]],
		rotate: Math.atan2(B, A),
		scale: [scaleX, scaleY],
		skew: [skew, 0]
	}
}

// converts an angle string in any unit to a radian Float
function toRadian(value) {
	return ~value.indexOf('deg') ?
		parseInt(value,10) * (Math.PI * 2 / 360):
		~value.indexOf('grad') ?
			parseInt(value,10) * (Math.PI/200):
			parseFloat(value);
}
// Converts 'matrix(A,B,C,D,X,Y)' to [A,B,C,D,X,Y]
function toArray(matrix) {
	// Fremove the unit of X and Y for Firefox
	matrix = /\(([^,]*),([^,]*),([^,]*),([^,]*),([^,p]*)(?:px)?,([^)p]*)(?:px)?/.exec(matrix);
	return [matrix[1], matrix[2], matrix[3], matrix[4], matrix[5], matrix[6]];
}


$.transform = {
	centerOrigin: 'margin',
	matrix: matrix
};

})(jQuery);