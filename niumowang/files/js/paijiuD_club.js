var ws;
var game = {
    room: 0,
    room_number: globalData.roomNumber,
    status: 0,
    time: -1,
    round: 0,
    total_num: 0,
    cardDeal: 0,
    can_open: 0,
    current_win: 0,
    is_play: !1,
    show_card: !1,
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
    JoinRoom: "JoinRoom",
    ReadyStart: "ReadyStart",
    PrepareJoinRoom: "PrepareJoinRoom",
    AllGamerInfo: "AllGamerInfo",
    UpdateGamerInfo: "UpdateGamerInfo",
    UpdateAccountStatus: "UpdateAccountStatus",
    StartLimitTime: "StartLimitTime",
    CancelStartLimitTime: "CancelStartLimitTime",
    GameStart: "GameStart",
    Win: "Win",
    autoCreateRoom: "autoCreateRoom",
    BroadcastVoice: "BroadcastVoice",
    GrabBanker: "GrabBanker",
    PlayerMultiples: "PlayerMultiples",
    ShowCard: "ShowCard",
    ComebineCards: "ComebineCards",
    UpdateAccountShow: "UpdateAccountShow",
    UpdateAccountMultiples: "UpdateAccountMultiples",
    StartBet: "StartBet",
    StartShow: "StartShow",
    RefreshRoom: "PullRoomInfo",
    MyCards: "MyCards",
    GameOver: "GameOver",
    BreakRoom: "BreakRoom",
    CombineCards: "CombineCards",
    StartCombineCards: "StartCombineCards",
    EndCombineCards: "EndCombineCards",
    //观战功能
    GuestRoom: "GuestRoom",
    AllGuestInfo: "AllGuestInfo",
    UpdateGuestInfo: "UpdateGuestInfo",
    SwapSeat: "SwapSeat",
    TipsCards: "TipsCards",
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

        // console.log(appData.player);
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
    sendJoinRoom: function () {
        socketModule.sendData({
            operation: wsOperation.JoinRoom,
            data: {room_number: globalData.roomNumber, token: globalData.tk}
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
    //提示
    sendGuestRoom: function () {
        socketModule.sendData({
            operation: wsOperation.GuestRoom,
            data: {
                room_number: globalData.roomNumber, token: globalData.tk
            }
        });
    },
    sendTipsCards: function (cards) {
        socketModule.sendData({
            operation: wsOperation.TipsCards,
            data: {
                picked_cards: cards,
                room_id: appData.game.room, token: globalData.tk
            }
        })
    },
    sendSitDown: function (e) {
        socketModule.sendData({
            operation: wsOperation.JoinRoom,
            data: {
                room_number: globalData.roomNumber,
                serial_num: typeof (e) == 'number' ? e : '',
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
            data: {room_id: appData.game.room, voice_num: parseInt(e), token: globalData.tk}
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
            data: {room_id: appData.game.room, multiples: parseInt(e), token: globalData.tk}
        })
    },
    sendGroupCard: function (e) {
        socketModule.sendData({
            operation: wsOperation.ComebineCards,
            data: {room_id: appData.game.room, picked_a: parseInt(e[0]), picked_b: parseInt(e[1]), token: globalData.tk}
        })
    },
    getScoreBoard: function () {
        socketModule.sendData({
            operation: "getScoreBoard",
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
            appData.ruleInfo.rule_type = e.data.rule_type;
            appData.ruleInfo.bet_type = e.data.bet_type;
            appData.ruleInfo.special_card = e.data.specail_card;
            appData.ruleInfo.isCardfive = Math.ceil(e.data.is_cardfive);
            appData.ruleInfo.isCardbomb = Math.ceil(e.data.is_cardbomb);
            appData.ruleInfo.isCardtiny = Math.ceil(e.data.is_cardtiny);
            appData.ruleInfo.banker_mode = Math.ceil(e.data.banker_mode);
            appData.ruleInfo.banker_score = Math.ceil(e.data.banker_score_type);
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
            appData.roomStatus = obj.data.room_status;
            viewMethods.roundEnd();
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
        if (e.data.card_group) {
            appData.card_tip_one = e.data.card_group[0].group.replace(/-/, ",");
        }
        appData.game.show_card = !0,
            appData.game.room = e.data.room_id,
            appData.game.room_url = e.data.room_url,
            appData.game.round = Math.ceil(e.data.game_num),
            appData.game.total_num = Math.ceil(e.data.total_num),
            appData.base_score = Math.ceil(e.data.base_score),
            appData.canBreak = Math.ceil(e.data.can_break),
            resetAllPlayerData(),
        -1 == e.data.limit_time && (appData.game.time = Math.ceil(e.data.limit_time), viewMethods.timeCountDown()),
            appData.player[0].serial_num = e.data.serial_num;
        for (var t = 0; t < globalData.maxCount; t++)
            t <= globalData.maxCount - e.data.serial_num ?
                appData.player[t].serial_num = t + Math.ceil(e.data.serial_num) :
                appData.player[t].serial_num = t + Math.ceil(e.data.serial_num) - globalData.maxCount;
        appData.player[0].account_status = Math.ceil(e.data.account_status),
            appData.player[0].account_score = Math.ceil(e.data.account_score),
            appData.player[0].nickname = userData.nickname,
            appData.player[0].headimgurl = userData.headimgurl,
            appData.player[0].account_id = userData.account_id;
        if (appData.player[0].account_status >= 8) {
            appData.player[0].card_group_one = e.data.cardGroupOne.card.concat(),
                appData.player[0].card_group_two = e.data.cardGroupTwo.card.concat(),
                appData.player[0].card_type_one = e.data.cardGroupOne.cardType,
                appData.player[0].card_type_two = e.data.cardGroupTwo.cardType,
                appData.player[0].combo_point_one = e.data.cardGroupOne.cardNo,
                appData.player[0].combo_point_two = e.data.cardGroupTwo.cardNo,
                // appData.player[0].gtBankerOne=e.data.cardGroupOne.gtBanker,
                // appData.player[0].gtBankerTwo=e.data.cardGroupTwo.gtBanker,
            appData.player[0].card.length > 0 && (appData.player[0].card = []);
            e.data.cards.forEach(function (e) {
                appData.player[0].card.push({cardValue: e, isGroup: !1})
            });
            for (a = 0; a < e.data.cardGroupOne.card.length; a++)
                !function (t) {
                    for (var a = 0; a < appData.player[0].card.length; a++)
                        !function (a) {
                            appData.player[0].card[a].cardValue == e.data.cardGroupOne.card[t] && setTimeout(function () {
                                console.log(a + 1, t + 1, "12"),
                                    $(".myCards .level" + (a + 1)).addClass("levelCard" + (t + 1))
                            }, 100)
                        }(a)
                }(a);
            for (var a = 0; a < e.data.cardGroupTwo.card.length; a++)
                !function (t) {
                    for (var a = 0; a < appData.player[0].card.length; a++)
                        !function (a) {
                            appData.player[0].card[a].cardValue == e.data.cardGroupTwo.card[t] && setTimeout(function () {
                                console.log(a + 1, t + 3, "34"),
                                    $(".myCards .level" + (a + 1)).addClass("levelCard" + (t + 3))
                            }, 100)
                        }(a)
                }(a)
        } else {
            if (appData.player[0].card.length > 0) {
                appData.player[0].card = [];
            }
            e.data.cards.forEach(function (e) {
                appData.player[0].card.push({cardValue: e, isGroup: !1})
            });
        }
        appData.player[0].ticket_checked = e.data.ticket_checked,
            appData.game.status = Math.ceil(e.data.room_status),
        2 == appData.game.status && (appData.game.cardDeal = 5),
            appData.scoreboard = e.data.scoreboard,
            viewMethods.resetMyAccountStatus(),
            viewMethods.updateAllPlayerStatus()

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
        resetAllPlayerData(),
            appData.player[0].serial_num = e.data.serial_num;
        for (t = 0; t < globalData.maxCount; t++)
            t <= globalData.maxCount - e.data.serial_num ? appData.player[t].serial_num = t + Math.ceil(e.data.serial_num) : appData.player[t].serial_num = t + Math.ceil(e.data.serial_num) - globalData.maxCount;
        appData.player[0].account_status = Math.ceil(e.data.account_status),
            appData.player[0].account_score = Math.ceil(e.data.account_score),
            appData.player[0].nickname = userData.nickname,
            appData.player[0].headimgurl = userData.headimgurl,
            appData.player[0].account_id = userData.account_id,
            appData.player[0].serial_num = e.data.serial_num,
            e.data.cards.forEach(function (e) {
                appData.player[0].card.push({cardValue: e, isGroup: !1})
            });
        if (appData.player[0].account_status >= 8) {
            appData.player[0].card_type_one = e.data.cardGroupOne.cardType,
                appData.player[0].card_type_two = e.data.cardGroupTwo.cardType,
                appData.player[0].combo_point_one = e.data.cardGroupOne.cardNo,
                appData.player[0].combo_point_two = e.data.cardGroupTwo.cardNo;
            // appData.player[0].gtBankerOne=e.data.cardGroupOne.gtBanker,
            // appData.player[0].gtBankerTwo=e.data.cardGroupTwo.gtBanker
        }

        appData.player[0].ticket_checked = e.data.ticket_checked,
        2 == appData.game.status && (appData.game.cardDeal = 5);

        gamerInfo = {data: e.all_gamer_info};
        this.processAllGamerInfo(gamerInfo);

        appData.player[0].account_status > 2 && setTimeout(function () {
            appData.player[0].is_showCard = !0
        }, 500);
    },
    processAllGamerInfo: function (e) {
        appData.game.show_card = !0,
            appData.clickCard4 = !1;
        for (a = 0; a < globalData.maxCount; a++) {

            for (var t = 0; t < e.data.length; t++) {
                if (appData.player[a].serial_num == e.data[t].serial_num) {
                    appData.player[a].nickname = e.data[t].nickname
                    appData.player[a].headimgurl = e.data[t].headimgurl
                    appData.player[a].account_id = Number(e.data[t].account_id)
                    appData.player[a].account_code = e.data[t].account_code
                    appData.player[a].account_score = Math.ceil(e.data[t].account_score)
                    appData.player[a].account_status = Math.ceil(Number(e.data[t].account_status))
                    appData.player[a].online_status = Math.ceil(e.data[t].online_status)
                    appData.player[a].sex = e.data[t].sex
                    appData.player[a].ticket_checked = e.data[t].ticket_checked
                    appData.player[a].multiples = e.data[t].multiples
                    appData.player[a].bankerMultiples = e.data[t].banker_multiples
                    appData.player[a].head_kw = e.data[t].head_kw;
                    if (1 == e.data[t].is_banker) {
                        appData.player[a].is_banker = !0,
                            appData.bankerAccountId = e.data[t].account_id,
                            appData.bankerPlayer = appData.player[a]
                    } else {
                        appData.player[a].is_banker = !1
                    }
                }


                if (3 == appData.player[a].account_status) {
                    appData.showRobText2 = true
                    appData.waitStart = false
                }
                if (4 == appData.player[a].account_status) {
                    appData.showClockBetText = true
                }
                if (7 == appData.player[a].account_status) {
                    appData.showClockShowCard = true
                }
                if (8 == appData.player[a].account_status) {
                    if (a > 0) {
                        appData.player[a].card_group_one = [-1, -1, -1, -1]
                        appData.player[a].card_group_two = [-1, -1, -1, -1]
                    } else {
                        if (appData.player[0].account_id != userData.account_id) {
                            appData.player[0].card_group_one.length = 1
                            appData.player[0].card_group_two.length = 1
                            appData.player[0].card.length = 1
                            appData.player[0].card = [
                                {cardValue: -1, isGroup: !1},
                                {cardValue: -1, isGroup: !1},
                                {cardValue: -1, isGroup: !1},
                                {cardValue: -1, isGroup: !1}
                            ]
                        } else {
                            appData.player[a].card_type_one = e.data[t].cardGroupOne.cardType
                            appData.player[a].card_type_two = e.data[t].cardGroupTwo.cardType
                            appData.player[a].combo_point_one = e.data[t].cardGroupOne.cardNo
                            appData.player[a].combo_point_two = e.data[t].cardGroupTwo.cardNo
                            appData.player[a].card_group_one = e.data[t].cardGroupOne.card.concat()
                            appData.player[a].card_group_two = e.data[t].cardGroupTwo.card.concat()
                        }


                    }
                }
            }
        }


        if ("" != appData.scoreboard) {
            for (var a = 0; a < globalData.maxCount; a++)
                for (s in appData.scoreboard)
                    appData.player[a].account_id == s && (
                        appData.playerBoard.score[a].num = appData.player[a].num,
                            appData.playerBoard.score[a].account_id = appData.player[a].account_id,
                            appData.playerBoard.score[a].nickname = appData.player[a].nickname,
                            appData.playerBoard.score[a].account_score = Math.ceil(appData.scoreboard[s])
                    );
            2 == appData.game.status ? appData.playerBoard.round = appData.game.round - 1 : appData.playerBoard.round = appData.game.round
        }
        3 == appData.player[0].account_status && (
            appData.waitStart = false,
                appData.showClockRobText = !0,
                setTimeout(function () {
                    appData.showRob = !0
                }, 500)
        ),
        6 == appData.player[0].account_status && (
            appData.showClockBetText = !0,
                1 == appData.player[0].is_banker ? (
                    appData.showRob = !1,
                        appData.showRobText = !1,
                        appData.showNotRobBankerText = !1,
                        appData.showBankerCoinText = !0,
                        appData.showTimesCoin = !1
                ) : (
                    appData.showRob = !1,
                        appData.showRobText = !1,
                        appData.showNotRobBankerText = !1,
                        appData.showBankerCoinText = !1,
                        appData.showTimesCoin = !0
                ),
                appData.isFinishBankerAnimate = !0
        ),
            viewMethods.resetMyAccountStatus(),
            viewMethods.updateAllPlayerStatus(),
        appData.player[0].account_status > 2 && appData.player[0].account_status < 7 && 2 == appData.ruleInfo.banker_mode && setTimeout(function () {
            viewMethods.seeMyCard()
        }, 650)


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
                appData.player[i].sex = obj.data.sex;
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
        for (a = 0; a < appData.guests.length; a++) {
            if (appData.guests[a].account_id == obj.data.account_id) {
                appData.guests.splice(a, 1);
                break;
            }
        }

    },
    processUpdateAccountStatus: function (e) {
        for (var t = 0; t < appData.player.length; t++)
            if (appData.player[t].account_id == e.data.account_id) {
                appData.isOverCards || (appData.player[t].account_status = Math.ceil(e.data.account_status));
                if (2 == appData.ruleInfo.banker_mode) {
                    if (1 == e.data.online_status && (5 == e.data.account_status || 4 == e.data.account_status)) {
                        appData.player[t].bankerMultiples = e.data.banker_multiples
                    }
                }
                appData.player[t].account_status >= 9 && (appData.player[t].online_status = e.data.online_status),
                1 == e.data.online_status || (0 == e.data.online_status && 0 == appData.player[t].account_status ? (appData.player[t].account_id = 0, appData.player[t].playing_status = 0, appData.player[t].online_status = 0, appData.player[t].nickname = "", appData.player[t].headimgurl = "", appData.player[t].account_score = 0, appData.player[t].open_left = !1, appData.player[t].open_right = !1) : 0 == e.data.online_status && appData.player[t].account_status > 0 ? appData.player[t].online_status = 0 : logMessage("~~~~~~~!!!!!!" + e)),
                0 != t && (4 == appData.player[t].account_status ? setTimeout(function () {
                    mp3AudioPlay("audioNoBanker")
                }, 100) : 5 == appData.player[t].account_status && setTimeout(function () {
                    mp3AudioPlay("audioRobBanker")
                }, 100));
                break
            }
        3 == appData.player[0].account_status ? viewMethods.showRobBankerText() :
            4 == appData.player[0].account_status && viewMethods.showNotRobBankerTextFnc(),
            appData.isFinishBankerAnimate && appData.isFinishWinAnimate ? (
                viewMethods.resetMyAccountStatus(),
                    viewMethods.updateAllPlayerStatus()
            ) : setTimeout(function () {
                viewMethods.resetMyAccountStatus(),
                    viewMethods.updateAllPlayerStatus()
            }, 350)
    },
    processGameStart: function (e) {
        appData.guestNotShowBullImg = true;
        $(".cards").removeClass("card-flipped"),
            $(".myCards").removeClass("card-flipped"),
            $(".memberCoin").stop(!0),
            appData.isOverCards = !1,
            appData.isFinishWinAnimate = !0,
            appData.isFinishBankerAnimate = !0,
            appData.game.can_open = 0,
            appData.game.cardDeal = 0,
            appData.game.status = 1,
            appData.game.show_card = !0,
            appData.game.time = -1,
            appData.game.is_play = !0,
            appData.game.round = appData.game.round + 1,
            appData.game.round = Math.ceil(e.game_num),
            appData.player[0].is_showCard = !1,
            appData.showClockRobText = !1,
            appData.showClockBetText = !1,
            appData.showClockShowCard = !1,
            appData.showClockGroupCard = !1,
            appData.clickCard4 = !1,
            appData.breakData = null;
        for (var t = 0; t < globalData.maxCount; t++) {
            appData.player[t].is_operation = !1,
                appData.player[t].is_showCard = !1,
                appData.player[t].is_banker = !1,
                appData.player[t].bullImgRight = "",
                appData.player[t].bullImgLeft = "",
                appData.player[t].bullImgLeftLose = "",
                appData.player[t].bullImgRightLose = "",
                appData.player[t].open_left = !1,
                appData.player[t].open_right = !1,
                $(".memberBullWin" + appData.player[t].num + "11").fadeOut(10),
                $(".memberBullWin" + appData.player[t].num + "22").fadeOut(10),
                $(".memberBullLose" + appData.player[t].num + "11").fadeOut(10),
                $(".memberBullLose" + appData.player[t].num + "11").fadeOut(10),
            0 == appData.player[t].online_status && (appData.player[t].account_status = 1);
            for (var a = 0; a < e.data.length; a++)
                appData.player[t].account_id == e.data[a].account_id && (
                    appData.player[t].ticket_checked = 1,
                        appData.player[t].account_status = Math.ceil(e.data[a].account_status),
                        appData.player[t].playing_status = Math.ceil(e.data[a].playing_status),
                        appData.player[t].online_status = Math.ceil(e.data[a].online_status),
                        appData.player[t].account_score = appData.player[t].account_score,
                        appData.player[t].limit_time = Math.ceil(e.data[a].limit_time)
                )
        }
        appData.game.status = 2,
            appData.game.time = Math.ceil(e.limit_time),
            appData.showRobText2 = true,
            viewMethods.timeCountDown(),
            viewMethods.reDeal()
    },
    processMyCards: function (e) {
        appData.player[0].card = []
        2 == appData.ruleInfo.banker_mode && (
            appData.player[0].account_id == e.data.account_id && (
                appData.player[0].card.length > 0 && (appData.player[0].card = []),
                    e.data.cards.forEach(function (e) {
                        appData.player[0].card.push({cardValue: e, isGroup: !1})
                    })
            ),
                setTimeout(function () {
                    viewMethods.seeMyCard()
                }, 1e3)
        )
    },
    processStartBet: function (e) {
        appData.showRobText2 = false,
            appData.waitStart = false;
        var t = 0;
        3 == appData.ruleInfo.banker_mode && (t = 1000),
        5 == appData.ruleInfo.banker_mode && appData.game.round > 1 && (t = 800),
        1 == appData.game.round && appData.ruleInfo.banker_mode,


            setTimeout(function () {
                for (var t = 0; t < globalData.maxCount; t++) {
                    for (var a = 0; a < e.data.length; a++) {
                        if (appData.player[t].account_id == e.data[a].account_id) {

                            appData.player[t].account_status = Math.ceil(e.data[a].account_status),
                                appData.player[t].online_status = Math.ceil(e.data[a].online_status),
                                appData.player[t].limit_time = Math.ceil(e.data[a].limit_time),
                                appData.player[t].multiples = 0,
                                1 == e.data[a].is_banker ? (
                                        appData.player[t].is_banker = !0,
                                            appData.bankerAccountId = e.data[a].account_id,
                                            appData.bankerPlayer = appData.player[t]
                                    ) :
                                    appData.player[t].is_banker = !1

                        }
                    }
                }

                appData.bankerArray = e.grab_array.concat(),
                    appData.showRob = !1,
                    appData.showClockBetText = !1,
                    appData.showClockRobText = !1,
                    appData.showClockShowCard = !1,
                    appData.showClockGroupCard = !1,
                    appData.game.time = Math.ceil(e.limit_time),
                    appData.bankerAnimateIndex = 0,
                    appData.game.time = -1,
                    viewMethods.clearBanker(),
                    viewMethods.robBankerAnimate(e)
            }, t)
        if (appData.player[0].account_id != userData.account_id) {
            // appData.player[0].card_group_one.length=1
            // appData.player[0].card_group_two.length=1
            appData.player[0].card = [{cardValue: -1, isGroup: !1}, {cardValue: -1, isGroup: !1}, {
                cardValue: -1,
                isGroup: !1
            }, {cardValue: -1, isGroup: !1}]
        }
    },
    processTipsCards: function (e) {
        appData.checkOne = false;
        var t1 = 0;
        appData.isShowTipBull = true;
        if (e.data.cardType1 > 1) {
            appData.tipTypeLeft = globalData.fileUrl + "files/images/paijiu_xy/type" + e.data.cardType1 + ".png";
        } else {
            appData.tipTypeLeft = globalData.fileUrl + "files/images/paijiu_xy/point" + e.data.cardNo1 + ".png";
        }
        if (e.data.cardType2 > 1) {
            appData.tipTypeRight = globalData.fileUrl + "files/images/paijiu_xy/type" + e.data.cardType2 + ".png";
        } else {
            appData.tipTypeRight = globalData.fileUrl + "files/images/paijiu_xy/point" + e.data.cardNo2 + ".png";
        }

        appData.player[0].card[0].isGroup = !1;
        appData.player[0].card[1].isGroup = !1;
        appData.player[0].card[2].isGroup = !1;
        appData.player[0].card[3].isGroup = !1;
        appData.groupNUm = 0;
        for (var i = 0; i < appData.player[0].card.length; i++) {
            $(".myCards .card" + i).css({top: 0});
            appData.player[0].card[i].isGroup = !1;
            if (appData.player[0].card[i].cardValue == e.data.cardGroupOne.card[0] && appData.checkOne == false) {
                $(".myCards .card" + i).css({top: "-3vh"});
                // setTimeout(function(){
                appData.player[0].card[i].isGroup = !0
                // },100),
                appData.groupNUm++
                appData.checkOne = true;
                continue
            }
            if (appData.player[0].card[i].cardValue == e.data.cardGroupOne.card[1]) {
                $(".myCards .card" + i).css({top: "-3vh"});
                // setTimeout(function(){
                appData.player[0].card[i].isGroup = !0
                // },100),
                appData.groupNUm++
            }
            if (2 == appData.groupNUm) {
                appData.player[0].is_GroupCard = !0;

                return
            } else {
                appData.player[0].is_GroupCard = !1
            }
        }

        // appData.tipTypeLeft
        // appData.tipTypeRight


        // appData.player[0].card[e].isGroup?(
        //     $(".myCards .card"+e).css({top:0}),
        //         setTimeout(function(){
        //             appData.player[0].card[e].isGroup=!1
        //         },100),
        //         appData.groupNUm--
        // ):(
        //     $(".myCards .card"+e).css({top:"-3vh"}),
        //         setTimeout(function(){
        //             appData.player[0].card[e].isGroup=!0
        //         },100),
        //         appData.groupNUm++
        // )

    },
    processStartCombineCards: function (e) {
        if (appData.player[0].account_id != userData.account_id) return; //观战功能
        appData.card_tip_one = e.data.card_group[0].group.replace(/-/, ","),
        appData.player[0].card.length > 0 && (appData.player[0].card = []),
            e.data.cards.forEach(function (e) {
                appData.player[0].card.push({cardValue: e, isGroup: !1})
            }),
            appData.showClockShowCard = !0,
            viewMethods.resetMyAccountStatus(),
            viewMethods.updateAllPlayerStatus()
    },
    processCombineCards: function (e) {
        for (var t = 0; t < appData.player.length; t++)
            for (var a = 0; a < e.data.length; a++)
                appData.player[t].account_id == e.data[a].account_id && (
                    appData.player[t].account_status = Math.ceil(e.data[a].account_status),
                        appData.player[t].multiples = e.data[a].multiples
                );
        appData.game.time = Math.ceil(e.limit_time),
            viewMethods.timeCountDown(),
            appData.showClockBetText = !1,
            appData.showClockRobText = !1,
            appData.showClockShowCard = !0,
            appData.showClockGroupCard = !0,
            viewMethods.resetMyAccountStatus(),
            viewMethods.updateAllPlayerStatus()
    },
    processEndCombineCards: function (e) {
        appData.isShowTipBull = false
        for (var t = 0; t < appData.player.length; t++) {
            if (appData.player[t].account_id == e.data.account_id) {

                appData.player[t].online_status = Math.ceil(e.data.online_status),
                    appData.player[t].card_group_one = e.data.cardGroupOne.card.concat(),
                    appData.player[t].card_group_two = e.data.cardGroupTwo.card.concat(),
                    appData.player[t].card_type_one = e.data.cardGroupOne.cardType,
                    appData.player[t].card_type_two = e.data.cardGroupTwo.cardType,
                    appData.player[t].combo_point_one = e.data.cardGroupOne.cardNo,
                    appData.player[t].combo_point_two = e.data.cardGroupTwo.cardNo;

                if (0 == t) {
                    if (appData.player[0].account_id != userData.account_id) { //观战者

                        appData.player[0].card_group_one.length = 1,
                            appData.player[0].card_group_two.length = 1,
                            appData.player[0].card_type_one = 0,
                            appData.player[0].card_type_two = 0,
                            appData.player[0].combo_point_one = 0,
                            appData.player[0].combo_point_two = 0;
                        appData.player[0].card = [
                            {cardValue: "-1", isGroup: !1},
                            {cardValue: "-1", isGroup: !1},
                            {cardValue: "-1", isGroup: !1},
                            {cardValue: "-1", isGroup: !1}
                        ]
                    }
                    appData.player[0].card = [];
                    appData.player[0].card.push(
                        {
                            cardValue: e.data.cardGroupOne.card[0],
                            isGroup: true
                        }, {
                            cardValue: e.data.cardGroupOne.card[1],
                            isGroup: true
                        }, {
                            cardValue: e.data.cardGroupTwo.card[0],
                            isGroup: false
                        }, {
                            cardValue: e.data.cardGroupTwo.card[1],
                            isGroup: false
                        }
                    )

                    setTimeout(function () {
                        $(".myCards .level1").addClass("levelCard1")
                        $(".myCards .level2").addClass("levelCard2")
                        $(".myCards .level3").addClass("levelCard3")
                        $(".myCards .level4").addClass("levelCard4")
                    }, 350)

                }

                appData.player[t].account_status = Math.ceil(e.data.account_status);
                if (appData.player[t].card_type_one >= 1) {
                    var n = 0;
                    o = parseInt(appData.player[t].card_type_one);
                    n = appData.player[t].combo_point_one;
                    if (o > 1) {
                        n = "type" + o;
                    } else if (o == 1) {
                        n = "point" + n;
                    }
                    if (globalData.p_type == 2) {
                        appData.player[t].bullImgLeft = globalData.fileUrl + "files/images/paijiu_xy/" + n + ".png";
                        appData.player[t].bullImgLeftLose = globalData.fileUrl + "files/images/paijiuD_xy/" + n + ".png";
                    } else {
                        appData.player[t].bullImgLeft = globalData.fileUrl + "files/images/paijiu/" + n + ".png";
                        appData.player[t].bullImgLeftLose = globalData.fileUrl + "files/images/paijiuD/" + n + ".png";
                    }

                }
                if (appData.player[t].card_type_two >= 1) {
                    var i = 0;
                    r = parseInt(appData.player[t].card_type_two);
                    i = appData.player[t].combo_point_two;
                    if (r > 1) {
                        i = "type" + r;

                    } else if (1 == r) {
                        i = "point" + i;
                    }
                    if (globalData.p_type == 2) {
                        appData.player[t].bullImgRight = globalData.fileUrl + "files/images/paijiu_xy/" + i + ".png";
                        appData.player[t].bullImgRightLose = globalData.fileUrl + "files/images/paijiuD_xy/" + i + ".png";
                    } else {
                        appData.player[t].bullImgRight = globalData.fileUrl + "files/images/paijiu/" + i + ".png";
                        appData.player[t].bullImgRightLose = globalData.fileUrl + "files/images/paijiuD/" + i + ".png";
                    }


                }
            }

        }

        appData.showClockBetText = !1,
            appData.showClockRobText = !1,
            appData.showClockGroupCard = !1,
            appData.showClockShowCard = !0,
            viewMethods.resetMyAccountStatus(),
            viewMethods.updateAllPlayerStatus()
    },
    processShowCard: function (e) {
        // console.log('processShowCard',e,appData);

        appData.showClockShowCard = !1,
            appData.isShowTipBull = false
        appData.guestNotShowBullImg = true

        for (var t = 0; t < globalData.maxCount; t++)
            for (var a = 0; a < e.data.length; a++)
                if (appData.player[t].account_id == e.data[a].account_id) {
                    appData.player[t].online_status = Math.ceil(e.data[a].online_status),
                        appData.player[t].card_group_one = e.data[a].cardGroupOne.card.concat(),
                        appData.player[t].card_group_two = e.data[a].cardGroupTwo.card.concat(),
                        appData.player[t].card_type_one = e.data[a].cardGroupOne.cardType,
                        appData.player[t].card_type_two = e.data[a].cardGroupTwo.cardType,
                        appData.player[t].combo_point_one = e.data[a].cardGroupOne.cardNo,
                        appData.player[t].combo_point_two = e.data[a].cardGroupTwo.cardNo,
                        appData.player[t].gtBankerOne = e.data[a].cardGroupOne.gtBanker,
                        appData.player[t].gtBankerTwo = e.data[a].cardGroupTwo.gtBanker;

                    // console.log('card_group_one', appData.player[t].card_group_one)
                    // console.log('card_group_two', appData.player[t].card_group_two)

                    // //这里
                    if (appData.player[0].account_id != userData.account_id) {

                        appData.player[t].card = [
                            {
                                cardValue: e.data[a].cardGroupOne.card[0],
                                isGroup: false
                            },
                            {
                                cardValue: e.data[a].cardGroupOne.card[1],
                                isGroup: false
                            },
                            {
                                cardValue: e.data[a].cardGroupTwo.card[0],
                                isGroup: false
                            },
                            {
                                cardValue: e.data[a].cardGroupTwo.card[1],
                                isGroup: false
                            }
                        ];
                    }


                    // if(0==t&&8!=appData.player[t].account_status){
                    for (n = 0; n < e.data[a].cardGroupOne.card.length; n++) {
                        for (var o = 0; o < appData.player[t].card.length; o++) {
                            if (appData.player[t].card[o].cardValue == e.data[a].cardGroupOne.card[n]) {
                                setTimeout(function () {
                                    // console.log(o+1,n+1,"12"),
                                    // $(".myCards .level" + (o + 1)).addClass("levelCard" + (n + 1))
                                }, 350)
                            }
                        }
                    }

                    for (var n = 0; n < e.data[a].cardGroupTwo.card.length; n++) {
                        for (var o = 0; o < appData.player[t].card.length; o++) {
                            if (appData.player[t].card[o].cardValue == e.data[a].cardGroupTwo.card[n]) {
                                setTimeout(function () {
                                    // console.log(o+1,n+3,"34"),
                                    // $(".myCards .level" + (o + 1)).addClass("levelCard" + (n + 3))
                                }, 350)
                            }
                        }
                    }


                    appData.player[0].card[0].cardValue == appData.player[0].card_group_one[0];
                    appData.player[0].card[1].cardValue == appData.player[0].card_group_one[1];
                    appData.player[0].card[2].cardValue == appData.player[0].card_group_two[0];
                    appData.player[0].card[3].cardValue == appData.player[0].card_group_two[1];
                    setTimeout(function () {
                        $(".myCards .level1").addClass("levelCard1")
                        $(".myCards .level2").addClass("levelCard2")
                        $(".myCards .level3").addClass("levelCard3")
                        $(".myCards .level4").addClass("levelCard4")
                    }, 350)


                    if (appData.player[0].account_id == e.data[a].account_id) {
                        var cardType = "";
                        cardType = 1 == e.data[a].cardGroupOne.cardType ? "point" + e.data[a].cardGroupOne.cardNo : "type" + e.data[a].cardGroupOne.cardType, setTimeout(function () {
                            mp3AudioPlay(cardType)
                        }, 350)
                        cardType2 = 1 == e.data[a].cardGroupTwo.cardType ? "point" + e.data[a].cardGroupTwo.cardNo : "type" + e.data[a].cardGroupTwo.cardType, setTimeout(function () {
                            mp3AudioPlay(cardType2)
                        }, 1200)
                        appData.player[t].is_audiobull = !0
                    }


                    appData.player[t].account_status = Math.ceil(e.data[a].account_status)
                }

        viewMethods.updateAllPlayerStatus(),
            viewMethods.resetMyAccountStatus()
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
        viewMethods.resetMyAccountStatus(),
            viewMethods.updateAllPlayerStatus()
    },
    processStartShow: function (e) {
        var t = 0;
        setTimeout(function () {
            for (var t = 0; t < globalData.maxCount; t++)
                for (var a = 0; a < e.data.length; a++)
                    appData.player[t].account_id == e.data[a].account_id && (
                        appData.player[t].multiples = e.data[a].multiples,
                            appData.player[t].account_status = Math.ceil(e.data[a].account_status),
                            appData.player[t].online_status = Math.ceil(e.data[a].online_status),
                            appData.player[t].limit_time = e.data[a].limit_time
                    );
            appData.showClockBetText = !1,
                appData.showClockRobText = !1,
                appData.showClockGroupCard = !1,
                appData.showClockShowCard = !0,
                viewMethods.resetMyAccountStatus(),
                viewMethods.updateAllPlayerStatus(),
                appData.game.time = Math.ceil(e.limit_time),
                viewMethods.timeCountDown()
        }, t)
    },
    processUpdateAccountShow: function (e) {
        for (var t = 0; t < appData.player.length; t++)
            if (appData.player[t].account_id == e.data.account_id) {
                appData.player[t].account_status = e.data.account_status,
                appData.player[t].card.length > 0 && (appData.player[t].card = []),
                    e.data.cards.forEach(function (e) {
                        appData.player[t].card.push({cardValue: e, isGroup: !1})
                    }),
                appData.player[t].account_status >= globalData.maxCount && (
                    appData.player[t].card_type_one = e.data.cardGroupOne.cardType,
                        appData.player[t].card_type_two = e.data.cardGroupTwo.cardType,
                        appData.player[t].combo_point_one = e.data.cardGroupOne.cardNo,
                        appData.player[t].combo_point_two = e.data.cardGroupTwo.cardNo,
                        appData.player[t].gtBankerOne = e.data.cardGroupOne.gtBanker,
                        appData.player[t].gtBankerTwo = e.data.cardGroupTwo.gtBanker
                );
                break
            }
        e.data.account_id == appData.player[0].account_id && viewMethods.resetMyAccountStatus(),
            viewMethods.updateAllPlayerStatus()
    },
    //自动续局
    processAutoCreateRoom: function (obj) {
        appData.showNextRoom = true;
        appData.newRoomNumber = obj.data.room_number;
        //
        // var newRoom=obj.data;
        // newRoom.oldRoomNumber=globalData.roomNumber;
        // localStorage.setItem('newRoom',JSON.stringify(obj.data));
    },
    processWin: function (e) {
        appData.game.is_play = !1,
            appData.game.current_win = e.data.win_score,
            appData.game.round = Math.ceil(e.data.game_num),
            appData.game.total_num = Math.ceil(e.data.total_num),
            appData.playerBoard.round = Math.ceil(e.data.game_num),
            appData.game.show_score = !1,
            appData.showClockShowCard = !1,
            appData.showClockGroupCard = !1,
            appData.showClockBetText = !1,
            appData.showClockRobText = !1,

            viewMethods.showMemberScore(!1);
        for (var t = 0; t < appData.player.length; t++) {
            appData.player[t].account_status >= 7 && (appData.player[t].account_status = 9),
                appData.player[t].single_score = 0;
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
        if (e.data.is_banker_kill == 1) {
            appData.isBankerKill = e.data.is_banker_kill;
        }
        appData.game.time = -1,
            setTimeout(function () {
                viewMethods.showAllCards(e)
            }, 1000),
            viewMethods.updateAllPlayerStatus(),
            setTimeout(function () {
                viewMethods.resetMyAccountStatus()
            }, 500),
            appData.isOverCards = !0,
            setTimeout(function () {
                viewMethods.winAnimate(e)
            }, 3500)
    },
    processStartLimitTime: function (e) {
        if (e.data.limit_time > 1) {
            appData.game.time = Math.ceil(e.data.limit_time)
            if (!appData.game.is_play) {
                appData.waitStart = true
            }
            viewMethods.timeCountDown2()
        }
    },
    processCancelStartLimitTime: function (e) {
        appData.game.time = -1;
        appData.waitStart = false;
    },
    processBreakRoom: function (e) {
        if (appData.breakData = e, 5 == appData.ruleInfo.banker_mode && appData.game.round != appData.game.total_num) return null == e || void 0 == e ? (appData.overType = 2, void viewMethods.clickShowAlert(9, "庄家分数不足，提前下庄，点击确定查看结算")) : void (1 == e.data.type ? appData.player[0].is_banker ? (viewMethods.clickCloseAlert(), null != appData.breakData && void 0 != appData.breakData && viewMethods.gameOverNew(appData.breakData.data.score_board, appData.breakData.data.balance_scoreboard), chooseBigWinner(), $(".ranking .rankBack").css("opacity", "1"), $(".roundEndShow").show(), $(".ranking").show(), canvas()) : (appData.overType = 1, viewMethods.clickShowAlert(9, "庄家主动下庄,点击确定查看结算")) : appData.overType = e.data.type)
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
    processBalanceScoreboard: function (e) {
        var t = new Date(1e3 * parseInt(e.time)), a = t.getFullYear() + "-", n = t.getMonth() + 1 + "-",
            o = t.getDate() + " ", i = t.getHours(), r = t.getMinutes(), l = ":";
        r < 10 && (l += 0);
        var c = a + n + o + i + l + r;
        appData.playerBoard.round = e.game_num, appData.playerBoard.record = c, appData.playerBoard.score = [];
        var p = e.scoreboard;
        for (s in p) {
            var u = 0, d = p[s].name;
            userData.account_id == p[s].account_id && (u = 1), appData.playerBoard.score.push({
                account_id: p[s].account_id,
                nickname: d,
                account_score: Math.ceil(p[s].score),
                num: u,
                account_code: p[s].account_code,
                "avatar": p[s].avatar
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
        showAlertB: function (e, t) {
            appData.isShowAlertB = !0, appData.alertTextB = e, appData.alertTypeB = t, setTimeout(function () {
                appData.isShowAlertB = !1
            }, 1e3)
        },
        clickGameOver: function () {
            viewMethods.clickShowAlert(10, "下庄之后，将以当前战绩进行结算。是否确定下庄？")
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
        clickShowAlertNotClubMember: function (e, t) {
            appData.alertType = e, appData.alertText = t, appData.isShowNotClubMember = !0, setTimeout(function () {
                var t = $(".alertText").height(), a = t;
                t < .15 * height && (t = .15 * height), t > .8 * height && (t = .8 * height);
                var n = t + .056 * height * 2 + .022 * height + .056 * height;
                8 == e && (n = n - .022 * height - .056 * height);
                var o = t + .034 * height * 2, i = .022 * height + (o - a) / 2;
                $(".alert .mainPart").css("height", n + "px"), $(".alert .mainPart").css("margin-top", "-" + n / 2 + "px"), $(".alert .mainPart .backImg .blackImg").css("height", o + "px"), $(".alert .mainPart .alertText").css("top", i + "px")
            }, 0)
        },
        clickCloseAlert: function () {
            appData.isShowAlert = false;
            if (appData.alertType == 22) {
                appData.isShowGameAlert = false;
                httpModule.getInfo();
            } else {
                appData.isShowGameAlert = false;
                appData.isShowAlert = false;
            }
        },
        clickSitDown: function (e) {
            var isRepeat = repeat('SitDown');
            if (isRepeat) {
                methods.showResultTextFunc('请不要连续点击');
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
        clickTipsCards: function (e) {

            var picked_cards = appData.card_tip_one;
            for (var i = 0; i < appData.player[0].card.length; i++) {
                appData.player[0].card[i].isGroup = !1;
                appData.player[0].is_GroupCard = !1;
                appData.isShowTipBull = false;
                $(".myCards .card" + i).css({top: 0});
            }
            socketModule.sendTipsCards(picked_cards);
            if (localStorage.messageMusic == 1) {
                methods.clickVoice();
            }
        },
        // 换座
        clickSwapSeat: function (e) {
            socketModule.sendSwapSeat(e);
            if (localStorage.messageMusic == 1) {
                methods.clickVoice();
            }
        }, clickReady: function () {
            socketModule.sendReadyStart(), appData.player[0].is_operation = !0
        },
        reDeal: function () {
            appData.isDealing || (appData.isDealing = !0, m4aAudioPlay("audio1"), appData.game.cardDeal = 1, setTimeout(function () {
                appData.game.cardDeal = 2, m4aAudioPlay("audio1"), setTimeout(function () {
                    appData.game.cardDeal = 3, m4aAudioPlay("audio1"), setTimeout(function () {
                        appData.game.cardDeal = 4, m4aAudioPlay("audio1"), setTimeout(function () {
                            appData.game.cardDeal = 5, setTimeout(function () {
                                appData.isDealing = !1, viewMethods.resetMyAccountStatus(), appData.showClockRobText = !0, 5 == appData.ruleInfo.banker_mode && 1 == appData.game.round && viewMethods.updateAllPlayerStatus()
                            }, 150)
                        }, 10)
                    }, 10)
                }, 10)
            }, 10))
        },
        resetMyAccountStatus: function () {
            if (6 != appData.player[0].account_status || appData.isFinishBankerAnimate) {
                viewMethods.resetShowButton();
                if (3 == appData.player[0].account_status) {
                    appData.showRob = !0;
                } else if (4 == appData.player[0].account_status) {
                    appData.showNotRobText = !0
                } else if (5 == appData.player[0].account_status) {
                    appData.showRobText = !0;
                } else if (6 == appData.player[0].account_status) {
                    if (1 == appData.player[0].is_banker) {
                        appData.showBankerCoinText = !0;
                        appData.player[0].is_showCard = !0;
                    } else if (appData.isFinishBankerAnimate) {
                        appData.showTimesCoin = !0;
                        appData.player[0].is_showCard = !0;
                    }
                } else if (7 == appData.player[0].account_status) {
                    appData.player[0].is_showCard = !0;
                    viewMethods.seeMyCard()
                } else if (8 == appData.player[0].account_status) {
                    appData.player[0].is_showCard = !1;
                    appData.player[0].is_GroupCard = !0;
                    appData.player[0].open_left = !0;
                    appData.player[0].open_right = !0;
                    setTimeout(function () {
                        $(".memberBullWin111").fadeIn(300);
                        $(".memberBullWin122").fadeIn(300)
                    }, 1e3)
                } else if (9 == appData.player[0].account_status) {
                    appData.player[0].open_left = !0;
                    appData.player[0].open_right = !0;
                    setTimeout(function () {
                        $(".memberBullWin111").fadeIn(300);
                        $(".memberBullWin122").fadeIn(300);
                    }, 1e3)
                }

            }
        },
        updateAllPlayerStatus: function () {
            for (var e = 0; e < appData.player.length; e++) {
                4 == appData.player[e].account_status ?
                    appData.player[e].robImg = globalData.fileUrl + "files/images/bull/text_notrob.png" :
                    5 == appData.player[e].account_status ?
                        appData.player[e].robImg = globalData.fileUrl + "files/images/bull/text_rob.png" :
                        6 == appData.player[e].account_status ? appData.player[e].is_showCard = !0 :
                            7 == appData.player[e].account_status ? (appData.player[e].is_showCard = !0, 0 == e && viewMethods.seeMyCard()) :
                                8 == appData.player[e].account_status ?
                                    e > 0 && (appData.player[e].card_group_one = [-1, -1, -1, -1], appData.player[e].card_group_two = [-1, -1, -1, -1]) :
                                    9 == appData.player[e].account_status && (
                                        0 == e ?
                                            viewMethods.myCardOver() :
                                            viewMethods.cardOver(appData.player[e].num, appData.player[e].account_status)
                                    ),
                appData.player[e].multiples > 0 && (appData.player[e].timesImg = globalData.fileUrl + "fiesc/images/bull_yh/text_times" + appData.player[e].multiples + ".png"),
                appData.player[e].bankerMultiples > 0 && (appData.player[e].bankerTimesImg = globalData.fileUrl + "fiesc/images/bull_yh/text_times" + appData.player[e].bankerMultiples + ".png");
                if (appData.player[e].card_type_one >= 1) {
                    var t = 0,
                        a = parseInt(appData.player[e].card_type_one);
                    t = appData.player[e].combo_point_one;
                    if (a > 1) {
                        t = "type" + a;
                    } else if (1 == a) {
                        t = "point" + t;
                    }
                    if (globalData.p_type == 2) {
                        appData.player[e].bullImgLeft = globalData.fileUrl + "files/images/paijiu_xy/" + t + ".png";
                        appData.player[e].bullImgLeftLose = globalData.fileUrl + "files/images/paijiuD_xy/" + t + ".png";
                    } else {
                        appData.player[e].bullImgLeft = globalData.fileUrl + "files/images/paijiu/" + t + ".png";
                        appData.player[e].bullImgLeftLose = globalData.fileUrl + "files/images/paijiuD/" + t + ".png";
                    }

                }
                if (appData.player[e].card_type_two >= 1) {
                    var n = 0, o = parseInt(appData.player[e].card_type_two);
                    n = appData.player[e].combo_point_two;
                    if (o > 1) {
                        n = "type" + o;
                    } else if (1 == o) {
                        n = "point" + n;

                    }
                    if (globalData.p_type == 2) {
                        appData.player[e].bullImgRight = globalData.fileUrl + "files/images/paijiu_xy/" + n + ".png";
                        appData.player[e].bullImgRightLose = globalData.fileUrl + "files/images/paijiuD_xy/" + n + ".png";
                    } else {
                        appData.player[e].bullImgRight = globalData.fileUrl + "files/images/paijiu/" + n + ".png";
                        appData.player[e].bullImgRightLose = globalData.fileUrl + "files/images/paijiuD/" + n + ".png";
                    }
                }
            }
        },
        resetShowButton: function () {
            appData.showTimesCoin = !1, appData.showRob = !1, appData.showNotRobText = !1, appData.showRobText = !1, appData.showBankerCoinText = !1
        },
        seeMyCard: function () {
            if (appData.player[0].account_id != userData.account_id) return; //观战功能
            2 == appData.ruleInfo.banker_mode ? (
                appData.player[0].is_showCard || (appData.player[0].is_showCard = !0),
                    setTimeout(function () {
                        $(".myCards .card0,.myCards .card1").addClass("card-flipped"),
                        7 == appData.player[0].account_status && (
                            $(".myCards .card2,.myCards .card3").addClass("card-flipped"),
                                setTimeout(function () {
                                    appData.showShowGroupCards = !0
                                }, 550)
                        )
                    }, 450)
            ) : setTimeout(function () {
                $(".myCards .card0").addClass("card-flipped"),
                    setTimeout(function () {
                        appData.clickCard4 || (appData.showShowGroupCards = !0)
                    }, 500)
            }, 350)
        }
        ,
        seeMyCard4: function (e) {
            if (appData.player[0].account_id != userData.account_id) return; //观战功能
            appData.isShowTipBull = false;
            appData.player[0].account_status >= 7 && (
                appData.showShowGroupCards = !0,
                    appData.showClickShowCard = !1,
                    appData.player[0].card[e].isGroup ? (
                        $(".myCards .card" + e).css({top: 0}),
                            setTimeout(function () {
                                appData.player[0].card[e].isGroup = !1
                            }, 100),
                            appData.groupNUm--
                    ) : (
                        $(".myCards .card" + e).css({top: "-3vh"}),
                            setTimeout(function () {
                                appData.player[0].card[e].isGroup = !0
                            }, 100),
                            appData.groupNUm++
                    ),
                    2 == appData.groupNUm ? appData.player[0].is_GroupCard = !0 : appData.player[0].is_GroupCard = !1)
        }
        ,
        myCardOver: function () {
            $(".myCards .card").removeClass("card-flipped")
        }
        ,
        cardOver: function (e, a) {
            e <= 1 || a >= 9 && (
                appData.player[e - 1].open_right = !0,
                    setTimeout(function () {
                        $(".cardOver .cardSet" + e + "31").addClass("card-flipped"),
                            $(".cardOver .cardSet" + e + "41").addClass("card-flipped"),
                            setTimeout(function () {
                                $(".memberBullWin" + e + "22").fadeIn(300)
                            }, 1e3)
                    }, 800)
            )
        }
        ,
        gameOverNew: function (e, t) {
            // for (o = 0; o < appData.playerBoard.score.length; o++)
            //     appData.playerBoard.score[o].num = 0,
            //         appData.playerBoard.score[o].account_id = 0,
            //         appData.playerBoard.score[o].nickname = "",
            //         appData.playerBoard.score[o].account_score = 0,
            //         appData.playerBoard.score[o].isBigWinner = 0,
            //         appData.playerBoard.score[o].account_code = "";
            for (o = 0; o < globalData.maxCount; o++) {
                for (s in e) {
                    if (appData.player[o].account_id == s) {
                        appData.player[o].account_score = Math.ceil(e[s])
                    }
                }

            }

            var a = new Date, n = "";
            n += a.getFullYear() + "-", n += a.getMonth() + 1 + "-", n += a.getDate() + "  ", n += a.getHours() + ":",
                a.getMinutes() >= 10 ? n += a.getMinutes() : n += "0" + a.getMinutes(),
                appData.playerBoard.record = n;
            // void 0 != t && "-1" != t && socketModule.processBalanceScoreboard(t);
            for (var o = 0; o < globalData.maxCount; o++) {
                var i = appData.player[o].num;
                appData.player[o].is_banker ?
                    o > 0 ? (
                        $(".cardOver .cardSet" + i + "11").removeClass("card-flipped"),
                            $(".cardOver .cardSet" + i + "21").removeClass("card-flipped"),
                            $(".cardOver .cardSet" + i + "11").removeClass("boxShadow3"),
                            $(".cardOver .cardSet" + i + "21").removeClass("boxShadow3")
                    ) : (
                        $(".myCards .level1").removeClass("boxShadow3"),
                            $(".myCards .level2").removeClass("boxShadow3")
                    ) :
                    o > 0 ? (
                        $(".cardOver .cardSet" + i + "11").removeClass("card-flipped"),
                            $(".cardOver .cardSet" + i + "21").removeClass("card-flipped"),
                            $(".cardOver .cardSet" + i + "11").removeClass("boxShadow1"),
                            $(".cardOver .cardSet" + i + "21").removeClass("boxShadow1"),
                            $(".cardOver .cardSet" + i + "11").removeClass("boxShadow2"),
                            $(".cardOver .cardSet" + i + "21").removeClass("boxShadow2")
                    ) : (
                        $(".myCards .level1").removeClass("boxShadow1"),
                            $(".myCards .level2").removeClass("boxShadow1"),
                            $(".myCards .level1").addClass("boxShadow2"),
                            $(".myCards .level2").addClass("boxShadow2")
                    ),
                    $(".memberBullWin" + i + "11").fadeOut(100),
                    $(".memberBullLose" + i + "11").fadeOut(100),
                    $(".memberBullWin" + i + "22").fadeOut(100),
                    $(".memberBullLose" + i + "22").fadeOut(100),
                    appData.player[o].playing_status = 0,
                    appData.player[o].is_win = !1,
                    appData.player[o].is_operation = !1,
                    appData.player[o].win_type = 0,
                    appData.player[o].win_show = !1,
                    appData.player[o].card = new Array,
                    appData.player[o].card_type = 0,
                    appData.player[o].is_showCard = !1,
                    appData.player[o].is_GroupCard = !1,
                    appData.player[o].is_readyPK = !1,
                    appData.player[o].is_pk = !1,
                    appData.player[o].is_banker = !1,
                    appData.player[o].multiples = 0,
                    appData.player[o].bankerMultiples = 0,
                    appData.player[o].card_group_one = new Array,
                    appData.player[o].card_group_two = new Array,
                    appData.player[o].combo_point_one = 0,
                    appData.player[o].combo_point_two = 0,
                    appData.player[o].open_left = !1,
                    appData.player[o].open_right = !1,
                    appData.player[o].gtBankerOne = 0,
                    appData.player[o].gtBankerTwo = 0,
                    appData.player[o].card_type_one = 0,
                    appData.player[o].card_type_two = 0,
                    appData.player[o].bullImgLeft = "",
                    appData.player[o].bullImgRight = "",
                    appData.player[o].bullImgLeftLose = "",
                    appData.player[o].bullImgRightLose = ""
            }
            appData.game.can_open = 0,
                appData.game.cardDeal = 0,
                appData.game.status = 1,
                appData.player[0].is_showCard = !1,
                appData.player[0].is_GroupCard = !1,
                appData.showClockRobText = !1,
                appData.showClockBetText = !1,
                appData.showClockShowCard = !1,
                appData.showClockGroupCard = !1,
                appData.groupNUm = 0
        }
        ,

        showAllCards: function (e) {
            var bankerNum = 0;
            for (var t = 0; t < globalData.maxCount; t++)
                !function (e) {
                    var t = appData.player[e].num;

                    if (appData.player[e].is_banker) {
                        bankerNum = e + 1;

                        if (e > 0) {
                            $(".cardOver .cardSet" + t + "31").addClass("boxShadow3");
                            $(".cardOver .cardSet" + t + "41").addClass("boxShadow3");
                            setTimeout(function () {
                                $(".cardOver .cardSet" + t + "31").removeClass("boxShadow3");
                                $(".cardOver .cardSet" + t + "41").removeClass("boxShadow3");
                                $(".cardOver .cardSet" + t + "11").addClass("card-flipped");
                                $(".cardOver .cardSet" + t + "21").addClass("card-flipped");
                                if (appData.player[e].account_status > 2 && appData.player[e].account_status < 10) {
                                    appData.player[e].open_left = !0;
                                    setTimeout(function () {
                                        $(".memberBullWin" + t + "11").fadeIn(300)
                                    }, 500)
                                }

                            }, 500);
                            setTimeout(function () {
                                $(".cardOver .cardSet" + t + "11").addClass("boxShadow3");
                                $(".cardOver .cardSet" + t + "21").addClass("boxShadow3")
                            }, 1000)
                        } else {
                            $(".myCards .levelCard3").addClass("boxShadow3");
                            $(".myCards .levelCard4").addClass("boxShadow3");
                            setTimeout(function () {
                                $(".myCards .levelCard3").removeClass("boxShadow3");
                                $(".myCards .levelCard4").removeClass("boxShadow3");
                                $(".myCards .levelCard1").addClass("boxShadow3");
                                $(".myCards .levelCard2").addClass("boxShadow3")
                            }, 1000)
                        }
                    } else {
                        if (e > 0) {
                            if (appData.player[e].gtBankerTwo >= 1) {
                                $(".cardOver .cardSet" + t + "31").addClass("boxShadow2");
                                $(".cardOver .cardSet" + t + "41").addClass("boxShadow2");
                            } else {
                                $(".cardOver .cardSet" + t + "31").addClass("boxShadow1");
                                $(".cardOver .cardSet" + t + "41").addClass("boxShadow1");
                                setTimeout(function () {
                                    $(".memberBullWin" + t + "22").fadeOut(300);
                                    if (appData.player[e].account_status > 2 && appData.player[e].account_status < 10) {
                                        $(".memberBullLose" + t + "22").fadeIn(200)
                                    }
                                }, 1000)
                            }

                            setTimeout(function () {
                                if (appData.player[e].gtBankerTwo >= 1) {
                                    $(".cardOver .cardSet" + t + "31").removeClass("boxShadow2");
                                    $(".cardOver .cardSet" + t + "41").removeClass("boxShadow2")
                                } else {
                                    $(".cardOver .cardSet" + t + "31").removeClass("boxShadow1");
                                    $(".cardOver .cardSet" + t + "41").removeClass("boxShadow1")
                                }

                                $(".cardOver .cardSet" + t + "11").addClass("card-flipped");
                                $(".cardOver .cardSet" + t + "21").addClass("card-flipped");
                                if (appData.player[e].account_status > 2 && appData.player[e].account_status < 10) {
                                    appData.player[e].open_left = !0;
                                    setTimeout(function () {
                                        $(".memberBullWin" + t + "11").fadeIn(300)
                                    }, 500)
                                }

                            }, 1000);
                            setTimeout(function () {
                                if (appData.player[e].gtBankerOne >= 1) {
                                    $(".cardOver .cardSet" + t + "11").addClass("boxShadow2");
                                    $(".cardOver .cardSet" + t + "21").addClass("boxShadow2");
                                } else {
                                    $(".cardOver .cardSet" + t + "11").addClass("boxShadow1");
                                    $(".cardOver .cardSet" + t + "21").addClass("boxShadow1");
                                    setTimeout(function () {
                                        $(".memberBullWin" + t + "11").fadeOut(300);
                                        if (appData.player[e].account_status > 2 && appData.player[e].account_status < 10) {
                                            $(".memberBullLose" + t + "11").fadeIn(200);
                                        }
                                    }, 1000)
                                }

                            }, 1000)
                        } else {
                            if (appData.player[e].gtBankerTwo >= 1) {
                                $(".myCards .levelCard3").addClass("boxShadow2");
                                $(".myCards .levelCard4").addClass("boxShadow2");
                            } else {
                                $(".myCards .levelCard3").addClass("boxShadow1");
                                $(".myCards .levelCard4").addClass("boxShadow1");
                                setTimeout(function () {
                                    $(".memberBullWin" + t + "22").fadeOut(300);
                                    appData.player[e].account_status > 2 && appData.player[e].account_status < 10 && $(".memberBullLose" + t + "22").fadeIn(200)
                                }, 1000)
                            }

                            setTimeout(function () {
                                if (appData.player[e].gtBankerTwo >= 1) {
                                    $(".myCards .levelCard3").removeClass("boxShadow2");
                                    $(".myCards .levelCard4").removeClass("boxShadow2");
                                    $(".memberBullWin" + bankerNum + "22").fadeOut(300);
                                    $(".memberBullLose" + bankerNum + "22").fadeIn(200);
                                } else {
                                    $(".myCards .levelCard3").removeClass("boxShadow1");
                                    $(".myCards .levelCard4").removeClass("boxShadow1");
                                }
                                if (appData.player[e].gtBankerOne >= 1) {
                                    $(".myCards .levelCard1").addClass("boxShadow2");
                                    $(".myCards .levelCard2").addClass("boxShadow2");

                                    setTimeout(function () {
                                        $(".memberBullWin" + bankerNum + "11").fadeOut(300);
                                        $(".memberBullLose" + bankerNum + "11").fadeIn(200)
                                    }, 1000)
                                } else {
                                    $(".myCards .levelCard1").addClass("boxShadow1");
                                    $(".myCards .levelCard2").addClass("boxShadow1");
                                    setTimeout(function () {
                                        $(".memberBullWin" + t + "11").fadeOut(300);
                                        if (appData.player[e].account_status > 2 && appData.player[e].account_status < 10) {
                                            $(".memberBullLose" + t + "11").fadeIn(200)
                                        }
                                    }, 1000)
                                }

                            }, 1000)
                        }
                    }
                }(t)
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
        }
        ,
        messageSay: function (e, t) {
            appData.player[e].messageOn = !0, appData.player[e].messageText = appData.message[t].text, setTimeout(function () {
                appData.player[e].messageOn = !1
            }, 2500)
        }
        ,
        closeEnd: function () {
        }
        ,
        roundEnd: function () {
            // appData.gameover = true;
            // $("#loading").show();
            // socketModule.getScoreBoard();
            DynLoading.goto('dpj' + globalData.maxCount, 'i=' + globalData.roomNumber);
        },
        timeCountDown: function () {
            if (1 != isTimeLimitShow) return appData.game.time <= 0 ? (isTimeLimitShow = !1, 0) : (isTimeLimitShow = !0, appData.game.time--, void (timeLimit = setTimeout(function () {
                isTimeLimitShow = !1, viewMethods.timeCountDown()
            }, 1e3)))
        }
        ,
        timeCountDown2: function () {
            if (1 != isTimeLimitShow) return appData.game.time <= 0 ? (isTimeLimitShow = !1, 0) : (isTimeLimitShow = !0, appData.game.time--, void (timeLimit = setTimeout(function () {
                isTimeLimitShow = !1, viewMethods.timeCountDown2()
                if (appData.game.time == 0) {
                    appData.waitStart = false
                }
            }, 1e3)))
        }
        ,
        clickRobBanker: function (e) {
            viewMethods.showRobBankerText(),
                socketModule.sendGrabBanker(e),
            2 == appData.ruleInfo.banker_mode && (
                appData.player[0].bankerMultiples = e,
                appData.player[0].bankerMultiples > 0 && (
                    appData.player[0].bankerTimesImg = globalData.fileUrl + "fiesc/images/bull_yh/text_times" + appData.player[0].bankerMultiples + ".png"
                )
            ),
                setTimeout(function () {
                    mp3AudioPlay("audioRobBanker")
                }, 10)
        }
        ,
        showRobBankerText: function () {
            appData.showTimesCoin = !1, appData.showRob = !1, appData.showNotRobText = !1, appData.showRobText = !0, appData.showBankerCoinText = !1
        }
        ,
        showNotRobBankerTextFnc: function () {
            appData.showTimesCoin = !1, appData.showRob = !1, appData.showNotRobText = !0, appData.showRobText = !1, appData.showBankerCoinText = !1
        }
        ,
        clickNotRobBanker: function () {
            viewMethods.showNotRobBankerTextFnc(), socketModule.sendNotGrabBanker(), setTimeout(function () {
                mp3AudioPlay("audioNoBanker")
            }, 10)
        }
        ,
        clickSelectTimesCoin: function (e) {
            appData.player[0].multiples = e,
                appData.showTimesCoin = !1,
            appData.player[0].multiples > 0 && (
                appData.player[0].timesImg = globalData.fileUrl + "fiesc/images/bull_yh/text_times" + appData.player[0].multiples + ".png"
            ),
                socketModule.sendPlayerMultiples(e),
                setTimeout(function () {
                    mp3AudioPlay("audioTimes" + e)
                }, 50)
        },
        clickGroupCards: function () {
            if (console.log(appData.player[0].is_GroupCard, "is_GroupCard"), appData.player[0].is_GroupCard) {
                appData.showShowGroupCards = !1;
                var e = new Array;
                appData.player[0].card.forEach(function (t) {
                    1 == t.isGroup && e.push(t.cardValue)
                }),
                    socketModule.sendGroupCard(e);
                if (localStorage.messageMusic == 1) {
                    methods.clickVoice();
                }
            }
        },
        clickGroup: function (e) {
            console.log(e, "牌的号码")
        },
        clearBanker: function () {
            for (var e = 0; e < appData.player.length; e++)
                appData.player[e].is_banker = !1;
            appData.isFinishBankerAnimate = !1;
            var t = 2 * appData.bankerArray.length;
            if (appData.bankerArray.length < 6) {
                appData.bankerAnimateDuration = parseInt(600 / t);
            } else {
                appData.bankerAnimateDuration = parseInt(1600 / t)
            }
        }
        ,
        robBankerWithoutAnimate: function (e) {
            for (var e = 0; e < appData.player.length; e++) appData.player[e].account_id == appData.bankerAccountId ? (appData.player[e].is_banker = !0, bankerNum = appData.player[e].num) : appData.player[e].is_banker = !1, $("#bankerAnimate" + appData.player[e].num).hide(), $("#bankerAnimate1" + appData.player[e].num).hide();
            setTimeout(function () {
                appData.showClockRobText = !1, appData.showClockBetText = !0, appData.isFinishBankerAnimate = !0, viewMethods.resetMyAccountStatus(), viewMethods.updateAllPlayerStatus()
            }, 10), appData.game.time = e.limit_time, appData.game.time > 0 && viewMethods.timeCountDown()
        }
        ,
        robBankerAnimate: function (e) {
            for (n = 0; n < appData.bankerArray.length; n++) {
                o = "#banker" + appData.bankerArray[n];
                $(o).hide()
            }
            var t = 2 * appData.bankerArray.length;
            if (appData.bankerAnimateCount >= t || appData.bankerAnimateIndex < 0 || appData.bankerArray.length < 2) {
                appData.bankerAnimateCount = 0,
                    appData.bankerAnimateIndex = -1;
                o = "#banker" + appData.bankerAccountId;
                $(o).show();
                for (var a = "", n = 0; n < appData.player.length; n++)
                    appData.player[n].account_id == appData.bankerAccountId ?
                        (appData.player[n].is_banker = !0, a = appData.player[n].num) :
                        appData.player[n].is_banker = !1,
                        $("#bankerAnimate" + appData.player[n].num).hide(),
                        $("#bankerAnimate1" + appData.player[n].num).hide();
                $(o).hide();
                $("#bankerAnimate" + a).css({top: "-0.1vh", left: "-0.1vh", width: "7.46vh", height: "7.46vh"}),
                    $("#bankerAnimate1" + a).css({top: "-1vh", left: "-1vh", width: "9.26vh", height: "9.26vh"}),
                    $("#bankerAnimate" + a).show(),
                    $("#bankerAnimate1" + a).show(),
                    $("#bankerAnimate1" + a).animate({
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
                    });
                $("#bankerAnimate" + a).animate({
                    top: "-1.5vh",
                    left: "-1.5vh",
                    width: "10.26vh",
                    height: "10.26vh"
                }, 100, function () {
                    $("#bankerAnimate" + a).animate({
                        top: "-0.1vh",
                        left: "-0.1vh",
                        width: "7.46vh",
                        height: "7.46vh"
                    }, 100, function () {
                        $("#bankerAnimate" + a).hide(),
                            setTimeout(function () {
                                appData.showClockRobText = !1;
                                appData.showClockBetText = !0;
                                appData.isFinishBankerAnimate = !0;
                                viewMethods.resetMyAccountStatus(),
                                    viewMethods.updateAllPlayerStatus()
                            }, 10),
                            appData.game.time = e.limit_time,
                            // appData.game.time = Math.ceil(e.limit_time)+1,
                        appData.game.time > 0 && viewMethods.timeCountDown()
                    })
                });
                return;
            }
            var o = "#banker" + appData.bankerArray[appData.bankerAnimateIndex];
            $(o).show(), appData.lastBankerImgId = o, appData.bankerAnimateCount++, appData.bankerAnimateIndex++,
            appData.bankerAnimateIndex >= appData.bankerArray.length && (appData.bankerAnimateIndex = 0),
                setTimeout(function () {
                    viewMethods.robBankerAnimate(e)
                }, appData.bankerAnimateDuration)
        }
        ,
        showMemberScore: function (isShow) {
            if (isShow) {
                $(".memberScoreText").show();
            } else {
                $(".memberScoreText").hide();
            }
        }
        ,
        winAnimate: function (e) {
            appData.isFinishWinAnimate = !1;
            var winnerNums = new Array;
            var loserNums = new Array;
            var tieNums = new Array;

            appData.bankerPlayerNum = appData.bankerPlayer.num;

            for (var h = 0; h < e.data.winner_array.length; h++)
                for (var f = 0; f < appData.player.length; f++)
                    if (e.data.winner_array[h].account_id == appData.player[f].account_id) {
                        if (appData.player[f].num == appData.bankerPlayer.num) {
                            appData.bankerPlayerNum = appData.player[f].num
                        } else {
                            winnerNums.push(appData.player[f].num)
                        }
                    }

            for (var m = 0; m < e.data.loser_array.length; m++) {
                for (var v = 0; v < appData.player.length; v++) {
                    if (e.data.loser_array[m].account_id == appData.player[v].account_id && appData.player[v].num != appData.bankerPlayerNum) {
                        loserNums.push(appData.player[v].num);
                    }
                }
            }


            for (var g = 0; g < e.data.tie_array.length; g++) {
                for (var D = 0; D < appData.player.length; D++) {
                    if (e.data.tie_array[g].account_id == appData.player[D].account_id && appData.player[D].num != appData.bankerPlayerNum) {
                        tieNums.push(appData.player[D].num);
                    }
                }
            }


            appData.isBankerKill = 0;
            viewMethods.resetCoinsPosition();
            $("#playerCoins").show();

            for (var i = 1; i <= globalData.maxCount; i++) {
                viewMethods.showCoins(i, false);
            }

            //把赢家玩家金币暂时放到庄家位置
            for (var i = 0; i < winnerNums.length; i++) {
                for (var j = 0; j < 5; j++) {
                    $(".memberCoin" + winnerNums[i] + j).css(memCoin[appData.bankerPlayerNum]);
                }
            }
            //显示输家金币
            for (var i = 0; i < loserNums.length; i++) {
                viewMethods.showCoins(loserNums[i], true);
            }
            //输家金币给庄家
            for (var i = 0; i < loserNums.length; i++) {
                for (var j = 0; j < 8; j++) {
                    $(".memberCoin" + loserNums[i] + j).animate(memCoin[appData.bankerPlayerNum], 10 + 120 * j);
                }
                setTimeout(function () {
                    mp3AudioPlay("audioCoin", appData.player[0].sex);
                }, 10);
            }
            var winnerTime = 100;
            var totalTime = 100;
            if (loserNums.length >= 1) {
                winnerTime = 1000;
                if (winnerNums.length >= 1) {
                    totalTime = 1800;
                } else {
                    totalTime = 1000;
                }
            } else {
                if (winnerNums.length >= 1) {
                    totalTime = 1000;
                }
            }

            if (winnerNums.length >= 1) {
                setTimeout(function () {
                    //显示赢家金币
                    // for (var i = 0; i < loserNums.length; i++) {
                    //     viewMethods.showCoins(loserNums[i], false);
                    // }
                    for (var i = 0; i < winnerNums.length; i++) {
                        viewMethods.showCoins(winnerNums[i], true);
                    }
                    for (var i = 0; i < winnerNums.length; i++) {
                        for (var j = 0; j < 5; j++) {
                            $(".memberCoin" + winnerNums[i] + j).animate(memCoin[winnerNums[i]], 10 + 120 * j);
                        }
                    }
                    setTimeout(function () {
                        mp3AudioPlay("audioCoin", appData.player[0].sex);
                    }, 10);
                }, 100);
                setTimeout(function () {
                    viewMethods.finishWinAnimate(e);
                }, totalTime);
            } else {
                setTimeout(function () {
                    viewMethods.finishWinAnimate(e);
                }, totalTime);
            }
        }
        ,
        finishWinAnimate: function (e) {
            $("#playerCoins").hide(),
                appData.game.show_card = !1,
                appData.game.show_score = !0,
                appData.isOverCards = !1,
                $(".memberScoreText").fadeIn(200, function () {
                    if (5 == appData.ruleInfo.banker_mode) {
                        if (1 != appData.isBreak) {
                            viewMethods.gameOverNew(e.data.score_board, e.data.balance_scoreboard);
                        } else {

                        }
                    } else {
                        viewMethods.gameOverNew(e.data.score_board, e.data.balance_scoreboard);
                    }

                    setTimeout(function () {
                        $(".memberScoreText").fadeOut(300, function () {
                            if (5 == appData.ruleInfo.banker_mode && 1 == appData.isBreak) appData.overType = 2, setTimeout(function () {
                                viewMethods.clickShowAlert(9, "庄家分数不足，提前下庄，点击确定查看结算")
                            }, 500); else for (var e = 0; e < globalData.maxCount; e++) appData.player[e].account_status >= 6 && 5 != ruleInfo.banker_mode && (appData.player[e].is_banker = !1), 2 != appData.player[e].account_status && 0 != appData.player[e].account_status && (appData.player[e].account_status = 1)
                        })
                    }, 500), appData.isFinishWinAnimate = !0, 5 != appData.ruleInfo.banker_mode ? e.data.total_num == e.data.game_num && setTimeout(function () {
                        newNum = e.data.room_number
                    }, 500) : 1 == appData.isBreak || e.data.total_num == e.data.game_num && setTimeout(function () {
                        newNum = e.data.room_number
                    }, 500)
                })
            appData.showWatchButton = appData.isWatching != 1;
            appData.showSitdownButton = appData.isWatching;
            if (e.data.total_num == e.data.game_num) {
                viewMethods.roundEnd();
            } else {
                // 自动准备
                setTimeout(function () {
                    if (appData.isAutoReady == 1 && appData.isWatching != 1) {
                        viewMethods.clickReady()
                    }
                }, 1500)
            }

        },
        resetCoinsPosition: function () {
            for (var i = 1; i <= globalData.maxCount; i++) {
                for (var j = 0; j < 8; j++) {
                    $(".memberCoin" + i + j).css(memCoin[i]);
                }
            }
        }
        ,
        showCoins: function (e, t) {
            if (t)
                for (a = 0; a < 8; a++)
                    $(".memberCoin" + e + a).show();
            else for (var a = 0; a < 8; a++)
                $(".memberCoin" + e + a).hide()
        }
        ,
    }
;
var width = window.innerWidth,
    height = window.innerHeight,
    numD = 0, isTimeLimitShow = !1;
var timesOffset = (.9 * width - .088 * height * 4 - .02 * width * 3) / 2;


var r = width - .06 * height + "px",
    l = .045 * height + "px",
    o = .045 * height + "px";


if (globalData.maxCount == 8) {
    var memCoin = [
        {},
        {'top': '82%', 'left': o},
        {top: '59%', left: r},
        {top: '43%', left: r},
        {top: '28%', left: r},
        {top: '10%', left: '50%'},
        {top: '28%', left: l},
        {top: '43%', left: l},
        {top: '59%', left: l}
    ];
} else if (globalData.maxCount == 10) {
    var memCoin = [
        {},
        {'top': '84%', 'left': '4.5vh'},
        {'top': '52%', left: r},
        {'top': '40%', left: r},
        {'top': '28%', left: r},
        {'top': '16%', left: r},
        {'top': '10%', 'left': '44.5vw'},
        {'top': '16%', left: l},
        {'top': '28%', left: l},
        {'top': '40%', left: l},
        {'top': '52%', left: l},
    ];
} else if (globalData.maxCount == 12) {
    var memCoin = [
        {},
        {'top': '84%', 'left': '4.5vh'},
        {'top': '64%', left: r},
        {'top': '52%', left: r},
        {'top': '40%', left: r},
        {'top': '28%', left: r},
        {'top': '16%', left: r},
        {'top': '10%', 'left': '44.5vw'},
        {'top': '16%', left: l},
        {'top': '28%', left: l},
        {'top': '40%', left: l},
        {'top': '52%', left: l},
        {'top': '64%', left: l}
    ];
} else if (globalData.maxCount == 16) {
    var memCoin = [
        {},
        {'top': '82%', 'left': '4.5vh'},
        {'top': '68%', 'left': '89.5vw'},
        {'top': '59%', 'left': '89.5vw'},
        {'top': '49%', 'left': '89.5vw'},
        {'top': '40%', 'left': '89.5vw'},
        {'top': '30%', 'left': '89.5vw'},
        {'top': '20%', 'left': '89.5vw'},
        {'top': '10%', 'left': '89.5vw'},
        {'top': '8%', 'left': '44.5vw'},
        {'top': '10%', left: l},
        {'top': '20%', left: l},
        {'top': '30%', left: l},
        {'top': '40%', left: l},
        {'top': '49%', left: l},
        {'top': '59%', left: l},
        {'top': '68%', left: l},
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
        left: timesOffset - (.088 * height / 2) + (timesOffset / 2) + "px",
        width: .088 * height + "px",
        height: .088 * height / 2 + "px",
        "line-height": .088 * height / 2 + "px",
        "text-align": "center",
    },
    times2: {
        position: "absolute",
        top: (.11 * height - .088 * height / 2) / 2 + "px",
        left: timesOffset + .02 * width + .088 * height - (.088 * height / 2) + (timesOffset / 2) + "px",
        width: .088 * height + "px",
        height: .088 * height / 2 + "px",
        "line-height": .088 * height / 2 + "px",
        "text-align": "center",
    },
    times3: {
        position: "absolute",
        top: (.11 * height - .088 * height / 2) / 2 + "px",
        left: timesOffset + .02 * width * 2 + .088 * height * 2 - (.088 * height / 2) + (timesOffset / 2) + "px",
        width: .088 * height + "px",
        height: .088 * height / 2 + "px",
        "line-height": .088 * height / 2 + "px",
        "text-align": "center",
    },
    times4: {
        position: "absolute",
        top: (.11 * height - .088 * height / 2) / 2 + "px",
        left: timesOffset + .02 * width * 3 + .088 * height * 3 - (.088 * height / 2) + (timesOffset / 2) + "px",
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
}
var ruleInfo = {
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
    special_card: 1,
};
var editAudioInfo = {
        isShow: !1,
        backMusic: 1,
        messageMusic: 1
    },
    audioInfo = {
        backMusic: 1,
        messageMusic: 1
    };
if (localStorage.backMusic) {
    editAudioInfo.backMusic = localStorage.backMusic,
        audioInfo.backMusic = localStorage.backMusic;
} else {
    localStorage.backMusic = 1;
}
if (localStorage.messageMusic) {
    editAudioInfo.messageMusic = localStorage.messageMusic,
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

// // 自动续局
// var showNextRoom = false
// if (localStorage.newRoom != undefined) {
//     var nextRoomInfo = JSON.parse(localStorage.newRoom)
//     if (nextRoomInfo.oldRoomNumber == globalData.roomNumber) {
//         showNextRoom = true;
//     } else {
//         showNextRoom = false;
//     }
// }
var loadingTimer = null;
var appData = {
    isShowLoading: true,
    loadingNum: 1,
    showNextRoom: false,// 自动续局
    newRoomNumber: 0,// 自动续局
    newRoomInfo: '',
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
    showRobText2: false,
    isAutoReady: setReady, //自动准备
    'isShowNewMessage': false,
    'isShowGameAlert': false,
    room_users: '',
    'musicOnce': true,
    isWatching: 1,
    guests: [],
    showGuest: 0,
    showSitdownButton: 0,
    showWatchButton: 1,
    joinType: 0,
    isShowIndiv: false,
    'isShowIndividuality': false,
    'isShowIndividualityError': false,
    'individuality': userData.individuality,
    'inputIndiv': '',
    'isShowIndivConfirm': false,
    // 'individuality':  '',
    'individualityError': "",
    'isShowHomeAlert': false,
    'userData': userData,
    'isShowAlertTip': false,
    'alertTipText': "",
    'alertTipType': 1,
    isShowAlertB: !1,
    alertTextB: "",
    alertTypeB: 1,
    isOverCards: !1,
    viewStyle: viewStyle,
    roomStatus: globalData.roomStatus,
    width: window.innerWidth,
    height: window.innerHeight,
    roomCard: Math.ceil(globalData.card),
    is_connect: !1,
    player: [],
    scoreboard: "",
    isShowAlert: !1,
    isShowNotClubMember: !1,
    isShowMessage: !1,
    alertType: 0,
    alertText: "",
    showRob: !1,
    showShowGroupCards: !1,
    showRobText: !1,
    showNotRobText: !1,
    showClockRobText: !1,
    showClockBetText: !1,
    showClockShowCard: !1,
    showClockGroupCard: !1,
    showTimesCoin: !1,
    showBankerCoinText: !1,
    clickCard4: !1,
    base_score: 0,
    playerBoard: {score: new Array, round: 0, record: ""},
    game: game,
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
    //coinList:coinList,
    isShowNoteImg: !1,
    groupNUm: 0,
    checkOne: false,
    ownerUser: {
        nickname: "",
        avatar: "",
        user_code: 0
    },
    add_user: false,
    applyStatus: 0, //0尚未申请  1加好友申请中,
    tipTypeLeft: '',//组排提示牌型
    tipTypeRight: '',//组排提示牌型
    isShowTipBull: false,
    guestNotShowBullImg: true,
    card_tip_one: '',
    isShowGiftBox: false, //礼物
    giftToolsList: [],
    isShowBuyTools: false,
    buyToolsId: 0,
    skin_expire_type: 1,
    buyToolsName: '',
    opAccountInfo: {
        'sex': 1
    },
    showOnceIndiv: false,
    isShowTipsText: false,
    tipsText: "",
    gameover: false,
    isShowRefesh: false
};

if (void 0 != globalData.isNotyMsg && null != globalData.isNotyMsg) {
    appData.notyMsg = globalData.notyMsg;
    if (1 == globalData.isNotyMsg) {
        appData.isShowNoty = !0,
            setTimeout(function () {
                appData.isShowNoty = !1
            }, 1e3 * globalData.notyTime)
    }
} else {
    globalData.isNotyMsg = 0
}

var newGame = function newGame() {
    appData.game.round = 0;
    appData.game.status = 1;
    appData.game.cardDeal = 0;
    appData.game.show_card = !1;
    appData.game.show_score = false;
    clearInterval(appData.heartbeat);
    appData.socketStatus = 0
    appData.heartbeat = null;
    globalData.roomStatus = "-1";
    appData.connectOrNot = true;
    appData.gameover = false;
}
var resetState = function () {
    appData.player = []
    appData.game.show_score = !1,
        appData.game.show_bettext = !1,
        appData.clickCard4 = !1,
        appData.game.show_card = !0;
    for (e = 0; e < globalData.maxCount; e++)
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
            card: [{cardValue: -1, isGroup: !1}, {cardValue: -1, isGroup: !1}, {
                cardValue: -1,
                isGroup: !1
            }, {cardValue: -1, isGroup: !1}],
            card_group_one: [],
            card_group_two: [],
            card_type_one: 0,
            card_type_two: 0,
            is_showCard: !1,
            is_GroupCard: !1,
            is_pk: !1,
            is_readyPK: !1,
            is_banker: !1,
            multiples: 0,
            bankerMultiples: 0,
            combo_point_one: 0,
            combo_point_two: 0,
            timesImg: "",
            bankerTimesImg: "",
            robImg: "",
            bullImgRight: "",
            bullImgRightLose: "",
            bullImgLeft: "",
            bullImgLeftLose: "",
            single_score: 0,
            messageOn: !1,
            messageText: "",
            coins: [],
            open_right: !1,
            open_left: !1,
            gtBankerOne: 0,
            gtBankerTwo: 0,
            head_kw: '',
            sex: 1,
            charm_val: 0,
            gift_num: 0
        }),
            appData.playerBoard.score.push({
                account_id: 0,
                nickname: "",
                account_score: 0,
                isBigWinner: 0
            });
    for (var e = 0; e < appData.player.length; e++) {
        appData.player[e].coins = [];
        for (var t = 0; t <= 7; t++)
            appData.player[e].coins.push("memberCoin" + appData.player[e].num + t)
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
            card_group_one: new Array,
            card_group_two: new Array,
            card_type_one: 0,
            card_type_two: 0,
            is_showCard: !1,
            is_GroupCard: !1,
            is_pk: !1,
            is_readyPK: !1,
            is_banker: !1,
            multiples: 0,
            bankerMultiples: 0,
            combo_point_one: 0,
            combo_point_two: 0,
            timesImg: "",
            bankerTimesImg: "",
            robImg: "",
            bullImgRight: "",
            bullImgRightLose: "",
            bullImgLeft: "",
            bullImgLeftLose: "",
            single_score: 0,
            messageOn: !1,
            messageText: "",
            coins: [],
            open_left: !1,
            open_right: !1,
            gtBankerOne: 0,
            gtBankerTwo: 0,
            is_audiobull: !1,
            head_kw: '',
            sex: 1,
            charm_val: 0,
            gift_num: 0
        });
    for (var e = 0; e < appData.player.length; e++) {
        appData.player[e].coins = [];
        for (var t = 0; t <= 7; t++)
            appData.player[e].coins.push("memberCoin" + appData.player[e].num + t)
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

    // var userDataStorage = localStorage.getItem('userData');
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

    if (obj.operation == 'getToolsList' || obj.operation == 'useTools' || obj.operation == 'buyTools') {
        giftFunc(obj);
    }

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
                viewMethods.clickShowAlert(23, obj.result_message);
                // appData.isShowRefesh=true;
                // appData.alertText=obj.result_message;
            } else {
                viewMethods.clickShowAlert(7, obj.result_message);
            }
        } else if (obj.operation == wsOperation.SwapSeat) {
            methods.showResultTextFunc(obj.result_message);
            methods.reloadView();
        } else if (obj.operation == "setIndividuality") {
            methods.showResultTextFunc('设置失败，请修改后再设置');
        } else if (obj.operation == wsOperation.RefreshRoom) {
            window.location.href = window.location.href;
        }
        if (obj.operation == wsOperation.TipsCards) {
            methods.showResultTextFunc(obj.result_message);
        }
        appData.player[0].is_operation = !1;

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
        } else if (obj.operation == wsOperation.Win) {
            socketModule.processWin(obj);
        } else if (obj.operation == wsOperation.autoCreateRoom) {
            socketModule.processAutoCreateRoom(obj);
        } else if (obj.operation == wsOperation.BroadcastVoice) {
            socketModule.processBroadcastVoice(obj);
        } else if (obj.operation == wsOperation.StartBet) {
            socketModule.processStartBet(obj);
        } else if (obj.operation == wsOperation.StartShow) {
            socketModule.processStartShow(obj);
        } else if (obj.operation == wsOperation.MyCards) {
            socketModule.processMyCards(obj);
        } else if (obj.operation == wsOperation.BreakRoom) {
            socketModule.processBreakRoom(obj);
        } else if (obj.operation == wsOperation.CombineCards) {
            socketModule.processCombineCards(obj);
        } else if (obj.operation == wsOperation.StartCombineCards) {
            socketModule.processStartCombineCards(obj);
        } else if (obj.operation == wsOperation.EndCombineCards) {
            socketModule.processEndCombineCards(obj);
        } else if (obj.operation == wsOperation.ShowCard) {
            socketModule.processShowCard(obj);
        } else if (obj.operation == wsOperation.GuestRoom) {
            socketModule.processGuestRoom(obj);
        } else if (obj.operation == wsOperation.AllGuestInfo) {
            socketModule.processAllGuestInfo(obj);
        } else if (obj.operation == wsOperation.UpdateGuestInfo) {
            socketModule.processUpdateGuestInfo(obj);
        } else if (obj.operation == wsOperation.SwapSeat) {
            socketModule.processSwapSeat(obj);
        } else if (obj.operation == wsOperation.TipsCards) {
            socketModule.processTipsCards(obj);
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
    logMessage("websocket onerror："), logMessage(e)
};
var reconnectSocket = function () {
    loadingTimer = setInterval(function () {
        appData.loadingNum++;
        if (appData.loadingNum == 11) {
            appData.loadingNum = 1;
        }
    }, 100);
    if (appData.isReconnect && 4 != globalData.roomStatus) {
        if (ws) {
            if (logMessage(ws.readyState), 1 == ws.readyState) return;
            ws = null
        }
        logMessage("reconnectSocket");
        connectSocket(globalData.socket, wsOpenCallback, wsMessageCallback, wsCloseCallback, wsErrorCallback);
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
    audioUrl: '',
    initModule: function (e) {
        this.audioUrl = e, this.audioBuffers = [],
            window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext, this.audioContext = new window.AudioContext
    },
    stopSound: function (e) {
        var t = this.audioBuffers[e];
        t && t.source && (t.source.stop(0), t.source = null)
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
    initSound: function (e, t) {
        this.audioContext.decodeAudioData(e, function (e) {
            audioModule.audioBuffers[t] = {name: t, buffer: e, source: null},
            "backMusic" == t && (audioModule.audioOn = !0, audioModule.playSound(t, !0))
        }, function (e) {
            logMessage("Error decoding file", e)
        })
    },
    loadAudioFile: function (e, t) {
        var a = new XMLHttpRequest;
        a.open("GET", e, !0),
            a.responseType = "arraybuffer",
            a.onload = function (e) {
                audioModule.initSound(a.response, t)
            },
            a.send()
    },
    loadAllAudioFile: function () {
        if (4 != globalData.roomStatus && 1 != isLoadAudioFile) {
            isLoadAudioFile = !0;
            if (globalData.p_type == 2) {
                this.loadAudioFile(this.audioUrl + "files/audio/paijiu/background_dy.mp3", "backMusic");
            } else {
                this.loadAudioFile(this.audioUrl + "files/audio/paijiuD/background3.mp3", "backMusic");
            }
            var e = ["robn.m4a", "rob.m4a", "point0.m4a", "point1.m4a", "point2.m4a", "point3.m4a", "point4.m4a", "point5.m4a", "point6.m4a", "point7.m4a", "point8.m4a", "point9.m4a", "type2.m4a", "type3.m4a", "type4.m4a", "type5.m4a", "type6.m4a", "type7.m4a", "type8.m4a", "type9.m4a", "type10.m4a", "type11.m4a", "type12.m4a", "type13.m4a", "type14.m4a", "type15.m4a", "type16.m4a", "type17.m4a", "type18.m4a", "type19.m4a", "type20.m4a", "type21.m4a", "type22.m4a", "type23.m4a", "time1.m4a", "time2.m4a", "time3.m4a", "time4.m4a", "time8.m4a", "time5.m4a", "time6.m4a", "time10.m4a", "time12.mp3", "audioCoin2.mp3", "audio2.m4a"];
            var t = ["audioNoBanker", "audioRobBanker", "point0", "point1", "point2", "point3", "point4", "point5", "point6", "point7", "point8", "point9", "type2", "type3", "type4", "type5", "type6", "type7", "type8", "type9", "type10", "type11", "type12", "type13", "type14", "type15", "type16", "type17", "type18", "type19", "type20", "type21", "type22", "type23", "audioTimes1", "audioTimes2", "audioTimes3", "audioTimes4", "audioTimes8", "audioTimes5", "audioTimes6", "audioTimes10", "audioTimes12", "audioCoin", "audio1"];
            for (a = 0; a < e.length; a++) {
                this.loadAudioFile(this.audioUrl + "files/audio/paijiu/" + e[a], t[a]);
            }
        }
    }
};
audioModule.initModule(globalData.fileUrl);
var initView = function () {
    $("#app-main").width(appData.width),
        $("#app-main").height(appData.height), $("#table").width(appData.width), $("#table").height(appData.height), $(".ranking").css("width", 2 * appData.width), $(".ranking").css("height", 2 * appData.width * 1.621), window.onload = function () {
        for (var e = ["table", "vinvite", "valert", "vmessage", "vshop", "vcreateRoom", "vroomRule", "endCreateRoom", "endCreateRoomBtn"], t = e.length, a = 0; a < t; a++) {
            var n = document.getElementById(e[a]);
            n && n.addEventListener("touchmove", function (e) {
                e.preventDefault()
            }, !1)
        }
    }
};
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
    blurIpt: function () {
        // if (navigator.userAgent.toLocaleLowerCase().includes('iphone')) {
        //     window.scrollTo(0, 0)
        // }
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
    clickVoice: function () {
        if (globalData.p_type == 2) {
            audioModule.loadAudioFile(globalData.fileUrl + 'files/audio/paijiu/dy_button.mp3', 'clickVoice');
            setTimeout(function () {
                m4aAudioPlay('clickVoice');
            }, 100)
        }
    },
    copyLink: function () {
        methods.clickVoice();
        var copyTitle = globalData.hallName + ':' + globalData.roomNumber + '\n' +
            '房间：' + globalData.maxCount + '人' + globalData.gameName + ', 模式：明牌抢庄, 底分：' + appData.ruleInfo.baseScore + ', 局数：' + appData.game.total_num;

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
    showAlertB: function (e, t) {
        appData.isShowAlertB = !0, appData.alertTextB = e, appData.alertTypeB = t, setTimeout(function () {
            appData.isShowAlertB = !1
        }, 1e3)
    },
    clickGameOver: viewMethods.clickGameOver,
    showAlert: viewMethods.clickShowAlert,
    showMessage: viewMethods.showMessage,
    closeAlert: viewMethods.clickCloseAlert,
    sitDown: viewMethods.clickSitDown,
    tipsCards: viewMethods.clickTipsCards,
    seeMyCard4: viewMethods.seeMyCard4,
    imReady: viewMethods.clickReady,
    robBanker: viewMethods.clickRobBanker,
    //showCard:viewMethods.clickShowCard,
    groupCards: viewMethods.clickGroupCards,
    group: viewMethods.clickGroup,
    selectTimesCoin: viewMethods.clickSelectTimesCoin,
    hideMessage: viewMethods.hideMessage,
    closeEnd: viewMethods.closeEnd,
    messageOn: viewMethods.messageOn,
    reviewCard: function () {
        //window.location.href = cgr('gq', globalData.roomNumber, globalData.gameType, globalData.maxCount);
        window.location.href = Htmls.getReviewUrl(globalData.gameType, globalData.roomNumber);
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
        if (userData.individuality == "") {
            appData.isShowIndiv = true
        } else {
            appData.isShowIndividuality = true;
        }
        appData.individualityError = "";

        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
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
    closeHomeAlert: function () {
        appData.isShowHomeAlert = false;
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
    hall: function () {
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
        //window.location.href = '/';
        DynLoading.goto('/');
    },
    toNextRoom: function () {
        newGame();
        // 自动续局
        // var roomInfo=JSON.parse(localStorage.newRoom);

        $('.ranking-img').remove();
        $('.search-number-box').remove();
        $('.canvas-btn').remove();

        globalData.roomNumber = appData.newRoomNumber;
        resetState();
        resetAllPlayerData();
        if (!!(window.history && history.pushState)) {
            changeTitle(userData.nickname, globalData.roomNumber);
            history.replaceState(null, null, cgr('ga', globalData.roomNumber, '18', globalData.maxCount));
        }
    },
    sendToChat() {
        methods.showResultTextFunc('已发送链接到聊天室');
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
    notRobBanker: viewMethods.clickNotRobBanker,
    showGameRule: function () {
        4 != appData.roomStatus && ($(".createRoom .mainPart").css("height", "60vh"), $(".createRoom .mainPart .blueBack").css("height", "51vh"), appData.ruleInfo.isShowRule = !0)
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
    },
    cancelGameRule: function () {
        appData.ruleInfo.isShowRule = !1, $(".createRoom .mainPart").css("height", "65vh"), $(".createRoom .mainPart .blueBack").css("height", "46vh")
    },
    showBreakRoom: function () {
        null != appData.breakData && void 0 != appData.breakData && viewMethods.gameOverNew(appData.breakData.data.score_board, appData.breakData.data.balance_scoreboard), chooseBigWinner(), $(".ranking .rankBack").css("opacity", "1"), $(".roundEndShow").show(), $(".ranking").show(), canvas()
    },
    confirmBreakRoom: function () {
        socketModule.sendGameOver(), viewMethods.clickCloseAlert()
    },
    showAudioSetting: function () {
        appData.editAudioInfo.backMusic = appData.audioInfo.backMusic,
            appData.editAudioInfo.messageMusic = appData.audioInfo.messageMusic,
            appData.editAudioInfo.isShow = !0
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
    },
    cancelAudioSetting: function () {
        appData.editAudioInfo.isShow = !1
    },
    confirmAudioSetting: function (once) {

        if (globalData.p_type == 2) {
            this.confirmAudioSettingDy(once);
        } else {
            this.confirmAudioSettingYh(once);
        }
    },
    confirmAudioSettingDy: function (once) {
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
    confirmAudioSettingYh: function (once) {
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
    }, testRefreshRoom: function () {
        socketModule.sendRefreshRoom()
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
    applyToJoin: function () {
        httpModule.applyToJoin();
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
        resetState(), initView(), 4 != globalData.roomStatus && $("#loading").hide(), $(".main").show()
    },
    vmUpdated: function () {
    },
    vmMounted: function () {
        audioModule.loadAllAudioFile(), $("#marquee").marquee({
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
var wsctop = 0;
var shareContent = "";

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
// var isLoadAudioFile = !1;
// audioModule.loadAllAudioFile();
// audioModule.audioOn = true;
// audioModule.stopSound("backMusic");
// audioModule.playSound("backMusic", true);
// wx.ready(function () {
//     audioModule.loadAllAudioFile();
//     wx.hideMenuItems({
//         menuList: ["menuItem:copyUrl", "menuItem:share:qq", "menuItem:share:weiboApp", "menuItem:favorite", "menuItem:share:facebook", "menuItem:share:QZone", "menuItem:refresh"]
//     });
//     getShareContent();
//     wx.onMenuShareTimeline({
//         title: globalData.shareTitle,
//         desc: shareContent,
//         link: globalData.roomUrl,
//         imgUrl: globalData.fileUrl + "files/images/paijiu/share_icon.png",
//         success: function () {
//         },
//         cancel: function () {
//         }
//     });
//     wx.onMenuShareAppMessage({
//         title: globalData.shareTitle,
//         desc: shareContent,
//         link: globalData.roomUrl,
//         imgUrl: globalData.fileUrl + "files/images/paijiu/share_icon.png",
//         success: function () {
//         },
//         cancel: function () {
//         }
//     })
// });
// wx.error(function (e) {
// });


function checkIndividuality(e) {
    return !!/^[0-9a-zA-Z]*$/g.test(e);
}

methods.showAlertTip = function (e, t) {
    appData.isShowAlertTip = true;
    appData.alertTipText = e;
    appData.alertTipType = t;
    setTimeout(function () {
        appData.isShowAlertTip = !1;
    }, 1e3);
}

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

var isLoadAudioFile = !1;

function preventDefaultFn(e) {
    e.preventDefault()
}

function disable_scroll() {
    $("body").on("touchmove", preventDefaultFn)
}

function enable_scroll() {
    $("body").off("touchmove", preventDefaultFn)
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

function logMessage(e) {
    // console.log(e)
}

function reload() {
    globalData.isShortUrl ? window.location.href = window.location.href + "/" + 1e4 * Math.random() : window.location.href = window.location.href + "&id=" + 1e4 * Math.random()
}

function chooseBigWinner() {
    //对积分榜排序
    appData.playerBoard.score.sort(function (a, b) {
        return b.account_score - a.account_score;
    });
    var len = appData.playerBoard.score.length;
    var maxScore = 1;
    for (a = 0; a < len; a++) {
        appData.playerBoard.score.isBigWinner = 0,
        appData.playerBoard.score[a].account_score > maxScore && (maxScore = appData.playerBoard.score[a].account_score);
    }
    for (var n = 0; n < len; n++)
        appData.playerBoard.score[n].account_score == maxScore && (appData.playerBoard.score[n].isBigWinner = 1)
}


4 == globalData.roomStatus && setTimeout(function () {
    try {
        var obj = eval("(" + globalData.scoreboard + ")");
        setTimeout(function () {
            socketModule.processLastScoreboard(obj)
        }, 0)
    } catch (e) {
        setTimeout(function () {
            socketModule.processLastScoreboard("")
        }, 0)
    }
}, 50);
$(function () {
    $(".place").css("width", 140 * per),
        $(".place").css("height", 140 * per),
        $(".place").css("top", 270 * per),
        $(".place").css("left", 195 * per),
        sessionStorage.isPaused = "false";
    var e, t;
    void 0 !== document.hidden ?
        (e = "hidden", t = "visibilitychange") :
        void 0 !== document.webkitHidden && (e = "webkitHidden", t = "webkitvisibilitychange"),
        void 0 === document.addEventListener || void 0 === e ?
            alert("This demo requires a browser such as Google Chrome that supports the Page Visibility API.") :
            document.addEventListener(t, function () {
                document[e] ?
                    (audioModule.audioOn = !1, audioModule.stopSound("backMusic")) :
                    "true" !== sessionStorage.isPaused && (
                        audioModule.audioOn = !0, audioModule.stopSound("backMusic"), audioModule.playSound("backMusic", !0)
                    )
            }, !1)
});