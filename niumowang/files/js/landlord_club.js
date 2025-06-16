var ws;
var game = {
    "room": 0,
    "room_number": globalData.roomNumber,
    "room_url": 0,
    "score": 0,
    "status": 0,
    "time": -1,
    "round": 0,
    "total_num": "",
    "current_card_user": 0,
    "is_play": false,
    "multiple": 1,
    "cardText": "",
    "current_card": [],
    "landlord_card": [],
    is_break: false,
    maxWin: 0,
};

var message = [
    {"num": 0, "text": "快点吧，我等到花儿也谢了"},
    {"num": 1, "text": "我出去叫人"},
    {"num": 2, "text": "你的牌好靓哇"},
    {"num": 3, "text": "我当年横扫澳门九条街"},
    {"num": 4, "text": "算你牛逼"},
    {"num": 5, "text": "别吹牛逼，有本事干到底"},
    {"num": 6, "text": "输得裤衩都没了"},
    {"num": 7, "text": "我给你们送温暖了"},
    {"num": 8, "text": "谢谢老板"},
    {"num": 9, "text": "我来啦，让你们久等了"},
    {"num": 10, "text": "我出去一下，马上回来，等我哦"},
    {"num": 11, "text": "怎么断线了，网络太差了"},
    {"num": 12, "text": "搏一搏，单车变摩托"}
];

var wsOperation = {
    JoinRoom: "JoinRoom",
    ReadyStart: "ReadyStart",
    PrepareJoinRoom: "PrepareJoinRoom",
    AllGamerInfo: "AllGamerInfo",
    UpdateGamerInfo: "UpdateGamerInfo",
    UpdateAccountStatus: "UpdateAccountStatus",
    StartLimitTime: "StartLimitTime",
    CancelStartLimitTime: "CancelStartLimitTime",
    GameStart: "GameStart",
    NotyChooseChip: "NotyChooseChip",
    PkCard: "PkCard",
    UpdateAccountScore: "UpdateAccountScore",
    OpenCard: "OpenCard",
    Win: "Win",
    Discard: "Discard",
    BroadcastVoice: "BroadcastVoice",
    ClickToLook: "ClickToLook",
    ChooseChip: "ChooseChip",
    GrabBanker: "GrabBanker",
    PlayerMultiples: "PlayerMultiples",
    ShowCard: "ShowCard",
    UpdateAccountShow: "UpdateAccountShow",
    UpdateAccountMultiples: "UpdateAccountMultiples",
    StartBet: "StartBet",
    StartShow: "StartShow",
    RefreshRoom: "PullRoomInfo",
    ActiveRoom: "ActivateRoom",
    HistoryScoreboard: "HistoryScoreboard",
    ChooseCard: "ChooseCard",
    NotyAskLandlord: "NotyAskLandlord",
    LandlordCard: "LandlordCard",
    NotyChooseCard: "NotyChooseCard",
    ThrowOutCard: "ThrowOutCard",
    MyCard: "MyCard",
    UpdateMultiple: "UpdateMultiple",
    BreakRoom: "BreakRoom",
    AskLandlord: "AskLandlord",
};

var httpModule = {
    getInfo: function () {
        reconnectSocket();
        appData.is_connect = true;
    },
    applyClub: function () {
        var postData = {
            room_number: globalData.roomNumber,
            token: globalData.tk
        };
        $.ajax({
            type: "POST",
            url: BaseUrl + '/clubapi/joinclub',
            data: postData,
            async: false,
            success: function (data) {
                var _data = JSON.parse(data);
                if (_data.code == 1) {
                    appData.applyInfo.status = '已发送申请';
                } else {
                    appData.applyInfo.status = '申请失败';
                }
            },
            error: function (jqXHR) {
                console.log("Error: " + jqXHR.status);
            }
        });
    },
};

var socketModule = {
    closeSocket: function () {
        if (ws) {
            try {
                ws.close();
            } catch (error) {
                console.log(error);
            }
        }
    },
    sendData: function (obj) {
        try {
            console.log('websocket state1：' + ws.readyState);
            if (ws.readyState == WebSocket.CLOSED) {
                //socket关闭，重新连接
                reconnectSocket();
                return;
            }

            if (ws.readyState == WebSocket.OPEN) {
                ws.send(JSON.stringify(obj));
            } else if (ws.readyState == WebSocket.CONNECTING) {
                //如果还在连接中，1秒后重新发送请求
                setTimeout(function () {
                    socketModule.sendData(obj);
                }, 10000);
            } else {
                console.log('websocket state：' + ws.readyState);
            }

        } catch (err) {
            console.log(err);
        }
    },
    gAI: function () {
        socketModule.sendData({
            operation: "getAccountInfo",
            data: {
                token: globalData.tk
            }
        });
    },
    pGAI: function (obj) {
        var userData = viewMethods.setUserData(obj.data);
        setC('userData', userData);
    },
    gAC: function () {
        socketModule.sendData({
            operation: "getAccountCard",
            data: {
                token: globalData.tk
            }
        });
    },
    pGAC: function (obj) {
        userData.card = obj.data;
        appData.userData.card = obj.data;
    },
    setIndividuality: function () {
        socketModule.sendData({
            operation: "setIndividuality",
            data: {
                token: globalData.tk,
                individuality: appData.inputIndiv
            }
        });
    },
    processSetIndividuality: function (obj) {
        if (globalData.p_type == 2) {
            appData.isShowIndivConfirm = false;
        } else {
            appData.isShowIndiv = false;
        }
        userData.individuality = appData.inputIndiv;
        viewMethods.showResultTextFunc('设置成功');
        delC('userData');
    },
    sendPrepareJoinRoom: function () {
        socketModule.sendData({
            operation: wsOperation.PrepareJoinRoom,
            data: {
                room_number: globalData.roomNumber,
                token: globalData.tk
            }
        });
    },
    sendJoinRoom: function () {
        socketModule.sendData({
            operation: wsOperation.JoinRoom,
            data: {
                room_number: globalData.roomNumber,
                token: globalData.tk
            }
        });
    },
    sendRefreshRoom: function () {
        socketModule.sendData({
            operation: wsOperation.RefreshRoom,
            data: {
                room_id: appData.game.room,
                token: globalData.tk
            }
        });
    },
    sendReadyStart: function () {
        socketModule.sendData({
            operation: wsOperation.ReadyStart,
            data: {
                room_id: appData.game.room,
                token: globalData.tk
            }
        });
    },
    sendAskLandlord: function (num, type) {
        socketModule.sendData({
            operation: wsOperation.AskLandlord,
            data: {
                room_id: appData.game.room,
                become: num,
                token: globalData.tk
            }
        });
    },
    sendChooseCard: function (card) {
        socketModule.sendData({
            operation: wsOperation.ChooseCard,
            data: {
                room_id: appData.game.room,
                card: card.toString(),
                token: globalData.tk
            }
        });
    },
    sendBroadcastVoice: function (num) {
        socketModule.sendData({
            operation: wsOperation.BroadcastVoice,
            data: {
                room_id: appData.game.room,
                voice_num: num,
                token: globalData.tk
            }
        });
    },
    processBalanceScoreboard: function (e) {
        var t = new Date(parseInt(e.time) * 1000);
        var a = t.getFullYear() + "-";
        var n = t.getMonth() + 1 + "-";
        var r = t.getDate() + " ";
        var o = t.getHours();
        var i = t.getMinutes();
        var c = ":";
        if (i < 10)
            c += 0;
        var l = a + n + r + o + c + i;
        appData.playerBoard.round = e.game_num;
        appData.playerBoard.record = l;
        appData.playerBoard.score = [];
        var u = e.scoreboard;
        for (s in u) {
            var p = 0;
            var d = u[s].name;
            if (userData.account_id == u[s].account_id) {
                p = 1;
            }
            appData.playerBoard.score.push({
                "account_id": u[s].account_id,
                "nickname": name,
                "account_score": Math.ceil(u[s].score),
                "num": p,
                "avatar": u[s].avatar
            });
        }
    },
    processLastScoreboard: function (obj) {
        if (obj == undefined) {
            return;
        }

        console.log(obj);
        try {
            var data = new Date(parseInt(obj.time) * 1000);
            var N = data.getFullYear() + "-";
            var Y = data.getMonth() + 1 + "-";
            var R = data.getDate() + " ";
            var H = data.getHours();
            var M = data.getMinutes();
            var Z = ":";
            if (M < 10)
                Z = Z + 0;
            var str = N + Y + R + H + Z + M;

            appData.playerBoard.round = obj.game_num;
            // appData.playerBoard.record = str + " 前" + appData.playerBoard.round + "局";
            appData.playerBoard.record = str;
            appData.playerBoard.score = [];

            if (obj.total_num != undefined && obj.total_num != null && obj.total_num != '') {
                appData.game.total_num = obj.total_num;
            }

            var scores = obj.scoreboard;
            for (s in scores) {
                var num = 0;
                if (userData.accountId == scores[s].account_id) {
                    num = 1;
                }

                appData.playerBoard.score.push({
                    "account_id": scores[s].account_id,
                    "nickname": scores[s].name,
                    "account_score": Math.ceil(scores[s].score),
                    "num": num,
                    "avatar": scores[s].avatar
                });
            }

            chooseBigWinner();
            $(".ranking .rankBack").css("opacity", "1");
            $(".roundEndShow").show();

            $(".ranking").show();
            canvas();
            $('#endCreateRoomBtn').show();
        } catch (error) {
            console.log(error);
        }
    },
    processPrepareJoinRoom: function (obj) {
        if (obj.data.is_club) {
            if (obj.data.is_club == 1) {
                // viewMethods.clickShowAlert(1, '无法加入，请联系管理员');
                appData.isShowApply = true;
                appData.applyInfo.club_headimgurl = obj.data.club_headimgurl;
                appData.applyInfo.club_name = obj.data.club_name;
                appData.applyInfo.club_id = obj.data.room_creator;
                return;
            }
        }
        appData.rullInfo.ask_mode = Math.ceil(obj.data.ask_mode);
        appData.rullInfo.ticket_count = Math.ceil(obj.data.ticket_count);
        appData.rullInfo.base_score = Math.ceil(obj.data.base_score);

        appData.game.status = obj.data.room_status;

        if (obj.data.room_status == 4) {
            appData.roomStatus = obj.data.room_status;
            viewMethods.roundEnd();
            // viewMethods.showAlert(2, obj.result_message);
            return;
        } else {
            if (obj.data.user_count == 0) {
                socketModule.sendJoinRoom();
            } else {
                if (obj.data.alert_text != "") {
                    viewMethods.showAlert(4, obj.data.alert_text);
                } else {
                    socketModule.sendJoinRoom();
                }
            }
        }

        viewMethods.screen();
    },
    processJoinRoom: function (obj) {
        appData.cardList = new Array();
        appData.player = [];
        appData.playerBoard = {
            "score": [],
            "round": 0,
            "record": "",
        };
        appData.recordList = [];

        for (var i = 0; i < 3; i++) {
            appData.player.push({
                "num": i + 1,
                "serial_num": i + 1,
                "account_id": 0,
                "account_status": 0,
                "playing_status": 0,
                "online_status": 0,
                "nickname": "",
                "headimgurl": "",
                "account_score": 0,
                "is_win": false,
                "limit_time": 0,
                "is_operation": false,
                "messageOn": false,
                "messageText": "我们来血拼吧",
                "cardsNum": 0,
                "tempCards": 0,
                "cards": [],
                "tips": [],
                "tipsNum": -1,
                "ticket_checked": 0,
            })
            appData.playerBoard.score.push({
                "account_id": 0,
                "nickname": "",
                "account_score": 0,
            })
        }

        appData.game.room = obj.data.room_id;
        appData.game.room_url = obj.data.room_url;
        appData.game.round = Math.ceil(obj.data.game_num);
        appData.game.total_num = Math.ceil(obj.data.total_num);
        appData.game.landlord_card = obj.data.landlord_card.concat();
        appData.game.current_card = obj.data.current_card.concat();
        appData.game.multiple = obj.data.multiple;
        appData.game.countdown = Math.ceil(obj.data.countdown);
        appData.player[0].serial_num = obj.data.serial_num;

        for (var i = 0; i < 3; i++) {
            if (i <= 3 - obj.data.serial_num) {
                appData.player[i].serial_num = i + Math.ceil(obj.data.serial_num);
            } else {
                appData.player[i].serial_num = i + Math.ceil(obj.data.serial_num) - 3;
            }
        }

        appData.player[0].account_status = Math.ceil(obj.data.account_status);
        appData.player[0].account_score = Math.ceil(obj.data.account_score);
        appData.player[0].nickname = userData.nickname;
        appData.player[0].headimgurl = userData.headimgurl;
        appData.player[0].account_id = userData.account_id;
        appData.player[0].card = obj.data.my_card.concat();

        appData.game.status = Math.ceil(obj.data.room_status);

        for (var i = 0; i < obj.data.my_card.length; i++) {
            appData.cardList.push({
                "card": obj.data.my_card[i],
                "num": i,
                "isSelect": false,
                "isChoose": false,
                "z_index": i
            });
        }
        if (obj.data.my_card.length > 0) {
            appData.cardNumShow = 0;
        }

        if (obj.data.landlord_card.length == 3) {
            viewMethods.cardOver();
        }

        appData.game.current_card = obj.data.current_card.concat();
        appData.game.current_card_user = Math.ceil(obj.data.current_card_user);
        appData.scoreboard = obj.data.scoreboard;
        appData.game.score_summary = obj.data.score_summary;
        appData.player[0].ticket_checked = obj.data.ticket_checked;
    },
    processRefreshRoom: function (obj) {
        appData.game.multiple = Math.ceil(obj.data.multiple);
        appData.game.base_score = Math.ceil(obj.data.base_score);
        appData.game.landlord_card = obj.data.landlord_card.concat();
        appData.game.current_card = obj.data.current_card.concat();
        appData.game.current_card = obj.data.current_card.concat();
        appData.game.current_card_user = Math.ceil(obj.data.current_card_user);
        appData.cardList = new Array();
        appData.player = [];
        appData.playerBoard = {
            "score": [],
            "round": 0,
            "record": "",
        }

        for (var i = 0; i < 3; i++) {
            appData.player.push({
                "num": i + 1,
                "serial_num": i + 1,
                "account_id": 0,
                "account_status": 0,
                "playing_status": 0,
                "online_status": 0,
                "nickname": "",
                "headimgurl": "",
                "account_score": 0,
                "is_win": false,
                "limit_time": 0,
                "is_operation": false,
                "messageOn": false,
                "messageText": "我们来血拼吧",
                "cardsNum": 0,
                "tempCards": 0,
                "cards": [],
                "tips": [],
                "tipsNum": -1,
                "ticket_checked": 0,
            })
            appData.playerBoard.score.push({
                "account_id": 0,
                "nickname": "",
                "account_score": 0,
            })
        }

        for (var i = 0; i < obj.data.my_card.length; i++) {
            appData.cardList.push({
                "card": obj.data.my_card[i],
                "num": i,
                "isSelect": false,
                "isChoose": false,
                "z_index": i
            });
        }

        if (obj.data.my_card.length > 0) {
            appData.cardNumShow = 0;
        }

        for (var i = 0; i < appData.player.length; i++) {
            if (i <= appData.player.length - Math.ceil(obj.data.serial_num)) {
                appData.player[i].serial_num = i + Math.ceil(obj.data.serial_num);
            } else {
                appData.player[i].serial_num = i + Math.ceil(obj.data.serial_num) - appData.player.length;
            }
        }

        for (var i = 0; i < appData.player.length; i++) {
            for (var j = 0; j < obj.all_gamer_info.length; j++) {
                if (appData.player[i].serial_num == obj.all_gamer_info[j].serial_num) {
                    appData.player[i].nickname = obj.all_gamer_info[j].nickname;
                    appData.player[i].headimgurl = obj.all_gamer_info[j].headimgurl;
                    appData.player[i].account_id = obj.all_gamer_info[j].account_id;
                    appData.player[i].account_score = Math.ceil(obj.all_gamer_info[j].account_score);
                    appData.player[i].account_status = Math.ceil(obj.all_gamer_info[j].account_status);
                    appData.player[i].online_status = Math.ceil(obj.all_gamer_info[j].online_status);
                    appData.player[i].ticket_checked = obj.all_gamer_info[j].ticket_checked;
                    appData.player[i].cardsNum = Math.ceil(obj.all_gamer_info[j].card_count);
                }
            }
        }
    },
    processAllGamerInfo: function (obj) {
        for (var i = 0; i < appData.player.length; i++) {
            for (var j = 0; j < obj.data.length; j++) {
                if (appData.player[i].serial_num == obj.data[j].serial_num) {
                    appData.player[i].nickname = obj.data[j].nickname;
                    appData.player[i].headimgurl = obj.data[j].headimgurl;
                    appData.player[i].account_id = obj.data[j].account_id;
                    appData.player[i].playing_status = 1;
                    appData.player[i].account_score = Math.ceil(obj.data[j].account_score);
                    appData.player[i].account_status = Math.ceil(obj.data[j].account_status);
                    appData.player[i].online_status = Math.ceil(obj.data[j].online_status);
                    appData.player[i].cardsNum = Math.ceil(obj.data[j].card_count);
                    appData.player[i].ticket_checked = obj.data[j].ticket_checked;
                }
            }
        }

        if (appData.game.current_card_user > 0) {
            for (var i = 0; i < appData.player.length; i++) {
                if (appData.player[i].account_id == appData.game.current_card_user) {
                    appData.player[i].tempCards = [];
                    appData.player[i].tempCards = appData.game.current_card.concat();
                }
            }
        }

        if (appData.scoreboard != "") {
            for (var i = 0; i < appData.player.length; i++) {
                for (s in appData.scoreboard) {
                    if (appData.player[i].account_id == s) {
                        appData.playerBoard.score[i].num = appData.player[i].num;
                        appData.playerBoard.score[i].account_id = appData.player[i].account_id;
                        appData.playerBoard.score[i].nickname = appData.player[i].nickname;
                        appData.playerBoard.score[i].account_score = Math.ceil(appData.scoreboard[s]);
                    }
                }
            }
            if (appData.game.status == 2) {
                appData.playerBoard.round = appData.game.round - 1;
            } else {
                appData.playerBoard.round = appData.game.round;
            }
            appData.playerBoard.record = "前" + appData.playerBoard.round + "局";
        }

        if (appData.game.score_summary != "") {
            for (var i = 0; i < appData.playerBoard.score.length; i++) {
                for (s in appData.game.score_summary) {
                    if (appData.playerBoard.score[i].account_id == s) {
                        appData.playerBoard.score[i].score_summary = Math.ceil(appData.game.score_summary[s]);
                    }
                }
            }
        }

        if (appData.game.round > 0 && appData.game.status == 1) {
            viewMethods.createForm();
        }
    },
    processUpdateGamerInfo: function (obj) {
        for (var i = 0; i < appData.player.length; i++) {
            if (appData.player[i].serial_num == obj.data.serial_num) {
                appData.player[i].nickname = obj.data.nickname;
                appData.player[i].headimgurl = obj.data.headimgurl;
                appData.player[i].account_id = obj.data.account_id;
                appData.player[i].account_score = Math.ceil(obj.data.account_score);
                appData.player[i].account_status = Math.ceil(obj.data.account_status);
                appData.player[i].online_status = Math.ceil(obj.data.online_status);
                appData.player[i].ticket_checked = obj.data.ticket_checked;
            } else {
                if (appData.player[i].account_id == obj.data.account_id) {
                    socketModule.sendRefreshRoom();
                    break;
                }
            }
        }
    },
    processUpdateAccountStatus: function (obj) {
        for (var i = 0; i < appData.player.length; i++) {
            if (appData.player[i].account_id == obj.data.account_id) {
                appData.player[i].account_status = Math.ceil(obj.data.account_status);
                if (appData.player[i].account_status == 2) {
                    appData.player[i].tempCards = 0;
                }
                if (obj.data.online_status == 1) {
                    appData.player[0].is_operation = false;
                } else if (obj.data.online_status == 0 && appData.player[i].account_status == 0) {
                    appData.player[i].account_id = 0;
                    appData.player[i].playing_status = 1;
                    appData.player[i].online_status = 0;
                    appData.player[i].nickname = "";
                    appData.player[i].headimgurl = "";
                    appData.player[i].account_score = 0;
                } else if (obj.data.online_status == 0 && appData.player[i].account_status > 0) {
                    appData.player[i].online_status = 0;
                } else {

                }
            }
        }
    },
    processStartLimitTime: function (obj) {
        if (obj.data.limit_time > 1) {
            //appData.game.time = Math.ceil(obj.data.limit_time);
            //viewMethods.timeCountDown();
        }
    },
    processCancelStartLimitTime: function (obj) {
        appData.game.time = -1;
    },
    processGameStart: function (obj) {
        appData.game.countdown = 0;
        $(".roundPause1").hide();
        appData.game.round = obj.data.game_num;

        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < obj.data.player_status.length; j++) {
                if (appData.player[i].account_id == obj.data.player_status[j].account_id) {
                    if (appData.player[i].ticket_checked == 0 && i == 0) {
                        if (appData.isAA == true) {
                            if (appData.rullInfo.ticket_count == 2) {
                                appData.userInfo.card = appData.userInfo.card - 2;
                            } else {
                                appData.userInfo.card = appData.userInfo.card - 1;
                            }
                        }
                    }

                    appData.player[i].ticket_checked = 1;
                    appData.player[i].account_status = Math.ceil(obj.data.player_status[j].account_status);
                    appData.player[i].playing_status = Math.ceil(obj.data.player_status[j].playing_status);

                    if (appData.player[i].playing_status == 2 && appData.player[i].limit_time == 0) {
                        appData.player[i].limit_time = Math.ceil(obj.data.player_status[j].limit_time);
                        appData.lastOp = i;
                        setTimeout(function () {
                            viewMethods.time(appData.lastOp);
                        }, 0)
                    } else {
                        appData.player[i].limit_time = Math.ceil(obj.data.player_status[j].limit_time);
                    }

                    appData.player[i].playing_status = Math.ceil(obj.data.player_status[j].playing_status);
                    appData.player[i].online_status = Math.ceil(obj.data.player_status[j].online_status);
                    appData.player[i].cardsNum = 17;
                    appData.player[i].is_operation = false;
                }
            }
        }
    },
    processNotyAskLandlord: function (obj) {
        for (var i = 0; i < appData.player.length; i++) {
            if (appData.player[i].account_id == obj.data.account_id) {
                if (i != 1)
                    m4aAudioPlay("pass1");
                appData.player[i].is_operation = false;

                if (appData.player[i].playing_status == 1 || appData.player[i].limit_time == 0) {
                    appData.player[i].limit_time = Math.ceil(obj.data.limit_time);
                    appData.lastOp = i;
                    setTimeout(function () {
                        viewMethods.time(appData.lastOp);
                    }, 0)
                } else {
                    appData.player[i].limit_time = Math.ceil(obj.data.limit_time);
                }

                appData.player[i].playing_status = Math.ceil(obj.data.playing_status);
            } else {
                appData.player[i].playing_status = 1;
            }
        }
    },
    processLandlord: function (obj) {
        appData.game.landlord_card = obj.data.landlord_card.concat();
        appData.game.multiple = 1;

        for (var i = 0; i < appData.player.length; i++) {
            if (appData.player[i].account_status == 5) {
                if (i != 0)
                    m4aAudioPlay("landlord");
                appData.player[i].cardsNum = 20;
                appData.game.current_card_user = appData.player[i].account_id;
            }
        }

        viewMethods.cardOver();
    },
    processNotyChooseCard: function (obj) {
        for (var i = 0; i < appData.player.length; i++) {
            if (appData.player[i].account_id == obj.data.account_id) {
                appData.player[i].is_operation = false;
                appData.player[i].tips = obj.data.tips.concat();
                appData.player[i].tipsNum = -1;
                if (appData.player[i].playing_status == 1 || appData.player[i].limit_time == 0) {
                    appData.player[i].limit_time = Math.ceil(obj.data.limit_time);
                    appData.lastOp = i;
                    setTimeout(function () {
                        viewMethods.time(appData.lastOp);
                    }, 0);
                } else {
                    appData.player[i].limit_time = Math.ceil(obj.data.limit_time);
                }
                appData.player[i].playing_status = Math.ceil(obj.data.playing_status);
            } else {
                appData.player[i].playing_status = 1;
            }
        }
    },
    processThrowOutCard: function (obj) {
        for (var i = 0; i < appData.player.length; i++) {
            if (appData.player[i].account_id == obj.data.account_id) {
                if (i == 0 && obj.data.is_passive == 1) {
                    for (var k = 0; k < obj.data.card.length; k++) {
                        for (var j = appData.cardList.length - 1; j >= 0; j--) {
                            if (appData.cardList[j].card == obj.data.card[k]) {
                                appData.cardList.splice(j, 1);
                            }
                        }
                    }
                    for (var j = 0; j < appData.cardList.length; j++) {
                        appData.cardList[j].num = j
                    }
                    if (obj.data.card.length == 0) {
                        for (var j = 0; j < appData.cardList.length; j++) {
                            appData.cardList[j].isSelect = false;
                        }
                    }
                }
                if (i != 0 || obj.data.is_passive == 1) {
                    appData.player[i].tempCards = new Array();
                    appData.player[i].tempCards = obj.data.card.concat();
                    appData.player[i].playing_status = 1;
                    appData.player[i].cardsNum = appData.player[i].cardsNum - obj.data.card.length;

                    if (appData.player[i].cardsNum == 1 && obj.data.card_type != 0) {
                        if (obj.data.card_type == 4 || obj.data.card_type == 11 || obj.data.card_type == 12 || obj.data.card_type == 13 || obj.data.card_type == 14) {
                            setTimeout(function () {
                                m4aAudioPlay("last1");
                            }, 1600)
                        } else {
                            setTimeout(function () {
                                m4aAudioPlay("last1");
                            }, 300)
                        }
                    } else if (appData.player[i].cardsNum == 2 && obj.data.card_type != 0) {
                        if (obj.data.card_type == 4 || obj.data.card_type == 11 || obj.data.card_type == 12 || obj.data.card_type == 13 || obj.data.card_type == 14) {
                            setTimeout(function () {
                                m4aAudioPlay("last2");
                            }, 1600)
                        } else {
                            setTimeout(function () {
                                m4aAudioPlay("last2");
                            }, 300)
                        }
                    }

                    if (obj.data.card.length > 0) {
                        appData.game.current_card = obj.data.card.concat();
                        appData.game.current_card_user = obj.data.account_id;
                    }
                    if (obj.data.card_type == 0) {
                        m4aAudioPlay("pass2");
                    } else if (obj.data.card_type == 1) {
                        if (Math.abs(obj.data.card[0]) % 16 < 14) {
                            m4aAudioPlay(Math.abs(obj.data.card[0]) % 16);
                        } else if (Math.abs(obj.data.card[0]) % 16 == 14) {
                            m4aAudioPlay("xiaowang");
                        } else if (Math.abs(obj.data.card[0]) % 16 == 15) {
                            m4aAudioPlay("dawang");
                        }
                    } else if (obj.data.card_type == 2) {
                        m4aAudioPlay(Math.abs(obj.data.card[0]) % 16 + "d");
                    } else if (obj.data.card_type == 3) {
                        m4aAudioPlay(Math.abs(obj.data.card[0]) % 16 + "t");
                    } else if (obj.data.card_type == 4) {
                        m4aAudioPlay("zhadan");
                        appData.isShowBomb = true;
                        appData.timeOut = 1600;
                        setTimeout(function () {
                            appData.timeOut = 0;
                            appData.isShowBomb = false;
                        }, appData.timeOut);
                        setTimeout(function () {
                            m4aAudioPlay("boom");
                        }, 600)
                    } else if (obj.data.card_type == 5) {
                        m4aAudioPlay("3d1");
                    } else if (obj.data.card_type == 6) {
                        m4aAudioPlay("3d2");
                    } else if (obj.data.card_type == 7 || obj.data.card_type == 8) {
                        m4aAudioPlay("4d2");
                    } else if (obj.data.card_type == 9) {
                        m4aAudioPlay("shunzi");
                    } else if (obj.data.card_type == 10) {
                        m4aAudioPlay("liandui");
                    } else if (obj.data.card_type == 11 || obj.data.card_type == 12 || obj.data.card_type == 13) {
                        for (var i = 0; i < appData.player.length; i++) {
                            if (appData.player[i].account_id == obj.data.account_id) {
                                $(".feiji" + appData.player[i].num).show();
                                appData.timeOut = 2000;
                                setTimeout(function () {
                                    appData.timeOut = 0;
                                    $(".feiji").hide();
                                }, appData.timeOut);
                            }
                        }
                        m4aAudioPlay("feiji");
                        setTimeout(function () {
                            m4aAudioPlay("feijiVoice");
                        }, 400)
                    } else if (obj.data.card_type == 14) {
                        m4aAudioPlay("wangzha");
                        appData.isShowBomb = true;
                        appData.timeOut = 1600;
                        setTimeout(function () {
                            appData.timeOut = 0;
                            appData.isShowBomb = false;
                        }, appData.timeOut);
                        setTimeout(function () {
                            m4aAudioPlay("boom");
                        }, 600);
                    }
                }
            }
        }


    },
    processMyCard: function (obj) {
        appData.cardList = new Array();
        for (var i = 0; i < obj.data.my_card.length; i++) {
            appData.cardList.push({
                "card": obj.data.my_card[i],
                "num": i,
                "isSelect": false,
                "isChoose": false,
                "z_index": i
            });
        }

        if (appData.cardList.length == 20) {
            for (var j = 0; j < appData.game.landlord_card.length; j++) {
                for (var k = 0; k < appData.cardList.length; k++) {
                    if (appData.game.landlord_card[j] == appData.cardList[k].card) {
                        appData.cardList[k].isSelect = true;
                    }
                }
            }
        } else {
            appData.cardNumShow = appData.cardList.length;
            viewMethods.cardNumTurn(appData.cardNumShow);
            m4aAudioPlay("fapai");
            setTimeout(function () {
                $(".myCard").addClass("myCardNew");
            }, 0)
        }
    },
    processUpdateAccountScore: function (obj) {
        for (var i = 0; i < 3; i++) {
            if (appData.player[i].account_id == obj.data.account_id) {
                appData.player[i].account_score = appData.player[i].account_score - Math.ceil(obj.data.score);

                if (appData.player[i].account_status == 5) {
                    appData.game.currentScore = Math.ceil(obj.data.score) * 2;
                } else {
                    appData.game.currentScore = Math.ceil(obj.data.score);
                }

                appData.game.score = appData.game.score + Math.ceil(obj.data.score);
                if (i != 0) {
                    viewMethods.throwCoin(appData.player[i].num, obj.data.score)
                    m4aAudioPlay(obj.data.score + "f");
                }
            }
        }
    },
    processWin: function (obj) {
        appData.game.round = Math.ceil(obj.data.game_num);
        appData.game.total_num = Math.ceil(obj.data.total_num);
        appData.playerBoard.round = Math.ceil(obj.data.game_num);
        appData.game.countdown = 180;

        for (var i = 0; i < appData.player.length; i++) {
            if (i == 0) {
                appData.tempStatus = appData.player[i].account_status;
            }

            appData.player[i].account_status = 6;
            appData.player[i].cards = new Array();
            appData.player[i].is_win = false;
            for (var j = 0; j < obj.data.player_cards.length; j++) {
                if (appData.player[i].account_id == obj.data.player_cards[j].account_id) {
                    appData.player[i].cards = obj.data.player_cards[j].cards.concat();
                }
            }
            for (var j = 0; j < obj.data.winner.length; j++) {
                if (appData.player[i].account_id == obj.data.winner[j]) {
                    appData.player[i].is_win = true;
                }
            }
        }
        if (obj.data.total_num == obj.data.game_num) {
            appData.game.is_break = true;
            appData.gameover = true;
            // ws.close();
        }
        if (obj.data.spring == 0) {
            viewMethods.restCardsTimeOut(obj.data.score_board, obj.data.score_summary);
            if (obj.data.total_num == obj.data.game_num) {
                viewMethods.roundEnd();
            }
        } else {
            if (obj.data.total_num == obj.data.game_num) {
                appData.isShowSpring = true;
                setTimeout(function () {
                    appData.isShowSpring = false;
                    viewMethods.restCardsTimeOut(obj.data.score_board, obj.data.score_summary);
                    viewMethods.roundEnd();
                }, 2000);
            } else {
                appData.isShowSpring = true;
                setTimeout(function () {
                    appData.isShowSpring = false;
                    viewMethods.restCardsTimeOut(obj.data.score_board, obj.data.score_summary);
                }, 2000);
            }
        }
    },
    processBroadcastVoice: function (obj) {
        for (var i = 0; i < 3; i++) {
            if (appData.player[i].account_id == obj.data.account_id && i != 0) {
                m4aAudioPlay("message" + obj.data.voice_num);
                viewMethods.messageSay(i, obj.data.voice_num);
            }
        }
    },
    processUpdateMultiple: function (obj) {
        appData.game.multiple = obj.data.multiple;
    },
    getScoreBoard: function () {
        socketModule.sendData({
            operation: "getScoreBoard",
            data: {
                room_id: appData.game.room,
                num: globalData.roomNumber,
                type: globalData.gameType
            }
        });
    },
    processGetScoreBoard: function (obj) {
        ws.close();
        clearInterval(appData.heartbeat);
        $("#loading").hide();

        appData.socketStatus = 0;
        if (obj.data.bs == '') {
            viewMethods.clickShowAlert(2, '房间已关闭');
        } else {
            socketModule.processLastScoreboard(obj.data.bs, obj.wh);
        }
    },
    processGameRule: function (obj) {
        if (appData.rullInfo.ask_mode) {
            appData.rullInfo.ask_mode = Math.ceil(obj.data.ask_mode);
            appData.rullInfo.ticket_count = Math.ceil(obj.data.ticket_count);
            appData.rullInfo.base_score = Math.ceil(obj.data.base_score);
        }

    },
    processBreakRoom: function (obj) {
        viewMethods.showAlert(9, "三分钟未开局，房间已自动结算");
        appData.game.is_break = true;
        ws.close();
    },
};

function checkIndividuality(e) {
    return !!/^[0-9a-zA-Z]*$/g.test(e);
}

var viewMethods = {
    setUserData(obj) {
        var info = {
            "account_id": obj.account_id,
            "nickname": obj.nickname,
            "headimgurl": obj.headimgurl,
            "card": obj.ticket_count,
            "individuality": obj.individuality,
            "user_id": obj.user_id,
        };
        userData = info;
        appData.userData = info;
        changeTitle(userData.nickname, globalData.roomNumber);
        socketModule.sendPrepareJoinRoom();
        return JSON.stringify(info)
    },
    showResultTextFunc(text) {
        appData.isShowTipsText = true;
        appData.tipsText = text;
        setTimeout(function () {
            appData.isShowTipsText = false;
        }, 1500)
    },
    hall: function () {
        DynLoading.goto('/');
    },
    applyClub: function () {
        httpModule.applyClub();
    },
    autoReady() {
        if (appData.gameover == true) {
            return
        }
        if (appData.isAutoReady == 1) {
            appData.isAutoReady = 0
            localStorage.setItem("isAutoReady", 0)
            localStorage.removeItem("roomNumber")
        } else {
            appData.isAutoReady = 1
            viewMethods.clickReady()
            localStorage.setItem("isAutoReady", 1)
            localStorage.setItem("roomNumber", globalData.roomNumber)
        }
    },
    reviewCard: function () {
        window.location.href = Htmls.getReviewUrl(globalData.gameType, globalData.roomNumber);
    },
    clickShowAlert: function (type, text) {
        //$(".alertText").css("top", "90px");
        appData.alertType = type;
        appData.alertText = text;
        appData.isShowAlert = true;
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
    },
    clickCloseAlert: function () {
        if (appData.alertType == 22) {
            appData.isShowAlert = false;
            appData.isShowGameAlert = false;
            httpModule.getInfo();
        } else {
            appData.isShowGameAlert = false;
            appData.isShowAlert = false;
        }
    },
    clickReady: function () {
        socketModule.sendReadyStart();
        appData.player[0].is_operation = true;
    },
    showHomeAlert: function () {
        appData.isShowHomeAlert = true;
    },
    showIndividuality: function () {
        if (globalData.p_type == 2) {

            if (userData.individuality == "") {
                appData.isShowIndiv = true
            } else {
                appData.isShowIndividuality = true;
            }

            if (localStorage.messageMusic == 1) {
                viewMethods.clickVoice();
            }
        } else {

            appData.isShowIndiv = true
        }
        appData.individualityError = "";
    },
    hideIndividuality: function () {
        appData.isShowIndiv = false;
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
    },
    setIndividuality: function () {
        if (appData.inputIndiv.length > 6 || appData.inputIndiv.length < 1) {
            appData.individualityError = "请输入1-6位英文或数字防伪码";
            appData.isShowIndividualityError = !0;
        } else if (checkIndividuality(appData.inputIndiv)) {
            appData.individualityError = "";
            socketModule.setIndividuality();
        } else {
            appData.individualityError = "请输入1-6位英文或数字防伪码";
            appData.isShowIndividualityError = !0;
        }
    },
    individualityChange: function () {
        if (appData.inputIndiv.length > 6) {
            appData.inputIndiv = appData.inputIndiv.substring(0, 6);
        }
    },
    showAlertTip: function (e, t) {
        appData.isShowAlertTip = true;
        appData.alertTipText = e;
        appData.alertTipType = t;
        setTimeout(function () {
            appData.isShowAlertTip = !1;
        }, 1e3);
    },

    screen: function () {
        if (appData.height > appData.width) {
            $(".main").width(appData.width);
            $(".main").height(appData.height);
            if (appData.height > appData.width * 1.62) {
                $(".playGround").width(appData.width);
                $(".playGround").height(appData.width * 1.62);
            } else {
                $(".playGround").width(appData.height * 0.617);
                $(".playGround").height(appData.height);
            }
            if (globalData.roomStatus != 4) {
                $("#loading").hide();
                $(".main").show();
                $(".outPart").show();
            }
        } else {
            alert("请关闭旋转后刷新页面。");
        }
    },
    initialize: function () {
        appData.userInfo = {};
        appData.userInfo.card = Math.ceil(globalData.card);
        appData.player = [];
        appData.recordList = [];
        appData.is_connect = false;

        appData.playerBoard = {
            "score": [],
            "round": 0,
            "record": "",
        }

        appData.scoreboard = "";
        appData.game = {
            "room": 0,
            "room_number": globalData.roomNumber,
            "room_url": 0,
            "score": 0,
            "status": 0,
            "time": -1,
            "round": 0,
            "total_num": 6,
            "current_card_user": 0,
            "is_play": false,
            "multiple": 1,
            "cardText": "",
            "current_card": [],
            "landlord_card": [],
            "countdown": 0,
        }

        for (var i = 0; i < 3; i++) {
            appData.player.push({
                "num": i + 1,
                "serial_num": i + 1,
                "account_id": 0,
                "account_status": 0,
                "playing_status": 0,
                "online_status": 0,
                "nickname": "",
                "headimgurl": "",
                "account_score": 0,
                "is_win": false,
                "limit_time": 0,
                "is_operation": false,
                "messageOn": false,
                "messageText": "",
                "cardsNum": 0,
                "tempCards": 0,
                "cards": new Array(),
                "tips": new Array(),
                "tipsNum": -1,
                "ticket_checked": 0,
            });

            appData.playerBoard.score.push({
                "account_id": 0,
                "nickname": "",
                "account_score": 0,
            });
        }

        appData.activity = [];
        appData.roomCardInfo = [];
        httpModule.getInfo();
    },
    newGame: function () {
        appData.playerBoard = {
            "score": new Array(),
            "round": 0,
            "record": "",
        }
        appData.cardList = new Array();
        appData.game.round = 0;
        appData.game.status = 1;
        appData.game.score = 0;
        appData.game.currentScore = 0;
        appData.game.is_play = false;
        appData.game.multiple = 0;
        appData.game.current_card = [];
        appData.game.landlord_card = [];
        appData.game.cardText = "";
        appData.game.current_card_user = 0;
        appData.gameover = false;

        $(".cards").removeClass("card-flipped");

        for (var i = 0; i < appData.player.length; i++) {
            appData.playerBoard.score.push({
                "account_id": 0,
                "nickname": "",
                "account_score": 0,
            });

            if (appData.player[i].online_status == 1) {
                appData.player[i].account_status = 0;
                appData.player[i].playing_status = 1;
                appData.player[i].is_win = false;
                appData.player[i].is_operation = false;
                appData.player[i].win_type = 0;
                appData.player[i].card = [];
                appData.player[i].account_score = 0;
                appData.player[i].tempCards = 0;
                appData.player[i].cards = [],
                    appData.player[i].tips = [],
                    appData.player[i].tipsNum = -1;
                appData.player[i].messageOn = false;
                appData.player[i].messageText = "";
                appData.player[i].cardsNum = 0;
                appData.player[i].ticket_checked = 0;
            } else {
                appData.player[i] = {
                    "num": i + 1,
                    "serial_num": appData.player[i].serial_num,
                    "account_id": 0,
                    "account_status": 0,
                    "playing_status": 1,
                    "online_status": 0,
                    "nickname": "",
                    "headimgurl": "",
                    "account_score": 0,
                    "is_win": false,
                    "win_type": 0,
                    "limit_time": 0,
                    "is_operation": false,
                    "messageOn": false,
                    "messageText": "",
                    "cardsNum": 0,
                    "tempCards": 0,
                    "cards": [],
                    "tips": [],
                    "tipsNum": -1,
                    "ticket_checked": 0,
                }
            }
        }
    },
    showNoteImg: function () {
        appData.isShowNoteImg = !0
    },
    hideNoteImg: function () {
        appData.isShowNoteImg = !1
    },
    closeHomeAlert: function () {
        appData.isShowHomeAlert = false;
    },
    showAlert: function (type, text) {
        appData.alertType = type;
        appData.alertText = text;
        appData.isShowAlert = true;
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
                //	mainHeight = mainHeight - height * 0.022 - height * 0.056
            }

            var blackHeight = alertHeight + height * 0.034 * 2;
            var alertTop = height * 0.022 + (blackHeight - textHeight) / 2;

            $(".alert .mainPart").css('height', mainHeight + 'px');
            $(".alert .mainPart").css('margin-top', '-' + mainHeight / 2 + 'px');
            $(".alert .mainPart .backImg .blackImg").css('height', blackHeight + 'px');
            $(".alert .mainPart .alertText").css('top', alertTop + 'px');
        }, 0);
    },
    closeAlert: function () {
        if (appData.alertType == 6) {
            socketModule.sendJoinRoom();
            appData.isShowAlert = false;
        } else if (appData.alertType == 8) {
            var d = new Date(),
                str = '';
            str += d.getFullYear() + '-';
            str += d.getMonth() + 1 + '-';
            str += d.getDate() + '  ';
            str += d.getHours() + ':';
            if (d.getMinutes() >= 10)
                str += d.getMinutes();
            else
                str += "0" + d.getMinutes();
            appData.playerBoard.record = str;
            //		$(".time a").html(str);
            $(".roundEndShow").show();
            setTimeout(function () {
                $(".ranking").show();
                canvas();
            }, 10)
            appData.isShowAlert = false;
        } else if (appData.alertType == 22) {
            appData.isShowAlert = false;
            httpModule.getInfo();
        } else if (appData.alertType == 31) {
            window.location.href = window.location.href + "&id=" + 10000 * Math.random();
        } else {
            appData.isShowAlert = false;
        }
    },
    sitDown: function () {
        appData.isShowAlert = false;
        socketModule.sendJoinRoom();
    },
    getCards: function () {
        httpModule.getCards();
    },
    showRull: function () {
        if (appData.roomStatus == 4) {
            return;
        }

        appData.isShowRull = true;
    },
    closeRull: function () {
        appData.isShowRull = false;
    },
    createForm: function () {
        var max_score_summary = Math.max(Math.abs(appData.playerBoard.score[0].score_summary), Math.abs(appData.playerBoard.score[1].score_summary), Math.abs(appData.playerBoard.score[2].score_summary));

        for (var i = 0; i < appData.playerBoard.score.length; i++) {
            if (Math.abs(appData.playerBoard.score[i].score_summary) == max_score_summary) {
                if (i == 0)
                    appData.tempStatus = 5;
                else
                    appData.tempStatus = 4;
            }
        }

        appData.game.maxWin = Math.max(appData.playerBoard.score[0].account_score, appData.playerBoard.score[1].account_score, appData.playerBoard.score[2].account_score);

        var d = new Date(),
            str = '';
        str += d.getFullYear() + '-';
        str += d.getMonth() + 1 + '-';
        str += d.getDate() + '  ';
        str += d.getHours() + ':';
        if (d.getMinutes() >= 10)
            str += d.getMinutes();
        else
            str += "0" + d.getMinutes();
        appData.playerBoard.record = str + "   前" + appData.game.round + "局";

        if (appData.game.round == appData.game.total_num) {
            return 0;
        }

        $(".roundPause").show();
        var target = document.getElementById("roundPause");
        html2canvas(target, {
            allowTaint: true,
            taintTest: false,
            onrendered: function (canvas) {
                canvas.id = "mycanvas";
                var dataUrl = canvas.toDataURL('image/png', 0.3);
                $(".roundPause").hide();
                $("#roundPause2").attr("src", dataUrl);
                setTimeout(function () {
                    $(".roundPause1").show();
                }, 100)

                if (appData.game.countdown > 0) {
                    viewMethods.countdown();
                }
            }
        });
    },
    countdown: function () {

        if (isTimeLimitShow == true) {
            return;
        }

        if (appData.game.countdown <= 0) {
            isTimeLimitShow = false;
            return 0;
        }

        isTimeLimitShow = true;

        setTimeout(function () {
            appData.game.countdown = appData.game.countdown - 1;
            isTimeLimitShow = false;
            viewMethods.countdown();
        }, 1000);
    },
    imReady: function () {
        if (appData.player[0].is_operation) {
            setTimeout(function () {
                appData.player[0].is_operation = false;
            }, 1000);
            return 0;
        }

        socketModule.sendReadyStart();
        appData.player[0].is_operation = true;
    },
    sendMessage: function (num, type) {

        if (appData.player[0].is_operation) {
            setTimeout(function () {
                appData.player[0].is_operation = false;
            }, 500)
            return 0;
        }

        if (type == 1) {
            socketModule.sendAskLandlord(num, type);
            appData.player[0].is_operation = true;
            if (num == 0) {
                m4aAudioPlay("pass1");
                appData.player[0].playing_status = 1;
            } else {
                m4aAudioPlay("landlord");
                appData.player[0].playing_status = 1;
            }
        } else if (type == 2) {
            if (num == 0) {
                socketModule.sendChooseCard([]);
                appData.player[0].is_operation = true;

                appData.player[0].tempCards = new Array();
                appData.player[0].playing_status = 1;
                m4aAudioPlay("pass2");

            } else if (num == 1) {
                var card = [];

                for (var k = 0; k < appData.cardList.length; k++) {
                    if (appData.cardList[k].isSelect) {
                        card.push(appData.cardList[k].card)
                    }
                }

                if (card.length == 0) {
                    appData.game.cardText = "请选择要出的牌"
                    $(".cardText").fadeIn();
                    setTimeout(function () {
                        $(".cardText").fadeOut();
                    }, 1000)
                    return 0;
                } else {

                    /*
						-3 请选择要出的牌 (第一个出牌者必须出牌，不能PASS)
			  			-2 打不起
			  	        -1 错误牌型
			  	         0 过
			  	        >0 牌型 (具体牌型数值定义在类属性)
					*/
                    if (appData.game.current_card_user == appData.player[0].account_id)
                        appData.game.current_card = [];
                    var cardType = Cardlogic.checkBeforeThrow(appData.game.current_card, card);
                    var cardFirst = parseInt(card[0]) % 16;


                    console.log(card);
                    console.log(cardType);
                    if (cardType >= 0) {
                        socketModule.sendChooseCard(card);
                        appData.player[0].is_operation = true;


                        appData.player[0].tempCards = new Array();
                        appData.player[0].tempCards = card.concat();
                        appData.player[0].playing_status = 1;
                        appData.player[0].cardsNum = appData.player[0].cardsNum - card.length;

                        for (var k = 0; k < card.length; k++) {
                            for (var j = appData.cardList.length - 1; j >= 0; j--) {
                                if (appData.cardList[j].card == card[k]) {
                                    appData.cardList.splice(j, 1);
                                }
                            }
                        }
                        for (var j = 0; j < appData.cardList.length; j++) {
                            appData.cardList[j].num = j
                        }
                        for (var j = 0; j < appData.cardList.length; j++) {
                            appData.cardList[j].isSelect = false;
                        }

                        if (appData.player[0].cardsNum == 1 && cardType != 0) {
                            if (cardType == 4 || cardType == 11 || cardType == 12 || cardType == 13 || cardType == 14) {
                                setTimeout(function () {
                                    m4aAudioPlay("last1");
                                }, 1600)
                            } else {
                                setTimeout(function () {
                                    m4aAudioPlay("last1");
                                }, 300)
                            }
                        } else if (appData.player[0].cardsNum == 2 && cardType != 0) {
                            if (cardType == 4 || cardType == 11 || cardType == 12 || cardType == 13 || cardType == 14) {
                                setTimeout(function () {
                                    m4aAudioPlay("last2");
                                }, 1600)
                            } else {
                                setTimeout(function () {
                                    m4aAudioPlay("last2");
                                }, 300)
                            }
                        }
                        if (card.length > 0) {
                            appData.game.current_card = card.concat();
                            appData.game.current_card_user = appData.player[0].account_id;
                        }
                        if (cardType == 0) {
                            m4aAudioPlay("pass2");
                        } else if (cardType == 1) {
                            if (cardFirst < 14) {
                                m4aAudioPlay(cardFirst);
                            } else if (cardFirst == 14) {
                                m4aAudioPlay("xiaowang");
                            } else if (cardFirst == 15) {
                                m4aAudioPlay("dawang");
                            }
                        } else if (cardType == 2) {
                            m4aAudioPlay(cardFirst + "d");
                        } else if (cardType == 3) {
                            m4aAudioPlay(cardFirst + "t");
                        } else if (cardType == 4) {
                            m4aAudioPlay("zhadan");
                            appData.isShowBomb = true;
                            appData.timeOut = 1600;
                            setTimeout(function () {
                                appData.timeOut = 0;
                                appData.isShowBomb = false;
                            }, appData.timeOut);
                            setTimeout(function () {
                                m4aAudioPlay("boom");
                            }, 600)
                        } else if (cardType == 5) {
                            m4aAudioPlay("3d1");
                        } else if (cardType == 6) {
                            m4aAudioPlay("3d2");
                        } else if (cardType == 7 || cardType == 8) {
                            m4aAudioPlay("4d2");
                        } else if (cardType == 9) {
                            m4aAudioPlay("shunzi");
                        } else if (cardType == 10) {
                            m4aAudioPlay("liandui");
                        } else if (cardType == 11 || cardType == 12 || cardType == 13) {
                            $(".feiji" + appData.player[0].num).show();
                            appData.timeOut = 2000;
                            setTimeout(function () {
                                appData.timeOut = 0;
                                $(".feiji").hide();
                            }, appData.timeOut);
                            m4aAudioPlay("feiji");
                            setTimeout(function () {
                                m4aAudioPlay("feijiVoice");
                            }, 400)
                        } else if (cardType == 14) {
                            m4aAudioPlay("wangzha");
                            appData.isShowBomb = true;
                            appData.timeOut = 1600;
                            setTimeout(function () {
                                appData.timeOut = 0;
                                appData.isShowBomb = false;
                            }, appData.timeOut);
                            setTimeout(function () {
                                m4aAudioPlay("boom");
                            }, 600);
                        }
                    } else {
                        if (cardType == -1) {
                            appData.game.cardText = "牌型错误";
                        } else if (cardType == -2) {
                            appData.game.cardText = "打不起";
                        } else if (cardType == -3) {
                            appData.game.cardText = "请选择要出的牌";
                        }
                        $(".cardText").fadeIn();
                        setTimeout(function () {
                            $(".cardText").fadeOut();
                        }, 1500)
                    }
                }
            }
        }
    },
    noteCards: function () {
        if (appData.player[0].tips.length == 0) {
            appData.cardList[appData.cardList.length - 1].isSelect = true;
        } else {
            if (appData.player[0].tipsNum < appData.player[0].tips.length - 1)
                appData.player[0].tipsNum = appData.player[0].tipsNum + 1;
            else
                appData.player[0].tipsNum = 0;
            for (var k = 0; k < appData.cardList.length; k++) {
                appData.cardList[k].isSelect = false;
                for (var j = 0; j < appData.player[0].tips[appData.player[0].tipsNum].length; j++) {
                    if (appData.player[0].tips[appData.player[0].tipsNum][j] == appData.cardList[k].card) {
                        appData.cardList[k].isSelect = true;
                    }
                }
            }
        }
    },
    showMessage: function () {
        // $(".message .textPart").velocity({
        //     height: 400
        // });
        appData.isShowMessage = true;
        disable_scroll();

        setTimeout(function () {
            if (!appData.bScroll) {
                appData.bScroll = new BScroll(document.getElementById('message-box'), {
                    startX: 0,
                    startY: 0,
                    scrollY: true,
                    scrollX: false,
                    click: true,
                });
            } else {
                appData.bScroll.refresh();
            }
        }, 10);
    },
    hideMessage: function () {
        // $(".message .textPart").velocity({
        //     height: 0
        // }, {
        //     complete:function(){
        // 		appData.isShowMessage = false;
        // 	}
        // });
        appData.isShowMessage = false;
        enable_scroll();
    },
    messageOn: function (num) {
        socketModule.sendBroadcastVoice(num);
        m4aAudioPlay("message" + num);
        viewMethods.messageSay(0, num);
        viewMethods.hideMessage();
    },
    messageSay: function (num1, num2) {
        appData.player[num1].messageOn = true;
        appData.player[num1].messageText = appData.message[num2].text;
        setTimeout(function () {
            appData.player[num1].messageOn = false;
        }, 2500);
    },
    closeEnd: function () {
        $(".ranking .rankBack").css("opacity", "0.7");
        $(".end").hide();
        $(".roundEndShow").hide();
        $(".ranking").hide();
    },
    selectCard: function (num, count) {
        appData.select = num;
        appData.ticket_count = count;
    },
    clickCard: function (num) {
        return 0;
        appData.cardList[num].isSelect = !appData.cardList[num].isSelect;
        //console.log(appData.cardList[num]);
    },
    selectCardTemp: function (num) {
        var startNum, endNum, middleNum;
        startX, startY, endX, endY;
        startNum = Math.ceil(viewMethods.cardPosition(startX, startY, appData.cardList.length))
        endNum = Math.ceil(viewMethods.cardPosition(endX, endY, appData.cardList.length));

        if (endNum == -1) {
            endNum = startNum;
        }

        if (startNum > endNum) {
            middleNum = startNum;
            startNum = endNum;
            endNum = middleNum;
        }

        for (var i = 0; i < appData.cardList.length; i++) {
            appData.cardList[i].isChoose = false;

            if (i + 1 >= startNum && i + 1 <= endNum) {
                appData.cardList[i].isChoose = true;
            }
        }
    },
    cardPosition: function (num1, num2, num3) {
        var cardWidth = 335;

        if (num3 > 0 && num3 < 10) {
            cardWidth = num3 * 29 + 28;
            var space = (10 - num3) * 14;

            if (num2 > 83 && num2 < 172) {
                if (num1 < space)
                    num1 = space + 5;
                else if (num1 > cardWidth + space)
                    num1 = cardWidth + space - 20;
                return appData.cardList.length - ((cardWidth + space - num1 - 28) / 28);
            } else {
                return -1;
            }
        } else {
            if (num2 > -5 && num2 < 83) {
                if (num1 < 0)
                    num1 = 0;
                else if (num1 > 260)
                    num1 = 260;
                if (appData.cardList.length - (10 + ((285 - num1) / 28)) < 0)
                    return 0;
                else
                    return appData.cardList.length - (10 + ((285 - num1) / 28));
            } else if (num2 > 83 && num2 < 172) {
                if (num1 < 0)
                    num1 = 0;
                else if (num1 > 260)
                    num1 = 260;
                return appData.cardList.length - (((285 - num1) / 28) >= 9 ? 9 : ((285 - num1) / 28));
            } else {
                return -1;
            }
        }
    },
    cardsDown: function () {
        for (var i = 0; i < appData.cardList.length; i++) {
            appData.cardList[i].isSelect = false;
        }
    },
    cardOver: function () {
        $(".cardOver .card0").velocity({left: 0}, {duration: 250});
        $(".cardOver .card1").velocity({left: 0}, {duration: 250});
        $(".cardOver .card2").velocity({left: 0}, {
            duration: 250,
            complete: function () {
                $(".cardOver .cards").addClass("card-flipped");
                $(".cardOver .card0").velocity({left: 0}, {duration: 500})
                $(".cardOver .card1").velocity({left: 18}, {duration: 500})
                $(".cardOver .card2").velocity({left: 36}, {duration: 500})
            }
        });
    },
    restCardsTimeOut: function (board, score_summary) {
        for (var i = 0; i < appData.player.length; i++) {
            for (s in board) {
                if (appData.player[i].account_id == s) {
                    appData.playerBoard.score[i].num = appData.player[i].num;
                    appData.playerBoard.score[i].account_id = appData.player[i].account_id;
                    appData.playerBoard.score[i].nickname = appData.player[i].nickname;
                    appData.playerBoard.score[i].account_score = Math.ceil(board[s]);
                    appData.player[i].account_score = Math.ceil(board[s]);
                }
            }
            for (s in score_summary) {
                if (appData.player[i].account_id == s) {
                    appData.player[i].tempScore = Math.ceil(score_summary[s]);
                }
            }
        }

        for (var i = 0; i < appData.playerBoard.score.length; i++) {
            appData.playerBoard.score[i].score_summary = 0;
            for (s in score_summary) {
                if (appData.playerBoard.score[i].account_id == s) {
                    appData.playerBoard.score[i].score_summary = Math.ceil(score_summary[s]);
                }
            }
        }

        setTimeout(function () {
            $(".member .cardShow .row1").show();
            $(".member .cardShow .row1").velocity({"marginLeft": -18}, {
                duration: 500,
                complete: function () {
                    $(".member .cardShow .row2").show();
                    $(".member .cardShow .row2").velocity({"marginLeft": -18}, {
                        duration: 500,
                        complete: function () {
                            $(".member .cardShow .row3").show();
                            $(".member .cardShow .row3").velocity({"marginLeft": -18}, {duration: 500})
                        }
                    });

                }
            });
        }, 200);

        setTimeout(function () {
            viewMethods.createForm();
            if (appData.player[0].is_win) {
                mp3AudioPlay("win");
            } else {
                mp3AudioPlay("lose");
            }
        }, 1700);

        // 自动准备
        setTimeout(function () {
            if (appData.isAutoReady == 1) {
                viewMethods.newReady()
            }
        }, 6000)
    },
    newReady: function () {
        appData.cardList = new Array();
        for (var i = 0; i < appData.player.length; i++) {
            appData.player[i].tipsNum = -1;
            appData.player[i].tips = [];
            appData.player[i].cards = [];
            appData.player[i].tempCards = 0;
            appData.player[i].playing_status = 1;
            appData.player[i].cardsNum = 0;
            appData.player[i].is_operation = false;
        }

        appData.game.current_card = [];
        appData.game.landlord_card = [];
        appData.game.cardText = "";
        appData.game.multiple = 0;
        appData.game.current_card_user = 0;
        $(".cards").removeClass("card-flipped");
        viewMethods.imReady();
    },
    cardNumTurn: function (num) {
        if (num > 0) {
            setTimeout(function () {
                appData.cardNumShow--;
                viewMethods.cardNumTurn(appData.cardNumShow);
            }, 100);
        } else {
            $(".myCard").removeClass("myCardNew");
        }
    },
    time: function (num) {
        if (appData.player[num].limit_time > 10) {
        }

        if (appData.player[num].limit_time <= 0 || appData.player[num].playing_status == 1) {
            if (appData.daojishi) {
                audioModule.stopSound("daojishi");
                appData.daojishi = false;
            }

            appData.player[num].limit_time = 0;
            return 0;
        } else {
            appData.player[num].limit_time--;
            setTimeout(function () {
                if (appData.player[num].limit_time == 5) {
                    appData.daojishi = true;
                    mp3AudioPlay("daojishi");
                }
                viewMethods.time(num)
            }, 1000);
        }
    },
    roundEnd: function () {
        // $("#loading").show();
        // appData.game.is_break=false;
        // appData.gameover=true;
        // socketModule.getScoreBoard();
        DynLoading.goto('ddz' + globalData.maxCount, 'i=' + globalData.roomNumber);
    },
    roundEnd222: function () {
        var d = new Date(),
            str = '';
        str += d.getFullYear() + '-';
        str += d.getMonth() + 1 + '-';
        str += d.getDate() + '  ';
        str += d.getHours() + ':';
        if (d.getMinutes() >= 10)
            str += d.getMinutes();
        else
            str += "0" + d.getMinutes();
        appData.playerBoard.record = str;
        //		$(".time a").html(str);
        $(".ranking .rankBack").css("opacity", "1");
        $(".roundEndShow").show();
        setTimeout(function () {
            $(".ranking").show();
            canvas();
        }, 4500);
    },
    showAudioSetting: function () {
        appData.editAudioInfo.backMusic = appData.audioInfo.backMusic;
        appData.editAudioInfo.messageMusic = appData.audioInfo.messageMusic;
        appData.editAudioInfo.isShow = true;
    },
    cancelAudioSetting: function () {
        appData.editAudioInfo.isShow = false;
    },
    confirmAudioSetting: function (once) {
        console.log(once);
        console.log(appData.musicOnce);
        if (once == '1' && appData.musicOnce && appData.editAudioInfo.backMusic == 1 && appData.editAudioInfo.messageMusic == 1) {
            appData.audioInfo.backMusic = 1;
            setTimeout(function () {
                audioModule.stopSound('backMusic');
            }, 200);
            setTimeout(function () {
                audioModule.playSound('backMusic', true);
            }, 500);
            appData.musicOnce = false;
        }
        if (once == '1' && !appData.musicOnce) {
            return;
        }
        appData.editAudioInfo.isShow = false;
        appData.audioInfo.backMusic = appData.editAudioInfo.backMusic;
        appData.audioInfo.messageMusic = appData.editAudioInfo.messageMusic;
        localStorage.backMusic = appData.editAudioInfo.backMusic;
        localStorage.messageMusic = appData.editAudioInfo.messageMusic;

        if (appData.audioInfo.backMusic == 1) {
            audioModule.stopSound('backMusic');
            audioModule.playSound('backMusic', true);
            appData.musicOnce = false;
        } else {
            audioModule.stopSound('backMusic');
        }
    },
    setBackMusic: function () {
        if (appData.editAudioInfo.backMusic == 0) {
            appData.editAudioInfo.backMusic = 1;
        } else {
            appData.editAudioInfo.backMusic = 0;
        }

    },
    setMessageMusic: function () {
        if (appData.editAudioInfo.messageMusic == 0) {
            appData.editAudioInfo.messageMusic = 1;
        } else {
            appData.editAudioInfo.messageMusic = 0;
        }
    },
    reloadView: function () {
        window.location.href = window.location.href + "&id=" + 1000 * Math.random();
    },
    applyToJoin: function () {
        httpModule.applyToJoin();
    }
};

var width = window.innerWidth;
var height = window.innerHeight;
var numD = 0;
var isTimeLimitShow = false;
var isPlayerTimeLimitShow = false;
var currentPlayerNum = 0; //当前活动用户

var Cardlogic = {

    CT_ERROR: -1, //错误牌型
    CT_PASS: 0, //不出
    CT_SINGLE: 1, //单牌
    CT_PAIR: 2, //对子
    CT_THREE: 3, //三条
    CT_BOMB: 4, //炸弹
    CT_THREE_WITH_ONE: 5, //3带1
    CT_THREE_WITH_PAIR: 6, //3带2
    CT_FOUR_WITH_TWO: 7, //4带2
    CT_FOUR_WITH_PAIRS: 8, //4带2
    CT_Straight: 9, //顺子
    CT_Double_Straight: 10, //连对
    CT_Aircraft: 11, //飞机不带
    CT_Aircraft_Single: 12, //飞机带单牌
    CT_Aircraft_Pair: 13, //飞机带对子
    CT_MISSILE: 14, //王炸

    _cVal: function (card) {
        var value = card % 16;
        if (value == 1 || value == 2) {
            value += 13;
        } else if (value <= 13) {

        } else {
            value += 2;
        }
        return value;
    },

    analysebCard: function (cards) {
        //设置结果
        analysis = {
            'fourCnt': 0, //四张数目
            'threeCnt': 0, //三张数目
            'pairCnt': 0, //两张数目
            'singleCnt': 0, //单张数目
            'fourCard': [], //四张克
            'threeCard': [], //三张扑克
            'pairCard': [], //两张扑克
            'singleCard': [] //单张扑克
        };

        //点数分析
        for (var i = 0; i < cards.length; i++) {
            var sameCnt = 1;
            //搜索同牌
            for (var j = i + 1; j < cards.length; j++) {
                if (cards[j] != cards[i]) {
                    break;
                }
                sameCnt++;
            }

            //设置结果
            switch (sameCnt) {
                case 1: //单张
                {
                    analysis.singleCnt++;
                    analysis.singleCard.push(cards[i]);
                    break;
                }
                case 2: //两张
                {
                    analysis.pairCnt++;
                    analysis.pairCard.push(cards[i]);
                    break;
                }
                case 3: //三张
                {
                    analysis.threeCnt++;
                    analysis.threeCard.push(cards[i]);
                    break;
                }
                case 4: //四张
                {
                    analysis.fourCnt++;
                    analysis.fourCard.push(cards[i]);
                    break;
                }
            }
            //设置索引
            i += sameCnt - 1;
        }
        return analysis;
    },

    //计算能接成顺的牌张数
    straightCards: function (cards) {
        var chooseStraight = [];
        var max_count = 0;

        cards.sort(function (a, b) {
            return b - a;
        });

        var c = [];
        for (var i = 0; i < cards.length; i++) {
            if (c.length == 0 || c[c.length - 1] != cards[i]) {
                c.push(cards[i]);
            }
        }
        var total = c.length;
        for (i = 0; i < total; i++) {
            if (c[i] < 15) {
                var straightNumber = 1;
                var tmp = [c[i]];
                for (j = i + 1; j < total; j++) {
                    if (c[j - 1] - c[j] == 1) {
                        tmp.push(c[j]);
                        straightNumber++;
                    } else {
                        break;
                    }
                }
                if (straightNumber > max_count) {
                    max_count = straightNumber;
                    chooseStraight = tmp;
                }
                max_count = straightNumber > max_count ? straightNumber : max_count;
                i = j - 1;
            }
        }
        return chooseStraight;
    },

    checkCardInfo: function (cards) {

        var len = cards.length;
        var c = new Array();
        for (var i = 0; i < len; i++) {
            c.push(this._cVal(cards[i]));
        }
        c.sort(function (a, b) {
            return b - a;
        });

        //简单牌型
        switch (len) {
            case 0: //空牌
            {
                return {type: this.CT_PASS, value: 0};
            }
            case 1: //单牌
            {
                return {type: this.CT_SINGLE, value: c[0]};
            }
            case 2: //对牌火箭
            {
                if ((c[0] == 17) && (c[1] == 16)) {
                    return {type: this.CT_MISSILE, value: c[0]};
                }
                if (c[0] == c[1]) {
                    return {type: this.CT_PAIR, value: c[0]};
                }
                return {type: this.CT_ERROR, value: 0};
            }
            case 3: {
                if (c[0] == c[2]) { //三条
                    return {type: this.CT_THREE, value: c[0]};
                }
                return {type: this.CT_ERROR, value: 0};
            }
            case 4: {
                if (c[0] == c[3]) { //炸
                    return {type: this.CT_BOMB, value: c[0]};
                } else if (c[0] == c[2]) { //3带1
                    return {type: this.CT_THREE_WITH_ONE, value: c[0]};
                } else if (c[1] == c[3]) { //3带1
                    return {type: this.CT_THREE_WITH_ONE, value: c[1]};
                } else {
                    return {type: this.CT_ERROR, value: 0};
                }
            }
            case 5: {
                var analysis = this.analysebCard(c);
                if (analysis.threeCnt == 1 && analysis.pairCnt == 1) {
                    return {type: this.CT_THREE_WITH_PAIR, value: analysis.threeCard[0]};
                }
                break;
            }
            case 6: {
                var analysis = this.analysebCard(c);
                if (analysis.fourCnt == 1) {
                    return {type: this.CT_FOUR_WITH_TWO, value: analysis.fourCard[0]};
                }
                break;
            }
            case 8: {
                var analysis = this.analysebCard(c);
                if (analysis.fourCnt == 2 || analysis.fourCnt == 1 && analysis.pairCnt == 2) {
                    return {type: this.CT_FOUR_WITH_PAIRS, value: analysis.fourCard[0]};
                }
                break;
            }
        }

        if (typeof analysis == 'undefined') {
            var analysis = this.analysebCard(c);
        }

        //顺子
        if ((analysis.singleCnt >= 5) && (analysis.singleCnt == len)) {
            var first = analysis.singleCard[0];
            //错误过虑
            if (first >= 15) {
                return {type: this.CT_ERROR, value: 0};
            }

            for (var i = 1; i < analysis.singleCnt; i++) {
                if (first != (analysis.singleCard[i] + i)) {
                    return {type: this.CT_ERROR, value: 0};
                }
            }
            return {type: this.CT_Straight, value: first};
        }
        //连对
        if ((analysis.pairCnt >= 3) && (analysis.pairCnt * 2 == len)) {
            var first = analysis.pairCard[0];
            //错误过虑
            if (first >= 15) {
                return {type: this.CT_ERROR, value: 0};
            }

            for (var i = 1; i < analysis.pairCnt; i++) {
                if (first != (analysis.pairCard[i] + i)) {
                    return {type: this.CT_ERROR, value: 0};
                }
            }
            return {type: this.CT_Double_Straight, value: first};
        }

        //飞机
        if (analysis.threeCnt + analysis.fourCnt >= 2) { //飞机基本条件

            //飞机不带
            if (len % 3 == 0 && len == analysis.threeCnt * 3) {
                var straight_count = this.straightCards(analysis.threeCard).length;
                if (straight_count == analysis.threeCnt) {
                    return {type: this.CT_Aircraft, value: analysis.threeCard[0]};
                }
            }

            //飞机带单牌
            if (len % 4 == 0) {
                var power = len / 4;
                var arr = [];
                for (var i = 0; i < analysis.threeCard.length; i++) {
                    arr.push(analysis.threeCard[i]);
                }
                for (var i = 0; i < analysis.fourCard.length; i++) {
                    arr.push(analysis.fourCard[i]);
                }
                var straight_cards = this.straightCards(arr);
                if (straight_cards.length >= power) {
                    return {type: this.CT_Aircraft_Single, value: straight_cards[0]};
                }
            }

            //飞机带对子
            if (len % 5 == 0) {
                var power = len / 5;
                var straight_count = this.straightCards(analysis.threeCard).length;
                if (straight_count == power && analysis.pairCnt + analysis.fourCnt * 2 == power) {
                    return {type: this.CT_Aircraft_Pair, value: analysis.threeCard[0]};
                }
            }
        }
        return {type: this.CT_ERROR, value: 0};
    },


    /*
    	public method
    	检查出牌的牌型
    	cards: 出牌数组
      	return:牌型 (具体牌型数值定义在类属性)
    */
    checkCardType: function (cards) {
        return this.checkCardInfo(cards).type;
    },


    /*
    	public method
    	出牌前检查
    	firstCard: 上家出牌数组（若第一个出牌则为空)
    	nextCard:  下家出牌数组 (若PASS则为空)
      	return:
      			-3 请选择要出的牌 (第一个出牌者必须出牌，不能PASS)
      			-2 打不起
      	        -1 错误牌型
      	         0 过
      	        >0 牌型 (具体牌型数值定义在类属性)
    */
    checkBeforeThrow: function (firstCard, nextCard) {
        if (nextCard.length == 0) { //pass
            if (firstCard.length > 0) { //不是先出牌者，可以pass
                return 0;
            } else {
                return -3;
            }
        }

        //获取类型
        var firstInfo = this.checkCardInfo(firstCard);
        var nextInfo = this.checkCardInfo(nextCard);

        firstType = firstInfo.type;
        nextType = nextInfo.type;

        //类型判断
        if (nextType == this.CT_ERROR) {
            return -1; //错误牌型
        }
        if (firstCard.length == 0) {
            return nextType;
        }

        if (nextType == this.CT_MISSILE) {
            return nextType;
        }

        //炸弹判断
        if ((firstType != this.CT_BOMB) && (nextType == this.CT_BOMB)) {
            return nextType;
        }
        if ((firstType == this.CT_BOMB) && (nextType != this.CT_BOMB)) {
            return -2; //打不起
        }

        //规则判断
        if ((firstType != nextType) || (firstCard.length != nextCard.length)) {
            return -2; //打不起
        }

        if (nextInfo.value > firstInfo.value) {
            return nextType;
        } else {
            return -2; //打不起
        }
    }

}

var rullInfo = {
    "ticket_count": 1,
    "base_score": 10,
    "ask_mode": 1,
};

var editAudioInfo = {
    isShow: false,
    backMusic: 1,
    messageMusic: 1,
};

var audioInfo = {
    backMusic: 1,
    messageMusic: 1,
};

if (localStorage.backMusic) {
    editAudioInfo.backMusic = localStorage.backMusic;
    audioInfo.backMusic = localStorage.backMusic;
} else {
    localStorage.backMusic = 1;
}

if (localStorage.messageMusic) {
    editAudioInfo.messageMusic = localStorage.messageMusic;
    audioInfo.messageMusic = localStorage.messageMusic;
} else {
    localStorage.messageMusic = 1;
}

// 自动准备
var setReady = 0;
if (localStorage.isAutoReady == 1 && localStorage.roomNumber == globalData.roomNumber) {
    setReady = 1
} else {
    setReady = 0
}

var appData = {
    isAutoReady: setReady, //自动准备
    roomStatus: globalData.roomStatus,
    userInfo: {},
    isShowRull: false,
    rullInfo: rullInfo,
    'width': window.innerWidth,
    'height': window.innerHeight,
    'roomCard': Math.ceil(globalData.card),
    'is_connect': false,
    'player': [],
    'scoreboard': '',
    'activity': [],
    'isShowAlert': false,
    'isShowHomeAlert': false,
    'isShowIndiv': false,
    'isShowIndividuality': false,
    'isShowIndividualityError': false,
    'individuality': userData.individuality,
    'individualityError': "",
    'inputIndiv': "",
    'userData': userData,
    'isShowAlertTip': false,
    'alertTipText': "",
    'alertTipType': 1,

    'isShowMessage': false,
    'alertType': 0,
    'alertText': '',
    'base_score': 0,
    'playerBoard': {
        score: [],
        round: 0,
        record: ""
    },
    'game': game,
    'roomCardInfo': [],
    'wsocket': ws,
    'connectOrNot': true,
    'socketStatus': 0,
    'heartbeat': null,
    'select': 1,
    'ticket_count': 0,
    'isDealing': false,
    message: message,
    turn: 0,
    recordList: [],
    cardList: new Array(),
    isShowSpring: false,
    isShowBomb: false,
    tempStatus: 0,
    cardNumShow: 0,
    lastOp: -1,
    daojishi: false,
    timeOut: 0,
    editAudioInfo: editAudioInfo,
    audioInfo: audioInfo,
    bScroll: null,
    isReconnect: true,
    isShowNoteImg: !1,
    'musicOnce': true,
    joinType: 0,
    ownerUser: {
        nickname: "",
        avatar: "",
        user_code: 0
    },
    isShowApply: false,
    applyInfo: {
        club_headimgurl: '',
        club_name: '',
        club_id: '',
        status: '确定'
    },
    applyStatus: 0, //0尚未申请  1加好友申请中
    isShowTipsText: false,
    tipsText: "",
    gameover: false,
};

//WebSocket
var connectSocket = function connectSocket(url, openCallback, messageCallback, closeCallback, errorCallback) {
    try {
        ws = new WebSocket(url);
        ws.onopen = openCallback;
        ws.onmessage = messageCallback;
        ws.onclose = closeCallback;
        ws.onerror = errorCallback;
    } catch (err) {
        appData.connectOrNot = false;
        console.log(err);
    }

}

var wsOpenCallback = function wsOpenCallback(data) {
    logMessage('websocket is opened');
    appData.connectOrNot = true;

    if (appData.heartbeat) {
        clearInterval(appData.heartbeat);
    }

    appData.heartbeat = setInterval(function () {
        appData.socketStatus = appData.socketStatus + 1;
        // console.log('appData.socketStatus',appData.socketStatus)
        if (appData.socketStatus > 1) {
            appData.connectOrNot = false;
        } else {
            appData.connectOrNot = true;
        }

        if (appData.socketStatus > 3) {
            if (appData.isReconnect) {
                window.location.href = window.location.href;
            }
        }

        if (ws.readyState == WebSocket.OPEN) {
            // ws.send('@');
            shb('@');
        }
        // console.log('socketStatus',appData.socketStatus)
    }, 4e3);

    changeTitle(userData.nickname, globalData.roomNumber);
    socketModule.sendPrepareJoinRoom();
    //
    // var userDataCookie = getC('userData');
    // if(userDataCookie){
    //     var obj = JSON.parse(userDataCookie);
    //     var info = {
    //         "account_id":obj.account_id,
    //         "nickname":obj.nickname,
    //         "headimgurl":obj.headimgurl,
    //         "ticket_count":obj.card,
    //         "individuality":obj.individuality,
    //         "user_id":obj.user_id,
    //     };
    //     methods.setUserData(info);
    // }else{
    //     socketModule.gAI();
    // }
}

var wsMessageCallback = function wsMessageCallback(evt) {
    appData.connectOrNot = true;

    if (evt.data == '@') {
        appData.socketStatus = 0;
        return 0;
    }

    var obj = eval('(' + evt.data + ')');

    logMessage(obj);
    if (obj.result == -201) {
        viewMethods.showAlert(31, obj.result_message);
    } else if (obj.result == -202) {
        appData.isReconnect = false;
        socketModule.closeSocket();
        viewMethods.showAlert(32, obj.result_message);
    } else if (obj.result == -203) {
        viewMethods.reloadView();
    }

    if (obj.result != 0) {
        if (obj.operation == wsOperation.JoinRoom) {
            if (obj.result == 1) {
                if (obj.data.alert_type == 1) {
                    viewMethods.showAlert(1, obj.result_message);
                } else if (obj.data.alert_type == 2) {
                    viewMethods.showAlert(2, obj.result_message);
                } else if (obj.data.alert_type == 3) {
                    viewMethods.showAlert(11, obj.result_message);
                } else {
                    viewMethods.showAlert(7, obj.result_message);
                }
            } else if (obj.result == -1) {
                viewMethods.showAlert(7, obj.result_message);
            } else {
                viewMethods.showAlert(7, obj.result_message);
            }

            viewMethods.screen();
        } else if (obj.operation == wsOperation.ReadyStart) {
            if (obj.result == 1) {
                viewMethods.showAlert(1, obj.result_message);
            }
            appData.player[0].is_operation = false;
        } else if (obj.operation == wsOperation.PrepareJoinRoom) {
            if (obj.result > 0) {
                socketModule.processGameRule(obj);
            }

            if (obj.result == 1) {
                if (obj.data.alert_type == 1) {
                    viewMethods.showAlert(1, obj.result_message);
                } else if (obj.data.alert_type == 2) {
                    viewMethods.showAlert(2, obj.result_message);
                } else if (obj.data.alert_type == 3) {
                    viewMethods.showAlert(11, obj.result_message);
                } else {
                    viewMethods.showAlert(7, obj.result_message);
                }
            } else if (obj.result == -1) {
                viewMethods.showAlert(7, obj.result_message);
            } else {
                viewMethods.showAlert(7, obj.result_message);
            }

            viewMethods.screen();
        } else if (obj.operation == wsOperation.ActiveRoom) {
            if (obj.result == 1) {
                viewMethods.showAlert(1, obj.result_message);
            } else {
                socketModule.sendPrepareJoinRoom();
            }
        } else if (obj.operation == wsOperation.RefreshRoom) {
            window.location.href = window.location.href + "&id=" + 10000 * Math.random();
        } else if (obj.operation == wsOperation.ChooseCard) {
            if (obj.result == -1) {
                appData.game.cardText = obj.result_message;
                $(".cardText").fadeIn();
                setTimeout(function () {
                    $(".cardText").fadeOut();
                }, 1500)
            } else if (obj.result == -2) {
                socketModule.sendRefreshRoom();
            }
            appData.player[0].is_operation = false;
        } else if (obj.operation == "setIndividuality") {
            methods.showResultTextFunc('设置失败');
        } else {
            errorSocket(obj.operation, JSON.stringify(obj));
        }
    } else {
        if (obj.operation == wsOperation.PrepareJoinRoom) {
            socketModule.processPrepareJoinRoom(obj);
        } else if (obj.operation == wsOperation.JoinRoom) {
            socketModule.processJoinRoom(obj);
        } else if (obj.operation == wsOperation.RefreshRoom) {
            socketModule.processRefreshRoom(obj);
        } else if (obj.operation == wsOperation.AllGamerInfo) {
            socketModule.processAllGamerInfo(obj);
        } else if (obj.operation == wsOperation.UpdateGamerInfo) {
            socketModule.processUpdateGamerInfo(obj);
        } else if (obj.operation == wsOperation.UpdateAccountStatus) {
            socketModule.processUpdateAccountStatus(obj);
        } else if (obj.operation == wsOperation.StartLimitTime) {
            socketModule.processStartLimitTime(obj);
        } else if (obj.operation == wsOperation.CancelStartLimitTime) {
            socketModule.processCancelStartLimitTime(obj);
        } else if (obj.operation == wsOperation.GameStart) {
            socketModule.processGameStart(obj);
        } else if (obj.operation == wsOperation.NotyAskLandlord) {
            socketModule.processNotyAskLandlord(obj);
        } else if (obj.operation == wsOperation.LandlordCard) {
            socketModule.processLandlord(obj);
        } else if (obj.operation == wsOperation.NotyChooseCard) {
            socketModule.processNotyChooseCard(obj);
        } else if (obj.operation == wsOperation.MyCard) {
            socketModule.processMyCard(obj);
        } else if (obj.operation == wsOperation.ThrowOutCard) {
            socketModule.processThrowOutCard(obj);
        } else if (obj.operation == wsOperation.UpdateAccountScore) {
            socketModule.processUpdateAccountScore(obj);
        } else if (obj.operation == wsOperation.Win) {
            socketModule.processWin(obj);
        } else if (obj.operation == wsOperation.BroadcastVoice) {
            socketModule.processBroadcastVoice(obj);
        } else if (obj.operation == wsOperation.UpdateMultiple) {
            socketModule.processUpdateMultiple(obj);
        } else if (obj.operation == wsOperation.BreakRoom) {
            socketModule.processBreakRoom(obj);
        } else if (obj.operation == "getScoreBoard") {
            socketModule.processGetScoreBoard(obj);
        } else if (obj.operation == "setIndividuality") {
            socketModule.processSetIndividuality(obj);
        } else if (obj.operation == "getAccountInfo") {
            socketModule.pGAI(obj);
        } else if (obj.operation == "getAccountCard") {
            socketModule.pGAC(obj);
        }
    }
}

var wsCloseCallback = function wsCloseCallback(data) {
    if (!appData.gameover) {
        logMessage("websocket closed：");
        logMessage(data);
        appData.connectOrNot = false;
        setTimeout(function () {
            reconnectSocket();
        }, 2000)
    }
}

var wsErrorCallback = function wsErrorCallback(data) {
    logMessage("websocket onerror：");
    logMessage(data);
    appData.connectOrNot = false;
}

var reconnectSocket = function reconnectSocket() {
    if (!appData.isReconnect) {
        return;
    }

    if (ws) {
        logMessage(ws.readyState);
        if (ws.readyState == 1) { //websocket已经连接
            return;
        }

        ws = null;
    }
    if (globalData.roomStatus == 4) {

        return 0;
    }
    logMessage('reconnectSocket');
    connectSocket(globalData.socket, wsOpenCallback, wsMessageCallback, wsCloseCallback, wsErrorCallback);
}

//音频播放
var m4aAudioPlay = function m4aAudioPlay(a) {
    if (!audioModule.audioOn) {
        return 0;
    }

    audioModule.playSound(a);
};

var mp3AudioPlay = function mp3AudioPlay(a) {
    if (!audioModule.audioOn) {
        return 0;
    }

    audioModule.playSound(a);
};

var audioModule = {
    audioOn: false,
    audioContext: null,
    audioBuffers: [],
    baseUrl: '',
    initModule: function (baseUrl) {
        this.baseUrl = baseUrl;
        this.audioBuffers = [];
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
        this.audioContext = new window.AudioContext();
    },
    stopSound: function (name) {
        var buffer = this.audioBuffers[name];

        if (buffer) {
            if (buffer.source) {
                buffer.source.stop(0);
                buffer.source = null;
            }
        }
    },
    playSound: function (name, isLoop) {

        if (name == "backMusic") {
            if (audioInfo.backMusic == 0) {
                return;
            }
        } else {
            if (audioInfo.messageMusic == 0) {
                return;
            }
        }

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
        if (globalData.roomStatus == 4) {
            return 0;
        }
        if (isLoadAudioFile == true) {
            return;
        }

        isLoadAudioFile = true;

        this.loadAudioFile(this.baseUrl + 'files/audio/landlord/landlordBack2.mp3', "backMusic");
        this.loadAudioFile(this.baseUrl + 'files/audio/landlord/daojishi.mp3', "daojishi");

        var audioUrl = ["lose.mp3", "win.mp3", "1.m4a", "2.m4a", "3.m4a", "4.m4a", "5.m4a", "6.m4a", "7.m4a", "8.m4a", "9.m4a", "10.m4a", "11.m4a", "12.m4a", "13.m4a", "1d.m4a", "2d.m4a", "3d.m4a", "4d.m4a", "5d.m4a", "6d.m4a", "7d.m4a", "8d.m4a", "9d.m4a", "10d.m4a", "11d.m4a", "12d.m4a", "13d.m4a", "1t.m4a", "2t.m4a", "3t.m4a", "4t.m4a", "5t.m4a", "6t.m4a", "7t.m4a", "8t.m4a", "9t.m4a", "10t.m4a", "11t.m4a", "12t.m4a", "13t.m4a", "3d1.m4a", "3d2.m4a", "4d2.m4a", "boom.m4a", "dawang.m4a", "fapai.m4a", "feiji.m4a", "feijiVoice.m4a", "landlord.m4a", "last1.m4a", "last2.m4a", "liandui.m4a", "pass1.m4a", "pass2.m4a", "shunzi.m4a", "wangzha.m4a", "xiaowang.m4a", "zhadan.m4a"];
        var audioName = ["lose", "win", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "1d", "2d", "3d", "4d", "5d", "6d", "7d", "8d", "9d", "10d", "11d", "12d", "13d", "1t", "2t", "3t", "4t", "5t", "6t", "7t", "8t", "9t", "10t", "11t", "12t", "13t", "3d1", "3d2", "4d2", "boom", "dawang", "fapai", "feiji", "feijiVoice", "landlord", "last1", "last2", "liandui", "pass1", "pass2", "shunzi", "wangzha", "xiaowang", "zhadan"];
        for (var i = 0; i < audioUrl.length; i++) {
            this.loadAudioFile(this.baseUrl + 'files/audio/landlord/' + audioUrl[i], audioName[i]);
        }

        var audioMessageUrl = ["message0.m4a", "message1.m4a", "message2.m4a", "message3.m4a", "message4.m4a", "message5.m4a", "message6.m4a", "message7.m4a", "message8.m4a", "message9.m4a", "message10.m4a", "message11.m4a", "message12.m4a", "message13.m4a", "message14.m4a", "message15.m4a", "message16.m4a", "message17.m4a", "message18.m4a", "message19.m4a", "message20.m4a", "message21.m4a"];
        var audioMessageName = ["message0", "message1", "message2", "message3", "message4", "message5", "message6", "message7", "message8", "message9", "message10", "message11", "message12", "message13", "message14", "message15", "message16", "message17", "message18", "message19", "message20", "message21"];
        for (var i = 0; i < audioMessageUrl.length; i++) {
            this.loadAudioFile(this.baseUrl + 'files/audio/sound/' + audioMessageUrl[i], audioMessageName[i]);
        }
    }
};

audioModule.initModule(globalData.fileUrl);

var methods = {
    raiseValueChange: function () {
        appData.raiseChip = appData.game.chips[appData.raiseValue]
    },
    showAlert: viewMethods.clickShowAlert,
    showMessage: viewMethods.showMessage,
    closeAlert: viewMethods.clickCloseAlert,
    sitDown: viewMethods.clickSitDown,
    imReady: viewMethods.clickReady,
    seeMyCard4: viewMethods.seeMyCard4,
    seeMyCard5: viewMethods.seeMyCard5,
    imReady: viewMethods.clickReady,
    robBanker: viewMethods.clickRobBanker,
    showCard: viewMethods.clickShowCard,
    selectTimesCoin: viewMethods.clickSelectTimesCoin,
    hideMessage: viewMethods.hideMessage,
    closeEnd: viewMethods.closeEnd,
    messageOn: viewMethods.messageOn,
    //观战功能
    guestRoom: function () {
        socketModule.sendGuestRoom()
    },
    hideGuests: function () {
        appData.showGuest = 0
        appData.ruleInfo.isShowRule = false;
    },
    showGuests: function () {
        appData.showSitdownButton = 0;
        appData.showWatchButton = !appData.isWatching && appData.player[0].account_status < 2 && appData.player[0].ticket_checked == 0;

        if (appData.isWatching) {
            for (var e = 0; e < appData.player.length; e++)
                if (appData.player[e].account_id == userData.account_id || 0 == appData.player[e].account_id) {
                    appData.showSitdownButton = 1;
                    break
                }
        }
        appData.showGuest = 1;
    },
    showAlertTip: function (e, t) {
        appData.isShowAlertTip = true;
        appData.alertTipText = e;
        appData.alertTipType = t;
        setTimeout(function () {
            appData.isShowAlertTip = !1;
        }, 1e3);
    },

    showGameRule: function () {
        if (4 != appData.roomStatus) {
            $(".createRoom .mainPart").css("height", "60vh");
            $(".createRoom .mainPart .blueBack").css("height", "51vh");
            appData.ruleInfo.isShowRule = !0;
        }
    },
    cancelGameRule: function () {
        appData.ruleInfo.isShowRule = !1;
        $(".createRoom .mainPart").css("height", "65vh");
        $(".createRoom .mainPart .blueBack").css("height", "46vh");
    },
    showBreakRoom: function () {
        if (null != appData.breakData && void 0 != appData.breakData) {
            viewMethods.gameOverNew(appData.breakData.data.score_board, appData.breakData.data.balance_scoreboard);
        }
        chooseBigWinner();
        $(".ranking .rankBack").css("opacity", "1");
        $(".roundEndShow").show();
        $(".ranking").show();
        canvas();
    },
    showAudioSetting: function () {
        appData.editAudioInfo.backMusic = appData.audioInfo.backMusic;
        appData.editAudioInfo.messageMusic = appData.audioInfo.messageMusic;
        appData.editAudioInfo.isShow = !0;
    },
    cancelAudioSetting: function () {
        appData.editAudioInfo.isShow = !1
    },
    confirmAudioSetting: function (once) {
        console.log(once);
        console.log(appData.musicOnce);
        if (once == '1' && appData.musicOnce) {
            appData.audioInfo.backMusic = 1;
            setTimeout(function () {
                audioModule.stopSound('backMusic');
            }, 200);
            setTimeout(function () {
                audioModule.playSound('backMusic', true);
            }, 500);
            appData.musicOnce = false;
        }
        if (once == '1' && !appData.musicOnce) {
            return;
        }
        if (appData.editAudioInfo.backMusic == 1) {
            appData.editAudioInfo.backMusic = 0
            appData.editAudioInfo.messageMusic = 0
        } else {
            appData.editAudioInfo.backMusic = 1
            appData.editAudioInfo.messageMusic = 1
        }
        appData.editAudioInfo.isShow = false;
        appData.audioInfo.backMusic = appData.editAudioInfo.backMusic;
        appData.audioInfo.messageMusic = appData.editAudioInfo.messageMusic;
        localStorage.backMusic = appData.editAudioInfo.backMusic;
        localStorage.messageMusic = appData.editAudioInfo.messageMusic;

        if (appData.audioInfo.backMusic == 1) {
            audioModule.stopSound('backMusic');
            audioModule.playSound('backMusic', true);
            appData.musicOnce = false;
        } else {
            audioModule.stopSound('backMusic');
        }
    },
    setBackMusic: function () {
        if (0 == appData.editAudioInfo.backMusic) {
            appData.editAudioInfo.backMusic = 1;
        } else {
            appData.editAudioInfo.backMusic = 0;
        }
    },
    setMessageMusic: function () {
        if (0 == appData.editAudioInfo.messageMusic) {
            appData.editAudioInfo.messageMusic = 1;
        } else {
            appData.editAudioInfo.messageMusic = 0;
        }
    },
    reloadView: function () {
        window.location.href = window.location.href + "&id=" + 1000 * Math.random();
    },
    showNoteImg: function () {
        appData.isShowNoteImg = !0
    },
    hideNoteImg: function () {
        appData.isShowNoteImg = !1
    },
};
//audioModule.loadAllAudioFile();
//Vue生命周期
var vueLife = {
    vmCreated: function () {
        logMessage('vmCreated')
        if (globalData.roomStatus != 4) {
            $("#loading").hide();
            $(".main").show();
        }

    },
    vmUpdated: function () {
        logMessage('vmUpdated');
    },
    vmMounted: function () {
        logMessage('vmMounted');
    },
    vmDestroyed: function () {
        logMessage('vmDestroyed');
    }
};
viewMethods.initialize();

if (globalData.roomStatus == 4) {
    console.log("gameOver");
    try {
        var obj = eval('(' + globalData.scoreboard + ')');
        setTimeout(function () {
            socketModule.processLastScoreboard(obj);
        }, 0)
    } catch (error) {
        setTimeout(function () {
            socketModule.processLastScoreboard("");
        }, 0)
    }

}
//Vue实例
var vm = new Vue({
    el: '#app-main',
    data: appData,
    methods: viewMethods,
    created: vueLife.vmCreated,
    updated: vueLife.vmUpdated,
    mounted: vueLife.vmMounted,
    destroyed: vueLife.vmDestroyed,
});

function preventDefaultFn(event) {
    event.preventDefault();
}

var wsctop = 0;

function disable_scroll() {
    //wsctop = $(window).scrollTop(); //记住滚动条的位置
    //$("body").addClass("modal-show");
    $('body').on('touchmove', preventDefaultFn);
}

function enable_scroll() {
    //$("body").removeClass("modal-show");
    //$(window).scrollTop(wsctop); //弹框关闭时，启动滚动条，并滚动到原来的位置
    $('body').off('touchmove', preventDefaultFn);
}

var newNum = "";
var startX, startY, endX, endY;
//积分榜
$(function () {
    $(document).on("touchend", ".myCard", function () {

        var num = $(this).attr("data-num");
        if (!appData.cardList[num].isChoose) {
            appData.cardList[num].isSelect = !appData.cardList[num].isSelect;
        }

    });

    $(".showRanking").click(function () {
        $(".Ranking").show();
    })

    $(".hideRanking").click(function () {
        $(".Ranking").hide();
    })

    window.onload = function () {

        var cardTouch = false;
        var cardPart = document.getElementById("myCards");

        if (cardPart != undefined) {
            function touchStart(event) {
                cardTouch = true;
                var touch = event.touches[0];
                startX = touch.pageX - cardPart.offsetLeft;
                startY = touch.pageY - cardPart.offsetTop;
            }

            function touchMove(event) {
                var touch = event.touches[0];
                endX = touch.pageX - cardPart.offsetLeft;
                endY = touch.pageY - cardPart.offsetTop;
                viewMethods.selectCardTemp();
                event.preventDefault();
            }

            function touchEnd(event) {
                cardTouch = false;

                for (var i = 0; i < appData.cardList.length; i++) {
                    if (appData.cardList[i].isChoose) {
                        appData.cardList[i].isSelect = !appData.cardList[i].isSelect;
                    }
                    //	appData.cardList[i].isChoose=false;
                }
                setTimeout(function () {
                    for (var i = 0; i < appData.cardList.length; i++) {
                        appData.cardList[i].isChoose = false;
                    }
                }, 0)

            }

            cardPart.addEventListener("touchstart", touchStart, false);
            cardPart.addEventListener("touchmove", touchMove, false);
            cardPart.addEventListener("touchend", touchEnd, false);
        }


        var end = document.getElementById("body");
        end.addEventListener("touchmove", touchMove1, false);

        function touchMove1(event) {
            if (appData.isShowMessage == false) {
                if (!cardTouch && !appData.isShowRecord) {
                    event.preventDefault();
                }
            }

        }
    };

    //copy url
    var fuzhiMain = {
        init: function () {
            $('#tips').show();
            setTimeout(function () {
                $('#tips').hide();
            }, 2000);
            var clipboard = new ClipboardJS('#copy_btn');
            clipboard.on('success', function (e) {
                e.clearSelection();
                console.log(e.clearSelection);
            });
            if ("undefined" != typeof globalData.isXianliao && globalData.isXianliao == 1) {
                console.log('闲聊')
                var copyTitle = globalData.xlTitle
            } else if ("undefined" != typeof globalData.isWechat && globalData.isWechat == 1) {
                console.log('微信')
                var copyTitle = globalData.shareTitle;
            } else {
                console.log('普通')
                var copyTitle = document.title;
            }
            var copyLink = document.getElementById("room_str");
            copyLink.value = copyTitle + window.location.href;
        },
        link: function () {
            console.log('link')
            var str = navigator.userAgent.toLowerCase();
            var ver = str.match(/cpu iphone os (.*?) like mac os/);
            if (!ver) {
                this.init();
            } else {
                if (parseInt(ver[1].replace(/_/g, ".")) < 10) {
                    var copyLink = document.getElementById("main");
                    var copyTitle = document.title;
                    copyLink.innerHTML = '乐酷大厅：' + copyTitle + window.location.href;
                    $('#dialog').show();
                } else {
                    this.init();
                }
            }

        },
        closeDialog: function () {
            $('#dialog').hide();
        },

    }


    sessionStorage.isPaused = "false";
    var hidden, visibilityChange;

    if (typeof document.hidden !== "undefined") {
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }

    function handleVisibilityChange() {
        if (document[hidden]) {
            audioModule.audioOn = false;
            audioModule.stopSound("backMusic");
        } else if (sessionStorage.isPaused !== "true") {
            audioModule.audioOn = true;
            audioModule.playSound("backMusic", true);
        }
    }

    if (typeof document.addEventListener === "undefined" || typeof hidden === "undefined") {
        alert("This demo requires a browser such as Google Chrome that supports the Page Visibility API.");
    } else {
        document.addEventListener(visibilityChange, handleVisibilityChange, false);
    }
});
// 旧战绩图
// function canvas() {
//     var target = document.getElementById("ranking");
//     html2canvas(target, {
//         allowTaint: true,
//         taintTest: false,
//         onrendered: function (canvas) {
//             canvas.id = "mycanvas";
//             var dataUrl = canvas.toDataURL('image/jpeg', 0.3);
//             $("#end").attr("src", dataUrl);
//             $(".end").show();
//             $('#loading').hide();
//         }
//     });
// };

//新画布
function canvas() {

    liuliuCreateRanking(appData.playerBoard, function (d) {
        var img = document.createElement('img');
        if (parseInt(appData.playerBoard.score.length) > 6) {
            img.className = 'room-gameover-ten ranking-img';
        } else {
            img.className = 'room-gameover ranking-img';
        }

        img.src = d;
        img.onload = function () {
            setTimeout(function () {
                document.body.style.backgroundColor = '#000000';
                document.body.style.minHeight = 'initial';
                document.body.appendChild(img);
                var div = document.createElement('div');
                div.className = 'search-number-box';
                document.body.appendChild(div);
                var detailedBtn = '<a class="search-number-box-btn" onclick="viewMethods.reviewCard()" style="position: fixed;z-index: 999999;width: 50%;height: 200px;right:0;bottom:0;"></a>';
                div.insertAdjacentHTML("beforeend", detailedBtn);

                // 返回大厅按钮
                var myImage = document.createElement("img");
                myImage.src = globalData.fileUrl + 'files/images/common/icon_home3.png';
                document.body.appendChild(myImage);
                myImage.style.position = "absolute";
                myImage.style.zIndex = "999999999";
                myImage.style.top = "10px";
                myImage.style.width = "50px";
                myImage.style.left = "10px";
                myImage.addEventListener('click', function (ev) {
                    DynLoading.goto('/');
                });

                getRankingSix();
                $('#ranking').remove();
                $('.ranking-img').css({
                    'position': 'absolute',
                    'top': '0',
                    'right': '0',
                    'bottom': '0',
                    'z-index': '999999',
                    'width': '100%',
                    'height': '100%',
                    'background-color': '#000'
                });
                $("#loading").css({'background': '#071a45'});
                //$(document.body).off('touchmove');
            }, 200);
        };
    });
};

function getRankingSix() {
    var win = {
        gameId: 4
    }
    if (document.getElementsByClassName('ranking-img')[0] && document.getElementsByClassName('search-number-box')[0]) {
        var div = document.getElementsByClassName('search-number-box')[0];
        var imag = document.getElementsByClassName('ranking-img')[0];
        var aBtn = document.getElementsByClassName('search-number-box-btn')[0];
        var a = getNaturalSize(imag).width;
        var b = getNaturalSize(imag).height;
        var c = imag.offsetWidth;
        var d = imag.offsetHeight;
        var index = (parseInt(a) / parseInt(b)) / (parseInt(c) / parseInt(d));
        if (parseInt(win.gameId) === 3) {
            changePosition(236, 74, 448, 140);
        } else if (parseInt(win.gameId) === 7) {
            changePosition(236, 74, 441, 150);
        } else if (parseInt(win.gameId) === 14 || parseInt(win.gameId) === 15 || parseInt(win.gameId) === 16 || parseInt(win.gameId) === 17 || parseInt(win.gameId) === 18 || parseInt(win.gameId) === 19 || parseInt(win.gameId) === 20 || parseInt(win.gameId) === 22 || parseInt(win.gameId) === 23 || parseInt(win.gameId) === 24 || parseInt(win.gameId) === 25) {
            changePosition(217, 73, 400, 167);
        } else {
            changePosition(236, 74, 419, 125);
        }

        function changePosition(btnWidth, btnHeight, btnLeft, btnBottom) {
            if (index > 1) {
                var width = c;
                var height = b / a * c;
                div.style.top = (d - b / a * c) / 2 + 'px';
                div.style.left = '0px';
            } else if (index < 1) {
                var width = a / b * d;
                var height = d;
                div.style.top = '0px';
                div.style.left = (c - a / b * d) / 2 + 'px';
            } else {
                var width = c;
                var height = d;
                div.style.top = '0px';
                div.style.left = '0px';
            }
            //aBtn.style.width = width * (btnWidth / a) + 'px';
            //aBtn.style.height = height * (btnHeight / b) + 'px';
            //aBtn.style.left = width * (btnLeft / a) + 'px';
            //aBtn.style.top = height * ((b - btnBottom) / b) + 'px';
        }

        function getNaturalSize(Domlement) {
            var natureSize = {};
            if (window.naturalWidth && window.naturalHeight) {
                natureSize.width = Domlement.naturalWidth;
                natureSize.height = Domlement.naturalHeight;
            } else {
                var img = new Image();
                img.src = Domlement.src;
                natureSize.width = img.width;
                natureSize.height = img.height;
            }
            return natureSize;
        }
    }
};

var storage = {
    get: function (key) {
        var data = false;
        if (key.indexOf('.') > 0) {
            var arr = key.split('.');
            if (this.item(arr[0])) {
                data = this.item(arr[0]);
                for (var i in arr) {
                    if (i == 0) continue;
                    if (data[arr[i]] !== undefined) {
                        data = data[arr[i]];
                    } else return false;
                }
            } else {
                return false;
            }
        } else if (this.item(key)) data = this.item(key);
        return data;
    }, set: function (key, value) {
        if (value === undefined) return false;
        var data = [];
        var datas = null;
        var _dt = null;
        if (key.indexOf('.') > 0) {
            var arr = key.split('.');
            if (this.item(arr[0])) {
                datas = this.item(arr[0]);
                data = datas;
                for (var i in arr) {
                    if (i == 0) continue;
                    if (data[arr[i]] !== undefined) {
                        _dt = data;
                        data = data[arr[i]];
                    } else {
                        if (i == arr.length - 1) {
                            data[arr[i]] = '';
                            _dt = data;
                            data = data[arr[i]];
                        } else return false
                    }
                }
            } else {
                return false;
            }
        } else if (this.item(key)) data = this.item(key);
        data = value;
        if (datas === null) {
            this.item(key, data);
        } else {
            _dt[arr[arr.length - 1]] = data;
            this.item(arr[0], datas);
        }
        return true;
    }, inset: function (key, value) {
        var data = [];
        var datas = null;
        var _dt = null;
        if (key.indexOf('.') > 0) {
            var arr = key.split('.');
            if (this.item(arr[0])) {
                datas = this.item(arr[0]);
                data = datas;
                for (var i in arr) {
                    if (i == 0) continue;
                    if (data[arr[i]] !== undefined) {
                        if (i == arr.length - 1) _dt = data;
                        data = data[arr[i]];
                    } else return false;
                }
            } else {
                return false;
            }
        } else if (this.item(key)) data = this.item(key);
        if (typeof (data) != 'object') return false;
        data.push(value);
        if (datas === null) {
            this.item(key, data);
        } else {
            _dt[arr[arr.length - 1]] = data;
            this.item(arr[0], datas);
            data = datas;
        }
        return data;
    }, outset: function (key, value) {
        var data = [];
        var datas = null;
        var _dt = null;
        if (key.indexOf('.') > 0) {
            var arr = key.split('.');
            if (this.item(arr[0])) {
                datas = this.item(arr[0]);
                data = datas;
                for (var i in arr) {
                    if (i == 0) continue;
                    if (data[arr[i]] !== undefined) {
                        if (i == arr.length - 1) _dt = data;
                        data = data[arr[i]];
                    } else return false;
                }
            } else {
                return false;
            }
        } else if (this.item(key)) data = this.item(key);
        if (typeof (data) != 'object') return false;
        var _data = [];
        for (var i in data) {
            if (data[i] !== value) _data.push(data[i]);
        }
        data = _data;
        if (datas === null) {
            this.item(key, data);
        } else {
            _dt[arr[arr.length - 1]] = data;
            this.item(arr[0], datas);
            data = datas;
        }
        return data;
    }, pop: function (key, way) {
        var way = way || 1;
        var data = [];
        var datas = null;
        var _dt = null;
        if (key.indexOf('.') > 0) {
            var arr = key.split('.');
            if (this.item(arr[0])) {
                datas = this.item(arr[0]);
                data = datas;
                for (var i in arr) {
                    if (i == 0) continue;
                    if (data[arr[i]] !== undefined) {
                        if (i == arr.length - 1) _dt = data;
                        data = data[arr[i]];
                    } else return false;
                }
            } else {
                return false;
            }
        } else if (this.item(key)) data = this.item(key);
        if (way == 1)
            var rs = data.pop(); else
            var rs = data.shift();
        if (datas === null) {
            this.item(key, data);
        } else {
            _dt[arr[arr.length - 1]] = data;
            this.item(arr[0], datas);
        }
        return rs;
    }, shift: function (key) {
        return this.pop(key, -1);
    }, incr: function (key, value) {
        if (typeof (value) != 'number') value = 1;
        var data = [];
        var datas = null;
        var _dt = null;
        if (key.indexOf('.') > 0) {
            var arr = key.split('.');
            if (this.item(arr[0])) {
                datas = this.item(arr[0]);
                data = datas;
                for (var i in arr) {
                    if (i == 0) continue;
                    if (data[arr[i]] !== undefined) {
                        if (i == arr.length - 1) _dt = data;
                        data = data[arr[i]];
                    } else return false;
                }
            } else {
                return false;
            }
        } else if (this.item(key)) data = this.item(key);
        if (typeof (data) == 'number') {
            data += value;
        } else {
            return false;
        }
        if (datas === null) {
            this.item(key, data);
        } else {
            _dt[arr[arr.length - 1]] = data;
            this.item(arr[0], datas);
        }
        return data;
    }, decr: function (key, value) {
        if (typeof (value) != 'number') value = 1;
        var data = [];
        var datas = null;
        var _dt = null;
        if (key.indexOf('.') > 0) {
            var arr = key.split('.');
            if (this.item(arr[0])) {
                datas = this.item(arr[0]);
                data = datas;
                for (var i in arr) {
                    if (i == 0) continue;
                    if (data[arr[i]] !== undefined) {
                        if (i == arr.length - 1) _dt = data;
                        data = data[arr[i]];
                    } else return false;
                }
            } else {
                return false;
            }
        } else if (this.item(key)) data = this.item(key);
        if (typeof (data) == 'number') {
            data -= value;
        } else {
            return false;
        }
        if (datas === null) {
            this.item(key, data);
        } else {
            _dt[arr[arr.length - 1]] = data;
            this.item(arr[0], datas);
        }
        return data;
    }, rm: function (key) {
        if (key.indexOf('.') > 0) {
            var data = [];
            var datas = null;
            var arr = key.split('.');
            if (this.item(arr[0])) {
                datas = this.item(arr[0]);
                data = datas;
                for (var i in arr) {
                    if (i == 0) continue;
                    if (data[arr[i]] !== undefined) {
                        if (i == arr.length - 1) {
                            delete data[arr[i]];
                        } else data = data[arr[i]];
                    } else return false;
                }
                this.item(arr[0], datas);
                return datas;
            } else {
                return false;
            }
        } else {
            this.item(key, null);
            return true;
        }
    }, each: function (key, fn) {
        if (typeof (fn) != 'function') return false;
        var data = [];
        var datas = null;
        var _dt = null;
        if (key.indexOf('.') > 0) {
            var arr = key.split('.');
            if (this.item(arr[0])) {
                datas = this.item(arr[0]);
                data = datas;
                for (var i in arr) {
                    if (i == 0) continue;
                    if (data[arr[i]] !== undefined) {
                        _dt = data;
                        data = data[arr[i]];
                    } else return false
                }
            } else {
                return false;
            }
        } else if (this.item(key)) data = this.item(key);
        if (typeof (data) != 'object') return false;
        for (var i in data) {
            var rs = fn(data[i], i);
            if (rs !== undefined) {
                data[i] = rs;
            }
        }
        if (datas === null) {
            this.item(key, data);
        } else {
            _dt[arr[arr.length - 1]] = data;
            this.item(arr[0], datas);
        }
        return true;
    }, item: function (key, value) {
        if (window.localStorage) {
            if (value === undefined) {
                return this.decode(localStorage.getItem(key)) || false;
            } else if (value === null) return localStorage.removeItem(key); else return localStorage.setItem(key, this.encode(value));
        } else {
            if (value === undefined) {
                var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
                if (arr = document.cookie.match(reg))
                    return this.decode(arr[2]); else
                    return false;
            } else if (value === null) {
                var exp = new Date();
                exp.setTime(exp.getTime() - 1);
                document.cookie = name + "=" + this.encode(value) + ";expires=" + exp.toGMTString();
                return true;
            } else {
                var Days = 30;
                var exp = new Date();
                exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
                document.cookie = name + "=" + this.encode(value) + ";expires=" + exp.toGMTString();
                return true;
            }
        }
    }, encode: function (obj) {
        var str = '';
        try {
            str = JSON.stringify(obj);
        } catch (e) {
            str = decodeURI(obj);
        }
        return str;
    }, decode: function (str) {
        var obj = '';
        try {
            obj = JSON.parse(str);
        } catch (e) {
            obj = encodeURI(str);
        }
        return obj;
    }
};

function loadimg(pics, func, error_path) {
    if (typeof (pics) == 'string') var pics = [pics];
    var error_path = error_path || globalData.fileUrl + 'files/images/common/default_head.png';
    var _pics = [];
    var count = 0;

    function createImg(data, i, name) {
        var img = new Image();
        img.src = data;
        img.onload = function () {
            _pics[i] = this;
            count++;
            if (count == pics.length && typeof (func) == 'function') {
                func(_pics);
            }
            if (name) {
                var cvs = document.createElement('canvas');
                cvs.width = this.width;
                cvs.height = this.height;
                cvs.getContext('2d').drawImage(this, 0, 0, this.width, this.height);
                storage.set(name, cvs.toDataURL("image/png"));
            }
        };
        img.onerror = function () {
            var name = pics[i].replace(/\W/g, '');
            storage.rm(name);
            win.reload();
        }
    }

    for (var i in pics) {
        var src = pics[i];
        var name = src.replace(/\W/g, '');
        var data = storage.get(name);
        if (data) {
            createImg(data, i);
        } else {
            if (window.XMLHttpRequest)
                var xhr = new XMLHttpRequest(); else if (window.ActiveXObject)
                var xhr = new ActiveXObject('Microsoft.XMLHTTP'); else {
                alert("Your browser does not support XMLHTTP.");
                return false;
            }
            xhr._index = i;
            xhr._name = name;
            xhr._src = src;
            xhr.open("get", src, true);
            xhr.responseType = 'blob';
            xhr.onreadystatechange = function () {
                if (this.readyState == 4) {
                    var data = window.URL.createObjectURL(this.response);
                    createImg(data, this._index, this._name);
                }
            };
            xhr.onerror = function () {

                if (window.XMLHttpRequest)
                    var xhr2 = new XMLHttpRequest(); else if (window.ActiveXObject)
                    var xhr2 = new ActiveXObject('Microsoft.XMLHTTP'); else {
                    alert("Your browser does not support XMLHTTP.");
                    return false;
                }
                xhr2._index = this._index;
                xhr2._name = this._name;
                xhr2.open("get", globalData.baseUrl + 'getjpg/wx?avatarurl=' + this._src + '&r=' + Math.random(), true);
                //alert("error1 : "+ this._index +":" + globalData.baseUrl+'getjpg/wx?avatarurl='+this._src);
                xhr2.responseType = 'blob';
                xhr2.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        var data2 = window.URL.createObjectURL(this.response);
                        createImg(data2, this._index, this._name);
                    }
                };
                xhr2.onerror = function (err) {
                    createImg(error_path, this._index);
                }
                xhr2.ontimeout = function () {
                    createImg(error_path, this._index);
                };
                xhr2.send();

            };
            xhr.ontimeout = function () {
                createImg(error_path, this._index);
            };
            xhr.send();
        }
    }
    return true;
}

function liuliuCreateRanking(data, func) {
    var win = {
        width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
        height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
        version: '1.0.0',
        ws: {},
        status: 0,
        readed: 0,
        gameId: 0,
    }

    var users = data.score;

    var room_number = globalData.roomNumber;
    var num = data.round;
    var sum = appData.game.total_num;
    var datetime = data.record;
    var width = 750;
    var height = 1216;
    var pics = [globalData.fileUrl + 'files/images/landlord/rank_frame.jpg', globalData.fileUrl + 'files/images/common/people_bg.png', globalData.fileUrl + 'files/images/common/ranking_icon.png'];
    if (users.length > 6) {
        pics.push(globalData.fileUrl + 'files/images/common/people_bg2.jpg');
        pics.push(globalData.fileUrl + 'files/images/common/people_bg4.jpg');
        height += 102 * (users.length - 6);
    } else {
        pics.push(globalData.fileUrl + 'files/images/common/people_bg4.jpg');
    }
    for (var i = 0; i < users.length; i++) {
        pics.push(users[i].avatar);
        // if (/\/+[064]{1,2}$/.test(users[i].nickname)) pics.push('https://cdn-1255620552.file.myqcloud.com/images/default_head.png'); else pics.push(users[i].nickname.replace(/\/\d{1,3}$/, '/64'));
    }
    loadimg(pics, function (imgs) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext('2d');
        context.drawImage(imgs[0], 0, 0, width, width / 750 * 1216);
        var text = '房间号：' + room_number + '                     ' + datetime + '   ' + num + '/' + sum + '局';
        context.font = "19px 微软雅黑";
        context.textAlign = 'center';
        context.fillStyle = "#a28080";
        context.fillText(text, 375, 412);
        for (var i = 0; i < users.length; i++) {
            if (i >= 6) context.drawImage(imgs[3], 0, 430 + i * 102, 750, 102);
            var n = parseInt(i) + parseInt(users.length > 6 ? 5 : 4);
            context.drawImage(imgs[n], 170, 446 + i * 102, 59, 59);
            context.drawImage(imgs[1], 129, 430 + i * 102, 490, 90);
            var textwidth = 250;
            context.font = "24px 微软雅黑";
            context.textAlign = 'start';
            context.fillStyle = "#666666";
            var arr = users[i].nickname.split('');
            var txt = '', row = [];
            for (var j in arr) {
                if (context.measureText(txt).width >= textwidth) {
                    row.push(txt);
                    txt = '';
                }
                txt += arr[j];
            }
            if (txt != '') row.push(txt);
            if (row.length == 1) {
                context.fillText(row[0], 240, 482 + 102 * i);
            } else {
                context.fillText(row[0], 240, 470 + 102 * i);
                context.fillText(row[1], 240, 498 + 102 * i);
            }
            context.font = "36px 微软雅黑";
            context.textAlign = 'center';
            if (users[i]['account_score'] > 0) {
                context.fillStyle = "#cd5908";
                context.fillText('+' + users[i]['account_score'], 560, 490 + 102 * i);
            } else if (users[i]['account_score'] < 0) {
                context.fillStyle = "#32b16c";
                context.fillText(users[i]['account_score'], 560, 490 + 102 * i);
            } else {
                context.fillStyle = "#989898";
                context.fillText('0', 560, 490 + 102 * i);
            }
            if (users[i]['account_score'] == users[0]['account_score']) {
                context.drawImage(imgs[2], 108, 430 + i * 102, 51, 84);
            }
        }
        if (i > 6) {
            context.drawImage(imgs[4], 0, 430 + (i) * 102, 750, 175);
        } else {
            context.drawImage(imgs[3], 0, canvas.height - 175, 750, 175);
        }
        var tips = '游戏对战成绩记录仅为游戏规则体现，不具备货币属性';
        context.font = "24px 微软雅黑";
        context.textAlign = 'center';
        context.fillStyle = "#c7bb92";
        context.fillText(tips, canvas.width / 2, canvas.height - 15);
        if (typeof (func) == 'function') func(canvas.toDataURL("image/png"));
    });
}

function chooseBigWinner() {
    //对积分榜排序
    appData.playerBoard.score.sort(function (a, b) {
        return b.account_score - a.account_score;
    });

    var length = appData.playerBoard.score.length;
    var maxScore = 1;
    for (var i = 0; i < length; i++) {
        appData.playerBoard.score.isBigWinner = 0;
        if (appData.playerBoard.score[i].account_score > maxScore) {
            maxScore = appData.playerBoard.score[i].account_score;
        }
    }

    for (var j = 0; j < length; j++) {
        if (appData.playerBoard.score[j].account_score == maxScore) {
            appData.playerBoard.score[j].isBigWinner = 1;
        }
    }
}

function logMessage(message) {
    // console.log(message);
};

var shareContent = '';

function getShareContent() {
    shareContent = "\n";
    if (appData.rullInfo.base_score == 1) {
        shareContent = shareContent + '底分：1分';
    } else if (appData.rullInfo.base_score == 5) {
        shareContent = shareContent + '底分：5分';
    } else {
        shareContent = shareContent + '底分：10分';
    }

    if (appData.rullInfo.ask_mode == 1) {
        shareContent = shareContent + '  规则：轮流问地主';
    } else {
        shareContent = shareContent + '  规则：随机问地主';
    }

    if (appData.rullInfo.ticket_count == 1) {
        shareContent = shareContent + '  房卡：6局x1张房卡';
    } else {
        shareContent = shareContent + '  房卡：12局x2张房卡';
    }
};


var isLoadAudioFile = false;
audioModule.loadAllAudioFile();
audioModule.audioOn = true;
audioModule.stopSound("backMusic");
audioModule.playSound("backMusic", true);
wx.ready(function () {

    audioModule.loadAllAudioFile();

    wx.hideMenuItems({
        menuList: ["menuItem:copyUrl", "menuItem:share:qq", "menuItem:share:weiboApp", "menuItem:favorite", "menuItem:share:facebook", "menuItem:share:QZone", "menuItem:refresh"]
    });

    getShareContent();

    wx.onMenuShareTimeline({
        title: globalData.shareTitle + '(房间号:' + globalData.roomNumber + ')',
        desc: shareContent,
        link: globalData.roomUrl,
        imgUrl: globalData.fileUrl + "files/images/landlord/share_icon.jpg",
        success: function () {
        },
        cancel: function () {
        }
    });

    wx.onMenuShareAppMessage({
        title: globalData.shareTitle + '(房间号:' + globalData.roomNumber + ')',
        desc: shareContent,
        link: globalData.roomUrl,
        imgUrl: globalData.fileUrl + "files/images/landlord/share_icon.jpg",
        success: function () {
        },
        cancel: function () {
        }
    });
});

wx.error(function (a) {
});