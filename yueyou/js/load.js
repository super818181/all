var DynLoading = {
    loginWx: function (code) {
        obj = this.hall(BaseUrl + '/wx/login?code=' + code);
        if (obj.result != 0) {
            window.localStorage.setItem('token', obj.data.tk);
            window.location.href = window.localStorage.getItem('return_url');
        }
    },
    gotoWx: function () {
        obj = this.hall(BaseUrl + '/wx/info');
        console.log(obj);
        if (obj.result != 0) {
            var return_url = window.localStorage.getItem('return_url');
            var rurl = return_url ? return_url : window.location.href;
            var appid = obj.data.appid;
            var sq = obj.data.sq;
            var redirect_uri = 'http://' + sq + '/w.html?rurl=' + rurl;
            window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + encodeURI(redirect_uri) + '&response_type=code&scope=snsapi_userinfo#wechat_redirect';
        }
    },
    goto: function (act, uri) {
        let go_url = '';

        var _thost = window.location.host;
        var pathArr = window.location.pathname.split("/");
        if(pathArr.length==3 && pathArr[1] != ""){
            if(pathArr[1].search(".html")!=-1){
                //
            }else{
                _thost = window.location.host + "/" + pathArr[1];
            }
        }

        if (act == '/') {
            go_url = 'http://' + _thost + "/";
        } else if (act == 'chat/') {
            if (Suffix != "") {
                go_url = 'http://' + _thost + "/chat/index" + Suffix;
            } else {
                go_url = 'http://' + _thost + "/" + act + Suffix;
            }
        } else {
            go_url = 'http://' + _thost + "/" + act + Suffix;
        }

        if (uri) {
            go_url = go_url + "?" + uri;
        }
        window.location.href = go_url;
    },
    getPath: function (act, uri) {
        let go_url = '';

        var _thost = window.location.host;
        var pathArr = window.location.pathname.split("/");
        if(pathArr.length==3 && pathArr[1] != ""){
            if(pathArr[1].search(".html")!=-1){
                //console.log(".html");
            }else{
                _thost = window.location.host + "/" + pathArr[1];
            }
        }

        if (act == '/') {
            go_url = 'http://' + _thost + "/";
        } else if (act == 'chat/') {
            if (Suffix != "") {
                go_url = 'http://' + _thost + "/chat/index" + Suffix;
            } else {
                go_url = 'http://' + _thost + "/" + act + Suffix;
            }
        } else {
            go_url = 'http://' + _thost + "/" + act + Suffix;
        }

        if (uri) {
            go_url = go_url + "?" + uri;
        }
        return go_url;
    },
    css: function (url, callback) {
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        var fn = callback || function () {
        };

        link.rel = 'stylesheet';
        link.type = 'text/css';
        //IE
        if (link.readyState) {
            link.onreadystatechange = function () {
                if (link.readyState == 'loaded' || link.readyState == 'complete') {
                    link.onreadystatechange = null;
                    fn();
                }
            };
        } else {
            //其他浏览器
            link.onload = function () {
                fn();
            };
        }
        link.href = url;
        head.appendChild(link);
    },
    js: function (url, callback) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        var fn = callback || function () {
        };

        script.type = 'text/javascript';
        //IE
        if (script.readyState) {
            script.onreadystatechange = function () {
                if (script.readyState == 'loaded' || script.readyState == 'complete') {
                    script.onreadystatechange = null;
                    fn();
                }
            };
        } else {
            //其他浏览器
            script.onload = function () {
                fn();
            };
        }
        script.src = url;
        head.appendChild(script);
    },
    body: function (url, callback) {
        var body = document.getElementsByTagName('body')[0];
        var xhr = this.createXHR();  //实例化XMLHttpRequest 对象
        xhr.open("GET", url, false);  //建立连接，要求同步响应
        xhr.send(null);  //发送请求
        console.log("//===========>>>bb");
        console.log(url);
        console.log(xhr.responseText);  //接收数据
        //body.appendChild(script);

        body.appendChild(xhr.responseText);
    },
    img: function (img, callback) {
    },
    //创建XMLHttpRequest 对象
    //参数：无
    //返回值：XMLHttpRequest 对象
    createXHR: function () {
        var XHR = [  //兼容不同浏览器和版本得创建函数数组
            function () {
                return new XMLHttpRequest()
            },
            function () {
                return new ActiveXObject("Msxml2.XMLHTTP")
            },
            function () {
                return new ActiveXObject("Msxml3.XMLHTTP")
            },
            function () {
                return new ActiveXObject("Microsoft.XMLHTTP")
            }
        ];
        var xhr = null;
        //尝试调用函数，如果成功则返回XMLHttpRequest对象，否则继续尝试
        for (var i = 0; i < XHR.length; i++) {
            try {
                xhr = XHR[i]();
            } catch (e) {
                continue  //如果发生异常，则继续下一个函数调用
            }
            break;  //如果成功，则中止循环
        }
        return xhr;  //返回对象实例
    },
    getWwid: function () {
        return window.localStorage.getItem("wwid");
    },
    setWwid: function (wwid) {
        window.localStorage.setItem("wwid", wwid);
    },
    wxlog: function (url) {
        var xhr = this.createXHR();  //实例化XMLHttpRequest 对象
        xhr.open("GET", url, false);  //建立连接，要求同步响应
        //xhr.setRequestHeader('Authorization', ' Bearer ' +  this.getWwid());
        //xhr.withCredentials = true;
        xhr.send(null);  //发送请求
        //console.log(url);
        //console.log(xhr.responseText);  //接收数据
        //return {"result":1,"data":[],"result_message":"\u8bf7\u5148\u767b\u5f55"};
        return JSON.parse(xhr.responseText);
    },
    hall: function (url) {
        var xhr = this.createXHR();  //实例化XMLHttpRequest 对象
        xhr.open("GET", url, false);  //建立连接，要求同步响应
        //xhr.setRequestHeader('Authorization', ' Bearer ' + this.getWwid());
        //xhr.withCredentials = true;
        xhr.send(null);  //发送请求
        return JSON.parse(xhr.responseText);
    },
    getCookie: function (cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        return "";
    },
    setCookie: function (cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toGMTString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    },
    getUrlParam: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    },
    isWeiXin: function () {
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == 'micromessenger') {
            return true; // 是微信端
        } else {
            return false;
        }
    }
}
var headers = {"Authorization": DynLoading.getWwid()};
var Htmls = {
    getReviewUrl: function (game_type, number) {
        var url;
        if (game_type == 1) {
            url = DynLoading.getPath('review_bull', 'type=' + game_type + '&num=' + number);
        } else if (game_type == 3 || game_type == 4) {
            url = DynLoading.getPath('review_flower', 'type=' + game_type + '&num=' + number);
        } else if (game_type == 5) {
            url = DynLoading.getPath('review_sangong', 'type=' + game_type + '&num=' + number);
        } else if (game_type == 6) {
            url = DynLoading.getPath('review_erba', 'type=' + game_type + '&num=' + number);
        } else if (game_type == 7) {
            url = DynLoading.getPath('review_landlord', 'type=' + game_type + '&num=' + number);
        } else if (game_type == 8) {
            url = DynLoading.getPath('review_majiang', 'type=' + game_type + '&num=' + number);
        } else if (game_type == 9) {
            url = DynLoading.getPath('review_xiaxie', 'type=' + game_type + '&num=' + number);
        } else if (game_type == 10) {
            url = DynLoading.getPath('review_paijiu', 'type=' + game_type + '&num=' + number);
        } else if (game_type == 12) {
            url = DynLoading.getPath('review_dxbull', 'type=' + game_type + '&num=' + number);
        } else if (game_type == 13) {
            url = DynLoading.getPath('review_dcx', 'type=' + game_type + '&num=' + number);
        } else if (game_type == 14) {
            url = DynLoading.getPath('review_laib', 'type=' + game_type + '&num=' + number);
        } else if (game_type == 17) {
            url = DynLoading.getPath('review_jia31', 'type=' + game_type + '&num=' + number);
        } else if (game_type == 18) {
            url = DynLoading.getPath('review_dpj', 'type=' + game_type + '&num=' + number);
        } else if (game_type == 42) {
            url = DynLoading.getPath('review_jxsg', 'type=' + game_type + '&num=' + number);
        } else {
            url = DynLoading.getPath('/');
        }
        return url;
    },
    getRoomUrl: function (game_type, max_count, room_number) {
        var url = '';
        var game_name = '';
        if (game_type == 1) {
            game_name = 'bbull';
        } else if (game_type == 3) {
            game_name = 'flowerxp';
        } else if (game_type == 4) {
            game_name = 'flower';
        } else if (game_type == 5) {
            game_name = 'sangong';
        } else if (game_type == 6) {
            game_name = 'erba';
        } else if (game_type == 7) {
            game_name = 'ddz';
        } else if (game_type == 8) {
            game_name = 'gdmj';
        } else if (game_type == 9) {
            game_name = 'xx';
        } else if (game_type == 10) {
            game_name = 'paijiu';
        } else if (game_type == 12) {
            game_name = 'dxb';
        } else if (game_type == 13) {
            game_name = 'dcx';
        } else if (game_type == 14) {
            game_name = 'laib';
        } else if (game_type == 15) {
            game_name = 'dbull';
        } else if (game_type == 16) {
            url = "";
        } else if (game_type == 41) {
            game_name = 's13';
        } else if (game_type == 17 || game_type == 37) {
            game_name = 'jia';
        } else if (game_type == 18) {
            game_name = 'dpj';
        } else if (game_type == 8 || game_type == 20) {
            game_name = 'gdmj';
        } else if (game_type == 30) {
            game_name = 'dpj';
        } else if (game_type == 34) { //牛 牛新合集
            game_name = 'bbull';
        } else if (game_type == 38) {
            game_name = 'xp';
        } else if (game_type == 43) {
            game_name = 'zn';
        }
        url = DynLoading.getPath(game_name + max_count, "i=" + room_number);
        return url;
    },
    getHallUrl: function () {
        return '/';
    }
};

if (!DynLoading.isWeiXin()) {
    //window.location.href = 'https://mp.weixin.qq.com/';
}


//用法
/*
DynLoading.js('file.js',function(){
    alert(1);
});

  function load(js){
    var s = document.createElement('script');
    s.setAttribute('type','text/javascript');
    s.setAttribute('src',js);
    var head = document.getElementsByTagName('head');
    head[0].appendChild(s);

    }
    function write(js){
    document.write('<script type="text/javascript" src="'+js+'" > <\/script>');
    }

           load("https://www.jb51.net/js/2011/jquery-1.5.1.min.js");
          // write("https://www.jb51.net/js/2011/jquery-1.5.1.min.js");


 */

/*
var xhr = new XMLHttpRequest;
xhr.open('get','file.js',true);
xhr.onreadystatechange = function(){
    if( xhr.readyState == 4 ){
        if( xhr.status >=200 && xhr.status < 300 || xhr.status == 304 ){
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.text = xhr.responseText;
            document.body.appendChild(script);
        }
    }
};
xhr.send(null);

var xhr = createXHR();  //实例化XMLHttpRequest 对象
xhr.open("GET", url, false);  //建立连接，要求同步响应
xhr.send(null);  //发送请求
console.log(xhr.responseText);  //接收数据

$.ajax({
                type: "get",
                url: BaseUrl + '/home1/index',
                cache: false,
                async: false,
                dataType: "text",
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                success: function(xmlobj){
                    console.log("//===========>>>bb");
                    console.log(xmlobj);
                }
            });

 */


//url = window.location.href; /* 获取完整URL */
//alert(url); /* http://127.0.0.1:8020/Test/index.html#test?name=test */

//url = window.location.pathname; /* 获取文件路径（文件地址） */
//alert(url); /* /Test/index.html */

//url = window.location.protocol; /* 获取协议 */
//alert(url); /* http */

//url = window.location.host; /* 获取主机地址和端口号 */
//alert(url); /* http://127.0.0.1:8020/ */

//url = window.location.hostname; /* 获取主机地址 */
//alert(url); /* http://127.0.0.1/ */

//url = window.location.port; /* 获取端口号 */
//alert(url); /* 8020 */

//url = window.location.hash; /* 获取锚点（“#”后面的分段） */
//alert(url); /* #test?name=test */

//url = window.location.search; /* 获取属性（“?”后面的分段） */
//alert(url);


