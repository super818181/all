var ws;
var appData={
    socketStatus:0
}
var app = angular.module('app',[])
var myscope;
app.controller("myCtrl", function($scope,$http) {
    myscope=$scope;
    $scope.width = window.innerWidth;
    $scope.height = window.innerHeight;
    $scope.userInfo = userData;

    $scope.outRedPackages = new Array();
    $scope.outCodes = new Array();
    $scope.receiveRedPackages = new Array();
    $scope.receiveCodes = new Array();
    $scope.outBScroll = null;
    $scope.canLoadOut = true;
    $scope.receiveBScroll = null;
    $scope.canLoadReceive = true;
    $scope.showLoadOut = true;
    $scope.showLoadReceive = true;

    $scope.outPage = 0 ;
    $scope.outTotalPage = 1;
    $scope.receivePage = 0;
    $scope.receiveTotalPage = 1;

    $(".main").show();
    $("#loading").hide();

    $scope.backHall = function () {
        window.location.replace("/");
    },

        $scope.initOutScroll = function () {
            setTimeout(function() {
                $scope.$apply();

                if (!$scope.outBScroll) {
                    $scope.outBScroll = new BScroll(document.getElementById('out-box'), {
                        startX: 0,
                        startY: 0,
                        scrollY: true,
                        scrollX: false,
                        click: true,
                        probeType: 1,
                        bounce:false,
                    });

                    $scope.outBScroll.on('touchend', function (position) {
                        // if(position.y <= (this.maxScrollY + 30) && $scope.canLoadOut) {
                        if(position.y <= (this.maxScrollY + 30)) {
                            $scope.canLoadOut= false;
                            $scope.loadMoreOut();
                        }
                    });
                } else {
                    $scope.outBScroll.refresh();
                }
            }, 10);
        }

    $scope.initReceiveScroll = function () {
        setTimeout(function() {
            $scope.$apply();

            if (!$scope.receiveBScroll) {
                $scope.receiveBScroll = new BScroll(document.getElementById('receive-box'), {
                    startX: 0,
                    startY: 0,
                    scrollY: true,
                    scrollX: false,
                    click: true,
                    probeType: 1,
                    bounce:false,
                });
                $scope.receiveBScroll.on('touchend', function (position) {
                    // if(position.y <= (this.maxScrollY + 30) && $scope.canLoadReceive) {
                    if(position.y <= (this.maxScrollY + 30)) {
                        $scope.canLoadReceive = false;
                        $scope.loadMoreReceive();
                    }
                });

            } else {
                $scope.receiveBScroll.refresh();
            }
        }, 10);
    }

    var formatShowTime = function (time) {
        var newDate = new Date();
        newDate.setTime(time * 1000);
        var year = newDate.getFullYear();
        var month = (newDate.getMonth() + 1 < 10 ? '0' + (newDate.getMonth() + 1) : newDate.getMonth() + 1);
        var day = newDate.getDate() < 10 ? '0' + newDate.getDate() : newDate.getDate() ;
        var hour = newDate.getHours() < 10 ? '0' + newDate.getHours() : newDate.getHours() ;
        var min = newDate.getMinutes() < 10 ? '0' + newDate.getMinutes() : newDate.getMinutes();

        var showTime = year + '-' + month + '-' + day + '        ' + hour +':' + min ;
        return showTime;
    }

    $scope.loadMoreOut = function () {
        if ($scope.outPage >= $scope.outTotalPage) {
            $scope.canLoadOut = true;
            return;
        }

        socketModule.getSendList();
        console.log('~~~~~loadMoreOut~~~~~');
    }

    $scope.loadMoreReceive = function () {
        if ($scope.receivePage >= $scope.receiveTotalPage) {
            $scope.canLoadReceive = true;
            return;
        }

        socketModule.getReceiveList();
        console.log('~~~~~loadMoreReceive~~~~~');
    }

    $scope.packageType=1;
    $scope.gotoHall = function () {
        //alert('你点击了我的');
        window.location.href = "/";
    }
    //切换到发出记录
    $scope.clickOutRedPackage = function () {
        $scope.packageType=1;
        $(".outDiv").show();

        $(".receiveDiv").hide();
        $("#selectTab").css("left", $scope.width * 0.15 + 'px');
        $("#outRP").css("color", "white");
        $("#reveiveRP").css("color", "black");
        socketModule.getSendList();
        $scope.initOutScroll();
    }

    //切换到收取记录
    $scope.clickReceiveRedPackage = function () {
        $("#selectTab").css("left", $scope.width * 0.51 + 'px');
        $("#outRP").css("color","black");
        $("#reveiveRP").css("color","white");

        $scope.packageType=2;
        $(".receiveDiv").show();
        $(".outDiv").hide();
        socketModule.getReceiveList();
        $scope.initReceiveScroll();
    }

    $scope.clickCell = function (data) {
        console.log('clickCell',data)
        window.location.replace("/"+ cr2('rp',data));
    }



    function logMessage(message) {
        console.log(message);
    };
    $scope.tiao;
    var socketModule = {
        createRedCode: function () {
            rd({
                operation: "createRedCode",
                account_id: userData.account_id,
                data: {
                    timestamp: Date.parse(new Date()) / 1000,
                    token: globalData.tk,
                    ticket_count: $scope.number,
                }
            });
        },
        processCreateRedCode:function (obj) {
            window.location.replace("/" + cr2('rp',obj.data.code));
        },
        receiveRedCode: function () {
            rd({
                operation: "receiveRedCode",
                account_id: userData.account_id,
                data: {
                    account_id:userData.account_id,
                    timestamp: Date.parse(new Date()) / 1000,
                    token: globalData.tk,
                    code: $scope.redPackage.code,
                }
            });
        },
        processReceiveRedCode:function (obj) {
            var timestamp = Date.parse(new Date());
            timestamp = timestamp / 1000;
            $scope.redPackage.receiveTime = timestamp;
            $scope.formatShowTime();

            setTimeout(function () {
                $(".btnOpen").removeClass('transf');

                if (obj.data.result == 0) {
                    $("#ropen").show();
                    $("#notopen").hide();
                } else {
                    window.location.reload();
                }
            }, 500);
            setTimeout(function(){
                $scope.blockBtn=false
            },2000)
        },
        getSendList: function () {
            rd({
                operation: "getSendList",
                account_id: userData.account_id,
                data: {
                    account_id:userData.account_id,
                    timestamp: Date.parse(new Date()) / 1000,
                    token: globalData.tk,
                    page: $scope.outPage + 1,
                }
            });
        },
        processGetSendList:function (obj) {
            //请求成功页面加1
            $scope.outTotalPage = obj.data.sum_page;
            $scope.outPage = $scope.outPage + 1;
            var list = obj.data.list;
            if(list.length>0){
                $scope.showLoadOut = true;
            }else{
                $scope.showLoadOut = false;
            }
            for (x in list) {
                // list[x].sh=obj.data.wh+"/"+list[x].sh;
                if(list[x].irec==1&&globalData.p_type&&globalData.p_type==2){
                    if(list[x].rh.indexOf("http://")==-1&&list[x].rh.indexOf("https://")==-1){
                        list[x].rh=obj.data.wh+"/"+obj.data.user[list[x].rid].h;
                    }else{
                        list[x].rh=obj.data.user[list[x].rid].h;
                    }

                    list[x].rn=obj.data.user[list[x].rid].n;
                }
                var code = list[x].co;

                if ($scope.outCodes.indexOf(code) < 0) {
                    $scope.outCodes.push(code);
                    $scope.outRedPackages.push(list[x]);
                }

            }

            setTimeout(function () {
                $(".outDiv").show();
            }, 1);

            $scope.initOutScroll();

            $scope.$apply();

        },
        getReceiveList: function () {
            rd({
                operation: "getReceiveList",
                account_id: userData.account_id,
                data: {
                    account_id:userData.account_id,
                    timestamp: Date.parse(new Date()) / 1000,
                    token: globalData.tk,
                    page: $scope.receivePage + 1,
                }
            });
        },
        processGetReceiveList:function (obj) {
            //请求成功页数加1
            $scope.receivePage = $scope.receivePage + 1;
            $scope.receiveTotalPage = obj.data.sum_page;
            // $scope.outRedPackages = [];
            var list = obj.data.list;
            if(list.length>0){
                $scope.showLoadReceive = true;
            }else{
                $scope.showLoadReceive = false;
            }
            for (x in list) {
                if(globalData.p_type&&globalData.p_type==2){
                    if(list[x].h.indexOf("http://")==-1&&list[x].h.indexOf("https://")==-1){
                        list[x].h=obj.data.wh+"/"+obj.data.user[list[x].sid].h;
                    }else{
                        list[x].h=obj.data.user[list[x].sid].h;
                    }
                }


                list[x].n=obj.data.user[list[x].sid].n;
                var code = list[x].co;

                if ($scope.receiveCodes.indexOf(code) < 0) {

                    $scope.receiveCodes.push(code);
                    $scope.receiveRedPackages.push(list[x]);
                }

            }

            $scope.initReceiveScroll();
            $scope.canLoadReceive = true;
            $scope.$apply();

        },
        gAI: function () {
            rd({
                operation: "getAccountInfo",
                account_id: "",
                data: {
                    token:globalData.tk
                }
            });
        },
        pGAI: function (obj) {
            var data = obj.data;
            var info = {
                "account_id":data.account_id,
                "nickname":data.nickname,
                "headimgurl":data.headimgurl,
                "card":data.ticket_count,
                "individuality":data.individuality,
                "user_id":data.user_id,
            };
            userData = info;
            $scope.$apply();
            setC('userData',JSON.stringify(info));

            socketModule.getSendList();

        },
    }
    dealMessageFunc = function(obj){
        if (obj.result != 0) {
            if (obj.operation == "getSendList") {
                $scope.showResultFunc(obj.result_message);
                setTimeout(function () {
                    socketModule.getSendList();
                },1000)
            }else if(obj.operation == "getAccountInfo"){
                $scope.showResultFunc(obj.result_message);
                setTimeout(function () {
                    socketModule.gAI();
                },1000)
            } else{
                $scope.showResultFunc(obj.result_message);
            }
        } else {
            if (obj.operation == "createRedCode") {
                socketModule.processCreateRedCode(obj);
            } else if (obj.operation == "receiveRedCode") {
                socketModule.processReceiveRedCode(obj);
            } else if (obj.operation == "getSendList") {
                socketModule.processGetSendList(obj);
            } else if (obj.operation == "getReceiveList") {
                socketModule.processGetReceiveList(obj);
            } else if (obj.operation == "getAccountInfo") {
                socketModule.pGAI(obj);
            } else {
                logMessage(obj.operation);
            }
        }
    }
    $scope.isShowResult = false;
    $scope.showResultText = '';
    $scope.showResultFunc = function (text) {
        $scope.isShowResult = true;
        $scope.showResultText = text;
        setTimeout(function () {
            $scope.isShowResult = false;
            $scope.showResultText = '';
            $scope.$apply();
        }, 1200)
        $scope.$applyAsync();
    };
    $scope.tiao;
    $scope.connectApi = function (socket, type) {
        $scope.socket_url=globalData.club;
        ws = new WebSocket(globalData.club);
        ws.onopen = function(){
            $scope.connectOrNot=true;
            $scope.tiao=setInterval(function(){
                shb('@');
            },25000);
            console.log("socketOpen");
            var userDataCookie = getC('userData');
            if(userDataCookie){
                var obj = JSON.parse(userDataCookie);
                var info = {
                    "account_id":obj.account_id,
                    "nickname":obj.nickname,
                    "headimgurl":obj.headimgurl,
                    "ticket_count":obj.card,
                    "individuality":obj.individuality,
                    "user_id":obj.user_id,
                };
                userData=info;
                socketModule.getSendList();
            }else{
                socketModule.gAI();
            }
        };
        ws.onmessage = function(evt){
            mc(evt);
        };
        ws.onclose = function(evt){
            console.log("ws closed");
            clearInterval($scope.tiao);
            setTimeout(function () {
                $scope.showResultFunc('服务器连接失败');
                $scope.connectApi($scope.socket_url);
            },2500)
        };
        ws.onerror = function(evt){
            $scope.showResultFunc('服务器连接失败');
            console.log("WebSocketError!");
        };
    }
    $scope.connectApi();
    function reconnectSocket() {
        $scope.connectApi();
    };
})