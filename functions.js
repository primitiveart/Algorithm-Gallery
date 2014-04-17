/*Variable used to determine type of resolution (0-normal, 1-height lower than 800px, 2-mobile device)*/
var windowSize = 0; 
var recentHash = '';
var subpageHash = '';
var subpageAlgo = '';
var subpageStats = '';
var runEffect = '';
/*Variable used to determine images version to force cache reload*/
var version = '0.0c';
jQuery.resize.delay = 1;
/*Recommended data*/
var recommended = [374, 342, 439, 259, 372, 187, 208, 259, 273, 179, 57, 354, 126, 404, 449, 340, 246, 218, 239, 454, 143, 322, 43, 22, 63, 33, 165, 80, 421, 147, 413, 104, 191, 26, 76, 16, 370, 55, 13, 169, 144, 355, 194, 130, 16, 310, 262, 316, 307, 49, 129, 284, 241, 335, 292, 352, 384, 212, 409, 373, 460, 214, 12, 408, 58, 177, 205, 89, 101, 290, 57, 433, 454, 254, 43, 79, 365, 159, 244, 452, 393, 280, 55, 427];
var recommendedTarget = 310;

/*Function to handle ajax*/
function base_ajax_call(doasync, ajaxdata, afunc, ajaxIDval) {
	var ajaxID = typeof ajaxIDval !== 'undefined' ? ajaxIDval : 'xhr';
	window[''+ajaxID+''] = $.ajax({
							type: 'POST',
							url:'ajax.php', 
							cache: false,
							async: doasync,
							data: ajaxdata,
							success : function (data){
								var obj = jQuery.parseJSON(data);				
								afunc(obj);
							}
						});
}

/*Function to abort ajax calls*/
function abortAjax(variables){
	if($.isArray(variables)){
		$.each(variables, function(index, value) {
			if(window[''+value+'']){
				window[''+value+''].abort();
			}
		});
	}
	else {
		if(window[''+variables+'']){
			window[''+variables+''].abort();
		}
	}
}

/*Functions that run as soon as javascript is ready to run*/
$(document).ready(function(){
	loadingStart($('#container'), 'indexLoader', '');
	initializeStateFromURL();
	if($(window).height() < 800){
		windowSize = 1;
	}
});

/*Functions that run as soon as full dom is loaded*/
$(window).load(function(){
	loadingComplete('indexLoader');
	$('#logo_big').show('drop', 500);
	$('#entry_menu').delay(150).show('drop', 500);
	
	/*Determine type of resolution on window resize*/
	$(window).resize(function(){
		if($(window).height() < 800){
			windowSize = 1;
			clearCss($('.circle_button'));
		}
		else {
			windowSize = 0;
			clearCss($('.circle_button'));
		}
	});

	$('#container').off('mouseenter mouseleave', '.algo_menu_button');
	$('#container').on('mouseenter mouseleave', '.algo_menu_button', function(e){
		if(e.type === 'mouseenter'){
			manageButtonsEffects($(this).children('.circle_button.big'),'in');
		}
		else if(e.type === 'mouseleave'){
			manageButtonsEffects($(this).children('.circle_button.big'),'out');
		}
	});
	
	$('#container').off('click', '#login_register_button');
	$('#container').on('click', '#login_register_button', function(){
		loginForm();
	});
	
	$('#container').off('click', '#logout_button');
	$('#container').on('click', '#logout_button', function(){
		editForm();
	});
	
	$('body').off('click', '#login_tip');
	$('body').on('click', '#login_tip', function(){
		registerForm();
	});
	
	$('#container').off('click', '#searching_alg_button');
	$('#container').on('click', '#searching_alg_button', function(){
		window.location.hash = '#!/searching-algorithms';
	});
	
	$('#container').off('click', '#searching_alg_tip');
	$('#container').on('click', '#searching_alg_tip', function(){
		window.location.hash = '#!/sorting-algorithms';
	});
	
	$('#container').off('click', '#sorting_alg_button');
	$('#container').on('click', '#sorting_alg_button', function(){
		window.location.hash = '#!/sorting-algorithms';
	});
	
	$('#container').off('click', '#sorting_alg_tip');
	$('#container').on('click', '#sorting_alg_tip', function(){
		window.location.hash = '#!/searching-algorithms';
	});	
	
	$('#container').off('mouseenter mouseleave', '.circle_button.big');
	$('#container').on('mouseenter mouseleave', '.circle_button.big', function(e){
		if(e.type === 'mouseenter'){
			manageButtonsEffects($(this),'in');
		}
		else if(e.type === 'mouseleave'){
			manageButtonsEffects($(this),'out');
		}
	});
	
	$('#container').off('click', '#logo_small');
	$('#container').on('click', '#logo_small', function(){
		window.location.hash = '';
	});
});

/*Functions for dynamic urls*/
function initializeStateFromURL(){
	setInterval(pollHash, 100);
}

function pollHash(){
  
    if (window.location.hash == recentHash){
       /*No change on url*/
	   return;
    }
    recentHash = window.location.hash;
  
    /*URL has changed, update the UI accordingly*/
	/*Get hash value*/
    var initialPage = window.location.hash;
	var page = '';
	var url = '';
	if(initialPage != ''){
		var hashArray = initialPage.split('#!/'); 
		/*Get hash value without hashtag*/
		var subPage = hashArray[1]; 
		/*Split in subpage and parameters*/
		var subPageArray = subPage.split('/');
		/*Get subpage*/
		page = subPageArray[0];
		/*Get parameters*/
		url = subPage.replace(page+'/','');
	}
	switch(page){
		case 'searching-algorithms':
			goToSearchingAlgs(url);
			goToSortingAlgs('init');
			goToHome(url);		
			updateTitle(subPage);
			break;
		case 'sorting-algorithms':
			goToSortingAlgs(url);
			goToSearchingAlgs('init');
			goToHome(url);		
			updateTitle(subPage);
			break;
		default:
			goToSearchingAlgs('init');
			goToSortingAlgs('init');
			goToHome('init');
			updateTitle('');
	}	
}

/*Open searching algorithms page*/
function goToSearchingAlgs(url){
	if(url === 'init'){
		if($('#searching_home_content')[0]){
			exitAlgPage('searching');
		}
	}
	else {
		if(!$('#searching_home_content')[0]){
			enterAlgPage();		
		}
		else {
			if(url.indexOf('run') > -1){
				enterSite('search', 'run');
			}
			else if(url.indexOf('gallery') > -1){
				enterSite('search', 'gallery');
			}
			else if(url.indexOf('stats') > -1){
				enterSite('search', 'stats');
			}
			else {
				$('#container').animate({
					top : '0px'
				},550);
				
				var top = $(window).height();
				
				$('#content_container').animate({
					top : top+'px'
				},550, function(){
					$('#content_container').remove();
					$('body').css('overflow','auto');
					$('#go_back').remove();
				});
			}
		}
	}
}

/*Open sorting algorithms page*/
function goToSortingAlgs(url){
	if(url === 'init'){
		if($('#sorting_home_content')[0]){
			exitAlgPage('sorting');
		}
	}
	else {
		if(!$('#sorting_home_content')[0]){
			enterAlgPage();
		}
		else {
			if(url.indexOf('run') > -1){
				enterSite('sort', 'run');
			}
			else if(url.indexOf('gallery') > -1){
				enterSite('sort', 'gallery');
			}
			else if(url.indexOf('stats') > -1){
				enterSite('sort', 'stats');
			}
			else {
				$('#container').animate({
					top : '0px'
				},550);
					
				var top = $(window).height();
				
				$('#content_container').animate({
					top : top+'px'
				},550, function(){
					$('#content_container').remove();
					$('body').css('overflow','auto');
					$('#go_back').remove();
				});
			}
		}
	}
}

/*Function to manage and show algorithm page*/
function enterAlgPage(){
	var url = window.location.hash;
	var params = url.split('#!/');
	var sub = params[1].split('-');
	var id = sub[0];
	var type = sub[0].split('ing')[0];
	runEffect = function(){
		$('#logo_small').show('clip', 500);
		$('#alg_title').show('drop', 500);
		$('#'+id+'_entry_menu').delay(150).show('drop', 500);
		$('#'+id+'_alg_tip').delay(250).show('bounce',500, function(){
			if(url.indexOf('run') > -1){
				enterSite(type, 'run');
			}
			else if(url.indexOf('gallery') > -1){
				enterSite(type, 'gallery');
			}
			else if(url.indexOf('stats') > -1){
				enterSite(type, 'stats');
			}
		});
	};
	$('#container').append('<div id="logo_small">'+
			'<img src="img/logo_small.png">'+
		'</div>'+
		'<div id="'+id+'_home_content">'+
			'<div id="alg_title">'+
				'<p>Αλγόριθμοι</p>'+
			'</div>'+
			'<div id="'+id+'_entry_menu">'+
				'<div class="algo_menu">'+
					'<div id="'+id+'_stat_button" class="algo_menu_button">'+
						'<div class="button_label">'+
							'<p>στατιστικά</p>'+
							'<p>εκτελέσεων</p>'+
						'</div>'+
						'<div class="circle_button big">'+
							'<img src="img/stats.png?'+version+'"/>'+
						'</div>'+
					'</div>'+
					'<div id="'+id+'_view_button" class="algo_menu_button">'+
						'<div class="button_label">'+
							'<p>προβολή</p>'+
							'<p>αλγορίθμων</p>'+
						'</div>'+
						'<div class="circle_button big">'+
							'<img src="img/sorting.png?'+version+'"/>'+
						'</div>'+
					'</div>'+
					'<div id="'+id+'_run_button" class="algo_menu_button">'+
						'<div class="button_label">'+
							'<p>εκτέλεση</p>'+
							'<p>αλγορίθμων</p>'+
						'</div>'+
						'<div class="circle_button big">'+
							'<img src="img/run.png?'+version+'"/>'+
						'</div>'+
					'</div>'+
				'</div>'+
			'</div>'+
		'</div>'+
		'<div id="'+id+'_alg_tip" class="alg_tip">'+
			'<p>Μήπως ψάχνεις τους</p>'+
			'<div class="alg_tip_content">'+
				'<p>αλγόριθμους</p>'+
			'</div>'+
		'</div>');
		
	if(url.indexOf('searching') > -1){
		$('#'+id+'_home_content > #alg_title').append('<p>αναζήτησης</p>');
		$('#'+id+'_alg_tip > .alg_tip_content').append('<p>ταξινόμησης;</p>');
	}
		
	if(url.indexOf('sorting') > -1){		
		$('#'+id+'_home_content > #alg_title').append('<p>ταξινόμησης</p>');
		$('#'+id+'_alg_tip > .alg_tip_content').append('<p>αναζήτησης;</p>');
	}
	
	/*Algorithms page menu*/
	$('#'+id+'_home_content').off('click', '#'+id+'_run_button');
	$('#'+id+'_home_content').on('click', '#'+id+'_run_button', function(){
		window.location.hash = '#!/'+id+'-algorithms/run';
	});
	
	$('#'+id+'_home_content').off('click', '#'+id+'_view_button');
	$('#'+id+'_home_content').on('click', '#'+id+'_view_button', function(){
		window.location.hash = '#!/'+id+'-algorithms/gallery';
	});
	
	$('#'+id+'_home_content').off('click', '#'+id+'_stat_button');
	$('#'+id+'_home_content').on('click', '#'+id+'_stat_button', function(){
		window.location.hash = '#!/'+id+'-algorithms/stats';
	});
}

/*Function to manage algorithm page closing*/
function exitAlgPage(id){
	if($('#content_container')[0]){
		$('#container').stop(true, true).animate({
			top : '0px'
		},550);
	
		var top = $(window).height();
	
		$('#content_container').animate({
			top : top+'px'
		},550, function(){
			$('#content_container').remove();
			$('body').css('overflow','auto');
			$('#go_back').remove();
			$('#logo_small').hide('clip', 500);
			$('#'+id+'_alg_tip').hide('clip',500);
			$('#'+id+'_entry_menu').hide('drop', 500);
			$('#alg_title').delay(150).hide('drop', 500, function(){
				$('#'+id+'_home_content').remove();
				$('#logo_small').remove();
				$('#'+id+'_alg_tip').remove();
				runEffect();
				runEffect = '';
			});
		});
	}
	else {
		$('#logo_small').hide('clip', 500);
		$('#'+id+'_alg_tip').hide('clip',500);
		$('#'+id+'_entry_menu').hide('drop', 500);
		$('#alg_title').delay(150).hide('drop', 500, function(){
			$('#'+id+'_home_content').remove();
			$('#logo_small').remove();
			$('#'+id+'_alg_tip').remove();
			runEffect();
			runEffect = '';
		});
	}
}

/*Function to manage */
function enterSite(type, parameter){
	if(!$('#content_container')[0]){
		var top = $(window).height();
		$('body').css('overflow','hidden');
		$('#container').after('<div id="content_container" style="top:'+top+';">'+
			'<div id="header">'+
				'<div id="header_menu">'+
					'<img src="img/logo_small_dark.png" id="logo_header">'+
					'<img class="menu_arrow" src="img/next_menu_arrow.png?'+version+'">'+
					'<div id="header_menu_algorithms">'+
						'<ul id="header_menu_algorithms_list" class="header_menu_list">'+
							'<li id="header_search">'+
								'<p>Αλγόριθοι</p>'+
								'<p>αναζήτησης</p>'+
							'</li>'+
							'<li class="hidden" id="header_sort">'+
								'<p>Αλγόριθοι</p>'+
								'<p>ταξινόμησης</p>'+
							'</li>'+
						'</ul>'+
					'</div>'+
					'<img class="menu_arrow" src="img/next_menu_arrow.png?'+version+'">'+
					'<div id="header_menu_algorithms">'+
						'<ul id="header_menu_functions_list" class="header_menu_list">'+
							'<li id="header_run">'+
								'<p>εκτέλεση</p>'+
								'<p>αλγορίθμων</p>'+
							'</li>'+
							'<li class="hidden" id="header_gallery">'+
								'<p>προβολή</p>'+
								'<p>αλγορίθμων</p>'+
							'</li>'+
							'<li class="hidden" id="header_stats">'+
								'<p>στατιστικά</p>'+
								'<p>εκτελέσεων</p>'+
							'</li>'+
						'</ul>'+
					'</div>'+
				'</div>'+
			'</div>'+
			'<div id="content_container_wrapper">'+
				'<div id="containers">'+
					'<div id="run_container" class="content_container_wrapper_container"></div>'+
					'<div id="gallery_container" class="content_container_wrapper_container">'+
						'<div id="gallery_content" class="styled_content">'+
							'<div id="gallery_menu">'+
							'</div>'+
						'</div>'+
					'</div>'+
					'<div id="stats_container" class="content_container_wrapper_container">'+
						'<div id="stats_content" class="styled_content stats_styled">'+
							'<div id="stats_menu">'+
							'</div>'+
						'</div>'+
					'</div>'+
				'</div>'+
			'</div>'+
		'</div>');
		
		/*Show the right header menu state*/
		$('#header_menu_algorithms_list').prepend($('#header_'+type));
		$('#header_menu_algorithms_list > li').addClass('hidden');
		$('#header_'+type).removeClass('hidden');
		
		$('#header_menu_functions_list').prepend($('#header_'+parameter));
		$('#header_menu_functions_list > li').addClass('hidden');
		$('#header_'+parameter).removeClass('hidden');
		
		runAlgorithms(type);
		loadAlgorithms(type);
		statsAlgorithms(type);
		
		var topContainer = - $(window).height();

		$('#container').stop(true, true).animate({
			top : '100px'
		},350, function(){
			$('#container').stop(true, true).animate({
				top : topContainer+'px'
			},550);
			
			$('#content_container').animate({
				top : '10px',
				height : 'toggle'
			},550, function(){
				moveToContent(parameter, true);
			});
		});
		
		$('#content_container').before('<div id="go_back"></div>');
		
		/*Page menu functions*/
		$('body').off('mouseenter mouseleave', '#go_back');
		$('body').on('mouseenter mouseleave', '#go_back', function(e){
			if(e.type === 'mouseenter'){
				$(this).css('height','30px');
				$('#content_container').stop().animate({
					top : '30px'
				},200);
			}
			else if(e.type === 'mouseleave'){
				$(this).css('height','10px');
				$('#content_container').stop().animate({
					top : '10px'
				},200);
			}
		});
		
		$('body').off('click', '#go_back');
		$('body').on('click', '#go_back', function(){
			$('body').off('mouseleave', '#go_back');
			var hash = window.location.hash.split('/');
			window.location.hash = '#!/'+hash[1];
		});
		
		$('#content_container').off('click', '#logo_header');
		$('#content_container').on('click', '#logo_header', function(){
			window.location.hash = '';
		});
		
		$('#content_container').off('click', '#header_menu_algorithms_list > li');
		$('#content_container').on('click', '#header_menu_algorithms_list > li', function(){
			if($(this).hasClass('hidden')){
				var hash = window.location.hash.split('/');
				var liClass = $(this).attr('id').split('_');
				window.location.hash = '#!/'+liClass[1]+'ing-algorithms/'+hash[2];
			}
		});
		
		$('#content_container').off('click', '#header_menu_functions_list > li');
		$('#content_container').on('click', '#header_menu_functions_list > li', function(){
			if($(this).hasClass('hidden')){
				var hash = window.location.hash.split('/');
				var liClass = $(this).attr('id').split('_');
				window.location.hash = '#!/'+hash[1]+'/'+liClass[1];
			}
		});
		
		$('#content_container').off('click', '.gallery_menu_item_algorithm');
		$('#content_container').on('click', '.gallery_menu_item_algorithm', function(){
			var $element = $(this).parent();
			var hash = window.location.hash.split('/');
			var algorithm = $(this).parent().attr('id').split('_')[0];
			if(hash.length === 3){
				window.location.hash = window.location.hash+'/'+algorithm+'/analysis';
			}
			else {
				window.location.hash = hash[0]+'/'+hash[1]+'/'+hash[2]+'/'+algorithm+'/analysis';
			}
			
			//$(this).siblings().removeClass('selected');
			//$(this).siblings().first().addClass('selected');
			
			/*$(this).parent().animate({ //quick
				height: '153px',
				opacity: '1'
			},350, function(){
				$element.removeClass('inactive');
			});
			
			$('.gallery_menu_items').not($(this).parent()).animate({
				height: '70px',
				opacity: '.5'
			},350, function(){
				$('.gallery_menu_items').not($element).addClass('inactive');
			});*/
			
			loadAlgorithmsAnalysis();
		});
		
		$('#content_container').off('click', '.gallery_menu_items > li');
		$('#content_container').on('click', '.gallery_menu_items > li', function(){
			var submenu = $(this).attr('class').split(' ')[0].split('_')[3];
			var hash = window.location.hash.split('/');
			if(typeof hash[3] === 'undefined'){
				hash[3] = $(this).parent().attr('id').split('_')[0];
			}
			if(submenu !== 'algorithm'){
				window.location.hash = hash[0]+'/'+hash[1]+'/'+hash[2]+'/'+hash[3]+'/'+submenu;
				$(this).siblings().removeClass('selected');
				$(this).addClass('selected');
			}
			
			loadAlgorithmsAnalysis();
		});
		
		$('#content_container').off('click', '.stats_menu_item_algorithm');
		$('#content_container').on('click', '.stats_menu_item_algorithm', function(){
			var $element = $(this).parent();
			var hash = window.location.hash.split('/');
			var algorithm = $(this).parent().attr('id').split('_')[0];
			if(hash.length === 3){
				window.location.hash = window.location.hash+'/'+algorithm;
			}
			else {
				window.location.hash = hash[0]+'/'+hash[1]+'/'+hash[2]+'/'+algorithm;
			}
			
			$(this).siblings().removeClass('selected');
			$(this).siblings().first().addClass('selected');
			
			$element.removeClass('inactive');

			$('.stats_menu_items').not($element).addClass('inactive');
			
			loadStatsAnalysis();
		});
	}
	else {
		$('#header_menu_functions_list').prepend($('#header_'+parameter));
		$('#header_menu_functions_list > li').addClass('hidden');
		$('#header_'+parameter).removeClass('hidden');
		moveToContent(parameter, true);
	}
}

/*Function to manage content subpages effects*/
function moveToContent(parameter, effect){
	var hash = window.location.hash.split('/');	
	var position = '0%';
	if(parameter === 'gallery'){
		position = '-100%';
		if((hash[2] === subpageHash) || (subpageHash === '')){
			loadAlgorithmsAnalysis(); 
		}
		else if((hash.length > 3) && (hash[3] !== subpageAlgo)){
			loadAlgorithmsAnalysis();
		}
		
		if(hash.length > 3){
			subpageAlgo = hash[3];
		}
		else {
			subpageAlgo = '';
		}	
	}
	else if(parameter === 'stats'){
		position = '-200%';
		if((hash[2] === subpageHash) || (subpageHash === '')){
			loadStatsAnalysis();
		}
		else if((hash.length > 3) && (hash[3] !== subpageStats)){
			loadStatsAnalysis();
		}
		
		if(hash.length > 3){
			subpageStats = hash[3];
		}
		else {
			subpageStats = '';
		}	
	}
	
	if(effect === true){
		$('#containers').animate({
			marginLeft : position
		},550);
	}
	else {
		$('#containers').css('margin-left',position);
	}
	
	subpageHash = hash[2];
}

/*Variable to keep run options*/
var runOptions = {
	data : '',
	random : {
		count : '',
		randomCount : false
	},
	custom : {
		values : '',
		breakIntoLetters : false,
	},
	maxHeight : '',
	maxWidth : '',
	speed : 200, 
	numOfSteps : '',
	array : '',
	element : '', 
	runStep : false,
	searching : {
		target : ''
	},
	sorting : {
		ascending : true
	}
}

/*Function to manage run subpage*/
function runAlgorithms(type){
	/*Initialization of run options*/
	runOptions = {
		data : '',
		random : {
			count : '',
			randomCount : false
		},
		custom : {
			values : '',
			breakIntoLetters : false,
		},
		maxNum : '',
		maxHeight : '',
		maxWidth : '',
		speed : 200, 
		numOfSteps : '',
		array : '',
		element : '', 
		runStep : false,
		searching : {
			target : ''
		},
		sorting : {
			ascending : true
		}
	}
	/*Variable to keep maximum allowed numbers*/
	var maxNum = maxLengthOfVis(1);
	if(type === 'search'){
		$('#run_container').append('<div id="run_content" class="styled_content">'+
			'<div id="run_content_container" class="_1 column">'+
				'<div id="run_searching_algs" class="_1 run_alg_container">'+
					'<h2>Επέλεξε αλγόριθμο:</h2>'+
					'<div id="linear_btn" class="standard_btns multi_select">Σειριακή αναζήτηση</div>'+
					'<div id="binary_btn" class="standard_btns multi_select">Δυαδική αναζήτηση</div>'+
				'</div>'+
				'<div id="run_searching_data" class="_1 run_alg_container">'+
					'<h2>Όρισε τα δεδομένα:</h2>'+
					'<div id="recommended_btn" class="standard_btns single_select">Προτεινόμενα</div>'+
					'<div id="random_btn" class="standard_btns single_select">Τυχαία επιλογή</div>'+
					'<div id="custom_btn" class="standard_btns single_select">Προσαρμοσμένα</div>'+
				'</div>'+
				'<div id="run_searching_settings" class="_1 run_alg_container">'+
					'<h2>Επιλογές εκτέλεσης:</h2>'+
					'<div id="step_btn" class="standard_btns toggle_select">Βηματική εκτέλεση'+
						'<div class="toggle_control">'+
							'<div class="toggle_circle">'+
								'<p class="off">x</p>'+
							'</div>'+
						'</div>'+
					'</div>'+
					'<div id="speed_btn" class="standard_btns slider_select">Ταχύτητα'+
						'<div id="slider"></div>'+
					'</div>'+
				'</div>'+
			'</div>'+
		'</div>');
	}
	else if(type === 'sort'){
		$('#run_container').append('<div id="run_content" class="styled_content sorting_content">'+
			'<div id="run_content_container" class="_1 column">'+
				'<div id="run_sorting_algs" class="_1 run_alg_container">'+
					'<h2>Επέλεξε αλγόριθμο:</h2>'+
					'<div id="bubble_btn" class="standard_btns multi_select">Ταξινόμηση φυσαλίδας</div>'+
					'<div id="insertion_btn" class="standard_btns multi_select">Απευθείας εισαγωγή</div>'+
					'<div id="selection_btn" class="standard_btns multi_select">Απευθείας επιλογή</div>'+
					'<div id="quick_btn" class="standard_btns multi_select">Γρήγορη αναζήτηση</div>'+
				'</div>'+
				'<div id="run_sorting_data" class="_1 run_alg_container">'+
					'<h2>Όρισε τα δεδομένα:</h2>'+
					'<div id="recommended_btn" class="standard_btns single_select">Προτεινόμενα</div>'+
					'<div id="random_btn" class="standard_btns single_select">Τυχαία επιλογή</div>'+
					'<div id="custom_btn" class="standard_btns single_select">Προσαρμοσμένα</div>'+
				'</div>'+
				'<div id="run_sorting_settings" class="_1 run_alg_container">'+
					'<h2>Επιλογές εκτέλεσης:</h2>'+
					'<div id="step_btn" class="standard_btns toggle_select">Βηματική εκτέλεση'+
						'<div class="toggle_control">'+
							'<div class="toggle_circle">'+
								'<p class="off">x</p>'+
							'</div>'+
						'</div>'+
					'</div>'+
					'<div id="speed_btn" class="standard_btns slider_select">Ταχύτητα'+
						'<div id="slider"></div>'+
					'</div>'+
				'</div>'+
			'</div>'+
		'</div>');
	}
	
	$("#slider").slider({ animate: "fast", value: 400,  max: 600 });
	
	$('#content_container').off('click', '.multi_select');
	$('#content_container').on('click', '.multi_select', function(){
		if(!$(this).hasClass('pressed')){
			$(this).append('<div class="checked_img"></div>');
			$(this).children('.checked_img').animate({
				width : 'toggle'
			},100);
			$(this).addClass('pressed');
		}
		else {
			$(this).children('.checked_img').animate({
				width : 'toggle'
			},100, function(){
				$(this).remove();
			});
			$(this).removeClass('pressed');
		}
		
		var count = $('.multi_select.pressed').length;
		if(count <= 0){
			count = 1;
		}
		maxNum = maxLengthOfVis(count);
		checkSettings(type);
	});
	
	$('#content_container').off('click', '.single_select');
	$('#content_container').on('click', '.single_select', function(){
		if(!$(this).hasClass('pressed')){
			$(this).append('<div class="checked_img"></div>');
			$(this).children('.checked_img').animate({
				width : 'toggle'
			},100);
			$(this).addClass('pressed');
			$(this).siblings('.standard_btns').slideUp('fast');
			if($(this).attr('id') === 'random_btn'){
				$(this).after('<div class="more_settings">'+
					'<input id="random_count" class="random_count_field run_field styled" type="text" placeholder="Πλήθος δεδομένων">'+
					'<div id="random_num_btn" class="standard_btns toggle_select">Τυχαίο πλήθος'+
						'<div class="toggle_control">'+
							'<div class="toggle_circle" style="margin-left: 2px;">'+
								'<p class="off" style="margin-left: 5px;">x</p>'+
							'</div>'+
						'</div>'+
					'</div>'+
				'</div>');
				
				$('.more_settings').slideDown('fast', function() {
					showBubble($('#random_count'), false, 'Το μέγιστο όριο έχει υπολογιστεί σε '+maxNum+' στοιχεία', 'auto', 'side left', false, '');
					$('#random_count').focus();
				});
				
				runOptions.data = 'random';
			}
			else if($(this).attr('id') === 'custom_btn'){
				$(this).after('<div class="more_settings">'+
					'<div id="input_controls">'+
						'<input class="array_elem_field _1 run_field styled" type="text" placeholder="*">'+
					'</div>'+
				'</div>');
				
				if(type === 'search'){
					$('#input_controls').append('<input class="search_elem_field run_field styled" type="text" placeholder="Στοιχείο προς αναζήτηση">');
				}
				else if(type === 'sort'){
					$('#input_controls').append('<div id="descending_btn" class="standard_btns toggle_select">Φθίνουσα σειρά'+
						'<div class="toggle_control">'+
							'<div class="toggle_circle" style="margin-left: 2px;">'+
								'<p class="off" style="margin-left: 5px;">x</p>'+
							'</div>'+
						'</div>'+
					'</div>');
				}
				
				$('.more_settings').slideDown('fast', function(){
					showBubble($('.array_elem_field'), false, 'Δώσε ένα στοιχείο, πάτησε ENTER αν θέλεις να δώσεις και άλλο ή SPACE αν θέλεις να εισάγεις μεγάλο κείμενο', 'auto', 'side left', false, '');
					$('.array_elem_field._1').focus();
				});
				
				runOptions.data = 'custom';
			}
			else {
				runOptions.data = 'recommended';
				checkSettings(type);
			}
		}
		else {
			$(this).children('.checked_img').animate({
				width : 'toggle'
			},100, function(){
				$(this).remove();
			});
			$(this).removeClass('pressed');
			$(this).siblings('.standard_btns').slideDown('fast');
			
			if($(this).attr('id') === 'random_btn'){
				$('.more_settings').slideUp('fast', function(){
					$(this).remove();
				});
			}
			else if($(this).attr('id') === 'custom_btn'){
				$('.more_settings').slideUp('fast', function(){
					$(this).remove();
				});
			}
			checkSettings(type);
		}
	});
	
	$('#content_container').off('click', '.toggle_select');
	$('#content_container').on('click', '.toggle_select', function(){
		if(!$(this).hasClass('pressed')){
			$(this).find('.toggle_circle').animate({
				marginLeft : '28px'
			},100);
			$(this).find('.off').removeClass('off').addClass('on').css('marginLeft','6px').html('o');
			$(this).addClass('pressed');
			
			if($(this).attr('id') === 'random_num_btn'){
				$('#random_count').slideUp('fast');
				runOptions.random.randomCount = true;
				checkSettings(type);
			}
			else if($(this).attr('id') === 'per_char_btn'){
				runOptions.custom.breakIntoLetters = true;
			} 
			else if($(this).attr('id') === 'step_btn'){
				runOptions.runStep = true;
			}
			else if($(this).attr('id') === 'descending_btn'){
				runOptions.sorting.ascending = false;
			} 
		}
		else {
			$(this).find('.toggle_circle').animate({
				marginLeft : '2px'
			},100);
			$(this).find('.on').removeClass('on').addClass('off').css('marginLeft','5px').html('x');
			$(this).removeClass('pressed');
			
			if($(this).attr('id') === 'random_num_btn'){
				$('#random_count').slideDown('fast');
				runOptions.random.randomCount = false;
				checkSettings(type);
			}
			else if($(this).attr('id') === 'per_char_btn'){
				runOptions.custom.breakIntoLetters = false;
			}
			else if($(this).attr('id') === 'step_btn'){
				runOptions.runStep = false;
			} 	
			else if($(this).attr('id') === 'descending_btn'){
				runOptions.sorting.ascending = true;
			} 			
		}
	});
	
	$('#content_container').off('keyup', '.array_elem_field');
	$('#content_container').on('keyup', '.array_elem_field', function(e){
		var count = parseInt($(this).attr('class').match(/_[0-9]+/g)[0].split('_')[1]);
		var num = count + 1;
		if(e.keyCode == 13){
			if(num <= maxNum){
				if(!$('.array_elem_field._'+num+'')[0] && ($(this).val() !== '')){
					$(this).after('<input class="array_elem_field _'+num+' run_field styled" type="text" placeholder="*">');
					$('.array_elem_field._'+num+'').focus();
					if($('#per_char_btn')[0]){
						$('#per_char_btn').remove();
						showBubble($('.array_elem_field'), false, 'Αλλαγή δεδομένων σε μορφή λίστας', 'auto', 'side left', false, '');
					}
				}
			}
			else {
				showBubble($('.array_elem_field'), false, 'Μέγιστο επιτρεπτό πλήθος: '+maxNum+'', 'auto', 'side left', false, '');
			}
			if($('textarea.array_elem_field._1')[0]){
				var input = $('<input class="array_elem_field _1 run_field styled" type="text" placeholder="*"></textarea>');
				input.val($(this).val());
				$(this).replaceWith(input);
			}
		}
		else if(e.keyCode == 32){
			var textarea = $('<textarea class="array_elem_field _1 run_field styled" placeholder="*"></textarea>');
			if($(this).siblings('.array_elem_field').length === 0){
				textarea.val($(this).val());
				if(!$('#per_char_btn')[0]){
					showBubble($('.array_elem_field'), false, 'Αλλαγή δεδομένων σε μορφή αλφαριθμητικού', 'auto', 'side left', false, '');
					$(this).after('<div id="per_char_btn" class="standard_btns toggle_select">Ανά χαρακτήρα'+
						'<div class="toggle_control">'+
							'<div class="toggle_circle" style="margin-left: 2px;">'+
								'<p class="off" style="margin-left: 5px;">x</p>'+
							'</div>'+
						'</div>'+
					'</div>');
				}
				$(this).replaceWith(textarea);
				textarea.focus();
				$(textarea).autosize({append: "\n"}); 
			}
		}
		else if($('.array_elem_field._'+num+'')[0]){
			if($(this).val() === ''){
				$(this).nextAll('.array_elem_field').remove();
			}
		}
		checkSettings(type);
	});
	
	$('#content_container').off('focus', '.array_elem_field');
	$('#content_container').on('focus', '.array_elem_field', function(){
		moveCaretToEnd(this);
		window.setTimeout(function() {
            moveCaretToEnd(this);
        }, 1);
	});
	
	$('#content_container').off('keyup', '.search_elem_field');
	$('#content_container').on('keyup', '.search_elem_field', function(e){
		if($(this).val() !== ''){
			$(this).addClass('filled');
			runOptions.searching.target = $(this).val();
		}
		else {
			$(this).removeClass('filled');
			runOptions.searching.target = '';
		}
		checkSettings(type);
	});
	
	$('#content_container').off('keyup', '#random_count');
	$('#content_container').on('keyup', '#random_count', function(e){
		/*Accept only numbers*/
		var pressed = String.fromCharCode(e.keyCode);
		var num = pressed.match(/[0-9]/gi);
		var let = pressed.match(/[a-z]|[A-Z]/gi);
		if(!num && (let || (e.keyCode === 32))){
			var value = $(this).val();
			var finalNum = value.substring(0, value.length - 1);
			$(this).val(finalNum);
		}
		var theValue = parseInt($(this).val());
		if(theValue > maxNum){
			$(this).val(maxNum);
			showBubble($('#random_count'), false, 'Μέγιστο επιτρεπτό πλήθος: '+maxNum+'', 'auto', 'side left', false, '');
		}
		
		runOptions.random.count = parseInt($(this).val());
		
		checkSettings(type);
	});
	
	$( "#slider" ).slider({
		change: function( event, ui ) {
			var speed = 600 - ui.value;
			runOptions.speed = parseInt(speed);
		}
	});
}

/*Function to check maximum width of visualization*/
function visualizationWidth(numOfAlgs){
	var count = numOfAlgs;
	var width = 0;
	if(numOfAlgs > 0){
		if(numOfAlgs > 1){
			var count = 2;
		}
		var width = ($(window).width() / count) - 30;
	}
	
	return width;
}

function visualizationHeight(numOfAlgs){
	var count = numOfAlgs;
	var height = 0;
	var windowHeight = $(window).height();
	var heightMargins = 177;
	var elementHeight = windowHeight - heightMargins;
	if(numOfAlgs > 0){
		var count = Math.round(numOfAlgs / 2);
		var height = (elementHeight / count) - 65; 
	}
	
	return height;
}

function maxLengthOfVis(numOfAlgs){
	var width = visualizationWidth(numOfAlgs);
	var height = visualizationHeight(numOfAlgs);
	var max = parseInt(width / 2);
	
	runOptions.maxNum = max;
	runOptions.maxWidth = parseInt(width);
	runOptions.maxHeight = parseInt(height);
	
	return max;
}

/*Variable to keep certain id*/
var moreThanOne = 0;
/*Function to check run settings and change if needed*/
function checkSettings(type){
	var ok = {
		'algorithms' : false,
		'data' : false
	};
	
	var count = $('.multi_select.pressed').length;
	if(count <= 0){
		count = 1;
	}
	var maxNum = maxLengthOfVis(count);
	
	if($('.multi_select.pressed').length >= 1){
		ok.algorithms = true;
	}
	else {
		ok.algorithms = false;
		showBubble($('.multi_select').eq(0), false, 'Θα πρέπει να επιλέξεις έναν αλγόριθμο', 'auto', 'side left', false, '');
	}
	
	if($('.single_select.pressed')){
		if($('.single_select.pressed').attr('id') === 'recommended_btn'){
			ok.data = true;
		}
		else if($('.single_select.pressed').attr('id') === 'random_btn'){
			if($('#random_num_btn').hasClass('pressed')){
				ok.data = true;
			}
			else {
				if($('#random_count').val() !== ''){
					ok.data = true;
					if(parseInt($('#random_count').val()) > maxNum){
						$('#random_count').val(maxNum);
						showBubble($('#random_count'), false, 'Μέγιστο επιτρεπτό πλήθος: '+maxNum+'', 'auto', 'side left', false, '');
					}
					if(parseInt($('#random_count').val()) === 1){
						moreThanOne = showBubble($('#random_count'), false, 'Δώσε πλήθος μεγαλύτερο του 1', 'auto', 'side left', false, '');
						ok.data = false;
					}
				}
				else {
					if($('#'+moreThanOne+'')){
						$('#'+moreThanOne+'').remove();
					}
					showBubble($('#random_count'), false, 'Θα πρέπει να δώσεις πλήθος ή να επιλέξεις το "Τυχαίο πλήθος"', 'auto', 'side left', false, '');
					ok.data = false;
				}
			}
		}
		else if($('.single_select.pressed').attr('id') === 'custom_btn'){
			var length = $('.array_elem_field').length;
			if(length > 1){
				if(length > maxNum){
					for(var i=maxNum+1;i<=length;i++){
						$('.array_elem_field._'+i+'').remove();
					}					
				}
				ok.data = true;
			}
			else {
				ok.data = true;
				if($('.array_elem_field').val() === ''){
					ok.data = false;
					showBubble($('.array_elem_field'), false, 'Θα πρέπει να δώσεις δεδομένα', 'auto', 'side left', false, '');
				}
			}
			
			if(type === 'search'){
				if($('.search_elem_field').val() === ''){
					ok.data = false;
					showBubble($('.search_elem_field'), false, 'Θα πρέπει να δώσεις κάτι για να γίνει αναζήτηση', 'auto', 'side left', false, '');
				}
			}
		}
	}
	else {
		ok.data = false;
	}
	
	if(ok.algorithms && ok.data){
		if(!$('#start')[0]){
			startAlgorithms(type);
		}
	}
	else {
		if($('#start')){
			$('#start').remove();
			clearCss($('#run_content_container'));
		}
	}
	
}

/*Function to show and manage start button*/
function startAlgorithms(type){
	$('#run_content_container').css('margin-bottom','0px');
	$('.run_alg_container').last().after('<div id="start" class="_1 run_alg_container">Εκτέλεση</div>');
	
	$('#content_container').off('click', '#start');
	$('#content_container').on('click', '#start', function(){ 
		if(!$(this).hasClass('hovered')){
			$(this).addClass('hovered');
			loadingStart($('#content_container'), 'algorithmsLoader', 'Προετοιμασία αλγορίθμων', '_dark');
			var algorithms = [];
			var length = $('.multi_select.pressed').length;
			if(type === 'search'){
				for(var i=0;i<length;i++){
					algorithms[i] = $('.multi_select.pressed').eq(i).attr('id').split('_')[0]+'Search';
				}
				var values = '';
				var target = '';
				if(runOptions.data === 'recommended'){
					values = recommended;
					target = recommendedTarget;
				}
				else if(runOptions.data === 'random'){
					if(runOptions.random.randomCount === true){
						var count = range(1,runOptions.maxNum)[0];
						values = range(count,runOptions.maxNum);
					}
					else {
						values = range(runOptions.random.count,runOptions.maxNum);
					}
					var targetID = range(1,values.length);
					target = values[targetID];
				}
				else if(runOptions.data === 'custom'){
					target = runOptions.searching.target;
					if($('textarea.array_elem_field')[0]){
						values = runOptions.custom.values = $('textarea.array_elem_field').val();
					}
					else if($('input.array_elem_field').length > 1){
						var length = $('input.array_elem_field').length;
						values = [];
						for(var i=0;i<length;i++){
							values[i] = $('input.array_elem_field').eq(i).val();
						}
						runOptions.custom.values = values;
					}
					else if($('input.array_elem_field').length === 1){
						values = $('input.array_elem_field').val();
						runOptions.custom.values = values;
					}
				}
				runSearching(algorithms, values, target, type);
			}
			else if(type === 'sort'){
				for(var i=0;i<length;i++){
					if($('.multi_select.pressed').eq(i).attr('id').split('_')[0] === 'selection'){
						algorithms[i] = 'straightSelection';
					}
					else if($('.multi_select.pressed').eq(i).attr('id').split('_')[0] === 'insertion'){
						algorithms[i] = 'straightInsertion';
					}
					else {
						algorithms[i] = $('.multi_select.pressed').eq(i).attr('id').split('_')[0]+'Sort';
					}
				}
				var values = '';
				if(runOptions.data === 'recommended'){
					values = recommended;
				}
				else if(runOptions.data === 'random'){
					if(runOptions.random.randomCount === true){
						var count = range(1,runOptions.maxNum)[0];
						values = range(count,runOptions.maxNum);
					}
					else {
						values = range(runOptions.random.count,runOptions.maxNum);
					}
				}
				else if(runOptions.data === 'custom'){
					if($('textarea.array_elem_field')[0]){
						values = runOptions.custom.values = $('textarea.array_elem_field').val();
					}
					else if($('input.array_elem_field').length > 1){
						var length = $('input.array_elem_field').length;
						values = [];
						for(var i=0;i<length;i++){
							values[i] = $('input.array_elem_field').eq(i).val();
						}
						runOptions.custom.values = values;
					}
					else if($('input.array_elem_field').length === 1){
						values = $('input.array_elem_field').val();
						runOptions.custom.values = values;
					}
				}
				runSorting(algorithms, values, type);
			}
		}	
	});
}

/*Function to run searching algs*/
function runSearching(algorithms, values, target, type){
	var search = null;
	var exeID = 0;
	var length = algorithms.length;
	search = new searchingAlg({'values' : values, 'target' : target, 'breakIntoLetters' : runOptions.custom.breakIntoLetters});
	var startingArray = search.values.slice(0);
	var isRecommended = 0;
	if(runOptions.data === 'recommended'){
		isRecommended = 1;
	}
	
	base_ajax_call(true, {requested: 'sesexe'}, function(obj){
		exeID = obj;
		loadingStart($('#content_container'), 'savingLoader', 'Αποθήκευση στατιστικών' ,'_dark');
		
		var arr = [];
		var steps = [];
		var history = [];
		var num = 0;
		search.listen('all', 'onComplete', function(array){ 
			base_ajax_call(true, {requested: 'saveStats', exeID: parseInt(exeID), array: startingArray, isRecommended: isRecommended, length: array.array.length, algorithm: array.name, order: 'none', target: ''+target+'', typeOfData: array.typeOfData, steps: array.steps, time: array.time}, function(obj){
				num += 1;
				if(num === length){
					loadingComplete('savingLoader');
				}
				
			});
			arr[array.name] = array.array;
			steps[array.name] = array.steps;
		});
		
		/*Functions to run as soon as algorithms completed*/
		search.listen('onFinish', function(array){ 
			loadingComplete('algorithmsLoader');
			$('#start').removeClass('hovered');
			history = search.getHistory();
			runVisualization(algorithms, history, arr, steps, type);
		});
		
		search.runSearches(algorithms);
	
	});
}

/*Function to run sorting algs*/
function runSorting(algorithms, values, type){
	var sort = null;
	var exeID = 0;
	var length = algorithms.length;
	sort = new sortingAlg({'values' : values, 'ascending' : runOptions.sorting.ascending, 'breakIntoLetters' : runOptions.custom.breakIntoLetters});
	var startingArray = sort.values.slice(0);
	var isRecommended = 0;
	if(runOptions.data === 'recommended'){
		isRecommended = 1;
	}
	
	base_ajax_call(true, {requested: 'sesexe'}, function(obj){
		exeID = obj;
		loadingStart($('#content_container'), 'savingLoader', 'Αποθήκευση στατιστικών' ,'_dark');
		
		var arr = [];
		var steps = [];
		var history = [];
		var order = 'ascending';
		if(runOptions.sorting.ascending){
			order = 'ascending'
		}
		else {
			order = 'descending'
		}
		var num = 0;
		sort.listen('all', 'onComplete', function(array){ 
			
			base_ajax_call(true, {requested: 'saveStats', exeID: parseInt(exeID), array: startingArray, isRecommended: isRecommended, length: array.array.length, algorithm: array.name, order: order, target: 'none', typeOfData: array.typeOfData, steps: array.steps, time: array.time}, function(obj){
				num += 1;
				if(num === length){
					loadingComplete('savingLoader');
				}
				
			});
			steps[array.name] = array.steps;
		});
		
		/*Functions to run as soon as algorithms completed*/
		sort.listen('onFinish', function(array){ 
			loadingComplete('algorithmsLoader');
			$('#start').removeClass('hovered');
			history = sort.getHistory();
			arr = sort.values;
			runVisualization(algorithms, history, arr, steps, type);
		});
		
		sort.runSorts(algorithms);
	});
}

/*Function to start visualization*/
function runVisualization(algorithms, history, array, steps, type){
	if(typeof visualize !== 'undefined'){
		window.clearInterval(visualize);
	}
	
	var runHeight = $('#run_content').height() + 2 + parseInt($('#run_content').css('margin-bottom'));
	$('#run_content').animate({
		marginTop : '-'+runHeight+'px'
	});
	
	var chart = {};
	var numberOfCharts = 0;
	var left = 15;
	var top = 15;
	var height = runOptions.maxHeight;
	
	$('#run_container').append('<div id="visualization_controls">'+
		'<div id="step_btn" class="standard_btns toggle_select_controls">Βηματική εκτέλεση'+
			'<div class="toggle_control">'+
				'<div class="toggle_circle" style="margin-left: 2px;">'+
					'<p class="off" style="margin-left: 5px;">x</p>'+
				'</div>'+
			'</div>'+
		'</div>'+
		'<div id="steping_btn" class="standard_btns steping" style="width: 80px; display: none;">Βήμα</div>'+
		'<div id="speed_btn" class="standard_btns slider_select">Ταχύτητα'+
			'<div id="slider_controls" class="ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all" aria-disabled="false">'+
				'<a class="ui-slider-handle ui-state-default ui-corner-all" href="#" style="left: 66.66666666666666%;"></a>'+
			'</div>'+
		'</div>'+
		'<div id="close_btn" class="standard_btns" style="width: 80px;">Διακοπή</div>'+
	'</div>');
	
	$('#visualization_controls').slideDown(200);
	
	if(runOptions.runStep){
		$('#visualization_controls > #step_btn').find('.toggle_circle').animate({
			marginLeft : '28px'
		},100);
		$('#visualization_controls > #step_btn').find('.off').removeClass('off').addClass('on').css('marginLeft','6px').html('o');
		$('#visualization_controls > #step_btn').addClass('pressed');
		
		$('#steping_btn').animate({
			width: 'toggle'
		});
	}
	
	$("#slider_controls").slider({ animate: "fast", value: 600 - runOptions.speed,  max: 600 });
	
	$('#run_container').append('<div id="visualization_container" style="height:'+height+'px;"></div>');
	
	$.each(algorithms, function(index, value){
		var verticalNumOfCharts = Math.floor(numberOfCharts / 2);
		if(numberOfCharts === 1){
			verticalNumOfCharts = 0;
		}
		top = (verticalNumOfCharts * (height + 50 + 5)) + 15;
		var horizontalNumOfCharts = numberOfCharts / 2;
		if(horizontalNumOfCharts % 1 === 0){
			left = 15;
		}
		else {
			left = runOptions.maxWidth + 30;
		}
		var stepsTop = top + height + 22;
		$('#visualization_container').append('<div id="chart_'+value+'" class="chart" style="height:'+height+'px; width:'+runOptions.maxWidth+'px; top: '+top+'px; left:'+left+'px;"></div>');
		$('#visualization_container').append('<div id="chart_steps_'+value+'" style="font-size: 20px; position:absolute; height: 25px; width:'+runOptions.maxWidth+'px; top: '+stepsTop+'px; left:'+left+'px;"></div>');
		if(type === 'search'){
			chart[value] = new graphlug({element : $('#chart_'+value+''), array : array[value].slice(0), borderSize: 0, maxHeight: runOptions.maxHeight, maxWidth: runOptions.maxWidth, speed: runOptions.speed, numOfSteps: steps[value]});
		}
		else if(type === 'sort'){
			chart[value] = new graphlug({element : $('#chart_'+value+''), array : array.slice(0), borderSize: 0, maxHeight: runOptions.maxHeight, maxWidth: runOptions.maxWidth, speed: runOptions.speed, numOfSteps: steps[value]});
		}
		chart[value].listen(function(data){
			var type = '';
			switch(data.type){
				case 'compare':
					type = 'Σύγκριση '+data.elements[0]+' με '+data.elements[1]+'';
					break;
				case 'checkLeft':
					type = 'Αναζήτηση αριστερά από το '+data.elements[0]+'';
					break;
				case 'checkRight':
					type = 'Αναζήτηση δεξιά από το '+data.elements[0]+'';
					break;
				case 'setBoundaries':
					type = 'Ορισμός νέων ορίων ('+data.elements[0]+'-'+data.elements[1]+'-'+data.elements[2]+')';
					break;
				case 'found':
					type = 'ΒΡΕΘΗΚΕ! στην θέση '+data.elements[0]+'';
					break;
				case 'not-found':
					type = 'ΔΕΝ ΒΡΕΘΗΚΕ!';
					break;
				case 'swap':
					type = 'Αντιμετάθεση '+data.elements[0]+' με '+data.elements[1]+'';
					break;
				case 'newMax':
					type = 'Νέο μέγιστο '+data.elements[0]+'';
					break;
				case 'newMin':
					type = 'Νέο ελάχιστο '+data.elements[0]+'';
					break;
				case 'moveLeft':
					type = 'Έλεγχος του αριστερού στοιχείου από το '+data.elements[0]+'';
					break;
				case 'moveRight':
					type = 'Έλεγχος του δεξιού στοιχείου από το '+data.elements[0]+'';
					break;
				case 'nothing':
					type = 'Καμία ενέργεια, τα στοιχεία είναι σωστά τοποθετημένα.';
					break;
				case 'completed':
					type = 'Η ταξινόμηση ολοκληρώθηκε!';
					break;
			}
			$('#chart_steps_'+value+'').html(type);
		});
		if(runOptions.runStep){
			chart[value].runStep();
		}
		$('#chart_'+value+'').click(function(){
			if($(this).hasClass('pause')){
				chart[value].play();
			}
			else {
				chart[value].pause();
			}
		});
		numberOfCharts++;
	});
	
	$('#visualization_container').show('clip');
	
	var num = 0;
	visualize = setInterval(function(){
		if(num < history.length){
			$.each(algorithms, function(index, value){
				if(history[num].hasOwnProperty(value)){
					if(type === 'search'){
						chart[value].visualizeSearch(history[num][value].action);
					}
					else if(type === 'sort'){
						chart[value].visualize(history[num][value].action);
					}
				}
			});
		}
		else {
			window.clearInterval(visualize);
		}
		num++;
	},0);	
	
	$( "#slider_controls" ).slider({
		change: function( event, ui ) {
			$.each(algorithms, function(index, value){
				chart[value].speed(600 - ui.value);
			});
		}
	});
	
	$('#visualization_controls').off('click', '.toggle_select_controls');
	$('#visualization_controls').on('click', '.toggle_select_controls', function(){
		if(!$(this).hasClass('pressed')){
			$(this).find('.toggle_circle').animate({
				marginLeft : '28px'
			},100);
			$(this).find('.off').removeClass('off').addClass('on').css('marginLeft','6px').html('o');
			$(this).addClass('pressed');
			
			$.each(algorithms, function(index, value){
				chart[value].runStep();
			});
			$('#steping_btn').animate({
				width: 'toggle'
			});
		}
		else {
			$(this).find('.toggle_circle').animate({
				marginLeft : '2px'
			},100);
			$(this).find('.on').removeClass('on').addClass('off').css('marginLeft','5px').html('x');
			$(this).removeClass('pressed');
		
			$.each(algorithms, function(index, value){
				chart[value].runRegular();
			});
			$('#steping_btn').animate({
				width: 'toggle'
			});
		}
	});
	
	$('#visualization_controls').off('click', '#steping_btn');
	$('#visualization_controls').on('click', '#steping_btn', function(){
		$.each(algorithms, function(index, value){
			chart[value].play();
		});
	});
	
	$('#visualization_controls').off('click', '#close_btn');
	$('#visualization_controls').on('click', '#close_btn', function(){
		$('#run_content').animate({
			marginTop : '15px'
		});
		$('#visualization_container').hide('clip', function(){
			$(this).remove();
		});
		$('#visualization_controls').slideUp(200, function(){
			$(this).remove();
		});
	});
}

/*Function to show selection for next algorithm*/
function nextSelect(type){
	var numberOfElements = $('.column').last().children().length;
	if(numberOfElements > 1){
		var count = parseInt($('.column').last().attr('class').split('_')[1]);
		var num = count + 1;
		$('#run_content').append('<div id="run_content_container" class="_'+num+' column" style="display:none;"></div>');
		$('#run_'+type+'ing_algs._'+count+'').clone().appendTo('._'+num+'.column');
		$('._'+num+'.column').children('._'+count+'').removeClass('_'+count+'').addClass('_'+num+'')
		$('#run_'+type+'ing_algs._'+num+'').children('.pressed').remove();
		
		$('._'+num+'.column').show('drop', 150);
	}
}

function removeNextSelect($element){
	var count = parseInt($element.split('_')[1]);
	var num = count + 1;
	if($('._'+num+'.column')[0]){
		$('._'+num+'.column').hide('drop', 150, function(){
			$(this).remove();
		});
	}
}

/*Function to manage gallery subpage*/
function loadAlgorithms(type){
	var hash = window.location.hash.split('/');	
	if(type === 'search'){
		$('#gallery_menu').append('<ul id="linear_menu" class="gallery_menu_items">'+
			'<li class="gallery_menu_item_algorithm">'+
				'<p>σειριακή</p>'+
				'<p>αναζήτηση</p>'+
			'</li>'+
			'<li class="gallery_menu_item_analysis selected">'+
				'<p>ανάλυση</p>'+
			'</li>'+
			'<li class="gallery_menu_item_use">'+
				'<p>κώδικας</p>'+
			'</li>'+
		'</ul>'+
		'<ul id="binary_menu" class="gallery_menu_items inactive">'+
			'<li class="gallery_menu_item_algorithm">'+
				'<p>δυαδική</p>'+
				'<p>αναζήτηση</p>'+
			'</li>'+
			'<li class="gallery_menu_item_analysis selected">'+
				'<p>ανάλυση</p>'+
			'</li>'+
			'<li class="gallery_menu_item_use">'+
				'<p>κώδικας</p>'+
			'</li>'+
		'</ul>');
	}
	else if(type === 'sort'){
		$('#gallery_menu').append('<ul id="bubble_menu" class="gallery_menu_items sorting">'+
			'<li class="gallery_menu_item_algorithm">'+
				'<p>ταξινόμηση</p>'+
				'<p>φυσαλίδας</p>'+
			'</li>'+
			'<li class="gallery_menu_item_analysis selected">'+
				'<p>ανάλυση</p>'+
			'</li>'+
			'<li class="gallery_menu_item_use">'+
				'<p>κώδικας</p>'+
			'</li>'+
		'</ul>'+
		'<ul id="insertion_menu" class="gallery_menu_items sorting inactive">'+
			'<li class="gallery_menu_item_algorithm">'+
				'<p>απευθείας</p>'+
				'<p>εισαγωγή</p>'+
			'</li>'+
			'<li class="gallery_menu_item_analysis selected">'+
				'<p>ανάλυση</p>'+
			'</li>'+
			'<li class="gallery_menu_item_use">'+
				'<p>κώδικας</p>'+
			'</li>'+
		'</ul>'+
		'<ul id="selection_menu" class="gallery_menu_items sorting inactive">'+
			'<li class="gallery_menu_item_algorithm">'+
				'<p>απευθείας</p>'+
				'<p>επιλογή</p>'+
			'</li>'+
			'<li class="gallery_menu_item_analysis selected">'+
				'<p>ανάλυση</p>'+
			'</li>'+
			'<li class="gallery_menu_item_use">'+
				'<p>κώδικας</p>'+
			'</li>'+
		'</ul>'+
		'<ul id="quick_menu" class="gallery_menu_items sorting inactive">'+
			'<li class="gallery_menu_item_algorithm">'+
				'<p>γρήγορη</p>'+
				'<p>ταξινόμηση</p>'+
			'</li>'+
			'<li class="gallery_menu_item_analysis selected">'+
				'<p>ανάλυση</p>'+
			'</li>'+
			'<li class="gallery_menu_item_use">'+
				'<p>κώδικας</p>'+
			'</li>'+
		'</ul>');
	}
	
	loadAlgorithmsAnalysis();
	
	/*if(hash.length !== 3){
		if(hash[2] === 'gallery'){
			var selected = hash[3];
			$('.gallery_menu_items').addClass('inactive');
			$('#'+selected+'_menu.gallery_menu_items').removeClass('inactive');
			
			var selected_item = hash[4];

			$('#'+selected+'_menu > li').removeClass('selected');
			$('#'+selected+'_menu >.gallery_menu_item_'+selected_item+'').addClass('selected');
		}
	}*/
}

function loadAlgorithmsAnalysis(){
	if($('.gallery_content_container')[0]){
		$('.gallery_content_container').remove();
	}
	var hash = window.location.hash.split('/');
	var selected = '';
	var selected_item = 'analysis';
	if((hash.length !== 3) && (hash[2] === 'gallery')){
		selected = hash[3];
		selected_item = hash[4];
	}
	else {
		var type = hash[1].split('-')[0];
		if(type === 'searching'){
			selected = 'linear';
		}
		else {
			selected = 'bubble';
		}
	}
	
	if(selected_item === 'analysis'){
		switch(selected){
			case 'linear':
				$('#gallery_menu').after('<div id="linear_analysis" class="gallery_content_container">'+
					'<div id="gallery_visualization">'+
						'<div class="gallery_line"></div>'+
						'<img src="img/linearSearch.gif">'+
					'</div>'+
					'<p>Ο αλγόριθμος σειριακής αναζήτησης είναι ο πιο απλός αλγόριθμος '+
					'αναζήτησης.<br><br> Από πλευράς μεθοδολογίας ανήκει στους αλγόριθμους ωμής βίας και ο '+
					'τρόπος λειτουργίας του είναι πως ελέγχει ένα-ένα το κάθε στοιχείο μέχρι να εντοπίσει '+
					'το ζητούμενο, οπότε και ολοκληρώνεται η αναζήτηση.<br><br> Αν ολοκληρωθεί η '+
					'προσπέλαση όλων των στοιχείων χωρίς να βρεθεί το ζητούμενο στοιχείο, τότε η '+
					'αναζήτηση θεωρείται ανεπιτυχής.<br><br> '+
					'Ο τρόπος λειτουργίας του αλγόριθμου σειριακής αναζήτησης τον καθιστά '+
					'ιδιαίτερα αργό στην περίπτωση που τα στοιχεία στα οποία θα γίνει η αναζήτηση είναι '+
					'πολλά. </p>'+
				'</div>');
				break;
			case 'binary':
				$('#gallery_menu').after('<div id="binary_analysis" class="gallery_content_container">'+
					'<div id="gallery_visualization">'+
						'<div class="gallery_line"></div>'+
						'<img src="img/binarySearch.gif">'+
					'</div>'+
					'<p>Ο αλγόριθμος δυαδικής αναζήτησης πραγματοποιεί την αναζήτηση του '+
					'ζητούμενου στοιχείου ανάμεσα σε ταξινομημένα στοιχεία.<br><br> Αυτό δίνει την δυνατότητα '+
					'στον αλγόριθμο να αναζητήσει στοιχεία επιλεκτικά και όχι σειριακά με αποτέλεσμα '+
					'να αυξάνει κατακόρυφα τις επιδόσεις του. <br><br>'+
					'Αναλυτικά, ο τρόπος λειτουργίας του είναι ο εξής, αρχικά ελέγχεται το μεσαίο '+
					'στοιχείο για να διαπιστωθεί αν είναι ή όχι το ζητούμενο.<br><br> Αν είναι τότε η αναζήτηση '+
					'έχει ολοκληρωθεί, αν όχι, με βάση το αποτέλεσμα της σύγκρισης ζητούμενου με '+
					'μεσαίου στοιχείου (μεγαλύτερο ή μικρότερο), ο μισός πίνακας εξαιρείται και η '+
					'αναζήτηση συνεχίζει με τον ίδιο τρόπο στον άλλο μισό.<br><br> Η διαδικασία αυτή '+
					'επαναλαμβάνεται μέχρι να εντοπισθεί το ζητούμενο στοιχείο ή να διαπιστωθεί πως '+
					'δεν υπάρχει. <br><br>'+
					'Από μαθηματικής απόψεως ο αλγόριθμος αυτός είναι αρκετά προβλέψιμος '+
					'και σταθερός, αφού η επίδοσή του συνήθως είναι πολύ κοντά στη μέση τιμή των '+
					'συγκρίσεων. </p>'+
				'</div>');
				break;
			case 'bubble':
				$('#gallery_menu').after('<div id="bubble_analysis" class="gallery_content_container">'+
					'<div id="gallery_visualization">'+
						'<div class="gallery_line"></div>'+
						'<img src="img/bubbleSort.gif">'+
					'</div>'+
					'<p>Είναι ένας απλός αλγόριθμος ταξινόμησης που λειτουργεί συγκρίνοντας τα '+
					'στοιχεία ανά ζευγάρια και εναλλάσσοντάς τα θέση μέχρι όλα τα στοιχεία να είναι '+
					'σωστά ταξινομημένα.</br></br> Η ονομασία του προέρχεται από τον τρόπο με τον οποίο '+
					'λειτουργεί, τα μεγαλύτερα στοιχεία μετακινούνται προς το τέλος, όπως οι φυσαλίδες '+
					'που αναδύονται στην επιφάνεια. '+
					'</p>'+
				'</div>');
				break;
			case 'insertion':
				$('#gallery_menu').after('<div id="insertion_analysis" class="gallery_content_container">'+
					'<div id="gallery_visualization">'+
						'<div class="gallery_line"></div>'+
						'<img src="img/insertionSort.gif">'+
					'</div>'+
					'<p>Είναι ένας απλός αλγόριθμος που ταξινομεί τα στοιχεία ένα - ένα τη φορά έως '+
					'ότου είναι όλα ταξινομημένα.<br><br> Η λογική που ακολουθεί είναι πως συγκρίνει το κάθε '+
					'στοιχείο, ξεκινώντας απ’ το δεύτερο, με τα προηγούμενά του και το τοποθετεί στη '+
					'σωστή θέση.<br><br> Είναι γρηγορότερος από την ταξινόμηση φυσαλίδας και την ταξινόμηση '+
					'με απευθείας επιλογή αλλά υστερεί συγκριτικά με τη γρήγορη ταξινόμηση.'+
					'<p>'+
				'</div>');
				break;
			case 'selection':
				$('#gallery_menu').after('<div id="selection_analysis" class="gallery_content_container">'+
					'<div id="gallery_visualization">'+
						'<div class="gallery_line"></div>'+
						'<img src="img/selectionSort.gif">'+
					'</div>'+
					'<p>Η λειτουργία του αλγορίθμου είναι απλή και η λογική που ακολουθεί είναι να '+
					'χωρίζει τα δεδομένα σε δύο κατηγορίες, αυτά που έχουν ήδη ταξινομηθεί και σε αυτά '+
					'που απομένουν να ταξινομηθούν, σε κάθε επανάληψη το μικρότερο από τα μη '+
					'ταξινομημένα τοποθετείται στο τέλος των ταξινομημένων. '+
					'</p>'+
				'</div>');
				break;
			case 'quick':
				$('#gallery_menu').after('<div id="quick_analysis" class="gallery_content_container">'+
					'<div id="gallery_visualization">'+
						'<div class="gallery_line"></div>'+
						'<img src="img/quickSort.gif">'+
					'</div>'+
					'<p>Ο αλγόριθμος γρήγορης ταξινόμησης είναι ένας από τους πιο γρήγορους '+
					'αλγόριθμους ταξινόμησης.<br><br> Από πλευράς μεθοδολογίας ανήκει στους αλγόριθμους '+
					'διαίρει και βασίλευε και ο τρόπος λειτουργίας του είναι πως αρχικά επιλέγει ένα '+
					'στοιχείο ως στοιχείο αναφοράς και τοποθετεί όλα τα μεγαλύτερα στοιχεία δεξιά του '+
					'και όλα τα μικρότερα αριστερά του.<br><br> Τώρα ο πίνακας προς ταξινόμηση έχει '+
					'απλοποιηθεί σε δύο μικρότερους υποπίνακες, στους οποίους ακολουθείται πάλι η ίδια '+
					'τακτική με αποτέλεσμα ακόμα μικρότερους υποπίνακες κ.ο.κ., αυτή η διαδικασία '+
					'συνεχίζεται έως ότου ο υποπίνακας που προκύπτει να αποτελείται από ένα μόνο '+
					'στοιχείο.<br><br> Όταν όλοι οι υποπίνακες έχουν ταξινομηθεί, τότε και τα αρχικά στοιχεία '+
					'είναι ταξινομημένα. '+
					'<p>'+
				'</div>');
				break;
		}
	}
	else if(selected_item === 'use'){
		switch(selected){
			case 'linear':
				$('#gallery_menu').after('<div id="linear_analysis" class="gallery_content_container">'+
					'<pre class="linear_code">function linearSearch(linear_array, target){	'+
						'<br>	var length = linear_array.length;'+
						'<br>	var found = false;'+
						'<br>	for(var i = 0; i < length; ++i){'+
							'<br>		if (linear_array[i] == target){'+
								'<br>			found = true;'+
								'<br>			break;'+
							'<br>		}'+
						'<br>	}'+
						
						'<br>	return found;'+
					'<br>};</pre>'+
				'</div>');
				break;
			case 'binary':
				$('#gallery_menu').after('<div id="binary_analysis" class="gallery_content_container">'+
					'<pre class="binary_code">var found = binarySearch(binary_array, target, start, end);'+
					
					'<br>return found;'+
					
					'<br>function binarySearch(array, target, start, end){'+
					'<br>	var middle = Math.floor(0.5 * (start + end));'+
					'<br>	if (start > end){ '+
					'<br>		return false; '+
					'<br>	}'+
					
					'<br>	if (value > target){'+
					'<br>		return bSearch(array, target, start, middle-1); '+
					'<br>	}'+
					'<br>	if (value < target){'+
					'<br>		return bSearch(array, target, middle+1, end); '+
					'<br>	}'+

					'<br>	return middle;'+
					'<br>};</pre>'+
				'</div>');
				break;
			case 'bubble':
				$('#gallery_menu').after('<div id="bubble_analysis" class="gallery_content_container">'+
					'<pre class="bubble_code">function bubbleSort(bubble_array){'+
					'<br>	var length = bubble_array.length;'+
					'<br>	for(var i = length - 1; 0 < i; i--){'+
					'<br>		for(var j = 0; j < i; j++){'+
					'<br>			if(j > j + 1)){'+
					'<br>				var temp = bubble_array[j];'+
					'<br>				bubble_array[j] = bubble_array[j + 1];'+
					'<br>				bubble_array[j + 1] = temp;'+
					'<br>			}'+
					'<br>		}'+
					'<br>	}'+
					'<br>	return bubble_array;'+
					'<br>};</pre>'+
				'</div>');
				break;
			case 'insertion':
				$('#gallery_menu').after('<div id="insertion_analysis" class="gallery_content_container">'+
					'<pre class="insertion_code">function straightInsertion(insertion_array){'+
					'<br>	var length = insertion_array.length;        '+               
					'<br>	for (var i = 1; i < length; i++){'+
					'<br>		for(var j = i; 0 < j; j--){'+
					'<br>			if(j - 1  > j)){'+
					'<br>				var temp = insertion_array[j - 1];'+
					'<br>				insertion_array[j - 1] = insertion_array[j];'+
					'<br>				insertion_array[j] = temp;'+
					'<br>			}'+
					'<br>		}'+
					'<br>	}	'+
					'<br>	return insertion_array;'+
					'<br>};</pre>'+
				'</div>');
				break;
			case 'selection':
				$('#gallery_menu').after('<div id="selection_analysis" class="gallery_content_container">'+
					'<pre class="selection_code">function straightSelection(selection_array){'+
					'<br>	var length = selection_array.length;'+
					'<br>	for (var i = 0; i < length - 1; i++){'+
					'<br>		var minIndex = i;'+
					'<br>		for (var j = i + 1; j < length; j++){'+
					'<br>			var oldMinIndex = minIndex;'+
					'<br>			if (minIndex > j){'+
					'<br>				minIndex = j;'+
					'<br>			}'+
					'<br>		}'+
					'<br>		if (minIndex != i){'+
					'<br>			if(i > minIndex)){'+
					'<br>				var temp = selection_array[j];'+
					'<br>				selection_array[j] = selection_array[j + 1];'+
					'<br>				selection_array[j + 1] = temp;'+
					'<br>			}'+
					'<br>		}'+
					'<br>	}	'+
					'<br>	return selection_array;'+
					'<br>};</pre>'+
				'</div>');
				break;
			case 'quick':
				$('#gallery_menu').after('<div id="quick_analysis" class="gallery_content_container">'+
					'<pre class="quick_code">qsort(quick_array, 0, end);'+
					'<br>function qsort(array, begin, end){'+
					'<br>	if(end > begin){'+
					'<br>		var pivot = Math.floor(0.5 * (begin + end));'+
					'<br>		var piv = array[pivot];'+
					'<br>		var i = begin;'+
					'<br>		var j = end;'+
					'<br>		while (i <= j) {'+
					'<br>			while (piv > array[i]){	'+
					'<br>				i++;'+
					'<br>			}'+
					'<br>			while (array[j] > piv){'+
					'<br>				j--;'+
					'<br>			}'+
					'<br>			if (i <= j){'+
					'<br>				var temp = array[i];'+
					'<br>				insertion_array[i] = insertion_array[j];'+
					'<br>				insertion_array[j] = temp;'+
					'<br>				i++;'+
					'<br>				j--;'+
					'<br>			}'+
					'<br>		}'+
					'<br>		if (begin < i - 1){'+
					'<br>			qsort(array, begin, i - 1);'+
					'<br>		}'+
					'<br>		if (i < end){'+
					'<br>			qsort(array, i, end);'+
					'<br>		}			'+
					'<br>	}'+
					'<br>}</pre>'+
				'</div>');
				break;
		}
		$('pre.'+selected+'_code').snippet("javascript",{style:"ide-codewarrior",transparent:true,showNum:true});
	}
	

	smartSliders($('.content_container_wrapper_container'));
	$('#content_container_wrapper').resize(function(){
		smartSliders($('.content_container_wrapper_container'));
	});
	
	if(hash.length !== 3){
		if(hash[2] === 'gallery'){
			var selected = hash[3];
			//$('.gallery_menu_items').addClass('inactive');
			/*$('.gallery_menu_items').css({
				height: '70px',
				opacity: '0.5'
			});*/
			
			$('.gallery_menu_items').not($('#'+selected+'_menu.gallery_menu_items')).animate({
				height: '70px',
				opacity: '.5'
			},350, function(){
				$('.gallery_menu_items').not($('#'+selected+'_menu.gallery_menu_items')).addClass('inactive');
			});
			
			//$('#'+selected+'_menu.gallery_menu_items').removeClass('inactive');
			
			$('#'+selected+'_menu.gallery_menu_items').animate({
				height: '153px',
				opacity: '1'
			},350, function(){
				$('#'+selected+'_menu.gallery_menu_items').removeClass('inactive');
			});
			/*$('#'+selected+'_menu.gallery_menu_items').css({
				height: '153px',
				opacity: '1'
			});*/
			
			var selected_item = hash[4];

			$('#'+selected+'_menu > li').removeClass('selected');
			$('#'+selected+'_menu >.gallery_menu_item_'+selected_item+'').addClass('selected');
		}
	}
	else {
		if(hash[2] === 'gallery'){
			//$('.gallery_menu_items').addClass('inactive');
			/*$('.gallery_menu_items').css({
				height: '70px',
				opacity: '0.5'
			});*/
			
			$('.gallery_menu_items').not($('.gallery_menu_items').eq(0)).animate({
				height: '70px',
				opacity: '.5'
			},350, function(){
				$('.gallery_menu_items').not($('.gallery_menu_items').eq(0)).addClass('inactive');
			});
			
			//$('.gallery_menu_items').eq(0).removeClass('inactive');
			
			$('.gallery_menu_items').eq(0).animate({
				height: '153px',
				opacity: '1'
			},350, function(){
				$('.gallery_menu_items').eq(0).removeClass('inactive');
			});
			/*$('.gallery_menu_items').eq(0).css({
				height: '153px',
				opacity: '1'
			});*/
			
			var selected_item = hash[4];

			$('.gallery_menu_items').eq(0).children('li').removeClass('selected');
			$('.gallery_menu_items').eq(0).children('li').eq(1).addClass('selected');
		}
	}
}

/*Function to manage stats subpage*/
function statsAlgorithms(type){
	var hash = window.location.hash.split('/');	
	if(type === 'search'){
		$('#stats_menu').append('<ul id="recommended_menu" class="stats_menu_items">'+
			'<li class="stats_menu_item_algorithm">'+
				'<p>γενικά</p>'+
				'<p>στατιστικά</p>'+
			'</li>'+
		'</ul>'+
		'<ul id="linear_menu" class="stats_menu_items inactive">'+
			'<li class="stats_menu_item_algorithm">'+
				'<p>σειριακή</p>'+
				'<p>αναζήτηση</p>'+
			'</li>'+
		'</ul>'+
		'<ul id="binary_menu" class="stats_menu_items inactive">'+
			'<li class="stats_menu_item_algorithm">'+
				'<p>δυαδική</p>'+
				'<p>αναζήτηση</p>'+
			'</li>'+
		'</ul>');
	}
	else if(type === 'sort'){
		$('#stats_menu').append('<ul id="recommended_menu" class="stats_menu_items sorting">'+
			'<li class="stats_menu_item_algorithm">'+
				'<p>γενικά</p>'+
				'<p>στατιστικά</p>'+
			'</li>'+
		'</ul>'+'<ul id="bubble_menu" class="stats_menu_items sorting inactive">'+
			'<li class="stats_menu_item_algorithm">'+
				'<p>ταξινόμηση</p>'+
				'<p>φυσαλίδας</p>'+
			'</li>'+
		'</ul>'+
		'<ul id="insertion_menu" class="stats_menu_items sorting inactive">'+
			'<li class="stats_menu_item_algorithm">'+
				'<p>απευθείας</p>'+
				'<p>εισαγωγή</p>'+
			'</li>'+
		'</ul>'+
		'<ul id="selection_menu" class="stats_menu_items sorting inactive">'+
			'<li class="stats_menu_item_algorithm">'+
				'<p>απευθείας</p>'+
				'<p>επιλογή</p>'+
			'</li>'+
		'</ul>'+
		'<ul id="quick_menu" class="stats_menu_items sorting inactive">'+
			'<li class="stats_menu_item_algorithm">'+
				'<p>γρήγορη</p>'+
				'<p>ταξινόμηση</p>'+
			'</li>'+
		'</ul>');
	}
	
	loadStatsAnalysis();
	
	/*if(hash.length !== 3){
		if(hash[2] === 'stats'){
			var selected = hash[3];
			$('.stats_menu_items').addClass('inactive');
			$('#'+selected+'_menu.stats_menu_items').removeClass('inactive');
		}
	}*/
}

function loadStatsAnalysis(){
	/*if($('.stats_content_container')[0]){
		//$('.stats_content_container').remove();
		$('.stats_content_container').hide('drop',{direction: 'down'},350, function(){
			$(this).remove();
		});
	}*/
	var hash = window.location.hash.split('/');
	var selected = '';
	var type = hash[1].split('-')[0];
	if((hash.length !== 3) && (hash[2] === 'stats')){
		selected = hash[3];
		if(selected === 'recommended'){
			selected = selected+'_'+type
		}
	}
	else {
		if(type === 'searching'){
			selected = 'recommended_searching';
		}
		else {
			selected = 'recommended_sorting';
		}
	}
	
	abortAjax('getStatsxhr');
	switch(selected){
		case 'recommended_searching':
			loadingStart($('#content_container'), 'statsLoader', 'Ανάκτηση και επεξεργασία δεδομένων από την βάση', '_dark');
			base_ajax_call(true, {requested: 'getStatsRecommended', type: type}, function(obj){
				loadingComplete('statsLoader');
				if($('.stats_content_container')[0]){
					$('.stats_content_container').hide('drop',{direction: 'down'},350, function(){
						$(this).remove();
					});
				}
				$('#stats_menu').after('<div id="recommended_searching" class="stats_content_container">'+
					'<div style="background: #fff;border: 1px solid #EEE;box-shadow: 0 1px 0 #ECE9E9;border-radius: 5px; margin-top:10px;">'+
						'<p class="stats_title" style="">Μέσος χρόνος εκτέλεσης (ms)</p>'+
						'<div id="time_chart" style="width: 770px; height: 300px; margin: auto;"></div>'+
					'</div>'+
					'<div style="background: #fff;border: 1px solid #EEE;box-shadow: 0 1px 0 #ECE9E9;border-radius: 5px; margin-top:10px;">'+
						'<p class="stats_title" style="">Μέσο πλήθος βημάτων</p>'+
						'<div id="steps_chart" style="width: 770px; height: 300px; margin: auto;"></div>'+
					'</div>'+
					'<div style="background: #fff;border: 1px solid #EEE;box-shadow: 0 1px 0 #ECE9E9;border-radius: 5px; margin-top:10px;">'+
						'<p class="stats_title" style="">Πλήθος εκτελέσεων του κάθε αλγορίθμου</p>'+
						'<div id="run_chart" style="width: 770px; height: 300px; margin: auto;"></div>'+
					'</div>'+
				'</div>');
			
				loadTimeChart(obj);
				loadStepsChart(obj);
				loadPerChart(obj);
				
				$('.stats_content_container').show('drop',{direction: 'down'},250);
			
			}, 'getStatsxhr');
			break;
		case 'linear':
			loadingStart($('#content_container'), 'statsLoader', 'Ανάκτηση και επεξεργασία δεδομένων από την βάση', '_dark');
			base_ajax_call(true, {requested: 'getStats', algorithm: selected+'Search'}, function(obj){
				loadingComplete('statsLoader');
				if($('.stats_content_container')[0]){
					$('.stats_content_container').hide('drop',{direction: 'down'},350, function(){
						$(this).remove();
					});
				}
				$('#stats_menu').after('<div id="linear_analysis" class="stats_content_container">'+
					'<div style="background: #fff;border: 1px solid #EEE;box-shadow: 0 1px 0 #ECE9E9;border-radius: 5px; margin-top:10px; height: 150px;">'+
							'<p class="stats_title" style="">Τα στατιστικά σε αριθμούς</p>'+
							'<div class="stats_numbers">'+
								'<p class="stats_numbers_title">Πλήθος εκτελέσεων</p>'+
								'<p id="num_of_runs" class="stats_numbers_num">-</p>'+
							'</div>'+
							'<div class="stats_numbers">'+
								'<p class="stats_numbers_title">Μέσο πλήθος βημάτων</p>'+
								'<p id="num_of_steps" class="stats_numbers_num">-</p>'+
							'</div>'+
							'<div class="stats_numbers">'+
								'<p class="stats_numbers_title">Μέσος χρόνος εκτέλεσης (ms)</p>'+
								'<p id="num_of_time" class="stats_numbers_num">-</p>'+
							'</div>'+
						'</div>'+
					'<div style="background: #fff;border: 1px solid #EEE;box-shadow: 0 1px 0 #ECE9E9;border-radius: 5px; margin-top:10px;">'+
						'<p class="stats_title" style="">Μέσος χρόνος εκτέλεσης (ms) συναρτήσει του πλήθους δεδομένων</p>'+
						'<div id="time_chart" style="width: 770px; height: 300px; margin: auto;"></div>'+
					'</div>'+
					'<div style="background: #fff;border: 1px solid #EEE;box-shadow: 0 1px 0 #ECE9E9;border-radius: 5px; margin-top:10px;">'+
						'<p class="stats_title" style="">Μέσο πλήθος βημάτων συναρτήσει του πλήθους δεδομένων</p>'+
						'<div id="steps_chart" style="width: 770px; height: 300px; margin: auto;"></div>'+
					'</div>'+
				'</div>');
			
				$('#num_of_runs').html(obj.averageGeneral[selected+'Search'].algExecution.toFixed(2));
				$('#num_of_steps').html(obj.averageGeneral[selected+'Search'].stepsAverage.toFixed(2));
				$('#num_of_time').html(obj.averageGeneral[selected+'Search'].timeAverage.toFixed(2));
			
				loadTimeByNumChart(obj);
				loadStepsByNumChart(obj);
				
				$('.stats_content_container').show('drop',{direction: 'down'},250);
				
			}, 'getStatsxhr');
			break;
		case 'binary':
			loadingStart($('#content_container'), 'statsLoader', 'Ανάκτηση και επεξεργασία δεδομένων από την βάση', '_dark');
			base_ajax_call(true, {requested: 'getStats', algorithm: selected+'Search'}, function(obj){
				loadingComplete('statsLoader');
				if($('.stats_content_container')[0]){
					$('.stats_content_container').hide('drop',{direction: 'down'},350, function(){
						$(this).remove();
					});
				}
				$('#stats_menu').after('<div id="binary_analysis" class="stats_content_container">'+
				'<div style="background: #fff;border: 1px solid #EEE;box-shadow: 0 1px 0 #ECE9E9;border-radius: 5px; margin-top:10px;height: 150px;">'+
							'<p class="stats_title" style="">Τα στατιστικά σε αριθμούς</p>'+
							'<div class="stats_numbers">'+
								'<p class="stats_numbers_title">Πλήθος εκτελέσεων</p>'+
								'<p id="num_of_runs" class="stats_numbers_num">-</p>'+
							'</div>'+
							'<div class="stats_numbers">'+
								'<p class="stats_numbers_title">Μέσο πλήθος βημάτων</p>'+
								'<p id="num_of_steps" class="stats_numbers_num">-</p>'+
							'</div>'+
							'<div class="stats_numbers">'+
								'<p class="stats_numbers_title">Μέσος χρόνος εκτέλεσης (ms)</p>'+
								'<p id="num_of_time" class="stats_numbers_num">-</p>'+
							'</div>'+
						'</div>'+
					'<div style="background: #fff;border: 1px solid #EEE;box-shadow: 0 1px 0 #ECE9E9;border-radius: 5px; margin-top:10px;">'+
						'<p class="stats_title" style="">Μέσος χρόνος εκτέλεσης (ms) συναρτήσει του πλήθους δεδομένων</p>'+
						'<div id="time_chart" style="width: 770px; height: 300px; margin: auto;"></div>'+
					'</div>'+
					'<div style="background: #fff;border: 1px solid #EEE;box-shadow: 0 1px 0 #ECE9E9;border-radius: 5px; margin-top:10px;">'+
						'<p class="stats_title" style="">Μέσο πλήθος βημάτων συναρτήσει του πλήθους δεδομένων</p>'+
						'<div id="steps_chart" style="width: 770px; height: 300px; margin: auto;"></div>'+
					'</div>'+
				'</div>');
			
				$('#num_of_runs').html(obj.averageGeneral[selected+'Search'].algExecution.toFixed(2));
				$('#num_of_steps').html(obj.averageGeneral[selected+'Search'].stepsAverage.toFixed(2));
				$('#num_of_time').html(obj.averageGeneral[selected+'Search'].timeAverage.toFixed(2));
			
				loadTimeByNumChart(obj);
				loadStepsByNumChart(obj);
				
				$('.stats_content_container').show('drop',{direction: 'down'},250);
				
			}, 'getStatsxhr');
			break;
		case 'recommended_sorting':
			loadingStart($('#content_container'), 'statsLoader', 'Ανάκτηση και επεξεργασία δεδομένων από την βάση', '_dark');
			base_ajax_call(true, {requested: 'getStatsRecommended', type: type}, function(obj){
				loadingComplete('statsLoader');
				if($('.stats_content_container')[0]){
					$('.stats_content_container').hide('drop',{direction: 'down'},350, function(){
						$(this).remove();
					});
				}
				$('#stats_menu').after('<div id="recommended_sorting" class="stats_content_container">'+
					'<div style="background: #fff;border: 1px solid #EEE;box-shadow: 0 1px 0 #ECE9E9;border-radius: 5px; margin-top:10px;">'+
						'<p class="stats_title" style="">Μέσος χρόνος εκτέλεσης (ms)</p>'+
						'<div id="time_chart" style="width: 770px; height: 300px; margin: auto;"></div>'+
					'</div>'+
					'<div style="background: #fff;border: 1px solid #EEE;box-shadow: 0 1px 0 #ECE9E9;border-radius: 5px; margin-top:10px;">'+
						'<p class="stats_title" style="">Μέσο πλήθος βημάτων</p>'+
						'<div id="steps_chart" style="width: 770px; height: 300px; margin: auto;"></div>'+
					'</div>'+
					'<div style="background: #fff;border: 1px solid #EEE;box-shadow: 0 1px 0 #ECE9E9;border-radius: 5px; margin-top:10px;">'+
						'<p class="stats_title" style="">Πλήθος εκτελέσεων του κάθε αλγορίθμου</p>'+
						'<div id="run_chart" style="width: 770px; height: 300px; margin: auto;"></div>'+
					'</div>'+
				'</div>');
			
				loadTimeChart(obj);
				loadStepsChart(obj);
				loadPerChart(obj);
				
				$('.stats_content_container').show('drop',{direction: 'down'},250);
			
			}, 'getStatsxhr');
			break;
		case 'bubble':
			loadingStart($('#content_container'), 'statsLoader', 'Ανάκτηση και επεξεργασία δεδομένων από την βάση', '_dark');
			base_ajax_call(true, {requested: 'getStats', algorithm: selected+'Sort'}, function(obj){
				loadingComplete('statsLoader');
				if($('.stats_content_container')[0]){
					$('.stats_content_container').hide('drop',{direction: 'down'},350, function(){
						$(this).remove();
					});
				}
				$('#stats_menu').after('<div id="bubble_analysis" class="stats_content_container">'+
				'<div style="background: #fff;border: 1px solid #EEE;box-shadow: 0 1px 0 #ECE9E9;border-radius: 5px; margin-top:10px;height: 150px;">'+
							'<p class="stats_title" style="">Τα στατιστικά σε αριθμούς</p>'+
							'<div class="stats_numbers">'+
								'<p class="stats_numbers_title">Πλήθος εκτελέσεων</p>'+
								'<p id="num_of_runs" class="stats_numbers_num">-</p>'+
							'</div>'+
							'<div class="stats_numbers">'+
								'<p class="stats_numbers_title">Μέσο πλήθος βημάτων</p>'+
								'<p id="num_of_steps" class="stats_numbers_num">-</p>'+
							'</div>'+
							'<div class="stats_numbers">'+
								'<p class="stats_numbers_title">Μέσος χρόνος εκτέλεσης (ms)</p>'+
								'<p id="num_of_time" class="stats_numbers_num">-</p>'+
							'</div>'+
						'</div>'+
					'<div style="background: #fff;border: 1px solid #EEE;box-shadow: 0 1px 0 #ECE9E9;border-radius: 5px; margin-top:10px;">'+
						'<p class="stats_title" style="">Μέσος χρόνος εκτέλεσης (ms) συναρτήσει του πλήθους δεδομένων</p>'+
						'<div id="time_chart" style="width: 770px; height: 300px; margin: auto;"></div>'+
					'</div>'+
					'<div style="background: #fff;border: 1px solid #EEE;box-shadow: 0 1px 0 #ECE9E9;border-radius: 5px; margin-top:10px;">'+
						'<p class="stats_title" style="">Μέσο πλήθος βημάτων συναρτήσει του πλήθους δεδομένων</p>'+
						'<div id="steps_chart" style="width: 770px; height: 300px; margin: auto;"></div>'+
					'</div>'+
				'</div>');
			
				$('#num_of_runs').html(obj.averageGeneral[selected+'Sort'].algExecution.toFixed(2));
				$('#num_of_steps').html(obj.averageGeneral[selected+'Sort'].stepsAverage.toFixed(2));
				$('#num_of_time').html(obj.averageGeneral[selected+'Sort'].timeAverage.toFixed(2));
			
				loadTimeByNumChart(obj);
				loadStepsByNumChart(obj);
				
				$('.stats_content_container').show('drop',{direction: 'down'},250);
				
			}, 'getStatsxhr');
			break;
		case 'insertion':
			loadingStart($('#content_container'), 'statsLoader', 'Ανάκτηση και επεξεργασία δεδομένων από την βάση', '_dark');
			base_ajax_call(true, {requested: 'getStats', algorithm: 'straightInsertion'}, function(obj){
				loadingComplete('statsLoader');
				if($('.stats_content_container')[0]){
					$('.stats_content_container').hide('drop',{direction: 'down'},350, function(){
						$(this).remove();
					});
				}
				$('#stats_menu').after('<div id="insertion_analysis" class="stats_content_container">'+
				'<div style="background: #fff;border: 1px solid #EEE;box-shadow: 0 1px 0 #ECE9E9;border-radius: 5px; margin-top:10px;height: 150px;">'+
							'<p class="stats_title" style="">Τα στατιστικά σε αριθμούς</p>'+
							'<div class="stats_numbers">'+
								'<p class="stats_numbers_title">Πλήθος εκτελέσεων</p>'+
								'<p id="num_of_runs" class="stats_numbers_num">-</p>'+
							'</div>'+
							'<div class="stats_numbers">'+
								'<p class="stats_numbers_title">Μέσο πλήθος βημάτων</p>'+
								'<p id="num_of_steps" class="stats_numbers_num">-</p>'+
							'</div>'+
							'<div class="stats_numbers">'+
								'<p class="stats_numbers_title">Μέσος χρόνος εκτέλεσης (ms)</p>'+
								'<p id="num_of_time" class="stats_numbers_num">-</p>'+
							'</div>'+
						'</div>'+
					'<div style="background: #fff;border: 1px solid #EEE;box-shadow: 0 1px 0 #ECE9E9;border-radius: 5px; margin-top:10px;">'+
						'<p class="stats_title" style="">Μέσος χρόνος εκτέλεσης (ms) συναρτήσει του πλήθους δεδομένων</p>'+
						'<div id="time_chart" style="width: 770px; height: 300px; margin: auto;"></div>'+
					'</div>'+
					'<div style="background: #fff;border: 1px solid #EEE;box-shadow: 0 1px 0 #ECE9E9;border-radius: 5px; margin-top:10px;">'+
						'<p class="stats_title" style="">Μέσο πλήθος βημάτων συναρτήσει του πλήθους δεδομένων</p>'+
						'<div id="steps_chart" style="width: 770px; height: 300px; margin: auto;"></div>'+
					'</div>'+
				'</div>');
			
				$('#num_of_runs').html(obj.averageGeneral['straightInsertion'].algExecution.toFixed(2));
				$('#num_of_steps').html(obj.averageGeneral['straightInsertion'].stepsAverage.toFixed(2));
				$('#num_of_time').html(obj.averageGeneral['straightInsertion'].timeAverage.toFixed(2));
			
				loadTimeByNumChart(obj);
				loadStepsByNumChart(obj);
				
				$('.stats_content_container').show('drop',{direction: 'down'},250);
				
			}, 'getStatsxhr');
			break;
		case 'selection':
			loadingStart($('#content_container'), 'statsLoader', 'Ανάκτηση και επεξεργασία δεδομένων από την βάση', '_dark');
			base_ajax_call(true, {requested: 'getStats', algorithm: 'straightSelection'}, function(obj){
				loadingComplete('statsLoader');
				if($('.stats_content_container')[0]){
					$('.stats_content_container').hide('drop',{direction: 'down'},350, function(){
						$(this).remove();
					});
				}
				$('#stats_menu').after('<div id="selection_analysis" class="stats_content_container">'+
				'<div style="background: #fff;border: 1px solid #EEE;box-shadow: 0 1px 0 #ECE9E9;border-radius: 5px; margin-top:10px;height: 150px;">'+
							'<p class="stats_title" style="">Τα στατιστικά σε αριθμούς</p>'+
							'<div class="stats_numbers">'+
								'<p class="stats_numbers_title">Πλήθος εκτελέσεων</p>'+
								'<p id="num_of_runs" class="stats_numbers_num">-</p>'+
							'</div>'+
							'<div class="stats_numbers">'+
								'<p class="stats_numbers_title">Μέσο πλήθος βημάτων</p>'+
								'<p id="num_of_steps" class="stats_numbers_num">-</p>'+
							'</div>'+
							'<div class="stats_numbers">'+
								'<p class="stats_numbers_title">Μέσος χρόνος εκτέλεσης (ms)</p>'+
								'<p id="num_of_time" class="stats_numbers_num">-</p>'+
							'</div>'+
						'</div>'+
					'<div style="background: #fff;border: 1px solid #EEE;box-shadow: 0 1px 0 #ECE9E9;border-radius: 5px; margin-top:10px;">'+
						'<p class="stats_title" style="">Μέσος χρόνος εκτέλεσης (ms) συναρτήσει του πλήθους δεδομένων</p>'+
						'<div id="time_chart" style="width: 770px; height: 300px; margin: auto;"></div>'+
					'</div>'+
					'<div style="background: #fff;border: 1px solid #EEE;box-shadow: 0 1px 0 #ECE9E9;border-radius: 5px; margin-top:10px;">'+
						'<p class="stats_title" style="">Μέσο πλήθος βημάτων συναρτήσει του πλήθους δεδομένων</p>'+
						'<div id="steps_chart" style="width: 770px; height: 300px; margin: auto;"></div>'+
					'</div>'+
				'</div>');
			
				$('#num_of_runs').html(obj.averageGeneral['straightSelection'].algExecution.toFixed(2));
				$('#num_of_steps').html(obj.averageGeneral['straightSelection'].stepsAverage.toFixed(2));
				$('#num_of_time').html(obj.averageGeneral['straightSelection'].timeAverage.toFixed(2));
				loadTimeByNumChart(obj);
				loadStepsByNumChart(obj);
				
				$('.stats_content_container').show('drop',{direction: 'down'},250);
				
			}, 'getStatsxhr');
			break;
		case 'quick':
			loadingStart($('#content_container'), 'statsLoader', 'Ανάκτηση και επεξεργασία δεδομένων από την βάση', '_dark');
			base_ajax_call(true, {requested: 'getStats', algorithm: selected+'Sort'}, function(obj){
				loadingComplete('statsLoader');
				if($('.stats_content_container')[0]){
					$('.stats_content_container').hide('drop',{direction: 'down'},350, function(){
						$(this).remove();
					});
				}
				$('#stats_menu').after('<div id="quick_analysis" class="stats_content_container">'+
				'<div style="background: #fff;border: 1px solid #EEE;box-shadow: 0 1px 0 #ECE9E9;border-radius: 5px; margin-top:10px;height: 150px;">'+
							'<p class="stats_title" style="">Τα στατιστικά σε αριθμούς</p>'+
							'<div class="stats_numbers">'+
								'<p class="stats_numbers_title">Πλήθος εκτελέσεων</p>'+
								'<p id="num_of_runs" class="stats_numbers_num">-</p>'+
							'</div>'+
							'<div class="stats_numbers">'+
								'<p class="stats_numbers_title">Μέσο πλήθος βημάτων</p>'+
								'<p id="num_of_steps" class="stats_numbers_num">-</p>'+
							'</div>'+
							'<div class="stats_numbers">'+
								'<p class="stats_numbers_title">Μέσος χρόνος εκτέλεσης (ms)</p>'+
								'<p id="num_of_time" class="stats_numbers_num">-</p>'+
							'</div>'+
						'</div>'+
					'<div style="background: #fff;border: 1px solid #EEE;box-shadow: 0 1px 0 #ECE9E9;border-radius: 5px; margin-top:10px;">'+
						'<p class="stats_title" style="">Μέσος χρόνος εκτέλεσης (ms) συναρτήσει του πλήθους δεδομένων</p>'+
						'<div id="time_chart" style="width: 770px; height: 300px; margin: auto;"></div>'+
					'</div>'+
					'<div style="background: #fff;border: 1px solid #EEE;box-shadow: 0 1px 0 #ECE9E9;border-radius: 5px; margin-top:10px;">'+
						'<p class="stats_title" style="">Μέσο πλήθος βημάτων συναρτήσει του πλήθους δεδομένων</p>'+
						'<div id="steps_chart" style="width: 770px; height: 300px; margin: auto;"></div>'+
					'</div>'+
				'</div>');
			
				$('#num_of_runs').html(obj.averageGeneral[selected+'Sort'].algExecution.toFixed(2));
				$('#num_of_steps').html(obj.averageGeneral[selected+'Sort'].stepsAverage.toFixed(2));
				$('#num_of_time').html(obj.averageGeneral[selected+'Sort'].timeAverage.toFixed(2));
				loadTimeByNumChart(obj);
				loadStepsByNumChart(obj);
				
				$('.stats_content_container').show('drop',{direction: 'down'},250);
				
			}, 'getStatsxhr');
			break;
	}
	
	

	smartSliders($('.content_container_wrapper_container'));
	$('#content_container_wrapper').resize(function(){
		smartSliders($('.content_container_wrapper_container'));
	});
	
	if(hash.length !== 3){
		if(hash[2] === 'stats'){
			var selected = hash[3];
			$('.stats_menu_items').addClass('inactive');
			$('#'+selected+'_menu.stats_menu_items').removeClass('inactive');
		}
	}
	else {
		if(hash[2] === 'stats'){
			$('.stats_menu_items').addClass('inactive');
			$('#recommended_menu.stats_menu_items').removeClass('inactive');
		}
	}
}

function loadTimeChart(data){
	google.load("visualization", "1", {packages:["corechart"], callback: drawChart});
	var tableData = [['Algorithms', 'Μέσος χρόνος εκτέλεσης (ms)']];
	var i = 1;
	$.each(data.averageGeneral, function(index,value){
		tableData[i] = [index,parseInt(value.timeAverage)];
		i++;
	});
    function drawChart() {
		var data = google.visualization.arrayToDataTable(tableData);
		var options = {
			height: '300',
			width: '750',
			legend: {
				position: 'none'
			}
		};
        var chart = new google.visualization.ColumnChart(document.getElementById('time_chart'));
        chart.draw(data, options);
	}
}

function loadTimeByNumChart(data){
	google.load("visualization", "1", {packages:["corechart"], callback: drawChart});
	var tableData = [['Πλήθος δεδομένων', 'Μέσος χρόνος εκτέλεσης (ms)']];
	var i = 1;
	$.each(data.averageDataSteps, function(index,value){
		$.each(value, function(index1,value1){
			tableData[i] = [index1,parseInt(value1[0])];
			i++;
		});
	});
    function drawChart() {
		var data = google.visualization.arrayToDataTable(tableData);
		var options = {
			height: '300',
			width: '750',
			legend: {
				position: 'none'
			}
		};
        var chart = new google.visualization.LineChart(document.getElementById('time_chart'));
        chart.draw(data, options);
	}
}

function loadStepsByNumChart(data){
	google.load("visualization", "1", {packages:["corechart"], callback: drawChart});
	var tableData = [['Πλήθος δεδομένων', 'Μέσο πλήθος βημάτων']];
	var i = 1;
	$.each(data.averageData, function(index,value){
		$.each(value, function(index1,value1){
			$.each(value1, function(index2,value2){
				tableData[i] = [index1,parseInt(value2.stepsAverage)];
				i++;
			});
		});
	});
    function drawChart() {
		var data = google.visualization.arrayToDataTable(tableData);
		var options = {
			height: '300',
			width: '750',
			legend: {
				position: 'none'
			}
		};
        var chart = new google.visualization.LineChart(document.getElementById('steps_chart'));
        chart.draw(data, options);
	}
}

function loadStepsChart(data){
	google.load("visualization", "1", {packages:["corechart"], callback: drawChart});
	var tableData = [['Algorithms', 'Μέσο πλήθος βημάτων']];
	var i = 1;
	$.each(data.averageGeneral, function(index,value){
		tableData[i] = [index,parseInt(value.stepsAverage)];
		i++;
	});
    function drawChart() {
		var data = google.visualization.arrayToDataTable(tableData);
		var options = {
			height: '300',
			width: '750',
			legend: {
				position: 'none'
			}
		};
        var chart = new google.visualization.ColumnChart(document.getElementById('steps_chart'));
        chart.draw(data, options);
	}
}

function loadPerChart(data){
	google.load("visualization", "1", {packages:["corechart"], callback: drawChart});
	var tableData = [['Algorithm', 'Πλήθος εκτελέσεων']];
	var i = 1;
	$.each(data.averageGeneral, function(index,value){
		tableData[i] = [index,parseInt(value.algExecution)];
		i++;
	});

    function drawChart() {
        var data = google.visualization.arrayToDataTable(tableData);

        var options = {
			height: '300',
			width: '750',
			legend: {
				position: 'none'
			}
		};

		var chart = new google.visualization.ColumnChart(document.getElementById('run_chart'));
		chart.draw(data, options);
    }
}

/*Manage window height for smart sliders*/
function smartSliders($element){
	var height = $(window).height();
	var heightMargins = 102;
	
	var elementHeight = height - heightMargins;
	
	$element.height(elementHeight);
}

/*Return to home*/
function goToHome(url){
	if(url === 'init'){
		if(!$('#home_content')[0]){
			runEffect = function(){
				$('#logo_big').show('drop', 500);
				$('#entry_menu').delay(150).show('drop', 500);
			};
			$('#container').append('<div id="home_content">'+
				'<div id="logo_big">'+
					'<img src="img/logo.png"/>'+
				'</div>'+
				'<div id="entry_menu">'+
					'<div class="algo_menu">'+
						'<div id="sorting_alg_button" class="algo_menu_button">'+
							'<div class="button_label">'+
								'<p>αλγόριθμοι</p>'+
								'<p>ταξινόμησης</p>'+
							'</div>'+
							'<div class="circle_button big">'+
								'<img src="img/sorting.png?'+version+'"/>'+
							'</div>'+
						'</div>'+
						'<div id="searching_alg_button" class="algo_menu_button">'+
							'<div class="button_label">'+
								'<p>αλγόριθμοι</p>'+
								'<p>αναζήτησης</p>'+
							'</div>'+
							'<div class="circle_button big">'+
								'<img src="img/searching.png?'+version+'"/>'+
							'</div>'+
						'</div>'+
					'</div>'+
				'</div>'+
			'</div>');
		}
	}
	else {
		if($('#home_content')[0]){
			$('#entry_menu').hide('drop', 500);
			$('#logo_big').delay(150).hide('drop', 500, function(){
				$('#home_content').remove();
				runEffect();
				runEffect = '';
			});
		}
	}
}

/*Open login form*/
function loginForm(){
	if(!$('#register_container')[0]){
		$('body').css('overflow','hidden');
		$('#login_register_button').html('Κλείσιμο φόρμας');
		$('#container').before('<div id="register_container">'+
			'<div id="login">'+
				'<p>Είσοδος</p>'+
				'<form id="login_form" method="post">'+
					'<input name="username" id="username" class="login_field styled" type="text" placeholder="όνομα χρήστη">'+
					'<input name="password" id="password" class="login_field styled" type="password" placeholder="κωδικός">'+
				'</form>'+
			'</div>'+
			'<div id="login_tip">'+
				'<p>Δεν έχεις λογαριασμό;</p>'+
			'</div>'+
			'<a href="http://primitiveart.gr" title="Κάμτσιου Χρήστος"><img class="copy_img" src="img/primi.png"></a>'+
		'</div>');
		
		$('#container').animate({
			top : '600px'
		},350);
		
		$('#register_container').slideDown(350);
		
		/*Bind keyup event to check if form is completed*/
		$('.login_field').keyup(function(){
			var full = true;
			$('.login_field').each(function() {
				if($(this).val() === ""){
					full = false;
				}
			});
			
			/*Check if username is valid*/
			if(!$('label[for="username"]')[0]){
				if(!isValidUsername($('#username.login_field').val())){
					full = false;
					$('#username.login_field').before('<label for="username">'+
						'<img class="error" src="img/error.png?'+version+'">'+
					'</label>');
					
					$('label[for="username"]').fadeIn();
					$('#username.login_field').addClass('wrong erase');
					
					$('#login_form').after('<p class="login_form_error username_error wrong">Ουπς! Η φόρμα δέχεται μόνο αριθμούς, αγγλικούς χαρακτήρες και τα σύμβολα @ - _</p>');
					$('.login_form_error.username_error').fadeIn(200);
				}
			}
			else {
				if(isValidUsername($('#username.login_field').val())){
					$('label[for="username"]').fadeOut(function(){
						$('label[for="username"]').remove();
						$('#username.login_field').removeClass('wrong erase');
					});
					if($('.login_form_error.username_error')[0]){
						$('.login_form_error.username_error').fadeOut(200,function(){
							$('.login_form_error.username_error').remove();
						});
					}
				}
				else {
					full = false;
				}
			}
			
			if(full === true){
				if(!$('.login_form_tip')[0]){
					$('#login_form').append('<input name="login_form_btn" id="login_form_btn" class="login_form_tip" type="submit" value="Πάτησε το ENTER για να συνδεθείς!">');
					$('.login_form_tip').fadeIn(200);
				}
			}
			else {
				if($('.login_form_tip')[0]){
					$('.login_form_tip').fadeOut(200,function(){
						$('.login_form_tip').remove();
					});
				}
			}
		});
	}
	else {
		$('#login_register_button').html('Είσοδος/Εγγραφή');
		$('#container').animate({
			top : '0'
		},350);
		
		$('#register_container').slideUp(350, function(){
			$(this).remove();
			$('body').css('overflow','auto');
		});
	}
}

/*Open edit form*/
function editForm(){
	if(!$('#register_container')[0]){
		loadingStart($('#container'), 'editLoader', '');
		var userInfo = '';
		base_ajax_call(true, {requested: 'userInfo'}, function(obj){
			loadingComplete('editLoader');
			userInfo = obj;
		
			$('body').css('overflow','hidden');
			$('#logout_button').html('Κλείσιμο φόρμας');
			$('#container').before('<div id="register_container">'+
				'<div id="login" style="width: 735px;">'+
					'<p>Επεξεργασία</p>'+
					'<form id="edit_form" method="post">'+
						'<span class="login_field styled">'+userInfo.userName+'</span>'+
						'<input name="email" id="email" class="edit_field styled" type="text" placeholder="email" value="'+userInfo.userEmail+'">'+
						'<input name="oldpassword" id="oldpassword" class="edit_field styled" type="password" placeholder="παλαιός κωδικός">'+
						'<input name="password" id="password" class="edit_field styled" type="password" placeholder="νέος κωδικός">'+
						'<input name="repassword" id="repassword" class="edit_field styled" type="password" placeholder="επανάληψη κωδικού">'+
					'</form>'+
				'</div>'+
				'<div id="edit_tip">'+
					'<p>Έξοδος;</p>'+
				'</div>'+
				'<a href="http://primitiveart.gr" title="Κάμτσιου Χρήστος"><img class="copy_img" src="img/primi.png"></a>'+
			'</div>');
			
			$('#container').animate({
				top : '600px'
			},350);
			
			$('#register_container').slideDown(350);
			
			$('#edit_tip').click(function(){
				base_ajax_call(true, {requested: 'clearSession'}, function(obj){
					location.reload();
				});
			});
			
			/*Bind keyup event to check if form is completed*/
			$('.edit_field').keyup(function(){
				var full = true;
				var isOk = true;
				$('.edit_field').each(function() {
					if(($(this).attr('id') === 'email') || ($(this).attr('id') === 'oldpassword')){
						if($(this).val() === ""){
							full = false;
						}
					}
				});
				
				/*Check if email is valid*/
				if(!$('label[for="email"]')[0]){
					if($('#email.edit_field').val() !== ''){
						if(!isValidEmailAddress($('#email.edit_field').val())){
							isOk = false;
							$('#email.edit_field').before('<label for="email">'+
								'<img class="error" src="img/warning.png?'+version+'">'+
							'</label>');
							
							$('label[for="email"]').fadeIn();
							$('#email.edit_field').addClass('warning');
						}
						else {
							base_ajax_call(true, {requested: 'checkEmail', userEmail: $('#email.edit_field').val()}, function(obj){
								if(obj === true){
									isOk = false;
									$('#email.edit_field').before('<label for="email">'+
										'<img class="error" src="img/error.png?'+version+'">'+
									'</label>');
									
									$('label[for="email"]').fadeIn();
									$('#email.edit_field').addClass('wrong erase');
									
									$('#edit_form').after('<p class="register_form_error email_error wrong">Ωχ! Το email που έβαλες υπάρχει ήδη στο σύστημα.</p>');
									$('.register_form_error.email_error').fadeIn(200);
								}
							});
						}
					}
				}
				else {
					if(isValidEmailAddress($('#email.edit_field').val())){
						base_ajax_call(true, {requested: 'checkEmail', userEmail: $('#email.edit_field').val()}, function(obj){
							if(obj === -1){
								$('label[for="email"]').remove();
								$('#email.edit_field').removeClass('warning wrong erase');
								if($('.register_form_error.email_error')[0]){
									$('.register_form_error.email_error').remove();
								}
							}
							else if(obj === true){
								isOk = false;
								$('#email.edit_field').before('<label for="email">'+
									'<img class="error" src="img/error.png?'+version+'">'+
								'</label>');
									
								$('label[for="email"]').fadeIn();
								$('#email.edit_field').removeClass('warning wrong erase');
								$('#email.edit_field').addClass('wrong erase');
								
								if(!$('.register_form_error.email_error')[0]){
									$('#edit_form').after('<p class="register_form_error email_error wrong">Ωχ! Το email που έβαλες υπάρχει ήδη στο σύστημα.</p>');
									$('.register_form_error.email_error').fadeIn(200);
								}
							}
						});
					}
					else {
						isOk = false;
						
					}
				}
				
				/*Check if user gave new, old or re-pass*/
				if($('#oldpassword.edit_field').val() === ''){
					if(!$('label[for="oldpassword"]')[0]){
						isOk = false;
						
						$('#oldpassword.edit_field').before('<label for="oldpassword">'+
							'<img class="error" src="img/warning.png?'+version+'">'+
						'</label>');
										
						$('label[for="oldpassword"]').fadeIn();
						$('#oldpassword.edit_field').addClass('warning');
					}
				}
				else {
					$('label[for="oldpassword"]').fadeOut(function(){
						$('label[for="oldpassword"]').remove();
						$('#oldpassword.edit_field').removeClass('warning wrong erase');
					});
				}
				
				if(($('#oldpassword.edit_field').val() !== '') || ($('#password.edit_field').val() !== '') || ($('#repassword.edit_field').val() !== '')){
					if(($('#password.edit_field').val() !== '') || ($('#repassword.edit_field').val() !== '')){
						/*Check if re-entered pass is the same as password*/
						if(!$('label[for="repassword"]')[0]){
							if($('#repassword.edit_field').val() !== ''){
								if($('#oldpassword.edit_field').val() === ''){
									isOk = false;
									
									$('#oldpassword.edit_field').before('<label for="oldpassword">'+
										'<img class="error" src="img/warning.png?'+version+'">'+
									'</label>');
									
									$('label[for="oldpassword"]').fadeIn();
									$('#oldpassword.edit_field').addClass('warning');
								}
								if($('#password.edit_field').val() !== $('#repassword.edit_field').val()){
									isOk = false;
									
									$('#repassword.edit_field').before('<label for="repassword">'+
										'<img class="error" src="img/warning.png?'+version+'">'+
									'</label>');
									
									$('label[for="repassword"]').fadeIn();
									$('#repassword.edit_field').addClass('warning');
								}
							}
							else if($('#password.edit_field').val() !== ''){
								isOk = false;
							}
						}
						else {
							if(($('#password.edit_field').val() === $('#repassword.edit_field').val()) && ($('#oldpassword.edit_field').val() !== '')){
								$('label[for="repassword"]').fadeOut(function(){
									$('label[for="repassword"]').remove();
									$('#repassword.edit_field').removeClass('warning wrong erase');
								});
								
								if($('.register_form_error.repassword_error')[0]){
									$('.register_form_error.repassword_error').remove();
								}
								
								$('label[for="oldpassword"]').fadeOut(function(){
									$('label[for="oldpassword"]').remove();
									$('#oldpassword.edit_field').removeClass('warning wrong erase');
								});
								
								if($('.register_form_error.oldpassword_error')[0]){
									$('.register_form_error.oldpassword_error').remove();
								}
							}
							else {
								isOk = false;
								
							}
						}
					}
				}
				
				if((full === true) && (isOk === true)){
					if(!$('.register_form_tip')[0] && !$('.register_form_error')[0]){
						$('#edit_form').append('<input name="edit_form_btn" id="edit_form_btn" class="register_form_tip" type="submit" value="Πάτησε το ENTER για να ολοκληρωθεί η επεξεργασία!">');
						$('.register_form_tip').fadeIn(200);
					}
				}
				else {
					if($('.register_form_tip')[0]){
						$('.register_form_tip').fadeOut(200,function(){
							$('.register_form_tip').remove();
						});
					}
				}
			});
					
			/*Bind keyup event to check if email is valid*/
			$('#email.edit_field').blur(function(){
				if($('#email.edit_field').val() !== ''){
					if(!isValidEmailAddress($('#email.edit_field').val())){
						if($('label[for="email"]')[0]){
							$('label[for="email"]').remove();
							$('#email.edit_field').removeClass('wrong warning erase');
						}
						$('#email.edit_field').before('<label for="email">'+
							'<img class="error" src="img/error.png?'+version+'">'+
						'</label>');
						
						$('label[for="email"]').fadeIn();
						$('#email.edit_field').addClass('wrong erase');
						
						if(!$('.email_error')[0]){						
							$('#edit_form').after('<p class="register_form_error email_error wrong">Για δες καλύτερα, η διεύθυνση που έβαλες δεν φαίνεται σωστή!</p>');
							$('.register_form_error.email_error').fadeIn(200);
						}
					}
					else if(isValidEmailAddress($('#email.edit_field').val())){
						base_ajax_call(true, {requested: 'checkEmail', userEmail: $('#email.edit_field').val()}, function(obj){
							if(obj === -1){
									$('label[for="email"]').remove();
									$('#email.edit_field').removeClass('warning wrong erase');
								if($('.register_form_error.email_error')[0]){
									$('.register_form_error.email_error').remove();
								}
							}
							else if(obj === true){
								isOk = false;
								$('#email.edit_field').before('<label for="email">'+
									'<img class="error" src="img/error.png?'+version+'">'+
								'</label>');
									
								$('label[for="email"]').fadeIn();
								$('#email.edit_field').removeClass('warning wrong erase');
								$('#email.edit_field').addClass('wrong erase');
								
								if(!$('.register_form_error.email_error')[0]){
									$('#edit_form').after('<p class="register_form_error email_error wrong">Ωχ! Το email που έβαλες υπάρχει ήδη στο σύστημα.</p>');
									$('.register_form_error.email_error').fadeIn(200);
								}
							}
						});
					}
				}
			});
		});
		
	}
	else {
		$('#logout_button').html('Έξοδος/Επεξεργασία');
		$('#container').animate({
			top : '0'
		},350);
		
		$('#register_container').slideUp(350, function(){
			$(this).remove();
			$('body').css('overflow','auto');
		});
	}
}

/*Open register form*/
function registerForm(){
	if($('#register_container')[0] && !$('#register')[0]){
		$('#login').before('<div id="register">'+
			'<p>Εγγραφή</p>'+
			'<form id="register_form" method="post">'+
				'<input name="username" id="username" class="register_field styled" type="text" placeholder="όνομα χρήστη">'+
				'<input name="email" id="email" class="register_field styled" type="text" placeholder="email">'+
				'<input name="password" id="password" class="register_field styled" type="password" placeholder="κωδικός">'+
				'<input name="repassword" id="repassword" class="register_field styled" type="password" placeholder="επανάληψη κωδικού">'+
			'</form>'+
		'</div>');
		
		$('#login_tip > p').html('Έχεις ήδη λογαριασμό;');
		
		$('.login_field').attr('disabled','disabled');
		$('.login_form_tip').attr('disabled','disabled');
		
		$('#login').animate({
			opacity : '0.5'
		},350);
		
		$('#register').animate({
			width : 'toggle'
		},350);
		
		/*Bind keyup event to check if form is completed*/
		$('.register_field').keyup(function(){
			var full = true;
			var isOk = true;
			$('.register_field').each(function() {
				if($(this).val() === ""){
					full = false;
					
				}
			});
			
			/*Check if username is valid*/
			if(!$('label[for="username"]')[0]){
				if(!isValidUsername($('#username.register_field').val())){
					isOk = false;
					
					$('#username.register_field').before('<label for="username">'+
						'<img class="error" src="img/error.png?'+version+'">'+
					'</label>');
					
					$('label[for="username"]').fadeIn();
					$('#username.register_field').addClass('wrong erase');
					
					$('#register_form').after('<p class="register_form_error username_error wrong">Ουπς! Η φόρμα δέχεται μόνο αριθμούς, αγγλικούς χαρακτήρες και τα σύμβολα @ - _</p>');
					$('.register_form_error.username_error').fadeIn(200);
				}
				else {
					var username = $('#username.register_field').val();
					base_ajax_call(true, {requested: 'checkName', userName: username}, function(obj){
						if(obj === true){
							isOk = false;
							
							$('#username.register_field').before('<label for="username">'+
								'<img class="error" src="img/error.png?'+version+'">'+
							'</label>');
							
							$('label[for="username"]').fadeIn();
							$('#username.register_field').addClass('wrong erase');
							
							$('#register_form').after('<p class="register_form_error username_error wrong">Ωχ! Υπάρχει ήδη το όνομα χρήστη.</p>');
							$('.register_form_error.username_error').fadeIn(200);
						}
					});
				}
			}
			else {
				if(isValidUsername($('#username.register_field').val())){
					base_ajax_call(true, {requested: 'checkName', userName: $('#username.register_field').val()}, function(obj){
						if(obj === -1){
							$('label[for="username"]').fadeOut(function(){
								$('label[for="username"]').remove();
								$('#username.register_field').removeClass('wrong erase');
							});
							if($('.register_form_error.username_error')[0]){
								$('.register_form_error.username_error').remove();
							}
						}
					});
				}
				else {
					isOk = false;
					
				}
			}
			
			/*Check if email is valid*/
			if(!$('label[for="email"]')[0]){
				if($('#email.register_field').val() !== ''){
					if(!isValidEmailAddress($('#email.register_field').val())){
						isOk = false;
						
						$('#email.register_field').before('<label for="email">'+
							'<img class="error" src="img/warning.png?'+version+'">'+
						'</label>');
						
						$('label[for="email"]').fadeIn();
						$('#email.register_field').addClass('warning');
					}
					else {
						base_ajax_call(true, {requested: 'checkEmail', userEmail: $('#email.register_field').val()}, function(obj){
							if(obj === true){
								isOk = false;
								
								$('#email.register_field').before('<label for="email">'+
									'<img class="error" src="img/error.png?'+version+'">'+
								'</label>');
								
								$('label[for="email"]').fadeIn();
								$('#email.register_field').addClass('wrong erase');
								
								$('#register_form').after('<p class="register_form_error email_error wrong">Ωχ! Το email που έβαλες υπάρχει ήδη στο σύστημα.</p>');
								$('.register_form_error.email_error').fadeIn(200);
							}
						});
					}
				}
			}
			else {
				if(isValidEmailAddress($('#email.register_field').val())){
					base_ajax_call(true, {requested: 'checkEmail', userEmail: $('#email.register_field').val()}, function(obj){
						if(obj === -1){
								$('label[for="email"]').remove();
								$('#email.register_field').removeClass('warning wrong erase');
							if($('.register_form_error.email_error')[0]){
								$('.register_form_error.email_error').remove();
							}
						}
						else if(obj === true){
							isOk = false;
							$('#email.register_field').before('<label for="email">'+
								'<img class="error" src="img/error.png?'+version+'">'+
							'</label>');
								
							$('label[for="email"]').fadeIn();
							$('#email.register_field').removeClass('warning wrong erase');
							$('#email.register_field').addClass('wrong erase');
							
							if(!$('.register_form_error.email_error')[0]){
								$('#register_form').after('<p class="register_form_error email_error wrong">Ωχ! Το email που έβαλες υπάρχει ήδη στο σύστημα.</p>');
								$('.register_form_error.email_error').fadeIn(200);
							}
						}
					});
				}
				else {
					isOk = false;
					
				}
			}
			
			/*Check if re-entered pass is the same as password*/
			if(!$('label[for="repassword"]')[0]){
				if($('#repassword.register_field').val() !== ''){
					if($('#password.register_field').val() !== $('#repassword.register_field').val()){
						isOk = false;
						
						$('#repassword.register_field').before('<label for="repassword">'+
							'<img class="error" src="img/warning.png?'+version+'">'+
						'</label>');
						
						$('label[for="repassword"]').fadeIn();
						$('#repassword.register_field').addClass('warning');
					}
				}
			}
			else {
				if($('#password.register_field').val() === $('#repassword.register_field').val()){
					$('label[for="repassword"]').fadeOut(function(){
						$('label[for="repassword"]').remove();
						$('#repassword.register_field').removeClass('warning wrong erase');
					});
					
					if($('.register_form_error.repassword_error')[0]){
						$('.register_form_error.repassword_error').remove();
					}
				}
				else {
					isOk = false;
					
				}
			}
			
			if((full === true) && (isOk === true)){
				if(!$('.register_form_tip')[0] && !$('.register_form_error')[0]){
					$('#register_form').append('<input name="register_form_btn" id="register_form_btn" class="register_form_tip" type="submit" value="Πάτησε το ENTER για να ολοκληρωθεί η εγγραφή σου!">');
					$('.register_form_tip').fadeIn(200);
				}
			}
			else {
				if($('.register_form_tip')[0]){
					$('.register_form_tip').fadeOut(200,function(){
						$('.register_form_tip').remove();
					});
				}
			}
		});
				
		/*Bind keyup event to check if email is valid*/
		$('#email.register_field').blur(function(){
			if($('#email.register_field').val() !== ''){
				if(!isValidEmailAddress($('#email.register_field').val())){
					if($('label[for="email"]')[0]){
						$('label[for="email"]').remove();
						$('#email.register_field').removeClass('wrong warning erase');
					}
					$('#email.register_field').before('<label for="email">'+
						'<img class="error" src="img/error.png?'+version+'">'+
					'</label>');
					
					$('label[for="email"]').fadeIn();
					$('#email.register_field').addClass('wrong erase');
						
					$('#register_form').after('<p class="register_form_error email_error wrong">Για δες καλύτερα, η διεύθυνση που έβαλες δεν φαίνεται σωστή!</p>');
					$('.register_form_error.email_error').fadeIn(200);
				}
				else if(isValidEmailAddress($('#email.register_field').val())){
					base_ajax_call(true, {requested: 'checkEmail', userEmail: $('#email.register_field').val()}, function(obj){
						if(obj === -1){
								$('label[for="email"]').remove();
								$('#email.register_field').removeClass('warning wrong erase');
							if($('.register_form_error.email_error')[0]){
								$('.register_form_error.email_error').remove();
							}
						}
						else if(obj === true){
							isOk = false;
							$('#email.register_field').before('<label for="email">'+
								'<img class="error" src="img/error.png?'+version+'">'+
							'</label>');
								
							$('label[for="email"]').fadeIn();
							$('#email.register_field').removeClass('warning wrong erase');
							$('#email.register_field').addClass('wrong erase');
							
							if(!$('.register_form_error.email_error')[0]){
								$('#register_form').after('<p class="register_form_error email_error wrong">Ωχ! Το email που έβαλες υπάρχει ήδη στο σύστημα.</p>');
								$('.register_form_error.email_error').fadeIn(200);
							}
						}
					});
				}
			}
		});
		
		/*Bind keyup event to check if re-entered password is the same as password*/
		$('#repassword.register_field').blur(function(){
			if($('#repassword.register_field').val() !== ''){
				if($('#password.register_field').val() !== $('#repassword.register_field').val()){
					if($('label[for="repassword"]')[0]){
						$('label[for="repassword"]').remove();
						$('#repassword.register_field').removeClass('wrong warning erase');
					}
					$('#repassword.register_field').before('<label for="repassword">'+
						'<img class="error" src="img/error.png?'+version+'">'+
					'</label>');
						
					$('label[for="repassword"]').fadeIn();
					$('#repassword.register_field').addClass('wrong erase');

					$('#register_form').after('<p class="register_form_error repassword_error wrong">Φοβάμαι πως έκανες λάθος στην επανάληψη του κωδικού.</p>');
					$('.register_form_error.repassword_error').fadeIn(200);	
				}
			}
			else if($('#password.register_field').val() === $('#repassword.register_field').val()){
				$('label[for="repassword"]').fadeOut(function(){
					$('label[for="repassword"]').remove();
					$('#repassword.register_field').removeClass('wrong warning erase');
				});
					
				if($('.register_form_error.repassword_error')[0]){
					$('.register_form_error.repassword_error').fadeOut(200,function(){
						$('.register_form_error.repassword_error').remove();
					});
				}
			}
		});
	}
	else if($('#register_container')[0]){
		$('#login_tip > p').html('Δεν έχεις λογαριασμό;');
		
		$('.login_field').removeAttr('disabled');
		$('.login_form_tip').removeAttr('disabled');
		
		$('#login').animate({
			opacity : '1'
		},350);
		
		$('#register').animate({
			width : 'toggle'
		},350, function(){
			$(this).remove();
		});
	}
}

/*Function to decode URI - for page titles*/
function decode(str) {
    return decodeURIComponent(str);
}

/*Function to update page title*/
function updateTitle(data){   
    var title = decode(data);
	document.title = 'Algorithm gallery/'+title;
}

/*Function to manage button effects on hover etc*/
function manageButtonsEffects($element,event){
	var values = 
	{
		'enter': {
			'dimensions': '156px',
			'margin' : '-10px',
			'marginChild' : '35px'
		},
		'leave': {
			'dimensions': '136px',
			'margin' : '0px',
			'marginChild' : '25px'
		}
	};
	
	if(windowSize == 1){
		values = 
		{
			'enter': {
				'dimensions': '130px',
				'margin' : '-10px',
				'marginChild' : '35px'
			},
			'leave': {
				'dimensions': '110px',
				'margin' : '0px',
				'marginChild' : '25px'
			}
		};
	}
	
	if(event === 'in'){
		$element.stop().animate({
			height : values.enter.dimensions,
			width : values.enter.dimensions, 
			marginTop : values.enter.margin
		},200);
		$element.children('img').stop().animate({
			marginTop : values.enter.marginChild
		},200);
	}
	else if(event === 'out'){
		$element.stop().animate({
			height : values.leave.dimensions,
			width : values.leave.dimensions,
			marginTop : values.leave.margin		
		},200);
		$element.children('img').stop().animate({
			marginTop : values.leave.marginChild
		},200);
	}
}

/*Function to check if given username is valid (supports @ _ -)*/
function isValidUsername(uname) {
    var pattern = new RegExp(/^([\w]*[\-\@]*)+$/i);
    return pattern.test(uname);
}

/*Function to check if given email address is valid*/
function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(emailAddress);
}

/*Function to show bubble messages*/
function showBubble($element, bounce, message, position, arrow, clickToClose, time) {
    var elTag = '';
    if ($element instanceof Object) {
        if (typeof $element.attr('id') !== 'undefined') {
            elTag = '_' + $element.attr('id');
        } else if (typeof $element.attr('class') !== 'undefined') {
            var classAtr = $element.attr('class').split(' ')[0];
            elTag = '_' + classAtr;
        }
    }
    if (!(position instanceof Object) && (position === 'auto') && ($element instanceof Object)) {
		var offset = $element.offset();
		if(arrow.indexOf('side left') > -1){
			position = {left: offset.left + $element.width() + 50 + 'px',top: offset.top + 'px'};
		}
		else {
			position = {left: offset.left - 10 + 'px',top: offset.top + 40 + 'px'};
		}
    }
    var bubbleId = Math.ceil(Math.random() * 100) + elTag;
    $('body').prepend('<div id="' + bubbleId + '" class="help_hint" style="margin-left:' + position.left + ';margin-top:' + position.top + ';width:auto;height:auto;">' + '<div class="help_arrow ' + arrow + '"></div>' + '<p style="margin-left: 8px; padding-right: 10px;">' + message + '</p>' + '</div>');
    if (clickToClose == true) {
        $('#' + bubbleId + '').prepend('<img class="help_close" src="img/close_bubble.png">');
    }
    $('.help_hint').fadeIn('normal');
    if (($element !== 'none') && (bounce == true)) {
        $element.effect('bounce', 500);
        var bounceTimer = setInterval(function() {
            $element.effect('bounce', 500);
        }, 10000);
    }
    if ((time !== '') && (isNumber(time))) {
        var activeTimer = setTimeout(function() {
            closeHint();
        }, time);
    }
    $('.help_hint').click(function() {
        closeHint();
    });
    if (clickToClose == false) {
        setTimeout(function(){
			$(window).click(function() {
				$(window).unbind('click');
				closeHint();
			});
			$(window).keypress(function() {
				$(window).unbind('click');
				closeHint();
			});
		}, 50);
    }
    function closeHint() {
        $('#' + bubbleId + '').fadeOut('normal', function() {
            if (typeof bounceTimer !== 'undefined') {
                clearInterval(bounceTimer);
            }
            $('#' + bubbleId + '').remove();
        });
    }
	
	return bubbleId;
};

/*Function to create random numbers*/
function range(count,max) {
	var foo = [];
	for (var i = 0; i < count; i++) {
		foo.push(Math.floor(Math.random()*max));
	}
	return foo;
}

/*Function to move caret to end when focusing on a textarea*/
function moveCaretToEnd(el) {
    if (typeof el.selectionStart == "number") {
        el.selectionStart = el.selectionEnd = el.value.length;
    } else if (typeof el.createTextRange != "undefined") {
        el.focus();
        var range = el.createTextRange();
        range.collapse(false);
        range.select();
    }
};

/*Function to clear all inline css from an element*/
function clearCss($element){
	$element.removeAttr("style");
}

/*Loader functions*/
function loadingComplete(uniqueID){
	if(typeof uniqueID === 'undefined'){
		$('#loader').remove();
	}
	else {
		$('.'+uniqueID+'').remove();
	}
}

function loadingStart($element, uniqueID, loadingMsg, style){
	if(typeof style === 'undefined'){
		style = '';
	}
	if(!$('.'+uniqueID)[0]){
		$element.append('<div id="loader" class="'+uniqueID+'"><img src="img/loader'+style+'.gif"></div>');
		
		if(loadingMsg !== ''){
			$('.'+uniqueID+'').prepend('<p>'+loadingMsg+'</p>');
		}
	
	}
}


