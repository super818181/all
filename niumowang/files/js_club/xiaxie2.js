var ws;
var game = {
    room: 0,
    room_number:
    globalData.roomNumber,
    room_url: 0,
    status: 0,
    time: -1,
    round: 0,
    total_num: 12,
    show_coin: !1,
    show_score: !1,
    show_bettext: !1,
    bet: {
        account_bet: "",
        game_bet: "",
        num: []
    },
    dice_point: 0,
    dice_array: [],
    dicelight_array: [],
    circle: 0,
    is_shake: 0,
    last6: []
};
var message = [
    { "num": 0, "text": "快点吧，我等到花儿也谢了" },
    { "num": 1, "text": "我出去叫人" },
    { "num": 2, "text": "你的牌好靓哇" },
    { "num": 3, "text": "我当年横扫澳门九条街" },
    { "num": 4, "text": "算你牛逼"},
    { "num": 5, "text": "别吹牛逼，有本事干到底"},
    { "num": 6, "text": "输得裤衩都没了" },
    { "num": 7, "text": "我给你们送温暖了" },
    { "num": 8, "text": "谢谢老板" },
    { "num": 9, "text": "我来啦，让你们久等了" },
    { "num": 10, "text": "我出去一下，马上回来，等我哦" },
    { "num": 11, "text": "怎么断线了，网络太差了" },
    { "num": 12, "text": "搏一搏，单车变摩托" }
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
    UpdateAccountScore: "UpdateAccountScore",
    Win: "Win",
    ChooseChip: "ChooseChip",
    GrabBanker: "GrabBanker",
    PlayerMultiples: "PlayerMultiples",
    UpdateAccountShow: "UpdateAccountShow",
    UpdateAccountMultiples: "UpdateAccountMultiples",
    StartBet: "StartBet",
    StartShow: "StartShow",
    RefreshRoom: "PullRoomInfo",
    BroadcastVoice: "BroadcastVoice",
    GameHistory: "HistoryScoreboard",
    GameOver: "GameOver",
    BreakRoom: "BreakRoom",
    ShowCard: "ShowCard",
    StartShake: "StartShake",
    BankerShake: "BankerShake",
    EndShake: "EndShake"
};
var httpModule = {
    getInfo: function () {
        reconnectSocket();
        appData.is_connect = true;
        // var postData = {
        //     "account_id": userData.accountId,
        //     "room_number": globalData.roomNumber,
        //     "game_type": globalData.gameType
        // };
        // Vue.http.post(globalData.baseUrl+'friend/getRoomerInfo', postData).then(function (response) {
        //
        //     var bodyData = response.body;
        //     if (bodyData.result == 0) {
        //         if (bodyData.data.length == 0) {
        //             reconnectSocket();
        //             appData.is_connect = true;
        //         } else {
        //             appData.activity = bodyData.data.concat();
        //             viewMethods.clickShowAlert(5, appData.activity[0].content);
        //         }
        //     } else {
        //         appData.ownerUser.nickname = bodyData.data.nickname;
        //         appData.ownerUser.avatar = bodyData.data.headimgurl;
        //         appData.ownerUser.user_code = bodyData.data.user_code;
        //         appData.applyStatus = bodyData.data.apply_status;
        //         appData.add_user = true;
        //         viewMethods.clickShowAlert(8, bodyData.result_message);
        //     }
        //
        // }, function (response) {
        //     logMessage(response.body);
        // });
    },
    applyToJoin:function(){
        var postData={ "account_id":userData.accountId, "user_code":appData.ownerUser.user_code };
        Vue.http.post(globalData.baseUrl+"friend/applyToJoin",postData).then(function(e){
            if(0==e.body.result){
                methods.showAlertTip("已经发送申请",1);
                appData.isShowIndividuality=!1;
                appData.applyStatus = e.body.data.apply_status;
                appData.userData.individuality=appData.individuality;
            } else {
                appData.individualityError=e.body.result_message;
            }

        },function(e){
            appData.individualityError="请求错误";
        });
    },
    setIndividuality: function () {
        var postData = {"account_id": userData.accountId, "individuality": appData.individuality};
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
    },
    applyClub: function () {
        var postData = {"account_id": userData.accountId, "club_account_id": appData.applyInfo.club_id};
        $.ajax({
            type: "POST",
            url: '/clubapi/joinclub',
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
        if (ws)
            try {
                ws.close()
            } catch (e) {
                console.log(e)
            }
    },
    sendData: function (e) {
        try {
            if (console.log("websocket state：" + ws.readyState), ws.readyState == WebSocket.CLOSED)
                return void reconnectSocket();
            ws.readyState == WebSocket.OPEN ?
                ws.send(JSON.stringify(e)) :
                ws.readyState == WebSocket.CONNECTING ?
                    setTimeout(function () {
                        socketModule.sendData(e)
                    }, 500) :
                    console.log("websocket state：" + ws.readyState)
        } catch (e) {
            console.log(e)
        }
    },
    sendTest: function () {
    },
    sendPrepareJoinRoom: function () {
        socketModule.sendData({
            operation: wsOperation.PrepareJoinRoom,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_number: globalData.roomNumber
            }
        })
    },
    sendGameHistory: function () {
        socketModule.sendData({
            operation: wsOperation.GameHistory,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_number: globalData.roomNumber
            }
        })
    },
    sendJoinRoom: function () {
        socketModule.sendData({
            operation: wsOperation.JoinRoom,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_number: globalData.roomNumber
            }
        })
    },
    sendRefreshRoom: function () {
        socketModule.sendData({
            operation: wsOperation.RefreshRoom,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_id: appData.game.room
            }
        })
    },
    sendReadyStart: function () {
        socketModule.sendData({
            operation: wsOperation.ReadyStart,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_id: appData.game.room
            }
        })
    },
    sendGameOver: function () {
        socketModule.sendData({
            operation: wsOperation.GameOver,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_id: appData.game.room
            }
        })
    },
    sendBroadcastVoice: function (e) {
        socketModule.sendData({
            operation: wsOperation.BroadcastVoice,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_id: appData.game.room,
                voice_num: e
            }
        })
    },
    sendGrabBanker: function (e) {
        socketModule.sendData({
            operation: wsOperation.GrabBanker,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_id: appData.game.room,
                is_grab: "1",
                multiples: e
            }
        })
    },
    sendNotGrabBanker: function () {
        socketModule.sendData({
            operation: wsOperation.GrabBanker,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_id: appData.game.room,
                is_grab: "0",
                multiples: "1"
            }
        })
    },
    sendThrowBet: function (p, s) {
        socketModule.sendData({
            operation: wsOperation.PlayerMultiples,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_id: appData.game.room,
                bet_num: p,
                score: s
            }
        })
    },
    sendBankerShake: function () {
        if (!appData.shaking) {
            viewMethods.bankerShake();
            socketModule.sendData({
                operation: wsOperation.BankerShake,
                account_id: userData.accountId,
                session: globalData.session,
                data: {
                    room_id: appData.game.room
                }
            });
        }
    },
    sendEndShake: function () {
        socketModule.sendData({
            operation: wsOperation.EndShake,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_id: appData.game.room
            }
        })
    },
    sendShowCard: function () {
        socketModule.sendData({
            operation: wsOperation.ShowCard,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_id: appData.game.room
            }
        })
    },
    processGameHistory: function (e) {
        appData.recordList = [];
        for (var t = 0; t < e.data.length; t++)
            appData.recordList.push({
                time: getLocalTime(e.data[t].time),
                scoreboard: e.data[t].scoreboard
            });
        appData.isShowRecord = !0
    },
    processGameRule: function (e) {
        appData.ruleInfo.chip_type = e.data.chip_type;
        appData.ruleInfo.upper_limit = e.data.upper_limit;
        appData.ruleInfo.rule_value1 = e.data.rule_value1;
        appData.ruleInfo.ticket_type = e.data.ticket_type;
        appData.ruleInfo.banker_mode = 1;
        appData.game.total_num = e.data.total_num;
    },
    processPrepareJoinRoom: function (obj) {
        if(obj.data.is_club){
            if(obj.data.is_club==1){
                // viewMethods.clickShowAlert(1, '无法加入，请联系管理员');
                appData.isShowApply = true;
                appData.applyInfo.club_headimgurl = obj.data.club_headimgurl;
                appData.applyInfo.club_name = obj.data.club_name;
                appData.applyInfo.club_id = obj.data.room_creator;
                return;
            }
        }
        if (obj.data.room_status == 4) {
            appData.roomStatus = obj.data.room_status;
            viewMethods.clickShowAlert(2, obj.result_message);
            return;
        }

        this.processGameRule(obj); //复用处理规则

        wxModule.config();

        if (obj.data.room_status == 3) {
            return;
        }


        //观战功能
        if(obj.data.is_member){
            socketModule.sendJoinRoom();
        } else {
            if(obj.data.can_join){
                if(obj.data.can_guest){
                    appData.joinType=1;
                    if(obj.data.room_users.length >= 1){
                        obj.data.alert_text = "房间里有" + obj.data.room_users.join("、") + "，是否加入？";
                    } else {
                        obj.data.alert_text = "";
                    }
                } else {
                    appData.joinType=2;
                    if(obj.data.room_users.length >= 1){
                        obj.data.alert_text = "观战人数已满，房间里有" + obj.data.room_users.join("、") + "，是否加入游戏？";
                    } else {
                        obj.data.alert_text = "";
                    }
                }
            } else { //不能加入游戏
                if(obj.data.can_guest){
                    appData.joinType=3;
                    if(obj.data.room_users.length>=1){
                        obj.data.alert_text="游戏人数已满，是否加入观战?";
                    } else {
                        obj.data.alert_text="";
                    }
                } else {
                    appData.joinType=4;
                    obj.data.alert_text="游戏和观战人数已满";
                }
            }
            if(obj.data.room_users.length >= 1){
                appData.alertType = 4;
                appData.alertText = obj.data.room_users;
                appData.isShowGameAlert = true;
            }else{
                socketModule.sendJoinRoom();
            }
        }
    },
    processRefreshRoom: function (e) {
        resetAllPlayerData();
        appData.player[0].serial_num = e.data.serial_num;
        for (t = 0; t < 12; t++)
            if (t <= 12 - e.data.serial_num) {
                appData.player[t].serial_num = t + Math.ceil(e.data.serial_num);
            } else {
                appData.player[t].serial_num = t + Math.ceil(e.data.serial_num) - 12;
            }
        appData.player[0].account_status = Math.ceil(e.data.account_status);
        appData.player[0].account_score = Math.ceil(e.data.account_score);
        appData.player[0].nickname = userData.nickname;
        appData.player[0].headimgurl = userData.avatar;
        appData.player[0].account_id = userData.accountId;
        appData.player[0].serial_num = e.data.serial_num;
        appData.player[0].ticket_checked = e.data.ticket_checked;
        for (var t = 0; t < 12; t++)
            for (var n = 0; n < e.all_gamer_info.length; n++)
                if (appData.player[t].serial_num == e.all_gamer_info[n].serial_num) {
                    appData.player[t].nickname = e.all_gamer_info[n].nickname;
                    appData.player[t].headimgurl = e.all_gamer_info[n].headimgurl;
                    appData.player[t].account_code = e.all_gamer_info[n].account_code;
                    appData.player[t].account_id = e.all_gamer_info[n].account_id;
                    appData.player[t].account_score = Math.ceil(e.all_gamer_info[n].account_score);
                    appData.player[t].account_status = Math.ceil(e.all_gamer_info[n].account_status);
                    appData.player[t].online_status = Math.ceil(e.all_gamer_info[n].online_status);
                    appData.player[t].ticket_checked = e.all_gamer_info[n].ticket_checked;
                    appData.player[t].multiples = e.all_gamer_info[n].multiples;

                    if (1 == e.all_gamer_info[n].is_banker) {
                        appData.player[t].is_banker = !0;
                        appData.bankerAccountId = e.all_gamer_info[n].account_id;
                        appData.bankerPlayer = appData.player[t];
                    } else {
                        appData.player[t].is_banker = !1;
                    }
                }

        if (6 == appData.player[0].account_status) {
            appData.showRob = !1;
            appData.showRobText = !1;
            if (1 == appData.player[0].is_banker) {
                appData.showBankerCoinText = !0;
            } else {
                appData.showBankerCoinText = !1;
            }
        }
        if (6 == appData.player[0].account_status) {
            appData.isFinishBankerAnimate = !0;
        }
        viewMethods.resetMyAccountStatus();
        viewMethods.updateAllPlayerStatus();
    },
    processBreakRoom: function (e) {
        if (appData.breakData = e, appData.game.round != appData.game.total_num)
            return null == e || void 0 == e ? (appData.overType = 2,
                    void viewMethods.clickShowAlert(9, "庄家分数不足，提前下庄，点击确定查看结算")) :
                void(1 == e.data.type ? appData.player[0].is_banker ?
                    (viewMethods.clickCloseAlert(), null != appData.breakData && void 0 != appData.breakData &&
                    viewMethods.gameOverNew(appData.breakData.data.score_board, appData.breakData.data.balance_scoreboard),
                        chooseBigWinner(), $(".ranking .rankBack").css("opacity", "1"),
                        $(".roundEndShow").show(),
                        $(".ranking").show(),
                        canvas()) :
                    (appData.overType = 1, viewMethods.clickShowAlert(9, "庄家主动下庄,点击确定查看结算")) :
                    appData.overType = e.data.type)
    },
    processAllGamerInfo: function (e) {
        for (n = 0; n < 12; n++)
            for (var t = 0; t < e.data.length; t++)
                if (appData.player[n].serial_num == e.data[t].serial_num) {
                    appData.player[n].nickname = e.data[t].nickname;
                    appData.player[n].headimgurl = e.data[t].headimgurl;
                    appData.player[n].account_id = e.data[t].account_id;
                    appData.player[n].account_code = e.data[t].account_code;
                    appData.player[n].account_score = Math.ceil(e.data[t].account_score);
                    appData.player[n].account_status = Math.ceil(e.data[t].account_status);
                    appData.player[n].online_status = Math.ceil(e.data[t].online_status);
                    appData.player[n].ticket_checked = e.data[t].ticket_checked;

                    if (1 == e.data[t].is_banker) {
                        appData.player[n].is_banker = !0;
                        appData.bankerAccountId = e.data[t].account_id;
                        appData.bankerPlayer = appData.player[n];
                    } else {
                        appData.player[n].is_banker = !1;
                    }
                }

        if ("" != appData.scoreboard) {
            for (var n = 0; n < 9; n++)
                for (s in appData.scoreboard)
                    if (appData.player[n].account_id == s) {
                        appData.playerBoard.score[n].num = appData.player[n].num;
                        appData.playerBoard.score[n].account_id = appData.player[n].account_id;
                        appData.playerBoard.score[n].nickname = appData.player[n].nickname;
                        appData.playerBoard.score[n].account_score = Math.ceil(appData.scoreboard[s]);
                    }
            2 == appData.game.status ?
                appData.playerBoard.round = appData.game.round - 1 :
                appData.playerBoard.round = appData.game.round
        }
        if (6 == appData.player[0].account_status) {
            appData.showRob = !1;
            appData.showRobText = !1;
            appData.showBankerCoinText = (1 == appData.player[0].is_banker) ? !0 : !1;

            appData.isFinishBankerAnimate = !0;
        }
        viewMethods.resetMyAccountStatus();
        viewMethods.updateAllPlayerStatus();
    },
    processUpdateGamerInfo: function (e) {
        logMessage(appData.player);
        for (var t = 0; t < 12; t++)
            appData.player[t].serial_num == e.data.serial_num ?
                (appData.player[t].nickname = e.data.nickname,
                    appData.player[t].headimgurl = e.data.headimgurl,
                    appData.player[t].account_code = e.data.account_code,
                    appData.player[t].account_id = e.data.account_id,
                    appData.player[t].account_score = Math.ceil(e.data.account_score),
                    appData.player[t].account_status = Math.ceil(e.data.account_status),
                    appData.player[t].online_status = Math.ceil(e.data.online_status),
                    appData.player[t].ticket_checked = e.data.ticket_checked) :
                appData.player[t].account_id == e.data.account_id && socketModule.sendRefreshRoom()
    },
    processUpdateAccountStatus: function (e) {
        for (var t = 0; t < 12; t++)
            if (appData.player[t].account_id == e.data.account_id) {
                appData.player[t].account_status = Math.ceil(e.data.account_status);
                if (appData.player[t].account_status >= 8)
                    return void(appData.player[t].online_status = e.data.online_status);
                if (1 == e.data.online_status) {
                    appData.player[t].account_status = Math.ceil(e.data.account_status);
                } else if (0 == e.data.online_status && 0 == appData.player[t].account_status) {
                    appData.player[t].account_id = 0,
                        appData.player[t].online_status = 0,
                        appData.player[t].nickname = "",
                        appData.player[t].headimgurl = "",
                        appData.player[t].account_score = 0
                } else if (0 == e.data.online_status && appData.player[t].account_status > 0) {
                    appData.player[t].account_status = Math.ceil(e.data.account_status),
                        appData.player[t].online_status = 0
                } else {
                    logMessage("account_status:" + e)
                }
                if (0 != t) {
                    if (4 == appData.player[t].account_status) {
                        setTimeout(function () {
                            mp3AudioPlay("audioNoBanker")
                        }, 100);
                    } else if (5 == appData.player[t].account_status) {
                        setTimeout(function () {
                            mp3AudioPlay("audioRobBanker")
                        }, 100);
                    }
                }
                break;
            }
        if (3 == appData.player[0].account_status) {
            viewMethods.showRobBankerText();
        }

        if (appData.isFinishBankerAnimate && appData.isFinishWinAnimate) {
            viewMethods.resetMyAccountStatus();
            viewMethods.updateAllPlayerStatus();
        } else {
            setTimeout(function () {
                viewMethods.resetMyAccountStatus(),
                    viewMethods.updateAllPlayerStatus()
            }, 3e3);
        }
    },
    processStartLimitTime: function (e) {
        e.data.limit_time > 1 &&
        (appData.game.time = Math.ceil(e.data.limit_time),
            viewMethods.timeCountDown())
    },
    processCancelStartLimitTime: function (e) {
        appData.game.time = -1
    },
    processJoinRoom: function (e) {
        appData.game.room = e.data.room_id,
            appData.game.room_url = e.data.room_url,
            appData.game.round = Math.ceil(e.data.game_num),
            appData.game.total_num = Math.ceil(e.data.total_num),
            appData.canBreak = Math.ceil(e.data.can_break),
            appData.game.dice_point = Math.ceil(e.data.dice_point),
            appData.game.dice_array = e.data.dice_array.concat(),
            appData.game.last6 = e.data.dice_result.concat(),
            appData.game.bet.account_bet = e.data.account_bet,
            appData.game.bet.game_bet = e.data.game_bet,
            appData.game.circle = parseInt(e.data.circle),
            appData.game.is_shake = e.data.is_shake,
            resetAllPlayerData(),
            appData.myBet = 0;
        for (n in appData.game.bet.account_bet)
            appData.myBet += parseInt(appData.game.bet.account_bet[n]);
        appData.player[0].serial_num = e.data.serial_num;
        for (var t = 0; t < 12; t++) {
            if (t <= 12 - e.data.serial_num) {
                appData.player[t].serial_num = t + Math.ceil(e.data.serial_num);
            } else {
                appData.player[t].serial_num = t + Math.ceil(e.data.serial_num) - 12;
            }
        }


        appData.player[0].account_status = Math.ceil(e.data.account_status),
            appData.player[0].account_score = Math.ceil(e.data.account_score),
            appData.player[0].nickname = userData.nickname,
            appData.player[0].headimgurl = userData.avatar,
            appData.player[0].account_id = userData.accountId,
            appData.player[0].ticket_checked = e.data.ticket_checked,
            appData.game.status = Math.ceil(e.data.room_status),
            appData.scoreboard = e.data.scoreboard,
            viewMethods.resetMyAccountStatus()
    },
    processGameStart: function (e) {
        $(".memberCoin").stop(!0),
            appData.isFinishWinAnimate = !0,
            appData.isFinishBankerAnimate = !0,
            appData.coinSelect = 0,
            $(".betArea").empty(),
            appData.kaishai = 0,
            appData.myBet = 0,
            appData.game.status = 1,
            appData.game.circle = 1,
            appData.game.time = -1,
            appData.game.is_shake = 0,
            appData.game.bet.account_bet = "",
            appData.game.bet.game_bet = "",
            appData.game.round = appData.game.round + 1,
            appData.game.round = Math.ceil(e.game_num),
            appData.game.dice_point = 0,
            appData.game.dice_array = [];
        for (t = 0; t < 8; t++) {
            appData.game.bet.account_bet[t] = 0;
            appData.game.bet.game_bet[t] = 0;
            appData.game.bet.num[t] = t;
            appData.game.dicelight_array[t] = !1;
        }


        appData.showClockRobText = !1;
        appData.breakData = null;
        for (var t = 0; t < 12; t++) {
            appData.player[t].is_operation = !1;
            if (0 == appData.player[t].online_status) {
                appData.player[t].account_status = 1;
            }
            for (var n = 0; n < e.data.length; n++)
                if (appData.player[t].account_id == e.data[n].account_id) {

                    appData.player[t].ticket_checked = 1,
                        appData.player[t].account_status = Math.ceil(e.data[n].account_status),
                        appData.player[t].online_status = Math.ceil(e.data[n].online_status),
                        appData.player[t].limit_time = Math.ceil(e.data[n].limit_time)
                }
        }
        appData.game.status = 2;
        viewMethods.resetMyAccountStatus();
        viewMethods.updateAllPlayerStatus();
        if (-1 != e.limit_time) {
            appData.game.time = Math.ceil(e.limit_time);
            viewMethods.timeCountDown();
        }
    },
    processStartShake: function (e) {
        appData.game.circle = 2,
            appData.game.is_shake = 0;
        setTimeout(function () {
            for (var t = 0; t < 12; t++)
                for (var n = 0; n < e.data.length; n++) {
                    if (appData.player[t].account_id == e.data[n].account_id) {
                        appData.player[t].account_status = Math.ceil(e.data[n].account_status);
                        appData.player[t].online_status = Math.ceil(e.data[n].online_status);
                        appData.player[t].multiples = 0;
                        if (1 == e.data[n].is_banker) {
                            appData.player[t].is_banker = !0;
                            appData.bankerAccountId = e.data[n].account_id;
                            appData.bankerPlayer = appData.player[t];
                        } else {
                            appData.player[t].is_banker = !1;
                        }
                    }
                }

            appData.bankerArray = e.grab_array.concat();
            appData.showRob = !1;
            appData.showClockRobText = !1;
            appData.game.time = Math.ceil(e.limit_time);
            appData.bankerAnimateIndex = 0;
            appData.game.time = -1;
            if (5 == appData.ruleInfo.banker_mode && appData.game.round > 1) {
                viewMethods.robBankerWithoutAnimate();
            } else {
                viewMethods.clearBanker();
                viewMethods.robBankerAnimate(e);
            }
        }, 0);
    },
    processBankerShake: function (e) {
        if (e.data.account_id == appData.player[0].account_id && 0 != appData.game.is_shake) {

        } else {
            viewMethods.bankerShake();
        }
        appData.game.is_shake = 1;
    },
    processStartBet: function (e) {
        m4aAudioPlay("xiazhu"),
            appData.game.circle = 3;
        for (var t = 0; t < 12; t++)
            if (6 == appData.player[t].account_status) {
                appData.player[t].account_status = 7;
            }
        appData.game.time = -1;
        if (-1 != e.limit_time) {
            appData.game.time = Math.ceil(e.limit_time);
            viewMethods.timeCountDown();
        }
    },
    processUpdateAccountMultiples: function (e) {
        for (var t = 0; t < appData.player.length; t++)
            if (appData.player[t].account_id == e.data.account_id) {
                viewMethods.throwCoin(e.data.bet_num, appData.player[t].num, e.data.score);
                appData.player[t].account_score = appData.player[t].account_score - e.data.score;
                if (0 == t) {
                    appData.game.bet.account_bet = e.data.account_bet;
                    appData.myBet = 0;
                    for (n in appData.game.bet.account_bet)
                        appData.myBet = appData.myBet + parseInt(appData.game.bet.account_bet[n])
                }
                break;
            }
        appData.game.bet.game_bet = e.data.game_bet;
    },
    processStartShow: function (e) {
        appData.game.circle = 4;
        for (var t = 0; t < 12; t++)
            if (7 == appData.player[t].account_status) {
                appData.player[t].account_status = 8;
            }
        appData.game.time = -1;
        if (-1 != e.limit_time) {
            appData.game.time = Math.ceil(e.limit_time);
            viewMethods.timeCountDown();
        }
    },
    processUpdateAccountShow: function (e) {
        appData.game.dice_point = Math.ceil(e.data.dice_point),
            appData.game.dice_array = e.data.dice_array.concat(),
            m4aAudioPlay("kaizhong")
    },
    processWin: function (e) {
        appData.game.round = Math.ceil(e.data.game_num),
            appData.game.total_num = Math.ceil(e.data.total_num),
            appData.playerBoard.round = Math.ceil(e.data.game_num),
            appData.game.show_score = !1,
            viewMethods.showMemberScore(!1);
        for (var t = 0; t < appData.player.length; t++) {
            if (appData.player[t].account_status >= 7) {
                appData.player[t].account_status = 9;
            }
            for (var n = 0; n < e.data.loser_array.length; n++)
                if (appData.player[t].account_id == e.data.loser_array[n].account_id) {
                    appData.player[t].single_score = e.data.loser_array[n].score;
                    break;
                }
            for (var a = 0; a < e.data.winner_array.length; a++)
                if (appData.player[t].account_id == e.data.winner_array[a].account_id) {
                    appData.player[t].single_score = e.data.winner_array[a].score;
                    break;
                }
        }
        appData.game.time = -1;
        viewMethods.updateAllPlayerStatus();
        setTimeout(function () {
            viewMethods.resetMyAccountStatus();
        }, 200);
        viewMethods.kaishai();
        setTimeout(function () {
            appData.game.last6.push({
                num: appData.game.round,
                dice: appData.game.dice_array.concat(),
                point: appData.game.dice_point
            });
            viewMethods.winAnimate(e);
        }, 5e3);
    },
    processBroadcastVoice: function (e) {
        for (var t = 0; t < 12; t++)
            appData.player[t].account_id == e.data.account_id &&
            0 != t && (m4aAudioPlay("message" + e.data.voice_num),
                viewMethods.messageSay(t, e.data.voice_num))
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
            if (userData.accountId == u[s].account_id) {
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
    processLastScoreboard: function (e) {
        if (void 0 != e) {
            console.log(e);
            try {
                var t = new Date(1e3 * parseInt(e.time));
                var a = t.getFullYear() + "-";
                var n = t.getMonth() + 1 + "-";
                var r = t.getDate() + " ";
                var o = t.getHours();
                var i = t.getMinutes();
                var c = ":";
                if (i < 10) {
                    c += 0;
                }
                var l = a + n + r + o + c + i;
                appData.playerBoard.round = e.game_num;
                appData.playerBoard.record = l;
                appData.playerBoard.score = [];
                if (void 0 != e.total_num && null != e.total_num && "" != e.total_num) {
                    appData.game.total_num = e.total_num;
                }
                var u = e.scoreboard;
                for (s in u) {
                    var p = 0;
                    if (userData.accountId == u[s].account_id) {
                        p = 1;
                    }
                    appData.playerBoard.score.push({
                        "account_id": u[s].account_id,
                        "nickname": u[s].name,
                        "account_score": Math.ceil(u[s].score),
                        "num": p,
                        "avatar": u[s].avatar
                    });
                }
                chooseBigWinner();
                $(".ranking .rankBack").css("opacity", "1");
                $(".roundEndShow").show();
                $(".ranking").show();
                canvas();
                $("#endCreateRoomBtn").show();
            } catch (e) {
                console.log(e);
            }
        }
    }
};

var viewMethods = {
    showHomeAlert: function() {
        appData.isShowHomeAlert = true;
    },
    clickShowCard: function () {
        socketModule.sendShowCard()
    },
    clickGameOver: function () {
        viewMethods.clickShowAlert(10, "下庄之后，将以当前战绩进行结算。是否确定下庄？")
    },
    clickShowAlert: function (e, t) {
        appData.alertType = e,
            appData.alertText = t,
            appData.isShowAlert = !0,
            setTimeout(function () {
                var t = $(".alertText").height(), n = t;
                t < .15 * height && (t = .15 * height), t > .8 * height && (t = .8 * height);
                var a = t + .056 * height * 2 + .022 * height + .056 * height;
                8 == e && (a = a - .022 * height - .056 * height);
                var i = t + .034 * height * 2, o = .022 * height + (i - n) / 2;
                $(".alert .mainPart").css("height", a + "px"),
                    $(".alert .mainPart").css("margin-top", "-" + a / 2 + "px"),
                    $(".alert .mainPart .backImg .blackImg").css("height", i + "px"),
                    $(".alert .mainPart .alertText").css("top", o + "px")
            }, 0)
    },
    clickCloseAlert: function () {
        if (22 == appData.alertType) {
            appData.isShowAlert = !1;
            appData.isShowGameAlert = false;
            httpModule.getInfo();
        } else {
            appData.isShowAlert = !1;
            appData.isShowGameAlert = false;
        }
    },
    clickSitDown: function () {
        appData.isShowAlert = !1;
            appData.isShowGameAlert = false;
            socketModule.sendJoinRoom()
    },
    clickReady: function () {
        socketModule.sendReadyStart(),
            appData.player[0].is_operation = !0
    },
    resetMyAccountStatus: function () {
        (6 != appData.player[0].account_status || appData.isFinishBankerAnimate) &&
        (viewMethods.resetShowButton(),
            3 == appData.player[0].account_status ?
                appData.showRob = !0 : 4 == appData.player[0].account_status ?
                appData.showNotRobText = !0 : 5 == appData.player[0].account_status ?
                    appData.showRobText = !0 : 6 == appData.player[0].account_status && 1 == appData.player[0].is_banker &&
                    (appData.showBankerCoinText = !0))
    },
    resetShowButton: function () {
        appData.showRob = !1,
            appData.showNotRobText = !1,
            appData.showRobText = !1,
            appData.showBankerCoinText = !1
    },
    gameOverNew: function (e, t) {
        appData.game.show_coin = !1,
            $(".betArea").empty(),
            appData.game.dice_point = 0,
            appData.game.dice_array = [],
            appData.game.circle = 0,
            appData.kaishai = 0,
            appData.myBet = 0,
            appData.game.bet.account_bet = "",
            appData.game.bet.game_bet = "";
        for (i = 0; i < 8; i++) {
            appData.game.bet.account_bet[i] = 0;
            appData.game.bet.game_bet[i] = 0;
            appData.game.bet.num[i] = i;
            appData.game.dicelight_array[i] = !1;
        }

        for (i = 0; i < appData.playerBoard.score.length; i++) {
            appData.playerBoard.score[i].num = 0;
            appData.playerBoard.score[i].account_id = 0;
            appData.playerBoard.score[i].nickname = "";
            appData.playerBoard.score[i].account_score = 0;
            appData.playerBoard.score[i].account_code = "";
            appData.playerBoard.score[i].isBigWinner = 0;
        }

        for (i = 0; i < 12; i++)
            for (s in e)
                if (appData.player[i].account_id == s) {
                    appData.player[i].account_score = Math.ceil(e[s]);
                    appData.playerBoard.score[i].num = appData.player[i].num;
                    appData.playerBoard.score[i].account_id = appData.player[i].account_id;
                    appData.playerBoard.score[i].nickname = appData.player[i].nickname;
                    appData.playerBoard.score[i].account_score = appData.player[i].account_score;
                    appData.playerBoard.score[i].account_code = appData.player[i].account_code;
                }
        //console.log(appData.playerBoard.score[0].account_code);
        var n = new Date;
        var a = "";
        a += n.getFullYear() + "-", a += n.getMonth() + 1 + "-",
            a += n.getDate() + "  ", a += n.getHours() + ":",
            n.getMinutes() >= 10 ? a += n.getMinutes() : a += "0" + n.getMinutes(),
            appData.playerBoard.record = a;

        if (void 0 != t && "-1" != t) {
            console.log(t);
            socketModule.processBalanceScoreboard(t);
        }
        for (var i = 0; i < 12; i++) {
            appData.player[i].is_win = !1;
            appData.player[i].is_operation = !1;
            appData.player[i].win_type = 0;
            appData.player[i].win_show = !1;
            appData.player[i].multiples = 0;
        }

        appData.game.status = 1;
        appData.showClockRobText = !1;
    },
    showMessage: function () {
        appData.isShowNewMessage = !0,
            disable_scroll()
    },
    hideMessage: function () {
        appData.isShowNewMessage = !1,
            enable_scroll()
    },
    messageOn: function (e) {
        socketModule.sendBroadcastVoice(e),
            m4aAudioPlay("message" + e),
            viewMethods.messageSay(0, e),
            viewMethods.hideMessage()
    },
    messageSay: function (e, t) {
        appData.player[e].messageOn = !0,
            appData.player[e].messageText = appData.message[t].text,
            setTimeout(function () {
                appData.player[e].messageOn = !1
            }, 2500)
    },
    closeEnd: function () {
    },
    roundEnd: function () {
        window.location.href = globalData.baseUrl+'home/xx?i='+globalData.roomNumber+'_&v='+(new Date().getTime());
    },
    updateAllPlayerStatus: function () {
        for (var e = 0; e < appData.player.length; e++)
            appData.player[e].multiples > 0 &&
            (appData.player[e].timesImg = globalData.fileUrl + "files/images/bull/text_times" + appData.player[e].multiples + ".png"),

                4 == appData.player[e].account_status ?
                    5 == appData.ruleInfo.banker_mode ?
                        appData.player[e].robImg = globalData.fileUrl + "files/images/bull/text_notgo.png" :
                        appData.player[e].robImg = globalData.fileUrl + "files/images/bull/text_notrob.png" :
                    5 == appData.player[e].account_status ?
                        5 == appData.ruleInfo.banker_mode ?
                            appData.player[e].robImg = globalData.fileUrl + "files/images/bull/text_go.png" :
                            appData.player[e].robImg = globalData.fileUrl + "files/images/bull/text_rob.png" :
                        6 == appData.player[e].account_status && appData.player[e].multiples
    },
    timeCountDown: function () {
        if (1 != isTimeLimitShow)
            return appData.game.time <= 0 ?
                (isTimeLimitShow = !1, 0) :
                (isTimeLimitShow = !0, appData.game.time--, void(timeLimit = setTimeout(function () {
                    isTimeLimitShow = !1,
                        viewMethods.timeCountDown()
                }, 1e3)))
    },
    clickRobBanker: function (e) {
        viewMethods.showRobBankerText(),
            socketModule.sendGrabBanker(e),
            setTimeout(function () {
                mp3AudioPlay("audioRobBanker")
            }, 10)
    },
    showRobBankerText: function () {
        appData.showRob = !1,
            appData.showNotRobText = !1,
            appData.showRobText = !0,
            appData.showBankerCoinText = !1
    },
    showNotRobBankerTextFnc: function () {
        appData.showRob = !1,
            appData.showNotRobText = !0,
            appData.showRobText = !1,
            appData.showBankerCoinText = !1
    },
    clickNotRobBanker: function () {
        viewMethods.showNotRobBankerTextFnc(),
            socketModule.sendNotGrabBanker(),
            setTimeout(function () {
                mp3AudioPlay("audioNoBanker")
            }, 10)
    },
    clearBanker: function () {
        for (var e = 0; e < appData.player.length; e++)
            appData.player[e].is_banker = !1;
        appData.isFinishBankerAnimate = !1;
        var t = 2 * appData.bankerArray.length;
        if (appData.bankerArray.length < 6) {
            appData.bankerAnimateDuration = parseInt(1500 / t);
        } else {
            appData.bankerAnimateDuration = parseInt(2500 / t)
        }
    },
    robBankerWithoutAnimate: function () {
        for (var e = 0; e < appData.player.length; e++)
            appData.player[e].account_id == appData.bankerAccountId ?
                (appData.player[e].is_banker = !0,
                    bankerNum = appData.player[e].num) :
                appData.player[e].is_banker = !1,
                $("#bankerAnimate" + appData.player[e].num).hide(),
                $("#bankerAnimate0" + appData.player[e].num).hide();
        setTimeout(function () {
            appData.game.show_coin = !0,
                appData.showClockRobText = !1,
                appData.isFinishBankerAnimate = !0,
                viewMethods.resetMyAccountStatus(),
                viewMethods.updateAllPlayerStatus()
        }, 10),
            appData.game.time = 11,
        appData.game.time > 0 && viewMethods.timeCountDown()
    },
    robBankerAnimate: function (e) {
        for (a = 0; a < appData.bankerArray.length; a++) {
            i = "#banker" + appData.bankerArray[a];
            $(i).hide()
        }
        var t = 2 * appData.bankerArray.length;
        if (appData.bankerAnimateCount >= t || appData.bankerAnimateIndex < 0 || appData.bankerArray.length < 2) {
            appData.bankerAnimateCount = 0,
                appData.bankerAnimateIndex = -1;
            i = "#banker" + appData.bankerAccountId;
            $(i).show();
            for (var n = "",
                     a = 0; a < appData.player.length; a++)
                appData.player[a].account_id == appData.bankerAccountId ?
                    (appData.player[a].is_banker = !0, n = appData.player[a].num) :
                    appData.player[a].is_banker = !1,
                    $("#bankerAnimate" + appData.player[a].num).hide(),
                    $("#bankerAnimate0" + appData.player[a].num).hide();
            return $(i).hide(),
                $("#bankerAnimate" + n).css(
                    {
                        top: "-0.1vh",
                        left: "-0.1vh",
                        width: "6.2vh",
                        height: "6.2vh"
                    }),
                $("#bankerAnimate0" + n).css({
                    top: "-1vh",
                    left: "-1vh",
                    width: "8vh",
                    height: "8vh"
                }),
                $("#bankerAnimate" + n).show(),
                $("#bankerAnimate0" + n).show(),
                $("#bankerAnimate0" + n).animate({
                    top: "-1vh",
                    left: "-1vh",
                    width: "8vh",
                    height: "8vh"
                }, 400, function () {
                    $("#bankerAnimate0" + n).animate({
                        top: "-0.1vh",
                        left: "-0.1vh",
                        width: "6.2vh",
                        height: "6.2vh"
                    }, 400, function () {
                        $("#bankerAnimate0" + n).hide()
                    })
                }),
                void $("#bankerAnimate" + n).animate({
                    top: "-1.5vh",
                    left: "-1.5vh",
                    width: "9vh",
                    height: "9vh"
                }, 400, function () {
                    $("#bankerAnimate" + n).animate({
                            top: "-0.1vh", left: "-0.1vh", width: "6.2vh", height: "6.2vh"
                        }
                        , 400, function () {
                            $("#bankerAnimate" + n).hide(),
                                setTimeout(function () {
                                    if (appData.game.show_coin = !0,
                                        appData.showClockRobText = !1,
                                        appData.isFinishBankerAnimate = !0,
                                    5 == appData.ruleInfo.banker_mode) {
                                        for (var t = 0; t < e.data.length; t++)
                                            for (var n = 0; n < appData.player.length; n++)
                                                appData.player[n].account_id == e.data[t].account_id &&
                                                (appData.player[n].account_score = e.data[t].account_score);
                                        1 != appData.game.round &&
                                        (viewMethods.resetMyAccountStatus(),
                                                viewMethods.updateAllPlayerStatus()
                                        )
                                    } else viewMethods.resetMyAccountStatus(),
                                        viewMethods.updateAllPlayerStatus()
                                }, 10),
                                appData.game.time = 11,
                            appData.game.time > 0 && viewMethods.timeCountDown()
                        })
                })
        }
        var i = "#banker" + appData.bankerArray[appData.bankerAnimateIndex];
        $(i).show(),
            appData.lastBankerImgId = i,
            appData.bankerAnimateCount++,
            appData.bankerAnimateIndex++,
        appData.bankerAnimateIndex >= appData.bankerArray.length && (appData.bankerAnimateIndex = 0),
            setTimeout(function () {
                    viewMethods.robBankerAnimate(e)
                },
                appData.bankerAnimateDuration)
    },
    showMemberScore: function (e) {
        e ? ($(".memberScoreText1").show(),
                $(".memberScoreText2").show(),
                $(".memberScoreText3").show(),
                $(".memberScoreText4").show(),
                $(".memberScoreText5").show(),
                $(".memberScoreText6").show(),
                $(".memberScoreText7").show(),
                $(".memberScoreText8").show(),
                $(".memberScoreText9").show(),
                $(".memberScoreText10").show(),
                $(".memberScoreText11").show(),
                $(".memberScoreText12").show()) :
            ($(".memberScoreText1").hide(),
                $(".memberScoreText2").hide(),
                $(".memberScoreText3").hide(),
                $(".memberScoreText4").hide(),
                $(".memberScoreText5").hide(),
                $(".memberScoreText6").hide(),
                $(".memberScoreText7").hide(),
                $(".memberScoreText8").hide(),
                $(".memberScoreText9").hide(),
                $(".memberScoreText10").hide(),
                $(".memberScoreText11").hide(),
                $(".memberScoreText10").hide())
    },
    winAnimate: function (e) {
        appData.isFinishWinAnimate = !1;
        var t = new Array;
        var n = new Array;
        appData.bankerPlayerNum = appData.bankerPlayer.num;
        for (a = 0; a < e.data.winner_array.length; a++)
            for (i = 0; i < appData.player.length; i++)
                if (e.data.winner_array[a].account_id == appData.player[i].account_id) {
                    if (appData.player[i].num == appData.bankerPlayer.num) {
                        isBankerWin = !0;
                        appData.bankerPlayerNum = appData.player[i].num;
                    } else {
                        t.push(appData.player[i].num);
                    }
                }
        for (a = 0; a < e.data.loser_array.length; a++)
            for (i = 0; i < appData.player.length; i++)
                if (e.data.loser_array[a].account_id == appData.player[i].account_id && appData.player[i].num != appData.bankerPlayerNum) {
                    n.push(appData.player[i].num);
                }

        viewMethods.resetCoinsPosition();
        $("#playerCoins").show();
        for (a = 1; a <= 12; a++)
            viewMethods.showCoins(a, !1);

        //把赢家玩家金币暂时放到庄家位置
        for (a = 0; a < t.length; a++)
            for (i = 0; i < 4; i++)
                $(".memberCoin" + t[a] + i).css(memCoin[appData.bankerPlayerNum]);
        //显示输家金币
        for (a = 0; a < n.length; a++)
            viewMethods.showCoins(n[a], !0);
        //输家金币给庄家
        for (var a = 0; a < n.length; a++) {
            for (var i = 0; i < 4; i++)
                $(".memberCoin" + n[a] + i).animate(memCoin[appData.bankerPlayerNum], 1000 + 300 * i);
            setTimeout(function () {
                mp3AudioPlay("audioCoin")
            }, 10);
        }
        var wintime = 100;
        totaltime = 100;
        if (n.length >= 1) {
            wintime = 1800;
            totaltime = t.length >= 1 ? 3600 : 1800;
        } else {
            t.length >= 1 && (totaltime = 1800);
        }

        if (t.length >= 1) {
            setTimeout(function () {
                //显示赢家金币
                for (e = 0; e < n.length; e++)
                    viewMethods.showCoins(n[e], !1);
                for (e = 0; e < t.length; e++)
                    viewMethods.showCoins(t[e], !0);
                for (var e = 0; e < t.length; e++)
                    for (var a = 0; a < 4; a++)
                        $(".memberCoin" + t[e] + a).animate(memCoin[t[e]], 1000 + 300 * a);

                setTimeout(function () {
                    mp3AudioPlay("audioCoin")
                }, 10);
            }, wintime);
        }
        setTimeout(function () {
            viewMethods.finishWinAnimate(e)
        }, totaltime);
    },
    finishWinAnimate: function (e) {
        $("#playerCoins").hide();
        appData.game.show_score = !0;
        $(".memberScoreText1").fadeIn(200),
            $(".memberScoreText2").fadeIn(200),
            $(".memberScoreText3").fadeIn(200),
            $(".memberScoreText4").fadeIn(200),
            $(".memberScoreText5").fadeIn(200),
            $(".memberScoreText6").fadeIn(200),
            $(".memberScoreText7").fadeIn(200),
            $(".memberScoreText8").fadeIn(200),
            $(".memberScoreText9").fadeIn(200),
            $(".memberScoreText10").fadeIn(200),
            $(".memberScoreText11").fadeIn(200),
            $(".memberScoreText12").fadeIn(200, function () {
                if (5 == appData.ruleInfo.banker_mode)
                    if (1 != appData.isBreak)
                        viewMethods.gameOverNew(e.data.score_board, e.data.balance_scoreboard);
                    else
                        for (var t = 0; t < 12; t++)
                            for (s in e.data.score_board)
                                appData.player[t].account_id == s &&
                                (appData.player[t].account_score = Math.ceil(e.data.score_board[s]));
                else
                    viewMethods.gameOverNew(e.data.score_board, e.data.balance_scoreboard);
                setTimeout(function () {
                    $(".memberScoreText1").fadeOut("slow"),
                        $(".memberScoreText2").fadeOut("slow"),
                        $(".memberScoreText3").fadeOut("slow"),
                        $(".memberScoreText4").fadeOut("slow"),
                        $(".memberScoreText5").fadeOut("slow"),
                        $(".memberScoreText6").fadeOut("slow"),
                        $(".memberScoreText7").fadeOut("slow"),
                        $(".memberScoreText8").fadeOut("slow"),
                        $(".memberScoreText9").fadeOut("slow"),
                        $(".memberScoreText10").fadeOut("slow"),
                        $(".memberScoreText11").fadeOut("slow"),
                        $(".memberScoreText12").fadeOut("slow");
                    if (5 == appData.ruleInfo.banker_mode && 1 == appData.isBreak)
                        appData.overType = 2,
                            setTimeout(function () {
                                viewMethods.clickShowAlert(9, "庄家分数不足，提前下庄，点击确定查看结算")
                            }, 1e3);
                    else
                        for (var e = 0; e < 12; e++)
                            appData.player[e].account_status >= 6 && 5 != ruleInfo.banker_mode &&
                            (appData.player[e].is_banker = !1, appData.player[e].account_id == appData.bankerID &&
                            (appData.player[e].is_banker = !0)), appData.player[e].account_status = 1
                }, 2e3);
                appData.isFinishWinAnimate = !0;
                if (5 != appData.ruleInfo.banker_mode) {
                    if (e.data.total_num == e.data.game_num) {
                        setTimeout(function () {
                            viewMethods.roundEnd();
                            newNum = e.data.room_number;
                        }, 1e3);
                    }
                } else {
                    if (1 == appData.isBreak) {

                    } else {
                        if (e.data.total_num == e.data.game_num)
                            setTimeout(function () {
                                viewMethods.roundEnd();
                                newNum = e.data.room_number;
                            }, 1e3);
                    }
                }
            });
        // 自动准备
        setTimeout(function(){
            if(appData.isAutoReady==1){
                viewMethods.clickReady()
            }
        },3000)
    },
    resetCoinsPosition: function () {
        for (var e = 1; e <= 12; e++)
            for (var t = 0; t < 4; t++)
                $(".memberCoin" + e + t).css(memCoin[e]);
    },
    showCoins: function (e, t) {
        if (t) for (n = 0; n < 4; n++) $(".memberCoin" + e + n).show();
        else for (var n = 0; n < 4; n++) $(".memberCoin" + e + n).hide()
    },
    throwCoin: function (e, t, n) {
        console.log(e, t, n);
        var a, i;
        1 == e ?
            (a = .235 * appData.width, i = .45 * appData.height + .005 * appData.width) : 2 == e ?
            (a = .235 * appData.width, i = .45 * appData.height + .23 * appData.width) : 3 == e ?
                (a = .395 * appData.width, i = .45 * appData.height + .23 * appData.width) : 4 == e ?
                    (a = .555 * appData.width, i = .45 * appData.height + .23 * appData.width) : 5 == e ?
                        (a = .72 * appData.width, i = .45 * appData.height + .23 * appData.width) : 6 == e ?
                            (a = .72 * appData.width, i = .45 * appData.height + .005 * appData.width) : 7 == e ?
                                (a = .72 * appData.width, i = .45 * appData.height - .23 * appData.width) : 8 == e &&
                                (a = .235 * appData.width, i = .45 * appData.height - .23 * appData.width),
            a += (.1 * Math.random() - .05) * appData.width,
            i += (.1 * Math.random() - .05) * appData.width, $(".betArea").append("<div class='coin coinN" + appData.coinNum + " position" + t + "  coinType" + n + "' ></div>"),
            $(".coinN" + appData.coinNum).animate({
                marginLeft: a + "px",
                marginTop: i + "px",
                top: 0,
                left: 0
            }, 400, "easeBoth"),
            appData.coinNum++
    },
    selectCoin: function (e) {
        appData.coinSelect = e
    },
    bankerShake: function () {
        appData.game.is_shake = 1;
        appData.shaking = !0;
        $(".zhong1").addClass("shake-rotate");
        m4aAudioPlay("yaoshai");
        setTimeout(function () {
            $(".zhong1").removeClass("shake-rotate");
            appData.shaking = !1;
        }, 1000);
    },
    throwBet: function (e) {
        if (7 == appData.player[0].account_status && !appData.player[0].is_banker && appData.coinSelect > 0) {
            socketModule.sendThrowBet(e, appData.coinSelect);
        }
    },
    shortAlert: function (e) {
        appData.shortAlert.text = e, appData.shortAlert.isShow = !0,
            setTimeout(function () {
                appData.shortAlert.isShow = !1
            }, 800)
    },
    kaishai: function () {
        setTimeout(function () {
            $(".zhong2 .top").addClass("move"),
                appData.kaishai = 1,
                setTimeout(function () {
                    appData.kaishai = 2,
                        appData.game.dicelight_array[appData.game.dice_array[0] - 1] = !0,
                        m4aAudioPlay("s" + appData.game.dice_array[0]),
                        setTimeout(function () {
                            appData.kaishai = 3,
                                appData.game.dicelight_array[appData.game.dice_array[1] - 1] = !0,
                                m4aAudioPlay("s" + appData.game.dice_array[1]),
                                setTimeout(function () {
                                    appData.kaishai = 4,
                                        appData.game.dicelight_array[appData.game.dice_array[2] - 1] = !0, m4aAudioPlay("s" + appData.game.dice_array[2]),
                                        appData.game.dice_point < 11 ?
                                            appData.game.dicelight_array[6] = !0 :
                                            appData.game.dicelight_array[7] = !0,
                                        setTimeout(function () {
                                            m4aAudioPlay("point" + appData.game.dice_point)
                                        }, 800)
                                }, 800)
                        }, 800)
                }, 1400)
        }, 10)
    }
};

var fileDealerNum = "d_30", width = window.innerWidth, height = window.innerHeight, numD = 0, isTimeLimitShow = !1;
var isBankerWin = !1, timesOffset = (.9 * width - .088 * height * 4 - .02 * width * 3) / 2;
var coinLeft1 = .045 * height + "px";
var coinLeft2 = "90%";
var coinLeft3 = "90%";
var coinLeft4 = "90%";
var coinLeft5 = "90%";
var coinLeft6 = "80%";
var coinLeft7 = "47%";
var coinLeft8 = "8vh";
var coinLeft9 = .045 * height + "px";
var coinLeft10 = .045 * height + "px";
var coinLeft11 = .045 * height + "px";
var coinLeft12 = .045 * height + "px";

//  1   2   3   4   5   6 7 8    9  10  11  12
//[82% 62% 50% 39% 27% 9% 4% 9% 27% 39% 50% 62%]

var memCoin = [
    {},
    {top: '82%', left: coinLeft1},
    {top: '62%', left: coinLeft2},
    {top: '50%', left: coinLeft2},
    {top: '39%', left: coinLeft2},
    {top: '27%', left: coinLeft2},
    {top: '9%', left: coinLeft6},
    {top: '4%', left: coinLeft7},
    {top: '9%', left: coinLeft8},
    {top: '27%', left: coinLeft9},
    {top: '39%', left: coinLeft9},
    {top: '50%', left: coinLeft9},
    {top: '62%', left: coinLeft9}
];

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
        top: "69%",
        left: "5%",
        width: "90%",
        height: "11vh",
        overflow: "hidden"
    },
    singleButton: {
        position: "absolute",
        top: "0px",
        left: "0px",
        width: "100%",
        height: .0495 * height + "px",
        "line-height": .0495 * height + "px",
        "text-align": "center",
        color: "white",
        "font-size": "2.2vh",
        "font-weight": "bold"
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
    chip_type: 1,
    upper_limit: 100,
    rule_value1: 1,
    ticket_type: 1,
    rule_height: "4vh"
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
    localStorage.backMusic = 1, localStorage.messageMusic ?
    (editAudioInfo.messageMusic = localStorage.messageMusic, audioInfo.messageMusic = localStorage.messageMusic) :
    localStorage.messageMusic = 1;
// 自动准备
var setReady = 0;
if(localStorage.isAutoReady==1&&localStorage.roomNumber==globalData.roomNumber){
    setReady=1
}else{
    setReady=0
}
var appData = {
    myBet: 0,
    kaishai: 0,
    shortAlert: {
        isShow: !1,
        text: ""
    },
    joinType:0,
    add_user:false,
    'isShowGameAlert': false,
    ownerUser:{
        nickname:"",
        avatar:"",
        user_code:0
    },
    isShowApply: false,
    applyInfo: {
        club_headimgurl: '',
        club_name: '',
        club_id: '',
        status: '确定'
    },
    applyStatus:0, //0尚未申请  1加好友申请中
    isAutoReady:setReady, //自动准备
    'isShowHomeAlert': false,
    'isShowNewMessage': false,
    shaking: !1,
    coinSelect: 0,
    coinNum: 0,
    roomer: {
        name: '',
        account_code: ''
    },
    user_id: userData.id,
    viewStyle: viewStyle,
    roomStatus: globalData.roomStatus,
    width: window.innerWidth,
    height: window.innerHeight,
    roomCard: Math.ceil(globalData.card),
    is_connect: !1,
    player: [],
    scoreboard: "",
    activity: [],
    isShowAlert: !1,

    'isShowIndividuality': false,
    'isShowIndividualityError': false,
    'individuality': userData.individuality,
    'individualityError': "",
    'userData': userData,
    'isShowAlertTip': false,
    'alertTipText': "",
    'alertTipType': 1,

    isShowNewMessage: !1,
    alertType: 0,
    alertText: "",
    showRob: !1,
    showRobText: !1,
    showNotRobText: !1,
    showClockRobText: !1,
    showBankerCoinText: !1,
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
    isShowNoteImgA: !1,
	'musicOnce': true		
};

if (void 0 != globalData.isNotyMsg && null != globalData.isNotyMsg) {
    appData.notyMsg = globalData.notyMsg;
    if (1 == globalData.isNotyMsg) {
        appData.isShowNoty = !0;
        setTimeout(function () {
            appData.isShowNoty = !1
        }, 1000 * globalData.notyTime);
    }
} else {
    globalData.isNotyMsg = 0;
}

var resetState = function () {
    appData.game.show_score = !1, appData.game.show_bettext = !1;
    for (t = 0; t < 12; t++) {
        appData.player.push({
            num: t + 1,
            serial_num: t + 1,
            account_id: 0,
            account_status: 0,
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
            is_banker: !1,
            multiples: 0,

            combo_point: 0,
            timesImg: "",
            account_code: "",
            bankerTimesImg: "",
            robImg: "",
            single_score: 0,
            messageOn: !1,
            messageText: "",
            coins: []
        });
        appData.playerBoard.score.push({
            account_id: 0,
            nickname: "",
            account_score: 0,
            isBigWinner: 0
        });
    }

    for (t = 0; t < appData.player.length; t++) {
        appData.player[t].coins = [];
        for (var e = 0; e < 4; e++)
            appData.player[t].coins.push("memberCoin" + appData.player[t].num + e)
    }
    httpModule.getInfo();
    for (var t = 0; t < 8; t++)
        appData.game.bet.account_bet[t] = 0,
            appData.game.bet.game_bet[t] = 0,
            appData.game.bet.num[t] = t
};
var resetAllPlayerData = function () {
    appData.player = [];
    for (e = 0; e < 12; e++)
        appData.player.push({
            num: e + 1,
            serial_num: e + 1,
            account_id: 0,
            account_status: 0,
            online_status: 0,
            nickname: "",
            headimgurl: "",
            account_score: 0,
            ticket_checked: 0,
            is_win: !1,
            win_type: 0,
            limit_time: 0,
            account_code: 0,
            is_operation: !1,
            win_show: !1,
            is_banker: !1,
            multiples: 0,

            combo_point: 0,
            timesImg: "",
            bankerTimesImg: "",
            robImg: "",
            single_score: 0,
            messageOn: !1,
            messageText: "我们来血拼吧",
            coins: []
        });
    for (var e = 0; e < appData.player.length; e++) {
        appData.player[e].coins = [];
        for (var t = 0; t < 4; t++)
            appData.player[e].coins.push("memberCoin" + appData.player[e].num + t)
    }
};
var newGame = function () {
    appData.playerBoard = {
        score: new Array,
        round: 0,
        record: ""
    },
        appData.game.round = 0,
        appData.game.status = 1,
        appData.game.show_score = !1,
        appData.game.show_bettext = !1;
    for (var e = 0; e < appData.player.length; e++)
        appData.playerBoard.score.push({
            account_id: 0,
            nickname: "",
            account_score: 0,
            isBigWinner: 0
        }),
            1 == appData.player[e].online_status ?
                (appData.player[e].account_status = 0,
                    appData.player[e].is_win = !1,
                    appData.player[e].is_operation = !1,
                    appData.player[e].win_type = 0,
                    appData.player[e].win_show = !1,
                    appData.player[e].ticket_checked = 0,
                    appData.player[e].account_score = 0,
                    appData.player[e].is_banker = !1,
                    appData.player[e].multiples = 0,
                    appData.player[e].combo_point = 0,
                    appData.player[e].timesImg = "",
                    appData.player[e].bankerTimesImg = "",
                    appData.player[e].robImg = "",
                    appData.player[e].single_score = 0,
                    appData.player[e].num = e + 1) :
                appData.player[e] = {
                    num: e + 1,
                    serial_num: appData.player[e].serial_num,
                    account_id: 0,
                    account_status: 0,
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
                    is_banker: !1,
                    multiples: 0,
                    combo_point: 0,
                    timesImg: "",
                    bankerTimesImg: "",
                    robImg: "",
                    single_score: 0
                }
};
var connectSocket = function (e, t, n, a, i) {
    ws = new WebSocket(e);
    ws.onopen = t;
    ws.onmessage = n;
    ws.onclose = a;
    ws.onerror = i;
};
var wsOpenCallback = function (e) {
    logMessage("websocket is opened"),
        appData.connectOrNot = !0,
    appData.heartbeat && clearInterval(appData.heartbeat),
        appData.heartbeat = setInterval(function () {
            appData.socketStatus = appData.socketStatus + 1,
            appData.socketStatus > 1 && (appData.connectOrNot = !1),
            appData.socketStatus > 4 && appData.isReconnect && reload(),
            ws.readyState == WebSocket.OPEN && ws.send("@")
        }, 3e3),
        socketModule.sendPrepareJoinRoom()
};
var wsMessageCallback = function wsMessageCallback(evt) {
    appData.connectOrNot = !0;
    if ("@" == evt.data) {
        appData.socketStatus = 0;
        return 0;
    }
    var obj = eval("(" + evt.data + ")");
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
                viewMethods.clickShowAlert(7, obj.result_message);
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
                viewMethods.clickShowAlert(7, obj.result_message);
            }
        } else if (obj.operation == wsOperation.RefreshRoom) {
            reload();
        } else if (obj.operation == wsOperation.PlayerMultiples) {
            if (-1 == obj.result) {
                viewMethods.shortAlert(obj.result_message);
            }
        }
        appData.player[0].is_operation = !1;
    } else {
        switch (obj.operation) {
            case wsOperation.PrepareJoinRoom:
                socketModule.processPrepareJoinRoom(obj);
                break;
            case wsOperation.GameHistory:
                socketModule.processGameHistory(obj);
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
            case wsOperation.StartShake:
                socketModule.processStartShake(obj);
                break;
            case wsOperation.BankerShake:
                socketModule.processBankerShake(obj);
                break;
            case wsOperation.BreakRoom:
                socketModule.processBreakRoom(obj);
                break;
            default:
                logMessage(obj.operation);
                break;
        }
    }
};
var wsCloseCallback = function (e) {
    logMessage("websocket closed："),
        logMessage(e), appData.connectOrNot = !1,
        reconnectSocket()
};
var wsErrorCallback = function (e) {
    logMessage("websocket onerror："),
        logMessage(e)
};
var reconnectSocket = function () {
    if (appData.isReconnect && 4 != globalData.roomStatus) {
        if (ws) {
            if (logMessage(ws.readyState),
            1 == ws.readyState)
                return;
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
            if (0 == audioInfo.backMusic) return
        } else if (0 == audioInfo.messageMusic)
            return;
        var n = this.audioBuffers[e];
        if (n) 
		   try {
            void 0 != WeixinJSBridge && WeixinJSBridge.invoke("getNetworkType", {}, function (e) {
                n.source = null,
                    n.source = audioModule.audioContext.createBufferSource(),
                    n.source.buffer = n.buffer,
                    n.source.loop = !1;
                var a = audioModule.audioContext.createGain();
                1 == t ? (n.source.loop = !0, a.gain.value = .7) :
                    a.gain.value = 1,
                    n.source.connect(a),
                    a.connect(audioModule.audioContext.destination), n.source.start(0)
            })
        } 
	   catch (e) {
                n.source = null,
                    n.source = audioModule.audioContext.createBufferSource(),
                    n.source.buffer = n.buffer,
                    n.source.loop = !1;
                var a = audioModule.audioContext.createGain();
                1 == t ? (n.source.loop = !0, a.gain.value = .7) :
                    a.gain.value = 1,
                    n.source.connect(a),
                    a.connect(audioModule.audioContext.destination), n.source.start(0)
        }
    },
    initSound: function (e, t) {
        this.audioContext.decodeAudioData(e, function (e) {
            audioModule.audioBuffers[t] = {
                name: t,
                buffer: e,
                source: null
            },
            "backMusic" == t && (audioModule.audioOn = !0, audioModule.playSound(t, !0))
        }, function (e) {
            logMessage("Error decoding file", e)
        })
    },
    loadAudioFile: function (e, t) {
        var n = new XMLHttpRequest;
        n.open("GET", e, !0);
        n.responseType = "arraybuffer";
        n.onload = function (e) {
            audioModule.initSound(n.response, t)
        };
        n.send();
    },
    loadAllAudioFile: function () {
        if (4 != globalData.roomStatus && 1 != isLoadAudioFile) {
            isLoadAudioFile = !0;
            for (var e = ["nobanker.m4a", "robbanker.m4a", "point3.m4a", "point4.m4a", "point5.m4a", "point6.m4a", "point7.m4a",
                    "point8.m4a", "point9.m4a", "point10.m4a", "point11.m4a", "point12.m4a", "point13.m4a", "point14.m4a", "point15.m4a", "point16.m4a", "point17.m4a", "point18.m4a",
                    "s1.m4a", "s2.m4a", "s3.m4a", "s4.m4a", "s5.m4a", "s6.m4a", "yaoshai.m4a", "xiazhu.m4a", "kaizhong.m4a", "coin.mp3", "background9.mp3"],
                     t = ["audioNoBanker", "audioRobBanker", "point3", "point4", "point5", "point6", "point7", "point8", "point9", "point10", "point11", "point12",
                         "point13", "point14", "point15", "point16", "point17", "point18", "s1", "s2", "s3", "s4", "s5", "s6", "yaoshai", "xiazhu", "kaizhong", "audioCoin", "backMusic"],
                     n = 0; n < e.length; n++)
                this.loadAudioFile(this.baseUrl + "files/audio/xiaxie/" + e[n], t[n]);
            for (var a = ["message0.m4a", "message1.m4a", "message2.m4a", "message3.m4a", "message4.m4a", "message5.m4a", "message6.m4a", "message7.m4a", "message8.m4a", "message9.m4a", "message10.m4a", "message11.m4a", "message12.m4a", "message13.m4a", "message14.m4a", "message15.m4a", "message16.m4a", "message17.m4a", "message18.m4a", "message19.m4a", "message20.m4a", "message21.m4a"],
                     i = ["message0", "message1", "message2", "message3", "message4", "message5", "message6", "message7", "message8", "message9", "message10", "message11", "message12", "message13", "message14", "message15", "message16", "message17", "message18", "message19", "message20", "message21"], n = 0; n < a.length; n++)
                this.loadAudioFile(this.baseUrl + "files/audio/sound/" + a[n], i[n])
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
            for (var e = ["table", "vinvite", "valert", "vmessage", "vshop", "vcreateRoom", "vroomRule", "endCreateRoom", "endCreateRoomBtn"],
                     t = e.length, n = 0; n < t; n++) {
                var a = document.getElementById(e[n]);
                a && a.addEventListener("touchmove", function (e) {
                    e.preventDefault()
                }, !1)
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
        }
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
//         copyLink.value = copyTitle +window.location.href;
//         var str=window.location.pathname
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
    showHomeAlert: viewMethods.showHomeAlert,
    shortAlert: viewMethods.shortAlert,
    throwBet: viewMethods.throwBet,
    shakeT: socketModule.sendBankerShake,
    shakeF: socketModule.sendEndShake,
    selectCoin: viewMethods.selectCoin,
    clickGameOver: viewMethods.clickGameOver,
    showAlert: viewMethods.clickShowAlert,
    showMessage: viewMethods.showMessage,
    closeAlert: viewMethods.clickCloseAlert,
    sitDown: viewMethods.clickSitDown,
    imReady: viewMethods.clickReady,
    robBanker: viewMethods.clickRobBanker,
    showCard: viewMethods.clickShowCard,
    hideMessage: viewMethods.hideMessage,
    closeEnd: viewMethods.closeEnd,
    messageOn: viewMethods.messageOn,
    showNoteImgA: function () {
        appData.isShowNoteImgA = !0
    },
    hideNoteImgA: function () {
        appData.isShowNoteImgA = !1
    },
    hall: function () {
        window.location.href = globalData.hallPath;
    },
    applyClub: function () {
        httpModule.applyClub();
    },
    // 自动准备
    autoReady(){
        if(appData.isAutoReady==1){
            appData.isAutoReady=0
            localStorage.setItem("isAutoReady",0)
            localStorage.removeItem("roomNumber")
        }else{
            appData.isAutoReady=1
            viewMethods.clickReady()
            localStorage.setItem("isAutoReady",1)
            localStorage.setItem("roomNumber",globalData.roomNumber)
        }
    },
    closeHomeAlert: function(){
        appData.isShowHomeAlert = false;
    },
    reviewCard: function () {
        window.location.href = globalData.baseUrl + 'game/queryCard?type=' + globalData.gameType + '&num=' + globalData.roomNumber;
    },
    showIndividuality: function () {
        appData.individualityError = "";
        appData.isShowIndividuality = true;
    },
    hideIndividuality: function () {
        appData.isShowIndividuality = false;
    },
    setIndividuality: function () {
        if (appData.individuality.length > 6 || appData.individuality.length < 1) {
            appData.individualityError = "请输入1-6位英文或数字防伪码";
            appData.isShowIndividualityError = !0;
        } else if (checkIndividuality(appData.individuality)) {
            appData.individualityError = "";
            httpModule.setIndividuality();
        } else {
            appData.individualityError = "请输入1-6位英文或数字防伪码";
            appData.isShowIndividualityError = !0;
        }
    },
    individualityChange: function () {
        if (appData.individuality.length > 6) {
            appData.individuality = appData.individuality.substring(0, 6);
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
    showGameRule: function () {
        4 != appData.roomStatus && ($(".createRoom .mainPart").css("height", "60vh"),
            $(".createRoom .mainPart .blueBack").css("height", "51vh"),
            appData.ruleInfo.isShowRule = !0)
    },
    cancelGameRule: function () {
        appData.ruleInfo.isShowRule = !1,
            $(".createRoom .mainPart").css("height", "65vh"),
            $(".createRoom .mainPart .blueBack").css("height", "46vh")
    },
    showGameHistory: function () {
        socketModule.sendGameHistory()
    },
    closeRecord: function () {
        appData.isShowRecord = !1
    },
    selectBankerMode: viewMethods.selectBankerMode,
    showBreakRoom: function () {
        null != appData.breakData && void 0 != appData.breakData &&
        viewMethods.gameOverNew(appData.breakData.data.score_board, appData.breakData.data.balance_scoreboard),
            chooseBigWinner(),
            $(".ranking .rankBack").css("opacity", "1"), $(".roundEndShow").show(),
            $(".ranking").show(), canvas()
    },
    confirmBreakRoom: function () {
        socketModule.sendGameOver(),
            viewMethods.clickCloseAlert()
    },
    showQRCode: viewMethods.showQRCode,
    closeErweima: function () {
    },
    showAudioSetting: function () {
        appData.editAudioInfo.backMusic = appData.audioInfo.backMusic,
            appData.editAudioInfo.messageMusic = appData.audioInfo.messageMusic,
            appData.editAudioInfo.isShow = !0
    },
    cancelAudioSetting: function () {
        appData.editAudioInfo.isShow = !1
    },
    confirmAudioSetting: function(once) {
        console.log(once);
        console.log(appData.musicOnce);
        if(once == '1' && appData.editAudioInfo.backMusic==0 && appData.audioInfo.backMusic==0){
            appData.musicOnce = false;
            return;
        }
        if(once == '1' && appData.musicOnce){
            console.log(appData.editAudioInfo.backMusic);
            console.log(appData.audioInfo.backMusic)
            appData.audioInfo.backMusic = 1;
            setTimeout(function(){audioModule.stopSound('backMusic');},200);
            setTimeout(function(){audioModule.playSound('backMusic', true);},500);
            appData.musicOnce = false;
        }
        if(once == '1' && !appData.musicOnce){
            return;
        }
        if(appData.editAudioInfo.backMusic == 1){
            appData.editAudioInfo.backMusic =0
            appData.editAudioInfo.messageMusic =0
        }else{
            appData.editAudioInfo.backMusic =1
            appData.editAudioInfo.messageMusic =1
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
    },
    setMessageMusic: function () {
        0 == appData.editAudioInfo.messageMusic ? appData.editAudioInfo.messageMusic = 1 : appData.editAudioInfo.messageMusic = 0
    },
    testRefreshRoom: function () {
        socketModule.sendRefreshRoom()
    },
    reloadView: function () {
        reload()
    },
    personInfo: function () {
        window.location.href = globalData.hpUrl
    },
    showNoteImg: function () {
        appData.isShowNoteImg ? appData.isShowNoteImg = !1 : appData.isShowNoteImg = !0
    },
    hideNoteImg: function () {
        appData.isShowNoteImg = !1
    },
    applyToJoin:function(){
        httpModule.applyToJoin();
    },
    sendTest: function () {
    }
};
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
                    var url = globalData.hallPath;
                    window.location.replace(url);
                });

                getRankingSix();
                $('#ranking').remove();
                $('.ranking-img').css({'position': 'absolute','top': '0','right': '0','bottom': '0','z-index': '999999','width': '100%','background-color': '#000'});
                $("#loading").css({'background':'#071a45'});
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
                    if (i == 0)continue;
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
        if (value === undefined)return false;
        var data = [];
        var datas = null;
        var _dt = null;
        if (key.indexOf('.') > 0) {
            var arr = key.split('.');
            if (this.item(arr[0])) {
                datas = this.item(arr[0]);
                data = datas;
                for (var i in arr) {
                    if (i == 0)continue;
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
                    if (i == 0)continue;
                    if (data[arr[i]] !== undefined) {
                        if (i == arr.length - 1) _dt = data;
                        data = data[arr[i]];
                    } else return false;
                }
            } else {
                return false;
            }
        } else if (this.item(key)) data = this.item(key);
        if (typeof(data) != 'object')return false;
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
                    if (i == 0)continue;
                    if (data[arr[i]] !== undefined) {
                        if (i == arr.length - 1) _dt = data;
                        data = data[arr[i]];
                    } else return false;
                }
            } else {
                return false;
            }
        } else if (this.item(key)) data = this.item(key);
        if (typeof(data) != 'object')return false;
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
                    if (i == 0)continue;
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
        if (typeof(value) != 'number') value = 1;
        var data = [];
        var datas = null;
        var _dt = null;
        if (key.indexOf('.') > 0) {
            var arr = key.split('.');
            if (this.item(arr[0])) {
                datas = this.item(arr[0]);
                data = datas;
                for (var i in arr) {
                    if (i == 0)continue;
                    if (data[arr[i]] !== undefined) {
                        if (i == arr.length - 1) _dt = data;
                        data = data[arr[i]];
                    } else return false;
                }
            } else {
                return false;
            }
        } else if (this.item(key)) data = this.item(key);
        if (typeof(data) == 'number') {
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
        if (typeof(value) != 'number') value = 1;
        var data = [];
        var datas = null;
        var _dt = null;
        if (key.indexOf('.') > 0) {
            var arr = key.split('.');
            if (this.item(arr[0])) {
                datas = this.item(arr[0]);
                data = datas;
                for (var i in arr) {
                    if (i == 0)continue;
                    if (data[arr[i]] !== undefined) {
                        if (i == arr.length - 1) _dt = data;
                        data = data[arr[i]];
                    } else return false;
                }
            } else {
                return false;
            }
        } else if (this.item(key)) data = this.item(key);
        if (typeof(data) == 'number') {
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
                    if (i == 0)continue;
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
        if (typeof(fn) != 'function')return false;
        var data = [];
        var datas = null;
        var _dt = null;
        if (key.indexOf('.') > 0) {
            var arr = key.split('.');
            if (this.item(arr[0])) {
                datas = this.item(arr[0]);
                data = datas;
                for (var i in arr) {
                    if (i == 0)continue;
                    if (data[arr[i]] !== undefined) {
                        _dt = data;
                        data = data[arr[i]];
                    } else return false
                }
            } else {
                return false;
            }
        } else if (this.item(key)) data = this.item(key);
        if (typeof(data) != 'object')return false;
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
            } else if (value === null)return localStorage.removeItem(key); else return localStorage.setItem(key, this.encode(value));
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
    if (typeof(pics) == 'string')var pics = [pics];
    var error_path = error_path || globalData.fileUrl+'files/images/common/default_head.png';
    var _pics = [];
    var count = 0;

    function createImg(data, i, name) {
        var img = new Image();
        img.src = data;
        img.onload = function () {
            _pics[i] = this;
            count++;
            if (count == pics.length && typeof(func) == 'function') {
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
                xhr2.open("get", globalData.baseUrl+'getjpg/wx?avatarurl='+this._src + '&r=' + Math.random(), true);
                //alert("error1 : "+ this._index +":" + globalData.baseUrl+'getjpg/wx?avatarurl='+this._src);
                xhr2.responseType = 'blob';
                xhr2.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status==200) {
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
        gameId: 0,}

    var users = data.score;

    var room_number = appData.game.room_number;
    var num = data.round;
    var sum = appData.game.total_num;
    var datetime = data.record;
    var width = 750;
    var height = 1216;
    var pics = [globalData.fileUrl+'files/images/xiaxie/rank_frame.jpg', globalData.fileUrl+'files/images/common/people_bg.png', globalData.fileUrl+'files/images/common/ranking_icon.png'];
    if (users.length > 6) {
        pics.push(globalData.fileUrl+'files/images/common/people_bg2.jpg');
        pics.push(globalData.fileUrl+'files/images/common/people_bg4.jpg');
        height += 102 * (users.length - 6);
    } else {
        pics.push(globalData.fileUrl+'files/images/common/people_bg4.jpg');
    }
    for (var i=0;i<users.length;i++) {
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
        for (var i=0;i<users.length;i++) {
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
        if (typeof(func) == 'function') func(canvas.toDataURL("image/png"));
    });
}

function logMessage(e) {
}

function chooseBigWinner() {

    //对积分榜排序
    appData.playerBoard.score.sort(function(a,b){
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
function reload() {
    window.location.href = window.location.href + "&id=" + 1e4 * Math.random();
}

function getShareContent() {
    shareContent = "筹码:";
    if (1 == appData.ruleInfo.chip_type) {
        shareContent += "5,10,20,50";
    } else if (2 == appData.ruleInfo.chip_type) {
        shareContent += "10,20,50,100";
    }

    shareContent += " 上限:" + appData.ruleInfo.upper_limit + "分";

    if (1 == appData.ruleInfo.rule_value1) {
        shareContent += " 规则:三个相同5倍,两个相同3倍";
    } else {
        shareContent += " 规则:三个相同3倍,两个相同2倍";
    }
    if (1 == appData.ruleInfo.ticket_type) {
        shareContent += " 局数:12局X2房卡";
    } else {
        shareContent += " 局数:24局x4张房卡";
    }
}

// function canvas() {
//     //console.log(appData.playerBoard.score[0].account_code);
//     var e = document.getElementById("ranking");
//     html2canvas(e, {
//         allowTaint: !0,
//         taintTest: !1,
//         onrendered: function (e) {
//             e.id = "mycanvas";
//             var t = e.toDataURL("image/jpeg", .5);
//             $("#end").attr("src", t);
//             $(".end").show();
//             $(".ranking").hide();
//             newGame();
//         }
//     });
// }

function preventDefaultFn(e) {
    e.preventDefault()
}

function disable_scroll() {
    $("body").on("touchmove", preventDefaultFn)
}

function enable_scroll() {
    $("body").off("touchmove", preventDefaultFn)
}


var vueLife = {
    vmCreated: function () {
        logMessage("vmCreated"),
            resetState(),
            initView(),
        4 != globalData.roomStatus && $("#loading").hide(),
            $(".main").show()
    },
    vmUpdated: function () {
        logMessage("vmUpdated")
    },
    vmMounted: function () {
        logMessage("vmMounted"),
            $("#marquee").marquee({
                duration: globalData.notySpeed, gap: 50, delayBeforeStart: 0, direction: "left", duplicated: !0
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
        wx.config({
            debug: !1,
            appId: configData.appId,
            timestamp: configData.timestamp,
            nonceStr: configData.nonceStr,
            signature: configData.signature,
            jsApiList: ["onMenuShareTimeline", "onMenuShareAppMessage", "hideMenuItems"]
        }),
            getShareContent(),
            wx.onMenuShareTimeline({
                title: globalData.shareTitle,
                desc: shareContent,
                link: globalData.roomUrl,
                imgUrl: globalData.fileUrl + "files/images/xiaxie/share_icon.png",
                success: function () {
                },
                cancel: function () {
                }
            }),
            wx.onMenuShareAppMessage({
                title: globalData.shareTitle,
                desc: shareContent,
                link: globalData.roomUrl,
                imgUrl: globalData.fileUrl + "files/images/xiaxie/share_icon.png",
                success: function () {
                },
                cancel: function () {
                }
            })
    }
};
wx.config({
    debug: !1,
    appId: configData.appId,
    timestamp: configData.timestamp,
    nonceStr: configData.nonceStr,
    signature: configData.signature,
    jsApiList: ["onMenuShareTimeline", "onMenuShareAppMessage", "hideMenuItems"]
});
var isLoadAudioFile = !1;
audioModule.loadAllAudioFile();
audioModule.audioOn = true;
audioModule.stopSound("backMusic");
audioModule.playSound("backMusic", true);
wx.ready(function () {
    audioModule.loadAllAudioFile(),
        wx.hideMenuItems({
            menuList: ["menuItem:copyUrl",
                "menuItem:share:qq", "menuItem:share:weiboApp",
                "menuItem:favorite", "menuItem:share:facebook",
                "menuItem:share:QZone",
                "menuItem:refresh"]
        }),
        getShareContent(),
        wx.onMenuShareTimeline({
            title: globalData.shareTitle,
            desc: shareContent,
            link: globalData.roomUrl,
            imgUrl: globalData.fileUrl + "files/images/xiaxie/share_icon.png",
            success: function () {
            },
            cancel: function () {
            }
        }),
        wx.onMenuShareAppMessage({
            title: globalData.shareTitle,
            desc: shareContent,
            link: globalData.roomUrl,
            imgUrl: globalData.fileUrl + "files/images/xiaxie/share_icon.png",
            success: function () {
            }, cancel: function () {
            }
        })
});
wx.error(function (e) {
});

4 == globalData.roomStatus && setTimeout(function () {
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
$(function () {
    $.extend(jQuery.easing, {
        easeBoth: function (e, t, n, a, i) {
            return (t /= i / 2) < 1 ? a / 2 * t * t + n : -a / 2 * (--t * (t - 2) - 1) + n
        }
    }),
        $(".place").css("width", 140 * per),
        $(".place").css("height", 140 * per),
        $(".place").css("top", 270 * per),
        $(".place").css("left", 195 * per),
        sessionStorage.isPaused = "false";
    var e, t;
    void 0 !== document.hidden ? (e = "hidden", t = "visibilitychange") :
        void 0 !== document.webkitHidden && (e = "webkitHidden", t = "webkitvisibilitychange"),
        void 0 === document.addEventListener ||
        void 0 === e ? alert("This demo requires a browser such as Google Chrome that supports the Page Visibility API.") :
            document.addEventListener(t, function () {
                document[e] ?
                    (audioModule.audioOn = !1, audioModule.stopSound("backMusic")) : "true" !== sessionStorage.isPaused &&
                    (
                        audioModule.audioOn = !0,
                            audioModule.stopSound("backMusic"),
                            audioModule.playSound("backMusic", !0))
            }, !1)
});