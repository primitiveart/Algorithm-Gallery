<?php
	session_start();
	error_reporting(0);
	require_once('functions.php');
	include_once('ajax.php');
	
	$user_connected = checkSession();
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<title>Algorithm gallery</title>
<link href="style.css" rel="stylesheet" type="text/css" media="screen" />
<link rel="stylesheet" type="text/css" href="jslibs/jquery.snippet.min.css" />
<link rel="apple-touch-icon-precomposed" href="/img/icon.png" / >
<meta name="title" content="Algorithm gallery" />
<link rel="image_src" href="/img/icon.png" / >
<link rel="shortcut icon" href="img/favicon.ico" type="image/ico">
<script src="jslibs/jquery-1.10.2.min.js" type="text/javascript"></script>
<script src="jslibs/jquery-ui.min.js" type="text/javascript"></script>
<script src="jslibs/jquery.ba-resize.min.js" type="text/javascript"></script>
<script src="functions.js" type="text/javascript"></script>
<script type="text/javascript" src="jslibs/jquery.snippet.min.js"></script>
</script>
</head>
<body class="gradient">
	<div id="container">
		<?php
			if(!$user_connected){?>
			<div id="login_register_button">Είσοδος/Εγγραφή</div>
		<?php }
			else {?>
			<div id="logout_button">Έξοδος/Επεξεργασία</div>
		<?php }?>
		<div id="home_content">
			<div id="logo_big">
				<img src="img/logo.png"/>
			</div>
			<div id="entry_menu">
				<div class="algo_menu">
					<div id="sorting_alg_button" class="algo_menu_button">
						<div class="button_label">
							<p>αλγόριθμοι</p>
							<p>ταξινόμησης</p>
						</div>
						<div class="circle_button big">
							<img src="img/sorting.png"/>
						</div>
					</div>
					<div id="searching_alg_button" class="algo_menu_button">
						<div class="button_label">
							<p>αλγόριθμοι</p>
							<p>αναζήτησης</p>
						</div>
						<div class="circle_button big">
							<img src="img/searching.png"/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
<script src="sortingAlgObject.js" type="text/javascript"></script>
<script src="searchingAlgObject.js" type="text/javascript"></script>
<script src="graphlug.js" type="text/javascript"></script>	
<script src="jslibs/jquery.autosize.min.js" type="text/javascript"></script>	
<script src="jslibs/jsapi.js" type="text/javascript"></script>	
</body>
</html>
