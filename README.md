# Input Rotator
A custom HTML elements.

Required
=========

- JQuery


Getting started
===============

```html
<!-- Import style -->
<link rel="stylesheet" type="text/css" href="./libs/css/style.css"/>

<!-- Import Library -->
<script src='./libs/js/inputRotator.js'></script>
```


How to use
===========

To create the componement simply call `inputRotator()`.
```js
$("#track").inputRotator();
```

Example of use:

```html
<div id="test" style="width: 500px;">
    <div id="circle"></div>
</div>
```
```js
var c2 = $("#circle").inputRotator({
    sensibility: 5,
    degreeMin : 0,
    degreeMax : 360,
    defaultPosition: "center",
	
    onchange: function(value) {
        console.log(`circle: onchange(${value})`);
    },
    started: function(start) {
        console.log(`circle: started(${start})`);
    },
    ended: function(value, start, end) {
        console.log(`circle: ended(${value};${start};${end})`);
    }
}
});
```

A complete example is available in the `index.html`.


Parameters
===========

- `sensibility`: Sensibility of the cursor (default: 1).
- `horizontalMin`: Value in pixel of the minimum horizontal axe (default: 50).
- `horizontalMax`: Value in pixel of the maximum horizontal axe (default: -50).
- `degreeMin`: Minimum degree of rotation (default: 0).
- `degreeMax`: Maximum degree of rotation (defualt: 360).
- `defaultPosition`: Default position of the cursor (`left`, `center`, `right`).


Variables
=========

- `value`: (float) get current value.
- `mouseStatus`:  (int) get the mouse button status (clicking=1).
- `mouseClickPosition`: (int) get the mouse position where the click has started.

Events
======
- `started(int: value, int: start)`: Bind an event handler when the mouse is down.
- `ended(int: value, int: start, int: end)`: Bind an event handler when the mouse is up.
- `onchange(int: value)`: Bind an event handler when value change.
	