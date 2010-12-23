/*
 * transform: A jQuery cssHooks adding a cross browser transform property to $.fn.css() and $.fn.animate()
 * 
 * limitations:
 * - requires jQuery 1.4.3+
 * - currently, only rotate, scale(X/Y) and skew(X/Y) are available 
 * - translate will never work in Internet Explorer versions prior to IE9
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
      transform = overwrite? value : addTransform(value, $.data(elem, 'transform') || {
          rotate: 0,
          scale: [1,1],
          skew: [0,0]
        }),
      rotate = transform.rotate,
      scale = transform.scale,
      skew = transform.skew;
    
    // save new transform
    $.data(elem, 'transform', transform);

    if (supportTransform) {
      elem.style[supportTransform] = 'rotate('+rotate+'rad) scale('+scale+') skew('+skew[0]+'rad,'+skew[1]+'rad)';

    } else if (_support.matrixFilter) {
      cos = Math.cos(rotate);
      sin = Math.sin(rotate);
      tanX = Math.tan(skew[0]);
      tanY = Math.tan(skew[1]);
      elem.style.filter = [
        "progid:DXImageTransform.Microsoft.Matrix(",
          "M11="+cos+",",
          "M12="+(-sin)+",",
          "M21="+sin+",",
          "M22="+cos+",",
          "SizingMethod='auto expand'",
        ")"
      ].join('');
      
      // From pbakaus's Transformie http://github.com/pbakaus/transformie
      if(centerOrigin = $.transform.centerOrigin) {
        elem.style[centerOrigin == 'margin' ? 'marginLeft' : 'left'] = -(elem.offsetWidth/2) + (elem.clientWidth/2) + "px";
        elem.style[centerOrigin == 'margin' ? 'marginTop' : 'top'] = -(elem.offsetHeight/2) + (elem.clientHeight/2) + "px";
      }

    }
  },
  get: function( elem, value ) {
    return $.data(elem, 'transform') || {
      rotate: 0,
      scale: [1,1],
      skew: [0,0]
    };
  }
};
$.fx.step.transform = function( fx ) {
  // fx.end and fx.start are not correctly initialised by jQuery, fix them once for all
  if ( typeof fx.end === 'string' ) {
    fx.end = addTransform(fx.end, {
      rotate: 0,
      scale: [1,1],
      skew: [0,0]
    });
    fx.start = $.cssHooks.transform.get(fx.elem, 'transform');
  }
  
  var pos = fx.pos,
    end = fx.end,
    start = fx.start;
  
  $.cssHooks.transform.set( fx.elem, {
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
  // We need to parse the transform string first
  if (typeof transform === 'string') {
  
    // split the != transforms
    transform = transform.split(') ');
  
    var i = transform.length,
      rotate = origin.rotate,
      scale = origin.scale,
      skew = origin.skew,
      trim = $.trim,
      split, name, value;
  
    // add them to the origin
    while ( i-- ) {
      split = transform[i].split('(');
      name = trim(split[0]);
      value = split[1];
      
      if (name == 'rotate') {
        rotate += toRadian(value);
  
      } else if (name == 'scaleX') {
        scale[0] *= parseFloat(value);
  
      } else if (name == 'scaleY') {
        scale[1] *= parseFloat(value);
  
      } else if (name == 'scale') {
        value = value.split(',');
        scale[0] *= parseFloat(value[0]);
        scale[1] *= parseFloat(value.length>1? value[1] : value[0]);
  
      } else if (name == 'skewX') {
        skew[0] += toRadian(value);
  
      } else if (name == 'skewY') {
        skew[1] += toRadian(value);
  
      } else if (name == 'skew') {
        value = value.split(',');
        skew[0] += toRadian(value[0]);
        skew[1] += toRadian(value.length>1? value[1] : value[0]);
  
      }
    }
    return {
      rotate: rotate,
      scale: scale,
      skew: skew
    };
  
  // transforms are ready for addition
  } else {
    return {
      rotate: origin.rotate + transform.rotate,
      scale: [
          origin.scale[0] + transform.scale[0],
          origin.scale[1] + transform.scale[1]
        ],
      skew: [
          origin.skew[0] + transform.skew[0],
          origin.skew[1] + transform.skew[1]
        ]
    }
  }
}

function radToDeg( rad ) {
  return rad * 180 / Math.PI;
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
  radToDeg: radToDeg
};

})(jQuery);