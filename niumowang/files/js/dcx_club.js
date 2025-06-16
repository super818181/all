var ws;
var game = {
    room: 0,
    room_number: globalData.roomNumber,
    status: 0,
    time: -1,
    round: 0,
    total_num: 12,
    cardDeal: 0,
    can_open: 0,
    current_win: 0,
    is_play: !1,
    show_card: !1,
    show_coin: !1,
    base_score: 0,
    show_score: !1,
    show_bettext: !1,
    poolScore: 0,
    pollCoinNum: 0,
    chips: []
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
    {"num": 12, "text": "搏一搏，单车变摩托"},
    {num: 13, text: "输得裤衩都没有了 "},
    {num: 14, text: "谢谢老板"},
    {num: 15, text: "搏一搏，单车变摩托"},
    {num: 16, text: "快点下注吧，一会儿就没有机会了"},
    {num: 17, text: "底牌亮出来，绝对吓死你"},
    {num: 18, text: "我加注了，你敢不敢跟"},
    {num: 19, text: "看我通杀全场，这些钱都是我的"},
    {num: 20, text: "不要走，决战到天亮"},
    {num: 21, text: "和你合作，实在太愉快了"}
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
    CardInfo: "CardInfo",
    UpdateAccountScore: "UpdateAccountScore",
    Win: "Win",
    BroadcastVoice: "BroadcastVoice",
    PlayerMultiples: "PlayerMultiples",
    ShowCard: "ShowCard",
    UpdateAccountShow: "UpdateAccountShow",
    UpdateAccountMultiples: "UpdateAccountMultiples",
    StartBet: "StartBet",
    StartShow: "StartShow",
    RefreshRoom: "PullRoomInfo",
    MyCards: "MyCards",
    GameOver: "GameOver",
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
    }
};
var socketModule = {
    closeSocket: function () {
        if (ws)
            try {
                ws.close()
            } catch (e) {
                console.log(e)
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

    sendBroadcastVoice: function (e) {
        socketModule.sendData({
            operation: wsOperation.BroadcastVoice,
            data: {
                room_id: appData.game.room,
                voice_num: e,
                token: globalData.tk
            }
        });
    },
    sendPlayerMultiples: function (e) {
        console.log("atet:" + e);
        socketModule.sendData({
            operation: wsOperation.PlayerMultiples,
            data: {
                room_id: appData.game.room,
                multiples: e,
                token: globalData.tk
            }
        });
    },
    sendShowCard: function () {
        socketModule.sendData({
            operation: wsOperation.ShowCard,
            data: {
                room_id: appData.game.room,
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
    processGameRule: function (e) {
        if (e.data.ticket_type) {
            appData.ruleInfo.ticket = e.data.ticket_type;
            appData.ruleInfo.baseScore = e.data.score_type;
            appData.ruleInfo.timesType = e.data.rule_type;
            appData.ruleInfo.is_cardjoker = Math.ceil(e.data.is_cardjoker);
            appData.ruleInfo.is_cardbao9 = Math.ceil(e.data.is_cardbao9);
            appData.ruleInfo.banker_mode = Math.ceil(e.data.banker_mode);
            appData.ruleInfo.banker_score = Math.ceil(e.data.banker_score_type);
        }

        1 == appData.ruleInfo.banker_mode ?
            appData.ruleInfo.bankerText = "抢庄" :
            2 == appData.ruleInfo.banker_mode ?
                appData.ruleInfo.bankerText = "抢庄" :
                3 == appData.ruleInfo.banker_mode ?
                    appData.ruleInfo.bankerText = "选庄" :
                    4 == appData.ruleInfo.banker_mode ?
                        appData.ruleInfo.bankerText = "" :
                        5 == appData.ruleInfo.banker_mode && (appData.ruleInfo.bankerText = "")
    },
    processPrepareJoinRoom: function (e) {
        if (e.data.is_club) {
            if (e.data.is_club == 1) {
                appData.isShowApply = true;
                appData.applyInfo.club_headimgurl = e.data.club_headimgurl;
                appData.applyInfo.club_name = e.data.club_name;
                appData.applyInfo.club_id = e.data.room_creator;
                // viewMethods.clickShowAlert(1, '无法加入，请联系管理员');

                return;
            }
        }
        if (e.data.room_status == 4) {
            viewMethods.roundEnd();
            appData.roomStatus = e.data.room_status;
            // viewMethods.clickShowAlert(8, obj.result_message);
            return;
        }
        if (e.data.ticket_type) {
            appData.ruleInfo.ticket = e.data.ticket_type;
            appData.ruleInfo.baseScore = e.data.score_type;
            appData.ruleInfo.timesType = e.data.rule_type;
            appData.ruleInfo.is_cardjoker = Math.ceil(e.data.is_cardjoker);
            appData.ruleInfo.is_cardbao9 = Math.ceil(e.data.is_cardbao9);
            appData.ruleInfo.banker_mode = Math.ceil(e.data.banker_mode);
            appData.ruleInfo.banker_score = Math.ceil(e.data.banker_score_type);
            appData.ruleInfo.bet_type = Math.ceil(e.data.bet_type);
        }

        if (1 == appData.ruleInfo.bet_type) {
            appData.game.chips = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300];
        } else if (2 == appData.ruleInfo.bet_type) {
            appData.game.chips = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500];
        } else if (3 == appData.ruleInfo.bet_type) {
            appData.game.chips = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
        }

        appData.raiseChip = appData.game.chips[0];


        // if(3!=e.data.room_status){
        //     if(0==e.data.user_count){
        //         socketModule.sendJoinRoom();
        //     } else if(""!=e.data.alert_text){
        //         viewMethods.clickShowAlert(4,e.data.alert_text);
        //     } else {
        //         socketModule.sendJoinRoom();
        //     }
        // }
        //观战功能
        if (e.data.is_member) {
            socketModule.sendJoinRoom();
        } else {
            if (e.data.can_join) {
                if (e.data.can_guest) {
                    appData.joinType = 1;
                    if (e.data.room_users.length >= 1) {
                        //e.data.alert_text = "房间里有" + e.data.room_users.join("、") + "，是否加入？";
                        appData.room_users = e.data.room_users;
                        console.log(appData.alertText)
                    } else {
                        e.data.alert_text = "";
                    }
                } else {
                    appData.joinType = 2;
                    if (e.data.room_users.length >= 1) {
                        //e.data.alert_text = "观战人数已满，房间里有" + e.data.room_users.join("、") + "，是否加入游戏？";
                        appData.room_users = e.data.room_users;
                    } else {
                        e.data.alert_text = "";
                    }
                }
            } else { //不能加入游戏
                if (e.data.can_guest) {
                    appData.joinType = 3;
                    if (e.data.room_users.length >= 1) {
                        e.data.alert_text = "游戏人数已满，是否加入观战?";
                    } else {
                        e.data.alert_text = "";
                    }
                } else {
                    appData.joinType = 4;
                    e.data.alert_text = "游戏和观战人数已满";
                }
            }
            if (e.data.room_users.length >= 1) {
                appData.alertType = 4;
                appData.alertText = e.data.room_users;
                appData.isShowGameAlert = true;
            } else {
                socketModule.sendJoinRoom();
            }
            //viewMethods.clickShowAlert(4,e.data.alert_text);
            //appData.room_users = e.data.room_users;
            //console.log(appData.alertText)
        }
    },
    processJoinRoom: function (e) {
        appData.game.room = e.data.room_id;
        appData.game.round = Math.ceil(e.data.game_num);
        appData.game.total_num = Math.ceil(e.data.total_num);
        appData.game.base_score = Math.ceil(e.data.base_score);
        appData.game.poolScore = parseInt(e.data.score_pool);
        appData.base_score = appData.game.base_score;
        appData.canBreak = Math.ceil(e.data.can_break);

        resetAllPlayerData();

        if (-1 == e.data.limit_time) {
            appData.game.time = Math.ceil(e.data.limit_time);
            viewMethods.timeCountDown();
        }
        appData.player[0].serial_num = e.data.serial_num;
        for (var i = 0; i < globalData.maxCount; i++) {
            if (i <= globalData.maxCount - e.data.serial_num) {
                appData.player[i].serial_num = i + Math.ceil(e.data.serial_num);
            } else {
                appData.player[i].serial_num = i + Math.ceil(e.data.serial_num) - globalData.maxCount;
            }
        }

        appData.player[0].account_status = Math.ceil(e.data.account_status);
        appData.player[0].account_score = Math.ceil(e.data.account_score);
        appData.player[0].nickname = userData.nickname;
        appData.player[0].headimgurl = userData.avatar;
        appData.player[0].account_id = userData.account_id;
        appData.player[0].account_code = userData.account_code;
        appData.player[0].card = e.data.cards.concat();
        appData.player[0].card_open = e.data.cards.concat();
        appData.player[0].card_type = e.data.card_type;
        appData.player[0].ticket_checked = e.data.ticket_checked;
        appData.game.status = Math.ceil(e.data.room_status);
        appData.player[0].combo_point = e.data.combo_point;
        //appData.player[0].card_open=getComboCards(e.data.cards.concat());


        if (2 == appData.game.status) {
            appData.game.cardDeal = 3;
        }

        appData.scoreboard = e.data.scoreboard;
        viewMethods.resetMyAccountStatus();
    },
    processRefreshRoom: function (e) {
        resetAllPlayerData();
        appData.player[0].serial_num = e.data.serial_num;
        for (t = 0; t < globalData.maxCount; t++)
            if (t <= globalData.maxCount - e.data.serial_num) {
                appData.player[t].serial_num = t + Math.ceil(e.data.serial_num);
            } else {
                appData.player[t].serial_num = t + Math.ceil(e.data.serial_num) - globalData.maxCount;
            }
        appData.player[0].account_status = Math.ceil(e.data.account_status);
        appData.player[0].account_score = Math.ceil(e.data.account_score);
        appData.player[0].nickname = userData.nickname;
        appData.player[0].account_code = userData.account_code;
        appData.player[0].headimgurl = userData.avatar;
        appData.player[0].account_id = userData.account_id;
        appData.player[0].serial_num = e.data.serial_num;
        appData.player[0].card = e.data.cards.concat();
        appData.player[0].card_open = e.data.cards.concat();
        appData.player[0].card_type = e.data.card_type;
        appData.player[0].ticket_checked = e.data.ticket_checked;
        appData.player[0].combo_point = e.data.combo_point;
        //appData.player[0].card_open=getComboCards(e.data.cards.concat());
        if (2 == appData.game.status) {
            appData.game.cardDeal = 3;
        }

        for (var t = 0; t < globalData.maxCount; t++)
            for (var a = 0; a < e.all_gamer_info.length; a++)
                if (appData.player[t].serial_num == e.all_gamer_info[a].serial_num) {
                    appData.player[t].nickname = e.all_gamer_info[a].nickname;
                    appData.player[t].account_code = e.all_gamer_info[a].account_code;
                    appData.player[t].headimgurl = e.all_gamer_info[a].headimgurl;
                    appData.player[t].account_id = e.all_gamer_info[a].account_id;
                    appData.player[t].account_score = Math.ceil(e.all_gamer_info[a].account_score);
                    appData.player[t].account_status = Math.ceil(e.all_gamer_info[a].account_status);
                    appData.player[t].online_status = Math.ceil(e.all_gamer_info[a].online_status);
                    appData.player[t].ticket_checked = e.all_gamer_info[a].ticket_checked;
                    appData.player[t].multiples = e.all_gamer_info[a].multiples;
                    appData.player[t].bankerMultiples = e.all_gamer_info[a].banker_multiples;
                    appData.player[t].card_type = e.all_gamer_info[a].card_type;
                    appData.player[t].combo_point = e.all_gamer_info[a].combo_point;
                    appData.player[t].is_showbull = !1;
                    if (1 == e.all_gamer_info[a].is_banker) {
                        appData.player[t].is_banker = !0;
                        appData.bankerAccountId = e.all_gamer_info[a].account_id;
                        appData.bankerPlayer = appData.player[t];
                    } else {
                        appData.player[t].is_banker = !1;
                    }
                    if (appData.player[t].account_status >= 8) {
                        appData.player[t].is_showCard = !0;
                    }
                    //appData.player[t].card_open=getComboCards(e.all_gamer_info[a].cards.concat());
                    if (appData.player[t].card_open.length < 1 || void 0 == appData.player[t].card_open) {
                        appData.player[t].card_open = e.all_gamer_info[a].cards.concat();
                    }
                    if (appData.player[t].card_open.length < 1 || void 0 == appData.player[t].card_open) {
                        appData.player[t].card_open = [-1, -1, -1,];
                    }
                }
        if (appData.player[0].account_status >= 7) {
            appData.player[0].is_showCard = !0;
        }
        if (appData.player[0].account_status > 2) {
            setTimeout(function () {
                appData.player[0].is_showCard = !0;
            }, 500);
        }
        if (3 == appData.player[0].account_status) {
            appData.showClockRobText = !0;
            setTimeout(function () {
                appData.showRob = !0
            }, 500);
        }
        if (6 == appData.player[0].account_status) {
            appData.showClockBetText = !0;
            appData.showRob = !1;
            appData.showRobText = !1;
            appData.showNotRobBankerText = !1;
            appData.showShowCardButton = !1;
            appData.showClickShowCard = !1;
            appData.showBankerCoinText = !1;
            appData.showTimesCoin = !0;
        }
        if (6 == appData.player[0].account_status) {
            appData.isFinishBankerAnimate = !0;
        }
        viewMethods.resetMyAccountStatus();
        viewMethods.updateAllPlayerStatus();
        if (appData.player[0].account_status > 2 && appData.player[0].account_status < 7 &&
            (2 == appData.ruleInfo.banker_mode || 6 == appData.ruleInfo.banker_mode)) {
            viewMethods.seeMyCard();
        }
    },
    processStartShow: function (e) {
        var t = 0;
        if (4 == appData.ruleInfo.banker_mode) {
            t = 1200;
        }
        setTimeout(function () {
            for (var t = 0; t < globalData.maxCount; t++)
                for (var a = 0; a < e.data.length; a++)
                    if (appData.player[t].account_id == e.data[a].account_id) {
                        if (0 == appData.player[t].multiples && 0 != e.data[a].multiples) {
                            viewMethods.throwCoin(appData.player[t].num, 1);
                            appData.player[t].account_score = appData.player[t].account_score - parseInt(e.data[a].multiples);
                            appData.game.poolScore = appData.game.poolScore + parseInt(e.data[a].multiples);
                        }
                        appData.player[t].multiples = e.data[a].multiples;
                        appData.player[t].account_status = parseInt(e.data[a].account_status);
                        appData.player[t].online_status = parseInt(e.data[a].online_status);
                        appData.player[t].card = e.data[a].cards.concat();
                        appData.player[t].card_open = e.data[a].cards.concat();
                        appData.player[t].card_type = e.data[a].card_type;
                        appData.player[t].combo_point = e.data[a].combo_point;
                        appData.player[t].limit_time = e.data[a].limit_time;
                        //appData.player[t].card_open=getComboCards(e.data[a].cards.concat());
                    }

            appData.showClockBetText = !1;
            appData.showClockRobText = !1;
            appData.showClockShowCard = !0;
            viewMethods.resetMyAccountStatus();
            viewMethods.updateAllPlayerStatus();
            appData.game.time = Math.ceil(e.limit_time);
            viewMethods.timeCountDown();
        }, t)
    },
    processMyCards: function (e) {
        if (2 == appData.ruleInfo.banker_mode || 6 == appData.ruleInfo.banker_mode) {
            if (appData.player[0].account_id == e.data.account_id) {
                appData.player[0].card = e.data.cards.concat();
            }
            viewMethods.seeMyCard();
        }
    },
    processStartBet: function (e) {
        setTimeout(function () {
            for (var t = 0; t < globalData.maxCount; t++)
                for (var a = 0; a < e.data.length; a++)
                    if (appData.player[t].account_id == e.data[a].account_id) {
                        appData.player[t].account_status = parseInt(e.data[a].account_status);
                        appData.player[t].online_status = parseInt(e.data[a].online_status);
                        appData.player[t].limit_time = parseInt(e.data[a].limit_time);
                        appData.player[t].multiples = 0;
                        if (1 == e.data[a].is_banker) {
                            appData.player[t].is_banker = !0;
                            appData.bankerAccountId = e.data[a].account_id;
                            appData.bankerPlayer = appData.player[t];
                        } else {
                            appData.player[t].is_banker = !1;
                        }
                    }
            appData.bankerArray = e.grab_array.concat();
            appData.showRob = !1;
            appData.showClockBetText = !0;
            appData.showClockRobText = !1;
            appData.showClockShowCard = !1;
            appData.game.time = parseInt(e.limit_time);
            appData.bankerAnimateIndex = 0;
            if (appData.game.time > 0) {
                viewMethods.timeCountDown();
            }
        }, 1200)
    },
    processAllGamerInfo: function (e) {
        appData.game.show_card = !0;
        appData.game.show_coin = !0;
        appData.clickCard3 = !1;
        for (a = 0; a < globalData.maxCount; a++)
            for (var t = 0; t < e.data.length; t++)
                if (appData.player[a].serial_num == e.data[t].serial_num) {
                    appData.player[a].nickname = e.data[t].nickname;
                    appData.player[a].account_code = e.data[t].account_code;
                    appData.player[a].headimgurl = e.data[t].headimgurl;
                    appData.player[a].account_id = e.data[t].account_id;
                    appData.player[a].account_score = Math.ceil(e.data[t].account_score);
                    appData.player[a].account_status = Math.ceil(e.data[t].account_status);
                    appData.player[a].online_status = Math.ceil(e.data[t].online_status);
                    appData.player[a].ticket_checked = e.data[t].ticket_checked;
                    appData.player[a].multiples = e.data[t].multiples;
                    appData.player[a].bankerMultiples = e.data[t].banker_multiples;
                    appData.player[a].card_type = e.data[t].card_type;
                    appData.player[a].combo_point = e.data[t].combo_point;
                    appData.player[a].is_showbull = !1;

                    appData.player[a].is_banker = !1;
                    if (appData.player[a].account_status >= 8) {
                        appData.player[a].is_showCard = !0;
                    }
                    appData.player[a].card_open = e.data[t].cards.concat();
                    if (appData.player[a].card_open.length < 1 || void 0 == appData.player[a].card_open) {
                        appData.player[a].card_open = [-1, -1, -1];
                    }
                }
        if (appData.player[0].account_status >= 7) {
            (appData.player[0].is_showCard = !0);
        }
        if ("" != appData.scoreboard) {
            for (var a = 0; a < globalData.maxCount; a++)
                for (s in appData.scoreboard)
                    if (appData.player[a].account_id == s) {
                        appData.playerBoard.score[a].num = appData.player[a].num;
                        appData.playerBoard.score[a].account_id = appData.player[a].account_id;
                        appData.playerBoard.score[a].nickname = appData.player[a].nickname;
                        appData.playerBoard.score[a].account_code = appData.player[a].account_code;
                        appData.playerBoard.score[a].account_score = Math.ceil(appData.scoreboard[s]);
                    }
            if (2 == appData.game.status) {
                appData.playerBoard.round = appData.game.round - 1;
            } else {
                appData.playerBoard.round = appData.game.round
            }
        }
        if (appData.player[0].account_status > 2) {
            setTimeout(function () {
                appData.player[0].is_showCard = !0;
            }, 500);
        }
        if (3 == appData.player[0].account_status) {
            appData.showClockRobText = !0;
            setTimeout(function () {
                appData.showRob = !0
            }, 500);
        }
        if (6 == appData.player[0].account_status) {
            appData.showClockBetText = !0;
            appData.showRob = !1;
            appData.showRobText = !1;
            appData.showNotRobBankerText = !1;
            appData.showShowCardButton = !1;
            appData.showClickShowCard = !1;
            appData.showBankerCoinText = !1;
            appData.showTimesCoin = !0;

            appData.isFinishBankerAnimate = !0
        }
        viewMethods.resetMyAccountStatus();
        viewMethods.updateAllPlayerStatus();
        if (appData.player[0].account_status > 2 && appData.player[0].account_status < 7 && (2 == appData.ruleInfo.banker_mode || 6 == appData.ruleInfo.banker_mode)) {
            viewMethods.seeMyCard();
        }
    },
    processUpdateGamerInfo: function (e) {
        logMessage(appData.player);
        for (var t = 0; t < globalData.maxCount; t++) {
            if (appData.player[t].serial_num == e.data.serial_num) {
                appData.player[t].nickname = e.data.nickname;
                appData.player[t].account_code = e.data.account_code;
                appData.player[t].headimgurl = e.data.headimgurl;
                appData.player[t].account_id = e.data.account_id;
                appData.player[t].account_score = Math.ceil(e.data.account_score);
                appData.player[t].account_status = Math.ceil(e.data.account_status);
                appData.player[t].online_status = Math.ceil(e.data.online_status);
                appData.player[t].ticket_checked = e.data.ticket_checked;
            } else if (appData.player[t].account_id == e.data.account_id) {
                socketModule.sendRefreshRoom();
            }
        }
    },
    processUpdateAccountStatus: function (e) {
        for (var t = 0; t < globalData.maxCount; t++) {
            if (appData.player[t].account_id == e.data.account_id) {
                if (2 == appData.ruleInfo.banker_mode || 6 == appData.ruleInfo.banker_mode) {
                    if (5 == e.data.account_status || 4 == e.data.account_status)
                        appData.player[t].bankerMultiples = e.data.banker_multiples;
                }
                if (appData.player[t].account_status >= 8) {
                    appData.player[t].online_status = e.data.online_status;
                    return;
                }
                if (1 == e.data.online_status) {
                    appData.player[t].account_status = Math.ceil(e.data.account_status);
                } else if (0 == e.data.online_status && 0 == appData.player[t].account_status) {
                    appData.player[t].account_id = 0;
                    appData.player[t].playing_status = 0;
                    appData.player[t].online_status = 0;
                    appData.player[t].nickname = "";
                    appData.player[t].account_code = "";
                    appData.player[t].headimgurl = "";
                    appData.player[t].account_score = 0;
                } else if (0 == e.data.online_status && appData.player[t].account_status > 0) {
                    appData.player[t].account_status = Math.ceil(e.data.account_status);
                    appData.player[t].online_status = 0;
                } else {
                    logMessage(e);
                }
                if (0 != t) {
                    if (4 == appData.player[t].account_status) {
                        setTimeout(function () {
                            mp3AudioPlay("audioNoBanker");
                        }, 100);
                    } else if (5 == appData.player[t].account_status) {
                        setTimeout(function () {
                            mp3AudioPlay("audioRobBanker");
                        }, 100);
                    }
                }
                break;
            }
        }

        if (3 == appData.player[0].account_status) {
            viewMethods.showRobBankerText();
        } else if (4 == appData.player[0].account_status) {
            viewMethods.showNotRobBankerTextFnc();
        }

        if (appData.isFinishBankerAnimate && appData.isFinishWinAnimate) {
            viewMethods.resetMyAccountStatus();
            viewMethods.updateAllPlayerStatus();
        } else {
            setTimeout(function () {
                viewMethods.resetMyAccountStatus();
                viewMethods.updateAllPlayerStatus();
            }, 3e3);
        }
    },
    processUpdateAccountShow: function (e) {
        for (var t = 0; t < appData.player.length; t++)
            if (appData.player[t].account_id == e.data.account_id) {
                appData.player[t].card_type = e.data.card_type;
                appData.player[t].cards = e.data.cards.concat();
                appData.player[t].card_open = e.data.cards.concat();
                appData.player[t].combo_point = e.data.combo_point;
                appData.player[t].account_status = 8;
                //appData.player[t].card_open=getComboCards(e.data.cards.concat());
                if (0 == appData.player[t].is_audiobull && appData.player[t].account_status >= 8) {
                    var a = "";
                    a = (parseInt(appData.player[t].card_type) > 4) ? ("special" + appData.player[t].card_type) : ("sangong" + appData.player[t].combo_point);

                    setTimeout(function () {
                        mp3AudioPlay(a)
                    }, 100);
                    appData.player[t].is_audiobull = !0;
                }
                break;
            }
        if (e.data.account_id == appData.player[0].account_id) {
            viewMethods.resetMyAccountStatus();
        }
        viewMethods.updateAllPlayerStatus();
    },
    processUpdateAccountMultiples: function (e) {
        appData.game.poolScore = appData.game.poolScore + parseInt(e.data.multiples);
        for (var t = 0; t < appData.player.length; t++)
            if (appData.player[t].account_id == e.data.account_id) {
                appData.player[t].multiples = e.data.multiples;
                if (0 == t) return;
                if (appData.player[t].multiples >= 1) {
                    for (var a = 0; a < appData.game.chips.length; a++)
                        if (appData.player[t].multiples == appData.game.chips[a]) {
                            viewMethods.throwCoin(appData.player[t].num, a + 1);
                        }
                    appData.player[t].account_score = appData.player[t].account_score - e.data.multiples;
                    var n = appData.player[t].multiples;
                    setTimeout(function () {
                        mp3AudioPlay(n)
                    }, 100)
                }
                break
            }
        viewMethods.resetMyAccountStatus();
        viewMethods.updateAllPlayerStatus()
    },
    processStartLimitTime: function (e) {
        e.data.limit_time > 1 && (appData.game.time = Math.ceil(e.data.limit_time), viewMethods.timeCountDown())
    },
    processCancelStartLimitTime: function (e) {
        appData.game.time = -1
    },
    processGameStart: function (e) {
        $(".cards").removeClass("card-flipped");
        $(".myCards").removeClass("card-flipped");
        $(".memberCoin").stop(!0);
        appData.isFinishWinAnimate = !0;
        appData.isFinishBankerAnimate = !0;
        appData.game.can_open = 0;
        appData.game.cardDeal = 0;
        appData.game.status = 1;
        appData.game.show_card = !0;
        appData.game.time = -1;
        appData.game.is_play = !0;
        appData.game.round = appData.game.round + 1;
        appData.game.round = Math.ceil(e.game_num);
        appData.player[0].is_showCard = !1;
        appData.showClockRobText = !1;
        appData.showClockBetText = !1;
        appData.showClockShowCard = !1;
        appData.clickCard3 = !1;
        appData.showClickShowCard = !1;
        appData.breakData = null;
        appData.raiseValue = 0;
        appData.raiseChip = appData.game.chips[0];
        for (var t = 0; t < globalData.maxCount; t++) {
            appData.player[t].is_operation = !1;
            appData.player[t].is_showCard = !1;
            appData.player[t].is_showbull = !1;
            if (5 == appData.ruleInfo.banker_mode && appData.game.round > 1) {

            } else {
                if (3 == appData.ruleInfo.banker_mode && appData.game.round > 1) {

                } else {
                    appData.player[t].is_banker = !1
                }
            }
            appData.player[t].bullImg = "";
            if (0 == appData.player[t].online_status) {
                appData.player[t].account_status = 1;
            }
            for (var a = 0; a < e.data.length; a++) {
                if (appData.player[t].account_id == e.data[a].account_id) {
                    appData.player[t].ticket_checked = 1;
                    appData.player[t].account_status = Math.ceil(e.data[a].account_status);
                    appData.player[t].playing_status = Math.ceil(e.data[a].playing_status);
                    appData.player[t].online_status = Math.ceil(e.data[a].online_status);
                    appData.player[t].account_score = appData.player[t].account_score;
                    appData.player[t].limit_time = Math.ceil(e.data[a].limit_time);
                }
            }
        }
        appData.game.status = 2;
        viewMethods.reDeal();
    },
    processBroadcastVoice: function (e) {
        for (var t = 0; t < globalData.maxCount; t++)
            if (appData.player[t].account_id == e.data.account_id && 0 != t) {
                m4aAudioPlay("message" + e.data.voice_num);
                viewMethods.messageSay(t, e.data.voice_num);
            }
    },
    processWin: function (e) {
        appData.game.is_play = !1;
        appData.game.current_win = e.data.win_score;
        appData.game.round = Math.ceil(e.data.game_num);
        appData.game.total_num = Math.ceil(e.data.total_num);
        appData.playerBoard.round = Math.ceil(e.data.game_num);
        appData.game.show_score = !1;
        appData.showClockShowCard = !1;
        appData.showShowCardButton = !1;
        appData.showClickShowCard = !1;
        appData.showClockBetText = !1;
        appData.showClockRobText = !1;

        if (3 == appData.ruleInfo.banker_mode) {
            appData.bankerID = Math.ceil(e.data.banker_id);
            appData.bankerAccountId = appData.bankerID;
            console.log(appData.bankerID);
        }

        if (5 == appData.ruleInfo.banker_mode) {
            if (appData.player[0].is_banker) {
                appData.canBreak = Math.ceil(e.data.can_break);
            }

            if (void 0 != e.data.is_break && null != e.data.is_break) {
                appData.isBreak = Math.ceil(e.data.is_break);
            }
        }

        viewMethods.showMemberScore(!1);

        for (var t = 0; t < appData.player.length; t++) {
            appData.player[t].single_score = 0;
            if (appData.player[t].account_status >= 7) {
                appData.player[t].account_status = 8;
            }
            for (var a = 0; a < e.data.loser_array.length; a++)
                if (appData.player[t].account_id == e.data.loser_array[a].account_id) {
                    appData.player[t].single_score = e.data.loser_array[a].score;
                    break
                }
            for (var n = 0; n < e.data.winner_array.length; n++)
                if (appData.player[t].account_id == e.data.winner_array[n].account_id) {
                    appData.player[t].single_score = e.data.winner_array[n].score;
                    break
                }
        }

        appData.game.time = -1;
        viewMethods.updateAllPlayerStatus();
        setTimeout(function () {
            viewMethods.resetMyAccountStatus();
        }, 200);

        if (appData.player[0].account_status >= 8 && 0 == appData.player[0].is_audiobull) {
            var r = appData.player[0].card_type;
            var o = appData.player[0].combo_point;
            setTimeout(function () {
                if (r > 4) {
                    mp3AudioPlay("special" + appData.player[0].card_type);
                } else {
                    mp3AudioPlay("sangong" + o);
                }
            }, 200);
            appData.player[0].is_audiobull = !0
        }
        setTimeout(function () {
            viewMethods.winAnimate(e)
        }, 3e3)
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
};
var viewMethods = {
    showHomeAlert: function () {
        appData.isShowHomeAlert = true;
    },
    clickShowAlert: function (e, t) {
        console.log(e, t)
        appData.alertType = e,
            appData.alertText = t,
            appData.isShowAlert = !0,
            setTimeout(function () {
                var t = $(".alertText").height(), a = t;
                t < .15 * height && (t = .15 * height),
                t > .8 * height && (t = .8 * height);
                var n = t + .056 * height * 2 + .022 * height + .056 * height;
                8 == e && (n = n - .022 * height - .056 * height);
                var r = t + .034 * height * 2, o = .022 * height + (r - a) / 2;
                $(".alert .mainPart").css("height", n + "px"),
                    $(".alert .mainPart").css("margin-top", "-" + n / 2 + "px"),
                    $(".alert .mainPart .backImg .blackImg").css("height", r + "px"),
                    $(".alert .mainPart .alertText").css("top", o + "px")
            }, 0)
    },
    clickCloseAlert: function () {
        if (22 == appData.alertType) {
            appData.isShowAlert = !1;
            httpModule.getInfo();
        } else {
            appData.isShowAlert = !1;
        }
    },
    clickSitDown: function () {
        appData.isShowGameAlert = !1, appData.isShowAlert = !1, socketModule.sendJoinRoom()
    },
    clickReady: function () {
        socketModule.sendReadyStart(), appData.player[0].is_operation = !0
    },
    reDeal: function () {
        if (!appData.isDealing) {
            appData.isDealing = !0;
            m4aAudioPlay("audio1");
            appData.game.cardDeal = 1;
            setTimeout(function () {
                appData.game.cardDeal = 2;
                setTimeout(function () {
                    appData.game.cardDeal = 3;
                    setTimeout(function () {
                        viewMethods.resetMyAccountStatus();
                        appData.player[0].is_showCard = !0;
                        appData.showClockRobText = !0;
                        appData.isDealing = !1;
                    }, 300);
                }, 150);
            }, 150);
        }
    },
    resetMyAccountStatus: function () {
        if (6 != appData.player[0].account_status || appData.isFinishBankerAnimate) {
            viewMethods.resetShowButton();
            if (3 == appData.player[0].account_status) {
                appData.showRob = !0;
            } else if (4 == appData.player[0].account_status) {
                appData.showNotRobText = !0;
            } else if (5 == appData.player[0].account_status) {
                appData.showRobText = !0;
            } else if (6 == appData.player[0].account_status) {
                appData.isFinishBankerAnimate && (appData.showTimesCoin = !0);
            } else if (7 == appData.player[0].account_status) {
                appData.player[0].is_showCard = !0;
                if (1 == appData.clickCard3) {
                    appData.showShowCardButton = !0;
                } else {
                    appData.showClickShowCard = !0;
                }
            } else if (8 == appData.player[0].account_status) {
                appData.player[0].is_showCard = !0;
            }
        }
    },
    resetShowButton: function () {
        appData.showTimesCoin = !1;
        appData.showRob = !1;
        appData.showShowCardButton = !1;
        appData.showClickShowCard = !1;
        appData.showNotRobText = !1;
        appData.showRobText = !1;
        appData.showBankerCoinText = !1;
    },
    seeMyCard: function () {
        setTimeout(function () {
            $(".myCards .card0").addClass("card-flipped");
            $(".myCards .card1").addClass("card-flipped");
            setTimeout(function () {
                if (1 != appData.clickCard3)
                    if (appData.player[0].account_status >= 7)
                        appData.showClickShowCard = !0;
            }, 500);
        }, 1e3);
    },
    seeMyCard3: function () {
        if (appData.player[0].account_status >= 7) {
            $(".myCards .card2").addClass("card-flipped");
            appData.clickCard3 = true;
            setTimeout(function () {
                appData.showShowCardButton = true;
                appData.showClickShowCard = false;
            }, 100)
        }
    },

    resetCardOver: function (e) {
        if (globalData.maxCount == 9) {
            if (1 == e) {
                $(".myCards .card00").css("left", "35%");
                $(".myCards .card01").css("left", "50%");
                $(".myCards .card02").css("left", "65%");
            } else if (2 == e || 3 == e || 4 == e) {
                $(".cardOver .card" + e + "11").css("right", "7.5vh");
                $(".cardOver .card" + e + "21").css("right", "9.5vh");
                $(".cardOver .card" + e + "31").css("right", "11.5vh");
            } else if (5 == e) {
                $(".cardOver .card511").css("right", "11.5vh");
                $(".cardOver .card521").css("right", "13.5vh");
                $(".cardOver .card531").css("right", "15.5vh");
            } else if (6 == e) {
                $(".cardOver .card611").css("left", "11.5vh");
                $(".cardOver .card621").css("left", "13.5vh");
                $(".cardOver .card631").css("left", "15.5vh");
            } else if (7 == e || 8 == e || 9 == e) {
                $(".cardOver .card" + e + "11").css("left", "7.5vh");
                $(".cardOver .card" + e + "21").css("left", "9.5vh");
                $(".cardOver .card" + e + "31").css("left", "11.5vh");
            }
        } else if (globalData.maxCount == 12) {
            if (1 == e) {
                $(".myCards .card00").css("left", "35%");
                $(".myCards .card01").css("left", "50%");
                $(".myCards .card02").css("left", "65%");
            } else if (2 == e || 3 == e || 4 == e || 5 == e) {
                $(".cardOver .card" + e + "11").css("right", "7.5vh");
                $(".cardOver .card" + e + "21").css("right", "9.5vh");
                $(".cardOver .card" + e + "31").css("right", "11.5vh");
            } else if (6 == e) {
                $(".cardOver .card611").css("right", "5.5vh");
                $(".cardOver .card621").css("right", "7.5vh");
                $(".cardOver .card631").css("right", "9.5vh");
            } else if (7 == e) {
                $(".cardOver .card711").css("right", "42%");
                $(".cardOver .card721").css("right", "46%");
                $(".cardOver .card731").css("right", "50%");
            } else if (8 == e) {
                $(".cardOver .card811").css("left", "5.5vh");
                $(".cardOver .card821").css("left", "7.5vh");
                $(".cardOver .card831").css("left", "9.5vh");
            } else if (9 == e || 10 == e || 11 == e || 12 == e) {
                $(".cardOver .card" + e + "11").css("left", "7.5vh");
                $(".cardOver .card" + e + "21").css("left", "9.5vh");
                $(".cardOver .card" + e + "31").css("left", "11.5vh");
            }
        }
    },
    myCardOver: function () {
        if (1 != appData.player[0].is_showbull) {
            //viewMethods.resetCardOver(1);

            setTimeout(function () {
                $(".myCards .card00").animate({left: "37%"}, 400);
                $(".myCards .card01").animate({left: "50%"}, 400);
                $(".myCards .card02").animate({left: "63%"}, 400);
            }, 0);

            appData.player[0].is_showbull = !0;
        }
    },
    cardOver9: function (e) {
        if (e > 1 && 1 != appData.player[e - 1].is_showbull) {
            appData.player[e - 1].is_showbull = !0;
            //viewMethods.resetCardOver(e);
            setTimeout(function () {
                if (2 == e || 3 == e || 4 == e) {
                    $(".cardOver .card" + e + "11").animate({right: "8.5vh"}, 250);
                    $(".cardOver .card" + e + "21").animate({right: "8.5vh"}, 250);
                    $(".cardOver .card" + e + "31").animate({right: "8.5vh"}, 250);

                    setTimeout(function () {
                        $(".cardOver .cardtf" + e).addClass("card-flipped");
                        $(".cardOver .card" + e + "11").animate({right: "8.5vh"}, 400);
                        $(".cardOver .card" + e + "21").animate({right: "11.5vh"}, 400);
                        $(".cardOver .card" + e + "31").animate({right: "14.5vh"}, 400);
                    }, 250);

                } else if (7 == e || 8 == e || 9 == e) {
                    $(".cardOver .card" + e + "11").animate({left: "8.5vh"}, 250);
                    $(".cardOver .card" + e + "21").animate({left: "8.5vh"}, 250);
                    $(".cardOver .card" + e + "31").animate({left: "8.5vh"}, 250);

                    setTimeout(function () {
                        $(".cardOver .cardtf" + e).addClass("card-flipped");
                        $(".cardOver .card" + e + "11").animate({left: "14.5vh"}, 400);
                        $(".cardOver .card" + e + "21").animate({left: "11.5vh"}, 400);
                        $(".cardOver .card" + e + "31").animate({left: "8.5vh"}, 400);
                    }, 250);

                } else if (5 == e) {
                    $(".cardOver .card" + e + "11").animate({right: "11.5vh"}, 250);
                    $(".cardOver .card" + e + "21").animate({right: "11.5vh"}, 250);
                    $(".cardOver .card" + e + "31").animate({right: "11.5vh"}, 250);
                    setTimeout(function () {
                        $(".cardOver .cardtf" + e).addClass("card-flipped");
                        $(".cardOver .card" + e + "11").animate({right: "11.5vh"}, 400);
                        $(".cardOver .card" + e + "21").animate({right: "14.5vh"}, 400);
                        $(".cardOver .card" + e + "31").animate({right: "17.5vh"}, 400);
                    }, 250);

                } else if (6 == e) {
                    $(".cardOver .card" + e + "11").animate({left: "11.5vh"}, 250);
                    $(".cardOver .card" + e + "21").animate({left: "11.5vh"}, 250);
                    $(".cardOver .card" + e + "31").animate({left: "11.5vh"}, 250);

                    setTimeout(function () {
                        $(".cardOver .cardtf" + e).addClass("card-flipped");
                        $(".cardOver .card" + e + "11").animate({left: "17.5vh"}, 400);
                        $(".cardOver .card" + e + "21").animate({left: "14.5vh"}, 400);
                        $(".cardOver .card" + e + "31").animate({left: "11.5vh"}, 400);
                    }, 250);
                }
            }, 1);
        }
    },
    cardOver12: function (e) {
        if (e > 1 && 1 != appData.player[e - 1].is_showbull) {
            appData.player[e - 1].is_showbull = !0;
            //viewMethods.resetCardOver(e);
            setTimeout(function () {
                if (2 == e || 3 == e || 4 == e || 5 == e) {
                    $(".cardOver .card" + e + "11").animate({right: "8.5vh"}, 250);
                    $(".cardOver .card" + e + "21").animate({right: "8.5vh"}, 250);
                    $(".cardOver .card" + e + "31").animate({right: "8.5vh"}, 250);
                    setTimeout(function () {
                        $(".cardOver .cardtf" + e).addClass("card-flipped");
                        $(".cardOver .card" + e + "11").animate({right: "8.5vh"}, 400);
                        $(".cardOver .card" + e + "21").animate({right: "11.5vh"}, 400);
                        $(".cardOver .card" + e + "31").animate({right: "14.5vh"}, 400);
                    }, 250);

                } else if (9 == e || 10 == e || 11 == e || 12 == e) {
                    $(".cardOver .card" + e + "11").animate({left: "8.5vh"}, 250);
                    $(".cardOver .card" + e + "21").animate({left: "8.5vh"}, 250);
                    $(".cardOver .card" + e + "31").animate({left: "8.5vh"}, 250);
                    setTimeout(function () {
                        $(".cardOver .cardtf" + e).addClass("card-flipped");
                        $(".cardOver .card" + e + "11").animate({left: "14.5vh"}, 400);
                        $(".cardOver .card" + e + "21").animate({left: "11.5vh"}, 400);
                        $(".cardOver .card" + e + "31").animate({left: "8.5vh"}, 400);
                    }, 250);

                } else if (6 == e) {
                    $(".cardOver .card" + e + "11").animate({right: "6.5vh"}, 250);
                    $(".cardOver .card" + e + "21").animate({right: "6.5vh"}, 250);
                    $(".cardOver .card" + e + "31").animate({right: "6.5vh"}, 250);
                    setTimeout(function () {
                        $(".cardOver .cardtf" + e).addClass("card-flipped");
                        $(".cardOver .card" + e + "11").animate({right: "6.5vh"}, 400);
                        $(".cardOver .card" + e + "21").animate({right: "9.5vh"}, 400);
                        $(".cardOver .card" + e + "31").animate({right: "12.5vh"}, 400);
                    }, 250);

                } else if (7 == e) {
                    $(".cardOver .card" + e + "11").animate({right: "42%"}, 250);
                    $(".cardOver .card" + e + "21").animate({right: "42%"}, 250);
                    $(".cardOver .card" + e + "31").animate({right: "42%"}, 250);
                    setTimeout(function () {
                        $(".cardOver .cardtf" + e).addClass("card-flipped");
                        $(".cardOver .card" + e + "11").animate({right: "42%"}, 400);
                        $(".cardOver .card" + e + "21").animate({right: "46%"}, 400);
                        $(".cardOver .card" + e + "31").animate({right: "50%"}, 400);
                    }, 250);
                } else if (8 == e) {
                    $(".cardOver .card" + e + "11").animate({left: "6.5vh"}, 250);
                    $(".cardOver .card" + e + "21").animate({left: "6.5vh"}, 250);
                    $(".cardOver .card" + e + "31").animate({left: "6.5vh"}, 250);
                    setTimeout(function () {
                        $(".cardOver .cardtf" + e).addClass("card-flipped");
                        $(".cardOver .card" + e + "11").animate({left: "12.5vh"}, 400);
                        $(".cardOver .card" + e + "21").animate({left: "9.5vh"}, 400);
                        $(".cardOver .card" + e + "31").animate({left: "6.5vh"}, 400);
                    }, 250);

                }
            }, 1);
        }
    },
    gameOverNew: function (e, t) {
        appData.game.show_coin = !1;
        // for(r=0;r<appData.playerBoard.score.length;r++){
        //     appData.playerBoard.score[r].num=0;
        //     appData.playerBoard.score[r].account_id=0;
        //     appData.playerBoard.score[r].nickname="";
        //     appData.playerBoard.score[r].account_code="";
        //     appData.playerBoard.score[r].account_score=0;
        //     appData.playerBoard.score[r].isBigWinner=0;
        // }

        console.log(appData.playerBoard);
        for (var i = 0; i < globalData.maxCount; i++) {
            for (s in e) {
                if (appData.player[i].account_id == s) {
                    appData.player[i].account_score = Math.ceil(e[s]);
                    // appData.playerBoard.score[i].num = appData.player[i].num;
                    // appData.playerBoard.score[i].account_id = appData.player[i].account_id;
                    // appData.playerBoard.score[i].nickname = appData.player[i].nickname;
                    // appData.playerBoard.score[i].account_score = appData.player[i].account_score;
                }
            }
        }

        var a = new Date, n = "";
        n += a.getFullYear() + "-";
        n += a.getMonth() + 1 + "-";
        n += a.getDate() + "  ";
        n += a.getHours() + ":";

        if (a.getMinutes() >= 10) {
            n += a.getMinutes();
        } else {
            n += "0" + a.getMinutes();
        }
        appData.playerBoard.record = n;
        appData.base_score = appData.game.base_score;
        if (void 0 != t && "-1" != t) {
            console.log(t);
            socketModule.processBalanceScoreboard(t);
        }

        for (var r = 0; r < globalData.maxCount; r++) {
            appData.player[r].playing_status = 0;
            appData.player[r].is_win = !1;
            appData.player[r].is_operation = !1;
            appData.player[r].win_type = 0;
            appData.player[r].win_show = !1;
            appData.player[r].card = new Array;
            appData.player[r].card_open = new Array;
            appData.player[r].card_type = 0;
            appData.player[r].is_showCard = !1;
            appData.player[r].is_readyPK = !1;
            appData.player[r].is_pk = !1;
            appData.player[r].multiples = 0;
            appData.player[r].bankerMultiples = 0;
            //appData.player[r].is_bull=!1;
            appData.player[r].is_showbull = !1;
            appData.player[r].is_audiobull = !1;
        }
        appData.game.can_open = 0;
        appData.game.cardDeal = 0;
        appData.game.status = 1;
        appData.player[0].is_showCard = !1;
        appData.showClockRobText = !1;
        appData.showClockBetText = !1;
        appData.showClockShowCard = !1;
        appData.game.poolScore = 0;
        $(".scoresArea").empty();
    },
    showMessage: function () {
        appData.isShowNewMessage = !0;
        enable_scroll();
    },
    hideMessage: function () {
        appData.isShowNewMessage = !1;
        enable_scroll();
    },
    messageOn: function (e) {
        socketModule.sendBroadcastVoice(e),
            m4aAudioPlay("message" + e),
            viewMethods.messageSay(0, e),
            viewMethods.hideMessage()
    },
    messageSay: function (e, t) {
        appData.player[e].messageOn = !0,
            appData.player[e].messageText = appData.message[t].text, setTimeout(function () {
            appData.player[e].messageOn = !1
        }, 2500)
    },
    closeEnd: function () {
    },
    roundEnd: function () {
        // $("#loading").show();
        // appData.gameover=true;
        // socketModule.getScoreBoard();
        DynLoading.goto('dcx' + globalData.maxCount, 'i=' + globalData.roomNumber);
    },
    updateAllPlayerStatus: function () {
        for (var e = 0; e < appData.player.length; e++) {
            if (appData.player[e].multiples > 0) {
                appData.player[e].timesImg = globalData.fileUrl + "files/images/sangong/text_times" + appData.player[e].multiples + ".png";
            }
            if (appData.player[e].bankerMultiples > 0) {
                appData.player[e].bankerTimesImg = globalData.fileUrl + "files/images/sangong/text_times" + appData.player[e].bankerMultiples + ".png";
            }
            if (appData.player[e].card_type >= 1) {
                var t = 20;
                var a = parseInt(appData.player[e].card_type);

                if (1 == a) {
                    t = 20;
                } else if (4 == a) {
                    t = 20;
                } else if (5 == a) {
                    t = 11;
                } else if (6 == a) {
                    t = '12_1';
                } else if (7 == a) {
                    t = '12_1';
                } else if (8 == a) {
                    t = 14;
                } else if (9 == a) {
                    t = 15;
                } else if (10 == a) {
                    t = 16;
                } else if (11 == a) {
                    t = 17;
                } else {
                    t = appData.player[e].combo_point;
                }
                appData.player[e].bullImg = globalData.fileUrl + "files/images/sangong/point" + t + ".png"
            }
            if (4 == appData.player[e].account_status) {
                if (5 == appData.ruleInfo.banker_mode) {
                    appData.player[e].robImg = globalData.fileUrl + "files/images/sangong/text_notgo.png";
                } else {
                    appData.player[e].robImg = globalData.fileUrl + "files/images/sangong/text_notrob.png";
                }
            } else if (5 == appData.player[e].account_status) {
                if (5 == appData.ruleInfo.banker_mode) {
                    appData.player[e].robImg = globalData.fileUrl + "files/images/sangong/text_go.png";
                } else {
                    appData.player[e].robImg = globalData.fileUrl + "files/images/sangong/text_rob.png";
                }
            } else if (6 == appData.player[e].account_status) {
                appData.player[e].multiples;
            } else if (7 == appData.player[e].account_status) {
                if (0 == e) {
                    viewMethods.seeMyCard();
                }
            } else if (8 == appData.player[e].account_status) {
                if (0 == e) {
                    viewMethods.myCardOver();
                } else {
                    if (globalData.maxCount == 9) {
                        viewMethods.cardOver9(appData.player[e].num);
                    } else if (globalData.maxCount == 12) {
                        viewMethods.cardOver12(appData.player[e].num);
                    }
                }
            }
        }
    },
    timeCountDown: function () {
        if (1 != isTimeLimitShow) {
            if (appData.game.time <= 0) {
                isTimeLimitShow = !1;
                return 0;
            } else {
                isTimeLimitShow = !0;
                appData.game.time--;
                timeLimit = setTimeout(function () {
                    isTimeLimitShow = !1;
                    viewMethods.timeCountDown();
                }, 1e3);
            }
        }
    },
    showRobBankerText: function () {
        appData.showTimesCoin = !1;
        appData.showRob = !1;
        appData.showShowCardButton = !1;
        appData.showClickShowCard = !1;
        appData.showNotRobText = !1;
        appData.showRobText = !0;
        appData.showBankerCoinText = !1
    },
    showNotRobBankerTextFnc: function () {
        appData.showTimesCoin = !1;
        appData.showRob = !1;
        appData.showShowCardButton = !1;
        appData.showClickShowCard = !1;
        appData.showNotRobText = !0;
        appData.showRobText = !1;
        appData.showBankerCoinText = !1
    },

    clickSelectTimesCoin: function () {
        appData.player[0].multiples = appData.raiseChip;
        viewMethods.throwCoin(1, parseInt(appData.raiseValue) + 1);
        socketModule.sendPlayerMultiples(appData.raiseChip);
        appData.player[0].account_score = appData.player[0].account_score - appData.raiseChip;
        setTimeout(function () {
            mp3AudioPlay(appData.raiseChip)
        }, 50);
    },
    clickShowCard: function () {
        appData.showShowCardButton = !1;
        appData.showClickShowCard = !1;
        socketModule.sendShowCard();
    },

    showMemberScore: function (isShow) {
        if (isShow) {
            for (var i = 1; i <= appData.player.length; i++) {
                $(".memberScoreText" + i).show();
            }
            // $(".memberScoreText1").show();
            // $(".memberScoreText2").show();
            // $(".memberScoreText3").show();
            // $(".memberScoreText4").show();
            // $(".memberScoreText5").show();
            // $(".memberScoreText6").show();
            // $(".memberScoreText7").show();
            // $(".memberScoreText8").show();
            // $(".memberScoreText9").show();
            // $(".memberScoreText10").show();
            // $(".memberScoreText11").show();
            // $(".memberScoreText12").show();
            // $(".memberScoreText13").show();
        } else {
            for (var i = 1; i <= appData.player.length; i++) {
                $(".memberScoreText" + i).hide();
            }
            // $(".memberScoreText1").hide();
            // $(".memberScoreText2").hide();
            // $(".memberScoreText3").hide();
            // $(".memberScoreText4").hide();
            // $(".memberScoreText5").hide();
            // $(".memberScoreText6").hide();
            // $(".memberScoreText7").hide();
            // $(".memberScoreText8").hide();
            // $(".memberScoreText9").hide();
            // $(".memberScoreText10").hide();
            // $(".memberScoreText11").hide();
            // $(".memberScoreText12").hide();
            // $(".memberScoreText13").hide();
        }
    },
    winAnimate: function (obj) {
        appData.isFinishWinAnimate = !1;
        var t = new Array;  //winner
        var a = new Array;  //loser
        appData.bankerPlayerNum = appData.bankerPlayer.num;

        for (n = 0; n < obj.data.winner_array.length; n++)
            for (r = 0; r < appData.player.length; r++)
                if (obj.data.winner_array[n].account_id == appData.player[r].account_id) {
                    t.push(appData.player[r].num);
                }

        viewMethods.resetCoinsPosition();
        $("#playerCoins").show();
        for (n = 1; n <= globalData.maxCount; n++)
            viewMethods.showCoins(n, !1);

        //把金币暂时放到奖池位置
        for (n = 0; n < t.length; n++)
            for (r = 0; r < 8; r++) {
                $(".memberCoin" + t[n] + r).css("top", "36%");
                $(".memberCoin" + t[n] + r).css("left", "48%");
            }

        var o = 100;
        var i = 1800;

        setTimeout(function () {
            for (e = 0; e < t.length; e++)
                viewMethods.showCoins(t[e], !0);
            for (e = 0; e < t.length; e++)
                for (var n = 0; n < 8; n++)
                    $(".memberCoin" + t[e] + n).animate(memCoin[t[e]], 150 + 150 * n);
            setTimeout(function () {
                mp3AudioPlay("audioCoin")
            }, 10);
        }, o);
        setTimeout(function () {
            viewMethods.finishWinAnimate(obj)
        }, i);
    },
    finishWinAnimate: function (e) {
        $("#playerCoins").hide();
        appData.game.show_card = !1;
        appData.game.show_score = !0;

        for (var i = 1; i < appData.player.length; i++) {
            $(".memberScoreText" + i).fadeIn(200);
            // $(".memberScoreText1").fadeIn(200);
            // $(".memberScoreText2").fadeIn(200);
            // $(".memberScoreText3").fadeIn(200);
            // $(".memberScoreText4").fadeIn(200);
            // $(".memberScoreText5").fadeIn(200);
            // $(".memberScoreText6").fadeIn(200);
            // $(".memberScoreText7").fadeIn(200);
            // $(".memberScoreText8").fadeIn(200);
            // $(".memberScoreText9").fadeIn(200);
            // $(".memberScoreText10").fadeIn(200);
            // $(".memberScoreText11").fadeIn(200);
            // $(".memberScoreText12").fadeIn(200);
        }

        $(".memberScoreText" + appData.player.length).fadeIn(200, function () {

            viewMethods.gameOverNew(e.data.score_board, e.data.balance_scoreboard);

            setTimeout(function () {


                for (var e = 0; e < globalData.maxCount; e++) {
                    $(".memberScoreText" + e).fadeOut("slow");
                    appData.player[e].account_status >= 3 && (appData.player[e].account_status = 1)
                }

            }, 2e3);

            appData.isFinishWinAnimate = !0;
            // if(e.data.total_num==e.data.game_num){
            //     setTimeout(function(){
            //         viewMethods.roundEnd();
            //         newNum=e.data.room_number;
            //     },1e3);
            // }
        });
        if (e.data.total_num == e.data.game_num) {
            viewMethods.roundEnd();
        } else {
            // 自动准备
            setTimeout(function () {
                if (appData.isAutoReady == 1 && appData.isWatching != 1) {
                    viewMethods.clickReady()
                }
            }, 2500)
        }
    },
    resetCoinsPosition: function () {
        for (var e = 1; e <= globalData.maxCount; e++)
            for (var t = 0; t < 8; t++)
                $(".memberCoin" + e + t).css(memCoin[e])
    },
    showCoins: function (e, t) {
        if (t)
            for (a = 0; a < 8; a++)
                $(".memberCoin" + e + a).show();
        else
            for (var a = 0; a < 8; a++)
                $(".memberCoin" + e + a).hide();
    },
    throwCoin: function (e, t) {
        for (var a = 1; a <= t; a++) {
            appData.game.pollCoinNum = appData.game.pollCoinNum + 1;
            var n = (.15 * height - 20) * Math.random();
            var r = (.28 * width - 20) * Math.random();
            if (height / width > 1.8) {
                n = (.1 * height - 20) * Math.random();
                r = (.2 * width - 20) * Math.random();
            }
            $(".scoresArea").append("<div class='coin coin" + e + " num" + appData.game.pollCoinNum + "' ></div>");
            $(".num" + appData.game.pollCoinNum).velocity({top: n, left: r}, {duration: 200 + 200 * Math.random()})
        }
    }
};

var width = window.innerWidth;
var height = window.innerHeight;
var numD = 0;
var isTimeLimitShow = !1;

var timesOffset = (.9 * width - .088 * height * 4 - .02 * width * 3) / 2;
var coinLeft1 = .045 * height + "px";
var coinLeft2 = width - .045 * height + "px";
var coinLeft3 = width - .045 * height + "px";
var coinLeft4 = width - .045 * height + "px";
var coinLeft5 = width - .06 * height + "px";
var coinLeft6 = .06 * height + "px";
var coinLeft7 = .045 * height + "px";
var coinLeft8 = .045 * height + "px";
var coinLeft9 = .045 * height + "px";

var memCoin = [];

if (globalData.maxCount == 9) {
    memCoin = [
        {},
        {top: '82%', left: '4.5vh'},
        {top: '59%', left: coinLeft2},
        {top: '43%', left: coinLeft2},
        {top: '27%', left: coinLeft2},
        {top: '11%', left: coinLeft5},
        {top: '11%', left: '15vh'},
        {top: '27%', left: '4.5vh'},
        {top: '43%', left: '4.5vh'},
        {top: '59%', left: '4.5vh'},
    ];
} else if (globalData.maxCount == 12) {
    memCoin = [
        {},
        {top: '82%', left: '5.0vw'},
        {top: '63%', left: '91.0vw'},
        {top: '51%', left: '91.0vw'},
        {top: '39%', left: '91.0vw'},
        {top: '27%', left: '91.0vw'},
        {top: '8%', left: '88.0vw'},
        {top: '4%', left: '48.5vw'},
        {top: '8%', left: '8.0vw'},
        {top: '27%', left: '5.0vw'},
        {top: '39%', left: '5.0vw'},
        {top: '51%', left: '5.0vw'},
        {top: '63%', left: '5.0vw'}
    ];
}

var viewStyle = {
    readyButton: {
        position: "absolute",
        top: (.11 * height - .0495 * height) / 2 + "px",
        left: (.9 * width - .0495 * height * 3.078) / 2 + "px",
        width: .0495 * height * 3.078 + "px",
        height: .0495 * height + "px"
    },
    readyText: {
        position: "absolute",
        top: "50%",
        left: "50%",
        width: "6vh",
        height: "3vh",
        "margin-top": "-1.5vh",
        "margin-left": "-3vh"
    },
    button: {
        position: "absolute",
        top: "68%",
        left: "5%",
        width: "90%",
        height: "11vh",
        overflow: "hidden"
    },
    rob: {
        position: "absolute",
        top: (.11 * height - .0495 * height) / 2 + "px",
        left: (.9 * width - .0495 * height / .375 * 2 - 20) / 2 + "px",
        width: .0495 * height / .375 + "px",
        height: .0495 * height + "px"
    },
    rob1: {
        position: "absolute",
        top: "0px",
        left: "0px",
        width: .0495 * height / .375 + "px",
        height: .0495 * height + "px",
        "line-height": .0495 * height + "px",
        "text-align": "center",
        color: "white",
        "font-size": "2.2vh",
        "font-weight": "bold"
    },
    notRob: {
        position: "absolute",
        top: (.11 * height - .0495 * height) / 2 + "px",
        left: (.9 * width - .0495 * height / .375 * 2 - 20) / 2 + .0495 * height / .375 + 20 + "px",
        width: .0495 * height / .375 + "px",
        height: .0495 * height + "px"
    },
    notRob1: {
        position: "absolute",
        top: "0px",
        left: "0px",
        width: .0495 * height / .375 + "px",
        height: .0495 * height + "px",
        "line-height": .0495 * height + "px",
        "text-align": "center",
        color: "white",
        "font-size": "2.2vh",
        "font-weight": "bold"
    },
    showCard: {
        position: "absolute",
        top: (.11 * height - .0495 * height) / 2 + "px",
        left: (.9 * width - .0495 * height / .375) / 2 + "px",
        width: .0495 * height / .375 + "px",
        height: .0495 * height + "px"
    },
    showCard1: {
        position: "absolute",
        top: "0px",
        left: "0px",
        width: .0495 * height / .375 + "px",
        height: .0495 * height + "px",
        "line-height": .0495 * height + "px",
        "text-align": "center",
        color: "white",
        "font-size": "2.2vh",
        "font-weight": "bold"
    },
    times1: {
        position: "absolute",
        top: (.11 * height - .088 * height / 2) / 2 + "px",
        left: timesOffset + "px",
        width: .088 * height + "px",
        height: .088 * height / 2 + "px",
        "line-height": .088 * height / 2 + "px"
    },
    timesText: {
        position: "absolute",
        width: .088 * height + "px",
        height: .088 * height / 2 + "px",
        "line-height": .088 * height / 2 + "px",
        "text-align": "center",
        color: "white",
        "font-size": "2.2vh",
        "font-weight": "bold"
    },
    times2: {
        position: "absolute",
        top: (.11 * height - .088 * height / 2) / 2 + "px",
        left: timesOffset + .02 * width + .088 * height + "px",
        width: .088 * height + "px",
        height: .088 * height / 2 + "px",
        "line-height": .088 * height / 2 + "px"
    },
    times3: {
        position: "absolute",
        top: (.11 * height - .088 * height / 2) / 2 + "px",
        left: timesOffset + .02 * width * 2 + .088 * height * 2 + "px",
        width: .088 * height + "px",
        height: .088 * height / 2 + "px",
        "line-height": .088 * height / 2 + "px"
    },
    times4: {
        position: "absolute",
        top: (.11 * height - .088 * height / 2) / 2 + "px",
        left: timesOffset + .02 * width * 3 + .088 * height * 3 + "px",
        width: .088 * height + "px",
        height: .088 * height / 2 + "px",
        "line-height": .088 * height / 2 + "px"
    },
    robText2: {
        position: "absolute",
        top: (.11 * height - .03 * height) / 2 + "px",
        left: (.9 * width - .0557 * height - .03 * height - .005 * height) / 2 + "px",
        width: .0557 * height + "px",
        height: .03 * height + "px"
    },
    robText: {
        position: "absolute",
        top: (.11 * height - .03 * height) / 2 + "px",
        left: (.9 * width - .0557 * height) / 2 + "px",
        width: .0557 * height + "px",
        height: .03 * height + "px"
    },
    robTimesText: {
        position: "absolute",
        top: (.11 * height - .03 * height) / 2 + "px",
        left: (.9 * width - .0557 * height - .03 * height - .002 * height) / 2 + .0557 * height + .005 * height + "px",
        width: .03 * height + "px",
        height: .03 * height + "px"
    },
    notRobText: {
        position: "absolute",
        top: (.11 * height - .03 * height) / 2 + "px",
        left: (.9 * width - .0557 * height) / 2 + "px",
        width: .0557 * height + "px",
        height: .03 * height + "px"
    },
    showCardText: {
        position: "absolute",
        top: "10%",
        left: "10%",
        width: "80%",
        height: "11vh",
        "font-size": "2.2vh"
    },
    showCardText1: {
        position: "absolute",
        width: "100%",
        height: "100%",
        color: "white",
        "font-size": "2.2vh",
        "text-align": "center",
        "line-height": "11vh",
        "font-family": "Helvetica 微软雅黑"
    },
    coinText: {
        position: "absolute",
        top: "10%",
        left: "10%",
        width: "80%",
        height: "11vh",
        "font-size": "2.2vh"
    },
    coinText1: {
        position: "absolute",
        width: "100%",
        height: "100%",
        color: "white",
        "font-size": "2.2vh",
        "text-align": "center",
        "line-height": "11vh",
        "font-family": "Helvetica 微软雅黑"
    }
};
var ruleInfo = {
    type: -1,
    isShow: !1,
    isShowRule: !1,
    baseScore: 1,
    timesType: 1,
    is_cardjoker: 0,
    is_cardbao9: 0,
    ticket: 1,
    rule_height: "4vh",
    banker_mode: 1,
    banker_score: 1,
    bankerText: "抢庄"
};
var editAudioInfo = {
    isShow: !1,
    backMusic: 1,
    messageMusic: 1
};
var audioInfo = {
    backMusic: 1,
    messageMusic: 1
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
    is_X: !1,
    numAry: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    minRaise: 0,
    maxRaise: 9,
    raiseValue: 0,
    raiseStep: 1,
    raiseChip: 30,
    user_id: userData.account_id,
    viewStyle: viewStyle,
    roomStatus: globalData.roomStatus,
    width: window.innerWidth,
    height: window.innerHeight,
    roomCard: Math.ceil(globalData.card),
    is_connect: !1,
    player: [],
    scoreboard: "",
    activity: [],
    isShowInvite: !1,
    isShowAlert: !1,
    add_user: false,
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
    'isShowHomeAlert': false,
    applyStatus: 0, //0尚未申请  1加好友申请中
    isShowIndiv: false,
    'inputIndiv': '',
    'isShowIndividuality': false,
    'isShowIndividualityError': false,
    'individuality': userData.individuality,
    'individualityError': "",
    'userData': userData,
    'isShowAlertTip': false,
    'alertTipText': "",
    'alertTipType': 1,

    'isShowGameAlert': false,
    'isShowNewMessage': false,
    isShowMessage: !1,
    alertType: 0,
    alertText: "",
    showRob: !1,
    showShowCardButton: !1,
    showRobText: !1,
    showNotRobText: !1,
    showClockRobText: !1,
    showClockBetText: !1,
    showClockShowCard: !1,
    showTimesCoin: !1,
    showClickShowCard: !1,
    showBankerCoinText: !1,
    clickCard3: !1,
    base_score: 0,
    playerBoard: {
        score: new Array,
        round: 0,
        record: ""
    },
    game: game,
    roomCardInfo: [],
    wsocket: ws,
    connectOrNot: !0,
    socketStatus: 0,
    heartbeat: null,
    select: 1,
    ticket_count: 0,
    isDealing: !1,
    message: message,
    bankerArray: [],
    bankerAccountId: "",
    bankerPlayer: "",
    bankerPlayerNum: -1,
    bankerAnimateCount: 0,
    bankerAnimateIndex: 0,
    lastBankerImgId: "",
    bankerAnimateDuration: 120,
    isFinishWinAnimate: !1,
    isFinishBankerAnimate: !1,
    isShowErweima: !1,
    isShowRecord: !1,
    recordList: [],
    ruleInfo: ruleInfo,
    canBreak: 0,
    overType: 1,
    isBreak: 0,
    breakData: "",
    bankerID: 0,
    editAudioInfo: editAudioInfo,
    audioInfo: audioInfo,
    isReconnect: !0,
    bScroll: null,
    isShowNoty: !1,
    notyMsg: "",
    isShowNoteImg: !1,
    'musicOnce': true,
    isShowTipsText: false,
    tipsText: "",
    gameover: false,
};

if (void 0 != globalData.isNotyMsg && null != globalData.isNotyMsg) {
    appData.notyMsg = globalData.notyMsg;
    if (1 == globalData.isNotyMsg) {
        appData.isShowNoty = !0;
        setTimeout(function () {
            appData.isShowNoty = !1;
        }, 1e3 * globalData.notyTime);
    }
} else {
    globalData.isNotyMsg = 0;
}

var resetState = function () {
    appData.game.show_score = !1;
    appData.game.show_bettext = !1;
    appData.clickCard3 = !1;
    for (e = 0; e < globalData.maxCount; e++) {
        appData.player.push({
            num: e + 1,
            serial_num: e + 1,
            account_id: 0,
            account_status: 0,
            playing_status: 0,
            online_status: 0,
            nickname: "",
            account_code: "",
            headimgurl: "",
            account_score: 0,
            ticket_checked: 1,
            is_win: !1,
            win_type: 0,
            limit_time: 0,
            is_operation: !1,
            win_show: !1,
            card: [],
            card_open: [],
            is_showCard: !1,
            is_pk: !1,
            is_readyPK: !1,
            card_type: 0,
            is_banker: !1,
            multiples: 0,
            bankerMultiples: 0,
            combo_point: 0,
            timesImg: "",
            bankerTimesImg: "",
            robImg: "",
            bullImg: "",
            single_score: 0,
            messageOn: !1,
            is_showbull: !1,
            is_audiobull: !1,
            is_showCard: !1,
            messageText: "",
            coins: []
        });
        appData.playerBoard.score.push({
            account_id: 0,
            nickname: "",
            account_code: "",
            account_score: 0,
            isBigWinner: 0
        });
    }
    for (var e = 0; e < appData.player.length; e++) {
        appData.player[e].coins = [];
        for (var t = 0; t < 8; t++)
            appData.player[e].coins.push("memberCoin" + appData.player[e].num + t);
    }
    httpModule.getInfo();
};
var resetAllPlayerData = function () {
    appData.player = [];
    for (e = 0; e < globalData.maxCount; e++)
        appData.player.push({
            num: e + 1,
            serial_num: e + 1,
            account_id: 0,
            account_status: 0,
            playing_status: 0,
            online_status: 0,
            nickname: "",
            account_code: "",
            headimgurl: "",
            account_score: 0,
            ticket_checked: 0,
            is_win: !1,
            win_type: 0,
            limit_time: 0,
            is_operation: !1,
            win_show: !1,
            card: new Array,
            card_open: new Array,
            is_showCard: !1,
            is_pk: !1,
            is_readyPK: !1,
            card_type: 0,
            is_banker: !1,
            multiples: 0,
            bankerMultiples: 0,
            combo_point: 0,
            timesImg: "",
            bankerTimesImg: "",
            robImg: "",
            bullImg: "",
            single_score: 0,
            messageOn: !1,
            is_showbull: !1,
            is_audiobull: !1,
            messageText: "",
            coins: []
        });
    for (var e = 0; e < appData.player.length; e++) {
        appData.player[e].coins = [];
        for (var t = 0; t < 8; t++)
            appData.player[e].coins.push("memberCoin" + appData.player[e].num + t)
    }
};
var newGame = function () {
    appData.playerBoard = {
        score: new Array,
        round: 0,
        record: ""
    };
    appData.game.round = 0;
    appData.game.status = 1;
    appData.game.cardDeal = 0;
    appData.game.can_open = 0;
    appData.game.current_win = 0;
    appData.game.is_play = !1;
    appData.game.show_score = !1;
    appData.game.show_bettext = !1;
    appData.clickCard3 = !1;

    for (var e = 0; e < appData.player.length; e++) {
        appData.playerBoard.score.push({
            account_id: 0,
            nickname: "",
            account_code: "",
            account_score: 0,
            isBigWinner: 0
        });
        if (1 == appData.player[e].online_status) {
            appData.player[e].account_status = 0;
            appData.player[e].playing_status = 0;
            appData.player[e].is_win = !1;
            appData.player[e].is_operation = !1;
            appData.player[e].win_type = 0;
            appData.player[e].win_show = !1;
            appData.player[e].card = new Array;
            appData.player[e].card_open = new Array;
            appData.player[e].card_type = 0;
            appData.player[e].ticket_checked = 0;
            appData.player[e].account_score = 0;
            appData.player[e].is_showCard = !1;
            appData.player[e].is_readyPK = !1;
            appData.player[e].is_pk = !1;
            appData.player[e].is_banker = !1;
            appData.player[e].multiples = 0;
            appData.player[e].bankerMultiples = 0;
            appData.player[e].combo_point = 0;
            appData.player[e].timesImg = "";
            appData.player[e].bankerTimesImg = "";
            appData.player[e].robImg = "";
            appData.player[e].bullImg = "";
            appData.player[e].single_score = 0;
            appData.player[e].num = e + 1;
            //appData.player[e].is_bull=!1;
            appData.player[e].is_showbull = !1;
            appData.player[e].is_audiobull = !1;
        } else {
            appData.player[e] = {
                num: e + 1,
                serial_num: appData.player[e].serial_num,
                account_id: 0,
                account_status: 0,
                playing_status: 0,
                online_status: 0,
                nickname: "",
                account_code: "",
                headimgurl: "",
                account_score: 0,
                is_win: !1,
                win_type: 0,
                ticket_checked: 0,
                limit_time: 0,
                is_operation: !1,
                win_show: !1,
                card: new Array,
                card_open: new Array,
                is_showCard: !1,
                is_pk: !1,
                is_readyPK: !1,
                card_type: 0,
                is_banker: !1,
                multiples: 0,
                bankerMultiples: 0,
                combo_point: 0,
                timesImg: "",
                bankerTimesImg: "",
                robImg: "",
                bullImg: "",
                single_score: 0,
                //is_bull:!1,
                is_showbull: !1,
                is_audiobull: !1
            };
        }
    }
};
var connectSocket = function (e, t, a, n, r) {
    ws = new WebSocket(e)
    ws.onopen = t;
    ws.onmessage = a;
    ws.onclose = n;
    ws.onerror = r;
};
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

    if (-201 == obj.result) {
        viewMethods.clickShowAlert(31, obj.result_message);
    } else if (-202 == obj.result) {
        appData.isReconnect = !1;
        socketModule.closeSocket();
        viewMethods.clickShowAlert(32, obj.result_message);
    } else if (-203 == obj.result) {
        methods.reloadView();
    }

    if (0 != obj.result) {
        if (obj.operation == wsOperation.JoinRoom) {
            if (1 == obj.result) {
                if (1 == obj.data.alert_type) {
                    viewMethods.clickShowAlert(1, obj.result_message);
                } else if (2 == obj.data.alert_type) {
                    viewMethods.clickShowAlert(2, obj.result_message);
                } else if (3 == obj.data.alert_type) {
                    viewMethods.clickShowAlert(11, obj.result_message);
                } else {
                    viewMethods.clickShowAlert(7, obj.result_message);
                }
            } else {
                obj.result, viewMethods.clickShowAlert(7, obj.result_message);
            }
        } else if (obj.operation == wsOperation.ReadyStart) {
            if (1 == obj.result) {
                viewMethods.clickShowAlert(1, obj.result_message);
            }
        } else if (obj.operation == wsOperation.PrepareJoinRoom) {
            if (obj.result > 0) {
                socketModule.processGameRule(obj);
            }
            if (1 == obj.result) {
                if (1 == obj.data.alert_type) {
                    viewMethods.clickShowAlert(1, obj.result_message);
                } else if (2 == obj.data.alert_type) {
                    viewMethods.clickShowAlert(2, obj.result_message);
                } else if (3 == obj.data.alert_type) {
                    viewMethods.clickShowAlert(11, obj.result_message);
                } else {
                    viewMethods.clickShowAlert(7, obj.result_message);
                }
            } else {
                obj.result, viewMethods.clickShowAlert(23, obj.result_message);
            }
        } else if (obj.operation == wsOperation.RefreshRoom) {
            methods.reloadView();
        }
        appData.player[0].is_operation = !1;
    } else {
        switch (obj.operation) {
            case wsOperation.PrepareJoinRoom:
                socketModule.processPrepareJoinRoom(obj);
                break;
            case wsOperation.JoinRoom:
                socketModule.processJoinRoom(obj);
                break;
            case wsOperation.RefreshRoom:
                socketModule.processRefreshRoom(obj);
                break;
            case wsOperation.AllGamerInfo:
                socketModule.processAllGamerInfo(obj);
                break;
            case wsOperation.UpdateGamerInfo:
                socketModule.processUpdateGamerInfo(obj);
                break;
            case wsOperation.UpdateAccountStatus:
                socketModule.processUpdateAccountStatus(obj);
                break;
            case wsOperation.UpdateAccountShow:
                socketModule.processUpdateAccountShow(obj);
                break;
            case wsOperation.UpdateAccountMultiples:
                socketModule.processUpdateAccountMultiples(obj);
                break;
            case wsOperation.StartLimitTime:
                socketModule.processStartLimitTime(obj);
                break;
            case wsOperation.CancelStartLimitTime:
                socketModule.processCancelStartLimitTime(obj);
                break;
            case wsOperation.GameStart:
                socketModule.processGameStart(obj);
                break;

            case wsOperation.UpdateAccountScore:
                socketModule.processUpdateAccountScore(obj);
                break;
            case wsOperation.Win:
                socketModule.processWin(obj);
                break;
            case wsOperation.BroadcastVoice:
                socketModule.processBroadcastVoice(obj);
                break;
            case wsOperation.StartBet:
                socketModule.processStartBet(obj);
                break;
            case wsOperation.StartShow:
                socketModule.processStartShow(obj);
                break;
            case wsOperation.MyCards:
                socketModule.processMyCards(obj);
                break;
            case "getScoreBoard":
                socketModule.processGetScoreBoard(obj);
                break;
            case "setIndividuality":
                socketModule.processSetIndividuality(obj);
                break;
            case "getAccountInfo":
                socketModule.pGAI(obj);
                break;
            case "getAccountCard":
                socketModule.pGAC(obj);
                break;
            default:
                logMessage(obj.operation);
        }
    }
};
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
var wsErrorCallback = function (e) {
    logMessage("websocket onerror：");
    logMessage(e);
};
var reconnectSocket = function () {
    if (appData.isReconnect && 4 != globalData.roomStatus) {
        if (ws) {
            if (logMessage(ws.readyState), 1 == ws.readyState) return;
            ws = null
        }
        logMessage("reconnectSocket"),
            connectSocket(globalData.socket, wsOpenCallback, wsMessageCallback, wsCloseCallback, wsErrorCallback)
    }
};
var m4aAudioPlay = function (e) {
    if (!audioModule.audioOn) return 0;
    audioModule.playSound(e)
};
var mp3AudioPlay = function (e) {
    if (!audioModule.audioOn) return 0;
    audioModule.playSound(e)
};
var audioModule = {
    audioOn: !1,
    audioContext: null,
    audioBuffers: [],
    baseUrl: "",
    initModule: function (e) {
        this.baseUrl = e;
        this.audioBuffers = [];
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
        this.audioContext = new window.AudioContext
    },
    stopSound: function (e) {
        var t = this.audioBuffers[e];
        t && t.source && (t.source.stop(0), t.source = null)
    },
    playSound: function (e, t) {
        if ("backMusic" == e) {
            if (0 == audioInfo.backMusic) return
        } else if (0 == audioInfo.messageMusic) return;

        var a = this.audioBuffers[e];
        if (a) {
            try {
                if (void 0 != WeixinJSBridge) {
                    WeixinJSBridge.invoke("getNetworkType", {}, function (e) {
                        a.source = null;
                        a.source = audioModule.audioContext.createBufferSource();
                        a.source.buffer = a.buffer;
                        a.source.loop = !1;
                        var n = audioModule.audioContext.createGain();
                        if (1 == t) {
                            a.source.loop = !0;
                            n.gain.value = .7;
                        } else {
                            n.gain.value = 1;
                        }
                        a.source.connect(n);
                        n.connect(audioModule.audioContext.destination);
                        a.source.start(0);
                    });
                }
            } catch (e) {
                a.source = null;
                a.source = audioModule.audioContext.createBufferSource();
                a.source.buffer = a.buffer;
                a.source.loop = !1;
                var n = audioModule.audioContext.createGain();
                if (1 == t) {
                    a.source.loop = !0;
                    n.gain.value = .7;
                } else {
                    n.gain.value = 1;
                }
                a.source.connect(n);
                n.connect(audioModule.audioContext.destination);
                a.source.start(0);
            }
        }
    },
    initSound: function (e, t) {
        this.audioContext.decodeAudioData(e, function (e) {
            audioModule.audioBuffers[t] = {name: t, buffer: e, source: null};
            if ("backMusic" == t) {
                audioModule.audioOn = !0;
                audioModule.playSound(t, !0);
            }
        }, function (e) {
            logMessage("Error decoding file", e);
        });
    },
    loadAudioFile: function (e, t) {
        var a = new XMLHttpRequest;
        a.open("GET", e, !0);
        a.responseType = "arraybuffer";
        a.onload = function (e) {
            audioModule.initSound(a.response, t);
        };
        a.send();
    },
    loadAllAudioFile: function () {
        if (4 != globalData.roomStatus && 1 != isLoadAudioFile) {
            isLoadAudioFile = !0;
            this.loadAudioFile(this.baseUrl + "files/audio/sangong/background8.mp3", "backMusic");
            var e = ["0.m4a", "1.m4a", "2.m4a", "3.m4a", "4.m4a", "5.m4a", "6.m4a", "7.m4a", "8.m4a", "9.m4a",
                "special5.m4a", "special_santiao.m4a", "special_santiao.m4a", "special8.m4a", "special9.m4a", "special10.m4a", "special11.m4a",
                "coin.mp3", "audio1.m4a"];
            var t = ["sangong0", "sangong1", "sangong2", "sangong3", "sangong4", "sangong5", "sangong6", "sangong7", "sangong8", "sangong9",
                "special5", "special6", "special7", "special8", "special9", "special10", "special11",
                "audioCoin", "audio1"];
            for (a = 0; a < e.length; a++)
                this.loadAudioFile(this.baseUrl + "files/audio/sangong/" + e[a], t[a]);

            var filename = ["30.m4a", "50.m4a", "60.m4a", "90.m4a", "100.m4a", "120.m4a", "150.m4a", "180.m4a",
                "200.m4a", "210.m4a", "240.m4a", "250.m4a", "270.m4a", "300.m4a", "350.m4a", "400.m4a", "450.m4a",
                "500.m4a", "600.m4a", "700.m4a", "800.m4a", "900.m4a", "1000.m4a"];
            var refername = ["30", "50", "60", "90", "100", "120", "150", "180",
                "200", "210", "240", "250", "270", "300", "350", "400", "450",
                "500", "600", "700", "800", "900", "1000"];
            for (a = 0; a < filename.length; a++)
                this.loadAudioFile(this.baseUrl + "files/audio/dcx/" + filename[a], refername[a]);

            var n = ["message0.m4a", "message1.m4a", "message2.m4a", "message3.m4a", "message4.m4a", "message5.m4a", "message6.m4a", "message7.m4a", "message8.m4a", "message9.m4a", "message10.m4a", "message11.m4a", "message12.m4a", "message13.m4a", "message14.m4a", "message15.m4a", "message16.m4a", "message17.m4a", "message18.m4a", "message19.m4a", "message20.m4a", "message21.m4a"];
            var r = ["message0", "message1", "message2", "message3", "message4", "message5", "message6", "message7", "message8", "message9", "message10", "message11", "message12", "message13", "message14", "message15", "message16", "message17", "message18", "message19", "message20", "message21"];
            for (a = 0; a < n.length; a++)
                this.loadAudioFile(this.baseUrl + "files/audio/sound/" + n[a], r[a])
        }
    }
};
audioModule.initModule(globalData.fileUrl);

var initView = function () {
    $("#app-main").width(appData.width);
    $("#app-main").height(appData.height);
    $("#table").width(appData.width);
    $("#table").height(appData.height);
    $(".ranking").css("width", 2 * appData.width);
    $(".ranking").css("height", 2 * appData.width * 1.621);

    window.onload = function () {
        var e = ["table", "vinvite", "valert", "vmessage", "vcreateRoom", "vroomRule", "endCreateRoom", "endCreateRoomBtn"];
        for (t = e.length, a = 0; a < t; a++) {
            var n = document.getElementById(e[a]);
            if (n) {
                n.addEventListener("touchmove", function (e) {
                    e.preventDefault()
                }, !1);
            }
        }

        // var copyLink = document.getElementById("room_str");
        // // 判断平台
        // if("undefined" != typeof globalData.isXianliao&&globalData.isXianliao==1) {
        //     console.log('闲聊')
        //     var copyTitle = globalData.xlTitle
        // }else if("undefined" != typeof globalData.isWechat&&globalData.isWechat==1){
        //     console.log('微信')
        //     var copyTitle = globalData.shareTitle;
        // }else{
        //     console.log('普通')
        //     var copyTitle = document.title;
        // }
        // copyLink.value = copyTitle + window.location.href;
        // console.log(window.location.href);
        // $.fn.BindClipboard = $.fn.BindClipboard || function (target) {
        //     var options = {};
        //     if (target) {
        //         options = {
        //             "target": function (trigger) {
        //                 console.log(trigger);
        //                 return $(target)[0];
        //             }
        //         };
        //     }
        //     new ClipboardJS($(this)[0], options).on("success", function (e) {
        //         console.log(e);
        //     }).on("error", function (e) {
        //         console.log(e);
        //     });
        // }
        // // 调用clipboard
        // $(".copyUrl").BindClipboard("#room_str");
    };
};

// var fuzhiMain = {
//     init: function () {
//         $('#tips').show();
//         setTimeout(function () {
//             $('#tips').hide();
//         }, 2000);
//         var clipboard = new ClipboardJS('#copy_btn');
//         clipboard.on('success', function (e) {
//             e.clearSelection();
//             console.log(e.clearSelection);
//         });
//         var shortUrl='';
//         // 判断平台
//         if("undefined" != typeof globalData.isXianliao&&globalData.isXianliao==1) {
//             console.log('闲聊')
//             var copyTitle = globalData.xlTitle
//         }else if("undefined" != typeof globalData.isWechat&&globalData.isWechat==1){
//             console.log('微信')
//             var copyTitle = globalData.shareTitle;
//         }else{
//             console.log('普通')
//             var copyTitle = document.title;
//         }
//         var copyLink = document.getElementById("room_str");
//         var str=window.location.pathname
//         copyLink.value = copyTitle +window.location.href;
//         // $.ajax({
//         //     type : "POST", //提交方式
//         //     url : '/api/getShortUrl',//路径
//         //     data : {
//         //         "url" : str.substr(1)+window.location.search
//         //     },
//         //     success:function(data){
//         //
//         //         if(JSON.parse(data).code==0){
//         //             copyLink.value = copyTitle +window.location.href;
//         //         }else if(JSON.parse(data).code==1){
//         //             shortUrl=JSON.parse(data).url
//         //             copyLink.value=copyTitle+shortUrl
//         //         }
//         //     },
//         //     error:function(jqXHR){
//         //         console.log("发生错误："+ jqXHR.status);
//         //         var copyLink = document.getElementById("room_str");
//         //         copyLink.value = copyTitle +window.location.href;
//         //     }
//         // });
//     },
//     link: function () {
//         var str = navigator.userAgent.toLowerCase();
//         var ver = str.match(/cpu iphone os (.*?) like mac os/);
//         if (!ver) {
//             this.init();
//         } else {
//             if (parseInt(ver[1].replace(/_/g, ".")) < 10) {
//                 var copyLink = document.getElementById("main");
//                 var copyTitle = document.title;
//                 copyLink.innerHTML = copyTitle + window.location.href;
//                 $('#dialog').show();
//             } else {
//                 this.init();
//             }
//         }
//
//     },
//     closeDialog: function () {
//         $('#dialog').hide();
//     },
//
// }

function checkIndividuality(e) {
    return !!/^[0-9a-zA-Z]*$/g.test(e);
}

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
        // localStorage.setItem('userData',JSON.stringify(info));
        return JSON.stringify(info)
    },
    clickVoice: function () {
        if (globalData.p_type == 2) {
            audioModule.loadAudioFile(globalData.fileUrl + 'files/audio/paijiu/dy_button.mp3', 'clickVoice');
            setTimeout(function () {
                m4aAudioPlay('clickVoice');
            }, 100)
        }
    },
    showHomeAlert: viewMethods.showHomeAlert,
    raiseValueChange: function () {
        appData.raiseChip = appData.game.chips[appData.raiseValue]
    },
    showHomeAlert: function () {
        appData.isShowHomeAlert = true;
    },
    closeHomeAlert: function () {
        appData.isShowHomeAlert = false;
    },
    showAlert: viewMethods.clickShowAlert,
    showMessage: viewMethods.showMessage,
    closeAlert: viewMethods.clickCloseAlert,
    sitDown: viewMethods.clickSitDown,
    seeMyCard3: viewMethods.seeMyCard3,
    imReady: viewMethods.clickReady,
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
    hall: function () {
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
        DynLoading.goto('/');
    },
    showResultTextFunc(text) {
        appData.isShowTipsText = true;
        appData.tipsText = text;
        setTimeout(function () {
            appData.isShowTipsText = false;
        }, 1500)
    },
    applyClub: function () {
        httpModule.applyClub();
    },
    // 自动准备
    autoReady() {
        if (appData.gameover == true) {
            return
        }
        if (appData.isAutoReady == 1) {
            appData.isAutoReady = 0;
            localStorage.setItem("isAutoReady", 0);
            localStorage.removeItem("roomNumber");
        } else {
            appData.isAutoReady = 1;
            localStorage.setItem("isAutoReady", 1);
            localStorage.setItem("roomNumber", globalData.roomNumber)
            if (appData.game.status == 1) {
                viewMethods.clickReady();
            }
        }
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
    },
    applyToJoin: function () {
        httpModule.applyToJoin();
    },
    reviewCard: function () {
        window.location.href = Htmls.getReviewUrl(globalData.gameType, globalData.roomNumber);
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
    confirmBreakRoom: function () {
        socketModule.sendGameOver();
        viewMethods.clickCloseAlert();
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
        // appData.editAudioInfo.isShow = !1, appData.audioInfo.backMusic = appData.editAudioInfo.backMusic, appData.audioInfo.messageMusic = appData.editAudioInfo.messageMusic, localStorage.backMusic = appData.editAudioInfo.backMusic, localStorage.messageMusic = appData.editAudioInfo.messageMusic, 1 == appData.audioInfo.backMusic ? (audioModule.stopSound("backMusic"), audioModule.playSound("backMusic", !0)) : audioModule.stopSound("backMusic")
        if (once == '1' && appData.editAudioInfo.backMusic == 0 && appData.audioInfo.backMusic == 0) {
            appData.musicOnce = false;
            return;
        }
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
            // 关闭音乐
            appData.editAudioInfo.backMusic = 0
            appData.editAudioInfo.messageMusic = 0
        } else {
            // 打开音乐
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
        window.location.href = window.location.href;
    },
    showNoteImg: function () {
        appData.isShowNoteImg = !0
    },
    hideNoteImg: function () {
        appData.isShowNoteImg = !1
    },
};
var vueLife = {
    vmCreated: function () {
        logMessage("vmCreated");
        resetState();
        initView();
        if (4 != globalData.roomStatus) {
            $("#loading").hide();
        }
        $(".main").show();
    },
    vmUpdated: function () {
        logMessage("vmUpdated")
    },
    vmMounted: function () {
        logMessage("vmMounted");
        $("#marquee").marquee({
            duration: globalData.notySpeed,
            gap: 50, delayBeforeStart: 0,
            direction: "left",
            duplicated: !0
        });
    },
    vmDestroyed: function () {
        logMessage("vmDestroyed")
    }
};

var vm = new Vue({
    el: "#app-main",
    data: appData,
    methods: methods,
    created: vueLife.vmCreated,
    updated: vueLife.vmUpdated,
    mounted: vueLife.vmMounted,
    destroyed: vueLife.vmDestroyed
});

function preventDefaultFn(e) {
    e.preventDefault();
}

function disable_scroll() {
    $("body").on("touchmove", preventDefaultFn);
}

function enable_scroll() {
    $("body").off("touchmove", preventDefaultFn);
}

var shareContent = "";

function getShareContent() {
    shareContent = "\n";
    if (1 == appData.ruleInfo.bet_type) {
        shareContent += "筹码：300 ";
    } else if (2 == appData.ruleInfo.bet_type) {
        shareContent += "筹码：500 ";
    } else if (3 == appData.ruleInfo.bet_type) {
        shareContent += "筹码：1000 ";
    }
    if (1 == appData.ruleInfo.is_cardjoker || 1 == appData.ruleInfo.is_cardbao9) {
        var e = "  牌型：";
        if (1 == appData.ruleInfo.is_cardjoker) {
            e += " 天公,雷公,地公 ";
        }
        if (1 == appData.ruleInfo.is_cardbao9) {
            e += " 暴玖 ";
        }

        shareContent += e;
    }
    if (1 == appData.ruleInfo.ticket) {
        shareContent += "  局数：12局x2张房卡";
    } else {
        shareContent += "  局数：24局x4张房卡";
    }
}

var isLoadAudioFile = !1;
audioModule.loadAllAudioFile();
audioModule.audioOn = true;
audioModule.stopSound("backMusic");
audioModule.playSound("backMusic", true);
wx.ready(function () {
    audioModule.loadAllAudioFile();
    wx.hideMenuItems({
        menuList: ["menuItem:copyUrl", "menuItem:share:qq", "menuItem:share:weiboApp",
            "menuItem:favorite", "menuItem:share:facebook", "menuItem:share:QZone", "menuItem:refresh"]
    });
    getShareContent();
    wx.onMenuShareTimeline({
        title: globalData.shareTitle,
        desc: shareContent,
        link: globalData.roomUrl,
        imgUrl: globalData.fileUrl + "files/images/dcx/share_dcx.png",
        success: function () {
        },
        cancel: function () {
        }
    });
    wx.onMenuShareAppMessage({
        title: globalData.shareTitle,
        desc: shareContent,
        link: globalData.roomUrl,
        imgUrl: globalData.fileUrl + "files/images/dcx/share_dcx.png",
        success: function () {
        },
        cancel: function () {
        }
    })
});
wx.error(function (e) {
});

if (4 == globalData.roomStatus) {
    setTimeout(function () {
        try {
            var obj = eval("(" + globalData.scoreboard + ")");
            setTimeout(function () {
                socketModule.processLastScoreboard(obj)
            }, 0)
        } catch (e) {
            console.log(e),
                setTimeout(function () {
                    socketModule.processLastScoreboard("")
                }, 0)
        }
    }, 50);
}

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
                var detailedBtn = '<a class="search-number-box-btn" onclick="methods.reviewCard()" style="position: fixed;z-index: 999999999;right:0;bottom:0;width:50%;height:50%;"></a>';
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
            // aBtn.style.height = height * (btnHeight / b) + 'px';
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
    var error_path = error_path || "../../files/images/default_head.png";
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
    var pics = [globalData.fileUrl + "files/images/dcx/rank_frame2.jpg", globalData.fileUrl + "fiesc/images/bull/people_bg.png", globalData.fileUrl + "fiesc/images/bull/ranking_icon.png"];
    if (users.length > 6) {
        pics.push(globalData.fileUrl + "fiesc/images/bull/people_bg2.jpg");
        pics.push(globalData.fileUrl + "fiesc/images/bull/people_bg4.jpg");
        height += 102 * (users.length - 6);
    } else {
        pics.push(globalData.fileUrl + "fiesc/images/bull/people_bg4.jpg");
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

function logMessage(e) {
    console.log(e)
}

function chooseBigWinner() {

    //对积分榜排序
    appData.playerBoard.score.sort(function (a, b) {
        return b.account_score - a.account_score;
    });

    var e = appData.playerBoard.score.length;
    t = 1;
    for (a = 0; a < e; a++) {
        appData.playerBoard.score.isBigWinner = 0;
        if (appData.playerBoard.score[a].account_score > t) {
            t = appData.playerBoard.score[a].account_score;
        }
    }
    for (var n = 0; n < e; n++) {
        if (appData.playerBoard.score[n].account_score == t) {
            appData.playerBoard.score[n].isBigWinner = 1;
        }
    }
}

function getComboCards(e) {
    try {
        if (void 0 == e || 3 != e.length)
            return e;
        var t = !1;
        var a = new Array;
        var n = new Array;
        for (r = 0; r < e.length; r++) {
            var o = e[r];
            if ("-1" == o || -1 == o || "" == o)
                return e;
            o = o.substr(1);
            a.push(parseInt(o))
        }
        for (r = 0; r < e.length - 2; r++) {
            for (var i = r + 1; i < e.length - 1; i++) {
                for (var s = i + 1; s < e.length - 0; s++)
                    if (((a[r] > 10 ? 10 : a[r]) + (a[i] > 10 ? 10 : a[i]) + (a[s] > 10 ? 10 : a[s])) % 10 == 0) {
                        n.push(e[r]), n.push(e[i]), n.push(e[s]);
                        for (var c = 0; c < e.length; c++)
                            e[c] != e[r] && e[c] != e[i] && e[c] != e[s] && n.push(e[c]);
                        t = !0
                    }
                if (t) break
            }
            if (t) break
        }
        if (n.length < 1)
            n = e;
        return n
    } catch (t) {
        return e
    }
}


$(function () {
    if (height / width > 1.8) {
        $(".scoresArea").css("width", "20%");
        $(".scoresArea").css("height", "10vh");
        $(".scoresArea").css("left", "40%");
        appData.is_X = !0;
    }
    sessionStorage.isPaused = "false";
    var e, t;
    if (void 0 !== document.hidden) {
        e = "hidden";
        t = "visibilitychange";
    } else if (void 0 !== document.webkitHidden) {
        e = "webkitHidden";
        t = "webkitvisibilitychange";
    }

    if (void 0 === document.addEventListener || void 0 === e) {
        alert("This demo requires a browser such as Google Chrome that supports the Page Visibility API.");
    } else {
        document.addEventListener(t, function () {
            if (document[e]) {
                audioModule.audioOn = !1;
                audioModule.stopSound("backMusic");
            } else if ("true" !== sessionStorage.isPaused) {
                console.log("play backMusic");
                audioModule.audioOn = !0;
                audioModule.stopSound("backMusic");
                audioModule.playSound("backMusic", !0);
            }
        }, !1);
    }

    $.fn.RangeSlider = function (e) {
        this.sliderCfg = {
            min: e && !isNaN(parseFloat(e.min)) ? Number(e.min) : null,
            max: e && !isNaN(parseFloat(e.max)) ? Number(e.max) : null,
            step: e && Number(e.step) ? e.step : 1,
            callback: e && e.callback ? e.callback : null
        };
        var t = $(this);
        var a = this.sliderCfg.min;
        var n = this.sliderCfg.max;
        var r = this.sliderCfg.step;
        var o = this.sliderCfg.callback;
        t.attr("min", a).attr("max", n).attr("step", r);
        t.bind("input", function (e) {
            t.attr("value", this.value);
            $.isFunction(o) && o(this)
        })
    };
    $("input").RangeSlider({
        min: 0, max: 9, step: 0, callback: function (e) {
            console.log(appData.raiseValue)
        }
    })
});