jquery.transform.js and jquery.transform.light.js are two plugins that add 2d transform capabilities to jQuery `css()` and `animate()` functions.

Usage:
======

Set transform with a string
---------------------------

    $('#myDiv').css('transform', 'translate(50px, 30px) rotate(25deg) scale(2,.5) skew(-35deg)');
    $('#myDiv').animate({transform: 'translateY(-100px) rotate(1rad) scaleX(2) skewY(42deg)'});

You can use the following list of transform components:

- `translateX(<number>px)`
- `translateY(<number>px)`
- combined: `translate(<number>px, <number>px)` *the second number is optional and defaults to 0*
- `scaleX(<number>)`
- `scaleY(<number>)`
- combined: `scale(<number>, <number>)` *the second number is optional and defaults to the value of the first one*
- `rotate(<angle>)` *units for angles are *rad* (default), *deg* or *grad*.*
- `skew(<angle>)`
- `skew(<angle>)`
- combined: `skew(<angle>, <angle>)` *the second angle is optional and defaults to 0*
- `matrix(<number>, <number>, <number>, <number>, <number>, <number>)`*

*`matrix` gives you more control about the resulting transformation, using a [matrix construction set](http://www.useragentman.com/matrix/).  
When using it in animations however, it makes it impossible to predict how the current and target transformations are going to be interpolated; there is no way to tell whether elements are going to rotate clockwise or anti-clockwise for instance.  
`matrix` cannot be used with jquery.transform.light.js

Get transform
-------------

**jquery.transform.light.js** returns an object containing the different transform components of an element. It is only aware of transformations set through jQuery.

    $('#myDiv').css('transform') == {
    	// array of X and Y in pixels
    	translate: [100, 50],
    	// rotate in radians
    	rotate: 1.5707963267948966,
    	// array of X and Y
    	scale: [2, 0.5],
    	// array of X and Y in radians
    	skew: [0,0]
    };

To convert radians back to degrees, the following helper can be used:

    $.transform.radToDeg( 1.5707963267948966 ) == 90;

**jquery.transform.js** returns a computed transform matrix.

    $('#myDiv').css('transform') == 'matrix(0,1,-1,0,100,50)';

Note that with **both plugins**, it is possible to reuse directly the output of this method to create *relative* transformation.

    var currentTransform = $('#myDiv').css('transform');
    $('#myDiv').animate({ transform: currentTransform + 'rotate(90deg)' });

Limitations:
============

Both plugins have the following limitations:

- requires jQuery 1.4.3+,
- Should you use the *translate* property, then your elements need to be absolutely positionned in a relatively positionned wrapper **or it will fail in IE**,
- transformOrigin is not accessible.

The **light** has the following additional limitations:

- `matrix(...)` cannot be used,
- transformations set through other plugins, raw DOM manipulation or stylesheets are ignored: animating or accessing current style would fail,
- incompatible with [jquery.transition.js](https://github.com/lrbabe/jquery.transition.js).

Light or not light?
-------------------

Although the *light* version has more limitations than the *full* version, it has a smaller file-size and is less CPU intensive.  
Transformation interpolation (i.e. animations) will also be more accurate in the *light* version, since matrices are excluded.  
It is recommanded to start with the *light* version and then switch to *full* one when the need really arises.

Why such restrictions with 'translate'?
---------------------------------------

Since translate is unavailable in IE<9, we have to emulate it using *top* and *left* properties of the element style.  
This can, of course, only work if the elements are absolutely positionned in a relatively positionned wrapper.  

Other plugins position the elements and wrap them transparently.  
I think that transparently messing with the DOM often introduces unpredictible behavior.  
Unpredictible behavior leads developpers to fear plugins.  
*Fear leads to anger. Anger leads to hate. Hate leads to suffering.*  
I prefer leaving this up to you.

License
=======

Dual licensed under GPL and MIT licenses.

Copyright (c) 2010 [Louis-Rémi Babé](http://twitter.com/louis_remi).