var ws;
var game = {
    room: 0,
    room_number: globalData.roomNumber,
    room_url: 0,
    score: 0,
    status: 0,
    time: -1,
    round: 0,
    total_num: 12,
    currentScore: 0,
    cardDeal: 0,
    can_open: 0,
    is_play: !1,
    curr_circle: 0   //当前第几圈
};
var message = [
    {num: 0, text: "玩游戏，请先进群"},
    {num: 1, text: "群内游戏，切勿转发"},
    {num: 2, text: "别磨蹭，快点打牌"},
    {num: 3, text: "我出去叫人"},
    {num: 4, text: "你的牌好靓哇"},
    {num: 5, text: "我当年横扫澳门五条街"},
    {num: 6, text: "算你牛逼"},
    {num: 7, text: "别吹牛逼，有本事干到底"},
    {num: 8, text: "输得裤衩都没了"},
    {num: 9, text: "我给你们送温暖了"},
    {num: 10, text: "谢谢老板"}
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
    RefreshRoom: "PullRoomInfo",
    ClickToLook: "ClickToLook",
    ChooseChip: "ChooseChip",
    //观战功能
    GuestRoom: "GuestRoom",
    AllGuestInfo: "AllGuestInfo",
    UpdateGuestInfo: "UpdateGuestInfo"
};

var httpModule = {
    getInfo: function () {
        reconnectSocket();
        appData.is_connect = !0;
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
            data: {
                room_number: globalData.roomNumber,
                token: globalData.tk
            }
        })
    },
    sendJoinRoom: function () {
        socketModule.sendData({
            operation: wsOperation.JoinRoom,
            data: {
                room_number: globalData.roomNumber,
                token: globalData.tk
            }
        })
    },
    sendGuestRoom: function () {
        socketModule.sendData({
            operation: wsOperation.GuestRoom,
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
        })
    },
    sendReadyStart: function () {
        socketModule.sendData({
            operation: wsOperation.ReadyStart,
            data: {
                room_id: appData.game.room,
                token: globalData.tk
            }
        })
    },
    sendBroadcastVoice: function (e) {
        socketModule.sendData({
            operation: wsOperation.BroadcastVoice,
            data: {
                room_id: appData.game.room, voice_num: e,
                token: globalData.tk
            }
        })
    },
    sendClickToLook: function () {
        socketModule.sendData({
            operation: wsOperation.ClickToLook,
            data: {
                room_id: appData.game.room,
                token: globalData.tk
            }
        })
    },
    sendChooseChip: function (e) {
        socketModule.sendData({
            operation: wsOperation.ChooseChip,
            data: {room_id: appData.game.room, score: e}
        })
    },
    sendDiscard: function () {
        socketModule.sendData({
            operation: wsOperation.Discard,
            data: {
                room_id: appData.game.room,
                token: globalData.tk
            }
        })
    },
    sendOpenCard: function () {
        socketModule.sendData({
            operation: wsOperation.OpenCard,
            data: {room_id: appData.game.room}
        })
    },
    sendPkCard: function (e) {
        socketModule.sendData({
            operation: wsOperation.PkCard,
            data: {
                room_id: appData.game.room, other_account_id: e,
                token: globalData.tk
            }
        })
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
        appData.ruleInfo.chip_type = e.data.chip_type,
            appData.ruleInfo.disable_pk = e.data.disable_pk,
            appData.ruleInfo.ticket_count = e.data.ticket_count,

            appData.ruleInfo.chip_list = e.data.chip_list,
            appData.ruleInfo.default_score = parseInt(e.data.default_score),
            appData.ruleInfo.bet_circle = e.data.bet_circle,
            appData.ruleInfo.pk_cond = e.data.pk_cond,
            appData.ruleInfo.look_cond = e.data.look_cond,

            appData.ruleInfo.xp_circle = e.data.xp_circle,
            appData.ruleInfo.xp_chip = parseInt(e.data.xp_chip);
        appData.game.total_num = parseInt(e.data.total_num);
        for (var t = 0; t < e.data.chip_list.length; t++) {
            appData.scoreList1[t] = parseInt(e.data.chip_list[t]);
            appData.scoreList2[t] = e.data.chip_list[t] / 2;
        }
        if (void 0 !== e.data.bloody_chip_tip) {
            appData.ruleInfo.bloody_chip_tip = e.data.bloody_chip_tip;
        }
        if (appData.ruleInfo.chip_type == 2) {
            for (var t = 0; t < e.data.chip_list.length; t++) {
                appData.scoreList1[t] = parseInt(e.data.chip_list[t]);
                appData.scoreList2[t] = e.data.chip_list[t] / 2;
            }
        } else {
            for (var t = 0; t < e.data.chip_list.length; t++) {
                appData.scoreList1[t] = parseInt(e.data.chip_list[t]);
                appData.scoreList2[t] = e.data.chip_list[t] / 2;
            }
        }
    },
    processPrepareJoinRoom: function (obj) {
        if (obj.data.is_club) {
            if (obj.data.is_club == 1) {
                //viewMethods.clickShowAlert(7, '你不是该俱乐部成员，无法加入房间');
                appData.isShowApply = true;
                appData.applyInfo.club_headimgurl = obj.data.club_headimgurl;
                appData.applyInfo.club_name = obj.data.club_name;
                appData.applyInfo.club_id = obj.data.room_creator;
                return;
            }
        }
        if (obj.data.room_status == 4) {
            $("#loading").show();
            appData.roomStatus = obj.data.room_status;
            viewMethods.roundEnd(1);
            return;
        }
        //socketModule.gAC();
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
            //viewMethods.clickShowAlert(4,obj.data.alert_text);
            //appData.room_users = obj.data.room_users;
            //console.log(appData.alertText)
        }
    },
    processJoinRoom: function (e) {
        appData.player = [],
            appData.playerBoard = {
                score: [],
                round: 0,
                record: ""
            };
        for (var t = 0; t < 9; t++) {
            appData.player.push({
                num: t + 1,
                serial_num: t + 1,
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
                card: [],
                is_showCard: !1,
                is_pk: !1,
                is_readyPK: !1,
                card_type: 0,
                messageOn: !1,
                messageText: "我们来血拼吧"
            });
            appData.playerBoard.score.push({
                account_id: 0,
                nickname: "",
                account_score: 0,
                isBigWinner: 0
            });
        }

        appData.game.room = e.data.room_id;
        appData.game.currentScore = Math.ceil(e.data.benchmark);
        appData.game.score = Math.ceil(e.data.pool_score);
        appData.game.round = Math.ceil(e.data.game_num);
        appData.game.total_num = Math.ceil(e.data.total_num);

        if (2 == appData.ruleInfo.chip_type) {
            //appData.scoreList1 = [4, 10, 20, 40];
            // appData.scoreList2 = [2, 5, 10, 20];
        } else {
            // appData.scoreList1 = [4, 8, 16, 20];
            // appData.scoreList2 = [2, 4, 8, 10];
        }

        if (audioModule.audioOn && appData.game.currentScore == appData.ruleInfo.xp_chip) {
            audioModule.stopSound("backMusic");
            audioModule.stopSound("zhangu");
            audioModule.playSound("zhangu", !0)
        }

        if (-1 == e.data.limit_time) {
            appData.game.time = Math.ceil(e.data.limit_time);
            viewMethods.timeCountDown();
        }

        appData.player[0].serial_num = Math.ceil(e.data.serial_num);
        for (var t = 0; t < 9; t++)
            if (t <= 9 - Math.ceil(e.data.serial_num)) {
                appData.player[t].serial_num = t + Math.ceil(e.data.serial_num);
            } else {
                appData.player[t].serial_num = t + Math.ceil(e.data.serial_num) - 9;
            }

        appData.player[0].account_status = Math.ceil(e.data.account_status);
        appData.player[0].account_score = Math.ceil(e.data.account_score);
        appData.player[0].nickname = userData.nickname;
        appData.player[0].headimgurl = userData.headimgurl;
        appData.player[0].account_id = userData.account_id;
        appData.player[0].card = e.data.cards.concat();
        appData.player[0].card_type = e.data.card_type;
        appData.player[0].ticket_checked = e.data.ticket_checked;
        appData.game.status = Math.ceil(e.data.room_status);

        if (2 == appData.game.status) {
            appData.game.cardDeal = 3;
            if (4 == appData.player[0].account_status) {
                viewMethods.cardOver(0)
            }
        }

        appData.scoreboard = e.data.scoreboard;

        //观战功能
        appData.isWatching = 0;
        setTimeout(function () {
            appData.showGuest = 0
        }, 100);
    },
    processRefreshRoom: function (e) {
        appData.player = [],
            appData.playerBoard = {score: [], round: 0, record: ""};
        for (var t = 0; t < 9; t++)
            appData.player.push({
                num: t + 1,
                serial_num: t + 1,
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
                card: [],
                is_showCard: !1,
                is_pk: !1,
                is_readyPK: !1,
                card_type: 0,
                messageOn: !1,
                messageText: "我们来血拼吧"
            }),
                appData.playerBoard.score.push({
                    account_id: 0,
                    nickname: "",
                    account_score: 0,
                    isBigWinner: 0
                });
        for (var t = 0; t < appData.player.length; t++)
            t <= appData.player.length - Math.ceil(e.data.serial_num) ?
                appData.player[t].serial_num = t + Math.ceil(e.data.serial_num) :
                appData.player[t].serial_num = t + Math.ceil(e.data.serial_num) - appData.player.length;
        for (var t = 0; t < appData.player.length; t++)
            for (var a = 0; a < e.all_gamer_info.length; a++)
                if (appData.player[t].serial_num == e.all_gamer_info[a].serial_num) {
                    appData.player[t].nickname = e.all_gamer_info[a].nickname;
                    appData.player[t].headimgurl = e.all_gamer_info[a].headimgurl;
                    appData.player[t].account_id = e.all_gamer_info[a].account_id;
                    appData.player[t].account_score = Math.ceil(e.all_gamer_info[a].account_score);
                    appData.player[t].account_status = Math.ceil(e.all_gamer_info[a].account_status);
                    appData.player[t].online_status = Math.ceil(e.all_gamer_info[a].online_status);
                    appData.player[t].ticket_checked = e.all_gamer_info[a].ticket_checked;
                }
        appData.player[0].card = e.data.cards.concat();
        appData.player[0].card_type = e.data.card_type;
        //  2 == appData.ruleInfo.chip_type ? (appData.scoreList1 = [4, 10, 20, 40], appData.scoreList2 = [2, 5, 10, 20]) :
        //    (appData.scoreList1 = [4, 8, 16, 20], appData.scoreList2 = [2, 4, 8, 10]);
    },
    processAllGamerInfo: function (e) {
        for (var t = 0; t < 9; t++)
            for (var a = 0; a < e.data.length; a++)
                if (appData.player[t].serial_num == e.data[a].serial_num) {
                    appData.player[t].is_guest = 0;    //观战功能
                    appData.player[t].nickname = e.data[a].nickname;
                    appData.player[t].headimgurl = e.data[a].headimgurl;
                    appData.player[t].account_id = e.data[a].account_id;
                    appData.player[t].account_score = Math.ceil(e.data[a].account_score);
                    appData.player[t].account_status = Math.ceil(e.data[a].account_status);
                    8 == appData.player[t].account_status && (appData.player[t].account_status = 4);
                    appData.player[t].online_status = Math.ceil(e.data[a].online_status);
                    appData.player[t].ticket_checked = e.data[a].ticket_checked
                }

        appData.player[0].account_status > 2 && setTimeout(function () {
            appData.player[0].is_showCard = !0
        }, 500);

        if ("" != appData.scoreboard) {
            for (var t = 0; t < 9; t++)
                for (s in appData.scoreboard)
                    if (appData.player[t].account_id == s) {
                        appData.playerBoard.score[t].num = appData.player[t].num;
                        appData.playerBoard.score[t].account_id = appData.player[t].account_id;
                        appData.playerBoard.score[t].nickname = appData.player[t].nickname;
                        appData.playerBoard.score[t].account_score = Math.ceil(appData.scoreboard[s]);
                    }

            if (2 == appData.game.status) {
                appData.playerBoard.round = appData.game.round - 1;
            } else {
                appData.playerBoard.round = appData.game.round;
            }
        }
        appData.player[0].account_status > 2 && setTimeout(function () {
            appData.player[0].is_showCard = !0
        }, 500)
    },
    processUpdateGamerInfo: function (e) {

        var has_seat = false;    //观战功能
        for (var t = 0; t < 9; t++)
            if (appData.player[t].serial_num == e.data.serial_num) {
                appData.player[t].nickname = e.data.nickname;
                appData.player[t].headimgurl = e.data.headimgurl;
                appData.player[t].account_id = e.data.account_id;
                appData.player[t].account_score = Math.ceil(e.data.account_score);
                appData.player[t].account_status = Math.ceil(e.data.account_status);
                appData.player[t].online_status = Math.ceil(e.data.online_status);
                appData.player[t].ticket_checked = e.data.ticket_checked;
                appData.player[t].is_guest = 0;   //观战功能
            } else {
                if (appData.player[t].account_id == e.data.account_id) {
                    socketModule.sendRefreshRoom();
                }
                //观战功能  有位置
                if (appData.player[t].account_id == userData.account_id || 0 == appData.player[t].account_id) {
                    has_seat = true;
                }
            }
        //观战功能
        appData.showSitdownButton = appData.isWatching && has_seat;
        //观战功能  加入游戏的玩家从观战者列表中剔除
        for (a = 0; a < appData.guests.length; a++)
            if (appData.guests[a].account_id == e.data.account_id) {
                break;
            }
        appData.guests.splice(a, 1);
    },
    processUpdateAccountStatus: function (e) {
        for (var i = 0; i < 9; i++) {
            if (appData.player[i].account_id == e.data.account_id) {
                if (1 == e.data.online_status) {
                    appData.player[i].account_status = Math.ceil(e.data.account_status);
                    0 != i ?
                        4 == appData.player[i].account_status ? m4aAudioPlay("audio3") :
                            5 == appData.player[i].account_status ? m4aAudioPlay("audio4") :
                                6 == appData.player[i].account_status && m4aAudioPlay("audio5") :
                        appData.player[0].is_operation = !1;
                } else {
                    appData.player[i].online_status = 0;
                    appData.player[i].account_status = Math.ceil(e.data.account_status);

                    //观战功能   在座玩家观战中离线
                    for (a = 0; a < appData.guests.length; a++)
                        if (appData.guests[a].account_id == e.data.account_id) {
                            break;
                        }
                    appData.guests.splice(a, 1);

                    if (0 == appData.player[i].account_status) {
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
        if (9 == i) { //观战功能  观战者离线
            for (a = 0; a < appData.guests.length; a++)
                if (appData.guests[a].account_id == e.data.account_id) {
                    break;
                }
            appData.guests.splice(a, 1);
        }
    },
    processStartLimitTime: function (e) {
        e.data.limit_time > 1 && (appData.game.time = Math.ceil(e.data.limit_time), viewMethods.timeCountDown())
    },
    processCancelStartLimitTime: function (e) {
        appData.game.time = -1
    },
    processGameStart: function (e) {
        viewMethods.tableReset(0);
        appData.game.score = 0;
        appData.game.time = -1;
        appData.game.is_play = !0;
        appData.game.round = appData.game.round + 1;
        appData.game.curr_circle = 1;
        currentPlayerNum = -1;
        for (var t = 0; t < 9; t++) {
            appData.player[t].is_operation = !1,
                appData.player[t].is_showCard = !1;
            for (var a = 0; a < e.data.length; a++)
                if (appData.player[t].account_id == e.data[a].account_id) {
                    appData.player[t].ticket_checked = 1,
                        appData.player[t].account_status = Math.ceil(e.data[a].account_status),
                        appData.player[t].playing_status = Math.ceil(e.data[a].playing_status),
                        appData.player[t].online_status = Math.ceil(e.data[a].online_status),
                        appData.player[t].account_score = appData.player[t].account_score - appData.ruleInfo.default_score,
                        appData.player[t].limit_time = Math.ceil(e.data[a].limit_time);

                    if (appData.player[t].playing_status > 1) {
                        currentPlayerNum = t;
                    }
                    appData.game.score = appData.game.score + appData.ruleInfo.default_score;
                    viewMethods.throwCoin(0, appData.ruleInfo.default_score);
                }
        }
        appData.game.status = 2;
        viewMethods.reDeal();
        currentPlayerNum >= 0 && viewMethods.playerTimeCountDown();
    },
    processNotyChooseChip: function (e) {
        appData.game.is_play = !0;
        currentPlayerNum = -1;
        if (2 == appData.game.status) {
            for (var t = 0; t < 9; t++) {
                appData.player[t].playing_status = 1;
                if (appData.player[t].account_id == e.data.account_id) {
                    appData.player[t].is_showCard = !0;
                    appData.player[t].is_operation = !1;
                    appData.player[t].playing_status = Math.ceil(e.data.playing_status);
                    appData.player[t].limit_time = Math.ceil(e.data.limit_time);
                    appData.game.can_open = e.data.can_open;
                    console.log("can_open:" + e.data.can_open);
                }
                if (appData.player[t].playing_status > 1) {
                    currentPlayerNum = t;
                }
            }
        }

        if (parseInt(e.data.curr_circle) + 1 > appData.game.curr_circle) {
            appData.game.curr_circle = parseInt(e.data.curr_circle) + 1;
        }
        appData.pkPeople = e.data.pk_user.concat();
        if (currentPlayerNum >= 0) {
            viewMethods.playerTimeCountDown();
        }
    },
    processCardInfo: function (e) {
        appData.player[0].card = e.data.cards.concat(), appData.player[0].card_type = e.data.card_type, viewMethods.cardOver(0), viewMethods.cardTest()
    },
    processPKCard: function (e) {
        for (var t = 0, a = 0, n = 0; n < 9; n++) appData.player[n].account_id == e.data.account_id && (appData.player[n].account_score = appData.player[n].account_score - Math.ceil(e.data.score), viewMethods.throwCoin(appData.player[n].num, e.data.score)), appData.player[n].account_id == e.data.loser_id && (appData.player[n].account_status = 7, appData.player[n].is_pk = !0, t = n), appData.player[n].account_id == e.data.winner_id && (appData.player[n].is_pk = !0, a = n);
        appData.game.score = appData.game.score + Math.ceil(e.data.score), viewMethods.playerPK(t, a)
    },
    processBroadcastVoice: function (e) {
        if (appData.player[0].account_id == userData.account_id) for (var t = 0; t < 9; t++) appData.player[t].account_id == e.data.account_id && 0 != t && (m4aAudioPlay("message" + e.data.voice_num), viewMethods.messageSay(t, e.data.voice_num)); else for (var t = 0; t < 9; t++) appData.player[t].account_id == e.data.account_id && (m4aAudioPlay("message" + e.data.voice_num), viewMethods.messageSay(t, e.data.voice_num))
    },

    processUpdateAccountScore: function (e) {
        for (var t = 0; t < 9; t++)
            if (appData.player[t].account_id == e.data.account_id) {
                appData.player[t].account_score = appData.player[t].account_score - Math.ceil(e.data.score);
                appData.game.score = appData.game.score + Math.ceil(e.data.score);

                if (0 != t || appData.player[0].account_id != userData.account_id) {     //观战功能
                    if (appData.ruleInfo.xp_chip == e.data.score || appData.ruleInfo.xp_chip / 2 == e.data.score) {

                        if (appData.ruleInfo.xp_chip == appData.game.currentScore) {
                            m4aAudioPlay(e.data.score + "f");
                        } else {
                            m4aAudioPlay("bloody");
                            audioModule.stopSound("backMusic");
                            audioModule.stopSound("zhangu");
                            audioModule.playSound("zhangu", !0);
                        }
                        viewMethods.throwCoin(appData.player[t].num, e.data.score, 1)
                    } else {
                        viewMethods.throwCoin(appData.player[t].num, e.data.score);
                        m4aAudioPlay(e.data.score + "f");
                    }
                }

                if (5 == appData.player[t].account_status) {
                    appData.game.currentScore = 2 * Math.ceil(e.data.score)
                } else {
                    appData.game.currentScore = Math.ceil(e.data.score)
                }
            }
    },
    processOpenCard: function (e) {
        if (!appData.game.is_play)
            return 0;
        for (var t = 0; t < 9; t++)
            if (appData.player[t].account_id == e.data.account_id) {
                appData.player[t].account_score = appData.player[t].account_score - Math.ceil(e.data.score);
                appData.game.score = appData.game.score + Math.ceil(e.data.score);

                if (appData.ruleInfo.xp_chip == appData.game.currentScore) {
                    viewMethods.throwCoin(appData.player[t].num, e.data.score, 1);
                } else {
                    viewMethods.throwCoin(appData.player[t].num, e.data.score);
                }

            }
    },
    processWin: function (e) {
        appData.game.is_play = !1,
            appData.game.round = parseInt(e.data.game_num),
            appData.game.total_num = parseInt(e.data.total_num),
            appData.playerBoard.round = parseInt(e.data.game_num);
        for (var t = 0; t < 9; t++) {
            if (appData.player[t].playing_status = 1, 0 == e.data.card_type) ;
            else for (var a = 0; a < e.data.player_cards.length; a++)
                appData.player[t].account_id == e.data.player_cards[a].account_id && (appData.player[t].card = e.data.player_cards[a].cards.concat());
            for (a in e.data.winner_score_dict)
                appData.player[t].account_id == a && (appData.player[t].is_win = !0, appData.player[t].win_type = e.data.card_type, appData.player[t].current_win = e.data.winner_score_dict[a])
        }

        if (0 == e.data.card_type) {
            viewMethods.gameOver(e.data.winner_score_dict, e.data.score_board, 1e3, 2e3, e.data.balance_scoreboard)
        } else {
            viewMethods.cardOver(1);
            if (e.data.total_num == e.data.game_num) {
                viewMethods.gameOver(e.data.winner_score_dict, e.data.score_board, 2500, 1e3, e.data.balance_scoreboard)
            } else {
                viewMethods.gameOver(e.data.winner_score_dict, e.data.score_board, 2500, 2500, e.data.balance_scoreboard)
            }
        }
        if (e.data.total_num == e.data.game_num) {
            viewMethods.roundEnd()
        }
        // 自动准备
        setTimeout(function () {
            console.log('自动准备')
            if (appData.isAutoReady == 1 && appData.isWatching != 1) {
                viewMethods.clickReady()
            }
        }, 4000)
    },
    processDiscard: function (e) {
        appData.player[0].account_status = 6
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
        for (var i = 0; i < appData.guests.length; i++)
            if (appData.guests[i].account_id == userData.account_id) {
                appData.isWatching = 1;
            }
        console.log(appData.player);
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
            for (var n = 0; n < appData.player.length; n++)
                if (appData.player[n].account_id == e.data.account_id) {
                    appData.player[n].is_guest = 1;
                    if (appData.player[n].account_status < 1) {
                        appData.player[n].account_id = 0;

                        appData.showSitdownButton = appData.isWatching;
                    }
                }
        } else {
            appData.guests.splice(a, 1);
        }
    },
};
var viewMethods = {
    blur: function () {
        setTimeout(function () {
            var scrollHeight = document.documentElement.scrollTop || document.body.scrollTop || 0;
            window.scrollTo(0, Math.max(scrollHeight - 1, 0));
        }, 100);
    },
    showHomeAlert: function () {
        appData.isShowHomeAlert = true;
    },
    clickShowAlert: function (e, t) {
        console.log(e, t), appData.alertType = e, appData.alertText = t, appData.isShowAlert = !0, setTimeout(function () {
            var t = $(".alertText").height(), a = t
            ;t < .15 * height && (t = .15 * height), t > .8 * height && (t = .8 * height);
            var n = t + .056 * height * 2 + .022 * height + .056 * height;
            8 == e && (n = n - .022 * height - .056 * height);
            var o = t + .034 * height * 2, i = .022 * height + (o - a) / 2;
            $(".alert .mainPart").css("height", n + "px"), $(".alert .mainPart").css("margin-top", "-" + n / 2 + "px"), $(".alert .mainPart .backImg .blackImg").css("height", o + "px"), $(".alert .mainPart .alertText").css("top", i + "px")
        }, 0)
    },
    clickCloseAlert: function () {
        22 == appData.alertType ?
            (appData.isShowAlert = !1, httpModule.getInfo()) :
            appData.isShowAlert = !1
    },
    clickSitDown: function () {
        appData.isShowGameAlert = !1, socketModule.sendJoinRoom()
    },
    clickReady: function () {
        if (appData.player[0].is_operation || 1 != appData.game.status) return 0;
        socketModule.sendReadyStart(), appData.player[0].is_operation = !0
    },
    reDeal: function () {
        m4aAudioPlay("audio1"), appData.game.cardDeal = 1, setTimeout(function () {
            appData.game.cardDeal = 2, setTimeout(function () {
                appData.game.cardDeal = 3, setTimeout(function () {
                    appData.player[0].is_showCard = !0
                }, 400)
            }, 250)
        }, 250)
    },
    cardOver: function (e) {
        0 == e ? ($(".myCards .card0").velocity({left: 0}, {duration: 450}), $(".myCards .card1").velocity({left: 0}, {duration: 450}), $(".myCards .card2").velocity({left: 0}, {
            duration: 450,
            complete: function () {
                $(".myCards .cards").addClass("card-flipped"), $(".myCards .card0").velocity({left: "0"}, {duration: 550}), $(".myCards .card1").velocity({left: "50%"}, {duration: 550}), $(".myCards .card2").velocity({left: "100%"}, {duration: 550})
            }
        })) : (appData.game.cardDeal = -1, $(".cardOver .card0").velocity({left: 0}, {duration: 250}), $(".cardOver .card1").velocity({left: 0}, {duration: 250}), $(".cardOver .card2").velocity({left: 0}, {
            duration: 250,
            complete: function () {
                $(".cardOver .cards").addClass("card-flipped"), $(".cardOver .card0").velocity({left: "0"}, {duration: 500}), $(".cardOver .card1").velocity({left: "25%"}, {duration: 500}), $(".cardOver .card2").velocity({left: "50%"}, {duration: 500})
            }
        }), 5 == appData.player[0].account_status && (appData.player[0].account_status = 4, viewMethods.cardOver(0)))
    },
    cardTest: function () {
        4 == appData.player[0].account_status && 0 == appData.player[0].card.length && socketModule.sendRefreshRoom()
    },
    gameOver: function (e, t, a, n) {
        appData.playerBoard.score = [];
        for (s in t)
            for (var o = 0; o < 9; o++)
                if (appData.player[o].account_id == s) {
                    appData.player[o].account_score = Math.ceil(t[s]);
                    appData.playerBoard.score.push({
                        num: appData.player[o].num,
                        account_id: appData.player[o].account_id,
                        nickname: appData.player[o].nickname,
                        account_score: parseInt(appData.player[o].account_score)
                    });
                }

        //appData.playerBoard.score=appData.playerBoard.score.sort(by("account_score")).concat();
        setTimeout(function () {
            var e = 0;
            for (var a = 0; a < appData.player.length; a++)
                if (appData.player[a].is_win) {
                    appData.player[a].win_show = !0;
                    if (0 == a) {
                        mp3AudioPlay("win");
                    }
                    if (0 == e) {
                        e = 1;
                        numD = appData.player[a].num;
                        setTimeout(function () {
                            viewMethods.selectCoin(numD, t)
                        }, 1500);
                    }
                }
            var o = new Date, i = "";
            i += o.getFullYear() + "-",
                i += o.getMonth() + 1 + "-",
                i += o.getDate() + "  ",
                i += o.getHours() + ":",
                o.getMinutes() >= 10 ? i += o.getMinutes() : i += "0" + o.getMinutes(),
                appData.playerBoard.record = i,
                setTimeout(function () {
                    audioModule.stopSound("backMusic"),
                        audioModule.stopSound("zhangu"),
                        audioModule.playSound("backMusic", !0),
                        viewMethods.tableReset(1)
                }, n)
        }, a)
    },
    showMessage: function () {
        // appData.player[0].account_id == userData.account_id && (appData.isShowMessage = !0, disable_scroll(), setTimeout(function () {
        //     appData.bScroll ? appData.bScroll.refresh() : appData.bScroll = new BScroll(document.getElementById("message-box"), {
        //         startX: 0,
        //         startY: 0,
        //         scrollY: !0,
        //         scrollX: !1,
        //         click: !0
        //     })
        // }, 10))
        if (appData.player[0].account_id != userData.account_id) return; //观战功能

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
        appData.player[e].messageOn = !0, appData.player[e].messageText = appData.message[t].text, setTimeout(function () {
            appData.player[e].messageOn = !1
        }, 2500)
    },
    closeEnd: function () {
        $(".ranking .rankBack").css("opacity", "0.7"), $(".end").hide(), $(".roundEndShow").hide(), $(".ranking").hide(), reload()
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
        DynLoading.goto('flowerxp' + globalData.maxCount, 'i=' + globalData.roomNumber);
    },
    timeCountDown: function () {
        if (1 != isTimeLimitShow) return appData.game.time <= 0 ? (isTimeLimitShow = !1, 0) : (isTimeLimitShow = !0, appData.game.time--, timeLimit = setTimeout(function () {
            isTimeLimitShow = !1, viewMethods.timeCountDown()
        }, 1e3), void 0)
    },
    playerTimeCountDown: function () {
        if (1 != isPlayerTimeLimitShow) return appData.player[currentPlayerNum].limit_time <= 0 || currentPlayerNum < 0 ? (isPlayerTimeLimitShow = !1, 0) : (isPlayerTimeLimitShow = !0, appData.player[currentPlayerNum].limit_time--, setTimeout(function () {
            isPlayerTimeLimitShow = !1, viewMethods.playerTimeCountDown()
        }, 1e3), void 0)
    },
    tableReset: function (e) {
        for (var t = 0; t < 9; t++) {
            if (appData.player[t].account_status > 1 && 1 == e) {
                appData.player[t].account_status = 1;
            }
            appData.player[t].playing_status = 0;
            appData.player[t].is_win = !1;
            appData.player[t].is_operation = !1;
            appData.player[t].win_type = 0;
            appData.player[t].win_show = !1;
            appData.player[t].card = [];
            appData.player[t].card_type = 0;
            appData.player[t].is_showCard = !1;
            appData.player[t].is_readyPK = !1;
            appData.player[t].is_pk = !1;
        }
        appData.game.can_open = 0;
        appData.game.score = 0;
        appData.game.cardDeal = 0;
        appData.game.currentScore = 0;
        appData.game.status = 1;
        appData.game.curr_circle = 0;
        $(".cards").removeClass("card-flipped");
        $(".scoresArea").empty();
    },
    throwCoin: function (e, t, a) {
        return 1 == a ?
            (
                $(".scoresArea").append("<div class='coin coin" + e + " coinBloody" + t + " coinBloody coinBloodyR" + Math.round(12 * Math.random()) + "'  ></div>"),
                    void $(".coin" + e).velocity({
                        top: (30 * perW - 28) * Math.random(),
                        left: (30 * perW - 28) * Math.random()
                    }, {
                        duration: 0,
                        complete: function () {
                            $(".coin").removeClass("coin" + e)
                        }
                    })
            ) :
            0 == e ?
                (
                    $(".scoresArea").append("<div class='coin coinType" + t + "' style='top:" + (30 * perW - 28) * Math.random() + "px;left:" + (30 * perW - 28) * Math.random() + "px;' ></div>"),
                        0
                ) :
                (
                    $(".scoresArea").append("<div class='coin coin" + e + " coinType" + t + "' ></div>"),
                        void $(".coin" + e).velocity({
                            top: (30 * perW - 28) * Math.random(),
                            left: (30 * perW - 28) * Math.random()
                        }, {
                            duration: 0,
                            complete: function () {
                                $(".coin").removeClass("coin" + e)
                            }
                        })
                )
    },
    selectCoin: function (e, t) {
        var a = 0, n = 0;
        1 == e ? (a = "36vh", n = 40) : 2 == e ? (a = "23vh", n = 150) : 3 == e ? (a = "10vh", n = 150) : 4 == e ? (a = "-4vh", n = 150) : 5 == e ? (a = "-16vh", n = 110) : 6 == e ? (a = "-16vh", n = -40) : 7 == e ? (a = "-4vh", n = -60) : 8 == e ? (a = "10vh", n = -60) : 9 == e && (a = "23vh", n = -60), $(".coin").css("top", a), $(".coin").css("left", n), setTimeout(function () {
            $(".scoresArea").empty()
        }, 350)
    },
    playerPK: function (e, t) {
        $(".pk1").css("left", "-60%"),
            $(".pk2").css("right", "-60%"),
            $(".playerPK .quitBack").hide(),
            $(".playerPK .background").attr("src", globalData.fileUrl + "files/images/flower/comB.png"),
            appData.turn = 0 == e ? t < 5 ? 0 : 1 : t < e ? 0 : 1;
        logMessage(e, t);
        if (0 == appData.turn) {
            appData.pk1.nickname = appData.player[e].nickname;
            appData.pk1.headimgurl = appData.player[e].headimgurl;
            appData.pk1.account_score = appData.player[e].account_score;
            appData.pk1.account_status = appData.player[e].account_status;
            appData.pk2.nickname = appData.player[t].nickname;
            appData.pk2.headimgurl = appData.player[t].headimgurl;
            appData.pk2.account_score = appData.player[t].account_score;
            appData.pk2.account_status = appData.player[t].account_status;
        } else {
            appData.pk1.nickname = appData.player[t].nickname;
            appData.pk1.headimgurl = appData.player[t].headimgurl;
            appData.pk1.account_score = appData.player[t].account_score;
            appData.pk1.account_status = appData.player[t].account_status;
            appData.pk2.nickname = appData.player[e].nickname;
            appData.pk2.headimgurl = appData.player[e].headimgurl;
            appData.pk2.account_score = appData.player[e].account_score;
            appData.pk2.account_status = appData.player[e].account_status;
        }
        appData.pk.round = 2;
        setTimeout(function () {
            m4aAudioPlay("com");
            $(".pk1").velocity({left: 0}, {duration: 500});
            $(".pk2").velocity({right: 0}, {
                duration: 500, complete: function () {
                    appData.pk.round = 3;
                    setTimeout(function () {
                        appData.pk.round = 4;
                        if (7 == appData.pk1.account_status) {
                            $(".pk1 .quitBack").fadeIn();
                            $(".pk1 .background").attr("src", globalData.fileUrl + "files/images/common/player_bg.png");
                        } else {
                            $(".pk1 .background").attr("src", globalData.fileUrl + "files/images/common/player_selected.png");
                        }

                        if (7 == appData.pk2.account_status) {
                            $(".pk2 .quitBack").fadeIn();
                            $(".pk2 .background").attr("src", globalData.fileUrl + "files/images/common/player_bg.png");
                        } else {
                            $(".pk2 .background").attr("src", globalData.fileUrl + "files/images/common/player_selected.png")
                        }

                        setTimeout(function () {
                            appData.pk.round = 0;
                            for (var e = 0; e < appData.player.length; e++)
                                appData.player[e].is_pk = !1
                        }, 2e3);
                    }, 800)
                }
            });
        }, 0)
    },
    choose: function (e, t) {
        if (appData.player[0].is_operation)
            return 0;
        if (1 == e)
            socketModule.sendClickToLook(), m4aAudioPlay("audio3");
        else if (2 == e) {
            socketModule.sendChooseChip(t);
            console.log("here:" + appData.ruleInfo.xp_chip);
            console.log("ihere t:" + t);
            if (appData.ruleInfo.xp_chip == t || appData.ruleInfo.xp_chip / 2 == t) {

                if (appData.ruleInfo.xp_chip == appData.game.currentScore) {
                    m4aAudioPlay(t + "f")
                } else {    //血拼
                    m4aAudioPlay("bloody");
                    audioModule.stopSound("backMusic");
                    audioModule.stopSound("zhangu");
                    audioModule.playSound("zhangu", !0);
                }
                viewMethods.throwCoin(1, t, 1);
                if (appData.ruleInfo.xp_chip != appData.game.currentScore) {
                    appData.roomCard = appData.roomCard - appData.ruleInfo.bloody_chip_ticket;
                }
            } else {
                m4aAudioPlay(t + "f");
                viewMethods.throwCoin(1, t);
            }
            appData.player[0].is_operation = !0;
        } else if (3 == e)
            socketModule.sendDiscard(), m4aAudioPlay("audio5"), appData.player[0].is_operation = !0;
        else if (4 == e) {
            for (var a = 0, n = 0; n < appData.player.length; n++)
                4 != appData.player[n].account_status && 5 != appData.player[n].account_status || a++;
            if (2 == a)
                socketModule.sendOpenCard(), m4aAudioPlay("audio2"), appData.player[0].is_operation = !0;
            else {
                for (var n = 0; n < appData.player.length; n++) {
                    appData.player[n].is_readyPK = !1;
                    for (var o = 0; o < appData.pkPeople.length; o++)
                        appData.player[n].account_id == appData.pkPeople[o] && (appData.player[n].is_readyPK = !0)
                }
                appData.pk.round = 1
            }
        } else 5 == e && (socketModule.sendPkCard(t), appData.player[0].is_operation = !0)
    },
    quitPk: function () {
        appData.pk.round = 0
    }
};
var width = window.innerWidth;
var height = window.innerHeight;
var numD = 0;
var isTimeLimitShow = !1;
var isPlayerTimeLimitShow = !1;
var currentPlayerNum = 0;
var ruleInfo = {
    type: 0,
    isShow: !1,
    isShowRule: !1,
    ticket_count: 1,
    disable_pk: 0,

    rule_height: 60,

    bloody_chip_ticket: 0,
    bloody_chip_tip: "",

    default_score: 0,
    bet_circle: 10,
    look_cond: 0,
    pk_cond: 1,
    xp_cond: 1, //血拼条件 第几轮之后
    xp_circle: 1, //血拼圈数
    xp_chip: 120,
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

var appData = {
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
    user_id: userData.id,
    roomStatus: globalData.roomStatus,
    scoreList1: [4, 8, 16, 20],
    scoreList2: [2, 4, 8, 10],
    width: window.innerWidth,
    height: window.innerHeight,
    roomCard: Math.ceil(userData.card),
    is_connect: !1,
    player: [],
    scoreboard: "",
    activity: [],
    isShowAlert: !1,
    isShowMessage: !1,
    alertType: 0,
    alertText: "",

    playerBoard: {
        score: [],
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
    pkPeople: [],
    turn: 0,
    pk: {turn: 0, round: 0},
    pk1: {
        nickname: "",
        headimgurl: "",
        account_score: 0,
        account_status: 0
    },
    pk2: {
        nickname: "",
        headimgurl: "",
        account_score: 0,
        account_status: 0
    },
    ruleInfo: ruleInfo,
    editAudioInfo: editAudioInfo,
    audioInfo: audioInfo,

    isReconnect: !0,
    bScroll: null,

    isShowNoteImg: !1,
    'isShowHomeAlert': false,
    'isShowGameAlert': false,
    isShowNewMessage: !1,
    'isShowIndiv': false,
    'isShowIndividuality': false,
    'isShowIndividualityError': false,
    'individuality': userData.individuality,
    'inputIndiv': '',
    'isShowIndivConfirm': false,
    // 'individuality':  '',
    'individualityError': "",
    isShowTipsText: false,
    tipsText: "",
    gameover: false,
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

var resetState = function () {
    appData.player = [],
        appData.playerBoard = {
            score: [],
            round: 0,
            record: ""
        };
    for (var e = 0; e < 9; e++)
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
            current_win: 0,
            is_operation: !1,
            win_show: !1,
            card: [],
            is_showCard: !1,
            is_pk: !1,
            is_readyPK: !1,
            card_type: 0,
            messageOn: !1,
            messageText: "我们来血拼吧",
            is_guest: 0
        }),
            appData.playerBoard.score.push({
                account_id: 0, nickname: "",
                account_score: 0,
                isBigWinner: 0
            });
    httpModule.getInfo()
};
var newGame = function () {
    appData.playerBoard = {
        score: [],
        round: 0,
        record: ""
    };
    appData.game.round = 0;
    appData.game.status = 1;
    appData.game.score = 0;
    appData.game.currentScore = 0;
    appData.game.cardDeal = 0;
    appData.game.can_open = 0;
    appData.game.is_play = !1;
    for (var e = 0; e < appData.player.length; e++)
        appData.playerBoard.score.push({
            account_id: 0,
            nickname: "",
            account_score: 0,
            isBigWinner: 0
        }),
            1 == appData.player[e].online_status ?
                (appData.player[e].account_status = 0, appData.player[e].playing_status = 0, appData.player[e].is_win = !1, appData.player[e].is_operation = !1, appData.player[e].win_type = 0, appData.player[e].win_show = !1, appData.player[e].card = [], appData.player[e].card_type = 0, appData.player[e].ticket_checked = 0, appData.player[e].account_score = 0, appData.player[e].current_win = 0, appData.player[e].is_showCard = !1, appData.player[e].is_readyPK = !1, appData.player[e].is_pk = !1) :
                appData.player[e] = {
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
                    current_win: 0,
                    is_operation: !1,
                    win_show: !1,
                    card: [],
                    is_showCard: !1,
                    is_pk: !1,
                    is_readyPK: !1,
                    card_type: 0,
                    is_guest: 0
                }
};
var connectSocket = function (e, t, a, n, o) {
    ws = new WebSocket(e), ws.onopen = t, ws.onmessage = a, ws.onclose = n, ws.onerror = o
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
    // var userDataStorage = localStorage.getItem('userData');
    // var userDataCookie = getC('userData');
    // if (userDataCookie) {
    //     var obj = JSON.parse(userDataCookie);
    //     var info = {
    //         "account_id": obj.account_id,
    //         "nickname": obj.nickname,
    //         "headimgurl": obj.headimgurl,
    //         "ticket_count": obj.card,
    //         "individuality": obj.individuality,
    //         "user_id": obj.user_id,
    //     };
    //     methods.setUserData(info);
    // } else {
    //     //socketModule.gAI();
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
            } else {
                viewMethods.clickShowAlert(7, obj.result_message);
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
                viewMethods.clickShowAlert(31, obj.result_message);
            } else {
                viewMethods.clickShowAlert(7, obj.result_message);
            }
        } else if (obj.operation == wsOperation.CreateRoom) {
            if (obj.result == -1) {
                window.location.href = window.location.href;
            } else if (obj.result == 1) {
                viewMethods.clickShowAlert(1, obj.result_message);
            }

        } else if (obj.operation == wsOperation.RefreshRoom) {
            window.location.href = window.location.href;
        } else if (obj.operation == "setIndividuality") {
            methods.showResultTextFunc('设置失败');
        }
        appData.player[0].is_operation = false;
    } else {
        if (obj.operation == wsOperation.RefreshRoom) {
            reloadView();
            appData.player[0].is_operation = !1;
        } else if (obj.operation == wsOperation.PrepareJoinRoom) {
            socketModule.processPrepareJoinRoom(obj)
        } else if (obj.operation == wsOperation.JoinRoom) {
            socketModule.processJoinRoom(obj)
        } else if (obj.operation == wsOperation.RefreshRoom) {
            socketModule.processRefreshRoom(obj)
        } else if (obj.operation == wsOperation.AllGamerInfo) {
            socketModule.processAllGamerInfo(obj)
        } else if (obj.operation == wsOperation.UpdateGamerInfo) {
            socketModule.processUpdateGamerInfo(obj)
        } else if (obj.operation == wsOperation.UpdateAccountStatus) {
            socketModule.processUpdateAccountStatus(obj)
        } else if (obj.operation == wsOperation.StartLimitTime) {
            socketModule.processStartLimitTime(obj)
        } else if (obj.operation == wsOperation.CancelStartLimitTime) {
            socketModule.processCancelStartLimitTime(obj)
        } else if (obj.operation == wsOperation.GameStart) {
            socketModule.processGameStart(obj)
        } else if (obj.operation == wsOperation.NotyChooseChip) {
            socketModule.processNotyChooseChip(obj)
        } else if (obj.operation == wsOperation.UpdateAccountScore) {
            socketModule.processUpdateAccountScore(obj)
        } else if (obj.operation == wsOperation.OpenCard) {
            socketModule.processOpenCard(obj)
        } else if (obj.operation == wsOperation.Win) {
            socketModule.processWin(obj)
        } else if (obj.operation == wsOperation.autoCreateRoom) {
            socketModule.processAutoCreateRoom(obj)
        } else if (obj.operation == wsOperation.Discard) {
            socketModule.processDiscard(obj)
        } else if (obj.operation == wsOperation.BroadcastVoice) {
            socketModule.processBroadcastVoice(obj)
        } else if (obj.operation == wsOperation.CreateRoom) {
            socketModule.processCreateRoom(obj)
        } else if (obj.operation == wsOperation.PkCard) {
            socketModule.processPKCard(obj)
        } else if (obj.operation == wsOperation.CardInfo) {
            socketModule.processCardInfo(obj)
        } else if (obj.operation == wsOperation.GuestRoom) {
            socketModule.processGuestRoom(obj)
        } else if (obj.operation == wsOperation.AllGuestInfo) {
            socketModule.processAllGuestInfo(obj)
        } else if (obj.operation == wsOperation.UpdateGuestInfo) {
            socketModule.processUpdateGuestInfo(obj)
        } else if (obj.operation == "getScoreBoard") {
            socketModule.processGetScoreBoard(obj)
        } else if (obj.operation == "setIndividuality") {
            socketModule.processSetIndividuality(obj)
        } else if (obj.operation == "getAccountInfo") {
            socketModule.pGAI(obj)
        } else if (obj.operation == "getAccountCard") {
            socketModule.pGAC(obj)
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
    logMessage("websocket onerror："), logMessage(e), appData.connectOrNot = !1
};
var reconnectSocket = function () {
    if (appData.isReconnect && 4 != globalData.roomStatus) {
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
    playSound: function (e, t) {
        if ("backMusic" == e) {
            if (0 == audioInfo.backMusic)
                return
        } else if (0 == audioInfo.messageMusic) return;
        var n = this.audioBuffers[e];
        if (n) try {
            if (void 0 != WeixinJSBridge) {
                WeixinJSBridge.invoke("getNetworkType", {}, function (e) {
                    n.source = null;
                    n.source = audioModule.audioContext.createBufferSource();
                    n.source.buffer = n.buffer;
                    n.source.loop = !1;
                    var a = audioModule.audioContext.createGain();
                    1 == t ? (n.source.loop = !0, a.gain.value = .7) : a.gain.value = 1;
                    n.source.connect(a);
                    a.connect(audioModule.audioContext.destination);
                    n.source.start(0);
                });
            }
        } catch (e) {
            n.source = null;
            n.source = audioModule.audioContext.createBufferSource();
            n.source.buffer = n.buffer;
            n.source.loop = !1;
            var a = audioModule.audioContext.createGain();
            1 == t ? (n.source.loop = !0, a.gain.value = .7) : a.gain.value = 1;
            n.source.connect(a);
            a.connect(audioModule.audioContext.destination);
            n.source.start(0);
        }
    },
    initSound: function (e, t) {
        this.audioContext.decodeAudioData(e, function (e) {
            audioModule.audioBuffers[t] = {name: t, buffer: e, source: null},
            "backMusic" == t && (audioModule.audioOn = !0, appData.game.currentScore != appData.ruleInfo.xp_chip && audioModule.playSound(t, !0)),
            "zhangu" == t && appData.game.currentScore == appData.ruleInfo.xp_chip &&
            (audioModule.stopSound("backMusic"), audioModule.stopSound("zhangu"), audioModule.playSound("zhangu", !0))
        }, function (e) {
            logMessage("Error decoding file", e)
        })
    },
    loadAudioFile: function (e, t) {
        var a = new XMLHttpRequest;
        a.open("GET", e, !0), a.responseType = "arraybuffer",
            a.onload = function (e) {
                audioModule.initSound(a.response, t)
            }, a.send()
    },
    loadAllAudioFile: function () {
        if (4 != globalData.roomStatus && 1 != isLoadAudioFile) {
            isLoadAudioFile = !0,
                this.loadAudioFile(this.baseUrl + "files/audio/flowerxp/back.mp3", "backMusic");

            var e = ["5f.m4a", "40f.m4a", "2f.m4a", "4f.m4a", "8f.m4a", "16f.m4a", "10f.m4a", "20f.m4a", "audio1.m4a", "audio2.m4a", "audio3.m4a", "audio4.m4a", "audio5.m4a", "com.m4a", "lose.mp3", "win.mp3"];
            var t = ["5f", "40f", "2f", "4f", "8f", "16f", "10f", "20f", "audio1", "audio2", "audio3", "audio4", "audio5", "com", "lose", "win"];
            for (a = 0; a < e.length; a++)
                this.loadAudioFile(this.baseUrl + "files/audio/flowerxp/" + e[a], t[a]);

            var n = ["50f.m4a", "100f.m4a", "200f.m4a", "30f.m4a", "60f.m4a", "80f.m4a", "120f.m4a", "150f.m4a", "160f.m4a", "250f.m4a", "300f.m4a", "400f.m4a", "500f.m4a", "600f.m4a", "800f.m4a", "1000f.m4a", "bloody.m4a", "zhangu.m4a"];
            var o = ["50f", "100f", "200f", "30f", "60f", "80f", "120f", "150f", "160f", "250f", "300f", "400f", "500f", "600f", "800f", "1000f", "bloody", "zhangu"];
            for (a = 0; a < n.length; a++)
                this.loadAudioFile(this.baseUrl + "files/audio/flowerxp2/" + n[a], o[a]);

            var i = ["message9.m4a", "message10.m4a", "message11.m4a", "message1.m4a", "message2.m4a", "message3.m4a", "message4.m4a", "message5.m4a", "message6.m4a", "message7.m4a", "message8.m4a"];
            var r = ["message0", "message1", "message2", "message3", "message4", "message5", "message6", "message7", "message8", "message9", "message10"];
            for (a = 0; a < i.length; a++)
                this.loadAudioFile(this.baseUrl + "files/audio/soundxp/" + i[a], r[a])
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
            var e = ["table", "vinvite", "valert", "vmessage", "vshop", "vcreateRoom", "vroomRule", "endCreateRoom", "endCreateRoomBtn"];
            var t = e.length;
            for (a = 0; a < t; a++) {
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
    sitDown: viewMethods.clickSitDown,
    imReady: viewMethods.clickReady,
    hideMessage: viewMethods.hideMessage,
    closeEnd: viewMethods.closeEnd,
    messageOn: viewMethods.messageOn,
    // 自动准备
    autoReady() {
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
    hall: function () {
        DynLoading.goto('/');
    },
    reviewCard: function () {
        //window.location.href = cgr('gq', globalData.roomNumber, globalData.gameType, globalData.maxCount);
        window.location.href = Htmls.getReviewUrl(globalData.gameType, globalData.roomNumber);
    },
    closeHomeAlert: function () {
        appData.isShowHomeAlert = false;
    },
    selectCard: viewMethods.selectCard,
    quitPk: viewMethods.quitPk,
    choose: viewMethods.choose,
    cancelCreate: function () {
    },
    createCommit: function () {
    },
    selectChange: function (e, t) {
    },
    showGameRule: function () {
        4 != appData.roomStatus && (appData.ruleInfo.isShowRule = !0)
    },
    cancelGameRule: function () {
        appData.ruleInfo.isShowRule = !1
    },


    showAudioSetting: function () {
        appData.editAudioInfo.backMusic = appData.audioInfo.backMusic, appData.editAudioInfo.messageMusic = appData.audioInfo.messageMusic, appData.editAudioInfo.isShow = !0
    },
    cancelAudioSetting: function () {
        appData.editAudioInfo.isShow = !1
    },
    confirmAudioSetting: function (once) {

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

        if (1 == appData.audioInfo.backMusic) {
            if (appData.ruleInfo.xp_chip != appData.game.currentScore) {
                audioModule.stopSound("backMusic");
                audioModule.playSound("backMusic", !0);
            } else {    //血拼中
                audioModule.stopSound("zhangu");
                audioModule.playSound("zhangu", !0);
            }

        } else {
            audioModule.stopSound("backMusic");
            audioModule.stopSound("zhangu");
        }
    },
    setBackMusic: function () {
        0 == appData.editAudioInfo.backMusic ? appData.editAudioInfo.backMusic = 1 : appData.editAudioInfo.backMusic = 0
    },
    setMessageMusic: function () {
        0 == appData.editAudioInfo.messageMusic ? appData.editAudioInfo.messageMusic = 1 : appData.editAudioInfo.messageMusic = 0
    },

    reloadView: function () {
        reload()
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
    guestRoom: function () {
        appData.isShowGameAlert = !1;
        socketModule.sendGuestRoom()
    },
    hideGuests: function () {
        appData.showGuest = 0
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
};

var vueLife = {
    vmCreated: function () {
        logMessage("vmCreated"),
            resetState(),
            initView(),
        4 != globalData.roomStatus && $("#loading").hide(),
            $(".main").show(),
            setTimeout(function () {
                document.getElementById("tableBack").addEventListener("touchstart", function (e) {
                    e.preventDefault()
                }, !1)
            }, 10)
    },
    vmUpdated: function () {
        logMessage("vmUpdated")
    },
    vmMounted: function () {
        logMessage("vmMounted"), $("#marquee").css("opacity", 0), setTimeout(function () {
            $("#marquee").css("opacity", 1), $("#marquee").marquee({
                duration: globalData.notySpeed,
                gap: 50,
                delayBeforeStart: 0,
                direction: "left",
                duplicated: !0
            })
        }, 100)
    },
    vmDestroyed: function () {
        logMessage("vmDestroyed")
    }
};

appData.isShowIndividuality = false;
appData.isShowIndividualityError = false;
appData.individuality = userData.individuality;
appData.individualityError = "";
appData.userData = userData;
appData.isShowAlertTip = false;
appData.alertTipText = "";
appData.alertTipType = 1;

function checkIndividuality(e) {
    return !!/^[0-9a-zA-Z]*$/g.test(e);
}

httpModule.setIndividuality = function () {
    var postData = {
        "account_id": userData.account_id,
        "individuality": appData.individuality
    };
    console.log(postData);
    Vue.http.post(globalData.baseUrl + "account/setIndividuality", postData).then(function (e) {
        if (0 == e.body.result) {
            methods.showAlertTip("设置成功", 1);
            appData.isShowIndividuality = !1;
            appData.userData.individuality = appData.individuality;
        } else {
            appData.individualityError = e.body.result_message;
        }

    }, function (e) {
        appData.individualityError = "请求错误";
    });
}


methods.showAlertTip = function (e, t) {
    appData.isShowAlertTip = true;
    appData.alertTipText = e;
    appData.alertTipType = t;
    setTimeout(function () {
        appData.isShowAlertTip = !1;
    }, 1e3);
}

vm = new Vue({
    el: "#app-main",
    data: appData,
    methods: methods,
    created: vueLife.vmCreated,
    updated: vueLife.vmUpdated,
    mounted: vueLife.vmMounted,
    destroyed: vueLife.vmDestroyed
});

function preventDefaultFn(event) {
    event.preventDefault();
}

function disable_scroll() {
    $('body').on('touchmove', preventDefaultFn);
}

function enable_scroll() {
    $('body').off('touchmove', preventDefaultFn);
}

$(function () {
    function e() {
        document[t] ?
            (audioModule.audioOn = !1, audioModule.stopSound("backMusic"), audioModule.stopSound("zhangu")) :
            "true" !== sessionStorage.isPaused &&
            (audioModule.audioOn = !0, audioModule.stopSound("backMusic"), audioModule.stopSound("zhangu"),
                appData.ruleInfo.xp_chip != appData.game.currentScore ? audioModule.playSound("backMusic", !0) : audioModule.playSound("zhangu", !0))
    }

    $(".showRanking").click(function () {
        $(".Ranking").show()
    }),
        $(".hideRanking").click(function () {
            $(".Ranking").hide()
        }),
        sessionStorage.isPaused = "false";
    var t, a;
    void 0 !== document.hidden ?
        (t = "hidden", a = "visibilitychange") :
        void 0 !== document.webkitHidden && (t = "webkitHidden", a = "webkitvisibilitychange"),
        void 0 === document.addEventListener || void 0 === t ?
            alert("This demo requires a browser such as Google Chrome that supports the Page Visibility API.") :
            document.addEventListener(a, e, !1)
});
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
                });
                //$(document.body).off('touchmove');
                $("#loading").css({'background': '#071a45'});
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


4 == globalData.roomStatus && setTimeout(function () {
    try {
        var obj = eval("(" + globalData.scoreboard + ")");
        setTimeout(function () {
            socketModule.processLastScoreboard(obj)
        }, 0)
    } catch (e) {
        console.log(e), setTimeout(function () {
            socketModule.processLastScoreboard("")
        }, 0)
    }
}, 50);

var isLoadAudioFile = !1;


var shareContent = "";

function getShareContent() {

    shareContent += "[" + appData.ruleInfo.chip_list[0] / 2 + "/" + appData.ruleInfo.chip_list[0] +
        "," + appData.ruleInfo.chip_list[1] / 2 + "/" + appData.ruleInfo.chip_list[1] + "," + appData.ruleInfo.chip_list[2] / 2 + "/" + appData.ruleInfo.chip_list[2] +
        "," + appData.ruleInfo.chip_list[3] / 2 + "/" + appData.ruleInfo.chip_list[3] + "]";
    shareContent += " 底分:" + appData.ruleInfo.default_score;
    shareContent += " 可下注:" + appData.ruleInfo.bet_circle + "轮";
    shareContent += " 血拼:" + appData.ruleInfo.xp_chip + "分x" + appData.ruleInfo.xp_circle + "轮";
    1 == appData.ruleInfo.disable_pk && (shareContent += " 规则:闷牌，全场禁止比牌");
    appData.ruleInfo.look_cond > 0 && (shareContent += " 必闷" + appData.ruleInfo.look_cond + "轮");
    shareContent += "前" + appData.ruleInfo.pk_cond + "轮禁止比牌";
    2 == appData.ruleInfo.ticket_count ? shareContent += "  局数:12局" : shareContent += "  局数:24局";
}

var isLoadAudioFile = !1;
audioModule.loadAllAudioFile();
audioModule.audioOn = true;
audioModule.stopSound("backMusic");
audioModule.playSound("backMusic", true);
wx.ready(function () {
    audioModule.loadAllAudioFile(),
        wx.hideMenuItems({
            menuList: ["menuItem:copyUrl", "menuItem:share:qq", "menuItem:share:weiboApp", "menuItem:favorite", "menuItem:share:facebook", "menuItem:share:QZone", "menuItem:refresh"]
        }),
        getShareContent(),
        wx.onMenuShareTimeline({
            title: globalData.shareTitle,
            desc: shareContent,
            link: globalData.roomUrl,
            imgUrl: globalData.fileUrl + "files/images/nflowerxp/share_icon.png",
            success: function () {
            },
            cancel: function () {
            }
        }),
        wx.onMenuShareAppMessage({
            title: globalData.shareTitle,
            desc: shareContent,
            link: globalData.roomUrl,
            imgUrl: globalData.fileUrl + "files/images/nflowerxp/share_icon.png",
            success: function () {
            },
            cancel: function () {
            }
        })
});
wx.error(function (e) {
});