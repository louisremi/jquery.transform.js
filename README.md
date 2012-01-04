jquery.transform2d.js adds 2d transform capabilities to jQuery `css()` and `animate()` functions.

Usage:
======

Set transform with a string
---------------------------

    $(elem).css('transform', 'translate(50px, 30px) rotate(25deg) scale(2,.5) skew(-35deg)');
    $(elem).animate({transform: 'translateY(-100px) rotate(1rad) scaleX(2) skewY(42deg)'});

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

Get transform
-------------

returns a computed transform matrix.

    $(elem).css('transform') == 'matrix(0,1,-1,0,100,50)';

Set transform-origin with a string
----------------------------------

    $(elem).css('transform-origin', 'top left');
    $(elem).animate({transformOrigin: 'top left'});

Get transform-origin
--------------------
	
	$(elem).css('transform-origin')

Usually the returned units are in pixels however Firefox and IE-less-than-9 may return percentages.

Relative animations
-------------------

Relative animations are possible by prepending "+=" at the end of the transform string.

    $(elem).css('transform', 'rotate(45deg)');
    // using the following syntax, elem will always rotate 90deg anticlockwise
    $(elem).animate({transform: '+=rotate(-90deg)'});

Limitations:
============

- requires jQuery 1.4.3+,
- units must be px or deg (TODO)


Potential Translation Issues in IE 8 and Below
----------------------------------------------

Since translate and transform-origin is unavailable in IE 8 and below, we have to emulate it using `top` and `left` properties of the element style.  This library tries to emulate translate and transform-origin using position relative to reposition the element. While this closely emulates the expected behavior, if the element is already positioned, the existing position is respected as much as possible.

- absolute positioned elements are repositioned using marginTop and marginLeft to avoid conclicts
- inline styles for top and left (or marginTop and marginLeft) will be overwritten
- changes in the height or width of the element will not be dynamically reflected
- IE 7 and below incorrectly alter the offset height and width of the element to match the transformed offset height and width


License
=======

Dual licensed under GPL and MIT licenses.

Copyright (c) 2010 [Louis-Rémi Babé](http://twitter.com/louis_remi).