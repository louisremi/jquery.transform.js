Usage:
======

Set transform with a string
---------------------------

    $('#myDiv').css('transform', 'translate(50px, 30px) rotate(25deg) scale(2,.5) skew(-35deg)');
    $('#myDiv').animate({transform: 'translateY(-100px) rotate(1rad) scaleX(2) skewY(42deg)'});

**Remember, transforms are additive!**

    $('#myDiv').css('transform', 'rotate(25deg) scale(2)');
    $('#myDiv').css('transform', 'rotate(65deg) scale(3)');

The previous two lines result in #myDiv being 25+65=90deg and 2x3=6 times bigger.

Set transform with an object
----------------------------

Alternatively, you can use a transform object with both *$.fn.css* and *$.fn.animate*.  
You can ommit any property, but properties need to comply to these rules:

    $('#myDiv').css('transform', {
      // has to be an array of X and Y translates in px
      translate: [100, 0],
      // has to be in radian
      rotate: Math.PI/2,
      // has to be an array of X and Y scales
      scale: [2, .5],
      // has to be an array of X and Y skews in radian
      skew: [0, Math.PI/3]
    });

**performance tip**: jquery.transform.js deals faster with objects. 
Strings need to be parsed in all browsers because we keep track of successive transforms for animate().

Get transform
-------------

Always returns an object

    $('#myDiv').css('transform') == {
      translate: [100, 0]
      rotate: 1.5707963267948966,
      scale: [2,.5],
      skew: [0, 1.0471975511965976]
    };

Utilities
---------

degToRad and radToDeg methods available free of charge!

    $.transform.degToRad(180) == Math.PI;
    $.transform.radToDeg(Math.PI) == 180;

**Performance tip**: try to work with radian directly!

    // Dear maintainer, the following is equivalent to 45deg clockwise rotation of #myDiv, hope you get the rest.
    $('#myDiv').css('transform', {rotate: Math.PI/2});

Limitations:
============

- requires jQuery 1.4.3+
- Should you use the *translate* property, then your elements need to be absolutely positionned in a relatively positionned wrapper **or it will fail in IE**.
- the *matrix* property is not available
- transformOrigin is not accessible
- IE will often disappoint you (and there's nothing I can do about it)

and **transforms are additive**, I already told it.

Why such restrictions with 'translate'?
---------------------------------------

Since translate is unavailable in IE<9, we have to emulate it using *top* and *left* properties of the element style.  
This can, of course, only work if the elements are absolutely positionned in a relatively positionned wrapper.  

Other plugins position the elements and wrap them transparently.  
I think that transparently messing with the DOM often introduces unpredictible behavior.  
Unpredictible behavior leads developpers to fear plugins.  
*Fear leads to anger. Anger leads to hate. Hate leads to suffering.*  
I prefer leaving this up to you.

Why no 'matrix'?
----------------

Because I don't need it, and I don't think I ever will.  
This plugin is Free Software for you to fork it, though.

This additive behavior is annoying!
-----------------------------------

Then give a try at [jquery.rotate.js](https://github.com/lrbabe/jquery.rotate.js) and [jquery.scale.js](https://github.com/lrbabe/jquery.scale.js)

Alternatives
------------

The focus of this plugin is on ease-of-use, lightweightness and performances rather than being full-featured.
Should you be unsatisfied with this philosophy (or the jQuery dependency), have a look at these alternatives:

- [transform](https://github.com/heygrady/transform) Grady Kuhnline's jQuery plugin accepting *matrix* transforms.
- [Transformie](https://github.com/pbakaus/transformie) Paul Bakaus's library *"that brings you CSS Transforms by mapping the native IE Filter API to CSS transitions as proposed by Webkit"*.
- [cssSandpaper](http://www.useragentman.com/blog/csssandpaper-a-css3-javascript-library/) Zoltan Du Lac's cross-browser CSS3 library.

License
=======

Dual licensed under GPL and MIT licenses.

Copyright (c) 2010 [Louis-Rémi Babé](http://twitter.com/louis_remi).