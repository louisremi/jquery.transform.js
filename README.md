Usage:
======

Set transform with a string
---------------------------

  $('#myDiv').css('transform', 'rotate(25deg) scale(2,.5) skew(-35deg)');
  $('#myDiv').animate({transform: 'rotate(25deg) scale(2,.5) skew(-35deg)'});

**Remember, transforms are additive!**

  $('#myDiv').css('transform', 'rotate(25deg) scale(2)');
  $('#myDiv').css('transform', 'rotate(65deg) scale(3)');

The previous two lines result in #myDiv being 90deg and 6 times bigger.

Set transform with an object
----------------------------

  $('#myDiv').css('transform', {
    // has to be in radian
    rotate: Math.PI/2,
    // has to be an array of X and Y scales
    scale: [2, .5],
    // has to be an array of X and Y skews in radian
    skew: [-Math.PI/4, Math.PI/3]
  });

**performance tip**: jquery.transform.js deals faster with objects. 
Strings always need to be parsed because we need to keep track of successive transforms for animate().

Get transform
-------------

Always returns an object

  $('#myDiv').css('transform') == {
    rotate: 1.5707963267948966,
    scale: [2,.5],
    skew: [-0.7853981633974483, 1.0471975511965976]
  };

Utilities
---------

degToRad and radToDeg methods available free of charge!

  $.transform.degToRad(180) == Math.PI;
  $.transform.radToDeg(Math.PI) == 180;

**Performance tip**: try to work with radian directly!

Limitations:
============

- requires jQuery 1.4.3+
- currently, only rotate, scale(X/Y) and skew(X/Y) are available 
- transformOrigin is not accessible
- IE will often disappoint you (and there's nothing I can do about it)

and **transforms are additive**, I already told it.

Why no 'translate'?
-------------------

Because translate is unavailable in IE<9. 
Emulating it requires to transparently wrap the target element in another element.
Transparently messing with the DOM often introduces unpredictible behavior.
Unpredictible behavior leads developpers to fear plugins.
*Fear leads to anger. Anger leads to hate. Hate leads to suffering.*

If you want to translate your elements in a cross-browser way with minimal unpredictible behavior, wrap your elements yourself and use absolute positioning.

Why no 'matrix'?
----------------

Because I don't need it, and I don't think I ever will, and I think you probably don't need it either. 
Pull requests are welcome, should you really need it.

This additive behavior is annoying!
-----------------------------------

Then give a try at [jquery.rotate.js](https://github.com/lrbabe/jquery.rotate.js) and [jquery.scale.js](https://github.com/lrbabe/jquery.scale.js)

License
=======

Dual licensed under GPL and MIT licenses.