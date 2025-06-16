	 function siteUrl() {
            let site_url = websiteUrl + '/w.html?rurl=' + window.location.href; //设置微信公众号授权的地址
    		let queryString = window.location.search
    		if (queryString.indexOf('?') != -1) {
    			//wxredirect
    			let queryStrAndParams = queryString.split('?')
    			// 参数切分
    			let queryStr = queryStrAndParams[1]
    			site_url = site_url + '&' + queryStr
    		}
            return 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + encodeURI(site_url) + '&response_type=code&scope=snsapi_userinfo#wechat_redirect';
	} 	 
	 
	 
	 function siteUrl_bak() {
    		let site_url = websiteUrl + '/wxredirect.html?my=' + window.location.host; //设置微信公众号授权的地址
    		let queryString = window.location.search
    		if (queryString.indexOf('?') != -1) {
    			//wxredirect
    			let queryStrAndParams = queryString.split('?')
    			// 参数切分
    			let queryStr = queryStrAndParams[1]
    			site_url = site_url + '&' + queryStr
    		}
    		return  'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' +
    			encodeURIComponent(site_url) + '&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';	
	}  


	//缓存,默认有效期7天
	function sessionCache(key, value, seconds) {
		let timestamp = Date.parse(new Date()) / 1000
		if (key && value === null) {
			//删除缓存
			localStorage.removeItem(key);
			//localStorage.clear() 
		} else if (key && value) {
			//设置缓存 默认三天
			let expire;
			if (!seconds) {
				 expire = timestamp + (3600 * 24 * 3)
			}else{
				 expire = timestamp + seconds
			}
			value = value + "|" + expire
			localStorage.setItem(key,value);
		} else if (key) {
			//获取缓存
			let val = localStorage.getItem(key)?localStorage.getItem(key):'';
			let tmp = val.split("|")
			if (!tmp[1] || timestamp >= tmp[1]) {
				localStorage.removeItem(key);
				//localStorage.clear() 
				return false
			} else {
				return tmp[0]
			}
		} else {
			alert("key不能空")
		}
	}
    
    
    function getCurrentAgent(){
	
	 let ua = navigator.userAgent.toLowerCase();
		if (ua.match(/MicroMessenger/i) == "micromessenger") {
			console.log("微信环境中");
			return true;
		  } else {
			console.log("其他环境中（例如浏览器等等）");
			return false;
		  }
	}	
	
	
	
	function parseURLParams(url) {
        let queryParams = {}
        // 判断是否有参数
        if (url.indexOf('?') < 0) return queryParams
        // 分离域名和参数
        let domainAndParams = url.split('?')
        // 参数切分
        let queryStr = domainAndParams[1]
        let queryItems = queryStr.split('&')
        // 循环参数，把参数转为键值对
        queryItems.forEach(item => {
            let paramKV = item.split('=')
            queryParams[paramKV[0]] = paramKV[1]
        })
    // 返回参数键值对
        return queryParams
    }    	
	
     function getWeiChatAuthUrl(url)
    {
        $.ajax({
            url: url,
            type: 'post',
            data:{authUrl:true},
            dataType: 'json',
            async: false,
            //xhrFields: { withCredentials: true },
           // crossDomain: true,
            success: function (result) {
				//console.log(result);
                if (result && result.url!='')
                {
                  websiteUrl =  'http://'+ result.url;
                  appid = result.appid;
                }
            },
            error: function ()
            {
                alert("不好意思请求失败了");
            }
        })
    }
    
	//document.getElementById("room").innerHTML = 'Yaff4410010';
    function loadUserInfo(url,code)
    {
        $.ajax({
            url: url,
            type: 'post',
            data:{code:code},
            dataType: 'json',
            async: false,
            //xhrFields: { withCredentials: true },
           // crossDomain: true,
            success: function (result) {
				//console.log(result);
                if (result && result.code==true)
                {
                    
                        let data = result.data
                        baseCDN = data.RES;
	                    version = data.VER;
	                    sessionCache('unCode',data.un)
	                    //localStorage.unCode = data.un;
	                    localStorage.nickname = data.userName;
                }
            },
            error: function ()
            {
                alert("不好意思请求失败了");
            }
        })
    }	

    function getResUrl(url)
    {
        $.ajax({
            url: url,
            type: 'post',
            data:{RES:true},
            dataType: 'json',
            async: false,
            //xhrFields: { withCredentials: true },
           // crossDomain: true,
            success: function (result) {
				//console.log(result);
                if (result && result.code==true)
                {
                    
                        let data = result.data
                        baseCDN = data.RES;
	                    version = data.VER;
						site = data.site;
	                    localStorage.RES = data.RES;
	                    localStorage.version = data.VER;
	                    localStorage.site = data.site;
                }
            },
            error: function ()
            {
                alert("不好意思请求失败了");
            }
        })
    }


	
	    //ajax 异步加载配置数据项
    function loadBase(url,un,nickname)
    {
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            data:{un:un,nickname:nickname},
            async: false,
            //xhrFields: {withCredentials: true},
            //crossDomain: true,
            success: function (result) {
				//console.log(result);
                if (result && result.code==true)
                {
                        let data = result.data
                        if (data.fenghao){
                            $('head').html('');
                            $('body').html('');
                            $('body').after(createrFengHaoHtml())
                            //document.writeln(createrFengHaoHtml());
                            setTimeout(function() {
                            $("#img").attr('src',data.avatar);
	                        $("#lable").html(data.userName +" ID:("+data.id+")");
	                        $("#dec").html(data.desc);                            
                            }, 100);
                         return;
                        }
                    	$("#host").html(data.host);
	                    $("#un").html(data.un);
	                    $("#lkey").html(data.lkey);
	                    if (localStorage.version != data.VER){
	                        localStorage.version = data.VER;
	                    }
	                    if (data.roomId){
	                        $("#room").html(data.roomId);
	                    }
						$("#title").html(data.Title);
	                    $("#title2").html(data.title);
						$("title").html(data.userName + "|" + data.Title); 
	                    
                }else{
                        $('head').html('');
                        $('body').html('');
                        $('body').after('<p>找不到账户！</p>')
                    
                }
            },
            error: function ()
            {
                alert("不好意思请求失败了");
            }
        })
    }
    
   function loadJs(url){
        let scriptDom = document.createElement('script');
        scriptDom.setAttribute("crossorigin","");
        scriptDom.type = 'text/javascript';
        scriptDom.src = baseCDN + url + "?" +version;
        document.getElementsByTagName('body')[0].appendChild(scriptDom);
    }
    
    
    
    function createrStartHTML(){
		let  html='<!DOCTYPE html>';
		html+='<html>';
		html+='';
		html+='<head>';
		html+='  <meta charset="utf-8" />';        
        return  html;        
    }
    
    function createrEndHTML(){
		let  html='';
		html+='</body>';
		html+='</html>';       
        return  html;
    }    
    
    
	function createrHomeHtml(resUrl){
		let  html='';
		html+='  <link rel="stylesheet" type="text/css" href="'+ resUrl +'/css/hall.css?v='+version+'">';
		html+='    <style type="text/css">';
		html+='        .btn {';
		html+='            background-image: url('  +  resUrl +'/v3.4/fz.png);';
		html+='        }';
		html+='        .pai {';
		html+='            background: url('  +  resUrl +'/v3.4/pai0.png) no-repeat;';
		html+='        }';
		html+='        #qrcode {';
		html+='            background-image: url('  +  resUrl +'/qrcode.png);';
		html+='        }';
		html+='    </style>';
		html+='  ';
		html+='  <div class="img">';
		html+='    <img src="'  +  resUrl +'/v3.4/comp5/bg/img_bg.png" alt="">';
		html+='    <span class="info">长按图片分享朋友</span>';
		html+='    <img id="img" src="" alt="">';
		html+='    <span class="close">关闭</span>';
		html+='  </div>';
		html+=' <div class="gameloadBg" style="display:none;width:100%;height:100%"></div>';
		html+='<div class="gameBg" style="display:none;width:100%;height:100%"></div>';
		html+='<div class="shareInfo cake" style="width:123.5px;height:36.5px;position: fixed;z-index: 1100;right: 40px;top:13%;display:none;background: url('  +  resUrl +'/v3.4/nn_116.png) 0 0/100% 100%">';
		html+='</div>';
		html+='<div class="loadingBg" style="display:none"></div>';
		html+='  <div id="loading" style="display:none"> ';
		html+='      <img class="rodimg center" src="'  +  resUrl +'/v3.4/loading.png">';
		html+='      <div class="pai center"></div>';
		html+='  </div>';
		html+='  <div class="btn" id="btn" data-clipboard-text="要复制的内容" style="cursor:pointer;"></div>';
		html+='  <div class="btn" id="room_btn" data-clipboard-text="要复制的内容" data-room="" style="cursor:pointer;display:none"></div>';
		html+='  <div class="btn_club" data-clipboard-text="要复制的内容" style="cursor:pointer;"></div>';
		html+='</head>';
		html+='';
		html+='<body class="black">';
		html+='    <div id="QRCodeNone" class="qr-code"></div>';
		html+='    <div id="qrcode" class="qr-code"></div>';
		html+='    <div type="text" class="club" data-room="" id="copyList"></div>';
		html+='    <div id="share_url" style="display:none"></div>';
		html+='    <div id="groupId" style="display:none"></div>';
		html+='    <div id="un" style="display:none"></div>';
		html+='    <div id="room" style="display:none"></div>';
		html+='    <div id="assets" style="display:none">'  +  resUrl +'/v3.4</div>';
		html+='    <div id="path" style="display:none">res.ed010z.cn/chess/p2/</div>';
		html+='    <div id="host" style="display:none"></div>';
		html+='    <div id="title" style="display:none"></div>';
		html+='    <div id="title2" style="display:none"></div>';
		html+='    <div id="cardno" style="display:none"></div>';
		html+='    <div id="invitation" style="display:none"></div>';
		html+='    <div id="skinno" style="display:none"></div>';
		html+='    <div id="headno" style="display:none"></div>';
		html+='    <div id="site" style="display:none">'+  site +'</div>';
		html+='    <!--<div id="site" style="display:none">rewan</div>-->';
		html+='    <div id="lkey" style="display:none"></div>';
		html+='    <div id="comp" style="display:none">comp5</div>';
		html+='	<div id="atlas" style="display:none">/res/atlas15</div>';
		html+='	<div id="sounds" style="display:none">/sounds/</div>';
		html+='    <div id="json" style="display:none">/json1</div>';
		html+='';
		html+='    <script type="text/javascript" src="'  +  resUrl +'/js/qrcode.js?v='+version+'"> </script>';
		html+='	<script type="text/javascript" src="'  +  resUrl +'/v3.4/js/code_x1_1129.js?v='+version+'"></script>';
		html+='    <script type="text/javascript" src="'  +  resUrl +'/js/hall.js?v='+version+'"></script>	';
		return html;
	}    
    
    function createrGameHtml(resUrl){
        let html='';
        html+='    <link rel="stylesheet" type="text/css" href="'  +  resUrl +'/res.ed010z.cn/chess/common/loading/loading.css?v='+version+'" />';
        html+='    <link rel="stylesheet" type="text/css" href="'  +  resUrl +'/res.ed010z.cn/fuzhi/fuzhi.css?v='+version+'" />';
        html+='    <link rel="stylesheet" type="text/css" href="'  +  resUrl +'/css/room.css?v='+version+'" />';
        html+='    <style>';
        html+='        .btn {';
        html+='            background-image: url('  +  resUrl +'/fz.png);';
        html+='        }';
        html+='        #qrcode {';
        html+='            background-image: url('  +  resUrl +'/qrcode.png);';
        html+='        }';
        html+='    </style>';
        html+='</head>';
        html+='';
        html+='<body style="width:100%;height:100%;background-color:#000;text-align:center;overflow:hidden">';
        html+='    <div id="QRCodeNone" class="qr-code"></div>';
        html+='    <div id="qrcode" class="qr-code"></div>';
        html+='    <div class="btn" style="cursor:pointer;"></div>';
        html+='    <span class="copy-tip" id="tips" style="display:none">已复制到剪贴板</span>';
        html+='';
        html+='    <div id="share_url" style="display:none"></div>';
        html+='    <div id="bgdiv" style="position:absolute;left:0;right:0;bottom:0;top:0;margin:auto;"></div>';
        html+='    <div id="un" style="display:none"></div>';
        html+='    <div id="room" style="display:none"></div>';
        html+='    <div id="assets" style="display:none">'  +  resUrl +'/res.ed010z.cn/chess/p2/</div>';
        html+='    <div id="path" style="display:none">'  +  resUrl +'/res.ed010z.cn/chess/p2/</div>';
        html+='    <div id="host" style="display:none"></div>';
        html+='    <div id="title" style="display:none"></div>';
		html+='    <div id="title2" style="display:none"></div>';		
        html+='    <div id="cardno" style="display:none"></div>';
        html+='    <div id="invitation" style="display:none"></div>';
        html+='    <div id="skinno" style="display:none"></div>';
        html+='    <div id="headno" style="display:none"></div>';
        html+='    <div id="site" style="display:none">'+  site +'</div>';
        html+='    <div id="lkey" style="display:none">R2A4PF34</div>';
        html+='';
        html+='    <div id="net" style="display:none;z-index:9999;position:absolute;left: 50%; top: 50%;transform: translate(-50%,-50%);">';
        html+='        <p style="color:#fff;">资源加载失败</p>';
        html+='        <button id="reloadtxt" type="button" onclick="reload();">刷新页面</button><br><br>';
        html+='        <button type="button" onclick="checknet();">检查网络情况</button>';
        html+='    </div>';
        html+='    <div id="loading">';
        html+='        <img class="rodimg center" src="'  +  resUrl +'/res.ed010z.cn/chess/common/loading/loading.png"></img>';
        html+='        <div class="pai center"></div>';
        html+='    </div>';
        html+='';
        html+='    <script type="text/javascript" src="'  +  resUrl +'/js/qrcode.js?v='+version+'"></script>';
        html+='    <script type="text/javascript" src="'  +  resUrl +'/res.ed010z.cn/chess/p2/core_x2.js?v='+version+'"></script>';
        html+='    <script type="text/javascript" src="'  +  resUrl +'/js/clipboard.min.js?v='+version+'"></script>';
        html+='    <script type="text/javascript" src="'  +  resUrl +'/js/room.js?v='+version+'"></script>';
        return html;
        
    }
    
    function createrDBSHtml(resUrl){
        let html='';
        html+='    <div class="btn" style="cursor:pointer;"></div>';
        html+='    <style>';
        html+='      .btn{';
        html+='			position: fixed;';
        html+='			top: 10px;';
        html+='            right: 0;';
        html+='			width:25px;';
        html+='			height: 120px;';
        html+='			border-radius: 13px 0 0 13px;';
        html+='			/*display: none;*/';
        html+='			z-index: 10000;';
        html+='			background-color: #ccc;';
        html+='			background-image: url('+ resUrl +'/fz.png);';
        html+='			background-size: 30px 120px;';
        html+='			background-position: -4px 0;';
        html+='		}';
        html+='   .copy-tip {';
        html+='    background: rgba(0, 0, 0, .6);';
        html+='    color: #fff;';
        html+='    position: fixed;';
        html+='    bottom: 6.6rem;';
        html+='    font-size: .9rem;';
        html+='    border-radius: 5px;';
        html+='    padding: 10px;';
        html+='    left: 50%;';
        html+='    transform: translate(-50%, 0);';
        html+='    z-index: 89;';
        html+='    }';
        html+='    </style>';
        html+='</head>';
        html+='	';
        html+='';
        html+='<body style="width:100%;height:100%;background-color:#000;text-align:center;overflow:hidden">';
        html+='    <span class="copy-tip" id="tips" style="display:none">已复制到剪贴板</span>';
        html+='    <div id="share_url" style="display:none"></div>';
        html+='  	<div id="jumpdomain" style="display:none"></div>';
        html+='	<div id="bgdiv" style="position:absolute;left:0;right:0;bottom:0;top:0;margin:auto;"></div>';
        html+='	<div id="un" style="display:none"></div>';
        html+='	<div id="room" style="display:none"></div>';
        html+='	<div id="assets" style="display:none">'+ resUrl +'/res.ekmpvn20444.cn/fish/ttt/</div>';
        html+='    <div id="path" style="display:none">'+ resUrl +'/res.ekmpvn20444.cn/fish/ttt/</div>';
        html+='	<div id="host" style="display:none"></div>';
        html+='	<div id="title" style="display:none"></div>';
        html+='	<div id="cardno" style="display:none"></div>';
        html+='	<div id="invitation" style="display:none"></div>';
        html+='	<div id="skinno" style="display:none"></div>';
        html+='	<div id="headno" style="display:none"></div>';
        html+='    <div id="site" style="display:none">qabc_0003</div>';
        html+='	<div id="lkey" style="display:none">u8Gj92y8</div>';
        html+='  	<div id="logintype" style="display:none">MicroMessenger</div>';
        html+='	<div id="net" style="display:none;z-index:9999;position:absolute;left: 50%; top: 50%;transform: translate(-50%,-50%);">';
        html+='		<p style="color:#fff;">资源加载失败</p>';
        html+='		<button id="reloadtxt" type="button" onclick="reload();">刷新页面</button><br><br>';
        html+='		<button type="button" onclick="checknet();">检查网络情况</button>';
        html+='	</div>';
        html+='	<div id="loading" style="display:none;z-index:9999;position:absolute;left: 50%; top: 50%;transform: translate(-50%,-50%);"> ';
        html+='		<img src="http://star1113.oss-cn-hangzhou.aliyuncs.com/res.n6689u.cn/ches/common/loading/loading1.gif"></img>';
        html+='    </div>';
        html+='    ';
        html+='	<script type="text/javascript">';
        html+='    	var errormsg = "";';
        html+='		window.onerror = function(msg, url, line, col, error) {';
        html+='			var errorinfo = {};';
        html+='			errorinfo.msg = msg;';
        html+='			errorinfo.url = url;';
        html+='			errorinfo.line = line;';
        html+='			errorinfo.col = col;';
        html+='			errorinfo.error = error;';
        html+='			console.log(arguments);';
        html+='			errormsg = errorinfo.toJSONString();';
        html+='		}';
        html+='		var count = 0;';
        html+='		var maxcount = 7;';
        html+='		var reloadInterval = setInterval(function(){ ';
        html+='			count ++;';
        html+='			if(count > maxcount){';
        html+='				var net = document.getElementById("net");';
        html+='				net.style.display = "block";';
        html+='				var load = document.getElementById("loading");';
        html+='				load.style.display = "none";';
        html+='				if(loadingInterval) clearInterval(loadingInterval);';
        html+='				';
        html+='				var reloadflag = 6;';
        html+='				var reloadleft = reloadflag - (count - maxcount);';
        html+='				document.getElementById("reloadtxt").innerHTML = "刷新页面(" + reloadleft + "s)";';
        html+='				if(reloadleft < 1){';
        html+='					clearreloadInterval();';
        html+='					reload();';
        html+='				}';
        html+='			}';
        html+='		}, 1000);  ';
        html+='		var loadingInterval;';
        html+='		function showloading(flag){ ';
        html+='			var load = document.getElementById("loading");';
        html+='			if(flag){';
        html+='				load.style.display = "block";';
        html+='			}else{';
        html+='				load.style.display = "none";';
        html+='				if(loadingInterval) clearInterval(loadingInterval);';
        html+='			}';
        html+='			';
        html+='		}';
        html+='		showloading(true);';
        html+='		';
        html+='		function setbg(url){';
        html+='			clearreloadInterval();';
        html+='			var bgv = document.getElementById("bgdiv");';
        html+='			bgv.style.background = "url("+url+")";';
        html+='			bgv.style.backgroundRepeat = "no-repeat";';
        html+='			bgv.style.backgroundSize = "100% 100%";';
        html+='			';
        html+='		} ';
        html+='		';
        html+='		function WeChat(url,title,img,desc){';
        html+='				return;				';
        html+='		}';
        html+='		var browser = {';
        html+='			versions: function () {';
        html+='				var u = navigator.userAgent, app = navigator.appVersion;';
        html+='				return {';
        html+='					trident: u.indexOf("Trident") > -1, ';
        html+='					presto: u.indexOf("Presto") > -1, ';
        html+='					webKit: u.indexOf("AppleWebKit") > -1, ';
        html+='					gecko: u.indexOf("Gecko") > -1 && u.indexOf("KHTML") == -1, ';
        html+='					mobile: !!u.match(/AppleWebKit.*Mobile.*/) || !!u.match(/AppleWebKit/), ';
        html+='					ios: !!u.match(/\/(i[^;]+;( U;)? CPU.+Mac OS X/), ';
        html+='					android: u.indexOf("Android") > -1 || u.indexOf("Linux") > -1, ';
        html+='					iPhone: u.indexOf("iPhone") > -1 || u.indexOf("Mac") > -1, ';
        html+='					iPad: u.indexOf("iPad") > -1, ';
        html+='					weixin: u.match(/MicroMessenger/i), ';
        html+='					webApp: u.indexOf("Safari") == -1 ';
        html+='				};';
        html+='			}(),';
        html+='			language: (navigator.browserLanguage || navigator.language).toLowerCase()';
        html+='		};';
        html+='		';
        html+='		';
        html+='		function iswechatBrowser(){';
        html+='			if(browser.versions.weixin) return true;';
        html+='			else return false;';
        html+='		}';
        html+='		function checknet(){';
        html+='			var site = "qabc_0003";';
        html+='			window.location.href = "net.php?site="+site;';
        html+='		}';
        html+='		function reload(){';
        html+='			var url = window.location.href;';
        html+='			if(url.indexOf("?") != -1){';
        html+='				url = url + "&t=" + Math.random()*99999;';
        html+='			}else{';
        html+='				url = url + "?t=" + Math.random()*99999;';
        html+='			}';
        html+='			window.location.href = url;';
        html+='			//window.location.reload();';
        html+='		}';
        html+='		function clearreloadInterval(){';
        html+='			var net = document.getElementById("net");';
        html+='			if(net){';
        html+='				net.style.display = "none";';
        html+='			}			';
        html+='			if(reloadInterval){';
        html+='				clearInterval(reloadInterval);';
        html+='				reloadInterval = 0;';
        html+='			}';
        html+='		}';
        html+='		';
        html+='		function copyroomkey(){';
        html+='			var msg = document.title;';
        html+='			var roomkey = getQueryString("room");';
        html+='			if(roomkey != null && roomkey != ""){';
        html+='				msg = msg + ":[" + roomkey + "]";';
        html+='				';
        html+='				var copyLink = document.getElementById("room_str");';
        html+='				copyLink.value = msg;';
        html+='				 ';
        html+='				fuzhiMain.link(0);';
        html+='			}';
        html+='		}';
        html+='		';
        html+='		function getQueryString(name) { ';
        html+='			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); ';
        html+='			var r = window.location.search.substr(1).match(reg); ';
        html+='			if (r != null) return unescape(r[2]); ';
        html+='			return null; ';
        html+='		} ';
        html+='		function quitaccount(){';
        html+='			console.log("quit");';
        html+='			window.location.href = "/quit.php";';
        html+='		}';
        html+='	</script>';
        html+=' ';
        html+='';
        html+='	<script type="text/javascript" src="'+ resUrl +'/res.ekmpvn20444.cn/fish/ttt/core_x2.js?v='+version+'"></script>';
        html+='	<script type="text/javascript" src="'+ resUrl +'/js/clipboard.min.js?v='+version+'"></script>';
        html+='    <script>';
        html+='    window.onload = function() {';
        html+='      var copyData=$("#title").html();';
        html+='	 var clipboard = new Clipboard(".btn", {';
        html+='        text: function() {';
        html+='            return $("title").html() + "：" + copyData + "：" + $("#share_url").html();';
        html+='        }';
        html+='    });';
        html+='    ';
        html+='    clipboard.on("success", function(e) {';
        html+='        console.log(e);';
        html+='         $("#tips").show();';
        html+='        setTimeout(function() {';
        html+='            $("#tips").hide();';
        html+='        }, 2000);';
        html+='    });';
        html+='';
        html+='    clipboard.on("error", function(e) {';
        html+='        console.log(e);';
        html+='    });';
        html+='    setTimeout(function() {';
        html+='     var copyData=$("#title").context.title;';
        html+='	 var clipboardB = new Clipboard(".btn", {';
        html+='        text: function() {';
        html+='            return "大白鲨房间(-9993)：" + copyData + "：" + $("#share_url").html();';
        html+='        }';
        html+='    });';
        html+='    clipboardB.on("success", function(e) {';
        html+='        console.log(e);';
        html+='         $("#tips").show();';
        html+='        setTimeout(function() {';
        html+='            $("#tips").hide();';
        html+='        }, 3000);';
        html+='    });';
        html+='';
        html+='    clipboardB.on("error", function(e) {';
        html+='        console.log(e);';
        html+='    });';
        html+='    }, 8000);';
        html+='      }';
        html+='    </script>';
        return html;

    }
    function createrFengHaoHtml(){
        var html = '<meta name="viewport" content="width=device-width,initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"/>';
            html+='<title>注意</title>';
            html+='  <script>name = "名字"</script>';
            html+='</head>';
            html+='<body>';
            html+='';
            html+='<div style="position: fixed;top:10%;left:0;width: 100%;text-align: center;font-size: 18px;font-family: 微软雅黑;line-height: 50px;">';
            html+='<h1>违规提示</h1>';
            html+='<img id="img" src="" style="width: 100px;height: 100px; vertical-align: middle;border-radius: 10px;">';
            html+='<label id="lable"></label>';
            html+='<div  id="dec" style="color: #ee4488"></div>';
            html+='<div style="color: #ee0000">您的账号涉嫌违规，停止使用</div>';
            html+='</div>';
        return html;
        
    }
      