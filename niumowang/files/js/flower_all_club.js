var ws;
var game = {
    "room": 0,
    "room_number": globalData.roomNumber,
    "score": 0,
    "status": 0,
    "time": -1,
    "round": 0,
    "total_num": 10,
    "currentScore": 0,
    "cardDeal": 0,
    "can_open": 0,
    "can_look": 1,
    "is_play": false,
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
    CardInfo: "CardInfo",
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
    WinJoy: "WinJoy",
    HuanPai: "HuanPai",
    huanpaiNotify: "huanpaiNotify",
    //观战功能
    GuestRoom: "GuestRoom",
    AllGuestInfo: "AllGuestInfo",
    UpdateGuestInfo: "UpdateGuestInfo",
    MyCards: "MyCards",
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
    //观战功能
    processGuestRoom: function (e) {
        appData.game.room = e.data.room_id;
        appData.game.round = Math.ceil(e.data.game_num);
        appData.game.total_num = Math.ceil(e.data.total_num);
        appData.game.score = Math.ceil(e.data.pool_score);
        appData.game.status = Math.ceil(e.data.room_status);

        appData.game.currentScore = Math.ceil(e.data.benchmark);

        if (2 == appData.game.status) {
            appData.game.cardDeal = 3;
        }

        appData.scoreboard = e.data.scoreboard;
        viewMethods.clickCloseAlert();
        appData.showGuest = 0;
    },
    processAllGuestInfo: function (e) {
        appData.guests = [];
        if (e.data) {
            for (var t = 0; t < e.data.length; t++) {
                appData.guests.push({
                    account_id: e.data[t].account_id,
                    avatar: e.data[t].headimgurl,
                    nickname: e.data[t].nickname
                });
                for (var a = 0; a < appData.player.length; a++)
                    if (appData.player[a].account_id == e.data[t].account_id) {
                        appData.player[a].is_guest = 1;
                        if (appData.player[a].account_status < 1) {
                            appData.player[a].account_id = 0;
                        }
                    }
            }
        }
        appData.isWatching = 0;
        for (var i = 0; i < appData.guests.length; i++) {
            if (appData.guests[i].account_id == userData.account_id) {
                appData.isWatching = 1;
            }
        }
    },
    processUpdateGuestInfo: function (e) {
        for (a = 0; a < appData.guests.length; a++) {
            if (appData.guests[a].account_id == e.data.account_id) {
                break;
            }
        }
        if (e.data.is_guest == 1) {
            if (a == appData.guests.length) {
                appData.guests.push({
                    account_id: e.data.account_id,
                    avatar: e.data.headimgurl,
                    nickname: e.data.nickname
                });
            }
            for (var n = 0; n < appData.player.length; n++) {
                if (appData.player[n].account_id == e.data.account_id) {
                    appData.player[n].is_guest = 1;
                    if (appData.player[n].account_status < 1) {
                        appData.player[n].account_id = 0;

                        appData.showSitdownButton = appData.isWatching;
                    }
                }
            }
        } else {
            appData.guests.splice(a, 1);
        }
    },
    closeSocket: function () {
        if (ws) {
            try {
                ws.close();
            } catch (error) {
                console.log(error);
            }
        }
    },
    sendData: function (e) {
        try {
            if (console.log("websocket state：" + ws.readyState), ws.readyState == WebSocket.CLOSED) return void reconnectSocket();
            ws.readyState == WebSocket.OPEN ? ws.send(JSON.stringify(e)) :
                ws.readyState == WebSocket.CONNECTING ? setTimeout(function () {
                    socketModule.sendData(e)
                }, 1e3) : (console.log("websocket state：" + ws.readyState),
                    errorSocket(e.operation, JSON.stringify(e)))
        } catch (e) {
            console.log(e)
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
        var userData = methods.setUserData(obj.data);
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
        methods.showResultTextFunc('设置成功');
        delC('userData');
    },
    sendPrepareJoinRoom: function () {
        socketModule.sendData({
            operation: wsOperation.PrepareJoinRoom,
            account_id: userData.account_id,
            data: {
                room_number: globalData.roomNumber,
                token: globalData.tk
            }
        });
    },
    sendJoinRoom: function () {
        socketModule.sendData({
            operation: wsOperation.JoinRoom,
            account_id: userData.account_id,
            data: {
                room_number: globalData.roomNumber,
                token: globalData.tk
            }
        });
    },
    //观战功能
    sendGuestRoom: function () {
        socketModule.sendData({
            operation: wsOperation.GuestRoom,
            account_id: userData.account_id,
            data: {
                room_number: globalData.roomNumber,
                token: globalData.tk
            }
        });
    },
    sendRefreshRoom: function () {
        socketModule.sendData({
            operation: wsOperation.RefreshRoom,
            account_id: userData.account_id,
            data: {
                room_id: appData.game.room,
                token: globalData.tk
            }
        });
    },
    sendReadyStart: function () {
        socketModule.sendData({
            operation: wsOperation.ReadyStart,
            account_id: userData.account_id,
            data: {
                room_id: appData.game.room,
                token: globalData.tk
            }
        });
    },
    sendBroadcastVoice: function (num) {
        socketModule.sendData({
            operation: wsOperation.BroadcastVoice,
            account_id: userData.account_id,
            data: {
                room_id: appData.game.room,
                voice_num: num,
                token: globalData.tk
            }
        });
    },

    sendClickToLook: function () {
        socketModule.sendData({
            operation: wsOperation.ClickToLook,
            account_id: userData.account_id,
            data: {
                room_id: appData.game.room,
                token: globalData.tk
            }
        });
    },
    sendHuanPai: function () {
        socketModule.sendData({
            operation: wsOperation.HuanPai,
            account_id: userData.account_id,
            data: {
                room_id: appData.game.room,
                card: appData.changeCardType,
                token: globalData.tk
            }
        });
    },
    sendChooseChip: function (num) {
        socketModule.sendData({
            operation: wsOperation.ChooseChip,
            account_id: userData.account_id,
            data: {
                room_id: appData.game.room,
                score: num,
                token: globalData.tk
            }
        });
    },
    sendDiscard: function () {
        socketModule.sendData({
            operation: wsOperation.Discard,
            account_id: userData.account_id,
            data: {
                room_id: appData.game.room,
                token: globalData.tk
            }
        });
    },
    sendOpenCard: function () {
        socketModule.sendData({
            operation: wsOperation.OpenCard,
            account_id: userData.account_id,
            data: {
                room_id: appData.game.room,
                token: globalData.tk
            }
        });
    },
    sendPkCard: function (num) {
        socketModule.sendData({
            operation: wsOperation.PkCard,
            account_id: userData.account_id,
            data: {
                room_id: appData.game.room,
                'other_account_id': num,
                token: globalData.tk
            }
        });
    },
    getScoreBoard: function () {
        socketModule.sendData({
            operation: "getScoreBoard",
            data: {
                room_id: appData.game.room,
                num: globalData.roomNumber,
                type: globalData.gameType,
                token: globalData.tk
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
        if (obj.data.chip_type) {
            appData.ruleInfo.chip_type = obj.data.chip_type;
            appData.ruleInfo.disable_pk = obj.data.disable_pk;
            appData.ruleInfo.disable_look = obj.data.disable_look;
            appData.ruleInfo.pk_round = obj.data.pk_round;
            appData.ruleInfo.ticket_count = obj.data.ticket_count;
            appData.ruleInfo.upper_limit = obj.data.upper_limit;
            appData.ruleInfo.default_score = obj.data.default_score;
            appData.ruleInfo.pk_score = obj.data.pk_score;
            appData.ruleInfo.look_score = obj.data.look_score;
            appData.ruleInfo.play_mode = obj.data.play_mode;
            appData.ruleInfo.is_big_flower = obj.data.is_big_flower;
            appData.ruleInfo.is_qp_tp = obj.data.is_qp_tp;
            appData.ruleInfo.joy_card_bz = obj.data.joy_card_bz;
            appData.ruleInfo.joy_card_ths = obj.data.joy_card_ths;
            appData.ruleInfo.upper_limit = obj.data.upper_limit;


            if (appData.ruleInfo.disable_look == 1 && appData.ruleInfo.disable_pk == 1) {
                appData.ruleInfo.rule_height = 60;
            } else {
                appData.ruleInfo.rule_height = 30;
            }
            methods.setChipType();
        }
    },
    processPrepareJoinRoom: function (obj) {
        if (obj.data.is_club) {
            if (obj.data.is_club == 1) {
                appData.isShowApply = true;
                appData.applyInfo.club_headimgurl = obj.data.club_headimgurl;
                appData.applyInfo.club_name = obj.data.club_name;
                appData.applyInfo.club_id = obj.data.room_creator;
                // viewMethods.clickShowAlert(1, '无法加入，请联系管理员');
                return;
            }
        }
        if (obj.data.room_status == 4) {
            $("#loading").show();
            //appData.roomStatus = obj.data.room_status;
            //viewMethods.roundEnd(1);
            appData.roomStatus = obj.data.room_status;
            viewMethods.clickShowAlert(2, obj.result_message);
            return;
        }
        // socketModule.gAC();

        appData.swop_score = obj.data.swop_score;
        appData.bet_round = obj.data.bet_round;
        appData.bet_round_now = obj.data.bet_round_now;
        appData.curr_circle = obj.data.bet_round_now;
        appData.play_type = obj.data.play_type;
        appData.disable_pk = obj.data.disable_pk;
        ruleInfo.play_mode = obj.data.play_mode;
        ruleInfo.laizi_num = obj.data.laizi_num;
        if (appData.play_type == 5) {
            appData.is_super = true;
            $('.myCards').css('left', '35%');
        }
        if (localStorage.showSwopBtn === 'true' && appData.play_type == 4) {
            appData.showSwopBtn = true;
        } else {
            appData.showSwopBtn = false;
        }
        appData.swopStatus = false;
        appData.swopBtnActive = false;

        appData.canChooseCard = false;
        appData.cardUp = false;
        localStorage.removeItem('swopStatus');
        localStorage.removeItem('swopBtnActive');
        localStorage.removeItem('canChooseCard');
        localStorage.removeItem('cardUp');

        appData.swopBtnActive = false;

        this.processGameRule(obj);  //复用规则


        //观战功能
        if (obj.data.is_member) {
            socketModule.sendJoinRoom();
        } else {
            if (obj.data.can_join) {
                if (obj.data.can_guest) {
                    appData.joinType = 1;
                    if (obj.data.room_users.length >= 1) {
                        //obj.data.alert_text = "房间里有" + obj.data.room_users.join("、") + "，是否加入？";
                        appData.room_users = obj.data.room_users;
                        console.log(appData.alertText)
                    } else {
                        obj.data.alert_text = "";
                    }
                } else {
                    appData.joinType = 2;
                    if (obj.data.room_users.length >= 1) {
                        //obj.data.alert_text = "观战人数已满，房间里有" + obj.data.room_users.join("、") + "，是否加入游戏？";
                        appData.room_users = obj.data.room_users;
                    } else {
                        obj.data.alert_text = "";
                    }
                }
            } else { //不能加入游戏
                if (obj.data.can_guest) {
                    appData.joinType = 3;
                    if (obj.data.room_users.length >= 1) {
                        obj.data.alert_text = "游戏人数已满，是否加入观战?";
                    } else {
                        obj.data.alert_text = "";
                    }
                } else {
                    appData.joinType = 4;
                    obj.data.alert_text = "游戏和观战人数已满";
                }
            }
            if (obj.data.room_users.length >= 1) {
                appData.alertType = 4;
                appData.alertText = obj.data.room_users;
                appData.isShowGameAlert = true;
            } else {
                socketModule.sendJoinRoom();
            }
        }
    },
    processJoinRoom: function (obj) {
        appData.player = [];
        appData.playerBoard = {
            "score": [],
            "round": 0,
            "record": "",
        };
        for (var i = 0; i < globalData.maxCount; i++) {
            appData.player.push({
                "num": i + 1,
                "serial_num": 0,
                "account_id": 0,
                "account_status": 0,
                "playing_status": 0,
                "online_status": 0,
                "nickname": "",
                "headimgurl": "",
                "account_score": 0,
                "ticket_checked": 0,
                "is_win": false,
                "win_type": 0,
                "limit_time": 0,
                "is_operation": false,
                "win_show": false,
                "lose_show": false,
                "card": [],
                "is_showCard": false,
                "is_pk": false,
                "is_readyPK": false,
                "card_type": 0,
                "messageOn": false,
                "messageText": "",
                poker_kw: 1,
                head_kw: '',
            });

            appData.playerBoard.score.push({
                "account_id": 0,
                "nickname": "",
                "account_score": 0,
                'isBigWinner': 0,
            });
        }

        appData.game.room = obj.data.room_id;
        appData.game.currentScore = Math.ceil(obj.data.benchmark);
        appData.game.score = Math.ceil(obj.data.pool_score);
        appData.game.round = Math.ceil(obj.data.game_num);
        appData.game.total_num = Math.ceil(obj.data.total_num);

        methods.setChipType();

        if (obj.data.limit_time == -1) {
            appData.game.time = Math.ceil(obj.data.limit_time);
            viewMethods.timeCountDown();
        }

        appData.player[0].serial_num = Math.ceil(obj.data.serial_num);

        for (var i = 0; i < appData.player.length; i++) {
            if (i <= appData.player.length - Math.ceil(obj.data.serial_num)) {
                appData.player[i].serial_num = i + Math.ceil(obj.data.serial_num);
            } else {
                appData.player[i].serial_num = i + Math.ceil(obj.data.serial_num) - appData.player.length;
            }
        }

        appData.player[0].account_status = Math.ceil(obj.data.account_status);
        appData.player[0].account_score = Math.ceil(obj.data.account_score);
        appData.player[0].nickname = userData.nickname;
        appData.player[0].headimgurl = userData.headimgurl;
        appData.player[0].account_id = userData.account_id;
        appData.player[0].card = obj.data.cards.concat();
        appData.player[0].card_type = obj.data.card_type;
        appData.player[0].ticket_checked = obj.data.ticket_checked;
        appData.game.status = Math.ceil(obj.data.room_status);

        if (2 == appData.game.status) {
            appData.game.cardDeal = 3;
            if (4 == appData.player[0].account_status) {
                viewMethods.cardOver(0);
            } else if (appData.ruleInfo.play_mode == 2 && appData.player[0].account_status == 5) { //明牌
                viewMethods.seeMyCard();
            }
        }

        appData.scoreboard = obj.data.scoreboard;

        //观战功能
        appData.isWatching = 0;
        setTimeout(function () {
            appData.showGuest = 0
        }, 100);


        // 缓存判断
        if (localStorage.swopStatus === "true" && appData.play_type == 4) {
            appData.swopStatus = true;
        } else if (localStorage.swopStatus === "false" && appData.play_type == 4) {
            appData.swopStatus = false;
        } else {
            localStorage.removeItem('swopStatus');
        }
        if (localStorage.showSwopBtn === "true" && appData.play_type == 4) {
            appData.showSwopBtn = true;
        } else if (localStorage.showSwopBtn === "false" && appData.play_type == 4) {
            appData.showSwopBtn = false;
        } else {
            localStorage.removeItem('showSwopBtn');
        }
        if (localStorage.swopBtnActive === "true" && appData.play_type == 4) {
            appData.swopBtnActive = true;
        } else if (localStorage.swopBtnActive === "false" && appData.play_type == 4) {
            appData.swopBtnActive = false;
        } else {
            localStorage.removeItem('swopBtnActive');
        }
        if (localStorage.canChooseCard === "true" && appData.play_type == 4) {
            appData.canChooseCard = true;
        } else if (localStorage.canChooseCard === "false" && appData.play_type == 4) {
            appData.canChooseCard = false;
        } else {
            localStorage.removeItem('canChooseCard');
        }
        if (localStorage.otherCard && appData.play_type == 5) {
            appData.player[0].other = localStorage.otherCard;
        } else {
            localStorage.removeItem('otherCard');
        }
    },
    processRefreshRoom: function (obj) {
        appData.player = [];
        appData.playerBoard = {
            "score": [],
            "round": 0,
            "record": "",
        }

        for (var i = 0; i < appData.player.length; i++) {
            appData.player.push({
                "num": i + 1,
                "serial_num": 0,
                "account_id": 0,
                "account_status": 0,
                "playing_status": 0,
                "online_status": 0,
                "nickname": "",
                "headimgurl": "",
                "account_score": 0,
                "ticket_checked": 0,
                "is_win": false,
                "win_type": 0,
                "limit_time": 0,
                "is_operation": false,
                "win_show": false,
                "lose_show": false,
                "card": [],
                "is_showCard": false,
                "is_pk": false,
                "is_readyPK": false,
                "card_type": 0,
                "messageOn": false,
                "messageText": "我们来血拼吧",
            });

            appData.playerBoard.score.push({
                "account_id": 0,
                "nickname": "",
                "account_score": 0,
                "isBigWinner": 0,
            });
        }

        appData.game.currentScore = Math.ceil(obj.data.benchmark);
        appData.game.score = Math.ceil(obj.data.pool_score);
        methods.setChipType();


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
                }
            }
        }

        appData.player[0].card = obj.data.cards.concat();
        appData.player[0].card_type = obj.data.card_type;
    },
    processAllGamerInfo: function (obj) {
        if (appData.player[0].account_status == 6) {
            $('.isQuit1').css('left', '70%');
            $('.isSeen1').css('left', '70%');
            $('.isLose1').css('left', '70%');
            $('.isSwop1').css('left', '70%');
        }
        for (var i = 0; i < appData.player.length; i++) {
            for (var j = 0; j < obj.data.length; j++) {
                if (appData.player[i].serial_num == obj.data[j].serial_num) {

                    appData.player[i].is_guest = 0;    //观战功能
                    appData.player[i].nickname = obj.data[j].nickname;
                    appData.player[i].headimgurl = obj.data[j].headimgurl;
                    appData.player[i].account_id = obj.data[j].account_id;
                    appData.player[i].account_score = Math.ceil(obj.data[j].account_score);
                    appData.player[i].account_status = Math.ceil(obj.data[j].account_status);
                    appData.player[i].account_huan_status = Math.ceil(obj.data[j].account_huan_status);
                    appData.player[i].online_status = Math.ceil(obj.data[j].online_status);
                    appData.player[i].ticket_checked = obj.data[j].ticket_checked;
                    appData.player[i].poker_kw = obj.data[j].poker_kw;
                    appData.player[i].head_kw = obj.data[j].head_kw;
                }
                if (appData.player[i].account_id == userData.account_id && appData.isAutoReady == 1 && appData.isWatching != 1 && appData.game.status == 1) {
                    methods.imReady();
                }
            }
        }

        if (appData.player[0].account_status > 2) {
            setTimeout(function () {
                appData.player[0].is_showCard = true;
            }, 500);
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
        }

        if (appData.player[0].account_status > 2) {
            setTimeout(function () {
                appData.player[0].is_showCard = true;
            }, 500);
        }

    },
    processUpdateGamerInfo: function (obj) {

        var has_seat = false;    //观战功能
        for (var i = 0; i < appData.player.length; i++) {
            if (appData.player[i].serial_num == obj.data.serial_num) {
                appData.player[i].nickname = obj.data.nickname;
                appData.player[i].headimgurl = obj.data.headimgurl;
                appData.player[i].account_id = obj.data.account_id;
                appData.player[i].account_score = Math.ceil(obj.data.account_score);
                appData.player[i].account_status = Math.ceil(obj.data.account_status);
                appData.player[i].online_status = Math.ceil(obj.data.online_status);
                appData.player[i].ticket_checked = obj.data.ticket_checked;
                appData.player[i].is_guest = 0;    //观战功能
                appData.player[i].poker_kw = obj.data.poker_kw;
                appData.player[i].head_kw = obj.data.head_kw;
            } else {
                if (appData.player[i].account_id == obj.data.account_id) {
                    socketModule.sendRefreshRoom();
                }
                //观战功能  有位置
                if (appData.player[i].account_id == userData.account_id || 0 == appData.player[i].account_id) {
                    has_seat = true;
                }
            }
        }
        //观战功能
        appData.showSitdownButton = appData.isWatching && has_seat;
        //观战功能  加入游戏的玩家从观战者列表中剔除
        for (a = 0; a < appData.guests.length; a++)
            if (appData.guests[a].account_id == obj.data.account_id) {
                break;
            }
        appData.guests.splice(a, 1);
    },
    processUpdateAccountStatus: function (obj) {
        for (var i = 0; i < appData.player.length; i++) {
            if (appData.player[i].account_id == obj.data.account_id) {
                if (obj.data.online_status == 1) {

                    appData.player[i].account_status = Math.ceil(obj.data.account_status);

                    if (i != 0) {
                        if (appData.player[i].account_status == 4)
                            m4aAudioPlay("audio3");
                        else if (appData.player[i].account_status == 5)
                            m4aAudioPlay("audio4");
                        else if (appData.player[i].account_status == 6)
                            m4aAudioPlay("audio5");
                    } else {
                        appData.player[0].is_operation = false;
                    }
                } else {
                    appData.player[i].online_status = 0;
                    appData.player[i].account_status = Math.ceil(obj.data.account_status);

                    //观战功能   在座玩家观战中离线
                    for (a = 0; a < appData.guests.length; a++)
                        if (appData.guests[a].account_id == obj.data.account_id) {
                            break;
                        }
                    appData.guests.splice(a, 1);

                    if (obj.data.account_status == 0) {
                        //观战功能 有位置可加入
                        appData.showSitdownButton = appData.isWatching;

                        appData.player[i].account_id = 0;
                        appData.player[i].playing_status = 0;
                        appData.player[i].nickname = "";
                        appData.player[i].headimgurl = "";
                        appData.player[i].account_score = 0;
                    }
                }
            }
        }
        if (6 == i) { //观战功能  观战者离线
            for (a = 0; a < appData.guests.length; a++)
                if (appData.guests[a].account_id == obj.data.account_id) {
                    break;
                }
            appData.guests.splice(a, 1);
        }
    },
    processStartLimitTime: function (obj) {
        if (obj.data.limit_time > 1) {
            appData.game.time = Math.ceil(obj.data.limit_time);
            viewMethods.timeCountDown();
        }
    },
    processCancelStartLimitTime: function (obj) {
        appData.game.time = -1;
    },
    processGameStart: function (obj) {

        appData.showSwopBtn = false;
        if (appData.is_super) {
            $('.clickToLook').css('left', '70%');
        }
        appData.swopBtnActive = false;
        if (localStorage.swopStatus === "true") {
            appData.swopStatus = true;
        } else {
            appData.swopStatus = false;
        }
        if (localStorage.swopBtnActive === "true") {
            appData.swopBtnActive = true;
        } else {
            appData.swopBtnActive = false;
        }
        if (localStorage.canChooseCard === "true") {
            appData.canChooseCard = true;
        } else {
            appData.canChooseCard = false;
        }
        appData.curr_circle = 0;

        $('.card3 .cardLayer').removeClass('choosed');

        //开始游戏初始化
        viewMethods.tableReset(0);
        appData.WinJoy = '';
        appData.winJoy_dict = [];
        appData.LoseJoy = '';
        appData.game.score = 0;
        appData.game.time = -1;
        appData.game.is_play = true;
        appData.game.round = appData.game.round + 1;
        currentPlayerNum = -1;

        for (var i = 0; i < appData.player.length; i++) {
            appData.player[i].is_operation = false;
            appData.player[i].is_showCard = false;
            if (appData.player[i].LoseJoy) {
                appData.player[i].LoseJoy = '';
            }
            if (appData.player[i].WinJoy) {
                appData.player[i].WinJoy = '';
            }
            for (var j = 0; j < obj.data.length; j++) {
                if (appData.player[i].account_id == obj.data[j].account_id) {

                    appData.player[i].ticket_checked = 1;
                    appData.player[i].account_status = Math.ceil(obj.data[j].account_status);
                    appData.player[i].playing_status = Math.ceil(obj.data[j].playing_status);
                    appData.player[i].online_status = Math.ceil(obj.data[j].online_status);
                    appData.player[i].account_huan_status = 0;
                    appData.player[i].account_score = appData.player[i].account_score - Math.ceil(appData.ruleInfo.default_score);
                    appData.player[i].limit_time = Math.ceil(obj.data[j].limit_time);

                    if (appData.player[i].playing_status > 1) {
                        currentPlayerNum = i;
                        if (0 == i) {   //看牌条件
                            appData.game.can_look = Math.ceil(obj.data[j].can_look);
                        }
                    }
                    appData.game.score = appData.game.score + Math.ceil(appData.ruleInfo.default_score);
                    viewMethods.throwCoin(0);
                }
            }
        }

        appData.game.status = 2;
        viewMethods.reDeal();

        if (currentPlayerNum >= 0) {
            viewMethods.playerTimeCountDown();
        }
        appData.pk.round = 0;
    },
    processNotyChooseChip: function (obj) {
        if (appData.is_super) {
            $('.clickToLook').css('left', '70%');
        }

        if (appData.player[0].other && appData.player[0].account_status == 4) {
            $('.card3 .cardLayer').addClass('choosed');
        }

        appData.game.is_play = true;
        appData.curr_circle = obj.data.curr_circle

        currentPlayerNum = -1;

        if (appData.game.status == 2) {
            for (var i = 0; i < appData.player.length; i++) {
                appData.player[i].playing_status = 1;

                if (appData.player[i].account_id == obj.data.account_id) {
                    appData.player[i].is_showCard = true;
                    appData.player[i].is_operation = false;
                    appData.player[i].playing_status = Math.ceil(obj.data.playing_status);
                    appData.player[i].limit_time = Math.ceil(obj.data.limit_time);
                    appData.game.can_open = obj.data.can_open;
                    appData.game.can_look = obj.data.can_look;   //看牌条件
                }

                if (appData.player[i].playing_status > 1) {
                    currentPlayerNum = i;
                }
            }
        }

        appData.pkPeople = obj.data.pk_user.concat();

        if (currentPlayerNum >= 0) {
            viewMethods.playerTimeCountDown();
        }

        if (localStorage.showSwopBtn === 'true') {
            appData.showSwopBtn = true;
        } else {
            appData.showSwopBtn = false;
        }

        if (appData.pk.round != 0) {
            setTimeout(function () {
                appData.pk.round = 0;
            }, 3800)
        }
    },
    processCardInfo: function (obj) {
        appData.player[0].card = obj.data.cards.concat();
        appData.player[0].card_type = obj.data.card_type;
        viewMethods.cardTest();
        if (appData.play_type == 4) {
            appData.showSwopBtn = true;
            localStorage.showSwopBtn = appData.showSwopBtn;
        }
        if (appData.play_type == 5) {
            appData.player[0].other = obj.data.other;
            localStorage.otherCard = obj.data.other;
        }
        if (appData.ruleInfo.play_mode == 2) {    //明牌
            viewMethods.mingCardOver();
        } else {
            viewMethods.cardOver(0);
        }
    },
    processPKCard: function (obj) {
        //pk的时候强制隐藏商城
        appData.isShowGiftBox = false;
        var num1 = 0,
            num2 = 0;

        for (var i = 0; i < appData.player.length; i++) {
            if (appData.player[i].account_id == obj.data.account_id) {
                appData.player[i].account_score = appData.player[i].account_score - Math.ceil(obj.data.score);
                viewMethods.throwCoin(appData.player[i].num, obj.data.score);
            }

            if (appData.player[i].account_id == obj.data.loser_id) {
                appData.player[i].account_status = 7;
                appData.player[i].is_pk = true;
                num1 = i;
            }

            if (appData.player[i].account_id == obj.data.winner_id) {
                appData.player[i].is_pk = true;
                num2 = i;
            }
        }

        appData.game.score = appData.game.score + Math.ceil(obj.data.score);

        viewMethods.playerPK(num1, num2);
    },
    processBroadcastVoice: function (obj) {
        for (var i = 0; i < appData.player.length; i++) {
            if (appData.player[i].account_id == obj.data.account_id && i != 0) {
                var loadMessageNum = 'message' + obj.data.voice_num;
                audioModule.loadAudioFile(globalData.fileUrl + 'files/audio/sound/' + loadMessageNum + '.m4a', loadMessageNum);
                setTimeout(function () {
                    m4aAudioPlay(loadMessageNum);
                }, 200)
                viewMethods.messageSay(i, obj.data.voice_num);
            }
        }
    },

    processUpdateAccountScore: function (obj) {
        for (var i = 0; i < appData.player.length; i++) {
            if (appData.player[i].account_id == obj.data.account_id) {

                appData.player[i].account_score = appData.player[i].account_score - Math.ceil(obj.data.score);

                if (appData.player[i].account_status == 5) {
                    appData.game.currentScore = Math.ceil(obj.data.score) * 2;
                } else {
                    appData.game.currentScore = Math.ceil(obj.data.score);
                }

                appData.game.score = appData.game.score + Math.ceil(obj.data.score);
                if (i != 0 || appData.player[0].account_id != userData.account_id) { //观战功能
                    viewMethods.throwCoin(appData.player[i].num, obj.data.score);
                    m4aAudioPlay(obj.data.score + "f");
                }
            }
        }
    },
    processOpenCard: function (obj) {
        if (!appData.game.is_play) {
            return 0;
        }
        for (var i = 0; i < appData.player.length; i++) {
            if (appData.player[i].account_id == obj.data.account_id) {
                appData.player[i].account_score = appData.player[i].account_score - Math.ceil(obj.data.score);
                appData.game.score = appData.game.score + Math.ceil(obj.data.score);
                viewMethods.throwCoin(appData.player[i].num, obj.data.score);
            }
        }
        $('.cards').removeClass('chooseCard');
    },
    processWinJoy: function (obj) {
        appData.WinJoy = obj.data.players_joy_score;
        var winJoy_dict = [];
        for (var i = 0; i < appData.WinJoy.length; i++) {
            if (appData.WinJoy[i].score < 0) {
                winJoy_dict.push(appData.WinJoy[i].account_id)
            }
        }
        appData.winJoy_dict = winJoy_dict;
    },
    processWin: function (obj) {
        appData.game.is_play = false;
        appData.game.round = Math.ceil(obj.data.game_num);
        appData.game.total_num = Math.ceil(obj.data.total_num);
        appData.playerBoard.round = Math.ceil(obj.data.game_num);

        $('.cards').removeClass('chooseCard');
        if (appData.play_type == 4) {
            $('.cardLayer').removeClass('choosed');
        }
        $(".myCards .card3 .cardLayer").addClass('choosed');
        $('.openCard #otherPlayer').addClass('choosed');

        if (appData.player[0].account_status == 6) {
            $('.cardLayer').removeClass('choosed');
        }

        $(".cardDeal .mcard1").removeClass("card-flipped");
        $(".cardDeal .mcard2").removeClass("card-flipped");

        for (var i = 0; i < appData.player.length; i++) {
            appData.player[i].playing_status = 1;

            if (obj.data.card_type == 0) {

            } else {
                for (var j = 0; j < obj.data.player_cards.length; j++) {
                    if (appData.player[i].account_id == obj.data.player_cards[j].account_id) {
                        appData.player[i].card = obj.data.player_cards[j].cards.concat();
                        appData.player[i].other = obj.data.player_cards[j].other;
                    }
                }
            }

            for (j in obj.data.winner_score_dict) {
                if (appData.player[i].account_id == j) {
                    appData.player[i].is_win = true;
                    appData.player[i].win_type = obj.data.card_type;
                    appData.player[i].current_win = obj.data.winner_score_dict[j];
                    for (var t = 0; t < appData.WinJoy.length; t++) {
                        if (appData.WinJoy[t].account_id == j) {
                            appData.player[i].WinJoy = '';
                            if (appData.WinJoy[t].score == 0) {
                                appData.player[i].WinJoy = '';
                            } else {
                                appData.player[i].WinJoy = appData.WinJoy[t].score;
                            }
                        }
                    }
                }
            }
            for (var z = 0; z < appData.winJoy_dict.length; z++) {
                if (appData.player[i].account_id == appData.winJoy_dict[z]) {
                    for (var k = 0; k < appData.WinJoy.length; k++) {
                        if (appData.WinJoy[k].account_id == appData.player[i].account_id) {

                            appData.player[i].win_type = obj.data.card_type;
                            appData.player[i].lose_show = true;
                            appData.player[i].LoseJoy = '';
                            if (appData.WinJoy[k].score) {
                                appData.player[i].LoseJoy = '';
                            } else {
                                appData.player[i].LoseJoy = appData.WinJoy[k].score;
                            }
                        }
                    }
                }
            }

        }
        console.log(appData.player)
        if (obj.data.card_type == 0) {
            viewMethods.gameOver(obj.data.winner_score_dict, obj.data.score_board, 1000, 2000);
        } else {

            viewMethods.cardOver(1);

            if (obj.data.total_num == obj.data.game_num) {
                viewMethods.gameOver(obj.data.winner_score_dict, obj.data.score_board, 2500, 1000);
            } else {
                viewMethods.gameOver(obj.data.winner_score_dict, obj.data.score_board, 2500, 2500);
            }
        }


        appData.showSwopBtn = false;
        // 每局结束之后，清localStorage
        localStorage.removeItem('swopStatus');
        localStorage.removeItem('swopBtnActive');
        localStorage.removeItem('showSwopBtn');
        localStorage.removeItem('canChooseCard');
        localStorage.removeItem('cardUp');
        localStorage.removeItem('otherCard');

        if (obj.data.total_num >= obj.data.game_num) {
            viewMethods.roundEnd();
        } else {
            // 自动准备
            setTimeout(function () {
                if (appData.isAutoReady == 1 && appData.isWatching != 1) {
                    viewMethods.clickReady()
                }
            }, 6000)
        }
    },
    processHuanPai: function (obj) {
        var ordCard = appData.player[0].card[appData.changeCardNum];
        var newCard = obj.data.new_card;
        //Vue.set（目标，key，val)
        Vue.set(vm.$data.player[0].card, appData.changeCardNum, newCard);
        appData.player[0].card_type = obj.data.card_type;
        appData.showSwopBtn = false;
    },
    processhuanpaiNotify: function (obj) {
        var bet = Math.abs(obj.data.swop_score);
        game.score += bet
        for (var i = 0; i < appData.player.length; i++) {
            if (appData.player[i].account_id == obj.data.account_id) {
                appData.player[i].account_score = appData.player[i].account_score + Math.ceil(obj.data.swop_score);
                viewMethods.throwCoin2(appData.player[i].num, bet);
                appData.player[i].account_huan_status = obj.data.account_huan_status;
            }
        }

    },
    processMyCards: function (obj) {
        if (appData.ruleInfo.play_mode == 2) {
            for (var i = 0; i < appData.player.length; i++) {
                for (var j = 0; j < obj.data.length; j++) {
                    if (appData.player[i].account_id == obj.data[j].account_id) {
                        appData.player[i].card = obj.data[j].cards.concat();
                    }
                }
            }

            viewMethods.seeMyCard();
            setTimeout(function () {
                viewMethods.cardOver2();
            }, 1000)
        }
    },
    processDiscard: function (obj) {
        if (appData.is_super) {
            $('.isQuit1').css('left', '70%');
            $('.isSeen1').css('left', '70%');
            $('.isLose1').css('left', '70%');
            $('.isSwop1').css('left', '70%');
            $(".myCards .card3 .cardLayer").removeClass('choosed');
        }
        appData.player[0].account_status = 6;
        appData.showSwopBtn = false;
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
};

var viewMethods = {
    showHomeAlert: function () {
        appData.isShowHomeAlert = true;
    },
    clickShowAlert: function (type, text) {
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
        } else if (appData.alertType == 31) {
            window.location.href = window.location.href + "&id=" + 10000 * Math.random();
        } else {
            appData.isShowGameAlert = false;
            appData.isShowAlert = false;
        }
    },
    clickSitDown: function () {
        appData.isShowGameAlert = false;
        appData.isShowAlert = false;
        socketModule.sendJoinRoom();
    },
    clickReady: function () {
        if (appData.player[0].is_operation || appData.game.status != 1) {
            return 0;
        }

        socketModule.sendReadyStart();
        appData.player[0].is_operation = true;
    },
    reDeal: function () {
        m4aAudioPlay('audio1');
        appData.game.cardDeal = 1;

        setTimeout(function () {
            appData.game.cardDeal = 2;
            setTimeout(function () {
                appData.game.cardDeal = 3;
                setTimeout(function () {
                    appData.player[0].is_showCard = true;
                }, 400);
            }, 250);
        }, 250);
    },
    //明牌
    seeMyCard: function () {
        if (appData.player[0].account_id != userData.account_id) return; //观战功能

        if (appData.ruleInfo.play_mode == 2) { //明牌模式
            setTimeout(function () {
                $(".myCards .card0").addClass("card-flipped");
                $(".myCards .card1").addClass("card-flipped");
            }, 300);
        }
    },
    //明牌
    mingCardOver: function () {
        if (appData.player[0].account_id != userData.account_id) return; //观战功能
        $(".myCards .card2").addClass("card-flipped");
    },
    cardOver2: function (num) {
        if (appData.ruleInfo.play_mode == 2) { //明牌模式
            setTimeout(function () {
                $(".cardDeal .mcard1").addClass("card-flipped");
                $(".cardDeal .mcard2").addClass("card-flipped");
            }, 300);
        }
    },
    cardOver: function (num) {

        if (num == 0) {
            if (appData.play_type == 5) {
                $(".myCards .card0").velocity({left: 0}, {duration: 450});
                $(".myCards .card1").velocity({left: 0}, {duration: 450});
                $(".myCards .card2").velocity({left: 0}, {duration: 450});
                $(".myCards .card3").velocity({left: 0}, {
                    duration: 450,
                    complete: function () {
                        $(".myCards .cards").addClass("card-flipped");
                        $(".myCards .card0").velocity({left: "0"}, {duration: 550})
                        $(".myCards .card1").velocity({left: "50%"}, {duration: 550})
                        $(".myCards .card2").velocity({left: "100%"}, {duration: 550})
                        $(".myCards .card3").velocity({left: "150%"}, {duration: 550})
                        $(".myCards .card3 .cardLayer").addClass('choosed');
                    }
                });
            } else {
                $(".myCards .card0").velocity({left: 0}, {duration: 450});
                $(".myCards .card1").velocity({left: 0}, {duration: 450});
                $(".myCards .card2").velocity({left: 0}, {
                    duration: 450,
                    complete: function () {
                        $(".myCards .cards").addClass("card-flipped");
                        $(".myCards .card0").velocity({left: "0"}, {duration: 550})
                        $(".myCards .card1").velocity({left: "50%"}, {duration: 550})
                        $(".myCards .card2").velocity({left: "100%"}, {duration: 550})
                    }
                });
            }

        } else {
            appData.game.cardDeal = -1;
            if (appData.play_type == 5) {
                $(".cardOver .card0").velocity({left: 0}, {duration: 250});
                $(".cardOver .card1").velocity({left: 0}, {duration: 250});
                $(".cardOver .card2").velocity({left: 0}, {duration: 250});
                $(".cardOver .card3").velocity({left: 0}, {
                    duration: 250,
                    complete: function () {
                        $(".cardOver .cards").addClass("card-flipped");
                        $(".cardOver .card0").velocity({left: "0"}, {duration: 500})
                        $(".cardOver .card1").velocity({left: "25%"}, {duration: 500})
                        $(".cardOver .card2").velocity({left: "50%"}, {duration: 500})
                        $(".cardOver .card3").velocity({left: "75%"}, {duration: 500})
                    }
                });
            } else {
                $(".cardOver .card0").velocity({left: 0}, {duration: 250});
                $(".cardOver .card1").velocity({left: 0}, {duration: 250});
                $(".cardOver .card2").velocity({left: 0}, {
                    duration: 250,
                    complete: function () {
                        $(".cardOver .cards").addClass("card-flipped");
                        $(".cardOver .card0").velocity({left: "0"}, {duration: 500})
                        $(".cardOver .card1").velocity({left: "25%"}, {duration: 500})
                        $(".cardOver .card2").velocity({left: "50%"}, {duration: 500})
                    }
                });
            }

            if (appData.player[0].account_status == 5) {
                appData.player[0].account_status = 4;
                viewMethods.cardOver(0);
            } else if (appData.player[0].account_status == 4 && appData.player[0].account_id != userData.account_id) { //观战功能
                viewMethods.cardOver(0);
            }
        }
    },
    cardTest: function () {
        if (appData.player[0].account_status == 4 && appData.player[0].card.length == 0) {
            socketModule.sendRefreshRoom();
        }
    },
    gameOver: function (winner, board, time1, time2) {

        for (var i = 0; i < globalData.maxCount; i++) {
            for (s in board) {
                if (appData.player[i].account_id == s) {
                    appData.player[i].account_score = Math.ceil(board[s]);
                    // appData.playerBoard.score[i].num = appData.player[i].num;
                    // appData.playerBoard.score[i].account_id = appData.player[i].account_id;
                    // appData.playerBoard.score[i].nickname = appData.player[i].nickname;
                    // appData.playerBoard.score[i].account_score = appData.player[i].account_score;
                }
            }
        }

        setTimeout(function () {
            var k = 0;
            for (var i = 0; i < appData.player.length; i++) {
                if (appData.player[i].is_win) {
                    appData.player[i].win_show = true;
                    if (i == 0) {
                        mp3AudioPlay("win");
                    }
                    if (k == 0) {
                        k = 1;
                        numD = appData.player[i].num;
                        setTimeout(function () {
                            if (appData.player.length == 6) {
                                viewMethods.selectCoin6(numD, board)
                            } else if (appData.player.length == 9) {
                                viewMethods.selectCoin9(numD, board)
                            } else if (appData.player.length == 12) {
                                viewMethods.selectCoin12(numD, board)
                            }
                        }, 1500);
                    }
                }
            }

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

            setTimeout(function () {
                viewMethods.tableReset(1);
            }, time2);

        }, time1);
    },
    showMessage: function () {
        if (appData.player[0].account_id != userData.account_id) return; //观战功能
        appData.isShowNewMessage = true;
        disable_scroll();
    },
    hideMessage: function () {
        appData.isShowNewMessage = false;
        enable_scroll();
    },
    messageOn: function (num) {
        var loadMessageNum = 'message' + num;
        audioModule.loadAudioFile(globalData.fileUrl + 'files/audio/sound/' + loadMessageNum + '.m4a', loadMessageNum);
        setTimeout(function () {
            m4aAudioPlay(loadMessageNum);
        }, 200)

        socketModule.sendBroadcastVoice(num);

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

        window.location.href = window.location.href + "&id=" + 10000 * Math.random();
    },
    selectCard: function (num, count) {
        appData.select = num;
        appData.ticket_count = count;
    },
    roundEnd: function (type) {
        // if (type && type == 1) {
        //     socketModule.getScoreBoard();
        //     appData.gameover = true;
        // } else {
        //     setTimeout(function () {
        //         socketModule.getScoreBoard();
        //         appData.gameover = true;
        //         // window.location.href=cgr('ga',globalData.roomNumber,'04',globalData.maxCount);
        //     }, 3500)
        // }
        setTimeout(function () {
            DynLoading.goto('flower' + globalData.maxCount, 'i=' + globalData.roomNumber);
        }, 3500) 
    },
    roundEnd222: function () {
        for (var i = 0; i < appData.player.length; i++) {
            if (appData.player[i].online_status == 0) {
                appData.player[i].account_id = 0;
                appData.player[i].playing_status = 0;
                appData.player[i].online_status = 0;
                appData.player[i].nickname = "";
                appData.player[i].headimgurl = "";
                appData.player[i].account_score = 0;
            }
            appData.player[i].ticket_checked = 0;
        }

        chooseBigWinner();

        $(".ranking .rankBack").css("opacity", "1");
        $(".roundEndShow").show();

        setTimeout(function () {
            $(".ranking").show();
            console.log('游戏结束');
            canvas();
        }, 3500);
    },
    timeCountDown: function () {
        if (isTimeLimitShow == true) {
            return;
        }
        if (appData.game.time <= 0) {
            isTimeLimitShow = false;
            return 0;
        } else {
            isTimeLimitShow = true;
            appData.game.time--;
            timeLimit = setTimeout(function () {
                isTimeLimitShow = false;
                viewMethods.timeCountDown();
            }, 1e3);
        }
    },
    playerTimeCountDown: function () {
        if (isPlayerTimeLimitShow == true) {
            return;
        }
        if (appData.player[currentPlayerNum].limit_time <= 0 || currentPlayerNum < 0) {
            isPlayerTimeLimitShow = false;
            return 0;
        } else {
            isPlayerTimeLimitShow = true;
            appData.player[currentPlayerNum].limit_time--;
            setTimeout(function () {
                isPlayerTimeLimitShow = false;
                viewMethods.playerTimeCountDown();
            }, 1e3);
        }
    },
    tableReset: function (type) {
        for (var i = 0; i < appData.player.length; i++) {

            if (appData.player[i].account_status > 1 && type == 1) {
                appData.player[i].account_status = 1;
            }

            appData.player[i].playing_status = 0;
            appData.player[i].is_win = false;
            appData.player[i].is_operation = false;
            appData.player[i].win_type = 0;
            appData.player[i].win_show = false;
            appData.player[i].lose_show = false;
            appData.player[i].card = [];
            appData.player[i].card_type = 0;
            appData.player[i].is_showCard = false;
            appData.player[i].is_readyPK = false;
            appData.player[i].is_pk = false;
        }

        appData.game.can_open = 0;
        appData.game.can_look = 1;  //看牌条件
        appData.game.score = 0;
        appData.game.cardDeal = 0;
        appData.game.currentScore = 0;
        appData.game.status = 1;

        $(".cards").removeClass("card-flipped");
        $(".scoresArea").empty();
    },
    throwCoin: function (num, score) {
        if (num == 0) {
            var defaultScore = "background:url('" + globalData.fileUrl + "files\/images\/flower_default\/" + (ruleInfo.default_score - 1) + ".png') no-repeat;background-size: 92% 92%;"
            var newDefaultScore = "<div class='coin coinType" + ruleInfo.default_score + "' style=\"top:" + (140 * per - 28) * Math.random() + "px;left:" + (140 * per - 28) * Math.random() + "px;" + defaultScore + "\"></div>"
            $(".scoresArea").append(newDefaultScore);
            return;
        } else {
            $(".scoresArea").append("<div class='coin coin" + num + " coinType" + score + "' ></div>");
            $(".coin" + num).velocity({
                top: (per * 140 - 28) * Math.random(),
                left: (per * 140 - 28) * Math.random()
            }, {
                duration: 300,
                complete: function () {
                    $(".coin").removeClass("coin" + num);
                }
            });
        }
    },
    // 换牌丢筹码
    throwCoin2: function (num, score) {
        $(".scoresArea").append("<div class='coin coinS" + num + " coinSType" + score + "'></div>");
        $(".coinS" + num).velocity({top: (per * 140 - 20) * Math.random(), left: (per * 140 - 40) * Math.random()}, {
            duration: 300,
            complete: function () {
                $(".coin").removeClass("coinS" + num);
            }
        });
    },
    selectCoin6: function (num, board) {
        var top = 0;
        var left = 0;
        if (num == 1) {
            top = 280;
            left = 40;
        } else if (num == 2) {
            top = 70;
            left = 160;
        } else if (num == 3) {
            top = -20;
            left = 160;
        } else if (num == 4) {
            top = -60;
            left = 40;
        } else if (num == 5) {
            top = -20;
            left = -80;
        } else if (num == 6) {
            top = 70;
            left = -80;
        }
        $(".coin").velocity({top: top, left: left}, {
            duration: 600,
            complete: function () {
                $(".scoresArea").empty();
            }
        });
    },
    selectCoin9: function (e, t) {
        var n = 0, a = 0;

        switch (e) {
            case 1:
                n = "36vh", a = 40;
                break;
            case 2:
                n = "23vh", a = 150;
                break;
            case 3:
                n = "10vh", a = 150;
                break;
            case 4:
                n = "-4vh", a = 150;
                break;
            case 5:
                n = "-16vh", a = 110;
                break;
            case 6:
                n = "-16vh", a = -40;
                break;
            case 7:
                n = "-4vh", a = -60;
                break;
            case 8:
                n = "10vh", a = -60;
                break;
            case 9:
                n = "23vh", a = -60;
                break;
            default:
                break;
        }

        $(".coin").velocity(
            {top: n, left: a},
            {
                duration: 600, complete: function () {
                    $(".scoresArea").empty()
                }
            }
        );
    },
    selectCoin12: function (e, t) {
        //飞金币
        var n = 0, a = 0;
        n = appData.coinH[e - 1] + 'vh';
        // console.log(n);
        switch (e) {
            case 1:
                a = -70;
                break;
            case 2:
                a = 150;
                break;
            case 3:
                a = 150;
                break;
            case 4:
                a = 150;
                break;
            case 5:
                a = 150;
                break;
            case 6:
                a = 150;
                break;
            case 7:
                a = 40;
                break;
            case 8:
                a = -70;
                break;
            case 9:
                a = -70;
                break;
            case 10:
                a = -70;
                break;
            case 11:
                a = -70;
                break;
            case 12:
                a = -70;
                break;
            default:
                break;
        }

        $(".coin").velocity(
            {top: n, left: a},
            {
                duration: 600, complete: function () {
                    $(".scoresArea").empty()
                }
            }
        );
    },
    playerPK: function (num1, num2) {
        $(".pk1").css("left", "-60%");
        $(".pk2").css("right", "-60%");
        $(".playerPK .quitBack").hide();
        $(".playerPK .background").attr("src", globalData.fileUrl + "files/images/flower/comB.png");

        if (num1 == 0) {
            if (num2 < 3) {
                appData.turn = 0;
            } else {
                appData.turn = 1;
            }
        } else {
            if (num2 < num1) {
                appData.turn = 0;
            } else {
                appData.turn = 1;
            }
        }

        logMessage(num1, num2);

        if (appData.turn == 0) {
            appData.pk1.nickname = appData.player[num1].nickname;
            appData.pk1.headimgurl = appData.player[num1].headimgurl;
            appData.pk1.account_score = appData.player[num1].account_score;
            appData.pk1.account_status = appData.player[num1].account_status;

            appData.pk2.nickname = appData.player[num2].nickname;
            appData.pk2.headimgurl = appData.player[num2].headimgurl;
            appData.pk2.account_score = appData.player[num2].account_score;
            appData.pk2.account_status = appData.player[num2].account_status;
        } else {
            appData.pk1.nickname = appData.player[num2].nickname;
            appData.pk1.headimgurl = appData.player[num2].headimgurl;
            appData.pk1.account_score = appData.player[num2].account_score;
            appData.pk1.account_status = appData.player[num2].account_status;

            appData.pk2.nickname = appData.player[num1].nickname;
            appData.pk2.headimgurl = appData.player[num1].headimgurl;
            appData.pk2.account_score = appData.player[num1].account_score;
            appData.pk2.account_status = appData.player[num1].account_status;
        }

        appData.pk.round = 2;
        setTimeout(function () {
            m4aAudioPlay("com");

            $(".pk1").velocity({left: 0}, {duration: 500});
            $(".pk2").velocity({right: 0}, {
                duration: 500,
                complete: function () {

                    appData.pk.round = 3;
                    setTimeout(function () {

                        appData.pk.round = 4;

                        if (appData.pk1.account_status == 7) {
                            $(".pk1 .quitBack").fadeIn();
                            $(".pk1 .background").attr("src", globalData.fileUrl + "files/images/flower/player_bg.png");
                        } else {
                            $(".pk1 .background").attr("src", globalData.fileUrl + "files/images/flower/player_selected.png");
                        }

                        if (appData.pk2.account_status == 7) {
                            $(".pk2 .quitBack").fadeIn();
                            $(".pk2 .background").attr("src", globalData.fileUrl + "files/images/flower/player_bg.png");
                        } else {
                            $(".pk2 .background").attr("src", globalData.fileUrl + "files/images/flower/player_selected.png");
                        }

                        setTimeout(function () {
                            appData.pk.round = 0;
                            for (var i = 0; i < appData.player.length; i++) {
                                appData.player[i].is_pk = false;
                            }

                        }, 2000);
                    }, 800)
                }
            });
        }, 0);
    },
    choose: function (type, num) {
        //type:1，看牌闷牌；2，下注 3,弃牌 4，开牌/比牌 5，比牌 6,确定换牌

        if (appData.player[0].is_operation && appData.showSwopBtn == true) {
            return 0;
        }

        if (type == 1) {
            socketModule.sendClickToLook();
            appData.swopStatus = true;
            if (appData.swop_score > 0 && appData.play_type == 4) {
                localStorage.swopStatus = appData.swopStatus;
                appData.showSwopBtn = true;
                localStorage.showSwopBtn = appData.showSwopBtn;
            }
            appData.canSwopCard = true;
            m4aAudioPlay("audio3");
        } else if (type == 2) {
            socketModule.sendChooseChip(num);
            m4aAudioPlay(num + "f");
            viewMethods.throwCoin(1, num);
            appData.player[0].is_operation = true;

            if (appData.play_type == 4) {
                appData.swopBtnActive = false;
                appData.canChooseCard = false;
                localStorage.swopBtnActive = appData.swopBtnActive;
            }
            $('.myCards .cards').removeClass('chooseCard');
            if (appData.play_type == 4) {
                $('.cardLayer').removeClass('choosed');
            }
        } else if (type == 3) {
            socketModule.sendDiscard();
            m4aAudioPlay("audio5");
            appData.player[0].is_operation = true;
        } else if (type == 4) {
            var peopleNum = 0

            for (var i = 0; i < appData.player.length; i++) {
                if (appData.player[i].account_status == 4 || appData.player[i].account_status == 5) {
                    peopleNum++;
                }
            }

            if (peopleNum == 2) {
                socketModule.sendOpenCard();
                m4aAudioPlay("audio2");
                appData.player[0].is_operation = true;
            } else {
                for (var i = 0; i < appData.player.length; i++) {
                    appData.player[i].is_readyPK = false;

                    for (var k = 0; k < appData.pkPeople.length; k++) {
                        if (appData.player[i].account_id == appData.pkPeople[k]) {
                            appData.player[i].is_readyPK = true;
                        }
                    }
                }
                appData.pk.round = 1;
            }

        } else if (type == 5) {
            socketModule.sendPkCard(num);
            appData.player[0].is_operation = true;
        } else if (type == 6) {
            if (appData.swopBtnActive == false) {
                return;
            }
            appData.cardUp = $('.myCards .cards').hasClass('chooseCard');
            localStorage.cardUp = appData.cardUp;
            if (appData.cardUp == false) {
                console.log("未选牌");
                return;
            }
            if (ruleInfo.disable_pk == 1) {
                appData.disable_pk = 1;
            }
            $('.confiremSwop').hide();
            socketModule.sendHuanPai();
            appData.player[0].is_operation = true;
            appData.showSwopBtn = false;
            appData.swopBtnActive = false;
            appData.canChooseCard = false;
            appData.cardUp = false;

            localStorage.showSwopBtn = appData.showSwopBtn;
            localStorage.swopBtnActive = appData.swopBtnActive;
            localStorage.canChooseCard = appData.canChooseCard;
            localStorage.cardUp = appData.cardUp;

            $('.myCards .cards').removeClass('chooseCard');
            $('.cardLayer').removeClass('choosed');
        }
    },
    quitPk: function () {
        appData.pk.round = 0;
    },
};

var width = window.innerWidth;
var height = window.innerHeight;
var numD = 0;
var isTimeLimitShow = false;
var isPlayerTimeLimitShow = false;
var currentPlayerNum = 0; //当前活动用户

var viewStyle = {
    readyButton: {
        position: 'absolute',
        top: (height * 0.11 - height * 0.0495) / 2 + 'px',
        left: (width * 0.9 - height * 0.0495 * 3.078) / 2 + 'px',
        width: height * 0.0495 * 3.078 + 'px',
        height: height * 0.0495 + 'px',
    },
    readyText: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '6vh',
        height: '3vh',
        'margin-top': '-1.5vh',
        'margin-left': '-3vh',
    },
    button: {
        position: 'absolute',
        top: '68%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '16vh',
        height: '48px',
        overflow: 'hidden'
    },
}

var ruleInfo = {
    'type': 0,
    'isShow': false,
    'isShowRule': false,
    'chip_type': 1,
    'ticket_count': 1,
    'disable_look': 0,
    'disable_pk': 0,
    'upper_limit': 0,
    'default_score': 4,
    'pk_score': 0,
    'look_score': 0,
    'play_mode': 1,
    'rule_height': 60,
    'isLaizi': 0,
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
    setReady = 1;
} else {
    setReady = 0;
}

var scoreList1 = [4, 8, 16, 20];
var scoreList2 = [2, 4, 8, 10];

var appData = {
    isShowKefu: false,
    //观战功能
    isWatching: 0,
    guests: [],
    showGuest: 0,
    showSitdownButton: 0,
    showWatchButton: 1,
    joinType: 0,
    isShowApply: false,
    applyInfo: {
        text: '',
        status: '确定'
    },
    ownerUser: {
        nickname: "",
        avatar: "",
        user_code: 0
    },
    add_user: false,
    applyStatus: 0, //0尚未申请  1加好友申请中
    isAutoReady: setReady, //自动准备
    'isShowGameAlert': false,
    isShowErweima: false,
    roomStatus: globalData.roomStatus,
    scoreList1: scoreList1,
    scoreList2: scoreList2,
    'width': window.innerWidth,
    'height': window.innerHeight,
    'roomCard': Math.ceil(globalData.card),
    'is_connect': false,
    'player': [],
    'scoreboard': '',
    'activity': [],
    'isShowAlert': false,
    'isShowIndiv': false,
    'isShowIndividuality': false,
    'isShowIndividualityError': false,
    'individuality': userData.individuality,
    'inputIndiv': '',
    'individualityError': "",
    'userData': userData,
    'isShowAlertTip': false,
    'alertTipText': "",
    'room_users': '',
    'alertTipType': 1,
    'canSwopCard': false,
    'isShowNewMessage': false,
    'alertType': 0,
    'alertText': '',
    'base_score': 0,
    'playerBoard': {
        score: [],
        round: 0,
        record: ""
    },
    WinJoy: '',
    winJoy_dict: [],
    LoseJoy: '',
    'game': game,
    'roomCardInfo': [],
    'wsocket': ws,
    'connectOrNot': true,
    'socketStatus': 0,
    'heartbeat': null,
    'select': 1,
    'ticket_count': 0,
    'isDealing': false,
    'isShowHomeAlert': false,
    message: message,
    pkPeople: [],
    turn: 0,
    pk: {
        "turn": 0,
        "round": 0
    },
    pk1: {
        "nickname": "",
        "headimgurl": "",
        "account_score": 0,
        "account_status": 0,
    },
    pk2: {
        "nickname": "",
        "headimgurl": "",
        "account_score": 0,
        "account_status": 0,
    },
    isShowRecord: false,
    recordList: [],
    ruleInfo: ruleInfo,
    editAudioInfo: editAudioInfo,
    audioInfo: audioInfo,
    isReconnect: true,
    bScroll: null,
    isShowNoteImg: !1,
    'musicOnce': true,
    'coinH': [],
    'showSwopBtn': false,
    'swop_score': '',//换牌分
    'swopBtnActive': false, //
    'changeCardNum': '',
    'changeCardType': '',
    'swopStatus': false, //是否是可以换牌
    'canChooseCard': false,//可以选换牌
    'isFirstRound': true,//判断是否是开局第一轮
    'cardUp': false,//牌选中上移动
    'bet_round': 8,
    'curr_circle': 0,
    'play_type': 1,
    'is_super': false,
    'other': '',//超级拼3第四张牌,
    'disable_pk': 0,
    isShowGiftBox: false, //礼物
    giftToolsList: [],
    isShowBuyTools: false,
    buyToolsId: 0,
    skin_expire_type: 1,
    buyToolsName: '',
    timer: null,
    isShowTipsText: false,
    tipsText: "",
    gameover: false,
};

var resetState = function resetState() {
    appData.player = [];
    appData.playerBoard = {
        "score": [],
        "round": 0,
        "record": "",
    };

    for (var i = 0; i < globalData.maxCount; i++) {
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
            "ticket_checked": 0,
            "is_win": false,
            "win_type": 0,
            "limit_time": 0,
            "current_win": 0,
            "is_operation": false,
            "win_show": false,
            "lose_show": false,
            "card": [],
            "is_showCard": false,
            "is_pk": false,
            "is_readyPK": false,
            "card_type": 0,
            "messageOn": false,
            "messageText": "",
            poker_kw: 1,
            head_kw: '',
        });

        appData.playerBoard.score.push({
            "account_id": 0,
            "nickname": "",
            "account_score": 0,
            "isBigWinner": 0,
        });
    }

    httpModule.getInfo();
};

var newGame = function newGame() {
    appData.playerBoard = {
        "score": [],
        "round": 0,
        "record": "",
    };

    appData.game.round = 0;
    appData.game.status = 1;
    appData.game.score = 0;
    appData.game.currentScore = 0;
    appData.game.cardDeal = 0;
    appData.game.can_open = 0;
    appData.game.can_look = 1;  //看牌条件
    appData.game.is_play = false;
    clearInterval(appData.heartbeat);
    appData.socketStatus = 0
    appData.heartbeat = null;
    globalData.roomStatus = "-1";
    appData.connectOrNot = true;
    appData.gameover = false;

    for (var i = 0; i < appData.player.length; i++) {
        appData.playerBoard.score.push({
            "account_id": 0,
            "nickname": "",
            "account_score": 0,
            "isBigWinner": 0,
        });

        if (appData.player[i].online_status == 1) {
            appData.player[i].account_status = 0;
            appData.player[i].playing_status = 0;
            appData.player[i].is_win = false;
            appData.player[i].is_operation = false;
            appData.player[i].win_type = 0;
            appData.player[i].win_show = false;
            appData.player[i].lose_show = false;
            appData.player[i].card = [];
            appData.player[i].card_type = 0;
            appData.player[i].ticket_checked = 0;
            appData.player[i].account_score = 0;
            appData.player[i].current_win = 0;
            appData.player[i].WinJoy = 0;
            appData.player[i].LoseJoy = 0;
            appData.player[i].is_showCard = false;
            appData.player[i].is_readyPK = false;
            appData.player[i].is_pk = false;
        } else {
            appData.player[i] = {
                "num": i + 1,
                "serial_num": appData.player[i].serial_num,
                "account_id": 0,
                "account_status": 0,
                "playing_status": 0,
                "online_status": 0,
                "nickname": "",
                "headimgurl": "",
                "account_score": 0,
                "is_win": false,
                "win_type": 0,
                "ticket_checked": 0,
                "limit_time": 0,
                "current_win": 0,
                "is_operation": false,
                "win_show": false,
                "lose_show": false,
                "card": [],
                "is_showCard": false,
                "is_pk": false,
                "is_readyPK": false,
                "card_type": 0,
                "is_swop": false,
            }
        }
    }
};

//WebSocket
var connectSocket = function connectSocket(url, openCallback, messageCallback, closeCallback, errorCallback) {
    ws = new WebSocket(url);
    ws.onopen = openCallback;
    ws.onmessage = messageCallback;
    ws.onclose = closeCallback;
    ws.onerror = errorCallback;
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

    if (obj.result == -201) {
        viewMethods.clickShowAlert(31, obj.result_message);
    } else if (obj.result == -202) {
        appData.isReconnect = false;
        socketModule.closeSocket();
        viewMethods.clickShowAlert(32, obj.result_message);
    } else if (obj.result == -203) {
        viewMethods.reloadView();
    }

    if (obj.operation == 'getToolsList' || obj.operation == 'useTools' || obj.operation == 'buyTools') {
        giftFunc(obj);
    }

    if (obj.result != 0) {
        if (obj.operation == wsOperation.JoinRoom) {
            if (obj.result == 1) {
                if (obj.data.alert_type == 1) {
                    viewMethods.clickShowAlert(1, obj.result_message);
                } else if (obj.data.alert_type == 2) {
                    viewMethods.clickShowAlert(2, obj.result_message);
                } else if (obj.data.alert_type == 3) {
                    viewMethods.clickShowAlert(11, obj.result_message);
                } else {
                    viewMethods.clickShowAlert(7, obj.result_message);
                }
            } else if (obj.result == -1) {
                viewMethods.clickShowAlert(7, obj.result_message);
            } else {
                viewMethods.clickShowAlert(7, obj.result_message);
            }
        } else if (obj.operation == wsOperation.ReadyStart) {
            if (obj.result == 1) {
                viewMethods.clickShowAlert(1, obj.result_message);
            }
        } else if (obj.operation == wsOperation.PrepareJoinRoom) {
            if (obj.result > 0) {
                socketModule.processGameRule(obj);
            }

            if (obj.result == 1) {
                if (obj.data.alert_type == 1) {
                    viewMethods.clickShowAlert(1, obj.result_message);
                } else if (obj.data.alert_type == 2) {
                    viewMethods.clickShowAlert(2, obj.result_message);
                } else if (obj.data.alert_type == 3) {
                    viewMethods.clickShowAlert(11, obj.result_message);
                } else {
                    viewMethods.clickShowAlert(7, obj.result_message);
                }
            } else if (obj.result == -1) {
                viewMethods.clickShowAlert(24, obj.result_message);
            } else {
                viewMethods.clickShowAlert(7, obj.result_message);
            }
        } else if (obj.operation == wsOperation.CreateRoom) {
            if (obj.result == -1) {
                window.location.href = window.location.href + "&id=" + 10000 * Math.random();
            } else if (obj.result == 1) {
                viewMethods.clickShowAlert(1, obj.result_message);
            }

        } else if (obj.operation == wsOperation.RefreshRoom) {
            window.location.href = window.location.href + "&id=" + 10000 * Math.random();
        } else if (obj.operation == "setIndividuality") {
            methods.showResultTextFunc('设置失败');
        }

        appData.player[0].is_operation = false;
    } else {
        if (obj.operation == wsOperation.PrepareJoinRoom) {
            socketModule.processPrepareJoinRoom(obj);
        } else if (obj.operation == wsOperation.GameHistory) {
            socketModule.processGameHistory(obj);
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
        } else if (obj.operation == wsOperation.UpdateAccountShow) {
            socketModule.processUpdateAccountShow(obj);
        } else if (obj.operation == wsOperation.UpdateAccountMultiples) {
            socketModule.processUpdateAccountMultiples(obj);
        } else if (obj.operation == wsOperation.StartLimitTime) {
            socketModule.processStartLimitTime(obj);
        } else if (obj.operation == wsOperation.CancelStartLimitTime) {
            socketModule.processCancelStartLimitTime(obj);
        } else if (obj.operation == wsOperation.GameStart) {
            socketModule.processGameStart(obj);
        } else if (obj.operation == wsOperation.NotyChooseChip) {
            socketModule.processNotyChooseChip(obj);
        } else if (obj.operation == wsOperation.UpdateAccountScore) {
            socketModule.processUpdateAccountScore(obj);
        } else if (obj.operation == wsOperation.OpenCard) {
            socketModule.processOpenCard(obj);
        } else if (obj.operation == wsOperation.Win) {
            socketModule.processWin(obj);
        } else if (obj.operation == wsOperation.Discard) {
            socketModule.processDiscard(obj);
        } else if (obj.operation == wsOperation.BroadcastVoice) {
            socketModule.processBroadcastVoice(obj);
        } else if (obj.operation == wsOperation.StartBet) {
            socketModule.processStartBet(obj);
        } else if (obj.operation == wsOperation.StartShow) {
            socketModule.processStartShow(obj);
        } else if (obj.operation == wsOperation.PkCard) {
            socketModule.processPKCard(obj);
        } else if (obj.operation == wsOperation.CardInfo) {
            socketModule.processCardInfo(obj);
        }         //观战功能
        else if (obj.operation == wsOperation.GuestRoom) {
            socketModule.processGuestRoom(obj);
        } else if (obj.operation == wsOperation.AllGuestInfo) {
            socketModule.processAllGuestInfo(obj);
        } else if (obj.operation == wsOperation.UpdateGuestInfo) {
            socketModule.processUpdateGuestInfo(obj);
        } else if (obj.operation == wsOperation.WinJoy) {
            //喜牌
            socketModule.processWinJoy(obj);
        } else if (obj.operation == wsOperation.HuanPai) {
            socketModule.processHuanPai(obj);
        } else if (obj.operation == wsOperation.huanpaiNotify) {
            socketModule.processhuanpaiNotify(obj);
        } else if (obj.operation == wsOperation.MyCards) {
            socketModule.processMyCards(obj);
        } else if (obj.operation == "getScoreBoard") {
            socketModule.processGetScoreBoard(obj);
        } else if (obj.operation == "setIndividuality") {
            socketModule.processSetIndividuality(obj);
        } else if (obj.operation == "getAccountInfo") {
            socketModule.pGAI(obj);
        } else if (obj.operation == "getAccountCard") {
            socketModule.pGAC(obj);
        } else {
            logMessage(obj.operation);
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
        }, 2500)
    }
}

var wsErrorCallback = function wsErrorCallback(data) {
    logMessage("websocket onerror：");
    logMessage(data);
    appData.connectOrNot = false;
    //reconnectSocket();
}

var reconnectSocket = function reconnectSocket() {

    if (!appData.isReconnect) {
        return;
    }

    if (globalData.roomStatus == 4) {
        return;
    }

    if (ws) {
        logMessage(ws.readyState);
        if (ws.readyState == 1) { //websocket已经连接
            return;
        }

        ws = null;
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
    audioUrl: '',
    initModule: function (audioUrl) {
        this.audioUrl = audioUrl;
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
            return;
        }

        if (isLoadAudioFile == true) {
            return;
        }

        isLoadAudioFile = true;


        var audioUrl = ["2f.m4a", "4f.m4a", "5f.m4a", "8f.m4a", "10f.m4a", "16f.m4a", "20f.m4a", "25f.m4a", "30f.m4a", "40f.m4a", "50f.m4a", "60f.m4a", "80f.m4a", "100f.m4a", "audio1.m4a", "audio2.m4a", "audio3.m4a", "audio4.m4a", "audio5.m4a", "com.m4a", "lose.mp3", "win.mp3", "back.mp3"];
        var audioName = ["2f", "4f", "5f", "8f", "10f", "16f", "20f", "25f", "30f", "40f", "50f", "60f", "80f", "100f", "audio1", "audio2", "audio3", "audio4", "audio5", "com", "lose", "win", "backMusic"];
        for (var i = 0; i < audioUrl.length; i++) {
            this.loadAudioFile(this.audioUrl + 'files/audio/flower/' + audioUrl[i], audioName[i]);
        }

    }
};
audioModule.initModule(globalData.fileUrl);

var initView = function initView() {

    $('#app-main').width(appData.width);
    $('#app-main').height(appData.height);
    $('#table').width(appData.width);
    $('#table').height(appData.height);

    $(".ranking").css("width", appData.width * 2);
    $(".ranking").css("height", appData.width * 2 * 1.621);

    window.onload = function () {
        var divs = ['table', 'vinvite', 'valert', 'vmessage', 'vshop', 'vcreateRoom', 'vroomRule', 'endCreateRoom', 'endCreateRoomBtn'];
        var divLength = divs.length;

        for (var i = 0; i < divLength; i++) {
            var tempDiv = document.getElementById(divs[i]);
            if (tempDiv) {
                tempDiv.addEventListener('touchmove', function (event) {
                    event.preventDefault();
                }, false);
            }
        }

        var member4Top = (window.innerHeight * 0.195 - 28 - 89) / 2 + 26;
        member4Top = (member4Top / window.innerHeight) * 100;

    };

};

function checkIndividuality(e) {
    return !!/^[0-9a-zA-Z]*$/g.test(e);
}

//Vue方法
var methods = {
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
    showHomeAlert: viewMethods.showHomeAlert,
    showAlert: viewMethods.clickShowAlert,
    showMessage: viewMethods.showMessage,
    closeAlert: viewMethods.clickCloseAlert,
    createRoom: viewMethods.clickCreateRoom,
    sitDown: viewMethods.clickSitDown,
    seeMyCard4: viewMethods.seeMyCard4,
    seeMyCard5: viewMethods.seeMyCard5,
    imReady: viewMethods.clickReady,
    robBanker: viewMethods.clickRobBanker,
    showCard: viewMethods.clickShowCard,
    selectTimesCoin: viewMethods.clickSelectTimesCoin,
    hideMessage: viewMethods.hideMessage,
    closeEnd: viewMethods.closeEnd,
    messageOn: viewMethods.messageOn,
    showNoteImg: function () {
        appData.isShowNoteImg = !0;
    },
    hideNoteImg: function () {
        appData.isShowNoteImg = !1;
    },
    hall: function () {
        DynLoading.goto('/');
        //window.location.href = Htmls.;
    },
    applyClub: function () {
        if (appData.applyInfo.status == '已发送申请') {
            return;
        }
        var isRepeat = repeat('applyClub');
        if (isRepeat) {
            methods.showResultTextFunc('请不要连续点击');
            return
        }
        httpModule.applyClub();
    },
    // 自动准备
    autoReady: function () {
        if (appData.gameover == true) {
            return
        }
        if (appData.isAutoReady == 1) {
            appData.isAutoReady = 0;
            localStorage.setItem("isAutoReady", 0);
            localStorage.removeItem("roomNumber");
        } else {
            appData.isAutoReady = 1
            viewMethods.clickReady();
            localStorage.setItem("isAutoReady", 1);
            localStorage.setItem("roomNumber", globalData.roomNumber);
        }
    },
    reviewCard: function () {
        //window.location.href = cgr('gq', globalData.roomNumber, globalData.gameType, globalData.maxCount);
        window.location.href = Htmls.getReviewUrl(globalData.gameType, globalData.roomNumber);
    },
    closeHomeAlert: function () {
        appData.isShowHomeAlert = false;
    },
    setChipType: function () {
        if (appData.ruleInfo.chip_type == 1) {
            appData.scoreList1 = [4, 8, 16, 20];
            appData.scoreList2 = [2, 4, 8, 10];
        } else if (appData.ruleInfo.chip_type == 2) {
            appData.scoreList1 = [4, 10, 20, 40];
            appData.scoreList2 = [2, 5, 10, 20];
        } else if (appData.ruleInfo.chip_type == 3) {
            appData.scoreList1 = [10, 20, 40, 80];
            appData.scoreList2 = [5, 10, 20, 40];
        } else if (appData.ruleInfo.chip_type == 4) {
            appData.scoreList1 = [10, 16, 20, 40];
            appData.scoreList2 = [5, 8, 10, 20];
        } else if (appData.ruleInfo.chip_type == 5) {
            appData.scoreList1 = [5, 10, 20, 25];
            appData.scoreList2 = [2, 4, 8, 10];
        } else if (appData.ruleInfo.chip_type == 6) {
            appData.scoreList1 = [5, 10, 25, 50];
            appData.scoreList2 = [2, 4, 10, 20];
        } else if (appData.ruleInfo.chip_type == 7) {
            appData.scoreList1 = [10, 25, 50, 100];
            appData.scoreList2 = [4, 10, 20, 40];
        } else if (appData.ruleInfo.chip_type == 8) {
            appData.scoreList1 = [10, 16, 20, 40];
            appData.scoreList2 = [5, 8, 10, 20];
        } else if (appData.ruleInfo.chip_type == 11) {
            appData.scoreList1 = [20, 40, 60, 100];
            appData.scoreList2 = [10, 20, 30, 50];
        }
    },
    swopCard: function () {
        if (appData.player[0].account_status != 4) {
            console.log("未点击看牌按钮");
            return;
        }
        if (ruleInfo.disable_pk == 1) {
            appData.disable_pk = 0;
        }
        console.log("点击换牌按钮");
        appData.swopBtnActive = true;
        localStorage.swopBtnActive = appData.swopBtnActive;
        appData.canChooseCard = true;
        localStorage.canChooseCard = appData.canChooseCard;
    },
    chooseCard: function (n, cardNum) {
        if (appData.canChooseCard == false) {
            console.log("未点击换牌按钮:", appData.canChooseCard);
            return;
        }
        console.log("cardNum", cardNum);
        $('.myCards .cards').removeClass('chooseCard');
        $('.cards.card' + n).addClass('chooseCard');
        if (appData.play_type == 4) {
            $('.cardLayer').removeClass('choosed');
        }
        $('.cardLayer').eq(n).addClass('choosed');
        appData.changeCardNum = n;
        appData.changeCardType = cardNum;
    },
    showIndividuality: function () {
        if (globalData.p_type == 2) {
            if (userData.individuality == "") {
                appData.isShowIndiv = true
            } else {
                appData.isShowIndividuality = true;
            }

            if (localStorage.messageMusic == 1) {
                methods.clickVoice();
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

    notRobBanker: viewMethods.clickNotRobBanker,
    selectCard: viewMethods.selectCard,
    quitPk: viewMethods.quitPk,
    choose: viewMethods.choose,

    showGameRule: function () {
        if (appData.roomStatus == 4) {
            return;
        }

        appData.ruleInfo.isShowRule = true;
    },
    cancelGameRule: function () {
        appData.ruleInfo.isShowRule = false;
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
        if (once == '1' && appData.editAudioInfo.backMusic == 0 && appData.audioInfo.backMusic == 0) {
            appData.musicOnce = false;
            return;
        }
        if (once == '1' && appData.musicOnce) {
            console.log(appData.editAudioInfo.backMusic);
            console.log(appData.audioInfo.backMusic)
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
            appData.editAudioInfo.backMusic = 0;
            appData.editAudioInfo.messageMusic = 0;
        } else {
            appData.editAudioInfo.backMusic = 1;
            appData.editAudioInfo.messageMusic = 1;
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
        window.location.href = window.location.href;
    },
    applyToJoin: function () {
        httpModule.applyToJoin();
    },
    //观战功能
    guestRoom: function () {
        socketModule.sendGuestRoom();
    },
    hideGuests: function () {
        appData.showGuest = 0;
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
    showKefu: function () {
        appData.isShowKefu = true
    },
    hideKefu: function () {
        appData.isShowKefu = false
    }
};

//Vue生命周期
var vueLife = {
    vmCreated: function () {
        logMessage('vmCreated')
        resetState();
        //reconnectSocket();
        initView();
        if (globalData.roomStatus != 4) {
            $("#loading").hide();
        }

        $(".main").show();
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

//Vue实例
var vm = new Vue({
    el: '#app-main',
    data: appData,
    methods: methods,
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

//积分榜
$(function () {
    //$(".main").css("height",window.innerWidth * 1.621);
    $(".place").css("width", per * 140);
    $(".place").css("height", per * 160);
    $(".place").css("top", per * 250);
    $(".place").css("left", per * 195);

    $(".showRanking").click(function () {
        $(".Ranking").show();
    });

    if (globalData.maxCount == 12) {
        for (var i = 0; i < 12; i++) {
            appData.coinH.push(($('.member' + (i + 1)).offset().top - per * 270) / $(window).height() * 100);
        }
    }


    $(".hideRanking").click(function () {
        $(".Ranking").hide();
    });

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
            audioModule.stopSound("backMusic");
            audioModule.playSound("backMusic", true);
        }
    }

    if (typeof document.addEventListener === "undefined" || typeof hidden === "undefined") {
        alert("This demo requires a browser such as Google Chrome that supports the Page Visibility API.");
    } else {
        document.addEventListener(visibilityChange, handleVisibilityChange, false);
    }

});

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
                var detailedBtn = '<a class="search-number-box-btn" onclick="methods.reviewCard()" style="position: fixed;z-index: 999999;width: 50%;height: 200px;right:0;bottom:0;"></a>';
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
                    //window.location.replace("/");
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
                //$(document.body).off('touchmove');
                $("#loading").css({'background': '#071a45'});
                $("#loading").hide();
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

    var room_number = appData.game.room_number;
    var num = data.round;
    var sum = appData.game.total_num;
    var datetime = data.record;
    var width = 750;
    var height = 1216;
    var pics = [globalData.fileUrl + 'files/images/flower/ranking_4_bg.jpg', globalData.fileUrl + 'files/images/common/people_bg.png', globalData.fileUrl + 'files/images/common/ranking_icon.png'];
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

//新画布
function canvas222() {
    var target = document.getElementById("ranking");
    html2canvas(target, {
        allowTaint: true,
        taintTest: false,
        onrendered: function (canvas) {
            canvas.id = "mycanvas";
            var dataUrl = canvas.toDataURL('image/jpeg', 0.3);
            $("#end").attr("src", dataUrl);
            $(".end").show();
            $('.ranking').hide();
            newGame();
        }
    });
};

function chooseBigWinner() {
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

    //对积分榜排序
    appData.playerBoard.score.sort(function (a, b) {
        return b.account_score - a.account_score;
    });
};

function logMessage(message) {
    console.log(message);
};


var shareContent = '';

function getShareContent() {
    shareContent = "\n";


    shareContent = shareContent + ' 底分：' + appData.ruleInfo.default_score + '分';
    if (appData.ruleInfo.chip_type == 1) {
        shareContent = shareContent + ' 筹码：2/4，4/8，8/16，10/20';
    } else {
        shareContent = shareContent + ' 筹码：2/4，5/10，10/20，20/40';
    }


    if (appData.ruleInfo.disable_look == 1 || appData.ruleInfo.disable_pk == 1) {
        shareContent = shareContent + ' 规则：';
        if (appData.ruleInfo.disable_look == 1) {
            shareContent = shareContent + '首轮不能看牌';
        }
        if (appData.ruleInfo.disable_pk == 1) {
            shareContent = shareContent + '闷牌，全场禁止比牌';
        }
    }

    if (appData.ruleInfo.ticket_count == 1) {
        shareContent = shareContent + ' 局数：10局x1张房卡';
    } else {
        shareContent = shareContent + ' 局数：20局x2张房卡';
    }
    if (appData.ruleInfo.upper_limit == 0) {
        shareContent = shareContent + ' 上限：无';
    } else {
        shareContent = shareContent + ' 上限：' + appData.ruleInfo.upper_limit + '分';
    }
    shareContent = shareContent + ' 比牌：' + appData.ruleInfo.pk_score + '分';
    shareContent = shareContent + ' 看牌：' + appData.ruleInfo.look_score + '分';
};

if (globalData.roomStatus == 4) {

    try {
        var obj = eval('(' + globalData.scoreboard + ')');
        setTimeout(function () {
            socketModule.processLastScoreboard(obj);
        }, 0);
    } catch (error) {
        console.log(error);
        setTimeout(function () {
            socketModule.processLastScoreboard('');
        }, 0);
    }

}


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
        imgUrl: globalData.shareImg,
        success: function () {
        },
        cancel: function () {
        }
    });

    wx.onMenuShareAppMessage({
        title: globalData.shareTitle + '(房间号:' + globalData.roomNumber + ')',
        desc: shareContent,
        link: globalData.roomUrl,
        imgUrl: globalData.shareImg,
        success: function () {
        },
        cancel: function () {
        }
    });
});

wx.error(function (a) {
});