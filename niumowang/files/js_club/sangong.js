var ws;
var game = {
    "room": 0,
    "room_number": globalData.roomNumber,
    "room_url": 0,
    'score': 0,
    "status": 0,
    "time": -1,
    "round": 0,
    "total_num": 10,
    "currentScore": 0,
    "cardDeal": 0,
    'can_open': 0,
    "current_win": 0,
    "is_play": false,
    "show_card": false,
    "base_score": 0,
    "show_score": false,
    "show_bettext": false
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
    NotyChooseChip: "NotyChooseChip",
    CardInfo: "CardInfo",
    UpdateAccountScore: "UpdateAccountScore",
    OpenCard: "OpenCard",
    Win: "Win",
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
    BroadcastVoice: "BroadcastVoice",
    ActiveRoom: "ActivateRoom",
    MyCards: "MyCards",
    GameOver: "GameOver",
    BreakRoom: "BreakRoom",
};

var httpModule = {
    getInfo: function() {
        reconnectSocket();
        appData.is_connect = true;
        // var postData = { "account_id": userData.accountId, "room_number": globalData.roomNumber, "game_type":globalData.gameType };
        // Vue.http.post(globalData.baseUrl+'q/getRoomerInfo', postData).then(function(response) {
        //
        //     var bodyData = response.body;
        //
        //     if (bodyData.result == 0) {
        //         if (bodyData.data.length == 0) {
        //             reconnectSocket();
        //             appData.is_connect = true;
        //         } else {
        //             appData.activity = bodyData.data.concat();
        //             viewMethods.clickShowAlert(5, appData.activity[0].content);
        //         }
        //     } else {
		// 		console.log(bodyData);
		// 		appData.ownerUser.nickname = bodyData.data.nickname;
        //         appData.ownerUser.avatar = bodyData.data.headimgurl;
        //         appData.ownerUser.user_code = bodyData.data.user_code;
        //         appData.applyStatus = bodyData.data.apply_status;
        //        // if(bodyData.result_message == '是否申请成为好友？'){
        //             appData.add_user = true;
        //        // }
        //         viewMethods.clickShowAlert(8, bodyData.result_message);
        //     }
        //
        // }, function(response) {
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
    setIndividuality:function(){
        var postData={ "account_id":userData.accountId, "individuality":appData.individuality };
        console.log(postData);
        Vue.http.post(globalData.baseUrl+"account/setIndividuality",postData).then(function(e){
            if(0==e.body.result){
                methods.showAlertTip("设置成功",1);
                appData.isShowIndividuality=!1;
                appData.userData.individuality=appData.individuality;
            } else {
                appData.individualityError=e.body.result_message;
            }

        },function(e){
            appData.individualityError="请求错误";
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
    sendData: function(obj) {
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
                setTimeout(function() {
                    socketModule.sendData(obj);
                }, 1000);
            } else {
                console.log('websocket state：' + ws.readyState);
            }

        } catch (err) {
            console.log(err);
        }
    },
    sendPrepareJoinRoom: function() {
        socketModule.sendData({
            operation: wsOperation.PrepareJoinRoom,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_number: globalData.roomNumber
            }
        });
    },
    sendJoinRoom: function() {
        socketModule.sendData({
            operation: wsOperation.JoinRoom,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_number: globalData.roomNumber
            }
        });
    },
    sendRefreshRoom: function() {
        socketModule.sendData({
            operation: wsOperation.RefreshRoom,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_id: appData.game.room
            }
        });
    },
    sendReadyStart: function() {
        socketModule.sendData({
            operation: wsOperation.ReadyStart,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_id: appData.game.room
            }
        });
    },
    sendGameOver: function() {
        socketModule.sendData({
            operation: wsOperation.GameOver,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_id: appData.game.room
            }
        });
    },
    sendBroadcastVoice: function(num) {
        socketModule.sendData({
            operation: wsOperation.BroadcastVoice,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_id: appData.game.room,
                voice_num: num
            }
        });
    },
    sendGrabBanker: function(multiples) {
        socketModule.sendData({
            operation: wsOperation.GrabBanker,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_id: appData.game.room,
                is_grab: "1",
                "multiples": multiples,
            }
        });
    },
    sendNotGrabBanker: function() {
        socketModule.sendData({
            operation: wsOperation.GrabBanker,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_id: appData.game.room,
                is_grab: "0",
                "multiples": "1",
            }
        });
    },
    sendPlayerMultiples: function(times) {
        socketModule.sendData({
            operation: wsOperation.PlayerMultiples,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_id: appData.game.room,
                multiples: times
            }
        });
    },
    sendShowCard: function() {
        socketModule.sendData({
            operation: wsOperation.ShowCard,
            account_id: userData.accountId,
            session: globalData.session,
            data: {
                room_id: appData.game.room
            }
        });
    },
    processGameRule: function(obj) {
        if (obj.data.ticket_type) {

            appData.ruleInfo.ticket = obj.data.ticket_type;
            appData.ruleInfo.baseScore = obj.data.score_type;
            appData.ruleInfo.timesType = obj.data.rule_type;
            appData.ruleInfo.is_cardjoker = Math.ceil(obj.data.is_cardjoker);
            appData.ruleInfo.cardbao9 = Math.ceil(obj.data.cardbao9);
            appData.ruleInfo.cardthree = Math.ceil(obj.data.cardthree);
            appData.ruleInfo.cardthreesan = Math.ceil(obj.data.cardthreesan);
            appData.ruleInfo.cardtian = Math.ceil(obj.data.cardtian);
            appData.ruleInfo.banker_mode = Math.ceil(obj.data.banker_mode);
            appData.ruleInfo.banker_score = Math.ceil(obj.data.banker_score_type);
        }

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
    processPrepareJoinRoom: function(obj) {
        if(obj.data.is_club){
            if(obj.data.is_club==1){
                appData.isShowApply = true;
                appData.applyInfo.club_headimgurl = obj.data.club_headimgurl;
                appData.applyInfo.club_name = obj.data.club_name;
                appData.applyInfo.club_id = obj.data.room_creator;
                return;
            }
        }
        if (obj.data.room_status == 4) {
            appData.roomStatus = obj.data.room_status;
            viewMethods.clickShowAlert(8, obj.result_message);
            return;
        }

        if (obj.data.ticket_type) {

            appData.ruleInfo.ticket = obj.data.ticket_type;
            appData.ruleInfo.baseScore = obj.data.score_type;
            appData.ruleInfo.timesType = obj.data.rule_type;
            appData.ruleInfo.is_cardjoker = Math.ceil(obj.data.is_cardjoker);
            appData.ruleInfo.cardbao9 = Math.ceil(obj.data.cardbao9);
            appData.ruleInfo.cardthree = Math.ceil(obj.data.cardthree);
            appData.ruleInfo.cardthreesan = Math.ceil(obj.data.cardthreesan);
            appData.ruleInfo.banker_mode = Math.ceil(obj.data.banker_mode);
            appData.ruleInfo.banker_score = Math.ceil(obj.data.banker_score_type);
        }

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
                        //obj.data.alert_text = "房间里有" + obj.data.room_users.join("、") + "，是否加入？";
                        appData.room_users = obj.data.room_users;
                        console.log(appData.alertText)
                    } else {
                        obj.data.alert_text = "";
                    }
                } else {
                    appData.joinType=2;
                    if(obj.data.room_users.length >= 1){
                        //obj.data.alert_text = "观战人数已满，房间里有" + obj.data.room_users.join("、") + "，是否加入游戏？";
                        appData.room_users = obj.data.room_users;
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
            //viewMethods.clickShowAlert(4,obj.data.alert_text);
            //appData.room_users = obj.data.room_users;
            //console.log(appData.alertText)
        }
    },
    processJoinRoom: function(obj) {
        appData.game.room = obj.data.room_id;
        appData.game.room_url = obj.data.room_url;
        appData.game.currentScore = Math.ceil(obj.data.benchmark);
        appData.game.score = Math.ceil(obj.data.pool_score);
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
        for (var i = 0; i < 6; i++) {
            if (i <= 6 - obj.data.serial_num) {
                appData.player[i].serial_num = i + Math.ceil(obj.data.serial_num);
            } else {
                appData.player[i].serial_num = i + Math.ceil(obj.data.serial_num) - 6;
            }
        }

        appData.player[0].account_status = Math.ceil(obj.data.account_status);
        appData.player[0].account_score = Math.ceil(obj.data.account_score);
        appData.player[0].nickname = userData.nickname;
        appData.player[0].headimgurl = userData.avatar;
        appData.player[0].account_id = userData.accountId;
        appData.player[0].card = obj.data.cards.concat();
        appData.player[0].card_open = obj.data.cards.concat();
        appData.player[0].card_type = obj.data.card_type;
        appData.player[0].ticket_checked = obj.data.ticket_checked;
        appData.game.status = Math.ceil(obj.data.room_status);
        appData.player[0].combo_point = obj.data.combo_point;

        if (appData.player[0].card_open.length <= 0 || appData.player[0].card_open == undefined) {
            appData.player[0].card_open = obj.data.cards.concat();
        }

        if (appData.ruleInfo.banker_mode == 5) {
            if (appData.game.round == 1) {
                if (appData.player[0].account_status > 3) {
                    appData.game.cardDeal = 3;
                } else {

                }
            } else {
                if (appData.game.status == 2) {
                    appData.game.cardDeal = 3;
                }
            }
        } else {
            if (appData.game.status == 2) {
                appData.game.cardDeal = 3;
            }
        }


        appData.scoreboard = obj.data.scoreboard;
        console.log('451: resetMyAccountStatus');
        viewMethods.resetMyAccountStatus();
    },
    processRefreshRoom: function(obj) {
        resetAllPlayerData();

        for (var i = 0; i < 6; i++) {
            if (i <= 6 - obj.data.serial_num) {
                appData.player[i].serial_num = i + Math.ceil(obj.data.serial_num);
            } else {
                appData.player[i].serial_num = i + Math.ceil(obj.data.serial_num) - 6;
            }
        }

        appData.player[0].account_status = Math.ceil(obj.data.account_status);
        appData.player[0].account_score = Math.ceil(obj.data.account_score);
        appData.player[0].nickname = userData.nickname;
        appData.player[0].headimgurl = userData.avatar;
        appData.player[0].account_id = userData.accountId;
        appData.player[0].serial_num = obj.data.serial_num;    //座位号
        appData.player[0].card = obj.data.cards.concat();
        appData.player[0].card_open = obj.data.cards.concat();
        appData.player[0].card_type = obj.data.card_type;
        appData.player[0].ticket_checked = obj.data.ticket_checked;
        appData.player[0].combo_point = obj.data.combo_point;

        if (appData.player[0].card_open.length <= 0 || appData.player[0].card_open == undefined) {
            appData.player[0].card_open = obj.data.cards.concat();
        }

        if (appData.ruleInfo.banker_mode == 5) {
            if (appData.game.round == 1) {
                if (appData.player[0].account_status > 3) {
                    appData.game.cardDeal = 3;
                } else {

                }
            } else {
                if (appData.game.status == 2) {
                    appData.game.cardDeal = 3;
                }
            }
        } else {
            if (appData.game.status == 2) {
                appData.game.cardDeal = 3;
            }
        }

        for (var i = 0; i < 6; i++) {
            for (var j = 0; j < obj.all_gamer_info.length; j++) {
                if (appData.player[i].serial_num == obj.all_gamer_info[j].serial_num) {
                    appData.player[i].nickname = obj.all_gamer_info[j].nickname;
                    appData.player[i].headimgurl = obj.all_gamer_info[j].headimgurl;
                    appData.player[i].account_id = obj.all_gamer_info[j].account_id;
                    appData.player[i].account_score = Math.ceil(obj.all_gamer_info[j].account_score);
                    appData.player[i].account_status = Math.ceil(obj.all_gamer_info[j].account_status);
                    appData.player[i].online_status = Math.ceil(obj.all_gamer_info[j].online_status);
                    appData.player[i].ticket_checked = obj.all_gamer_info[j].ticket_checked;

                    appData.player[i].multiples = obj.all_gamer_info[j].multiples;
                    appData.player[i].bankerMultiples = obj.all_gamer_info[j].banker_multiples;
                    appData.player[i].card_type = obj.all_gamer_info[j].card_type;
                    appData.player[i].combo_point = obj.all_gamer_info[j].combo_point;
                    appData.player[i].is_showbull = false;
                    if (obj.all_gamer_info[j].is_banker == 1) {
                        appData.player[i].is_banker = true;
                        appData.bankerAccountId = obj.all_gamer_info[j].account_id;
                        appData.bankerPlayer = appData.player[i];
                    } else {
                        appData.player[i].is_banker = false;
                    }
                    if (appData.player[i].account_status >= 8) {
                        appData.player[i].is_showCard = true;
                    }

                    if (appData.player[i].card_open.length < 1 || appData.player[i].card_open == undefined) {
                        appData.player[i].card_open = obj.all_gamer_info[j].cards.concat();
                    }

                    if (appData.player[i].card_open.length < 1 || appData.player[i].card_open == undefined) {
                        appData.player[i].card_open = obj.all_gamer_info[j].cards.concat();
                    }

                    if (appData.player[i].card_open.length < 1 || appData.player[i].card_open == undefined) {
                        appData.player[i].card_open = [-1, -1, -1, -1, -1];
                    }
                }
            }
        }

        if (appData.player[0].account_status >= 7) {
            appData.player[0].is_showCard = true;
        }

        if (appData.player[0].account_status > 2) {
            setTimeout(function() {
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
            setTimeout(function() {
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
            console.log('~~~~~~~~~~~~~~~~~~~~~~~');
            appData.isFinishBankerAnimate = true;
        }

        console.log('723: resetMyAccountStatus');
        viewMethods.resetMyAccountStatus();
        viewMethods.updateAllPlayerStatus();

        if (appData.player[0].account_status > 2 && appData.player[0].account_status < 7 && appData.ruleInfo.banker_mode == 2) {
            viewMethods.seeMyCard();
        }
    },
    processStartShow: function(obj) {
        var delay = 0;
        if (appData.ruleInfo.banker_mode == 4) {
            delay = 1200;
        }

        setTimeout(function() {
            for (var i = 0; i < 6; i++) {
                for (var j = 0; j < obj.data.length; j++) {
                    if (appData.player[i].account_id == obj.data[j].account_id) {
                        appData.player[i].multiples = obj.data[j].multiples;
                        appData.player[i].account_status = Math.ceil(obj.data[j].account_status);
                        appData.player[i].online_status = Math.ceil(obj.data[j].online_status);
                        appData.player[i].card = obj.data[j].cards.concat();
                        appData.player[i].card_open = obj.data[j].cards.concat();
                        appData.player[i].card_type = obj.data[j].card_type;
                        appData.player[i].combo_point = obj.data[j].combo_point;
                        appData.player[i].limit_time = obj.data[j].limit_time;
                        if (appData.player[i].card_open.length < 1 || appData.player[i].card_open == undefined) {
                            appData.player[i].card_open = obj.data[j].cards.concat();
                        }
                    }
                }
            }
            appData.showClockBetText = false;
            appData.showClockRobText = false;
            appData.showClockShowCard = true;
            console.log('581: resetMyAccountStatus');
            viewMethods.resetMyAccountStatus();
            viewMethods.updateAllPlayerStatus();

            appData.game.time = Math.ceil(obj.limit_time);
            viewMethods.timeCountDown();
        }, delay);

    },
    processMyCards: function(obj) {
        if (appData.ruleInfo.banker_mode == 2) {
            if (appData.player[0].account_id == obj.data.account_id) {
                appData.player[0].card = obj.data.cards.concat();
            }

            viewMethods.seeMyCard();
        }

    },
    processBreakRoom: function(obj) {
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
    processStartBet: function(obj) {
        var delay = 0;
        if (appData.ruleInfo.banker_mode == 3) {
            delay = 1500;
        }

        if (appData.ruleInfo.banker_mode == 5 && appData.game.round > 1) {
            delay = 1200;
        }


        if (appData.game.round == 1 && appData.ruleInfo.banker_mode == 5) {
            //viewMethods.reDeal();
        }

        setTimeout(function() {
            for (var i = 0; i < 6; i++) {
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
            appData.game.time = Math.ceil(obj.limit_time);
            appData.bankerAnimateIndex = 0;

            appData.game.time = -1;

            if (appData.ruleInfo.banker_mode == 5 && appData.game.round > 1) {
                viewMethods.robBankerWithoutAnimate();
            } else {
                if (appData.ruleInfo.banker_mode == 3 && appData.game.round > 1) {
                    viewMethods.robBankerWithoutAnimate();
                } else {
                    if(appData.ruleInfo.banker_mode != 4){
                        viewMethods.clearBanker();
                        viewMethods.robBankerAnimate(obj);
                    }
                    else{
                        appData.game.time = Math.ceil(obj.limit_time);
                        if (appData.game.time > 0) {
                            viewMethods.timeCountDown();
                        }
                    }
                }
            }

        }, delay);

    },
    processAllGamerInfo: function(obj) {

        appData.game.show_card = true;
        appData.clickCard3 = false;

        for (var i = 0; i < 6; i++) {
            for (var j = 0; j < obj.data.length; j++) {
                if (appData.player[i].serial_num == obj.data[j].serial_num) {
                    appData.player[i].nickname = obj.data[j].nickname;
                    appData.player[i].headimgurl = obj.data[j].headimgurl;
                    appData.player[i].account_id = obj.data[j].account_id;
                    appData.player[i].account_score = Math.ceil(obj.data[j].account_score);
                    appData.player[i].account_status = Math.ceil(obj.data[j].account_status);
                    appData.player[i].online_status = Math.ceil(obj.data[j].online_status);
                    appData.player[i].ticket_checked = obj.data[j].ticket_checked;

                    appData.player[i].multiples = obj.data[j].multiples;
                    appData.player[i].bankerMultiples = obj.data[j].banker_multiples;
                    appData.player[i].card_type = obj.data[j].card_type;
                    appData.player[i].combo_point = obj.data[j].combo_point;
                    appData.player[i].poker_kw = obj.data[j].poker_kw;
                    appData.player[i].head_kw = obj.data[j].head_kw;
                    appData.player[i].is_showbull = false;
                    if (obj.data[j].is_banker == 1) {
                        appData.player[i].is_banker = true;
                        appData.bankerAccountId = obj.data[j].account_id;
                        appData.bankerPlayer = appData.player[i];
                    } else {
                        appData.player[i].is_banker = false;
                    }
                    if (appData.player[i].account_status >= 8) {
                        appData.player[i].is_showCard = true;
                    }

                    if (appData.player[i].card_open.length < 1 || appData.player[i].card_open == undefined) {
                        appData.player[i].card_open = obj.data[j].cards.concat();
                    }

                    if (appData.player[i].card_open.length < 1 || appData.player[i].card_open == undefined) {
                        appData.player[i].card_open = obj.data[j].cards.concat();
                    }

                    if (appData.player[i].card_open.length < 1 || appData.player[i].card_open == undefined) {
                        appData.player[i].card_open = [-1, -1, -1, -1, -1];
                    }
                }
            }
        }
        if (appData.player[0].account_status >= 7) {
            appData.player[0].is_showCard = true;
        }
        if (appData.scoreboard != "") {
            for (var i = 0; i < 6; i++) {
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
            setTimeout(function() {
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
            setTimeout(function() {
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
            console.log('~~~~~~~~~~~~~~~~~~~~~~~');
            appData.isFinishBankerAnimate = true;
        }

        console.log('723: resetMyAccountStatus');
        viewMethods.resetMyAccountStatus();
        viewMethods.updateAllPlayerStatus();

        if (appData.player[0].account_status > 2 && appData.player[0].account_status < 7 && appData.ruleInfo.banker_mode == 2) {
            viewMethods.seeMyCard();
        }
    },
    processUpdateGamerInfo: function(obj) {
        logMessage(appData.player);
        for (var i = 0; i < 6; i++) {
            if (appData.player[i].serial_num == obj.data.serial_num) {
                appData.player[i].nickname = obj.data.nickname;
                appData.player[i].headimgurl = obj.data.headimgurl;
                appData.player[i].account_id = obj.data.account_id;
                appData.player[i].account_score = Math.ceil(obj.data.account_score);
                appData.player[i].account_status = Math.ceil(obj.data.account_status);
                appData.player[i].online_status = Math.ceil(obj.data.online_status);
                appData.player[i].ticket_checked = obj.data.ticket_checked;
                appData.player[i].poker_kw = obj.data.poker_kw;
                appData.player[i].head_kw = obj.data.head_kw;
            } else {
                if (appData.player[i].account_id == obj.data.account_id) {
                    socketModule.sendRefreshRoom();
                }
            }
        }
    },
    processUpdateAccountStatus: function(obj) {

        for (var i = 0; i < 6; i++) {
            if (appData.player[i].account_id == obj.data.account_id) {
                appData.player[i].account_status = obj.data.account_status;

                if (appData.ruleInfo.banker_mode == 2 && obj.data.account_status == 5) {
                    appData.player[i].bankerMultiples = obj.data.banker_multiples;
                }

                if (appData.player[i].account_status >= 8) {
                    appData.player[i].online_status = obj.data.online_status;
                    return;
                }

                if (obj.data.online_status == 1) {
                    appData.player[i].account_status = Math.ceil(obj.data.account_status);
                } else if (obj.data.online_status == 0 && appData.player[i].account_status == 0) {
                    appData.player[i].account_id = 0;
                    appData.player[i].playing_status = 0;
                    appData.player[i].online_status = 0;
                    appData.player[i].nickname = "";
                    appData.player[i].headimgurl = "";
                    appData.player[i].account_score = 0;
                } else if (obj.data.online_status == 0 && appData.player[i].account_status > 0) {
                    appData.player[i].account_status = Math.ceil(obj.data.account_status);
                    appData.player[i].online_status = 0;
                } else {
                    logMessage("~~~~~~~!!!!!!" + obj);
                }

                if (i != 0) {
                    if (appData.player[i].account_status == 4) {
                        setTimeout(function() {
                            mp3AudioPlay("audioNoBanker");
                        }, 100);
                    } else if (appData.player[i].account_status == 5) {
                        setTimeout(function() {
                            mp3AudioPlay("audioRobBanker");
                        }, 100);
                    }
                }

                break;
            }
        }

        if (appData.player[0].account_status == 3) {
            viewMethods.showRobBankerText();
        } else if (appData.player[0].account_status == 4) {
            viewMethods.showNotRobBankerTextFnc();
        }

        if (!appData.isFinishBankerAnimate || !appData.isFinishWinAnimate) {
            setTimeout(function() {
                console.log('797: resetMyAccountStatus');
                viewMethods.resetMyAccountStatus();
                viewMethods.updateAllPlayerStatus();
            }, 3e3);
        } else {
            console.log('802: resetMyAccountStatus');
            viewMethods.resetMyAccountStatus();
            viewMethods.updateAllPlayerStatus();
        }
    },
    processUpdateAccountShow: function(obj) {
        for (var i = 0; i < appData.player.length; i++) {
            if (appData.player[i].account_id == obj.data.account_id) {
                appData.player[i].card_type = obj.data.card_type;
                appData.player[i].cards = obj.data.cards.concat();

                appData.player[i].card_open = obj.data.cards.concat();
                appData.player[i].combo_point = obj.data.combo_point;
                appData.player[i].account_status = 8;
                if (appData.player[i].card_open.length < 1 || appData.player[i].card_open == undefined) {
                    appData.player[i].card_open = obj.data.cards.concat();
                }
                if (appData.player[i].is_audiobull == false && appData.player[i].account_status >= 8) {
                    var audio = "";
                    if (parseInt(appData.player[i].card_type)>4) {
                        audio = "special"+appData.player[i].card_type;
                    } else  {
                        audio = "sangong" + appData.player[i].combo_point;
                    }
                    setTimeout(function() {
                        mp3AudioPlay(audio);
                    }, 100);
                    appData.player[i].is_audiobull = true;
                }
                break;
            }
        }

        if (obj.data.account_id == appData.player[0].account_id) {
            console.log('841: resetMyAccountStatus');
            viewMethods.resetMyAccountStatus();
        }

        viewMethods.updateAllPlayerStatus();
    },
    processUpdateAccountMultiples: function(obj) {
        for (var i = 0; i < appData.player.length; i++) {
            if (appData.player[i].account_id == obj.data.account_id) {
                appData.player[i].multiples = obj.data.multiples;
                if (i == 0) {
                    return;
                }
                if (appData.player[i].multiples >= 1) {
                    var multiples = appData.player[i].multiples;
                    setTimeout(function() {
                        mp3AudioPlay("audioTimes" + multiples);
                    }, 100);
                }
                break;
            }
        }

        console.log('864: resetMyAccountStatus');
        viewMethods.resetMyAccountStatus();
        viewMethods.updateAllPlayerStatus();
    },
    processStartLimitTime: function(obj) {
        if (obj.data.limit_time > 1) {
            appData.game.time = Math.ceil(obj.data.limit_time);
            viewMethods.timeCountDown();
        }
    },
    processCancelStartLimitTime: function(obj) {
        appData.game.time = -1;
    },
    processGameStart: function(obj) {
        var sTime = 0;
        $(".memberCoin").stop(true);
        appData.isFinishWinAnimate = true;
        appData.isFinishBankerAnimate = true;
        appData.game.can_open = 0;
        appData.game.cardDeal = 0;
        appData.game.currentScore = 0;
        appData.game.status = 1;
        appData.game.show_card = true;
        appData.game.score = 0;
        appData.game.time = -1;
        appData.game.is_play = true;
        appData.game.round = appData.game.round + 1;
        appData.game.round = Math.ceil(obj.game_num);
        appData.player[0].is_showCard = false;
        appData.showClockRobText = false;
        appData.showClockBetText = false;
        appData.showClockShowCard = false;
        appData.clickCard3 = false;
        appData.showClickShowCard = false;
        appData.breakData = null;

        for (var i = 0; i < 6; i++) {
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
                    appData.game.score = appData.game.score;
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
        }

    },
    processBroadcastVoice: function(obj) {
        for (var i = 0; i < appData.player.length; i++) {
            if (appData.player[i].account_id == obj.data.account_id && i != 0) {
                var loadMessageNum = 'message'+ obj.data.voice_num;
                audioModule.loadAudioFile(globalData.fileUrl + 'files/audio/sound/' + loadMessageNum + '.m4a', loadMessageNum);
                setTimeout(function () {
                    m4aAudioPlay(loadMessageNum);
                }, 200)
                viewMethods.messageSay(i, obj.data.voice_num);
            }
        }
    },
    processWin: function(obj) {
        appData.game.is_play = false;
        appData.game.current_win = obj.data.win_score;
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

        setTimeout(function() {
            console.log('983: resetMyAccountStatus');
            viewMethods.resetMyAccountStatus();
        }, 200);

        if (appData.player[0].account_status >= 8 && appData.player[0].is_audiobull == false) {
            var cardType =parseInt(appData.player[0].card_type);
            var point = appData.player[0].combo_point;
            setTimeout(function() {
                if (cardType > 4) {
                    mp3AudioPlay("special"+appData.player[0].card_type);
                } else {
                    mp3AudioPlay("sangong" + point);
                }
            }, 200);

            appData.player[0].is_audiobull = true;
        }
        setTimeout(function() {
            appData.game.show_card = false;
            viewMethods.winAnimate(obj);
        }, 2000);  //3000
    },
    processBalanceScoreboard: function(obj) {
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
    processLastScoreboard: function(obj) {
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
    showHomeAlert: function() {
        appData.isShowHomeAlert = true;
    },
    clickGameOver: function() {
        viewMethods.clickShowAlert(10, '下庄之后，将以当前战绩进行结算。是否确定下庄？');
        //socketModule.sendGameOver();
    },
    clickShowAlert: function(type, text) {
        //$(".alertText").css("top", "90px");
        appData.alertType = type;
        appData.alertText = text;
        appData.isShowAlert = true;
        setTimeout(function() {
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
    clickCloseAlert: function() {
        if (appData.alertType == 22) {
            appData.isShowAlert=false;
            appData.isShowGameAlert  = false;
            httpModule.getInfo();
        } else {
            appData.isShowGameAlert  = false;
            appData.isShowAlert=false;
        }
    },
    clickSitDown: function() {
        appData.isShowGameAlert  = false;
        appData.isShowAlert=false;
        socketModule.sendJoinRoom();
    },
    clickReady: function() {
        socketModule.sendReadyStart();
        appData.player[0].is_operation = true;
    },
    clickShowIntro: function () {
        appData.isShowIntro = true;
    },
    clickCloseIntro: function () {
        appData.isShowIntro = false;
    },
    reDeal: function() {
        if (appData.isDealing) {
            return;
        }

        console.log('~~~~reDeal~~~~~');
        appData.isDealing = true;
        m4aAudioPlay("audio1");
        appData.game.cardDeal = 1;
        setTimeout(function() {
            appData.game.cardDeal = 2;
            setTimeout(function() {
                appData.game.cardDeal = 3;
                setTimeout(function() {
                    console.log('1139: resetMyAccountStatus');
                    viewMethods.resetMyAccountStatus();
                    appData.player[0].is_showCard = true;
                    appData.showClockRobText = true;
                    appData.isDealing = false;
                    if (appData.ruleInfo.banker_mode == 5 && appData.game.round == 1) {
                        viewMethods.updateAllPlayerStatus();
                    }
                }, 300);
            }, 150);
        }, 150);
    },
    resetMyAccountStatus: function() {

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
                if (appData.isFinishBankerAnimate||appData.ruleInfo.banker_mode==4) {
                    appData.showTimesCoin = true;
                }
            }
        } else if (appData.player[0].account_status == 7) {
            appData.player[0].is_showCard = true;
            if (appData.clickCard3 == true) {
                appData.showShowCardButton = true;
            } else {
                appData.showClickShowCard = true;
            }
        } else if (appData.player[0].account_status == 8) {
            appData.player[0].is_showCard = true;
        }
    },
    resetShowButton: function() {
        appData.showRob = false;
        appData.showShowCardButton = false;
        appData.showClickShowCard = false;
        appData.showNotRobText = false;
        appData.showRobText = false;
        appData.showBankerCoinText = false;
        appData.showTimesCoin = false;
    },
    seeMyCard: function() {
        if (appData.ruleInfo.banker_mode == 2) { //明牌抢庄
            setTimeout(function() {
                $(".myCards .card0").addClass("card-flipped");
                $(".myCards .card1").addClass("card-flipped");

                setTimeout(function() {
                    if (appData.clickCard3 != true) {
                        if (appData.player[0].account_status >= 7) {
                            appData.showClickShowCard = true;
                        }
                    }

                }, 500);
            }, 1000);
        } else {
            setTimeout(function() {
                $(".myCards .card0").addClass("card-flipped");
                $(".myCards .card1").addClass("card-flipped");

                setTimeout(function() {
                    if (appData.clickCard3 != true ) {
                        appData.showClickShowCard = true;
                    }

                }, 500);
            }, 350);
        }

    },

    seeMyCard3: function() {
        if (appData.player[0].account_status >= 7) {
            $(".myCards .card2").addClass("card-flipped");
            appData.clickCard3 = true;
            setTimeout(function() {
                appData.showShowCardButton = true;
                appData.showClickShowCard = false;
            }, 100)
        }
    },
    resetCardOver: function(num) {
        if (num == 1) {
            return 0
            $(".myCards .card00").css("left", "2%");
            $(".myCards .card01").css("left", "26%");
            $(".myCards .card02").css("left", "50%");
            $(".myCards .card03").css("left", "74%");
            $(".myCards .card04").css("left", "98%");
        } else if (num == 2) {
            $(".cardOver .card211").css("right", "0%");
            $(".cardOver .card221").css("right", "4%");
            $(".cardOver .card231").css("right", "8%");
            $(".cardOver .card241").css("right", "12%");
            $(".cardOver .card251").css("right", "16%");
        } else if (num == 3) {
            $(".cardOver .card311").css("right", "0%");
            $(".cardOver .card321").css("right", "4%");
            $(".cardOver .card331").css("right", "8%");
            $(".cardOver .card341").css("right", "12%");
            $(".cardOver .card351").css("right", "16%");
        } else if (num == 4) {
            $(".cardOver .card451").css("left", "40%");
            $(".cardOver .card441").css("left", "44%");
            $(".cardOver .card431").css("left", "48%");
            $(".cardOver .card421").css("left", "52%");
            $(".cardOver .card411").css("left", "56%");
        } else if (num == 5) {
            $(".cardOver .card551").css("left", "0");
            $(".cardOver .card541").css("left", "4%");
            $(".cardOver .card531").css("left", "8%");
            $(".cardOver .card521").css("left", "12%");
            $(".cardOver .card511").css("left", "16%");
        } else if (num == 6) {
            $(".cardOver .card651").css("left", "0");
            $(".cardOver .card641").css("left", "4%");
            $(".cardOver .card631").css("left", "8%");
            $(".cardOver .card621").css("left", "12%");
            $(".cardOver .card611").css("left", "16%");
        }
    },
    myCardOver: function() {
        if (appData.player[0].is_showbull == true) {
            return;
        }
        appData.player[0].is_showbull = true;
    },
    cardOver: function(num) {
        if (num <= 1) {
            return;
        }

        if (appData.player[num - 1].is_showbull == true) {
            return;
        }
        appData.player[num - 1].is_showbull = true;
        viewMethods.resetCardOver(num);

        setTimeout(function() {
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
                setTimeout(function() {
                    $(".cardOver .card" + num).addClass("card-flipped");
                    $(".cardOver .card" + num + "11").animate({
                        right: "0"
                    }, 400);
                    $(".cardOver .card" + num + "21").animate({
                        right: "15%"
                    }, 400);
                    $(".cardOver .card" + num + "31").animate({
                        right: "30%"
                    }, 400);
                }, 250);

            } else if (num == 4) {
                $(".cardOver .card" + num + "31").animate({
                    left: "35%"
                }, 250);

                $(".cardOver .card" + num + "21").animate({
                    left: "35%"
                }, 250);

                $(".cardOver .card" + num + "11").animate({
                    left: "35%"
                }, 250);
                setTimeout(function() {
                    $(".cardOver .card" + num).addClass("card-flipped");
                    $(".cardOver .card" + num + "31").animate({
                        left: "33%"
                    }, 400);

                    $(".cardOver .card" + num + "21").animate({
                        left: "49%"
                    }, 400);

                    $(".cardOver .card" + num + "11").animate({
                        left: "65%"
                    }, 400);
                }, 250);

            } else if (num == 5 || num == 6) {
                $(".cardOver .card" + num + "31").animate({
                    left: "0"
                }, 250);

                $(".cardOver .card" + num + "21").animate({
                    left: "0"
                }, 250);

                $(".cardOver .card" + num + "11").animate({
                    left: "0"
                }, 250);
                setTimeout(function() {
                    $(".cardOver .card" + num).addClass("card-flipped");
                    $(".cardOver .card" + num + "31").animate({
                        left: "0"
                    }, 400);
                    $(".cardOver .card" + num + "21").animate({
                        left: "15%"
                    }, 400);
                    $(".cardOver .card" + num + "11").animate({
                        left: "30%"
                    }, 400);
                }, 250);
            }
        }, 1);

    },
    gameOverNew: function(board, balance_scoreboard) {

        for (var i = 0; i < appData.playerBoard.score.length; i++) {
            appData.playerBoard.score[i].num = 0;
            appData.playerBoard.score[i].account_id = 0;
            appData.playerBoard.score[i].nickname = '';
            appData.playerBoard.score[i].account_score = 0;
            appData.playerBoard.score[i].isBigWinner = 0;
        }

        console.log(appData.playerBoard);

        for (var i = 0; i < 6; i++) {
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

        var d = new Date(),str = "";
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

        for (var i = 0; i < 6; i++) {
            appData.player[i].playing_status = 0;
            appData.player[i].is_win = false;
            appData.player[i].is_operation = false;
            appData.player[i].win_type = 0;
            appData.player[i].win_show = false;
            appData.player[i].card = new Array();
            appData.player[i].card_open = new Array();
            appData.player[i].card_type = 0;
            appData.player[i].is_showCard = false;
            appData.player[i].is_readyPK = false;
            appData.player[i].is_pk = false;
            //appData.player[i].is_banker = false;
            appData.player[i].multiples = 0;
            appData.player[i].bankerMultiples = 0;
            appData.player[i].is_showbull = false;
            appData.player[i].is_audiobull = false;
        }
        appData.game.can_open = 0;
        appData.game.score = 0;
        appData.game.cardDeal = 0;
        appData.game.currentScore = 0;
        appData.game.status = 1;
        appData.player[0].is_showCard = false;
        appData.showClockRobText = false;
        appData.showClockBetText = false;
        appData.showClockShowCard = false;
    },
    showMessage: function() {
        appData.isShowNewMessage  = true;
        disable_scroll();

    },
    hideMessage: function() {
        appData.isShowNewMessage  = false;
        enable_scroll();
    },
    messageOn: function(num) {
        var loadMessageNum = 'message'+ num;
        audioModule.loadAudioFile(globalData.fileUrl + 'files/audio/sound/' + loadMessageNum + '.m4a', loadMessageNum);
        setTimeout(function () {
            m4aAudioPlay(loadMessageNum);
        }, 200)

        socketModule.sendBroadcastVoice(num);

        viewMethods.messageSay(0, num);
        viewMethods.hideMessage();
    },
    messageSay: function(num1, num2) {
        appData.player[num1].messageOn = true;
        appData.player[num1].messageText = appData.message[num2].text;
        setTimeout(function() {
            appData.player[num1].messageOn = false;
        }, 2500);
    },
    closeEnd: function() {
        return;
        // $(".ranking .rankBack").css("opacity", "0.7");
        // $(".end").hide();
        // $(".roundEndShow").hide();
        // $(".ranking").hide();
        // window.location.reload();
    },
    roundEnd: function() {
        window.location.href = globalData.baseUrl+'home/gn?i='+globalData.roomNumber+'_&v='+(new Date().getTime());
    },
    updateAllPlayerStatus: function() {
        for (var i = 0; i < appData.player.length; i++) {
            //判断倍数图片
            if (appData.player[i].multiples > 0) {
                appData.player[i].timesImg = globalData.fileUrl + "files/images/sangong/text_times" + appData.player[i].multiples + ".png";
            }

            if (appData.player[i].bankerMultiples > 0) {
                appData.player[i].bankerTimesImg = globalData.fileUrl + "files/images/sangong/text_times" + appData.player[i].bankerMultiples + ".png";
            }

            //判断牛几图片
            if (appData.player[i].card_type >= 1) {
                var imgIndex = 20;
                var cardType = parseInt(appData.player[i].card_type);

                if (cardType == 1) {
                    imgIndex = 20;
                } else if (cardType == 4) {
                    imgIndex = 20;
                } else if (cardType == 5) {
                    imgIndex = 11;
                } else if (cardType == 6) {
                    imgIndex = 12;
                } else if (cardType == 7) {
                    imgIndex = 13;
                }

                else if (cardType == 8) {
                    imgIndex = 14;
                }  else if (cardType == 9) {
                    imgIndex = 15;
                }  else if (cardType == 10) {
                    imgIndex = 16;
                }  else if (cardType == 11) {
                    imgIndex = 17;
                }

                else {
                    imgIndex = appData.player[i].combo_point;
                }
                appData.player[i].bullImg = globalData.fileUrl + "files/images/sangong/point" + imgIndex + ".png";

            }


            if (appData.player[i].account_status == 4) {

                if (appData.ruleInfo.banker_mode == 5) {
                    appData.player[i].robImg = globalData.fileUrl + "files/images/sangong/text_notgo.png";
                } else {
                    //不抢庄
                    appData.player[i].robImg = globalData.fileUrl + "files/images/sangong/text_notrob.png";
                }
            } else if (appData.player[i].account_status == 5) {

                if (appData.ruleInfo.banker_mode == 5) {
                    appData.player[i].robImg = globalData.fileUrl + "files/images/sangong/text_go.png";
                } else {
                    appData.player[i].robImg = globalData.fileUrl + "files/images/sangong/text_rob.png";
                }
            } else if (appData.player[i].account_status == 6) {
                //下注
                if (appData.player[i].multiples > 0) {}
            } else if (appData.player[i].account_status == 7) {
                //未摊牌
                if (i == 0) {
                    viewMethods.seeMyCard();
                }
            } else if (appData.player[i].account_status == 8) {
                //摊牌
                if (i == 0) {
                    viewMethods.myCardOver();
                } else {
                    viewMethods.cardOver(appData.player[i].num);
                }
            }
        }
    },
    timeCountDown: function() {
        if (isTimeLimitShow == true) {
            return;
        }
        if (appData.game.time <= 0) {
            isTimeLimitShow = false;
            return 0;
        } else {
            isTimeLimitShow = true;
            appData.game.time--;
            timeLimit = setTimeout(function() {
                isTimeLimitShow = false;
                viewMethods.timeCountDown();
            }, 1e3);
        }
    },
    clickRobBanker: function(multiples) {
        viewMethods.showRobBankerText();
        socketModule.sendGrabBanker(multiples);

        if (appData.ruleInfo.banker_mode == 2) {
            appData.player[0].bankerMultiples = multiples;


            if (appData.player[0].bankerMultiples > 0) {
                appData.player[0].bankerTimesImg = globalData.fileUrl + "files/images/sangong/text_times" + appData.player[0].bankerMultiples + ".png";
            }
        }

        setTimeout(function() {
            mp3AudioPlay("audioRobBanker");
        }, 10);
    },
    showRobBankerText: function() {
        appData.showRob = false;
        appData.showShowCardButton = false;
        appData.showClickShowCard = false;
        appData.showNotRobText = false;
        appData.showRobText = true;
        appData.showBankerCoinText = false;
        appData.showTimesCoin = false;
    },
    showNotRobBankerTextFnc: function() {
        appData.showRob = false;
        appData.showShowCardButton = false;
        appData.showClickShowCard = false;
        appData.showNotRobText = true;
        appData.showRobText = false;
        appData.showBankerCoinText = false;
        appData.showTimesCoin = false;
    },
    clickNotRobBanker: function() {
        viewMethods.showNotRobBankerTextFnc();
        socketModule.sendNotGrabBanker();
        setTimeout(function() {
            mp3AudioPlay("audioNoBanker");
        }, 10);
    },
    clickSelectTimesCoin: function(times) {
        //appData.base_score = parseInt(appData.game.base_score) * parseInt(times);

        appData.player[0].multiples = times;
        appData.showTimesCoin = false;

        if (appData.player[0].multiples > 0) {
            appData.player[0].timesImg = globalData.fileUrl + "files/images/sangong/text_times" + appData.player[0].multiples + ".png";
        }

        socketModule.sendPlayerMultiples(times);
        setTimeout(function() {
            mp3AudioPlay("audioTimes" + times);
        }, 50);
    },
    clickShowCard: function() {
        appData.showShowCardButton = false;
        appData.showClickShowCard = false;
        socketModule.sendShowCard();
    },
    clearBanker: function() {
        for (var i = 0; i < appData.player.length; i++) {
            appData.player[i].is_banker = false;
        }
        appData.isFinishBankerAnimate = false;
        var totalCount = appData.bankerArray.length * 2;
        appData.bankerAnimateDuration = parseInt(1500 / totalCount);




    },
    robBankerWithoutAnimate: function() {

        for (var i = 0; i < appData.player.length; i++) {
            if (appData.player[i].account_id == appData.bankerAccountId) {
                appData.player[i].is_banker = true;
                bankerNum = appData.player[i].num;
            } else {
                appData.player[i].is_banker = false;
            }

            $("#bankerAnimate" + appData.player[i].num).hide();
            $("#bankerAnimate1" + appData.player[i].num).hide();
        }

        setTimeout(function() {
            appData.showClockRobText = false;
            appData.showClockBetText = true;
            appData.isFinishBankerAnimate = true;
            viewMethods.resetMyAccountStatus();
            viewMethods.updateAllPlayerStatus();
        }, 10);

        appData.game.time = 11;
        if (appData.game.time > 0) {
            viewMethods.timeCountDown();
        }
    },
    robBankerAnimate: function(obj) {

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

                $("#bankerAnimate" + appData.player[i].num).hide();
                $("#bankerAnimate1" + appData.player[i].num).hide();
            }

            $(imgId).hide();

            $("#bankerAnimate" + bankerNum).css({
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

            $("#bankerAnimate" + bankerNum).show();
            $("#bankerAnimate1" + bankerNum).show();

            $("#bankerAnimate1" + bankerNum).animate({
                top: "5%",
                left: "5%",
                width: "90%",
                height: "90%"
            }, 400, function() {
                $("#bankerAnimate1" + bankerNum).animate({
                    top: "10%",
                    left: "10%",
                    width: "80%",
                    height: "80%"
                }, 400, function() {
                    $("#bankerAnimate1" + bankerNum).hide();
                });
            });

            $("#bankerAnimate" + bankerNum).animate({
                top: "-10%",
                left: "-10%",
                width: "120%",
                height: "120%"
            }, 400, function() {
                $("#bankerAnimate" + bankerNum).animate({
                    top: "10%",
                    left: "10%",
                    width: "80%",
                    height: "80%"
                }, 400, function() {
                    $("#bankerAnimate" + bankerNum).hide();

                    setTimeout(function() {
                        console.log('1803: resetMyAccountStatus');
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

                            setTimeout(function() {
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

                    appData.game.time = 11;
                    if (appData.game.time > 0) {
                        viewMethods.timeCountDown();
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

        setTimeout(function() {
            viewMethods.robBankerAnimate(obj);
        }, appData.bankerAnimateDuration);
    },
    showMemberScore: function(isShow) {
        if (isShow) {
            $(".memberScoreText1").show();
            $(".memberScoreText2").show();
            $(".memberScoreText3").show();
            $(".memberScoreText4").show();
            $(".memberScoreText5").show();
            $(".memberScoreText6").show();
        } else {
            $(".memberScoreText1").hide();
            $(".memberScoreText2").hide();
            $(".memberScoreText3").hide();
            $(".memberScoreText4").hide();
            $(".memberScoreText5").hide();
            $(".memberScoreText6").hide();
        }
    },
    winAnimate: function(obj) {
        appData.isFinishWinAnimate = false;
        $(".cards").removeClass("card-flipped");
        $(".myCards").removeClass("card-flipped");
        var winnerNums = new Array();
        var loserNums = new Array();

        appData.bankerPlayerNum = appData.bankerPlayer.num;

        if (appData.ruleInfo.banker_mode == 4) {
            /*   for (var i = 0; i < obj.data.winner_array.length; i++) {
             for (var j = 0; j < appData.player.length; j++) {
             if (obj.data.winner_array[i].account_id == appData.player[j].account_id && j!=0) {
             appData.bankerPlayerNum = 1;
             winnerNums.push(appData.player[j].num);
             }
             }
             }*/
            appData.bankerPlayerNum = 1;
            for (var i = 0; i < obj.data.winner_array.length; i++) {
                for (var j = 0; j < appData.player.length; j++) {
                    if (obj.data.winner_array[i].account_id == appData.player[j].account_id) {
                        if (appData.player[j].num == appData.bankerPlayerNum) {
                            isBankerWin = true;
                            appData.bankerPlayerNum = appData.player[j].num;
                        } else {
                            winnerNums.push(appData.player[j].num);
                        }
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
        if(appData.player[0].account_status!=0&&appData.player[0].account_status!=1&&appData.player[0].account_status!=2){
            $("#playerCoins").show();
        }

        for (var i = 1; i < 7; i++) {
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
            var playerNum = loserNums[i];
            for (var j = 0; j < 8; j++) {
                $(".memberCoin" + loserNums[i] + j).animate(memCoin[appData.bankerPlayerNum], 150+50*j);
            }
            setTimeout(function() {
                if((appData.player[0].account_status!=0&&appData.player[0].account_status!=1&&appData.player[0].account_status!=2)||appData.ruleInfo.banker_mode!=4){
                    if(loserNums.length>=1){
                        mp3AudioPlay("audioCoin");
                    }
                }
            }, 10);
        }
        var winnerTime = 100;
        var totalTime = 100;
        if (loserNums.length >= 1) {
            winnerTime = 1800;
            if (winnerNums.length >= 1) {
                totalTime = 3600;
            } else {
                totalTime = 1800;
            }
        } else {
            if (winnerNums.length >= 1) {
                totalTime = 1800;
            }
        }
        var trueTime=totalTime;
        setTimeout(function() {
            $("#playerCoins").hide();
        }, trueTime);
        if (appData.ruleInfo.banker_mode == 4) {
            totalTime = 3600;
            //   winnerTime = 3600;
        }

        if (winnerNums.length >= 1) {
            setTimeout(function() {
                //显示赢家金币
                for (var i = 0; i < loserNums.length; i++) {
                    viewMethods.showCoins(loserNums[i], false);
                }
                for (var i = 0; i < winnerNums.length; i++) {
                    viewMethods.showCoins(winnerNums[i], true);
                }
                for (var i = 0; i < winnerNums.length; i++) {
                    for (var j = 0; j < 8; j++) {
                        $(".memberCoin" + winnerNums[i] + j).animate(memCoin[winnerNums[i]],  150 + 50 * j);
                    }
                }
                setTimeout(function() {
                    if((appData.player[0].account_status!=0&&appData.player[0].account_status!=1&&appData.player[0].account_status!=2)||appData.ruleInfo.banker_mode!=4){
                        mp3AudioPlay("audioCoin");
                    }
                }, 10);
            }, winnerTime);
            setTimeout(function() {
                viewMethods.finishWinAnimate(obj);
            }, totalTime);
        } else {
            setTimeout(function() {
                viewMethods.finishWinAnimate(obj);
            }, totalTime);
        }
    },
    finishWinAnimate: function(obj) {
        $("#playerCoins").hide();

        appData.game.show_score = true;

        $(".memberScoreText1").fadeIn(200);
        $(".memberScoreText2").fadeIn(200);
        $(".memberScoreText3").fadeIn(200);
        $(".memberScoreText4").fadeIn(200);
        $(".memberScoreText5").fadeIn(200);
        $(".memberScoreText6").fadeIn(200, function() {

            if (appData.ruleInfo.banker_mode == 5) {
                if (appData.isBreak != 1) {
                    viewMethods.gameOverNew(obj.data.score_board, obj.data.balance_scoreboard);
                } else {
                    for (var i = 0; i < 6; i++) {
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

            setTimeout(function() {

                $(".memberScoreText1").fadeOut("slow");
                $(".memberScoreText2").fadeOut("slow");
                $(".memberScoreText3").fadeOut("slow");
                $(".memberScoreText4").fadeOut("slow");
                $(".memberScoreText5").fadeOut("slow");
                $(".memberScoreText6").fadeOut("slow");

                if (appData.ruleInfo.banker_mode == 5 && appData.isBreak == 1) {
                    appData.overType = 2;
                    setTimeout(function() {
                        viewMethods.clickShowAlert(9, '庄家分数不足，提前下庄，点击确定查看结算');
                    }, 1000);
                } else {
                    for (var i = 0; i < 6; i++) {

                        if (appData.player[i].account_status >= 6 && ruleInfo.banker_mode != 5) {
                            appData.player[i].is_banker = false;
                            //console.log('hello1');
                            if (appData.player[i].account_id == appData.bankerID) {
                                appData.player[i].is_banker = true;
                                //console.log('hello2');
                            }
                        }
                        appData.player[i].account_status = 1;
                    }
                }
            }, 1000);  //2000
            appData.isFinishWinAnimate = true;
            if (appData.ruleInfo.banker_mode == 5) {
                if (appData.isBreak == 1) {
                    // appData.overType = 2;
                    // setTimeout(function () {
                    // 	viewMethods.clickShowAlert(9,'庄家分数不足，提前下庄，点击确定查看结算');
                    // }, 1000);
                } else {
                    if (obj.data.total_num == obj.data.game_num) {
                        setTimeout(function() {
                            viewMethods.roundEnd();
                            newNum = obj.data.room_number;
                        }, 1e3);
                    }
                }
                return;
            }
            if (obj.data.total_num == obj.data.game_num) {
                setTimeout(function() {
                    viewMethods.roundEnd();
                    newNum = obj.data.room_number;
                }, 1e3);
            }

        });

        // 自动准备
        setTimeout(function(){
            if(appData.isAutoReady==1){
                viewMethods.clickReady()
            }
        },2500)
    },
    resetCoinsPosition: function() {
        for (var i = 1; i <= 6; i++) {
            for (var j = 0; j < 8; j++) {
                $(".memberCoin" + i + j).css(memCoin[i]);
            }
        }
    },
    showCoins: function(num, isShow) {

        if((appData.player[0].account_status==0||appData.player[0].account_status==1||appData.player[0].account_status==2)&&appData.ruleInfo.banker_mode==4){
            isShow=false;
        }
        else if (isShow) {
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

var memCoin = [
    {},
    {top: '82%', left: '9%'},
    {top: '46%', left: '87%'},
    {top: '31%', left: '87%'},
    {top: '11%', left: '48%'},
    {top: '31%', left:  '9%'},
    {top: '46%', left:  '9%'},
];

var viewStyle = {
    readyButton: {
        position: 'absolute',
        bottom: '0',
        left: '34%',
        width: '110px',
    },
    readyText: {
        position: 'absolute',
        bottom: '0',
        left: '43%',
    },
    button: {
        position: 'absolute',
        top: '53%',
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
    showCard1: {
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: width * 0.09 / 0.375 + 'px',
        height: width * 0.09 + 'px',
        'line-height': width * 0.09 + 'px',
        'text-align': 'center',
        color: 'white',
        'font-size': '15pt',
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
    type: -1,
    isShow: false,
    isShowRule: false,
    baseScore: 1,
    timesType: 1,
    is_cardjoker: 0,
    is_cardbao9: 0,
    ticket: 1,
    'rule_height': 30,
    'banker_mode': 1,
    'banker_score': 1,
    'bankerText': '抢庄',
    cardbao9:'',
    cardthree:'',
    cardthreesan:''
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
if(localStorage.isAutoReady==1&&localStorage.roomNumber==globalData.roomNumber){
    setReady=1
}else{
    setReady=0
}

var appData = {
    isShowKefu:false,
    'isShowHomeAlert': false,
    'viewStyle': viewStyle,
	'alertAvatar': [],
    joinType:0,
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
    add_user:false,
    isAutoReady:setReady, //自动准备
	 applyStatus:0, //0尚未申请  1加好友申请中
    roomStatus: globalData.roomStatus,
    'isAA': false, //是否AA房卡
    'isAutoActive': false, //是否自动激活
    'isShop': false, //是否有商城
    'width': window.innerWidth,
    'height': window.innerHeight,
    'roomCard': Math.ceil(globalData.card),
    'is_connect': false,
    'player': [],
    'scoreboard': '',
    'activity': [],
    'isShowAlert': false,
	'isShowGameAlert':false,
    'isShowIndividuality': false,
    'isShowIndividualityError': false,
    'individuality':userData.individuality,
    'individualityError':"",
    'userData':userData,
    'isShowAlertTip':false,
    'alertTipText':"",
    'alertTipType':1,

    'isShowNewMessage': false,
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
    'clickCard3': false,
    'base_score': 0,
    'playerBoard': {
        score: new Array(),
        round: 0,
        record: "",
        room: "",
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
    isShowNoty:false,
    notyMsg:'',
    isShowIntro:false,
    isShowNoteImg:!1,
    'musicOnce': true,
    isShowGiftBox: false, //礼物
    giftToolsList: [],
    isShowBuyTools:false,
    buyToolsId:0,
    skin_expire_type:1,
    buyToolsName:''
};

// if (globalData.isNotyMsg != undefined && globalData.isNotyMsg != null) {
//     appData.notyMsg = Base64.decode(globalData.notyMsg);
//     if (globalData.isNotyMsg == 1) {
//         appData.isShowNoty = true;
//         setTimeout(function() {
//             appData.isShowNoty = false;
//         }, globalData.notyTime * 1000);
//     }
// } else {
//     globalData.isNotyMsg = 0;
// }


var resetState = function resetState() {
    appData.game.show_score = false;
    appData.game.show_bettext = false;
    appData.clickCard3 = false;

    for (var i = 0; i < 6; i++) {
        appData.player.push({
            num: i + 1,
            'serial_num': i + 1,
            'account_id': 0,
            account_status: 0,
            playing_status: 0,
            online_status: 0,
            nickname: "",
            headimgurl: "",
            account_score: 0,
            ticket_checked: 0,
            is_win: false,
            win_type: 0,
            limit_time: 0,
            is_operation: false,
            win_show: false,
            card: [],
            card_open: [],
            'is_showCard': false,
            is_pk: false,
            is_readyPK: false,
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
            is_showbull: false,
            is_audiobull: false,
            messageText: "",
            coins: [],
            poker_kw:1,
            head_kw:'',
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

    for (var i = 0; i < 6; i++) {
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
            is_win: false,
            win_type: 0,
            limit_time: 0,
            is_operation: false,
            win_show: false,
            card: new Array(),
            card_open: new Array(),
            'is_showCard': false,
            is_pk: false,
            is_readyPK: false,
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
            is_showbull: false,
            is_audiobull: false,
            messageText: "",
            coins: [],
            poker_kw:1,
            head_kw:'',
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
        record: "",
        room: "",
    };

    appData.game.round = 0;
    appData.game.status = 1;
    appData.game.score = 0;
    appData.game.currentScore = 0;
    appData.game.cardDeal = 0;
    appData.game.can_open = 0;
    appData.game.current_win = 0;
    appData.game.is_play = false;
    appData.game.show_score = false;
    appData.game.show_bettext = false;
    appData.clickCard3 = false;

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
            appData.player[i].is_win = false;
            appData.player[i].is_operation = false;
            appData.player[i].win_type = 0;
            appData.player[i].win_show = false;
            appData.player[i].card = new Array();
            appData.player[i].card_open = new Array();
            appData.player[i].card_type = 0;
            appData.player[i].ticket_checked = 0;
            appData.player[i].account_score = 0;
            appData.player[i].is_showCard = false;
            appData.player[i].is_readyPK = false;
            appData.player[i].is_pk = false;
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
                is_win: false,
                win_type: 0,
                ticket_checked: 0,
                limit_time: 0,
                is_operation: false,
                win_show: false,
                card: new Array(),
                card_open: new Array(),
                'is_showCard': false,
                is_pk: false,
                is_readyPK: false,
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

    appData.heartbeat = setInterval(function() {
        appData.socketStatus = appData.socketStatus + 1;

        if (appData.socketStatus > 1) {
            appData.connectOrNot = false;
        }

        if (appData.socketStatus > 3) {
            window.location.href = window.location.href + "&id=" + 10000 * Math.random();
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
    }

    if (obj.operation=='getToolsList'||obj.operation=='useTools'||obj.operation=='buyTools') {
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
        } else if (obj.operation == wsOperation.NotyChooseChip) {
            socketModule.processNotyChooseChip(obj);
        } else if (obj.operation == wsOperation.UpdateAccountScore) {
            socketModule.processUpdateAccountScore(obj);
        } else if (obj.operation == wsOperation.OpenCard) {
            socketModule.processOpenCard(obj);
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
    initModule: function(audioUrl) {
        this.audioUrl = audioUrl;
        this.audioBuffers = [];
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
        this.audioContext = new window.AudioContext();
    },
    stopSound: function(name) {
        var buffer = this.audioBuffers[name];

        if (buffer) {
            if (buffer.source) {
                buffer.source.stop(0);
                buffer.source = null;
            }
        }
    },
    playSound: function(name, isLoop) {

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
                     WeixinJSBridge.invoke('getNetworkType', {}, function(e) {
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
    initSound: function(arrayBuffer, name) {
        this.audioContext.decodeAudioData(arrayBuffer, function(buffer) {
            audioModule.audioBuffers[name] = {"name": name, "buffer": buffer, "source": null};

            if (name == "backMusic") {
                audioModule.audioOn = true;
                audioModule.playSound(name, true);
            }

        }, function(e) {
            logMessage('Error decoding file', e);
        });
    },
    loadAudioFile: function(url, name) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = function(e) {
            audioModule.initSound(xhr.response, name);
        };

        xhr.send();
    },
    loadAllAudioFile: function() {

        if (globalData.roomStatus == 4) {
            return;
        }

        if (isLoadAudioFile == true) {
            return;
        }

        isLoadAudioFile = true;
        this.loadAudioFile(this.audioUrl + 'files/audio/sangong/background8.mp3', "backMusic");

        var audioUrl = ["nobanker.m4a", "robbanker.m4a", "0.m4a","1.m4a","2.m4a","3.m4a","4.m4a","5.m4a","6.m4a","7.m4a","8.m4a","9.m4a","special5.m4a","special6.m4a","special7.m4a","special8.m4a","special9.m4a","special10.m4a","special11.m4a", "times1.m4a", "times2.m4a", "times3.m4a", "times4.m4a", "times8.m4a", "times5.m4a", "times10.m4a", "coin.mp3", "audio1.m4a"];
        var audioName = ["audioNoBanker", "audioRobBanker", "sangong0", "sangong1", "sangong2", "sangong3", "sangong4", "sangong5", "sangong6", "sangong7", "sangong8", "sangong9", "special5", "special6", "special7", "special8", "special9", "special10", "special11", "audioTimes1", "audioTimes2", "audioTimes3", "audioTimes4", "audioTimes8", "audioTimes5", "audioTimes10", "audioCoin", "audio1"];
        for (var i = 0; i < audioUrl.length; i++) {
            this.loadAudioFile(this.audioUrl + 'files/audio/sangong/' + audioUrl[i], audioName[i]);
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

    window.onload = function() {
        var divs = ['table', 'vinvite', 'valert', 'vmessage', 'vshop', 'vcreateRoom', 'vroomRule', 'endCreateRoom', 'endCreateRoomBtn'];
        var divLength = divs.length;

        for (var i = 0; i < divLength; i++) {
            var tempDiv = document.getElementById(divs[i]);
            if (tempDiv) {
                tempDiv.addEventListener('touchmove', function(event) {
                    event.preventDefault();
                }, false);
            }
        }

        var member4Top = (window.innerHeight * 0.195 - 28 - 89) / 2 + 26;
        member4Top = (member4Top / window.innerHeight) * 100;

        $('.member4').css('top', member4Top + '%');
    };
};

function checkIndividuality(e){
    return!!/^[0-9a-zA-Z]*$/g.test(e);
}

//Vue方法
var methods = {
    showHomeAlert: viewMethods.showHomeAlert,
    clickGameOver: viewMethods.clickGameOver,
    showAlert: viewMethods.clickShowAlert,
    showMessage: viewMethods.showMessage,
    closeAlert: viewMethods.clickCloseAlert,
    showIntro: viewMethods.clickShowIntro,
    closeIntro: viewMethods.clickCloseIntro,
    sitDown: viewMethods.clickSitDown,
    seeMyCard3: viewMethods.seeMyCard3,
    imReady: viewMethods.clickReady,
    robBanker: viewMethods.clickRobBanker,
    showCard: viewMethods.clickShowCard,
    selectTimesCoin: viewMethods.clickSelectTimesCoin,
    hideMessage: viewMethods.hideMessage,
    closeEnd: viewMethods.closeEnd,
    messageOn: viewMethods.messageOn,
    showNoteImg:function(){appData.isShowNoteImg=!0},
    hideNoteImg:function(){appData.isShowNoteImg=!1},
    hall: function(){
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
    reviewCard: function(){
        window.location.href = globalData.baseUrl+'game/queryCard?type='+globalData.gameType+'&num='+globalData.roomNumber;
    },

    showIndividuality: function () {
        appData.individualityError="";
        appData.isShowIndividuality = true;
    },
    hideIndividuality: function () {
        appData.isShowIndividuality = false;
    },
    setIndividuality:function(){
        if(appData.individuality.length>6||appData.individuality.length<1){
            appData.individualityError="请输入1-6位英文或数字防伪码";
            appData.isShowIndividualityError=!0;
        } else if(checkIndividuality(appData.individuality)){
            appData.individualityError="";
            httpModule.setIndividuality();
        } else {
            appData.individualityError="请输入1-6位英文或数字防伪码";
            appData.isShowIndividualityError=!0;
        }
    },
    individualityChange:function(){
        if(appData.individuality.length>6){
            appData.individuality=appData.individuality.substring(0,6);
        }
    },
    showAlertTip:function(e,t){
        appData.isShowAlertTip=true;
        appData.alertTipText=e;
        appData.alertTipType=t;
        setTimeout(function(){
            appData.isShowAlertTip=!1;
        },1e3);
    },

    notRobBanker: viewMethods.clickNotRobBanker,

    showGameRule: function() {
        if (appData.roomStatus == 4) {
            return;
        }

        $('.createRoom .mainPart').css('height', '60vh');
        $('.createRoom .mainPart .blueBack').css('height', '51vh');
        appData.ruleInfo.isShowRule = true;
    },
    cancelGameRule: function() {
        appData.ruleInfo.isShowRule = false;
        $('.createRoom .mainPart').css('height', '65vh');
        $('.createRoom .mainPart .blueBack').css('height', '46vh');
    },

    showBreakRoom: function() {
        if (appData.breakData != null && appData.breakData != undefined) {
            viewMethods.gameOverNew(appData.breakData.data.score_board, appData.breakData.data.balance_scoreboard);
        }
        chooseBigWinner();
        $(".ranking .rankBack").css("opacity", "1");
        $(".roundEndShow").show();

        $(".ranking").show();
        canvas();
    },
    confirmBreakRoom: function() {
        socketModule.sendGameOver();
        viewMethods.clickCloseAlert();
    },
    showAudioSetting: function() {
        appData.editAudioInfo.backMusic = appData.audioInfo.backMusic;
        appData.editAudioInfo.messageMusic = appData.audioInfo.messageMusic;
        appData.editAudioInfo.isShow = true;
    },
    cancelAudioSetting: function() {
        appData.editAudioInfo.isShow = false;
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
    setBackMusic: function() {
        if (appData.editAudioInfo.backMusic == 0) {
            appData.editAudioInfo.backMusic = 1;
        } else {
            appData.editAudioInfo.backMusic = 0;
        }

    },
    setMessageMusic: function() {
        if (appData.editAudioInfo.messageMusic == 0) {
            appData.editAudioInfo.messageMusic = 1;
        } else {
            appData.editAudioInfo.messageMusic = 0;
        }
    },

    reloadView: function() {
        window.location.href = window.location.href + "&id=" + 1000 * Math.random();
    },
	    applyToJoin:function(){
        httpModule.applyToJoin();
    },
    showKefu:function(){
        appData.isShowKefu=true
    },
    hideKefu:function(){
        appData.isShowKefu=false
    }
};

//Vue生命周期
var vueLife = {
    vmCreated: function() {
        logMessage('vmCreated')
        resetState();
        //reconnectSocket();
        initView();
        if (globalData.roomStatus != 4) {
            $("#loading").hide();
        }

        $(".main").show();
    },
    vmUpdated: function() {
        logMessage('vmUpdated');
    },
    vmMounted: function() {
        logMessage('vmMounted');
        $('#marquee').marquee({
            //speed in milliseconds of the marquee
            duration: globalData.notySpeed,
            //gap in pixels between the tickers
            gap: 50,
            //time in milliseconds before the marquee will start animating
            delayBeforeStart: 0,
            //'left' or 'right'
            direction: 'left',
            //true or false - should the marquee be duplicated to show an effect of continues flow
            duplicated: true
        });
    },
    vmDestroyed: function() {
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

var wsctop = 0;

function disable_scroll() {
    wsctop = $(window).scrollTop(); //记住滚动条的位置
    $("body").addClass("modal-show");
}

function enable_scroll() {
    $("body").removeClass("modal-show");
    $(window).scrollTop(wsctop); //弹框关闭时，启动滚动条，并滚动到原来的位置
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
        shareContent = shareContent + '经典三公 ';
    } else if (appData.ruleInfo.banker_mode == 5) {
        shareContent = shareContent + '固定庄家 ';
    }

    if (appData.ruleInfo.baseScore == 1) {
        shareContent = shareContent + '底分:1分';
    } else if (appData.ruleInfo.baseScore == 2) {
        shareContent = shareContent + '底分:2分';
    } else if (appData.ruleInfo.baseScore == 3) {
        shareContent = shareContent + '底分:3分';
    } else if (appData.ruleInfo.baseScore == 4) {
        shareContent = shareContent + '底分:4分';
    } else if (appData.ruleInfo.baseScore == 5) {
        shareContent = shareContent + '底分:5分';
    }

    if (appData.ruleInfo.is_cardjoker == 1 || appData.ruleInfo.is_cardbao9 == 1) {
        var cardContent = ' 规则:';
        if (appData.ruleInfo.is_cardjoker == 1) {
            cardContent = cardContent + ' 天公x10,雷公x7,地公x5';
        }

        if (appData.ruleInfo.is_cardbao9 == 1) {
            cardContent = cardContent + ' 暴玖x9';
        }

        shareContent = shareContent + cardContent;
    }

    if (appData.ruleInfo.ticket == 1) {
        shareContent = shareContent + ' 局数:10局x1张房卡';
    } else {
        shareContent = shareContent + ' 局数:20局x2张房卡';
    }

    if (appData.ruleInfo.banker_mode == 5) {
        if (appData.ruleInfo.banker_score == 1) {
            shareContent = shareContent + ' 上庄分数:无';
        } else if (appData.ruleInfo.banker_score == 2) {
            shareContent = shareContent + ' 上庄分数:100';
        } else if (appData.ruleInfo.banker_score == 3) {
            shareContent = shareContent + ' 上庄分数:300';
        } else if (appData.ruleInfo.banker_score == 4) {
            shareContent = shareContent + ' 上庄分数:500';
        }
    }
};

var wxModule = {
    config: function() {
        // wx.config({
        //     debug: false,
        //     appId: configData.appId,
        //     timestamp: configData.timestamp,
        //     nonceStr: configData.nonceStr,
        //     signature: configData.signature,
        //     jsApiList: ["onMenuShareTimeline", "onMenuShareAppMessage", "hideMenuItems"]
        // });

        getShareContent();

        // wx.onMenuShareTimeline({
        //     title: globalData.shareTitle + '(房间号:' + globalData.roomNumber + ')',
        //     desc: shareContent,
        //     link: globalData.roomUrl,
        //     imgUrl: globalData.fileUrl + "files/images/sangong/share_icon.jpg",
        //     success: function() {},
        //     cancel: function() {}
        // });
        // wx.onMenuShareAppMessage({
        //     title: globalData.shareTitle + '(房间号:' + globalData.roomNumber + ')',
        //     desc: shareContent,
        //     link: globalData.roomUrl,
        //     imgUrl: globalData.fileUrl + "files/images/sangong/share_icon.jpg",
        //     success: function() {},
        //     cancel: function() {}
        // });

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
wx.ready(function() {

    audioModule.loadAllAudioFile();

    wx.hideMenuItems({
        menuList: ["menuItem:copyUrl", "menuItem:share:qq", "menuItem:share:weiboApp", "menuItem:favorite", "menuItem:share:facebook", "menuItem:share:QZone", "menuItem:refresh"]
    });

    getShareContent();

    wx.onMenuShareTimeline({
        title: globalData.shareTitle + '(房间号:' + globalData.roomNumber + ')',
        desc: shareContent,
        link: globalData.roomUrl,
        imgUrl:globalData.shareImg,
        success: function() {},
        cancel: function() {}
    });
    wx.onMenuShareAppMessage({
        title: globalData.shareTitle + '(房间号:' + globalData.roomNumber + ')',
        desc: shareContent,
        link: globalData.roomUrl,
        imgUrl:globalData.shareImg,
        success: function() {},
        cancel: function() {}
    });
});

wx.error(function(a) {});
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
  var pics = [globalData.fileUrl+'files/images/sangong/rank_sangong.jpg', globalData.fileUrl+'files/images/common/people_bg.png', globalData.fileUrl+'files/images/common/ranking_icon.png'];
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
//新画布
//画布
function canvas222() {
    var target = document.getElementById("ranking");
    html2canvas(target, {
        allowTaint: true,
        taintTest: false,
        onrendered: function(canvas) {
            canvas.id = "mycanvas";
            var dataUrl = canvas.toDataURL('image/jpeg', 0.5);
            $("#end").attr("src", dataUrl);
            $(".end").show();
            $('.ranking').hide();
            newGame();
        }
    });
};

function logMessage(message) {
    console.log(message);
};

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

if (globalData.roomStatus == 4) {

    try {
        var obj = eval('(' + globalData.scoreboard + ')');
        setTimeout(function() {
            socketModule.processLastScoreboard(obj);
        }, 0);
    } catch (error) {
        console.log(error);
        setTimeout(function() {
            socketModule.processLastScoreboard('');
        }, 0);
    }

}

//积分榜
$(function() {
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