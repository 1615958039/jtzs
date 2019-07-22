<?php
	include("config.php");
	$_POST = json_decode(file_get_contents("php://input"),true);
	
	if($_POST['session_id']){
		$session = $_POST['session_id'];	
	}else if($_GET['session_id']){
		$session = $_GET['session_id'];
	}
	/* 这里后期需要过滤 session 为32位MD5 */
	if($session){
		//判断登陆状态
		$res = $sql("SELECT * FROM session WHERE users_token='".$session."' ");
		if(!$res)code(["code"=>"0","message"=>"无登陆状态，请重启小程序"]);
		$end = $sql("SELECT * FROM session WHERE uid='".$res['uid']."' ORDER BY id DESC limit 0,1 ");
		if($end['id'] != $res['id'])code(["code"=>"-1","message"=>"登陆状态失效，请重启小程序"]);
		
		$users = $sql("SELECT * FROM users WHERE uid='".$end['uid']."' ");
	}
	

	//微信用户登陆取 : users_token
	if($_GET['type']=='login'){
		$statime = date("Y-m-d")+" 00:00:00";
		$endtime = date("Y-m-d")+" 23:59:59";
		
		$code = $_POST['code'];
		
		$data = hs("https://api.weixin.qq.com/sns/jscode2session?appid=".$wx_id."&secret=".$wx_key."&js_code=".$code."&grant_type=authorization_code");
		$data = json_decode($data,true);
		
		if(!$data['session_key'] && !$data['openid'])code(["code"=>"0","message"=>"登陆失败！"]);
		
		//注册登陆
		$users = $sql("SELECT * FROM users WHERE wxid='".$data['openid']."' ");
		if(!$users){
			//注册
			
			$names = [
				'Q','W','E','R','T','Y','U','I','O','P','A','S',
				'D','F','G','H','J','K','L','Z','X','C','V','B',
				'N','M','1','2','3','4','5','6','7','8','9','0',
				'q','w','e','r','t','y','u','i','o','p','a','s',
				'd','f','g','h','j','k','l','z','x','c','v','b','n','m'
			];
			$length = count($names)-1;
			for($i=0;$i<8;$i++){
				$name = $name . $names[rand(0,$length)];
			}
			
			/* 注册防刷 */
			$if = $sql("SELECT count(*) FROM users WHERE reg_time > '".$statime."' ");
			if($if>10000)code(["code"=>"0","message"=>"登陆失败！ -01"]);
		
			/* 用户信息表 */$reg = $sql("INSERT INTO `users` (`wxid`,`name`,`reg_time`) VALUES ('".$data['openid']."','".$name."','".$date."')");
			if(!$reg)code(["code"=>"0","message"=>"注册失败！ -02"]);
			$users = $sql("SELECT * FROM users WHERE wxid='".$data['openid']."' ");
		}
		
		
		/* 防刷登陆session */
		$users_token = md5($date.rand(10000,999999).time().(rand(100,999)*rand(100,999)).(rand(100,999)*rand(100,999)));
		$if = $sql("SELECT count(*) FROM session WHERE uid='".$users['uid']."' AND addtime between '".$statime."' AND '".$endtime."' ");
		if($if>10)code(["code"=>"0","message"=>"登陆失败！ -03"]);
		
		
		$reg = $sql("INSERT INTO `session` (`uid`,`session_key`,`users_token`,`addtime`) VALUES ('".$users['uid']."','".$data['session_key']."','".$users_token."','".$date."')");
		
		if(!$reg)code(["code"=>"0","message"=>"获取登陆状态失败！ -04"]);
		$session = $sql("SELECT * FROM session WHERE uid='".$users['uid']."' ORDER BY id DESC LIMIT 1 ");
		
		//返回 users_token 储存进小程序 Storage ->用于用户登陆状态，取收藏，去水印，积分签到等
		code(["code"=>"1","message"=>"登陆成功！","users_token"=>$session['users_token']]);
		
	}
	
	// 首页 返回值
	if($_GET['type']=='index'){
		$imglist = [];
		
		$res = $sql("SELECT * FROM img WHERE zt='1' ORDER BY love DESC LIMIT 0,18 ","list");
		$i = 0;
		foreach($res as $val){
			if($users){
				$ress = $sql("SELECT * FROM users_like WHERE uid='".$users['uid']."' AND img_id='".$val['id']."' ");
				if($ress)$like = 'true';
				else $like = 'false';
			}else{
				$like = 'false';
			}  
			$imglist[$i++] = [
				'id'=>encode_id($val['id']),//对称加密ID防破解
	            'url'=>"https://520i.net/file/".$val['path'],
	            'like'=>$val['love'],
	            'is_like'=>$like,
	            'see'=>$val['see']
			];
		}
		
		code(["code"=>"1","message"=>"success","imglist"=>$imglist]);
		
	}
	
	// ID图片详情
	if($_GET['type']=='get_img_info'){
		$id = encode_id($_GET['id'],TRUE);
		
		if(!$users)code(["code"=>"0","message"=>"登陆状态失效"]);
		
		$res = $sql("SELECT * FROM img WHERE id='".$id."'");
		if(!$res)code(["code"=>"0","message"=>"获取图片详情失败"]);
		
		$user = $sql("SELECT * FROM users WHERE uid='".$res['uid']."'");
		if($user['touxiang']==""){
			$tx = "icon.png";
		}else if(file_exists("./file/".$user['touxiang'])){
			$tx = "icon.png";
		}else{
			$tx = $user['touxiang'];
		}
		$ress = $sql("SELECT * FROM users_like WHERE uid='".$users['uid']."' AND img_id='".$res['id']."' ");
		if($ress)$like = 'true';
		else $like = 'false';
		
		/* 判断今天是否已查看图片 */
		if($res['zt']=='1' && !$sql("SELECT * FROM img_see WHERE img_id='".$id."' AND uid='".$users['uid']."' AND addtime='".date("Y-m-d")."' ")){
			$up_see = $sql("UPDATE  `img` SET see='".($res['see']+1)."' WHERE id='".$res['id']."'");
			$add_see = $sql("INSERT INTO `img_see` (`uid`,`img_id`,`addtime`) VALUES ('".$users['uid']."','".$res['id']."','".date("Y-m-d")."')");
		}
		
		
		code(["code"=>"1","message"=>"success","imginfo"=>[
			'id'=>encode_id($id),
            'url'=>"https://520i.net/file/".$res['path'],
            'like'=>$res['love'],
            'see'=>$res['see'],
            'islike'=>$like,
            'admin_name'=>$user['name'],
            'admin_text'=>$user['sign_text'],
            'admin_imgurl'=>"https://520i.net/file/".$tx
		]]);
	}
	
	// 图片添加喜欢
	if($_GET['type']=='add_img_love'){
		$id = encode_id($_POST['id'],TRUE);
		if(!$users)code(["code"=>"0","message"=>"登陆状态失效"]);
		$res = $sql("SELECT * FROM img WHERE id='".$id."'");
		if(!$res)code(["code"=>"0","message"=>"获取图片详情失败"]);
		$user = $sql("SELECT * FROM users WHERE uid='".$res['uid']."'");
		
		if($res['zt']!='1')code(["code"=>"-3","message"=>"该图片还未发布，不支持点赞"]);
		
		if($sql("SELECT * FROM users_like WHERE uid='".$users['uid']."' AND img_id='".$res['id']."' "))code(["code"=>"0","message"=>"添加失败，您已喜欢了哦"]);
		
		$up_havelove = $sql("UPDATE  `users` SET have_love='".($user['have_love']+1)."' WHERE uid='".$user['uid']."'");
		$up_loveinfo = $sql("UPDATE  `img` SET love='".($res['love']+1)."' WHERE id='".$res['id']."'");
		$add_love = $sql("INSERT INTO `users_like` (`uid`,`img_id`,`addtime`) VALUES ('".$users['uid']."','".$res['id']."','{$date}')");
		
		code(["code"=>"1","message"=>"添加成功！"]);
		
	}
	
	
	// 删除喜欢的图片
	if($_GET['type']=='del_img_love'){
		$id = encode_id($_POST['id'],TRUE);
		if(!$users)code(["code"=>"0","message"=>"登陆状态失效"]);
		$res = $sql("SELECT * FROM img WHERE id='".$id."'");
		if(!$res)code(["code"=>"0","message"=>"获取图片详情失败"]);
		$user = $sql("SELECT * FROM users WHERE uid='".$res['uid']."'");
		
		if($res['zt']!='1')code(["code"=>"-3","message"=>"该图片还未发布，不支持点赞"]);
		
		if(!$sql("SELECT * FROM users_like WHERE uid='".$users['uid']."' AND img_id='".$res['id']."' "))code(["code"=>"0","message"=>"添加失败，您还未添加喜欢"]);
		
		$up_havelove = $sql("UPDATE  `users` SET have_love='".($user['have_love']-1)."' WHERE uid='".$user['uid']."'");
		$up_loveinfo = $sql("UPDATE  `img` SET love='".($res['love']-1)."' WHERE id='".$res['id']."'");
		$add_love = $sql("DELETE FROM users_like WHERE img_id='".$res['id']."' AND uid='".$users['uid']."' ");
		
		code(["code"=>"1","message"=>"取消成功！"]);
		
	}
	
	
	
	// 图片搜索
	if($_GET['type']=='search'){
		
		$keyword = $_POST['keyword'];
        $nowpage = $_POST['page_id'];
		if(!$users)code(["code"=>"0","message"=>"登陆状态失效"]);
		
		if($keyword==""){
			//显示全部数据
			$sqlnum = $sql("SELECT count(*) FROM img WHERE zt='1' ");
			$maxpage=intval($sqlnum/$pagenum);
			if ($sqlnum%$pagenum)$maxpage++;
			$nowpage=(int)$nowpage;
			if($nowpage=="" || $nowpage<1 || $nowpage>$maxpage)$nowpage=1;
			$offset=$pagenum*($nowpage-1);
			$limit = " LIMIT {$offset},{$pagenum} ";
			$data = [];
			$i = 0;
			$res = $sql("SELECT * FROM img WHERE zt='1' ORDER BY id DESC".$limit,"list");
			foreach($res as $val){
				if($sql("SELECT * FROM users_like WHERE uid='".$users['uid']."' AND img_id='".$val['id']."' "))$like = 'true';
				else $like = 'false';
				$data[$i++]=[
					'id'=>encode_id($val['id']),
		            'url'=>'https://520i.net/file/'.$val['path'],
		            'like'=>see($val['love']),
		            'is_like'=>$like,
		            'see'=>see($val['see'])
				];
			} 
			code([
				"code"=>"1",
				"message"=>"success",
				"pagemax"=>$maxpage,
				"pagenow"=>$nowpage,
				"data"=>$data
			]);
		}else{
			//根据关键词搜索
			
			$sqlnum = $sql("SELECT count(*) FROM img WHERE zt='1' AND title like '%".$keyword."%' ");
			$maxpage=intval($sqlnum/$pagenum);
			if ($sqlnum%$pagenum)$maxpage++;
			$nowpage=(int)$nowpage;
			if($nowpage=="" || $nowpage<1 || $nowpage>$maxpage)$nowpage=1;
			$offset=$pagenum*($nowpage-1);
			$limit = " LIMIT {$offset},{$pagenum} ";
			$data = [];
			$i = 0;
			$res = $sql("SELECT * FROM img WHERE zt='1' AND title like '%".$keyword."%' ORDER BY id DESC".$limit,"list");
			foreach($res as $val){
				if($sql("SELECT * FROM users_like WHERE uid='".$users['uid']."' AND img_id='".$val['id']."' "))$like = 'true';
				else $like = 'false';
				$data[$i++]=[
					'id'=>encode_id($val['id']),
		            'url'=>'https://520i.net/file/'.$val['path'],
		            'like'=>see($val['love']),
		            'is_like'=>$like,
		            'see'=>see($val['see'])
				];
			}
			code([
				"code"=>"1",
				"message"=>"success",
				"pagemax"=>$maxpage,
				"pagenow"=>$nowpage,
				"data"=>$data
			]);	
		}
	}
	
	
	
	//用户个人信息页面
	else if($_GET['type']=="mine"){
		if(!$users)code(["code"=>"-1","message"=>"登陆状态失效"]);
		
		code([
			"code"=>"1",
			"message"=>"success",
			"name"=>$users['name'],
	        "signtext"=>$users['sign_text'],
	        "img"=>"https://520i.net/file/".$users['touxiang'],
	        "jf"=>$users['jf'],
	        "have_love"=>$users['have_love'],
	        "love"=>$sql("SELECT count(*) FROM users_like WHERE uid='".$users['uid']."' ")
		]);
	}
	
	
	//修改昵称个性签名
	else if($_GET['type']=="update_name"){
		if(!$users)code(["code"=>"-1","message"=>"登陆状态失效"]);
		$name = $_POST['name'];
		preg_match_all("/([\x{4e00}-\x{9fa5}|a-z|A-Z|0-9])/u", $name, $match);
		$name = "";
		foreach($match[0] as $val){
			$name = $name.$val;
		}
		$signtext = $_POST['signtext'];
		$signtext = str_replace(['<','>','javascript:'],"",$signtext);
		if(mb_strlen($name,'utf-8')>10)code(["code"=>"0","message"=>"昵称太长啦"]);
		if(mb_strlen($name,'utf-8')<2)code(["code"=>"0","message"=>"请输入2位字符以上的昵称"]);
		if(mb_strlen($signtext,'utf-8')>20)code(["code"=>"0","message"=>"个性签名太长啦"]);
		
		if($name == $users['name'] && $signtext==$users['sign_text'])code(["code"=>"0","message"=>"请修改一下昵称或个性签名哦~"]);
		
		if($signtext=="")$signtext="这家伙很懒，还没设置个性签名";
		if($sql("SELECT count(*) FROM users_name_log WHERE uid='".$users['uid']."' AND addtime='".date("Y-m-d")."' ")>5)code(["code"=>"0","message"=>"每天仅可修改五次个人信息"]);
		$add = $sql("INSERT INTO `users_name_log` (`uid`,`name`,`signtext`,`img`,`addtime`) VALUES ('".$users['uid']."','".$users['name']."','".$users['sign_text']."','none','".date("Y-m-d")."')");
		$upd = $sql("UPDATE  `users` SET name='".$name."',sign_text='".$signtext."' WHERE uid='".$users['uid']."'");
		if(!$add || !$upd)code(["code"=>"0","message"=>"修改昵称失败！"]);
		code(["code"=>"1","message"=>"success"]);	
	}


	
	//修改头像
	else if($_GET['type']=='update_img'){
		if(!$users)code(["code"=>"-1","message"=>"登陆状态失效"]);
		$name = $_GET['name'];
		preg_match_all("/([\x{4e00}-\x{9fa5}|a-z|A-Z|0-9])/u", $name, $match);
		$name = "";
		foreach($match[0] as $val){
			$name = $name.$val;
		}
		$signtext = $_GET['signtext'];
		$signtext = str_replace(['<','>','javascript:'],"",$signtext);
		if(mb_strlen($name,'utf-8')>10)urlcode(["code"=>"0","message"=>"昵称太长啦"]);
		if(mb_strlen($name,'utf-8')<2)urlcode(["code"=>"0","message"=>"请输入2位字符以上的昵称["]);
		if(mb_strlen($signtext,'utf-8')>20)urlcode(["code"=>"0","message"=>"个性签名太长啦"]);
		if($signtext=="")$signtext="这家伙很懒，还没设置个性签名";
		if($sql("SELECT count(*) FROM users_name_log WHERE uid='".$users['uid']."' AND addtime='".date("Y-m-d")."' ")>5)urlcode(["code"=>"0","message"=>"每天仅可修改五次个人信息"]);
		
		
		
		if($_FILES["file"]["size"]/1024/1024 > 2)urlcode(["code"=>"0","message"=>"图片大小仅限2m以内"]);
		if($_FILES["file"]["size"]/1024 < 5)urlcode(["code"=>"0","message"=>"图片尺寸太小了哦"]);
		
		
		$filenamelist = explode(".",$_FILES["file"]["name"]);
		$type = $filenamelist[count($filenamelist)-1];
		
		if($type!='jpg' && $type!='jpeg' && $type!='png')urlcode(["code"=>"0","message"=>"暂不支持该图片格式"]);
		
		$newname = encode_id(ceil(time()/999)).substr(md5($_FILES["file"]["name"].$date.time().rand(1,9999999).rand(1,9999999).rand(1,9999999)), 8, 16).".".$type;
		if(!move_uploaded_file($_FILES["file"]["tmp_name"], "file/".$newname))urlcode(["code"=>"0","message"=>"上传失败，未知原因"]);
		
		$add = $sql("INSERT INTO `users_name_log` (`uid`,`name`,`signtext`,`img`,`addtime`) VALUES ('".$users['uid']."','".$users['name']."','".$users['sign_text']."','".$users['touxiang']."','".date("Y-m-d")."')");
		$upd = $sql("UPDATE  `users` SET name='".$name."',sign_text='".$signtext."',touxiang='".$newname."' WHERE uid='".$users['uid']."'");
		
		if(!$add || !$upd)urlcode(["code"=>"0","message"=>"修改昵称失败！"]);
		
		urlcode(["code"=>"1","message"=>"success"]);	
		 
		
	}

	
	
	//我喜欢的表情包
	else if($_GET['type']=="get_mylike"){
		$nowpage = $_POST['page_id'];
		if(!$users)code(["code"=>"-1","message"=>"登陆状态失效"]);
		
		$sqlnum = $sql("SELECT count(*) FROM users_like WHERE uid='".$users['uid']."' ");
		$maxpage=intval($sqlnum/$pagenum);
		if ($sqlnum%$pagenum)$maxpage++;
		$nowpage=(int)$nowpage;
		if($nowpage=="" || $nowpage<1 || $nowpage>$maxpage)$nowpage=1;
		$offset=$pagenum*($nowpage-1);
		$limit = " LIMIT {$offset},{$pagenum} ";
		$data = [];
		$i = 0;
		$res = $sql("SELECT * FROM users_like WHERE uid='".$users['uid']."' ORDER BY id DESC".$limit,"list");
		foreach($res as $val){
			$img = $sql("SELECT * FROM img WHERE id='".$val['img_id']."' ");
			$data[$i++]=[
				'id'=>encode_id($img['id']),
		        'url'=>'https://520i.net/file/'.$img['path'],
		        'like'=>see($img['love']),
		        'is_like'=>'true',
		        'see'=>see($img['see'])
			];
		}
		code([
			"code"=>"1",
			"message"=>"success",
			"pagemax"=>$maxpage,
			"pagenow"=>$nowpage,
			"data"=>$data
		]);
	}

	
	
	
	
	//	自定义作图表情包列表
	else if($_GET['type']=="get_img_template"){
		$nowpage = $_POST['page_id'];
		if(!$users)code(["code"=>"-1","message"=>"登陆状态失效"]);
		
		if($nowpage==0 || $nowpage =='1')$pagenum = 29;
		
		
		$sqlnum = $sql("SELECT count(*) FROM img_template ");
		$maxpage=intval($sqlnum/$pagenum);
		if ($sqlnum%$pagenum)$maxpage++;
		$nowpage=(int)$nowpage;
		if($nowpage=="" || $nowpage<1 || $nowpage>$maxpage)$nowpage=1;
		$offset=$pagenum*($nowpage-1);
		$limit = " LIMIT {$offset},{$pagenum} ";
		$data = [];
		$i = 0;
		$res = $sql("SELECT * FROM img_template ORDER BY id DESC".$limit,"list");
		foreach($res as $val){
			$data[$i++]=[
				'id'=>encode_id($val['id']),
		        'url'=>'https://520i.net/file/'.$val['path']
			];
		}
		code([
			"code"=>"1",
			"message"=>"success",
			"pagemax"=>$maxpage,
			"pagenow"=>$nowpage,
			"data"=>$data
		]);
	}
	
	
	
	
	//上传表情包
	else if($_GET['type']=='users_upimg'){
		if(!$users)urlcode(["code"=>"-1","message"=>"登陆状态到期"]);
		
		if($_FILES["file"]["size"]/1024/1024 > 2)urlcode(["code"=>"0","message"=>"图片大小仅限2m以内"]);
		if($_FILES["file"]["size"]/1024 < 5)urlcode(["code"=>"0","message"=>"图片尺寸太小了哦"]);
		$filenamelist = explode(".",$_FILES["file"]["name"]);
		$type = $filenamelist[count($filenamelist)-1];
		if($type!='jpg' && $type!='jpeg' && $type!='png')urlcode(["code"=>"0","message"=>"暂不支持该图片格式"]);
		
		$statime = date("Y-m-d")." 00:00:00";
		$shnum = $sql("SELECT count(*) FROM img WHERE add_time > '{$statime}' AND zt='2' AND uid='".$users['uid']."' ");
		
		
		if($shnum > 100)urlcode(["code"=>"-2","message"=>"您已上传了100张表情包，请等待审核结束再上传哦~"]);
		
		/* 等待添加-> 当(zt=2)>1000 时 提示'审核库已满，请联系管理员审核图片' */
		 
		$filemd5 = substr(md5_file($_FILES["file"]["tmp_name"]), 8, 16);
		
		//$a = $sql("SELECT count(*) FROM img WHERE filemd5='".$filemd5."' ");
		//die($a);
		
		if($sql("SELECT count(*) FROM img WHERE filemd5='".$filemd5."' ")>0)urlcode(["code"=>"0","message"=>"列表内第一张图片已被上传了哦~"]);
		
		
		
		$newname = encode_id(ceil(time()/999)).substr(md5($_FILES["file"]["name"].$date.time().rand(1,9999999).rand(1,9999999).rand(1,9999999)), 8, 16).".".$type;
		if(!move_uploaded_file($_FILES["file"]["tmp_name"], "file/".$newname))urlcode(["code"=>"0","message"=>"上传失败，未知原因 -01"]);
		
		$add = $sql("INSERT INTO `img` (`path`,`filemd5`,`uid`,`zt`,`add_time`) VALUES ('".$newname."','".$filemd5."','".$users['uid']."','2','".$date."')");
		if(!$add)urlcode(["code"=>"0","message"=>"上传失败！未知原因 -02"]);
		
		urlcode(["code"=>"1","message"=>"success"]);
		
		
		
	}
	
	
	//删除我上传的表情包
	else if($_GET['type']=='del_img_myup'){
		if(!$users)code(["code"=>"-1","message"=>"未登陆哦~"]);
		$id = encode_id($_POST['id'],TRUE);
		$res = $sql("SELECT * FROM img WHERE id='".$id."' AND uid='".$users['uid']."' ");
		if(!$res)code(["code"=>"0","message"=>"无权限"]);
		
		$del_img = $sql("DELETE FROM img WHERE id='".$id."' ");
		$del_see = $sql("DELETE FROM img_see WHERE img_id='".$res['id']."' ");
		$del_like = $sql("DELETE FROM users_like WHERE img_id='".$res['id']."' ");
		
		if(!$del_img || !$del_like || !$del_see)code(["code"=>"0","message"=>"删除失败！"]);
		
		code(["code"=>"1","message"=>"success"]);
		
	}
	
	
	
	//我的上传列表
	else if($_GET['type']=="get_img_myup"){
		
		$nowpage = $_POST['page_id'];
		if(!$users)code(["code"=>"-1","message"=>"登陆状态失效"]);
		
		$sqlnum = $sql("SELECT count(*) FROM img WHERE uid='".$users['uid']."' ");
		$maxpage=intval($sqlnum/$pagenum);
		if ($sqlnum%$pagenum)$maxpage++;
		$nowpage=(int)$nowpage;
		if($nowpage=="" || $nowpage<1 || $nowpage>$maxpage)$nowpage=1;
		$offset=$pagenum*($nowpage-1);
		$limit = " LIMIT {$offset},{$pagenum} ";
		$data = [];
		$i = 0;
		$res = $sql("SELECT * FROM img WHERE uid='".$users['uid']."' ORDER BY id DESC".$limit,"list");
		foreach($res as $val){
			if($sql("SELECT * FROM users_like WHERE uid='".$users['uid']."' AND img_id='".$val['id']."' "))$like = 'true';
			else $like = 'false';
			
			if($val['zt']=='2')$zt = 1;
			else if($val['zt']=='3')$zt = 2;
			else $zt = '';
			
			$data[$i++]=[
				'id'=>encode_id($val['id']),
		        'url'=>'https://520i.net/file/'.$val['path'],
		        'like'=>see($val['love']),
		        'is_like'=>$like,
		        'see'=>see($val['see']),
		        'type'=>$zt
			];
		}
		code([
			"code"=>"1",
			"message"=>"success",
			"pagemax"=>$maxpage,
			"pagenow"=>$nowpage,
			"data"=>$data
		]);	
	}
	
	
	
	
	//用户获赞表情包列表
	else if($_GET['type']=="get_myup_havelike"){
		$nowpage = $_POST['page_id'];
		if(!$users)code(["code"=>"-1","message"=>"登陆状态失效"]);
		
		$sqlnum = $sql("SELECT count(*) FROM img WHERE uid='".$users['uid']."' AND zt='1' AND love<>'0'  ");
		$maxpage=intval($sqlnum/$pagenum);
		if ($sqlnum%$pagenum)$maxpage++;
		$nowpage=(int)$nowpage;
		if($nowpage=="" || $nowpage<1 || $nowpage>$maxpage)$nowpage=1;
		$offset=$pagenum*($nowpage-1);
		$limit = " LIMIT {$offset},{$pagenum} ";
		$data = [];
		$i = 0;
		$res = $sql("SELECT * FROM img WHERE uid='".$users['uid']."' AND zt='1' AND love<>'0' ORDER BY id DESC".$limit,"list");
		foreach($res as $val){
			if($sql("SELECT * FROM users_like WHERE uid='".$users['uid']."' AND img_id='".$val['id']."' "))$like = 'true';
			else $like = 'false';
			$data[$i++]=[
				'id'=>encode_id($val['id']),
		        'url'=>'https://520i.net/file/'.$val['path'],
		        'like'=>see($val['love']),
		        'is_like'=>$like,
		        'see'=>see($val['see'])
			];
		}
		code([
			"code"=>"1",
			"message"=>"success",
			"pagemax"=>$maxpage,
			"pagenow"=>$nowpage,
			"data"=>$data
		]);
	}

	
	
	
	
	
	
	//获取需要审核的图片
	else if($_GET['type']=="get_need_sh"){
		if($users['qx']!='1')code(["code"=>"-4","message"=>"无权限哦"]);
		$res = $sql("SELECT * FROM img WHERE zt='2' ");
		if(!$res)code(["code"=>"2","message"=>"暂无可审核的表情包哦~"]);
		$user = $sql("SELECT * FROM users WHERE uid='".$res['uid']."' ");
		code([
			"code"=>"1",
			"message"=>"success",
			"data"=>[
				"id"=>$res['id'],
				"url"=>"https://520i.net/file/".$res['path'],
				"title"=>$res['title'],
				"admin_name"=>$user['name'],
				"admin_signtext"=>$user['sign_text'],
				"admin_img"=>"https://520i.net/file/".$user['touxiang']
			]
		]);
	}
	//审核拒绝
	else if ($_GET['type']=='add_sh_no') {
		if($users['qx']!='1')code(["code"=>"-4","message"=>"无权限哦"]);
		
		$id = (int)$_POST['id'];
		
		$res = $sql("SELECT * FROM img WHERE id='".$id."' ");
		if($res['zt']!='2' || !$res)code(["code"=>"0","message"=>"无权限"]);
		$rt = $sql("UPDATE  `img` SET zt='3',shuid='".$users['uid']."' WHERE id='{$id}' ");
		if(!$rt)code(["code"=>"0","message"=>"审核失败！"]);
		code(["code"=>"1","message"=>"成功！"]);
	} 
	//审核通过  加2积分
	else if ($_GET['type']=='add_sh_yes') {
		if($users['qx']!='1')code(["code"=>"-4","message"=>"无权限哦"]);
		$id = (int)$_POST['id'];
		$title = $_POST['title'];
		
		if(mb_strlen($title,'utf-8')<1 || mb_strlen($title,'utf-8')>20)code(["code"=>"0","message"=>"关键字在1-20字符之间"]);
		
		$res = $sql("SELECT * FROM img WHERE id='".$id."' ");
		
		if($res['zt']!='2' || !$res)code(["code"=>"0","message"=>"无权限"]);
		
		$rt = $sql("UPDATE  `img` SET title='".$title."',zt='1',shuid='".$users['uid']."' WHERE id='{$id}' ");
		$jf = $sql("UPDATE  `users` SET jf='".($users['jf']+2)."' WHERE uid='".$users['uid']."' ");
		$jf_log = $sql("INSERT INTO `users_jf_log` (`uid`,`jf`,`dowhat`,`addtime`) VALUES ('".$users['uid']."','2','上传表情包','{$date}')");
		
		if(!$rt || !$jf || !$jf_log)code(["code"=>"0","message"=>"审核失败！"]);
		code(["code"=>"1","message"=>"成功！"]);
	}
	
	
	
	
	
	
	
	
	
	
	