var myscope;
var newNum = "";
var per = window.innerWidth / 530;
var ws;
var appData = {
    socketStatus: 0
}
var gameSocket = {
    wsApi: globalData.ws_host + "/api/" + globalData.dkey,
    wsBBullx: globalData.ws_host + "/nn/" + globalData.dkey,
    wsBullx: globalData.ws_host + "/dn/" + globalData.dkey,
    wsFlower: globalData.ws_host + "/zjh/" + globalData.dkey,
    wsSangong: globalData.ws_host + "/sg/" + globalData.dkey,
    wsErba: globalData.ws_host + "/bk/" + globalData.dkey,
    wsLandlord: globalData.ws_host + "/ddz/" + globalData.dkey,
    wsGdmj: globalData.ws_host + "/mj/" + globalData.dkey,
    wsXiaxie: globalData.ws_host + "/xx/" + globalData.dkey,
    wsPaijiu: globalData.ws_host + "/pj/" + globalData.dkey,
    wsDxbull: globalData.ws_host + "/dxdn/" + globalData.dkey,
    wsDcx: globalData.ws_host + "/dcx/" + globalData.dkey,
    wsLaibull: globalData.ws_host + "/lzdn/" + globalData.dkey,
    wsS13: globalData.ws_host + "/sss/" + globalData.dkey,
    wsJia31: globalData.ws_host + "/jia/" + globalData.dkey,
    wsPaijiuD: globalData.ws_host + "/dpj/" + globalData.dkey,
    wsGdmajiang: globalData.ws_host + "/gdmj/" + globalData.dkey,
    wsXp: globalData.ws_host + "/fxp/" + globalData.dkey,
    wsZzbull: globalData.ws_host + "/zzbull/" + globalData.dkey,
    wslaibull: globalData.ws_host + "/lzdn/" + globalData.dkey,
    wsJxsg: globalData.ws_host + "/jxsg/" + globalData.dkey
}
var leftTop = function () {
    $('.main').css({'overflow': 'hidden', 'position': 'fixed', 'top': '0px'});
}

var audioModule = {
    audioOn: !1,
    audioContext: null,
    audioBuffers: [],
    baseUrl: "",
    initModule: function (e) {
        this.baseUrl = e,
            this.audioBuffers = [],
            window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext,
            this.audioContext = new window.AudioContext
    },
    stopSound: function (e) {
        var t = this.audioBuffers[e];
        t && t.source && (t.source.stop(0), t.source = null)
    },
    playSound: function (name, isLoop) {

        var buffer = this.audioBuffers[name];

        if (buffer) {
            try {
                if (WeixinJSBridge != undefined) {
                    WeixinJSBridge.invoke('getNetworkType', {}, function (e) {
                        buffer.source = null;
                        buffer.source = audioModule.audioContext.createBufferSource();
                        buffer.source.buffer = buffer.buffer;
                        buffer.source.loop = false;

                        var gainNode = audioModule.audioContext.createGain();

                        if (isLoop == true) {
                            buffer.source.loop = true;
                            gainNode.gain.value = 0.7;
                        } else {
                            gainNode.gain.value = 1.0;
                        }

                        buffer.source.connect(gainNode);
                        gainNode.connect(audioModule.audioContext.destination);
                        buffer.source.start(0);
                    });
                }

            } catch (err) {
                buffer.source = null;
                buffer.source = audioModule.audioContext.createBufferSource();
                buffer.source.buffer = buffer.buffer;
                buffer.source.loop = false;

                var gainNode = audioModule.audioContext.createGain();

                if (isLoop == true) {
                    buffer.source.loop = true;
                    gainNode.gain.value = 0.7;
                } else {
                    gainNode.gain.value = 1.0;
                }

                buffer.source.connect(gainNode);
                gainNode.connect(audioModule.audioContext.destination);
                buffer.source.start(0);
            }
        }
    },
    initSound: function (arrayBuffer, name) {
        this.audioContext.decodeAudioData(arrayBuffer, function (buffer) {
            audioModule.audioBuffers[name] = {"name": name, "buffer": buffer, "source": null};

            if (name == "backMusic") {
                audioModule.audioOn = true;
                audioModule.playSound(name, true);
            }
        }, function (e) {
            logMessage('Error decoding file', e);
        });
    },
    loadAudioFile: function (url, name) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = function (e) {
            audioModule.initSound(xhr.response, name);
        };

        xhr.send();
    },
    loadAllAudioFile: function () {

    }
};
audioModule.initModule(globalData.fileUrl);

var app = angular.module('app', []);

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
    myscope = $scope;

    $scope.bullSpendCard = bullSpendCard;
    $scope.flowerSpendCard = flowerSpendCard;
    $scope.flowerxpSpendCard = flowerxpSpendCard;
    $scope.sangongSpendCard = sangongSpendCard;
    $scope.dcxSpendCard = dcxSpendCard;
    $scope.dxbullSpendCard = dxbullSpendCard;
    $scope.paijiuSpendCard = paijiuSpendCard;
    $scope.paijiuDSpendCard = paijiuDSpendCard;
    $scope.erbaSpendCard = erbaSpendCard;
    $scope.landlordSpendCard = landlordSpendCard;
    $scope.majiangSpendCard = majiangSpendCard;
    $scope.hbmajiangSpendCard = hbmajiangSpendCard;
    $scope.xiaxieSpendCard = xiaxieSpendCard;
    $scope.j31SpendCard = j31SpendCard;
    $scope.jxsgSpendCard = jxsgSpendCard;
    $scope.s13sSpendCard = s13sSpendCard;
    $scope.laibullSpendCard = laibullSpendCard;

    $scope.maxCount = [6, 9, 12, 10, 13, 15, 17, 19, 21];
    $scope.globalData = globalData;
    $scope.width = window.innerWidth;
    $scope.userInfo = userData;
    $scope.notyMsg = '';

    $scope.fileUrl = globalData.fileUrl;

    $scope.clickVoice = function () {
        if (globalData.p_type == 2) {
            audioModule.loadAudioFile(globalData.fileUrl + 'files/audio/paijiu/dy_button.mp3', 'clickVoice');
            setTimeout(function () {
                audioModule.playSound('clickVoice');
            }, 100)
        }
    };

    $scope.showCustom = function () {
        $scope.appData.customLayer = true;
        $scope.appData.isShowCustom = true;
    }

    $scope.hideCustom = function () {
        $scope.appData.customLayer = false;
        $scope.appData.isShowCustom = false;
    },

        FastClick.attach(document.body);
    $scope.isShowKefu = false;
    $scope.showKeFu = function () {
        $scope.showFeature = false;
        $scope.isShowKefu = true;
    };
    $scope.hideKeFu = function () {
        $scope.isShowKefu = false;
    };
    $scope.gotopage = function () {
        // window.location.href = globalData.baseUrl + cr('pa', new Date().getTime());
        $scope.showFeature = true;
        $scope.showSendCards = 0;
        $scope.connectApi(gameSocket.wsApi);
    }
    $scope.closeFeature = function () {
        $scope.showFeature = false;
        $scope.isConnectApi = false;
        ws.close();
    };
    $scope.gotored = function () {
        window.location.href = globalData.baseUrl + cr('mp', new Date().getTime());
    }
    $scope.gotoRoom = function () {

        $scope.is_operation_room = true;
    }
    $scope.isShowEnterRoomNum = false;
    $scope.showEnterRoomNum = function () {
        $scope.isShowEnterRoomNum = true;

    }
    $scope.hideEnterRoomNum = function () {
        $scope.isShowEnterRoomNum = false;
    }
    $scope.roomNum = [];
    $scope.enterRoomNum = function (num) {
        if ($scope.roomNum.length == 15) {
            return;
        }
        $scope.roomNum.push(num)
    }
    $scope.resetRoomNum = function (num) {
        $scope.roomNum = [];
    }
    $scope.cacelNum = function () {
        if ($scope.roomNum.length == 0) {
            return
        }
        var len = $scope.roomNum.length;
        $scope.roomNum.splice(len - 1, 1);
    }


    function score_list() {
        var score_list = [];
        for (i = 1; i < 101; i++) {
            score_list.push(i);
        }
        //console.log(score_list)
        return score_list;
    }

    function score_list_desc() {
        var score_list_desc = [];
        for (i = 100; i > 0; i--) {
            score_list_desc.push(i);
        }
        return score_list_desc;
    }

    $scope.score_list_desc = score_list_desc();

    $scope.zjh_score = score_list()[49];
    $scope.score_list = score_list();

    var socketStatus = 0;
    $(".main").show();
    $("#loading").hide();
    // clearInterval($scope.loadingTimer);
    $scope.activity = new Array();
    $scope.isShowAlert = false;
    $scope.alertType = 0;
    $scope.alertText = "";
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

    $scope.isAuthPhone = 0;
    $scope.phone = userData.phone;
    $scope.sPhone = '';
    $scope.sAuthcode = '';
    $scope.authcodeType = 1;
    $scope.authcodeText = '发送验证码';
    $scope.authcodeTime = 60;
    $scope.phoneType = 1;
    $scope.sMyCode = '绑定手机';

    setTimeout(function () {
        $scope.$apply();
    }, 100);
    $scope.blur = function () {
        setTimeout(function () {
            var scrollHeight = document.documentElement.scrollTop || document.body.scrollTop || 0;
            window.scrollTo(0, Math.max(scrollHeight - 1, 0));
        }, 100);
    }
    $scope.finishBindPhone = function () {
        window.location.href = window.location.href;
    };

    $scope.reloadView = function () {
        // window.location.href = window.location.href;
    };

    $scope.bindPhone = function (phone) {
        var isRepeat = repeat('bindPhone');
        if (isRepeat) {
            $scope.showResultFunc('请不要连续点击按钮!');
            return
        }
        var validPhone = checkPhone($scope.sPhone);
        var validAuthcode = checkAuthcode($scope.sAuthcode);

        if (validPhone == false) {
            setTimeout(function () {
                $scope.showResultFunc('手机号码有误，请重填');
            }, 0);

            return;
        }

        if (validAuthcode == false) {
            setTimeout(function () {
                $scope.showResultFunc('验证码有误，请重填');
            }, 0);

            return;
        }

        socketModule.checkSmsCode();
    };

    $scope.hideBindPhone = function () {
        $('#validePhone').css('display', 'none');
        $scope.authcodeType.isAuthPhone = 0;
    };
    $scope.bindRoomYh = function () {
        var isRepeat = repeat('bindRoom');
        if (isRepeat) {
            $scope.showResultFunc('请不要连续点击按钮!');
            return
        }
        if ($scope.sRoom == '') {
            $scope.showResultFunc('请输入房间号');
            return
        }
        $scope.connectApi(gameSocket.wsApi, 'getGtype');
    };
    $scope.bindRoom = function () {
        var isRepeat = repeat('bindRoom');
        if (isRepeat) {
            $scope.showResultFunc('请不要连续点击按钮!');
            return
        }
        $scope.sRoom = $scope.roomNum.join("");
        if ($scope.sRoom == '') {
            $scope.showResultFunc('请输入房间号');
            return
        }
        $scope.connectApi(gameSocket.wsApi, 'getGtype');
    };
    $scope.hideBindRoom = function () {
        $scope.is_operation_room = false;
        $(".main").css({"overflow": "visible", "height": "auto"});//20190117这句
    };

    $scope.phoneChange = function () {
        // console.log('号码', $scope.sRoom)
    };
    $scope.roomNumChange = function () {
        var result = checkPhone($scope.sPhone);
        if (result) {
            $('#authcode').css('background-color', 'rgb(64,112,251)');
        } else {
            $('#authcode').css('background-color', 'lightgray');
        }
    };

    function reconnectSocket() {
        $scope.connectApi(gameSocket.wsApi);
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

    function checkPassword(code) {
        if (code == '' || code == undefined) {
            return false;
        }

        if (code.length < 6 || code.length > 18) {
            return false;
        } else {
            return true;
        }
    }

    var authcodeTimer = function authcodeTimer() {
        if ($scope.authcodeTime <= 0) {
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
    //三公牌型默认倍数
    var scoreList = function () {
        var list = [];
        for (var i = 5; i < 16; i++) {
            list.push(i);
        }
        return list;
    }
    $scope.scoreList = scoreList();

    $scope.isShowNoty = false;

    $scope.showNotyMsg = function () {
        clearTimeout($scope.noticeTimer);
        if ($scope.notyMsg == '') {
            return
        }
        $scope.isShowNoty = true;
        $('#marquee').show();
        $scope.noticeTimer = setTimeout(function () {
            $('#marquee').marquee({
                duration: 10000,
                gap: 50,
                delayBeforeStart: 0,
                direction: 'left',
                duplicated: true
            });
        }, 50);
    };


    $scope.is_operation = false;
    $scope.waiting = function () {
        $scope.is_operation = true;
        setTimeout(function () {
            if ($scope.is_operation) {
                $scope.is_operation = false;
                $scope.showResultFunc('创建房间失败，请重新创建');
            }
        }, 15000)
    };
    dealMessageFunc = function (obj) {
        if (obj.result == 1) {
            $scope.is_operation = false;
            $scope.showAlert(1, obj.result_message);
            // $scope.isShowHallTip = true;
            // $scope.tipText = obj.result_message;
        } else if (obj.result != 0) {
            if (obj.operation == 'CreateRoom') {
                var miss = obj.result_message + ":" + obj.data.missing_parameter + ",请刷新重试!";
                $scope.is_operation = false;
                localStorage.clear();
                $scope.isShowHallTip = true;
                $scope.tipText = miss;
            } else if (obj.operation == 'updateClub') {
                $scope.showResultFunc('更新失败');
            } else if (obj.operation == 'overGame') {
                $scope.showResultFunc("强制结算失败");
            } else if (obj.operation == 'addClubAccount') {
                $scope.showResultFunc(obj.result_message);
            } else if (obj.operation == 'getGameData') {
                alert(obj.result_message);
                $scope.logout();
            } else if (obj.operation == 'getClubRoomList' || obj.operation == 'getSClubRoomList') {

            } else if (obj.operation == 'getGtype') {
                $scope.showResultFunc("房间不存在");
            } else if (obj.operation == 'getAccountCard') {
                ws.close();
            } else if (obj.operation == 'getClubMemberList') {
                $scope.showResultFunc(obj.result_message)
                setTimeout(function () {
                    $scope.showGroupMember();
                }, 1000)
            } else {
                $scope.showResultFunc(obj.result_message)
            }
        } else if (obj.result == 0) {
            if (obj.operation == 'CreateRoom') {
                var game_name = globalData.hallName + ': ' + $scope.max_count_title + obj.data.room_number + '房间';
                $scope.room_number = obj.data.room_number;
                if ($scope.createInfo.isShow == 41) {
                    obj.data.max_count = 9;
                }
                $scope.is_operation = false;
                $scope.joinGame($scope.createInfo.isShow, $scope.room_number, obj.data.max_count);
                if (globalData.p_type == 0 || globalData.p_type == 2) {
                    //$scope.joinGame($scope.createInfo.isShow, $scope.room_number, obj.data.max_count);
                } else {
                    $scope.max_count = obj.data.max_count;
                    $scope.showAlert(666, game_name);
                }
                // $scope.cancelCreate();
                ws.close();
            } else if (obj.operation == "getClubRoomList") {
                socketModule.processGetClubRoomList(obj);
            } else if (obj.operation == "getSClubRoomList") {
                socketModule.processGetSClubRoomList(obj);
            } else if (obj.operation == "openClub") {
                socketModule.processOpenClub(obj);
            } else if (obj.operation == "closeClub") {
                socketModule.processCloseClub(obj);
            } else if (obj.operation == "getClubList") {
                socketModule.processGetClubList(obj);
            } else if (obj.operation == "getClubMemberList") {
                socketModule.processGetClubMemberList(obj);
            } else if (obj.operation == "10301") {
                socketModule.processGSCML(obj);
            } else if (obj.operation == "getGtype") {
                socketModule.processGetGtype(obj);
            } else if (obj.operation == "delClubMember") {
                socketModule.processDelClubMember(obj);
            } else if (obj.operation == "cancelClubManage") {
                socketModule.processCancelClubManage(obj);
            } else if (obj.operation == "setClubManage") {
                socketModule.processSetClubManage(obj);
            } else if (obj.operation == "overGame") {
                socketModule.processOverGame(obj);
            } else if (obj.operation == "cancelAutoRoom") {
                socketModule.processCancelAutoRoom(obj);
            } else if (obj.operation == "quitClub") {
                socketModule.processQuitClub(obj);
            } else if (obj.operation == "searchAccount") {
                socketModule.processSearchAccount(obj);
            } else if (obj.operation == "searchFlag") {
                socketModule.pSF(obj);
            } else if (obj.operation == "seacrhClubMember") {
                socketModule.pSCM(obj);
            } else if (obj.operation == "sendCards") {
                socketModule.processSendCards(obj);
            } else if (obj.operation == "setPassword") {
                socketModule.processSetPassword(obj);
            } else if (obj.operation == "getMobileSms") {
                socketModule.processGetMobileSms(obj);
            } else if (obj.operation == "checkSmsCode") {
                socketModule.processCheckSmsCode(obj);
            } else if (obj.operation == "setIndividuality") {
                socketModule.processSetIndividuality(obj);
            } else if (obj.operation == "addClubMember") {
                socketModule.processAddClubMember(obj);
            } else if (obj.operation == "createChatRoom") {
                socketModule.processCreateChatRoom(obj);
            } else if (obj.operation == 'getToolsList') {
                socketModule.processGetToolsList(obj);
            } else if (obj.operation == 'getSkinList') {
                socketModule.processGetSkinList(obj);
            } else if (obj.operation == 'buyTools') {
                socketModule.processBuyTools(obj);
            } else if (obj.operation == 'buySkin') {
                socketModule.processBuySkin(obj);
            } else if (obj.operation == 'setSkin') {
                socketModule.processSetSkin(obj);
            } else if (obj.operation == 'updateClub') {
                socketModule.processUpdateClub(obj);
            } else if (obj.operation == 'rejectClubMember') {
                socketModule.processRejectClubMember(obj);
            } else if (obj.operation == 'agreeClubMember') {
                socketModule.processAgreeClubMember(obj);
            } else if (obj.operation == 'blackClubMember') {
                socketModule.processBlackClubMember(obj);
            } else if (obj.operation == 'remarkClubMember') {
                socketModule.processRemarkClubMember(obj);
            } else if (obj.operation == 'addClubAccount') {
                socketModule.processAddClubAccount(obj);
            } else if (obj.operation == 'getHallData') {
                socketModule.pGHD(obj);
            } else if (obj.operation == 'getAccountCard') {
                socketModule.pGAC(obj);
                ws.close();
            } else if (obj.operation == 'createMj') {
                socketModule.processCreateMj(obj);
                ws.close();
            } else if (obj.operation == 'createRoomBuyu') {
                socketModule.processCreateRoomBuyu(obj);
                ws.close();
            } else {
                logMessage(obj.operation);
            }

        } else if (obj.result == -201) {
            $scope.is_operation = false;
            $scope.isShowHallTip = true;
            $scope.tipText = obj.result_message
        } else {
            $scope.is_operation = false;
            $scope.isShowHallTip = true;
            $scope.tipText = obj.result_message
        }
    }
    $scope.socket_url = "";
    $scope.socket_type = "";
    $scope.connectSocket = function (socket, type) {
        $scope.socket_url = socket;
        $scope.socket_type = type;
        ws = new WebSocket(socket);

        ws.onopen = function () {
            $scope.is_operation = true;
            var tiao = setInterval(function () {
                socketStatus = socketStatus + 1;
                // ws.send("@");
                if (socketStatus > 3 || socketStatus > 3) {
                    // window.location.reload();
                }
            }, 4000);
            console.log("socketOpen");
            $scope.gameType = type;
            var sendData;

            if (type == 1) {
                if (globalData.p_type == 2) {
                    if ($scope.createInfo.bbullx.is_custom_score == 1) {
                        $scope.createInfo.bbullx.score_type = parseInt($scope.createInfo.bbullx.score_custom);
                    } else {
                        $scope.createInfo.bbullx.score_type = parseInt($scope.createInfo.bbullx.default_score);
                    }
                }
                sendData = {
                    "operation": "CreateRoom",
                    "data": {
                        //"data_key": Date.parse(new Date()) + randomString(5),
                        "ticket_type": parseInt($scope.createInfo.bbullx.ticket_type),
                        "score_type": parseInt($scope.createInfo.bbullx.score_type),
                        "bet_type": parseInt($scope.createInfo.bbullx.bet_type),
                        "rule_type": parseInt($scope.createInfo.bbullx.rule_type),
                        "is_cardfive": parseInt($scope.createInfo.bbullx.is_cardfive),
                        "is_cardbomb": parseInt($scope.createInfo.bbullx.is_cardbomb),
                        "is_cardtiny": parseInt($scope.createInfo.bbullx.is_cardtiny),
                        "is_cardfour": parseInt($scope.createInfo.bbullx.is_cardfour),
                        'is_cardtinyfour': parseInt($scope.createInfo.bbullx.is_cardtinyfour),
                        'is_cardnbomb': parseInt($scope.createInfo.bbullx.is_cardnbomb),
                        "is_flush": parseInt($scope.createInfo.bbullx.is_flush),
                        "is_calabash": parseInt($scope.createInfo.bbullx.is_calabash),
                        "is_straight": parseInt($scope.createInfo.bbullx.is_straight),
                        "is_sequence": parseInt($scope.createInfo.bbullx.is_sequence),
                        "banker_mode": parseInt($scope.createInfo.bbullx.banker_mode),
                        "banker_score_type": parseInt($scope.createInfo.bbullx.banker_score),
                        "ready_time": parseInt($scope.createInfo.bbullx.ready_time),
                        "grab_time": parseInt($scope.createInfo.bbullx.grab_time),
                        "bet_time": parseInt($scope.createInfo.bbullx.bet_time),
                        "show_time": parseInt($scope.createInfo.bbullx.show_time),
                        "laizi_num": parseInt($scope.createInfo.bbullx.laizi_num),
                        "max_count_type": $scope.createInfo.bbullx.max_count_type,
                        "is_laizi": parseInt($scope.createInfo.bbullx.laizi_num >= 1 ? 1 : 0),
                        "can_rub": parseInt($scope.createInfo.bbullx.can_rub),
                        "token": globalData.tk,
                        "func": "cn",
                        "p_type": parseInt(globalData.p_type),
                        "is_delete": parseInt($scope.createInfo.bbullx.is_delete),
                        "is_allow_club": 1,
                        "is_ban_guest": 0,
                        "is_double_kill": 0,
                    }
                };
                if (globalData.p_type == 2) {
                    sendData.is_allow_club = parseInt($scope.createInfo.bbullx.is_allow_club);
                    sendData.is_ban_guest = parseInt($scope.createInfo.bbullx.is_ban_guest);
                    sendData.is_double_kill = parseInt($scope.createInfo.bbullx.is_double_kill);
                }
                $scope.func = 'cn';
                $scope.max_count_title = $scope.maxCount[$scope.createInfo.bbullx.max_count_type - 1] + '人牛 牛';
            } else if (type == 2) {
                if (globalData.p_type == 2) {
                    if ($scope.createInfo.bbullx.is_custom_score == 1) {
                        $scope.createInfo.bbullx.score_type = $scope.createInfo.bbullx.score_custom;
                    } else {
                        $scope.createInfo.bbullx.score_type = $scope.createInfo.bbullx.default_score;
                    }
                }
                sendData = {
                    "operation": "CreateRoom",
                    "data": {
                        //"data_key": Date.parse(new Date()) + randomString(5),
                        "ticket_type": $scope.createInfo.bullx.ticket_type,
                        "score_type": $scope.createInfo.bullx.score_type,
                        "bet_type": $scope.createInfo.bullx.bet_type,
                        "rule_type": $scope.createInfo.bullx.rule_type,
                        "is_cardfive": $scope.createInfo.bullx.is_cardfive,
                        "is_cardbomb": $scope.createInfo.bullx.is_cardbomb,
                        "is_cardtiny": $scope.createInfo.bullx.is_cardtiny,
                        "is_cardfour": $scope.createInfo.bullx.is_cardfour,
                        "is_flush": $scope.createInfo.bullx.is_flush,
                        "is_calabash": $scope.createInfo.bullx.is_calabash,
                        "is_straight": $scope.createInfo.bullx.is_straight,
                        "is_sequence": $scope.createInfo.bullx.is_sequence,
                        "banker_mode": $scope.createInfo.bullx.banker_mode,
                        "banker_score_type": $scope.createInfo.bullx.banker_score,
                        "ready_time": $scope.createInfo.bullx.ready_time,
                        "grab_time": $scope.createInfo.bullx.grab_time,
                        "bet_time": $scope.createInfo.bullx.bet_time,
                        "show_time": $scope.createInfo.bullx.show_time,
                        "max_count_type": $scope.createInfo.bullx.max_count_type,
                        "is_laizi": 0,
                        "can_rub": $scope.createInfo.bullx.can_rub,
                        "auto": $scope.createInfo.bullx.auto,
                        "token": globalData.tk,
                        "func": "n",
                        "p_type": globalData.p_type,
                        "is_delete": $scope.createInfo.bullx.is_delete,
                        "is_allow_club": 1,
                    }
                };
                if (globalData.p_type == 2) {
                    sendData.is_allow_club = $scope.createInfo.bullx.is_allow_club;
                    sendData.is_ban_guest = $scope.createInfo.bullx.is_ban_guest;
                    sendData.is_double_kill = $scope.createInfo.bullx.is_double_kill;
                }
                $scope.func = 'n';
                $scope.max_count_title = $scope.maxCount[$scope.createInfo.bullx.max_count_type - 1] + '人牛 牛';
            } else if (type == 3) {
                sendData = {
                    "operation": "CreateRoom",
                    "data": {
                        //"data_key": Date.parse(new Date()) + randomString(5),
                        'default_score': parseInt($scope.createInfo.flowerxp.default_score),
                        'chip_list': $scope.createInfo.flowerxp.chip_list.toString(),
                        'xp_chip': parseInt($scope.createInfo.flowerxp.xp_chip),
                        'disable_pk': parseInt($scope.createInfo.flowerxp.disable_pk),
                        'bet_circle': parseInt($scope.createInfo.flowerxp.bet_circle),
                        'look_cond': parseInt($scope.createInfo.flowerxp.look_cond),
                        'pk_cond': parseInt($scope.createInfo.flowerxp.pk_cond),
                        'xp_circle': parseInt($scope.createInfo.flowerxp.xp_circle),
                        'ticket_type': parseInt($scope.createInfo.flowerxp.ticket_type),
                        "auto": parseInt($scope.createInfo.flowerxp.auto),
                        "func": "xp",
                        "token": globalData.tk,
                        "p_type": globalData.p_type,
                        "is_delete": $scope.createInfo.flowerxp.is_delete
                    }
                }
            } else if (type == 4) {
                let chip_type = parseInt($scope.createInfo.flower.chip_type);
                let chip1, chip2, chip3, chip4;
                switch (chip_type) {
                    case 1:
                        chip1 = 4;
                        chip2 = 8;
                        chip3 = 16;
                        chip4 = 20;
                        break;
                    case 2:
                        chip1 = 4;
                        chip2 = 10;
                        chip3 = 20;
                        chip4 = 40;
                        break;
                    case 3:
                        chip1 = 10;
                        chip2 = 20;
                        chip3 = 40;
                        chip4 = 80;
                        break;
                }

                sendData = {
                    "operation": "CreateRoom",
                    "data": {
                        //"data_key": Date.parse(new Date()) + randomString(5),
                        "max_count_type": parseInt($scope.createInfo.flower.max_count_type),
                        'default_score': parseInt($scope.createInfo.flower.default_score),
                        //'chip_type': $scope.createInfo.flower.chip_type,
                        'chip_type': chip_type,
                        'chip1': chip1,
                        'chip2': chip2,
                        'chip3': chip3,
                        'chip4': chip4,
                        'bet_time': 10,
                        'disable_pk': parseInt($scope.createInfo.flower.disable_pk),
                        'disable_look': parseInt($scope.createInfo.flower.disable_look),
                        'upper_limit': parseInt($scope.createInfo.flower.upper_limit),
                        'pk_score': parseInt($scope.createInfo.flower.pk_score),
                        'look_score': parseInt($scope.createInfo.flower.look_score),
                        'ticket_type': parseInt($scope.createInfo.flower.ticket_type),
                        'pk_round': parseInt($scope.createInfo.flower.pk_round),
                        "joy_card_ths": parseInt($scope.createInfo.flower.joy_card_ths),
                        "joy_card_bz": parseInt($scope.createInfo.flower.joy_card_bz),
                        'is_qp_tp': parseInt($scope.createInfo.flower.is_qp_tp_cur ? 1 : 0),
                        'has_235': parseInt($scope.createInfo.flower.has_235 ? 1 : 0),
                        'bet_round': parseInt($scope.createInfo.flower.bet_round),
                        'play_mode': parseInt($scope.createInfo.flower.play_mode),
                        'play_type': parseInt($scope.createInfo.flower.play_type),
                        "laizi_num": parseInt($scope.createInfo.flower.laizi_num),
                        "auto": globalData.p_type == 0 ? 0 : $scope.createInfo.flower.auto,
                        "func": "zh",
                        "token": globalData.tk,
                        "p_type": globalData.p_type,
                        "is_delete": parseInt($scope.createInfo.flower.is_delete),
                        "is_ban_guest": 0,
                        "is_allow_club": 1,
                    }
                }
                if (globalData.p_type == 2) {
                    sendData.chip_type = 0;
                    sendData.chip_list = $scope.createInfo.flower.chip_list.toString();
                    sendData.chip_type_arr = $scope.createInfo.flower.chip_type_arr.toString();
                    sendData.is_allow_club = $scope.createInfo.flower.is_allow_club;
                    sendData.is_ban_guest = $scope.createInfo.flower.is_ban_guest;
                }
                $scope.func = 'zh';
                $scope.max_count_title = $scope.maxCount[$scope.createInfo.flower.max_count_type - 1] + '人拼3';
            } else if (type == 5) {
                sendData = {
                    "operation": "CreateRoom",
                    "data": {
                        //"data_key": Date.parse(new Date()) + randomString(5),
                        "ticket_type": parseInt($scope.createInfo.sangong.ticket_type),
                        "score_type": parseInt($scope.createInfo.sangong.score_type),
                        "bet_type": parseInt($scope.createInfo.sangong.bet_type),
                        "max_count_type": parseInt($scope.createInfo.sangong.max_count_type),
                        "is_cardjoker": parseInt($scope.createInfo.sangong.is_cardjoker),
                        "cardthreesan": parseInt($scope.createInfo.sangong.cardthreesan_cur ? $scope.createInfo.sangong.cardthreesan : 1),
                        "cardthree": parseInt($scope.createInfo.sangong.cardthree_cur ? $scope.createInfo.sangong.cardthree : 1),
                        "cardbao9": parseInt($scope.createInfo.sangong.cardbao9_cur ? $scope.createInfo.sangong.cardbao9 : 1),
                        "banker_mode": parseInt($scope.createInfo.sangong.banker_mode),
                        "banker_score_type": parseInt($scope.createInfo.sangong.banker_score),
                        "rule_type": parseInt($scope.createInfo.sangong.rule_type),
                        "ready_time": parseInt($scope.createInfo.sangong.ready_time),
                        "grab_time": parseInt($scope.createInfo.sangong.grab_time),
                        "bet_time": parseInt($scope.createInfo.sangong.bet_time),
                        "show_time": parseInt($scope.createInfo.sangong.show_time),
                        "token": globalData.tk,
                        "auto": parseInt($scope.createInfo.sangong.auto),
                        "p_type": globalData.p_type,
                        "is_delete": $scope.createInfo.sangong.is_delete,
                        "is_ban_guest": parseInt($scope.createInfo.sangong.is_ban_guest),
                        "is_allow_club": 1,
                    }
                };
                if (globalData.p_type == 2) {
                    sendData.is_allow_club = $scope.createInfo.flower.is_allow_club;
                    sendData.is_ban_guest = $scope.createInfo.flower.is_ban_guest;
                }
                $scope.max_count_title = $scope.maxCount[$scope.createInfo.sangong.max_count_type - 1] + '人三公';
            } else if (type == 6) {
                sendData = {
                    "operation": "CreateRoom",
                    "data": {
                        //"data_key": Date.parse(new Date()) + randomString(5),
                        "banker_mode": parseInt($scope.createInfo.erbagang.banker_mode),
                        "chip_type": $scope.createInfo.erbagang.chip_type,
                        "banker_score_type": parseInt($scope.createInfo.erbagang.score_type),
                        "rule_type": parseInt($scope.createInfo.erbagang.rule_type),
                        "ticket_count": parseInt($scope.createInfo.erbagang.ticket_count),
                        "token": globalData.tk,
                        "p_type": globalData.p_type,
                        "is_delete": $scope.createInfo.erbagang.is_delete,
                        "is_allow_club": 1,
                    }
                }
                $scope.max_count_title = '二八杠';
            } else if (type == 7) {
                sendData = {
                    "operation": "CreateRoom",
                    "data": {
                        "data_key": Date.parse(new Date()) + randomString(5),
                        "ticket_count": parseInt($scope.createInfo.landlord.ticket_count),
                        "base_score": parseInt($scope.createInfo.landlord.base_score),
                        "ask_mode": $scope.createInfo.landlord.ask_mode,
                        "token": globalData.tk,
                        "p_type": globalData.p_type,
                        "is_delete": $scope.createInfo.landlord.is_delete,
                        "is_allow_club": 1,
                    }
                };
                $scope.max_count_title = '斗地主';
            } else if (type == 8 || type == 20) {
                sendData = {
                    "operation": "CreateRoom",
                    "data": {
                        "data_key": Date.parse(new Date()) + randomString(5),
                        "joker": parseInt($scope.createInfo.majiang.joker),
                        "horse_count": parseInt($scope.createInfo.majiang.horse_count),
                        "qianggang": parseInt($scope.createInfo.majiang.qianggang),
                        "chengbao": parseInt($scope.createInfo.majiang.chengbao),
                        "ticket_count": parseInt($scope.createInfo.majiang.ticket_count),
                        "token": globalData.tk,
                        "p_type": globalData.p_type,
                        "is_delete": $scope.createInfo.majiang.is_delete,
                    }
                }
                $scope.max_count_title = '麻将';
            } else if (type == 9) {
                sendData = {
                    "operation": "CreateRoom",
                    "data": {
                        "data_key": Date.parse(new Date()) + randomString(5),
                        'chip_type': parseInt($scope.createInfo.xiaxie.chip_type),
                        'ticket_type': parseInt($scope.createInfo.xiaxie.ticket_type),
                        'rule_value1': parseInt($scope.createInfo.xiaxie.rule_value1),
                        'upper_limit': parseInt($scope.createInfo.xiaxie.upper_limit),
                        "token": globalData.tk,
                        "p_type": globalData.p_type,
                        "is_delete": $scope.createInfo.xiaxie.is_delete,
                    }
                }
                $scope.max_count_title = '鱼虾蟹';
            } else if (type == 10) {
                sendData = {
                    "operation": "CreateRoom",
                    "data": {
                        "data_key": Date.parse(new Date()) + randomString(5),
                        "max_count_type": 2,
                        "ticket_type": parseInt($scope.createInfo.paijiu.ticket_type),
                        "score_type": parseInt($scope.createInfo.paijiu.score_type),
                        "banker_mode": parseInt($scope.createInfo.paijiu.banker_mode),
                        "bet_type": parseInt($scope.createInfo.paijiu.bet_type),
                        "ready_time": parseInt($scope.createInfo.paijiu.ready_time),
                        "grab_time": parseInt($scope.createInfo.paijiu.grab_time),
                        "bet_time": parseInt($scope.createInfo.paijiu.bet_time),
                        "show_time": parseInt($scope.createInfo.paijiu.show_time),
                        "special_card": parseInt($scope.createInfo.paijiu.special_card),
                        "rule_type": parseInt($scope.createInfo.paijiu.rule_type),
                        "token": globalData.tk,
                        "p_type": globalData.p_type,
                        "auto": $scope.createInfo.paijiu.auto,
                        "is_delete": $scope.createInfo.paijiu.is_delete,
                        "is_allow_club": 1,
                        "is_ban_guest": parseInt($scope.createInfo.paijiu.is_ban_guest),
                        "is_double_kill": parseInt($scope.createInfo.paijiu.is_double_kill),
                    }
                }
                if (globalData.p_type == 2) {
                    sendData.is_allow_club = parseInt($scope.createInfo.paijiu.is_allow_club);
                    sendData.is_ban_guest = parseInt($scope.createInfo.paijiu.is_ban_guest);
                    sendData.is_double_kill = parseInt($scope.createInfo.paijiu.is_double_kill);
                    sendData.can_rub = parseInt($scope.createInfo.paijiu.can_rub);
                }
                $scope.max_count_title = '牌九';
            } else if (type == 12) {
                sendData = {
                    "operation": "CreateRoom",
                    "data": {
                        //"data_key": Date.parse(new Date()) + randomString(5),
                        "ticket_type": parseInt($scope.createInfo.dxbull.ticket_type),
                        "bet_type": parseInt($scope.createInfo.dxbull.bet_type),
                        "is_cardfive": parseInt($scope.createInfo.dxbull.is_cardfive),
                        "is_cardbomb": parseInt($scope.createInfo.dxbull.is_cardbomb),
                        "is_cardtiny": parseInt($scope.createInfo.dxbull.is_cardtiny),
                        "auto": parseInt($scope.createInfo.dxbull.auto),
                        "max_count_type": parseInt($scope.createInfo.dxbull.max_count_type),
                        "token": globalData.tk,
                        "p_type": globalData.p_type,
                        "ready_time": parseInt($scope.createInfo.dxbull.ready_time),
                        "grab_time": parseInt($scope.createInfo.dxbull.grab_time),
                        "bet_time": parseInt($scope.createInfo.dxbull.bet_time),
                        "show_time": parseInt($scope.createInfo.dxbull.show_time),
                        "is_delete": $scope.createInfo.dxbull.is_delete,
                        "is_allow_club": 1,
                    }
                }
                if (globalData.p_type == 2) {
                    sendData.odds_num = parseInt($scope.createInfo.dxbull.odds_num);
                    sendData.is_cardfour = parseInt($scope.createInfo.dxbull.is_cardfour);
                    sendData.is_cardtinyfour = parseInt($scope.createInfo.dxbull.is_cardtinyfour);
                    sendData.is_cardnbomb = parseInt($scope.createInfo.dxbull.is_cardnbomb);
                    sendData.is_flush = parseInt($scope.createInfo.dxbull.is_flush);
                    sendData.is_calabash = parseInt($scope.createInfo.dxbull.is_calabash);
                    sendData.is_straight = parseInt($scope.createInfo.dxbull.is_straight);
                    sendData.is_sequence = parseInt($scope.createInfo.dxbull.is_sequence);

                    sendData.is_allow_club = parseInt($scope.createInfo.dxbull.is_allow_club);
                    sendData.is_ban_guest = parseInt($scope.createInfo.dxbull.is_ban_guest);
                    sendData.laizi_num = parseInt($scope.createInfo.dxbull.laizi_num);
                    sendData.is_laizi = parseInt($scope.createInfo.dxbull.laizi_num >= 1 ? 1 : 0);
                    sendData.can_rub = $scope.createInfo.dxbull.can_rub;
                }
                $scope.max_count_title = '大吃小牛 牛';

            } else if (type == 13) {
                sendData = {
                    "operation": "CreateRoom",
                    "data": {
                        //"data_key": Date.parse(new Date()) + randomString(5),
                        "max_count_type": parseInt($scope.createInfo.dcx.max_count_type),
                        "ticket_type": parseInt($scope.createInfo.dcx.ticket_type),
                        "can_rub": parseInt($scope.createInfo.dcx.can_rub),
                        "bet_type": parseInt($scope.createInfo.dcx.bet_type),
                        "is_cardjoker": parseInt($scope.createInfo.dcx.is_cardjoker),
                        "is_cardbao9": parseInt($scope.createInfo.dcx.is_cardbao9),
                        "token": globalData.tk,
                        "ready_time": parseInt($scope.createInfo.dcx.ready_time),
                        "grab_time": parseInt($scope.createInfo.dcx.grab_time),
                        "bet_time": parseInt($scope.createInfo.dcx.bet_time),
                        "show_time": parseInt($scope.createInfo.dcx.show_time),
                        "is_laizi": parseInt($scope.createInfo.dcx.laizi_num >= 1 ? 1 : 0),
                        "laizi_num": parseInt($scope.createInfo.dcx.laizi_num),
                        "p_type": globalData.p_type,
                        "auto": parseInt($scope.createInfo.dcx.auto),
                        "is_delete": $scope.createInfo.dcx.is_delete,
                        "is_allow_club": 1,
                    }
                }
                if (globalData.p_type == 2) {
                    sendData.odds_num = $scope.createInfo.dcx.odds_num;
                    sendData.is_allow_club = $scope.createInfo.dcx.is_allow_club;
                    sendData.is_ban_guest = $scope.createInfo.dcx.is_ban_guest;
                    sendData.is_double_kill = $scope.createInfo.dcx.is_double_kill;
                }
                $scope.max_count_title = '大吃小';
            } else if (type == 14) {
                sendData = {
                    "operation": "CreateRoom",
                    "data": {
                        //"data_key": Date.parse(new Date()) + randomString(5),
                        "max_count_type": parseInt($scope.createInfo.laibull.max_count_type),
                        "ticket_type": parseInt($scope.createInfo.laibull.ticket_type),
                        "score_type": parseInt($scope.createInfo.laibull.score_type),
                        "bet_type": parseInt($scope.createInfo.laibull.bet_type),
                        "rule_type": parseInt($scope.createInfo.laibull.rule_type),
                        "is_cardfive": parseInt($scope.createInfo.laibull.is_cardfive),
                        "is_cardbomb": parseInt($scope.createInfo.laibull.is_cardbomb),
                        "is_cardtiny": parseInt($scope.createInfo.laibull.is_cardtiny),
                        "is_cardfour": parseInt($scope.createInfo.laibull.is_cardfour),
                        "is_flush": parseInt($scope.createInfo.laibull.is_flush),
                        "is_calabash": parseInt($scope.createInfo.laibull.is_calabash),
                        "is_straight": parseInt($scope.createInfo.laibull.is_straight),
                        "is_sequence": parseInt($scope.createInfo.laibull.is_sequence),
                        "banker_mode": parseInt($scope.createInfo.laibull.banker_mode),
                        "banker_score_type": parseInt($scope.createInfo.laibull.banker_score),
                        "ready_time": parseInt($scope.createInfo.laibull.ready_time),
                        "grab_time": parseInt($scope.createInfo.laibull.grab_time),
                        "bet_time": parseInt($scope.createInfo.laibull.bet_time),
                        "show_time": parseInt($scope.createInfo.laibull.show_time),
                        "is_laizi": 1,
                        "token": globalData.tk,
                        "p_type": globalData.p_type,
                        "is_delete": $scope.createInfo.laibull.is_delete,
                        "is_allow_club": 1,
                    }
                }
                $scope.max_count_title = '赖子牛 牛';
            } else if (type == 17 || type == 37) {
                sendData = {
                    "operation": "CreateRoom",
                    "data": {
                        //"data_key": Date.parse(new Date()) + randomString(5),
                        "ticket_type": parseInt($scope.createInfo.jia31.ticket_type),
                        "score_type": parseInt($scope.createInfo.jia31.score_type),
                        "bet_type": parseInt($scope.createInfo.jia31.bet_type),
                        "max_count_type": parseInt($scope.createInfo.jia31.max_count_type),
                        "token": globalData.tk,
                        "auto": parseInt($scope.createInfo.jia31.auto),
                        "p_type": globalData.p_type,
                        "ready_time": parseInt($scope.createInfo.jia31.ready_time),
                        "grab_time": parseInt($scope.createInfo.jia31.grab_time),
                        "bet_time": parseInt($scope.createInfo.jia31.bet_time),
                        "show_time": parseInt($scope.createInfo.jia31.show_time),
                        "is_allow_club": 1,
                        "is_ban_guest": parseInt($scope.createInfo.jia31.is_ban_guest),
                        "is_delete": $scope.createInfo.jia31.is_delete,
                    }
                }
                if (globalData.p_type == 2) {
                    sendData.is_allow_club = $scope.createInfo.jia31.is_allow_club;
                    sendData.is_ban_guest = $scope.createInfo.jia31.is_ban_guest;
                }
                $scope.max_count_title = '超级三加一';
            } else if (type == 18 || type == 30) {
                if (globalData.p_type == 2) {
                    if ($scope.createInfo.paijiuD.is_custom_score == 1) {
                        $scope.createInfo.paijiuD.score_type = parseInt($scope.createInfo.paijiuD.score_custom);
                    } else {
                        $scope.createInfo.paijiuD.score_type = parseInt($scope.createInfo.paijiuD.default_score);
                    }
                }
                sendData = {
                    "operation": "CreateRoom",
                    "data": {
                        //"data_key": Date.parse(new Date()) + randomString(5),
                        "ticket_type": parseInt($scope.createInfo.paijiuD.ticket_type),
                        "max_count_type": parseInt($scope.createInfo.paijiuD.max_count_type),
                        "score_type": parseInt($scope.createInfo.paijiuD.score_type),
                        "banker_mode": 2,
                        "bet_type": parseInt($scope.createInfo.paijiuD.bet_type),
                        "special_card": parseInt($scope.createInfo.paijiuD.special_card),
                        "ready_time": parseInt($scope.createInfo.paijiuD.ready_time),
                        "grab_time": parseInt($scope.createInfo.paijiuD.grab_time),
                        "bet_time": parseInt($scope.createInfo.paijiuD.bet_time),
                        "show_time": parseInt($scope.createInfo.paijiuD.show_time),
                        "token": globalData.tk,
                        "auto": $scope.createInfo.paijiuD.auto,
                        "p_type": parseInt(globalData.p_type),
                        "is_delete": $scope.createInfo.paijiuD.is_delete,
                        "is_allow_club": 1,
                        "is_ban_guest": parseInt($scope.createInfo.paijiuD.is_ban_guest),
                        "is_double_kill": parseInt($scope.createInfo.paijiuD.is_double_kill)
                    }
                }
                if (globalData.p_type == 2) {
                    sendData.is_allow_club = parseInt($scope.createInfo.paijiuD.is_allow_club);
                    sendData.is_ban_guest = parseInt($scope.createInfo.paijiuD.is_ban_guest);
                    sendData.is_double_kil = parseInt($scope.createInfo.paijiuD.is_double_kill);
                }
                $scope.max_count_title = '大牌九';
            } else if (type == 20) {
                sendData = {
                    "operation": "CreateRoom",
                    "data": {
                        //"data_key": Date.parse(new Date()) + randomString(5),
                        "joker": parseInt($scope.createInfo.majiang.joker),
                        "horse_count": parseInt($scope.createInfo.majiang.horse_count),
                        "qianggang": parseInt($scope.createInfo.majiang.qianggang),
                        "chengbao": parseInt($scope.createInfo.majiang.chengbao),
                        "ticket_count": parseInt($scope.createInfo.majiang.ticket_count),
                        "token": globalData.tk,
                        "p_type": globalData.p_type,
                        "is_delete": $scope.createInfo.majiang.is_delete,
                        "is_allow_club": 1,
                    }
                }
                $scope.max_count_title = '麻将';
            } else if (type == 41) {
                sendData = {
                    "operation": "CreateRoom",
                    "account_id": userData.account_id,
                    "session": userData.account_id,
                    "data": {
                        "data_key": Date.parse(new Date()) + randomString(5),
                        "ticket_type": $scope.createInfo.s13s.ticket_type,
                        "score_type": $scope.createInfo.s13s.score_type,
                        "ready_time": $scope.createInfo.s13s.ready_time,
                        "think_time": $scope.createInfo.s13s.think_time,
                        "banker_mode": 4,
                        "max_count_type": 2,
                        "token": globalData.tk,
                        "p_type": globalData.p_type,
                        "is_delete": $scope.createInfo.s13s.is_delete,
                    }
                }
                $scope.max_count_title = '十三水';
            } else if (type == 42) {
                sendData = {
                    "operation": "CreateRoom",
                    "data": {
                        //"data_key": Date.parse(new Date()) + randomString(5),
                        "ticket_type": parseInt($scope.createInfo.jxsg.ticket_type),
                        "score_type": parseInt($scope.createInfo.jxsg.score_type),
                        "bet_type": parseInt($scope.createInfo.jxsg.bet_type),
                        "max_count_type": 2,
                        "ready_time": parseInt($scope.createInfo.jxsg.ready_time),
                        "grab_time": parseInt($scope.createInfo.jxsg.grab_time),
                        "bet_time": parseInt($scope.createInfo.jxsg.bet_time),
                        "show_time": parseInt($scope.createInfo.jxsg.show_time),
                        "token": globalData.tk,
                        "auto": parseInt($scope.createInfo.jxsg.auto),
                        "p_type": globalData.p_type,
                        "is_delete": $scope.createInfo.jxsg.is_delete,
                        "is_allow_club": 1,
                    }
                }
                $scope.max_count_title = '吉祥三公';
            }

            ws.send(JSON.stringify(sendData));
            // if (type == 41) {
            //     ws.send(JSON.stringify(sendData));
            // } else  else {
            //     ws.send(JSON.stringify(sendData));
            // }
        };
        ws.onmessage = function (evt) {
            if ($scope.createInfo.isShow == 41) {
                if (evt.data == "@") {
                    socketStatus = 0;
                    return 0;
                }
                var obj = eval('(' + evt.data + ')');
                dealMessageFunc(obj);
            } else {
                var obj = eval('(' + evt.data + ')');
                dealMessageFunc(obj);
            }
            // if($scope.gameType==1||$scope.gameType==4||$scope.gameType==18){
            // if(true){
            //     $scope.bianshouzai(evt);
            // }else{
            //     if (evt.data == "@") {
            //         socketStatus = 0;
            //         return 0;
            //     }
            //     var obj = eval('(' + evt.data + ')');
            //     $scope.dealCreateRoom(obj);
            // }
        };
        ws.onclose = function (evt) {
            console.log("ws closed");
            if ($scope.is_operation) {
                setTimeout(function () {
                    $scope.connectSocket($scope.socket_url, $scope.socket_type);
                }, 2500)
            } else {
                return 0;
            }
        }
        ws.onerror = function (evt) {
            console.log("WebSocketError!");
        };
    }

    $scope.createInfo = {
        "isShow": 0,
        is_operation_room: false,
        sRoom: '',
        gamelist: '',
        sgame: '',
        "bbullx": localStorage.bbullx ? JSON.parse(localStorage.bbullx) : {
            "max_count_type": 4,   // 1六人房  2九人房 3十二人 4十人 5十三人
            "ticket_type": 1,
            "score_type": 1,
            "rule_type": 2,   //规则 1: 牛 牛x3牛九x2牛八x2      2: 牛 牛x4牛九x3牛八x2牛七x2
            "is_laizi": 0,      //是否有赖子
            "is_cardfive": 1, //牌型 五花牛(5倍)  1表示默认勾选
            "is_cardbomb": 1, //牌型 炸弹牛(6倍)
            "is_cardtiny": 1, //牌型 五小牛(8倍)
            "is_cardfour": 1,
            "is_cardtinyfour": 1,
            "is_cardnbomb": 1,
            "laizi_num": "0",
            "is_flush": 1,
            "is_calabash": 1,
            "is_straight": 1,
            "is_sequence": 1,
            "banker_mode": 2, //模式 2 明牌抢庄
            "banker_score": 4,
            "bet_type": 2,
            "banker1": "unselected",
            "banker2": "selected",
            "banker3": "unselected",
            "banker4": "unselected",
            "banker5": "unselected",
            "ready_time": '6',
            "grab_time": '6',
            "bet_time": '5',
            "show_time": '3',
            "can_rub": 1,
            "auto": 0,
            "is_allow_club": 1,
            "is_ban_guest": 0,
            "is_double_kill": 0,
            "is_custom_score": 0,
            "default_score": 0,
            "score_custom": 100,
            "show_max_count": true,
            "is_delete": 0,
        },
        "bullx": localStorage.bullx ? JSON.parse(localStorage.bullx) : {
            "max_count_type": 2,   // 1六人房  2九人房  3十二人  4十人
            "ticket_type": 1,
            "score_type": 1,
            "rule_type": 2,   //规则 1: 牛 牛x3牛九x2牛八x2      2: 牛 牛x4牛九x3牛八x2牛七x2
            "is_laizi": 0,      //是否有赖子
            "is_cardfive": 1, //牌型 五花牛(5倍)  1表示默认勾选
            "is_cardbomb": 1, //牌型 炸弹牛(6倍)
            "is_cardtiny": 1, //牌型 五小牛(8倍)
            "is_cardfour": 1,
            "is_flush": 1,
            "is_calabash": 1,
            "is_straight": 1,
            "is_sequence": 1,
            "banker_mode": 2, //模式 2 明牌抢庄
            "banker_score": 4,
            "bet_type": 2,
            "banker1": "unselected",
            "banker2": "selected",
            "banker3": "unselected",
            "banker4": "unselected",
            "banker5": "unselected",
            "ready_time": '6',
            "grab_time": '6',
            "bet_time": '7',
            "show_time": '3',
            "can_rub": 1,
            "auto": 0,
            "show_max_count": true,
            "is_delete": 0,
        },
        // 血战拼3
        "flowerxp": localStorage.flowerxp ? JSON.parse(localStorage.flowerxp) : {
            default_score: 4, //底筹
            laizi_num: "0",
            chip_type: 1,
            disable_pk: 0,
            bet_circle: 10,   //下注圈数
            look_cond: 0,     //必闷圈数
            pk_cond: 1,       //比牌条件
            xp_circle: 1,     //血拼圈数
            ticket_type: 1,
            chip_list: [4, 8, 16, 20], //筹码组
            base_xp_chip: 40,    //血拼筹码基准值
            xp_chip: 120,       //血拼筹码
            chip_total: [        //所有筹码项
                {isSelect: !0, num: 4},
                {isSelect: !0, num: 8},
                {isSelect: !0, num: 10},
                {isSelect: !1, num: 16},
                {isSelect: !0, num: 20},
                {isSelect: !1, num: 40},
                {isSelect: !1, num: 100},
                {isSelect: !1, num: 200}
            ],
            auto: 0,
            "is_delete": 0,
        },
        "flower": localStorage.flower ? JSON.parse(localStorage.flower) : {
            "max_count_type": 1,
            'chip_type': globalData.p_name == 'hh' || globalData.p_name == 'yy' || globalData.p_name == 'gs' ? 5 : 1,
            'default_score': 2,
            'disable_look': 0,
            'disable_pk': 0,
            'upper_limit': 1000,
            'pk_score': 0,
            'look_score': 0,
            'ticket_type': 1,
            'pk_round': 1,
            'swop_score': 40,
            "joy_card_ths": '0',
            "joy_card_bz": '0',
            'is_qp_tp': '1',
            'is_qp_tp_cur': true,
            'has_235': 0,
            'bet_round': 0,
            "play_mode": 1,
            "play_type": 1,
            "laizi_num": "2",
            "showLaizi": 0,
            "banker_mode": 1,
            "ready_time": '6',
            "bet_time": '10',
            "auto": 0,
            "isShowLaizi": 1,
            "isShowLimit": true,
            "isShowBetRound": true,
            "show_max_count": true,
            "is_delete": 0,
        },
        "sangong": localStorage.sangong ? JSON.parse(localStorage.sangong) : {
            "ticket_type": 1,
            "score_type": 1,
            "rule_type": 1,
            "bet_type": 1,
            "max_count_type": 1,   // 1六人房  2九人房
            "is_cardjoker": 1, //天公x10,雷公x7,地公x5  1表示默认勾选
            "cardbao9": scoreList()[4],  //暴玖x9				 1表示默认勾选
            "cardthreesan": scoreList()[4], //大三公x9
            "cardthree": scoreList()[2], //小三公x7
            "banker_mode": 4, //模式 2 明牌抢庄 4经典
            "banker_score": 4,
            "banker1": "unselected",
            "banker2": "unselected",
            "banker4": "selected",
            "cardthreesan_cur": false,
            "cardthree_cur": false,
            "cardbao9_cur": false,
            "not_cur": '',
            "ready_time": '6',
            "grab_time": '6',
            "bet_time": '5',
            "show_time": '6',
            "auto": 0,
            "is_allow_club": 1,
            "is_ban_guest": 0,
            "show_max_count": false,
            "is_delete": 0,
        },
        "paijiu": localStorage.paijiu ? JSON.parse(localStorage.paijiu) : {
            "max_count_type": 2,
            "ticket_type": 1,
            "score_type": 1,
            "banker_mode": 2, //模式 2 明牌抢庄
            "banker1": "unselected",
            "banker2": "selected",
            "bet_type": 1,
            "special_card": 1,
            "rule_type": 2,
            "ready_time": '6',
            "grab_time": '6',
            "bet_time": '5',
            "show_time": '6',
            "auto": 0,
            "is_allow_club": 1,
            "is_ban_guest": 0,
            "is_double_kill": 0,
            "can_rub": 0,
            "is_custom_score": 0,
            "default_score": 0,
            "score_custom": 100,
            "is_delete": 0,
        },
        "erbagang": localStorage.erbagang ? JSON.parse(localStorage.erbagang) : {
            "banker_mode": 1,  //模式 1 自由抢庄
            "score_type": 1,   //上庄分数类型
            "chip_type": 1,   //筹码组选项
            "rule_type": 2,    //规则
            "ticket_count": 1,
            "banker1": "selected",
            "banker2": "unselected",
            "is_delete": 0,
        },
        "landlord": localStorage.landlord ? JSON.parse(localStorage.landlord) : {
            "ticket_count": 1,
            "base_score": 1,
            "ask_mode": 1,
            "is_delete": 0,
        },
        "majiang": localStorage.majiang ? JSON.parse(localStorage.majiang) : {
            "joker": 0,
            "horse_count": 0,
            "qianggang": 0,
            "ticket_count": 1,
            "chengbao": 0,
            "is_delete": 0,
        },
        //HB麻将
        "hbmajiang": localStorage.hbmajiang ? JSON.parse(localStorage.hbmajiang) : {
            "score_type": 1,
            "joker": 0,
            "horse_count": 0,
            "qianggang": 0,
            "ticket_count": 1,
            "chengbao": 0,
            "auto": 0,
            "is_pph": 0,
            "is_qys": 0,
            "is_qxd": 0,
            "is_wgjb": 0,
            "is_gbjb": 0,
            "is_qgjb": 0,
            "is_ssy": 0,
            "ssy_bet_type": 1,
            "is_delete": 0,
        },
        "xiaxie": localStorage.xiaxie ? JSON.parse(localStorage.xiaxie) : {
            'chip_type': 1,
            'ticket_type': 1,
            'rule_value1': 1,
            'upper_limit': 100,
            "is_delete": 0,
        },
        //大吃小牛 牛 默认建房选项
        "dxbull": localStorage.dxbull ? JSON.parse(localStorage.dxbull) : {
            "ticket_type": 1,
            "bet_type": 1,
            "max_count_type": 2,
            "odds_num": 2,   //规则 1: 牛 牛x3牛九x2牛八x2      2: 牛 牛x4牛九x3牛八x2牛七x2
            "is_laizi": 0,      //是否有赖子
            "is_cardfive": 1, //牌型 五花牛(5倍)  1表示默认勾选
            "is_cardbomb": 1, //牌型 炸弹牛(6倍)
            "is_cardtiny": 1, //牌型 五小牛(8倍)
            "is_cardfour": 1,
            "is_cardtinyfour": 1,
            "is_cardnbomb": 1,
            "laizi_num": "0",
            "is_flush": 1,
            "is_calabash": 1,
            "is_straight": 1,
            "is_sequence": 1,
            "ready_time": '6',
            "grab_time": '6',
            "bet_time": '7',
            "show_time": '6',
            "can_rub": 1,
            "auto": 0,
            "is_allow_club": 1,
            "is_ban_guest": 0,
            "is_delete": 0,
        },
        //大吃小 默认建房选项
        "dcx": localStorage.dcx ? JSON.parse(localStorage.dcx) : {
            "max_count_type": 1,   // 1九人房  2十二人房
            "ticket_type": 1,
            "bet_type": 1,
            "odds_num": 2,
            "is_cardjoker": 0, //天公x10,雷公x7,地公x5  1表示默认勾选
            "is_cardbao9": 0,  //暴玖x9                 1表示默认勾选
            "is_allow_club": 1,
            "laizi_num": '0',
            "is_ban_guest": 0,
            "auto": 0,
            "can_rub": 0,
            "ready_time": '6',
            "grab_time": '6',
            "bet_time": '7',
            "show_time": '6',
            "is_delete": 0,
        },
        //赖子牛 牛 默认建房选项
        "laibull": localStorage.laibull ? JSON.parse(localStorage.laibull) : {
            "max_count_type": 2,   // 1六人房   2九人房  3十二人房
            "ticket_type": 1,
            "score_type": 1,
            "rule_type": 2,   //规则 1: 牛 牛x3牛九x2牛八x2      2: 牛 牛x4牛九x3牛八x2牛七x2
            "is_cardfive": 1, //牌型 五花牛(5倍)  1表示默认勾选
            "is_cardbomb": 1, //牌型 炸弹牛(6倍)
            "is_cardtiny": 1, //牌型 五小牛(8倍)
            "is_cardfour": 1,
            "is_flush": 1,
            "is_calabash": 1,
            "is_straight": 1,
            "is_sequence": 1,
            "banker_mode": 2, //模式 2 明牌抢庄
            "banker_score": 0,
            "bet_type": 2,
            "banker1": "unselected",
            "banker2": "selected",
            "ready_time": '10',
            "grab_time": '10',
            "bet_time": '10',
            "show_time": '10',
            "is_delete": 0,
        },
        //十三水 默认建房选项
        "s13s": localStorage.s13s ? JSON.parse(localStorage.s13s) : {
            "ticket_type": 1,
            "score_type": 1,
            "ready_time": '10',
            "think_time": '30',
            "is_delete": 0,
        },
        // 超级三加一
        "jia31": localStorage.jia31 ? JSON.parse(localStorage.jia31) : {
            "ticket_type": 1,
            "bet_type": 1,
            "score_type": 1,
            "ready_time": '6',
            "grab_time": '6',
            "bet_time": '7',
            "show_time": '6',
            "auto": 0,
            "is_allow_club": 1,
            "is_ban_guest": 0,
            "max_count_type": 2,
            "is_delete": 0,
        },
        //八人大牌九
        "paijiuD": localStorage.paijiuD ? JSON.parse(localStorage.paijiuD) : {
            "max_count_type": 1,
            "ticket_type": 1,
            "score_type": 1,
            "bet_type": 1,
            "ready_time": '6',
            "grab_time": '6',
            "bet_time": '5',
            "show_time": '8',
            "special_card": 1,
            "auto": 0,
            "is_allow_club": 1,
            "is_ban_guest": 0,
            "is_double_kill": 0,
            "is_custom_score": 0,
            "default_score": 0,
            "score_custom": 100,
            "is_delete": 0,
        },
        "jxsg": localStorage.jxsg ? JSON.parse(localStorage.jxsg) : {
            "ticket_type": 1,
            "bet_type": 1,
            "score_type": 1,
            "ready_time": '6',
            "grab_time": '6',
            "bet_time": '7',
            "show_time": '6',
            "auto": 0,
            "is_delete": 0,
        },
        "fish": localStorage.fish ? JSON.parse(localStorage.fish) : {
            "df": 1,
            "js": 1,
            "gameTime": 90,
            "is_delete": 0,
        },
    }
    $scope.chooseChip = function (e, t) {
        var flower = $scope.createInfo.flower;
        if ("chip_list" == e) {
            if (4 == flower.chip_list.length && !flower.chip_total[t].isSelect) {
                $scope.showResultFunc("已选4组筹码")
                return
            }
            flower.chip_total[t].isSelect = !flower.chip_total[t].isSelect;
            flower.chip_list = [];
            for (var a = 0; a < flower.chip_total.length; a++) {
                if (flower.chip_total[a].isSelect) {
                    flower.chip_list.push(flower.chip_total[a].num);
                }
            }
        }
    }
    $scope.changeRule = function (e, t) {
        var flowerxp = $scope.createInfo.flowerxp;
        if ("chip_list" == e) {
            if (4 == flowerxp.chip_list.length && !flowerxp.chip_total[t].isSelect) {
                return;
            }
            flowerxp.chip_total[t].isSelect = !flowerxp.chip_total[t].isSelect;
            flowerxp.chip_list = [];
            for (var a = 0; a < flowerxp.chip_total.length; a++) {
                if (flowerxp.chip_total[a].isSelect) {
                    flowerxp.chip_list.push(flowerxp.chip_total[a].num);
                }
            }
            //根据血拼筹码基准定血拼筹码
            if (flowerxp.chip_list.length >= 1) {
                flowerxp.base_xp_chip = flowerxp.chip_list[flowerxp.chip_list.length - 1];
                if (flowerxp.base_xp_chip < 40) {
                    flowerxp.base_xp_chip = 40;
                }
            } else {
                flowerxp.base_xp_chip = 40;
            }
            flowerxp.xp_chip = 3 * flowerxp.base_xp_chip;
        } else if ("xp_chip" == e) {
            flowerxp.xp_chip = t
        }
    }
    $scope.selectChange = function (type, num) {
        console.log(type, num);
        if ($scope.createInfo.isShow == 1) {
            if (type == 1) {
                $scope.createInfo.bbullx.default_score = num;
                $scope.createInfo.bbullx.score_type = num;
                $scope.createInfo.bbullx.is_custom_score = 0;
            } else if (type == 2) {
                $scope.createInfo.bbullx.rule_type = num;
            } else if (type == 3) {
                switch (num) {
                    case 1:
                        $scope.createInfo.bbullx.is_cardfour = ($scope.createInfo.bbullx.is_cardfour + 1) % 2;
                        break;
                    case 2:
                        $scope.createInfo.bbullx.is_cardfive = ($scope.createInfo.bbullx.is_cardfive + 1) % 2;
                        break;
                    case 3:
                        $scope.createInfo.bbullx.is_straight = ($scope.createInfo.bbullx.is_straight + 1) % 2;
                        break;
                    case 4:
                        $scope.createInfo.bbullx.is_flush = ($scope.createInfo.bbullx.is_flush + 1) % 2;
                        break;
                    case 5:
                        $scope.createInfo.bbullx.is_calabash = ($scope.createInfo.bbullx.is_calabash + 1) % 2;
                        break;
                    case 6:
                        $scope.createInfo.bbullx.is_cardbomb = ($scope.createInfo.bbullx.is_cardbomb + 1) % 2;
                        break;
                    case 7:
                        $scope.createInfo.bbullx.is_sequence = ($scope.createInfo.bbullx.is_sequence + 1) % 2;
                        break;
                    case 8:
                        $scope.createInfo.bbullx.is_cardtiny = ($scope.createInfo.bbullx.is_cardtiny + 1) % 2;
                        break;
                    case 9:
                        $scope.createInfo.bbullx.is_laizi = ($scope.createInfo.bbullx.is_laizi + 1) % 2;
                        break;
                    case 10:
                        $scope.createInfo.bbullx.is_cardtinyfour = ($scope.createInfo.bbullx.is_cardtinyfour + 1) % 2;
                        break;
                    case 11:
                        $scope.createInfo.bbullx.is_cardnbomb = ($scope.createInfo.bbullx.is_cardnbomb + 1) % 2;
                        break;
                }
            } else if (type == 4) {
                $scope.createInfo.bbullx.ticket_type = num;
            } else if (type == 5) {
                $scope.createInfo.bbullx.banker_score = num;
            } else if (type == 6) {
                $scope.createInfo.bbullx.bet_type = num;
            } else if (type == 7) {
                $scope.createInfo.bbullx.max_count_type = num;
                console.log("$scope.createInfo.bbullx.max_count_type:", $scope.createInfo.bbullx.max_count_type);
            } else if (type == 9) {
                if ($scope.createInfo.bbullx.can_rub == 0) {
                    $scope.createInfo.bbullx.can_rub = 1;
                } else {
                    $scope.createInfo.bbullx.can_rub = 0;
                }
            } else if (type == 10) {
                switch (num) {
                    case 1:
                        $scope.createInfo.bbullx.auto = ($scope.createInfo.bbullx.auto + 1) % 2;
                        break;
                    case 2:
                        $scope.createInfo.bbullx.is_allow_club = ($scope.createInfo.bbullx.is_allow_club + 1) % 2;
                        break;
                    case 3:
                        $scope.createInfo.bbullx.is_ban_guest = ($scope.createInfo.bbullx.is_ban_guest + 1) % 2;
                        break;
                    case 4:
                        $scope.createInfo.bbullx.is_double_kill = ($scope.createInfo.bbullx.is_double_kill + 1) % 2;
                        break;
                }
            } else if (type == 11) {
                $scope.createInfo.bbullx.default_score = 0;
                $scope.createInfo.bbullx.is_custom_score = 1;
            } else if (type == 13) {
                $scope.createInfo.bbullx.is_delete = ($scope.createInfo.bbullx.is_delete + 1) % 2;
            }
        } else if ($scope.createInfo.isShow == 2) {
            if (type == 1) {
                $scope.createInfo.bullx.score_type = num;
            } else if (type == 2) {
                $scope.createInfo.bullx.rule_type = num;
            } else if (type == 3) {
                switch (num) {
                    case 1:
                        $scope.createInfo.bullx.is_cardfour = ($scope.createInfo.bullx.is_cardfour + 1) % 2;
                        break;
                    case 2:
                        $scope.createInfo.bullx.is_cardfive = ($scope.createInfo.bullx.is_cardfive + 1) % 2;
                        break;
                    case 3:
                        $scope.createInfo.bullx.is_straight = ($scope.createInfo.bullx.is_straight + 1) % 2;
                        break;
                    case 4:
                        $scope.createInfo.bullx.is_flush = ($scope.createInfo.bullx.is_flush + 1) % 2;
                        break;
                    case 5:
                        $scope.createInfo.bullx.is_calabash = ($scope.createInfo.bullx.is_calabash + 1) % 2;
                        break;
                    case 6:
                        $scope.createInfo.bullx.is_cardbomb = ($scope.createInfo.bullx.is_cardbomb + 1) % 2;
                        break;
                    case 7:
                        $scope.createInfo.bullx.is_sequence = ($scope.createInfo.bullx.is_sequence + 1) % 2;
                        break;
                    case 8:
                        $scope.createInfo.bullx.is_cardtiny = ($scope.createInfo.bullx.is_cardtiny + 1) % 2;
                        break;
                    case 9:
                        $scope.createInfo.bullx.is_laizi = ($scope.createInfo.bullx.is_laizi + 1) % 2;
                        break;
                }
            } else if (type == 4) {
                $scope.createInfo.bullx.ticket_type = num;
            } else if (type == 5) {
                $scope.createInfo.bullx.banker_score = num;
            } else if (type == 6) {
                $scope.createInfo.bullx.bet_type = num;
            } else if (type == 7) {
                $scope.createInfo.bullx.max_count_type = num;
                $scope.createInfo.bullx.num = '';
                $scope.createInfo.bullx.can_rub = 1;
                if (num == 5) {
                    $scope.createInfo.bullx.max_count_type = 3;
                    $scope.createInfo.bullx.num = 3
                }
            } else if (type == 8) {
                $scope.createInfo.bullx.max_count_type = num;
                $scope.createInfo.bullx.num = '';
                $scope.createInfo.bullx.can_rub = 1;
                if (num == 5) {
                    $scope.createInfo.bullx.max_count_type = 5;
                    $scope.createInfo.bullx.num = 3;
                }
            } else if (type == 9) {
                if ($scope.createInfo.bullx.can_rub == 0) {
                    $scope.createInfo.bullx.can_rub = 1;
                } else {
                    $scope.createInfo.bullx.can_rub = 0;
                }
            } else if (type == 10) {
                $scope.createInfo.bullx.auto = ($scope.createInfo.bullx.auto + 1) % 2;
            } else if (type == 13) {
                $scope.createInfo.bullx.is_delete = ($scope.createInfo.bullx.is_delete + 1) % 2;
            }
        } else if ($scope.createInfo.isShow == 3) {
            if (type == 2) {
                $scope.createInfo.flowerxp.default_score = num;
            } else if (type == 3) {
                $scope.createInfo.flowerxp.chip_type = num;
            } else if (type == 4) {
                if (num == 2) {
                    $scope.createInfo.flowerxp.disable_pk = ($scope.createInfo.flowerxp.disable_pk + 1) % 2;
                }
            } else if (type == 5) {
                $scope.createInfo.flowerxp.bet_circle = num;
            } else if (type == 6) {
                $scope.createInfo.flowerxp.look_cond = num;
            } else if (type == 7) {
                $scope.createInfo.flowerxp.pk_cond = num;
            } else if (type == 8) {
                $scope.createInfo.flowerxp.xp_circle = num;
            } else if (type == 9) {
                $scope.createInfo.flowerxp.ticket_type = num;
            } else if (type == 10) {
                $scope.createInfo.flowerxp.auto = ($scope.createInfo.flowerxp.auto + 1) % 2;
            } else if (type == 13) {
                $scope.createInfo.flowerxp.is_delete = ($scope.createInfo.flowerxp.is_delete + 1) % 2;
            }
        } else if ($scope.createInfo.isShow == 4) {
            if (type == 1) {
                $scope.createInfo.flower.max_count_type = num;
            } else if (type == 2) {
                $scope.createInfo.flower.default_score = num;
            } else if (type == 3) {
                $scope.createInfo.flower.chip_type = num;
            } else if (type == 4) {
                if (num == 1) {
                    $scope.createInfo.flower.disable_look = ($scope.createInfo.flower.disable_look + 1) % 2;
                } else if (num == 2) {
                    $scope.createInfo.flower.disable_pk = ($scope.createInfo.flower.disable_pk + 1) % 2;
                } else if (num == 3) {
                    $scope.createInfo.flower.is_qp_tp_cur = !$scope.createInfo.flower.is_qp_tp_cur;
                } else if (num == 4) {
                    $scope.createInfo.flower.has_235 = (($scope.createInfo.flower.has_235) + 1) % 2;
                } else if (num == 5) {
                    $scope.createInfo.flower.play_mode = $scope.createInfo.flower.play_mode == 1 ? 2 : 1;
                }
            } else if (type == 5) {
                $scope.createInfo.flower.upper_limit = num;
            } else if (type == 6) {
                $scope.createInfo.flower.pk_score = num;
            } else if (type == 7) {
                $scope.createInfo.flower.look_score = num;
            } else if (type == 8) {
                $scope.createInfo.flower.ticket_type = num;
            } else if (type == 9) {
                $scope.createInfo.flower.pk_round = num;
            } else if (type == 10) {
                $scope.createInfo.flower.auto = ($scope.createInfo.flower.auto + 1) % 2;
            } else if (type == 11) {
                $scope.createInfo.flower.swop_score = num;
            } else if (type == 12) {
                $scope.createInfo.flower.bet_round = num;
            } else if (type == 13) {
                $scope.createInfo.flower.is_delete = ($scope.createInfo.flower.is_delete + 1) % 2;
            }
        } else if ($scope.createInfo.isShow == 5) {	//三公
            if (type == 1) {
                $scope.createInfo.sangong.score_type = num;
            } else if (type == 2) {
                $scope.createInfo.sangong.max_count_type = num;
            } else if (type == 3) {
                if (num == 1) {
                    $scope.createInfo.sangong.is_cardjoker = ($scope.createInfo.sangong.is_cardjoker + 1) % 2;
                } else if (num == 2) {

                }
                //$scope.createInfo.sangong.is_cardbao9=($scope.createInfo.sangong.is_cardbao9+1)%2;
            } else if (type == 4) {
                $scope.createInfo.sangong.ticket_type = num;
            } else if (type == 5) {
                $scope.createInfo.sangong.banker_score = num;
            } else if (type == 6) {
                $scope.createInfo.sangong.rule_type = num;
            } else if (type == 7) {
                if (num == 1) {
                    $scope.createInfo.sangong.cardthreesan_cur = !$scope.createInfo.sangong.cardthreesan_cur;
                    //if( $scope.createInfo.sangong.cardthreesan_cur){
                    $scope.createInfo.sangong.cardthreesan = scoreList()[4];
                    //}else{
                    // $scope.createInfo.sangong.cardthreesan= scoreList()[4];
                    // }
                }
                if (num == 2) {
                    $scope.createInfo.sangong.cardthree_cur = !$scope.createInfo.sangong.cardthree_cur;
                    // if( $scope.createInfo.sangong.cardthree_cur){
                    $scope.createInfo.sangong.cardthree = scoreList()[2];
                    // }else{
                    //$scope.createInfo.sangong.cardthree= '';
                    //}
                }
                if (num == 3) {
                    $scope.createInfo.sangong.cardbao9_cur = !$scope.createInfo.sangong.cardbao9_cur;
                    // if( $scope.createInfo.sangong.cardbao9_cur){
                    $scope.createInfo.sangong.cardbao9 = scoreList()[4];
                    // }else{
                    //  $scope.createInfo.sangong.cardbao9= '';
                    // }
                }
            } else if (type == 8) {
                $scope.createInfo.sangong.bet_type = num;
            } else if (type == 10) {
                switch (num) {
                    case 1:
                        $scope.createInfo.sangong.auto = ($scope.createInfo.sangong.auto + 1) % 2;
                        break;
                    case 2:
                        $scope.createInfo.sangong.is_allow_club = ($scope.createInfo.sangong.is_allow_club + 1) % 2;
                        break;
                    case 3:
                        $scope.createInfo.sangong.is_ban_guest = ($scope.createInfo.sangong.is_ban_guest + 1) % 2;
                        break;
                }
            } else if (type == 13) {
                $scope.createInfo.sangong.is_delete = ($scope.createInfo.sangong.is_delete + 1) % 2;
            }
        } else if ($scope.createInfo.isShow == 6) {
            if (type == 1) {
                $scope.createInfo.erbagang.score_type = num;
            } else if (type == 2) {
                $scope.createInfo.erbagang.chip_type = num;
            } else if (type == 3) {
                $scope.createInfo.erbagang.rule_type = num;
            } else if (type == 4) {
                $scope.createInfo.erbagang.ticket_count = num;
            } else if (type == 13) {
                $scope.createInfo.erbagang.is_delete = ($scope.createInfo.erbagang.is_delete + 1) % 2;
            }
        } else if ($scope.createInfo.isShow == 7) {
            if (type == 1) {
                $scope.createInfo.landlord.base_score = num;
            } else if (type == 2) {
                $scope.createInfo.landlord.ask_mode = num;
            } else if (type == 3) {
                $scope.createInfo.landlord.ticket_count = num;
            } else if (type == 13) {
                $scope.createInfo.landlord.is_delete = ($scope.createInfo.landlord.is_delete + 1) % 2;
            }
        } else if ($scope.createInfo.isShow == 8 || $scope.createInfo.isShow == 20) {
            if (type == 1) {
                $scope.createInfo.majiang.joker = num;
            } else if (type == 2) {
                $scope.createInfo.majiang.horse_count = num;
            } else if (type == 3) {
                $scope.createInfo.majiang.qianggang = ($scope.createInfo.majiang.qianggang + 1) % 2;
            } else if (type == 4) {
                $scope.createInfo.majiang.ticket_count = num;
            } else if (type == 5) {
                $scope.createInfo.majiang.chengbao = ($scope.createInfo.majiang.chengbao + 1) % 2;
            } else if (type == 13) {
                $scope.createInfo.majiang.is_delete = ($scope.createInfo.majiang.is_delete + 1) % 2;
            }
        } else if ($scope.createInfo.isShow == 9) {
            if (type == 1) {
                $scope.createInfo.xiaxie.chip_type = num;
            } else if (type == 2) {
                if (num == 1) {
                    $scope.createInfo.xiaxie.rule_value1 = ($scope.createInfo.xiaxie.rule_value1 + 1) % 2;
                }
            } else if (type == 3) {
                $scope.createInfo.xiaxie.ticket_type = num;
            } else if (type == 4) {
                $scope.createInfo.xiaxie.upper_limit = num;
            } else if (type == 13) {
                $scope.createInfo.xiaxie.is_delete = ($scope.createInfo.xiaxie.is_delete + 1) % 2;
            }
        } else if ($scope.createInfo.isShow == 10) {
            if (type == 1) {
                $scope.createInfo.paijiu.default_score = num;
                $scope.createInfo.paijiu.is_custom_score = 0;
                $scope.createInfo.paijiu.score_type = num;
            } else if (type == 3) {
                if ($scope.createInfo.paijiu.special_card == 0) {
                    $scope.createInfo.paijiu.special_card = 1;
                } else {
                    $scope.createInfo.paijiu.special_card = 0;
                }
            } else if (type == 4) {
                $scope.createInfo.paijiu.ticket_type = num;
            } else if (type == 5) {
                $scope.createInfo.paijiu.bet_type = num;
            } else if (type == 6) {
                $scope.createInfo.paijiu.max_count_type = num;
            } else if (type == 7) {
                $scope.createInfo.paijiu.rule_type = num;
            } else if (type == 8) {
                $scope.createInfo.paijiu.banker_mode = num;
            } else if (type == 10) {
                switch (num) {
                    case 1:
                        $scope.createInfo.paijiu.auto = ($scope.createInfo.paijiu.auto + 1) % 2;
                        break;
                    case 2:
                        $scope.createInfo.paijiu.is_allow_club = ($scope.createInfo.paijiu.is_allow_club + 1) % 2;
                        break;
                    case 3:
                        $scope.createInfo.paijiu.is_ban_guest = ($scope.createInfo.paijiu.is_ban_guest + 1) % 2;
                        break;
                    case 4:
                        $scope.createInfo.paijiu.is_double_kill = ($scope.createInfo.paijiu.is_double_kill + 1) % 2;
                        break;
                    case 5:
                        $scope.createInfo.paijiu.can_rub = ($scope.createInfo.paijiu.can_rub + 1) % 2;
                        break;
                }
            } else if (type == 11) {
                $scope.createInfo.paijiu.default_score = 0
                $scope.createInfo.paijiu.is_custom_score = 1
            } else if (type == 13) {
                $scope.createInfo.paijiu.is_delete = ($scope.createInfo.paijiu.is_delete + 1) % 2;
            }
        } else if ($scope.createInfo.isShow == 12) {
            if (type == 1) {
                $scope.createInfo.dxbull.bet_type = num;
            } else if (type == 2) {
                $scope.createInfo.dxbull.odds_num = num;
            } else if (type == 3) {
                switch (num) {
                    case 1:
                        $scope.createInfo.dxbull.is_cardfour = ($scope.createInfo.dxbull.is_cardfour + 1) % 2;
                        break;
                    case 2:
                        $scope.createInfo.dxbull.is_cardfive = ($scope.createInfo.dxbull.is_cardfive + 1) % 2;
                        break;
                    case 3:
                        $scope.createInfo.dxbull.is_straight = ($scope.createInfo.dxbull.is_straight + 1) % 2;
                        break;
                    case 4:
                        $scope.createInfo.dxbull.is_flush = ($scope.createInfo.dxbull.is_flush + 1) % 2;
                        break;
                    case 5:
                        $scope.createInfo.dxbull.is_calabash = ($scope.createInfo.dxbull.is_calabash + 1) % 2;
                        break;
                    case 6:
                        $scope.createInfo.dxbull.is_cardbomb = ($scope.createInfo.dxbull.is_cardbomb + 1) % 2;
                        break;
                    case 7:
                        $scope.createInfo.dxbull.is_sequence = ($scope.createInfo.dxbull.is_sequence + 1) % 2;
                        break;
                    case 8:
                        $scope.createInfo.dxbull.is_cardtiny = ($scope.createInfo.dxbull.is_cardtiny + 1) % 2;
                        break;
                    case 9:
                        $scope.createInfo.dxbull.is_laizi = ($scope.createInfo.dxbull.is_laizi + 1) % 2;
                        break;
                    case 10:
                        $scope.createInfo.dxbull.is_cardtinyfour = ($scope.createInfo.dxbull.is_cardtinyfour + 1) % 2;
                        break;
                    case 11:
                        $scope.createInfo.dxbull.is_cardnbomb = ($scope.createInfo.dxbull.is_cardnbomb + 1) % 2;
                        break;
                }
            } else if (type == 4) {
                $scope.createInfo.dxbull.ticket_type = num;
            } else if (type == 5) {
                $scope.createInfo.dxbull.bet_type = num;
            } else if (type == 7) {
                $scope.createInfo.dxbull.max_count_type = num;
            } else if (type == 9) {
                if ($scope.createInfo.dxbull.can_rub == 0) {
                    $scope.createInfo.dxbull.can_rub = 1;
                } else {
                    $scope.createInfo.dxbull.can_rub = 0;
                }
            } else if (type == 10) {
                switch (num) {
                    case 1:
                        $scope.createInfo.dxbull.auto = ($scope.createInfo.dxbull.auto + 1) % 2;
                        break;
                    case 2:
                        $scope.createInfo.dxbull.is_allow_club = ($scope.createInfo.dxbull.is_allow_club + 1) % 2;
                        break;
                    case 3:
                        $scope.createInfo.dxbull.is_ban_guest = ($scope.createInfo.dxbull.is_ban_guest + 1) % 2;
                        break;
                }
            } else if (type == 13) {
                $scope.createInfo.dxbull.is_delete = ($scope.createInfo.dxbull.is_delete + 1) % 2;
            }
        } else if ($scope.createInfo.isShow == 13) {
            if (type == 1) {
                $scope.createInfo.dcx.bet_type = num;
            } else if (type == 3) {
                if (num == 1)
                    $scope.createInfo.dcx.is_cardjoker = ($scope.createInfo.dcx.is_cardjoker + 1) % 2;
                else if (num == 2)
                    $scope.createInfo.dcx.is_cardbao9 = ($scope.createInfo.dcx.is_cardbao9 + 1) % 2;
            } else if (type == 4) {
                $scope.createInfo.dcx.ticket_type = num;
            } else if (type == 6) {
                $scope.createInfo.dcx.max_count_type = num;
            } else if (type == 13) {
                $scope.createInfo.dcx.is_delete = ($scope.createInfo.dcx.is_delete + 1) % 2;
            }
        } else if ($scope.createInfo.isShow == 14) {
            if (type == 1) {
                $scope.createInfo.laibull.score_type = num;
            } else if (type == 2) {
                $scope.createInfo.laibull.rule_type = num;
            } else if (type == 3) {
                switch (num) {
                    case 1:
                        $scope.createInfo.laibull.is_cardfour = ($scope.createInfo.laibull.is_cardfour + 1) % 2;
                        break;
                    case 2:
                        $scope.createInfo.laibull.is_cardfive = ($scope.createInfo.laibull.is_cardfive + 1) % 2;
                        break;
                    case 3:
                        $scope.createInfo.laibull.is_straight = ($scope.createInfo.laibull.is_straight + 1) % 2;
                        break;
                    case 4:
                        $scope.createInfo.laibull.is_flush = ($scope.createInfo.laibull.is_flush + 1) % 2;
                        break;
                    case 5:
                        $scope.createInfo.laibull.is_calabash = ($scope.createInfo.laibull.is_calabash + 1) % 2;
                        break;
                    case 6:
                        $scope.createInfo.laibull.is_cardbomb = ($scope.createInfo.laibull.is_cardbomb + 1) % 2;
                        break;
                    case 7:
                        $scope.createInfo.laibull.is_sequence = ($scope.createInfo.laibull.is_sequence + 1) % 2;
                        break;
                    case 8:
                        $scope.createInfo.laibull.is_cardtiny = ($scope.createInfo.laibull.is_cardtiny + 1) % 2;
                        break;
                }
            } else if (type == 4) {
                $scope.createInfo.laibull.ticket_type = num;
            } else if (type == 5) {
                $scope.createInfo.laibull.max_count_type = num;
            } else if (type == 6) {
                $scope.createInfo.laibull.bet_type = num;
            } else if (type == 13) {
                $scope.createInfo.laibull.is_delete = ($scope.createInfo.laibull.is_delete + 1) % 2;
            }
        } else if ($scope.createInfo.isShow == 17 || $scope.createInfo.isShow == 37) {
            if (type == 1) {
                $scope.createInfo.jia31.score_type = num;
            } else if (type == 2) {
                $scope.createInfo.jia31.bet_type = num;
            } else if (type == 3) {
                $scope.createInfo.jia31.ticket_type = num;
            } else if (type == 4) {
                $scope.createInfo.jia31.max_count_type = num;
            } else if (type == 10) {
                switch (num) {
                    case 1:
                        $scope.createInfo.jia31.auto = ($scope.createInfo.jia31.auto + 1) % 2;
                        break;
                    case 2:
                        $scope.createInfo.jia31.is_allow_club = ($scope.createInfo.jia31.is_allow_club + 1) % 2;
                        break;
                    case 3:
                        $scope.createInfo.jia31.is_ban_guest = ($scope.createInfo.jia31.is_ban_guest + 1) % 2;
                        break;
                }
            } else if (type == 13) {
                $scope.createInfo.jia31.is_delete = ($scope.createInfo.jia31.is_delete + 1) % 2;
            }

        } else if ($scope.createInfo.isShow == 18 || $scope.createInfo.isShow == 30) {
            if (type == 1) {
                $scope.createInfo.paijiuD.default_score = num;
                $scope.createInfo.paijiuD.is_custom_score = 0;
                $scope.createInfo.paijiuD.score_type = num;
            } else if (type == 2 || type == 6) {
                $scope.createInfo.paijiuD.score_type = num;
            } else if (type == 3) {
                $scope.createInfo.paijiuD.special_card = ($scope.createInfo.paijiuD.special_card + 1) % 2;
            } else if (type == 4 || type == 8) {
                $scope.createInfo.paijiuD.ticket_type = num;
            } else if (type == 5) {
                $scope.createInfo.paijiuD.bet_type = num;
            } else if (type == 6) {
                $scope.createInfo.paijiuD.max_count_type = num;
            } else if (type == 10) {
                switch (num) {
                    case 1:
                        $scope.createInfo.paijiuD.auto = ($scope.createInfo.paijiuD.auto + 1) % 2;
                        break;
                    case 2:
                        $scope.createInfo.paijiuD.is_allow_club = ($scope.createInfo.paijiuD.is_allow_club + 1) % 2;
                        break;
                    case 3:
                        $scope.createInfo.paijiuD.is_ban_guest = ($scope.createInfo.paijiuD.is_ban_guest + 1) % 2;
                        break;
                    case 4:
                        $scope.createInfo.paijiuD.is_double_kill = ($scope.createInfo.paijiuD.is_double_kill + 1) % 2;
                        break;
                }
            } else if (type == 11) {
                $scope.createInfo.paijiuD.default_score = 0;
                $scope.createInfo.paijiuD.is_custom_score = 1;
            } else if (type == 13) {
                $scope.createInfo.paijiuD.is_delete = ($scope.createInfo.paijiuD.is_delete + 1) % 2;
            }
        } else if ($scope.createInfo.isShow == 200) {
            if (type == 1) {
                $scope.createInfo.hbmajiang.joker = num;
                if (num = 0) {
                    $scope.createInfo.hbmajiang.is_wgjb = 1;
                }
            } else if (type == 2) {
                $scope.createInfo.hbmajiang.horse_count = num;
            } else if (type == 3) {
                $scope.createInfo.hbmajiang.qianggang = ($scope.createInfo.hbmajiang.qianggang + 1) % 2;
                if ($scope.createInfo.hbmajiang.qianggang == 0) {
                    $scope.createInfo.hbmajiang.is_qgjb = 0;
                }
            } else if (type == 4) {
                $scope.createInfo.hbmajiang.ticket_count = num;
            } else if (type == 5) {
                $scope.createInfo.hbmajiang.chengbao = ($scope.createInfo.hbmajiang.chengbao + 1) % 2;
            } else if (type == 6) {
                $scope.createInfo.hbmajiang.score_type = num;
            } else if (type == 7) {
                switch (num) {
                    case 1:
                        $scope.createInfo.hbmajiang.is_pph = ($scope.createInfo.hbmajiang.is_pph + 1) % 2;
                        break;
                    case 2:
                        $scope.createInfo.hbmajiang.is_qys = ($scope.createInfo.hbmajiang.is_qys + 1) % 2;
                        break;
                    case 3:
                        $scope.createInfo.hbmajiang.is_qxd = ($scope.createInfo.hbmajiang.is_qxd + 1) % 2;
                        break;
                    case 4:
                        $scope.createInfo.hbmajiang.is_wgjb = ($scope.createInfo.hbmajiang.is_wgjb + 1) % 2;
                        break;
                    case 5:
                        $scope.createInfo.hbmajiang.is_gbjb = ($scope.createInfo.hbmajiang.is_gbjb + 1) % 2;
                        break;
                    case 6:
                        $scope.createInfo.hbmajiang.is_qgjb = ($scope.createInfo.hbmajiang.is_qgjb + 1) % 2;
                        break;
                    case 7:
                        $scope.createInfo.hbmajiang.is_ssy = ($scope.createInfo.hbmajiang.is_ssy + 1) % 2;
                        if ($scope.createInfo.hbmajiang.is_ssy == 0) {
                            $scope.createInfo.hbmajiang.ssy_bet_type == 1;
                        }
                        break;
                }
            } else if (type == 8) {
                $scope.createInfo.hbmajiang.ssy_bet_type = $scope.createInfo.hbmajiang.ssy_bet_type = num;
            } else if (type == 10) {
                $scope.createInfo.hbmajiang.auto = ($scope.createInfo.hbmajiang.auto + 1) % 2;
            } else if (type == 13) {
                $scope.createInfo.hbmajiang.is_delete = ($scope.createInfo.hbmajiang.is_delete + 1) % 2;
            }
        } else if ($scope.createInfo.isShow == 41) {
            if (type == 1) {
                $scope.createInfo.s13s.score_type = num;
            } else if (type == 4) {
                $scope.createInfo.s13s.ticket_type = num;
            }
            // else if (type == 13) {
            //     $scope.createInfo.s13s.is_delete = ($scope.createInfo.s13s.is_delete + 1) % 2;
            // }
        } else if ($scope.createInfo.isShow == 42) {
            if (type == 1) {
                $scope.createInfo.jxsg.score_type = num;
            } else if (type == 2) {
                $scope.createInfo.jxsg.bet_type = num;
            } else if (type == 3) {
                $scope.createInfo.jxsg.ticket_type = num;
            } else if (type == 10) {
                $scope.createInfo.jxsg.auto = ($scope.createInfo.jxsg.auto + 1) % 2;
            } else if (type == 13) {
                $scope.createInfo.jxsg.is_delete = ($scope.createInfo.jxsg.is_delete + 1) % 2;
            }
        } else if ($scope.createInfo.isShow == 52) {
            if (type == 2) {
                $scope.createInfo.fish.df = num;
            } else if (type == 3) {
                $scope.createInfo.fish.js = num;
                $scope.createInfo.fish.gameTime = num * 90;
            } else if (type == 13) {
                $scope.createInfo.fish.is_delete = ($scope.createInfo.fish.is_delete + 1) % 2;
            }
        }
    };
    $scope.nextRecord = function () {
        var beforeIndex = parseInt($(' .showNumber i').text());
        if (beforeIndex < 5) {
            var afterIndex = beforeIndex + 1;
            $('.showNumber i').text(afterIndex);
            $('.showNumber').attr("data-pos", afterIndex);
            $scope.createInfo.bbullx.score_type = afterIndex;
        }
    }
    $scope.prevRecord = function () {
        var beforeIndex = parseInt($(' .showNumber i').text());
        if (beforeIndex > 1) {
            var afterIndex = beforeIndex - 1;
            $('.showNumber i').text(afterIndex);
            $('.showNumber').attr("data-pos", afterIndex);
            $scope.createInfo.bbullx.score_type = afterIndex;
        }
    }
    $scope.nextRecordFlower = function () {
        if ($scope.createInfo.flower.pk_score == 500) {
            return
        }
        beforeIndex = $scope.createInfo.flower.pk_score / 25;
        var afterIndex = beforeIndex + 1;
        $('.processColor').width(afterIndex * 5 + '%')
        $scope.createInfo.flower.pk_score += 25
    }
    $scope.prevRecordFlower = function () {
        if ($scope.createInfo.flower.pk_score == 0) {
            return
        }
        beforeIndex = $scope.createInfo.flower.pk_score / 25;
        var afterIndex = beforeIndex - 1;
        $('.processColor').width(afterIndex * 5 + '%')
        $scope.createInfo.flower.pk_score -= 25
    }
    $scope.nextRecordFlowerLook = function () {
        if ($scope.createInfo.flower.look_score == 500) {
            return
        }
        beforeIndex = $scope.createInfo.flower.look_score / 25;
        var afterIndex = beforeIndex + 1;
        $('.processColorLook').width(afterIndex * 5 + '%')
        $scope.createInfo.flower.look_score += 25
    }
    $scope.prevRecordFlowerLook = function () {
        if ($scope.createInfo.flower.look_score == 0) {
            return
        }
        beforeIndex = $scope.createInfo.flower.look_score / 25;
        var afterIndex = beforeIndex - 1;
        $('.processColorLook').width(afterIndex * 5 + '%')
        $scope.createInfo.flower.look_score -= 25
    }
    $scope.nextRecord2 = function () {
        var beforeIndex = parseInt($(' .showNumber2 i').text());
        if (beforeIndex < 500) {
            var afterIndex = beforeIndex + 50;
            $('.showNumber2 i').text(afterIndex);
            $('.showNumber2').attr("data-pos", afterIndex);
            $('.showNumber2').css({"width": afterIndex / 5 + '%'});
            $scope.createInfo.flower.pk_score = afterIndex;
        }
    }
    $scope.prevRecord2 = function () {
        var beforeIndex = parseInt($(' .showNumber2 i').text());
        if (beforeIndex > 1) {
            var afterIndex = beforeIndex - 50;
            $('.showNumber2 i').text(afterIndex);
            $('.showNumber2').attr("data-pos", afterIndex);
            $('.showNumber2').css({"width": afterIndex / 5 + '%'});
            $scope.createInfo.flower.pk_score = afterIndex;
        }
    }
    $scope.nextRecord3 = function () {
        var beforeIndex = parseInt($(' .showNumber3 i').text());
        if (beforeIndex < 500) {
            var afterIndex = beforeIndex + 50;
            $('.showNumber3 i').text(afterIndex);
            $('.showNumber3').attr("data-pos", afterIndex);
            $('.showNumber3').css({"width": afterIndex / 5 + '%'});
            $scope.createInfo.flower.look_score = afterIndex;
        }
    }
    $scope.prevRecord3 = function () {
        var beforeIndex = parseInt($(' .showNumber3 i').text());
        if (beforeIndex > 1) {
            var afterIndex = beforeIndex - 50;
            $('.showNumber3 i').text(afterIndex);
            $('.showNumber3').attr("data-pos", afterIndex);
            $('.showNumber3').css({"width": afterIndex / 5 + '%'});
            $scope.createInfo.flower.look_score = afterIndex;
        }
    }
    $scope.createBBullx = function (max_count) {
        leftTop();
        if (max_count) {
            $scope.createInfo.bbullx.max_count_type = max_count;
            $scope.createInfo.bbullx.show_max_count = false;
        } else {
            $scope.createInfo.bbullx.show_max_count = true;
        }
        $(".createRoom .mainPart").css('height', '');
        $(".createRoom .mainPart .blueBack").css('height', '');
        if (globalData.p_type == 0 || globalData.p_name == 'hy') {
            $(".createRoom .mainPart").addClass('yh');
        }
        $scope.createInfo.isShow = 1;
    };
    $scope.createBullx = function (max_count) {
        leftTop();
        if (max_count) {
            $scope.createInfo.bullx.max_count_type = max_count;
            $scope.createInfo.bullx.show_max_count = false;
        } else {
            $scope.createInfo.bullx.show_max_count = true;
        }
        $(".createRoom .mainPart").css('height', '');
        $(".createRoom .mainPart .blueBack").css('height', '');
        $scope.createInfo.isShow = 2;
    }
    //拼3合集
    $scope.createFlowerX = function () {
        $scope.createInfo.isShowContainer = 1;
    };
    $scope.cancelGameContainer = function () {
        $scope.createInfo.isShowContainer = 0;
    }
    //拼3
    $scope.createFlower = function (e, max_count) {
        if (e == 'super') {
            return
        } else if (e == 'mp') {
            return
        } else if (e == 'lz') {
            return
        } else if (e == 'hp') {
            return
        }
        leftTop();
        if (max_count) {
            $scope.createInfo.flower.max_count_type = max_count;
            $scope.createInfo.flower.show_max_count = false;
        } else {
            $scope.createInfo.flower.show_max_count = true;
        }
        $(".createRoom .mainPart").css('height', '');
        $(".createRoom .mainPart .blueBack").css('height', '');
        if (globalData.p_type == 0) {
            $(".createRoom .mainPart").addClass('yh');
        }
        $scope.createInfo.isShow = 4;
        $scope.createInfo.flower.play_mode = 1;
        $scope.createInfo.flower.isShowLimit = false;
        $scope.createInfo.flower.isShowSwopBet = false;
        $scope.createInfo.flower.upper_limit == 0;
        $scope.createInfo.flower.isShowBetRound = true;
        if (e == 'jd') {
            $scope.createInfo.flower.play_type = 1;
            $scope.createInfo.flower.isShowLaizi = 0;
            $scope.createInfo.flower.laizi_num = "0";
            $scope.createInfo.flower.isShowLimit = true;
            $scope.createInfo.flower.swop_score = 0;
            $scope.createInfo.flower.isShowBetRound = false;
            $scope.createInfo.flower.bet_round = 0;
        } else if (e == 'big') {
            $scope.createInfo.flower.play_type = 2;
            $scope.createInfo.flower.isShowLaizi = 0;
            $scope.createInfo.flower.laizi_num = "0";
            $scope.createInfo.flower.isShowLimit = true;
            $scope.createInfo.flower.swop_score = 0;
            $scope.createInfo.flower.is_big_flower = 1;
        }
        $('.showNumber2').css("width", "100%");
    };
    $scope.createSangong = function (max_count) {
        if (max_count) {
            $scope.createInfo.sangong.max_count_type = max_count;
            $scope.createInfo.sangong.show_max_count = false;
        } else {
            $scope.createInfo.sangong.show_max_count = true;
        }
        leftTop();
        $(".createRoom .mainPart").css('height', '');
        $(".createRoom .mainPart .blueBack").css('height', '');
        if (globalData.p_type == 0) {
            $(".createRoom .mainPart").addClass('yh');
        }
        $scope.createInfo.isShow = 5;
    };
    $scope.createFlowerxp = function () {
        leftTop();
        $(".createRoom .mainPart").css('height', '');
        $(".createRoom .mainPart .blueBack").css('height', '');
        if (globalData.p_type == 0) {
            $(".createRoom .mainPart").addClass('yh');
        }
        $scope.createInfo.isShow = 3;
    };
    $scope.createErba = function () {
        leftTop();
        $(".createRoom .mainPart").css('height', '');
        $(".createRoom .mainPart .blueBack").css('height', '');
        if (globalData.p_type == 0) {
            $(".createRoom .mainPart").addClass('yh');
        }
        $scope.createInfo.isShow = 6;
    };
    $scope.createLandlord = function () {
        leftTop();
        $(".createRoom .mainPart").css('height', '');
        $(".createRoom .mainPart .blueBack").css('height', '');
        if (globalData.p_type == 0) {
            $(".createRoom .mainPart").addClass('yh');
        }
        $scope.createInfo.isShow = 7;
    };
    $scope.createMajiang = function () {
        leftTop();
        $(".createRoom .mainPart").css('height', '');
        $(".createRoom .mainPart .blueBack").css('height', '');
        if (globalData.p_type == 0) {
            $(".createRoom .mainPart").addClass('yh');
        }
        $scope.createInfo.isShow = 20;
    };
    $scope.createHzMajiang = function () {
        leftTop();
        $(".createRoom .mainPart").css('height', '');
        $(".createRoom .mainPart .blueBack").css('height', '');
        if (globalData.p_type == 0) {
            $(".createRoom .mainPart").addClass('yh');
        }
        $scope.createInfo.isShow = 8;
    };
    $scope.createXiaxie = function () {
        leftTop();
        $(".createRoom .mainPart").css('height', '');
        $(".createRoom .mainPart .blueBack").css('height', '');
        if (globalData.p_type == 0) {
            $(".createRoom .mainPart").addClass('yh');
        }
        $scope.createInfo.isShow = 9;
    };
    $scope.createInfo.isShowPaijiuContainer = 0;
    $scope.createPaijiux = function () {
        $scope.createInfo.isShowPaijiuContainer = 1;
    }
    $scope.cancelGameContainer = function () {
        $scope.createInfo.isShowContainer = 0;
        $scope.createInfo.isShowPaijiuContainer = 0;
    }
    $scope.createPaijiu = function () {
        leftTop();
        $(".createRoom .mainPart").css('height', '');
        $(".createRoom .mainPart .blueBack").css('height', '');
        if (globalData.p_type == 0) {
            $(".createRoom .mainPart").addClass('yh');
        }
        $scope.createInfo.isShow = 10;
    };
    $scope.createDxBull = function () {
        leftTop();
        $(".createRoom .mainPart").css('height', '');
        $(".createRoom .mainPart .blueBack").css('height', '');
        if (globalData.p_type == 0) {
            $(".createRoom .mainPart").addClass('yh');
        }
        $scope.createInfo.isShow = 12;
    };
    $scope.createDcx = function () {
        leftTop();
        $(".createRoom .mainPart").css('height', '');
        $(".createRoom .mainPart .blueBack").css('height', '');
        if (globalData.p_type == 0) {
            $(".createRoom .mainPart").addClass('yh');
        }
        $scope.createInfo.isShow = 13;
    };
    $scope.createLaiBull = function () {
        leftTop();
        $(".createRoom .mainPart").css('height', '');
        $(".createRoom .mainPart .blueBack").css('height', '');
        if (globalData.p_type == 0) {
            $(".createRoom .mainPart").addClass('yh');
        }
        $scope.createInfo.isShow = 14;
    };
    $scope.createJia31 = function () {
        leftTop();
        $(".createRoom .mainPart").css('height', '');
        $(".createRoom .mainPart .blueBack").css('height', '');
        if (globalData.p_type == 0) {
            $(".createRoom .mainPart").addClass('yh');
        }
        $scope.createInfo.isShow = 37;
    };
    $scope.createPaijiuD = function () {
        leftTop();
        $(".createRoom .mainPart").css('height', '');
        $(".createRoom .mainPart .blueBack").css('height', '');
        if (globalData.p_type == 0) {
            $(".createRoom .mainPart").addClass('yh');
        }
        $scope.createInfo.isShow = 30;
    };
    $scope.createHbMajiang = function () {
        leftTop();
        $(".createRoom .mainPart").css('height', '');
        $(".createRoom .mainPart .blueBack").css('height', '');
        if (globalData.p_type == 0) {
            $(".createRoom .mainPart").addClass('yh');
        }
        $scope.createInfo.isShow = 20;
    };
    $scope.createS13s = function () {
        leftTop();
        $(".createRoom .mainPart").css('height', '');
        $(".createRoom .mainPart .blueBack").css('height', '');
        if (globalData.p_type == 0) {
            $(".createRoom .mainPart").addClass('yh');
        }
        $scope.createInfo.isShow = 41;
    };
    $scope.createJxsg = function () {
        leftTop();
        $(".createRoom .mainPart").css('height', '');
        $(".createRoom .mainPart .blueBack").css('height', '');
        if (globalData.p_type == 0) {
            $(".createRoom .mainPart").addClass('yh');
        }
        $scope.createInfo.isShow = 42;
    }
    $scope.createFish = function () {
        leftTop();
        $(".createRoom .mainPart").css('height', '');
        $(".createRoom .mainPart .blueBack").css('height', '');
        if (globalData.p_type == 0) {
            $(".createRoom .mainPart").addClass('yh');
        }
        $scope.createInfo.isShow = 52;
    }
    $scope.selectBankerModeBullx = function (type) {
        $scope.createInfo.bullx.banker1 = "unselected";
        $scope.createInfo.bullx.banker2 = "unselected";
        $scope.createInfo.bullx.banker3 = "unselected";
        $scope.createInfo.bullx.banker4 = "unselected";
        $scope.createInfo.bullx.banker5 = "unselected";
        $scope.createInfo.bullx['banker' + type] = "selected";
        $scope.createInfo.bullx.banker_mode = type;
    };
    $scope.selectBankerModeBBullx = function (type) {
        $scope.createInfo.bbullx.banker1 = "unselected";
        $scope.createInfo.bbullx.banker2 = "unselected";
        $scope.createInfo.bbullx.banker3 = "unselected";
        $scope.createInfo.bbullx.banker4 = "unselected";
        $scope.createInfo.bbullx.banker5 = "unselected";
        $scope.createInfo.bbullx['banker' + type] = "selected";
        $scope.createInfo.bbullx.banker_mode = type;
    };
    // $scope.selectBankerModeFlower = function (type) {
    //     $scope.createInfo.flower.banker1 = "unselected";
    //     $scope.createInfo.flower.banker2 = "unselected";
    //     $scope.createInfo.flower.banker3 = "unselected";
    //     $scope.createInfo.flower.banker4 = "unselected";
    //     $scope.createInfo.flower.banker5 = "unselected";
    //     $scope.createInfo.flower.banker6 = "unselected";
    //     $scope.createInfo.flower['banker'+type] = "selected";
    //     $scope.createInfo.flower.banker_mode = type;
    //     $scope.createInfo.flower.showLaizi = 0;
    //     $scope.createInfo.flower.play_mode=1;
    //     if(type==6){
    //         $scope.createInfo.flower.play_type=1;
    //         $scope.createInfo.flower.play_mode=2;
    //     }else if(type==7){
    //         $scope.createInfo.flower.play_type=1;
    //         $scope.createInfo.flower.showLaizi=1;
    //     }else {
    //         console.log("ftype",type);
    //         $scope.createInfo.flower.play_type = type;
    //     }
    // };
    $scope.selectBankerModeSangong = function (type) {
        $scope.createInfo.sangong.banker1 = "unselected";
        $scope.createInfo.sangong.banker2 = "unselected";
        $scope.createInfo.sangong.banker4 = "unselected";
        $scope.createInfo.sangong['banker' + type] = "selected";
        $scope.createInfo.sangong.banker_mode = type;
    };
    $scope.selectBankerModeErbagang = function (type) {
        if (type == 1) {
            $scope.createInfo.erbagang.banker1 = "selected";
            $scope.createInfo.erbagang.banker2 = "unselected";
        } else if (type == 2) {
            $scope.createInfo.erbagang.banker1 = "unselected";
            $scope.createInfo.erbagang.banker2 = "selected";
        }
        $scope.createInfo.erbagang.banker_mode = type;
    };

    $scope.selectBankerModePaijiu = function (type) {
        $scope.createInfo.paijiu.banker1 = "unselected";
        $scope.createInfo.paijiu.banker2 = "unselected";
        $scope.createInfo.paijiu['banker' + type] = "selected";
        $scope.createInfo.paijiu.banker_mode = type;
    };

    $scope.selectBankerModeLaibull = function (type) {
        $scope.createInfo.laibull.banker1 = "unselected";
        $scope.createInfo.laibull.banker2 = "unselected";
        $scope.createInfo.laibull['banker' + type] = "selected";
        $scope.createInfo.laibull.banker_mode = type;
    };

    $scope.hideBindPhone = function () {
        $scope.createInfo.laibull.banker1 = "unselected";
    }

    $scope.createCommit = function () {
        $scope.max_count_title = '';

        if ($scope.userInfo.card > 0) {
            if ($scope.is_operation) {
                return 0;
            }
            if ($scope.createInfo.isShow == 3 && 4 != $scope.createInfo.flowerxp.chip_list.length) {
                $scope.showResultFunc("请选择四组筹码");
                return
            }
            if (globalData.p_type == 2) {
                if ($scope.createInfo.isShow == 4 && $scope.createInfo.flower.chip_type_arr.length < 4) {
                    $scope.showResultFunc("请选择四组筹码");
                    return
                }
            }
            $scope.waiting();
            switch ($scope.createInfo.isShow) {
                case 1:
                    $scope.connectSocket(gameSocket.wsBBullx, $scope.createInfo.isShow);
                    localStorage.bbullx = JSON.stringify($scope.createInfo.bbullx);
                    break;
                case 2:
                    if ($scope.createInfo.bbullx.max_count_type == 5) {
                        $scope.connectSocket(gameSocket.wsBBullx, $scope.createInfo.isShow);
                        localStorage.bullx = JSON.stringify($scope.createInfo.bullx);
                    } else {
                        $scope.connectSocket(gameSocket.wsBullx, $scope.createInfo.isShow);
                        localStorage.bullx = JSON.stringify($scope.createInfo.bullx);
                    }
                    break;
                case 3:
                    $scope.connectSocket(gameSocket.wsXp, $scope.createInfo.isShow);
                    localStorage.flowerxp = JSON.stringify($scope.createInfo.flowerxp);
                    break;
                case 4:
                    $scope.connectSocket(gameSocket.wsFlower, $scope.createInfo.isShow);
                    localStorage.flower = JSON.stringify($scope.createInfo.flower);
                    break;
                case 5:
                    $scope.connectSocket(gameSocket.wsSangong, $scope.createInfo.isShow);
                    localStorage.sangong = JSON.stringify($scope.createInfo.sangong);
                    break;
                case 6:
                    $scope.connectSocket(gameSocket.wsErba, $scope.createInfo.isShow);
                    localStorage.erbagang = JSON.stringify($scope.createInfo.erbagang);
                    break;
                case 7:
                    $scope.connectSocket(gameSocket.wsLandlord, $scope.createInfo.isShow);
                    localStorage.landlord = JSON.stringify($scope.createInfo.landlord);
                    break;
                case 8:
                case 20:
                    console.log($scope.createInfo.isShow);
                    console.log($scope.createInfo.majiang);
                    $scope.connectSocket(gameSocket.wsGdmajiang, $scope.createInfo.isShow);
                    localStorage.majiang = JSON.stringify($scope.createInfo.majiang);
                    break;
                case 9:
                    $scope.connectSocket(gameSocket.wsXiaxie, $scope.createInfo.isShow);
                    localStorage.xiaxie = JSON.stringify($scope.createInfo.xiaxie);
                    break;
                case 10:
                    $scope.connectSocket(gameSocket.wsPaijiu, $scope.createInfo.isShow);
                    localStorage.paijiu = JSON.stringify($scope.createInfo.paijiu);
                    break;
                case 12:
                    $scope.connectSocket(gameSocket.wsDxbull, $scope.createInfo.isShow);
                    localStorage.dxbull = JSON.stringify($scope.createInfo.dxbull);
                    break;
                case 13:
                    $scope.connectSocket(gameSocket.wsDcx, $scope.createInfo.isShow);
                    localStorage.dcx = JSON.stringify($scope.createInfo.dcx);
                    break;
                case 14:
                    $scope.connectSocket(gameSocket.wsLaibull, $scope.createInfo.isShow);
                    localStorage.laibull = JSON.stringify($scope.createInfo.laibull);
                    break;
                case 17:
                case 37:
                    $scope.connectSocket(gameSocket.wsJia31, $scope.createInfo.isShow);
                    localStorage.jia31 = JSON.stringify($scope.createInfo.jia31);
                    break;
                case 18:
                case 30:
                    $scope.connectSocket(gameSocket.wsPaijiuD, $scope.createInfo.isShow);
                    localStorage.paijiuD = JSON.stringify($scope.createInfo.paijiuD);
                    break;
                case 20:
                    $scope.connectApi(gameSocket.wsApi, 'createMj');
                    break;
                case 41:
                    $scope.connectSocket(gameSocket.wsS13, $scope.createInfo.isShow);
                    localStorage.s13s = JSON.stringify($scope.createInfo.s13s);
                    break;
                case 42:
                    $scope.connectSocket(gameSocket.wsJxsg, $scope.createInfo.isShow);
                    localStorage.jxsg = JSON.stringify($scope.createInfo.jxsg);
                    break;
                case 43: //至尊牛
                    $scope.connectSocket(gameSocket.wsZzbull, $scope.createInfo.isShow);
                    localStorage.zzbull = JSON.stringify($scope.createInfo.zzbull);
                    break;
                case 52:
                    $scope.gameType = 52;
                    $scope.max_count_title = '捕鱼';
                    localStorage.fish = JSON.stringify($scope.createInfo.fish);
                    $scope.connectApi(gameSocket.wsApi, 'createRoomBuyu');
                    break;
            }
        } else {
            $scope.showAlert(1, "房卡不足");
        }
    }

    var width = window.innerWidth;
    var height = window.innerHeight;

    $scope.part = 2;
    $scope.cancelLog = true;
    $scope.isReconnect = true;
    $scope.connectOrNot = true;
    $scope.is_send_getGameData = true;
    $scope.club_list = '';
    $scope.my_club_info = '';
    $scope.blockBtn = false;
    $scope.isShowApply = false;
    $scope.new_club_name = '';
    $scope.giftList = [];
    $scope.bgH = null;
    $scope.bgW = null;
    $scope.giftInfo = {};
    $scope.spend_num = 0;
    $scope.isGiftInfo = false;
    $scope.skin_expire_type = 1;
    $scope.isGitListShow = false;
    $scope.is_open_chat = 0;
    $scope.showType = 0;
    $scope.loadingNum = 0;
    $scope.loadingTimer = '';
    $scope.loadingUrl = '';
    $scope.isShowLoading = true;
    $scope.isShowLoading2 = false;
    $scope.maxCount = [6, 9, 12, 10, 13, 15, 17];
    $scope.gameName = [
        {"game_type": "1", "game_name": "牛 牛"},
        {"game_type": "4", "game_name": "拼3"},
        {"game_type": "5", "game_name": "三公"},
        {"game_type": "6", "game_name": "二八杠"},
        {"game_type": "7", "game_name": "斗地主"},
        {"game_type": "8", "game_name": "广东麻将"},
        {"game_type": "9", "game_name": "鱼虾蟹"},
        {"game_type": "10", "game_name": "九人牌九"},
        {"game_type": "12", "game_name": "大吃小牛 牛"},
        {"game_type": "13", "game_name": "大吃小"},
        {"game_type": "17", "game_name": "超级三加一"},
        {"game_type": "18", "game_name": "大牌九"},
    ];
    $scope.connectOrNot = true;
    $scope.max_count_title = '';
    $scope.tzUrl = '';
    $scope.is_send_getGameData = true;
    $scope.is_can_send = false;
    $scope.isShowClubMember = false;
    $scope.isShowAlert = false;
    $scope.isShowMaxCount = false;
    $scope.func = '';
    $scope.auto = '';
    $scope.is_operation_room = false;
    $scope.is_connect = false;
    $scope.room_number = 0;
    $scope.max_count = 0;
    $scope.room_id = 0;
    $scope.gameType = 0;
    $scope.isShowSwitchGroup = false;
    $scope.isShowResult = false;
    $scope.showResultText = '';
    $scope.org_list = '';
    $scope.isReconnect = true;
    $scope.tables = [];
    $scope.club_info = {
        club_id: '',
        club_name: '',
        is_self: 0,
        level: ''
    };
    $scope.club_creator = '';
    $scope.club_list = '';
    $scope.isOpenClub = false;
    $scope.isClickCloseClub = false;
    $scope.is_self = false;
    $scope.op_club_id = 0;
    $scope.currentRoomPage = 1;
    $scope.isShowMoreRoom = false;
    $scope.room_list = [];
    $scope.member_list = [];
    $scope.opMemberId = 0;
    $scope.memberListTotalPage = 1;
    $scope.memberListPage = 0;
    $scope.isShowLoadMoreMember = true;
    $scope.height = window.innerHeight;
    $scope.user = userData;
    $scope.activity = [];
    $scope.isShowInvite = false;
    $scope.isShowShop = false;
    $scope.isShowMessage = false;
    $scope.showChangeGuideName = false;
    $scope.select = 1;
    $scope.ticket_count = 0;
    $scope.isShowShopLoading = false;
    $scope.gameItems = [];
    $scope.startDate = '';
    $scope.endDate = '';
    $scope.sPhone = '';
    $scope.isPhone = false;
    $scope.isShowBindPhone = false;
    $scope.isShowQuitConfirm = false;
    $scope.isShowDeleteGame = false;
    $scope.isShowJoinRoom = false;
    $scope.isShowAlert = false;
    $scope.alertText = false;
    $scope.quitTipText = '';
    $scope.joinTipText = '';
    $scope.isShowMyCode = false;
    $scope.isShowMyAccount = false;
    $scope.showSendCards = 0;
    $scope.isShowSendLink = false;
    $scope.isShowGetLink = false;
    $scope.isShowGetLinkConfirm = false;
    $scope.sendCardsResult = false;
    $scope.showFeature = false;
    $scope.sendText = '';
    $scope.showResult = 2;
    $scope.addUser = {
        isShow1: false,
        isShow2: false,
        text1: '',
        text2: '',
        name: '',
        code: '',
        card: null,
        accountCode: '',
        addUser: '',
    };
    $scope.addMember = {
        isShow: false,
        text1: '',
        text2: '',
        name: '',
        code: '',
        card: null,
        accountCode: '',
        avatar: '',
        remark: '',
        flag: '',
    };
    $scope.link_num = 0;
    $scope.link_url = '';
    $scope.isShowSearch = false;
    $scope.isShowDelete = false;
    $scope.isShowKickConfirm = false;
    $scope.isShowSetting = false;
    $scope.nowItem = false;
    $scope.nowName = '';
    $scope.nowMname = '';
    $scope.searchText = '';
    $scope.members = [];
    $scope.sAuthcode = '';
    $scope.sPassword = '';
    $scope.my_mange_club_list = []; //我管理的公会列表
    $scope.isShowMemberSwitchGroup = false; //切换弹框
    $scope.isShowCreateClub = false;
    $scope.isShowOpenClub = false;
    $scope.isShowTip = false;
    $scope.isShowHallTip = false;
    $scope.tipText = ''; //切换弹框
    $scope.isShowMemberMange = false;
    $scope.chooseClub = '';
    $scope.updatePhone = {
        phoneError: '',
        authcodeError: ''
    };
    $scope.setPassword_show = false;
    $scope.username = '';
    $scope.password = '';
    $scope.passwordR = '';
    $scope.isShowIndiv = false;
    $scope.isShowIndivConfirm = false;
    $scope.isShowIndivBefore = false;
    $scope.individuality = null;
    $scope.isShowJoinClub = false;
    $scope.addClubId = null;
    $scope.shopSelectType = 1;
    $scope.allCardName = ['青花瓷', '黑桃A', '猪年大吉', '福星高照', '欧式花纹', '幸运星', '经典扑克', '菱形宝石', '无敌战神', '唯美天使', '至尊王牌'];
    $scope.allFramesName = ['瑞气祥云', '王者之星', '蓝色猫爪', '粉红猫爪', '晴天娃娃', '快乐娃娃', '冰蓝之心', '天使之翼', '至尊皇冠', '可爱熊猫', '无厘头', '双喜临门'];
    $scope.isShowTipBindPhone = false;
    $scope.myClubFlag = '';

    function logMessage(message) {
        // console.log(message);
    };

    var wsOperation = {
        CreateRoom: "CreateRoom",
        openClub: "openClub",
        closeClub: "closeClub",
        getClubInfo: "getClubInfo",
        getClubRoomList: "getClubRoomList",
        getSClubRoomList: "getSClubRoomList",
        getClubMemberList: "getClubMemberList",
        delClubMember: "delClubMember",
        setClubManage: "setClubManage",
        cancelClubManage: "cancelClubManage",
        overGame: "overGame",
        cancelAutoRoom: "cancelAutoRoom",
        quitClub: "quitClub",
        searchAccount: "searchAccount",
        sendCards: "sendCards",
        addClubMember: "addClubMember",
        createChatRoom: "createChatRoom",
        updateClub: "updateClub",
        rejectClubMember: "rejectClubMember",
        agreeClubMember: "agreeClubMember",
        remarkClubMember: "remarkClubMember",
        addClubAccount: "addClubAccount",
        getClubList: "getClubList",
        setPassword: "setPassword",
        getMobileSms: "getMobileSms",
        checkSmsCode: "checkSmsCode",
        setIndividuality: "setIndividuality",
    }

    $scope.partChange = function (num) {
        if ($scope.part == num) {
            return
        }
        $scope.part = num;
        if (num == 1) {
            $scope.connectApi(gameSocket.wsApi, 'getClubRoomList');
        } else if (num == 3) {
            $scope.showNotyMsg();
            $scope.connectApi(gameSocket.wsApi);
        } else {
            ws.close();
            clearInterval($scope.tiao);
            $scope.showNotyMsg();
        }
    };
    $scope.loadMoreRoom = function () {
        $scope.currentRoomPage += 1;
        socketModule.getClubRoomList($scope.club_info.club_id);
    };
    // 匹配code
    $scope.GetQueryString = function (name) {
        var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            localStorage.setItem('code', unescape(r[2]))
            return unescape(r[2]);
        }
        return null;
    };

    var httpModule = {
        createMj: function () {

            var params = {
                operation: "CreateRoom",
                account_id: userData.account_id,
                session: userData.session,
                data: {
                    data_key: Date.parse(new Date()) + randomString(5),
                    joker: $scope.createInfo.hbmajiang.joker,
                    horse_count: $scope.createInfo.hbmajiang.horse_count,
                    qianggang: $scope.createInfo.hbmajiang.qianggang == 1 ? 2 : 1,
                    chengbao: $scope.createInfo.hbmajiang.chengbao == 1 ? 2 : 1,
                    js: $scope.createInfo.hbmajiang.ticket_count == 1 ? 4 : 8,
                    base_score: $scope.createInfo.hbmajiang.score_type,
                    duiduihu: $scope.createInfo.hbmajiang.is_qxd == 1 ? 2 : 1,
                    pengpenghu: $scope.createInfo.hbmajiang.is_pph == 1 ? 2 : 1,
                    qingyise: $scope.createInfo.hbmajiang.is_qys == 1 ? 2 : 1,
                    qianggang_multiple: $scope.createInfo.hbmajiang.is_qgjb == 1 ? 2 : 1,
                    nojoker_multiple: $scope.createInfo.hbmajiang.is_wgjb == 1 ? 2 : 1,
                    gangbao_multiple: $scope.createInfo.hbmajiang.is_gbjb == 1 ? 2 : 1,
                    shisanyao: $scope.createInfo.hbmajiang.is_ssy == 1 ? $scope.createInfo.hbmajiang.ssy_bet_type : 1,
                    player_num: 4
                }
            };

            var sendData = socketModule.sendDataMJ(params)
            $scope.max_count_title = '麻将';

            localStorage.hbmajiang = JSON.stringify($scope.createInfo.hbmajiang);

            $.ajax({
                type: "POST",
                url: '/roomapi/createMj',
                data: sendData,
                contentType: 'application/json',
                async: false,
                success: function (data) {
                    var _data = JSON.parse(data);
                    if (_data.result == -1) {
                        $scope.showResultFunc(_data.result_message);
                        $scope.is_operation = false;
                    } else {
                        $scope.is_operation = false;
                        $scope.tzUrl = _data.data.url;
                        $scope.showResultFunc('创建成功');
                        socketModule.processCreateRoom(_data)
                        $scope.cancelCreate()
                    }
                    $scope.$applyAsync();
                },
                error: function (jqXHR) {
                    console.log("Error: " + jqXHR.status);
                }
            });
        },
    };

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
                if ($scope.cancelLog == false) {
                    console.log('发送的数据:', params)
                }
            } else {
                rest = obj;
            }
            ws.send(rest);
        },
        sendDataMJ: function (obj) {
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

                var key = C.enc.Utf8.parse('8233567817781329');
                var ivv = C.enc.Utf8.parse('8795432412347175');
                var encrypted = C.AES.encrypt(_obj, key, {iv: ivv, mode: C.mode.CBC, padding: C.pad.ZeroPadding});

                rest = encrypted.toString();
                if ($scope.cancelLog == false) {
                    console.log('发送的数据:', params)
                }
            } else {
                rest = obj;
            }
            return rest
        },
        sendDataA: function (obj) {
            var rest;
            if (obj != '@') {
                var params = {
                    data: obj
                };
                var _obj = JSON.stringify(params);

                var key = C.enc.Utf8.parse('8233567817781329');
                var ivv = C.enc.Utf8.parse('8795432412347175');
                var encrypted = C.AES.encrypt(_obj, key, {iv: ivv, mode: C.mode.CBC, padding: C.pad.ZeroPadding});

                rest = encrypted.toString();
            } else {
                rest = obj;
            }
            return rest
        },
        processCreateRoom(obj) {
            var game_name = globalData.hallName + ': ' + $scope.max_count_title + obj.data.room_number + '房间';
            $scope.room_number = obj.data.room_number;
            $scope.showAlert(666, game_name)
        },
        openClub: function () {
            socketModule.sendDataCode({
                operation: wsOperation.openClub,
                data: {
                    //timestamp: Date.parse(new Date()) / 1000,
                    token: globalData.tk,
                    //account_id: userData.account_id
                }
            });
        },
        processOpenClub(obj) {
            if (obj.result == 0) {
                $scope.isOpenClub = true;
                $scope.userInfo.myClubId = obj.data.club_id;
                $scope.userInfo.myClubName = obj.data.club_name;
                if ($scope.part == 1) {
                    socketModule.getClubRoomList($scope.userInfo.myClubId);
                } else {
                    socketModule.getClubMemberList($scope.userInfo.myClubId);
                }
            }
        },
        closeClub: function () {
            socketModule.sendDataCode({
                operation: wsOperation.closeClub,
                data: {
                    //timestamp: Date.parse(new Date()) / 1000,
                    token: globalData.tk,
                    //account_id: userData.account_id
                }
            });
        },
        processCloseClub(obj) {
            if (obj.result == 0) {
                $scope.isOpenClub = false;
                $scope.userInfo.myClubId = 0;
                $scope.userInfo.myClubName = '';
                $scope.room_list = [];
                socketModule.getClubMemberList();
                $scope.$apply();
            }
        },
        getClubInfo: function (clubId) {
            socketModule.sendDataCode({
                operation: wsOperation.getClubInfo,
                data: {
                    timestamp: Date.parse(new Date()) / 1000,
                    token: globalData.tk,
                    account_id: userData.account_id,
                    club_id: clubId,
                }
            });
        },
        getClubList: function (clubId) {
            var isRepeat = repeat('getClubList');
            if (isRepeat) {
                $scope.showResultFunc('请不要连续点击按钮!');
                return
            }
            socketModule.sendDataCode({
                operation: wsOperation.getClubList,
                data: {
                    timestamp: Date.parse(new Date()) / 1000,
                    token: globalData.tk,
                    account_id: userData.account_id,
                    page: $scope.currentRoomPage
                }
            });
        },
        processGetClubList(obj) {
            var data = obj.data;
            for (var i in data) {
                if (data[i].h.indexOf("http") == -1 && data[i].h.indexOf("https") == -1) {
                    data[i].h = obj.wh + "/" + data[i].h;
                }

            }
            $scope.club_list = data;
            if ($scope.club_list == "") {
                $scope.isShowTip = true;
                $scope.tipText = '暂无数据';
                return;
            } else {
                if ($scope.part == 1) {
                    $scope.isShowSwitchGroup = true;
                }
            }

            var flag = false;
            $scope.my_mange_club_list = [];
            if ($scope.part == 3) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].l == 2) {
                        $scope.my_mange_club_list.push(data[i]);
                        flag = true;
                    }
                }
                if (flag) {
                    $scope.isShowMemberMange = true;
                    $scope.memberListPage = 1;
                    socketModule.gSCML($scope.my_mange_club_list[0].id);
                } else {
                    $scope.showResultFunc('没有管理的俱乐部');
                }
            }

        },
        getClubRoomList: function (clubId) {
            var isRepeat = repeat('getClubRoomList');
            if (isRepeat) {
                $scope.showResultFunc('请不要连续点击按钮!');
                return
            }
            if (!$scope.connectOrNot) {
                return
            }
            $scope.is_operation = true;
            setTimeout(function () {
                $scope.is_operation = false;
            }, 500)
            var sendData = '';
            if (globalData.p_type == 2) {
                sendData = {
                    operation: wsOperation.getClubRoomList,
                    data: {
                        token: globalData.tk,
                        account_id: userData.account_id,
                        page: $scope.currentRoomPage
                    }
                }
            } else {
                sendData = {
                    operation: wsOperation.getSClubRoomList,
                    data: {
                        token: globalData.tk,
                        account_id: userData.account_id,
                        page: $scope.currentRoomPage
                    }
                }
            }

            if (clubId) {
                sendData.data.club_id = clubId;
            }
            console.log("sendData:", sendData);
            socketModule.sendDataCode(sendData);
        },
        getSClubRoomList: function (clubId) {
            var isRepeat = repeat('getSClubRoomList');
            if (isRepeat) {
                $scope.showResultFunc('请不要连续点击按钮!');
                return
            }
            if (!$scope.connectOrNot) {
                return
            }
            $scope.is_operation = true;
            setTimeout(function () {
                $scope.is_operation = false;
            }, 500)
            var sendData = '';
            if (globalData.p_type == 2) {
                sendData = {
                    operation: wsOperation.getClubRoomList,
                    data: {
                        token: globalData.tk,
                        account_id: userData.account_id,
                        page: $scope.currentRoomPage
                    }
                }
            } else {
                sendData = {
                    operation: wsOperation.getSClubRoomList,
                    data: {
                        token: globalData.tk,
                        account_id: userData.account_id,
                        page: $scope.currentRoomPage
                    }
                }
            }

            if (clubId) {
                sendData.data.club_id = clubId;
            }
            console.log("sendData:", sendData);
            socketModule.sendDataCode(sendData);
        },
        processGetClubRoomList(obj) {
            var data = obj.data;
            if (obj.result == 0) {
                if ($scope.currentRoomPage == 1) {
                    $scope.room_list = [];
                }
                if (data.rs.length > 0) {
                    $scope.isShowMoreRoom = true;
                } else {
                    $scope.isShowMoreRoom = false;
                }
                for (var i = 0; i < data.rs.length; i++) {
                    if (data.rs[i].gt == 16 && data.rs[i].c == 4) {
                        return
                    } else {
                        if (data.rs[i].gt == 1 || data.rs[i].gt == 2) {
                            data.rs[i].name = '牛 牛';
                        } else if (data.rs[i].gt == 3) {
                            data.rs[i].name = '血拼';
                        } else if (data.rs[i].gt == 4) {
                            data.rs[i].name = '金花';
                        } else if (data.rs[i].gt == 5) {
                            data.rs[i].name = '三公';
                        } else if (data.rs[i].gt == 6) {
                            data.rs[i].name = '二八杠';
                        } else if (data.rs[i].gt == 7) {
                            data.rs[i].name = '斗地主';
                        } else if (data.rs[i].gt == 8) {
                            data.rs[i].name = '麻将';
                        } else if (data.rs[i].gt == 9) {
                            data.rs[i].name = '鱼虾蟹';
                        } else if (data.rs[i].gt == 10) {
                            data.rs[i].name = '牌九';
                        } else if (data.rs[i].gt == 12) {
                            data.rs[i].name = '大吃小牛 牛';
                        } else if (data.rs[i].gt == 13) {
                            data.rs[i].name = '大吃小';
                        } else if (data.rs[i].gt == 14) {
                            data.rs[i].name = '癞子牛 牛';
                        } else if (data.rs[i].gt == 17) {
                            data.rs[i].name = '三加一';
                        } else if (data.rs[i].gt == 18) {
                            data.rs[i].name = '大牌九';
                        } else if (data.rs[i].gt == 43) {
                            data.rs[i].name = '至尊牛';
                        }
                        data.rs[i].banker_mode = '经典';

                        $scope.room_list.push(data.rs[i])
                    }
                }
                $scope.club_info.club_id = data.cid;
                $scope.club_info.club_name = data.cn;
                $scope.club_info.is_self = data.is;
                $scope.isOpenClub = data.mcid == '' ? false : true;
                for (var i in $scope.club_list) {
                    if ($scope.club_list.club_id == data.cid) {
                        $scope.club_list.is_self = data.is;
                    }
                }
                if ($scope.isOpenClub == false && $scope.part == 1) {
                    // $scope.showResultFunc('未开启俱乐部');
                }

            }
            $scope.$apply();
        },
        processGetSClubRoomList(obj) {
            var data = obj.data;
            if (obj.result == 0) {
                if ($scope.currentRoomPage == 1) {
                    $scope.room_list = [];
                }
                if (data.rs.length > 0) {
                    $scope.isShowMoreRoom = true;
                } else {
                    $scope.isShowMoreRoom = false;
                }
                for (var i = 0; i < data.rs.length; i++) {
                    if (data.rs[i].gt == 8 || data.rs[i].gt == 16 || data.rs[i].gt == 41 || data.rs[i].gt == 52) {
                        data.rs.splice(i, 1)
                        // return
                    } else {
                        if (data.rs[i].gt == 1 || data.rs[i].gt == 2) {
                            data.rs[i].name = '牛 牛';
                        } else if (data.rs[i].gt == 3) {
                            data.rs[i].name = '血拼';
                        } else if (data.rs[i].gt == 4) {
                            data.rs[i].name = '金花';
                        } else if (data.rs[i].gt == 5) {
                            data.rs[i].name = '三公';
                        } else if (data.rs[i].gt == 6) {
                            data.rs[i].name = '二八杠';
                        } else if (data.rs[i].gt == 7) {
                            data.rs[i].name = '斗地主';
                        } else if (data.rs[i].gt == 8) {
                            data.rs[i].name = '麻将';
                        } else if (data.rs[i].gt == 9) {
                            data.rs[i].name = '鱼虾蟹';
                        } else if (data.rs[i].gt == 10) {
                            data.rs[i].name = '牌九';
                        } else if (data.rs[i].gt == 12) {
                            data.rs[i].name = '大吃小牛 牛';
                        } else if (data.rs[i].gt == 13) {
                            data.rs[i].name = '大吃小';
                        } else if (data.rs[i].gt == 14) {
                            data.rs[i].name = '癞子牛 牛';
                        } else if (data.rs[i].gt == 17) {
                            data.rs[i].name = '三加一';
                        } else if (data.rs[i].gt == 18) {
                            data.rs[i].name = '大牌九';
                        } else if (data.rs[i].gt == 42) {
                            data.rs[i].name = '吉祥三公';
                        } else if (data.rs[i].gt == 43) {
                            data.rs[i].name = '至尊牛';
                        }
                        data.rs[i].banker_mode = '经典';

                        $scope.room_list.push(data.rs[i])
                        if (data.rs[i].m.length > 0) {
                            var headerArr = data.rs[i].m;
                            for (var j = 0; j < headerArr.length; j++) {
                                if (data.rs[i].m[j].headimgurl.indexOf('http') == -1 && data.rs[i].m[j].headimgurl.indexOf('https') == -1) {
                                    data.rs[i].m[j].headimgurl = data.wh + "/" + data.rs[i].m[j].headimgurl;
                                }
                            }
                        }
                    }


                }
                $scope.club_info.club_id = data.cid;
                $scope.club_info.club_name = data.cn;
                $scope.club_info.is_self = data.is;
                $scope.isOpenClub = data.mcid == '' ? false : true;
                for (var i in $scope.club_list) {
                    if ($scope.club_list.club_id == data.cid) {
                        $scope.club_list.is_self = data.is;
                    }
                }
                if ($scope.isOpenClub == false && $scope.part == 1) {
                    // $scope.showResultFunc('未开启俱乐部');
                }

            }
            $scope.$apply();
        },
        getGtype() {
            socketModule.sendDataCode({
                operation: 'getGtype',
                data: {
                    room_number: $scope.sRoom
                }
            });
        },
        processGetGtype(obj) {
            var data = obj.data;
            if (obj.result == 0) {
                var room_number = $scope.sRoom;
                var url = Htmls.getRoomUrl(data.gtype, data.max_count, room_number);
                window.location.replace(url);
            }
        },
        gHD: function (type) {
            socketModule.sendDataCode({
                operation: "getHallData",
                data: {
                    timestamp: Date.parse(new Date()) / 1000,
                    token: globalData.tk,
                }
            });
        },
        pGHD(obj) {
            $scope.notyMsg = obj.data.content;
            $scope.phone = obj.data.phone;
            // userData.card = obj.data.ticket_count;
            userData.individuality = obj.data.individuality;
            if ($scope.notyMsg != '') {
                $scope.showNotyMsg();
            }
            $scope.$apply();
            var info = {
                "account_id": userData.account_id,
                "nickname": userData.nickname,
                "headimgurl": userData.headimgurl,
                "card": obj.data.ticket_count,
                "individuality": obj.data.individuality,
                "user_id": userData.user_id,
            };
            setC('userData', JSON.stringify(info));
            setC('phone', obj.data.phone);
            setC('notyMsg', JSON.stringify(obj.data.content));
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
            userData.card = obj.data;
        },
        getClubMemberList: function () {
            var club_id;
            var sendData = {
                operation: wsOperation.getClubMemberList,
                data: {
                    timestamp: Date.parse(new Date()) / 1000,
                    token: globalData.tk,
                    page: $scope.memberListPage
                }
            }
            socketModule.sendDataCode(sendData);
        },
        processGetClubMemberList(obj) {
            $scope.isShowSetting = false;
            if ($scope.memberListPage == 1) {
                $scope.member_list = [];
            }
            var list = obj.data;
            if (list.length > 0) {
                $scope.isShowLoadMoreMember = true;
                for (var i = 0; i < list.length; i++) {
                    // if (list[i].h.indexOf('http') == -1 && list[i].h.indexOf('https') == -1) {
                    //     list[i].h = obj.wh + "/" + list[i].h;
                    // }
                    $scope.member_list.push(list[i]);
                }
            } else {
                $scope.isShowLoadMoreMember = false;
            }
            $scope.isOpenClub = obj.mcid == '' || obj.mcid == 0 ? false : true;
            if ($scope.isOpenClub == false) {
                $scope.isShowHallTip = true;
                $scope.tipText = '您还没开启俱乐部';
            }
            if ($scope.memberListPage == 1) {
                $scope.userInfo.myClubName = obj.cn;
                $scope.userInfo.myClubId = obj.mcid;
            }
            $scope.$apply();
        },
        gSCML: function (club_id) {
            $scope.currentManageClubId = club_id;
            var sendData = {
                operation: "10301",
                data: {
                    timestamp: Date.parse(new Date()) / 1000,
                    token: globalData.tk,
                    page: $scope.memberListPage,
                    club_id: club_id
                }
            }
            socketModule.sendDataCode(sendData);
        },
        processGSCML(obj) {
            $scope.isShowSetting = false;
            if ($scope.memberListPage == 1) {
                $scope.member_list = [];
            }
            var list = obj.data;
            if (list.length > 0) {
                $scope.isShowLoadMoreMember = true;
                for (var i = 0; i < list.length; i++) {
                    if (list[i].h.indexOf('http') == -1 && list[i].h.indexOf('https') == -1) {
                        list[i].h = obj.wh + "/" + list[i].h;
                    }
                    $scope.member_list.push(list[i]);
                }
            } else {
                $scope.isShowLoadMoreMember = false;
            }

            if ($scope.memberListPage == 1) {
                $scope.currentManageClubName = obj.cn;
            }
            $scope.$apply();
        },
        searchAccount: function (id) {
            socketModule.sendDataCode({
                operation: wsOperation.searchAccount,
                data: {
                    timestamp: Date.parse(new Date()) / 1000,
                    token: globalData.tk,
                    account_id: $scope.addMember.code
                }
            });
        },
        processSearchAccount: function (obj) {
            var data = obj.data;
            $scope.addMember.accountCode = data.account_id;
            $scope.addMember.avatar = data.avatar_url;
            $scope.addMember.name = data.nickname;
            $scope.$apply();
        },
        sf: function (id) {
            socketModule.sendDataCode({
                operation: "searchFlag",
                data: {
                    timestamp: Date.parse(new Date()) / 1000,
                    token: globalData.tk,
                    flag: $scope.addMember.flag
                }
            });
        },
        pSF: function (obj) {
            var data = obj.data;
            $scope.addMember.accountCode = data.account_id;
            $scope.addMember.avatar = data.avatar_url;
            $scope.addMember.name = data.nickname;
            $scope.$apply();
        },
        seacrhClubMember: function (id) {
            socketModule.sendDataCode({
                operation: "seacrhClubMember",
                data: {
                    timestamp: Date.parse(new Date()) / 1000,
                    token: globalData.tk,
                    kw: $scope.addMember.code
                }
            });
        },
        pSCM: function (obj) {
            var data = obj.data;
            $scope.addMember.accountCode = data.account_id;
            $scope.addMember.avatar = data.avatar_url;
            $scope.addMember.name = data.nickname;
            $scope.$apply();
        },
        sendCards: function () {
            socketModule.sendDataCode({
                operation: wsOperation.sendCards,
                data: {
                    timestamp: Date.parse(new Date()) / 1000,
                    token: globalData.tk,
                    add_account_id: $scope.addMember.accountCode,
                    ticket_count: $scope.addMember.card,
                }
            });
        },
        processSendCards: function (obj) {
            var data = obj.data;
            if (obj.result == 0) {
                $scope.showResultFunc('发送成功');
                $scope.userInfo.card -= $scope.addMember.card;
            }
            $scope.$apply();
        },
        getMobileSms: function () {
            socketModule.sendDataCode({
                operation: wsOperation.getMobileSms,
                data: {
                    timestamp: Date.parse(new Date()) / 1000,
                    token: globalData.tk,
                    account_id: $scope.userInfo.account_id,
                    phone: $scope.sPhone,
                }
            });
        },
        processGetMobileSms: function (obj) {
            if (obj.result == 0) {
                $scope.showResultFunc('发送验证码成功');
                setTimeout(function () {
                    $scope.authcodeTime = 60;
                    authcodeTimer();
                    $scope.authcodeType = 2;
                }, 0);
            }
        },
        checkSmsCode: function () {
            socketModule.sendDataCode({
                operation: wsOperation.checkSmsCode,
                data: {
                    timestamp: Date.parse(new Date()) / 1000,
                    token: globalData.tk,
                    account_id: $scope.userInfo.account_id,
                    phone: $scope.sPhone,
                    code: $scope.sAuthcode,
                }
            });
        },
        processCheckSmsCode: function (obj) {
            $scope.showResultFunc('绑定成功');
            $scope.phone = $scope.sPhone.toString();
            setC('phone', $scope.phone);
            $scope.$apply();
            if (globalData.p_type == 2) {
                socketModule.setPassword();
            }
            $scope.sPhone = '';
            $scope.password = '';
            $scope.passwordR = '';
            $scope.sAuthcode = '';
            $scope.authcodeTime = 0;
            $scope.isShowBindPhone = false;
            $scope.showFeature_find = false;
        },
        setPassword: function () {
            socketModule.sendDataCode({
                operation: wsOperation.setPassword,
                data: {
                    timestamp: Date.parse(new Date()) / 1000,
                    token: globalData.tk,
                    username: $scope.username,
                    password: $scope.password,
                }
            });
        },
        processSetPassword: function (obj) {
            if (obj.result == 0) {
                $scope.showResultFunc('设置成功');
                $scope.isShowBindPhone = false;
                $scope.setPassword_show = false;
            }
        },
        setIndividuality: function () {
            socketModule.sendDataCode({
                operation: wsOperation.setIndividuality,
                data: {
                    timestamp: Date.parse(new Date()) / 1000,
                    token: globalData.tk,
                    individuality: $scope.individuality,
                    account_id: userData.account_id,
                }
            });
        },
        processSetIndividuality: function (obj) {
            if (obj.result == 0) {
                $scope.showResultFunc('设置成功');
                $scope.isShowIndivConfirm = false;
                $scope.userInfo.individuality = $scope.individuality;
            }
        },
        addClubMember: function () {
            if ($scope.isShowMemberMange) {
                socketModule.sendDataCode({
                    operation: wsOperation.addClubMember,
                    data: {
                        timestamp: Date.parse(new Date()) / 1000,
                        token: globalData.tk,
                        op_account_id: $scope.addMember.accountCode,
                        op_club_id: $scope.currentManageClubId,
                        flag: $scope.addMember.flag,
                        remark: $scope.addMember.remark
                    }
                });
            } else {
                socketModule.sendDataCode({
                    operation: wsOperation.addClubMember,
                    data: {
                        timestamp: Date.parse(new Date()) / 1000,
                        token: globalData.tk,
                        op_account_id: $scope.addMember.accountCode,
                        flag: $scope.addMember.flag,
                        remark: $scope.addMember.remark
                    }
                });
            }
        },
        processAddClubMember: function (obj) {
            $scope.showResultFunc('添加成功');
            $scope.member_list = [];
            $scope.memberListPage = 1;
            if ($scope.isShowMemberMange) {
                socketModule.gSCML($scope.currentManageClubId);
            } else {
                socketModule.getClubMemberList();
            }
        },
        delClubMember: function (id) {
            if ($scope.isShowMemberMange) {
                socketModule.sendDataCode({
                    operation: wsOperation.delClubMember,
                    data: {
                        timestamp: Date.parse(new Date()) / 1000,
                        token: globalData.tk,
                        op_account_id: id,
                        op_club_id: $scope.currentManageClubId,
                    }
                });
            } else {
                socketModule.sendDataCode({
                    operation: wsOperation.delClubMember,
                    data: {
                        timestamp: Date.parse(new Date()) / 1000,
                        token: globalData.tk,
                        op_account_id: id,
                    }
                });
            }
        },
        processDelClubMember: function (obj) {
            $scope.showResultFunc('踢出成功');
            $scope.isShowSearch = false;
            var data = obj.data;
            if (obj.result == 0) {
                for (var i = 0; i < $scope.member_list.length; i++) {
                    if ($scope.opMemberId == $scope.member_list[i].account_id) {
                        $scope.member_list.splice(i, 1);
                    }
                }
            }
            $scope.hideMemberSetting();
            $scope.$apply();
        },
        addClubAccount: function (id) {
            socketModule.sendDataCode({
                operation: wsOperation.addClubAccount,
                data: {
                    timestamp: Date.parse(new Date()) / 1000,
                    token: globalData.tk,
                    club_id: id,
                }
            });
        },
        processAddClubAccount: function (obj) {
            var data = obj.data;
            if (obj.result == 0) {
                $scope.showResultFunc(obj.result_message)
            }
        },
        setClubManage: function (id) {
            socketModule.sendDataCode({
                operation: wsOperation.setClubManage,
                data: {
                    timestamp: Date.parse(new Date()) / 1000,
                    token: globalData.tk,
                    op_account_id: id
                }
            });
        },
        cancelClubManage: function (id) {
            socketModule.sendDataCode({
                operation: wsOperation.cancelClubManage,
                data: {
                    timestamp: Date.parse(new Date()) / 1000,
                    token: globalData.tk,
                    op_account_id: id
                }
            });
        },
        processCancelClubManage: function (obj) {
            var data = obj.data;
            if (obj.result == 0) {
                socketModule.getClubMemberList();
            }
        },
        processSetClubManage: function (obj) {
            var data = obj.data;
            if (obj.result == 0) {
                socketModule.getClubMemberList();
            }
        },
        overGame: function (type, roomId) {
            socketModule.sendDataCode({
                operation: wsOperation.overGame,
                data: {
                    token: globalData.tk,
                    game_type: parseInt(type),
                    room_id: parseInt(roomId)
                }
            });
        },
        processOverGame: function (obj) {
            if (obj.result == 0) {
                $scope.showResultFunc('强制结算成功');
                socketModule.getClubRoomList($scope.club_info.club_id)
            }
        },
        cancelAutoRoom: function (type, roomId) {
            socketModule.sendDataCode({
                operation: wsOperation.cancelAutoRoom,
                data: {
                    token: globalData.tk,
                    game_type: $scope.gameType,
                    account_id: userData.account_id,
                    club_id: $scope.club_info.club_id,
                    room_id: $scope.room_id,
                    timestamp: Date.parse(new Date()) / 1000,
                }
            });
        },
        processCancelAutoRoom: function (obj) {
            if (obj.result == 0) {
                $scope.showResultFunc('取消续局成功');
                $scope.closeAlert();
                socketModule.getClubRoomList($scope.club_info.club_id)
            }
        },
        quitClub: function (club_id) {
            socketModule.sendDataCode({
                operation: wsOperation.quitClub,
                data: {
                    token: globalData.tk,
                    club_id: club_id
                }
            });
        },
        processQuitClub: function (obj) {
            if (obj.result == 0) {
                $scope.showResultFunc('退出成功')
                if (userData.myClubId != '') {
                    socketModule.getClubRoomList(userData.myClubId)
                } else if ($scope.club_list != '') {
                    socketModule.getClubRoomList($scope.club_list[0].club_id);
                } else {
                    $scope.club_info.club_id = '';
                    $scope.club_info.club_name = '';
                    $scope.club_info.is_self = 0;
                    $scope.club_info.level = '';
                    $scope.room_list = '';
                }
            }
        },
        updateClub: function () {
            socketModule.sendDataCode({
                operation: wsOperation.updateClub,
                data: {
                    token: globalData.tk,
                    club_name: $scope.new_club_name,
                }
            });
        },
        processUpdateClub: function (obj) {
            if (obj.result == 0) {
                $scope.showResultFunc('更新成功')
                $scope.userInfo.myClubName = $scope.new_club_name;
                $scope.new_club_name = '';
                $scope.hidechangeGuideName();
            }
            $scope.$apply();
        },
        createChatRoom: function () {
            socketModule.sendDataCode({
                operation: wsOperation.createChatRoom,
                data: {
                    token: globalData.tk,
                }
            });
        },
        processCreateChatRoom: function (obj) {
            if (obj.result == 0) {
                window.location.replace(globalData.baseUrl + cr('cr', new Date().getTime()));
            }
        },
        processGetToolsList: function (obj) {
            $scope.gitListShow();
            if (obj.result == 0) {
                $scope.giftList = obj.data;
            } else {
                console.log('获取失败')
            }
        },
        processGetSkinList: function (obj) {
            $scope.giftList = obj.data;
            for (var i = 0; i < $scope.giftList.length; i++) {
                if ($scope.giftList[i].st == 1) {
                    $scope.giftList[i].name = $scope.allCardName[i];
                } else {
                    $scope.giftList[i].name = $scope.allFramesName[i];
                }
            }
            $scope.$apply();
        },
        processBuyTools: function (obj) {
            if (obj.result == 0) {
                $scope.getGiftList();
                $scope.showResultFunc('购买成功');
            } else {
                $scope.showResultFunc('购买失败')
            }
        },
        processBuySkin: function (obj) {
            if (obj.result == 0) {
                $scope.userInfo.card -= $scope.spend_num;
                $scope.getSkinList();
                $scope.showResultFunc('购买成功');

                $scope.isGiftInfo = false;
            } else {
                $scope.showResultFunc('购买失败')
            }
        },
        processSetSkin: function (obj) {
            if (obj.result == 0) {
                $scope.getSkinList();
                $scope.showResultFunc('使用成功');
                $scope.isGiftInfo = false;
            } else {
                $scope.showResultFunc('使用成功')
            }
        },
        agreeClubMember: function (memberID) {
            $scope.opMemberId = memberID;
            socketModule.sendDataCode({
                operation: "agreeClubMember",
                data: {
                    token: globalData.tk,
                    op_account_id: memberID,
                    timestamp: Date.parse(new Date()) / 1000,
                }
            });
        },
        processAgreeClubMember: function (obj) {
            for (var i = 0; i < $scope.member_list.length; i++) {
                if ($scope.opMemberId == $scope.member_list[i].account_id) {
                    $scope.member_list[i].status = 1;
                }
            }
            $scope.showResultFunc('操作成功');
        },
        rejectClubMember: function (memberID) {
            $scope.opMemberId = memberID;
            socketModule.sendDataCode({
                operation: wsOperation.rejectClubMember,
                data: {
                    token: globalData.tk,
                    op_account_id: memberID,
                    timestamp: Date.parse(new Date()) / 1000,
                }
            });
        },
        processRejectClubMember: function (obj) {
            if (obj.result == 0) {
                for (var i = 0; i < $scope.member_list.length; i++) {
                    if ($scope.opMemberId == $scope.member_list[i].account_id) {
                        $scope.member_list.splice(i, 1);
                    }
                }
            }
            $scope.showResultFunc('操作成功');
        },
        blackClubMember: function (memberID) {
            $scope.opMemberId = memberID;
            socketModule.sendDataCode({
                operation: "blackClubMember",
                data: {
                    token: globalData.tk,
                    op_account_id: memberID,
                    timestamp: Date.parse(new Date()) / 1000,
                }
            });
        },
        processBlackClubMember: function (obj) {
            if (obj.result == 0) {
                for (var i = 0; i < $scope.member_list.length; i++) {
                    if ($scope.opMemberId == $scope.member_list[i].id) {
                        $scope.member_list[i].s = 4;
                    }
                }
            }
            $scope.showResultFunc('操作成功');
        },
        remarkClubMember: function () {
            if ($scope.isShowMemberMange) {
                socketModule.sendDataCode({
                    operation: wsOperation.remarkClubMember,
                    data: {
                        token: globalData.tk,
                        remark: $scope.nowMname,
                        op_account_id: $scope.nowItem.id,
                        op_club_id: $scope.currentManageClubId
                    }
                });
            } else {
                socketModule.sendDataCode({
                    operation: wsOperation.remarkClubMember,
                    data: {
                        token: globalData.tk,
                        remark: $scope.nowMname,
                        op_account_id: $scope.nowItem.id
                    }
                });
            }
        },
        processRemarkClubMember: function (obj) {
            if (obj.result == 0) {
                for (var i = 0; i < $scope.member_list.length; i++) {
                    if ($scope.nowItem.id == $scope.member_list[i].id) {
                        $scope.member_list[i].r = $scope.nowMname
                    }
                }
            }
        },
        createMj: function () {

            var sendData = {
                operation: "createMj",
                account_id: userData.account_id,
                session: userData.session,
                data: {
                    data_key: Date.parse(new Date()) + randomString(5),
                    joker: $scope.createInfo.hbmajiang.joker,
                    horse_count: $scope.createInfo.hbmajiang.horse_count,
                    qianggang: $scope.createInfo.hbmajiang.qianggang == 1 ? 2 : 1,
                    chengbao: $scope.createInfo.hbmajiang.chengbao == 1 ? 2 : 1,
                    js: $scope.createInfo.hbmajiang.ticket_count == 1 ? 4 : 8,
                    base_score: $scope.createInfo.hbmajiang.score_type,
                    duiduihu: $scope.createInfo.hbmajiang.is_qxd == 1 ? 2 : 1,
                    pengpenghu: $scope.createInfo.hbmajiang.is_pph == 1 ? 2 : 1,
                    qingyise: $scope.createInfo.hbmajiang.is_qys == 1 ? 2 : 1,
                    qianggang_multiple: $scope.createInfo.hbmajiang.is_qgjb == 1 ? 2 : 1,
                    nojoker_multiple: $scope.createInfo.hbmajiang.is_wgjb == 1 ? 2 : 1,
                    gangbao_multiple: $scope.createInfo.hbmajiang.is_gbjb == 1 ? 2 : 1,
                    shisanyao: $scope.createInfo.hbmajiang.is_ssy == 1 ? $scope.createInfo.hbmajiang.ssy_bet_type : 1,
                    player_num: 4
                }
            };

            socketModule.sendDataCode(sendData);
            $scope.max_count_title = '麻将';
        },
        processCreateMj: function (obj) {
            localStorage.hbmajiang = JSON.stringify($scope.createInfo.hbmajiang);
            $scope.is_operation = false;
            $scope.showResultFunc('创建成功');
            $scope.cancelCreate();
            window.location.replace(obj.data.url)

        },
        createRoomBuyu: function () {
            socketModule.sendDataCode({
                operation: "createRoomBuyu",
                account_id: userData.account_id,
                session: userData.account_id,
                data: {
                    token: globalData.tk,
                    df: $scope.createInfo.fish.df,
                    js: $scope.createInfo.fish.js,
                    gameTime: $scope.createInfo.fish.gameTime,
                }
            });
        },
        processCreateRoomBuyu: function (obj) {
            if (obj.result == 0) {
                if (globalData.p_type == 0) {
                    $scope.tzUrl = globalData.baseUrl + "?room=" + obj.data.room;
                    window.location.replace($scope.tzUrl);
                } else {
                    var game_name = globalData.hallName + ': ' + $scope.max_count_title + obj.data.room_number + '房间';
                    $scope.room_number = obj.data.room_number;
                    $scope.showAlert(667, game_name);
                    $scope.tzUrl = globalData.baseUrl + "?room=" + obj.data.room;
                }

                $scope.is_operation = false;
                $scope.cancelCreate();
            }
        },
    }

    $scope.tiao;
    $scope.connectApi = function (socket, type) {
        $scope.socket_url = socket;
        ws = new WebSocket(socket);
        $scope.ws = ws;
        ws.onopen = function () {
            $scope.connectOrNot = true;
            // $scope.tiao = setInterval(function () {
            //     $scope.ws.send("@");
            // }, 20000);

            var tiao = setInterval(function () {
                $scope.ws.send("@");
            }, 4000);
            console.log("socketOpen");
            if (type && type == 'getSkinList') {
                $scope.getSkinList();
                $scope.gitListShow();
            } else if (type && type == 'getGiftList') {
                $scope.getGiftList();
            } else if (type && type == 'getClubRoomList') {
                $scope.currentRoomPage = 1;
                socketModule.getClubRoomList();
                // socketModule.getClubRoomList($scope.club_info.club_id);
            } else if (type && type == 'getSClubRoomList') {
                $scope.currentRoomPage = 1;
                socketModule.getSClubRoomList();
                // socketModule.getClubRoomList($scope.club_info.club_id);
            } else if (type && type == 'createChatRoom') {
                socketModule.createChatRoom();
            } else if (type && type == 'getGtype') {
                socketModule.getGtype();
            } else if (type && type == 'gHD') {
                var userDataCookie = getC('userData');

                if (userDataCookie) {
                    var obj = JSON.parse(userDataCookie);
                    userData.individuality = obj.individuality;
                    var phoneCookie = getC('phone');
                    if (phoneCookie) {
                        // socketModule.gAC();
                        userData.phone = phoneCookie;
                        $scope.phone = phoneCookie;
                    } else {
                        socketModule.gHD();
                    }
                    $scope.$apply();
                } else {
                    socketModule.gHD();
                }

                var notyMsgCookie = getC('notyMsg');
                if (notyMsgCookie) {
                    var notyMsg = JSON.parse(notyMsgCookie);
                    $scope.notyMsg = notyMsg;
                    $scope.showNotyMsg();
                }

                var phoneCookie = getC('phone');
                if (phoneCookie) {
                    userData.phone = phoneCookie;
                    $scope.phone = phoneCookie;
                } else {
                    // socketModule.gHD();
                }
                $scope.$apply();
            } else if (type && type == 'gAC') {
                var phoneCookie = getC('phone');
                if (phoneCookie) {
                    socketModule.gAC();
                    userData.phone = phoneCookie;
                    $scope.phone = phoneCookie;
                } else {
                    socketModule.gHD();
                }
            } else if (type && type == 'createMj') {
                socketModule.createMj();
            } else if (type && type == 'createRoomBuyu') {
                socketModule.createRoomBuyu();
            }
        };
        ws.onmessage = function (evt) {
            if (evt.data == "@") {
                socketStatus = 0;
                return 0;
            }
            mc(evt);
        };
        ws.onclose = function (evt) {
            console.log("ws closed");
            clearInterval($scope.tiao);
            if ($scope.part == 1) {
                $scope.connectApi($scope.socket_url);
            }
        }
        ws.onerror = function (evt) {
            console.log("WebSocketError!");
        };
    };

    $scope.changeLoading = function () {

        setTimeout(function () {
            $scope.isShowLoading = false;
            $scope.isShowLoading2 = true;
        }, 500)


        $scope.loadingTimer = setInterval(function () {
            $scope.loadingNum++;
            $scope.loadingUrl = globalData.fileUrl + "files/images/loading/" + $scope.loadingNum + ".png";
            if ($scope.loadingNum == 11) {
                $scope.loadingNum = 1;
            }
            $scope.$apply();
        }, 100)
        setTimeout(function () {
            $scope.isShowLoading2 = false;
            if (globalData.is_gruop == 1) {
                $scope.showGetLink();
            }
        }, 100)
    };
    $scope.changeLoading();
    $scope.loadingTimer = setInterval(function () {
        $scope.$apply();
    }, 100)
    $scope.connectApi(gameSocket.wsApi, 'gHD');

    $scope.showTipsBindPhone = function () {
        if (!localStorage.getItem('showTipBindPhone') && $scope.userInfo.phone == '') {
            // 显示一次提示
            $scope.isShowTipBindPhone = true;
            setTimeout(function () {
                $scope.isShowTipBindPhone = false;
                localStorage.setItem('showTipBindPhone', 1);
            }, 2000)
        }
    };
    $scope.showGetLink = function () {
        $scope.isShowGetLink = true;
    };
    $scope.hideGetLink = function () {
        if (localStorage.getItem('linkTips') && localStorage.getItem('linkTips') == 1) {
            $scope.isShowGetLink = false;
            $scope.isShowGetLinkConfirm = false;
        } else {
            $scope.isShowGetLinkConfirm = true;
        }
    };
    $scope.showGetLinkConfirm = function () {
        $scope.isShowGetLinkConfirm = true;
        // $scope.isShowGetLink = false;
    };
    $scope.hideGetLinkConfirm = function () {
        $scope.isShowGetLinkConfirm = false;
    }

    $scope.blurIpt = function () {
        window.scrollTo(0, 0)
    };
    $scope.showGift = function () {
        $scope.clickVoice();
        $scope.connectApi(gameSocket.wsApi, 'getSkinList');
    };
    $scope.showGiftYh = function () {
        $scope.connectApi(gameSocket.wsApi, 'getGiftList');
    };
    $scope.changeShopSelectType = function (num) {
        $scope.shopSelectType = num;
        $scope.getSkinList();
    };
    $scope.showIndivConfirm = function () {
        if ($scope.individuality == '' || !$scope.individuality) {
            $scope.showResultFunc('请输入防作弊码');
            return
        }
        $scope.isShowIndiv = false;
        $scope.isShowIndivConfirm = true;
    };
    $scope.hideIndivConfirm = function () {
        $scope.isShowIndiv = true;
        $scope.isShowIndivConfirm = false;
    };
    $scope.showIndivInfo = function () {
        if ($scope.userInfo.individuality != '') {
            $scope.isShowIndivBefore = true;
        } else {
            $scope.isShowIndiv = true;
        }
    };
    $scope.hideIndivBefore = function () {
        $scope.isShowIndivBefore = false;
    };
    $scope.hideIndivInfo = function () {
        $scope.isShowIndiv = false;
    };
    $scope.setIndividuality = function () {
        var isRepeat = repeat('setIndividuality');
        if (isRepeat) {
            $scope.showResultFunc('请不要连续点击按钮!');
            return
        }
        socketModule.setIndividuality();
    };
    $scope.checkIndividuality = function (e) {
        return !!/^[0-9a-zA-Z]*$/g.test(e);
    };
    $scope.showJoinClub = function () {
        $scope.isShowJoinClub = true;
    };
    $scope.hideJoinClub = function () {
        $scope.isShowJoinClub = false;
    };
    $scope.refesh = function () {
        window.location.replace(window.location.href);
    };
    $scope.giftName = function (e) {
        var giftName = {
            1: 'bomb',
            2: 'egg',
            3: 'car',
            4: 'cheer',
            5: 'flower',
            6: 'gift',
            7: 'house',
            8: 'kiss',
            9: 'slap',
            10: 'water'
        };
        return giftName[e]
    };
    $scope.getGiftList = function () {
        socketModule.sendDataCode({
            operation: 'getToolsList',
            data: {
                token: globalData.tk,
            }
        });
    };
    $scope.getSkinList = function () {
        socketModule.sendDataCode({
            operation: 'getSkinList',
            data: {
                token: globalData.tk,
                skin_type: $scope.shopSelectType,
            }
        });
    };
    $scope.gitListShow = function () {
        $scope.isGitListShow = true;
    };
    $scope.gitListHide = function () {
        $scope.isGitListShow = false;
        ws.close();
    };
    $scope.gitInfoHide = function () {
        $scope.isGiftInfo = false;
    };
    $scope.buyGiftShow = function (e) {
        $scope.isGiftInfo = true;
        $scope.giftInfo = e;
    };
    $scope.buyGiftHide = function (e) {
        $scope.isGiftInfo = false;
        $scope.giftInfo = {};
    };
    $scope.buyGiftNum = function (e) {
        $scope.skin_expire_type = e;
    };
    $scope.buyGift = function (item) {
        var skin_kw = $scope.giftInfo.skin_kw;
        var skin_expire_type = $scope.skin_expire_type;

        socketModule.sendDataCode({
            operation: 'buyTools',
            data: {
                token: globalData.tk,
                skin_kw: skin_kw,
                skin_expire_type: skin_expire_type
            }
        });

    };
    $scope.buySkin = function (spend_num) {
        var skin_kw = $scope.giftInfo.sk;
        $scope.spend_num = spend_num;

        socketModule.sendDataCode({
            operation: 'buySkin',
            data: {
                token: globalData.tk,
                skin_type: $scope.shopSelectType,
                skin_kw: skin_kw,
                skin_expire_type: 0
            }
        });

    };
    $scope.setSkin = function (item) {
        var skin_kw = $scope.giftInfo.sk;

        socketModule.sendDataCode({
            operation: 'setSkin',
            data: {
                token: globalData.tk,
                skin_type: $scope.shopSelectType,
                skin_kw: skin_kw,
            }
        });

    };
    $scope.getGiftBg = function () {
        var that = this;
        var img_url = $('.gift-shop-bg').attr("src");
        var img = new Image();
        img.src = img_url;
        var check = function () {
            if (img.width > 0 || img.height > 0) {
                clearInterval(set);
                // console.log('图片',$('.gift-shop-bg').width(),$('.gift-shop-bg').height());
                $scope.bgH = $('.gift-shop-bg').height();
                $scope.bgW = $('.gift-shop-bg').width();
                $('.giftList').css({
                    width: $scope.bgW * 0.82,
                    height: $scope.bgH * 0.8
                })
            }
        };
        var set = setInterval(check, 40);
    };
    $scope.getGiftItemBg = function () {
        $('.giftList .giftItemBg').each(function () {
            var img_url = $(this).attr("src");
            var img = new Image();
            img.src = img_url;
            var check = function () {
                if (img.width > 0 || img.height > 0) {
                    clearInterval(set);
                    // console.log($('.giftItemBg').width(),$('.giftItemBg').height())
                }
            };
            var set = setInterval(check, 40);
        });
    };
    $scope.getGiftInfoBg = function () {
        var that = this;
        var img_url = $('.giftInfoBg').attr("src");
        var img = new Image();
        img.src = img_url;
        var check = function () {
            if (img.width > 0 || img.height > 0) {
                clearInterval(set);
                var w = $('.giftInfoBg').width();
                var h = $('.giftInfoBg').height();

                $('.giftInfo').css({
                    height: h
                });
            }
        };
        var set = setInterval(check, 40);
    };
    $scope.showGame = function (type) {
        $('#gamePart' + type).removeClass('hide')
        $('.partBack' + type).show();
    };
    $scope.hideGame = function (type) {
        $('#gamePart' + type).addClass('hide')
        $('.partBack' + type).hide();
    };
    $scope.goToApp = function () {

        var url = 'http://' + window.location.host + '/app/index';
        window.location.replace(url);
    };
    $scope.goToYl = function () {
        // window.location.replace(globalData.baseUrl + cr('yl', new Date().getTime()));
        //var url = 'http://' + window.location.host + '/app/yl';
        //window.location.replace(url);
        DynLoading.goto('chat/')
    };
    $scope.goToChat = function () {
        // var url = 'http://' + window.location.host + '/chat/index';
        // window.location.replace(url);
        DynLoading.goto('chat/')
    };
    $scope.goToAgent = function () {
        // var url = 'http://' + window.location.host + '/app/agent';
        // window.location.replace(url);
    };
    $scope.toBindPhone = function () {
        $scope.connectApi(gameSocket.wsApi);

        $scope.isShowTipBindPhone = false;
        $scope.part = 3;
        $scope.clickPhone();
    };
    $scope.hideTipBindPhone = function () {
        $scope.isShowTipBindPhone = false;
    };
    $scope.showApply = function () {
        $scope.member_list = [];
        $scope.isShowApply = true;
        $scope.isMyMange = false;
        $scope.memberListPage = 1;
        socketModule.getClubMemberList()
    };
    $scope.loadMoreClubMemberList = function () {
        $scope.memberListPage++;
        if ($scope.isShowMemberMange) {
            socketModule.gSCML($scope.currentManageClubId);
        } else {
            socketModule.getClubMemberList();
        }
    };
    $scope.hideApply = function () {
        $scope.isShowApply = false;
    };
    $scope.agreeClubMember = function (memberID) {
        socketModule.agreeClubMember(memberID);
    };
    $scope.rejectClubMember = function (memberID) {
        socketModule.rejectClubMember(memberID);
    };
    $scope.blackClubMember = function (memberID) {
        socketModule.blackClubMember(memberID);
    };
    $scope.showGroupMember = function () {

        $scope.isShowClubMember = true;
        // $scope.isMyMange = false;
        // if ($scope.isOpenClub == true) {
        //     $scope.memberListPage=1;
        //     socketModule.getClubMemberList(1)
        // }
        $scope.memberListPage = 1;
        socketModule.getClubMemberList()
    };
    $scope.hideGroupMember = function () {
        $scope.isMyMange = false;
        $scope.isShowClubMember = false;
    };
    $scope.showManageClub = function () {
        socketModule.getClubList();
    },
        $scope.showMyMange = function (e) {
            $scope.member_list = [];
            var my_mange_club_list = $scope.my_mange_club_list;
            if (my_mange_club_list.length == 0) {
                alert('没有可以管理的公会');
                return;
            }
            $scope.myMangeClubInfo = my_mange_club_list[0];
            $scope.isMyMange = true;
            if (e == 'add') {
                $scope.isShowApply = true;
                $scope.isShowClubMember = false;
                socketModule.getClubMemberList()
            } else if (e == 'member') {
                $scope.isShowClubMember = true;
                $scope.isShowApply = false;
                socketModule.getClubMemberList()
            }
        };
    $scope.showMemberSwitchGroup = function () {
        $scope.isShowMemberSwitchGroup = true;
    };
    $scope.hideMemberSwitchGroup = function () {
        $scope.isShowMemberSwitchGroup = false;
    };
    $scope.switchMemberGroup = function (e) {
        $scope.member_list = [];
        socketModule.gSCML(e);
        $scope.isShowMemberSwitchGroup = false;
    };
    $scope.hideDelete = function () {
        $scope.isShowClubMember = false;
        $scope.isShowMemberMange = false;
        $scope.isShowSwitchGroup = false;
        $scope.isMyMange = false;
        $scope.member_list = [];
        $scope.memberListPage = 0;
        $scope.addMember.accountCode = '';
        $scope.addMember.avatar = '';
        $scope.addMember.name = '';
        $scope.hideMemberSwitchGroup();
    };
    $scope.changeMname = function (item) {
        $scope.isShowDelete = true;
        $scope.nowItem = item;
        $scope.nowName = item.n;
        $scope.nowMname = item.r;
        // console.log('nowMname', $scope.nowMname)
    };
    $scope.hideRemark = function () {
        $scope.isShowDelete = false;
        $scope.nowItem = '';
        $scope.nowName = '';
        $scope.nowMname = '';
    };
    $scope.showKickConfirm = function (item) {
        $scope.nowItem = item;
        $scope.isShowKickConfirm = true;
    };
    $scope.hideKickConfirm = function () {
        $scope.isShowKickConfirm = false;
    };
    $scope.changeShowSetting = function (show, item) {
        $scope.nowItem = item;
        $scope.isShowSetting = show;
        $('#manager_sheet').css({'bottom': 0})
    };
    $scope.hideMemberSetting = function () {
        $scope.isShowSetting = false;
    };
    $scope.remark = function () {
        console.log($scope.nowMname)
    };
    $scope.ensureChangeMname = function (nowMname) {
        $scope.nowMname = nowMname;
        socketModule.remarkClubMember();
        $scope.isShowDelete = false;
    };
    $scope.searchAccount = function (id) {
        var isRepeat = repeat('searchAccount');
        if (isRepeat) {
            $scope.showResultFunc('请不要连续点击按钮!');
            return
        }
        $scope.addMember.isShow1 = false;
        $scope.addMember.accountCode = '';
        $scope.addMember.avatar = '';
        $scope.addMember.name = '';
        if ($scope.addMember.code == '') {
            $scope.addMember.isShow1 = true;
            $scope.addMember.text1 = '请输入用户ID';
        } else {
            socketModule.searchAccount(id);
        }
    };
    $scope.searchFlag = function () {
        var isRepeat = repeat('searchFlag');
        if (isRepeat) {
            $scope.showResultFunc('请不要连续点击按钮!');
            return
        }
        $scope.addMember.isShow1 = false;
        $scope.addMember.accountCode = '';
        $scope.addMember.avatar = '';
        $scope.addMember.name = '';
        $scope.addMember.flag = '';
        if ($scope.addMember.code == '') {
            $scope.addMember.isShow1 = true;
            $scope.addMember.text1 = '请输入用户标识';
        } else if ($scope.addMember.code == userData.user_id) {
            $scope.showResultFunc('输入的标识不能与自己的相同')
        } else if ($scope.addMember.code.length != 10) {
            // console.log('请输入正确的用户标识')
            $scope.showResultFunc('请输入正确的用户标识')
        } else {
            $scope.addMember.flag = $scope.addMember.code;
            socketModule.sf();
        }
    };
    $scope.addClubMember = function () {
        var isRepeat = repeat('addClubMember');
        if (isRepeat) {
            $scope.showResultFunc('请不要连续点击按钮!');
            return
        }
        if ($scope.addMember.accountCode == '') {
            $scope.addMember.isShow1 = true;
            $scope.addMember.text1 = '请先输入用户标识并搜索';
            return;
        } else if ($scope.userInfo.account_id == $scope.addMember.accountCode) {
            $scope.showResultFunc('不能添加自己!');
            return
        }
        socketModule.addClubMember();
    };
    $scope.clickSearch = function () {
        $scope.addMember.isShow1 = false;
        $scope.addMember.text1 = '';
        searchMember();
    };
    $scope.showOpenClubConfirm = function () {
        $scope.isShowCreateClub = true;
    };
    $scope.hideOpenClubConfirm = function () {
        $scope.isShowCreateClub = false;
    };
    $scope.showOpenClubConfirm2 = function () {
        $scope.isShowOpenClub = true;
    };
    $scope.hideOpenClubConfirm2 = function () {
        $scope.isShowOpenClub = false;
    };
    $scope.openClub = function () {
        $scope.hideOpenClubConfirm();
        socketModule.openClub();
    };
    $scope.closeClub = function () {
        socketModule.closeClub();
    };
    $scope.hideSendCards = function () {
        $scope.showSendCards = 0;
        $scope.addUser.card = 0;
        $scope.addUser.code = '';
        $scope.addUser.isShow1 = false;
        $scope.addUser.isShow2 = false;
        $scope.addUser.text1 = '';
        $scope.addUser.text2 = '';
        $scope.addUser.accountCode = '';
        $scope.addUser.avatar = '';
    };
    $scope.ShowSendCards = function () {
        $scope.showSendCards = 1;
    };
    $scope.showSendLink = function () {
        httpModule.getLinkNum();
        $scope.isShowSendLink = true;
    };
    $scope.hideSendLink = function () {
        $scope.isShowSendLink = false;
    };
    $scope.showSwitchGroup = function () {
        socketModule.getClubList();
    };
    $scope.hideTipBox = function () {
        $scope.isShowTip = false;
        $scope.tipText = '';
    };
    $scope.hideHallTip = function () {
        $scope.isShowHallTip = false;
        $scope.tipText = '';
    };
    $scope.hideSwitchGroup = function () {
        $scope.isShowSwitchGroup = false;
    };
    $scope.setClubManage = function (id) {
        socketModule.setClubManage(id);
    };
    $scope.cancelClubManage = function (id) {
        socketModule.cancelClubManage(id);
    };
    $scope.delClubMember = function (id) {
        $scope.isShowKickConfirm = false;
        $scope.opMemberId = id;
        console.log('id', id)
        socketModule.delClubMember(id);
    };
    $scope.addClubAccount = function (id) {
        if (!$scope.addClubId || $scope.addClubId.length == 0) {
            $scope.showResultFunc('请输入正确的工会ID!')
            return
        }
        socketModule.addClubAccount($scope.addClubId);
    };
    $scope.clickRefresh = function () {
        var isRepeat = repeat('clickRefresh', 2);
        if (isRepeat) {
            $scope.showResultFunc('请不要连续点击按钮!');
            return
        }
        socketModule.getClubRoomList($scope.club_info.club_id);
    };
    $scope.switchGroup = function (clubId) {
        socketModule.getClubRoomList(clubId);
        $scope.isShowSwitchGroup = false;
    };
    $scope.cardChange = function () {
        if (parseInt($scope.addMember.card) > parseInt(userData.card)) {
            $scope.addMember.card = userData.card
        }
    };
    $scope.searchAccountChange = function () {
        $scope.addMember.accountCode = '';
        $scope.addMember.avatar = '';
        $scope.addMember.name = '';
        $scope.addMember.flag = '';
    };
    $scope.sendCard = function () {
        var isRepeat = repeat('sendCard');
        if (isRepeat) {
            $scope.showResultFunc('请不要连续点击按钮!');
            return
        }
        if ($scope.addMember.card == '' || $scope.addMember.card == null || $scope.addMember.card == 0 || parseInt($scope.addMember.card) > parseInt(userData.card)) {
            $scope.addMember.isShow2 = true;
            $scope.addMember.text2 = '请放入正确房卡数'
            return;
        } else {
            $scope.addMember.isShow2 = false;
        }
        if ($scope.addMember.accountCode == '') {
            $scope.addMember.isShow1 = true;
            $scope.addMember.text1 = '请输入用户ID'
            return;
        } else {
            $scope.addMember.isShow1 = false;
        }

        if ($scope.addMember.accountCode == $scope.userInfo.account_id) {
            $scope.showResultFunc('不能给自己发送房卡!');
            return
        }

        socketModule.sendCards();
    };
    $scope.sendLink = function () {
        var isRepeat = repeat('sendLink');
        if (isRepeat) {
            $scope.showResultFunc('请不要连续点击按钮!');
            return
        }
        if ($scope.addMember.card == '' || $scope.addMember.card == null || $scope.addMember.card == 0 || parseInt($scope.addMember.card) > parseInt(userData.card)) {
            $scope.addMember.isShow2 = true;
            $scope.addMember.text2 = '请放入正确数量'
            return;
        } else {
            $scope.addMember.isShow2 = false;
        }
        if ($scope.addMember.accountCode == '') {
            $scope.addMember.isShow1 = true;
            $scope.addMember.text1 = '请输入用户ID'
            return;
        } else {
            $scope.addMember.isShow1 = false;
        }

        if ($scope.addMember.accountCode == $scope.userInfo.account_id) {
            $scope.showResultFunc('不能给自己发送!');
            return
        }

        httpModule.sendLink();
    };
    $scope.getUserInfo = function () {
        var isRepeat = repeat('getUserInfo');
        if (isRepeat) {
            $scope.showResultFunc('请不要连续点击按钮!');
            return
        }
        if ($scope.addMember.code == '') {
            $scope.addMember.isShow1 = true;
            $scope.addMember.text1 = '请输入用户ID';
        } else if ($scope.addMember.code == userData.account_id) {
            $scope.showResultFunc('输入的ID不能与自己的相同')
        } else {
            $scope.addMember.isShow1 = false;
            socketModule.searchAccount();
        }
    };
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
    $scope.changeAvatar = function () {

    };
    $scope.goToPocket = function () {
        //window.location.replace(globalData.baseUrl + cr2('mp'));
        DynLoading.goto('package');
    };
    $scope.toInvite = function () {
        //window.location.replace(globalData.baseUrl + cr2('ic', userData.account_id));
        DynLoading.goto('inviteDetail', 'inviteCode=' + userData.userCode);
    };
    $scope.goTable = function () {
        $scope.partChange(1);
        $scope.cancelCreate();
        $scope.isShowAlert = false;
    };
    $scope.openShowAddMember = function (type) {
        $scope.addMember.accountCode = '';
        $scope.addMember.avatar = '';
        $scope.addMember.name = '';
        $scope.addMember.code = '';
        $scope.addMember.remark = '';
        $scope.addMember.text1 = '';
        $scope.addMember.text2 = '';
        $scope.addMember.flag = '';

        // $scope.isShowMemberMange = false;
        $scope.chooseClub = '';
        $scope.addMember.isShow = true;
    };
    $scope.hideAddMember = function () {
        $scope.addMember.isShow = false;
        $scope.addMember.accountCode = '';
        $scope.addMember.avatar = '';
        $scope.addMember.name = '';
        $scope.addMember.code = '';
        $scope.addMember.remark = '';
    };
    $scope.openShowSearchMember = function (type) {
        $scope.addMember.accountCode = '';
        $scope.addMember.avatar = '';
        $scope.addMember.name = '';
        $scope.addMember.code = '';
        $scope.addMember.remark = '';
        $scope.addMember.text1 = '';
        $scope.addMember.text2 = '';
        $scope.addMember.flag = '';

        $scope.chooseClub = '';
        $scope.isShowSearch = true;
    };
    $scope.hideSearchMember = function () {
        $scope.isShowSearch = false;
        $scope.addMember.accountCode = '';
        $scope.addMember.avatar = '';
        $scope.addMember.name = '';
        $scope.addMember.code = '';
        $scope.addMember.remark = '';
    };
    $scope.clickSearchMember = function () {
        if ($scope.addMember.code == userData.account_id) {
            $scope.showResultFunc('不能搜索自己');
            return
        }
        socketModule.seacrhClubMember();
    };
    $scope.getMemberInfo = function () {

    };
    $scope.confirmAddMember = function () {

    };
    $scope.gotoPackageRecord = function () {
        //window.location.replace(globalData.baseUrl + cr('pl', new Date().getTime()));
        DynLoading.goto('packageRecord');
    };
    $scope.logout = function () {
        // return
        localStorage.clear();
        //var url = globalData.baseUrl + "site/lout";
        //window.location.replace(url);
        DynLoading.goto('logout');
    };
    $scope.clickShowAlert = function (type, text) {
        $scope.alertType = type;
        $scope.alertText = text;
        $scope.isShowAlert = true;
        setTimeout(function () {
            var alertHeight = $(".alertText").height();
            var textHeight = alertHeight;
            if (alertHeight < height * 0.15) {
                alertHeight = height * 0.15;
            }

            if (alertHeight > height * 0.8) {
                alertHeight = height * 0.8;
            }

            var mainHeight = alertHeight + height * (0.022 + 0.034) * 2 + height * 0.022 + height * 0.056;
            if (type == 8) {
                mainHeight = mainHeight - height * 0.022 - height * 0.056
            }

            var blackHeight = alertHeight + height * 0.034 * 2;
            var alertTop = height * 0.022 + (blackHeight - textHeight) / 2;

            $(".alert .mainPart").css('height', mainHeight + 'px');
            $(".alert .mainPart").css('margin-top', '-' + mainHeight / 2 + 'px');
            $(".alert .mainPart .backImg .blackImg").css('height', blackHeight + 'px');
            $(".alert .mainPart .alertText").css('top', alertTop + 'px');
        }, 0);
    };
    $scope.clickCloseAlert = function () {
        $scope.isShowAlert = false;
        if ($scope.alertType == 1) {
            $scope.clickShowShop();
            if (!$scope.is_connect) {
                $scope.connectApi();
                $scope.is_connect = true;
            }
        }
    };
    $scope.clickShowShop = function () {
        window.location.href = "http://mp.weixin.qq.com/s/qLDZfj1KtJCzRIe04zwSwA";
    };
    $scope.clickHideShop = function () {
        $(".shop .shopBody").animate({
            height: 0
        }, function () {
            $scope.isShowShop = false;
        });
    };
    $scope.selectCard = function (num, count) {
        $scope.select = num;
        $scope.ticket_count = count;
    };
    $scope.showMessage = function () {
        $(".message .textPart").animate({
            height: "400px"
        });
        $scope.isShowMessage = true;
    };
    $scope.hideMessage = function () {
        $(".message .textPart").animate({
            height: 0
        }, function () {
            $scope.isShowMessage = false;
        });
    };
    $scope.confirmChangeClubName = function (name) {
        var isRepeat = repeat('confirmChangeClubName');
        if (isRepeat) {
            $scope.showResultFunc('请不要连续点击按钮!');
            return
        }
        $scope.new_club_name = name;
        if ($scope.new_club_name == '') {
            $scope.showResultFunc('公会名称不能为空');
            return
        }
        if ($scope.new_club_name.length > 8) {
            $scope.showResultFunc('公会名称过长');
            return
        }
        socketModule.updateClub()
    };

    //去游戏战绩页面
    $scope.toGameScore = function () {
        //window.location.replace(globalData.baseUrl + cr('pc', new Date().getTime()));
        DynLoading.goto('roomListPlay');
    };

    $scope.clickRedpackageRecord = function () {
        //window.location.replace(globalData.baseUrl + cr('pl', new Date().getTime()));
        DynLoading.goto('package');
    };
    $scope.findPhoneAccount = function () {
        $scope.phoneText = '绑定手机';
        $scope.phoneType = 1;
        $scope.authcodeTime = 0;
        $scope.authcodeText = '发送验证码';
        $scope.authcodeType = 1;
        $scope.isAuthPhone = 1;
        $scope.showFeature_find = true;
        $scope.showFeature = false
    };
    $scope.toTransfer = function () {
        // var url = globalData.baseUrl + cr('tp', new Date().getTime());
        // // console.log(url)
        // window.location.replace(url);
        DynLoading.goto('phoneUsers');
    };
    $scope.clickMyRoom = function () {
        DynLoading.goto('roomList');
    };
    $scope.changeStartDate = function () {
        logMessage('start date：' + $scope.startDate);
        var date = new Date($scope.startDate);
        var timestamp = convertTimestamp(date);

        logMessage(timestamp);
        logMessage(dtEndTimestamp);
        if (timestamp > dtEndTimestamp) {
            $scope.startDate = dtStartDate;
            return;
        } else {
            dtStartDate = $scope.startDate;
            dtStartTimestamp = timestamp;

        }
    };
    $scope.clickInvite = function () {
        window.location.replace(globalData.baseUrl + "manage/invite?code=" + muserData.userCode);
    };
    $scope.changeGuideNameFunc = function () {
        $scope.showChangeGuideName = true;
        $scope.guideName = userData.guideName;
    };
    $scope.hidechangeGuideName = function () {
        $scope.showChangeGuideName = false;
        $scope.guideName = userData.guideName;
    };
    $scope.openShowSendCards = function () {
        $scope.showSendCards = 1;
        $scope.addMember.accountCode = '';
        $scope.addMember.avatar = '';
        $scope.addMember.name = '';
        $scope.addMember.code = '';
        $scope.addMember.remark = '';
        $scope.addMember.text1 = '';
        $scope.addMember.text2 = '';
        $scope.addMember.flag = '';
    };
    $scope.closeShowSendCards = function () {
        $scope.showSendCards = 0;
    };
    $scope.clickPhone = function () {
        $scope.phoneText = '绑定手机';
        $scope.phoneType = 1;
        $scope.authcodeTime = 0;
        $scope.authcodeText = '发送验证码';
        $scope.authcodeType = 1;
        $scope.isShowBindPhone = true;
    };
    $scope.setPassword = function () {
        if ($scope.userInfo.phone == '') {
            $scope.showResultFunc('请先绑定手机');
            return;
        }
        $scope.setPassword_show = true;
        $scope.showFeature = false;
        $("#app-main").css({"overflow": "visible", "height": "auto"});
    };
    $scope.setPassword_close = function () {
        $scope.setPassword_show = false;
    };
    $scope.setPassword_btn = function () {
        var isRepeat = repeat('setPassword_btn');
        if (isRepeat) {
            $scope.showResultFunc('请不要连续点击按钮!');
            return
        }

        if ($scope.password == null || $scope.password.length < 6 || $scope.password == '') {
            $scope.showResultFunc('密码不能少于6位数');
            return;
        }
        var reg = new RegExp(/^(?![^a-zA-Z]+$)(?!\D+$)/);
        if (!reg.test($scope.password)) {
            $scope.showResultFunc('密码必须含有英文加数字');
            return;
        }
        socketModule.setPassword();
    };
    $scope.hideBindPhone = function () {
        $scope.isShowBindPhone = false;
        $scope.showFeature_find = false;
        $scope.sPhone = '';
        $scope.password = '';
        $scope.passwordR = '';
        $scope.sAuthcode = '';
    };
    $scope.hideMyCode = function () {
        $scope.isShowMyCode = false;
    };
    $scope.hideMyAccount = function () {
        $scope.isShowMyAccount = false;
    };
    $scope.clickEditPhone = function () {
        $scope.phoneText = '修改手机号';
        if (userData.password == "") {
            $scope.phoneText = '设置密钥';
        }
        $scope.phoneType = 2;
        $scope.authcodeTime = 0;
        $scope.authcodeText = '发送验证码';
        $scope.authcodeType = 1;
        $scope.isShowBindPhone = true;
    };
    $scope.getAuthcode = function () {
        var isRepeat = repeat('getAuthcode');
        if (isRepeat) {
            $scope.showResultFunc('请不要连续点击按钮!');
            return
        }
        if ($scope.authcodeType != 1) {
            return;
        }

        var validPhone = checkPhone($scope.sPhone);

        if (validPhone == false) {
            $scope.showResultFunc('手机号码有误，请重填!');
            return;
        }
        socketModule.getMobileSms();
    };
    $scope.phoneChangeValue = function () {
        // var result = checkPhone($scope.sPhone);
        // if (result) {
        //     $('#authcode').css('background-color', 'rgb(64,112,251)');
        // } else {
        //     $('#authcode').css('background-color', 'lightgray');
        // }
    };
    $scope.finishBindPhone = function () {
        var url = window.location.href + "&id=" + 10000 * Math.random();
        window.location.replace(url);
    };
    $scope.quitClub = function (item) {
        $scope.op_club_id = item.id;
        var text = '是否退出【' + item.n + '】公会？';
        $scope.showAlert(768, text);
    };
    $scope.hideQuitConfirm = function () {
        $scope.isShowQuitConfirm = false;
    };
    $scope.confirmQuitTeam = function () {
        $scope.isShowAlert = 0;
        $scope.isShowSwitchGroup = false;
        $scope.isShowQuitConfirm = false;
        socketModule.quitClub($scope.op_club_id);
    };
    $scope.toMyClub = function () {
        $scope.part = 3;
        $scope.showGroupMember();
    };
    $scope.deleteGame = function () {
        var text = '是否确认删除' + $scope.alertText + '?';

        $scope.showAlert(767, text)
    };
    $scope.hideDeleteGame = function () {
        $scope.quitTipText = '';
        $scope.isShowDeleteGame = false
    };
    $scope.cancelAuto = function () {
        $scope.isShowAlert = false;
        socketModule.cancelAutoRoom()
    };
    $scope.confirmDeleteGame = function (type, roomId) {
        $scope.closeAlert();
        socketModule.overGame(type, roomId);
    };
    $scope.joinRoom = function (item) {

        console.log("joinRoom:", item);
        var name = '';
        var text = '';

        $scope.alertText = '房间: ' + item.room_number;
        $scope.gameType = item.game_type;
        $scope.room_number = item.room_number;
        $scope.max_count = item.max_count;
        //$scope.alertText = text;
        $scope.func = item.func;
        $scope.auto = item.auto;
        $scope.room_id = item.room_id;
        $scope.isShowAlert = true;
    };
    $scope.joinRoomYh = function (item) {
        var text = '';

        if (item.max_count != '') {
            text = item.room_number + '号' + item.max_count + '人' + item.game_name + '房间';
        } else {
            text = item.room_number + '号' + item.game_name + '房间';
        }
        $scope.gameType = item.game_type;
        $scope.room_number = item.room_number;
        $scope.max_count = item.max_count;
        $scope.room_id = item.room_id;
        $scope.alertText = text;
        $scope.func = item.func;
        $scope.auto = item.auto;

        if ($scope.club_info.is_self == 1 || $scope.level == 2) {
            $scope.showAlert(766, text);
        } else {
            $scope.joinGame($scope.gameType, $scope.room_number, $scope.max_count);
        }

    };
    $scope.hideJoinRoom = function () {
        $scope.isShowAlert = false;
    };
    $scope.joinGame = function (game_type, room_number, max_count) {
        var url = Htmls.getRoomUrl(game_type, max_count, room_number);
        window.location.replace(url);
    };
    $scope.createWait = function () {
        $scope.showResultFunc('敬请期待')
        return
    };
    $scope.cancelCreate = function () {
        $scope.createInfo.isShow = 0;
        $('.main').css({'overflow': 'visible', 'position': 'static', 'top': '0'});
        // $('#copy_btn').show();
        $(".createRoom .mainPart").removeClass('yh');
    };
    $scope.copyClubUrl = function () {
        var input = ''
        var other_op_id = $scope.GetQueryString('club');
        if (other_op_id) {
            input = $scope.my_club_info.club_name + '的公会:' + globalData.baseUrl + '?club=' + other_op_id;
        } else {
            input = $scope.my_club_info.club_name + '的公会:' + globalData.baseUrl + '?club=' + $scope.userInfo.account_id;
        }
        var el = document.createElement("textarea");
        el.value = input;
        el.setAttribute("readonly", "");
        el.style.contain = "strict";
        el.style.position = "absolute";
        el.style.left = "-9999px";
        el.style.fontSize = "12pt"; // Prevent zooming on iOS

        var selection = window.getSelection();
        var originalRange = false;
        if (selection.rangeCount > 0) {
            originalRange = selection.getRangeAt(0);
        }
        document.body.appendChild(el);
        el.select();
        el.selectionStart = 0;
        el.selectionEnd = input.length;
        var success = false;
        try {
            success = document.execCommand("copy");
        } catch (err) {
        }

        document.body.removeChild(el);
        if (originalRange) {
            selection.removeAllRanges();
            selection.addRange(originalRange);
        }

        $scope.showResultFunc('复制成功');

        return success;
    };
    $scope.copyLinkUrl = function () {
        localStorage.setItem('linkTips', 1);

        var line1 = $scope.userInfo.nickname + " | " + globalData.hallName + '专属链接:';
        var line2;
        if (globalData.master_url.indexOf("http://") == -1 && globalData.master_url.indexOf("https://") == -1) {
            line2 = 'http://' + globalData.master_url;
        }
        var line3 = globalData.hallName + '备用链接:';
        var line4;
        if (globalData.backup_url.indexOf("http://") == -1 && globalData.backup_url.indexOf("https://") == -1) {
            line4 = 'http://' + globalData.backup_url;
        }
        var input = line1 + "\n" + line2 + "\n" + "\n" + line3 + "\n" + line4;
        var el = document.createElement("textarea");
        el.value = input;
        el.setAttribute("readonly", "");
        el.style.contain = "strict";
        el.style.position = "absolute";
        el.style.left = "-9999px";
        el.style.fontSize = "12pt"; // Prevent zooming on iOS

        var selection = window.getSelection();
        var originalRange = false;
        if (selection.rangeCount > 0) {
            originalRange = selection.getRangeAt(0);
        }
        document.body.appendChild(el);
        el.select();
        el.selectionStart = 0;
        el.selectionEnd = input.length;
        var success = false;
        try {
            success = document.execCommand("copy");
        } catch (err) {
        }

        document.body.removeChild(el);
        if (originalRange) {
            selection.removeAllRanges();
            selection.addRange(originalRange);
        }

        $scope.showResultFunc('复制成功');

        return success;
    };
    $scope.copyRoomUrl = function (item) {
        var copyTitle = globalData.hallName + ':' + item.rn + '\n' +
            '房间：' + item.c + '人' + item.name + ', 底分：' + item.ds + ', 局数：' + item.tn;
        url = copyTitle + '\n' + globalData.baseUrl + cgr('ga', item.rn, item.gt, item.c);

        var el = document.createElement("textarea");
        el.value = url;
        el.setAttribute("readonly", "");
        el.style.contain = "strict";
        el.style.position = "absolute";
        el.style.left = "-9999px";
        el.style.fontSize = "12pt"; // Prevent zooming on iOS

        var selection = window.getSelection();
        var originalRange = false;
        if (selection.rangeCount > 0) {
            originalRange = selection.getRangeAt(0);
        }
        document.body.appendChild(el);
        el.select();
        el.selectionStart = 0;
        el.selectionEnd = url.length;
        var success = false;
        try {
            success = document.execCommand("copy");
        } catch (err) {
        }

        document.body.removeChild(el);
        if (originalRange) {
            selection.removeAllRanges();
            selection.addRange(originalRange);
        }

        $scope.showResultFunc('复制成功');

        return success;

    };
    $scope.copyUrl = function () {
        url = globalData.hallName + ':' + globalData.baseUrl;

        var el = document.createElement("textarea");
        el.value = url;
        el.setAttribute("readonly", "");
        el.style.contain = "strict";
        el.style.position = "absolute";
        el.style.left = "-9999px";
        el.style.fontSize = "12pt"; // Prevent zooming on iOS

        var selection = window.getSelection();
        var originalRange = false;
        if (selection.rangeCount > 0) {
            originalRange = selection.getRangeAt(0);
        }
        document.body.appendChild(el);
        el.select();
        el.selectionStart = 0;
        el.selectionEnd = url.length;
        var success = false;
        try {
            success = document.execCommand("copy");
        } catch (err) {
        }

        document.body.removeChild(el);
        if (originalRange) {
            selection.removeAllRanges();
            selection.addRange(originalRange);
        }

        $scope.showResultFunc('复制成功');

        return success;

    };
    $scope.copyOtherGameUrl = function (url) {
        url = globalData.hallName + ': ' + $scope.max_count_title + '(房间:' + $scope.room_number + ')' + '\n' + url;

        var el = document.createElement("textarea");
        el.value = url;
        el.setAttribute("readonly", "");
        el.style.contain = "strict";
        el.style.position = "absolute";
        el.style.left = "-9999px";
        el.style.fontSize = "12pt"; // Prevent zooming on iOS

        var selection = window.getSelection();
        var originalRange = false;
        if (selection.rangeCount > 0) {
            originalRange = selection.getRangeAt(0);
        }
        document.body.appendChild(el);
        el.select();
        el.selectionStart = 0;
        el.selectionEnd = url.length;
        var success = false;
        try {
            success = document.execCommand("copy");
        } catch (err) {
        }

        document.body.removeChild(el);
        if (originalRange) {
            selection.removeAllRanges();
            selection.addRange(originalRange);
        }

        $scope.showResultFunc('复制成功');

        return success;

    };
    $scope.copyId = function (id) {
        // var content = item.lsText;
         const input = document.createElement('input')
        input.setAttribute('readonly', 'readonly')
        input.setAttribute('value', id)
        document.body.appendChild(input)
        input.setSelectionRange(0, 9999)
        input.select()
        if (document.execCommand('Copy')) {
             $scope.showResultFunc('复制成功');
        }
        document.body.removeChild(input)
        return success;
    };

})

function randomString(len) {
    len = len || 32;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var maxPos = $chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}


function fix_font() {
    var u = navigator.userAgent, app = navigator.appVersion;
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //g
    var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    if (isAndroid) {
        //这个是安卓操作系统
        console.log('an');
    }
    if (isIOS) {
        //这个是ios操作系统
        console.log('ios');
        $('.selectPart').addClass('font_big');
    }
}

fix_font();



