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
- `matrix(<number>, <number>, <number>, <number>, <number>, <number>)`

`matrix` gives you more control about the resulting transformation, using a [matrix construction set](http://www.useragentman.com/matrix/).
But it gives you less control over animations; you cannot control whether elements are going to rotate clockwise or anti-clockwise for instance.

Get transform
-------------

Returns a computed transform matrix

    $('#myDiv').css('transform') == 'matrix(0,1,-1,0,100,50)';

Limitations:
============

- requires jQuery 1.4.3+
- Should you use the *translate* property, then your elements need to be absolutely positionned in a relatively positionned wrapper **or it will fail in IE**.
- transformOrigin is not accessible

Why such restrictions with 'translate'?
---------------------------------------

Since translate is unavailable in IE<9, we have to emulate it using *top* and *left* properties of the element style.  
This can, of course, only work if the elements are absolutely positionned in a relatively positionned wrapper.  

Other plugins position the elements and wrap them transparently.  
I think that transparently messing with the DOM often introduces unpredictible behavior.  
Unpredictible behavior leads developpers to fear plugins.  
*Fear leads to anger. Anger leads to hate. Hate leads to suffering.*  
I prefer leaving this up to you.

What changed since 1.0?
=======================

The additive behavior of the plugin has been removed to be consistent with jQuery css API.
In order to add transforms to the current state of an element, one would now have to do

    $('#myDiv').css('transform', $('#myDiv').css('transform') + ' rotate(90deg)');

It is now possible to use 'matrix(...)' accross the API.
This allows to build precise transforms using http://www.useragentman.com/matrix/ for instance.

The plugin is now compatible with transforms set in <style> tags and through other libraries.
This was also required to make it compatible with a CSS3 Transitions enhanced jQuery.

License
=======

Dual licensed under GPL and MIT licenses.

Copyright (c) 2010 [Louis-Rémi Babé](http://twitter.com/louis_remi).