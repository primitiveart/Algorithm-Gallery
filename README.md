#Algorithm Gallery
#

Algorithm Gallery is a web application designed and developed by me as part of my thesis. The goal was the development of a useful, interactive and fully functional algorithm (sorting and searching) visualization tool. 

**Technologies: HTML5, CSS3, JavaScript, jQuery, jQueryUI, PHP, MySQL**

URL: [http://thesis.primitiveart.gr](http://thesis.primitiveart.gr)

Behance URL: [https://www.behance.net/gallery/30583457/Algorithm-Gallery](https://www.behance.net/gallery/30583457/Algorithm-Gallery)

Video: [https://youtu.be/pljkONThpwI](https://youtu.be/pljkONThpwI)

- - - -

##General features of Algorithm Gallery##
* Execution of basic sorting and searching algorithms 
	* Ability to execute multiple algorithms
	* A wide range of execution settings such as
		* Use of recommended data as input
		* Use of random data as input (user can specify the number of data or set it to random)
		* Use of user given data as input (array, string, number or a combination)
		* Selection of sorting order 
* Visualization of every supported algorithm
     * Visualization speed 

		User can set the visualization speed before or during the visualization

	* Visualization controls (Play, Stop, Pause, Step-by-Step)
	* Responsiveness 

		Visualization resizes to fit display 

	* Multiple algorithm visualization simultaneously
	* Progress bar
	* Description of every step
	* Preview of basic statistics on complete (time and number of steps)

* Saving statistics on every algorithm execution
* Information for every supported algorithm (description and javascript code)
* Statistics 
	* General
		* Average execution time 
		* Average number of steps
		* Times of execution for each algorithm
	* Algorithm specific
		* Average execution time 
		* Average number of steps
		* Times of execution for each algorithm
		* Average execution time vs number of data
		* Average number of steps vs number of data

- - - -

##functions.js##
This is where all the UI magic happens. Algorithm Gallery is developed as a single-page application and as such is heavily based on javascript. 
- - - -
##graphlug.js##
A jQuery object that handles algorithm visualization and can work independently as long as the data input meets some certain criteria.

###graphlug.js features###
* Ability to initialize the object with or without passing options 
* Ability to set options after the initialization 
* Visualization controls (Play, Stop, Pause)
* Ability to set the visualization speed or run visualization Step-by-Step
* Progress bar 
* Visualization resizes to fit display 
* Ability to use letters as import data (converts letters to ascii)
* Listeners

	Returns an object containing the type of action and the element/s eg. {type:'swap', elements: [5, 6]}

* Function chaining 

###graphlug.css###
The style sheet that contains the styling rules for the algorithms visualization.

- - - -
##searchingAlgObject.js and sortingAlgObject.js##
Javascript objects that handle searching and sorting algorithms execution and can work independently.

###searchingAlgObject.js and sortingAlgObject.js features###
* Ability to initialize the object with or without passing options 
* Ability to set options after the initialization  
* Very forgiving on how the user calls different methods (user can skip properties)
* Supports different type of data as input
	* Array of strings or nums or mixed
	* String 

		One word (no space)

		* Converts to an array with every character being a different array element

		Multiple words 

		* Converts to an array with every word being a different array element 

			**OR**

		* Converts to an array with every character being a different array element

     * Num
		* Converts to an array with every digit being a different array element 

* Supports basic searching and sorting algorithms
* Benchmark data for each algorithm (execution time and number of steps)
* Ability to keep history for each algorithm execution 

	History can keep multiple information for each step (as an object) such as

	* Algorithm name
	* Length of the input array
	* Type of the input data
	* Executed action (compare, swap etc.)
	* The processed elements 
	* The complete input array 
	* The result of the executed action 
	* Execution time of the step
	* Index of the step

* Ability to execute multiple algorithms 
* Ability to set the sorting order (ascending or descending)
* Listeners 
	* onStep (every time a step is completed)
	* onComplete (every time the execution of an algorithm is completed)
	* onFinish (when every algorithm execution is completed)
* Function chaining

###searchingAlgObject.js and sortingAlgObject.js experimental features (very early stage) ###

* Emulating simultaneous execution of multiple algorithms

	The execution order looks like this

	    1st step of 1st algorithm, 1st step of 2nd algorithm, 1st step of 3rd algorithm

	    2nd step of 1st algorithm, 2nd step of 2nd algorithm, 2nd step of 3rd algorithm 

	    …..

* Support for custom algorithms 
	* User can import custom algorithms using  the “addNewAlgorithm()” method
	* User can execute custom algorithms using the “runCustom()” method with full support of every  searchingAlgObject.js and sortingAlgObject.js features

- - - -

##functions.php##
The PHP code that handles the connection and communication with the database by using the mysqli extension and prepared statements. 
Algorithm Gallery saves benchmark data and statistics for every algorithm execution in order for the user to be able to extract valuable results about each algorithm's efficiency. 

###functions.php features ###
* User registration, login and sessions
* Saving benchmark data and statistics to the database 
* Loading statistics from the database 
* Support of statistics filtering
* Statistics processing 

###ajax.php###
The server side code that handles AJAX calls. 
	
###base\_ajax\_call()###
The client side function that handles AJAX calls. 

* User can set a unique ID for every AJAX call
* User can abort AJAX calls based on their unique ID 






