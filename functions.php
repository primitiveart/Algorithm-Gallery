<?php

$con = '';

//Create connection
function connectToDB(){
	global $con;
	$con = mysqli_connect("localhost","root","sortalg","algal");
	
	//Check connection if error write error message in session
	if (mysqli_connect_errno($con)){
		$_SESSION['error'] = mysqli_connect_error();
	}
}

//Close connection
function closeConnection(){
	global $con;
	mysqli_close($con);
	unset($con);
}

//Check session, if user is logged in
function checkSession(){
	if(isset($_SESSION['login']) && $_SESSION['login'] == 1) {
		if(isset($_SESSION['user_id'], $_SESSION['user_name'], $_SESSION['verification_string'])){
			$user_id = $_SESSION['user_id'];
			$verification_string = $_SESSION['verification_string'];
			$user_browser = $_SERVER['HTTP_USER_AGENT'];
			
			$new_ver = hash('sha512', $user_id.$user_browser);
			if($verification_string == $new_ver){
				return true;
			}
			else {
				return false;
			}
		} 
		else {
			return false;
		}
	}
	else {
		return false;
	}
}

//Clear sessions
function clearSession(){
	session_unset();
	session_destroy();
}

//Check if email address is valid
function isValidEmailAddress($emailAddress){
	return preg_match("^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$^", $emailAddress);
}

//Check if username is valid (only latin chars, _, -, @ and numbers)
function isValidUsername($userName){
	return preg_match("/^([\w]*[\-\@]*)+$/i", $userName);
}

//Password hashing function compilation of sha1 and blowfish
function passHash($salt, $pass){		
	$hash = sha1($pass);

	$finalHash = hash('sha512', $hash.$salt);

	return $finalHash;
}

function loginUser($userName, $userPass){
	global $con;
	if($stmt = $con->prepare("SELECT userID, userName, userPass, userSalt FROM users WHERE userName = ? LIMIT 1")) { 
		$stmt->bind_param('s', $userName);
		$stmt->execute();
		$stmt->store_result();
		$stmt->bind_result($user_id, $user_name, $db_password, $salt);
		$stmt->fetch();
		
		if($stmt->num_rows == 1){
			if($db_password == passHash($salt, $userPass)) {
				$user_browser = $_SERVER['HTTP_USER_AGENT'];
				$_SESSION['login'] = 1;
                $user_id = preg_replace("/[^0-9]+/", "", $user_id); 
                $_SESSION['user_id'] = $user_id; 
                $user_name = preg_replace("/[^a-zA-Z0-9_\-]+/", "", $user_name); 
                $_SESSION['user_name'] = $user_name;
				$_SESSION['verification_string'] = hash('sha512', $user_id.$user_browser);
                //Login successful
               return true;    
			}
			else {
				return -2; //wrong pass
			}
		}
		else {
			return -1; //no user
		}
	}
	else {
		return -3; //problem with db
	}
}

function logoutUser(){
	global $con;
	
	clearSession();
}

function registerUser($userName, $userPass, $userEmail){
	global $con;
	$randomSalt = hash('sha512', uniqid(mt_rand(1, mt_getrandmax()), true));
	$password = passHash($randomSalt, $userPass);
	
	if(isValidEmailAddress($userEmail) && isValidUsername($userName)){
		if($stmt = $con->prepare("SELECT userName FROM users WHERE userName = ? or userEmail = ? LIMIT 1")){ 
			$stmt->bind_param('ss', $userName, $userEmail);
			$stmt->execute();
			$stmt->store_result();
			$stmt->bind_result($user_name);
			$stmt->fetch();
			
			if($stmt->num_rows == 0){
				if($insert_stmt = $con->prepare("INSERT INTO users (userName, userEmail, userPass, userSalt) VALUES (?, ?, ?, ?)")){    
				   $insert_stmt->bind_param('ssss', $userName, $userEmail, $password, $randomSalt); 
				   $insert_stmt->execute();
				   
				   return true;
				}
				else {
					return -3; //problem with db
				}
			}
			else {
				return -4; //username or email exists
			}
		}
		else {
			return -3; //problem with db
		}
	}
	else {
		return -5; //invalid email or username
	}
}

function updateUser($userName, $userPass, $newUserEmail, $newUserPass){
	global $con;
	$ret = array(0,0);
	if(($newUserEmail !== 0) || ($newUserPass !== 0)){
		if($stmt = $con->prepare("SELECT userID, userEmail, userPass, userSalt FROM users WHERE userName = ? LIMIT 1")){ 
			$stmt->bind_param('s', $userName);
			$stmt->execute();
			$stmt->store_result();
			$stmt->bind_result($user_id, $user_email, $db_password, $salt);
			$stmt->fetch();
			
			if($stmt->num_rows == 1){
				if($db_password == passHash($salt, $userPass)) {
					if(($newUserEmail !== 0) && ($newUserEmail !== $user_email)){
						if(isValidEmailAddress($newUserEmail)){
							if($check_stmt = $con->prepare("SELECT userName FROM users WHERE userEmail = ? LIMIT 1")){ 
								$check_stmt->bind_param('s', $newUserEmail);
								$check_stmt->execute();
								$check_stmt->store_result();
								$check_stmt->bind_result($user_name);
								$check_stmt->fetch();
								
								if($check_stmt->num_rows == 0){
									if($update_stmt = $con->prepare("UPDATE users SET userEmail=? WHERE userID=? LIMIT 1")){    
									   $update_stmt->bind_param('si', $newUserEmail, $user_id); 
									   $update_stmt->execute();
									   
									   $ret[0] = true;
									}
									else {
										$ret[0] = -3; //problem with db
									}
								}
								else {
									$ret[0] = -4; //username or email exists
								}
							}
						}
						else {
							$ret[0] = -5; //invalid email or username
						}
					}
					if(($newUserPass !== 0)){
						if($db_password !== passHash($salt, $newUserPass)){
							$randomSalt = hash('sha512', uniqid(mt_rand(1, mt_getrandmax()), true));
							$password = passHash($randomSalt, $newUserPass);
							if($update_stmt = $con->prepare("UPDATE users SET userPass=?, userSalt=? WHERE userID=? LIMIT 1")){    
								$update_stmt->bind_param('ssi', $password, $randomSalt, $user_id); 
								$update_stmt->execute();
								
								$ret[1] = true;
							}
							else {
								$ret[1] = -3; //problem with db
							}
						}
					}
				}
				else {
					$ret[1] = -2; //wrong pass
				}
			}
			else {
				$ret[0] = -1; //no user
			}
		}
		else {
			$ret[0] = -3; //problem with db
		}
	}
	else {
		$ret[0] = -6; //no change value given
	}
	
	return $ret;
}

function getUser($userID){
	global $con;
	if($stmt = $con->prepare("SELECT userID, userName, userEmail FROM users WHERE userID = ? LIMIT 1")) { 
		$stmt->bind_param('s', $userID);
		$stmt->execute();
		$stmt->store_result();
		$stmt->bind_result($user_id, $user_name, $user_email);
		$stmt->fetch();
		
		if($stmt->num_rows == 1){
			return array('userID' => $user_id, 'userName' => $user_name, 'userEmail' => $user_email);
		}
		else {
			return -1; //no user
		}
	}
	else {
		return -3; //problem with db
	}
}

function checkUser($userName){
	global $con;
	if($stmt = $con->prepare("SELECT userName FROM users WHERE userName = ? LIMIT 1")) { 
		$stmt->bind_param('s', $userName);
		$stmt->execute();
		$stmt->store_result();
		$stmt->bind_result($user_name);
		$stmt->fetch();
		
		if($stmt->num_rows == 1){
			return true;
		}
		else {
			return -1; //no user
		}
	}
	else {
		return -3; //problem with db
	}
}

function checkEmail($userEmail){
	global $con;
	if($stmt = $con->prepare("SELECT userEmail, userID FROM users WHERE userEmail = ? LIMIT 1")) { 
		$stmt->bind_param('s', $userEmail);
		$stmt->execute();
		$stmt->store_result();
		$stmt->bind_result($user_email, $user_id);
		$stmt->fetch();
		
		if($stmt->num_rows == 1){
			if(checkSession()){
				if($_SESSION['user_id'] == $user_id){
					return -1; 
				}
				else {
					return true;
				}
			}
			else {
				return true;
			}
		}
		else {
			return -1; //no user
		}
	}
	else {
		return -3; //problem with db
	}
}

function saveAlgSes($userID){
	global $con;
	$date = new DateTime;
	$dateTime = $date->format('Y-m-d\TH:i:s');
	if($insert_stmt = $con->prepare("INSERT INTO sesexe (userID, dateTime) VALUES (?, ?)")){    
		$insert_stmt->bind_param('is', $userID, $dateTime); 
		$insert_stmt->execute();
		
		$id = $insert_stmt->insert_id;
		return $id;
	}
	else {
		return -3; //problem with db
	}
}

function saveStats($exeID, $array, $isRecommended, $length, $algorithm, $order, $target, $typeOfData, $steps, $time){
	global $con;
	if($insert_stmt = $con->prepare("INSERT INTO algstats (exeID, array, isRecommended, length, algorithm, `order`, target, typeOfData, steps, time) SELECT ?, ?, ?, ?, algID, ?, ?, ?, ?, ? from algorithms WHERE algName = ?")){    
		$insert_stmt->bind_param('isiisssiis', $exeID, $array, $isRecommended, $length, $order, $target, $typeOfData, $steps, $time, $algorithm); 
		$insert_stmt->execute();
		
		return true;
	}
	else {
		return -3; //problem with db
	}
}

function getStats($exeID, $userID, $isRecommended, $length, $algorithm, $algType, $typeOfData, $from, $for){
	global $con;
	$ret = '';
	/*Variable used to make multi parameter query*/
	$userIDOR = 0;
	$isRecommendedOR = 0;
	$lengthOR = 0;
	$algorithmOR = 0;
	$algTypeOR = 0;
	$typeOfDataOR = 0;
	if($for == 0){ /*If for limit is 0 then return all - to achieve this must give big number*/
		$for = 1844674407; 
	}
	if($exeID !== 0){
		if($stmt = $con->prepare("SELECT sesexe.userID, users.userName, sesexe.dateTime, algstats.array, algstats.isRecommended, algstats.length, algstats.algorithm, algorithms.algName, algstats.order, algstats.target, algstats.typeOfData, algstats.steps, algstats.time FROM algstats INNER JOIN sesexe ON algstats.exeID = sesexe.exeID INNER JOIN users ON sesexe.userID = users.userID INNER JOIN algorithms ON algstats.algorithm = algorithms.algID WHERE algstats.exeID = ? LIMIT ?,?")) { 
			$stmt->bind_param('sii', $exeID, $from, $for);
			$stmt->execute();
			$stmt->store_result();
			$stmt->bind_result($userID, $userName, $dateTime, $array, $isRecommended, $length, $algID, $algName, $order, $target, $typeOfData, $steps, $time);
			
			while ($stmt->fetch()) { // For each row
				$ret[] = array('userID' => $userID, 'userName' => $userName, 'dateTime' => $dateTime, 'array' => $array, 'isRecommended' => $isRecommended, 'length' => $length, 'algID' => $algID, 'algName' => $algName, 'order' => $order, 'target' => $target, 'typeOfData' => $typeOfData, 'steps' => $steps, 'time' => $time);
			}	
			
			return $ret;
		}
		else {
			return -3; //problem with db
		}
	}
	else {
		if($userID === 0){
			$userIDOR = 1;
		}
		if($isRecommended === 3){
			$isRecommendedOR = 1;
		}
		if($length === 0){
			$lengthOR = 1;
		}
		if($algorithm === 0){
			$algorithmOR = 1;
		}
		if($algType === 0){
			$algTypeOR = 1;
		}
		if($typeOfData === 0){
			$typeOfDataOR = 1;
		}
		if($stmt = $con->prepare("SELECT sesexe.userID, users.userName, sesexe.dateTime, algstats.array, algstats.isRecommended, algstats.length, algstats.algorithm, algorithms.algName, algorithms.algType, algstats.order, algstats.target, algstats.typeOfData, algstats.steps, algstats.time FROM algstats INNER JOIN sesexe ON algstats.exeID = sesexe.exeID INNER JOIN users ON sesexe.userID = users.userID INNER JOIN algorithms ON algstats.algorithm = algorithms.algID WHERE (sesexe.userID = ? OR 1 = ?) AND (algstats.isRecommended = ? OR 1 = ?) AND (algstats.length = ? OR 1 = ?) AND (algorithms.algName = ? OR 1 = ?) AND (algorithms.algType = ? OR 1 = ?) AND (algstats.typeOfData = ? OR 1 = ?) LIMIT ?,?")) { 
			$stmt->bind_param('siiiiisisisiii', $userID, $userIDOR, $isRecommended, $isRecommendedOR, $length, $lengthOR, $algorithm, $algorithmOR, $algType, $algTypeOR, $typeOfData, $typeOfDataOR, $from, $for);
			$stmt->execute();
			$stmt->store_result();
			$stmt->bind_result($userID, $userName, $dateTime, $array, $isRecommended, $length, $algID, $algName, $algType, $order, $target, $typeOfData, $steps, $time);
			
			while ($stmt->fetch()) { // For each row
				$ret[] = array('userID' => $userID, 'userName' => $userName, 'dateTime' => $dateTime, 'array' => $array, 'isRecommended' => $isRecommended, 'length' => $length, 'algID' => $algID, 'algName' => $algName, 'algType' => $algType, 'order' => $order, 'target' => $target, 'typeOfData' => $typeOfData, 'steps' => $steps, 'time' => $time);
			}	
			
			return $ret;
		}
		else {
			return -3; //problem with db
		}
	}
}

function getStatsByExeID($exeID, $from, $for){
	return getStats($exeID, 0, 3, 0, 0, 0, 0, $from, $for);
}

function getStatsGeneral($userID, $length, $algorithm, $algType, $typeOfData, $from, $for){
	return getStats(0, $userID, 3, $length, $algorithm, $algType, $typeOfData, $from, $for);
}

function getStatsRecommended($userID, $length, $algorithm, $algType, $typeOfData, $from, $for){
	return getStats(0, $userID, 1, $length, $algorithm, $algType, $typeOfData, $from, $for);
}

function getStatsNotRecommended($userID, $length, $algorithm, $algType, $typeOfData, $from, $for){
	return getStats(0, $userID, 0, $length, $algorithm, $algType, $typeOfData, $from, $for);
}

function getStatsProcessed($userID, $algorithm, $algType){
	if($userID !== 0){
		$raw = getStatsRecommended($userID, 0, 0, $algType, 0, 0, 0);
	}
	else {
		$raw = getStatsGeneral(0, 0, $algorithm, 0, 0, 0, 0);
	}
	$raw = json_decode(json_encode($raw), FALSE);
	$group = array();
	$average = array();
	$algorithmNum = array();
	$finalAverage = array();
	$groupAverage = array();
	$stepsAv = 0;
	$averagePerSteps = array();
	$previousKey = '';
	$retVal = array();
	
	if($raw !== ''){
		foreach($raw as $key => $value){
			$group[$value->algName][$value->length][] = $value;
			if(!isset($average[$value->algName])){
				$average[$value->algName][$value->length][$value->userID] = (object) array('average' => $value->time, 'sum' => $value->time, 'stepsAverage' => $value->steps, 'stepsSum' => $value->steps, 'num' => 1);
				$algorithmNum[$value->algName] = 1;
			}
			else {
				if(!isset($average[$value->algName][$value->length])){
					$average[$value->algName][$value->length][$value->userID] = (object) array('average' => $value->time, 'sum' => $value->time, 'stepsAverage' => $value->steps, 'stepsSum' => $value->steps, 'num' => 1);
					$algorithmNum[$value->algName] += 1;
				}
				else {
					if(!isset($average[$value->algName][$value->length][$value->userID])){
						$average[$value->algName][$value->length][$value->userID] = (object) array('average' => $value->time, 'sum' => $value->time, 'stepsAverage' => $value->steps, 'stepsSum' => $value->steps, 'num' => 1);
						$algorithmNum[$value->algName] += 1;
					}
					else {
						$average[$value->algName][$value->length][$value->userID]->num += 1;
						$average[$value->algName][$value->length][$value->userID]->sum += $value->time;
						$average[$value->algName][$value->length][$value->userID]->stepsSum += $value->steps;
						$average[$value->algName][$value->length][$value->userID]->average = $average[$value->algName][$value->length][$value->userID]->sum / $average[$value->algName][$value->length][$value->userID]->num;
						$average[$value->algName][$value->length][$value->userID]->stepsAverage = $average[$value->algName][$value->length][$value->userID]->stepsSum / $average[$value->algName][$value->length][$value->userID]->num;
						$algorithmNum[$value->algName] += 1;
					}
				}
			}
		}
	}
	
	foreach($average as $key => $value){
		foreach($value as $numKey => $numValue){
			$stepAv = 0;
			foreach($numValue as $idKey => $idValue){
				if($previousKey !== $key){
					$previousKey = $key;
					$stepAv = $idValue->average;
					$finalAverage[$key] = (object) array('average' => $idValue->average, 'sum' => $idValue->average, 'stepsAverage' => $idValue->stepsAverage, 'stepsSum' => $idValue->stepsAverage, 'num' => 1);
					$groupAverage[$key] = (object) array('timeAverage' => $finalAverage[$key]->average, 'stepsAverage' => $finalAverage[$key]->stepsAverage, 'algExecution' => $algorithmNum[$key]);
				}
				else {
					$stepAv += $idValue->average;
					$finalAverage[$key]->num += 1;
					$finalAverage[$key]->sum += $idValue->average;
					$finalAverage[$key]->stepsSum += $idValue->stepsAverage;
					$finalAverage[$key]->average = $finalAverage[$key]->sum / $finalAverage[$key]->num;
					$finalAverage[$key]->stepsAverage = $finalAverage[$key]->stepsSum / $finalAverage[$key]->num;
					$groupAverage[$key] = (object) array('timeAverage' => $finalAverage[$key]->average, 'stepsAverage' => $finalAverage[$key]->stepsAverage, 'algExecution' => $algorithmNum[$key]);
				}
			}
			$averagePerSteps[$key][$numKey][] = $stepAv;
		}
	}
	
	$retVal = (object) array('groupedData' => $group, 'averageData' => $average, 'averageDataSteps' => $averagePerSteps, 'averageGeneral' => $groupAverage);
	return $retVal;
}

connectToDB();

if(isset($_POST['register_form_btn'])){
	if(isset($_POST['username']) && isset($_POST['email']) && isset($_POST['password']) && isset($_POST['repassword'])){
		if($_POST['password'] === $_POST['repassword']){
			$userName = $_POST['username'];
			$userPass = $_POST['password'];
			$userEmail = $_POST['email'];
			
			$reg = registerUser($userName, $userPass, $userEmail);
			if($reg === true){
				loginUser($userName, $userPass);
			}
			else {
				//not registered
			}
		}
		else {
			//wrong re-pass
		}
	}
	else {
		//not all set
	}
	
	$_POST['register_form_btn'];
}

if(isset($_POST['login_form_btn'])){
	if(isset($_POST['username']) && isset($_POST['password'])){
		$userName = $_POST['username'];
		$userPass = $_POST['password'];
			
		$log = loginUser($userName, $userPass);
		if($log === true){
			
		}
		else {
			//not logged in
		}
	}
	else {
		//not all set
	}
	
	$_POST['login_form_btn'];
}

if(isset($_POST['edit_form_btn'])){
	if(isset($_POST['email']) && isset($_POST['oldpassword'])){
		$userName = $_SESSION['user_name'];
		$userPass = $_POST['oldpassword'];
		$newUserEmail = $_POST['email'];
		$newUserPass = 0;
		if(isset($_POST['password']) && isset($_POST['repassword'])){
			if($_POST['password'] !== '' && $_POST['repassword'] !== ''){
				$newUserPass = $_POST['password'];
			}
		}
			
		$edit = updateUser($userName, $userPass, $newUserEmail, $newUserPass);
		if($edit === true){
			
		}
		else {
			//not edited
		}
	}
	else {
		//not all set
	}
	
	$_POST['edit_form_btn'];
}

?>