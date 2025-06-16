var ws;
var game = {
    room: 0,
    room_number: globalData.roomNumber,
    room_url: 0, score: 0,
    status: 0, time: -1,
    round: 0,
    total_num: 0,
    currentScore: 0,
    cardDeal: 0,
    can_open: 0,
    current_win: 0,
    is_play: !1,
    show_card: !1,
    show_coin: !1,
    base_score: 0,
    show_score: !1,
    show_bettext: !1
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
    CreateRoom: "CreateRoom",
    JoinRoom: "JoinRoom",
    SwapSeat: "SwapSeat",
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
    autoCreateRoom: "autoCreateRoom",
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
    MyCards: "MyCards",
    GameHistory: "HistoryScoreboard",
    GameOver: "GameOver",
    BreakRoom: "BreakRoom",
    //观战功能
    GuestRoom: "GuestRoom",
    AllGuestInfo: "AllGuestInfo",
    UpdateGuestInfo: "UpdateGuestInfo",
    getScoreBoard: "getScoreBoard",
};
var httpModule = {
    getInfo: function () {
        var postData = {
            "account_id": userData.account_id,
            "room_number": globalData.roomNumber,
            "game_type": globalData.gameType
        };
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
        appData.game.base_score = Math.ceil(e.data.base_score);
        appData.base_score = appData.game.base_score;
        appData.game.status = Math.ceil(e.data.room_status);

        if (5 == appData.ruleInfo.banker_mode && 1 == appData.game.round) {
            if (appData.player[0].account_status > 5) {
                appData.game.cardDeal = 5;
            }
        } else {
            if (2 == appData.game.status) {
                appData.game.cardDeal = 5;
            }
        }
        appData.scoreboard = e.data.scoreboard;
        viewMethods.resetMyAccountStatus();
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
                for (var a = 0; a < appData.player.length; a++) {
                    if (appData.player[a].account_id == e.data[t].account_id) {
                        appData.player[a].nickname = '';
                        appData.player[a].headimgurl = '';
                        appData.player[a].account_id = '';
                        // appData.player[a].is_guest=1;
                        if (appData.player[a].account_status < 1) {
                            appData.player[a].account_id = 0;
                        }
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

        if (appData.userData.individuality != "" && appData.isWatching == 1) {
            // 显示一次暗号
            setTimeout(function () {
                appData.showOnceIndiv = true
                setTimeout(function () {
                    appData.showOnceIndiv = false
                    localStorage.setItem('showOnceIndiv', 1)
                }, 2500);
            }, 1000);
        } else if (appData.userData.individuality == "" && appData.isWatching == 1) {
            appData.isShowIndiv = true;
        }
    },
    processUpdateGuestInfo: function (e) {
        for (a = 0; a < appData.guests.length; a++)
            if (appData.guests[a].account_id == e.data.account_id) {
                break;
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
                    appData.player[n].nickname = '';
                    appData.player[n].headimgurl = '';
                    appData.player[n].account_id = '';
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
        if (ws) try {
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
            data: {room_number: globalData.roomNumber, token: globalData.tk}
        })
    },
    sendGameHistory: function () {
        socketModule.sendData({
            operation: wsOperation.GameHistory,
            data: {room_number: globalData.roomNumber, token: globalData.tk}
        })
    },
    sendCreateRoom: function () {
        socketModule.sendData({
            operation: wsOperation.CreateRoom,
            data: {
                data_key: Date.parse(new Date) + randomString(5),
                ticket_type: appData.createInfo.ticket,
                score_type: appData.createInfo.baseScore,
                rule_type: appData.createInfo.timesType,
                is_cardfive: appData.createInfo.isCardfive,
                is_cardbomb: appData.createInfo.isCardbomb,
                is_cardtiny: appData.createInfo.isCardtiny,
                banker_mode: appData.createInfo.banker_mode,
                banker_score_type: appData.createInfo.banker_score
            }
        })
    },
    //观战功能
    sendGuestRoom: function () {
        socketModule.sendData({
            operation: wsOperation.GuestRoom,
            data: {
                room_number: globalData.roomNumber, token: globalData.tk
            }
        });
    },
    sendJoinRoom: function () {
        socketModule.sendData({
            operation: wsOperation.JoinRoom,
            data: {
                room_number: globalData.roomNumber, token: globalData.tk
            }
        })
    },
    sendSitDown: function (e) {
        socketModule.sendData({
            operation: wsOperation.JoinRoom,
            data: {
                room_number: globalData.roomNumber,
                serial_num: typeof (e) == 'number' ? e : '',
                token: globalData.tk
            }
        })
    },
    sendSwapSeat: function (e) {
        if (appData.game.is_play == true || appData.player[0].account_status >= 2) {
            return;
        }
        socketModule.sendData({
            operation: wsOperation.SwapSeat,
            data: {
                room_number: globalData.roomNumber,
                serial_num: e,
                token: globalData.tk
            }
        })
    },
    sendRefreshRoom: function () {
        socketModule.sendData({
            operation: wsOperation.RefreshRoom,
            data: {room_id: appData.game.room, token: globalData.tk}
        })
    },
    sendReadyStart: function () {
        socketModule.sendData({
            operation: wsOperation.ReadyStart,
            data: {room_id: appData.game.room, token: globalData.tk}
        })
    },
    sendGameOver: function () {
        socketModule.sendData({
            operation: wsOperation.GameOver,
            data: {room_id: appData.game.room, token: globalData.tk}
        })
    },
    sendBroadcastVoice: function (e) {
        socketModule.sendData({
            operation: wsOperation.BroadcastVoice,
            data: {room_id: appData.game.room, voice_num: e}
        })
    },
    sendGrabBanker: function (e) {
        socketModule.sendData({
            operation: wsOperation.GrabBanker,
            data: {room_id: appData.game.room, is_grab: 1, multiples: parseInt(e), token: globalData.tk}
        })
    },
    sendNotGrabBanker: function () {
        socketModule.sendData({
            operation: wsOperation.GrabBanker,
            data: {room_id: appData.game.room, is_grab: 0, multiples: 1, token: globalData.tk}
        })
    },
    sendPlayerMultiples: function (e) {
        socketModule.sendData({
            operation: wsOperation.PlayerMultiples,
            data: {room_id: appData.game.room, multiples: e, token: globalData.tk}
        })
    },
    sendShowCard: function () {
        socketModule.sendData({
            operation: wsOperation.ShowCard,
            data: {room_id: appData.game.room, token: globalData.tk}
        })
    },
    processGameHistory: function (e) {
        appData.recordList = [];
        for (var t = 0; t < e.data.length; t++) appData.recordList.push({
            time: getLocalTime(e.data[t].time),
            scoreboard: e.data[t].scoreboard
        });
        appData.isShowRecord = !0
    },
    getScoreBoard: function () {
        socketModule.sendData({
            operation: wsOperation.getScoreBoard,
            data: {
                room_id: appData.game.room,
                num: globalData.roomNumber,
                type: globalData.gameType, token: globalData.tk
            }
        });
    },
    processGetScoreBoard: function (obj) {
        ws.close();
        clearInterval(appData.heartbeat);
        $("#loading").hide();

        appData.socketStatus = 0;
        if (obj.data.bs == '') {
            viewMethods.clickShowAlert(8, '房间已关闭');
        } else {
            socketModule.processLastScoreboard(obj.data.bs, obj.wh);
        }

    },
    processGameRule: function (e) {
        if (e.data.ticket_type) {
            appData.ruleInfo.ticket = e.data.ticket_type;
            appData.ruleInfo.baseScore = e.data.score_type;
            appData.ruleInfo.timesType = e.data.rule_type;
            appData.ruleInfo.rule_type = e.data.rule_type;
            appData.ruleInfo.bet_type = e.data.bet_type;
            appData.ruleInfo.special_card = e.data.specail_card;
            appData.ruleInfo.isCardfive = Math.ceil(e.data.is_cardfive);
            appData.ruleInfo.isCardbomb = Math.ceil(e.data.is_cardbomb);
            appData.ruleInfo.isCardtiny = Math.ceil(e.data.is_cardtiny);
            appData.ruleInfo.banker_mode = Math.ceil(e.data.banker_mode);
            appData.ruleInfo.banker_score = Math.ceil(e.data.banker_score_type);
            appData.ruleInfo.can_rub = Math.ceil(e.data.can_rub);
            appData.game.total_num = Math.ceil(e.data.total_num);
        }
        appData.ruleInfo.rule_height = "4vh";
        if (1 == appData.ruleInfo.banker_mode) {
            appData.ruleInfo.bankerText = "抢庄";
        } else if (2 == appData.ruleInfo.banker_mode) {
            appData.ruleInfo.bankerText = "抢庄";
        } else if (3 == appData.ruleInfo.banker_mode) {
            appData.ruleInfo.bankerText = "选庄";
        } else if (4 == appData.ruleInfo.banker_mode) {
            appData.ruleInfo.bankerText = "";
        } else if (5 == appData.ruleInfo.banker_mode) {
            appData.ruleInfo.bankerText = "";
        }

        if (e.data.bet_type == 0) {
            appData.coinList = [1, 2, 3, 5];
        } else if (e.data.bet_type == 1) {
            appData.coinList = [1, 2, 4, 5];
        } else if (e.data.bet_type == 2) {
            appData.coinList = [1, 3, 5, 8];
        } else if (e.data.bet_type == 3) {
            appData.coinList = [2, 4, 6, 10];
        } else if (e.data.bet_type == 4) {
            appData.coinList = [1, 5, 8, 12];
        } else if (e.data.bet_type == 5) {
            appData.coinList = [1, 4, 6, 10];
        }
    },
    processPrepareJoinRoom: function (obj) {
        clearInterval(loadingTimer);
        appData.isShowLoading = false;
        if (obj.data.is_club) {
            if (obj.data.is_club == 1) {
                appData.isShowApply = true;
                appData.applyInfo.club_headimgurl = obj.data.club_headimgurl;
                appData.applyInfo.club_name = obj.data.club_name;
                appData.applyInfo.club_id = obj.data.room_creator;
                // viewMethods.clickShowAlert(2, '无法加入，请联系管理员');
                return;
            }
        }
        if (4 == obj.data.room_status) {
            viewMethods.roundEnd(1);
            appData.game.status = obj.data.room_status;
            // viewMethods.clickShowAlert(8,obj.result_message);
            return;
        }
        if (4 == obj.data.room_status) {
            appData.roomStatus = obj.data.room_status;
            viewMethods.clickShowAlert(2, obj.result_message);
            return;
        }
        // socketModule.gAC();
        this.processGameRule(obj); //复用处理规则

        appData.ruleInfo.rule_height = "4vh";

        if (1 == appData.ruleInfo.banker_mode) {
            appData.ruleInfo.bankerText = "抢庄";
        } else if (2 == appData.ruleInfo.banker_mode) {
            appData.ruleInfo.bankerText = "抢庄";
        } else if (3 == appData.ruleInfo.banker_mode) {
            appData.ruleInfo.bankerText = "选庄";
        } else if (4 == appData.ruleInfo.banker_mode) {
            appData.ruleInfo.bankerText = "";
        } else if (5 == appData.ruleInfo.banker_mode) {
            appData.ruleInfo.bankerText = "";
        }

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
            if (globalData.p_type == 2) {
                //观战功能
                if (obj.data.is_member == "" || obj.data.is_member == false) {
                    socketModule.sendGuestRoom();
                } else {
                    socketModule.sendJoinRoom();
                }
            }
            if (obj.data.room_users.length >= 1) {
                appData.alertType = 4;
                appData.alertText = obj.data.room_users;
                appData.isShowGameAlert = true;
            } else {
                socketModule.sendJoinRoom();
            }

            //viewMethods.clickShowAlert(4,obj.data.alert_text);
            //appData.room_users = obj.data.room_users;
            //console.log(appData.alertText)
        }
    },
    processJoinRoom: function (e) {
        appData.game.room = e.data.room_id;
        appData.game.room_url = e.data.room_url;
        appData.game.currentScore = Math.ceil(e.data.benchmark);
        appData.game.score = Math.ceil(e.data.pool_score);
        appData.game.round = Math.ceil(e.data.game_num);
        appData.game.total_num = Math.ceil(e.data.total_num);
        appData.game.base_score = Math.ceil(e.data.base_score);
        appData.base_score = appData.game.base_score;
        appData.canBreak = Math.ceil(e.data.can_break);
        resetAllPlayerData();
        -1 == e.data.limit_time && (appData.game.time = Math.ceil(e.data.limit_time), viewMethods.timeCountDown());
        appData.player[0].serial_num = e.data.serial_num;
        for (var t = 0; t < globalData.maxCount; t++) {
            if (t <= globalData.maxCount - e.data.serial_num) {
                appData.player[t].serial_num = t + Math.ceil(e.data.serial_num);
            } else {
                appData.player[t].serial_num = t + Math.ceil(e.data.serial_num) - globalData.maxCount;
            }
        }

        appData.player[0].account_status = Math.ceil(e.data.account_status);
        appData.player[0].account_score = Math.ceil(e.data.account_score);
        appData.player[0].nickname = userData.nickname;
        appData.player[0].headimgurl = userData.headimgurl;
        appData.player[0].account_id = userData.account_id;
        appData.player[0].card = e.data.cards.concat();
        appData.player[0].card_open = e.data.combo_array.concat();
        appData.player[0].card_type = e.data.card_type;
        appData.player[0].ticket_checked = e.data.ticket_checked;
        appData.game.status = Math.ceil(e.data.room_status);
        appData.player[0].combo_point = e.data.combo_point;
        appData.player[0].card_open = e.data.cards.concat();
        5 == appData.ruleInfo.banker_mode && 1 == appData.game.round ?
            appData.player[0].account_status > 5 && (appData.game.cardDeal = 5) :
            2 == appData.game.status && (appData.game.cardDeal = 5);
        appData.scoreboard = e.data.scoreboard;
        viewMethods.resetMyAccountStatus();

        //观战功能
        appData.isWatching = 0;
        setTimeout(function () {
            appData.showGuest = 0
        }, 100);
    },
    processSwapSeat: function (e) {
        if (e.data.account_id != appData.userData.account_id) {

            for (var i = 0; i < appData.player.length; i++) {
                if (appData.player[i].serial_num == e.data.old_serial_num) {
                    appData.player[i].nickname = '';
                    appData.player[i].headimgurl = '';
                    appData.player[i].sex = '';
                    appData.player[i].account_id = '';
                    appData.player[i].account_score = '';
                    appData.player[i].account_status = '';
                    appData.player[i].online_status = '';
                    appData.player[i].ticket_checked = '';
                    break;
                }
            }
            return;
        }
        for (var i = 0; i < appData.player.length; i++) {
            // if (appData.player[i].serial_num == e.data.old_serial_num) {
            appData.player[i].nickname = '';
            appData.player[i].headimgurl = '';
            appData.player[i].sex = '';
            appData.player[i].account_id = '';
            appData.player[i].account_score = '';
            appData.player[i].account_status = '';
            appData.player[i].online_status = '';
            appData.player[i].ticket_checked = '';

            // }
        }
        appData.player[0].serial_num = e.data.serial_num;
        for (var t = 0; t < appData.player.length; t++) {
            if (t <= appData.player.length - e.data.serial_num) {
                appData.player[t].serial_num = t + Math.ceil(e.data.serial_num);
            } else {
                appData.player[t].serial_num = t + Math.ceil(e.data.serial_num) - appData.player.length;
            }
        }

        console.log(appData.player);
        appData.player[0].account_status = Math.ceil(e.data.account_status);
        appData.player[0].account_score = Math.ceil(e.data.account_score);
        appData.player[0].nickname = userData.nickname;
        appData.player[0].headimgurl = userData.headimgurl;
        appData.player[0].account_id = userData.account_id;
        appData.player[0].card = "";
        appData.player[0].card_open = "";
        appData.player[0].card_type = "";
        appData.player[0].ticket_checked = "";
        appData.game.status = "";
        appData.player[0].combo_point = "";
        appData.player[0].card_open = "";

    },
    processRefreshRoom: function (e) {
        resetAllPlayerData();
        appData.player[0].serial_num = e.data.serial_num;
        for (t = 0; t < appData.player.length; t++)
            if (t <= appData.player.length - e.data.serial_num) {
                appData.player[t].serial_num = t + Math.ceil(e.data.serial_num);
            } else {
                appData.player[t].serial_num = t + Math.ceil(e.data.serial_num) - appData.player.length;
            }
        appData.player[0].account_status = Math.ceil(e.data.account_status);
        appData.player[0].account_score = Math.ceil(e.data.account_score);
        appData.player[0].nickname = userData.nickname;
        appData.player[0].headimgurl = userData.headimgurl;
        appData.player[0].account_id = userData.account_id;
        appData.player[0].serial_num = e.data.serial_num;
        appData.player[0].card = e.data.cards.concat();
        appData.player[0].card_open = e.data.combo_array.concat();
        appData.player[0].card_type = e.data.card_type;
        appData.player[0].ticket_checked = e.data.ticket_checked;
        appData.player[0].combo_point = e.data.combo_point;
        appData.player[0].card_open = e.data.cards.concat();
        if (5 == appData.ruleInfo.banker_mode && 1 == appData.game.round) {
            appData.player[0].account_status > 5 && (appData.game.cardDeal = 5);
        } else {
            2 == appData.game.status && (appData.game.cardDeal = 5);
        }

        for (var t = 0; t < appData.player.length; t++)
            for (var a = 0; a < e.all_gamer_info.length; a++)
                if (appData.player[t].serial_num == e.all_gamer_info[a].serial_num) {
                    appData.player[t].nickname = e.all_gamer_info[a].nickname;
                    appData.player[t].headimgurl = e.all_gamer_info[a].headimgurl;
                    appData.player[t].account_id = e.all_gamer_info[a].account_id;
                    appData.player[t].account_code = e.all_gamer_info[a].account_code;
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

                    appData.player[t].card_open = e.all_gamer_info[a].cards.concat();
                    if (appData.player[t].card_open.length < 1 || void 0 == appData.player[t].card_open) {
                        appData.player[t].card_open = [-1, -1];
                    }
                }

        appData.player[0].account_status >= 7 && (appData.player[0].is_showCard = !0);
        if (appData.player[0].account_status > 2) {
            setTimeout(function () {
                5 == appData.ruleInfo.banker_mode && 1 == appData.game.round || (appData.player[0].is_showCard = !0)
            }, 500);
        }
        if (3 == appData.player[0].account_status) {
            5 == appData.ruleInfo.banker_mode && 1 == appData.game.round || (appData.showClockRobText = !0);
            setTimeout(function () {
                appData.showRob = !0
            }, 500);
        }
        if (6 == appData.player[0].account_status) {
            appData.showClockBetText = !0;
            if (1 == appData.player[0].is_banker) {
                appData.showRob = !1;
                appData.showRobText = !1;
                appData.showNotRobBankerText = !1;
                appData.showShowCardButton = !1;
                appData.showClickShowCard = !1;
                appData.showBankerCoinText = !0;
                appData.showTimesCoin = !1;
            } else {
                appData.showRob = !1;
                appData.showRobText = !1;
                appData.showNotRobBankerText = !1;
                appData.showShowCardButton = !1;
                appData.showClickShowCard = !1;
                appData.showBankerCoinText = !1;
                appData.showTimesCoin = !0;
            }
        }
        if (6 == appData.player[0].account_status)
            appData.isFinishBankerAnimate = !0;
        viewMethods.resetMyAccountStatus();
        viewMethods.updateAllPlayerStatus();
        if (appData.player[0].account_status > 2 && appData.player[0].account_status < 7 && 2 == appData.ruleInfo.banker_mode) {
            viewMethods.seeMyCard();
        }

        // this.aboutAllGamerInfo(obj.all_gamer_info);
    },
    processStartShow: function (e) {
        var t = 0;
        4 == appData.ruleInfo.banker_mode && (t = 800);
        setTimeout(function () {
            for (var t = 0; t < appData.player.length; t++)
                for (var a = 0; a < e.data.length; a++)
                    if (appData.player[t].account_id == e.data[a].account_id) {
                        appData.player[t].multiples = e.data[a].multiples;
                        appData.player[t].account_status = Math.ceil(e.data[a].account_status);
                        appData.player[t].online_status = Math.ceil(e.data[a].online_status);
                        appData.player[t].card = e.data[a].cards.concat();
                        appData.player[t].card_open = e.data[a].combo_array.concat();
                        appData.player[t].card_type = e.data[a].card_type;
                        appData.player[t].combo_point = e.data[a].combo_point;
                        appData.player[t].limit_time = e.data[a].limit_time;
                        appData.player[t].card_open = e.data[a].cards.concat();
                    }
            appData.showClockBetText = !1;
            appData.showClockRobText = !1;
            appData.showClockShowCard = !0;
            viewMethods.resetMyAccountStatus();
            viewMethods.updateAllPlayerStatus();
            appData.game.time = Math.ceil(e.limit_time);
            viewMethods.timeCountDown();
        }, t);
    },
    processMyCards: function (e) {
        if (2 == appData.ruleInfo.banker_mode) {
            if (appData.player[0].account_id == e.data.account_id) {
                appData.player[0].card = e.data.cards.concat();
            }
            viewMethods.seeMyCard();
        }
    },
    processBreakRoom: function (e) {
        if (appData.breakData = e, 5 == appData.ruleInfo.banker_mode && appData.game.round != appData.game.total_num) return null == e || void 0 == e ? (appData.overType = 2, void viewMethods.clickShowAlert(9, "庄家分数不足，提前下庄，点击确定查看结算")) : void (1 == e.data.type ? appData.player[0].is_banker ? (viewMethods.clickCloseAlert(), null != appData.breakData && void 0 != appData.breakData && viewMethods.gameOverNew(appData.breakData.data.score_board, appData.breakData.data.balance_scoreboard), chooseBigWinner(), $(".ranking .rankBack").css("opacity", "1"), $(".roundEndShow").show(), $(".ranking").show(), canvas()) : (appData.overType = 1, viewMethods.clickShowAlert(9, "庄家主动下庄,点击确定查看结算")) : appData.overType = e.data.type)
    },
    processStartBet: function (obj) {
        var delay = 0;
        if (appData.ruleInfo.banker_mode == 3) {
            delay = 1200;
        }

        if (appData.ruleInfo.banker_mode == 5 && appData.game.round > 1) {
            delay = 900;
        }

        if (appData.game.round == 1 && appData.ruleInfo.banker_mode == 5) {
            //viewMethods.reDeal();
        }

        setTimeout(function () {

            for (var i = 0; i < globalData.maxCount; i++) {
                for (var j = 0; j < obj.data.length; j++) {
                    if (appData.player[i].account_id == obj.data[j].account_id) {
                        appData.player[i].account_status = Math.ceil(obj.data[j].account_status);
                        appData.player[i].online_status = Math.ceil(obj.data[j].online_status);
                        appData.player[i].limit_time = Math.ceil(obj.data[j].limit_time);
                        appData.player[i].multiples = 0;
                        if (obj.data[j].is_banker == 1) {
                            appData.player[i].is_banker = true;
                            appData.bankerAccountId = obj.data[j].account_id;
                            appData.bankerPlayer = appData.player[i];
                        } else {
                            appData.player[i].is_banker = false;
                        }
                    }
                }
            }
            appData.bankerArray = obj.grab_array.concat();
            appData.showRob = false;
            appData.showClockBetText = false;
            appData.showClockRobText = false;
            appData.showClockShowCard = false;
            appData.limitTimeGrab = Math.ceil(obj.limit_time);
            appData.bankerAnimateIndex = 0;
            appData.game.time = -1;

            if (appData.ruleInfo.banker_mode == 5 && appData.game.round > 1) {
                viewMethods.robBankerWithoutAnimate();
            } else {
                if (appData.ruleInfo.banker_mode == 3 && appData.game.round > 1) {
                    viewMethods.robBankerWithoutAnimate();
                } else {
                    viewMethods.clearBanker();
                    viewMethods.robBankerAnimate(obj);

                }
            }

        }, delay);

    },
    processAllGamerInfo: function (e) {
        appData.game.show_card = !0;
        appData.game.show_coin = !0;
        appData.clickCard4 = !1;
        for (a = 0; a < globalData.maxCount; a++)
            for (var t = 0; t < e.data.length; t++)
                if (appData.player[a].serial_num == e.data[t].serial_num) {
                    appData.player[a].nickname = e.data[t].nickname;
                    appData.player[a].headimgurl = e.data[t].headimgurl;
                    appData.player[a].account_id = e.data[t].account_id;
                    appData.player[a].account_code = e.data[t].account_code;
                    appData.player[a].account_score = Math.ceil(e.data[t].account_score);
                    appData.player[a].account_status = Math.ceil(e.data[t].account_status);
                    appData.player[a].online_status = Math.ceil(e.data[t].online_status);
                    appData.player[a].ticket_checked = e.data[t].ticket_checked;
                    appData.player[a].multiples = e.data[t].multiples;
                    appData.player[a].bankerMultiples = e.data[t].banker_multiples;
                    appData.player[a].card_type = e.data[t].card_type;
                    appData.player[a].combo_point = e.data[t].combo_point;
                    appData.player[a].sex = e.data[t].sex;
                    appData.player[a].head_kw = e.data[t].head_kw;
                    appData.player[a].is_showbull = !1;

                    if (1 == e.data[t].is_banker) {
                        appData.player[a].is_banker = !0;
                        appData.bankerAccountId = e.data[t].account_id;
                        appData.bankerPlayer = appData.player[a];
                    } else {
                        appData.player[a].is_banker = !1;
                    }
                    appData.player[a].account_status >= 8 && (appData.player[a].is_showCard = !0);
                    appData.player[a].card_open = e.data[t].cards.concat();

                    if (appData.player[a].card_open.length < 1 || void 0 == appData.player[a].card_open) {
                        appData.player[a].card_open = [-1, -1, -1, -1, -1];
                    }

                    if (3 == appData.player[a].account_status) {
                        appData.waitStart = false
                        appData.showRobText2 = true
                    }
                    if (4 == appData.player[a].account_status) {
                        appData.showClockBetText = true
                    }
                    if (7 == appData.player[a].account_status) {
                        appData.showClockShowCard = true
                    }
                }
        if (appData.player[0].account_status >= 7) {
            appData.player[0].is_showCard = !0;
        }

        if ("" != appData.scoreboard) {
            for (var a = 0; a < appData.player.length; a++)
                for (s in appData.scoreboard)
                    if (appData.player[a].account_id == s) {
                        appData.playerBoard.score[a].num = appData.player[a].num;
                        appData.playerBoard.score[a].account_id = appData.player[a].account_id;
                        appData.playerBoard.score[a].nickname = appData.player[a].nickname;
                        appData.playerBoard.score[a].account_score = Math.ceil(appData.scoreboard[s]);
                    }
            if (2 == appData.game.status) {
                appData.playerBoard.round = appData.game.round - 1;
            } else {
                appData.playerBoard.round = appData.game.round;
            }
        }
        if (appData.player[0].account_status > 2) {
            setTimeout(function () {
                5 == appData.ruleInfo.banker_mode && 1 == appData.game.round || (appData.player[0].is_showCard = !0)
            }, 500);
        }

        if (3 == appData.player[0].account_status) {
            5 == appData.ruleInfo.banker_mode && 1 == appData.game.round || (appData.showClockRobText = !0), setTimeout(function () {
                appData.showRob = !0
            }, 500);
        }
        if (6 == appData.player[0].account_status) {
            appData.showClockBetText = !0;
            if (1 == appData.player[0].is_banker) {
                appData.showRob = !1;
                appData.showRobText = !1;
                appData.showNotRobBankerText = !1;
                appData.showShowCardButton = !1;
                appData.showClickShowCard = !1;
                appData.showBankerCoinText = !0;
                appData.showTimesCoin = !1;
            } else {
                appData.showRob = !1;
                appData.showRobText = !1;
                appData.showNotRobBankerText = !1;
                appData.showShowCardButton = !1;
                appData.showClickShowCard = !1;
                appData.showBankerCoinText = !1;
                appData.showTimesCoin = !0;
            }
        }

        if (6 == appData.player[0].account_status)
            appData.isFinishBankerAnimate = !0;
        viewMethods.resetMyAccountStatus();
        viewMethods.updateAllPlayerStatus();
        if (appData.player[0].account_status > 2 && appData.player[0].account_status < 7 && 2 == appData.ruleInfo.banker_mode) {
            viewMethods.seeMyCard();
        }
    },
    aboutAllGamerInfo: function (gamerInfo) {
        for (var i = 0; i < appData.player.length; i++) {
            for (var j = 0; j < gamerInfo.length; j++) {
                if (appData.player[i].serial_num == gamerInfo[j].serial_num) {

                    appData.player[i].is_guest = 0;    //观战功能
                    appData.player[i].nickname = gamerInfo[j].nickname;
                    appData.player[i].headimgurl = gamerInfo[j].headimgurl;
                    appData.player[i].sex = gamerInfo[j].sex;
                    appData.player[i].account_id = gamerInfo[j].account_id;
                    appData.player[i].account_score = Math.ceil(gamerInfo[j].account_score);
                    appData.player[i].account_status = Math.ceil(gamerInfo[j].account_status);
                    appData.player[i].online_status = Math.ceil(gamerInfo[j].online_status);
                    appData.player[i].ticket_checked = gamerInfo[j].ticket_checked;
                    //appData.player[i].card = gamerInfo[j].cards.concat();
                    //appData.player[i].card_open = gamerInfo[j].combo_array.concat();
                    appData.player[i].multiples = gamerInfo[j].multiples;
                    appData.player[i].bankerMultiples = gamerInfo[j].banker_multiples;
                    appData.player[i].card_type = gamerInfo[j].card_type;
                    appData.player[i].combo_point = gamerInfo[j].combo_point;
                    appData.player[i].is_showbull = false;
                    if (gamerInfo[j].is_banker == 1) {
                        appData.player[i].is_banker = true;
                        appData.bankerAccountId = gamerInfo[j].account_id;
                        appData.bankerPlayer = appData.player[i];
                    } else {
                        appData.player[i].is_banker = false;
                    }
                    if (appData.player[i].account_status >= 8) {
                        appData.player[i].is_showCard = true;
                    }

                    if (appData.player[i].card_open.length <= 0 || appData.player[i].card_open == undefined) {
                        appData.player[i].card_open = gamerInfo[j].combo_array.concat();
                    }

                    if (appData.player[i].card_open.length <= 0 || appData.player[i].card_open == undefined) {
                        appData.player[i].card_open = gamerInfo[j].cards.concat();
                    }

                    if (appData.player[i].card_open.length <= 0 || appData.player[i].card_open == undefined) {
                        appData.player[i].card_open = [-1, -1, -1, -1, -1];
                    }
                }
            }
        }
        if (appData.player[0].account_status >= 7) {
            appData.player[0].is_showCard = true;
        }
        if (appData.scoreboard != "") {
            if (appData.game.status == 2) {
                appData.playerBoard.round = appData.game.round - 1;
            } else {
                appData.playerBoard.round = appData.game.round;
            }
            // appData.playerBoard.record = "前" + appData.playerBoard.round + "局";
        }
        if (appData.player[0].account_status > 2) {
            setTimeout(function () {
                if (appData.ruleInfo.banker_mode == 5 && appData.game.round == 1) {

                } else {
                    appData.player[0].is_showCard = true;
                }

            }, 500);
        }
        if (appData.player[0].account_status == 3) {

            if (appData.ruleInfo.banker_mode == 5 && appData.game.round == 1) {

            } else {
                appData.showClockRobText = true;
            }
            setTimeout(function () {
                appData.showRob = true;
            }, 500);
        }
        if (appData.player[0].account_status == 6) {
            appData.showClockBetText = true;
            if (appData.player[0].is_banker == true) {
                appData.showRob = false;
                appData.showRobText = false;
                appData.showNotRobBankerText = false;
                appData.showShowCardButton = false;
                appData.showClickShowCard = false;
                appData.showBankerCoinText = true;
                appData.showTimesCoin = false;
            } else {
                appData.showRob = false;
                appData.showRobText = false;
                appData.showNotRobBankerText = false;
                appData.showShowCardButton = false;
                appData.showClickShowCard = false;
                appData.showBankerCoinText = false;
                appData.showTimesCoin = true;
            }
        }

        if (appData.player[0].account_status == 6) {
            appData.isFinishBankerAnimate = true;
        }

        viewMethods.resetMyAccountStatus();
        viewMethods.updateAllPlayerStatus();

        if (appData.player[0].account_status > 2 && appData.player[0].account_status < 7 && appData.ruleInfo.banker_mode == 2) {
            viewMethods.seeMyCard();
        }
    },
    processUpdateGamerInfo: function (obj) {
        logMessage(appData.player);
        var has_seat = false;    //观战功能
        for (var i = 0; i < appData.player.length; i++) {
            if (appData.player[i].serial_num == obj.data.serial_num) {
                appData.player[i].nickname = obj.data.nickname;
                appData.player[i].headimgurl = obj.data.headimgurl;
                appData.player[i].sex = obj.data.sex;
                appData.player[i].account_id = obj.data.account_id;
                appData.player[i].account_score = Math.ceil(obj.data.account_score);
                appData.player[i].account_status = Math.ceil(obj.data.account_status);
                appData.player[i].online_status = Math.ceil(obj.data.online_status);
                appData.player[i].ticket_checked = obj.data.ticket_checked;
                appData.player[i].head_kw = obj.data.head_kw;

                appData.player[i].is_guest = 0;    //观战功能
            } else {

                if (appData.player[i].account_id == obj.data.account_id && appData.isWatching != 1) {
                    socketModule.sendRefreshRoom();
                }

                //观战功能  有位置
                if (appData.player[i].account_id == userData.account_id || 0 == appData.player[i].account_id) {
                    has_seat = true;
                }
            }
        }

        appData.showSitdownButton = appData.isWatching && has_seat;

        //观战功能  加入游戏的玩家从观战者列表中剔除
        for (a = 0; a < appData.guests.length; a++)
            if (appData.guests[a].account_id == obj.data.account_id) {
                break;
            }
        appData.guests.splice(a, 1);
    },
    processUpdateAccountStatus: function (e) {
        for (var t = 0; t < appData.player.length; t++) if (appData.player[t].account_id == e.data.account_id) {
            if (2 == appData.ruleInfo.banker_mode && (5 != e.data.account_status && 4 != e.data.account_status || (appData.player[t].bankerMultiples = e.data.banker_multiples)), appData.player[t].account_status >= 8) return void (appData.player[t].online_status = e.data.online_status);
            1 == e.data.online_status ? appData.player[t].account_status = Math.ceil(e.data.account_status) : 0 == e.data.online_status && 0 == appData.player[t].account_status ? (appData.player[t].account_id = 0, appData.player[t].playing_status = 0, appData.player[t].online_status = 0, appData.player[t].nickname = "", appData.player[t].headimgurl = "", appData.player[t].account_score = 0) : 0 == e.data.online_status && appData.player[t].account_status > 0 ? (appData.player[t].account_status = Math.ceil(e.data.account_status), appData.player[t].online_status = 0) : logMessage("~~~~~~~!!!!!!" + e), 0 != t && (4 == appData.player[t].account_status ? setTimeout(function () {
                mp3AudioPlay("audioNoBanker")
            }, 100) : 5 == appData.player[t].account_status && setTimeout(function () {
                mp3AudioPlay("audioRobBanker")
            }, 100));
            break
        }
        3 == appData.player[0].account_status ? viewMethods.showRobBankerText() : 4 == appData.player[0].account_status && viewMethods.showNotRobBankerTextFnc(), appData.isFinishBankerAnimate && appData.isFinishWinAnimate ? (viewMethods.resetMyAccountStatus(), viewMethods.updateAllPlayerStatus()) : setTimeout(function () {
            viewMethods.resetMyAccountStatus(), viewMethods.updateAllPlayerStatus()
        }, 3e3)
    },
    processUpdateAccountShow: function (e) {
        for (var t = 0; t < appData.player.length; t++) if (appData.player[t].account_id == e.data.account_id) {
            if (appData.player[t].card_type = e.data.card_type, appData.player[t].cards = e.data.cards.concat(), appData.player[t].card_open = e.data.combo_array.concat(), appData.player[t].combo_point = e.data.combo_point, appData.player[t].account_status = 8, appData.player[t].card_open = e.data.cards.concat(), 0 == appData.player[t].is_audiobull && appData.player[t].account_status >= 8) {
                var a = "";
                a = 1 == appData.player[t].card_type ? "point" + appData.player[t].combo_point : "type" + appData.player[t].card_type, setTimeout(function () {
                    mp3AudioPlay(a)
                }, 100), appData.player[t].is_audiobull = !0
            }
            break
        }
        e.data.account_id == appData.player[0].account_id && (viewMethods.resetMyAccountStatus()), viewMethods.updateAllPlayerStatus()
    },
    processUpdateAccountMultiples: function (e) {
        for (var t = 0; t < appData.player.length; t++) if (appData.player[t].account_id == e.data.account_id) {
            appData.player[t].multiples = e.data.multiples;
            if (appData.player[t].multiples >= 1) {
                var a = appData.player[t].multiples;
                setTimeout(function () {
                    mp3AudioPlay("audioTimes" + a)
                }, 100)
            }
            break
        }
    },
    processStartLimitTime: function (e) {
        console.log('processStartLimitTime', e)
        if (e.data.limit_time > 1) {
            appData.game.time = Math.ceil(e.data.limit_time)
            console.log('appData.game.status', appData.game.status)
            console.log('!appData.game.is_play', !appData.game.is_play)
            if (!appData.game.is_play) {
                appData.waitStart = true
            }
            console.log('waitStart', appData.waitStart)
            viewMethods.timeCountDown2()
        }
    },
    processCancelStartLimitTime: function (e) {
        appData.game.time = -1;
        appData.waitStart = false;
    },
    processGameStart: function (e) {
        $(".cards").removeClass("card-flipped"),
            $(".myCards").removeClass("card-flipped"),
            $(".memberCoin").stop(!0),
            appData.isFinishWinAnimate = !0,
            appData.isFinishBankerAnimate = !0,
            appData.game.can_open = 0,
            appData.game.cardDeal = 0,
            appData.game.currentScore = 0,
            appData.game.status = 1,
            appData.game.show_card = !0,
            appData.game.score = 0,
            appData.game.time = -1,
            appData.game.is_play = !0,
            appData.game.round = appData.game.round + 1,
            appData.game.round = Math.ceil(e.game_num),
            appData.player[0].is_showCard = !1,
            appData.showClockRobText = !1,
            appData.showClockBetText = !1,
            appData.showClockShowCard = !1,
            appData.clickCard4 = !1,
            appData.showClickShowCard = !1,
            appData.breakData = null;
        for (var t = 0; t < globalData.maxCount; t++) {
            appData.player[t].is_operation = !1,
                appData.player[t].is_showCard = !1,
                appData.player[t].is_showbull = !1,
            5 == appData.ruleInfo.banker_mode && appData.game.round > 1 || 3 == appData.ruleInfo.banker_mode && appData.game.round > 1 || (appData.player[t].is_banker = !1),
                appData.player[t].bullImg = "",
            0 == appData.player[t].online_status && (appData.player[t].account_status = 1);
            for (var a = 0; a < e.data.length; a++)
                appData.player[t].account_id == e.data[a].account_id &&
                (appData.player[t].ticket_checked = 1, appData.player[t].account_status = Math.ceil(e.data[a].account_status),
                    appData.player[t].playing_status = Math.ceil(e.data[a].playing_status),
                    appData.player[t].online_status = Math.ceil(e.data[a].online_status),
                    appData.player[t].account_score = appData.player[t].account_score,
                    appData.player[t].limit_time = Math.ceil(e.data[a].limit_time),
                    appData.game.score = appData.game.score)
        }
        appData.game.status = 2,
            1 == appData.game.round && 5 == appData.ruleInfo.banker_mode ?
                (appData.game.time = -1, viewMethods.resetMyAccountStatus()) :
                (appData.game.time = Math.ceil(e.limit_time), appData.showRobText2 = true, viewMethods.timeCountDown(), viewMethods.reDeal())
    },
    processBroadcastVoice: function (obj) {
        for (var i = 0; i < globalData.maxCount; i++) {
            if (appData.player[i].account_id == obj.data.account_id && i != 0) {

                if (appData.player[0].sex == 1) {
                    var loadMessageNum = 'message' + obj.data.voice_num;
                } else {
                    var loadMessageNum = 'message' + obj.data.voice_num + '_1';
                }
                audioModule.loadAudioFile(globalData.fileUrl + 'fiesc/audio/sound61013/' + loadMessageNum + '.m4a', loadMessageNum);
                setTimeout(function () {
                    m4aAudioPlay(loadMessageNum);
                }, 200)

                viewMethods.messageSay(i, obj.data.voice_num);
            }
        }
    },
    //自动续局
    processAutoCreateRoom: function (obj) {
        appData.showNextRoom = true;
        appData.newRoomNumber = obj.data.room_number;
        // var newRoom=obj.data;
        // newRoom.oldRoomNumber=globalData.roomNumber;
        // localStorage.setItem('newRoom',JSON.stringify(obj.data))
    },
    processWin: function (e) {
        appData.game.is_play = !1,
            appData.game.current_win = e.data.win_score,
            appData.game.round = Math.ceil(e.data.game_num),
            appData.game.total_num = Math.ceil(e.data.total_num),
            appData.playerBoard.round = Math.ceil(e.data.game_num),
            appData.game.show_score = !1,
            appData.showClockShowCard = !1,
            appData.showShowCardButton = !1,
            appData.showClickShowCard = !1,
            appData.showClockBetText = !1,
            appData.showClockRobText = !1,
        3 == appData.ruleInfo.banker_mode && (appData.bankerID = Math.ceil(e.data.banker_id), appData.bankerAccountId = appData.bankerID, console.log(appData.bankerID)), 5 == appData.ruleInfo.banker_mode && (appData.player[0].is_banker && (appData.canBreak = Math.ceil(e.data.can_break)), null == e.data.is_break && void 0 == e.data.is_break || (appData.isBreak = Math.ceil(e.data.is_break))), viewMethods.showMemberScore(!1);
        for (var t = 0; t < appData.player.length; t++) {
            appData.player[t].account_status >= 7 && (appData.player[t].account_status = 8);
            for (var a = 0; a < e.data.loser_array.length; a++) if (appData.player[t].account_id == e.data.loser_array[a].account_id) {
                appData.player[t].single_score = e.data.loser_array[a].score;
                break
            }
            for (var n = 0; n < e.data.winner_array.length; n++) if (appData.player[t].account_id == e.data.winner_array[n].account_id) {
                appData.player[t].single_score = e.data.winner_array[n].score;
                break
            }
        }
        if (e.data.is_banker_kill == 1) {
            appData.isBankerKill = e.data.is_banker_kill;
        }
        if (appData.game.time = -1, viewMethods.updateAllPlayerStatus(), setTimeout(function () {
            viewMethods.resetMyAccountStatus()
        }, 200), appData.player[0].account_status >= 8 && 0 == appData.player[0].is_audiobull) {
            var o = appData.player[0].card_type, i = appData.player[0].combo_point;
            setTimeout(function () {
                audio = 1 == o ? "point" + i : "type" + o, mp3AudioPlay(audio)
            }, 200), appData.player[0].is_audiobull = !0
        }
        setTimeout(function () {
            viewMethods.winAnimate(e)
        }, 2000)
    },
    processBalanceScoreboard: function (e) {
        var t = new Date(1e3 * parseInt(e.time)), a = t.getFullYear() + "-", n = t.getMonth() + 1 + "-",
            o = t.getDate() + " ", i = t.getHours(), r = t.getMinutes(), c = ":";
        r < 10 && (c += 0);
        var l = a + n + o + i + c + r;
        appData.playerBoard.round = e.game_num, appData.playerBoard.record = l, appData.playerBoard.score = [];
        var u = e.scoreboard;
        for (s in u) {
            var p = 0, d = u[s].name;
            userData.account_id == u[s].account_id && (p = 1), appData.playerBoard.score.push({
                account_id: u[s].account_id,
                nickname: d,
                account_score: Math.ceil(u[s].score),
                num: p,
                account_code: u[s].account_code,
                "avatar": u[s].avatar
            })
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
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
    },
    clickGameOver: function () {
        viewMethods.clickShowAlert(10, "下庄之后，将以当前战绩进行结算。是否确定下庄？")
    },
    clickCreateRoom: function () {
        $(".createRoom .mainPart").css("height", "65vh"), $(".createRoom .mainPart .blueBack").css("height", "46vh"), appData.createInfo.type = 1, appData.createInfo.isShow = !0
    },
    clickShowInvite: function () {
        appData.isShowInvite = !0
    },
    clickCloseInvite: function () {
        appData.isShowInvite = !1
    },
    clickShowAlert: function (e, t) {
        appData.alertType = e, appData.alertText = t, appData.isShowAlert = !0, setTimeout(function () {
            var t = $(".alertText").height(), a = t;
            t < .15 * height && (t = .15 * height), t > .8 * height && (t = .8 * height);
            var n = t + .056 * height * 2 + .022 * height + .056 * height;
            8 == e && (n = n - .022 * height - .056 * height);
            var o = t + .034 * height * 2, i = .022 * height + (o - a) / 2;
            $(".alert .mainPart").css("height", n + "px"), $(".alert .mainPart").css("margin-top", "-" + n / 2 + "px"), $(".alert .mainPart .backImg .blackImg").css("height", o + "px"), $(".alert .mainPart .alertText").css("top", i + "px")
        }, 0)
    },
    clickCloseAlert: function () {
        if (22 == appData.alertType) {
            appData.isShowAlert = !1;
            appData.isShowGameAlert = false;
            httpModule.getInfo();
        } else {
            appData.isShowGameAlert = false;
            appData.isShowAlert = !1;
        }
    },
    clickJoinRoom: function () {
        appData.isShowAlert = false;
        appData.isShowGameAlert = false;
        socketModule.sendJoinRoom();
        $('.sidelines-mask').hide();
        $('.sidelines-content').css({right: '-3.5rem',});
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
    },
    clickSitDown: function (e) {
        var isRepeat = repeat('SitDown');
        if (isRepeat) {
            return
        }
        appData.isShowAlert = false;
        appData.isShowGameAlert = false;
        appData.isAutoReady = 0;
        // socketModule.sendSitDown(e);
        $('.sidelines-mask').hide();
        $('.sidelines-content').css({right: '-3.5rem',});
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
        if (appData.isWatching == 1) {
            socketModule.sendSitDown(e);
        } else {
            socketModule.sendSwapSeat(e);
        }
    },
    // 换座
    clickSwapSeat: function (e) {
        socketModule.sendSwapSeat(e);
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
    },
    clickReady: function () {
        socketModule.sendReadyStart(), appData.player[0].is_operation = !0
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
    },
    reDeal: function () {
        appData.isDealing || (appData.isDealing = !0, m4aAudioPlay("audio1"), appData.game.cardDeal = 1, setTimeout(function () {
            appData.game.cardDeal = 2, m4aAudioPlay("audio1"), setTimeout(function () {
                viewMethods.resetMyAccountStatus(), appData.player[0].is_showCard = !0, appData.showClockRobText = !0, appData.isDealing = !1, 5 == appData.ruleInfo.banker_mode && 1 == appData.game.round && viewMethods.updateAllPlayerStatus()
            }, 140)
        }, 10))
    },
    resetMyAccountStatus: function () {

        if (appData.player[0].account_status == 6) {
            if (!appData.isFinishBankerAnimate) {
                return;
            }
        }

        viewMethods.resetShowButton();

        if (appData.player[0].account_status == 3) {
            appData.showRob = true;
        } else if (appData.player[0].account_status == 4) {
            appData.showNotRobText = true;
        } else if (appData.player[0].account_status == 5) {
            appData.showRobText = true;
        } else if (appData.player[0].account_status == 6) {
            if (appData.player[0].is_banker == true) {
                appData.showBankerCoinText = true;
            } else {
                if (appData.isFinishBankerAnimate) {
                    appData.showTimesCoin = true;
                }
            }
        } else if (appData.player[0].account_status == 7) {
            appData.player[0].is_showCard = true;
            if (appData.clickCard4 == true && appData.clickCard5 == true) {
                appData.showShowCardButton = true;
            } else {
                appData.showClickShowCard = true;
            }
        } else if (appData.player[0].account_status == 8) {
            appData.player[0].is_showCard = true;
        }

    },
    resetShowButton: function () {
        appData.showTimesCoin = !1, appData.showRob = !1, appData.showShowCardButton = !1, appData.showClickShowCard = !1, appData.showNotRobText = !1, appData.showRobText = !1, appData.showBankerCoinText = !1
    },
    seeMyCard: function () {
        if (appData.player[0].account_id != userData.account_id) return; //观战功能
        if (2 == appData.ruleInfo.banker_mode) {
            setTimeout(function () {
                $(".myCards .card0").addClass("card-flipped"),
                    setTimeout(function () {
                        1 != appData.clickCard4 && 7 == appData.player[0].account_status && (appData.showClickShowCard = !0)
                    }, 500)
            }, 1e3)
        } else {
            setTimeout(function () {
                $(".myCards .card0").addClass("card-flipped"),
                    setTimeout(function () {
                        appData.clickCard4 || (appData.showClickShowCard = !0)
                    }, 500)
            }, 350)
        }
    },
    seeMyCard4: function () {
        if (appData.player[0].account_id != userData.account_id) return; //观战功能
        appData.player[0].account_status >= 7 && ($(".myCards .card1").addClass("card-flipped"), appData.clickCard4 = !0, setTimeout(function () {
            appData.showShowCardButton = !0, appData.showClickShowCard = !1
        }, 100))
    },
    myCardOver: function (e) {
        $(".myCards .card").addClass("card-flipped")
    },
    cardOver: function (e, t) {
        e <= 1 || setTimeout(function () {
            $(".cardOver .cardtf" + e).addClass("card-flipped")
        }, 1)
    },
    gameOverNew: function (e, t) {
        for (o = 0; o < globalData.maxCount; o++) {
            for (s in e) {
                if (appData.player[o].account_id == s) {
                    appData.player[o].account_score = Math.ceil(e[s])
                }
            }

        }

        appData.game.show_coin = !1;

        // for (o = 0; o < appData.playerBoard.score.length; o++) appData.playerBoard.score[o].num = 0, appData.playerBoard.score[o].account_id = 0, appData.playerBoard.score[o].nickname = "", appData.playerBoard.score[o].account_score = 0, appData.playerBoard.score[o].isBigWinner = 0, appData.playerBoard.score[o].account_code = "";
        // for (o = 0; o < appData.player.length; o++) for (s in e) appData.player[o].account_id == s && (appData.player[o].account_score = Math.ceil(e[s]), appData.playerBoard.score[o].num = appData.player[o].num, appData.playerBoard.score[o].account_id = appData.player[o].account_id, appData.playerBoard.score[o].nickname = appData.player[o].nickname, appData.playerBoard.score[o].account_score = appData.player[o].account_score, appData.playerBoard.score[o].account_code = appData.player[o].account_code);
        var a = new Date, n = "";
        n += a.getFullYear() + "-", n += a.getMonth() + 1 + "-", n += a.getDate() + "  ", n += a.getHours() + ":", a.getMinutes() >= 10 ? n += a.getMinutes() : n += "0" + a.getMinutes(), appData.playerBoard.record = n, appData.base_score = appData.game.base_score;
        // void 0 != t && "-1" != t && (console.log(t), socketModule.processBalanceScoreboard(t));
        for (var o = 0; o < appData.player.length; o++) appData.player[o].playing_status = 0, appData.player[o].is_win = !1, appData.player[o].is_operation = !1, appData.player[o].win_type = 0, appData.player[o].win_show = !1, appData.player[o].card = new Array, appData.player[o].card_open = new Array, appData.player[o].card_type = 0, appData.player[o].is_showCard = !1, appData.player[o].is_readyPK = !1, appData.player[o].is_pk = !1, appData.player[o].multiples = 0, appData.player[o].bankerMultiples = 0, appData.player[o].is_bull = !1, appData.player[o].is_showbull = !1, appData.player[o].is_audiobull = !1;
        appData.game.can_open = 0, appData.game.score = 0, appData.game.cardDeal = 0, appData.game.currentScore = 0, appData.game.status = 1, appData.player[0].is_showCard = !1, appData.showClockRobText = !1, appData.showClockBetText = !1, appData.showClockShowCard = !1
    },
    showMessage: function () {
        if (appData.player[0].account_id != userData.account_id) return; //观战功能

        if (globalData.p_type == 2) {
            appData.isShowNewMessage = !appData.isShowNewMessage;
            if (localStorage.messageMusic == 1) {
                methods.clickVoice();
            }
        } else {
            appData.isShowMessage = !0, disable_scroll()
        }

    },
    hideMessage: function () {
        if (globalData.p_type == 2) {
            appData.isShowNewMessage = false;

        } else {
            appData.isShowMessage = !1, enable_scroll()
        }
    },
    messageOn: function (num) {
        if (appData.player[0].sex == 1) {
            var loadMessageNum = 'message' + num;
        } else {
            var loadMessageNum = 'message' + num + '_1';
        }
        audioModule.loadAudioFile(globalData.fileUrl + 'fiesc/audio/sound61013/' + loadMessageNum + '.m4a', loadMessageNum);
        setTimeout(function () {
            m4aAudioPlay(loadMessageNum);
        }, 200)

        socketModule.sendBroadcastVoice(num);

        viewMethods.messageSay(0, num);
        viewMethods.hideMessage();
    },
    messageSay: function (e, t) {
        appData.player[e].messageOn = !0, appData.player[e].messageText = appData.message[t].text, setTimeout(function () {
            appData.player[e].messageOn = !1
        }, 2500)
    },
    closeEnd: function () {
    },
    roundEnd: function (type) {
        // $("#loading").show();
        // if (type && type == 1) {
        //     socketModule.getScoreBoard();
        //     appData.gameover = true;
        // } else {
        //     setTimeout(function () {
        //         socketModule.getScoreBoard();
        //         appData.gameover = true;
        //     }, 1000)
        // }
        DynLoading.goto('paijiu' + globalData.maxCount, 'i=' + globalData.roomNumber);
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
                var a = parseInt(appData.player[e].card_type);
                var t = appData.player[e].combo_point;
                if (a > 1) {
                    t = "type" + a;
                } else if (1 == a) {
                    t = "point" + t;
                }
                if (globalData.p_type == 2) {
                    appData.player[e].bullImg = globalData.fileUrl + "files/images/paijiu_xy/" + t + ".png"
                } else {
                    appData.player[e].bullImg = globalData.fileUrl + "files/images/paijiu/" + t + ".png"
                }
            }
            if (4 == appData.player[e].account_status) {
                if (5 == appData.ruleInfo.banker_mode) {
                    appData.player[e].robImg = globalData.fileUrl + "files/images/bull/text_notgo.png";
                } else {
                    appData.player[e].robImg = globalData.fileUrl + "files/images/bull/text_notrob.png";
                }
            } else if (5 == appData.player[e].account_status) {
                if (5 == appData.ruleInfo.banker_mode) {
                    appData.player[e].robImg = globalData.fileUrl + "files/images/bull/text_go.png";
                } else {
                    appData.player[e].robImg = globalData.fileUrl + "files/images/bull/text_rob.png";
                }
            } else if (6 == appData.player[e].account_status) {
            } else if (7 == appData.player[e].account_status) {
                if (0 == e) {
                    viewMethods.seeMyCard();
                }
            } else if (8 == appData.player[e].account_status) {
                if (0 == e) {
                    viewMethods.myCardOver(appData.player[e].is_bull);
                } else {
                    viewMethods.cardOver(appData.player[e].num, appData.player[e].is_bull);
                }
            }
        }
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
    timeCountDown2: function () {
        if (1 != isTimeLimitShow) return appData.game.time <= 0 ? (isTimeLimitShow = !1, 0) : (isTimeLimitShow = !0, appData.game.time--, void (timeLimit = setTimeout(function () {
            isTimeLimitShow = !1, viewMethods.timeCountDown2()
            if (appData.game.time == 0) {
                appData.waitStart = false
            }
        }, 1e3)))
    },
    clickRobBanker: function (e) {
        viewMethods.showRobBankerText();
        socketModule.sendGrabBanker(e);
        if (2 == appData.ruleInfo.banker_mode) {
            appData.player[0].bankerMultiples = e;
            if (appData.player[0].bankerMultiples > 0) {
                appData.player[0].bankerTimesImg = globalData.fileUrl + "files/images/sangong/text_times" + appData.player[0].bankerMultiples + ".png";
            }
        }
        setTimeout(function () {
            mp3AudioPlay("audioRobBanker")
        }, 10)
    },
    showRobBankerText: function () {
        appData.showTimesCoin = !1, appData.showRob = !1, appData.showShowCardButton = !1, appData.showClickShowCard = !1, appData.showNotRobText = !1, appData.showRobText = !0, appData.showBankerCoinText = !1
    },
    showNotRobBankerTextFnc: function () {
        appData.showTimesCoin = !1, appData.showRob = !1, appData.showShowCardButton = !1, appData.showClickShowCard = !1, appData.showNotRobText = !0, appData.showRobText = !1, appData.showBankerCoinText = !1
    },
    clickNotRobBanker: function () {
        viewMethods.showNotRobBankerTextFnc(), socketModule.sendNotGrabBanker(), setTimeout(function () {
            mp3AudioPlay("audioNoBanker")
        }, 10)
    },
    clickSelectTimesCoin: function (e) {
        appData.player[0].multiples = e;
        appData.showTimesCoin = !1;
        if (appData.player[0].multiples > 0) {
            appData.player[0].timesImg = globalData.fileUrl + "files/images/sangong/text_times" + appData.player[0].multiples + ".png";
        }
        socketModule.sendPlayerMultiples(e);
        setTimeout(function () {
            mp3AudioPlay("audioTimes" + e)
        }, 50);
    },
    clickShowCard: function () {
        appData.showShowCardButton = !1, appData.showClickShowCard = !1, socketModule.sendShowCard()
    },
    clearBanker: function () {
        for (var e = 0; e < appData.player.length; e++)
            appData.player[e].is_banker = !1;
        appData.isFinishBankerAnimate = !1;
        var t = 2 * appData.bankerArray.length;
        if (appData.bankerArray.length < 6) {
            appData.bankerAnimateDuration = parseInt(800 / t);
        } else {
            appData.bankerAnimateDuration = parseInt(1800 / t);
        }
    },
    robBankerWithoutAnimate: function (a) {
        console.log('robBankerWithoutAnimate', a)
        for (var e = 0; e < appData.player.length; e++) appData.player[e].account_id == appData.bankerAccountId ? (appData.player[e].is_banker = !0, bankerNum = appData.player[e].num) : appData.player[e].is_banker = !1, $("#bankerAnimate2" + appData.player[e].num).hide(), $("#bankerAnimate1" + appData.player[e].num).hide();
        setTimeout(function () {
            appData.game.show_coin = !0, appData.showClockRobText = !1, appData.showClockBetText = !0, appData.isFinishBankerAnimate = !0, viewMethods.resetMyAccountStatus(), viewMethods.updateAllPlayerStatus()
        }, 10), appData.game.time = e.limit_time, appData.game.time > 0 && viewMethods.timeCountDown()
    },
    robBankerAnimate: function (e) {
        // console.log('robBankerAnimate',e)
        if (5 == appData.ruleInfo.banker_mode) {
            appData.showRob = !1;
        }
        for (n = 0; n < appData.bankerArray.length; n++) {
            o = "#banker" + appData.bankerArray[n];
            $(o).hide();
        }
        var t = 2 * appData.bankerArray.length;
        if (appData.bankerAnimateCount >= t || appData.bankerAnimateIndex < 0 || appData.bankerArray.length < 2) {
            appData.bankerAnimateCount = 0, appData.bankerAnimateIndex = -1;
            o = "#banker" + appData.bankerAccountId;
            $(o).show();
            for (var a = "", n = 0; n < appData.player.length; n++) appData.player[n].account_id == appData.bankerAccountId ? (appData.player[n].is_banker = !0, a = appData.player[n].num) : appData.player[n].is_banker = !1, $("#bankerAnimate2" + appData.player[n].num).hide(), $("#bankerAnimate1" + appData.player[n].num).hide();
            return $(o).hide(), $("#bankerAnimate2" + a).css({
                top: "-0.1vh",
                left: "-0.1vh",
                width: "7.46vh",
                height: "7.46vh"
            }), $("#bankerAnimate1" + a).css({
                top: "-1vh",
                left: "-1vh",
                width: "9.26vh",
                height: "9.26vh"
            }), $("#bankerAnimate2" + a).show(), $("#bankerAnimate1" + a).show(), $("#bankerAnimate1" + a).animate({
                top: "-1vh",
                left: "-1vh",
                width: "9.26vh",
                height: "9.26vh"
            }, 100, function () {
                $("#bankerAnimate1" + a).animate({
                    top: "-0.1vh",
                    left: "-0.1vh",
                    width: "7.46vh",
                    height: "7.46vh"
                }, 100, function () {
                    $("#bankerAnimate1" + a).hide()
                })
            }), void $("#bankerAnimate2" + a).animate({
                top: "-1.5vh",
                left: "-1.5vh",
                width: "10.26vh",
                height: "10.26vh"
            }, 100, function () {
                $("#bankerAnimate2" + a).animate({
                    top: "-0.1vh",
                    left: "-0.1vh",
                    width: "7.46vh",
                    height: "7.46vh"
                }, 100, function () {
                    $("#bankerAnimate2" + a).hide(), setTimeout(function () {
                        if (appData.game.show_coin = !0, appData.showClockRobText = !1, appData.showClockBetText = !0, appData.isFinishBankerAnimate = !0, 5 == appData.ruleInfo.banker_mode) {
                            for (var t = 0; t < e.data.length; t++) for (var a = 0; a < appData.player.length; a++) appData.player[a].account_id == e.data[t].account_id && (appData.player[a].account_score = e.data[t].account_score);
                            setTimeout(function () {
                                viewMethods.reDeal()
                            }, 1e3), 1 != appData.game.round && (viewMethods.resetMyAccountStatus(), viewMethods.updateAllPlayerStatus())
                        } else viewMethods.resetMyAccountStatus(), viewMethods.updateAllPlayerStatus()
                    }, 10), appData.game.time = e.limit_time, appData.game.time > 0 && viewMethods.timeCountDown()
                })
            })
        }
        var o = "#banker" + appData.bankerArray[appData.bankerAnimateIndex];
        $(o).show();
        appData.lastBankerImgId = o;
        appData.bankerAnimateCount++;
        appData.bankerAnimateIndex++;
        if (appData.bankerAnimateIndex >= appData.bankerArray.length) {
            appData.bankerAnimateIndex = 0;
        }
        setTimeout(function () {
            viewMethods.robBankerAnimate(e)
        }, appData.bankerAnimateDuration);
    },
    showMemberScore: function (e) {
        e ? ($(".memberScoreText1").show(), $(".memberScoreText2").show(), $(".memberScoreText3").show(), $(".memberScoreText4").show(), $(".memberScoreText5").show(), $(".memberScoreText6").show(), $(".memberScoreText7").show(), $(".memberScoreText8").show(), $(".memberScoreText9").show()) : ($(".memberScoreText1").hide(), $(".memberScoreText2").hide(), $(".memberScoreText3").hide(), $(".memberScoreText4").hide(), $(".memberScoreText5").hide(), $(".memberScoreText6").hide(), $(".memberScoreText7").hide(), $(".memberScoreText8").hide(), $(".memberScoreText9").hide())
    },
    winAnimate: function (e) {
        appData.isFinishWinAnimate = !1;
        var t = new Array, a = new Array;
        appData.bankerPlayerNum = appData.bankerPlayer.num;
        if (4 == appData.ruleInfo.banker_mode) {
            for (n = 0; n < e.data.winner_array.length; n++)
                for (o = 0; o < appData.player.length; o++)
                    if (e.data.winner_array[n].account_id == appData.player[o].account_id) {
                        appData.bankerPlayerNum = appData.player[o].num;
                        t.push(appData.player[o].num);
                    }
        } else {
            for (n = 0; n < e.data.winner_array.length; n++)
                for (o = 0; o < appData.player.length; o++)
                    if (e.data.winner_array[n].account_id == appData.player[o].account_id) {
                        if (appData.player[o].num == appData.bankerPlayer.num) {
                            isBankerWin = !0;
                            appData.bankerPlayerNum = appData.player[o].num;
                        } else {
                            t.push(appData.player[o].num);
                        }
                    }
        }

        for (n = 0; n < e.data.loser_array.length; n++)
            for (o = 0; o < appData.player.length; o++)
                if (e.data.loser_array[n].account_id == appData.player[o].account_id && appData.player[o].num != appData.bankerPlayerNum) {
                    a.push(appData.player[o].num);
                }
        appData.isBankerKill = 0;
        viewMethods.resetCoinsPosition();
        $("#playerCoins").show();
        for (var i = 1; i <= appData.player.length; i++) {
            viewMethods.showCoins(i, false);
        }
        //把赢家玩家金币暂时放到庄家位置
        for (n = 0; n < appData.player.length; n++) {
            for (o = 0; o < 8; o++) {
                $(".memberCoin" + t[n] + o).css(memCoin[appData.bankerPlayerNum]);
            }
        }
        //显示输家金币
        for (n = 0; n < appData.player.length; n++) {
            viewMethods.showCoins(a[n], !0);
        }
        //输家金币给庄家
        for (var n = 0; n < appData.player.length; n++) {
            for (var o = 0; o < 8; o++)
                $(".memberCoin" + a[n] + o).animate(memCoin[appData.bankerPlayerNum], 10 + 100 * o);
            setTimeout(function () {
                mp3AudioPlay("audioCoin")
            }, 10);
        }
        var i = 100, r = 100;
        if (a.length >= 1) {
            i = 800;
            r = t.length >= 1 ? 1600 : 800;
        } else {
            if (t.length >= 1) {
                r = 800;
            }
        }

        4 == ruleInfo.banker_mode && (r = 1800, i = 1800);
        if (t.length >= 1) {
            //显示赢家金币
            setTimeout(function () {
                // for (e = 0; e < a.length; e++)
                //     viewMethods.showCoins(a[e], !1);
                for (e = 0; e < t.length; e++)
                    viewMethods.showCoins(t[e], !0);
                for (var e = 0; e < t.length; e++)
                    for (var n = 0; n < 8; n++)
                        $(".memberCoin" + t[e] + n).animate(memCoin[t[e]], 10 + 100 * n);
                setTimeout(function () {
                    mp3AudioPlay("audioCoin");
                }, 10);
            }, 100);
        }
        setTimeout(function () {
            viewMethods.finishWinAnimate(e)
        }, r);
    },
    finishWinAnimate: function (e) {
        $("#playerCoins").hide();
        appData.game.show_card = !1;
        appData.game.show_score = !0;
        $(".memberScoreText").fadeIn(200, function () {
            if (5 == appData.ruleInfo.banker_mode) {
                if (1 != appData.isBreak)
                    viewMethods.gameOverNew(e.data.score_board, e.data.balance_scoreboard);
                else
                    for (var t = 0; t < appData.player.length; t++)
                        for (s in e.data.score_board)
                            appData.player[t].account_id == s && (appData.player[t].account_score = Math.ceil(e.data.score_board[s]));
            } else {
                viewMethods.gameOverNew(e.data.score_board, e.data.balance_scoreboard);
            }

            setTimeout(function () {
                $(".memberScoreText").fadeOut("slow");
                if (5 == appData.ruleInfo.banker_mode && 1 == appData.isBreak) {
                    appData.overType = 2;
                    setTimeout(function () {
                        viewMethods.clickShowAlert(9, "庄家分数不足，提前下庄，点击确定查看结算")
                    }, 500);
                } else {

                }
                for (var e = 0; e < appData.player.length; e++) {
                    if (appData.player[e].account_status >= 6 && 5 != ruleInfo.banker_mode) {
                        appData.player[e].is_banker = !1;
                        if (appData.player[e].account_id == appData.bankerID) {
                            appData.player[e].is_banker = !0;
                        }
                    }
                    if (2 != appData.player[e].account_status && 0 != appData.player[e].account_status) {
                        appData.player[e].account_status = 1;
                    }
                }
            }, 500);
            appData.isFinishWinAnimate = !0;
            if (5 != appData.ruleInfo.banker_mode) {
                e.data.total_num == e.data.game_num && setTimeout(function () {
                    // viewMethods.roundEnd(), newNum = e.data.room_number
                }, 500);
            }
        });

        appData.showWatchButton = appData.isWatching != 1;
        appData.showSitdownButton = appData.isWatching;
        if (e.data.total_num == e.data.game_num) {
            //appData.gameover = true;
            //socketModule.getScoreBoard();
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
        for (var e = 1; e <= appData.player.length; e++)
            for (var t = 0; t < 8; t++)
                $(".memberCoin" + e + t).css(memCoin[e]);
    },
    showCoins: function (e, t) {
        if (t) for (a = 0; a < 8; a++) $(".memberCoin" + e + a).show(); else for (var a = 0; a < 8; a++) $(".memberCoin" + e + a).hide()
    },
    showQRCode: function () {
    }
};
var fileDealerNum = "d_30";
var width = window.innerWidth;
var height = window.innerHeight;
var numD = 0;
var isTimeLimitShow = !1;
var isBankerWin = !1;
var timesOffset = (.9 * width - .088 * height * 4 - .02 * width * 3) / 2;
var coinLeft1 = .045 * height + "px";
var coinLeft2 = width - .06 * height + "px";
var coinLeft3 = width - .06 * height + "px";
var coinLeft4 = width - .06 * height + "px";
var coinLeft5 = width - .06 * height + "px";
// var coinLeft5 = width - .18 * height + "px";
// var coinLeft6 = .15 * height + "px";
var coinLeft6 = .045 * height + "px";
var coinLeft7 = .045 * height + "px";
var coinLeft8 = .045 * height + "px";
var coinLeft9 = .045 * height + "px";


if (globalData.maxCount == 15) {
    //15人
    var memCoin = [
        {},
        {'top': '84%', 'left': '4.5vh'},
        {'top': '68%', 'left': '89.5vw'},
        {'top': '57%', 'left': '89.5vw'},
        {'top': '44%', 'left': '89.5vw'},
        {'top': '35%', 'left': '89.5vw'},
        {'top': '24%', 'left': '89.5vw'},
        {'top': '13%', 'left': '89.5vw'},
        {'top': '4%', 'left': '89.5vw'},
        {'top': '4%', 'left': '6vw'},
        {'top': '13%', 'left': '6vw'},
        {'top': '24%', 'left': '6vw'},
        {'top': '35%', 'left': '6vw'},
        {'top': '44%', 'left': '6vw'},
        {'top': '57%', 'left': '6vw'},
        {'top': '68%', 'left': '6vw'},
    ];

} else if (globalData.maxCount == 6) {
    //6人
    var memCoin = [
        {},
        {top: '82%', left: coinLeft1},
        {top: '44%', left: coinLeft2},
        {top: '28%', left: coinLeft2},
        {top: '10.5%', left: '50%'},
        {top: '28%', left: coinLeft8},
        {top: '44%', left: coinLeft8}

    ];
} else if (globalData.maxCount == 13) {
    //13人
    var memCoin = [
        {},
        {top: '84%', left: coinLeft8},
        {top: '65%', left: coinLeft2},
        {top: '50%', left: coinLeft2},
        {top: '40%', left: coinLeft2},
        {top: '28%', left: coinLeft2},
        {top: '16%', left: coinLeft2},
        {top: '4%', left: coinLeft2},
        {top: '4%', left: coinLeft8},
        {top: '16%', left: coinLeft8},
        {top: '28%', left: coinLeft8},
        {top: '40%', left: coinLeft8},
        {top: '50%', left: coinLeft8},
        {top: '65%', left: coinLeft8},
    ]
} else {
    // 9人
    var memCoin = [
        {},
        {top: '82%', left: '4.5vh'},
        {top: '59%', left: coinLeft2},
        {top: '43%', left: coinLeft2},
        {top: '27%', left: coinLeft2},
        {top: '9%', left: coinLeft5},
        {top: '9%', left: coinLeft6},
        {top: '27%', left: coinLeft7},
        {top: '43%', left: coinLeft8},
        {top: '59%', left: coinLeft9},
    ];
}

var viewStyle = {
    readyButton: {
        position: "absolute",
        top: (.11 * height - .0495 * height) / 2 + "px",
        left: "31vw",
        width: "28vw",
        height: "9vw"
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
    button: {position: "absolute", top: "68%", left: "5%", width: "90%", height: "11vh", overflow: "hidden"},
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
    times1: {
        position: "absolute",
        top: (.11 * height - .088 * height / 2) / 2 + "px",
        width: .088 * height + "px",
        height: .088 * height / 2 + "px",
        "line-height": .088 * height / 2 + "px",
        "text-align": "center",
    },
    times2: {
        position: "absolute",
        top: (.11 * height - .088 * height / 2) / 2 + "px",
        width: .088 * height + "px",
        height: .088 * height / 2 + "px",
        "line-height": .088 * height / 2 + "px",
        "text-align": "center",
    },
    times3: {
        position: "absolute",
        top: (.11 * height - .088 * height / 2) / 2 + "px",
        width: .088 * height + "px",
        height: .088 * height / 2 + "px",
        "line-height": .088 * height / 2 + "px",
        "text-align": "center",
    },
    times4: {
        position: "absolute",
        top: (.11 * height - .088 * height / 2) / 2 + "px",
        width: .088 * height + "px",
        height: .088 * height / 2 + "px",
        "line-height": .088 * height / 2 + "px",
        "text-align": "center",
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
        // left: (.9 * width - .0557 * height - .03 * height - .002 * height) / 2 + .0557 * height + .005 * height + "px",
        left: '56%',
        width: .03 * height + "px",
        height: .03 * height + "px"
    },
    notRobText: {
        position: "absolute",
        top: (.11 * height - .03 * height) / 2 + "px",
        left: '50%',
        transform: 'translateX(-50%)',
        width: .0557 * height + "px",
        height: .03 * height + "px"
    },
    showCardText: {position: "absolute", top: "10%", left: "10%", width: "80%", height: "11vh", "font-size": "2.2vh"},
    showCardText1: {
        position: "absolute",
        width: "100%",
        height: "100%",
        color: "#f7ce46",
        "font-size": "2.2vh",
        "text-align": "center",
        "line-height": "11vh",
        "font-family": "Helvetica 微软雅黑"
    },
    coinText: {position: "absolute", top: "10%", left: "10%", width: "80%", height: "11vh", "font-size": "2.2vh"},
    coinText1: {
        position: "absolute",
        width: "100%",
        height: "100%",
        color: "#f7ce46",
        "font-size": "2.2vh",
        "text-align": "center",
        "line-height": "11vh",
        "font-family": "Helvetica 微软雅黑"
    }
};
var createInfo = {
    type: -1,
    isShow: !1,
    isShowRule: !1,
    baseScore: 3,
    timesType: 1,
    isCardfive: 0,
    isCardbomb: 0,
    isCardtiny: 0,
    ticket: 1,
    rule_height: "4vh",
    banker_mode: 1,
    banker_score: 4,
    banker1: "selected",
    banker2: "unselected",
    banker3: "unselected",
    banker4: "unselected",
    banker5: "unselected"
};
var ruleInfo = {
    isShowNewRule: false,
    type: -1,
    isShow: !1,
    isShowRule: !1,
    baseScore: 1,
    timesType: 1,
    isCardfive: 0,
    isCardbomb: 0,
    isCardtiny: 0,
    ticket: 1,
    rule_height: "4vh",
    banker_mode: 1,
    banker_score: 1,
    bankerText: "抢庄",
    bet_type: 1,
    rule_type: 1,
    special_card: 1,
    can_rub: 0,
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
localStorage.backMusic ? (editAudioInfo.backMusic = localStorage.backMusic,
    audioInfo.backMusic = localStorage.backMusic) : localStorage.backMusic = 1, localStorage.messageMusic ? (editAudioInfo.messageMusic = localStorage.messageMusic, audioInfo.messageMusic = localStorage.messageMusic) : localStorage.messageMusic = 1;

// 自动准备
var setReady = 0;
if (localStorage.isAutoReady == 1 && localStorage.roomNumber == globalData.roomNumber) {
    setReady = 1
} else {
    setReady = 0
}

// // 自动续局
// var showNextRoom=false
// if(localStorage.newRoom!=undefined){
//     var nextRoomInfo=JSON.parse(localStorage.newRoom)
//     if(nextRoomInfo.oldRoomNumber==globalData.roomNumber){
//         showNextRoom=true;
//     }else{
//         showNextRoom=false;
//     }
// }

var loadingTimer = null;
var appData = {
    isShowLoading: true,
    loadingNum: 1,
    showNextRoom: false,// 自动续局
    newRoomNumber: 0,// 自动续局
    isBankerKill: 0,
    isShowApply: false,
    applyInfo: {
        club_headimgurl: '',
        club_name: '',
        club_id: '',
        status: '确定'
    },
    waitStart: false,
    coinList: [1, 2, 3, 5],
    //观战功能
    isWatching: 1,
    guests: [],
    showRobText2: false,
    showGuest: 0,
    showSitdownButton: 0,
    showWatchButton: 1,
    isAutoReady: setReady, //自动准备
    add_user: false,
    isShowGameAlert: false,
    'isShowHomeAlert': false,
    'isShowNewMessage': false,
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
    'room_users': '',
    isShowIndiv: false,
    'isShowIndividuality': false,
    'isShowIndividualityError': false,
    'individuality': userData.individuality,
    'inputIndiv': '',
    'isShowIndivConfirm': false,
    // 'individuality':  '',
    'individualityError': "",
    'userData': userData,
    'isShowAlertTip': false,
    'alertTipText': "",
    'alertTipType': 1,
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
    clickCard4: !1,
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
    createInfo: createInfo,
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
    isShowNoteImg: !1,
    isShowNoteImgA: !1,
    'musicOnce': true,
    joinType: 0,
    ownerUser: {
        nickname: "",
        avatar: "",
        user_code: 0
    },
    add_user: false,
    applyStatus: 0, //0尚未申请  1加好友申请中
    isShowGiftBox: false, //礼物
    giftToolsList: [],
    isShowBuyTools: false,
    buyToolsId: 0,
    skin_expire_type: 1,
    buyToolsName: '',

    showOnceIndiv: false,
    isShowTipsText: false,
    tipsText: "",
    opAccountInfo: {
        'sex': 1
    },
    gameover: false,
    isShowRefesh: false
};

var resetState = function () {
    appData.game.show_score = !1;
    appData.game.show_bettext = !1;
    appData.clickCard4 = !1;
    for (e = 0; e < globalData.maxCount; e++) {
        appData.player.push({
            num: e + 1,
            serial_num: e + 1,
            account_id: 0,
            account_code: "",
            account_status: 0,
            playing_status: 0,
            online_status: 0,
            nickname: "",
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
            is_bull: !1,
            is_showbull: !1,
            is_audiobull: !1,
            messageText: "",
            coins: [],
            head_kw: '',
            sex: 1
        });
        appData.playerBoard.score.push({
            account_id: 0,
            nickname: "",
            account_score: 0,
            isBigWinner: 0
        });
    }
    for (var e = 0; e < appData.player.length; e++) {
        appData.player[e].coins = [];
        for (var t = 0; t <= 7; t++)
            appData.player[e].coins.push("memberCoin" + appData.player[e].num + t);
    }

    httpModule.getInfo();

};
var resetAllPlayerData = function () {
    appData.player = [];
    for (e = 0; e < globalData.maxCount; e++) appData.player.push({
        num: e + 1,
        serial_num: e + 1,
        account_id: 0,
        account_status: 0,
        playing_status: 0,
        online_status: 0,
        nickname: "",
        headimgurl: "",
        account_code: "",
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
        is_bull: !1,
        is_showbull: !1,
        is_audiobull: !1,
        messageText: "我们来血拼吧",
        coins: [],
        head_kw: '',
        sex: 1
    });
    for (var e = 0; e < appData.player.length; e++) {
        appData.player[e].coins = [];
        for (var t = 0; t <= 7; t++) appData.player[e].coins.push("memberCoin" + appData.player[e].num + t)
    }
};
var newGame = function () {
    appData.player = [];
    clearInterval(appData.heartbeat);
    appData.socketStatus = 0
    appData.heartbeat = null;
    globalData.roomStatus = "-1";
    appData.connectOrNot = true;
    appData.gameover = false;
    appData.playerBoard = {
        score: new Array,
        round: 0,
        record: ""
    }, appData.game.round = 0, appData.game.status = 1, appData.game.score = 0, appData.game.currentScore = 0, appData.game.cardDeal = 0, appData.game.can_open = 0, appData.game.current_win = 0, appData.game.is_play = !1, appData.game.show_score = !1, appData.game.show_bettext = !1, appData.clickCard4 = !1;
    for (var e = 0; e < appData.player.length; e++) appData.playerBoard.score.push({
        account_id: 0,
        nickname: "",
        account_score: 0,
        isBigWinner: 0
    }), 1 == appData.player[e].online_status ? (appData.player[e].account_status = 0, appData.player[e].playing_status = 0, appData.player[e].is_win = !1, appData.player[e].is_operation = !1, appData.player[e].win_type = 0, appData.player[e].win_show = !1, appData.player[e].card = new Array, appData.player[e].card_open = new Array, appData.player[e].card_type = 0, appData.player[e].ticket_checked = 0, appData.player[e].account_score = 0, appData.player[e].is_showCard = !1, appData.player[e].is_readyPK = !1, appData.player[e].is_pk = !1, appData.player[e].is_banker = !1, appData.player[e].multiples = 0, appData.player[e].bankerMultiples = 0, appData.player[e].combo_point = 0, appData.player[e].timesImg = "", appData.player[e].bankerTimesImg = "", appData.player[e].robImg = "", appData.player[e].bullImg = "", appData.player[e].single_score = 0, appData.player[e].num = e + 1, appData.player[e].is_bull = !1, appData.player[e].is_showbull = !1, appData.player[e].is_audiobull = !1) : appData.player[e] = {
        num: e + 1,
        serial_num: appData.player[e].serial_num,
        account_id: 0,
        account_status: 0,
        playing_status: 0,
        online_status: 0,
        nickname: "",
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
        is_bull: !1,
        is_showbull: !1,
        is_audiobull: !1
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
                window.location.href = window.location.href + "&id=" + 10000 * Math.random();
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
        appData.isReconnect = !1, socketModule.closeSocket(), viewMethods.clickShowAlert(32, obj.result_message);
    } else if (-203 == obj.result) {
        methods.reloadView();
    }


    if (obj.operation == 'getToolsList' || obj.operation == 'useTools' || obj.operation == 'buyTools') {
        giftFunc(obj);
    }

    if (0 != obj.result) {
        console.log(-1, obj.operation)
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
        } else if (obj.operation == wsOperation.SwapSeat) {
            methods.showResultTextFunc(obj.result_message);
            methods.reloadView();
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
                viewMethods.clickShowAlert(23, obj.result_message);
            } else {
                viewMethods.clickShowAlert(7, obj.result_message);
            }
        } else if (obj.operation == wsOperation.RefreshRoom) {
            window.location.href = window.location.href;
        } else if (obj.operation == "setIndividuality") {
            methods.showResultTextFunc('设置失败，请修改后再设置');
        }
        appData.player[0].is_operation = !1;

    } else {
        if (obj.operation == "PrepareJoinRoom") {
            socketModule.processPrepareJoinRoom(obj);
        } else if (obj.operation == "GameHistory") {
            socketModule.processGameHistory(obj)
        } else if (obj.operation == "JoinRoom") {
            socketModule.processJoinRoom(obj)
        } else if (obj.operation == "ActiveRoom") {
            socketModule.processActiveRoom(obj)
        } else if (obj.operation == "RefreshRoom") {
            socketModule.processRefreshRoom(obj)
        } else if (obj.operation == "AllGamerInfo") {
            socketModule.processAllGamerInfo(obj)
        } else if (obj.operation == "UpdateGamerInfo") {
            socketModule.processUpdateGamerInfo(obj)
        } else if (obj.operation == "UpdateAccountStatus") {
            socketModule.processUpdateAccountStatus(obj)
        } else if (obj.operation == "UpdateAccountShow") {
            socketModule.processUpdateAccountShow(obj)
        } else if (obj.operation == "UpdateAccountMultiples") {
            socketModule.processUpdateAccountMultiples(obj)
        } else if (obj.operation == "StartLimitTime") {
            socketModule.processStartLimitTime(obj)
        } else if (obj.operation == "CancelStartLimitTime") {
            socketModule.processCancelStartLimitTime(obj)
        } else if (obj.operation == "GameStart") {
            socketModule.processGameStart(obj)
        } else if (obj.operation == "UpdateAccountScore") {
            socketModule.processUpdateAccountScore(obj)
        } else if (obj.operation == "Win") {
            socketModule.processWin(obj)
        } else if (obj.operation == "autoCreateRoom") {
            socketModule.processAutoCreateRoom(obj)
        } else if (obj.operation == "BroadcastVoice") {
            socketModule.processBroadcastVoice(obj)
        } else if (obj.operation == "StartBet") {
            socketModule.processStartBet(obj)
        } else if (obj.operation == "StartShow") {
            socketModule.processStartShow(obj)
        } else if (obj.operation == "MyCards") {
            socketModule.processMyCards(obj)
        } else if (obj.operation == "BreakRoom") {
            socketModule.processBreakRoom(obj)
        } else if (obj.operation == "GuestRoom") {
            socketModule.processGuestRoom(obj)
        } else if (obj.operation == "AllGuestInfo") {
            socketModule.processAllGuestInfo(obj)
        } else if (obj.operation == "UpdateGuestInfo") {
            socketModule.processUpdateGuestInfo(obj)
        } else if (obj.operation == "SwapSeat") {
            socketModule.processSwapSeat(obj)
        } else if (obj.operation == "getScoreBoard") {
            socketModule.processGetScoreBoard(obj);
        } else if (obj.operation == "getAccountInfo") {
            socketModule.pGAI(obj);
        } else if (obj.operation == "setIndividuality") {
            socketModule.processSetIndividuality(obj);
        } else if (obj.operation == "getAccountCard") {
            socketModule.pGAC(obj);
        } else {
            logMessage(obj.operation)
        }
    }

};
var wsCloseCallback = function (e) {
    if (!appData.gameover) {
        logMessage("websocket closed：");
        appData.connectOrNot = false;
        setTimeout(function () {
            reconnectSocket();
        }, 2500)
    }
};
var wsErrorCallback = function (e) {
    logMessage("websocket onerror："), logMessage(e)
};
var reconnectSocket = function reconnectSocket() {
    loadingTimer = setInterval(function () {
        appData.loadingNum++;
        if (appData.loadingNum == 11) {
            appData.loadingNum = 1;
        }
    }, 100);
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
        this.baseUrl = e, this.audioBuffers = [], window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext, this.audioContext = new window.AudioContext
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
        if (a) try {
            void 0 != WeixinJSBridge && WeixinJSBridge.invoke("getNetworkType", {},
                function (e) {
                    a.source = null,
                        a.source = audioModule.audioContext.createBufferSource(),
                        a.source.buffer = a.buffer,
                        a.source.loop = !1;
                    var n = audioModule.audioContext.createGain();
                    1 == t ? (a.source.loop = !0, n.gain.value = .7) : n.gain.value = 1,
                        a.source.connect(n),
                        n.connect(audioModule.audioContext.destination),
                        a.source.start(0)
                })
        } catch (e) {
            a.source = null,
                a.source = audioModule.audioContext.createBufferSource(),
                a.source.buffer = a.buffer,
                a.source.loop = !1;
            var n = audioModule.audioContext.createGain();
            1 == t ? (a.source.loop = !0, n.gain.value = .7) : n.gain.value = 1,
                a.source.connect(n),
                n.connect(audioModule.audioContext.destination),
                a.source.start(0)
        }
    },
    initSound: function (e, t) {
        this.audioContext.decodeAudioData(e, function (e) {
            audioModule.audioBuffers[t] = {
                name: t,
                buffer: e,
                source: null
            }, "backMusic" == t && (audioModule.audioOn = !0, audioModule.playSound(t, !0))
        }, function (e) {
            logMessage("Error decoding file", e)
        })
    },
    loadAudioFile: function (e, t) {
        var a = new XMLHttpRequest;
        a.open("GET", e, !0), a.responseType = "arraybuffer", a.onload = function (e) {
            audioModule.initSound(a.response, t)
        }, a.send()
    },
    loadAllAudioFile: function () {
        if (4 != globalData.roomStatus && 1 != isLoadAudioFile) {
            isLoadAudioFile = !0;
            if (globalData.p_type == 2) {
                this.loadAudioFile(this.baseUrl + "files/audio/paijiu/background_dy.mp3", "backMusic");
            } else {
                this.loadAudioFile(this.baseUrl + "files/audio/paijiu/background3.mp3", "backMusic");
            }
            var e = ["robn.m4a", "rob.m4a", "point0.m4a", "point1.m4a", "point2.m4a", "point3.m4a", "point4.m4a", "point5.m4a", "point6.m4a", "point7.m4a", "point8.m4a", "point9.m4a", "type2.m4a", "type3.m4a", "type4.m4a", "type5.m4a", "type6.m4a", "type7.m4a", "type8.m4a", "type9.m4a", "type10.m4a", "type11.m4a", "type12.m4a", "type13.m4a", "type14.m4a", "type15.m4a", "type16.m4a", "type17.m4a", "type18.m4a", "type19.m4a", "type20.m4a", "type21.m4a", "type22.m4a", "type23.m4a", "time1.m4a", "time2.m4a", "time3.m4a", "time4.m4a", "time8.m4a", "time5.m4a", "time6.m4a", "time10.m4a", "time12.mp3", "audioCoin2.mp3", "audio2.m4a"];
            var t = ["audioNoBanker", "audioRobBanker", "point0", "point1", "point2", "point3", "point4", "point5", "point6", "point7", "point8", "point9", "type2", "type3", "type4", "type5", "type6", "type7", "type8", "type9", "type10", "type11", "type12", "type13", "type14", "type15", "type16", "type17", "type18", "type19", "type20", "type21", "type22", "type23", "audioTimes1", "audioTimes2", "audioTimes3", "audioTimes4", "audioTimes8", "audioTimes5", "audioTimes6", "audioTimes10", "audioTimes12", "audioCoin", "audio1"];
            for (a = 0; a < e.length; a++) {
                this.loadAudioFile(this.baseUrl + "files/audio/paijiu/" + e[a], t[a]);
            }

        }
    }
};
audioModule.initModule(globalData.fileUrl);
var initView = function () {
    $("#app-main").width(appData.width), $("#app-main").height(appData.height), $("#table").width(appData.width), $("#table").height(appData.height), $(".ranking").css("width", 2 * appData.width), $(".ranking").css("height", 2 * appData.width * 1.621), window.onload = function () {
        for (var e = ["table", "vinvite", "valert", "vmessage", "vshop", "vcreateRoom", "vroomRule", "endCreateRoom", "endCreateRoomBtn"], t = e.length, a = 0; a < t; a++) {
            var n = document.getElementById(e[a]);
            n && n.addEventListener("touchmove", function (e) {
                e.preventDefault()
            }, !1)
        }
    }
};

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
    showResultTextFunc(text) {
        appData.isShowTipsText = true;
        appData.tipsText = text;
        setTimeout(function () {
            appData.isShowTipsText = false;
        }, 1500)
    },
    clickVoice: function () {
        if (globalData.p_type == 2) {
            audioModule.loadAudioFile(globalData.fileUrl + 'files/audio/paijiu/dy_button.mp3', 'clickVoice');
            setTimeout(function () {
                m4aAudioPlay('clickVoice');
            }, 100)
        }
    },
    blurIpt: function () {
        if (navigator.userAgent.toLocaleLowerCase().includes('iphone')) {
            window.scrollTo(0, 0)
        }
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
    copyLink: function () {
        methods.clickVoice();
        if (appData.ruleInfo.banker_mode == 1) {
            var bankerMode = '自由抢庄'
        } else if (appData.ruleInfo.banker_mode == 2) {
            var bankerMode = '明牌抢庄'
        }

        var copyTitle = globalData.hallName + ':' + globalData.roomNumber + '\n' +
            '房间：' + globalData.maxCount + '人' + globalData.gameName + ', 模式：' + bankerMode + ', 底分：' + appData.ruleInfo.baseScore + ', 局数：' + appData.game.total_num;

        var content = window.location.href;
        var input = copyTitle + '\n' + content;
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
            $('#tips').show();
            setTimeout(function () {
                $('#tips').hide();
            }, 2000);
            console.log('已复制：', el)
        } catch (err) {
        }

        document.body.removeChild(el);
        if (originalRange) {
            selection.removeAllRanges();
            selection.addRange(originalRange);
        }

        return success;
    },
    showHomeAlert: viewMethods.showHomeAlert,
    clickGameOver: viewMethods.clickGameOver,
    showInvite: viewMethods.clickShowInvite,
    showAlert: viewMethods.clickShowAlert,
    showMessage: viewMethods.showMessage,
    closeInvite: viewMethods.clickCloseInvite,
    closeAlert: viewMethods.clickCloseAlert,
    createRoom: viewMethods.clickCreateRoom,
    sitDown: viewMethods.clickSitDown,
    joinRoom: viewMethods.clickJoinRoom,
    swapSeat: viewMethods.clickSwapSeat,
    getCards: viewMethods.clickGetCards,
    seeMyCard4: viewMethods.seeMyCard4,
    imReady: viewMethods.clickReady,
    robBanker: viewMethods.clickRobBanker,
    showCard: viewMethods.clickShowCard,
    selectTimesCoin: viewMethods.clickSelectTimesCoin,
    hideMessage: viewMethods.hideMessage,
    closeEnd: viewMethods.closeEnd,
    messageOn: viewMethods.messageOn,
    showNoteImgA: function () {
        appData.isShowNoteImgA = !0
    },
    hideNoteImgA: function () {
        appData.isShowNoteImgA = !1
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
    toNextRoom: function () {
        globalData.roomNumber = appData.newRoomNumber;
        newGame();
        // 自动续局
        // var roomInfo=JSON.parse(localStorage.newRoom);

        $('.room-gameover').remove();
        $('.search-number-box').remove();
        $('.canvas-btn').remove();

        resetState();
        var roomUrl = cgr('ga', globalData.roomNumber, '10', globalData.maxCount);
        console.log('roomUrl', roomUrl)
        if (!!(window.history && history.pushState)) {
            changeTitle(userData.nickname, globalData.roomNumber);
            history.replaceState(null, null, roomUrl);
        }
    },
    hall: function () {
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
        DynLoading.goto('/');
    },
    reviewCard: function () {
        //window.location.href = cgr('gq', globalData.roomNumber, globalData.gameType, globalData.maxCount);
        window.location.href = Htmls.getReviewUrl(globalData.gameType, globalData.roomNumber);
    },
    closeHomeAlert: function () {
        appData.isShowHomeAlert = false;
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
    },
    showIndiv: function () {
        if (appData.userData.individuality == "") {
            appData.isShowIndiv = true
        } else {
            appData.isShowIndividuality = true;
        }
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
    },
    hideIndiv: function () {
        appData.isShowIndiv = false;
        appData.isShowIndividuality = false;
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
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
    showIndivConfirm: function () {
        if (appData.inputIndiv == "") {
            methods.showResultTextFunc('未填写防作弊暗号');
            return
        }
        if (appData.inputIndiv.length > 6) {
            methods.showResultTextFunc('输入长度过长');
            return
        }
        appData.individualityError = "";
        appData.isShowIndiv = false;
        appData.isShowIndivConfirm = true;
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
    },
    hideIndivConfirm: function () {
        appData.isShowIndivConfirm = false;
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
    cancelGameRule: function () {
        appData.ruleInfo.isShowNewRule = false;
    },
    notRobBanker: viewMethods.clickNotRobBanker,
    showGameRule: function () {
        if (appData.roomStatus == 4) {
            return;
        }
        appData.ruleInfo.isShowNewRule = true;
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
    },
    showGameHistory: function () {
        socketModule.sendGameHistory()
    },
    closeRecord: function () {
        appData.isShowRecord = !1
    },
    showBreakRoom: function () {
        null != appData.breakData && void 0 != appData.breakData && viewMethods.gameOverNew(appData.breakData.data.score_board, appData.breakData.data.balance_scoreboard), chooseBigWinner(), $(".ranking .rankBack").css("opacity", "1"), $(".roundEndShow").show(), $(".ranking").show(), canvas()
    },
    confirmBreakRoom: function () {
        socketModule.sendGameOver(), viewMethods.clickCloseAlert()
    },
    showQRCode: viewMethods.showQRCode,
    closeErweima: function () {
    },
    showAudioSetting: function () {
        appData.editAudioInfo.backMusic = appData.audioInfo.backMusic;
        appData.editAudioInfo.messageMusic = appData.audioInfo.messageMusic;
        appData.editAudioInfo.isShow = !0;
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
    },
    cancelAudioSetting: function () {
        appData.editAudioInfo.isShow = !1
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
        0 == appData.editAudioInfo.backMusic ? appData.editAudioInfo.backMusic = 1 : appData.editAudioInfo.backMusic = 0
        methods.confirmAudioSetting()
    },
    setMessageMusic: function () {
        0 == appData.editAudioInfo.messageMusic ? appData.editAudioInfo.messageMusic = 1 : appData.editAudioInfo.messageMusic = 0
        methods.confirmAudioSetting()
    },
    testRefreshRoom: function () {
        socketModule.sendRefreshRoom()
    },
    reloadView: function () {
        window.location.href = window.location.href;
    },
    applyToJoin: function () {
        httpModule.applyToJoin();
    },
    showNoteImg: function () {
        appData.isShowNoteImg = !0
    },
    hideNoteImg: function () {
        appData.isShowNoteImg = !1
    },
    //观战功能
    guestRoom: function () {
        socketModule.sendGuestRoom()

        appData.showSitdownButton = true;
        appData.showWatchButton = false;

        if (appData.isWatching) {
            for (var e = 0; e < appData.player.length; e++)
                if (appData.player[e].account_id == userData.account_id || 0 == appData.player[e].account_id) {
                    appData.showSitdownButton = 1;
                    break
                }
        }
    },
    hideGuests: function () {
        $('.sidelines-mask').hide();
        $('.sidelines-content').css({right: '-3.5rem',});
    },
    showGuests: function () {
        appData.showSitdownButton = 0;
        appData.showWatchButton = !appData.isWatching && appData.player[0].account_status < 2;

        if (appData.isWatching) {
            for (var e = 0; e < appData.player.length; e++)
                if (appData.player[e].account_id == userData.account_id || 0 == appData.player[e].account_id) {
                    appData.showSitdownButton = 1;
                    break
                }
        }
        $('.sidelines-mask').show();
        $('.sidelines-content').css({right: 0,});
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
    },
    showIconMore: function () {
        $('.icon-more-mask').show();
        $('.icon-more').css({right: 0,});
    },
    hideIconMore: function () {
        $('.icon-more-mask').hide();
        $('.icon-more').css({right: '-0.35rem',});
    },
};

var vueLife = {
    vmCreated: function () {
        logMessage("vmCreated"), resetState(), initView(), 4 != globalData.roomStatus && $("#loading").hide(), $(".main").show()
    },
    vmUpdated: function () {
        logMessage("vmUpdated")
    },
    vmMounted: function () {
        logMessage("vmMounted"), $("#marquee").marquee({
            duration: globalData.notySpeed,
            gap: 50,
            delayBeforeStart: 0,
            direction: "left",
            duplicated: !0
        })
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
var wsctop = 0;
var shareContent = "";
var wxModule = {
    config: function () {
        // wx.config({
        //     debug: !1,
        //     appId: configData.appId,
        //     timestamp: configData.timestamp,
        //     nonceStr: configData.nonceStr,
        //     signature: configData.signature,
        //     jsApiList: ["onMenuShareTimeline",
        //         "onMenuShareAppMessage",
        //         "hideMenuItems"]
        // });
        // getShareContent();
        // wx.onMenuShareTimeline({
        //     title: globalData.shareTitle,
        //     desc: shareContent,
        //     link: globalData.roomUrl,
        //     imgUrl: globalData.fileUrl + "files/images/paijiu/share_icon.png",
        //     success: function () {
        //     },
        //     cancel: function () {
        //     }
        // });
        // wx.onMenuShareAppMessage({
        //     title: globalData.shareTitle,
        //     desc: shareContent,
        //     link: globalData.roomUrl,
        //     imgUrl: globalData.fileUrl + "files/images/paijiu/share_icon.png",
        //     success: function () {
        //     },
        //     cancel: function () {
        //     }
        // })
    }
};
wx.config({
    // debug: !1,
    // appId: configData.appId,
    // timestamp: configData.timestamp,
    // nonceStr: configData.nonceStr,
    // signature: configData.signature,
    // jsApiList: ["onMenuShareTimeline",
    //     "onMenuShareAppMessage",
    //     "hideMenuItems"]
});
var isLoadAudioFile = !1;
audioModule.loadAllAudioFile();
audioModule.audioOn = true;
audioModule.stopSound("backMusic");
audioModule.playSound("backMusic", true);
wx.ready(function () {
    audioModule.loadAllAudioFile();
    wx.hideMenuItems({
        menuList: ["menuItem:copyUrl", "menuItem:share:qq", "menuItem:share:weiboApp", "menuItem:favorite", "menuItem:share:facebook", "menuItem:share:QZone", "menuItem:refresh"]
    });

});
wx.error(function (e) {
});

function logMessage(e) {
    // console.log(e)
}

function reload(e) {
    globalData.isShortUrl ? window.location.href = window.location.href + "/" + 1e4 * Math.random() : window.location.href = window.location.href + "&id=" + 1e4 * Math.random()
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
};

function getShareContent() {
    shareContent = "\n", 1 == appData.ruleInfo.banker_mode ? shareContent += "模式：自由抢庄 " : 2 == appData.ruleInfo.banker_mode ? shareContent += "模式：明牌抢庄 " : 3 == appData.ruleInfo.banker_mode ? shareContent += "模式：牛 牛上庄 " : 4 == appData.ruleInfo.banker_mode ? shareContent += "模式：通比牛 牛 " : 5 == appData.ruleInfo.banker_mode && (shareContent += "模式：固定庄家 "), 1 == appData.ruleInfo.baseScore ? shareContent += "底分：1分" : 2 == appData.ruleInfo.baseScore ? shareContent += "底分：3分" : 3 == appData.ruleInfo.baseScore ? shareContent += "底分：5分" : 4 == appData.ruleInfo.baseScore ? shareContent += "底分：10分" : 5 == appData.ruleInfo.baseScore ? shareContent += "底分：20分" : 6 == appData.ruleInfo.baseScore ? shareContent += "底分：2分" : 7 == appData.ruleInfo.baseScore && (shareContent += "底分：4分"), 2 == appData.ruleInfo.timesType && (shareContent += "  规则：至尊10倍，双天双地双人8倍，对子6倍，天王地王5倍，天杠地杠天高九地高九4倍，九点3倍，八点2倍"), 1 == appData.ruleInfo.ticket ? shareContent += "  局数：12局x2张房卡" : shareContent += "  局数：24局x4张房卡"
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
                })
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
    var pics = [globalData.fileUrl + "files/images/paijiu/rank_frame.jpg",
        globalData.fileUrl + "fiesc/images/bull/people_bg.png",
        globalData.fileUrl + "fiesc/images/bull/ranking_icon.png"];
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

function canvas222() {
    var e = document.getElementById("ranking");
    html2canvas(e, {
        allowTaint: !0, taintTest: !1, onrendered: function (e) {
            e.id = "mycanvas";
            var t = e.toDataURL("image/jpeg", .5);
            $("#end").attr("src", t), $(".end").show(), $(".ranking").hide(), newGame()
        }
    })
}

function getLocalTime(e) {
    var t = new Date(1e3 * parseInt(e)), a = t.getFullYear() + "年", n = t.getMonth() + 1 + "月", o = t.getDate() + "日 ",
        i = t.getHours(), r = t.getMinutes(), s = ":";
    return r < 10 && (s += 0), a + n + o + i + s + r
}

function randomString(e) {
    e = e || 32;
    var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678", a = t.length, n = "";
    for (i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
    return n
}

function disable_scroll() {
    $("body").on("touchmove", preventDefaultFn)
}

function enable_scroll() {
    $("body").off("touchmove", preventDefaultFn)
}

function preventDefaultFn(e) {
    e.preventDefault()
}

4 == globalData.roomStatus && setTimeout(function () {
    try {
        var obj = eval("(" + globalData.scoreboard + ")");
        setTimeout(function () {
            socketModule.processLastScoreboard(obj)
        }, 0)
    } catch (e) {
        console.log(e);
        setTimeout(function () {
            socketModule.processLastScoreboard("")
        }, 0)
    }
}, 50);
$(function () {
    $(".place").css("width", 140 * per);
    $(".place").css("height", 140 * per);
    $(".place").css("top", 270 * per);
    $(".place").css("left", 195 * per);
    sessionStorage.isPaused = "false";
    var e, t;
    void 0 !== document.hidden ?
        (e = "hidden", t = "visibilitychange") :
        void 0 !== document.webkitHidden && (e = "webkitHidden", t = "webkitvisibilitychange");
    void 0 === document.addEventListener || void 0 === e ?
        alert("This demo requires a browser such as Google Chrome that supports the Page Visibility API.") :
        document.addEventListener(t, function () {
            document[e] ? (audioModule.audioOn = !1, audioModule.stopSound("backMusic")) :
                "true" !== sessionStorage.isPaused && (console.log("play backMusic"),
                        audioModule.audioOn = !0,
                        audioModule.stopSound("backMusic"),
                        audioModule.playSound("backMusic", !0)
                )
        }, !1)
});

var initX, initY, moveX, moveY, X = 0, Y = 0, objX = 0, flagX = 0;
var Page = {};
Page.XX = 0;
$('.cuopai').on('touchstart', function (e) {
    var that = $(this);
    that.css('left', 0);
    initX = e.originalEvent.targetTouches[0].pageX;
    initY = e.originalEvent.targetTouches[0].pageY;
    objX = that.position().left;
    if (objX == 0) {
        that.on('touchmove', function (e) {
            Page.XX = '';
            if (flagX == 0) {
                setScrollX(event);
                return;
            } else if (flagX == 1) {
                event.preventDefault();
            } else {
                return;
            }
            moveX = e.originalEvent.targetTouches[0].pageX;
            X = moveX - initX;
            Page.XX = X;
            if (X <= 0) {
                that.css({
                    'transform': 'rotate(0deg)',
                    '-ms-transform': 'rotate(0deg)',
                    '-webkit-transform': 'rotate(0deg)',
                    '-o-transform': 'rotate(0deg)',
                    '-moz-transform': 'rotate(0deg)',
                });
            } else if (X > 0) {
                var L = Math.abs(X) / 3;
                that.css({
                    'transform': 'rotate(' + L + 'deg)',
                    '-ms-transform': 'rotate(' + L + 'deg)',
                    '-webkit-transform': 'rotate(' + L + 'deg)',
                    '-o-transform': 'rotate(' + L + 'deg)',
                    '-moz-transform': 'rotate(' + L + 'deg)',
                });
                if (L > 45) {
                    L = 45;
                    that.css({
                        'transform': 'rotate(' + L + 'deg)',
                        '-ms-transform': 'rotate(' + L + 'deg)',
                        '-webkit-transform': 'rotate(' + L + 'deg)',
                        '-o-transform': 'rotate(' + L + 'deg)',
                        '-moz-transform': 'rotate(' + L + 'deg)',
                    });
                }
            }
        });
    } else if (objX < 0) {
        that.on('touchmove', function (e) {
            if (flagX == 0) {
                setScrollX(event);
                return;
            } else if (flagX == 1) {
                event.preventDefault();
            } else {
                return;
            }
            moveX = e.originalEvent.targetTouches[0].pageX;
            X = moveX - initX;
            if (X >= 0) {
                var R = -10 + Math.abs(X);
                that.css({
                    'transform': 'rotate(' + R + 'deg)',
                    '-ms-transform': 'rotate(' + R + 'deg)',
                    '-webkit-transform': 'rotate(' + R + 'deg)',
                    '-o-transform': 'rotate(' + R + 'deg)',
                    '-moz-transform': 'rotate(' + R + 'deg)',
                });
                if (R > 30) {
                    R = 30;
                    that.css({
                        'transform': 'rotate(' + R + 'deg)',
                        '-ms-transform': 'rotate(' + R + 'deg)',
                        '-webkit-transform': 'rotate(' + R + 'deg)',
                        '-o-transform': 'rotate(' + R + 'deg)',
                        '-moz-transform': 'rotate(' + R + 'deg)',
                    });
                }
            } else {
                that.css({
                    'transform': 'rotate(50deg)',
                    '-ms-transform': 'rotate(50deg)',
                    '-webkit-transform': 'rotate(50deg)',
                    '-o-transform': 'rotate(50deg)',
                    '-moz-transform': 'rotate(50deg)',
                });
            }
        });
    }
});
$('.cuopai').on('touchend', function () {
    var that = $(this);
    objX = Page.XX;
    if (objX > 45) {
        that.css({
            'transform': 'rotate(50deg)',
            '-ms-transform': 'rotate(50deg)',
            '-webkit-transform': 'rotate(50deg)',
            '-o-transform': 'rotate(50deg)',
            '-moz-transform': 'rotate(50deg)',
        });
        $('.user-card[data-pos="0"] > div[data-item="4"]').removeClass('hind').addClass('front');
        $('.showdown').show();
        $('.user-card[data-pos="0"] .cardbox[data-item="4"]').unbind();
        if ($('.allow-rubcard')) {
            $('.allow-rubcard').fadeOut('100', function () {
                $(this).hide();
                if (appData.game.time > -1) {
                    viewMethods.seeMyCard4();
                }
                that.css({
                    'transform': 'rotate(0deg)',
                    '-ms-transform': 'rotate(0deg)',
                    '-webkit-transform': 'rotate(0deg)',
                    '-o-transform': 'rotate(0deg)',
                    '-moz-transform': 'rotate(0deg)',
                });
            })
        }
        objX = 45;
    } else {
        that.css({
            'transform': 'rotate(0deg)',
            '-ms-transform': 'rotate(0deg)',
            '-webkit-transform': 'rotate(0deg)',
            '-o-transform': 'rotate(0deg)',
            '-moz-transform': 'rotate(0deg)',
        });
        objX = 0;
    }
    flagX = 0;
});

function setScrollX(event) {
    moveX = event.targetTouches[0].pageX;
    moveY = event.targetTouches[0].pageY;
    X = moveX - initX;
    Y = moveY - initY;
    if (Math.abs(X) > Math.abs(Y)) {
        flagX = 1;
    } else {
        flagX = 2;
    }
    return flagX;
};
$(".cuopai").mousedown(function (e) {
    var that = $(this);
    that.css('left', 0);
    var left = parseInt(that.css("left"));
    var downx = e.pageX;
    if (left == 0) {
        that.bind("mousemove", function (es) {
            var endx = es.pageX - downx + left;
            Page.XX2 = endx;
            if (endx <= 0) {
                that.css({
                    'transform': 'rotate(0deg)',
                    '-ms-transform': 'rotate(0deg)',
                    '-webkit-transform': 'rotate(0deg)',
                    '-o-transform': 'rotate(0deg)',
                    '-moz-transform': 'rotate(0deg)',
                });
            } else if (endx > 0) {
                var L = Math.abs(endx) / 3;
                that.css({
                    'transform': 'rotate(' + L + 'deg)',
                    '-ms-transform': 'rotate(' + L + 'deg)',
                    '-webkit-transform': 'rotate(' + L + 'deg)',
                    '-o-transform': 'rotate(' + L + 'deg)',
                    '-moz-transform': 'rotate(' + L + 'deg)',
                });
                if (L > 45) {
                    L = 45;
                    that.css({
                        'transform': 'rotate(' + L + 'deg)',
                        '-ms-transform': 'rotate(' + L + 'deg)',
                        '-webkit-transform': 'rotate(' + L + 'deg)',
                        '-o-transform': 'rotate(' + L + 'deg)',
                        '-moz-transform': 'rotate(' + L + 'deg)',
                    });
                    $('.user-card[data-pos="0"] > div[data-item="4"]').removeClass('hind').addClass('front');
                    $('.showdown').show();
                    $('.user-card[data-pos="0"] .cardbox[data-item="4"]').unbind();
                    if ($('.allow-rubcard')) {
                        $('.allow-rubcard').fadeOut('100', function () {
                            $(this).remove();
                        })
                    }
                }
            }
        });
    }
});
$(".cuopai").mouseup(function () {
    var that = $(this);
    var left = Page.XX2;
    if (left > 40) {
        that.css({
            'transform': 'rotate(50deg)',
            '-ms-transform': 'rotate(50deg)',
            '-webkit-transform': 'rotate(50deg)',
            '-o-transform': 'rotate(50deg)',
            '-moz-transform': 'rotate(50deg)',
        });
        $('.user-card[data-pos="0"] > div[data-item="4"]').removeClass('hind').addClass('front');
        $('.showdown').show();
        $('.user-card[data-pos="0"] .cardbox[data-item="4"]').unbind();
        if ($('.allow-rubcard')) {
            $('.allow-rubcard').fadeOut('100', function () {
                $(this).remove();
            })
        }
        left = 40;
    } else {
        that.css({
            'transform': 'rotate(0deg)',
            '-ms-transform': 'rotate(0deg)',
            '-webkit-transform': 'rotate(0deg)',
            '-o-transform': 'rotate(0deg)',
            '-moz-transform': 'rotate(0deg)',
        });
        left = 0;
    }
    that.unbind("mousemove");
});