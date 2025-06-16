var ws;
var game = {
    room: 0,
    room_number: globalData.roomNumber,
    status: 0,
    time: -1,
    round: 0,
    total_num: 0,
    cardDeal: 0,
    show_score: !1,
    littleScore: !1
};
var message = [
    {num: 0, text: "玩游戏，请先进群"},
    {num: 1, text: "群内游戏，切勿转发"},
    {num: 2, text: "别磨蹭，快点打牌"},
    {num: 3, text: "我出去叫人"},
    {num: 4, text: "你的牌好靓哇"},
    {num: 5, text: "我当年横扫澳门五条街"},
    {num: 6, text: "算你牛逼"},
    {num: 7, text: "别跟我抢庄"},
    {num: 8, text: "输得裤衩都没了"},
    {num: 9, text: "我给你们送温暖了"},
    {num: 10, text: "谢谢老板"}
];
var wsOperation = {
    SwapSeat: "SwapSeat",
    GuestRoom: "GuestRoom",
    AllGuestInfo: "AllGuestInfo",
    UpdateGuestInfo: "UpdateGuestInfo",
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
    Discard: "Discard",
    GrabBanker: "GrabBanker",
    PlayerMultiples: "PlayerMultiples",
    ShowCard: "ShowCard",
    UpdateAccountShow: "UpdateAccountShow",
    UpdateAccountMultiples: "UpdateAccountMultiples",
    StartBet: "StartBet",
    StartShow: "StartShow",
    RefreshRoom: "PullRoomInfo",
    BroadcastVoice: "BroadcastVoice",
    MyCards: "MyCards",
    GameOver: "GameOver",
    getScoreBoard: "getScoreBoard",
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
            data: {room_number: parseInt(globalData.roomNumber), token: globalData.tk}
        })
    },
    sendJoinRoom: function () {
        socketModule.sendData({
            operation: wsOperation.JoinRoom,
            data: {
                room_number: parseInt(globalData.roomNumber),
                token: globalData.tk
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
                room_number: parseInt(globalData.roomNumber),
                serial_num: parseInt(e),
                token: globalData.tk
            }
        })
    },
    sendGuestRoom: function () {
        socketModule.sendData({
            operation: wsOperation.GuestRoom,
            data: {
                room_number: parseInt(globalData.roomNumber),
                token: globalData.tk
            }
        })
    },
    sendRefreshRoom: function () {
        socketModule.sendData({
            operation: wsOperation.RefreshRoom,
            data: {
                room_id: parseInt(appData.game.room),
                token: globalData.tk
            }
        })
    },
    sendReadyStart: function () {
        socketModule.sendData({
            operation: wsOperation.ReadyStart,
            data: {
                room_id: parseInt(appData.game.room),
                token: globalData.tk
            }
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
            data: {
                room_id: parseInt(appData.game.room),
                voice_num: parseInt(e),
                token: globalData.tk
            }
        })
    },
    sendGrabBanker: function (e) {
        socketModule.sendData({
            operation: wsOperation.GrabBanker,
            data: {
                room_id: parseInt(appData.game.room),
                is_grab: 1,
                multiples: parseInt(e)
            }
        })
    },
    sendNotGrabBanker: function () {
        socketModule.sendData({
            operation: wsOperation.GrabBanker,
            data: {
                room_id: parseInt(appData.game.room),
                is_grab: 0,
                multiples: 1,
                token: globalData.tk
            }
        })
    },
    sendPlayerMultiples: function (e) {
        socketModule.sendData({
            operation: wsOperation.PlayerMultiples,
            data: {
                room_id: appData.game.room,
                multiples: e,
                token: globalData.tk
            }
        })
    },
    sendShowCard: function () {
        for (var e = 0; e < appData.cardSelect.length; e++)
            if ("selected" == appData.cardSelect[e].isSelect) {
                socketModule.sendData({
                    operation: wsOperation.ShowCard,
                    data: {
                        room_id: appData.game.room,
                        card: this.getCardVal(appData.player[0].card[e]),
                        token: globalData.tk
                    }
                });
                break;
            }
    },
    getCardVal(card) {
        var suit = card.substr(0, 1);
        var point = card.substr(1);

        var suit_val = 0;
        point = parseInt(point);
        switch (suit) {
            case 'A':
                suit_val = 4;
                break;
            case 'B':
                suit_val = 3;
                break;
            case 'C':
                suit_val = 2;
                break;
            case 'D':
                suit_val = 1;
                break;
            default:
                suit_val = 0;
                break;
        }
        return point * 10 + suit_val;
    },
    getScoreBoard: function () {
        socketModule.sendData({
            operation: wsOperation.getScoreBoard,
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
            viewMethods.clickShowAlert(8, '房间已关闭');
        } else {
            socketModule.processLastScoreboard(obj.data.bs, obj.wh);
        }

    },
    processGameRule: function (e) {
        appData.ruleInfo.ticket = e.data.ticket_type;
        appData.ruleInfo.baseScore = e.data.score_type;
        appData.ruleInfo.timesType = e.data.rule_type;
        appData.ruleInfo.is_cardjoker = Math.ceil(e.data.is_cardjoker);
        appData.ruleInfo.is_cardbao9 = Math.ceil(e.data.is_cardbao9);
        appData.ruleInfo.banker_mode = Math.ceil(e.data.banker_mode);
        appData.ruleInfo.banker_score = Math.ceil(e.data.banker_score_type);
        appData.ruleInfo.bet_type = Math.ceil(e.data.bet_type);
        appData.game.total_num = e.data.total_num;
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

        1 == appData.ruleInfo.banker_mode ? appData.ruleInfo.bankerText = "抢庄" :
            2 == appData.ruleInfo.banker_mode ? appData.ruleInfo.bankerText = "抢庄回合" :
                3 == appData.ruleInfo.banker_mode ? appData.ruleInfo.bankerText = "选庄" :
                    4 == appData.ruleInfo.banker_mode ? appData.ruleInfo.bankerText = "" :
                        5 == appData.ruleInfo.banker_mode && (appData.ruleInfo.bankerText = "")
    },
    processPrepareJoinRoom: function (obj) {
        clearInterval(loadingTimer);
        appData.isShowLoading = false;
        $("#loading").hide();
        console.log("processPrepareJoinRoom:", obj);
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
        if (obj.data.room_status == 4) {
            viewMethods.roundEnd();
            appData.roomStatus = obj.data.room_status;
            // viewMethods.clickShowAlert(8, obj.result_message);
            return;
        }
        // socketModule.gAC();
        this.processGameRule(obj);  //复用规则

        //观战功能
        if (obj.data.is_member) {
            console.log("processPrepareJoinRoom: sendJoinRoom", obj.data.is_member);
            socketModule.sendJoinRoom();
        } else {
            console.log("processPrepareJoinRoom: guestRoom", obj.data.is_member, obj.data.can_join, obj.data.can_guest);
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
        methods.hideGuests();
        appData.game.room = e.data.room_id;
        appData.game.round = Math.ceil(e.data.game_num);
        appData.game.total_num = Math.ceil(e.data.total_num);
        appData.base_score = Math.ceil(e.data.base_score);
        appData.canBreak = Math.ceil(e.data.can_break);

        resetAllPlayerData();
        if (e.data.limit_time == -1) {
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
        appData.player[0].headimgurl = userData.headimgurl;
        appData.player[0].account_id = userData.account_id;
        appData.player[0].ticket_checked = e.data.ticket_checked;
        appData.game.status = Math.ceil(e.data.room_status);
        appData.player[0].card = e.data.card_info.concat();
        appData.player[0].card_open = e.data.card_info.concat();
        appData.player[0].card_type_array = e.data.card_type_array.concat();
        appData.player[0].eliminate_card = e.data.eliminate_card;
        if (appData.game.status == 2) {
            appData.game.cardDeal = 4;
        }
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
        appData.player[0].combo_point = "";
        appData.player[0].card_open = "";

    },
    processRefreshRoom: function (e) {
        resetAllPlayerData(),
            appData.player[0].serial_num = e.data.serial_num;
        for (var t = 0; t < globalData.maxCount; t++)
            t <= globalData.maxCount - e.data.serial_num ?
                appData.player[t].serial_num = t + Math.ceil(e.data.serial_num) :
                appData.player[t].serial_num = t + Math.ceil(e.data.serial_num) - globalData.maxCount;
        appData.player[0].account_status = Math.ceil(e.data.account_status),
            appData.player[0].account_score = Math.ceil(e.data.account_score),
            appData.player[0].nickname = userData.nickname,
            appData.player[0].headimgurl = userData.headimgurl,
            appData.player[0].account_id = userData.account_id,
            appData.player[0].serial_num = e.data.serial_num,
            appData.player[0].card = e.data.cards.concat(),
            appData.player[0].card_open = e.data.cards.concat(),
            appData.player[0].card_type = e.data.card_type,
            appData.player[0].ticket_checked = e.data.ticket_checked,
            appData.player[0].combo_point = e.data.combo_point,
        (appData.player[0].card_open.length <= 0 || void 0 == appData.player[0].card_open) &&
        (appData.player[0].card_open = e.data.cards.concat()),
        2 == appData.game.status && (appData.game.cardDeal = 4);

        this.aboutAllGamerInfo(e.all_gamer_info);
    },
    processAllGamerInfo: function (e) {
        appData.clickCard4 = !1;
        this.aboutAllGamerInfo(e.data);
    },
    aboutAllGamerInfo: function (gamerInfo) {
        for (var t = 0; t < globalData.maxCount; t++) {
            for (var a = 0; a < gamerInfo.length; a++) {
                if (appData.player[t].serial_num == gamerInfo[a].serial_num) {
                    appData.player[t].nickname = gamerInfo[a].nickname;
                    appData.player[t].headimgurl = gamerInfo[a].headimgurl;
                    appData.player[t].account_id = gamerInfo[a].account_id;
                    appData.player[t].account_score = Math.ceil(gamerInfo[a].account_score);
                    appData.player[t].account_status = Math.ceil(gamerInfo[a].account_status);
                    appData.player[t].online_status = Math.ceil(gamerInfo[a].online_status);
                    appData.player[t].ticket_checked = gamerInfo[a].ticket_checked;
                    appData.player[t].multiples = gamerInfo[a].multiples;
                    appData.player[t].banker_multiples = gamerInfo[a].banker_multiples;
                    appData.player[t].grab_multiples = gamerInfo[a].grab_multiples;
                    appData.player[t].poker_kw = gamerInfo[a].poker_kw;
                    appData.player[t].head_kw = gamerInfo[a].head_kw;
                    appData.player[t].sex = gamerInfo[a].sex;
                    appData.player[t].is_showbull = !1;
                    if (1 == gamerInfo[a].is_banker) {
                        appData.player[t].is_banker = !0;
                        appData.bankeraccount_id = gamerInfo[a].account_id;
                        appData.bankerPlayer = appData.player[t];
                    } else {
                        appData.player[t].is_banker = !1
                    }
                    if (appData.player[t].account_status >= 8) {
                        appData.player[t].is_showCard = !0
                    }
                }
            }

        }

        if (appData.player[0].account_status >= 7) {
            appData.player[0].is_showCard = !0
        }
        if (appData.player[0].account_status > 2) {
            setTimeout(function () {
                appData.player[0].is_showCard = !0
            }, 500)
        }
        if (3 == appData.player[0].account_status) {
            appData.showClockRobText = !0
        }
        if (6 == appData.player[0].account_status) {
            appData.showClockBetText = !0;
            if (1 == appData.player[0].is_banker) {
                appData.showRobText = !1;
                appData.showNotRobBankerText = !1;
                appData.showShowCardButton = !1;
                appData.showClickShowCard = !1;
                appData.showBankerCoinText = !0;
                appData.showTimesCoin = !1;
            } else {
                appData.showRobText = !1;
                appData.showNotRobBankerText = !1;
                appData.showShowCardButton = !1;
                appData.showClickShowCard = !1;
                appData.showBankerCoinText = !1;
                appData.showTimesCoin = !0;
            }

        }

        if (6 == appData.player[0].account_status) {
            appData.isFinishBankerAnimate = !0
        }
        viewMethods.resetMyAccountStatus();
        viewMethods.updateAllPlayerStatus();
        if (appData.player[0].account_status > 2 && appData.player[0].account_status < 7 && 2 == appData.ruleInfo.banker_mode) {
            viewMethods.seeMyCard();
        }

        if ("" != appData.scoreboard) {
            for (var t = 0; t < globalData.maxCount; t++) {
                for (s in appData.scoreboard) {
                    if (appData.player[t].account_id == s) {
                        appData.playerBoard.score[t].num = appData.player[t].num,
                            appData.playerBoard.score[t].account_id = appData.player[t].account_id,
                            appData.playerBoard.score[t].nickname = appData.player[t].nickname,
                            appData.playerBoard.score[t].account_score = Math.ceil(appData.scoreboard[s])
                    }
                }
            }

            if (appData.playerBoard.round = (2 == appData.game.status)) {
                appData.game.round - 1
            } else {
                appData.game.round
            }

        }

    },
    processStartShow: function (e) {
        var t = 0;
        4 == appData.ruleInfo.banker_mode && (t = 1200),
            setTimeout(function () {
                for (var t = 0; t < globalData.maxCount; t++)
                    for (var a = 0; a < e.data.length; a++)
                        if (appData.player[t].account_id == e.data[a].account_id) {
                            appData.player[t].multiples = e.data[a].multiples,
                                appData.player[t].account_status = Math.ceil(e.data[a].account_status),
                                appData.player[t].online_status = Math.ceil(e.data[a].online_status),
                                appData.player[t].limit_time = e.data[a].limit_time
                        }
                appData.showClockBetText = !1,
                    appData.showClockRobText = !1,
                    appData.showClockShowCard = !0,
                    viewMethods.resetMyAccountStatus(),
                    viewMethods.updateAllPlayerStatus(),
                    appData.game.time = Math.ceil(e.limit_time),
                    viewMethods.timeCountDown()
            }, t)
    },
    processMyCards: function (e) {
        if (2 != appData.ruleInfo.banker_mode) {
            return;
        }
        if (void 0 === e.data.card_type_array) {
            if (appData.player[0].account_id == e.data.account_id) {
                appData.player[0].card = e.data.cards.concat();
            }
            $(".myCards .cards").removeClass("card-flipped");
            viewMethods.seeMyCard();
        } else {
            if (appData.player[0].account_id == e.data.account_id) {
                appData.player[0].card = e.data.cards.concat();
                appData.player[0].card_type_array = e.data.card_type_array.concat();
            }
        }
    },

    processStartBet: function (e) {
        var t = 0;
        if (3 == appData.ruleInfo.banker_mode) {
            t = 1200
        }
        if (5 == appData.ruleInfo.banker_mode && appData.game.round > 1) {
            t = 900
        }
        if (1 == appData.game.round && appData.ruleInfo.banker_mode) {

        }
        setTimeout(function () {
            for (var t = 0; t < globalData.maxCount; t++) {
                for (var a = 0; a < e.data.length; a++) {
                    appData.player[t].account_id == e.data[a].account_id &&
                    (appData.player[t].account_status = Math.ceil(e.data[a].account_status),
                            appData.player[t].online_status = Math.ceil(e.data[a].online_status),
                            appData.player[t].limit_time = Math.ceil(e.data[a].limit_time),
                            appData.player[t].multiples = 0,
                            1 == e.data[a].is_banker ?
                                (appData.player[t].is_banker = !0,
                                        appData.player[t].banker_multiples = appData.player[t].grab_multiples,
                                        appData.bankerAccountId = e.data[a].account_id,
                                        appData.bankerPlayer = appData.player[t]
                                ) :
                                appData.player[t].is_banker = !1
                    );
                }

            }

            appData.bankerArray = e.grab_array.concat(),
                appData.showClockBetText = !1,
                appData.showClockRobText = !1,
                appData.showClockShowCard = !1,
                appData.game.time = Math.ceil(e.limit_time),
                appData.bankerAnimateIndex = 0,
                appData.game.time = -1,
                5 == appData.ruleInfo.banker_mode && appData.game.round > 1 ? viewMethods.robBankerWithoutAnimate() :
                    3 == appData.ruleInfo.banker_mode && appData.game.round > 1 ? viewMethods.robBankerWithoutAnimate() :
                        4 != appData.ruleInfo.banker_mode ? (viewMethods.clearBanker(), viewMethods.robBankerAnimate(e)) :
                            (appData.game.time = Math.ceil(e.limit_time), appData.game.time > 0 && viewMethods.timeCountDown())
        }, t)
    },

    processUpdateGamerInfo: function (e) {
        var has_seat = false;    //观战功能
        for (var t = 0; t < globalData.maxCount; t++)
            if (appData.player[t].serial_num == e.data.serial_num) {
                appData.player[t].nickname = e.data.nickname,
                    appData.player[t].headimgurl = e.data.headimgurl,
                    appData.player[t].account_id = e.data.account_id,
                    appData.player[t].account_score = Math.ceil(e.data.account_score),
                    appData.player[t].banker_multiples = Math.ceil(e.data.banker_multiples),
                    appData.player[t].grab_multiples = Math.ceil(e.data.grab_multiples),
                    appData.player[t].multiples = Math.ceil(e.data.multiples),
                1 != e.data.account_status && (appData.player[t].account_status = Math.ceil(e.data.account_status)),
                    appData.player[t].online_status = Math.ceil(e.data.online_status),
                    appData.player[t].ticket_checked = e.data.ticket_checked,
                    appData.player[t].poker_kw = e.data.poker_kw,
                    appData.player[t].head_kw = e.data.head_kw,
                    appData.player[t].sex = e.data.sex,
                    appData.player[t].is_guest = 0;    //观战功能
            } else {
                if (appData.player[t].account_id == e.data.account_id) {
                    socketModule.sendRefreshRoom();
                }
                //观战功能  有位置
                if (appData.player[t].account_id == userData.account_id || 0 == appData.player[t].account_id) {
                    has_seat = true;
                }
            }

        appData.showSitdownButton = appData.isWatching && has_seat;
        //观战功能  加入游戏的玩家从观战者列表中剔除
        for (a = 0; a < appData.guests.length; a++)
            if (appData.guests[a].account_id == e.data.account_id) {
                break;
            }
        appData.guests.splice(a, 1);
    },
    processUpdateAccountStatus: function (e) {
        for (var a = 0; a < globalData.maxCount; a++) {
            if (appData.player[a].account_id == e.data.account_id) {
                //if(1!=e.data.account_status){
                appData.player[a].account_status = e.data.account_status;
                //}
                if (2 == appData.ruleInfo.banker_mode && (5 == e.data.account_status || 4 == e.data.account_status)) {
                    appData.player[a].grab_multiples = e.data.banker_multiples
                }
                if (appData.player[a].account_status >= 8) {
                    appData.player[a].online_status = e.data.online_status;
                    return;
                }
                if (1 == e.data.online_status) {

                } else {
                    appData.player[a].online_status = 0;

                    //观战功能   在座玩家观战中离线
                    for (a = 0; a < appData.guests.length; a++)
                        if (appData.guests[a].account_id == e.data.account_id) {
                            break;
                        }
                    appData.guests.splice(a, 1);

                    if (0 == e.data.account_status) {
                        //观战功能 有位置可加入
                        appData.showSitdownButton = appData.isWatching;
                        for (var k = 0; k < appData.player.length; k++) {
                            if (appData.player[k].account_id == e.data.account_id) {
                                appData.player[k].account_id = 0,
                                    appData.player[k].playing_status = 0,
                                    appData.player[k].nickname = "",
                                    appData.player[k].headimgurl = "",
                                    appData.player[k].account_score = 0
                                break;
                            }
                        }
                    }
                }

                if (0 != a) {
                    if (4 == appData.player[a].account_status) {
                        setTimeout(function () {
                            mp3AudioPlay("audioNoBanker")
                        }, 100);
                    } else if (5 == appData.player[a].account_status) {
                        setTimeout(function () {
                            mp3AudioPlay("audioRobBanker")
                        }, 100);
                    }
                }
                break
            }
        }
        if (globalData.maxCount == a) { //观战功能  观战者离线
            for (a = 0; a < appData.guests.length; a++)
                if (appData.guests[a].account_id == e.data.account_id) {
                    break;
                }
            appData.guests.splice(a, 1);
        } else {
            if (appData.isFinishBankerAnimate && appData.isFinishWinAnimate) {
                viewMethods.resetMyAccountStatus(),
                    viewMethods.updateAllPlayerStatus()
            } else {
                setTimeout(function () {
                    viewMethods.resetMyAccountStatus(),
                        viewMethods.updateAllPlayerStatus()
                }, 3e3)
            }
        }
    },
    processUpdateAccountShow: function (e) {
        for (var t = 0; t < appData.player.length; t++)
            if (appData.player[t].account_id == e.data.account_id) {
                appData.player[t].account_status = 8;
                if (0 == appData.player[t].is_audiobull && appData.player[t].account_status >= 8 && 0 == t) {
                    var a = "";
                    a = parseInt(appData.player[t].card_type) > 4 ?
                        "special" + appData.player[t].card_type :
                        "sangong" + appData.player[t].combo_point,
                        setTimeout(function () {
                            mp3AudioPlay(a)
                        }, 100),
                        appData.player[t].is_audiobull = !0
                }
                break
            }
    },
    processUpdateAccountMultiples: function (e) {
        for (var t = 0; t < appData.player.length; t++)
            if (appData.player[t].account_id == e.data.account_id) {
                appData.player[t].multiples = e.data.multiples;
                if (0 == t)
                    return;
                if (appData.player[t].multiples >= 1) {
                    var a = appData.player[t].multiples;
                    setTimeout(function () {
                        mp3AudioPlay("audioTimes" + a)
                    }, 100)
                }
                break;
            }
        viewMethods.resetMyAccountStatus(),
            viewMethods.updateAllPlayerStatus()
    },
    processStartLimitTime: function (e) {
        e.data.limit_time > 1 && (appData.game.time = Math.ceil(e.data.limit_time), viewMethods.timeCountDown())
    },
    processCancelStartLimitTime: function (e) {
        appData.game.time = -1
    },
    processGameStart: function (e) {
        $(".memberCoin").stop(!0),
            appData.cardSelect = [{isSelect: "unselected"}, {isSelect: "unselected"}, {isSelect: "unselected"}, {isSelect: "unselected"}],
            appData.isCardSelect = !1,
            appData.isFinishWinAnimate = !0,
            appData.isFinishBankerAnimate = !0,
            appData.game.cardDeal = 0,
            appData.game.status = 2,
            appData.game.time = -1,
            appData.game.round = appData.game.round + 1,
            appData.game.round = Math.ceil(e.game_num),
            appData.game.show_score = !1,
            appData.game.littleScore = !1,
            appData.player[0].is_showCard = !1,
            appData.showClockRobText = !1,
            appData.showClockBetText = !1,
            appData.showClockShowCard = !1,
            appData.clickCard4 = !1,
            appData.showClickShowCard = !1,
            appData.control.isShowRob = !0,
            appData.breakData = null;
        for (var t = 0; t < globalData.maxCount; t++) {
            appData.player[t].is_operation = !1,
                appData.player[t].is_showCard = !1,
                appData.player[t].is_showbull = !1,
                appData.player[t].eliminate_card = "",
                appData.player[t].bullImg = "",
                appData.player[t].bullImg1 = "",
                appData.player[t].is_banker = !1,
                appData.player[t].bullImg = "",
            0 == appData.player[t].online_status && (appData.player[t].account_status = 1);
            for (var a = 0; a < e.data.length; a++)
                if (appData.player[t].account_id == e.data[a].account_id) {
                    appData.player[t].ticket_checked = 1,
                        appData.player[t].account_status = Math.ceil(e.data[a].account_status),
                        appData.player[t].playing_status = Math.ceil(e.data[a].playing_status),
                        appData.player[t].online_status = Math.ceil(e.data[a].online_status),
                        appData.player[t].account_score = appData.player[t].account_score,
                        appData.player[t].limit_time = Math.ceil(e.data[a].limit_time);
                }
        }
        appData.game.time = Math.ceil(e.limit_time),
            viewMethods.timeCountDown(),
            viewMethods.reDeal()
    },
    processBroadcastVoice: function (obj) {
        console.log(1)
        for (var i = 0; i < globalData.maxCount; i++) {
            console.log(2)

            if (appData.player[i].account_id == obj.data.account_id && i != 0) {
                if (appData.player[0].sex == 1) {
                    var loadMessageNum = 'message' + obj.data.voice_num;
                } else {
                    var loadMessageNum = 'message' + obj.data.voice_num + '_1';
                }
                console.log(3, loadMessageNum)

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
        //
        // var newRoom=obj.data;
        // newRoom.oldRoomNumber=globalData.roomNumber;
        // localStorage.setItem('newRoom',JSON.stringify(obj.data));
    },
    processWin: function (e) {
        appData.game.round = Math.ceil(e.data.game_num),
            appData.game.total_num = Math.ceil(e.data.total_num),
            appData.playerBoard.round = Math.ceil(e.data.game_num),
            appData.game.show_score = !1,
            appData.showClockShowCard = !1,
            appData.showShowCardButton = !1,
            appData.showClickShowCard = !1,
            appData.showClockBetText = !1,
            appData.showClockRobText = !1,
            viewMethods.showMemberScore(!1);
        for (var t = 0; t < appData.player.length; t++) {
            appData.player[t].account_status >= 7 && (appData.player[t].account_status = 9);

            for (var a = 0; a < e.data.player_cards.length; a++)
                if (appData.player[t].account_id == e.data.player_cards[a].account_id) {
                    appData.player[t].card = e.data.player_cards[a].cards.concat(),
                        appData.player[t].card_open = e.data.player_cards[a].cards.concat(),
                        appData.player[t].card_type = e.data.player_cards[a].card_type,
                        appData.player[t].card_type_flower = e.data.player_cards[a].card_type_flower,
                        appData.player[t].combo_point = e.data.player_cards[a].combo_point,
                        appData.player[t].eliminate_card = e.data.player_cards[a].eliminate_card
                }
            for (var a = 0; a < e.data.loser_array.length; a++)
                if (appData.player[t].account_id == e.data.loser_array[a].account_id) {
                    appData.player[t].single_score = parseInt(e.data.loser_array[a].score),
                        appData.player[t].sg_score = parseInt(e.data.loser_array[a].sg_score),
                        appData.player[t].f_score = parseInt(e.data.loser_array[a].f_score);
                    break
                }
            for (var n = 0; n < e.data.winner_array.length; n++)
                if (appData.player[t].account_id == e.data.winner_array[n].account_id) {
                    appData.player[t].single_score = parseInt(e.data.winner_array[n].score),
                        appData.player[t].sg_score = parseInt(e.data.winner_array[n].sg_score),
                        appData.player[t].f_score = parseInt(e.data.winner_array[n].f_score);
                    break
                }
        }
        appData.game.time = -1,
            viewMethods.updateAllPlayerStatus(),
            appData.game.littleScore = !0,
            setTimeout(function () {
                viewMethods.resetMyAccountStatus()
            }, 200);
        if (appData.player[0].account_status >= 8 && 0 == appData.player[0].is_audiobull) {
            var o = appData.player[0].card_type, i = appData.player[0].combo_point;
            setTimeout(function () {
                mp3AudioPlay(1 == o ? "audioBull0" : 4 == o ? "audioBull10" : 5 == o ? "audioBull11" : 6 == o ? "audioBull12" : 7 == o ? "audioBull13" : "audioBull" + i)
            }, 200),
                appData.player[0].is_audiobull = !0
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
        var p = e.scoreboard;
        for (s in p) {
            var u = 0, d = p[s].name;
            userData.account_id == p[s].account_id && (u = 1),
                appData.playerBoard.score.push({
                    "account_id": p[s].account_id,
                    "nickname": name,
                    "account_score": Math.ceil(p[s].score),
                    "num": u,
                    "avatar": p[s].avatar
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
        appData.isShowAlert = !1;
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
                appData.showSitdownButton = appData.isWatching;
                appData.showWatchButton = !appData.isWatching;
            }
        }

        if (globalData.p_type == 2) {
            if (appData.userData.individuality != "" && appData.isWatching == 1) {
                // 显示一次暗号
                setTimeout(function () {
                    appData.showOnceIndiv = true
                    setTimeout(function () {
                        appData.showOnceIndiv = false
                        // localStorage.setItem('showOnceIndiv', 1)
                    }, 2500);
                }, 1000);
            } else if (appData.userData.individuality == "" && appData.isWatching == 1) {
                appData.isShowIndiv = true;
            }
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
    }
};
var compare = function (property) {
    return function (a, b) {
        var value1 = parseInt(a[property]);
        var value2 = parseInt(b[property]);
        return value2 - value1;
    }
}
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
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
        appData.alertType = e, appData.alertText = t, appData.isShowAlert = !0, setTimeout(function () {
            var t = $(".alert .alertText").height(), a = t;
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
            httpModule.getInfo();
        } else {
            appData.isShowAlert = !1;
        }
    },
    clickSitDown: function (e) {
        var isRepeat = repeat('SitDown');
        if (isRepeat) {
            methods.showResultTextFunc('请不要连续点击');
            return
        }
        appData.isShowGameAlert = !1;
        appData.isShowAlert = !1;
        if (globalData.p_type == 2) {
            if (appData.isWatching == 1) {
                socketModule.sendSitDown(e);
            } else {
                socketModule.sendSwapSeat(e);
            }
        }
        //else if (globalData.p_type == 0) {
            socketModule.sendJoinRoom();
        //}

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
    },
    clickReady: function () {
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
        if (appData.game.status > 1) {
            return
        }
        socketModule.sendReadyStart(), appData.player[0].is_operation = !0
    },
    reDeal: function () {
        if (appData.isDealing) {
            return;
        }
        appData.isDealing = !0,
            m4aAudioPlay("audio1"),
            appData.game.cardDeal = 1,
            setTimeout(function () {
                appData.game.cardDeal = 2,
                    setTimeout(function () {
                        appData.game.cardDeal = 3,
                            setTimeout(function () {
                                appData.game.cardDeal = 4,
                                    setTimeout(function () {
                                        viewMethods.resetMyAccountStatus(),
                                            appData.player[0].is_showCard = !0,
                                            appData.showClockRobText = !0,
                                            appData.isDealing = !1
                                    }, 150)
                            }, 30)
                    }, 30)
            }, 30)
    },
    resetMyAccountStatus: function () {
        if (6 == appData.player[0].account_status && !appData.isFinishBankerAnimate) {
            return;
        }
        viewMethods.resetShowButton();

        if (4 == appData.player[0].account_status) {
            appData.showNotRobText = !0;
        } else if (5 == appData.player[0].account_status) {
            appData.showRobText = !0;
        } else if (6 == appData.player[0].account_status) {
            if (1 == appData.player[0].is_banker) {
                appData.showBankerCoinText = !0;
            } else {
                if (appData.isFinishBankerAnimate || 4 == appData.ruleInfo.banker_mode) {
                    appData.showTimesCoin = !0;
                }
            }
        } else if (7 == appData.player[0].account_status) {
            appData.player[0].is_showCard = !0;
            if (1 == appData.clickCard4) {
                appData.showShowCardButton = !0;
            } else {
                appData.showClickShowCard = !0;
            }
        } else if (8 == appData.player[0].account_status) {
            appData.player[0].is_showCard = !0;
        }

        if ("" != appData.player[0].eliminate_card) {
            appData.isCardSelect = !0;
            for (var e = 0; e < appData.player[0].card.length; e++)
                if (appData.player[0].card[e] == appData.player[0].eliminate_card) {
                    appData.cardSelect[e].isSelect = "selected";
                }
        }
        if (appData.isCardSelect && appData.player[0].account_id == appData.userData.account_id)
            for (var e = 0; e < appData.cardSelect.length; e++)
                if ("selected" == appData.cardSelect[e].isSelect) {
                    var t = 20,
                        a = parseInt(appData.player[0].card_type_array[e].card_type);
                    t =
                        1 == a ? 0 :
                            4 == a ? 0 :
                                5 == a ? 11 :
                                    6 == a ? 12 :
                                        7 == a ? 13 :
                                            8 == a ? 14 :
                                                9 == a ? 15 :
                                                    10 == a ? 16 :
                                                        11 == a ? 17 :
                                                            appData.player[0].card_type_array[e].combo_point,
                        appData.player[0].bullImg = globalData.fileUrl + "files/images/jia31/point" + t + ".png",
                        appData.player[0].bullImg1 = globalData.fileUrl + "files/images/jia31/type" + parseInt(appData.player[0].card_type_array[e].card_type_flower) + ".png"
                }
    },
    updateAllPlayerStatus: function () {
        for (var e = 0; e < appData.player.length; e++)
            if (appData.isCardSelect, 4 == appData.player[e].account_status)
                appData.player[e].robImg = globalData.fileUrl + "files/images/bull/text_notrob.png";
            else if (5 == appData.player[e].account_status)
                appData.player[e].robImg = globalData.fileUrl + "files/images/bull/text_rob.png";
            else if (6 == appData.player[e].account_status) appData.player[e].multiples;
            else if (7 == appData.player[e].account_status)
                0 == e && viewMethods.seeMyCard();
            else if (8 == appData.player[e].account_status)
                0 == e && viewMethods.myCardOver();
            else if (9 == appData.player[e].account_status)
                if (0 == e) {
                    $(".myCards .card0").addClass("card-flipped"),
                        $(".myCards .card1").addClass("card-flipped"),
                        $(".myCards .card2").addClass("card-flipped"),
                        $(".myCards .card3").addClass("card-flipped");
                    for (var t = 0; t < appData.cardSelect.length; t++) {
                        appData.cardSelect[t].isSelect = "unselected";
                        if (appData.player[0].card[t] == appData.player[0].eliminate_card) {
                            appData.cardSelect[t].isSelect = "selected";
                            appData.isCardSelect = !0;
                        }
                    }
                    viewMethods.showCardType(1);
                    if (0 == appData.player[e].is_audiobull && appData.player[0].account_id == appData.userData.account_id) {
                        var a = "";
                        a = parseInt(appData.player[e].card_type) > 4 ?
                            "special" + appData.player[e].card_type :
                            "sangong" + appData.player[e].combo_point,
                            setTimeout(function () {
                                mp3AudioPlay(a)
                            }, 100),
                            appData.player[e].is_audiobull = !0
                    }
                } else {
                    if (globalData.maxCount == 9) {
                        viewMethods.cardOver9(appData.player[e].num)
                    } else if (globalData.maxCount == 13) {
                        viewMethods.cardOver13(appData.player[e].num)
                    }
                }
    },
    resetShowButton: function () {
        appData.showTimesCoin = !1,
            appData.showShowCardButton = !1,
            appData.showClickShowCard = !1,
            appData.showNotRobText = !1,
            appData.showRobText = !1,
            appData.showBankerCoinText = !1
    },
    seeMyCard: function () {
        if (appData.player[0].account_id != userData.account_id) { //观战功能
            return;
        }
        setTimeout(function () {
            $(".myCards .card0").addClass("card-flipped"),
                $(".myCards .card1").addClass("card-flipped"),
                $(".myCards .card2").addClass("card-flipped"),
                setTimeout(function () {
                    1 != appData.clickCard4 && 7 == appData.player[0].account_status && (appData.showClickShowCard = !0)
                }, 500)
        }, 500);

    },
    clickMyCard: function (e) {
        if (appData.player[0].account_id != userData.account_id || 7 != appData.player[0].account_status) {
            return;
        }
        $(".myCards .card3").hasClass("card-flipped") && (appData.clickCard4 = !0);
        if (appData.clickCard4 || 3 != e) {
            if (appData.clickCard4) {
                appData.player[0].card_type = appData.player[0].card_type_array[e].card_type,
                    appData.player[0].card_type_flower = appData.player[0].card_type_array[e].card_type_flower,
                    appData.player[0].combo_point = appData.player[0].card_type_array[e].combo_point;
                for (var t = 0; t < appData.cardSelect.length; t++) {
                    appData.cardSelect[t].isSelect = "unselected";
                    if (t == e) {
                        appData.cardSelect[t].isSelect = "selected";
                        appData.isCardSelect = !0;
                    }
                }

                viewMethods.resetMyAccountStatus()
            }
        } else {
            $(".myCards .card3").addClass("card-flipped");
            appData.clickCard4 = !0;  //已经翻开第四张牌
            setTimeout(function () {
                appData.showShowCardButton = !0,
                    appData.showClickShowCard = !1
            }, 100)
        }
    },
    resetCardOver: function (num) {
        if (globalData.maxCount == 9) {
            1 == num ?
                ($(".myCards .card00").css("left", "29%"), $(".myCards .card01").css("left", "44%"), $(".myCards .card02").css("left", "59%"), $(".myCards .card03").css("left", "74%")) :
                2 == num ?
                    ($(".cardOver .card211").css("right", "10.5vh"), $(".cardOver .card221").css("right", "12.5vh"), $(".cardOver .card231").css("right", "14.5vh"), $(".cardOver .card241").css("right", "16.5vh")) :
                    3 == num ?
                        ($(".cardOver .card311").css("right", "10.5vh"), $(".cardOver .card321").css("right", "12.5vh"), $(".cardOver .card331").css("right", "14.5vh"), $(".cardOver .card341").css("right", "16.5vh")) :
                        4 == num ?
                            ($(".cardOver .card411").css("right", "10.5vh"), $(".cardOver .card421").css("right", "12.5vh"), $(".cardOver .card431").css("right", "14.5vh"), $(".cardOver .card441").css("right", "16.5vh")) :
                            5 == num ?
                                ($(".cardOver .card511").css("right", "14.63vh"), $(".cardOver .card521").css("right", "16.63vh"), $(".cardOver .card531").css("right", "18.63vh"), $(".cardOver .card541").css("right", "20.63vh")) :
                                6 == num ?
                                    ($(".cardOver .card611").css("left", "14.63vh"), $(".cardOver .card621").css("left", "16.63vh"), $(".cardOver .card631").css("left", "18.63vh"), $(".cardOver .card641").css("left", "20.63vh")) :
                                    7 == num ?
                                        ($(".cardOver .card711").css("left", "10.5vh"), $(".cardOver .card721").css("left", "12.5vh"), $(".cardOver .card731").css("left", "14.5vh"), $(".cardOver .card741").css("left", "16.5vh")) :
                                        8 == num ?
                                            ($(".cardOver .card811").css("left", "10.5vh"), $(".cardOver .card821").css("left", "12.5vh"), $(".cardOver .card831").css("left", "14.5vh"), $(".cardOver .card841").css("left", "16.5vh")) :
                                            9 == num &&
                                            ($(".cardOver .card911").css("left", "10.5vh"), $(".cardOver .card921").css("left", "12.5vh"), $(".cardOver .card931").css("left", "14.5vh"), $(".cardOver .card941").css("left", "16.5vh"))
        } else if (globalData.maxCount == 13) {
            if (num == 1) {
                $(".myCards .card00").css("left", "29%");
                $(".myCards .card01").css("left", "44%");
                $(".myCards .card02").css("left", "59%");
                $(".myCards .card03").css("left", "74%");
            } else if (num > 1 && num <= 7) {
                $(".cardOver .card" + num + "11").css("right", "10.5vh");
                $(".cardOver .card" + num + "21").css("right", "12.5vh");
                $(".cardOver .card" + num + "31").css("right", "14.5vh");
                $(".cardOver .card" + num + "41").css("right", "16.5vh");
            } else if (num >= 8) {
                $(".cardOver .card" + num + "11").css("left", "10.5vh");
                $(".cardOver .card" + num + "21").css("left", "12.5vh");
                $(".cardOver .card" + num + "31").css("left", "14.5vh");
                $(".cardOver .card" + num + "41").css("left", "16.5vh");
            }
        }
    },
    myCardOver: function () {
        setTimeout(function () {
            $(".myCards .card0").addClass("card-flipped"),
                $(".myCards .card1").addClass("card-flipped"),
                $(".myCards .card2").addClass("card-flipped"),
                $(".myCards .card3").addClass("card-flipped")
        }, 250)
    },
    cardOver9: function (e) {
        if (e <= 1) {
            return;
        }
        if (1 != appData.player[e - 1].is_showbull) {
            appData.player[e - 1].is_showbull = !0,
                viewMethods.resetCardOver(e),
                setTimeout(function () {
                    if (2 == e || 3 == e || 4 == e) {
                        $(".cardOver .cardtf" + e + "11").animate({right: "10.5vh"}, 150);
                        $(".cardOver .cardtf" + e + "21").animate({right: "10.5vh"}, 150);
                        $(".cardOver .cardtf" + e + "31").animate({right: "10.5vh"}, 150);
                        $(".cardOver .cardtf" + e + "41").animate({right: "10.5vh"}, 150);
                        setTimeout(function () {
                            viewMethods.showCardType(e);
                            $(".cardOver .cardtf" + e).addClass("card-flipped");
                            $(".cardOver .card" + e + "11").animate({right: "10.5vh"}, 150);
                            $(".cardOver .card" + e + "21").animate({right: "13.5vh"}, 250);
                            $(".cardOver .card" + e + "31").animate({right: "16.5vh"}, 250);
                            $(".cardOver .card" + e + "41").animate({right: "19.5vh"}, 250)
                        }, 150)
                    } else if (7 == e || 8 == e || 9 == e) {
                        $(".cardOver .cardtf" + e + "11").animate({left: "10.5vh"}, 150);
                        $(".cardOver .cardtf" + e + "21").animate({left: "10.5vh"}, 150);
                        $(".cardOver .cardtf" + e + "31").animate({left: "10.5vh"}, 150);
                        $(".cardOver .cardtf" + e + "41").animate({left: "10.5vh"}, 150);
                        setTimeout(function () {
                            viewMethods.showCardType(e), $(".cardOver .cardtf" + e).addClass("card-flipped");
                            $(".cardOver .card" + e + "11").animate({left: "19.5vh"}, 250);
                            $(".cardOver .card" + e + "21").animate({left: "16.5vh"}, 250);
                            $(".cardOver .card" + e + "31").animate({left: "13.5vh"}, 250);
                            $(".cardOver .card" + e + "41").animate({left: "10.5vh"}, 250)
                        }, 150)
                    } else if (5 == e) {
                        $(".cardOver .cardtf" + e + "11").animate({right: "14.63vh"}, 150);
                        $(".cardOver .cardtf" + e + "21").animate({right: "14.63vh"}, 150);
                        $(".cardOver .cardtf" + e + "31").animate({right: "14.63vh"}, 150);
                        $(".cardOver .cardtf" + e + "41").animate({right: "14.63vh"}, 150);
                        setTimeout(function () {
                            viewMethods.showCardType(e), $(".cardOver .cardtf" + e).addClass("card-flipped");
                            $(".cardOver .card" + e + "11").animate({right: "14.63vh"}, 250);
                            $(".cardOver .card" + e + "21").animate({right: "17.63vh"}, 250);
                            $(".cardOver .card" + e + "31").animate({right: "20.63vh"}, 250);
                            $(".cardOver .card" + e + "41").animate({right: "23.63vh"}, 250)
                        }, 150)
                    } else if (6 == e) {
                        $(".cardOver .cardtf" + e + "11").animate({left: "14.63vh"}, 150);
                        $(".cardOver .cardtf" + e + "21").animate({left: "14.63vh"}, 150);
                        $(".cardOver .cardtf" + e + "31").animate({left: "14.63vh"}, 150);
                        $(".cardOver .cardtf" + e + "41").animate({left: "14.63vh"}, 150);
                        setTimeout(function () {
                            viewMethods.showCardType(e), $(".cardOver .cardtf" + e).addClass("card-flipped");
                            $(".cardOver .card" + e + "11").animate({left: "23.63vh"}, 250);
                            $(".cardOver .card" + e + "21").animate({left: "20.63vh"}, 250);
                            $(".cardOver .card" + e + "31").animate({left: "17.63vh"}, 250);
                            $(".cardOver .card" + e + "41").animate({left: "14.63vh"}, 250)
                        }, 150)
                    }
                }, 1)
        }
    },
    cardOver13: function (e) {
        if (e <= 1) {
            return;
        }
        if (1 != appData.player[e - 1].is_showbull) {
            appData.player[e - 1].is_showbull = !0,
                viewMethods.resetCardOver(e),
                setTimeout(function () {
                    if (2 == e || 3 == e || 4 == e || 5 == e || 6 == e || 7 == e) {
                        $(".cardOver .cardtf" + e + "11").animate({right: "10.5vh"}, 150);
                        $(".cardOver .cardtf" + e + "21").animate({right: "10.5vh"}, 150);
                        $(".cardOver .cardtf" + e + "31").animate({right: "10.5vh"}, 150);
                        $(".cardOver .cardtf" + e + "41").animate({right: "10.5vh"}, 150);
                        setTimeout(function () {
                            viewMethods.showCardType(e);
                            $(".cardOver .cardtf" + e).addClass("card-flipped");
                            $(".cardOver .card" + e + "11").animate({right: "10.5vh"}, 150);
                            $(".cardOver .card" + e + "21").animate({right: "13.5vh"}, 250);
                            $(".cardOver .card" + e + "31").animate({right: "16.5vh"}, 250);
                            $(".cardOver .card" + e + "41").animate({right: "19.5vh"}, 250)
                        }, 150)
                    } else if (8 == e || 9 == e || 10 == e || 11 == e || 12 == e || 13 == e) {
                        $(".cardOver .cardtf" + e + "11").animate({left: "10.5vh"}, 150);
                        $(".cardOver .cardtf" + e + "21").animate({left: "10.5vh"}, 150);
                        $(".cardOver .cardtf" + e + "31").animate({left: "10.5vh"}, 150);
                        $(".cardOver .cardtf" + e + "41").animate({left: "10.5vh"}, 150);
                        setTimeout(function () {
                            viewMethods.showCardType(e), $(".cardOver .cardtf" + e).addClass("card-flipped");
                            $(".cardOver .card" + e + "11").animate({left: "19.5vh"}, 250);
                            $(".cardOver .card" + e + "21").animate({left: "16.5vh"}, 250);
                            $(".cardOver .card" + e + "31").animate({left: "13.5vh"}, 250);
                            $(".cardOver .card" + e + "41").animate({left: "10.5vh"}, 250)
                        }, 150)
                    }
                }, 1)
        }
    },
    showCardType: function (e) {
        var t = 20, a = parseInt(appData.player[e - 1].card_type);
        t =
            1 == a ? 0 :
                4 == a ? 0 :
                    5 == a ? 11 :
                        6 == a ? 12 :
                            7 == a ? 13 :
                                8 == a ? 14 :
                                    9 == a ? 15 :
                                        10 == a ? 16 :
                                            11 == a ? 17 :
                                                appData.player[e - 1].combo_point,
            appData.player[e - 1].bullImg = globalData.fileUrl + "files/images/jia31/point" + t + ".png",
            appData.player[e - 1].bullImg1 = globalData.fileUrl + "files/images/jia31/type" + parseInt(appData.player[e - 1].card_type_flower) + ".png"
    },
    gameOverNew: function (e, t) {
        // for (var a = 0; a < appData.playerBoard.score.length; a++)
        //     appData.playerBoard.score[a].num = 0,
        //         appData.playerBoard.score[a].account_id = 0,
        //         appData.playerBoard.score[a].nickname = "",
        //         appData.playerBoard.score[a].account_score = 0,
        //         appData.playerBoard.score[a].isBigWinner = 0;
        for (o = 0; o < globalData.maxCount; o++) {
            for (s in e) {
                if (appData.player[o].account_id == s) {
                    appData.player[o].account_score = Math.ceil(e[s])
                }
            }

        }
        var n = new Date, o = "";
        o += n.getFullYear() + "-", o += n.getMonth() + 1 + "-", o += n.getDate() + "  ", o += n.getHours() + ":",
            n.getMinutes() >= 10 ? o += n.getMinutes() : o += "0" + n.getMinutes(),
            appData.playerBoard.record = o;

        // void 0 != t && "-1" != t && (socketModule.processBalanceScoreboard(t));
        for (var a = 0; a < globalData.maxCount; a++)
            appData.player[a].playing_status = 0,
                appData.player[a].is_win = !1,
                appData.player[a].is_operation = !1,
                appData.player[a].win_type = 0,
                appData.player[a].win_show = !1,
                appData.player[a].card = new Array,
                appData.player[a].card_open = new Array,
                appData.player[a].card_type = 0,
                appData.player[a].is_showCard = !1,
                appData.player[a].is_readyPK = !1,
                appData.player[a].is_pk = !1,
                appData.player[a].multiples = 0,
                appData.player[a].banker_multiples = 0,
                appData.player[a].grab_multiples = 0,
                appData.player[a].is_bull = !1,
                appData.player[a].is_showbull = !1,
                appData.player[a].is_audiobull = !1,
                appData.player[a].card_type_array = new Array,
                appData.player[a].eliminate_card = "";
        appData.game.cardDeal = 0,
            appData.game.status = 1,
            appData.player[0].is_showCard = !1,
            appData.showClockRobText = !1,
            appData.showClockBetText = !1,
            appData.showClockShowCard = !1,
            appData.cardSelect = [{isSelect: "unselected"}, {isSelect: "unselected"}, {isSelect: "unselected"}, {isSelect: "unselected"}],
            appData.isCardSelect = !1
    },
    showMessage: function () {
        if (appData.player[0].account_id != userData.account_id) return; //观战功能
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
        appData.isShowNewMessage = !0;
        enable_scroll();
    },
    hideMessage: function () {
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
        appData.isShowNewMessage = !1;
        enable_scroll();
    },
    messageOn: function (e) {
        console.log('e')
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
        // appData.gameover = true;
        // socketModule.getScoreBoard();
        DynLoading.goto('jia' + globalData.maxCount, 'i=' + globalData.roomNumber);
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
    clickRobBanker: function (e) {
        viewMethods.showRobBankerText(), socketModule.sendGrabBanker(e), 2 == appData.ruleInfo.banker_mode && (appData.player[0].banker_multiples = e,
            appData.control.isShowRob = !1), setTimeout(function () {
            mp3AudioPlay("audioRobBanker")
        }, 10)
    },
    showRobBankerText: function () {
        appData.showTimesCoin = !1, appData.showShowCardButton = !1, appData.showClickShowCard = !1, appData.showNotRobText = !1, appData.showRobText = !0, appData.showBankerCoinText = !1
    },
    showNotRobBankerTextFnc: function () {
        appData.showTimesCoin = !1, appData.showShowCardButton = !1, appData.showClickShowCard = !1, appData.showNotRobText = !0, appData.showRobText = !1, appData.showBankerCoinText = !1
    },
    clickNotRobBanker: function () {
        viewMethods.showNotRobBankerTextFnc(), socketModule.sendNotGrabBanker(), setTimeout(function () {
            mp3AudioPlay("audioNoBanker")
        }, 10)
    },
    clickSelectTimesCoin: function (e) {
        appData.player[0].multiples = e, appData.showTimesCoin = !1, socketModule.sendPlayerMultiples(e), setTimeout(function () {
            mp3AudioPlay("audioTimes" + e)
        }, 50)
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
    robBankerWithoutAnimate: function () {
        for (var e = 0; e < appData.player.length; e++)
            appData.player[e].account_id == appData.bankerAccountId ?
                (appData.player[e].is_banker = !0, bankerNum = appData.player[e].num) :
                appData.player[e].is_banker = !1,
                $("#bankerAnimate" + appData.player[e].num).hide(),
                $("#bankerAnimate1" + appData.player[e].num).hide();
        setTimeout(function () {
            appData.showClockRobText = !1,
                appData.showClockBetText = !0,
                appData.isFinishBankerAnimate = !0,
                viewMethods.resetMyAccountStatus(),
                viewMethods.updateAllPlayerStatus()
        }, 10),
            appData.game.time = 11,
        appData.game.time > 0 && viewMethods.timeCountDown()
    },
    robBankerAnimate: function (e) {
        for (var t = 0; t < appData.bankerArray.length; t++) {
            var a = "#banker" + appData.bankerArray[t];
            $(a).hide()
        }
        var n = 2 * appData.bankerArray.length;
        if (appData.bankerAnimateCount >= n || appData.bankerAnimateIndex < 0 || appData.bankerArray.length < 2) {
            appData.bankerAnimateCount = 0, appData.bankerAnimateIndex = -1;
            var a = "#banker" + appData.bankerAccountId;
            $(a).show();
            for (var o = "", t = 0; t < appData.player.length; t++)
                appData.player[t].account_id == appData.bankerAccountId ?
                    (appData.player[t].is_banker = !0, o = appData.player[t].num) :
                    appData.player[t].is_banker = !1,
                    $("#bankerAnimate" + appData.player[t].num).hide(),
                    $("#bankerAnimate1" + appData.player[t].num).hide();
            return $(a).hide(), $("#bankerAnimate" + o).css({
                top: "-0.1vh",
                left: "-0.1vh",
                width: "7.46vh",
                height: "7.46vh"
            }),
                $("#bankerAnimate1" + o).css({top: "-1vh", left: "-1vh", width: "9.26vh", height: "9.26vh"}),
                $("#bankerAnimate" + o).show(), $("#bankerAnimate1" + o).show(),
                $("#bankerAnimate1" + o).animate({
                    top: "-1vh",
                    left: "-1vh",
                    width: "9.26vh",
                    height: "9.26vh"
                }, 100, function () {
                    $("#bankerAnimate1" + o).animate({
                        top: "-0.1vh",
                        left: "-0.1vh",
                        width: "7.46vh",
                        height: "7.46vh"
                    }, 100, function () {
                        $("#bankerAnimate1" + o).hide()
                    })
                }),
                void $("#bankerAnimate" + o).animate({
                    top: "-1.5vh",
                    left: "-1.5vh",
                    width: "10.26vh",
                    height: "10.26vh"
                }, 100, function () {
                    $("#bankerAnimate" + o).animate({
                        top: "-0.1vh",
                        left: "-0.1vh",
                        width: "7.46vh",
                        height: "7.46vh"
                    }, 100, function () {
                        $("#bankerAnimate" + o).hide(),
                            setTimeout(function () {
                                appData.showClockRobText = !1,
                                    appData.showClockBetText = !0,
                                    appData.isFinishBankerAnimate = !0;
                                viewMethods.resetMyAccountStatus();
                                viewMethods.updateAllPlayerStatus();
                            }, 10);
                        appData.game.time = 10; //11
                        appData.game.time > 0 && viewMethods.timeCountDown()
                    })
                })
        }
        var i = appData.bankerArray[appData.bankerAnimateIndex],
            a = "#banker" + i;
        $(a).show(),
            appData.lastBankerImgId = a,
            appData.bankerAnimateCount++,
            appData.bankerAnimateIndex++,
        appData.bankerAnimateIndex >= appData.bankerArray.length && (appData.bankerAnimateIndex = 0),
            setTimeout(function () {
                viewMethods.robBankerAnimate(e)
            }, appData.bankerAnimateDuration)
    },
    showMemberScore: function (e) {
        e ? ($(".memberScoreText1").show(), $(".memberScoreText2").show(), $(".memberScoreText3").show(), $(".memberScoreText4").show(), $(".memberScoreText5").show(), $(".memberScoreText6").show(), $(".memberScoreText7").show(), $(".memberScoreText8").show(), $(".memberScoreText9").show()) : ($(".memberScoreText1").hide(), $(".memberScoreText2").hide(), $(".memberScoreText3").hide(), $(".memberScoreText4").hide(), $(".memberScoreText5").hide(), $(".memberScoreText6").hide(), $(".memberScoreText7").hide(), $(".memberScoreText8").hide(), $(".memberScoreText9").hide())
    },
    winAnimate: function (obj) {
        appData.isFinishWinAnimate = false;
        var winnerNums = new Array();
        var loserNums = new Array();

        appData.bankerPlayerNum = appData.bankerPlayer.num;

        if (appData.ruleInfo.banker_mode == 4) {
            for (var i = 0; i < obj.data.winner_array.length; i++) {
                for (var j = 0; j < appData.player.length; j++) {
                    if (obj.data.winner_array[i].account_id == appData.player[j].account_id) {
                        appData.bankerPlayerNum = appData.player[j].num;
                        winnerNums.push(appData.player[j].num);
                    }
                }
            }
        } else {
            for (var i = 0; i < obj.data.winner_array.length; i++) {
                for (var j = 0; j < appData.player.length; j++) {
                    if (obj.data.winner_array[i].account_id == appData.player[j].account_id) {
                        if (appData.player[j].num == appData.bankerPlayer.num) {
                            isBankerWin = true;
                            appData.bankerPlayerNum = appData.player[j].num;
                        } else {
                            winnerNums.push(appData.player[j].num);
                        }
                    }
                }
            }
        }

        for (var i = 0; i < obj.data.loser_array.length; i++) {
            for (var j = 0; j < appData.player.length; j++) {
                if (obj.data.loser_array[i].account_id == appData.player[j].account_id) {
                    if (appData.player[j].num != appData.bankerPlayerNum) {
                        loserNums.push(appData.player[j].num);
                    }
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
            for (var j = 0; j < 5; j++) {
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

        if (ruleInfo.banker_mode == 4) {
            totalTime = 1000;
            winnerTime = 1000;
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
                viewMethods.finishWinAnimate(obj);
            }, totalTime);
        } else {
            setTimeout(function () {
                viewMethods.finishWinAnimate(obj);
            }, totalTime);
        }
    },
    finishWinAnimate: function (e) {
        $("#playerCoins").hide(),
            appData.game.show_score = !0,
            appData.game.littleScore = !1,
            $(".myCards .cards").removeClass("card-flipped"),
            $(".memberScoreText").fadeIn(200, function () {
                viewMethods.gameOverNew(e.data.score_board, e.data.balance_scoreboard);

                setTimeout(function () {
                    $(".memberScoreText").fadeOut("slow");

                    for (var e = 0; e < globalData.maxCount; e++) {
                        if (appData.player[e].account_status >= 6) {
                            appData.player[e].is_banker = !1,
                            appData.player[e].account_status > 2 && (appData.player[e].account_status = 1)
                        }
                        appData.game.status = 1
                    }
                }, 500);
                appData.isFinishWinAnimate = !0;
                e.data.total_num == e.data.game_num && setTimeout(function () {
                    // viewMethods.roundEnd()
                    // newNum = e.data.room_number
                }, 500)
            })
        // appData.showWatchButton = appData.isWatching != 1;
        appData.showSitdownButton = appData.isWatching;
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
        for (var e = 1; e < globalData.maxCount; e++)
            for (var t = 0; t < 8; t++)
                $(".memberCoin" + e + t).css(memCoin[e]);
    },
    showCoins: function (e, t) {
        if (0 != appData.player[0].account_status && 1 != appData.player[0].account_status && 2 != appData.player[0].account_status || 4 != appData.ruleInfo.banker_mode || (t = !1), t) for (var a = 0; a < 8; a++) $(".memberCoin" + e + a).show(); else for (var a = 0; a < 8; a++) $(".memberCoin" + e + a).hide()
    },
};

var width = window.innerWidth, height = window.innerHeight, numD = 0, isTimeLimitShow = !1, isBankerWin = !1,
    timesOffset = (.9 * width - .088 * height * 4 - .02 * width * 3) / 2;
var coinLeft1 = .045 * height + "px",
    coinLeft2 = width - .06 * height + "px",
    coinLeft3 = width - .06 * height + "px",
    coinLeft4 = width - .06 * height + "px",
    coinLeft5 = width - .18 * height + "px",
    coinLeft6 = .15 * height + "px",
    coinLeft7 = .045 * height + "px",
    coinLeft8 = .045 * height + "px",
    coinLeft9 = .045 * height + "px";

if (globalData.maxCount == 9) {
    var memCoin = [
        {},
        {top: '82%', left: '4.5vh'},
        {top: '59%', left: coinLeft2},
        {top: '43%', left: coinLeft2},
        {top: '27%', left: coinLeft2},
        {top: '10%', left: coinLeft2},
        {top: '10%', left: '4.5vh'},
        {top: '27%', left: '4.5vh'},
        {top: '43%', left: '4.5vh'},
        {top: '59%', left: '4.5vh'},
    ];
} else if (globalData.maxCount == 13) {
    var memCoin = [
        {},
        {'top': '84%', 'left': '4.5vh'},
        {'top': '70%', 'left': '89.5vw'},
        {'top': '57%', 'left': '89.5vw'},
        {'top': '44%', 'left': '89.5vw'},
        {'top': '31%', 'left': '89.5vw'},
        {'top': '18%', 'left': '89.5vw'},
        {'top': '5%', 'left': '89.5vw'},
        {'top': '5%', 'left': '6vw'},
        {'top': '18%', 'left': '6vw'},
        {'top': '31%', 'left': '6vw'},
        {'top': '44%', 'left': '6vw'},
        {'top': '57%', 'left': '6vw'},
        {'top': '70%', 'left': '6vw'},
    ];
}

var viewStyle = {
    readyText: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '6vh',
        height: '3vh',
        'margin-top': '-1.5vh',
        'margin-left': '-3vh',
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
    }
};
var ruleInfo = {
    type: -1,
    isShow: !1,
    baseScore: 1,
    timesType: 1,
    is_cardjoker: 0,
    is_cardbao9: 0,
    ticket: 1,
    rule_height: 30,
    banker_mode: 1,
    banker_score: 1,
    bankerText: "抢庄",
    isShowRule: false,
};
var editAudioInfo = {isShow: !1, backMusic: 1, messageMusic: 1};
var audioInfo = {backMusic: 1, messageMusic: 1};
localStorage.backMusic ?
    (editAudioInfo.backMusic = localStorage.backMusic, audioInfo.backMusic = localStorage.backMusic) :
    localStorage.backMusic = 1,
    localStorage.messageMusic ?
        (editAudioInfo.messageMusic = localStorage.messageMusic, audioInfo.messageMusic = localStorage.messageMusic) :
        localStorage.messageMusic = 1;

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
    isShowApply: false,
    applyInfo: {
        club_headimgurl: '',
        club_name: '',
        club_id: '',
        status: '确定'
    },
    canConnect: !0,
    isShowAlertB: !1,
    alertTextB: "",
    alertTypeB: 1,
    isPlayer: 0,
    globalData: globalData,
    add_user: false,
    //观战功能
    isWatching: 0,
    ownerUser: {
        nickname: "",
        avatar: "",
        user_code: 0
    },
    applyStatus: 0, //0尚未申请  1加好友申请中
    isAutoReady: setReady, //自动准备
    guests: [],
    showGuest: 0,
    showSitdownButton: 0,
    showWatchButton: 1,
    joinType: 0,
    'isShowIndiv': false,
    'isShowIndividuality': false,
    'isShowIndividualityError': false,
    'individuality': userData.individuality,
    'inputIndiv': '',
    'isShowIndivConfirm': false,
    // 'individuality':  '',
    'individualityError': "",
    userData: userData,
    isShowAlertTip: false,
    alertTipText: "",
    alertTipType: 1,
    isCardSelect: !1,
    cardSelect: [{isSelect: "unselected"},
        {isSelect: "unselected"},
        {isSelect: "unselected"},
        {isSelect: "unselected"}],
    ranking: globalData.ranking,
    isNewNoty: globalData.isNewNoty,

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
    'isShowGameAlert': false,
    'isShowNewMessage': false,
    isShowMessage: !1,
    alertType: 0,
    alertText: "",
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
    isAuthPhone: userData.isAuthPhone,
    authCardCount: userData.authCardCount,
    phone: userData.phone, sPhone: "",
    sAuthcode: "",
    authcodeType: 1,
    authcodeText: "发送验证码",
    authcodeTime: 60,
    phoneType: 1,
    phoneText: "绑定手机",
    isReconnect: !0,
    bScroll: null,
    isShowNoty: !1,
    notyMsg: "",
    coinList: [1, 2, 4, 5],
    isShowNoteImg: !1,
    isShowIntro: !1,
    control: {isShowRob: !0},

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
    isShowRefesh: false,
};
void 0 != globalData.isNotyMsg && null != globalData.isNotyMsg ?
    (appData.notyMsg = globalData.notyMsg,
    1 == globalData.isNotyMsg && (appData.isShowNoty = !0, setTimeout(function () {
        appData.isShowNoty = !1
    }, 1e3 * globalData.notyTime))) :
    globalData.isNotyMsg = 0;


var resetState = function () {
    clearInterval(appData.heartbeat);
    appData.socketStatus = 0
    appData.heartbeat = null;
    //globalData.roomStatus = "-1";
    appData.connectOrNot = true;
    appData.gameover = false;
    appData.game.show_score = !1,

        appData.clickCard4 = !1;
    for (var e = 0; e < globalData.maxCount; e++)
        appData.player.push({
            num: e + 1,
            serial_num: e + 1,
            account_id: 0,
            account_status: 0,
            playing_status: 0,
            online_status: 0,
            nickname: "",
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
            card_type_array: new Array,
            eliminate_card: "",
            is_showCard: !1,
            is_pk: !1,
            is_readyPK: !1,
            card_type: 0,
            is_banker: !1,
            multiples: 0,
            banker_multiples: 0,
            grab_multiples: 0,
            combo_point: 0,
            robImg: "",
            bullImg: "",
            single_score: 0,
            sg_score: 0,
            f_score: 0,
            messageOn: !1,
            is_showbull: !1,
            is_audiobull: !1,
            messageText: "",
            coins: [],
            poker_kw: 1,
            head_kw: '',
            sex: 1,
            charm_val: 0,
            gift_num: 0
        }),
            appData.playerBoard.score.push({
                account_id: 0, nickname: "",
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
    for (var e = 0; e < globalData.maxCount; e++)
        appData.player.push({
            num: e + 1,
            serial_num: e + 1,
            account_id: 0,
            account_status: 0,
            playing_status: 0,
            online_status: 0,
            nickname: "",
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
            banker_multiples: 0,
            grab_multiples: 0,
            combo_point: 0,
            robImg: "",
            bullImg: "",
            single_score: 0,
            sg_score: 0,
            f_score: 0,
            messageOn: !1,
            is_showbull: !1,
            is_audiobull: !1,
            messageText: "我们来血拼吧",
            coins: [],
            card_type_array: new Array,
            eliminate_card: "",
            poker_kw: 1,
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
    if (-201 == obj.result)
        viewMethods.clickShowAlert(31, obj.result_message);
    else if (-202 == obj.result)
        appData.isReconnect = !1, socketModule.closeSocket(), viewMethods.clickShowAlert(32, obj.result_message);
    else {
        if (-203 == obj.result)
            return void methods.reloadView();
        if (-2001 == obj.result && obj.data.ls && obj.data.ls != userData.ls)
            return appData.canConnect = !1, socketModule.closeSocket(), void viewMethods.clickShowAlert(31, obj.result_message)
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
            } else {
                viewMethods.clickShowAlert(7, obj.result_message);
            }
        } else if (obj.operation == wsOperation.RefreshRoom) {
            window.location.href = window.location.href + "&id=" + 10000 * Math.random();
        } else if (obj.operation == wsOperation.SwapSeat) {
            methods.showResultTextFunc(obj.result_message);
            methods.reloadView();
        } else if (obj.operation == "setIndividuality") {
            methods.showResultTextFunc('设置失败，请修改后再设置');
        }

        appData.player[0].is_operation = false;

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
        } else if (obj.operation == wsOperation.SwapSeat) {
            socketModule.processSwapSeat(obj);
        } else if (obj.operation == wsOperation.Discard) {
            socketModule.processDiscard(obj);
        } else if (obj.operation == wsOperation.BroadcastVoice) {
            socketModule.processBroadcastVoice(obj);
        } else if (obj.operation == wsOperation.StartBet) {
            socketModule.processStartBet(obj);
        } else if (obj.operation == wsOperation.StartShow) {
            socketModule.processStartShow(obj);
        } else if (obj.operation == wsOperation.MyCards) {
            socketModule.processMyCards(obj);
        } else if (obj.operation == wsOperation.GuestRoom) {
            socketModule.processGuestRoom(obj);
        } else if (obj.operation == wsOperation.AllGuestInfo) {
            socketModule.processAllGuestInfo(obj);
        } else if (obj.operation == wsOperation.UpdateGuestInfo) {
            socketModule.processUpdateGuestInfo(obj);
        } else if (obj.operation == wsOperation.getScoreBoard) {
            socketModule.processGetScoreBoard(obj);
        } else if (obj.operation == "setIndividuality") {
            socketModule.processSetIndividuality(obj);
        } else if (obj.operation == "getAccountInfo") {
            socketModule.pGAI(obj);
        } else if (obj.operation == "getAccountCard") {
            socketModule.pGAC(obj);
        } else {
            logMessage(obj.operation)
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
    if (appData.canConnect && appData.isReconnect && 4 != globalData.roomStatus) {
        if (ws) {
            if (logMessage(ws.readyState), 1 == ws.readyState) return;
            ws = null
        }
        logMessage("reconnectSocket"), connectSocket(globalData.socket, wsOpenCallback, wsMessageCallback, wsCloseCallback, wsErrorCallback)
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
        if (4 != globalData.roomStatus && 1 != isLoadAudioFile) {
            isLoadAudioFile = !0;
            if (globalData.p_type == 2) {
                this.loadAudioFile(this.baseUrl + "files/audio/jia31/background_dy.mp3", "backMusic");
            } else {
                this.loadAudioFile(this.baseUrl + "files/audio/jia31/background8.mp3", "backMusic");
            }
            var e = ["nobanker.m4a", "robbanker.m4a", "0.m4a", "1.m4a", "2.m4a", "3.m4a", "4.m4a", "5.m4a", "6.m4a", "7.m4a", "8.m4a", "9.m4a",
                "special5.m4a", "special6.m4a", "special7.m4a", "special8.m4a", "special9.m4a", "special10.m4a", "special11.m4a", "times1.m4a", "times2.m4a", "times3.m4a", "times4.m4a", "times8.m4a", "times5.m4a", "times6.m4a", "times10.m4a", "coin.mp3", "audio1.m4a"];
            var t = ["audioNoBanker", "audioRobBanker", "sangong0", "sangong1", "sangong2", "sangong3", "sangong4", "sangong5", "sangong6", "sangong7", "sangong8", "sangong9",
                "special5", "special6", "special7", "special8", "special9", "special10", "special11", "audioTimes1", "audioTimes2", "audioTimes3", "audioTimes4", "audioTimes8", "audioTimes5", "audioTimes6", "audioTimes10", "audioCoin", "audio1"];
            for (a = 0; a < e.length; a++) {
                this.loadAudioFile(this.baseUrl + "files/audio/jia31/" + e[a], t[a]);
            }
            var n = ["message9.m4a", "message10.m4a", "message11.m4a", "message1.m4a", "message2.m4a", "message3.m4a", "message4.m4a", "message12.m4a", "message6.m4a", "message7.m4a", "message8.m4a"];
            var o = ["message0", "message1", "message2", "message3", "message4", "message5", "message6", "message7", "message8", "message9", "message10"];
            for (a = 0; a < n.length; a++)
                this.loadAudioFile(this.baseUrl + "files/audio/soundxp/" + n[a], o[a])
        }
    }
};
audioModule.initModule(globalData.fileUrl);

var initView = function () {
    $("#app-main").width(appData.width),
        $("#app-main").height(appData.height),
        $("#table").width(appData.width),
        $("#table").height(appData.height),
        $(".ranking").css("width", 2 * appData.width),
        $(".ranking").css("height", 2 * appData.width * 1.621),
        window.onload = function () {
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
    clickVoice: function () {
        if (globalData.p_type == 2) {
            audioModule.loadAudioFile(globalData.fileUrl + 'files/audio/paijiu/dy_button.mp3', 'clickVoice');
            setTimeout(function () {
                m4aAudioPlay('clickVoice');
            }, 100)
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
        } else if (appData.ruleInfo.banker_mode == 3) {
            var bankerMode = '牛 牛上庄'
        } else if (appData.ruleInfo.banker_mode == 4) {
            var bankerMode = '通比牛 牛'
        } else if (appData.ruleInfo.banker_mode == 5) {
            var bankerMode = '固定庄家'
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
    clickMyCard: viewMethods.clickMyCard,
    clickGameOver: viewMethods.clickGameOver,
    showAlert: viewMethods.clickShowAlert,
    showMessage: viewMethods.showMessage,
    closeAlert: viewMethods.clickCloseAlert,
    sitDown: viewMethods.clickSitDown,
    imReady: viewMethods.clickReady,
    robBanker: viewMethods.clickRobBanker,
    showCard: viewMethods.clickShowCard,
    selectTimesCoin: viewMethods.clickSelectTimesCoin,
    hideMessage: viewMethods.hideMessage,
    closeEnd: viewMethods.closeEnd,
    messageOn: viewMethods.messageOn,
    showAlertB: function (e, t) {
        appData.isShowAlertB = !0, appData.alertTextB = e, appData.alertTypeB = t, setTimeout(function () {
            appData.isShowAlertB = !1
        }, 1e3)
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
    //观战功能
    guestRoom: function () {
        socketModule.sendGuestRoom();
        appData.isShowGameAlert = false;
    },
    hideGuests: function () {
        if (globalData.p_type == 2) {
            $('.sidelines-mask').hide();
            $('.sidelines-content').css({right: '-3.5rem',});
        } else {
            appData.showGuest = 0
            appData.ruleInfo.isShowRule = false;
        }
    },
    showGuests: function () {
        appData.showSitdownButton = 0;
        if (globalData.p_type == 2) {
            appData.showWatchButton = !appData.isWatching && appData.player[0].account_status < 2;
        } else {
            appData.showWatchButton = !appData.isWatching && appData.player[0].account_status < 2 && appData.player[0].ticket_checked == 0;
        }
        if (appData.isWatching) {
            for (var e = 0; e < appData.player.length; e++)
                if (appData.player[e].account_id == userData.account_id || 0 == appData.player[e].account_id) {
                    appData.showSitdownButton = 1;
                    break
                }
        }

        if (globalData.p_type == 2) {
            $('.sidelines-mask').show();
            $('.sidelines-content').css({right: 0,});
            if (localStorage.messageMusic == 1) {
                methods.clickVoice();
            }
        } else {
            appData.showGuest = 1;
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
            let gameUrl = DynLoading.getPath('jia' + globalData.maxCount, 'i=' + globalData.roomNumber);
            history.replaceState(null, null, gameUrl);
        }
    },
    sendToChat() {
        methods.showResultTextFunc('已发送链接到聊天室');
    },
    hall: function () {
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
        DynLoading.goto('/');
    },
    blurIpt: function () {
        if (navigator.userAgent.toLocaleLowerCase().includes('iphone')) {
            window.scrollTo(0, 0);
        }
    },
    reviewCard: function () {
        window.location.href = Htmls.getReviewUrl(globalData.gameType, globalData.roomNumber);
    },
    notRobBanker: viewMethods.clickNotRobBanker,
    showGameRule: function () {
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
        if (appData.roomStatus == 4) {
            return;
        }

        $('.createRoom .mainPart').css('height', '60vh');
        $('.createRoom .mainPart .blueBack').css('height', '51vh');
        appData.ruleInfo.isShowRule = true;
    },
    cancelGameRule: function () {
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
        appData.ruleInfo.isShowRule = false;
        $('.createRoom .mainPart').css('height', '65vh');
        $('.createRoom .mainPart .blueBack').css('height', '46vh');
    },
    showBreakRoom: function () {
        if (appData.breakData != null && appData.breakData != undefined) {
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
        appData.editAudioInfo.isShow = true;
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
    },
    cancelAudioSetting: function () {
        appData.editAudioInfo.isShow = false;
        methods.confirmAudioSetting();
    },
    confirmAudioSetting: function (once) {
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
        if (globalData.p_type == 0) {
            if (appData.editAudioInfo.backMusic == 1) {
                // 关闭音乐
                appData.editAudioInfo.backMusic = 0
                appData.editAudioInfo.messageMusic = 0
            } else {
                // 打开音乐
                appData.editAudioInfo.backMusic = 1
                appData.editAudioInfo.messageMusic = 1
            }
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
            setTimeout(function () {
                audioModule.stopSound('backMusic');
            }, 200);
            setTimeout(function () {
                audioModule.playSound('backMusic', true);
            }, 500);
        } else {
            appData.editAudioInfo.backMusic = 0;
            audioModule.stopSound('backMusic');
        }
        localStorage.backMusic = appData.editAudioInfo.backMusic;
    },
    setMessageMusic: function () {
        if (appData.editAudioInfo.messageMusic == 0) {
            appData.editAudioInfo.messageMusic = 1;
        } else {
            appData.editAudioInfo.messageMusic = 0;
        }
        localStorage.messageMusic = appData.editAudioInfo.messageMusic;
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
    showIntro: function () {
        appData.isShowIntro = !0
    },
    closeIntro: function () {
        appData.isShowIntro = !1
    }
};
var vueLife = {
    vmCreated: function () {
        logMessage('vmCreated')
        resetState();
        //reconnectSocket();
        initView();
        if (globalData.roomStatus != 4) {
            // $("#loading").hide();
        }

        $(".main").show();
    },
    vmUpdated: function () {
    },
    vmMounted: function () {
        $("#marquee").marquee({
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
var wsctop = 0,
    shareContent = "";

function preventDefaultFn(e) {
    e.preventDefault()
}

function disable_scroll() {
    $("body").on("touchmove", preventDefaultFn)
}

function enable_scroll() {
    $("body").off("touchmove", preventDefaultFn)
}

function getShareContent() {
    shareContent = "\n",
        1 == appData.ruleInfo.banker_mode ? shareContent += "模式：自由抢庄 " :
            2 == appData.ruleInfo.banker_mode ? shareContent += "模式：明牌抢庄 " :
                3 == appData.ruleInfo.banker_mode ? shareContent += "模式：牛 牛上庄 " :
                    4 == appData.ruleInfo.banker_mode ? shareContent += "模式：经典三公 " :
                        5 == appData.ruleInfo.banker_mode && (shareContent += "模式：固定庄家 "),
        1 == appData.ruleInfo.baseScore ? shareContent += "底分：1分" :
            2 == appData.ruleInfo.baseScore ? shareContent += "底分：2分" :
                3 == appData.ruleInfo.baseScore ? shareContent += "底分：3分" :
                    4 == appData.ruleInfo.baseScore ? shareContent += "底分：4分" :
                        5 == appData.ruleInfo.baseScore && (shareContent += "底分：5分");
    if (1 == appData.ruleInfo.is_cardjoker || 1 == appData.ruleInfo.is_cardbao9) {
        var e = "  规则：";
        1 == appData.ruleInfo.is_cardjoker && (e += " 天公x10,雷公x7,地公x5"),
        1 == appData.ruleInfo.is_cardbao9 && (e += " 暴玖x9"), shareContent += e
    }
    1 == appData.ruleInfo.ticket ? shareContent += "  局数：12局x2张房卡" : shareContent += "  局数：24局x4张房卡";
}

// function canvas() {
//     var e = document.getElementById("ranking");
//     html2canvas(e, {
//         allowTaint: !0,
//         taintTest: !1,
//         onrendered: function (e) {
//             e.id = "mycanvas";
//             var t = e.toDataURL("image/jpeg", .5);
//             $("#end").attr("src", t),
//                 $(".end").show(),
//                 $(".ranking").hide()
//         }
//     })
// }
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
    var pics = [globalData.fileUrl + 'files/images/jia31/rank_frame2.jpg', globalData.fileUrl + 'files/images/common/people_bg.png', globalData.fileUrl + 'files/images/common/ranking_icon.png'];
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

});
wx.error(function (e) {
});
4 == globalData.roomStatus && setTimeout(function () {
    try {
        console.log(1);
        var obj = eval("(" + globalData.scoreboard + ")");
        console.log(obj), setTimeout(function () {
            socketModule.processLastScoreboard(obj)
        }, 0)
    } catch (e) {
        console.log(e), setTimeout(function () {
            socketModule.processLastScoreboard("")
        }, 0)
    }
}, 50),
    $(function () {
        function e() {
            document[t] ?
                (audioModule.audioOn = !1, audioModule.stopSound("backMusic")) :
                "true" !== sessionStorage.isPaused && (console.log("play backMusic"), audioModule.audioOn = !0, audioModule.stopSound("backMusic"), audioModule.playSound("backMusic", !0))
        }

        $(".place").css("width", 140 * per), $(".place").css("height", 140 * per), $(".place").css("top", 270 * per), $(".place").css("left", 195 * per),
            sessionStorage.isPaused = "false";
        var t, a;
        void 0 !== document.hidden ?
            (t = "hidden", a = "visibilitychange") :
            void 0 !== document.webkitHidden && (t = "webkitHidden", a = "webkitvisibilitychange"),
            void 0 === document.addEventListener || void 0 === t ?
                alert("This demo requires a browser such as Google Chrome that supports the Page Visibility API.") :
                document.addEventListener(a, e, !1)
    });
