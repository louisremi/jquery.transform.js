/*
 * scale: A jQuery cssHooks adding a cross browser 'scale' property to $.fn.css() and $.fn.animate()
 * 
 * limitations:
 * - requires jQuery 1.4.3+
 * - using composit values (e.g. 1.7,0.6) requires jQuery trunk
 * - cannot be used together with jquery.rotate.js
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
$.cssHooks.transform = {
  set: function( elem, value ) {
    var _support = support,
      supportTransform = _support.transform,
      scales,
      centerOrigin;
    
    $.data( elem, 'transform', {
      // convert value to an array
      scale: scales = value.toString().split(',')
    });
    
    if (supportTransform) {
      elem.style[supportTransform] = 'scale('+ value +')';
      
    } else if (_support.matrixFilter) {
      elem.style.filter = [
        "progid:DXImageTransform.Microsoft.Matrix(",
          "M11="+scales[0]+",",
          "M12=0,",
          "M21=0,",
          "M22="+scales [1]+",",
          "SizingMethod='auto expand'",
        ")"
      ].join('');
      
      // From pbakaus's Transformie http://github.com/pbakaus/transformie
      if(centerOrigin = $.scale.centerOrigin) {
        elem.style[centerOrigin == 'margin' ? 'marginLeft' : 'left'] = -(elem.offsetWidth/2) + (elem.clientWidth/2) + "px";
        elem.style[centerOrigin == 'margin' ? 'marginTop' : 'top'] = -(elem.offsetHeight/2) + (elem.clientHeight/2) + "px";
      }
    }
  },
  get: function( elem ) {
    var transform = $.data( elem, 'transform' );
    return transform && transform.scale? transform.scale : 0;
  }
};
$.fx.step.transform = function( fx ) {
  var 
    // fx.start is not safe
    start = $.data( fx.elem, 'transform').scale,
    end = fx.end.toString().split(',');
  // In case of composit value, we need to recalculate fx.now
  if (start.length == 2 || end.length == 2) {
    if (!start[1]) {
      start[1] = start[0];
    }
    if (!end[1]) {
      end[1] = end[0];
    }
    fx.now = 
      +(+start[0] + fx.pos * (+end[0] - start[0])) + ','+
      +(+start[1] + fx.pos * (+end[1] - start[1]));
  }
  $.cssHooks.scale.set( fx.elem, fx.now );  
};

function radToDeg( rad ) {
  return rad * 180 / Math.PI;
}
function toRadian(value) {
  if(value.indexOf("deg") != -1) {
    return parseInt(value,10) * (Math.PI * 2 / 360);
  } else if (value.indexOf("grad") != -1) {
    return parseInt(value,10) * (Math.PI/200);
  }
  return parseFloat(value);
}

$.transform = {
  centerOrigin: 'margin',
  radToDeg: radToDeg
};
  
})(jQuery);