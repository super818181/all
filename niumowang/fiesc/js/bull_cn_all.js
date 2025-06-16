var ws;
var game = {
    "room": 0,
    "room_number": globalData.roomNumber,

    "status": 0,
    "time": -1,
    "round": 0,
    "total_num": 10,

    "cardDeal": 0,

    "show_card": false,
    "base_score": 0,
    "show_score": false,
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
    UpdateAccountScore: "UpdateAccountScore",
    Win: "Win",
    BroadcastVoice: "BroadcastVoice",
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
    BreakRoom: "BreakRoom",
    //观战功能
    GuestRoom: "GuestRoom",
    AllGuestInfo: "AllGuestInfo",
    UpdateGuestInfo: "UpdateGuestInfo"
};

var httpModule = {
    getInfo: function () {
        reconnectSocket();
        appData.is_connect = true;
        /*
        var postData = {
            "account_id": userData.accountId,
            "room_number": globalData.roomNumber,
            "game_type": globalData.gameType,
            "token": globalData.tk
        };
        Vue.http.post(BaseUrl + '/q/getRoomerInfo', postData).then(function (response) {
            var bodyData = response.body;

            if (bodyData.result == 0) {
                reconnectSocket();
                appData.is_connect = true;
            } else {
                console.log(bodyData);
                appData.ownerUser.nickname = bodyData.data.nickname;
                appData.ownerUser.avatar = bodyData.data.headimgurl;
                appData.ownerUser.user_code = bodyData.data.user_code;
                appData.applyStatus = bodyData.data.apply_status;
                viewMethods.clickShowAlert(8, bodyData.result_message);
            }

        }, function (response) {
            logMessage(response.body);
        });
         */
    },
    applyToJoin: function () {
        var postData = {"account_id": userData.accountId, "user_code": appData.ownerUser.user_code};
        Vue.http.post(globalData.baseUrl + "friend/applyToJoin", postData).then(function (e) {
            if (0 == e.body.result) {
                methods.showAlertTip("已经发送申请", 1);
                appData.isShowIndividuality = !1;
                appData.applyStatus = e.body.data.apply_status;
                appData.userData.individuality = appData.individuality;
            } else {
                appData.individualityError = e.body.result_message;
            }

        }, function (e) {
            appData.individualityError = "请求错误";
        });
    },
    applyClub: function () {
        var postData = {"room_number": globalData.roomNumber, "token": globalData.tk};
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
    setIndividuality: function () {
        var postData = {"account_id": userData.accountId, "individuality": appData.individuality, "tk": globalData.tk};
        console.log(postData);
        Vue.http.post(BaseUrl + "/account/setIndividuality", postData).then(function (e) {
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
            if (appData.guests[i].account_id == userData.accountId) {
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
            console.log('websocket state：' + ws.readyState);
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
                }, 1000);
            } else {
                console.log('websocket state：' + ws.readyState);
            }

        } catch (err) {
            console.log(err);
        }
    },
    sendPrepareJoinRoom: function () {
        socketModule.sendData({
            operation: wsOperation.PrepareJoinRoom,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_number: globalData.roomNumber,
                token: globalData.tk
            }
        });
    },
    sendJoinRoom: function () {
        socketModule.sendData({
            operation: wsOperation.JoinRoom,
            account_id: userData.accountId,
            session: globalData.session,
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
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_number: globalData.roomNumber,
                token: globalData.tk
            }
        });
    },
    sendRefreshRoom: function () {
        socketModule.sendData({
            operation: wsOperation.RefreshRoom,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_id: appData.game.room,
                token: globalData.tk
            }
        });
    },
    sendReadyStart: function () {
        socketModule.sendData({
            operation: wsOperation.ReadyStart,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_id: appData.game.room,
                token: globalData.tk
            }
        });
    },
    sendGameOver: function () {
        socketModule.sendData({
            operation: wsOperation.GameOver,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_id: appData.game.room,
                token: globalData.tk
            }
        });
    },
    sendBroadcastVoice: function (num) {
        socketModule.sendData({
            operation: wsOperation.BroadcastVoice,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_id: appData.game.room,
                token: globalData.tk,
                voice_num: num
            }
        });
    },
    sendGrabBanker: function (multiples) {
        socketModule.sendData({
            operation: wsOperation.GrabBanker,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_id: appData.game.room,
                is_grab: 1,
                "multiples": parseInt(multiples),
                token: globalData.tk
            }
        });
    },
    sendNotGrabBanker: function () {
        socketModule.sendData({
            operation: wsOperation.GrabBanker,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_id: appData.game.room,
                is_grab: 0,
                "multiples": 1,
                token: globalData.tk
            }
        });
    },
    sendPlayerMultiples: function (times) {
        // 清除辅助摊牌定时器
        clearTimeout(appData.timer);
        appData.timer = null;
        socketModule.sendData({
            operation: wsOperation.PlayerMultiples,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_id: appData.game.room,
                multiples: parseInt(times),
                token: globalData.tk
            }
        });
    },
    sendShowCard: function () {
        // 清除辅助摊牌定时器
        clearTimeout(appData.timer);
        appData.timer = null;
        socketModule.sendData({
            operation: wsOperation.ShowCard,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_id: appData.game.room,
                token: globalData.tk
            }
        });
    },
    processGameRule: function (obj) {
        if (obj.data.ticket_type) {
            appData.ruleInfo.ticket = obj.data.ticket_type;
            appData.ruleInfo.baseScore = obj.data.score_type;
            appData.ruleInfo.timesType = obj.data.rule_type;
            appData.ruleInfo.isCardfour = Math.ceil(obj.data.is_cardfour);
            appData.ruleInfo.isCardfive = Math.ceil(obj.data.is_cardfive);
            appData.ruleInfo.isCardStraight = Math.ceil(obj.data.is_straight);
            appData.ruleInfo.isCardFlush = Math.ceil(obj.data.is_flush);
            appData.ruleInfo.isCardCalabash = Math.ceil(obj.data.is_calabash);
            appData.ruleInfo.isCardbomb = Math.ceil(obj.data.is_cardbomb);
            appData.ruleInfo.isCardSequence = Math.ceil(obj.data.is_sequence);
            appData.ruleInfo.isCardtiny = Math.ceil(obj.data.is_cardtiny);
            appData.ruleInfo.laizi_num = Math.ceil(obj.data.laizi_num);
            appData.ruleInfo.isLaizi = Math.ceil(obj.data.is_laizi);
            appData.ruleInfo.is_cardnbomb = Math.ceil(obj.data.is_cardnbomb);
            appData.ruleInfo.is_cardtinyfour = Math.ceil(obj.data.is_cardtinyfour);
            appData.ruleInfo.banker_mode = Math.ceil(obj.data.banker_mode);
            appData.ruleInfo.banker_score = Math.ceil(obj.data.banker_score_type);
            appData.ruleInfo.bet_type = Math.ceil(obj.data.bet_type);
            appData.ruleInfo.can_rub = Math.ceil(obj.data.can_rub);
            appData.game.total_num = obj.data.total_num;

            //辅助摊牌，刷新回来时间
            appData.game.ltready = Math.ceil(obj.data.ltready);
            appData.game.ltgrab = Math.ceil(obj.data.ltgrab);
            appData.game.ltbet = Math.ceil(obj.data.ltbet);
            appData.game.ltshow = Math.ceil(obj.data.ltshow);
        }

        if (obj.data.bet_type == 0) {
            appData.coinList = [1, 2, 3, 5];
        } else if (obj.data.bet_type == 1) {
            appData.coinList = [1, 2, 4, 5];
        } else if (obj.data.bet_type == 2) {
            appData.coinList = [1, 3, 5, 8];
        } else if (obj.data.bet_type == 3) {
            appData.coinList = [2, 4, 6, 10];
        } else if (obj.data.bet_type == 4) {
            appData.coinList = [1, 5, 8, 12];
        }

        var t = (appData.ruleInfo.isCardfive + appData.ruleInfo.isCardbomb + appData.ruleInfo.isCardtiny
            + appData.ruleInfo.isCardfour + appData.ruleInfo.isCardCalabash + appData.ruleInfo.isCardFlush
            + appData.ruleInfo.isCardSequence + appData.ruleInfo.isCardStraight) / 2;
        var s = appData.ruleInfo.isLaizi == 1 ? 4 : 0;
        appData.ruleInfo.rule_height = (s + 4 * t) + "vh";


        if (appData.ruleInfo.banker_mode == 1) {
            appData.ruleInfo.bankerText = '抢庄';
        } else if (appData.ruleInfo.banker_mode == 2) {
            appData.ruleInfo.bankerText = '抢庄';
        } else if (appData.ruleInfo.banker_mode == 3) {
            appData.ruleInfo.bankerText = '选庄';
        } else if (appData.ruleInfo.banker_mode == 4) {
            appData.ruleInfo.bankerText = '';
        } else if (appData.ruleInfo.banker_mode == 5) {
            appData.ruleInfo.bankerText = '';
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
        if (obj.data.is_member) {
            socketModule.sendJoinRoom();
        } else {
            if (obj.data.can_join) {
                if (obj.data.can_guest) {
                    appData.joinType = 1;
                    if (obj.data.room_users.length >= 1) {

                        obj.data.alert_text = "房间里有" + obj.data.room_users.join("、") + "，是否加入？";
                    } else {
                        obj.data.alert_text = "";
                    }
                } else {
                    appData.joinType = 2;
                    if (obj.data.room_users.length >= 1) {
                        obj.data.alert_text = "观战人数已满，房间里有" + obj.data.room_users.join("、") + "，是否加入游戏？";
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

        appData.game.room = obj.data.room_id;
        appData.game.round = Math.ceil(obj.data.game_num);
        appData.game.total_num = Math.ceil(obj.data.total_num);
        appData.game.base_score = Math.ceil(obj.data.base_score);
        appData.base_score = appData.game.base_score;
        appData.canBreak = Math.ceil(obj.data.can_break);

        resetAllPlayerData();

        if (obj.data.limit_time == -1) {
            appData.game.time = Math.ceil(obj.data.limit_time);
            viewMethods.timeCountDown();
        }

        appData.player[0].serial_num = obj.data.serial_num;
        for (var i = 0; i < globalData.maxCount; i++) {
            if (i <= appData.player.length - obj.data.serial_num) {
                appData.player[i].serial_num = i + Math.ceil(obj.data.serial_num);
            } else {
                appData.player[i].serial_num = i + Math.ceil(obj.data.serial_num) - appData.player.length;
            }
        }

        appData.player[0].account_status = Math.ceil(obj.data.account_status);
        appData.player[0].account_score = Math.ceil(obj.data.account_score);
        appData.player[0].nickname = userData.nickname;
        appData.player[0].headimgurl = userData.avatar;
        appData.player[0].account_id = userData.accountId;
        appData.player[0].card = obj.data.cards.concat();
        appData.player[0].card_open = obj.data.combo_array.concat();
        appData.player[0].card_type = obj.data.card_type;
        appData.player[0].ticket_checked = obj.data.ticket_checked;
        appData.game.status = Math.ceil(obj.data.room_status);
        appData.player[0].combo_point = obj.data.combo_point;

        if (appData.player[0].card_open.length <= 0 || appData.player[0].card_open == undefined) {
            appData.player[0].card_open = obj.data.cards.concat();
        }

        if (appData.ruleInfo.banker_mode == 5 && appData.game.round == 1) {
            if (appData.player[0].account_status > 5) {
                appData.game.cardDeal = 5;
            }
        } else {
            if (appData.game.status == 2) {
                appData.game.cardDeal = 5;
            }
        }

        appData.scoreboard = obj.data.scoreboard;
        viewMethods.resetMyAccountStatus();

        //观战功能
        appData.isWatching = 0;
        setTimeout(function () {
            appData.showGuest = 0
        }, 100);
    },
    processRefreshRoom: function (obj) {
        resetAllPlayerData();

        appData.player[0].serial_num = obj.data.serial_num;

        for (var i = 0; i < appData.player.length; i++) {
            if (i <= appData.player.length - obj.data.serial_num) {
                appData.player[i].serial_num = i + Math.ceil(obj.data.serial_num);
            } else {
                appData.player[i].serial_num = i + Math.ceil(obj.data.serial_num) - appData.player.length;
            }
        }

        appData.player[0].account_status = Math.ceil(obj.data.account_status);
        appData.player[0].account_score = Math.ceil(obj.data.account_score);
        appData.player[0].nickname = userData.nickname;
        appData.player[0].headimgurl = userData.avatar;
        appData.player[0].account_id = userData.accountId;
        appData.player[0].serial_num = obj.data.serial_num;    //座位号
        appData.player[0].card = obj.data.cards.concat();
        appData.player[0].card_open = obj.data.combo_array.concat();
        appData.player[0].card_type = obj.data.card_type;
        appData.player[0].ticket_checked = obj.data.ticket_checked;
        appData.player[0].combo_point = obj.data.combo_point;

        if (appData.player[0].card_open.length <= 0 || appData.player[0].card_open == undefined) {
            appData.player[0].card_open = obj.data.cards.concat();
        }

        if (appData.ruleInfo.banker_mode == 5 && appData.game.round == 1) {
            if (appData.player[0].account_status > 5) {
                appData.game.cardDeal = 5;
            }
        } else {
            if (appData.game.status == 2) {
                appData.game.cardDeal = 5;
            }
        }

        this.aboutAllGamerInfo(obj.all_gamer_info);

    },
    processStartShow: function (obj) {
        // 清除辅助摊牌定时器
        clearTimeout(appData.timer);
        appData.timer = null;

        var delay = 0;
        if (appData.ruleInfo.banker_mode == 4) {
            delay = 1200;
        }

        setTimeout(function () {
            for (var i = 0; i < appData.player.length; i++) {
                for (var j = 0; j < obj.data.length; j++) {
                    if (appData.player[i].account_id == obj.data[j].account_id) {
                        appData.player[i].multiples = obj.data[j].multiples;
                        appData.player[i].account_status = Math.ceil(obj.data[j].account_status);
                        appData.player[i].online_status = Math.ceil(obj.data[j].online_status);
                        appData.player[i].card = obj.data[j].cards.concat();
                        appData.player[i].card_open = obj.data[j].combo_array.concat();
                        appData.player[i].card_type = obj.data[j].card_type;
                        appData.player[i].combo_point = obj.data[j].combo_point;
                        appData.player[i].limit_time = obj.data[j].limit_time;
                        if (appData.player[i].card_open.length <= 0 || appData.player[i].card_open == undefined) {
                            appData.player[i].card_open = obj.data[j].cards.concat();
                        }
                    }
                }
            }
            appData.showClockBetText = false;
            appData.showClockRobText = false;
            appData.showClockShowCard = true;
            viewMethods.resetMyAccountStatus();
            viewMethods.updateAllPlayerStatus();

            appData.game.time = Math.ceil(obj.limit_time);
            viewMethods.timeCountDown();

            // 辅助摊牌定时器
            appData.game.timeAuto = Math.ceil(obj.limit_time) + 2;
            viewMethods.timeCountDownAuto();
        }, delay);

    },
    processMyCards: function (obj) {
        if (appData.ruleInfo.banker_mode == 2) {
            if (appData.player[0].account_id == obj.data.account_id) {
                appData.player[0].card = obj.data.cards.concat();
            }
            viewMethods.seeMyCard();
        }
    },
    processBreakRoom: function (obj) {
        appData.breakData = obj;

        if (appData.ruleInfo.banker_mode != 5) {
            return;
        }

        if (appData.game.round == appData.game.total_num) {
            return;
        }

        if (obj == null || obj == undefined) {
            appData.overType = 2;
            viewMethods.clickShowAlert(9, '庄家分数不足，提前下庄，点击确定查看结算');
            return;
        }

        if (obj.data.type == 1) {
            if (appData.player[0].is_banker) {
                viewMethods.clickCloseAlert();
                if (appData.breakData != null && appData.breakData != undefined) {
                    viewMethods.gameOverNew(appData.breakData.data.score_board, appData.breakData.data.balance_scoreboard);
                }
                chooseBigWinner();
                $(".ranking .rankBack").css("opacity", "1");
                $(".roundEndShow").show();

                $(".ranking").show();
                canvas();
            } else {
                appData.overType = 1;
                viewMethods.clickShowAlert(9, '庄家主动下庄,点击确定查看结算');
            }

        } else {
            appData.overType = obj.data.type;
            // return;
            // viewMethods.clickShowAlert(9, '庄家分数不足，点击确定查看结算');
        }
    },
    processStartBet: function (obj) {
        // 清除辅助摊牌定时器
        clearTimeout(appData.timer);
        appData.timer = null;
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
            for (var i = 0; i < appData.player.length; i++) {
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
                    // viewMethods.robBankerAnimate(obj);
                    if (globalData.maxCount == 6) {
                        viewMethods.robBankerAnimate(obj);
                    } else if (globalData.maxCount == 10) {
                        viewMethods.robBankerAnimate10(obj);
                    } else {
                        viewMethods.robBankerAnimate17(obj);
                    }
                }
            }

        }, delay);

    },
    processAllGamerInfo: function (obj) {

        appData.game.show_card = true;
        appData.clickCard4 = false;
        appData.clickCard5 = false;
        this.aboutAllGamerInfo(obj.data);

        // 辅助摊牌,处理刷新回来
        viewMethods.delRefresh(obj);
    },
    aboutAllGamerInfo: function (gamerInfo) {

        for (var i = 0; i < appData.player.length; i++) {
            for (var j = 0; j < gamerInfo.length; j++) {
                if (appData.player[i].serial_num == gamerInfo[j].serial_num) {
                    appData.player[i].sex = gamerInfo[j].sex;
                    appData.player[i].is_guest = 0;    //观战功能
                    appData.player[i].nickname = gamerInfo[j].nickname;
                    appData.player[i].headimgurl = gamerInfo[j].headimgurl;
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
                    appData.player[i].poker_kw = gamerInfo[j].poker_kw;
                    appData.player[i].head_kw = gamerInfo[j].head_kw;
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
                appData.player[i].sex = obj.data.sex;
                appData.player[i].headimgurl = obj.data.headimgurl;
                appData.player[i].account_id = obj.data.account_id;
                appData.player[i].account_score = Math.ceil(obj.data.account_score);
                appData.player[i].account_status = Math.ceil(obj.data.account_status);
                appData.player[i].online_status = Math.ceil(obj.data.online_status);
                appData.player[i].ticket_checked = obj.data.ticket_checked;
                appData.player[i].poker_kw = obj.data.poker_kw;
                appData.player[i].head_kw = obj.data.head_kw;
                appData.player[i].is_guest = 0;    //观战功能
            } else {
                if (appData.player[i].account_id == obj.data.account_id) {
                    socketModule.sendRefreshRoom();
                }

                //观战功能  有位置
                if (appData.player[i].account_id == userData.accountId || 0 == appData.player[i].account_id) {
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

                if (appData.ruleInfo.banker_mode == 2 && obj.data.account_status == 5 && obj.data.online_status == 1) {
                    appData.player[i].bankerMultiples = obj.data.banker_multiples;
                }

                if (appData.player[i].account_status >= 8) {
                    appData.player[i].online_status = obj.data.online_status;
                    return;
                }

                if (obj.data.online_status == 1) {
                    appData.player[i].account_status = Math.ceil(obj.data.account_status);
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

                if (i != 0) {
                    if (appData.player[i].account_status == 4) {
                        setTimeout(function () {
                            mp3AudioPlay("audioNoBanker", appData.player[i].sex);
                        }, 100);
                    } else if (appData.player[i].account_status == 5) {
                        setTimeout(function () {
                            mp3AudioPlay("audioRobBanker", appData.player[i].sex);
                        }, 100);
                    }
                }
                break;
            }
        }

        if (appData.player.length == i) { //观战功能  观战者离线
            for (a = 0; a < appData.guests.length; a++)
                if (appData.guests[a].account_id == obj.data.account_id) {
                    break;
                }
            appData.guests.splice(a, 1);
        } else {
            if (appData.player[0].account_status == 3) {
                viewMethods.showRobBankerText();
            } else if (appData.player[0].account_status == 4) {
                viewMethods.showNotRobBankerTextFnc();
            }

            if (!appData.isFinishBankerAnimate || !appData.isFinishWinAnimate) {
                setTimeout(function () {
                    viewMethods.resetMyAccountStatus();
                    viewMethods.updateAllPlayerStatus();
                }, 3e3);
            } else {
                viewMethods.resetMyAccountStatus();
                viewMethods.updateAllPlayerStatus();
            }
        }
    },
    processUpdateAccountShow: function (obj) {
        for (var i = 0; i < appData.player.length; i++) {
            if (appData.player[i].account_id == obj.data.account_id) {
                appData.player[i].card_type = obj.data.card_type;
                appData.player[i].cards = obj.data.cards.concat();
                appData.player[i].card_open = obj.data.combo_array.concat();
                appData.player[i].combo_point = obj.data.combo_point;
                appData.player[i].account_status = 8;
                if (appData.player[i].card_open.length < 1 || appData.player[i].card_open == undefined) {
                    appData.player[i].card_open = obj.data.cards.concat();
                }
                if (appData.player[i].is_audiobull == false && appData.player[i].account_status >= 8) {
                    var audio = "";
                    if (appData.player[i].card_type == 1) {
                        audio = "audioBull0";
                    } else if (appData.player[i].card_type == 4) {
                        audio = "audioBull10";
                    } else if (appData.player[i].card_type == 5) {
                        audio = "audioBull11";
                    } else if (appData.player[i].card_type == 6) {
                        audio = "audioBull12";
                    } else if (appData.player[i].card_type == 7) {
                        audio = "audioBull13";
                    } else if (appData.player[i].card_type == 8) {
                        audio = "audioBull14";
                    } else if (appData.player[i].card_type == 9) {
                        audio = "audioBull15";
                    } else if (appData.player[i].card_type == 10) {
                        audio = "audioBull16";
                    } else if (appData.player[i].card_type == 11) {
                        audio = "audioBull17";
                    } else if (appData.player[i].card_type == 12) {
                        audio = "audioBull18";
                    } else if (appData.player[i].card_type == 13) {
                        audio = "audioBull19";
                    } else if (appData.player[i].card_type == 14) {
                        audio = "audioBull20";
                    } else {
                        audio = "audioBull" + appData.player[i].combo_point;
                    }
                    setTimeout(function () {
                        mp3AudioPlay(audio, appData.player[i].sex);
                    }, 100);
                    appData.player[i].is_audiobull = true;
                }
                break;
            }
        }

        if (obj.data.account_id == appData.player[0].account_id) {
            viewMethods.resetMyAccountStatus();
        }

        viewMethods.updateAllPlayerStatus();
    },
    processUpdateAccountMultiples: function (obj) {
        for (var i = 0; i < appData.player.length; i++) {
            if (appData.player[i].account_id == obj.data.account_id) {
                appData.player[i].multiples = obj.data.multiples;
                if (i == 0) {
                    return;
                }
                if (appData.player[i].multiples >= 1) {
                    var multiples = appData.player[i].multiples;
                    setTimeout(function () {
                        mp3AudioPlay("audioTimes" + multiples, appData.player[i].sex);
                    }, 100);
                }
                break;
            }
        }

        viewMethods.resetMyAccountStatus();
        viewMethods.updateAllPlayerStatus();
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
        $(".memberCoin").stop(true);
        appData.isFinishWinAnimate = true;
        appData.isFinishBankerAnimate = true;

        appData.game.cardDeal = 0;

        appData.game.status = 1;
        appData.game.show_card = true;

        appData.game.time = -1;

        appData.game.round = appData.game.round + 1;
        appData.game.round = Math.ceil(obj.game_num);
        appData.player[0].is_showCard = false;
        appData.showClockRobText = false;
        appData.showClockBetText = false;
        appData.showClockShowCard = false;
        appData.clickCard4 = false;
        appData.clickCard5 = false;
        appData.showClickShowCard = false;
        appData.breakData = null;

        for (var i = 0; i < appData.player.length; i++) {
            appData.player[i].is_operation = false;
            appData.player[i].is_showCard = false;
            appData.player[i].is_showbull = false;

            if (appData.ruleInfo.banker_mode == 5 && appData.game.round > 1) {

            } else {
                if (appData.ruleInfo.banker_mode == 3 && appData.game.round > 1) {

                } else {
                    appData.player[i].is_banker = false;
                }
            }

            appData.player[i].bullImg = "";

            if (appData.player[i].online_status == 0) {
                appData.player[i].account_status = 1;
            }

            for (var j = 0; j < obj.data.length; j++) {
                if (appData.player[i].account_id == obj.data[j].account_id) {

                    appData.player[i].ticket_checked = 1;
                    appData.player[i].account_status = Math.ceil(obj.data[j].account_status);
                    appData.player[i].playing_status = Math.ceil(obj.data[j].playing_status);
                    appData.player[i].online_status = Math.ceil(obj.data[j].online_status);
                    appData.player[i].account_score = appData.player[i].account_score;
                    appData.player[i].limit_time = Math.ceil(obj.data[j].limit_time);

                }
            }
        }

        appData.game.status = 2;

        if (appData.game.round == 1 && appData.ruleInfo.banker_mode == 5) {
            //固定庄家的第一回合
            appData.game.time = -1;
            viewMethods.resetMyAccountStatus();

            //appData.showClockRobText = true;
        } else {
            appData.game.time = Math.ceil(obj.limit_time);
            viewMethods.timeCountDown();
            viewMethods.reDeal();

            // 辅助摊牌定时器
            appData.game.timeAuto = Math.ceil(obj.limit_time) + 3;
            viewMethods.timeCountDownAuto();
        }

    },
    processBroadcastVoice: function (obj) {
        for (var i = 0; i < appData.player.length; i++) {
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
    processWin: function (obj) {
        //清理辅助定时器
        clearTimeout(appData.timer);
        appData.timer = null;

        appData.game.round = Math.ceil(obj.data.game_num);
        appData.game.total_num = Math.ceil(obj.data.total_num);
        appData.playerBoard.round = Math.ceil(obj.data.game_num);
        appData.game.show_score = false;
        appData.showClockShowCard = false;
        appData.showShowCardButton = false;
        appData.showClickShowCard = false;
        appData.showClockBetText = false;
        appData.showClockRobText = false;

        if (appData.ruleInfo.banker_mode == 3) {
            appData.bankerID = Math.ceil(obj.data.banker_id);
            appData.bankerAccountId = appData.bankerID;
            console.log(appData.bankerID);
        }

        if (appData.ruleInfo.banker_mode == 5) {
            if (appData.player[0].is_banker) {
                appData.canBreak = Math.ceil(obj.data.can_break);
            }

            if (obj.data.is_break != null || obj.data.is_break != undefined) {
                appData.isBreak = Math.ceil(obj.data.is_break);
            }
        }


        viewMethods.showMemberScore(false);

        for (var i = 0; i < appData.player.length; i++) {
            if (appData.player[i].account_status >= 7) {
                appData.player[i].account_status = 8;
            }
            for (var j = 0; j < obj.data.loser_array.length; j++) {
                if (appData.player[i].account_id == obj.data.loser_array[j].account_id) {
                    appData.player[i].single_score = obj.data.loser_array[j].score;
                    break;
                }
            }
            for (var k = 0; k < obj.data.winner_array.length; k++) {
                if (appData.player[i].account_id == obj.data.winner_array[k].account_id) {
                    appData.player[i].single_score = obj.data.winner_array[k].score;
                    break;
                }
            }
        }
        appData.game.time = -1;
        viewMethods.updateAllPlayerStatus();

        setTimeout(function () {
            viewMethods.resetMyAccountStatus();
        }, 200);


        if (appData.player[0].account_status >= 8 && appData.player[0].is_audiobull == false) {
            var cardType = appData.player[0].card_type;
            var point = appData.player[0].combo_point;
            setTimeout(function () {
                if (cardType == 1) {
                    mp3AudioPlay("audioBull0", appData.player[0].sex);
                } else if (cardType == 4) {
                    mp3AudioPlay("audioBull10", appData.player[0].sex);
                } else if (cardType == 5) {
                    mp3AudioPlay("audioBull11", appData.player[0].sex);
                } else if (cardType == 6) {
                    mp3AudioPlay("audioBull12", appData.player[0].sex);
                } else if (cardType == 7) {
                    mp3AudioPlay("audioBull13", appData.player[0].sex);
                } else if (cardType == 8) {
                    mp3AudioPlay("audioBull14", appData.player[0].sex);
                } else if (cardType == 9) {
                    mp3AudioPlay("audioBull15", appData.player[0].sex);
                } else if (cardType == 10) {
                    mp3AudioPlay("audioBull16", appData.player[0].sex);
                } else if (cardType == 11) {
                    mp3AudioPlay("audioBull17", appData.player[0].sex);
                } else if (cardType == 12) {
                    mp3AudioPlay("audioBull18", appData.player[0].sex);
                } else if (cardType == 13) {
                    mp3AudioPlay("audioBull19", appData.player[0].sex);
                } else if (cardType == 14) {
                    mp3AudioPlay("audioBull20", appData.player[0].sex);
                } else {
                    mp3AudioPlay("audioBull" + point, appData.player[0].sex);
                }
            }, 200);

            appData.player[0].is_audiobull = true;
        }
        setTimeout(function () {
            appData.game.show_card = false;
            viewMethods.winAnimate(obj);
        }, 2000);  //3000
    },
    processBalanceScoreboard: function (obj) {
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
        appData.playerBoard.room = '房间号:' + globalData.roomNumber;
        // appData.playerBoard.record = str + " 前" + appData.playerBoard.round + "局";
        appData.playerBoard.record = str;
        appData.playerBoard.score = [];

        var scores = obj.scoreboard;
        for (s in scores) {
            var num = 0;
            var name = scores[s].name;

            if (userData.accountId == scores[s].account_id) {
                num = 1;
            }

            appData.playerBoard.score.push({
                "account_id": scores[s].account_id,
                "nickname": name,
                "account_score": Math.ceil(scores[s].score),
                "num": num,
                "avatar": scores[s].avatar
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
    // 辅助摊牌
    delRefresh: function (e) {

        if (appData.isWatching != 1) {
            if (appData.player[0].account_status == 3) {
                console.log('抢庄回合>>>>>>>>>>>>>>>>>>>>>>>>>>>');
                appData.game.timeAuto = appData.game.ltgrab;
                viewMethods.timeCountDownAuto();
            }
            if (appData.player[0].account_status == 6) {
                console.log('下注回合>>>>>>>>>>>>>>>>>>>>>>>>>>>');
                appData.game.timeAuto = appData.game.ltbet;
                viewMethods.timeCountDownAuto();
            }
            if (appData.player[0].account_status == 7) {
                console.log('摊牌回合>>>>>>>>>>>>>>>>>>>>>>>>>>>');
                appData.game.timeAuto = appData.game.ltshow;
                viewMethods.timeCountDownAuto();
            }
        }

    },
    showHomeAlert: function () {
        appData.isShowHomeAlert = true;
    },
    clickGameOver: function () {
        viewMethods.clickShowAlert(10, '下庄之后，将以当前战绩进行结算。是否确定下庄？');
        //socketModule.sendGameOver();
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
        } else {
            appData.isShowAlert = false;
            appData.isShowGameAlert = false;
        }
    },
    clickSitDown: function () {
        appData.isShowAlert = false;
        appData.isShowGameAlert = false;
        socketModule.sendJoinRoom();
        $('.sidelines-mask').hide();
        $('.sidelines-content').css({top: '-3.5rem',});
    },
    clickReady: function () {
        socketModule.sendReadyStart();
        appData.player[0].is_operation = true;
    },
    reDeal: function () {
        if (appData.isDealing) {
            return;
        }

        appData.isDealing = true;
        m4aAudioPlay("audio1");
        appData.game.cardDeal = 1;
        setTimeout(function () {
            appData.game.cardDeal = 2;
            setTimeout(function () {
                appData.game.cardDeal = 3;
                setTimeout(function () {
                    appData.game.cardDeal = 4;
                    setTimeout(function () {
                        appData.game.cardDeal = 5;
                        setTimeout(function () {
                            viewMethods.resetMyAccountStatus();
                            appData.player[0].is_showCard = true;
                            appData.showClockRobText = true;
                            appData.isDealing = false;
                            if (appData.ruleInfo.banker_mode == 5 && appData.game.round == 1) {
                                viewMethods.updateAllPlayerStatus();
                            }
                        }, 200);
                    }, 80);
                }, 80);
            }, 80);
        }, 80);
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
                if (appData.player[0].account_status != 8) {
                    appData.showClickShowCard = true;
                }
            }
        } else if (appData.player[0].account_status == 8) {
            appData.player[0].is_showCard = true;
        }
    },
    resetShowButton: function () {
        appData.showRob = false;
        appData.showShowCardButton = false;
        appData.showClickShowCard = false;
        appData.showNotRobText = false;
        appData.showRobText = false;
        appData.showBankerCoinText = false;
        appData.showTimesCoin = false;
    },
    seeMyCard: function () {
        if (appData.player[0].account_id != userData.accountId) return; //观战功能

        if (appData.ruleInfo.banker_mode == 2) { //明牌抢庄
            setTimeout(function () {
                $(".myCards .card0").addClass("card-flipped");
                $(".myCards .card1").addClass("card-flipped");
                $(".myCards .card2").addClass("card-flipped");
                $(".myCards .card3").addClass("card-flipped");
                appData.clickCard4 = true;

                setTimeout(function () {
                    if (appData.clickCard4 != true || appData.clickCard5 != true) {
                        if (appData.player[0].account_status >= 7) {
                            appData.showClickShowCard = true;
                        }
                    }

                }, 500);
            }, 1000);
        } else {
            setTimeout(function () {
                $(".myCards .card0").addClass("card-flipped");
                $(".myCards .card1").addClass("card-flipped");
                $(".myCards .card2").addClass("card-flipped");

                setTimeout(function () {
                    if (appData.clickCard4 != true || appData.clickCard5 != true) {
                        appData.showClickShowCard = true;
                    }

                }, 500);
            }, 350);
        }

    },
    seeMyCard4: function () {
        if (appData.player[0].account_id != userData.accountId) return; //观战功能
        if (appData.ruleInfo.banker_mode == 1 || appData.ruleInfo.banker_mode == 3 ||
            appData.ruleInfo.banker_mode == 4 || appData.ruleInfo.banker_mode == 5) { //自由抢庄
            if (appData.player[0].account_status >= 7) {
                $(".myCards .card3").addClass("card-flipped");
                appData.clickCard4 = true;

                if (appData.clickCard4 == true && appData.clickCard5 == true) {
                    setTimeout(function () {
                        appData.showShowCardButton = true;
                        appData.showClickShowCard = false;
                    }, 100)
                }
            }
        }
    },
    seeMyCard5: function () {
        if (appData.player[0].account_id != userData.accountId) return; //观战功能
        if (appData.player[0].account_status >= 7) {
            $(".myCards .card4").addClass("card-flipped");
            appData.clickCard5 = true;
            $(".allow-rubcard").hide();
            if (appData.clickCard4 == true && appData.clickCard5 == true) {
                setTimeout(function () {
                    appData.showShowCardButton = true;
                    appData.showClickShowCard = false;
                }, 100)
            }
        }
    },
    resetCardOver: function (num) {
        if (globalData.maxCount == 6) {
            if (num == 1) {
                $(".myCards .card00").css("left", "2%");
                $(".myCards .card01").css("left", "26%");
                $(".myCards .card02").css("left", "50%");
                $(".myCards .card03").css("left", "74%");
                $(".myCards .card04").css("left", "98%");
            } else if (num == 2 || num == 3) {
                $(".cardOver .card" + num + "11").css("right", "0%");
                $(".cardOver .card" + num + "21").css("right", "4%");
                $(".cardOver .card" + num + "31").css("right", "8%");
                $(".cardOver .card" + num + "41").css("right", "12%");
                $(".cardOver .card" + num + "51").css("right", "16%");
            } else if (num == 4) {
                $(".cardOver .card451").css("left", "40%");
                $(".cardOver .card441").css("left", "44%");
                $(".cardOver .card431").css("left", "48%");
                $(".cardOver .card421").css("left", "52%");
                $(".cardOver .card411").css("left", "56%");
            } else if (num == 5 || num == 6) {
                $(".cardOver .card" + num + "51").css("left", "0");
                $(".cardOver .card" + num + "41").css("left", "4%");
                $(".cardOver .card" + num + "31").css("left", "8%");
                $(".cardOver .card" + num + "21").css("left", "12%");
                $(".cardOver .card" + num + "11").css("left", "16%");
            }
        } else if (globalData.maxCount == 10) {
            if (num == 1) {
                $(".myCards .card00").css("left", "28%");
                $(".myCards .card01").css("left", "43%");
                $(".myCards .card02").css("left", "58%");
                $(".myCards .card03").css("left", "73%");
                $(".myCards .card04").css("left", "88%");
            } else if (num == 2 || num == 3 || num == 4 || num == 5) {
                $(".cardOver .card" + num + "11").css("right", "10vh");
                $(".cardOver .card" + num + "21").css("right", "13vh");
                $(".cardOver .card" + num + "31").css("right", "16vh");
                $(".cardOver .card" + num + "41").css("right", "19vh");
                $(".cardOver .card" + num + "51").css("right", "22vh");
            } else if (num == 6) {
                $(".cardOver .card611").css("left", "24vh");
                $(".cardOver .card621").css("left", "27vh");
                $(".cardOver .card631").css("left", "30vh");
                $(".cardOver .card641").css("left", "33vh");
                $(".cardOver .card651").css("left", "35vh");
            } else if (num == 7 || num == 8 || num == 9 || num == 10) {
                $(".cardOver .card" + num + "11").css("left", "10vh");
                $(".cardOver .card" + num + "21").css("left", "13vh");
                $(".cardOver .card" + num + "31").css("left", "16vh");
                $(".cardOver .card" + num + "41").css("left", "19vh");
                $(".cardOver .card" + num + "51").css("left", "22vh");
            }
        } else if (globalData.maxCount == 13) {
            if (num == 1) {
                $(".myCards .card00").css("left", "28%");
                $(".myCards .card01").css("left", "43%");
                $(".myCards .card02").css("left", "58%");
                $(".myCards .card03").css("left", "73%");
                $(".myCards .card04").css("left", "88%");
            } else if (num == 2 || num == 3 || num == 4 || num == 5 || num == 6 || num == 7) {
                $(".cardOver .card" + num + "11").css("right", "10vh");
                $(".cardOver .card" + num + "21").css("right", "13vh");
                $(".cardOver .card" + num + "31").css("right", "16vh");
                $(".cardOver .card" + num + "41").css("right", "19vh");
                $(".cardOver .card" + num + "51").css("right", "22vh");
            } else if (num == 8 || num == 9 || num == 10 || num == 11 || num == 12 || num == 13) {
                $(".cardOver .card" + num + "11").css("left", "10vh");
                $(".cardOver .card" + num + "21").css("left", "13vh");
                $(".cardOver .card" + num + "31").css("left", "16vh");
                $(".cardOver .card" + num + "41").css("left", "19vh");
                $(".cardOver .card" + num + "51").css("left", "22vh");
            }
        } else if (globalData.maxCount == 15) {
            if (num == 1) {
                $(".myCards .card00").css("left", "28%");
                $(".myCards .card01").css("left", "43%");
                $(".myCards .card02").css("left", "58%");
                $(".myCards .card03").css("left", "73%");
                $(".myCards .card04").css("left", "88%");
            } else if (num == 2 || num == 3 || num == 4 || num == 5 || num == 6 || num == 7 || num == 8) {
                $(".cardOver .card" + num + "11").css("right", "10vh");
                $(".cardOver .card" + num + "21").css("right", "13vh");
                $(".cardOver .card" + num + "31").css("right", "16vh");
                $(".cardOver .card" + num + "41").css("right", "19vh");
                $(".cardOver .card" + num + "51").css("right", "22vh");
            } else if (num == 9 || num == 10 || num == 11 || num == 12 || num == 13 || num == 14 || num == 15) {
                $(".cardOver .card" + num + "11").css("left", "10vh");
                $(".cardOver .card" + num + "21").css("left", "13vh");
                $(".cardOver .card" + num + "31").css("left", "16vh");
                $(".cardOver .card" + num + "41").css("left", "19vh");
                $(".cardOver .card" + num + "51").css("left", "22vh");
            }
        } else if (globalData.maxCount == 17) {
            if (num == 1) {
                $(".myCards .card00").css("left", "28%");
                $(".myCards .card01").css("left", "43%");
                $(".myCards .card02").css("left", "58%");
                $(".myCards .card03").css("left", "73%");
                $(".myCards .card04").css("left", "88%");
            } else if (num == 2 || num == 3 || num == 4 || num == 5 || num == 6 || num == 7 || num == 8 || num == 9) {
                $(".cardOver .card" + num + "11").css("right", "10vh");
                $(".cardOver .card" + num + "21").css("right", "13vh");
                $(".cardOver .card" + num + "31").css("right", "16vh");
                $(".cardOver .card" + num + "41").css("right", "19vh");
                $(".cardOver .card" + num + "51").css("right", "22vh");
            } else if (num == 10 || num == 11 || num == 12 || num == 13 || num == 14 || num == 15 || num == 16 || num == 17) {
                $(".cardOver .card" + num + "11").css("left", "10vh");
                $(".cardOver .card" + num + "21").css("left", "13vh");
                $(".cardOver .card" + num + "31").css("left", "16vh");
                $(".cardOver .card" + num + "41").css("left", "19vh");
                $(".cardOver .card" + num + "51").css("left", "22vh");
            }
        }

    },
    myCardOver: function (is_bull) {
        if (appData.player[0].is_showbull == true) {
            return;
        }

        viewMethods.resetCardOver(1);

        if (globalData.maxCount == 6) {
            if (is_bull) {
                setTimeout(function () {
                    $(".myCards .card00").animate({
                        left: "22%"
                    }, 400);
                    $(".myCards .card01").animate({
                        left: "32%"
                    }, 400);
                    $(".myCards .card02").animate({
                        left: "42%"
                    }, 400);
                    $(".myCards .card03").animate({
                        left: "67%"
                    }, 400);
                    $(".myCards .card04").animate({
                        left: "77%"
                    }, 400);
                }, 0);
            } else {
                setTimeout(function () {
                    $(".myCards .card00").animate({
                        left: "30%"
                    }, 400);
                    $(".myCards .card01").animate({
                        left: "40%"
                    }, 400);
                    $(".myCards .card02").animate({
                        left: "50%"
                    }, 400);
                    $(".myCards .card03").animate({
                        left: "60%"
                    }, 400);
                    $(".myCards .card04").animate({
                        left: "70%"
                    }, 400);
                }, 0);
            }
        } else {
            if (is_bull) {
                setTimeout(function () {
                    $(".myCards .card00").animate({
                        left: "28%"
                    }, 400);
                    $(".myCards .card01").animate({
                        left: "37%"
                    }, 400);
                    $(".myCards .card02").animate({
                        left: "46%"
                    }, 400);
                    $(".myCards .card03").animate({
                        left: "62%"
                    }, 400);
                    $(".myCards .card04").animate({
                        left: "72%"
                    }, 400);
                }, 0);
            } else {
                setTimeout(function () {
                    $(".myCards .card00").animate({
                        left: "28%"
                    }, 400);
                    $(".myCards .card01").animate({
                        left: "39%"
                    }, 400);
                    $(".myCards .card02").animate({
                        left: "50%"
                    }, 400);
                    $(".myCards .card03").animate({
                        left: "61%"
                    }, 400);
                    $(".myCards .card04").animate({
                        left: "72%"
                    }, 400);
                }, 0);
            }
        }


        appData.player[0].is_showbull = true;
    },
    cardOver: function (num, is_bull) {
        if (num <= 1) {
            return;
        }

        if (appData.player[num - 1].is_showbull == true) {
            return;
        }

        appData.player[num - 1].is_showbull = true;

        viewMethods.resetCardOver(num);

        if (globalData.maxCount == 6) {
            setTimeout(function () {
                if (num == 2 || num == 3) {
                    $(".cardOver .card" + num + "11").animate({
                        right: "0"
                    }, 250);
                    $(".cardOver .card" + num + "21").animate({
                        right: "0"
                    }, 250);
                    $(".cardOver .card" + num + "31").animate({
                        right: "0"
                    }, 250);
                    $(".cardOver .card" + num + "41").animate({
                        right: "0"
                    }, 250);
                    $(".cardOver .card" + num + "51").animate({
                        right: "0"
                    }, 250);
                    if (!is_bull) {
                        setTimeout(function () {
                            $(".cardOver .cardtf" + num).addClass("card-flipped");
                            $(".cardOver .card" + num + "11").animate({
                                right: "0"
                            }, 400);
                            $(".cardOver .card" + num + "21").animate({
                                right: "6%"
                            }, 400);
                            $(".cardOver .card" + num + "31").animate({
                                right: "12%"
                            }, 400);
                            $(".cardOver .card" + num + "41").animate({
                                right: "18%"
                            }, 400);
                            $(".cardOver .card" + num + "51").animate({
                                right: "24%"
                            }, 400);
                        }, 250);
                    } else {
                        setTimeout(function () {
                            $(".cardOver .cardtf" + num).addClass("card-flipped");
                            $(".cardOver .card" + num + "21").animate({
                                right: "6%"
                            }, 400);
                            $(".cardOver .card" + num + "31").animate({
                                right: "16%"
                            }, 400);
                            $(".cardOver .card" + num + "41").animate({
                                right: "22%"
                            }, 400);
                            $(".cardOver .card" + num + "51").animate({
                                right: "28%"
                            }, 400);
                        }, 250);
                    }
                } else if (num == 4) {
                    $(".cardOver .card" + num + "51").animate({
                        left: "38%"
                    }, 250);
                    $(".cardOver .card" + num + "41").animate({
                        left: "38%"
                    }, 250);
                    $(".cardOver .card" + num + "31").animate({
                        left: "38%"
                    }, 250);
                    $(".cardOver .card" + num + "21").animate({
                        left: "38%"
                    }, 250);
                    $(".cardOver .card" + num + "11").animate({
                        left: "38%"
                    }, 250);
                    if (!is_bull) {
                        setTimeout(function () {
                            $(".cardOver .cardtf" + num).addClass("card-flipped");
                            $(".cardOver .card" + num + "51").animate({
                                left: "38%"
                            }, 400);
                            $(".cardOver .card" + num + "41").animate({
                                left: "43%"
                            }, 400);
                            $(".cardOver .card" + num + "31").animate({
                                left: "49%"
                            }, 400);
                            $(".cardOver .card" + num + "21").animate({
                                left: "55%"
                            }, 400);
                            $(".cardOver .card" + num + "11").animate({
                                left: "61%"
                            }, 400);
                        }, 250);
                    } else {
                        setTimeout(function () {
                            $(".cardOver .cardtf" + num).addClass("card-flipped");
                            $(".cardOver .card" + num + "51").animate({
                                left: "35%"
                            }, 400);
                            $(".cardOver .card" + num + "41").animate({
                                left: "41%"
                            }, 400);
                            $(".cardOver .card" + num + "31").animate({
                                left: "47%"
                            }, 400);
                            $(".cardOver .card" + num + "21").animate({
                                left: "57%"
                            }, 400);
                            $(".cardOver .card" + num + "11").animate({
                                left: "63%"
                            }, 400);
                        }, 250);
                    }
                } else if (num == 5 || num == 6) {
                    $(".cardOver .card" + num + "51").animate({
                        left: "0"
                    }, 250);
                    $(".cardOver .card" + num + "41").animate({
                        left: "0"
                    }, 250);
                    $(".cardOver .card" + num + "31").animate({
                        left: "0"
                    }, 250);
                    $(".cardOver .card" + num + "21").animate({
                        left: "0"
                    }, 250);
                    $(".cardOver .card" + num + "11").animate({
                        left: "0"
                    }, 250);
                    if (!is_bull) {
                        setTimeout(function () {
                            $(".cardOver .cardtf" + num).addClass("card-flipped");
                            $(".cardOver .card" + num + "51").animate({
                                left: "0"
                            }, 400);
                            $(".cardOver .card" + num + "41").animate({
                                left: "6%"
                            }, 400);
                            $(".cardOver .card" + num + "31").animate({
                                left: "12%"
                            }, 400);
                            $(".cardOver .card" + num + "21").animate({
                                left: "18%"
                            }, 400);
                            $(".cardOver .card" + num + "11").animate({
                                left: "24%"
                            }, 400);
                        }, 250);
                    } else {
                        setTimeout(function () {
                            $(".cardOver .cardtf" + num).addClass("card-flipped");
                            $(".cardOver .card" + num + "51").animate({
                                left: "0"
                            }, 400);
                            $(".cardOver .card" + num + "41").animate({
                                left: "6%"
                            }, 400);
                            $(".cardOver .card" + num + "31").animate({
                                left: "12%"
                            }, 400);
                            $(".cardOver .card" + num + "21").animate({
                                left: "22%"
                            }, 400);
                            $(".cardOver .card" + num + "11").animate({
                                left: "28%"
                            }, 400);
                        }, 250);
                    }
                }
            }, 1);
        } else if (globalData.maxCount == 10) {
            setTimeout(function () {
                if (num == 2 || num == 3 || num == 4 || num == 5) {
                    $(".cardOver .card" + num + "11").animate({
                        right: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "21").animate({
                        right: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "31").animate({
                        right: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "41").animate({
                        right: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "51").animate({
                        right: "9vh"
                    }, 250);

                    if (!is_bull) {
                        setTimeout(function () {
                            $(".cardOver .cardtf" + num).addClass("card-flipped");
                            $(".cardOver .card" + num + "11").animate({
                                right: "9vh"
                            }, 250);
                            $(".cardOver .card" + num + "21").animate({
                                right: "12vh"
                            }, 400);
                            $(".cardOver .card" + num + "31").animate({
                                right: "15vh"
                            }, 400);
                            $(".cardOver .card" + num + "41").animate({
                                right: "18vh"
                            }, 400);
                            $(".cardOver .card" + num + "51").animate({
                                right: "21vh"
                            }, 400);
                        }, 250);
                    } else {
                        setTimeout(function () {
                            $(".cardOver .cardtf" + num).addClass("card-flipped");
                            $(".cardOver .card" + num + "21").animate({
                                right: "11.5vh"
                            }, 400);
                            $(".cardOver .card" + num + "31").animate({
                                right: "16vh"
                            }, 400);
                            $(".cardOver .card" + num + "41").animate({
                                right: "18.5vh"
                            }, 400);
                            $(".cardOver .card" + num + "51").animate({
                                right: "21vh"
                            }, 400);
                        }, 250);
                    }
                } else if (num == 7 || num == 8 || num == 9 || num == 10) {
                    $(".cardOver .card" + num + "11").animate({
                        left: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "21").animate({
                        left: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "31").animate({
                        left: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "41").animate({
                        left: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "51").animate({
                        left: "9vh"
                    }, 250);

                    if (!is_bull) {
                        setTimeout(function () {
                            $(".cardOver .cardtf" + num).addClass("card-flipped");
                            $(".cardOver .card" + num + "11").animate({
                                left: "21vh"
                            }, 400);
                            $(".cardOver .card" + num + "21").animate({
                                left: "18vh"
                            }, 400);
                            $(".cardOver .card" + num + "31").animate({
                                left: "15vh"
                            }, 400);
                            $(".cardOver .card" + num + "41").animate({
                                left: "12vh"
                            }, 400);
                            $(".cardOver .card" + num + "51").animate({
                                left: "9vh"
                            }, 400);
                        }, 250);
                    } else {
                        setTimeout(function () {
                            $(".cardOver .cardtf" + num).addClass("card-flipped");
                            $(".cardOver .card" + num + "11").animate({
                                left: "21vh"
                            }, 400);
                            $(".cardOver .card" + num + "21").animate({
                                left: "18.5vh"
                            }, 400);
                            $(".cardOver .card" + num + "31").animate({
                                left: "14vh"
                            }, 400);
                            $(".cardOver .card" + num + "41").animate({
                                left: "11.5vh"
                            }, 400);
                            $(".cardOver .card" + num + "51").animate({
                                left: "9vh"
                            }, 400);
                        }, 250);
                    }
                } else if (num == 6) {
                    $(".cardOver .card" + num + "11").animate({
                        left: "23vh"
                    }, 250);
                    $(".cardOver .card" + num + "21").animate({
                        left: "23vh"
                    }, 250);
                    $(".cardOver .card" + num + "31").animate({
                        left: "23vh"
                    }, 250);
                    $(".cardOver .card" + num + "41").animate({
                        left: "23vh"
                    }, 250);
                    $(".cardOver .card" + num + "51").animate({
                        left: "23vh"
                    }, 250);

                    if (!is_bull) {
                        setTimeout(function () {
                            $(".cardOver .cardtf" + num).addClass("card-flipped");
                            $(".cardOver .card" + num + "11").animate({
                                left: "35vh"
                            }, 400);
                            $(".cardOver .card" + num + "21").animate({
                                left: "32vh"
                            }, 400);
                            $(".cardOver .card" + num + "31").animate({
                                left: "29vh"
                            }, 400);
                            $(".cardOver .card" + num + "41").animate({
                                left: "26vh"
                            }, 400);
                            $(".cardOver .card" + num + "51").animate({
                                left: "23vh"
                            }, 400);
                        }, 250);
                    } else {
                        setTimeout(function () {
                            $(".cardOver .cardtf" + num).addClass("card-flipped");
                            $(".cardOver .card" + num + "11").animate({
                                left: "35vh"
                            }, 400);
                            $(".cardOver .card" + num + "21").animate({
                                left: "32.5vh"
                            }, 400);
                            $(".cardOver .card" + num + "31").animate({
                                left: "28vh"
                            }, 400);
                            $(".cardOver .card" + num + "41").animate({
                                left: "25.5vh"
                            }, 400);
                            $(".cardOver .card" + num + "51").animate({
                                left: "23vh"
                            }, 400);
                        }, 250);
                    }
                }
            }, 1);
        } else if (globalData.maxCount == 13) {
            setTimeout(function () {
                if (num == 2 || num == 3 || num == 4 || num == 5 || num == 6 || num == 7) {
                    $(".cardOver .card" + num + "11").animate({
                        right: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "21").animate({
                        right: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "31").animate({
                        right: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "41").animate({
                        right: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "51").animate({
                        right: "9vh"
                    }, 250);

                    if (!is_bull) {
                        setTimeout(function () {
                            $(".cardOver .cardtf" + num).addClass("card-flipped");
                            $(".cardOver .card" + num + "11").animate({
                                right: "9vh"
                            }, 250);
                            $(".cardOver .card" + num + "21").animate({
                                right: "12vh"
                            }, 400);
                            $(".cardOver .card" + num + "31").animate({
                                right: "15vh"
                            }, 400);
                            $(".cardOver .card" + num + "41").animate({
                                right: "18vh"
                            }, 400);
                            $(".cardOver .card" + num + "51").animate({
                                right: "21vh"
                            }, 400);
                        }, 250);
                    } else {
                        setTimeout(function () {
                            $(".cardOver .cardtf" + num).addClass("card-flipped");
                            $(".cardOver .card" + num + "21").animate({
                                right: "11.5vh"
                            }, 400);
                            $(".cardOver .card" + num + "31").animate({
                                right: "16vh"
                            }, 400);
                            $(".cardOver .card" + num + "41").animate({
                                right: "18.5vh"
                            }, 400);
                            $(".cardOver .card" + num + "51").animate({
                                right: "21vh"
                            }, 400);
                        }, 250);
                    }
                } else if (num == 8 || num == 9 || num == 10 || num == 11 || num == 12 || num == 13) {
                    $(".cardOver .card" + num + "11").animate({
                        left: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "21").animate({
                        left: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "31").animate({
                        left: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "41").animate({
                        left: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "51").animate({
                        left: "9vh"
                    }, 250);

                    if (!is_bull) {
                        setTimeout(function () {
                            $(".cardOver .cardtf" + num).addClass("card-flipped");
                            $(".cardOver .card" + num + "11").animate({
                                left: "21vh"
                            }, 400);
                            $(".cardOver .card" + num + "21").animate({
                                left: "18vh"
                            }, 400);
                            $(".cardOver .card" + num + "31").animate({
                                left: "15vh"
                            }, 400);
                            $(".cardOver .card" + num + "41").animate({
                                left: "12vh"
                            }, 400);
                            $(".cardOver .card" + num + "51").animate({
                                left: "9vh"
                            }, 400);
                        }, 250);
                    } else {
                        setTimeout(function () {
                            $(".cardOver .cardtf" + num).addClass("card-flipped");
                            $(".cardOver .card" + num + "11").animate({
                                left: "21vh"
                            }, 400);
                            $(".cardOver .card" + num + "21").animate({
                                left: "18.5vh"
                            }, 400);
                            $(".cardOver .card" + num + "31").animate({
                                left: "14vh"
                            }, 400);
                            $(".cardOver .card" + num + "41").animate({
                                left: "11.5vh"
                            }, 400);
                            $(".cardOver .card" + num + "51").animate({
                                left: "9vh"
                            }, 400);
                        }, 250);
                    }
                }
            }, 1);
        } else if (globalData.maxCount == 15) {
            setTimeout(function () {
                if (num == 2 || num == 3 || num == 4 || num == 5 || num == 6 || num == 7 || num == 8) {
                    $(".cardOver .card" + num + "11").animate({
                        right: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "21").animate({
                        right: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "31").animate({
                        right: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "41").animate({
                        right: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "51").animate({
                        right: "9vh"
                    }, 250);

                    if (!is_bull) {
                        setTimeout(function () {
                            $(".cardOver .cardtf" + num).addClass("card-flipped");
                            $(".cardOver .card" + num + "11").animate({
                                right: "9vh"
                            }, 250);
                            $(".cardOver .card" + num + "21").animate({
                                right: "12vh"
                            }, 400);
                            $(".cardOver .card" + num + "31").animate({
                                right: "15vh"
                            }, 400);
                            $(".cardOver .card" + num + "41").animate({
                                right: "18vh"
                            }, 400);
                            $(".cardOver .card" + num + "51").animate({
                                right: "21vh"
                            }, 400);
                        }, 250);
                    } else {
                        setTimeout(function () {
                            $(".cardOver .cardtf" + num).addClass("card-flipped");
                            $(".cardOver .card" + num + "21").animate({
                                right: "11.5vh"
                            }, 400);
                            $(".cardOver .card" + num + "31").animate({
                                right: "16vh"
                            }, 400);
                            $(".cardOver .card" + num + "41").animate({
                                right: "18.5vh"
                            }, 400);
                            $(".cardOver .card" + num + "51").animate({
                                right: "21vh"
                            }, 400);
                        }, 250);
                    }
                } else if (num == 9 || num == 10 || num == 11 || num == 12 || num == 13 || num == 14 || num == 15) {
                    $(".cardOver .card" + num + "11").animate({
                        left: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "21").animate({
                        left: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "31").animate({
                        left: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "41").animate({
                        left: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "51").animate({
                        left: "9vh"
                    }, 250);

                    if (!is_bull) {
                        setTimeout(function () {
                            $(".cardOver .cardtf" + num).addClass("card-flipped");
                            $(".cardOver .card" + num + "11").animate({
                                left: "21vh"
                            }, 400);
                            $(".cardOver .card" + num + "21").animate({
                                left: "18vh"
                            }, 400);
                            $(".cardOver .card" + num + "31").animate({
                                left: "15vh"
                            }, 400);
                            $(".cardOver .card" + num + "41").animate({
                                left: "12vh"
                            }, 400);
                            $(".cardOver .card" + num + "51").animate({
                                left: "9vh"
                            }, 400);
                        }, 250);
                    } else {
                        setTimeout(function () {
                            $(".cardOver .cardtf" + num).addClass("card-flipped");
                            $(".cardOver .card" + num + "11").animate({
                                left: "21vh"
                            }, 400);
                            $(".cardOver .card" + num + "21").animate({
                                left: "18.5vh"
                            }, 400);
                            $(".cardOver .card" + num + "31").animate({
                                left: "14vh"
                            }, 400);
                            $(".cardOver .card" + num + "41").animate({
                                left: "11.5vh"
                            }, 400);
                            $(".cardOver .card" + num + "51").animate({
                                left: "9vh"
                            }, 400);
                        }, 250);
                    }
                }
            }, 1);
        } else if (globalData.maxCount == 17) {
            setTimeout(function () {
                if (num == 2 || num == 3 || num == 4 || num == 5 || num == 6 || num == 7 || num == 8 || num == 9) {
                    $(".cardOver .card" + num + "11").animate({
                        right: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "21").animate({
                        right: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "31").animate({
                        right: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "41").animate({
                        right: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "51").animate({
                        right: "9vh"
                    }, 250);

                    if (!is_bull) {
                        setTimeout(function () {
                            $(".cardOver .cardtf" + num).addClass("card-flipped");
                            $(".cardOver .card" + num + "11").animate({
                                right: "9vh"
                            }, 250);
                            $(".cardOver .card" + num + "21").animate({
                                right: "12vh"
                            }, 400);
                            $(".cardOver .card" + num + "31").animate({
                                right: "15vh"
                            }, 400);
                            $(".cardOver .card" + num + "41").animate({
                                right: "18vh"
                            }, 400);
                            $(".cardOver .card" + num + "51").animate({
                                right: "21vh"
                            }, 400);
                        }, 250);
                    } else {
                        setTimeout(function () {
                            $(".cardOver .cardtf" + num).addClass("card-flipped");
                            $(".cardOver .card" + num + "21").animate({
                                right: "11.5vh"
                            }, 400);
                            $(".cardOver .card" + num + "31").animate({
                                right: "16vh"
                            }, 400);
                            $(".cardOver .card" + num + "41").animate({
                                right: "18.5vh"
                            }, 400);
                            $(".cardOver .card" + num + "51").animate({
                                right: "21vh"
                            }, 400);
                        }, 250);
                    }
                } else if (num == 10 || num == 11 || num == 12 || num == 13 || num == 14 || num == 15 || num == 16 || num == 17) {
                    $(".cardOver .card" + num + "11").animate({
                        left: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "21").animate({
                        left: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "31").animate({
                        left: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "41").animate({
                        left: "9vh"
                    }, 250);
                    $(".cardOver .card" + num + "51").animate({
                        left: "9vh"
                    }, 250);

                    if (!is_bull) {
                        setTimeout(function () {
                            $(".cardOver .cardtf" + num).addClass("card-flipped");
                            $(".cardOver .card" + num + "11").animate({
                                left: "21vh"
                            }, 400);
                            $(".cardOver .card" + num + "21").animate({
                                left: "18vh"
                            }, 400);
                            $(".cardOver .card" + num + "31").animate({
                                left: "15vh"
                            }, 400);
                            $(".cardOver .card" + num + "41").animate({
                                left: "12vh"
                            }, 400);
                            $(".cardOver .card" + num + "51").animate({
                                left: "9vh"
                            }, 400);
                        }, 250);
                    } else {
                        setTimeout(function () {
                            $(".cardOver .cardtf" + num).addClass("card-flipped");
                            $(".cardOver .card" + num + "11").animate({
                                left: "21vh"
                            }, 400);
                            $(".cardOver .card" + num + "21").animate({
                                left: "18.5vh"
                            }, 400);
                            $(".cardOver .card" + num + "31").animate({
                                left: "14vh"
                            }, 400);
                            $(".cardOver .card" + num + "41").animate({
                                left: "11.5vh"
                            }, 400);
                            $(".cardOver .card" + num + "51").animate({
                                left: "9vh"
                            }, 400);
                        }, 250);
                    }
                }
            }, 1);
        }
    },
    gameOverNew: function (board, balance_scoreboard) {

        for (var i = 0; i < appData.playerBoard.score.length; i++) {
            appData.playerBoard.score[i].num = 0;
            appData.playerBoard.score[i].account_id = 0;
            appData.playerBoard.score[i].nickname = '';
            appData.playerBoard.score[i].account_score = 0;
            appData.playerBoard.score[i].isBigWinner = 0;
        }


        for (var i = 0; i < appData.player.length; i++) {
            for (s in board) {
                if (appData.player[i].account_id == s) {
                    appData.player[i].account_score = Math.ceil(board[s]);
                    appData.playerBoard.score[i].num = appData.player[i].num;
                    appData.playerBoard.score[i].account_id = appData.player[i].account_id;
                    appData.playerBoard.score[i].nickname = appData.player[i].nickname;
                    appData.playerBoard.score[i].account_score = appData.player[i].account_score;
                }
            }
        }

        var d = new Date(), str = "";
        str += d.getFullYear() + "-";
        str += d.getMonth() + 1 + "-";
        str += d.getDate() + "  ";
        str += d.getHours() + ":";

        if (d.getMinutes() >= 10) {
            str += d.getMinutes();
        } else {
            str += "0" + d.getMinutes();
        }

        // appData.playerBoard.record = str + " 前" + appData.playerBoard.round + "局";
        appData.playerBoard.room = '房间号:' + globalData.roomNumber;
        appData.playerBoard.record = str;
        appData.base_score = appData.game.base_score;

        if (balance_scoreboard != undefined && balance_scoreboard != "-1") {
            console.log(balance_scoreboard);
            socketModule.processBalanceScoreboard(balance_scoreboard);
        }

        for (var i = 0; i < appData.player.length; i++) {
            appData.player[i].playing_status = 0;

            appData.player[i].is_operation = false;

            appData.player[i].win_show = false;
            appData.player[i].card = new Array();
            appData.player[i].card_open = new Array();
            appData.player[i].card_type = 0;
            appData.player[i].is_showCard = false;

            //appData.player[i].is_banker = false;
            appData.player[i].multiples = 0;
            appData.player[i].bankerMultiples = 0;
            appData.player[i].is_bull = false;
            appData.player[i].is_showbull = false;
            appData.player[i].is_audiobull = false;
        }


        appData.game.cardDeal = 0;

        appData.game.status = 1;
        appData.player[0].is_showCard = false;
        appData.showClockRobText = false;
        appData.showClockBetText = false;
        appData.showClockShowCard = false;
    },
    showMessage: function () {
        if (appData.player[0].account_id != userData.accountId) return; //观战功能
        appData.isShowNewMessage = true;
    },
    hideMessage: function () {
        appData.isShowNewMessage = false;
    },
    messageOn: function (num) {
        // socketModule.sendBroadcastVoice(num);
        // if(appData.player[0].sex == 1){
        //     m4aAudioPlay("message" + num);
        // }else{
        //     m4aAudioPlay("message" + num + '_1');
        // }
        // viewMethods.messageSay(0, num);
        // viewMethods.hideMessage();

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
    messageSay: function (num1, num2) {
        appData.player[num1].messageOn = true;
        appData.player[num1].messageText = appData.message[num2].text;
        setTimeout(function () {
            appData.player[num1].messageOn = false;
        }, 2500);
    },
    closeEnd: function () {
        return;
        // $(".ranking .rankBack").css("opacity", "0.7");
        // $(".end").hide();
        // $(".roundEndShow").hide();
        // $(".ranking").hide();
        // window.location.reload();
    },
    roundEnd: function () {
        //window.location.href = globalData.baseUrl + 'home/n?i=' + globalData.roomNumber + '_&v=' + (new Date().getTime());
        DynLoading.goto('bbull' + globalData.maxCount, 'i=' + globalData.roomNumber);
    },
    updateAllPlayerStatus: function () {
        for (var i = 0; i < appData.player.length; i++) {
            //判断倍数图片
            if (appData.player[i].multiples > 0) {
                appData.player[i].timesImg = globalData.fileUrl + "fiesc/images/bull_yh/text_times" + appData.player[i].multiples + ".png";
            }

            if (appData.player[i].bankerMultiples > 0) {
                appData.player[i].bankerTimesImg = globalData.fileUrl + "fiesc/images/bull_yh/text_times" + appData.player[i].bankerMultiples + ".png";
            }

            //判断牛几图片
            if (appData.player[i].card_type >= 1) {
                var imgIndex = 0;
                var cardType = parseInt(appData.player[i].card_type);
                appData.player[i].is_bull = false;
                if (cardType == 1) {
                    imgIndex = 0;
                } else if (cardType == 4) { //牛 牛
                    imgIndex = 10;
                    appData.player[i].is_bull = true;
                } else if (cardType == 5) { //五花牛
                    imgIndex = 11;
                    appData.player[i].is_bull = true;
                } else if (cardType == 6) { //炸弹
                    imgIndex = 12;
                } else if (cardType == 7) { //小牛仔
                    imgIndex = 13;
                } else if (cardType == 8) { //四花牛
                    imgIndex = 14;
                    appData.player[i].is_bull = true;
                } else if (cardType == 9) { //葫芦牛
                    imgIndex = 15;
                } else if (cardType == 10) { //顺子牛
                    imgIndex = 16;
                } else if (cardType == 11) { //同花牛
                    imgIndex = 17;
                } else if (cardType == 12) { //同花顺
                    imgIndex = 18;
                } else if (cardType == 13) { //四小牛
                    imgIndex = 19;
                } else if (cardType == 14) { //核弹牛
                    imgIndex = 20;
                } else {
                    appData.player[i].is_bull = true;
                    imgIndex = appData.player[i].combo_point;
                }
                appData.player[i].bullImg = globalData.fileUrl + "fiesc/images/bull_yh/bull" + imgIndex + ".png";
            }
            if (appData.player[i].account_status == 4) {

                if (appData.ruleInfo.banker_mode == 5) {
                    appData.player[i].robImg = globalData.fileUrl + "fiesc/images/bull_yh/text_notgo.png";
                } else {
                    //不抢庄
                    appData.player[i].robImg = globalData.fileUrl + "fiesc/images/bull_yh/text_notrob.png";
                }
            } else if (appData.player[i].account_status == 5) {

                if (appData.ruleInfo.banker_mode == 5) {
                    appData.player[i].robImg = globalData.fileUrl + "fiesc/images/bull_yh/text_go.png";
                } else {
                    appData.player[i].robImg = globalData.fileUrl + "fiesc/images/bull_yh/text_rob.png";
                }
            } else if (appData.player[i].account_status == 6) {
                //下注
                if (appData.player[i].multiples > 0) {
                }
            } else if (appData.player[i].account_status == 7) {
                //未摊牌
                if (i == 0) {
                    viewMethods.seeMyCard();
                }
            } else if (appData.player[i].account_status == 8) {
                //摊牌
                if (i == 0) {
                    viewMethods.myCardOver(appData.player[i].is_bull);
                } else {
                    viewMethods.cardOver(appData.player[i].num, appData.player[i].is_bull);
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
    // 辅助摊牌定时器
    timeCountDownAuto: function () {
        appData.game.timeAuto--;
        // console.log('timeAuto',appData.game.timeAuto)
        if (appData.game.timeAuto <= 0 && appData.player[0].account_id == userData.accountId && appData.player[0].is_guest != 1) {
            if (appData.player[0].account_status == 3) {
                console.log('autoGrabBanker')
                socketModule.sendData({
                    operation: wsOperation.GrabBanker,
                    account_id: userData.accountId,
                    session: globalData.session,
                    data: {
                        room_id: appData.game.room,
                        is_grab: "0",
                        multiples: "1"
                    }
                });
                return;
            }
            if (appData.player[0].account_status == 6 && appData.player[0].is_banker == 0) {
                console.log('autoPlayerMultiples')
                socketModule.sendData({
                    operation: wsOperation.PlayerMultiples,
                    account_id: userData.accountId,
                    session: globalData.session,
                    data: {
                        room_id: appData.game.room,
                        multiples: appData.coinList[0]
                    }
                });
                return;
            }
            if (appData.player[0].account_status == 7) {
                console.log('autoShowCard')
                socketModule.sendShowCard();
                return;
            }
        }
        appData.timer = setTimeout(function () {
            viewMethods.timeCountDownAuto();
        }, 1e3);
    },
    clickRobBanker: function (multiples) {
        viewMethods.showRobBankerText();
        socketModule.sendGrabBanker(multiples);

        if (appData.ruleInfo.banker_mode == 2) {
            appData.player[0].bankerMultiples = multiples;


            if (appData.player[0].bankerMultiples > 0) {
                appData.player[0].bankerTimesImg = globalData.fileUrl + "fiesc/images/bull_yh/text_times" + appData.player[0].bankerMultiples + ".png";
            }
        }
        console.log(appData.player[0].bankerTimesImg);

        setTimeout(function () {
            mp3AudioPlay("audioRobBanker", appData.player[0].sex);
        }, 10);
    },
    showRobBankerText: function () {
        appData.showRob = false;
        appData.showShowCardButton = false;
        appData.showClickShowCard = false;
        appData.showNotRobText = false;
        appData.showRobText = true;
        appData.showBankerCoinText = false;
        appData.showTimesCoin = false;
    },
    showNotRobBankerTextFnc: function () {
        appData.showRob = false;
        appData.showShowCardButton = false;
        appData.showClickShowCard = false;
        appData.showNotRobText = true;
        appData.showRobText = false;
        appData.showBankerCoinText = false;
        appData.showTimesCoin = false;
    },
    clickNotRobBanker: function () {
        viewMethods.showNotRobBankerTextFnc();
        socketModule.sendNotGrabBanker();
        setTimeout(function () {
            mp3AudioPlay("audioNoBanker", appData.player[0].sex);
        }, 10);
    },
    clickSelectTimesCoin: function (times) {
        //appData.base_score = parseInt(appData.game.base_score) * parseInt(times);

        appData.player[0].multiples = times;
        appData.showTimesCoin = false;

        if (appData.player[0].multiples > 0) {
            appData.player[0].timesImg = globalData.fileUrl + "fiesc/images/bull_yh/text_times" + appData.player[0].multiples + ".png";
        }

        socketModule.sendPlayerMultiples(times);
        setTimeout(function () {
            mp3AudioPlay("audioTimes" + times, appData.player[0].sex);
        }, 50);
    },
    clickShowCard: function () {
        appData.showShowCardButton = false;
        appData.showClickShowCard = false;
        socketModule.sendShowCard();
    },
    clearBanker: function () {
        for (var i = 0; i < appData.player.length; i++) {
            appData.player[i].is_banker = false;
        }
        appData.isFinishBankerAnimate = false;
        var totalCount = appData.bankerArray.length * 2;
        appData.bankerAnimateDuration = parseInt(1200 / totalCount);


    },
    robBankerWithoutAnimate: function () {

        for (var i = 0; i < appData.player.length; i++) {
            if (appData.player[i].account_id == appData.bankerAccountId) {
                appData.player[i].is_banker = true;
                bankerNum = appData.player[i].num;
            } else {
                appData.player[i].is_banker = false;
            }

            $("#bankerAnimate2" + appData.player[i].num).hide();
            $("#bankerAnimate1" + appData.player[i].num).hide();
        }

        setTimeout(function () {
            appData.showClockRobText = false;
            appData.showClockBetText = true;
            appData.isFinishBankerAnimate = true;
            viewMethods.resetMyAccountStatus();
            viewMethods.updateAllPlayerStatus();
        }, 10);

        appData.game.time = appData.limitTimeGrab;
        if (appData.game.time > 0) {
            viewMethods.timeCountDown();
        }

        // 辅助摊牌定时器
        appData.game.timeAuto = appData.limitTimeGrab + 3;
        if (appData.game.timeAuto > 0) {
            viewMethods.timeCountDownAuto();
        }
    },
    robBankerAnimate: function (obj) {

        if (appData.ruleInfo.banker_mode == 5) {
            appData.showRob = false;
        }

        for (var i = 0; i < appData.bankerArray.length; i++) {
            var imgId = "#banker" + appData.bankerArray[i];
            $(imgId).hide();
        }
        var totalCount = appData.bankerArray.length * 2;
        if (appData.bankerAnimateCount >= totalCount || appData.bankerAnimateIndex < 0 || appData.bankerArray.length < 2) {
            appData.bankerAnimateCount = 0;
            appData.bankerAnimateIndex = -1;
            var imgId = "#banker" + appData.bankerAccountId;
            $(imgId).show();

            var bankerNum = '';

            for (var i = 0; i < appData.player.length; i++) {
                if (appData.player[i].account_id == appData.bankerAccountId) {
                    appData.player[i].is_banker = true;
                    bankerNum = appData.player[i].num;
                } else {
                    appData.player[i].is_banker = false;
                }

                $("#bankerAnimate2" + appData.player[i].num).hide();
                $("#bankerAnimate1" + appData.player[i].num).hide();
            }

            $(imgId).hide();

            $("#bankerAnimate2" + bankerNum).css({
                top: "10%",
                left: "10%",
                width: "80%",
                height: "80%"
            });

            $("#bankerAnimate1" + bankerNum).css({
                top: "5%",
                left: "5%",
                width: "90%",
                height: "90%"
            });

            $("#bankerAnimate2" + bankerNum).show();
            $("#bankerAnimate1" + bankerNum).show();

            $("#bankerAnimate1" + bankerNum).animate({
                top: "5%",
                left: "5%",
                width: "90%",
                height: "90%"
            }, 200, function () {
                $("#bankerAnimate1" + bankerNum).animate({
                    top: "10%",
                    left: "10%",
                    width: "80%",
                    height: "80%"
                }, 200, function () {
                    $("#bankerAnimate1" + bankerNum).hide();
                });
            });

            $("#bankerAnimate2" + bankerNum).animate({
                top: "-10%",
                left: "-10%",
                width: "120%",
                height: "120%"
            }, 200, function () {
                $("#bankerAnimate2" + bankerNum).animate({
                    top: "10%",
                    left: "10%",
                    width: "80%",
                    height: "80%"
                }, 200, function () {
                    $("#bankerAnimate2" + bankerNum).hide();

                    setTimeout(function () {

                        appData.showClockRobText = false;
                        appData.showClockBetText = true;
                        appData.isFinishBankerAnimate = true;

                        if (appData.ruleInfo.banker_mode == 5) {
                            for (var i = 0; i < obj.data.length; i++) {
                                for (var j = 0; j < appData.player.length; j++) {
                                    if (appData.player[j].account_id == obj.data[i].account_id) {
                                        appData.player[j].account_score = obj.data[i].account_score;
                                    }
                                }
                            }

                            setTimeout(function () {
                                viewMethods.reDeal();
                            }, 1000);

                            if (appData.game.round != 1) {
                                viewMethods.resetMyAccountStatus();
                                viewMethods.updateAllPlayerStatus();
                            }
                        } else {
                            viewMethods.resetMyAccountStatus();
                            viewMethods.updateAllPlayerStatus();
                        }

                    }, 10);

                    appData.game.time = appData.limitTimeGrab;
                    if (appData.game.time > 0) {
                        viewMethods.timeCountDown();
                    }

                    // 辅助摊牌定时器
                    appData.game.timeAuto = appData.limitTimeGrab + 4;
                    if (appData.game.timeAuto > 0) {
                        viewMethods.timeCountDownAuto();
                    }
                });
            });

            return;
        }

        var accountId = appData.bankerArray[appData.bankerAnimateIndex];
        var imgId = "#banker" + accountId;

        $(imgId).show();

        appData.lastBankerImgId = imgId;
        appData.bankerAnimateCount++;
        appData.bankerAnimateIndex++;

        if (appData.bankerAnimateIndex >= appData.bankerArray.length) {
            appData.bankerAnimateIndex = 0;
        }

        setTimeout(function () {
            viewMethods.robBankerAnimate(obj);
        }, appData.bankerAnimateDuration);
    },
    robBankerAnimate10: function (obj) {
        if (appData.ruleInfo.banker_mode == 5) {
            appData.showRob = false;
        }

        for (var i = 0; i < appData.bankerArray.length; i++) {
            var imgId = "#banker" + appData.bankerArray[i];
            $(imgId).hide();
        }
        var totalCount = appData.bankerArray.length * 2;
        if (appData.bankerAnimateCount >= totalCount || appData.bankerAnimateIndex < 0 || appData.bankerArray.length < 2) {
            appData.bankerAnimateCount = 0;
            appData.bankerAnimateIndex = -1;
            var imgId = "#banker" + appData.bankerAccountId;
            $(imgId).show();

            var bankerNum = '';

            for (var i = 0; i < appData.player.length; i++) {
                if (appData.player[i].account_id == appData.bankerAccountId) {
                    appData.player[i].is_banker = true;
                    bankerNum = appData.player[i].num;
                } else {
                    appData.player[i].is_banker = false;
                }

                $("#bankerAnimate2" + appData.player[i].num).hide();
                $("#bankerAnimate1" + appData.player[i].num).hide();
            }

            $(imgId).hide();

            $("#bankerAnimate2" + bankerNum).css({
                top: "-0.1vh",
                left: "-0.1vh",
                width: "7.46vh",
                height: "7.46vh"
            });

            $("#bankerAnimate1" + bankerNum).css({
                top: "-1vh",
                left: "-1vh",
                width: "9.26vh",
                height: "9.26vh"
            });

            $("#bankerAnimate2" + bankerNum).show();
            $("#bankerAnimate1" + bankerNum).show();

            $("#bankerAnimate1" + bankerNum).animate({
                top: "-1vh",
                left: "-1vh",
                width: "9.26vh",
                height: "9.26vh"
            }, 200, function () {
                $("#bankerAnimate1" + bankerNum).animate({
                    top: "-0.1vh",
                    left: "-0.1vh",
                    width: "7.46vh",
                    height: "7.46vh"
                }, 200, function () {
                    $("#bankerAnimate1" + bankerNum).hide();
                });
            });

            $("#bankerAnimate2" + bankerNum).animate({
                top: "-1.5vh",
                left: "-1.5vh",
                width: "10.26vh",
                height: "10.26vh"
            }, 200, function () {
                $("#bankerAnimate2" + bankerNum).animate({
                    top: "-0.1vh",
                    left: "-0.1vh",
                    width: "7.46vh",
                    height: "7.46vh"
                }, 200, function () {
                    $("#bankerAnimate2" + bankerNum).hide();

                    setTimeout(function () {
                        appData.showClockRobText = false;
                        appData.showClockBetText = true;
                        appData.isFinishBankerAnimate = true;

                        if (appData.ruleInfo.banker_mode == 5) {
                            for (var i = 0; i < obj.data.length; i++) {
                                for (var j = 0; j < appData.player.length; j++) {
                                    if (appData.player[j].account_id == obj.data[i].account_id) {
                                        appData.player[j].account_score = obj.data[i].account_score;
                                    }
                                }
                            }

                            setTimeout(function () {
                                viewMethods.reDeal();
                            }, 1000);

                            if (appData.game.round != 1) {
                                viewMethods.resetMyAccountStatus();
                                viewMethods.updateAllPlayerStatus();
                            }
                        } else {
                            viewMethods.resetMyAccountStatus();
                            viewMethods.updateAllPlayerStatus();
                        }

                    }, 10);

                    appData.game.time = appData.limitTimeGrab;
                    if (appData.game.time > 0) {
                        viewMethods.timeCountDown();
                    }

                    // 辅助摊牌定时器
                    appData.game.timeAuto = appData.limitTimeGrab + 4;
                    if (appData.game.timeAuto > 0) {
                        viewMethods.timeCountDownAuto();
                    }
                });
            });

            return;
        }

        var accountId = appData.bankerArray[appData.bankerAnimateIndex];
        var imgId = "#banker" + accountId;

        $(imgId).show();

        appData.lastBankerImgId = imgId;
        appData.bankerAnimateCount++;
        appData.bankerAnimateIndex++;

        if (appData.bankerAnimateIndex >= appData.bankerArray.length) {
            appData.bankerAnimateIndex = 0;
        }

        setTimeout(function () {
            if (globalData.maxCount == 6) {
                viewMethods.robBankerAnimate(obj);
            } else if (globalData.maxCount == 10) {
                viewMethods.robBankerAnimate10(obj);
            } else {
                viewMethods.robBankerAnimate17(obj);
            }
            // viewMethods.robBankerAnimate(obj);
        }, appData.bankerAnimateDuration);
    },
    robBankerAnimate17: function (obj) {

        if (appData.ruleInfo.banker_mode == 5) {
            appData.showRob = false;
        }

        for (var i = 0; i < appData.bankerArray.length; i++) {
            var imgId = "#banker" + appData.bankerArray[i];
            $(imgId).hide();
        }
        var totalCount = appData.bankerArray.length * 2;
        if (appData.bankerAnimateCount >= totalCount || appData.bankerAnimateIndex < 0 || appData.bankerArray.length < 2) {
            appData.bankerAnimateCount = 0;
            appData.bankerAnimateIndex = -1;
            var imgId = "#banker" + appData.bankerAccountId;
            $(imgId).show();

            var bankerNum = '';

            for (var i = 0; i < appData.player.length; i++) {
                if (appData.player[i].account_id == appData.bankerAccountId) {
                    appData.player[i].is_banker = true;
                    bankerNum = appData.player[i].num;
                } else {
                    appData.player[i].is_banker = false;
                }

                $("#bankerAnimate2" + appData.player[i].num).hide();
                $("#bankerAnimate1" + appData.player[i].num).hide();
            }

            $(imgId).hide();

            $("#bankerAnimate2" + bankerNum).css({
                top: "-0.1vh",
                left: "-0.1vh",
                width: "7.46vh",
                height: "7.46vh"
            });

            $("#bankerAnimate1" + bankerNum).css({
                top: "-1vh",
                left: "-1vh",
                width: "9.26vh",
                height: "9.26vh"
            });

            $("#bankerAnimate2" + bankerNum).show();
            $("#bankerAnimate1" + bankerNum).show();

            $("#bankerAnimate1" + bankerNum).animate({
                top: "-1vh",
                left: "-1vh",
                width: "9.26vh",
                height: "9.26vh"
            }, 200, function () {
                $("#bankerAnimate1" + bankerNum).animate({
                    top: "-0.1vh",
                    left: "-0.1vh",
                    width: "7.46vh",
                    height: "7.46vh"
                }, 200, function () {
                    $("#bankerAnimate1" + bankerNum).hide();
                });
            });

            $("#bankerAnimate2" + bankerNum).animate({
                top: "-1.5vh",
                left: "-1.5vh",
                width: "10.26vh",
                height: "10.26vh"
            }, 200, function () {
                $("#bankerAnimate2" + bankerNum).animate({
                    top: "-0.1vh",
                    left: "-0.1vh",
                    width: "7.46vh",
                    height: "7.46vh"
                }, 200, function () {
                    $("#bankerAnimate2" + bankerNum).hide();

                    setTimeout(function () {
                        appData.showClockRobText = false;
                        appData.showClockBetText = true;
                        appData.isFinishBankerAnimate = true;

                        if (appData.ruleInfo.banker_mode == 5) {
                            for (var i = 0; i < obj.data.length; i++) {
                                for (var j = 0; j < appData.player.length; j++) {
                                    if (appData.player[j].account_id == obj.data[i].account_id) {
                                        appData.player[j].account_score = obj.data[i].account_score;
                                    }
                                }
                            }

                            setTimeout(function () {
                                viewMethods.reDeal();
                            }, 1000);

                            if (appData.game.round != 1) {
                                viewMethods.resetMyAccountStatus();
                                viewMethods.updateAllPlayerStatus();
                            }
                        } else {
                            viewMethods.resetMyAccountStatus();
                            viewMethods.updateAllPlayerStatus();
                        }

                    }, 10);

                    appData.game.time = appData.limitTimeGrab;
                    if (appData.game.time > 0) {
                        viewMethods.timeCountDown();
                    }

                    // 辅助摊牌定时器
                    appData.game.timeAuto = appData.limitTimeGrab + 4;
                    if (appData.game.timeAuto > 0) {
                        viewMethods.timeCountDownAuto();
                    }
                });
            });

            return;
        }

        var accountId = appData.bankerArray[appData.bankerAnimateIndex];
        var imgId = "#banker" + accountId;

        $(imgId).show();

        appData.lastBankerImgId = imgId;
        appData.bankerAnimateCount++;
        appData.bankerAnimateIndex++;

        if (appData.bankerAnimateIndex >= appData.bankerArray.length) {
            appData.bankerAnimateIndex = 0;
        }

        setTimeout(function () {
            // viewMethods.robBankerAnimate(obj);
            if (globalData.maxCount == 6) {
                viewMethods.robBankerAnimate(obj);
            } else if (globalData.maxCount == 10) {
                viewMethods.robBankerAnimate10(obj);
            } else {
                viewMethods.robBankerAnimate17(obj);
            }
        }, appData.bankerAnimateDuration);
    },
    showMemberScore: function (isShow) {
        if (isShow) {
            $(".memberScoreText").show();
            // $(".memberScoreText1").show();
            // $(".memberScoreText2").show();
            // $(".memberScoreText3").show();
            // $(".memberScoreText4").show();
            // $(".memberScoreText5").show();
            // $(".memberScoreText6").show();
        } else {
            $(".memberScoreText").hide();
            // $(".memberScoreText1").hide();
            // $(".memberScoreText2").hide();
            // $(".memberScoreText3").hide();
            // $(".memberScoreText4").hide();
            // $(".memberScoreText5").hide();
            // $(".memberScoreText6").hide();
        }
    },
    winAnimate: function (obj) {
        appData.showClickShowCard = false;

        appData.isFinishWinAnimate = false;
        $(".cards").removeClass("card-flipped");
        $(".myCards").removeClass("card-flipped");
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

        viewMethods.resetCoinsPosition();
        $("#playerCoins").show();
        for (var i = 1; i <= appData.player.length; i++) {
            viewMethods.showCoins(i, false);
        }

        //把赢家玩家金币暂时放到庄家位置
        for (var i = 0; i < winnerNums.length; i++) {
            for (var j = 0; j < 8; j++) {
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
                $(".memberCoin" + loserNums[i] + j).animate(memCoin[appData.bankerPlayerNum], 50 + 120 * j);
            }
            setTimeout(function () {
                mp3AudioPlay("audioCoin", appData.player[0].sex);
            }, 10);
        }
        var winnerTime = 100;
        var totalTime = 100;
        if (loserNums.length >= 1) {
            winnerTime = 1400;
            if (winnerNums.length >= 1) {
                totalTime = 2800;
            } else {
                totalTime = 1400;
            }
        } else {
            if (winnerNums.length >= 1) {
                totalTime = 1400;
            }
        }

        if (ruleInfo.banker_mode == 4) {
            totalTime = 1400;
            winnerTime = 1400;
        }

        if (winnerNums.length >= 1) {
            setTimeout(function () {
                //显示赢家金币
                for (var i = 0; i < loserNums.length; i++) {
                    viewMethods.showCoins(loserNums[i], false);
                }
                for (var i = 0; i < winnerNums.length; i++) {
                    viewMethods.showCoins(winnerNums[i], true);
                }
                for (var i = 0; i < winnerNums.length; i++) {
                    for (var j = 0; j < 8; j++) {
                        $(".memberCoin" + winnerNums[i] + j).animate(memCoin[winnerNums[i]], 50 + 120 * j);
                    }
                }
                setTimeout(function () {
                    mp3AudioPlay("audioCoin", appData.player[0].sex);
                }, 10);
            }, winnerTime);
            setTimeout(function () {
                viewMethods.finishWinAnimate(obj);
            }, totalTime);
        } else {
            setTimeout(function () {
                viewMethods.finishWinAnimate(obj);
            }, totalTime);
        }
    },
    finishWinAnimate: function (obj) {
        $("#playerCoins").hide();

        appData.game.show_score = true;

        $(".memberScoreText").fadeIn(200, function () {

            if (appData.ruleInfo.banker_mode == 5) {
                if (appData.isBreak != 1) {
                    viewMethods.gameOverNew(obj.data.score_board, obj.data.balance_scoreboard);
                } else {
                    for (var i = 0; i < appData.player.length; i++) {
                        for (s in obj.data.score_board) {
                            if (appData.player[i].account_id == s) {
                                appData.player[i].account_score = Math.ceil(obj.data.score_board[s]);
                            }
                        }
                    }
                }
            } else {
                viewMethods.gameOverNew(obj.data.score_board, obj.data.balance_scoreboard);
            }

            setTimeout(function () {
                $(".memberScoreText").fadeOut("slow");

                if (appData.ruleInfo.banker_mode == 5 && appData.isBreak == 1) {
                    appData.overType = 2;
                    setTimeout(function () {
                        viewMethods.clickShowAlert(9, '庄家分数不足，提前下庄，点击确定查看结算');
                    }, 1000);
                } else {
                    for (var i = 0; i < appData.player.length; i++) {

                        if (appData.player[i].account_status >= 6 && ruleInfo.banker_mode != 5) {
                            appData.player[i].is_banker = false;
                            if (appData.player[i].account_id == appData.bankerID) {
                                appData.player[i].is_banker = true;
                            }
                        }
                        appData.player[i].account_status = 1;
                    }
                }
            }, 800);  //2000
            appData.isFinishWinAnimate = true;
            if (appData.ruleInfo.banker_mode == 5) {
                if (appData.isBreak == 1) {
                    // appData.overType = 2;
                    // setTimeout(function () {
                    //  viewMethods.clickShowAlert(9,'庄家分数不足，提前下庄，点击确定查看结算');
                    // }, 1000);
                } else {
                    if (obj.data.total_num == obj.data.game_num) {
                        setTimeout(function () {
                            viewMethods.roundEnd();
                            newNum = obj.data.room_number;
                        }, 800);
                    }
                }
                return;
            }
            if (obj.data.total_num == obj.data.game_num) {
                setTimeout(function () {
                    viewMethods.roundEnd();
                    newNum = obj.data.room_number;
                }, 800);
            }

        });
        appData.showClickShowCard = false;

        // 自动准备
        setTimeout(function () {
            if (appData.isAutoReady == 1 && appData.isWatching != 1) {
                viewMethods.clickReady()
            }
        }, 1500)
    },
    resetCoinsPosition: function () {
        for (var i = 1; i <= appData.player.length; i++) {
            for (var j = 0; j < 8; j++) {
                $(".memberCoin" + i + j).css(memCoin[i]);
            }
        }
    },
    showCoins: function (num, isShow) {
        if (isShow) {
            for (var i = 0; i < 8; i++) {
                $(".memberCoin" + num + i).show();
            }
        } else {
            for (var i = 0; i < 8; i++) {
                $(".memberCoin" + num + i).hide();
            }
        }
    },
};

var width = window.innerWidth;
var height = window.innerHeight;
var numD = 0;
var isTimeLimitShow = false;
var isBankerWin = false;

if (globalData.maxCount == 6) {
    var memCoin = [
        {},
        {top: '85%', left: '8%'},
        {top: '46%', left: '87%'},
        {top: '31%', left: '87%'},
        {top: '11%', left: '48%'},
        {top: '31%', left: '9%'},
        {top: '46%', left: '9%'},
    ];
} else if (globalData.maxCount == 10) {
    var memCoin = [
        {},
        {'top': '82%', 'left': '4.5vh'},
        {'top': '62%', 'left': '89.5vw'},
        {'top': '48%', 'left': '89.5vw'},
        {'top': '34%', 'left': '89.5vw'},
        {'top': '20%', 'left': '89.5vw'},
        {'top': '8%', 'left': '46.5vw'},
        {'top': '20%', 'left': '6vw'},
        {'top': '34%', 'left': '6vw'},
        {'top': '48%', 'left': '6vw'},
        {'top': '62%', 'left': '6vw'}
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
} else if (globalData.maxCount == 15) {
    var memCoin = [
        {},
        {'top': '84%', 'left': '4.5vh'},
        {'top': '68%', 'left': '89.5vw'},
        {'top': '58%', 'left': '89.5vw'},
        {'top': '46%', 'left': '89.5vw'},
        {'top': '36%', 'left': '89.5vw'},
        {'top': '24%', 'left': '89.5vw'},
        {'top': '12%', 'left': '89.5vw'},
        {'top': '5%', 'left': '89.5vw'},
        {'top': '5%', 'left': '6vw'},
        {'top': '12%', 'left': '6vw'},
        {'top': '24%', 'left': '6vw'},
        {'top': '36%', 'left': '6vw'},
        {'top': '46%', 'left': '6vw'},
        {'top': '58%', 'left': '6vw'},
        {'top': '68%', 'left': '6vw'},
    ];
} else if (globalData.maxCount == 17) {
    var memCoin = [
        {},
        {'top': '84%', 'left': '4.5vh'},
        {'top': '69%', 'left': '89.5vw'},
        {'top': '59%', 'left': '89.5vw'},
        {'top': '49%', 'left': '89.5vw'},
        {'top': '40%', 'left': '89.5vw'},
        {'top': '31%', 'left': '89.5vw'},
        {'top': '21%', 'left': '89.5vw'},
        {'top': '11%', 'left': '89.5vw'},
        {'top': '4%', 'left': '89.5vw'},
        {'top': '4%', 'left': '6vw'},
        {'top': '11%', 'left': '6vw'},
        {'top': '21%', 'left': '6vw'},
        {'top': '31%', 'left': '6vw'},
        {'top': '40%', 'left': '6vw'},
        {'top': '49%', 'left': '6vw'},
        {'top': '59%', 'left': '6vw'},
        {'top': '69%', 'left': '6vw'},
    ];
}


var viewStyle = {
    readyButton: {
        position: 'absolute',
        bottom: '0',
        left: '34%',
        width: '110px',
    },
    readyButton10: {
        position: 'absolute',
        top: (height * 0.11 - height * 0.0495) / 2 + 'px',
        left: (width * 0.9 - height * 0.0495 * 3.078) / 2 + 'px',
        width: height * 0.0495 * 3.078 + 'px',
        height: height * 0.0495 + 'px',
    },
    readyText: {
        position: 'absolute',
        bottom: '0',
        left: '43%',
    },
    readyText10: {
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
        top: globalData.maxCount == 6 ? "53%" : globalData.maxCount == 10 ? '68%' : '73%',
        left: '5%',
        width: width * 0.9 + 'px',
        height: width * 0.2 + 'px',
        overflow: 'hidden'
    },
    rob: {
        position: 'absolute',
        top: (width * 0.2 - width * 0.09) / 2 + 'px',
        left: (width * 0.9 - width * 0.09 / 0.375 * 2 - 20) / 2 + 'px',
        width: width * 0.09 / 0.375 + 'px',
        height: width * 0.09 + 'px',
    },
    rob1: {
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: width * 0.09 / 0.375 + 'px',
        height: width * 0.09 + 'px',
        'line-height': width * 0.09 + 'px',
        'text-align': 'center',
        color: 'white',
        'font-size': '12pt',
        'font-weight': 'bold'
    },
    notRob: {
        position: 'absolute',
        top: (width * 0.2 - width * 0.09) / 2 + 'px',
        left: (width * 0.9 - width * 0.09 / 0.375 * 2 - 20) / 2 + width * 0.09 / 0.375 + 20 + 'px',
        width: width * 0.09 / 0.375 + 'px',
        height: width * 0.09 + 'px'
    },
    notRob1: {
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: width * 0.09 / 0.375 + 'px',
        height: width * 0.09 + 'px',
        'line-height': width * 0.09 + 'px',
        'text-align': 'center',
        color: 'white',
        'font-size': '12pt',
        'font-weight': 'bold'
    },
    showCard: {
        position: 'absolute',
        top: (width * 0.2 - width * 0.09) / 2 + 'px',
        left: (width * 0.9 - width * 0.09 / 0.375) / 2 + 'px',
        width: width * 0.09 / 0.375 + 'px',
        height: width * 0.09 + 'px'
    },
    showCard10: {
        position: 'absolute',
        top: (height * 0.11 - height * 0.0495) / 2 + 'px',
        left: (width * 0.9 - height * 0.0495 / 0.375) / 2 + 'px',
        width: height * 0.0495 / 0.375 + 'px',
        height: height * 0.0495 + 'px',
        zIndex: '99'
    },
    showCard1: {
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: width * 0.09 / 0.375 + 'px',
        height: width * 0.09 + 'px',
        'line-height': width * 0.09 + 'px',
        'text-align': 'center',
        color: 'white',
        'font-size': '12pt',
        'font-weight': 'bold'
    },
    times1: {
        position: 'absolute',
        top: (width * 0.2 - width * 0.16 / 2) / 2 + 'px',
        left: width * 0.1 + 'px',
        width: width * 0.16 + 'px',
        height: width * 0.16 / 2 + 'px'
    },
    timesText: {
        position: 'absolute',
        width: width * 0.16 + 'px',
        height: width * 0.16 / 2 + 'px',
        'line-height': width * 0.16 / 2 + 'px',
        'text-align': 'center',
        color: 'white',
        'font-size': '12pt',
        'font-weight': 'bold'
    },
    times2: {
        position: 'absolute',
        top: (width * 0.2 - width * 0.16 / 2) / 2 + 'px',
        left: width * 0.1 + width * 0.02 + width * 0.16 + 'px',
        width: width * 0.16 + 'px',
        height: width * 0.16 / 2 + 'px'
    },
    times3: {
        position: 'absolute',
        top: (width * 0.2 - width * 0.16 / 2) / 2 + 'px',
        left: width * 0.1 + width * 0.02 * 2 + width * 0.16 * 2 + 'px',
        width: width * 0.16 + 'px',
        height: width * 0.16 / 2 + 'px'
    },
    times4: {
        position: 'absolute',
        top: (width * 0.2 - width * 0.16 / 2) / 2 + 'px',
        left: width * 0.1 + width * 0.02 * 3 + width * 0.16 * 3 + 'px',
        width: width * 0.16 + 'px',
        height: width * 0.16 / 2 + 'px'
    },
    robText2: {
        position: 'absolute',
        top: (width * 0.2 - 21) / 2 + 'px',
        left: (width * 0.9 - 39) / 2 - 16 + 'px',
        width: '39px',
        height: '21px'
    },
    robText: {
        position: 'absolute',
        top: (width * 0.2 - 21) / 2 + 'px',
        left: (width * 0.9 - 39) / 2 + 'px',
        width: '39px',
        height: '21px'
    },
    robTimesText: {
        position: 'absolute',
        top: (width * 0.2 - 21) / 2 + 'px',
        left: (width * 0.9 - 39) / 2 + 30 + 'px',
        width: '21px',
        height: '21px'
    },
    notRobText: {
        position: 'absolute',
        top: (width * 0.2 - 21) / 2 + 'px',
        left: (width * 0.9 - 39) / 2 + 'px',
        width: '39px',
        height: '21px'
    },
    showCardText: {
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '80%',
        height: width * 0.2 + 'px',
    },
    showCardText1: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        color: 'white',
        'font-size': '11pt',
        'text-align': 'center',
        'line-height': width * 0.2 + 'px',
        'font-family': 'Helvetica 微软雅黑'
    },
    coinText: {
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '80%',
        height: width * 0.2 + 'px',
    },
    coinText1: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        color: 'white',
        'font-size': '11pt',
        'text-align': 'center',
        'line-height': width * 0.2 + 'px',
        'font-family': 'Helvetica 微软雅黑'
    }
};


var ruleInfo = {
    isShowNewRule: false,
    type: -1,
    isShow: false,
    isShowRule: false,
    baseScore: 1,
    timesType: 1,
    isCardfive: 0,
    isCardbomb: 0,
    isCardtiny: 0,
    isCardfour: 0,
    can_rub: 0,
    isCardCalabash: 0,
    isCardSequence: 0,
    isCardFlush: 0,
    isCardStraight: 0,
    isLaizi: 0,
    is_cardtinyfour: 0,
    is_cardnbomb: 0,
    laizi_num: 2,
    ticket: 1,
    rule_height: 30,
    banker_mode: 1,
    banker_score: 1,
    bankerText: '抢庄',
    bet_type: 0
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
    //观战功能
    isWatching: 0,
    isShowKefu: false,
    guests: [],
    showGuest: 0,
    showSitdownButton: 0,
    showWatchButton: 1,
    joinType: 0,
    isShowApply: false,
    applyInfo: {
        club_headimgurl: '',
        club_name: '',
        club_id: '',
        status: '确定'
    },
    ownerUser: {
        nickname: "",
        avatar: "",
        user_code: 0
    },
    isAutoReady: setReady, //自动准备
    applyStatus: 0, //0尚未申请  1加好友申请中
    'isShowGameAlert': false,
    'isShowNewMessage': false,
    'isShowHomeAlert': false,
    'viewStyle': viewStyle,
    roomStatus: globalData.roomStatus,
    'isShop': false, //是否有商城
    'width': window.innerWidth,
    'height': window.innerHeight,
    'roomCard': Math.ceil(globalData.card),
    'is_connect': false,
    'player': [],
    'scoreboard': '',
    'activity': [],
    'isShowInvite': false,
    'isShowAlert': false,

    'isShowIndividuality': false,
    'isShowIndividualityError': false,
    'individuality': userData.individuality,
    'individualityError': "",
    'userData': userData,
    'isShowAlertTip': false,
    'alertTipText': "",
    'alertTipType': 1,

    'isShowShop': false,
    'isShowMessage': false,
    'alertType': 0,
    'alertText': '',
    'showRob': false,
    'showShowCardButton': false,
    'showRobText': false,
    'showNotRobText': false,
    'showClockRobText': false,
    'showClockBetText': false,
    'showClockShowCard': false,
    'showClickShowCard': false,
    'showBankerCoinText': false,
    'showTimesCoin': false,
    'clickCard4': false,
    'clickCard5': false,
    'base_score': 0,
    'playerBoard': {
        score: new Array(),
        round: 0,
        record: "",

    },
    'game': game,
    'wsocket': ws,
    'connectOrNot': true,
    'socketStatus': 0,
    'heartbeat': null,
    'select': 1,
    'ticket_count': 0,
    'isDealing': false,
    message: message,
    bankerArray: [],
    bankerAccountId: '',
    bankerPlayer: '',
    bankerPlayerNum: -1,
    bankerAnimateCount: 0,
    bankerAnimateIndex: 0,
    lastBankerImgId: '',
    bankerAnimateDuration: 120,
    limitTimeGrab: 10,
    isFinishWinAnimate: false,
    isFinishBankerAnimate: false,
    isShowErweima: false,
    isShowRecord: false,
    recordList: [],
    ruleInfo: ruleInfo,
    "canBreak": 0,
    "overType": 1,
    "isBreak": 0,
    "breakData": '',
    'bankerID': 0,
    editAudioInfo: editAudioInfo,
    audioInfo: audioInfo,
    isReconnect: true,
    bScroll: null,

    coinList: [1, 2, 3, 5],
    isShowNoteImg: !1,
    'musicOnce': true,
    isShowGiftBox: false, //礼物  
    giftToolsList: [],
    isShowBuyTools: false,
    buyToolsId: 0,
    skin_expire_type: 1,
    buyToolsName: '',
    timer: null
};

var resetState = function resetState() {
    appData.game.show_score = false;
    appData.clickCard4 = false;
    appData.clickCard5 = false;

    for (var i = 0; i < globalData.maxCount; i++) {
        appData.player.push({
            num: i + 1,
            serial_num: i + 1,
            account_id: 0,
            account_status: 0,
            playing_status: 0,
            online_status: 0,
            nickname: "",
            headimgurl: "",
            account_score: 0,
            ticket_checked: 1,

            limit_time: 0,
            is_operation: false,
            win_show: false,
            card: [],
            card_open: [],
            'is_showCard': false,

            card_type: 0,
            is_banker: false,
            multiples: 0,
            bankerMultiples: 0,
            combo_point: 0,
            timesImg: '',
            bankerTimesImg: "",
            robImg: '',
            bullImg: '',
            single_score: 0,
            messageOn: false,
            is_bull: false,
            is_showbull: false,
            is_audiobull: false,
            messageText: "",
            coins: [],
            poker_kw: 1,
            head_kw: '',
        });
        appData.playerBoard.score.push({
            account_id: 0,
            nickname: "",
            account_score: 0,
            isBigWinner: 0,
        });
    }

    for (var i = 0; i < appData.player.length; i++) {
        appData.player[i].coins = [];
        for (var j = 0; j < 8; j++) {
            appData.player[i].coins.push("memberCoin" + appData.player[i].num + j);
        }
    }

    httpModule.getInfo();

};

var resetAllPlayerData = function resetAllPlayerData() {
    appData.player = [];

    for (var i = 0; i < globalData.maxCount; i++) {
        appData.player.push({
            num: i + 1,
            serial_num: i + 1,
            account_id: 0,
            account_status: 0,
            playing_status: 0,
            online_status: 0,
            nickname: "",
            headimgurl: "",
            account_score: 0,
            ticket_checked: 0,

            limit_time: 0,
            is_operation: false,
            win_show: false,
            card: new Array(),
            card_open: new Array(),
            'is_showCard': false,

            card_type: 0,
            is_banker: false,
            multiples: 0,
            bankerMultiples: 0,
            combo_point: 0,
            timesImg: "",
            bankerTimesImg: "",
            robImg: "",
            bullImg: "",
            single_score: 0,
            messageOn: false,
            is_bull: false,
            is_showbull: false,
            is_audiobull: false,
            messageText: "",
            coins: [],
            poker_kw: 1,
            head_kw: '',
        });
    }

    for (var i = 0; i < appData.player.length; i++) {
        appData.player[i].coins = [];
        for (var j = 0; j < 8; j++) {
            appData.player[i].coins.push("memberCoin" + appData.player[i].num + j);
        }
    }
};

var newGame = function newGame() {
    appData.playerBoard = {
        score: new Array(),
        round: 0,
        record: ""
    };

    appData.game.round = 0;
    appData.game.status = 1;


    appData.game.cardDeal = 0;

    appData.game.show_score = false;
    appData.clickCard4 = false;
    appData.clickCard5 = false;

    for (var i = 0; i < appData.player.length; i++) {
        appData.playerBoard.score.push({
            account_id: 0,
            nickname: "",
            account_score: 0,
            isBigWinner: 0,
        });

        if (appData.player[i].online_status == 1) {
            appData.player[i].account_status = 0;
            appData.player[i].playing_status = 0;

            appData.player[i].is_operation = false;

            appData.player[i].win_show = false;
            appData.player[i].card = new Array();
            appData.player[i].card_open = new Array();
            appData.player[i].card_type = 0;
            appData.player[i].ticket_checked = 0;
            appData.player[i].account_score = 0;
            appData.player[i].is_showCard = false;

            appData.player[i].is_banker = false;
            appData.player[i].multiples = 0;
            appData.player[i].bankerMultiples = 0,
                appData.player[i].combo_point = 0;
            appData.player[i].timesImg = "";
            appData.player[i].bankerTimesImg = "",
                appData.player[i].robImg = "";
            appData.player[i].bullImg = "";
            appData.player[i].single_score = 0;
            appData.player[i].num = i + 1;
            appData.player[i].is_bull = false;
            appData.player[i].is_showbull = false;
            appData.player[i].is_audiobull = false;
        } else {
            appData.player[i] = {
                num: i + 1,
                serial_num: appData.player[i].serial_num,
                account_id: 0,
                account_status: 0,
                playing_status: 0,
                online_status: 0,
                nickname: "",
                headimgurl: "",
                account_score: 0,

                ticket_checked: 0,
                limit_time: 0,
                is_operation: false,
                win_show: false,
                card: new Array(),
                card_open: new Array(),
                'is_showCard': false,

                card_type: 0,
                is_banker: false,
                multiples: 0,
                bankerMultiples: 0,
                combo_point: 0,
                timesImg: "",
                bankerTimesImg: "",
                robImg: "",
                bullImg: "",
                single_score: 0,
                is_bull: false,
                is_showbull: false,
                is_audiobull: false
            };
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

        if (appData.socketStatus > 1) {
            appData.connectOrNot = false;
        }

        if (appData.socketStatus > 3) {
            if (appData.isReconnect) {
                window.location.href = window.location.href + "&id=" + 10000 * Math.random();
            }
        }

        if (ws.readyState == WebSocket.OPEN) {
            ws.send('@');
        }
    }, 3000);

    socketModule.sendPrepareJoinRoom();
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
                viewMethods.clickShowAlert(7, obj.result_message);
            } else {
                viewMethods.clickShowAlert(7, obj.result_message);
            }
        } else if (obj.operation == wsOperation.RefreshRoom) {
            window.location.href = window.location.href + "&id=" + 10000 * Math.random();
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
        } else if (obj.operation == wsOperation.UpdateAccountScore) {
            socketModule.processUpdateAccountScore(obj);
        } else if (obj.operation == wsOperation.Win) {
            socketModule.processWin(obj);
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
        }
        //观战功能
        else if (obj.operation == wsOperation.GuestRoom) {
            socketModule.processGuestRoom(obj);
        } else if (obj.operation == wsOperation.AllGuestInfo) {
            socketModule.processAllGuestInfo(obj);
        } else if (obj.operation == wsOperation.UpdateGuestInfo) {
            socketModule.processUpdateGuestInfo(obj);
        } else {
            logMessage(obj.operation);
        }
    }
}

var wsCloseCallback = function wsCloseCallback(data) {
    logMessage("websocket closed：");
    logMessage(data);
    appData.connectOrNot = false;
    reconnectSocket();
}

var wsErrorCallback = function wsErrorCallback(data) {
    logMessage("websocket onerror：");
    logMessage(data);
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

var mp3AudioPlay = function mp3AudioPlay(a, sex) {
    if (!audioModule.audioOn) {
        return 0;
    }
    if (sex == 1) {
        audioModule.playSound(a);
    } else {
        audioModule.playSound(a + "_1");
    }
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

        this.loadAudioFile(this.audioUrl + 'fiesc/audio/bull61013/background3.mp3', "backMusic");

        var audioUrl = ["nobanker.m4a", "robbanker.m4a", "nobull.m4a", "bull1.m4a", "bull2.m4a", "bull3.m4a", "bull4.m4a", "bull5.m4a", "bull6.m4a", "bull7.m4a",
            "bull8.m4a", "bull9.m4a", "bull10.m4a", "bullflower.m4a", "bullbomb.m4a", "bulltiny.m4a",
            "bullfour.m4a", "bullhulu.m4a", "bullshunzi.m4a", "bulltonghua.m4a", "bulltonghuashun.m4a",
            "times1.m4a", "times2.m4a", "times3.m4a", "times4.m4a", "times8.m4a", "times5.m4a", "times10.m4a", "times6.m4a", "times12_1.mp3", "coin.mp3", "audio1.m4a", 'bullsixiaoniu.m4a', 'bullhedanniu.m4a'];
        var audioName = ["audioNoBanker", "audioRobBanker", "audioBull0", "audioBull1", "audioBull2", "audioBull3", "audioBull4", "audioBull5", "audioBull6", "audioBull7",
            "audioBull8", "audioBull9", "audioBull10", "audioBull11", "audioBull12", "audioBull13",
            "audioBull14", "audioBull15", "audioBull16", "audioBull17", "audioBull18",
            "audioTimes1", "audioTimes2", "audioTimes3", "audioTimes4", "audioTimes8", "audioTimes5", "audioTimes10", "audioTimes6", "audioTimes12", "audioCoin", "audio1", 'audioBull19', 'audioBull20'];
        for (var i = 0; i < audioUrl.length; i++) {
            this.loadAudioFile(this.audioUrl + 'fiesc/audio/bull61013/' + audioUrl[i], audioName[i]);
        }

        var audioUrl1 = ["nobanker_1.m4a", "robbanker_1.m4a", "nobull_1.m4a", "bull1_1.m4a", "bull2_1.m4a", "bull3_1.m4a", "bull4_1.m4a", "bull5_1.m4a", "bull6_1.m4a", "bull7_1.m4a",
            "bull8_1.m4a", "bull9_1.m4a", "bull10_1.m4a", "bullflower_1.m4a", "bullbomb_1.m4a", "bulltiny_1.m4a",
            "bullfour_1.m4a", "bullhulu_1.m4a", "bullshunzi_1.m4a", "bulltonghua_1.m4a", "bulltonghuashun_1.m4a",
            "times1_1.m4a", "times2_1.m4a", "times3_1.m4a", "times4_1.m4a", "times8_1.m4a", "times5_1.m4a", "times10_1.m4a", "times6_1.m4a", "times12_1.mp3", "coin_1.mp3", "audio1_1.m4a", "bullsixiaoniu_1.m4a", 'bullhedanniu_1.m4a'];
        var audioName1 = ["audioNoBanker_1", "audioRobBanker_1", "audioBull0_1", "audioBull1_1", "audioBull2_1", "audioBull3_1", "audioBull4_1", "audioBull5_1", "audioBull6_1", "audioBull7_1",
            "audioBull8_1", "audioBull9_1", "audioBull10_1", "audioBull11_1", "audioBull12_1", "audioBull13_1",
            "audioBull14_1", "audioBull15_1", "audioBull16_1", "audioBull17_1", "audioBull18_1",
            "audioTimes1_1", "audioTimes2_1", "audioTimes3_1", "audioTimes4_1", "audioTimes8_1", "audioTimes5_1", "audioTimes10_1", "audioTimes6_1", "audioTimes12_1", "audioCoin_1", "audio1_1", 'audioBull19_1', 'audioBull20_1'];
        for (var i = 0; i < audioUrl1.length; i++) {
            this.loadAudioFile(this.audioUrl + 'fiesc/audio/bull61013/' + audioUrl1[i], audioName1[i]);
        }

        // var audioMessageUrl = [ "message0.m4a","message1.m4a", "message2.m4a", "message3.m4a", "message4.m4a", "message5.m4a", "message6.m4a", "message7.m4a", "message8.m4a","message9.m4a", "message10.m4a", "message11.m4a", "message12.m4a", "message13.m4a", "message14.m4a", "message15.m4a", "message16.m4a", "message17.m4a", "message18.m4a", "message19.m4a", "message20.m4a", "message21.m4a"];
        // var audioMessageName = ["message0", "message1", "message2", "message3", "message4", "message5", "message6", "message7", "message8", "message9", "message10", "message11", "message12", "message13", "message14", "message15", "message16", "message17", "message18", "message19", "message20", "message21"];
        // for (var i = 0; i < audioMessageUrl.length; i++) {
        //     this.loadAudioFile(this.audioUrl + 'fiesc/audio/sound61013/' + audioMessageUrl[i], audioMessageName[i]);
        // }
        // var audioMessageUrl1 = [ "message0_1.m4a","message1_1.m4a", "message2_1.m4a", "message3_1.m4a", "message4_1.m4a", "message5_1.m4a", "message6_1.m4a", "message7_1.m4a", "message8_1.m4a","message9_1.m4a", "message10_1.m4a", "message11_1.m4a", "message12_1.m4a"];
        // var audioMessageName1 = ["message0_1", "message1_1", "message2_1", "message3_1", "message4_1", "message5_1", "message6_1", "message7_1", "message8_1", "message9_1", "message10_1", "message11_1", "message12_1"];
        // for (var i = 0; i < audioMessageUrl1.length; i++) {
        //     this.loadAudioFile(this.audioUrl + 'fiesc/audio/sound61013/' + audioMessageUrl1[i], audioMessageName1[i]);
        // }
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
        var divs = ['table', 'vaudioRoom', 'valert', 'vmessage', 'vwatch', 'vcreateRoom', 'vroomRule', 'endCreateRoom', 'endCreateRoomBtn'];
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

        $('.member4').css('top', member4Top + '%');
    };
};

function checkIndividuality(e) {
    return !!/^[0-9a-zA-Z]*$/g.test(e);
}

//Vue方法
var methods = {
    showHomeAlert: viewMethods.showHomeAlert,
    clickGameOver: viewMethods.clickGameOver,
    showInvite: viewMethods.clickShowInvite,
    showAlert: viewMethods.clickShowAlert,
    showMessage: viewMethods.showMessage,
    closeInvite: viewMethods.clickCloseInvite,
    closeAlert: viewMethods.clickCloseAlert,
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
    hall: function () {
        //window.location.href = DynLoading.getPath('/');
        DynLoading.goto('/');
    },
    applyClub: function () {
        httpModule.applyClub();
    },
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
    reviewCard: function () {
        //window.location.href = globalData.baseUrl + 'q/queryCard?type=' + globalData.gameType + '&num=' + globalData.roomNumber;
        window.location.href = Htmls.getReviewUrl(globalData.gameType, globalData.roomNumber);
    },
    closeHomeAlert: function () {
        appData.isShowHomeAlert = false;
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
        if (appData.roomStatus == 4) {
            return;
        }
        appData.ruleInfo.isShowNewRule = true;
    },
    cancelGameRule: function () {
        appData.ruleInfo.isShowNewRule = false;
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
                if (appData.player[e].account_id == userData.accountId || 0 == appData.player[e].account_id) {
                    appData.showSitdownButton = 1;
                    break
                }
        }
    },
    hideGuests: function () {
        $('.sidelines-mask').hide();
        $('.sidelines-content').css({top: '-3.5rem',});
    },
    showGuests: function () {
        appData.showSitdownButton = 0;
        appData.showWatchButton = !appData.isWatching && appData.player[0].account_status < 2 && appData.player[0].ticket_checked == 0;

        if (appData.isWatching) {
            for (var e = 0; e < appData.player.length; e++)
                if (appData.player[e].account_id == userData.accountId || 0 == appData.player[e].account_id) {
                    appData.showSitdownButton = 1;
                    break
                }
        }
        $('.sidelines-mask').show();
        $('.sidelines-content').css({top: 0,});
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
    $('body').on('touchmove', preventDefaultFn);
}

function enable_scroll() {
    $('body').off('touchmove', preventDefaultFn);
}

var shareContent = '';

function getShareContent() {
    shareContent = "\n";

    if (appData.ruleInfo.banker_mode == 1) {
        shareContent = shareContent + '自由抢庄 ';
    } else if (appData.ruleInfo.banker_mode == 2) {
        shareContent = shareContent + '明牌抢庄 ';
    } else if (appData.ruleInfo.banker_mode == 3) {
        shareContent = shareContent + '牛 牛上庄 ';
    } else if (appData.ruleInfo.banker_mode == 4) {
        shareContent = shareContent + '通比牛 牛 ';
    } else if (appData.ruleInfo.banker_mode == 5) {
        shareContent = shareContent + '固定庄家 ';
    }

    if (appData.ruleInfo.baseScore == 1) {
        shareContent = shareContent + '底分:1';
    } else if (appData.ruleInfo.baseScore == 2) {
        shareContent = shareContent + '底分:2';
    } else if (appData.ruleInfo.baseScore == 3) {
        shareContent = shareContent + '底分:3';
    } else if (appData.ruleInfo.baseScore == 4) {
        shareContent = shareContent + '底分:4';
    } else if (appData.ruleInfo.baseScore == 5) {
        shareContent = shareContent + '底分:5';
    }

    if (appData.ruleInfo.isLaizi) {
        shareContent = shareContent + ' 有赖子(两张鬼牌)可变牌';
    }

    if (appData.ruleInfo.ticket == 1) {
        shareContent = shareContent + ' 局数:12局';
    } else {
        shareContent = shareContent + ' 局数:24局';
    }

    if (appData.ruleInfo.bet_type == 0) {
        shareContent += " 下注:1/2/3/5倍";
    } else if (appData.ruleInfo.bet_type == 1) {
        shareContent += " 下注:1/2/4/5倍";
    } else if (appData.ruleInfo.bet_type == 2) {
        shareContent += " 下注:1/3/5/8倍";
    } else if (appData.ruleInfo.bet_type == 3) {
        shareContent += " 下注:2/4/6/10倍";
    }

    if (appData.ruleInfo.timesType == 1) {
        shareContent = shareContent + ' 规则:牛 牛x3牛九x2牛八x2';
    } else {
        shareContent = shareContent + ' 规则:牛 牛x4牛九x3牛八牛七x2';
    }

    if (appData.ruleInfo.is_cardnbomb || appData.ruleInfo.is_cardtinyfour || appData.ruleInfo.isCardfive || appData.ruleInfo.isCardbomb || appData.ruleInfo.isCardtiny
        || appData.ruleInfo.isCardfour || appData.ruleInfo.isCardStraight
        || appData.ruleInfo.isCardFlush || appData.ruleInfo.isCardSequence || appData.ruleInfo.isCardCalabash) {
        var cardContent = ' 牌型:';
        if (appData.ruleInfo.isCardfour) {
            cardContent = cardContent + ' 四花牛(4倍)';
        }
        if (appData.ruleInfo.is_cardtinyfour) {
            cardContent = cardContent + ' 四小牛(4倍)';
        }
        if (appData.ruleInfo.isCardStraight) {
            cardContent = cardContent + ' 顺子牛(5倍)';
        }
        if (appData.ruleInfo.isCardfive) {
            cardContent = cardContent + ' 五花牛(5倍)';
        }
        if (appData.ruleInfo.isCardFlush) {
            cardContent = cardContent + ' 同花牛(6倍)';
        }
        if (appData.ruleInfo.isCardCalabash) {
            cardContent = cardContent + ' 葫芦牛(7倍)';
        }
        if (appData.ruleInfo.isCardbomb) {
            cardContent = cardContent + ' 炸弹牛(8倍)';
        }
        if (appData.ruleInfo.isCardtiny) {
            cardContent = cardContent + ' 五小牛(8倍)';
        }
        if (appData.ruleInfo.isCardSequence) {
            cardContent = cardContent + ' 同花顺(10倍)';
        }
        if (appData.ruleInfo.is_cardnbomb) {
            cardContent = cardContent + ' 核弹牛(12倍)';
        }

        shareContent = shareContent + cardContent;
    }

    if (appData.ruleInfo.banker_mode == 5) {
        if (appData.ruleInfo.banker_score == 1) {
            shareContent = shareContent + '  上庄分数：无';
        } else if (appData.ruleInfo.banker_score == 2) {
            shareContent = shareContent + '  上庄分数：300';
        } else if (appData.ruleInfo.banker_score == 3) {
            shareContent = shareContent + '  上庄分数：500';
        } else if (appData.ruleInfo.banker_score == 4) {
            shareContent = shareContent + '  上庄分数：1000';
        }
    }
};

var wxModule = {
    config: function () {
        wx.config({
            debug: false,
            appId: configData.appId,
            timestamp: configData.timestamp,
            nonceStr: configData.nonceStr,
            signature: configData.signature,
            jsApiList: ["onMenuShareTimeline", "onMenuShareAppMessage", "hideMenuItems"]
        });

        getShareContent();

        wx.onMenuShareTimeline({
            title: globalData.shareTitle + '(房间号:' + globalData.roomNumber + ')',
            desc: shareContent,
            link: globalData.roomUrl,
            imgUrl: globalData.fileUrl + "fiesc/images/bull_yh/share_icon6.jpg",
            success: function () {
            },
            cancel: function () {
            }
        });
        wx.onMenuShareAppMessage({
            title: globalData.shareTitle + '(房间号:' + globalData.roomNumber + ')',
            desc: shareContent,
            link: globalData.roomUrl,
            imgUrl: globalData.fileUrl + "fiesc/images/bull_yh/share_icon6.jpg",
            success: function () {
            },
            cancel: function () {
            }
        });

    },
};

//微信配置
wx.config({
    debug: false,
    appId: configData.appId,
    timestamp: configData.timestamp,
    nonceStr: configData.nonceStr,
    signature: configData.signature,
    jsApiList: ["onMenuShareTimeline", "onMenuShareAppMessage", "hideMenuItems"]
});

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
        imgUrl: globalData.fileUrl + "fiesc/images/bull_yh/share_icon6.jpg",
        success: function () {
        },
        cancel: function () {
        }
    });
    wx.onMenuShareAppMessage({
        title: globalData.shareTitle + '(房间号:' + globalData.roomNumber + ')',
        desc: shareContent,
        link: globalData.roomUrl,
        imgUrl: globalData.fileUrl + "fiesc/images/bull_yh/share_icon6.jpg",
        success: function () {
        },
        cancel: function () {
        }
    });
});

wx.error(function (a) {
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
                    var url = DynLoading.getPath('/');
                    window.location.replace(url);
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

    var room_number = appData.game.room_number;
    var num = data.round;
    var sum = appData.game.total_num;
    var datetime = data.record;
    var width = 750;
    var height = 1216;
    var pics = [globalData.fileUrl + "fiesc/images/bull/rank_bg.jpg", globalData.fileUrl + "fiesc/images/bull/people_bg.png", globalData.fileUrl + "fiesc/images/bull/ranking_icon.png"];
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

//新画布

//画布
function canvas222() {
    setTimeout(function () {
        var target = document.getElementById("ranking");
        html2canvas(target, {
            allowTaint: true,
            taintTest: false,
            onrendered: function (canvas) {
                canvas.id = "mycanvas";
                var dataUrl = canvas.toDataURL('image/jpeg', 0.5);
                $("#end").attr("src", dataUrl);
                $(".end").show();
                $('.ranking').hide();
                newGame();
            }
        });
    }, 750)
};

function logMessage(message) {
    console.log(message);
};

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

//积分榜
$(function () {
    //$(".main").css("height", window.innerWidth * 1.621);
    $(".place").css("width", per * 140);
    $(".place").css("height", per * 140);
    $(".place").css("top", per * 270);
    $(".place").css("left", per * 195);

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
            console.log('play backMusic');
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
