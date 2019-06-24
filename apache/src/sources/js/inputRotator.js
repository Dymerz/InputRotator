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

	if(params.value === undefined) this.value = null;
	else this.value = params.value;
	

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
	
	getPath();
	
	if(this.type == undefined || this.obj.attr("type") =="circlePointer")
		this.generateObject();
    
	var that = this;
	
	// Mouse events
    this.obj.on('mousedown', function(e) { that.mousedown(e); });
    $("html").on('mouseup', function(e) { that.mouseup(e); });
	$("html").on('mousemove', function(e) { that.mousemove(e); });
	
	// Touch events
    this.obj.on('touchstart', function(e) { that.mousedown(e); });
    $("html").on('touchend', function(e) { that.mouseup(e); });
    $("html").on('touchmove', function(e) { that.mousemove(e); });
	
	// Set default value at 0%
	this.setValue(this.value);
	this.obj.attr("type", "circlePointer");
	return this;

	/**
	 * When the mouse's button is pressd
	 * @param {object} e
	 */

    function mousedown(e)
    {
		if(e.type == "mousedown" && e.which != 1)
			return;
	
		var pageY = 0;
		if(e.type == "mousedown")
			pageY = e.pageY;
		else
			pageY = e.touches[0].pageY;
			
		this.mouseStatus = 1;
		this.mouseClickPosition = pageY;

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
		if(e.type == "mouseup" && (e.which != 1) || this.mouseStatus != 1)
			return;

		this.mouseStatus = 0;
		this.oldPercent = this.relativeValue;

		var pageY = 0;
		if(e.type == "mouseup")
			pageY = e.pageY;
		else
			pageY = e.changedTouches[0].pageY;

		if(this.ended != null)
			this.ended(this.value, this.mouseClickPosition, pageY);
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
        if(e.type == "mousemove" && (e.which != 1) || this.mouseStatus != 1)
           return;
		
		var pageY = 0;
		if(e.type == "mousemove")
			pageY = e.pageY;
		else
			pageY = e.touches[0].pageY;

        // Convert position in percent
        var relative_percent = this.convertPositionToRelativePercent(this.mouseClickPosition, pageY);
		
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
				val = -this.value;
				break;
			case 'center':
				val = (this.value / 2) - 50;
				break;
		}
				
		// Get the meter path
		var path = $('#meter', this.obj).get(0);
		
		// Get the length of the path
		let length = path.getTotalLength();
		
		path.style.strokeDashoffset = length;
		path.style.strokeDasharray = length;

		// Get the value of the meter
		let to = length * ((100 - val) / 100);
		// console.log(to);
		// if(to>260 || to < 30)
		// 	return;

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
				transform = "translate(99.43, 89.72) scale(-1,-1)";
				break;
			case 'right':
				transform = "translate(0, 0) scale(-1,1)";
				break;
	}

/**
 * 
 * 
			<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 178.96 178.96'>
			<path class='meter' stroke='black' ${transform} fill='none' d='M89.48,175A85.48,85.48,0,1,1,175,89.48,85.53,85.53,0,0,1,89.48,175'/>
		</svg>

 */

		var path = getPath();
		
		var content = ` 
			<img src='${path}images/base.svg' draggable='false' class='circlebutton-buttRotat circlebutton-border'>
			<div class='circlebutton-contentPointer' draggable='false'>
				<img src='${path}images/pointer.svg' draggable='false' class='circlebutton-buttRotat circlebutton-pointer'>
			</div>
			
			<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 99.43 99.43">
				<defs>
					<style>.cls-2{fill:#e5e5e5;}.cls-1{fill:none;stroke-linecap:round;stroke-miterlimit:10;stroke-width:4px;stroke:url(#FmiXGradient);}</style>
					<linearGradient id="FmiXGradient" y1="49.72" x2="99.43" y2="49.72" gradientUnits="userSpaceOnUse">
						<stop offset="0" stop-color="#c730ff" />
						<stop offset="0.5" stop-color="#412fff" />
						<stop offset="1" stop-color="#2c9eff" />
					</linearGradient>
			
					<g transform="${transform}"> 
						<clipPath id="clipPath">
								<path class="cls-2" d="M20.85,89.72a2,2,0,0,1-1.21-.41A49.72,49.72,0,1,1,99.43,49.72,49.39,49.39,0,0,1,79.79,89.31a2,2,0,0,1-2.42-3.19A45.72,45.72,0,1,0,4,49.72,45.42,45.42,0,0,0,22.06,86.13a2,2,0,0,1-1.21,3.59Z" />
						</clipPath>
					</g> 
				</defs>
				
				<g transform="scale(1,1)"> 
					<path id="meter" clip-path="url(#clipPath)" class="cls-1 meter" d="M49.7,97.43A47.72,47.72,0,1,1,97.43,49.72,47.71,47.71,0,0,1,49.7,97.43" />
				</g>
			</svg>
		`;

		this.obj.addClass("circlebutton-content");
		this.obj.attr("draggable", "false");
		this.obj.attr("ondragstart", "return false;");
		this.obj.append(content);
	}

	function getPath()
	{
		var path = (src = $('script[src$="inputRotator.js"]').attr('src')).substring(0, src.lastIndexOf("/") + 1)+"../";
		return path;
		
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