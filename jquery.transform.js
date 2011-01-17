/*
 * Quick rewrite of jquery.transform.js to make it compatible with jquery.transition.js
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
if (support.transform != 'transform')
$.cssHooks.transform = {
  set: function( elem, value ) {
    var _support = support,
      supportTransform = _support.transform;

    // TODO: parse transformation string to keep track of each transform property
    if (supportTransform) {
      elem.style[supportTransform] = value;

    } else if (_support.matrixFilter) {
      
    }
  },
  get: function( elem, value ) {
    var _support = support,
      supportTransform = _support.transform;

    if (supportTransform) {
      return window.getComputedStyle(elem)[supportTransform];

    } else if (_support.matrixFilter) {
      
    }
  },
  affectedProperty: support.transform
}