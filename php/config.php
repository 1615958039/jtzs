<?php
	error_reporting(0);
	header("Content-Type: text/html;charset=utf-8");
	date_default_timezone_set("Asia/Shanghai");
	


	$wx_id = "xxx";//小程序ID
	$wx_key = "xxx";//AppSecret(小程序密钥)
	

	
	
	/* 数据库 -> IP，账号，密码，表名 */
	
	$loca = '127.0.0.1';
	$user = 'root';
	$pass = '';
	$name = '';
	
	/* 时间日期 */ 	$date = date("Y-m-d H:i:s"); 
	/* 时间戳 */		$time = time();
	
	/* 小程序设置 */
	/* 每页显示的数据3*10 */		$pagenum = 30;
	
	
	
	
	$dbconnect  =  mysqli_connect($loca,$user,$pass,$name);
	if(!$dbconnect)die('服务器链接失败~');
	mysqli_set_charset($dbconnect,'UTF8');
	$sql = function($sqlstatement,$type='')use($dbconnect){
		if(strpos($sqlstatement,"count(*)")>0){
			$result = mysqli_query($dbconnect, $sqlstatement);
			$row = mysqli_fetch_assoc($result);
			return $row['count(*)'];
		}else if(strpos($sqlstatement,"select")===0 || strpos($sqlstatement,"SELECT")===0){
			$result = mysqli_query($dbconnect, $sqlstatement);
			if($type=="list"){
				$i=0;$arr=array();
				while($row = mysqli_fetch_assoc($result))$arr[$i++] = $row;
				return $arr;
			}
			return mysqli_fetch_assoc($result);
		}else if(strpos($sqlstatement,"UPDATE")===0 || strpos($sqlstatement,"update")===0 ||
				 strpos($sqlstatement,"INSERT")===0 || strpos($sqlstatement,"insert")===0 ||
				 strpos($sqlstatement,"DELETE")===0 || strpos($sqlstatement,"delete")===0){
			if($type=="get_last_id" && (strpos($sqlstatement,"INSERT")===0 || strpos($sqlstatement,"insert")===0)){
				$result = mysqli_query($dbconnect, $sqlstatement);
				if($result){
					return mysqli_insert_id($dbconnect);
				}else{
					return false;
				}
			}else{
				return mysqli_query($dbconnect, $sqlstatement);
			}
		}else{
			$result = mysqli_query($dbconnect, $sqlstatement);
			return mysqli_fetch_assoc($result);
		}
	};
	
	
	
	// 爬虫接口
	function hs($url,$post='',$cookie='',$type='',$httpheader='',$returnCookie=0){
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.26 Safari/537.36 Core/1.63.6788.400 QQBrowser/10.3.2767.400');
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($curl, CURLOPT_AUTOREFERER, 1);
        curl_setopt($curl, CURLOPT_REFERER, $url);
		if($type=="put"){
			curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "put");
		}else if($type=='json'){
			curl_setopt($curl,CURLOPT_HTTPHEADER,array("Content-type: application/json;charset='utf-8'"));
		}
		if($post) {
            curl_setopt($curl, CURLOPT_POST, 1);
			if($type=='json'){
				curl_setopt($curl,CURLOPT_POSTFIELDS,$post);
			}else{
            	curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($post));
			}
        }
        if($cookie) {
            curl_setopt($curl, CURLOPT_COOKIE, $cookie);
        }
		if($httpheader){
			curl_setopt($curl, CURLOPT_HTTPHEADER, $httpheader);
		}
        curl_setopt($curl, CURLOPT_HEADER, $returnCookie);
        curl_setopt($curl, CURLOPT_TIMEOUT, 10);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
        $data = curl_exec($curl);
        if (curl_errno($curl)) {
            return curl_error($curl);
        }
        curl_close($curl);
        if($returnCookie){
            list($header, $body) = explode("\r\n\r\n", $data, 2);
            preg_match_all("/Set\-Cookie:([^;]*);/", $header, $matches);
            $info['cookie']  = substr($matches[1][0], 1);
            $info['content'] = $body;
            return $info;
        }else{
            return $data;
        }
	}


	// ID加密 => ID,方式  (不填方式默认为加密)
	function encode_id($id,$type=''){
		if($type){
			$id = str_replace("r","0",$id);
			$id = str_replace("q","1",$id);
			$id = str_replace("i","2",$id);
			$id = str_replace("w","3",$id);
			$id = str_replace("t","4",$id);
			$id = str_replace("y","5",$id);
			$id = str_replace("u","6",$id);
			$id = str_replace("e","7",$id);
			$id = str_replace("a","8",$id);
			$id = str_replace("p","9",$id);
			return 90000000 - $id;
		}else{
			$id = 90000000 - $id;
			$id = str_replace("0","r",$id);
			$id = str_replace("1","q",$id);
			$id = str_replace("2","i",$id);
			$id = str_replace("3","w",$id);
			$id = str_replace("4","t",$id);
			$id = str_replace("5","y",$id);
			$id = str_replace("6","u",$id);
			$id = str_replace("7","e",$id);
			$id = str_replace("8","a",$id);
			$id = str_replace("9","p",$id);
			return $id;
		}
	}
	
	
	
	// 截取数据
	function sj($text,$a,$b){
		if(strpos($a,'<')!==false)$a=str_replace("<","\<",$a);
		if(strpos($a,'>')!==false)$a=str_replace(">","\>",$a);
		if(strpos($a,'/')!==false)$a=str_replace("/","\/",$a);
		if(strpos($b,'<')!==false)$b=str_replace("<","\<",$b);
		if(strpos($b,'>')!==false)$b=str_replace(">","\>",$b);
		if(strpos($b,'/')!==false)$b=str_replace("/","\/",$b);
		preg_match_all('/'.$a.'(.*?)'.$b.'/si',$text,$cnm2);
		return @$cnm2[1][0];
	}
	
	// json返回数据
	function code($arr){
		die(json_encode($arr,JSON_UNESCAPED_UNICODE));
	}
	
	function urlcode($arr){
		die(urlencode(json_encode($arr,JSON_UNESCAPED_UNICODE)));
	}
	
	function see($num){
		if($num < 1000)return $num;
		else if($num < 10000)return (ceil($num/100)/10)."k";
		else return (ceil($num/1000)/10)."w";
	}
	
	
/* 

增一条数据
$res = $sql("INSERT INTO `users` (`user`,`pass`,`type`) VALUES ('{$user}','{$pass}','{$type}')");
查一条数据
$res = $sql("SELECT * FROM users WHERE id='1' ");
查多条数据
$res = $sql("SELECT * FROM users ORDER BY id DESC","list");
foreach($res as $val){
	echo $val['id'].'<br>';
}
改
$res = $sql("UPDATE  `app_users` SET jf='$xjf' WHERE  allid='$allid'");
删
$res = $sql("DELETE FROM app_km WHERE km='$km' AND user='$adminuser' ");
累计条数
$sql("SELECT count(*) FROM app_users WHERE id='$user'");



 
 */