var ws;
var appData = {
    socketStatus: 0
}
var app = angular.module('app', [])

app.controller("myCtrl", function ($scope, $http) {
    $scope.width = window.innerWidth;
    $scope.height = window.innerHeight;

    $scope.userInfo = userData;

    var socketStatus = 0;
    $(".main").show();
    $("#loading").hide();

    $scope.activity = new Array();
    $scope.isShowAlert = false;
    $scope.alertType = 0;
    $scope.alertText = "";
    $scope.cardNum = 0;
    $scope.number = ''; //输入数量
    $scope.inputNumber = null;  //输入框数字

    if ($scope.cardNum === null
        || $scope.cardNum === undefined
        || isNaN($scope.cardNum)) {
        $scope.cardNum = 0;
    }

    //输入框数字改变
    $scope.changeNumber = function () {
        if ($scope.inputNumber > $scope.cardNum) {
            $scope.inputNumber = parseInt($scope.cardNum);
        }

        $scope.number = $scope.inputNumber;


        if ($scope.number === undefined || $scope.number === null) {
            $scope.number = 0;
        } else {
            //$scope.inputNumber = $scope.number;
        }
    }
    $scope.lock = false;

    $scope.createRedPackage = function () {

        if ($scope.number === undefined
            || $scope.number === null
            || isNaN($scope.number)
            || $scope.number <= 0) {
            alert('请输入正确的房卡数');
        } else {
            $('#createPackage').addClass('black')
            if ($scope.lock == true) {
                return
            }
            $scope.lock = true;
            setTimeout(function () {
                $('#createPackage').removeClass('black')
            }, 25000)
            socketModule.createRedCode();
        }
    }
    $scope.gotoHall = function () {
        //alert('你点击了我的');
        //window.location.replace("/")
        DynLoading.goto("/");
    }
    $scope.gotoMyRedPackage = function () {
        //window.location.replace("/" + cr('pl', new Date().getTime()));
        DynLoading.goto("packageRecord");
    }

    $scope.isShowEnterRoomNum = false;
    $scope.showEnterRoomNum = function () {
        $scope.isShowEnterRoomNum = true;
    }
    $scope.hideEnterRoomNum = function () {
        $scope.isShowEnterRoomNum = false;
    }

    $scope.enterRoomNum = function (num) {
        $scope.number = $scope.number + num
        if (parseInt($scope.number) > $scope.cardNum) {
            $scope.number = $scope.cardNum;
        }
    }
    $scope.resetRoomNum = function (num) {
        $scope.number = '';
    }
    $scope.cacelNum = function () {
        if ($scope.number.toString().length == 0) {
            return
        }
        var len = $scope.number.toString().length;
        $scope.number = $scope.number.toString().substring(0, len - 1);
    }

    function logMessage(message) {
        // console.log(message);
    };

    dealMessageFunc = function (obj) {
        if (obj.result != 0) {
            if (obj.operation == "getAccountInfo") {
                $scope.showResultFunc(obj.result_message);
                setTimeout(function () {
                    socketModule.gAI();
                }, 1000)
            } else {
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
            } else if (obj.operation == "getAccountCard") {
                socketModule.pGAC(obj);
            } else {
                logMessage(obj.operation);
            }
        }
    }
    $scope.tiao;
    var socketModule = {
        sendDataCode: function (obj) {
            var rest;
            if (obj != '@') {
                obj.data.timestamp = Date.parse(new Date()) / 1000;
                obj.data.token = globalData.tk;
                var params = {
                    operation: obj.operation,
                    account_id: userData.account_id,
                    session: globalData.tk,
                    s: ps.s(obj.data),
                    data: obj.data
                };
                var _obj = JSON.stringify(params);

                // var key = C.enc.Utf8.parse(ps.g(1));
                // var ivv = C.enc.Utf8.parse(ps.g());
                var encrypted = C.AES.encrypt(_obj, C.enc.Utf8.parse('1234567887654321'), {
                    iv: C.enc.Utf8.parse('8765432112345678'),
                    mode: C.mode.CBC,
                    padding: C.pad.ZeroPadding
                });
                rest = encrypted.toString();
                // if ($scope.cancelLog == false) {
                //     console.log('发送的数据:', params)
                // }
            } else {
                rest = obj;
            }
            ws.send(rest);
        },
        createRedCode: function () {
            socketModule.sendDataCode({
                operation: "createRedCode",
                account_id: $scope.userInfo.id,
                data: {
                    timestamp: Date.parse(new Date()) / 1000,
                    token: globalData.tk,
                    ticket_count: $scope.number,
                }
            });
        },
        processCreateRedCode: function (obj) {
            window.location.replace("/" + cr2('rp', obj.data.code));
        },
        gAI: function () {
            socketModule.sendDataCode({
                operation: "getAccountInfo",
                account_id: "",
                data: {
                    token: globalData.tk
                }
            });
        },
        pGAI: function (obj) {
            var data = obj.data;
            var info = {
                "account_id": data.account_id,
                "nickname": data.nickname,
                "headimgurl": data.headimgurl,
                "card": data.ticket_count,
                "individuality": data.individuality,
                "user_id": data.user_id,
            };
            $scope.cardNum = data.ticket_count;
            userData = info;
            $scope.$apply();
            setC('userData', JSON.stringify(info));
        },
        gAC: function () {
            socketModule.sendDataCode({
                operation: "getAccountCard",
                account_id: "",
                data: {
                    timestamp: Date.parse(new Date()) / 1000,
                    token: globalData.tk
                }
            });
        },
        pGAC: function (obj) {
            $scope.cardNum = obj.data;
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
        $scope.socket_url = globalData.club;
        ws = new WebSocket(globalData.club);
        ws.onopen = function () {
            $scope.connectOrNot = true;
            $scope.tiao = setInterval(function () {
                shb('@');
            }, 5000);
            console.log("socketOpen");
            /*
            var userDataCookie = getC('userData');
            if (userDataCookie) {
                var obj = JSON.parse(userDataCookie);
                var info = {
                    "account_id": obj.account_id,
                    "nickname": obj.nickname,
                    "headimgurl": obj.headimgurl,
                    "card": obj.card,
                    "individuality": obj.individuality,
                    "user_id": obj.user_id,
                };
                userData = info;
                socketModule.gAC();
            } else {
                socketModule.gAI();
            }
             */
        };
        ws.onmessage = function (evt) {
            mc(evt);
        };

        ws.onclose = function (evt) {
            console.log("ws closed");
            clearInterval($scope.tiao);
            setTimeout(function () {
                $scope.showResultFunc('服务器连接失败');
                $scope.connectApi($scope.socket_url);
            }, 2500)
        };
        ws.onerror = function (evt) {
            $scope.showResultFunc('服务器连接失败');
            console.log("WebSocketError!");
        };
    }

    $scope.connectApi();

    function reconnectSocket() {
        $scope.connectApi();
    };
})