var ws;
var appData={
    socketStatus:0
}
var app = angular.module('app', [])

app.directive('ngInput', [function () {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs) {
            element.on('input', oninput);
            scope.$on('$destroy', function () {//销毁的时候取消事件监听
                element.off('input', oninput);
            });

            function oninput(event) {
                scope.$evalAsync(attrs['ngInput'], {$event: event, $value: this.value});
            }
        }
    }
}]);

app.controller("myCtrl", function ($scope, $http) {
    $scope.width = window.innerWidth;
    $scope.height = window.innerHeight;
    $scope.rpHeight = $scope.width * 1.02;
    $scope.rpWidth = $scope.width * 0.76
    $scope.rpLeft = $scope.width * 0.12;
    $scope.rpX = $scope.rpWidth * 0.08;
    $scope.rpTop = ($scope.height - $scope.rpHeight) / 2 - 30;
    $scope.lineTop = $scope.rpTop + $scope.rpHeight / 2;
    $scope.receiveNameX = $scope.rpX * 1.5 + $scope.width * 0.1;
    $scope.receiveNameWidth = ($scope.rpWidth - $scope.rpX * 3 - $scope.width * 0.1) / 1.5;
    $scope.receiveNameOffset = 2;
    $scope.receiveCountWidth = $scope.rpWidth - $scope.receiveNameX - $scope.receiveNameWidth - $scope.receiveNameOffset - $scope.rpX * 0.7;

    $scope.userInfo = userData;

    $scope.redPackage = {
        content: "",
        headimgurl: "",
        is_receive: "0",
        nickname: "",
        receive_headimgurl: "",
        receive_nickname: "",
        receive_time: "",
        ticket_count: ""
    };
    $scope.redCode = getQueryFirstValue();

    /* 绑定手机 */
    //$scope.isAuthPhone = "<?php //echo $isAuthPhone;?>//";
    //$scope.phone = "<?php //echo $phone;?>//";
    $scope.sPhone = '';
    $scope.sAuthcode = '';
    $scope.authcodeType = 1;
    $scope.authcodeText = '发送验证码';
    $scope.authcodeTime = 60;
    $scope.phoneType = 1;
    $scope.phoneText = '绑定手机';

    if ($scope.redPackage.isReceive == 0) {
        $scope.redPackage.receiveAvatar = $scope.userInfo.avatar;
        $scope.redPackage.receiveName = $scope.userInfo.nickname;
    }

    var socketStatus = 0;
    $(".main").show();


    $scope.blockBtn = false;

    $scope.activity = new Array();
    $scope.isShowAlert = false;
    $scope.alertType = 0;
    $scope.alertText = "";
    $scope.gotoHall = function () {
        //alert('你点击了我的');
        window.location.href = "/";
    }
    $scope.showAlert = function (type, text) {
        $(".alertText").css("top", "90px")
        $scope.alertType = type;
        $scope.alertText = text;
        $scope.isShowAlert = true;

        setTimeout(function () {
            $scope.$apply();
        }, 0);

        setTimeout(function () {
            var wHeight = window.innerHeight;
            var alertHeight = $(".alertText").height();
            var textHeight = $(".alertText").height();

            if (alertHeight < wHeight * 0.15) {
                alertHeight = wHeight * 0.15;
            }

            if (alertHeight > wHeight * 0.8) {
                alertHeight = wHeight * 0.8;
            }

            var mainHeight = alertHeight + wHeight * (0.022 + 0.034) * 2 + wHeight * 0.022 + wHeight * 0.056;
            if (type == 8) {
                mainHeight = mainHeight - wHeight * 0.022 - wHeight * 0.056
            }

            var blackHeight = alertHeight + wHeight * 0.034 * 2;
            var alertTop = wHeight * 0.022 + (blackHeight - textHeight) / 2;

            $(".alert .mainPart").css('height', mainHeight + 'px');
            $(".alert .mainPart").css('margin-top', '-' + mainHeight / 2 + 'px');
            $(".alert .mainPart .backImg .blackImg").css('height', blackHeight + 'px');
            $(".alert .mainPart .alertText").css('top', alertTop + 'px');

            $scope.$apply();
        }, 0)
    }
    $scope.closeAlert = function () {
        if ($scope.alertType == 1) {
            $scope.isShowAlert = false;
            if (!$scope.is_connect) {
                $scope.is_connect = true;
            }
        } else {
            $scope.isShowAlert = false;
        }
    }

    $scope.backToHall = function () {
        window.location.replace("/")
    }

    $scope.cardNum = Number($scope.userInfo.card);
    $scope.number = 0; //输入数量
    $scope.inputNumber = null;  //输入框数字

    if ($scope.cardNum === null
        || $scope.cardNum === undefined
        || isNaN($scope.cardNum)) {
        $scope.cardNum = 0;
    }

    $scope.formatShowTime = function () {

        var newDate = new Date($scope.redPackage.receiveTime);
        newDate.setTime($scope.redPackage.receiveTime * 1000);
        var Month = (newDate.getMonth() + 1 < 10 ? '0' + (newDate.getMonth() + 1) : newDate.getMonth() + 1);
        var Day = newDate.getDate() + ' ';
        var Day = newDate.getDate() < 10 ? '0' + newDate.getDate() : newDate.getDate();
        var hour = newDate.getHours() < 10 ? '0' + newDate.getHours() : newDate.getHours();
        var min = newDate.getMinutes() < 10 ? '0' + newDate.getMinutes() : newDate.getMinutes();

        $scope.redPackage.showTime = Month + '-' + Day + '    ' + hour + ':' + min;
    }

    $scope.formatShowTime();

    setTimeout(function () {
        var tempDiv = document.getElementById('openImg');
        if (tempDiv) {
            tempDiv.addEventListener('touchstart', function (event) {
                $('#openImg').animate({top: "-10%", left: "-10%", width: "120%", height: "120%"}, 30);
            }, false);

            tempDiv.addEventListener('touchend', function (event) {
                $('#openImg').animate({top: "0%", left: "0%", width: "100%", height: "100%"}, 30);
            }, false);
        }
    }, 100);


    $scope.clickOpenRedPackage = function () {
        if ($scope.blockBtn == true) {
            return;
        }
        $scope.blockBtn = true;
        socketModule.receiveRedCode();
    }


    setTimeout(function () {
        $scope.$apply();
    }, 100);


    $scope.getAuthcodeHttp = function (phone) {
        $http({
            url: '<?php echo $base_url;?>account/getMobileSms',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                "phone": phone,
                "session": "",
            },
        }).success(function (data) {

            if (data.result == 0) {
                setTimeout(function () {
                    $scope.authcodeTime = 60;
                    authcodeTimer();
                    $scope.authcodeType = 2;
                }, 0);

            } else {
                alert(data.result_message)
            }
        }).error(function (data) {
            console.log(data);
        });
    };

    $scope.bindPhoneHttp = function (phone, authcode) {
        $http({
            url: '<?php echo $base_url;?>account/checkSmsCode',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                "phone": phone,
                "code": authcode,
                "session": "",
            },
        }).success(function (data) {

            if (data.result == 0) {
                setTimeout(function () {
                    $scope.isAuthPhone = 0;
                    $scope.phone = $scope.sPhone;

                    if (data.data.account_id != $scope.userInfo.account_id) {
                        $scope.showAlert(23, data.result_message);
                    } else {
                        $scope.showAlert(6, data.result_message);
                    }

                    $scope.userInfo.card = parseInt($scope.userInfo.card) + parseInt(data.data.card_count);

                    $scope.sPhone = '';
                    $scope.sAuthcode = '';
                    $scope.$apply();
                }, 0);
            } else {
                setTimeout(function () {
                    $scope.showAlert(6, data.result_message);
                    $scope.$apply();
                }, 0);
            }
        }).error(function (data) {
            setTimeout(function () {
                $scope.authcodeTime = 0;
                $scope.showAlert(6, "绑定失败");
                $scope.$apply();
            }, 0);
        });
    };


    $scope.finishBindPhone = function () {
        window.location.href = window.location.href + "&id=" + 10000 * Math.random() + "<?php echo '&wid=' . $wid; ?>";
    };

    $scope.reloadView = function () {
        window.location.href = window.location.href + "&id=" + 10000 * Math.random() + "<?php echo '&wid=' . $wid; ?>";
    };

    $scope.bindPhone = function () {
        var validPhone = checkPhone($scope.sPhone);
        var validAuthcode = checkAuthcode($scope.sAuthcode);

        if (validPhone == false) {
            setTimeout(function () {
                $scope.showAlert(6, '手机号码有误，请重填');
            }, 0);

            return;
        }

        if (validAuthcode == false) {
            setTimeout(function () {
                $scope.showAlert(6, '验证码有误，请重填');
            }, 0);

            return;
        }

        $scope.bindPhoneHttp($scope.sPhone, $scope.sAuthcode);
    };

    $scope.getAuthcode = function () {
        if ($scope.authcodeType != 1) {
            return;
        }

        var color = $('#authcode').css('background-color');

        if (color != 'rgb(64, 112, 251)') {
            return;
        }

        var validPhone = checkPhone($scope.sPhone);

        if (validPhone == false) {
            setTimeout(function () {
                $scope.showAlert(6, '手机号码有误，请重填');
            }, 10);

            return;
        }

        $scope.getAuthcodeHttp($scope.sPhone);
    };

    $scope.phoneChange = function () {
        var result = checkPhone($scope.sPhone);
        if (result) {
            $('#authcode').css('background-color', 'rgb(64,112,251)');
        } else {
            $('#authcode').css('background-color', 'lightgray');
        }
    };

    function checkPhone(phone) {

        if (!(/^1(3|4|5|7|8)\d{9}$/.test(phone))) {
            return false;
        } else {
            return true;
        }
    };

    function checkAuthcode(code) {
        if (code == '' || code == undefined) {
            return false;
        }

        var reg = new RegExp("^[0-9]*$");
        if (!reg.test(code)) {
            return false;
        } else {
            return true;
        }
    };

    var authcodeTimer = function authcodeTimer() {
        if ($scope.authcodeTime <= 0) {
            $scope.authcodeText = '发送验证码';
            $scope.authcodeTime = 60;
            $scope.authcodeType = 1;
            return;
        }

        $scope.authcodeTime = $scope.authcodeTime - 1;
        $scope.authcodeText = $scope.authcodeTime + 's';

        setTimeout(function () {
            $scope.$apply();
        }, 0);

        setTimeout(function () {
            authcodeTimer();
        }, 1000);
    };

    function logMessage(message) {
        // console.log(message);
    };
    $scope.tiao;
    dealMessageFunc = function(obj){
        if (obj.operation == "createRedCode") {
            socketModule.processCreateRedCode(obj);
        } else if(obj.operation == "receiveRedCode"){
            socketModule.processReceiveRedCode(obj);
        } else if(obj.operation == "getSendList"){
            socketModule.processGetSendList(obj);
        } else if(obj.operation == "getReceiveList"){
            socketModule.processGetReceiveList(obj);
        } else if(obj.operation == "getAccountInfo"){
            socketModule.pGAI(obj);
        } else if(obj.operation == "getRedEnvelopData"){
            socketModule.pGRED(obj);
        } else {
            logMessage(obj.operation);
        }
    }
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
                    code: $scope.redCode,
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

                if (obj.result == 0) {
                    $scope.redPackage.rt = obj.data.receive_time;
                    $scope.redPackage.rn = userData.nickname;
                    $scope.redPackage.rh = userData.headimgurl;
                    $scope.redPackage.c = obj.data.ticket_count;

                    $scope.$apply();
                    $("#ropen").show();
                    $("#notopen").hide();
                } else {
                    window.location.reload();
                    //alert(data.result_message);
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
            // console.log('processGetSendList',obj)
            $scope.outTotalPage = obj.data.sum_page;
            $scope.outPage = $scope.outPage + 1;
            var list = obj.data.list;
            for (x in list) {
                var code = list[x].code;

                if ($scope.outCodes.indexOf(code) < 0) {
                    var tmpTime = list[x].create_time;
                    var content = '未领取';
                    var color = 'orange';
                    if (list[x].is_receive == 1) {
                        content = '已领取';
                        color = 'lightgray';

                        if (list[x].is_return == 1) {
                            content = '已过期退回';
                        }
                    }

                    var value = {
                        'name': '房卡包',
                        'content':content,
                        'time':tmpTime,
                        'count':list[x].ticket_count,
                        'origin':list[x],
                    }

                    $scope.outCodes.push(code);
                    $scope.outRedPackages.push(value);
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
            // console.log('processGetReceiveList',obj);
            //请求成功页数加1
            $scope.receivePage = $scope.receivePage + 1;
            $scope.receiveTotalPage = obj.data.sum_page;
            var list = obj.data.list;
            for (x in list) {
                var code = list[x].code;

                if ($scope.receiveCodes.indexOf(code) < 0) {
                    var tmpTime = list[x].receive_time;
                    var content = '已领取';
                    var value = {
                        'name': list[x].nickname,
                        'content':content,
                        'time':tmpTime,
                        'count':list[x].ticket_count,
                        'origin':list[x],
                    }

                    $scope.receiveCodes.push(code);
                    $scope.receiveRedPackages.push(value);
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

            socketModule.gRED();
        },
        gRED: function () {
            rd({
                operation: "getRedEnvelopData",
                account_id: "",
                data: {
                    token:globalData.tk,
                    code:$scope.redCode
                }
            });
        },
        pGRED: function (obj) {

            var data = obj.data;
            if (data.ire == 1) {
                $("#notopen").hide();
                $("#ropen").show();
            } else {
                $("#notopen").show();
                $("#ropen").hide();
            }
            $("#loading").hide();
            if(data.h.indexOf("http://")==-1&&data.h.indexOf("https://")==-1){
                data.h=obj.wh+"/"+data.h;
            }
            if(data.rh.indexOf("http://")==-1&&data.rh.indexOf("https://")==-1){
                data.rh=obj.wh+"/"+data.rh;
            }

            $scope.redPackage=data;

            $scope.$apply();
        },
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
                socketModule.gRED();
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
    $scope.connectApi()
    function reconnectSocket() {
        $scope.connectApi();
    };
})