$.fn.inputRotator = function(params={}) 
{

    //  Read parameters
    if(params.sensibility === undefined) this.sensibility = 1;
    else this.sensibility = params.sensibility;

    if(params.horizontalMax === undefined) this.horizontalMax = -50 * this.sensibility;
    else this.horizontalMax = params.horizontalMax * this.sensibility;

    if(params.horizontalMin === undefined) this.horizontalMin = 50 * this.sensibility;
    else this.horizontalMin = params.horizontalMin * this.sensibility;

    if(params.degreeMin === undefined) this.degreeMin = 0;
    else this.degreeMin = params.degreeMin;
    
    if(params.degreeMax === undefined) this.degreeMax = 360;
	else this.degreeMax = params.degreeMax;
	
    if(params.defaultPosition === undefined) this.defaultPosition = 'left';
    else this.defaultPosition = params.defaultPosition;
	
    if(params.started === undefined) this.started = null;
	else this.started = params.started;

	if(params.onchange === undefined) this.onchange = null;
	else this.onchange = params.onchange;

	if(params.ended === undefined) this.ended = null;
	else this.ended = params.ended;
	
    // Variables
	this.value = 0;

    this.obj = this; //document.getElementById(id);
    this.mouseStatus = 0;
	this.mouseClickPosition = 0;
	this.oldPercent = 0;

    // Events
    this.mousedown = mousedown;
    this.mouseup = mouseup;
    this.mousemove = mousemove;
    
    // Private functions
	this.generateObject = generateObject;
	
    this.convertPositionToRelativePercent = convertPositionToRelativePercent;
    this.convertPercentToDegree = convertPercentToDegree;
    this.convertRelativeToPercent = convertRelativeToPercent;
    this.convertPercentToRelative  = convertPercentToRelative;
    this.setPointRelativeValue = setPointRelativeValue;
    this.setProgressRelativeValue  = setProgressRelativeValue;
	this.setValue = setValue;
	
	
	if(this.type == undefined || this.obj.attr("type") =="circlePointer")
		this.generateObject();
    
    var that = this;
    this.obj.on('mousedown', function(e) { that.mousedown(e); });
    $("html").on('mouseup', function(e) { that.mouseup(e); });
    $("html").on('mousemove', function(e) { that.mousemove(e); });
	
	
	// Set default value at 0%
	this.setValue(0);
	this.obj.attr("type", "circlePointer");
	return this;

	/**
	 * When the mouse's button is pressd
	 * @param {object} e
	 */

    function mousedown(e)
    {
		if(e.which != 1)
			return;
		
		this.mouseStatus = 1;
		this.mouseClickPosition = e.pageY;

		if(this.started != null)
			this.started(this.value, this.mouseClickPosition);
    }

	/**
	 * When the mouse's button is released
	 *
	 * @param {*} e
	 * @returns
	 */
	function mouseup(e)
    {
		
		if(e.which != 1 || this.mouseStatus != 1)
			return;

		this.mouseStatus = 0;
		this.oldPercent = this.relativeValue;

		if(this.ended != null)
			this.ended(this.value, this.mouseClickPosition, e.pageY);
    }

	/**
	 * When the mouse's button is pressd and the mouse is moving
	 *
	 * @param {object} e
	 * @param {boolean} [callevent=true]
	 * @returns
	 */
	function mousemove(e, callevent = true)
    {		
        if(e.which != 1 || this.mouseStatus != 1)
           return;
        
        // Convert position in percent
        var relative_percent = this.convertPositionToRelativePercent(this.mouseClickPosition, e.pageY);
		
		this.relativeValue = 100 - relative_percent;

		this.value = this.convertRelativeToPercent(relative_percent);

		this.setPointRelativeValue()
		this.setProgressRelativeValue()
		if(this.onchange != null && callevent == true)
			this.onchange(this.value);
    }

	/**
	 * Convert axe position in percent
	 *
	 * @param {int} start
	 * @param {int} actual
	 * @returns {float} percent
	 */
	function convertPositionToRelativePercent(start, actual)
    {
		
		var val = 100 + (100 / (-this.horizontalMax + this.horizontalMin)) * (start - actual);
		val -= this.oldPercent;
		// console.log(`100 + (100 / (-${this.horizontalMax} + ${this.horizontalMin})) * (${start} - ${actual}) = ${val}`);

		
		if(val > 100)
			return 100;
		else if(val < 0)
			return 0;
		return val;
    }

	/**
	 * Convert perent in degrees
	 *
	 * @param {float} percent
	 * @returns {float} degrees
	 */
	function convertPercentToDegree(percent)
    {
        return (((this.degreeMin - this.degreeMax) / 100) * percent) + this.degreeMax;
	}

	/**
	 * Convert relative percent in percent
	 *
	 * @param {float} relative relative
	 */
	function convertRelativeToPercent(relative)
	{
		switch (this.defaultPosition) 
		{
			case 'left':
				return relative;

			case 'right':
				return 100 - relative;

			case 'center':			
				return relative * 2 - 100;
		}
	}

	/**
	 * Convert percent in relative percent
	 *
	 * @param {float} pourcent relative
	 */
	function convertPercentToRelative(percent)
	{
		switch (this.defaultPosition) 
		{
			case 'left':
				return 100 - percent;

			case 'right':
				return percent;

			case 'center':
				return 100 - (percent + 100) / 2;
		}
	}
	
	/**
	 * Set the Gap position
	 *
	 */
	function setPointRelativeValue()
	{
		var deg = this.convertPercentToDegree(this.relativeValue);

		$(" div", this.obj).css('transform', 'rotate('+deg+'deg)');
	}

	/**
	 * Set the position of the progress
	 *
	 */
	function setProgressRelativeValue()
	{
		//
		// Progresss movement
		//
		var val = 0;

		switch (this.defaultPosition) {
			case 'left':
				val = this.value;
				break;
			case 'right':
				val = this.value - 100;
				break;
			case 'center':
				val = this.value / 2;
				break;
		}
				
		// Get the meter path
		var path = $('.meter', this.obj).get(0);
		
		// Get the length of the path
		let length = path.getTotalLength();
		
		path.style.strokeDashoffset = length;
		path.style.strokeDasharray = length;

		// Get the value of the meter
		let to = length * ((100 - val) / 100);

		path.getBoundingClientRect();
		path.style.strokeDashoffset = Math.max(0, to);  
		
	}

	/**
	 * Define value in percent
	 *
	 * @param {*} percent
	 */
	function setValue(percent)
	{
		// Empêche les valeur hors limites
		switch (this.defaultPosition) 
		{
			case 'left':
				if(percent > 100)
					percent = 100;
				else if(percent < 0)
					percent = 0;
				break;
			
			case 'right':
				if(percent > 100)
					percent = 100;
				else if(percent < 0)
					percent = 0;
				break;
			
			case 'center':
				if(percent > 100)
					percent = 100;
				else if(percent < -100)
					percent = -100;
				break;
		}

		this.relativeValue = this.convertPercentToRelative(percent);
		this.value = percent;

		this.setPointRelativeValue()
		this.setProgressRelativeValue()
		this.oldPercent = this.relativeValue;
	}

	/**
	 * Generate the object
	 */
	function generateObject()
	{
		var transform= "";
		switch (this.defaultPosition) {
			case 'center':
				transform = "transform='scale(-1,-1)'";
				break;
			case 'right':
				transform = "transform='scale(-1,1)'";
				break;
		}

		var content = ` 
			<img src='../sources/images/base.svg' draggable='false' class='circlebutton-buttRotat circlebutton-border'>
			<div class='circlebutton-contentPointer' draggable='false'>
				<img src='../sources/images/pointer.svg' draggable='false' class='circlebutton-buttRotat circlebutton-pointer'>
			</div>
			<img src='../sources/images/progress_background.svg' draggable='false' class='circlebutton-buttRotat circlebutton-empty'>
			
			<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 178.96 178.96'>
				<path class='meter' stroke='black' ${transform} fill='none' d='M89.48,175A85.48,85.48,0,1,1,175,89.48,85.53,85.53,0,0,1,89.48,175'/>
			</svg>
		`;

		this.obj.addClass("circlebutton-content");
		this.obj.attr("draggable", "false");
		this.obj.attr("ondragstart", "return false;");
		this.obj.append(content);
	}
}

// $(document).ready(function() {

// 	$("div[type=circlePointer]").each(function() {

// 		var params= {};
// 		$.each(this.attributes, function() {
// 			if(this.name != 'id' &&
// 				this.name != 'name' &&
// 				this.name != 'class' &&
// 				this.name != 'type' &&
// 				this.specified)
				
// 				params[this.name] = this.value;
// 		});
		
// 		$(this).circlePointer(params);
// 	});
// });


/*
TODO:
	- hide cursor on edit
	- Add horiontal scroll
*/