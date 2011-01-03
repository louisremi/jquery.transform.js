/*
 * transform: A jQuery cssHooks adding a cross browser transform property to $.fn.css() and $.fn.animate()
 * 
 * limitations:
 * - requires jQuery 1.4.3+
 * - Should you use the *translate* property, then your elements need to be absolutely positionned in a relatively positionned wrapper **or it will fail in IE**.
 * - the *matrix* property is not available
 * - transformOrigin is not accessible
 * 
 * latest version and complete README available on Github:
 * https://github.com/lrbabe/jquery.transform.js
 *
 * Copyright (c) 2010 Louis-Rémi Babé twitter.com/louis_remi
 * Licensed under the MIT license.
 * 
 * This saved you an hour of work? 
 * Send me music http://www.amazon.fr/wishlist/HNTU0468LQON
 *
 */
(function($) {

var div = document.createElement('div'),
  divStyle = div.style,
  support = $.support;

support.transform = 
  divStyle.MozTransform === ''? 'MozTransform' :
  (divStyle.MsTransform === ''? 'MsTransform' :
  (divStyle.WebkitTransform === ''? 'WebkitTransform' : 
  (divStyle.OTransform === ''? 'OTransform' :
  (divStyle.transform === ''? 'transform' :
  false))));
support.matrixFilter = !support.transform && divStyle.filter === '';
div = null;

$.cssNumber.transform = true;
// additive transform
$.cssHooks.transform = {
  set: function( elem, value, overwrite ) {
    var _support = support,
      supportTransform = _support.transform,
      // add the value to the current transform
      transform = overwrite? value : addTransform(value, $.data(elem, 'transform')),
      translate = transform.translate,
      rotate = transform.rotate,
      scale = transform.scale,
      skew = transform.skew;
    
    // save new transform
    $.data(elem, 'transform', transform);
    
    // We can improve performance by avoiding unnecessary transforms
    // skew is the less likely to be used
    if (!skew[0] && !skew[1]) {
      skew = 0;
    }
    
    if (supportTransform) {
      elem.style[supportTransform] = 'translate('+translate[0]+'px,'+translate[1]+'px) rotate('+rotate+'rad) scale('+scale+')'+(skew?' skew('+skew[0]+'rad,'+skew[1]+'rad)' : '');

    } else if (_support.matrixFilter) {
      var
        cos = Math.cos(rotate),
        sin = Math.sin(rotate),
        tmp11 = cos*scale[0],
        tmp12 = -sin*scale[1],
        tmp21 = sin*scale[0],
        tmp22 = cos*scale[1],
        tanX,
        tanY;
        
      if (skew) {
        tanX = Math.tan(skew[0]);
        tanY = Math.tan(skew[1]);
        tmp11 += tmp12*tanY;
        tmp12 += tmp11*tanX;
        tmp21 += tmp22*tanY;
        tmp22 += tmp21*tanX;
      }
        
      elem.style.filter = [
        "progid:DXImageTransform.Microsoft.Matrix(",
          "M11="+tmp11+",",
          "M12="+tmp12+",",
          "M21="+tmp21+",",
          "M22="+tmp22+",",
          "SizingMethod='auto expand'",
        ")"
      ].join('');
      
      // From pbakaus's Transformie http://github.com/pbakaus/transformie
      if (centerOrigin = $.transform.centerOrigin) {
        elem.style[centerOrigin == 'margin' ? 'marginLeft' : 'left'] = -(elem.offsetWidth/2) + (elem.clientWidth/2) + "px";
        elem.style[centerOrigin == 'margin' ? 'marginTop' : 'top'] = -(elem.offsetHeight/2) + (elem.clientHeight/2) + "px";
      }
      
      // We assume that the elements are absolute positionned inside a relative positionned wrapper
      if (translate != [0, 0]) {
        elem.style.left = translate[0];
        elem.style.top = translate[1];
      }

    }
  },
  get: function( elem, value ) {
    return $.data(elem, 'transform') || {
      translate: [0,0],
      rotate: 0,
      scale: [1,1],
      skew: [0,0]
    };
  }
};
$.fx.step.transform = function( fx ) {
  // fx.end and fx.start are not correctly initialised by jQuery, fix them once for all
  if ( !fx.start ) {
    fx.end = addTransform(fx.end);
    fx.start = $.cssHooks.transform.get(fx.elem, 'transform');
  }
  
  var pos = fx.pos,
    end = fx.end,
    start = fx.start;
  
  $.cssHooks.transform.set( fx.elem, {
    translate: [
        start.translate[0] + pos * end.translate[0], 
        start.translate[1] + pos * end.translate[1]
      ],
    rotate: start.rotate + pos * end.rotate,
    scale: [
        // thanks http://louiseCunin.com for the maths
        start.scale[0] + start.scale[0] * (end.scale[0] -1) * pos,
        start.scale[1] + start.scale[1] * (end.scale[1] -1) * pos
      ],
    skew: [
        start.skew[0] + pos * end.skew[0],
        start.skew[1] + pos * end.skew[1]
      ]
  }, true);  
};

function addTransform(transform, origin) {
  origin = origin || {
    translate: [0,0],
    rotate: 0,
    scale: [1,1],
    skew: [0,0]
  };
  var
    translate = origin.translate,
    rotate = origin.rotate,
    scale = origin.scale,
    skew = origin.skew,
    i, trim, split, name, value;
  // We need to parse the transform string first
  if (typeof transform === 'string') {
  
    // split the != transforms
    transform = transform.split(') ');
  
    i = transform.length;
    trim = $.trim;
  
    // add them to the origin
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
        skew[1] += toRadian(value[1] || 0);
  
      }
    }
  
  // transform is an object
  } else {
    if (transform.translate) {
      translate[0] += transform.translate[0];
      translate[1] += transform.translate[1];
    }
    rotate += (transform.rotate || 0);
    if (transform.scale) {
      scale[0] *= transform.scale[0];
      scale[1] *= transform.scale[1];
    }
    if (transform.skew) {
      skew[0] += transform.skew[0];
      skew[1] += transform.skew[1];
    }
  }
  
  return {
    translate: translate,
    rotate: rotate,
    scale: scale,
    skew: skew
  };
}

function toRadian(value) {
  if( ~value.indexOf("deg") ) {
    return parseInt(value,10) * (Math.PI * 2 / 360);
  } else if ( ~value.indexOf("grad") ) {
    return parseInt(value,10) * (Math.PI/200);
  }
  return parseFloat(value);
}

$.transform = {
  centerOrigin: 'margin',
  radToDeg: function( rad ) {
      return rad * 180 / Math.PI;
    },
  degToRad: function( deg ) {
      return deg * Math.PI / 180 ;
    }
};

})(jQuery);