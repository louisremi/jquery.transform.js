/*
 * Quick rewrite of jquery.transform.js to make it compatible with jquery.transition.js
 */
(function($) {

var
		div = document.createElement('div')
  , divStyle = div.style
  , support = $.support
  ;

support.transform = 
  divStyle.MozTransform === '' ? 'MozTransform':
  divStyle.MsTransform === '' ? 'MsTransform':
  divStyle.WebkitTransform === '' ? 'WebkitTransform':
  divStyle.OTransform === '' ? 'OTransform':
  divStyle.transform === '' ? 'transform':
  false;
support.matrixFilter = !support.transform && divStyle.filter === '';
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
	      elem.style[supportTransform] = value;

	    } else if (_support.matrixFilter) {
	      var
	      		values = value.split(') ')
	      	, trim = $.trim
	      	, i = values.length
	      	, split, prop, val
	      	, m11 = 0
	      	, m12 = 0
	      	, m21 = 0
	      	, m22 = 0
	      	, _11, _12, _21, _22
	      	, tX = 0
	      	, tY = 0
	      	;
	      // Loop through the transform properties, parse and multiply them
	      while (i--) {
	      	split = transform[i].split('(');
		      prop = trim(split[0]);
		      val = split[1];
		      _11 = _12 = _21 = _22 = 0;
	      	// switch is not a good idea in js, perf. wise
	      	if ( prop == 'translateX' ) {
		        tX += parseInt(val, 10);
		        continue;
		  
		      } else if ( prop == 'translateY' ) {
		        tY += parseInt(val, 10);
		        continue;
		  
		      } else if ( prop == 'translate' ) {
		        val = val.split(',');
		        tX += parseInt(val[0], 10);
		        tY += parseInt(val[1] || 0, 10);
		        continue;
		  
		      } else if ( prop == 'rotate' ) {
		        val = toRadian(val);
		        _11 = Math.cos(val);
		        _12 = -Math.sin(val);
		        _21 = Math.sin(val);
		        _22 = Math.cos(val);
		  
		      } else if ( prop == 'scaleX' ) {
		        _11 = val;
		        _22 = 1;
		  
		      } else if ( prop == 'scaleY' ) {
		        _11 = 1;
		        _22 = val;
		  
		      } else if ( prop == 'scale' ) {
		        val = val.split(',');
		        _11 = val[0];
		        _22 = val.length>1 ? val[1] : val[0];
		  
		      } else if ( prop == 'skewX' ) {
		        _11 = _22 = 1;
		        _12 = Math.tan(toRadian(val));
		  
		      } else if ( prop == 'skewY' ) {
		      	_11 = _22 = 1;
		        _21 = Math.tan(toRadian(val));
		  
		      } else if ( prop == 'skew' ) {
		      	_11 = _22 = 1;
		        val = val.split(',');
		        _12 = Math.tan(toRadian(val[0]));
		        _21 = Math.tan(toRadian(val[1] || 0));
		  
		      } else if ( prop == 'matrix' ) {
		      	val = val.split(',');
		      	_11 = val[0];
		      	_12 = val[2];
		      	_21 = val[1];
		      	_22 = val[3];
		      	tX += parseInt(val[4], 10);
		        tY += parseInt(val[5], 10);
		      }
		      // Matrix product
		      m11 = m11 * _11 + m12 * _21;
		      m12 = m11 * _12 + m12 * _22;
		      m21 = m21 * _11 + m22 * _21;
		      m22 = m21 * _12 + m22 * _22;
	      }
	      // IE<9 only support 2d matrix
	      elem.style.filter = [
	        "progid:DXImageTransform.Microsoft.Matrix(",
	          "M11="+m11+",",
	          "M12="+m12+",",
	          "M21="+m21+",",
	          "M22="+m22+",",
	          "SizingMethod='auto expand'",
	        ")"
	      ].join('');
	      // From pbakaus's Transformie http://github.com/pbakaus/transformie
	      if (centerOrigin = $.transform.centerOrigin) {
	        elem.style[centerOrigin == 'margin' ? 'marginLeft' : 'left'] = -(elem.offsetWidth/2) + (elem.clientWidth/2) + 'px';
	        elem.style[centerOrigin == 'margin' ? 'marginTop' : 'top'] = -(elem.offsetHeight/2) + (elem.clientHeight/2) + 'px';
	      }
	      // We assume that the elements are absolute positionned inside a relative positionned wrapper
	      elem.style.left = tX + 'px';
	      elem.style.top = tY + 'px';
	    }
	  },
	  get: function( elem, computed ) {
	    var
	    		_support = support
	      , supportTransform = _support.transform
	      ;

	    if (supportTransform) {
	      return (computed ? getComputedStyle(elem) : elem.style)[supportTransform];

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
  		transformHook = $.cssHooks.transform
  	, elem = fx.elem
  	, start = fx.start
  	, end = fx.end
  	, unit = fx.unit
  	, now = []
  	, i
  	;
  
  // we need fx.end to be a computed value
  if ( typeof end === "string" ) {
  	transformHook.set( elem, end );
    end = transformHook.get(elem, true);
    // Firefox requires 'px' for translate :/
    unit = ~end.indexOf('px') ? 'px' : '';
    end = toArray(end);
    start = toArray(start);
  }

  i = start.length;
  while (i--) {
  	now[i] = +start[i] + (end[i] - start[i]) * fx.pos + ( i > 3 ? unit : '');
  }
  transformHook.set( elem, "matrix(" + now + ")" );
};

function toRadian(value) {
  return ~value.indexOf('deg') ?
  	parseInt(value,10) * (Math.PI * 2 / 360):
  	~value.indexOf('grad') ?
  		parseInt(value,10) * (Math.PI/200):
  		parseFloat(value);
}
function toArray(matrix) {
	return matrix
		// remove 'matrix('
		.split('(')[1]
		// remove ')'
		.split(')')[0]
		// remove unit for Firefox
		.split('px').join('')
		// and turn into an array
		.split(',');
}

$.transform = {
  centerOrigin: 'margin',
  radToDeg: function( rad ) {
    return rad * 180 / Math.PI;
  },
  degToRad: function( deg ) {
    return deg * Math.PI / 180;
  }
};

})(jQuery);