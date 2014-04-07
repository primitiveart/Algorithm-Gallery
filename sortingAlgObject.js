var sortingAlg = function(options){
	/*Variable used to define object variable for usage inside functions*/
	var object = this;
	
	/*Default options in case user doesn't give options - breakIntoLetters works only in case of string(not array)*/
	var defaults = {
		'keepSteps' : true,
		'returnArray' : true,
		'values' : [5,2,6,1,3,9,7,4,9,25,10,18,14,12,13,17,15,23],
		'ascending' : true,
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
	
	/*Function to set ascending order*/
	this.asc = function(){
		opts.ascending = true;
		
		return this;
	};
	
	/*Function to set descending order*/
	this.desc = function(){
		opts.ascending = false;
		
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
			'bubbleSort' : 'none',
			'straightSelection' : 'none',
			'straightInsertion' : 'none',
			'quickSort' : 'none'
		},
		'onComplete': {
			'bubbleSort' : 'none',
			'straightSelection' : 'none',
			'straightInsertion' : 'none',
			'quickSort' : 'none'
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
	
	/*Bubble sort*/
	this.bubbleSort = function(array, func){
		var type = typeOfSort(array);
		startTimer('bubbleSort');
		var n = 0;
		var compareResult = [];
		var bubble_array = checkAlgorithmParams('bubbleSort', array, func);
		var length = bubble_array.length;
		for(var i = length - 1; 0 < i; i--){
			for(var j = 0; j < i; j++){
				compareResult = compare(j, j + 1, bubble_array);
				bubble_array = compareResult[1];
				var currentTime = getTime('bubbleSort');
				if(this.listenerFunctions.onStep.bubbleSort instanceof Function){ /*Don't activate trigger if there is no listener function to save memory*/
					var obj = {'name': 'bubbleSort', 'length': length, 'typeOfData': type, 'order': getSortingOrder(), 'steps': n + 1, 'time': currentTime};
					if((opts.returnArray) && length < 300){ /*Check if returnArray == true and return array only if sorting array is less than 300 items long to save memory*/
						obj['array'] = bubble_array.slice(0);
					}
					triggerListener('bubbleSort', 'onStep', obj);
				}
				if(opts.keepSteps){
					var stepObj = {'bubbleSort': {'array': {'length': length, 'typeOfData': type, 'order': getSortingOrder()}, 'action': {'type': 'compare', 'elements': [j, j+1], 'elementsData': [bubble_array[j], bubble_array[j+1]], 'result': ['swap', compareResult[0]], 'time': currentTime, 'steps': n + 1}}};
					if((opts.returnArray) && length < 300){
						stepObj.bubbleSort.array['values'] = bubble_array.slice(0);
					}
					saveStepsHistory(n, stepObj);
					n++;
				}
			}
		}
		var time = stopTimer('bubbleSort');
		if(this.listenerFunctions.onComplete.bubbleSort instanceof Function){
			triggerListener('bubbleSort', 'onComplete', {'name': 'bubbleSort', 'array': bubble_array.slice(0), 'length': length, 'typeOfData': type, 'order': getSortingOrder(), 'steps': n, 'time': time});
		}
		if(opts.keepSteps){
			saveStepsHistory(n, {'bubbleSort': {'array': {'values': bubble_array.slice(0), 'length': length, 'typeOfData': type, 'order': getSortingOrder()}, 'action': {'type': 'completed', 'time': time, 'steps': n}}});
		}
		
		return this;
	};
	
	/*Straight selection*/
	this.straightSelection = function(array, func){
		var type = typeOfSort(array);
		var typeOfAction = 'newMin';
		if(opts.ascending == false){
			typeOfAction = 'newMax';
		}
		startTimer('straightSelection');
		var n = 0;
		var compareResult = [];
		var selection_array = checkAlgorithmParams('straightSelection', array, func);
		var length = selection_array.length;
		for (var i = 0; i < length - 1; i++){
			var minIndex = i;
			for (var j = i + 1; j < length; j++){
				var oldMinIndex = minIndex;
				compareResult = [false];
				if (checkByOrder(selection_array[minIndex], selection_array[j])){
					minIndex = j;
					compareResult = [true];
				}
				var currentTime = getTime('straightSelection');
				if(this.listenerFunctions.onStep.straightSelection instanceof Function){
					var obj = {'name': 'straightSelection', 'length': length, 'typeOfData': type, 'order': getSortingOrder(), 'steps': n + 1, 'time': currentTime};
					if((opts.returnArray) && length < 300){
						obj['array'] = selection_array.slice(0);
					}
					triggerListener('straightSelection', 'onStep', obj);
				}
				if(opts.keepSteps){
					var stepObj = {'straightSelection': {'array': {'length': length, 'typeOfData': type, 'order': getSortingOrder()}, 'action': {'type': 'compare', 'elements': [j, oldMinIndex], 'elementsData': [selection_array[j], selection_array[oldMinIndex]], 'result': [typeOfAction, compareResult[0]], 'time': currentTime, 'steps': n + 1}}};
					if((opts.returnArray) && length < 300){
						stepObj.straightSelection.array['values'] = selection_array.slice(0);
					}
					saveStepsHistory(n, stepObj);
					n++;
				}
			}
			if (minIndex != i){
				compareResult = compare(i, minIndex, selection_array);
				selection_array = compareResult[1];
				var currentTime = getTime('straightSelection');
				if(this.listenerFunctions.onStep.straightSelection instanceof Function){
					var obj = {'name': 'straightSelection', 'length': length, 'typeOfData': type, 'order': getSortingOrder(), 'steps': n + 1, 'time': currentTime};
					if((opts.returnArray) && length < 300){
						obj['array'] = selection_array.slice(0);
					}
					triggerListener('straightSelection', 'onStep', obj);
				}
				if(opts.keepSteps){
					var stepObj = {'straightSelection': {'array': {'length': length, 'typeOfData': type, 'order': getSortingOrder()}, 'action': {'type': 'compare', 'elements': [i, minIndex], 'elementsData': [selection_array[i], selection_array[minIndex]], 'result': ['swap', compareResult[0]], 'time': currentTime, 'steps': n + 1}}};
					if((opts.returnArray) && length < 300){
						stepObj.straightSelection.array['values'] = selection_array.slice(0);
					}
					saveStepsHistory(n, stepObj);
					n++;
				}
			}
		}
		var time = stopTimer('straightSelection');
		if(this.listenerFunctions.onComplete.straightSelection instanceof Function){
			triggerListener('straightSelection', 'onComplete', {'name': 'straightSelection', 'array': selection_array.slice(0), 'length': length, 'typeOfData': type, 'order': getSortingOrder(), 'steps': n, 'time': time});
		}
		if(opts.keepSteps){
			saveStepsHistory(n, {'straightSelection': {'array': {'values': selection_array.slice(0), 'length': length, 'typeOfData': type, 'order': getSortingOrder()}, 'action': {'type': 'completed', 'time': time, 'steps': n}}});
		}
		
		return this;
	};
	
	/*Straight insertion*/
	this.straightInsertion = function(array, func){
		var type = typeOfSort(array);
		startTimer('straightInsertion');
		var n = 0;
		var compareResult = [];
		var insertion_array = checkAlgorithmParams('straightInsertion', array, func);
		var length = insertion_array.length;                       
		for (var i = 1; i < length; i++){
			for(var j = i; 0 < j; j--){
				compareResult = compare(j - 1, j, insertion_array);
				insertion_array = compareResult[1];
				var currentTime = getTime('straightInsertion');
				if(this.listenerFunctions.onStep.straightInsertion instanceof Function){
					var obj = {'name': 'straightInsertion', 'length': length, 'typeOfData': type, 'order': getSortingOrder(), 'steps': n + 1, 'time': currentTime};
					if((opts.returnArray) && length < 300){
						obj['array'] = insertion_array.slice(0);
					}
					triggerListener('straightInsertion', 'onStep', obj);
				}
				if(opts.keepSteps){
					var stepObj = {'straightInsertion': {'array': {'length': length, 'typeOfData': type, 'order': getSortingOrder()}, 'action': {'type': 'compare', 'elements': [j-1, j], 'elementsData': [insertion_array[j-1], insertion_array[j]], 'result': ['swap', compareResult[0]], 'time': currentTime, 'steps': n + 1}}};
					if((opts.returnArray) && length < 300){
						stepObj.straightInsertion.array['values'] = insertion_array.slice(0);
					}
					saveStepsHistory(n, stepObj);
					n++;
				}
			}
		}
		var time = stopTimer('straightInsertion');
		if(this.listenerFunctions.onComplete.straightInsertion instanceof Function){
			triggerListener('straightInsertion', 'onComplete', {'name': 'straightInsertion', 'array': insertion_array.slice(0), 'length': length, 'typeOfData': type, 'order': getSortingOrder(), 'steps': n, 'time': time});
		}
		if(opts.keepSteps){
			saveStepsHistory(n, {'straightInsertion': {'array': {'values': insertion_array.slice(0), 'length': length, 'typeOfData': type, 'order': getSortingOrder()}, 'action': {'type': 'completed', 'time': time, 'steps': n}}});
		}
		
		return this;
	};
	
	/*Quick sort*/
	this.quickSort = function(array, func){
		var type = typeOfSort(array);
		startTimer('quickSort');
		var n = 0;
		var quick_array = checkAlgorithmParams('quickSort', array, func);
		var length = quick_array.length;
			
		qsort(quick_array, 0, length - 1);
		var time = stopTimer('quickSort');
		if(this.listenerFunctions.onComplete.quickSort instanceof Function){
			triggerListener('quickSort', 'onComplete', {'name': 'quickSort', 'array': quick_array.slice(0), 'length': length, 'typeOfData': type, 'order': getSortingOrder(), 'steps': n, 'time': time});
		}
		if(opts.keepSteps){
			saveStepsHistory(n, {'quickSort': {'array': {'values': quick_array.slice(0), 'length': length, 'typeOfData': type, 'order': getSortingOrder()}, 'action': {'type': 'completed', 'time': time, 'steps': n}}});
		}
		
		return this;
		
		function qsort(array, begin, end){
			if(end > begin){
				var pivot = Math.floor(0.5 * (begin + end));
				var piv = array[pivot];
				var i = begin;
				var j = end;
				while (i <= j) {
					var currentTime = getTime('quickSort');
					if(object.listenerFunctions.onStep.quickSort instanceof Function){
						var obj = {'name': 'quickSort', 'length': length, 'typeOfData': type, 'order': getSortingOrder(), 'steps': n + 1, 'time': currentTime};
						if((opts.returnArray) && length < 300){
							obj['array'] = array.slice(0);
						}
						triggerListener('quickSort', 'onStep', obj);
					}
					if(opts.keepSteps){
						var stepObj = {'quickSort': {'array': {'length': length, 'typeOfData': type, 'order': getSortingOrder()}, 'action': {'type': 'setBoundaries', 'elements': [i, pivot, j], 'elementsData': [array[i], array[pivot], array[j]], 'time': currentTime, 'steps': n + 1}}};
						if((opts.returnArray) && length < 300){
							stepObj.quickSort.array['values'] = array.slice(0);
						}
						saveStepsHistory(n, stepObj);
						n++;
					}
					while (checkByOrder(piv, array[i])){	
						var currentTime = getTime('quickSort');
						if(object.listenerFunctions.onStep.quickSort instanceof Function){
							var obj = {'name': 'quickSort', 'length': length, 'typeOfData': type, 'order': getSortingOrder(), 'steps': n + 1, 'time': currentTime};
							if((opts.returnArray) && length < 300){
								obj['array'] = array.slice(0);
							}
							triggerListener('quickSort', 'onStep', obj);
						}
						if(opts.keepSteps){
							var stepObj = {'quickSort': {'array': {'length': length, 'typeOfData': type, 'order': getSortingOrder()}, 'action': {'type': 'compare', 'elements': [i, pivot], 'elementsData': [array[i], array[pivot]], 'result': ['moveRight', true], 'time': currentTime, 'steps': n + 1}}};
							if((opts.returnArray) && length < 300){
								stepObj.quickSort.array['values'] = array.slice(0);
							}
							saveStepsHistory(n, stepObj);
							n++;
						}
						i++;
					}
					while (checkByOrder(array[j], piv)){
						var currentTime = getTime('quickSort');
						if(object.listenerFunctions.onStep.quickSort instanceof Function){
							var obj = {'name': 'quickSort', 'length': length, 'typeOfData': type, 'order': getSortingOrder(), 'steps': n + 1, 'time': currentTime};
							if((opts.returnArray) && length < 300){
								obj['array'] = array.slice(0);
							}
							triggerListener('quickSort', 'onStep', obj);
						}
						if(opts.keepSteps){
							var stepObj = {'quickSort': {'array': {'length': length, 'typeOfData': type, 'order': getSortingOrder()}, 'action': {'type': 'compare', 'elements': [j, pivot], 'elementsData': [array[j], array[pivot]], 'result': ['moveLeft', true], 'time': currentTime, 'steps': n + 1}}};
							if((opts.returnArray) && length < 300){
								stepObj.quickSort.array['values'] = array.slice(0);
							}
							saveStepsHistory(n, stepObj);
							n++;
						}
						j--;
					}
					if (i <= j){
						array = swap(i, j, array);
						var currentTime = getTime('quickSort');
						if(object.listenerFunctions.onStep.quickSort instanceof Function){
							var obj = {'name': 'quickSort', 'length': length, 'typeOfData': type, 'order': getSortingOrder(), 'steps': n + 1, 'time': currentTime};
							if((opts.returnArray) && length < 300){
								obj['array'] = array.slice(0);
							}
							triggerListener('quickSort', 'onStep', obj);
						}
						if(opts.keepSteps){
							var stepObj = {'quickSort': {'array': {'length': length, 'typeOfData': type, 'order': getSortingOrder()}, 'action': {'type': 'compare', 'elements': [j, i], 'elementsData': [array[j], array[i]], 'result': ['swap', true], 'time': currentTime, 'steps': n + 1}}};
							if((opts.returnArray) && length < 300){
								stepObj.quickSort.array['values'] = array.slice(0);
							}
							saveStepsHistory(n, stepObj);
							n++;
						}
						i++;
						j--;
					}
				}
				if (begin < i - 1){
					qsort(array, begin, i - 1);
				}
				if (i < end){
					qsort(array, i, end);
				}			
			}
		}
	};
	
	/*Function to run many sorting algorithms one after another*/
	this.runSorts = function(algorithms, array, func){	
		if(typeof algorithms !== 'undefined'){
			if(typeof array !== 'undefined'){
				if (!(array instanceof Array)){
					if(typeof array === 'function'){
						if(typeof func === 'undefined'){
							func = array;
						}
						array = undefined;
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
		
		startTimer('runSorts');
		
		if(algorithms === 'all'){
			this.bubbleSort(array);
			this.straightSelection(array);
			this.straightInsertion(array);
			this.quickSort(array);
			for(key in customAlgorithms){
				customAlgorithms[key](array);
			}
		}
		else {
			if(algorithms instanceof Array){
				for(index in algorithms){
					setRunSorts(algorithms[index], array)
				}
			}
			else {
				setRunSorts(algorithms, array);
			}
		}
		
		var time = stopTimer('runSorts');
		
		if(this.listenerFunctions.onFinish instanceof Function){
			triggerListener('onFinish', {'algorithms': algorithms, 'time': time});
		}
		
		function setRunSorts(algorithms, array){
			if(object.hasOwnProperty(algorithms)){
				object[algorithms](array);
			}
			else {
				for(key in customAlgorithms){
					if(algorithms == key){
						customAlgorithms[key](array);
					}
				}
			}
		}
		
		return this;
	};
	
	/*Function to run multiple sorting algorithms simultaneously - for smaller sorting arrays only*/
	this.simuRun = function(algorithmsArray, array){
		var type = typeOfSort(array);
		array = makeArray(array);
		var first = algorithmsArray[0];
		var last = algorithmsArray[algorithmsArray.length - 1];
		var algoIndex = 0;
		var length = array.length;
		var compareResult = [];
		var bubble = {
			i : length - 1,
			j : 0,
			n : 0,
			time : 0
		}
		var selection = {
			i : 0,
			j : 1,
			typeOfAction : 'newMin',
			oldMinIndex : 0,
			minIndex : 0,
			n : 0, 
			time : 0
		}
		if(opts.ascending == false){
			selection.typeOfAction = 'newMax';
		}
		var insertion = {
			i : 1,
			j : 1,
			n : 0,
			time : 0
		}
		var quick = {
			begin : 0,
			end : length - 1,
			i : 0,
			j : length - 1,
			iN : 0,
			jN : length - 1,
			pivot : Math.floor(0.5 * (0 + length - 1)),
			piv : array[Math.floor(0.5 * (0 + length - 1))],
			reRun : 0,
			stepAp : 0,
			n : 0,
			time : 0
		}
		var algorithms = {
			'bubbleSort' : function(bubble_array){
				startTimer('bubbleSort');
				if(0 < bubble.i){
					if(bubble.j < bubble.i){
						compareResult = compare(bubble.j, bubble.j + 1, bubble_array);
						sortArrays['bubbleSort'] = compareResult[1];
						var currentTime = getTime('bubbleSort') + bubble.time;
						if(object.listenerFunctions.onStep.bubbleSort instanceof Function){
							var obj = {'name': 'bubbleSort', 'length': length, 'typeOfData': type, 'order': getSortingOrder(), 'steps': bubble.n + 1, 'time': currentTime};
							if((opts.returnArray) && length < 300){
								obj['array'] = sortArrays['bubbleSort'].slice(0);
							}
							triggerListener('bubbleSort', 'onStep', obj);
						}
						if(opts.keepSteps){
							var stepObj = {'bubbleSort': {'array': {'length': length, 'typeOfData': type, 'order': getSortingOrder()}, 'action': {'type': 'compare', 'elements': [bubble.j, bubble.j+1], 'result': ['swap', compareResult[0]], 'time': currentTime, 'steps': bubble.n + 1}}};
							if((opts.returnArray) && length < 300){
								stepObj.bubbleSort.array['values'] = sortArrays['bubbleSort'].slice(0);
							}
							saveStepsHistory(bubble.n, stepObj);
							bubble.n++;
						}
						bubble.j++;
						var time = stopTimer('bubbleSort');
						bubble.time += time;
						continueExec('bubbleSort');
						return;
					}
					bubble.i--;
					bubble.j = 0;
					var time = stopTimer('bubbleSort');
					bubble.time += time;
					algorithms['bubbleSort'](sortArrays['bubbleSort']);
					return;
				}
				else {
					var time = stopTimer('bubbleSort');
					bubble.time += time;
					removeFromExec('bubbleSort', bubble.n);
					return;
				}
			},
			'straightSelection' : function(selection_array){
				startTimer('straightSelection');
				if(selection.i < length - 1){
					if(selection.j < length){
						compareResult = [false];
						selection.oldMinIndex = selection.minIndex;
						if(checkByOrder(selection_array[selection.minIndex], selection_array[selection.j])){
							selection.minIndex = selection.j;
							compareResult = [true];
						}
						var currentTime = getTime('straightSelection') + selection.time;
						if(object.listenerFunctions.onStep.straightSelection instanceof Function){
							var obj = {'name': 'straightSelection', 'length': length, 'typeOfData': type, 'order': getSortingOrder(), 'steps': selection.n + 1, 'time': currentTime};
							if((opts.returnArray) && length < 300){
								obj['array'] = selection_array.slice(0);
							}
							triggerListener('straightSelection', 'onStep', obj);
						}
						if(opts.keepSteps){
							var stepObj = {'straightSelection': {'array': {'length': length, 'typeOfData': type, 'order': getSortingOrder()}, 'action': {'type': 'compare', 'elements': [selection.j, selection.oldMinIndex], 'result': [selection.typeOfAction, compareResult[0]], 'time': currentTime, 'steps': selection.n + 1}}};
							if((opts.returnArray) && length < 300){
								stepObj.straightSelection.array['values'] = selection_array.slice(0);
							}
							saveStepsHistory(selection.n, stepObj);
							selection.n++;
						}
						selection.j++;	
						var time = stopTimer('straightSelection');
						selection.time += time;
						continueExec('straightSelection');
						return;
					}
					if (selection.minIndex != selection.i){
						compareResult = compare(selection.i, selection.minIndex, selection_array);
						sortArrays['straightSelection'] = compareResult[1];
						var currentTime = getTime('straightSelection') + selection.time;
						if(object.listenerFunctions.onStep.straightSelection instanceof Function){
							var obj = {'name': 'straightSelection', 'length': length, 'typeOfData': type, 'order': getSortingOrder(), 'steps': selection.n + 1, 'time': currentTime};
							if((opts.returnArray) && length < 300){
								obj['array'] = sortArrays['straightSelection'].slice(0);
							}
							triggerListener('straightSelection', 'onStep', obj);
						}
						if(opts.keepSteps){
							var stepObj =  {'straightSelection': {'array': {'length': length, 'typeOfData': type, 'order': getSortingOrder()}, 'action': {'type': 'compare', 'elements': [selection.i, selection.minIndex], 'result': ['swap', compareResult[0]], 'time': currentTime, 'steps': selection.n + 1}}};
							if((opts.returnArray) && length < 300){
								stepObj.straightSelection.array['values'] = sortArrays['straightSelection'].slice(0);
							}
							saveStepsHistory(selection.n, stepObj);
							selection.n++;
						}
					}
					selection.i++;
					selection.minIndex = selection.i;
					selection.j = selection.i + 1;
					var time = stopTimer('straightSelection');
					selection.time += time;
					algorithms['straightSelection'](sortArrays['straightSelection']);
					return;
				}
				else {
					var time = stopTimer('straightSelection');
					selection.time += time;
					removeFromExec('straightSelection', selection.n);
					return;
				}
			},
			'straightInsertion' : function(insertion_array){
				startTimer('straightInsertion');
				if(insertion.i < length){
					if(0 < insertion.j){
						compareResult = compare(insertion.j - 1, insertion.j, insertion_array);
						sortArrays['straightInsertion'] = compareResult[1];
						var currentTime = getTime('straightInsertion') + insertion.time;
						if(object.listenerFunctions.onStep.straightInsertion instanceof Function){
							var obj = {'name': 'straightInsertion', 'length': length, 'typeOfData': type, 'order': getSortingOrder(), 'steps': insertion.n + 1, 'time': currentTime};
							if((opts.returnArray) && length < 300){
								obj['array'] = sortArrays['straightInsertion'].slice(0);
							}
							triggerListener('straightInsertion', 'onStep', obj);
						}
						if(opts.keepSteps){
							var stepObj = {'straightInsertion': {'array': {'length': length, 'typeOfData': type, 'order': getSortingOrder()}, 'action': {'type': 'compare', 'elements': [insertion.j-1, insertion.j], 'result': ['swap', compareResult[0]], 'time': currentTime, 'steps': insertion.n + 1}}};
							if((opts.returnArray) && length < 300){
								stepObj.straightInsertion.array['values'] = sortArrays['straightInsertion'].slice(0);
							}
							saveStepsHistory(insertion.n, stepObj);
							insertion.n++;
						}
						insertion.j--;
						var time = stopTimer('straightInsertion');
						insertion.time += time;
						continueExec('straightInsertion');
						return;
					}
					insertion.i++;
					insertion.j = insertion.i;
					var time = stopTimer('straightInsertion');
					insertion.time += time;
					algorithms['straightInsertion'](sortArrays['straightInsertion']);
					return;
				}
				else {
					var time = stopTimer('straightInsertion');
					insertion.time += time;
					removeFromExec('straightInsertion', insertion.n);
					return;
				}
			},
			'quickSort' : function(quick_array){
				startTimer('quickSort');
				var begin = quick.begin;
				var end = quick.end;
				var i = quick.i;
				var iN = quick.iN;
				var j = quick.j;
				var jN = quick.jN;
				var pivot = quick.pivot;
				var piv = quick.piv;
				var reRun = quick.reRun;
				if(end > begin){
					if(i <= j){
						if(quick.stepAp == 0){
							if(opts.keepSteps){
								var currentTime = getTime('quickSort') + quick.time;
								var stepObj = {'quickSort': {'array': {'length': length, 'typeOfData': type, 'order': getSortingOrder()}, 'action': {'type': 'setBoundaries', 'elements': [i, pivot, j], 'time': currentTime, 'steps': quick.n + 1}}};
								if((opts.returnArray) && length < 300){
									stepObj.quickSort.array['values'] = sortArrays['quickSort'].slice(0);
								}
								saveStepsHistory(quick.n, stepObj);
								quick.n++;
							}
							quick.stepAp = 1;
						}
						if(checkByOrder(piv, quick_array[iN])){
							var currentTime = getTime('quickSort') + quick.time;
							if(object.listenerFunctions.onStep.quickSort instanceof Function){
								var obj = {'name': 'quickSort', 'length': length, 'typeOfData': type, 'order': getSortingOrder(), 'steps': quick.n + 1, 'time': currentTime};
								if((opts.returnArray) && length < 300){
									obj['array'] = sortArrays['quickSort'].slice(0);
								}
								triggerListener('quickSort', 'onStep', obj);
							}
							if(opts.keepSteps){
								var stepObj = {'quickSort': {'array': {'length': length, 'typeOfData': type, 'order': getSortingOrder()}, 'action': {'type': 'compare', 'elements': [iN, pivot], 'result': ['moveRight', true], 'time': currentTime, 'steps': quick.n + 1}}};
								if((opts.returnArray) && length < 300){
									stepObj.quickSort.array['values'] = sortArrays['quickSort'].slice(0);
								}
								saveStepsHistory(quick.n, stepObj);
								quick.n++;
							}
							iN++;
							quick.iN = iN;
							var time = stopTimer('quickSort');
							quick.time += time;
							continueExec('quickSort');
							return;
						}
						if(checkByOrder(quick_array[jN], piv)){
							var currentTime = getTime('quickSort') + quick.time;
							if(object.listenerFunctions.onStep.quickSort instanceof Function){
								var obj = {'name': 'quickSort', 'length': length, 'typeOfData': type, 'order': getSortingOrder(), 'steps': quick.n + 1, 'time': currentTime};
								if((opts.returnArray) && length < 300){
									obj['array'] = sortArrays['quickSort'].slice(0);
								}
								triggerListener('quickSort', 'onStep', obj);
							}
							if(opts.keepSteps){
								var stepObj = {'quickSort': {'array': {'length': length, 'typeOfData': type, 'order': getSortingOrder()}, 'action': {'type': 'compare', 'elements': [jN, pivot], 'result': ['moveLeft', true], 'time': currentTime, 'steps': quick.n + 1}}};
								if((opts.returnArray) && length < 300){
									stepObj.quickSort.array['values'] = sortArrays['quickSort'].slice(0);
								}
								saveStepsHistory(quick.n, stepObj);
								quick.n++;
							}
							jN--;
							quick.jN = jN;
							var time = stopTimer('quickSort');
							quick.time += time;
							continueExec('quickSort');
							return;
						}
						i = iN;
						quick.i = i;
						j = jN;
						quick.j = j;
						if (i <= j) {
							sortArrays['quickSort'] = swap(i, j, quick_array);
							var currentTime = getTime('quickSort') + quick.time;
							if(object.listenerFunctions.onStep.quickSort instanceof Function){
								var obj = {'name': 'quickSort', 'length': length, 'typeOfData': type, 'order': getSortingOrder(), 'steps': quick.n + 1, 'time': currentTime};
								if((opts.returnArray) && length < 300){
									obj['array'] = sortArrays['quickSort'].slice(0);
								}
								triggerListener('quickSort', 'onStep', obj);
							}
							if(opts.keepSteps){
								var stepObj = {'quickSort': {'array': {'length': length, 'typeOfData': type, 'order': getSortingOrder()}, 'action': {'type': 'compare', 'elements': [j, i], 'result': ['swap', true], 'time': currentTime, 'steps': quick.n + 1}}};
								if((opts.returnArray) && length < 300){
									stepObj.quickSort.array['values'] = sortArrays['quickSort'].slice(0);
								}
								saveStepsHistory(quick.n, stepObj);
								quick.n++;
							}
							i++;
							quick.i = i;
							iN = i;
							quick.iN = iN;
							j--;
							quick.j = j;
							jN = j;
							quick.jN = jN;
						}
						quick.stepAp = 0;
						var time = stopTimer('quickSort');
						quick.time += time;
						continueExec('quickSort');
						return;
					}
					quick.reRun++;
					if (begin < i - 1){
						quick.begin = begin;
						quick.end = i - 1;
						quick.i = quick.begin;
						quick.iN = quick.i;
						quick.j = quick.end;
						quick.jN = quick.j;
						quick.pivot = Math.floor(0.5 * (quick.begin + quick.end));
						quick.piv = quick_array[quick.pivot];
						var time = stopTimer('quickSort');
						quick.time += time;
						algorithms['quickSort'](sortArrays['quickSort']);
					}
					if (i < end){
						quick.begin = i;
						quick.end = end;
						quick.i = quick.begin;
						quick.iN = quick.i;
						quick.j = quick.end;
						quick.jN = quick.j;
						quick.pivot = Math.floor(0.5 * (quick.begin + quick.end));
						quick.piv = quick_array[quick.pivot];
						var time = stopTimer('quickSort');
						quick.time += time;
						algorithms['quickSort'](sortArrays['quickSort']);
					}
					if(reRun == 0){
						var time = stopTimer('quickSort');
						quick.time += time;
						removeFromExec('quickSort', quick.n);
						return;
					}
					else{
						return;
					}
				}				
			}
		}
		var sortArrays = {
			'bubbleSort' : array.slice(0),
			'straightSelection' : array.slice(0),
			'straightInsertion' : array.slice(0),
			'quickSort' : array.slice(0)
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
			if(opts.keepSteps){
				var finalStepArray = {
							bubbleSort: {'bubbleSort': {'array': {'values': sortArrays['bubbleSort'].slice(0), 'length': length, 'typeOfData': type, 'order': getSortingOrder()}, 'action': {'type': 'completed', 'time': bubble.time, 'steps': bubble.n}}},
							straightSelection: {'straightSelection': {'array': {'values': sortArrays['straightSelection'].slice(0), 'length': length, 'typeOfData': type, 'order': getSortingOrder()}, 'action': {'type': 'completed', 'time': selection.time, 'steps': selection.n}}},
							straightInsertion: {'straightInsertion': {'array': {'values': sortArrays['straightInsertion'].slice(0), 'length': length, 'typeOfData': type, 'order': getSortingOrder()}, 'action': {'type': 'completed', 'time': insertion.time, 'steps': insertion.n}}},
							quickSort: {'quickSort': {'array': {'values': sortArrays['quickSort'].slice(0), 'length': length, 'typeOfData': type, 'order': getSortingOrder()}, 'action': {'type': 'completed', 'time': quick.time, 'steps': quick.n}}}
				};
			}
			if(object.listenerFunctions.onComplete[algorithm] instanceof Function){
				var onCompleteListenerArray = {
							bubbleSort: {'name': 'bubbleSort', 'array': sortArrays['bubbleSort'].slice(0), 'length': length, 'typeOfData': type, 'order': getSortingOrder(), 'steps': bubble.n, 'time': bubble.time},
							straightSelection: {'name': 'straightSelection', 'array': sortArrays['straightSelection'].slice(0), 'length': length, 'typeOfData': type, 'order': getSortingOrder(), 'steps': selection.n, 'time': selection.time},
							straightInsertion: {'name': 'straightInsertion', 'array': sortArrays['straightInsertion'].slice(0), 'length': length, 'typeOfData': type, 'order': getSortingOrder(), 'steps': insertion.n, 'time': insertion.time},
							quickSort: {'name': 'quickSort', 'array': sortArrays['quickSort'].slice(0), 'length': length, 'typeOfData': type, 'order': getSortingOrder(), 'steps': quick.n, 'time': quick.time}
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
	this.runCustom = function(algorithms, array, func){
		/*Make sure function works even if user doesn't give array and/or func if nothing given (or if 'all' is given as algorithmsArray) then runs all custom algorithms*/
		if(typeof algorithms !== 'undefined'){
			if(typeof array !== 'undefined'){
				if(!(array instanceof Array)){
					if(array instanceof Object){
						if(typeof func === 'undefined'){
							func = array;
						}
						array = undefined;
					}
				}
			}
		}
		else {
			algorithms = 'all';
		}
		
		
		if(algorithms === 'all'){
			for(key in customAlgorithms){
				customAlgorithms[key](array, func);
			}
		}
		else {
			if(algorithms instanceof Array){
				for(index in algorithms){
					setRunCustom(algorithms[index], array, func);
				}
			}
			else {
				setRunCustom(algorithms, array, func);
			}
		}
		
		function setRunCustom(algorithms, array, func){
			for(key in customAlgorithms){
				if(algorithms == key){
					customAlgorithms[key](array, func);
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
	function hasNumbers(string)
	{
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
	
	/*Function to compare two numbers and replace if necessary returns new array and true if swapped/false if not*/
	function compare(first, second, compare_array){
		var swap = false;
		if(checkByOrder(compare_array[first], compare_array[second])){
			var temp = compare_array[first];
			compare_array[first] = compare_array[second];
			compare_array[second] = temp;
			swap = true;
		}
		return [swap, compare_array];
	}
	
	/*Function to swap two numbers*/
	function swap(first, second, swap_array){
		var temp = swap_array[first];
		swap_array[first] = swap_array[second];
		swap_array[second] = temp;
		
		return swap_array;
	}
	
	/*Function to compare depending sorting order - asc/desc*/
	function checkByOrder(first, second){
		if(isNumber(first) != isNumber(second)){
				first = ''+first+'';
				second = ''+second+'';
		}
		if(opts.ascending){
			return first > second;
		}
		else {
			return first < second;
		}
	}
	
	function getSortingOrder(){
		if(opts.ascending){
			return 'ascending';
		}
		else {
			return 'descending';
		}
	}
	
	/*Function to make sure sorting algorithm works even if user doesn't give array and/or func*/
	function checkAlgorithmParams(algorithm, array, func){
		if(typeof array !== 'undefined'){
			if (!(array instanceof Array)){
				if(typeof func !== 'undefined'){
					array = makeArray(array);
				}
				else if(array instanceof Object){
					func = array;
					array = object.values.slice(0);
				}
				else if(typeof array === 'string'){
					array = makeArray(array);
				}
				else if(isNumber(array)){
					array = makeArray(array);
				}
				else {
					array = object.values.slice(0);
				}
			}
		}
		else {
			array = object.values.slice(0);
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
		
		return array.slice(0);
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