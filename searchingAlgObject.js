var searchingAlg = function(options){
	/*Variable used to define object variable for usage inside functions*/
	var object = this;
	
	/*Default options in case user doesn't give options - breakIntoLetters works only in case of string(not array)*/
	var defaults = {
		'keepSteps' : true,
		'returnArray' : true,
		'values' : [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],
		'target' : 5,
		'breakIntoLetters' : false
	};
	
	/*Changing options if user gives different value than default*/
	var opts = extend(defaults, options); 
	
	/*Variable to keep new user added algorithms*/
	var customAlgorithms = [];
	
	/*Get type of given values*/
	var typeOfDefault = 'arrayOfNumbers'; /*Type of default sorting values*/
	if((typeof options !== 'undefined') && (typeof options.values !== 'undefined')){
		typeOfDefault = typeOfSort(opts.values);
	}
	
	/*Check type of given values - if string then break into array (if more than one word -separated with spaces- break into words, else break into letters)*/
	if((typeof options !== 'undefined') && (typeof options.values !== 'undefined')){
		opts.values = makeArray(options.values);
	}
	
	/*Setting values to default or to given by user*/
	this.values = opts.values; 
	
	/*Setting target to default or to given by user*/
	this.target = opts.target;
	
	/*Variable to keep step by step algorithm execution*/
	this.stepsHistory = [];
	
	/*Function to set options after the creation of the object*/
	this.setOptions = function(options){
		if((typeof options !== 'undefined') && (typeof options.values !== 'undefined')){
			typeOfDefault = typeOfSort(options.values);
			options.values = makeArray(options.values);
		}
		opts = extend(opts, options);
		this.values = opts.values;
		
		return this; /*To support function chaining*/
	};
	
	/*Function to set values after the creation of the object*/
	this.setValues = function(values){
		typeOfDefault = typeOfSort(values);
		values = makeArray(values);
		this.values = values;
		opts.values = this.values;
		
		return this;
	};
	
	/*Function to set target after the creation of the object*/
	this.setTarget = function(target){
		this.target = target;
		opts.target = this.target;
		
		return this;
	};
	
	/*Function to get stepsHistory*/
	this.getHistory = function(algorithms){
		var retArray = [];
		var stepObject = {};
		if(typeof algorithms !== 'undefined'){
			if (algorithms instanceof Array){
				for(key in this.stepsHistory){
					for(index in algorithms){
						if(this.stepsHistory[key].hasOwnProperty(algorithms[index])){
							if(retArray[key]){	
								stepObject[algorithms[index]] = this.stepsHistory[key][algorithms[index]];
								retArray[key] = extend(retArray[key], extend({}, stepObject));
							}
							else {
								stepObject[algorithms[index]] = this.stepsHistory[key][algorithms[index]];
								retArray.push(extend({}, stepObject)); /*extend({}, stepObject) - creates a deep copy of stepObject (similar to .slice(0) for arrays)*/
							}
						}
						stepObject = {}; /*Clear stepObject to remove info from previous algorithms*/
					}
				}
			}
			else if(algorithms === 'all'){
				retArray = this.stepsHistory.slice(0);
			}
			else {
				for(key in this.stepsHistory){
					if(this.stepsHistory[key].hasOwnProperty(algorithms)){
						if(retArray[key]){
							stepObject[algorithms] = this.stepsHistory[key][algorithms];
							retArray[key] = extend(retArray[key], extend({}, stepObject));
						}
						else {
							stepObject[algorithms] = this.stepsHistory[key][algorithms];
							retArray.push(extend({}, stepObject));
						}
					}
				}
			}
		}
		else {
			retArray = this.stepsHistory.slice(0);
		}
			
		return retArray.slice(0);
	};
	
	/*Function to clear stepsHistory*/
	this.clearHistory = function(algorithms){
		if(typeof algorithms !== 'undefined'){
			if (algorithms instanceof Array){
				for(key in this.stepsHistory){
					for(index in algorithms){
						if(this.stepsHistory[key][algorithms[index]]){
							delete this.stepsHistory[key][algorithms[index]];
						}
					}
				}
			}
			else if(algorithms === 'all'){
				this.stepsHistory = [];
			}
			else {
				for(key in this.stepsHistory){
					if(this.stepsHistory[key][algorithms]){
						delete this.stepsHistory[key][algorithms];
					}
				}
			}
		}
		else {
			this.stepsHistory = [];
		}

		return this;
	};
	
	/*Stores the functions that run on every event*/
	this.listenerFunctions = {
		'onStep': {
			'linearSearch' : 'none',
			'binarySearch' : 'none',
		},
		'onComplete': {
			'linearSearch' : 'none',
			'binarySearch' : 'none',
		},
		'onFinish' : 'none'
	};
	
	/*Starts an event listener*/
	this.listen = function(algorithms, event, func){
		/*Make sure function works even if user doesn't give algorithm - if user gives only function then bind this action to all listeners (every type, every algorithm)*/
		if(algorithms === 'onFinish'){
			func = event;
			event = algorithms;
		}
		else if((algorithms === 'onStep') || (algorithms === 'onComplete')){
			func = event;
			event = algorithms;
			algorithms = 'all';
		}
		else if(algorithms instanceof Function){
			func = algorithms;
			algorithms = undefined;
			this.listenerFunctions.onFinish = func;
			changeAllListenerFunctions('onStep', func);
			changeAllListenerFunctions('onComplete', func);
		}
		
		if(typeof algorithms !== 'undefined'){
			if(event == 'onFinish'){
				this.listenerFunctions.onFinish = func;
			}
			else if(algorithms == 'all'){
				changeAllListenerFunctions(event, func);
			}
			else {
				if (algorithms instanceof Array){
					for(index in algorithms){
						setListen(algorithms[index], event, func);
					}
				}
				else {
					setListen(algorithms, event, func);
				}
			}
		}
		
		function setListen(algorithms, event, func){
			if((object.listenerFunctions.hasOwnProperty(event)) && (object.listenerFunctions[event].hasOwnProperty(algorithms))){
					object.listenerFunctions[event][algorithms] = func;
			}
			else {
				for(key in customAlgorithms){
					if(algorithms == key){
						object.listenerFunctions[event][key] = func;
					}
				}
			}
		}
		
		return this;
	};
	
	/*Stops an event listener*/
	this.stopListen = function(algorithms, event){
		/*Make sure function works even if user doesn't give algorithm - if user doesn't give parameters then stop all listeners (every type, every algorithm)*/
		if(typeof algorithms === 'undefined'){
			this.listenerFunctions.onFinish = 'none';
			initializeListenerFunctions('onStep');
			initializeListenerFunctions('onComplete');
		}
		else if(algorithms === 'onFinish'){
			event = algorithms;
		}
		else if((algorithms === 'onStep') || (algorithms === 'onComplete')){
			event = algorithms;
			algorithms = 'all';
		}
		
		if(typeof algorithms !== 'undefined'){
			if(event == 'onFinish'){
				this.listenerFunctions.onFinish = 'none';
			}
			else if(algorithms == 'all'){
				initializeListenerFunctions(event);
			}
			else {
				if (algorithms instanceof Array){
					for(index in algorithms){
						setStopListen(algorithms[index], event);
					}
				}
				else {
					setStopListen(algorithms, event);
				}
			}
		}
		
		function setStopListen(algorithms, event){
			if((object.listenerFunctions.hasOwnProperty(event)) && (object.listenerFunctions[event].hasOwnProperty(algorithms))){
				object.listenerFunctions[event][algorithms] = 'none';
			}
			else {
				for(key in customAlgorithms){
					if(algorithms == key){
						object.listenerFunctions[event][key] = 'none';
					}
				}
			}
		}
		
		return this;
	};
	
	/*Linear search*/
	this.linearSearch = function(array, target, func){
		var type = typeOfSort(array);
		startTimer('linearSearch');
		var n = 0;
		var params = checkAlgorithmParams('linearSearch', array, target, func);
		var linear_array = params[0];
		target = params[1];
		var length = linear_array.length;
		var found = false;
		for(var i = 0; i < length; ++i){
			if (linear_array[i] == target){
				var time = stopTimer('linearSearch');
				if(this.listenerFunctions.onComplete.linearSearch instanceof Function){
					triggerListener('linearSearch', 'onComplete', {'name': 'linearSearch', 'array': linear_array.slice(0), 'target': target, 'result': ['found', i], 'length': length, 'typeOfData': type, 'steps': n, 'time': time});
				}
				if(opts.keepSteps){
					saveStepsHistory(n, {'linearSearch': {'array': {'values': linear_array.slice(0), 'length': length, 'typeOfData': type}, 'action': {'type': 'completed', 'target': target, 'result': ['found', i], 'time': time, 'steps': n}}});
				}
				found = true;
				break;
			}
			else {
				var currentTime = getTime('linearSearch');
				if(this.listenerFunctions.onStep.linearSearch instanceof Function){ /*Don't activate trigger if there is no listener function to save memory*/
					var obj = {'name': 'linearSearch', 'length': length, 'typeOfData': type, 'steps': n + 1, 'time': currentTime};
					if((opts.returnArray) && length < 300){ /*Check if returnArray == true and return array only if searching array is less than 300 items long to save memory*/
						obj['array'] = linear_array.slice(0);
					}
					triggerListener('linearSearch', 'onStep', obj);
				}
				if(opts.keepSteps){
					var stepObj = {'linearSearch': {'array': {'length': length, 'typeOfData': type}, 'action': {'type': 'compare', 'elements': [i, target], 'elementsData': [linear_array[i]], 'result': 'not-found', 'time': currentTime, 'steps': n + 1}}};
					if((opts.returnArray) && length < 300){
						stepObj.linearSearch.array['values'] = linear_array.slice(0);
					}
					saveStepsHistory(n, stepObj);
					n++;
				}
			}
		}
		if(found == false){
			var time = stopTimer('linearSearch');
			if(this.listenerFunctions.onComplete.linearSearch instanceof Function){
				triggerListener('linearSearch', 'onComplete', {'name': 'linearSearch', 'array': linear_array.slice(0), 'target': target, 'result': ['not-found', 'undefined'], 'length': length, 'typeOfData': type, 'steps': n, 'time': time});
			}
			if(opts.keepSteps){
				saveStepsHistory(n, {'linearSearch': {'array': {'values': linear_array.slice(0), 'length': length, 'typeOfData': type}, 'action': {'type': 'completed', 'target': target, 'result': ['not-found', 'undefined'], 'time': time, 'steps': n}}});
			}
		}
				
		return this;
	};
	
	/*Binary search*/
	this.binarySearch = function(array, target, func){
		var type = typeOfSort(array);
		startTimer('binarySearch');
		var n = 0;
		var params = checkAlgorithmParams('binarySearch', array, target, func);
		var binary_array = params[0];
		if((type === 'number')|| (type === 'arrayOfNumbers')){
			binary_array.sort(function(a,b){return a-b});
		}
		else {
			binary_array.sort();
		}
		target = params[1];
		var length = binary_array.length;		
		var result = 'not-found';
		
		var searchResult = bSearch(binary_array, target, 0, length - 1);
		var time = stopTimer('binarySearch');
		if(searchResult > -1){
			result = ['found', searchResult];
		}
		else {
			result = ['not-found', 'undefined'];
		}
		if(this.listenerFunctions.onComplete.binarySearch instanceof Function){
			triggerListener('binarySearch', 'onComplete', {'name': 'binarySearch', 'array': binary_array.slice(0), 'target': target, 'result': result, 'length': length, 'typeOfData': type, 'steps': n, 'time': time});
		}
		if(opts.keepSteps){
			saveStepsHistory(n, {'binarySearch': {'array': {'values': binary_array.slice(0), 'length': length, 'typeOfData': type}, 'action': {'type': 'completed', 'target': target, 'result': result, 'time': time, 'steps': n}}});
		}
		
		return this;
	
		function bSearch(array, target, start, end){
			var middle = Math.floor(0.5 * (start + end));
			var currentTime = getTime('binarySearch');
			if(object.listenerFunctions.onStep.binarySearch instanceof Function){ /*Don't activate trigger if there is no listener function to save memory*/
				var obj = {'name': 'binarySearch', 'length': length, 'typeOfData': type, 'steps': n + 1, 'time': currentTime};
				if((opts.returnArray) && length < 300){ /*Check if returnArray == true and return array only if searching array is less than 300 items long to save memory*/
					obj['array'] = array.slice(0);
				}
				triggerListener('binarySearch', 'onStep', obj);
			}
			if(opts.keepSteps){
				var stepObj = {'binarySearch': {'array': {'length': length, 'typeOfData': type}, 'action': {'type': 'setBoundaries', 'elements': [start, middle, end], 'elementsData': [array[start], array[middle], array[end]], 'time': currentTime, 'steps': n + 1}}};
				if((opts.returnArray) && length < 300){
					stepObj.binarySearch.array['values'] = array.slice(0);
				}
				saveStepsHistory(n, stepObj);
				n++;
			}
			if (start > end){ //does not exist
				return -1; 
			} 

			var value = array[middle];
			if(isNumber(value) != isNumber(target)){
				value = ''+value+'';
				target = ''+target+'';
			}

			if (value > target){
				var currentTime = getTime('binarySearch');
				if(object.listenerFunctions.onStep.binarySearch instanceof Function){ /*Don't activate trigger if there is no listener function to save memory*/
					var obj = {'name': 'binarySearch', 'length': length, 'typeOfData': type, 'steps': n + 1, 'time': currentTime};
					if((opts.returnArray) && length < 300){ /*Check if returnArray == true and return array only if searching array is less than 300 items long to save memory*/
						obj['array'] = array.slice(0);
					}
					triggerListener('binarySearch', 'onStep', obj);
				}
				if(opts.keepSteps){
					var stepObj = {'binarySearch': {'array': {'length': length, 'typeOfData': type}, 'action': {'type': 'compare', 'elements': [middle, target], 'elementsData': [array[middle]], 'result': ['not-found', 'checkLeft', true], 'time': currentTime, 'steps': n + 1}}};
					if((opts.returnArray) && length < 300){
						stepObj.binarySearch.array['values'] = array.slice(0);
					}
					saveStepsHistory(n, stepObj);
					n++;
				}
				
				return bSearch(array, target, start, middle-1); 
			}
			if (value < target){
				var currentTime = getTime('binarySearch');
				if(object.listenerFunctions.onStep.binarySearch instanceof Function){ /*Don't activate trigger if there is no listener function to save memory*/
					var obj = {'name': 'binarySearch', 'length': length, 'typeOfData': type, 'steps': n + 1, 'time': currentTime};
					if((opts.returnArray) && length < 300){ /*Check if returnArray == true and return array only if searching array is less than 300 items long to save memory*/
						obj['array'] = array.slice(0);
					}
					triggerListener('binarySearch', 'onStep', obj);
				}
				if(opts.keepSteps){
					var stepObj = {'binarySearch': {'array': {'length': length, 'typeOfData': type}, 'action': {'type': 'compare', 'elements': [middle, target], 'elementsData': [array[middle]], 'result': ['not-found', 'checkRight', true], 'time': currentTime, 'steps': n + 1}}};
					if((opts.returnArray) && length < 300){
						stepObj.binarySearch.array['values'] = array.slice(0);
					}
					saveStepsHistory(n, stepObj);
					n++;
				}
				
				return bSearch(array, target, middle+1, end); 
			}
			
			return middle;
		}
	};
	
	/*Function to run many searching algorithms one after another*/
	this.runSearches = function(algorithms, array, target, func){	
		if(typeof algorithms !== 'undefined'){
			if(typeof array !== 'undefined'){
				if (!(array instanceof Array)){
					if(typeof array === 'function'){
						func = array;
						array = undefined;
						target = undefined;
					}
					else if(typeof target !== 'undefined'){
						if(typeof target === 'function'){
							func = target;
							target = undefined;
						}
					}
				}
				else if(typeof target !== 'undefined'){
					if(typeof target === 'function'){
						func = target;
						target = undefined;
					}
				}
			}
			if(typeof func !== 'undefined'){
				this.listenerFunctions.onFinish = func;
			}
		}
		else {
			algorithms = 'all';
		}
		
		startTimer('runSearches');
		
		if(algorithms === 'all'){
			this.linearSearch(array, target);
			this.binarySearch(array, target);
			for(key in customAlgorithms){
				customAlgorithms[key](array, target);
			}
		}
		else {
			if(algorithms instanceof Array){
				for(index in algorithms){
					setrunSearches(algorithms[index], array, target)
				}
			}
			else {
				setrunSearches(algorithms, array, target);
			}
		}
		
		var time = stopTimer('runSearches');
		
		if(this.listenerFunctions.onFinish instanceof Function){
			triggerListener('onFinish', {'algorithms': algorithms, 'time': time});
		}
		
		function setrunSearches(algorithms, array, target){
			if(object.hasOwnProperty(algorithms)){
				object[algorithms](array, target);
			}
			else {
				for(key in customAlgorithms){
					if(algorithms == key){
						customAlgorithms[key](array, target);
					}
				}
			}
		}
		
		return this;
	};
	
	/*Function to run multiple sorting algorithms simultaneously - for smaller sorting arrays only*/
	this.simuRun = function(algorithmsArray, array, target){
		var type = typeOfSort(array);
		array = makeArray(array);
		if(typeof target === 'undefined'){
			target = object.target;
		}
		if((type === 'number')|| (type === 'arrayOfNumbers')){
			var binaryArray = array.slice(0).sort(function(a,b){return a-b});
		}
		else {
			var binaryArray = array.slice(0).sort();
		}
		var first = algorithmsArray[0];
		var last = algorithmsArray[algorithmsArray.length - 1];
		var algoIndex = 0;
		var length = array.length;
		var linear = {
			i : 0,
			found : false,
			n : 0,
			time : 0
		}
		var binary = {
			start : 0,
			end : length - 1,
			middle : Math.floor(0.5 * (0 + length - 1)),
			i: 0,
			found : true,
			n : 0,
			time : 0,
			reRun : 0
		}
		var algorithms = {
			'linearSearch' : function(linear_array){
				startTimer('linearSearch');
				if(linear.i < length){
					if (linear_array[linear.i] == target){
						var time = stopTimer('linearSearch');
						linear.found = true;
						linear.time += time;
						removeFromExec('linearSearch', linear.n);
						return;
					}
					else {
						var currentTime = getTime('linearSearch') + linear.time;
						if(object.listenerFunctions.onStep.linearSearch instanceof Function){
							var obj = {'name': 'linearSearch', 'length': length, 'typeOfData': type, 'steps': linear.n + 1, 'time': currentTime};
							if((opts.returnArray) && length < 300){ /*Check if returnArray == true and return array only if searching array is less than 300 items long to save memory*/
								obj['array'] = linear_array.slice(0);
							}
							triggerListener('linearSearch', 'onStep', obj);
						}
						if(opts.keepSteps){
							var stepObj = {'linearSearch': {'array': {'length': length, 'typeOfData': type}, 'action': {'type': 'compare', 'elements': [linear.i, target], 'result': 'not-found', 'time': currentTime, 'steps': linear.n + 1}}};
							if((opts.returnArray) && length < 300){
								stepObj.linearSearch.array['values'] = linear_array.slice(0);
							}
							saveStepsHistory(linear.n, stepObj);
							linear.n++;
						}
					}
					linear.i++;
					var time = stopTimer('linearSearch');
					linear.time += time;
					continueExec('linearSearch');
					return;
				}
				else if(linear.found == false){
					var time = stopTimer('linearSearch');
					linear.time += time;
					removeFromExec('linearSearch', linear.n);
					return;
				}
			},
			'binarySearch' : function(binary_array){
				startTimer('binarySearch');
				var start = binary.start;
				var end = binary.end;
				var middle = binary.middle;
				var reRun = binary.reRun;
				if (start > end){ //does not exist
					var time = stopTimer('binarySearch');
					binary.found = false;
					binary.time += time;
					removeFromExec('binarySearch', binary.n);
					return;
				}
				var currentTime = getTime('binarySearch') + binary.time;				
				if(opts.keepSteps){
					var stepObj = {'binarySearch': {'array': {'length': length, 'typeOfData': type}, 'action': {'type': 'setBoundaries', 'elements': [start, middle, end], 'time': currentTime, 'steps': binary.n + 1}}};
					if((opts.returnArray) && length < 300){
						stepObj.binarySearch.array['values'] = binary_array.slice(0);
					}
					saveStepsHistory(binary.n, stepObj);
					binary.n++;
				}
				var value = binary_array[middle];
				if(isNumber(value) != isNumber(target)){
					value = ''+value+'';
					target = ''+target+'';
				}
				binary.reRun++;
				if (value > target){
					var currentTime = getTime('binarySearch') + binary.time;
					if(object.listenerFunctions.onStep.binarySearch instanceof Function){
						var obj = {'name': 'binarySearch', 'length': length, 'typeOfData': type, 'steps': binary.n + 1, 'time': currentTime};
						if((opts.returnArray) && length < 300){ /*Check if returnArray == true and return array only if searching array is less than 300 items long to save memory*/
							obj['array'] = binary_array.slice(0);
						}
						triggerListener('binarySearch', 'onStep', obj);
					}
					if(opts.keepSteps){
						var stepObj = {'binarySearch': {'array': {'length': length, 'typeOfData': type}, 'action': {'type': 'compare', 'elements': [middle, target], 'result': ['not-found', 'checkLeft', true], 'time': currentTime, 'steps': binary.n + 1}}};
						if((opts.returnArray) && length < 300){
							stepObj.binarySearch.array['values'] = binary_array.slice(0);
						}
						saveStepsHistory(binary.n, stepObj);
						binary.n++;
					}
					
					binary.start = start;
					binary.end = middle - 1;
					binary.middle = Math.floor(0.5 * (binary.start + binary.end));
					binary.i = binary.middle;
					var time = stopTimer('binarySearch');
					binary.time += time;
					continueExec('binarySearch');
				}
				if (value < target){
					var currentTime = getTime('binarySearch') + binary.time;
					if(object.listenerFunctions.onStep.binarySearch instanceof Function){
						var obj = {'name': 'binarySearch', 'length': length, 'typeOfData': type, 'steps': binary.n + 1, 'time': currentTime};
						if((opts.returnArray) && length < 300){ /*Check if returnArray == true and return array only if searching array is less than 300 items long to save memory*/
							obj['array'] = binary_array.slice(0);
						}
						triggerListener('binarySearch', 'onStep', obj);
					}
					if(opts.keepSteps){
						var stepObj = {'binarySearch': {'array': {'length': length, 'typeOfData': type}, 'action': {'type': 'compare', 'elements': [middle, target], 'result': ['not-found', 'checkRight', true], 'time': currentTime, 'steps': binary.n + 1}}};
						if((opts.returnArray) && length < 300){
							stepObj.binarySearch.array['values'] = binary_array.slice(0);
						}
						saveStepsHistory(binary.n, stepObj);
						binary.n++;
					}
					
					binary.start = middle + 1;
					binary.end = end;
					binary.middle = Math.floor(0.5 * (binary.start + binary.end));
					binary.i = binary.middle;
					var time = stopTimer('binarySearch');
					binary.time += time;
					continueExec('binarySearch');
				}
				if((reRun == 0) && (binary.found == true)){
					var time = stopTimer('binarySearch');
					binary.time += time;
					removeFromExec('binarySearch', binary.n);
					return;
				}
				else {
					return;
				}				
			}
		}
		var sortArrays = {
			'linearSearch' : array.slice(0),
			'binarySearch' : binaryArray
		}
		
		algorithms[first](sortArrays[first]);
		
		return this;
		
		/*Function to run next algorithm in list or first or the same*/
		function continueExec(algorithm){
			if(algorithmsArray.length >= algoIndex + 2){
				algoIndex++;
				algorithms[algorithmsArray[algoIndex]](sortArrays[algorithmsArray[algoIndex]]);
			}
			else {
				if(first == algorithm){
					algorithms[algorithm](sortArrays[algorithm]);
				}
				else if(last == algorithm){
					algoIndex = 0;
					algorithms[first](sortArrays[first]);
				}
			}
		}
		
		/*Function to remove algorithm from list when completed*/
		function removeFromExec(algorithm, n){
			var linearResult = ['not-found', 'undefined'];
			var binaryResult = ['not-found', 'undefined'];
			if(linear.found == true){
				linearResult = ['found', linear.i];
			}
			if(binary.found == true){
				binaryResult = ['found', binary.i];
			}
			if(opts.keepSteps){
				var finalStepArray = {
							linearSearch: {'linearSearch': {'array': {'values': sortArrays['linearSearch'].slice(0), 'length': length, 'typeOfData': type}, 'action': {'type': 'completed', 'target': target, 'result': linearResult, 'time': linear.time, 'steps': linear.n}}},
							binarySearch: {'binarySearch': {'array': {'values': sortArrays['binarySearch'].slice(0), 'length': length, 'typeOfData': type}, 'action': {'type': 'completed', 'target': target, 'result': binaryResult, 'time': binary.time, 'steps': binary.n}}}
				};
			}
			if(object.listenerFunctions.onComplete[algorithm] instanceof Function){
				var onCompleteListenerArray = {
							linearSearch: {'name': 'linearSearch', 'array': sortArrays['linearSearch'].slice(0), 'target': target, 'result': linearResult, 'length': length, 'typeOfData': type, 'steps': linear.n, 'time': linear.time},
							binarySearch: {'name': 'binarySearch', 'array': sortArrays['binarySearch'].slice(0), 'target': target, 'result': binaryResult, 'length': length, 'typeOfData': type, 'steps': binary.n, 'time': binary.time}
				};
			}
			if(algorithmsArray.length >= algoIndex + 2){
				algorithmsArray.splice(algoIndex, 1);
				first = algorithmsArray[0];
				last = algorithmsArray[algorithmsArray.length - 1];
				if(object.listenerFunctions.onComplete[algorithm] instanceof Function){
					triggerListener(algorithm, 'onComplete', onCompleteListenerArray[algorithm]);
				}
				if(opts.keepSteps){
					saveStepsHistory(n, finalStepArray[algorithm]);
				}
				algorithms[algorithmsArray[algoIndex]](sortArrays[algorithmsArray[algoIndex]]);
			}
			else {
				if(first == algorithm){
					algorithmsArray.splice(algoIndex, 1);
					first = algorithmsArray[0];
					last = algorithmsArray[algorithmsArray.length - 1];
					if(object.listenerFunctions.onComplete[algorithm] instanceof Function){
						triggerListener(algorithm, 'onComplete', onCompleteListenerArray[algorithm]);
					}
					if(algorithmsArray.length == 0){
						if(object.listenerFunctions.onFinish instanceof Function){
							triggerListener('onFinish', ['Finished!']);
						}
					}
					if(opts.keepSteps){
						saveStepsHistory(n, finalStepArray[algorithm]);
					}
					return;
					//stop
				}
				else if(last == algorithm){
					algorithmsArray.splice(algoIndex, 1);
					algoIndex = 0;
					first = algorithmsArray[0];
					last = algorithmsArray[algorithmsArray.length - 1];
					if(object.listenerFunctions.onComplete[algorithm] instanceof Function){
						triggerListener(algorithm, 'onComplete', onCompleteListenerArray[algorithm]);
					}
					if(opts.keepSteps){
						saveStepsHistory(n, finalStepArray[algorithm]);
					}
					algorithms[first](sortArrays[first]);
				}
			}
		}
	};
	
	/*Function to add new algorithms*/
	this.addNewAlgorithm = function(name, algorithm){
		var newAlg = convertToFunc(algorithm);
		customAlgorithms[name] = newAlg;
		this.listenerFunctions.onStep[name] = this.listenerFunctions.onComplete[name] = 'none'; /*Initialize listener function for new algorithm*/
		
		return this;
		
		function convertToFunc(func){ 
			return eval('('+func+')'); 
		}
	};
	
	/*Function to run custom algorithms*/
	this.runCustom = function(algorithms, array, target, func){
		/*Make sure function works even if user doesn't give array and/or func if nothing given (or if 'all' is given as algorithmsArray) then runs all custom algorithms*/
		if(typeof algorithms !== 'undefined'){
			if(typeof array !== 'undefined'){
				if(!(array instanceof Array)){
					if(typeof target !== 'undefined'){
						if(target instanceof Object){
							func = target;
							target = undefined;
						}
					}
					else if(array instanceof Object){
						func = array;
						array = undefined;
					}
				}
				else if(typeof target !== 'undefined'){
					if(target instanceof Object){
						func = target;
						target = undefined;
					}
				}
			}
		}
		else {
			algorithms = 'all';
		}
		
		
		if(algorithms === 'all'){
			for(key in customAlgorithms){
				customAlgorithms[key](array, target, func);
			}
		}
		else {
			if(algorithms instanceof Array){
				for(index in algorithms){
					setRunCustom(algorithms[index], array, target, func);
				}
			}
			else {
				setRunCustom(algorithms, array, target, func);
			}
		}
		
		function setRunCustom(algorithms, array, target, func){
			for(key in customAlgorithms){
				if(algorithms == key){
					customAlgorithms[key](array, target, func);
				}
			}
		}
		
		return this;
	};
	
	/*Function to return type of element to sort*/
	function typeOfSort(values){
		type = typeOfDefault; /*type of the default array*/ 
		if(typeof values !== 'undefined'){
			if (!(values instanceof Array)){
				if(typeof values === 'string'){
					if(values.indexOf(' ') >= 0){
						if(((typeof opts !== 'undefined') && (typeof opts.breakIntoLetters !== 'undefined') && opts.breakIntoLetters)){
							var words = '-MultiWord-SortByLetter';
						}
						else {
							var words = '-MultiWord-SortByWord';
						}
						values = values.replace(/([\s]+)/ig, ""); /*Remove spaces so that we can better find if it's mixed or numbers (numbers inside string separated with space are not recognized as numbers)*/
					}
					else {
						var words = '-OneWord';
					}
					
					if(isNumber(values)){
						type = 'stringOfNumber';
					}
					else if(hasNumbers(values)){
						type = 'stringOfMixed';
					}
					else {
						type = 'stringOfText';
					}
					type = type+words;
				}
				else if(isNumber(values)){
					type = 'number';
				}
			}
			else {
				var has = {
					strings: {texts: false, numbers: false},
					numbers: false
				};
				for(key in values){
					if(typeof values[key] === 'string'){
						if(has.numbers == true){ /*If we know already that the array has at least one number, set strings.texts & strings.numbers to true and break to gain time - when number+string(any kind) is arrayOfMixed*/
							has.strings.numbers = has.strings.texts = true;
							break;
						}
						else if(isNumber(values[key])){
							has.strings.numbers = true;
						}
						else if(hasNumbers(values[key])){
							has.strings.numbers = has.strings.texts = true;
						}
						else {
							has.strings.texts = true;
						}
					}
					else if(isNumber(values[key])){
						if((has.strings.texts == true) || (has.strings.numbers == true)){ /*If we know already that the array has at least one string, set numbers to true and break to gain time*/
							has.numbers = true;
							break;
						}
						has.numbers = true;
					}
				}
				
				if(has.numbers == true){
					type = 'arrayOfNumbers';
					if((has.strings.texts == true) || (has.strings.numbers == true)){
						type = 'arrayOfMixed';
					}
				}
				else if((has.strings.texts == true)&&(has.strings.numbers == true)){
					type = 'arrayOfStringsMixed';
				}
				else if(has.strings.texts == true){
					type = 'arrayOfStringsText';
				}
				else {
					type = 'arrayOfStringsNumbers';
				}
			}
		}
		else {
			type = typeOfDefault;
		}
		
		return type;
	}
	
	/*Function to check type of given values 
		- if string then break into array (if more than one word -separated with spaces- break into words(or letters depending object option breakIntoLetters), else always break into letters)
		- if number then convert to string and break into digits
	*/
	function makeArray(values){
		if(typeof values !== 'undefined'){
			if (!(values instanceof Array)){
				if(typeof values === 'string'){
					if(values.indexOf(' ') >= 0){
						if(((typeof opts !== 'undefined') && (typeof opts.breakIntoLetters !== 'undefined') && opts.breakIntoLetters)){
							values = values.replace(/([\s]+)/ig, "");
							values = values.split("");
						}
						else {
							values = values.replace(/([!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+)([^\s]+)/ig, '$1 $2'); //add space after special characters if there is no space 
							values = values.replace(/([^\s]+)([!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+)/ig, '$1 $2'); //add space before special characters if there is no space
							values = values.split(" ");
						}
					}
					else {
						values = values.split("");
					}
				}
				else if(isNumber(values)){
					values = ''+values+'';
					values = values.split("");
				}
			}
		}
		else {
			values = opts.values.slice(0);
		}
		
		return values;
	}
	
	/*Function to check if given value is number or string that is number*/
	function isNumber(value){
		return !isNaN(parseFloat(value)) && isFinite(value);
	}
	
	/*Function to check if given string contains at least one digit*/
	function hasNumbers(string){
		var regex = /\d/g;
		return regex.test(string);
	}
	
	/*Function to merge two arrays (extend first) - also used for deep copying objects*/
	function extend(a, b){
		for(var key in b){
			if(b.hasOwnProperty(key)){
				a[key] = b[key];
			}
		}
		return a;
	}
	
	/*Function to make sure sorting algorithm works even if user doesn't give array and/or func*/
	function checkAlgorithmParams(algorithm, array, target, func){
		if(typeof array !== 'undefined'){
			if (!(array instanceof Array)){
				if(typeof target !== 'undefined'){
					if(target instanceof Object){
						func = target;
						target = object.target;
					}
					array = makeArray(array);
				}
				else if(array instanceof Object){
					func = array;
					array = object.values.slice(0);
					target = object.target;
				}
				else if(typeof array === 'string'){
					array = makeArray(array);
					target = object.target;
				}
				else if(isNumber(array)){
					array = makeArray(array);
					target = object.target;
				}
				else {
					array = object.values.slice(0);
					target = object.target;
				}
			}
			else if(typeof target !== 'undefined'){
				if(target instanceof Object){
					func = target;
					target = object.target;
				}
			}
		}
		else {
			array = object.values.slice(0);
			target = object.target;
		}
		
		if(typeof target === 'undefined'){
			target = object.target;
		}
		
		if(typeof func !== 'undefined'){
			for(key in func){
				if((object.listenerFunctions.hasOwnProperty(key))&&(object.listenerFunctions[key].hasOwnProperty(algorithm))){
					object.listenerFunctions[key][algorithm] = func[key];
				}
				else {
					for(index in customAlgorithms){
						if(algorithm == index){
							object.listenerFunctions[key][index] = func[key];
						}
					}
				}
			}
		}
		
		return [array.slice(0), target];
	}
	
	/*Function to keep start time*/
	var timerArray = [];
	function startTimer(algorithm){
		if(!timerArray[algorithm]){
			timerArray[algorithm] = {start : new Date().getTime(), end: 0};
		}
	}
	
	/*Function to get current time running*/
	function getTime(algorithm){
		if(timerArray[algorithm]){
			var time = new Date().getTime() - timerArray[algorithm].start;
			return time;
		}
	}
	
	/*Function to get stop time, calculate run time and return it and clear kept time*/
	function stopTimer(algorithm){
		if(timerArray[algorithm]){
			timerArray[algorithm].end = new Date().getTime();
			var time = timerArray[algorithm].end - timerArray[algorithm].start;
			delete timerArray[algorithm];
			return time;
		}
	}
	
	/*Function to keep steps history*/
	function saveStepsHistory(n, stepAnalysis){
		if(opts.keepSteps){
			if(object.stepsHistory[n]){
				object.stepsHistory[n] = extend(object.stepsHistory[n], stepAnalysis);
			}
			else {
				object.stepsHistory.push(stepAnalysis);
			}
		}
	}
	
	/*Function to initialize/clear listener functions*/
	function initializeListenerFunctions(event){
		if(object.listenerFunctions.hasOwnProperty(event)){
			for(key in object.listenerFunctions[event]){
				object.listenerFunctions[event][key] = 'none';
			}
		}
	}
	
	/*Function to set all listeners*/
	function changeAllListenerFunctions(event, func){
		if(object.listenerFunctions.hasOwnProperty(event)){
			for(key in object.listenerFunctions[event]){
				object.listenerFunctions[event][key] = func;
			}
		}
	}
	
	/*Listener function - runs the users function given through listen*/
	function triggerListener(algorithm, event, ret_values){
		/*Make sure function works even if user doesn't give algorithm - ONLY FOR 'onFinish' CASE*/
		if(algorithm === 'onFinish'){
			ret_values = event;
			event = algorithm;
		}
		
		if(event === 'onFinish'){
			object.listenerFunctions.onFinish(ret_values);
		}
		else if((object.listenerFunctions.hasOwnProperty(event)) && (object.listenerFunctions[event].hasOwnProperty(algorithm))){
			object.listenerFunctions[event][algorithm](ret_values);
		}
		else {
			for(key in customAlgorithms){
				if(algorithm == key){
					object.listenerFunctions[event][key](ret_values);
				}
			}
		}
	}
	
	return this;
};