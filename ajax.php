<?php	
	session_start();
	include_once 'functions.php';
	
	$dosetval = isset($_POST['value']);
	
	if (isset($_POST['requested'])){
		if ($dosetval){
			$_SESSION[$_POST['requested']] = $_POST['value'];
		}
		else{
			if ($_POST['requested'] == "userInfo"){
				if(checkSession()){
					$id = $_SESSION['user_id'];
					
					$retVal = getUser($id);
					
					print json_encode($retVal);
				}
			}
			else
			if ($_POST['requested'] == "checkName"){
				$userName = $_POST['userName'];
				$retVal = checkUser($userName);
				
				print json_encode($retVal);
			}
			else
			if ($_POST['requested'] == "checkEmail"){
				$userEmail = $_POST['userEmail'];
				$retVal = checkEmail($userEmail);
				
				print json_encode($retVal);
			}
			else
			if ($_POST['requested'] == "sesexe"){
				if(checkSession()){
					$id = $_SESSION['user_id'];
				}
				else { 
					$id = 12; 
				}
				
				$retVal = saveAlgSes($id);
					
				print json_encode($retVal);
			}
			else
			if ($_POST['requested'] == "saveStats"){
				$exeID = $_POST['exeID'];
				$array = $_POST['array'];
				if(is_array($array)){
					$arrayString = implode(",", $array);
				}
				$isRecommended = $_POST['isRecommended'];
				$length = $_POST['length'];
				$algorithm = $_POST['algorithm'];
				$order = $_POST['order'];
				$target = $_POST['target'];
				$typeOfData = $_POST['typeOfData'];
				$steps = $_POST['steps'];
				$time = $_POST['time'];
				
				$retVal = saveStats($exeID, $arrayString, $isRecommended, $length, $algorithm, $order, $target, $typeOfData, $steps, $time);
				
				print json_encode($retVal);
			}
			else
			if ($_POST['requested'] == "getStatsRecommended"){
				if(checkSession()){
					$id = $_SESSION['user_id'];
				}
				else { 
					$id = 12; 
				}
				$type = $_POST['type'];
				
				$retVal = getStatsProcessed($id, 0, $type);
				
				print json_encode($retVal);
			}
			else
			if ($_POST['requested'] == "getStats"){
				$algorithm = $_POST['algorithm'];
				
				$retVal = getStatsProcessed(0, $algorithm, 0);
				
				print json_encode($retVal);
			}
			else
			if ($_POST['requested'] == "clearFromSession"){
				if(isset($_SESSION[$_POST['sessionVar']])){
					unset($_SESSION[$_POST['sessionVar']]);
				}
			}
			else
			if ($_POST['requested'] == "clearSession"){
				clearSession();
				
				print json_encode('cleared!');
			}
			else
			if (isset($_SESSION[$_POST['requested']])){
				print json_encode($_SESSION[$_POST['requested']]);
			}
			else{
				print json_encode(null);
			}
		}
	}
	else {
		if (!$dosetval){
			print null;
		}
	}
?>