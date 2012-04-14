jquery.transform2d.js adds 2d transform capabilities to jQuery `css()` and `animate()` functions.

[Demo](http://louisremi.github.com/jquery.transform.js/index.html)

Usage:
======

Set transform with a string
---------------------------

    $(elem).css('transform', 'translate(50px, 30px) rotate(25deg) scale(2,.5) skewX(-35deg)');
    $(elem).animate({transform: 'translateY(-100px) rotate(1rad) scaleX(2) skewY(42deg)'});

You can use the following list of transform functions:  
- `translateX(<number>px)`  
- `translateY(<number>px)`  
- combined: `translate(<number>px, <number>px)` *the second number is optional and defaults to 0*  
- `scaleX(<number>)`  
- `scaleY(<number>)`  
- combined: `scale(<number>, <number>)` *the second number is optional and defaults to the value of the first one*  
- `rotate(<angle>)` *units for angles are *rad* (default), *deg* or *grad*.*  
- `skewX(<angle>)`  
- `skewY(<angle>)`  
- `matrix(<number>, <number>, <number>, <number>, <number>, <number>)`*

*`matrix` gives you more control about the resulting transformation, using a [matrix construction set](http://www.useragentman.com/matrix/).  
When using it in animations however, it makes it impossible to predict how the current and target transformations are going to be interpolated; there is no way to tell whether elements are going to rotate clockwise or anti-clockwise for instance.

Get transform
-------------

returns a computed transform matrix.

    $(elem).css('transform') == 'matrix(0,1,-1,0,100,50)';

Relative animations
-------------------

Relative animations are possible by prepending "+=" to the transform string.

    $(elem).css('transform', 'rotate(45deg)');
    // using the following syntax, elem will always rotate 90deg anticlockwise
    $(elem).animate({transform: '+=rotate(-90deg)'});

Limitations:
============

- requires jQuery 1.4.3+,
- Should you use the *translate* property, then your elements need to be absolutely positionned in a relatively positionned wrapper **or it will fail in IE**,
- transformOrigin is not accessible.

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