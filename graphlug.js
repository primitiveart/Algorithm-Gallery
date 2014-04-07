var graphlug = function(options){
	var object = this;
	
	var defaults = {
		element : '',
		type : 'bar',
		maxHeight : 500,
		maxWidth : 960,
		borderSize : 0,
		spacing : 2,
		speed : 200,
		state : 'play',
		numOfSteps : 0,
		array : []
	}; 

	if(typeof options.array !== 'undefined'){
		options.array = convertToAscii(options.array);
	}
	
	var opts = $.extend({}, defaults, options); 
	
	var barWidth = 10; /*barWidth default - automatic change if necessary*/
	
	var ratio = 1; /*ratio default - automatic change if necessary*/
	
	var stepByStep = false; /*variable to check if regular or step by step animation*/
	
	var oldSpeed = 200; /*variable to keep speed before step by step*/
	
	var $this = opts.element;
	
	var minHeight = $this.height(); /*minHeight default - stays unchanged - it takes the value user defined at css - if no value defined == 0*/
	
	var minWidth = $this.width(); /*minWidth default - stays unchanged - it takes the value user defined at css - if no value defined == 0*/
	
	var run = true; /*variable to be used to check if animation is */
	
	var stepLength = 0; /*variable to be used to keep length of each step*/
	
	var timerun_length = 0; /*variable to keep length of run time bar*/
	
	/*Initialize object at beginning*/
	init();
	
	/*Function to setOptions*/
	this.setOptions = function(options){
		if(typeof options.array !== 'undefined'){
			options.array = convertToAscii(options.array);
		}
		opts = $.extend({}, opts, options);
		init();
		
		return this;
	};
	
	/*Function to set speed*/
	this.speed = function(value){
		if(isNumber(value)){ /*If not a number do nothing*/
			opts.speed = value;
			oldSpeed = value;
		}
		
		return this;
	};
	
	/*It starts the animation*/
	this.play = function(){
		opts.state = 'play';
		$this.removeClass('pause');
		
		return this;
	};
	
	/*It pauses the animation*/
	this.pause = function(){
		opts.state = 'pause';
		$this.addClass('pause');
		
		return this;
	};
	
	/*Step by step animation*/
	this.runStep = function(){
		oldSpeed = opts.speed;
		opts.speed = 0;
		stepByStep = true;
		
		return this;
	};
	
	/*Regular animation*/
	this.runRegular = function(){
		opts.speed = oldSpeed;
		opts.state = 'play';
		stepByStep = false;
		
		return this;
	};
	
	/*It stops the animation - not reversable - it stops after step completes*/
	this.stop = function(){
		$('.'+$this.attr('id')+'.bar').removeClass('highlight').removeClass('swap').removeClass('compare');
		masterQueue.clearQueue();
		stepQueue.clearQueue();
		masterQueue_search.clearQueue();
		stepQueue_search.clearQueue();
		
		return this;
	};
	
	/*Stores the function that runs on listen*/
	this.listenerFunction = 'none';
	
	/*Starts an event listener*/
	this.listen = function(func){
		
		if(func instanceof Function){
			this.listenerFunction = func;
		}
		
		return this;
	};
	
	/*Stops an event listener*/
	this.stopListen = function(){
		this.listenerFunction = 'none';
		
		return this;
	};
	
	/*Returns the current step*/
	this.step = function(){
		return step;
	};
	
	/*Function to insert new item in graph*/
	this.draw = function(array){
		array = convertToAscii(array);
		opts.array = array;
		init();
		
		return this;
	};
	
	/*Function to clear graph from any existing items and insert new*/
	this.reDraw = function(array){
		$this.children().animate({
			height: 0
		}, 200, function(){
			$this.children().remove();
			array = convertToAscii(array);
			opts.array = array;
			init();
		});
		
		return this;
	};
	
	var masterQueue = $({}); /*Used to queue animation for every sorting visualize call*/
	var stepQueue = $({}); /*Used to queue animation for every sorting visualize step*/
	var step = 0;
	/*Function to visualize algorithms*/
	this.visualize = function(object){
		masterQueue.queue(function(){
			if(run == true){
				timerun_length += stepLength;
				if(timerun_length > 0.5){
					$('.'+$this.attr('id')+'.timerun').width(timerun_length);
				}
				
				var marginLeft = opts.spacing;
				var delay = 0;
				if(object.type !== 'completed'){
					step = object.steps - 1;
				}
				if(object.type == 'compare'){
					if(($('.'+$this.attr('id')+'.bar.'+object.elements[0]+'').length > 0) && ($('.'+$this.attr('id')+'.bar.'+object.elements[1]+'').length > 0)){ 
						var elem1 = $('.'+$this.attr('id')+'.bar.'+object.elements[0]+'');
						var elem2 = $('.'+$this.attr('id')+'.bar.'+object.elements[1]+'');
						if(object.result[0] == 'swap'){
							elem1.addClass('compare');
							elem2.addClass('compare');
						}
						if((object.result[0] == 'newMax') || (object.result[0] == 'newMin')){
							$('.'+$this.attr('id')+'.bar').removeClass('highlight');
							elem1.addClass('compare');
							elem2.addClass('highlight');
						}
						if((object.result[0] == 'moveLeft') || (object.result[0] == 'moveRight')){
							$('.'+$this.attr('id')+'.bar').removeClass('pivot');
							elem1.addClass('highlight');
							elem2.addClass('pivot');
						}
						stepQueue.queue(function(next){ /*Start comparison - animate elements*/
							triggerListener({type:'compare', elements: [object.elementsData[0], object.elementsData[1]]});
							var num = 0;
							elem1.animate({
								height: '+=10'
							}, opts.speed, function(){
								num++;
								if(num == 2){
									if(stepByStep){
										opts.state = 'pause';
									}
									handlePause(stepQueue);
									num = 0;
								}
							});
							elem2.animate({
								height: '+=10'
							}, opts.speed, function(){
								num++;
								if(num == 2){
									if(stepByStep){
										opts.state = 'pause';
									}
									handlePause(stepQueue);
									num = 0;
								}
							});
						});
						stepQueue.queue(function(next){ /*Visualize action*/
							var swapSpeed = opts.speed; /*Variable to keep the swap speed at 200ms if user sets lower speed*/
							if(opts.speed > 200){
								swapSpeed = 200;
							}
							if((object.result[0] == 'swap') && (object.result[1] == true)){
								triggerListener({type:'swap', elements: [object.elementsData[0], object.elementsData[1]]});
								var num = 0; 
								elem1.removeClass('compare').removeClass('highlight').removeClass('pivot').addClass('swap');
								elem2.removeClass('compare').removeClass('highlight').removeClass('pivot').addClass('swap');
								var margin1 = elem1.css('marginLeft');
								var margin2 = elem2.css('marginLeft');
								elem1.removeClass(''+object.elements[0]+'').addClass(''+object.elements[1]+'');
								elem2.removeClass(''+object.elements[1]+'').addClass(''+object.elements[0]+'');
								elem1.animate({
									marginLeft: margin2
								}, swapSpeed, function(){
									num++;
									if(num == 2){
										if(stepByStep){
											opts.state = 'pause';
										}
										handlePause(stepQueue, swapSpeed);
										num = 0;
									}
								});
								elem2.animate({
									marginLeft: margin1
								}, swapSpeed, function(){
									num++;
									if(num == 2){
										if(stepByStep){
											opts.state = 'pause';
										}
										handlePause(stepQueue, swapSpeed);
										num = 0;
									}
								});
							}
							else if(((object.result[0] == 'newMax') || (object.result[0] == 'newMin')) && (object.result[1] == true)){
								triggerListener({type:object.result[0], elements: [object.elementsData[0], object.elementsData[1]]});
								elem1.removeClass('compare').addClass('highlight');
								elem2.removeClass('highlight').addClass('compare');

								if(stepByStep){
									opts.state = 'pause';
								}
								handlePause(stepQueue, swapSpeed);
							}
							else if(((object.result[0] == 'moveLeft') || (object.result[0] == 'moveRight')) && (object.result[1] == true)){
								triggerListener({type:object.result[0], elements: [object.elementsData[0], object.elementsData[1]]});
								elem1.removeClass('highlight');
								if((object.result[0] == 'moveLeft')){
									$('.'+$this.attr('id')+'.bar.'+parseInt(object.elements[0])-1+'').addClass('highlight');
								}
								if((object.result[0] == 'moveRight')){
									$('.'+$this.attr('id')+'.bar.'+parseInt(parseInt(object.elements[0])+1)+'').addClass('highlight');
								}
								
								if(stepByStep){
									opts.state = 'pause';
								}
								handlePause(stepQueue, swapSpeed);
							}
							else {
								triggerListener({type:'nothing', elements: [object.elementsData[0], object.elementsData[1]]});

								if(stepByStep){
									opts.state = 'pause';
								}
								handlePause(stepQueue, swapSpeed);
							}
						});
						stepQueue.queue(function(next){ /*Finish animation - return elements at normal size*/
							var num = 0;
							elem1.animate({
								height: '-=10'
							}, opts.speed, function(){
								elem1.removeClass('compare').removeClass('swap');
								num += 1;
								if(num == 2){
									if(stepByStep){
										opts.state = 'pause';
									}
									handlePause(masterQueue);
									num = 0;
								}
							});
							elem2.animate({
								height: '-=10'
							}, opts.speed, function(){
								elem2.removeClass('compare').removeClass('swap');
								num += 1;
								if(num == 2){
									if(stepByStep){
										opts.state = 'pause';
									}
									handlePause(masterQueue);
									num = 0;
								}
							});

							if(stepByStep){
								opts.state = 'pause';
							}
							handlePause(stepQueue);
						});
					}
				}
				else if(object.type == 'setBoundaries'){
					if(($('.'+$this.attr('id')+'.bar.'+object.elements[0]+'').length > 0) && ($('.'+$this.attr('id')+'.bar.'+object.elements[1]+'').length > 0) && ($('.'+$this.attr('id')+'.bar.'+object.elements[1]+'').length > 0)){ 
						triggerListener({type:object.type, elements: [object.elementsData[0], object.elementsData[1], object.elementsData[2]]});
						var elem1 = $('.'+$this.attr('id')+'.bar.'+object.elements[0]+'');
						var elem2 = $('.'+$this.attr('id')+'.bar.'+object.elements[1]+'');
						var elem3 = $('.'+$this.attr('id')+'.bar.'+object.elements[2]+'');
						$('.'+$this.attr('id')+'.bar').removeClass('highlight').removeClass('pivot');
						elem1.addClass('highlight');
						elem2.addClass('pivot');
						elem3.addClass('highlight');
						
						if(stepByStep){
							opts.state = 'pause';
						}
						handlePause(masterQueue);
					}
				}
				else if(object.type == 'completed'){
					triggerListener({type:object.type});
					var infoPosition = {
						top : ($this.height()/2) - 89,
						left : ($this.width()/2) - 126
					};
					$this.prepend('<div class="completed_container">'+
						'<div class="completed_info" style="top:'+infoPosition.top+'px;left:'+infoPosition.left+'px;">'+
							'<div class="completed_info_title"></div>'+
							'<div id="completed_info_time" class="completed_info_container">'+
								'<p class="completed_info_container_title">Διάρκεια (ms)</p>'+
								'<p class="completed_info_container_data">'+object.time+'</p>'+
							'</div>'+
							'<div id="completed_info_steps" class="completed_info_container">'+
								'<p class="completed_info_container_title">Βήματα</p>'+
								'<p class="completed_info_container_data">'+object.steps+'</p>'+
							'</div>'+
						'</div>'+
					'</div>');
					
					$('#'+$this.attr('id')+' > .completed_container > .completed_info').show('bounce');
					
					if(stepByStep){
						opts.state = 'pause';
					}
					handlePause(masterQueue);
				}
			}
		});
		
		function handlePause(queue, speed){
			if(opts.state == 'pause'){
				var pause = setInterval(function(){
					if(opts.state == 'play'){

						if(typeof speed === 'undefined'){
							queue.delay(opts.speed).dequeue();
						}
						else {
							queue.delay(speed).dequeue();
						}
						window.clearInterval(pause);
					}
				},10);
			}
			else {
				if(typeof speed === 'undefined'){
					queue.delay(opts.speed).dequeue();
				}
				else {
					queue.delay(speed).dequeue();
				}
			}
		}
		
		return this;
	};
	
	var masterQueue_search = $({}); /*Used to queue animation for every searching visualize call*/
	var stepQueue_search = $({}); /*Used to queue animation for every searching visualize step*/
	/*Function to visualize algorithms*/
	this.visualizeSearch = function(object){
		masterQueue_search.queue(function(){
			if(run == true){
				timerun_length += stepLength;
				if(timerun_length > 0.5){
					$('.'+$this.attr('id')+'.timerun').width(timerun_length);
				}
				
				var marginLeft = opts.spacing;
				var delay = 0;
				if(object.type == 'compare'){
					if($('.'+$this.attr('id')+'.bar.'+object.elements[0]+'').length > 0){ 
						var elem1 = $('.'+$this.attr('id')+'.bar.'+object.elements[0]+'');
						elem1.addClass('compare');
						if((object.result[1] == 'checkLeft') || (object.result[1] == 'checkRight')){
							$('.'+$this.attr('id')+'.bar').removeClass('pivot');
							elem1.addClass('pivot');
						}
						stepQueue_search.queue(function(next){ /*Start comparison - animate elements*/
							triggerListener({type:'compare', elements: [object.elementsData[0], object.elements[1]]});
							var num = 1;
							elem1.animate({
								height: '+=10'
							}, opts.speed, function(){
								num++;
								if(num == 2){
									if(stepByStep){
										opts.state = 'pause';
									}
									handlePause(stepQueue_search);
									num = 0;
								}
							});
						});
						stepQueue_search.queue(function(next){ /*Visualize action*/
							if(object.result instanceof Array){
								if(object.result[1] == 'checkLeft'){
									triggerListener({type:'checkLeft', elements: [object.elementsData[0]]});
								}	
								else if(object.result[1] == 'checkRight'){
									triggerListener({type:'checkRight', elements: [object.elementsData[0]]});
								}
								if(stepByStep){
									opts.state = 'pause';
								}
								handlePause(stepQueue_search, opts.speed);
							}
							else {

								if(stepByStep){
									opts.state = 'pause';
								}
								handlePause(stepQueue_search, opts.speed);
							}
						});
						stepQueue_search.queue(function(next){ /*Finish animation - return elements at normal size*/
							var num = 1;
							elem1.animate({
								height: '-=10'
							}, opts.speed, function(){
								elem1.removeClass('compare').removeClass('swap');
								num += 1;
								if(num == 2){
									if(stepByStep){
										opts.state = 'pause';
									}
									handlePause(masterQueue_search);
									num = 0;
								}
							});

							if(stepByStep){
								opts.state = 'pause';
							}
							handlePause(stepQueue_search);
						});
					}
				}
				else if(object.type == 'setBoundaries'){
					if(($('.'+$this.attr('id')+'.bar.'+object.elements[0]+'').length > 0) && ($('.'+$this.attr('id')+'.bar.'+object.elements[1]+'').length > 0) && ($('.'+$this.attr('id')+'.bar.'+object.elements[1]+'').length > 0)){ 
						triggerListener({type:object.type, elements: [object.elementsData[0], object.elementsData[1], object.elementsData[2]]});
						var elem1 = $('.'+$this.attr('id')+'.bar.'+object.elements[0]+'');
						var elem2 = $('.'+$this.attr('id')+'.bar.'+object.elements[1]+'');
						var elem3 = $('.'+$this.attr('id')+'.bar.'+object.elements[2]+'');
						$('.'+$this.attr('id')+'.bar').removeClass('highlight').removeClass('pivot');
						elem1.addClass('highlight');
						elem2.addClass('pivot');
						elem3.addClass('highlight');
						
						if(stepByStep){
							opts.state = 'pause';
						}
						handlePause(masterQueue_search);
					}
					else {
						if(stepByStep){
							opts.state = 'pause';
						}
						handlePause(masterQueue_search);
					}
				}
				else if(object.type == 'completed'){
					if(object.result[1] !== 'undefined'){
						if($('.'+$this.attr('id')+'.bar.'+object.result[1]+'').length > 0){ 
							var elem1 = $('.'+$this.attr('id')+'.bar.'+object.result[1]+'');
							elem1.addClass('compare');
							stepQueue_search.queue(function(next){ /*Start comparison - animate elements*/
								triggerListener({type:'found', elements: [object.result[1]]});
								
								var infoPosition = {
									top : ($this.height()/2) - 89,
									left : ($this.width()/2) - 126
								};
								$this.prepend('<div class="completed_container">'+
									'<div class="completed_info" style="top:'+infoPosition.top+'px;left:'+infoPosition.left+'px;">'+
										'<div class="completed_info_title"></div>'+
										'<div id="completed_info_time" class="completed_info_container">'+
											'<p class="completed_info_container_title">Διάρκεια (ms)</p>'+
											'<p class="completed_info_container_data">'+object.time+'</p>'+
										'</div>'+
										'<div id="completed_info_steps" class="completed_info_container">'+
											'<p class="completed_info_container_title">Βήματα</p>'+
											'<p class="completed_info_container_data">'+object.steps+'</p>'+
										'</div>'+
									'</div>'+
								'</div>');
								
								$('#'+$this.attr('id')+' > .completed_container > .completed_info').show('bounce');
								
								var num = 1;
								elem1.animate({
									height: '+=10'
								}, opts.speed, function(){
									num++;
									if(num == 2){
										if(stepByStep){
											opts.state = 'pause';
										}
										handlePause(stepQueue_search);
										num = 0;
									}
								});
							});
							stepQueue_search.queue(function(next){ /*Finish animation - return elements at normal size*/
								$('.'+$this.attr('id')+'.bar').removeClass('highlight').removeClass('pivot');
								elem1.removeClass('compare').addClass('found');
								var num = 1;
								elem1.animate({
									height: '-=10'
								}, opts.speed, function(){
									num += 1;
									if(num == 2){
										if(stepByStep){
											opts.state = 'pause';
										}
										handlePause(masterQueue_search);
										num = 0;
									}
								});
								//next();
								if(stepByStep){
									opts.state = 'pause';
								}
								handlePause(stepQueue_search);
							});
						}
					}
					else {
						$('.'+$this.attr('id')+'.bar').removeClass('compare').removeClass('highlight').removeClass('pivot');
						triggerListener({type:'not-found'});
						var infoPosition = {
							top : ($this.height()/2) - 89,
							left : ($this.width()/2) - 126
						};
						$this.prepend('<div class="completed_container">'+
							'<div class="completed_info" style="top:'+infoPosition.top+'px;left:'+infoPosition.left+'px;">'+
								'<div class="completed_info_title"></div>'+
								'<div id="completed_info_time" class="completed_info_container">'+
									'<p class="completed_info_container_title">Διάρκεια (ms)</p>'+
									'<p class="completed_info_container_data">'+object.time+'</p>'+
								'</div>'+
								'<div id="completed_info_steps" class="completed_info_container">'+
									'<p class="completed_info_container_title">Βήματα</p>'+
									'<p class="completed_info_container_data">'+object.steps+'</p>'+
								'</div>'+
							'</div>'+
						'</div>');
						
						$('#'+$this.attr('id')+' > .completed_container > .completed_info').show('bounce');
						
						if(stepByStep){
							opts.state = 'pause';
						}
						handlePause(masterQueue_search);
					}
				}
			}
		});
		
		function handlePause(queue, speed){
			if(opts.state == 'pause'){
				var pause = setInterval(function(){
					if(opts.state == 'play'){

						if(typeof speed === 'undefined'){
							queue.delay(opts.speed).dequeue();
						}
						else {
							queue.delay(speed).dequeue();
						}
						window.clearInterval(pause);
					}
				},10);
			}
			else {
				if(typeof speed === 'undefined'){
					queue.delay(opts.speed).dequeue();
				}
				else {
					queue.delay(speed).dequeue();
				}
			}
		}
		
		return this;
	};
	
	/*Initialization function*/
	function init(){
		/*Check if height must be change so that it will fit inside of the element*/
		var newHeight = minHeight;
		var newValue = 0;
		var maxValue = 0;
		$.each(opts.array, function(index, value){
			if(value > maxValue){
				maxValue = value;
			}
		});
		if(maxValue * ratio > newHeight){
			if((maxValue * ratio + 10 > opts.maxHeight) && (opts.maxHeight > 0)){
				if(maxValue + 10 > opts.maxHeight){
					newValue = opts.maxHeight - 10;
					ratio = newValue / maxValue;
					newHeight = opts.maxHeight;
				}
				else {
					newValue = opts.maxHeight - 10;
					ratio = newValue / maxValue;
					newHeight = opts.maxHeight;
				}
			}
			else {
				newHeight = maxValue * ratio + 10;
			}
		}
		else if(maxValue * ratio + 10 < newHeight){
			ratio = (newHeight - 10) / maxValue;
		}
		$this.animate({
			height: newHeight
		}, 500);
		
		/*Check length if must be changed so it will fit inside element - if maxWidth < length * 2 then show error (bar must be at least 1px wide and to have at least 1px spacing*/
		var newWidth = $this.width();
		if(opts.array.length * (barWidth + opts.spacing + opts.borderSize * 2)  > $this.width()){
			if((opts.array.length * (barWidth + opts.spacing + opts.borderSize * 2)  > opts.maxWidth) && (opts.maxWidth > 0)){
				newWidth = opts.maxWidth;
				if((opts.array.length * 2 > opts.maxWidth) || (opts.array.length > opts.maxWidth)){
					$this.append('<p class="error">Too many elements!</p>');
					run = false;
				}
				else {
					opts.spacing = 1;
					var difRatio = (opts.maxWidth - opts.spacing) / opts.array.length;
					if((difRatio > opts.spacing + 2) && (opts.borderSize > 0)){
						opts.borderSize = 1;
					}
					barWidth = difRatio - opts.spacing - opts.borderSize * 2;
					run = true;
				}
			}
			else {
				newWidth = opts.array.length * (barWidth + opts.spacing + opts.borderSize * 2) + opts.spacing;
			}
		}
		else if((opts.array.length * (barWidth + opts.spacing + opts.borderSize * 2) < $this.width() - 2)){ /*If element width to big then make it smaller to fit*/
			if(opts.array.length * (barWidth + opts.spacing + opts.borderSize * 2) > minWidth){
				newWidth = opts.array.length * (barWidth + opts.spacing + opts.borderSize * 2) + opts.spacing;
			}
			else {
				newWidth = minWidth;
				var difRatio = (minWidth - opts.spacing) / opts.array.length;
				barWidth = difRatio - opts.spacing - opts.borderSize * 2;
			}
		}
		if(barWidth < 1){
			barWidth = 1;
		}
		$this.width(newWidth);
		
		$this.css({'padding-bottom': opts.spacing+'px'});
		
		$this.after('<div class="'+$this.attr('id')+' timeline">'+
						'<div class="'+$this.attr('id')+' timerun"></div>'+
					'</div>');
		
		var parentTop = 0;
		if(parseInt($this.css('top'))){
			parentTop = parseInt($this.css('top'));
		}
		var timelineTop = newHeight + parentTop + 5;
		var timelineLeft = $this.css('left');
		
		$('.'+$this.attr('id')+'.timeline').css({
			'width': newWidth,
			'top': timelineTop+'px',
			'left': timelineLeft
		});
		
		stepLength = (newWidth + 2) / opts.numOfSteps;

		draw(opts.array);
	}
	
	/*Function to insert items at graph - private function*/
	function draw(array){
		if(run == true){
			var marginLeft = opts.spacing;
			var delay = 0;
			var time = 10;
			if(opts.array.length > 50){
				time = 5;
			}
			$.each(opts.array, function(index, value){
				var value = value * ratio;
				var margin = $this.height() - value;
				if($('.'+$this.attr('id')+'.bar.'+index+'').length > 0){ //If element already exists then just change size to reflect the new value 
					$('.'+$this.attr('id')+'.bar.'+index+'').delay(delay).animate({
						height: value
					}, 500);
				}
				else {
					$this.append('<div class="'+$this.attr('id')+' bar '+index+'"></div>');
					$('.'+$this.attr('id')+'.bar').last().css({'height':value+'px', 'margin-left': marginLeft+'px', 'width': barWidth+'px', 'border-width': opts.borderSize+'px'});
					marginLeft = marginLeft + opts.spacing + barWidth + opts.borderSize*2;
					$('.'+$this.attr('id')+'.bar').last().delay(delay).animate({
						height: 'toggle'
					}, 500);
					delay = delay + time;
				}
			});
		}
	}
	
	/*Function to check if given value is number or string that is number*/
	function isNumber(value){
		return !isNaN(parseFloat(value)) && isFinite(value);
	}
	
	/*Function to convert array of strings in ASCII value*/
	function convertToAscii(array){
		var asciiArr = array.slice(0);
		if(typeof asciiArr !== 'undefined'){
			if ((asciiArr instanceof Array)){
				for(key in asciiArr){
					if(typeof asciiArr[key] === 'string'){
						asciiArr[key] = asciiArr[key].charCodeAt(0);
					}
				}
			}
		}
		
		return asciiArr;
	}
	
	/*Listener function - runs the user function given through listen*/
	function triggerListener(ret_values){
		if(object.listenerFunction instanceof Function){
			object.listenerFunction(ret_values);
		}
	}
	
	return this;
};	