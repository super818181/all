var ws;
var game = {
    "room": 0,
    "room_number": globalData.roomNumber,
    "room_url": 0,
    'score': 0,
    "status": 0,
    "time": -1,
    "circle": -1,
    "round": 0,
    "total_num": "",
    "is_play": false,
    "show_card": false,
    "show_coin": false,
    "fish_member": false,
    "user_id":0,
    "user_num":0,
    "waiting_text_show":false,
    "waiting_text":"",
    "fapai":false,
    "qiepai":false,
    "light":0,
    "fapaiNum":0,
    "is_break":false,
    "can_break":false,
    "first_half_cards":[],
};
var error=false;
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
    CreateRoom: "CreateRoom",
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
    CreateRoom: "CreateRoom",
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
    GameHistory: "HistoryScoreboard",
    GameOver: "GameOver",
    BreakRoom: "BreakRoom",
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

var opLimit=false;
var socketModule = {
    closeSocket: function() {
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
                token:globalData.tk
            }
        });
    },
    pGAI: function (obj) {
        var userData = methods.setUserData(obj.data);
        setC('userData',userData);
    },
    gAC: function () {
        socketModule.sendData({
            operation: "getAccountCard",
            data: {
                token:globalData.tk
            }
        });
    },
    pGAC: function (obj) {
        userData.card = obj.data;
        appData.userData.card = obj.data;
    },
    setIndividuality:function(){
        if(appData.inputIndiv.length>6||appData.inputIndiv.length<1){
            appData.individualityError="请输入1-6位英文或数字防伪码";
            appData.isShowIndividualityError=!0;
        } else if(checkIndividuality(appData.inputIndiv)){
            appData.individualityError="";
            socketModule.setIndividuality();
        } else {
            appData.individualityError="请输入1-6位英文或数字防伪码";
            appData.isShowIndividualityError=!0;
        }
    },
    individualityChange:function(){
        if(appData.inputIndiv.length>6){
            appData.inputIndiv=appData.inputIndiv.substring(0,6);
        }
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
    sendGameHistory: function () {
        socketModule.sendData({
            operation: wsOperation.GameHistory,
            data: {
                room_number: globalData.roomNumber, 
				token: globalData.tk
            }
        });
    }, 
    sendShuffleCard: function () {
        socketModule.sendData({
            operation: "ShuffleCard",
            data: {
                room_id: appData.game.room, 
				token: globalData.tk
            }
        });
    },
    sendMoveCard: function (type) {
        socketModule.sendData({
            operation: "MoveCard",
            data: {
                room_id: appData.game.room,
                type:type, 
				token: globalData.tk
            }
        });
    },
    sendThrowChip: function (num,position) {
        socketModule.sendData({
            operation: "ThrowChip",
            data: {
                room_id: appData.game.room,
                chip:num,
                position:position, 
				token: globalData.tk
            }
        });
    },
    sendDealCard: function (type) {
        appData.game.fapai=false;
        socketModule.sendData({
            operation: "DealCard",
            data: {
                room_id: appData.game.room,
                type:type, 
				token: globalData.tk
            }
        });
    },

    sendActiveRoom: function () {
        return 0;
        socketModule.sendData({
            operation: wsOperation.ActiveRoom,
            data: {
                room_number: globalData.roomNumber,
                'ticket_type': appData.createInfo.ticket,
                'score_type': appData.createInfo.baseScore,
                'rule_type': appData.createInfo.timesType,
                'banker_mode': appData.createInfo.banker_mode,
                'banker_score_type': appData.createInfo.banker_score,
				token: globalData.tk
            }
        });
    },
    sendCreateRoom: function () {
        socketModule.sendData({
            operation: wsOperation.CreateRoom,
            data: {
                data_key: Date.parse(new Date()) + randomString(5),
                'ticket_type': appData.createInfo.ticket,
                'score_type': appData.createInfo.baseScore,
                'rule_type': appData.createInfo.timesType,
                'banker_mode': appData.createInfo.banker_mode,
                'banker_score_type': appData.createInfo.banker_score, 
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
    sendGameOver: function () {
        socketModule.sendData({
            operation: wsOperation.GameOver,
            data: {
                room_id: appData.game.room, 
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
    sendGrabBanker: function (multiples) {
        socketModule.sendData({
            operation: wsOperation.GrabBanker,
            data: {
                room_id: appData.game.room,
                is_grab: 1,
                "multiples": multiples,
				token: globalData.tk
            }
        });
    },
    sendNotGrabBanker: function () {
        socketModule.sendData({
            operation: wsOperation.GrabBanker,
            data: {
                room_id: appData.game.room,
                is_grab: 0,
                "multiples": 1, 
				token: globalData.tk
            }
        });
    },
    sendPlayerMultiples: function (times) {
        socketModule.sendData({
            operation: wsOperation.PlayerMultiples,
            data: {
                room_id: appData.game.room,
                multiples: times, 
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
    processGameHistory: function (obj) {
        appData.recordList = [];
        for (var i = 0; i < obj.data.length; i++) {
            appData.recordList.push({
                "time": getLocalTime(obj.data[i].time),
                "scoreboard": obj.data[i].scoreboard,
            })
        }
        appData.isShowRecord = true;
    },
    getScoreBoard: function () {
        socketModule.sendData({
            operation: "getScoreBoard",
            data: {
                room_id: appData.game.room,
                num: globalData.roomNumber,
                type:globalData.gameType, 
				token: globalData.tk
            }
        });
    },
    processGetScoreBoard: function (obj) {
        ws.close();
        clearInterval(appData.heartbeat);
        appData.socketStatus=0;
        if(obj.data.bs==''){
            viewMethods.clickShowAlert(2, '房间已关闭');
        }else{
            socketModule.processLastScoreboard(obj.data.bs,obj.wh);
        }

    },
    processGameRule: function (obj) {
        appData.createInfo.ticket = obj.data.ticket_type;
        appData.createInfo.score_type = obj.data.score_type;
        appData.createInfo.rule_type = obj.data.rule_type;
        appData.createInfo.banker_mode = obj.data.banker_mode;
        appData.createInfo.chip_type = obj.data.chip_type;


        appData.ruleInfo.ticket = obj.data.ticket_type;
        appData.ruleInfo.score_type = obj.data.score_type;
        appData.ruleInfo.rule_type = obj.data.rule_type;
        appData.ruleInfo.banker_mode = obj.data.banker_mode;
        appData.ruleInfo.chip_type = obj.data.chip_type;
        appData.game.total_num = obj.data.total_num;

        if(appData.ruleInfo.banker_mode==2){
            appData.ruleInfo.chip_type=appData.ruleInfo.score_type;
            appData.createInfo.chip_type=appData.createInfo.score_type;
        }
    },
	processPrepareJoinRoom: function (obj) {
        if(obj.data.is_club){
            if(obj.data.is_club==1){
                appData.isShowApply = true;
                appData.applyInfo.club_headimgurl = obj.data.club_headimgurl;
                appData.applyInfo.club_name = obj.data.club_name;
                appData.applyInfo.club_id = obj.data.room_creator;
                // viewMethods.clickShowAlert(1, '无法加入，请联系管理员');
                return;
            }
        }
        if (obj.data.room_status == 4) {
            appData.roomStatus = obj.data.room_status;
            viewMethods.roundEnd();
            return;
        }
        this.processGameRule(obj);

		if (obj.data.room_status == 3) {
			if (appData.isAutoActive) {
				socketModule.sendActiveRoom();
			} else {
				$('.createRoom .mainPart').css('height', '65vh');
				$('.createRoom .mainPart .blueBack').css('height', '46vh');
				appData.createInfo.type = 2;
				appData.createInfo.isShow = true;
			}
			return;
		}

		if (obj.data.user_count == 0) {
			socketModule.sendJoinRoom();
		} else {
			if (obj.data.alert_text != "") {
        appData.isShowGameAlert = true;
        appData.alertType = 4;
        appData.alertText = obj.data.room_users;
				//viewMethods.clickShowAlert(4, obj.data.alert_text);
			} else {
				socketModule.sendJoinRoom();
			}
		}
	},
    processActiveRoom: function (obj) {
        if (appData.isAA == false) {
            if (appData.createInfo.ticket == 2) {
                appData.roomCard = appData.roomCard - 2;
            } else {
                appData.roomCard = appData.roomCard - 1;
            }
        }

        socketModule.sendPrepareJoinRoom();
    },
    processJoinRoom: function (obj) {
        appData.game.room = obj.data.room_id;
        appData.game.room_url = obj.data.room_url;
        appData.game.round = Math.ceil(obj.data.game_num);
        appData.game.total_num = Math.ceil(obj.data.total_num);
        appData.game.status = Math.ceil(obj.data.room_status);
        appData.game.circle = Math.ceil(obj.data.circle);
        appData.game.first_half_cards = obj.data.first_half_cards.concat();
        appData.can_break = obj.data.can_break;

        if(appData.game.circle>2){
            appData.majiangReset=true;
        }
        if(appData.game.circle==3||appData.game.circle==7){
            appData.game.qiepai=true;
        }
        if(appData.game.circle==4||appData.game.circle==8){
            appData.game.fapai=true;
        }

        appData.majiangNum=20;
        appData.majiangList=[];
        if(appData.game.circle>4&&appData.game.circle<9){
            appData.majiangNum=12;
        }
        else if(appData.game.circle>8){
            appData.majiangNum=4;
        }
        else if(appData.game.circle==-1){
            appData.majiangNum=20;
        }
        //	appData.majiangNum=20;
        //	appData.majiangReset=true;
        for (var i = 0; i < 20; i++) {
            appData.majiangList.push({
                num: i + 1,
            });
        }

        if(obj.data.position_info.length>0){
            appData.position_info=obj.data.position_info.concat();
            for(var i=0;i<4;i++){
                appData.position_info[i].card_text=cardText(appData.position_info[i].card_value);
                appData.position_info[i].card_times=parseInt(appData.position_info[i].card_value.substr(0,1));
            }
        }
        appData.game.user_id = userData.account_id;
        resetAllPlayerData();


        if( Math.ceil(obj.data.serial_num)<=4){
            appData.player[0].serial_num = obj.data.serial_num;
            for (var i = 0; i < 4; i++) {
                if (i <= 4 - obj.data.serial_num) {
                    appData.player[i].serial_num = i + Math.ceil(obj.data.serial_num);
                } else {
                    appData.player[i].serial_num = i + Math.ceil(obj.data.serial_num) - 4;
                }
            }
            appData.player[0].account_status = Math.ceil(obj.data.account_status);
            appData.player[0].account_score = Math.ceil(obj.data.account_score);
            appData.player[0].nickname = userData.nickname;
            appData.player[0].headimgurl = userData.avatar;
            appData.player[0].account_id = userData.account_id;
            appData.player[0].ticket_checked = obj.data.ticket_checked;
        }
        appData.scoreboard = obj.data.scoreboard;
    },
    processRefreshRoom: function (obj) {
        //	return 0;
        resetAllPlayerData();

        appData.game.round = Math.ceil(obj.data.game_num);
        appData.game.total_num = Math.ceil(obj.data.total_num);
        appData.game.status = Math.ceil(obj.data.room_status);
        appData.game.circle = Math.ceil(obj.data.circle);
        appData.game.first_half_cards = obj.data.first_half_cards.concat();
        appData.scoreboard = obj.data.scoreboard;
        if(appData.game.circle>2){
            appData.majiangReset=true;
        }
        if(appData.game.circle==3||appData.game.circle==7){
            appData.game.qiepai=true;
        }
        if(appData.game.circle==4||appData.game.circle==8){
            appData.game.fapai=true;
        }

        appData.majiangNum=20;
        appData.majiangList=[];
        if(appData.game.circle>4&&appData.game.circle<9){
            appData.majiangNum=12;
        }
        else if(appData.game.circle>8){
            appData.majiangNum=4;
        }
        else if(appData.game.circle==-1){
            appData.majiangNum=20;
        }
        for (var i = 0; i < 20; i++) {
            appData.majiangList.push({
                num: i + 1,
            });
        }

        if(parseInt(obj.data.serial_num)<=4){
            appData.player[0].serial_num = obj.data.serial_num;
            for (var i = 0; i < 4; i++) {
                if (i <= 4 - obj.data.serial_num) {
                    appData.player[i].serial_num = i + Math.ceil(obj.data.serial_num);
                } else {
                    appData.player[i].serial_num = i + Math.ceil(obj.data.serial_num) - 4;
                }
            }
            appData.player[0].account_status = Math.ceil(obj.data.account_status);
            appData.player[0].account_score = Math.ceil(obj.data.account_score);
            appData.player[0].nickname = userData.nickname;
            appData.player[0].headimgurl = userData.avatar;
            appData.player[0].account_id = userData.account_id;
        }


        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < obj.all_gamer_info.length; j++) {
                if (appData.player[i].serial_num == obj.all_gamer_info[j].serial_num) {
                    appData.player[i].nickname = obj.all_gamer_info[j].nickname;
                    appData.player[i].headimgurl = obj.all_gamer_info[j].headimgurl;
                    appData.player[i].account_id = obj.all_gamer_info[j].account_id;
                    appData.player[i].account_score = Math.ceil(obj.all_gamer_info[j].account_score);
                    appData.player[i].account_status = Math.ceil(obj.all_gamer_info[j].account_status);
                    appData.player[i].online_status = Math.ceil(obj.all_gamer_info[j].online_status);
                    appData.player[i].ticket_checked = Math.ceil(obj.all_gamer_info[j].ticket_checked);

                    if(appData.player[i].account_status==10){
                        appData.player[i].animate=4;
                    }

                    appData.player[i].is_tianmen = false;

                    if (obj.all_gamer_info[j].is_banker == 1) {
                        appData.player[i].is_banker = true;
                        appData.bankerAccountId = obj.all_gamer_info[j].account_id;
                        appData.bankerPlayer = appData.player[i];
                    }
                    else{
                        appData.player[i].is_banker = false;
                    }
                }
            }
        }

        for(var i=0;i<4;i++){
            if(appData.player[i].account_id==0){
                if(Math.ceil(obj.all_gamer_info[0].account_status)<3){
                    appData.player[i].account_status=0;
                }
                else if(Math.ceil(obj.all_gamer_info[0].account_status)>=3&&Math.ceil(obj.all_gamer_info[0].account_status)<6){
                    appData.player[i].account_status=3;
                }
                else if(obj.all_gamer_info[0].account_status==9||obj.all_gamer_info[0].account_status==10){
                    appData.player[i].account_status=9;
                }
                else{
                    appData.player[i].account_status=obj.all_gamer_info[0].account_status;
                }
            }
        }
        var tianmen=-1;
        for(var i=0;i<4;i++){
            if(appData.player[i].is_banker){
                appData.player[(i+2)%4].is_tianmen=true;
                tianmen=(i+2)%4;
            }
        }

        viewMethods.fishTest();
		/*
		 for(var i=4;i<8;i++){
		 if(appData.player[i].account_id==userData.account_id){
		 for(var j=0;j<4;j++){
		 appData.player[j].num=(j+4-tianmen)%4+1;
		 }
		 appData.player.sort(by("num"));

		 }
		 }
		 */
    },
    processMyCards: function (obj) {

    },
    processBreakRoom: function (obj) {
        //	viewMethods.clickShowAlert(9, '庄家分数不足，提前下庄，点击确定查看结算');
        appData.game.is_break=true;
        ws.close();
        if(appData.can_break==1){
            if(appData.player[0].account_id==userData.account_id&&appData.player[0].is_banker){
                chooseBigWinner();
                $(".ranking .rankBack").css("opacity", "1");
                $(".roundEndShow").show();

                setTimeout(function () {
                    $(".ranking").show();
                    canvas();
                }, 100);
            }
            else{
                viewMethods.clickShowAlert(9, '庄家赢得一倍底注，选择提前下庄，点击确定查看结算');
            }
        }
    },
    processAllGamerInfo: function (obj) {
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < obj.data.length; j++) {
                if (appData.player[i].serial_num == obj.data[j].serial_num) {
                    appData.player[i].nickname = obj.data[j].nickname;
                    appData.player[i].headimgurl = obj.data[j].headimgurl;
                    appData.player[i].account_id = obj.data[j].account_id;
                    appData.player[i].account_score = Math.ceil(obj.data[j].account_score);
                    appData.player[i].account_status = Math.ceil(obj.data[j].account_status);
                    appData.player[i].online_status = Math.ceil(obj.data[j].online_status);
                    appData.player[i].ticket_checked = Math.ceil(obj.data[j].ticket_checked);

                    if(appData.player[i].account_status==10){
                        appData.player[i].animate=4;
                    }

                    appData.player[i].is_tianmen = false;

                    if (obj.data[j].is_banker == 1) {
                        appData.player[i].is_banker = true;
                        appData.bankerAccountId = obj.data[j].account_id;
                        appData.bankerPlayer = appData.player[i];
                    }
                    else{
                        appData.player[i].is_banker = false;
                    }
                }
            }
        }

        for(var i=0;i<4;i++){
            if(appData.player[i].account_id==0){
                if(Math.ceil(obj.data[0].account_status)<3){
                    appData.player[i].account_status=0;
                }
                else if(Math.ceil(obj.data[0].account_status)>=3&&Math.ceil(obj.data[0].account_status)<6){
                    appData.player[i].account_status=3;
                }
                else if(obj.data[0].account_status==9||obj.data[0].account_status==10){
                    appData.player[i].account_status=9;
                }
                else{
                    appData.player[i].account_status=obj.data[0].account_status;
                }
            }
        }
        var tianmen=-1;
        for(var i=0;i<4;i++){
            if(appData.player[i].is_banker){
                appData.player[(i+2)%4].is_tianmen=true;
                tianmen=(i+2)%4;
            }
        }

        viewMethods.fishTest();
		/*
		 for(var i=4;i<8;i++){
		 if(appData.player[i].account_id==userData.account_id){
		 for(var j=0;j<4;j++){
		 appData.player[j].num=(j+4-tianmen)%4+1;
		 }
		 appData.player.sort(by("num"));

		 }
		 }
		 */
        for(var i=0;i<8;i++){
            if(appData.player[i].account_id==userData.account_id){
                appData.game.user_num=i;
            }
        }


        if (appData.scoreboard != "") {
            for (var i = 0; i < 8; i++) {
                for (s in appData.scoreboard) {
                    if (appData.player[i].account_id == s) {
                        appData.playerBoard.score[i].num = appData.player[i].num;
                        appData.playerBoard.score[i].account_id = appData.player[i].account_id;
                        appData.playerBoard.score[i].nickname = appData.player[i].nickname;
                        appData.playerBoard.score[i].account_score = Math.ceil(appData.scoreboard[s]);

                        if(appData.player[i].is_banker&&appData.ruleInfo.banker_mode==2){
                            if(appData.ruleInfo.score_type==1){
                                appData.playerBoard.score[i].account_score=appData.playerBoard.score[i].account_score-100;
                            }
                            else if(appData.ruleInfo.score_type==2){
                                appData.playerBoard.score[i].account_score=appData.playerBoard.score[i].account_score-300;
                            }
                            else if(appData.ruleInfo.score_type==3){
                                appData.playerBoard.score[i].account_score=appData.playerBoard.score[i].account_score-500;
                            }
                        }
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

        if (appData.player[0].account_status == 6) {
            appData.isFinishBankerAnimate = true;
        }
    },
    processUpdateGamerInfo: function (obj) {
        for (var i = 0; i < 8; i++) {
            if (appData.player[i].serial_num == obj.data.serial_num) {
                appData.player[i].nickname = obj.data.nickname;
                appData.player[i].headimgurl = obj.data.headimgurl;
                appData.player[i].account_id = obj.data.account_id;
                appData.player[i].account_score = Math.ceil(obj.data.account_score);
                //	appData.player[i].account_status = Math.ceil(obj.data.account_status);
                appData.player[i].online_status = Math.ceil(obj.data.online_status);
                appData.player[i].ticket_checked = Math.ceil(obj.data.ticket_checked);
            } else {
                if (appData.player[i].account_id == obj.data.account_id) {
                    socketModule.sendRefreshRoom();
                }
            }
        }
        viewMethods.fishTest();
    },

    processUpdateAccountStatus: function (obj) {
        for (var i = 0; i < 8; i++) {
            if (appData.player[i].account_id == obj.data.account_id) {
                appData.player[i].online_status = obj.data.online_status;
                appData.player[i].account_status = Math.ceil(obj.data.account_status);

                if (obj.data.online_status == 0 && appData.player[i].ticket_checked == 0) {
                    appData.player[i].account_id = 0;
                    appData.player[i].nickname = "";
                    appData.player[i].headimgurl = "";
                    appData.player[i].account_score = 0;
                    viewMethods.fishTest();
                }
                else if (obj.data.online_status == 0 && appData.player[i].ticket_checked == 1) {
                    appData.player[i].online_status = 0;
                } else {
                    logMessage("~~~~~~~!!!!!!" + obj);
                }

                if(appData.player[i].ticket_checked==0 && (appData.player[i].account_status == 4 || appData.player[i].account_status == 5)){
                    appData.player[i].ticket_checked=1;
                    if(appData.player[i].account_id == userData.account_id && appData.isAA){
                        appData.roomCard = appData.roomCard - appData.ruleInfo.ticket;
                    }

                }

                if (i != 0) {
                    if (appData.player[i].account_status == 4) {
                        setTimeout(function () {
                            mp3AudioPlay("audioNoBanker");
                        }, 100);
                    } else if (appData.player[i].account_status == 5) {
                        setTimeout(function () {
                            mp3AudioPlay("audioRobBanker");
                        }, 100);
                    }
                }
                break;
            }
        }
    },
    processUpdateAccountShow: function (obj) {
        var num=parseInt(obj.data.seat_index)
        setTimeout(function () {
            if(appData.position_info[num].card_value==29900||appData.position_info[num].card_value==30000){
                m4aAudioPlay("28gang");
            }
            else if (parseInt(appData.position_info[num].card_times)>2) {
                m4aAudioPlay("duizi");
                //播放音频  对子
            }
            else{
                m4aAudioPlay(appData.position_info[num].card_value.substr(1,2));
                //播放音频  点数 parseInt(appData.position_info[num].card_value.substr(1,2))
            }
        }, 50);
        for(var i=0;i<4;i++){
            if(appData.player[i].serial_num==num+1){
                appData.player[i].account_status=10;
                if(i==0&&appData.player[0].account_id==userData.account_id){
                    viewMethods.waitingTextChange();
                }
                viewMethods.seeAllCard(i);
                break;
            }
        }

    },

    processStartLimitTime: function (obj) {
        if (obj.data.limit_time > 1) {
            appData.game.time = Math.ceil(obj.data.limit_time);
            viewMethods.waitingTextChange();
            viewMethods.timeCountDown();
        }
    },
    processCancelStartLimitTime: function (obj) {
        appData.game.time = -1;
    },


    processGameStart: function (obj){
        appData.game.status = 2;
        appData.game.time = Math.ceil(obj.limit_time);
        //	appData.game.round = Math.ceil(obj.game_num);
        //	appData.game.round = 1;
        for (var i = 0; i < 8; i++) {
            appData.player[i].is_operation = false;
            for (var j = 0; j < obj.data.length; j++) {
                if (appData.player[i].account_id == obj.data[j].account_id) {
                    if (appData.player[i].ticket_checked == 0 && appData.player[i].account_id == userData.account_id  && appData.isAA) {
                        appData.roomCard = appData.roomCard - appData.ruleInfo.ticket;
                    }
                    appData.player[i].ticket_checked = 1;
                    appData.player[i].account_status = Math.ceil(obj.data[j].account_status);
                    appData.player[i].online_status = Math.ceil(obj.data[j].online_status);
                }
            }
        }
        viewMethods.waitingTextChange();
        viewMethods.timeCountDown();
    },
    processNotyShuffle: function (obj){
        viewMethods.ticketDelete();
        var banker=-1;
        for(var i=0;i<4;i++){
            if(appData.player[i].is_banker){
                banker=1;
                appData.game.round = appData.game.round +1;
            }
        }
        appData.game.timeTemp = parseInt(obj.limit_time);
        if(banker==1){
            for(var i=0;i<4;i++){
                appData.player[i].account_status=6;
                if(appData.player[i].is_tianmen&&appData.game.user_id==appData.player[i].account_id){
                    opLimit=false;
                    viewMethods.xiPai();
                }
            }

            return 0;
            if(appData.game.timeTemp==10){
                appData.game.time = 11;
                viewMethods.waitingTextChange();
                viewMethods.timeCountDown();
            }

        }

        appData.bankerArray = [];
        for(var i=0;i<4;i++){
            if(appData.player[i].account_status==5){
                appData.bankerArray.push(appData.player[i].account_id);
            }
            if(obj.data.banker_id==appData.player[i].account_id){
                banker=2;
                appData.tianmenAccountId=appData.player[(i+2)%4].account_id;
            }
            appData.player[i].account_status=6;
        }

        var move=false;
        for(var i=0;i<appData.bankerArray.length;i++){
            if(move){
                appData.bankerArray.unshift(appData.bankerArray[i]);
                appData.bankerArray.splice(i+1,1);
            }
            if(appData.bankerArray[i]==appData.player[banker].account_id){
                move=true;
            }
        }
        appData.bankerAnimateIndex = 0;
        appData.bankerAccountId=obj.data.banker_id;

        appData.game.time = -1;

        viewMethods.clearBanker();
        viewMethods.robBankerAnimate();
    },
    processShufflingCard: function (obj){
        appData.majiangReset=false;
        appData.animate.animate1=0
        appData.majiangNum=20;

        viewMethods.xiPaiMove();
    },

    processMovingCard: function (obj){
        var type=obj.data.type;
        var time=300;
        if(appData.majiangNum==12)
            time=100;
        appData.majiangMoving=true;

        setTimeout(function(){
            if(type==1){
                $(".cardList .majiangMoving .card1").css("z-index","11");
                $(".cardList .majiangMoving .card1").eq(0)
                    .animate({"marginBottom":"7vh"},200,"linear")
                    .animate({"marginBottom":"9.5vh","marginLeft":"3vh"},80,"linear")
                    .animate({"marginBottom":"10vh","marginLeft":"7vh"},80,"linear")
                    .animate({"marginLeft":2*(appData.majiangNum)-6+"vh"},time,"linear")
                    .animate({"marginBottom":"9.5vh","marginLeft":2*(appData.majiangNum)-2+"vh"},50,"linear")
                    .animate({"marginBottom":"8vh","marginLeft":2*(appData.majiangNum)+"vh"},50,"linear")
                    .animate({"marginBottom":"0"},200)

                $(".cardList .majiangMoving .card1").eq(1)
                    .animate({"marginBottom":"7vh"},200,"linear")
                    .animate({"marginBottom":"9.5vh","marginLeft":"3vh"},80,"linear")
                    .animate({"marginBottom":"10vh","marginLeft":"7vh"},80,"linear")
                    .animate({"marginLeft":2*(appData.majiangNum)-6+"vh"},time,"linear")
                    .animate({"marginBottom":"9.5vh","marginLeft":2*(appData.majiangNum)-2+"vh"},50,"linear")
                    .animate({"marginBottom":"8vh","marginLeft":2*(appData.majiangNum)+"vh"},50,"linear")
                    .animate({"marginBottom":"0"},200,"linear",function(){
                        for(var i=0;i<appData.majiangNum/2;i++){
                            $(".cardList .majiangMoving .cardUp").eq(i).animate({"left":"1vh"},200);
                            $(".cardList .majiangMoving .cardDown").eq(i).animate({"left":"1vh"},200);
                        }
                        setTimeout(function(){
                            appData.majiangMoving=false;
                        },250)
                    })
            }

            else if(type==2){
                $(".cardList .majiangMoving .card2").css("z-index","11");
                $(".cardList .majiangMoving .card3").css("z-index","11");

                $(".cardList .majiangMoving .card2")
                    .animate({"marginBottom":"7vh"},200,"linear")
                    .animate({"marginBottom":"9.5vh","marginLeft":"7vh"},80,"linear")
                    .animate({"marginBottom":"10vh","marginLeft":"11vh"},80,"linear")
                    .animate({"marginLeft":2*(appData.majiangNum)-6+"vh"},time,"linear")
                    .animate({"marginBottom":"9.5vh","marginLeft":2*(appData.majiangNum)-2+"vh"},50,"linear")
                    .animate({"marginBottom":"8vh","marginLeft":2*(appData.majiangNum)+"vh"},50,"linear")
                    .animate({"marginBottom":"0"},200,"linear");

                $(".cardList .majiangMoving .card3").eq(0)
                    .animate({"marginBottom":"7vh"},200,"linear")
                    .animate({"marginBottom":"9.5vh","marginLeft":"11vh"},80,"linear")
                    .animate({"marginBottom":"10vh","marginLeft":"15vh"},80,"linear")
                    .animate({"marginLeft":2*(appData.majiangNum+2)-6+"vh"},time,"linear")
                    .animate({"marginBottom":"9.5vh","marginLeft":2*(appData.majiangNum+2)-2+"vh"},50,"linear")
                    .animate({"marginBottom":"8vh","marginLeft":2*(appData.majiangNum+2)+"vh"},50,"linear")
                    .animate({"marginBottom":"0"},200,"linear");

                $(".cardList .majiangMoving .card3").eq(1)
                    .animate({"marginBottom":"7vh"},200,"linear")
                    .animate({"marginBottom":"9.5vh","marginLeft":"11vh"},80,"linear")
                    .animate({"marginBottom":"10vh","marginLeft":"15vh"},80,"linear")
                    .animate({"marginLeft":2*(appData.majiangNum+2)-6+"vh"},time,"linear")
                    .animate({"marginBottom":"9.5vh","marginLeft":2*(appData.majiangNum+2)-2+"vh"},50,"linear")
                    .animate({"marginBottom":"8vh","marginLeft":2*(appData.majiangNum+2)+"vh"},50,"linear")
                    .animate({"marginBottom":"0"},200,"linear",function(){
                        for(var i=1;i<appData.majiangNum/2;i++){
                            $(".cardList .majiangMoving .cardUp").eq(i).animate({"left":"-3vh"},200);
                            $(".cardList .majiangMoving .cardDown").eq(i).animate({"left":"-3vh"},200);
                        }
                        setTimeout(function(){
                            appData.majiangMoving=false;
                        },250)
                    })
            }


            else if(type==3){
                var num1=appData.majiangNum/2-2;
                var num2=appData.majiangNum/2-1;
                $(".cardList .majiangMoving .card"+num1).css("z-index","11");
                $(".cardList .majiangMoving .card"+num2).css("z-index","11");
                $(".cardList .majiangMoving .card"+num2)
                    .animate({"marginBottom":"7vh"},200,"linear")
                    .animate({"marginBottom":"9.5vh","marginLeft":2*(appData.majiangNum-4)-2+"vh"},80,"linear")
                    .animate({"marginBottom":"10vh","marginLeft":2*(appData.majiangNum-4)-6+"vh"},80,"linear")
                    .animate({"marginLeft":"2vh"},time,"linear")
                    .animate({"marginBottom":"9.5vh","marginLeft":"-2vh"},50,"linear")
                    .animate({"marginBottom":"8vh","marginLeft":"-4vh"},50,"linear")
                    .animate({"marginBottom":"0"},200,"linear");


                $(".cardList .majiangMoving .card"+num1).eq(0)
                    .animate({"marginBottom":"7vh"},200,"linear")
                    .animate({"marginBottom":"9.5vh","marginLeft":2*(appData.majiangNum-6)-2+"vh"},80,"linear")
                    .animate({"marginBottom":"10vh","marginLeft":2*(appData.majiangNum-6)-6+"vh"},80,"linear")
                    .animate({"marginLeft":"-2vh"},time,"linear")
                    .animate({"marginBottom":"9.5vh","marginLeft":"-6vh"},50,"linear")
                    .animate({"marginBottom":"8vh","marginLeft":"-8vh"},50,"linear")
                    .animate({"marginBottom":"0"},200,"linear");

                $(".cardList .majiangMoving .card"+num1).eq(1)
                    .animate({"marginBottom":"7vh"},200,"linear")
                    .animate({"marginBottom":"9.5vh","marginLeft":2*(appData.majiangNum-6)-2+"vh"},80,"linear")
                    .animate({"marginBottom":"10vh","marginLeft":2*(appData.majiangNum-6)-6+"vh"},80,"linear")
                    .animate({"marginLeft":"-2vh"},time,"linear")
                    .animate({"marginBottom":"9.5vh","marginLeft":"-6vh"},50,"linear")
                    .animate({"marginBottom":"8vh","marginLeft":"-8vh"},50,"linear")
                    .animate({"marginBottom":"0"},200,"linear",function(){
                        for(var i=appData.majiangNum/2-2;i>=0;i--){
                            $(".cardList .majiangMoving .cardUp").eq(i).animate({"left":"13vh"},200);
                            $(".cardList .majiangMoving .cardDown").eq(i).animate({"left":"13vh"},200);
                        }
                        setTimeout(function(){
                            appData.majiangMoving=false;
                        },250)
                    })
            }
            else if(type==4){
                $(".cardList .majiangMoving .card1").eq(1).css("z-index","11");
                $(".cardList .majiangMoving .card1").eq(1)
                    .animate({"marginBottom":"6vh"},200,"linear")
                    .animate({"marginBottom":"8.5vh","marginLeft":"3vh"},80,"linear")
                    .animate({"marginBottom":"9vh","marginLeft":"7vh"},80,"linear")
                    .animate({"marginLeft":2*(appData.majiangNum-2)+"vh"},300,"linear",function(){
                        for(var i=1;i<appData.majiangNum/2;i++){
                            $(".cardList .majiangMoving .cardUp").eq(i).animate({"left":"1vh"},200);
                        }
                    })
                    .animate({"marginBottom":"0"},350,"linear",function(){
                        appData.majiangMoving=false;
                    });
            }
        },10)
    },
    processStartBet: function (obj){
        appData.coinNum=0;
        appData.game.time = -1;
        appData.coinArea=0;
        for(var i=0;i<8;i++){
            appData.player[i].account_status=-1;
        }
        setTimeout(function(){
            for(var i=0;i<4;i++){
                appData.player[i].account_status=7;
            }
            appData.game.qiepai = true;
            appData.game.time = Math.ceil(obj.limit_time);
            viewMethods.waitingTextChange();
            viewMethods.timeCountDown();
        },1500)
    },
    processUpdateAccountChip: function (obj){
        for(var i=0;i<8;i++){
            if(appData.player[i].ticket_checked==0&&appData.player[i].account_id==obj.data.account_id){
                appData.player[i].ticket_checked = 1;
                if(appData.player[i].account_id == userData.account_id  && appData.isAA)
                    appData.roomCard = appData.roomCard - appData.ruleInfo.ticket;
            }
        }

        if(obj.data.account_id==userData.account_id){
            appData.position_info[parseInt(obj.data.position)].chip.my_bet=parseInt(obj.data.chip);
        }
        appData.position_info[parseInt(obj.data.position)].chip.total=parseInt(appData.position_info[parseInt(obj.data.position)].chip.total)+parseInt(obj.data.chip);

        if(appData.player[0].is_banker){
            for(var i=0;i<4;i++){
                if(appData.player[i].serial_num == parseInt(obj.data.position)+1)
                    viewMethods.throwCoin(appData.player[i].num,obj.data.chip)
            }
        }
    },

    processNotyDealCard: function (obj){
        appData.game.qiepai=false;
        appData.game.time=-1;
        setTimeout(function(){
            for(var i=0;i<4;i++){
                appData.player[i].account_status=8;
            }
            appData.game.fapai = true;
            appData.game.time = Math.ceil(obj.limit_time);
            viewMethods.waitingTextChange();
            viewMethods.timeCountDown();
        },1500)
    },
    processDealingCard: function (obj){
        appData.game.circle=5;
        appData.game.fapai=false;
        appData.game.fapaiNum=0;
        viewMethods.dice(parseInt(obj.data.dice_a),parseInt(obj.data.dice_b),obj.data.type);
    },
    processStartShow: function (obj) {
        for(var i=0;i<4;i++){
            if(obj.data[i].card_info.length==0)
                error=true;
            appData.position_info[i].card_info=obj.data[i].card_info.concat();
            appData.position_info[i].card_value=obj.data[i].card_value;
            appData.position_info[i].card_text=cardText(obj.data[i].card_value);
            appData.position_info[i].card_times=parseInt(obj.data[i].card_value.substr(0,1));
        }
        appData.game.time=-1;
        appData.game.waiting_text_show=false;
        appData.game.timeTemp = parseInt(obj.limit_time);

    },

    processBroadcastVoice: function (obj) {
        for (var i = 0; i < 8; i++) {
            if (appData.player[i].account_id == obj.data.account_id && obj.data.account_id != userData.account_id) {
                m4aAudioPlay("message" + obj.data.voice_num);
                viewMethods.messageSay(i, obj.data.voice_num);
            }
        }
    },

    processWin: function (obj) {
        appData.game.is_play = false;
        appData.game.round = Math.ceil(obj.data.game_num);
        appData.game.total_num = Math.ceil(obj.data.total_num);
        appData.playerBoard.round = Math.ceil(obj.data.game_num);
        appData.isBreak = Math.ceil(obj.data.is_break);
        appData.can_break = Math.ceil(obj.data.can_break);
        viewMethods.showMemberScore(false);


        for (var i = 0; i < 4; i++) {
            appData.player[i].account_status = 10;
            if(appData.player[i].animate==0){
                viewMethods.seeAllCard(i);
            }
        }

        appData.game.time = -1;
        setTimeout(function () {
            for(var i=0;i<4;i++){
                appData.player[i].account_status=1;
            }
            viewMethods.winAnimate(obj);
        }, 3e3);

        if(appData.game.round==appData.game.game_num&&appData.majiangNum==4){
            appData.game.is_break=true;
            ws.close();
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
    showHomeAlert: function() {
        appData.isShowHomeAlert = true;
    },
    test: function () {

        return 0;
        appData.game.is_break=true;
        ws.close()
        return 0;
		/*	appData.game.fapaiNum=0;
		 viewMethods.lightRun(0,400,3,4);
		 return 0;
		 var obj={
		 data:{
		 /*	balance_scoreboard:{2: "200", 3: "-200"},
		 score_board:{
		 2: "1300", 3: "-300"
		 }*/
        //			type:2
        //		}
        //	}
        //	socketModule.processMovingCard(obj);
        socketModule.sendRefreshRoom();

        //	return 0;
        var obj={
            data:{
                score_board:{
                    2: "1780", 3: "0", 4: "-240", 5: "-540",6:"0"
                }

            }
        }
        viewMethods.gameOverNew(obj.data.score_board);
        //	viewMethods.faPaiMove(1);
        //	viewMethods.qiePai(2);
        //	viewMethods.xiPai();
        return 0;
        socketModule.sendData({
            operation: "NotySecondHalf",
            account_id: userData.account_id,
            data: {
                room_id: appData.game.room,
            }
        });
    },
    test1: function () {
        return 0;
        viewMethods.dice(1,2,3);
        return 0;
        var obj={
            data:{
				/*	balance_scoreboard:{2: "200", 3: "-200"},
				 score_board:{
				 2: "1300", 3: "-300"
				 }*/
                type:3
            }
        }
        socketModule.processMovingCard(obj);
        //	viewMethods.gameOverNew(obj.data.score_board, obj.data.balance_scoreboard);
    },

    throwCoin: function(num, score) {
        $(".scorePlace"+num).append("<div class='coin coin" + appData.coinNum + "  coinType" + score + "' ></div>");
        $(".coin" + appData.coinNum).animate({marginLeft: 0 ,marginTop: 0 ,top:30+(30* Math.random())+"%",left:68* Math.random()+"%"}, 300);
        appData.coinNum++;
    },

    quitCommit: function () {
        viewMethods.clickShowAlert(8,"是否确认下庄，下庄将提前结束游戏");
    },
    fishTest: function () {
        appData.game.fish_member=false;
        for(var i=4;i<8;i++){
            if(appData.player[i].account_id>0){
                appData.game.fish_member=true;
                break;
            }
        }
    },
    ticketDelete: function () {
        for(var i=0;i<8;i++){
            if(appData.player[i].ticket_checked==0&&appData.player[i].account_id>0){
                appData.player[i].ticket_checked=1;
                if(appData.player[i].account_id == userData.account_id && appData.isAA)
                    appData.roomCard = appData.roomCard - appData.ruleInfo.ticket;
            }
        }
    },
    cardTest: function () {

    },
    lightRun:function(num,time,finalNum,type){
        //	console.log(appData.game.light,finalNum);
        setTimeout(function(){
            if(appData.game.light<4)
                appData.game.light++;
            else
                appData.game.light=1;
            num++;
            if(num>8){
                time=time+50;
                if(num>10&&num%4==(finalNum+1)%4){

                    $(".fapaikuang1").eq(finalNum).animate({
                        top: "4%",
                        left: "4%",
                        width: "94%",
                        height: "94%"
                    }, 400, function () {
                        $(".fapaikuang1").eq(finalNum).animate({
                            top: "10%",
                            left: "10%",
                            width: "82%",
                            height: "82%"
                        }, 400);
                    });

                    $(".fapaikuang").eq(finalNum).animate({
                        top: "-4%",
                        left: "-4%",
                        width: "106%",
                        height: "106%"
                    }, 400, function () {
                        $(".fapaikuang").eq(finalNum).animate({
                            top: "10%",
                            left: "10%",
                            width: "82%",
                            height: "82%"
                        }, 400, function () {
                            setTimeout(function(){appData.game.light=0;},500)
                            appData.game.fapaiNum=0;
                            viewMethods.faPaiMove(type,finalNum)
                        })
                    })
                    return 0;
                }
            }
            else{
                if(time>200)
                    time=time-50;
            }
            viewMethods.lightRun(num,time,finalNum,type);
        },time)
    },
    dice:function(num1,num2,type){
        console.log(num1,num2)
        appData.dice.dice1=1;
        appData.dice.dice2=1;
        appData.dice.status=1;
        setTimeout(function(){
            appData.dice.dice1=num1;
            appData.dice.status=2;
            setTimeout(function(){
                appData.dice.dice2=num2;
                appData.dice.status=3;
                setTimeout(function(){
                    appData.dice.status=0;
                    for(var i=0;i<4;i++){
                        if(appData.player[i].is_banker){
                            viewMethods.faPaiMove(type,(i+((num1+num2-1)%4))%4);
                        }
                    }
                },1000)
            },1200)
        },800)

    },

    positionChange: function (type) {
        if(type==1){
            $(".member1").animate({"bottom":"8vh","left":"1vh","marginLeft":"0"},500);
            $(".member2").animate({"bottom":"52vh","left":"100%","marginLeft":"-11vh"},500);
            $(".member3").animate({"bottom":"72vh","left":"50%","marginLeft":"-11vh"},500);
            $(".member4").animate({"bottom":"52vh","left":"1vh","marginLeft":"0"},500);
        }
        else if(type==2){
            $(".member2").animate({"bottom":"8vh","left":"1vh","marginLeft":"0"},500);
            $(".member3").animate({"bottom":"52vh","left":"100%","marginLeft":"-11vh"},500);
            $(".member4").animate({"bottom":"72vh","left":"50%","marginLeft":"-11vh"},500);
            $(".member1").animate({"bottom":"52vh","left":"1vh","marginLeft":"0"},500,function(){
                $(".member1").animate({"bottom":"8vh","left":"1vh","marginLeft":"0"},500);
                $(".member2").animate({"bottom":"52vh","left":"100%","marginLeft":"-11vh"},500);
                $(".member3").animate({"bottom":"72vh","left":"50%","marginLeft":"-11vh"},500);
                $(".member4").animate({"bottom":"52vh","left":"1vh","marginLeft":"0"},500);
            });
        }
        else if(type==3){
            $(".member1").animate({"bottom":"8vh","left":"1vh","marginLeft":"0"},500);
            $(".member2").animate({"bottom":"52vh","left":"100%","marginLeft":"-11vh"},500);
            $(".member3").animate({"bottom":"72vh","left":"50%","marginLeft":"-11vh"},500);
            $(".member4").animate({"bottom":"52vh","left":"1vh","marginLeft":"0"},500);
        }
    },
    positionSort:function(){
        return;
        if(appData.ruleInfo.banker_mode==1){
            return;
        }
        for(var i=0;i<4;i++){
            if(appData.player[i].is_tianmen){
                for(var j=0;j<4;j++){
                    appData.player[j].num=(j+4-i)%4+1;
                }
                appData.player.sort(by("num"));
                appData.bankerPlayer=appData.player[2];
                if(i==1){
                    $(".member4").css("bottom","8vh");$(".member4").css("left","1vh");$(".member4").css("marginLeft","0");
                    $(".member1").css("bottom","52vh");$(".member1").css("left","100%");$(".member1").css("marginLeft","-11vh");
                    $(".member2").css("bottom","72vh");$(".member2").css("left","50%");$(".member2").css("marginLeft","-11vh");
                    $(".member3").css("bottom","52vh");$(".member3").css("left","1vh");$(".member3").css("marginLeft","0");
                }
                else if(i==2){
                    $(".member3").css("bottom","8vh");$(".member3").css("left","1vh");$(".member3").css("marginLeft","0");
                    $(".member4").css("bottom","52vh");$(".member4").css("left","100%");$(".member4").css("marginLeft","-11vh");
                    $(".member1").css("bottom","72vh");$(".member1").css("left","50%");$(".member1").css("marginLeft","-11vh");
                    $(".member2").css("bottom","52vh");$(".member2").css("left","1vh");$(".member2").css("marginLeft","0");
                }
                else if(i==3){
                    $(".member2").css("bottom","8vh");$(".member2").css("left","1vh");$(".member2").css("marginLeft","0");
                    $(".member3").css("bottom","52vh");$(".member3").css("left","100%");$(".member3").css("marginLeft","-11vh");
                    $(".member4").css("bottom","72vh");$(".member4").css("left","50%");$(".member4").css("marginLeft","-11vh");
                    $(".member1").css("bottom","52vh");$(".member1").css("left","1vh");$(".member1").css("marginLeft","0");
                }
                viewMethods.positionChange(i);
                break;
            }
        }
    },
    showCoinArea: function (num){
        appData.coinArea=num;
    },
    hideCoinArea: function () {
        appData.coinArea=0;
    },
    selectCoin: function (num) {
        if(opLimit){
            return;
        }
        opLimit=true;
        setTimeout(function(){opLimit=false;},500)
        for(var i=0;i<4;i++){
            if(appData.coinArea==appData.player[i].num){
                socketModule.sendThrowChip(num,Math.ceil(appData.player[i].serial_num)-1);
            }
        }
        appData.coinArea=0;
    },
    seeMyCard: function (num) {
        if(appData.player[0].account_id!=userData.account_id&&appData.player[0].account_status==9){
            return 0;
        }
        if(num==1){
            appData.animate.majiang1=1;
            setTimeout(function(){
                appData.animate.majiang1=2;
                setTimeout(function(){
                    appData.animate.majiang1=3;
                    setTimeout(function(){
                        appData.animate.majiang1=4;
                        if(appData.animate.majiang2==4){
                            appData.player[0].animate=4;
                        }
                    },80)
                },80)
            },80)
        }
        else if(num==2){
            appData.animate.majiang2=1;
            setTimeout(function(){
                appData.animate.majiang2=2;
                setTimeout(function(){
                    appData.animate.majiang2=3;
                    setTimeout(function(){
                        appData.animate.majiang2=4;
                        if(appData.animate.majiang1==4){
                            appData.player[0].animate=4;
                        }
                    },80)
                },80)
            },80)
        }
    },
    seeAllCard: function (num) {
        if(num!=0){
            appData.player[num].animate=1;
            setTimeout(function(){
                appData.player[num].animate=2;
                setTimeout(function(){
                    appData.player[num].animate=3;
                    setTimeout(function(){
                        appData.player[num].animate=4;
                    },100)
                },100)
            },100)
        }
        else{
            if(appData.player[0].animate!=4){
                if(appData.player[0].account_id!=userData.account_id){
                    viewMethods.seeMyCard(1);
                    viewMethods.seeMyCard(2);
                }
                else{
                    if(appData.animate.majiang1!=4)
                        viewMethods.seeMyCard(1);
                    if(appData.animate.majiang2!=4)
                        viewMethods.seeMyCard(2);
                    var num=parseInt(appData.player[0].serial_num)-1;
                    setTimeout(function () {
                        if(appData.position_info[num].card_value==29900||appData.position_info[num].card_value==30000){
                            m4aAudioPlay("28gang");
                        }
                        else if (parseInt(appData.position_info[num].card_times)>2) {
                            m4aAudioPlay("duizi");
                            //播放音频  对子
                        }
                        else{
                            m4aAudioPlay(appData.position_info[num].card_value.substr(1,2));
                            //播放音频  点数 parseInt(appData.position_info[num].card_value.substr(1,2))
                        }
                    }, 50);

                }
            }
        }

    },
    showCard: function () {
        socketModule.sendShowCard();
    },
    xiPai: function () {
        console.log("x")
        if(opLimit){
            return;
        }
        opLimit=true;
        setTimeout(function(){opLimit=false;},500)
        socketModule.sendShuffleCard();
    },
    xiPaiMove: function () {
        if(appData.animate.animate1<10&&appData.animate.animate1>=0){
            //		console.log(appData.animate.animate1);
            appData.animate.animate1=appData.animate.animate1+2;
            setTimeout(function(){
                viewMethods.xiPaiMove();
            },400)
        }
        else{
            appData.animate.animate1=-1;
            appData.majiangReset=true;
        }
    },
    faPai:function(type){
        if(opLimit){
            return;
        }
        opLimit=true;
        setTimeout(function(){opLimit=false;},500)
        socketModule.sendDealCard(type);
    },
    faPaiMove: function (type,startPosition) {
        if(appData.game.fapaiNum==4){
            viewMethods.faPaiEnd(type);
            return 0;
        }
        else if(appData.game.fapaiNum==0){
            $(".member .majiangTemp .outer").css("width","4vh");
        }
        appData.game.fapaiNum=appData.game.fapaiNum+1;
        var num,num1,num2,num3,num4,x1,x2,x3,x4,length,left;
        length=appData.majiangNum/2;
        if(type==1){
            num1=1;
            num2=2;
            num3=3;
            num4=4;
            x1=.2;
            x2=.16;
            x3=.12;
            x4=.08;
        }
        else if(type==2){
            num4=1;
            num3=2;
            num2=3;
            num1=4;
            x4=.2;
            x3=.16;
            x2=.12;
            x1=.08;
        }
        else if(type==3){
            num1=length;
            num2=length-1;
            num3=length-2;
            num4=length-3;
            x1=-.16;
            x2=-.12;
            x3=-.08;
            x4=-.04;
        }
        else if(type==4){
            num4=length;
            num3=length-1;
            num2=length-2;
            num1=length-3;
            x4=-.16;
            x3=-.12;
            x2=-.08;
            x1=-.04;
        }
        if(length==6){
            if(type==1||type==2){
                x4=x4-0.08;
                x3=x3-0.08;
                x2=x2-0.08;
                x1=x1-0.08;
            }
            else if(type==3||type==4){
                x4=x4+0.08;
                x3=x3+0.08;
                x2=x2+0.08;
                x1=x1+0.08;
            }
        }

        if(appData.game.fapaiNum==1){
            num=num1;
            left=.5*width-(x1*height);
        }
        else if(appData.game.fapaiNum==2){
            num=num2;
            left=.5*width-(x2*height);
        }
        else if(appData.game.fapaiNum==3){
            num=num3;
            left=.5*width-(x3*height);
        }
        else if(appData.game.fapaiNum==4){
            num=num4;
            left=.5*width-(x4*height);
        }

        appData.majiangMoving=true;

        if(startPosition==0){
            setTimeout(function(){
                $(".cardList .majiangMoving .card"+num).hide();
            },10)
            $(".member1 .majiangTemp").show();
            $(".member1 .majiangTemp .outer").css("margin-left",(.11*height)-(.5*width)+left+"px");
            $(".member1 .majiangTemp .outer").css("margin-bottom","28.5vh");
            $(".member1 .majiangTemp .outer").eq(0).animate({"width":"8vh","marginBottom":0,"marginLeft":0},400);
            $(".member1 .majiangTemp .outer").eq(1).animate({"width":"8vh","marginBottom":0,"marginLeft":0},400,function(){
                viewMethods.faPaiMove(type,(parseInt(startPosition)+1)%4);
            })
        }
        else if(startPosition==1){
            setTimeout(function(){
                $(".cardList .majiangMoving .card"+num).hide();
            },10)
            $(".member2 .majiangTemp").show();
            $(".member2 .majiangTemp .outer").css("margin-right",(-.15*height+width)-left+"px");
            $(".member2 .majiangTemp .outer").css("margin-bottom","-15.8vh");
            $(".member2 .majiangTemp .outer").eq(0).animate({"width":"4.3vh","marginBottom":0,"marginRight":0},400);
            $(".member2 .majiangTemp .outer").eq(1).animate({"width":"4.3vh","marginBottom":0,"marginRight":0},400,function(){
                viewMethods.faPaiMove(type,(parseInt(startPosition)+1)%4);
            })
        }
        else if(startPosition==2){
            setTimeout(function(){
                $(".cardList .majiangMoving .card"+num).hide();
            },10)
            $(".member3 .majiangTemp").show();
            $(".member3 .majiangTemp .outer").css("margin-left",(.01*height)-(.5*width)+left+"px");
            $(".member3 .majiangTemp .outer").css("margin-bottom","-35.8vh");
            $(".member3 .majiangTemp .outer").eq(0).animate({"width":"4.3vh","marginBottom":0,"marginLeft":0},400);
            $(".member3 .majiangTemp .outer").eq(1).animate({"width":"4.3vh","marginBottom":0,"marginLeft":0},400,function(){
                viewMethods.faPaiMove(type,(parseInt(startPosition)+1)%4);
            })
        }
        else if(startPosition==3){
            setTimeout(function(){
                $(".cardList .majiangMoving .card"+num).hide();
            },10)
            $(".member4 .majiangTemp").show();
            $(".member4 .majiangTemp .outer").css("margin-left",(-.11*height)+left+"px");
            $(".member4 .majiangTemp .outer").css("margin-bottom","-15.8vh");
            $(".member4 .majiangTemp .outer").eq(0).animate({"width":"4.3vh","marginBottom":0,"marginLeft":0},400);
            $(".member4 .majiangTemp .outer").eq(1).animate({"width":"4.3vh","marginBottom":0,"marginLeft":0},400,function(){
                viewMethods.faPaiMove(type,(parseInt(startPosition)+1)%4);
            })
        }
    },
    faPaiEnd:function(type){
        if(type==1||type==2){
            $(".cardList .majiangMoving .cardUp").animate({"left":"-3vh"},200);
            $(".cardList .majiangMoving .cardDown").animate({"left":"-3vh"},200)
        }
        else if(type==3||type==4){
            $(".cardList .majiangMoving .cardUp").animate({"left":"13vh"},200);
            $(".cardList .majiangMoving .cardDown").animate({"left":"13vh"},200)
        }
        setTimeout(function(){
            if(error){
                error=false;
                socketModule.sendRefreshRoom();
            }
            $(".member .majiangTemp").hide();
            $(".member .majiangTemp1").show();
            appData.majiangNum=appData.majiangNum-8;
            appData.majiangMoving=false;
            setTimeout(function(){
                $(".majiangTemp1").hide();
                for(var i=0;i<4;i++){
                    appData.player[i].account_status=9;
                }
                appData.game.time=appData.game.timeTemp+1;
                viewMethods.waitingTextChange();
                viewMethods.timeCountDown();
            },400)
        },300);
    },

    qiePai: function (type) {
        if(appData.majiangMoving){
            return 0;
        }
        appData.majiangMoving=true;
        socketModule.sendMoveCard(type);
    },

    clickGameOver: function () {
        viewMethods.clickShowAlert(10, '下庄之后，将以当前战绩进行结算。是否确定下庄？');
        //socketModule.sendGameOver();
    },

    clickCreateRoom: function () {
        $('.createRoom .mainPart').css('height', '65vh');
        $('.createRoom .mainPart .blueBack').css('height', '46vh');
        appData.createInfo.type = 1;
        appData.createInfo.isShow = true;
        //socketModule.sendCreateRoom();
    },
    clickShowInvite: function () {
        appData.isShowInvite = true;
    },
    clickCloseInvite: function () {
        appData.isShowInvite = false;
    },
    clickShowIntro: function () {
        appData.isShowIntro = true;
    },
    clickCloseIntro: function () {
        appData.isShowIntro = false;
    },
    clickShowAlert: function (type, text) {
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
			/*	if (type == 8) {
			 mainHeight = mainHeight - height * 0.022 - height * 0.056
			 }*/

            var blackHeight = alertHeight + height * 0.034 * 2;
            var alertTop = height * 0.022 + (blackHeight - textHeight) / 2;

            $(".alert .mainPart").css('height', mainHeight + 'px');
            $(".alert .mainPart").css('margin-top', '-' + mainHeight / 2 + 'px');
            $(".alert .mainPart .backImg .blackImg").css('height', blackHeight + 'px');
            $(".alert .mainPart .alertText").css('top', alertTop + 'px');
        }, 0);
    },
    clickCloseAlert: function () {
        if (appData.alertType == 1) {
            viewMethods.clickShowShop();
            if (!appData.is_connect) {
                reconnectSocket();
                appData.is_connect = true;
            }
        } else {
            appData.isShowAlert = false;
            if(appData.alertType == 9){
                chooseBigWinner();
                $(".ranking .rankBack").css("opacity", "1");
                $(".roundEndShow").show();

                setTimeout(function () {
                    $(".ranking").show();
                    canvas();
                }, 100);
            }
        }
    },

    clickSitDown: function () {
        appData.isShowAlert = false;
		appData.isShowGameAlert = false;
        socketModule.sendJoinRoom();
    },

    clickReady: function () {
        socketModule.sendReadyStart();
        appData.player[0].is_operation = true;
    },


    gameOverNew: function (board, balance_scoreboard) {

        appData.game.show_coin = false;
        for (var i = 0; i < appData.playerBoard.score.length; i++) {
            appData.playerBoard.score[i].num = 0;
            appData.playerBoard.score[i].account_id = 0;
            appData.playerBoard.score[i].nickname = '';
            appData.playerBoard.score[i].account_score = 0;
        };

        for (var i = 0; i < 8; i++) {
            for (s in board) {
                if (appData.player[i].account_id == s) {
                    appData.player[i].account_score = Math.ceil(board[s]);
                    appData.playerBoard.score[i].num = appData.player[i].num;
                    appData.playerBoard.score[i].account_id = appData.player[i].account_id;
                    appData.playerBoard.score[i].nickname = appData.player[i].nickname;
                    appData.playerBoard.score[i].account_score = appData.player[i].account_score;
                    if(appData.player[i].is_banker && appData.ruleInfo.banker_mode==2){
                        if(appData.ruleInfo.score_type==1){
                            appData.playerBoard.score[i].account_score=appData.playerBoard.score[i].account_score-500;
                        }
                        else if(appData.ruleInfo.score_type==2){
                            appData.playerBoard.score[i].account_score=appData.playerBoard.score[i].account_score-1000;
                        }
                        else if(appData.ruleInfo.score_type==3){
                            appData.playerBoard.score[i].account_score=appData.playerBoard.score[i].account_score-1500;
                        }
                    }
                }
            }
        }

        var d = new Date(),
            str = "";
        str += d.getFullYear() + "-";
        str += d.getMonth() + 1 + "-";
        str += d.getDate() + "  ";
        str += d.getHours() + ":";

        if (d.getMinutes() >= 10) {
            str += d.getMinutes();
        } else {
            str += "0" + d.getMinutes();
        }

        appData.playerBoard.record = str + " 前 1" + appData.playerBoard.round + "局";
        appData.playerBoard.record = str;
//viewMethods.roundEnd();
        return 0;
        if (balance_scoreboard != undefined && balance_scoreboard != "-1") {
            console.log(balance_scoreboard);
            viewMethods.balanceScoreboard(balance_scoreboard);
        }
    },
    balanceScoreboard: function (obj) {
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
        appData.playerBoard.record = str + " 前" + appData.playerBoard.round + "局";
        appData.playerBoard.score = [];

        var scores = obj.scoreboard;
        for (s in scores) {
            var num = 0;
            var name = scores[s].name;

            if (userData.account_id == scores[s].account_id) {
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

    showMessage: function () {
        appData.isShowNewMessage = true;
        disable_scroll();
    },
    hideMessage: function () {
        appData.isShowNewMessage = false;
        enable_scroll();
    },
    messageOn: function (num) {
        socketModule.sendBroadcastVoice(num);
        m4aAudioPlay("message" + num);
        for(var i=0;i<8;i++){
            if(appData.player[i].account_id==userData.account_id){
                viewMethods.messageSay(i, num);
            }
        }
        viewMethods.hideMessage();
    },
    messageSay: function (num1, num2) {
        appData.player[num1].messageOn = true;
        appData.player[num1].messageText = appData.message[num2].text;
        setTimeout(function () {
            appData.player[num1].messageOn = false;
        }, 2500);
    },
    selectCard: function (num, count) {
        appData.select = num;
        appData.ticket_count = count;
    },
    shopBuy: function () {
        if (appData.select > 0) {
            appData.isShowShopLoading = true;
            var goods_id = appData.select;
            httpModule.buyCard(goods_id);
        }
    },
    roundEnd: function () {
        // $("#loading").show();
        // appData.game.is_break=true;
        // socketModule.getScoreBoard();
        DynLoading.goto('erba' + globalData.maxCount, 'i=' + globalData.roomNumber);
    },
    roundEnd2222: function () {
        chooseBigWinner();
        $(".ranking .rankBack").css("opacity", "1");
        $(".roundEndShow").show();

        setTimeout(function () {
            $(".ranking").show();
            canvas();
        }, 2500);
    },

    waitingTextChange:function(){
        if(appData.player[0].account_status==0||appData.player[0].account_status==1){
            appData.game.waiting_text="";
        }
        else if(appData.player[0].account_status==2){
            appData.game.waiting_text="等待开局";
        }
        else if(appData.player[0].account_status==3||appData.player[0].account_status==4||appData.player[0].account_status==5){
            appData.game.waiting_text="选择庄家";
        }
        else if(appData.player[0].account_status==6){
            appData.game.waiting_text="天门洗牌";
        }
        else if(appData.player[0].account_status==7){
            //	appData.game.waiting_text="切牌并下注";
            appData.game.waiting_text="等待下注";
        }
        else if(appData.player[0].account_status==8){
            appData.game.waiting_text="庄家发牌";
        }
        else if(appData.player[0].account_status==9){
            if(appData.player[0].account_id==userData.account_id){
                appData.game.waiting_text="点击麻将看牌";
            }
            else{
                appData.game.waiting_text="等待摊牌";
            }
        }
        else if(appData.player[0].account_status==10){
            appData.game.waiting_text="等待摊牌";
        }
        appData.game.waiting_text_show=true;
    },
    timeCountDown: function () {

        if (isTimeLimitShow == true) {
            return;
        }
        if (appData.game.time <= 0) {
            isTimeLimitShow = false;
            appData.game.waiting_text_show=false;
            appData.game.waiting_text="";
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

    clickRobBanker: function (multiples) {
        socketModule.sendGrabBanker(multiples);
        setTimeout(function () {
            mp3AudioPlay("audioRobBanker");
        }, 10);
    },
    clickNotRobBanker: function () {
        socketModule.sendNotGrabBanker();
        setTimeout(function () {
            mp3AudioPlay("audioNoBanker");
        }, 10);
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
        var totalCount = appData.bankerArray.length * 4;
        if (appData.bankerArray.length < 6) {
            appData.bankerAnimateDuration = parseInt(3000 / totalCount);
        } else {
            appData.bankerAnimateDuration = parseInt(5000 / totalCount);
        }

    },
    robBankerAnimate: function () {
        for (var i = 0; i < appData.bankerArray.length; i++) {
            var imgId = "#banker" + appData.bankerArray[i];
            $(imgId).hide();
        }
        var totalCount = appData.bankerArray.length * 4;
        if (appData.bankerAnimateCount >= totalCount || appData.bankerAnimateIndex < 0 || appData.bankerArray.length < 2) {
            appData.bankerAnimateCount = 0;
            appData.bankerAnimateIndex = -1;
            var imgId = "#banker" + appData.bankerAccountId;
            $(imgId).show();

            var bankerNum = '';

            for (var i = 0; i < appData.player.length; i++) {
                if (appData.player[i].account_id == appData.bankerAccountId) {
                    appData.player[i].is_banker = true;
                    appData.player[(i+2)%4].is_tianmen=true;
                    appData.bankerPlayer=appData.player[i];
                    bankerNum = appData.player[i].num;
                    if(appData.ruleInfo.banker_mode==2){
                        if(appData.ruleInfo.score_type==1){
                            appData.player[i].account_score=500;
                        }
                        else if(appData.ruleInfo.score_type==2){
                            appData.player[i].account_score=1000;
                        }
                        else if(appData.ruleInfo.score_type==3){
                            appData.player[i].account_score=1500;
                        }
                    }
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
                width: "82%",
                height: "82%"
            });

            $("#bankerAnimate1" + bankerNum).css({
                top: "4%",
                left: "4%",
                width: "94%",
                height: "94%"
            });

            $("#bankerAnimate" + bankerNum).show();
            $("#bankerAnimate1" + bankerNum).show();

            $("#bankerAnimate1" + bankerNum).animate({
                top: "4%",
                left: "4%",
                width: "94%",
                height: "94%"
            }, 400, function () {
                $("#bankerAnimate1" + bankerNum).animate({
                    top: "10%",
                    left: "10%",
                    width: "82%",
                    height: "82%"
                }, 400, function () {
                    $("#bankerAnimate1" + bankerNum).hide();
                });
            });

            $("#bankerAnimate" + bankerNum).animate({
                top: "-4%",
                left: "-4%",
                width: "106%",
                height: "106%"
            }, 400, function () {
                $("#bankerAnimate" + bankerNum).animate({
                    top: "10%",
                    left: "10%",
                    width: "82%",
                    height: "82%"


                }, 400, function () {
                    setTimeout(function () {
                        $("#bankerAnimate" + bankerNum).hide();
                        appData.isFinishBankerAnimate = true;
                    }, 500);
                    if(appData.tianmenAccountId==0){
                        //	viewMethods.xiPai();
                    }
                    else{
                        if(!appData.player[0].is_tianmen){
                            for(var i=0;i<8;i++){
                                if(appData.player[i].account_id==userData.account_id&&appData.player[i].serial_num>4){
                                    viewMethods.positionSort();
                                    break;
                                }
                            }
                        }
                    }
                    if(appData.game.timeTemp==10){
                        for(var i=0;i<4;i++){
                            appData.player[i].account_status=6;
                            if(appData.player[i].is_tianmen&&appData.game.user_id==appData.player[i].account_id){
                                opLimit=false;
                                viewMethods.xiPai();
                            }
                        }
                        return 0;
                        appData.game.time = 10;
                        viewMethods.waitingTextChange();
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

        setTimeout(function () {
            viewMethods.robBankerAnimate();
        }, appData.bankerAnimateDuration);
    },

    showMemberScore: function (isShow) {
        if (isShow) {
            $(".memberScoreText1").show();
            $(".memberScoreText2").show();
            $(".memberScoreText3").show();
            $(".memberScoreText4").show();
            $(".memberScoreText5").show();
            $(".memberScoreText6").show();
            $(".memberScoreText7").show();
            $(".memberScoreText8").show();
            $(".memberScoreText9").show();
        } else {
            $(".memberScoreText1").hide();
            $(".memberScoreText2").hide();
            $(".memberScoreText3").hide();
            $(".memberScoreText4").hide();
            $(".memberScoreText5").hide();
            $(".memberScoreText6").hide();
            $(".memberScoreText7").hide();
            $(".memberScoreText8").hide();
            $(".memberScoreText9").hide();
        }
    },

    winAnimate: function (obj) {
        appData.isFinishWinAnimate = false;

        var winnerNums = new Array();
        var loserNums = new Array();

        appData.bankerPlayerNum = appData.bankerPlayer.num;

        for(var j=0;j<4;j++){
            for (var i=0;i<obj.data.bet_array.length;i++) {
                if(appData.player[j].serial_num==parseInt(obj.data.bet_array[i].index)+1){
                    if(parseInt(obj.data.bet_array[i].win_multiples)<0){
                        loserNums.push(j+1);
                    }
                    if(parseInt(obj.data.bet_array[i].win_multiples)>0){
                        winnerNums.push(j+1);
                    }
                }
            }
        }


        for(var j=0;j<8;j++){
            appData.player[j].single_score=0;
        }
        for(var j=0;j<8;j++){
            for(i in obj.data.player_balance){
                if(i==appData.player[j].account_id){
                    appData.player[j].single_score=parseInt(obj.data.player_balance[i]);
                }
            }
        }


        viewMethods.resetCoinsPosition();
        $("#playerCoins").show();
        for (var i = 1; i < 5; i++) {
            viewMethods.showCoins(i, false);
        }



        console.log(winnerNums);
        console.log(loserNums);
        console.log(appData.bankerPlayerNum);

        //把赢家玩家金币暂时放到庄家位置
        for (var i = 0; i < winnerNums.length; i++) {
            for (var j = 0; j < 8; j++) {
                if (appData.bankerPlayerNum == 1) {
                    $(".memberCoin" + winnerNums[i] + j).css("bottom", coinBottom1);
                    $(".memberCoin" + winnerNums[i] + j).css("left", coinLeft1);
                    $(".memberCoin" + winnerNums[i] + j).css("margin-left", coinMarginLeft1);
                } else if (appData.bankerPlayerNum == 2) {
                    $(".memberCoin" + winnerNums[i] + j).css("bottom", coinBottom2);
                    $(".memberCoin" + winnerNums[i] + j).css("left", coinLeft2);
                    $(".memberCoin" + winnerNums[i] + j).css("margin-left", coinMarginLeft2);
                } else if (appData.bankerPlayerNum == 3) {
                    $(".memberCoin" + winnerNums[i] + j).css("bottom", coinBottom3);
                    $(".memberCoin" + winnerNums[i] + j).css("left", coinLeft3);
                    $(".memberCoin" + winnerNums[i] + j).css("margin-left", coinMarginLeft3);
                } else if (appData.bankerPlayerNum == 4) {
                    $(".memberCoin" + winnerNums[i] + j).css("bottom", coinBottom4);
                    $(".memberCoin" + winnerNums[i] + j).css("left", coinLeft4);
                    $(".memberCoin" + winnerNums[i] + j).css("margin-left", coinMarginLeft4);
                }
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
                if (appData.bankerPlayerNum == 1) {
                    $(".memberCoin" + loserNums[i] + j).animate({
                        bottom: coinBottom1,
                        left: coinLeft1,
                        marginLeft: coinMarginLeft1
                    }, 150 + 150 * j);
                } else if (appData.bankerPlayerNum == 2) {
                    $(".memberCoin" + loserNums[i] + j).animate({
                        bottom: coinBottom2,
                        left: coinLeft2,
                        marginLeft: coinMarginLeft2
                    }, 150 + 150 * j);
                } else if (appData.bankerPlayerNum == 3) {
                    $(".memberCoin" + loserNums[i] + j).animate({
                        bottom: coinBottom3,
                        left: coinLeft3,
                        marginLeft: coinMarginLeft3
                    }, 150 + 150 * j);
                } else if (appData.bankerPlayerNum == 4) {
                    $(".memberCoin" + loserNums[i] + j).animate({
                        bottom: coinBottom4,
                        left: coinLeft4,
                        marginLeft: coinMarginLeft4
                    }, 150 + 150 * j);
                }
            }
            setTimeout(function () {
                mp3AudioPlay("audioCoin");
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
                        if (winnerNums[i] == 1) {
                            $(".memberCoin" + winnerNums[i] + j).animate({
                                bottom: coinBottom1,
                                left: coinLeft1,
                                marginLeft: coinMarginLeft1
                            }, 150 + 150 * j);
                        } else if (winnerNums[i] == 2) {
                            $(".memberCoin" + winnerNums[i] + j).animate({
                                bottom: coinBottom2,
                                left: coinLeft2,
                                marginLeft: coinMarginLeft2
                            }, 150 + 150 * j);
                        } else if (winnerNums[i] == 3) {
                            $(".memberCoin" + winnerNums[i] + j).animate({
                                bottom: coinBottom3,
                                left: coinLeft3,
                                marginLeft: coinMarginLeft3
                            }, 150 + 150 * j);
                        } else if (winnerNums[i] == 4) {
                            $(".memberCoin" + winnerNums[i] + j).animate({
                                bottom: coinBottom4,
                                left: coinLeft4,
                                marginLeft: coinMarginLeft4
                            }, 150 + 150 * j);
                        }
                    }
                }
                setTimeout(function () {
                    mp3AudioPlay("audioCoin");
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

        $(".memberScoreText1").fadeIn(200);
        $(".memberScoreText2").fadeIn(200);
        $(".memberScoreText3").fadeIn(200);
        $(".memberScoreText4").fadeIn(200);
        $(".memberScoreText5").fadeIn(200);
        $(".memberScoreText6").fadeIn(200);
        $(".memberScoreText7").fadeIn(200);
        $(".memberScoreText8").fadeIn(200, function () {

            viewMethods.gameOverNew(obj.data.score_board, obj.data.balance_scoreboard);
            setTimeout(function () {

                $(".memberScoreText1").fadeOut("slow");
                $(".memberScoreText2").fadeOut("slow");
                $(".memberScoreText3").fadeOut("slow");
                $(".memberScoreText4").fadeOut("slow");
                $(".memberScoreText5").fadeOut("slow");
                $(".memberScoreText6").fadeOut("slow");
                $(".memberScoreText7").fadeOut("slow");
                $(".memberScoreText8").fadeOut("slow");

                if (appData.isBreak == 1) {
                    appData.overType = 2;
                    setTimeout(function () {
                        viewMethods.clickShowAlert(9, '庄家分数不足，提前下庄，点击确定查看结算');
                    }, 1000);
                }
                else {
                    appData.game.first_half_cards=[];
                    if(appData.majiangNum==12){
                        for(var i=0;i<4;i++){
                            appData.game.first_half_cards=appData.game.first_half_cards.concat(appData.position_info[i].card_info);
                        }
                    }
                    for(var i=0;i<4;i++){
                        appData.position_info[i].card_info=[];
                        appData.position_info[i].card_value=0;
                        appData.position_info[i].chip.total=0;
                        appData.position_info[i].chip.my_bet=0;
                        appData.position_info[i].card_text="";
                        appData.position_info[i].card_times=0;
                    }
                    for (var i = 0; i < appData.player.length; i++) {
                        appData.player[i].animate = 0;
                    }
                    appData.animate.majiang1=0;
                    appData.animate.majiang2=0;
                    if(appData.majiangNum==4){
                        appData.majiangNum=20;
                        appData.majiangReset=false;
                        appData.game.circle=-1;
                        appData.animate.animate1=0;
                        if(appData.ruleInfo.banker_mode==1){
                            for (var i = 0; i < appData.player.length; i++) {
                                appData.player[i].is_banker=false;
                                appData.player[i].is_tianmen=false;
                            }
                        }
                    }
                }
            }, 2e3);

            appData.isFinishWinAnimate = true;

        });
        if (obj.data.total_num == obj.data.game_num&&appData.majiangNum==4) {
            viewMethods.roundEnd();
        }else{
            // 自动准备
            setTimeout(function () {
                if (appData.isAutoReady == 1 && appData.isWatching != 1) {
                    viewMethods.clickReady()
                }
            }, 2500)
        }
    },
    resetCoinsPosition: function () {
        for (var i = 1; i <5; i++) {
            for (var j = 0; j < 8; j++) {
                if (i == 1) {
                    $(".memberCoin" + i + j).css({
                        bottom: coinBottom1,
                        left: coinLeft1,
                        marginLeft: coinMarginLeft1
                    });
                } else if (i == 2) {
                    $(".memberCoin" + i + j).css({
                        bottom: coinBottom2,
                        left: coinLeft2,
                        marginLeft: coinMarginLeft2
                    });
                } else if (i == 3) {
                    $(".memberCoin" + i + j).css({
                        bottom: coinBottom3,
                        left: coinLeft3,
                        marginLeft: coinMarginLeft3
                    });
                } else if (i == 4) {
                    $(".memberCoin" + i + j).css({
                        bottom: coinBottom4,
                        left: coinLeft4,
                        marginLeft: coinMarginLeft4
                    });
                }
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
var timesOffset = (width * 0.9 - height * 0.088 * 4 - width * 0.02 * 3) / 2;

var coinLeft1 = "5vh";
var coinLeft2 = "100%";
var coinLeft3 = "50%";
var coinLeft4 = "5vh";

var coinBottom1 = "14vh";
var coinBottom2 = "58vh";
var coinBottom3 = "77vh";
var coinBottom4 = "58vh";

var coinMarginLeft1 = "0";
var coinMarginLeft2 = "-7vh";
var coinMarginLeft3 = "-7vh";
var coinMarginLeft4 = "0";


var viewStyle = {
    readyButton: {
        position: 'absolute',
        top: (height * 0.11 - height * 0.0495) / 2 + 'px',
        left: (width * 0.9 - height * 0.0495 * 3.078 ) / 2 + 'px',
        width: height * 0.0495 * 3.078 + 'px',
        height: height * 0.0495 + 'px' ,
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
        left: '5%',
        width: '90%',
        height: '11vh',
        overflow: 'hidden'
    },
    rob: {
        position: 'absolute',
        top: (height * 0.11 - height * 0.0495) / 2 + 'px',
        left: (width * 0.9 - height * 0.0495 / 0.375 * 2 - 20) / 2 + 'px',
        width: height * 0.0495 / 0.375 + 'px',
        height: height * 0.0495 + 'px',
    },
    rob1: {
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: height * 0.0495 / 0.375 + 'px',
        height: height * 0.0495 + 'px',
        'line-height': height * 0.0495 + 'px',
        'text-align': 'center',
        color: 'white',
        'font-size': '2.2vh',
        'font-weight': 'bold'
    },
    notRob: {
        position: 'absolute',
        top: (height * 0.11 - height * 0.0495) / 2 + 'px',
        left: (width * 0.9 - height * 0.0495 / 0.375 * 2 - 20) / 2 + height * 0.0495 / 0.375 + 20 + 'px',
        width: height * 0.0495 / 0.375 + 'px',
        height: height * 0.0495 + 'px'
    },
    notRob1: {
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: height * 0.0495 / 0.375 + 'px',
        height: height * 0.0495 + 'px',
        'line-height': height * 0.0495 + 'px',
        'text-align': 'center',
        color: 'white',
        'font-size': '2.2vh',
        'font-weight': 'bold'
    },
    showCard: {
        position: 'absolute',
        top: (height * 0.11 - height * 0.0495) / 2 + 'px',
        left: (width * 0.9 - height * 0.0495 / 0.375) / 2 + 'px',
        width: height * 0.0495 / 0.375 + 'px',
        height: height * 0.0495 + 'px'
    },
    showCard1: {
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: height * 0.0495 / 0.375 + 'px',
        height: height * 0.0495 + 'px',
        'line-height': height * 0.0495 + 'px',
        'text-align': 'center',
        color: 'white',
        'font-size': '2.2vh',
        'font-weight': 'bold'
    },
    times1: {
        position: 'absolute',
        top: (height * 0.11 - height * 0.088 / 2) / 2 + 'px',
        left: timesOffset + 'px',
        width: height * 0.088 + 'px',
        height: height * 0.088 / 2 + 'px',
        'line-height': height * 0.088 / 2 + 'px',
    },
    timesText: {
        position: 'absolute',
        width: height * 0.088 + 'px',
        height: height * 0.088 / 2 + 'px',
        'line-height': height * 0.088 / 2 + 'px',
        'text-align': 'center',
        color: 'white',
        'font-size': '2.2vh',
        'font-weight': 'bold'
    },
    times2: {
        position: 'absolute',
        top: (height * 0.11 - height * 0.088 / 2) / 2 + 'px',
        left: timesOffset + width * 0.02 + height * 0.088 + 'px',
        width: height * 0.088 + 'px',
        height: height * 0.088 / 2 + 'px',
        'line-height': height * 0.088 / 2 + 'px',
    },
    times3: {
        position: 'absolute',
        top: (height * 0.11 - height * 0.088 / 2) / 2 + 'px',
        left: timesOffset + width * 0.02 * 2 + height * 0.088 * 2 + 'px',
        width: height * 0.088 + 'px',
        height: height * 0.088 / 2 + 'px',
        'line-height': height * 0.088 / 2 + 'px',
    },
    times4: {
        position: 'absolute',
        top: (height * 0.11 - height * 0.088 / 2) / 2 + 'px',
        left: timesOffset + width * 0.02 * 3 + height * 0.088 * 3 + 'px',
        width: height * 0.088 + 'px',
        height: height * 0.088 / 2 + 'px',
        'line-height': height * 0.088 / 2 + 'px',
    },
    robText2: {
        position: 'absolute',
        top: (height * 0.11 - height * 0.03) / 2 + 'px',
        left: (width * 0.9 - height * 0.0557 - height * 0.03 - height * 0.005) / 2 + 'px',
        width: height * 0.0557 + 'px',
        height: height * 0.03 + 'px',
    },
    robText: {
        position: 'absolute',
        top: (height * 0.11 - height * 0.03) / 2 + 'px',
        left: (width * 0.9 - height * 0.0557) / 2 + 'px',
        width: height * 0.0557 + 'px',
        height: height * 0.03 + 'px',
    },
    robTimesText: {
        position: 'absolute',
        top: (height * 0.11 - height * 0.03) / 2 + 'px',
        left: (width * 0.9 - height * 0.0557 - height * 0.03 - height * 0.002) / 2 + height * 0.0557 + height * 0.005 + 'px',
        width: height * 0.03 + 'px',
        height: height * 0.03 + 'px',
    },
    notRobText: {
        position: 'absolute',
        top: (height * 0.11 - height * 0.03) / 2 + 'px',
        left: (width * 0.9 - height * 0.0557) / 2 + 'px',
        width: height * 0.0557 + 'px',
        height: height * 0.03 + 'px',
    },
    showCardText: {
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '80%',
        height: '11vh',
        'font-size': '2.2vh',
    },
    showCardText1: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        color: 'white',
        'font-size': '2.2vh',
        'text-align': 'center',
        'line-height': '11vh',
        'font-family': 'Helvetica 微软雅黑'
    },
    coinText: {
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '80%',
        height: '11vh',
        'font-size': '2.2vh',
    },
    coinText1: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        color: 'white',
        'font-size': '2.2vh',
        'text-align': 'center',
        'line-height': '11vh',
        'font-family': 'Helvetica 微软雅黑'
    }
};

var createInfo = {
    type: -1,
    isShow: false,
    'isShowRule': false,
    ticket: 1,
    'rule_height': '4vh',
    'banker_mode': 1,
    'chip_type': 1,
};

var ruleInfo = {
    type: -1,
    isShow: false,
    'isShowRule': false,
	'isShowNewRule':false,
    ticket: 1,
    'rule_height': '4vh',
    'banker_mode': 1,
    'chip_type': 1,
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
    isAutoReady:setReady, //自动准备
    'isShowHomeAlert': false,
	"isShowNewRule":false,
    coinNum:1,

    dice:{
        status:0,
        dice1:1,
        dice2:1,
    },
    position_info:[],
    coinArea:0,
    animate:{
        animate1:0,
        majiang1:0,
        majiang2:0,
    },
    add_user:false,
	'isShowGameAlert': false,
    'viewStyle': viewStyle,

    'isAA':false,  //是否AA房卡
    'isAutoActive':false,  //是否自动激活
    'isShop':false,  //是否有商城

    'width': window.innerWidth,
    'height': window.innerHeight,
    'roomCard': Math.ceil(globalData.card),
    'is_connect': false,
    'player': [],
    'scoreboard': '',
    'activity': [],
    'isShowInvite': false,
    'isShowAlert': false,
    'isShowIndiv': false,
    'inputIndiv': '',
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

    'base_score': 0,
    'playerBoard': {
        score: new Array(),
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
    message: message,
    isShowShopLoading: false,
    bankerArray: [],
    bankerAccountId: '',
    tianmenAccountId: 0,
    bankerPlayer: '',
    bankerPlayerNum: -1,
    bankerAnimateCount: 0,
    bankerAnimateIndex: 0,
    lastBankerImgId: '',
    bankerAnimateDuration: 120,
    isFinishWinAnimate: false,
    isFinishBankerAnimate: false,
    isShowErweima: false,
    createInfo: createInfo,
    isShowRecord: false,
    recordList: [],
    ruleInfo: ruleInfo,
    "can_break": 0,
    "overType": 1,
    "isBreak": 0,
    "breakData": '',
    'bankerID': 0,
    "roomStatus":0,
    majiangList:[],
    majiangNum:0,
    majiangMoving:false,
    majiangReset:false,

    isReconnect: true,
    isShowIntro: false,

    editAudioInfo: editAudioInfo,
    audioInfo: audioInfo,

    bScroll: null,
    'musicOnce': true,
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
    applyStatus:0, //0尚未申请  1加好友申请中
};

var resetState = function resetState() {
    appData.game.is_break=false;
    for (var i = 0; i < 4; i++) {
        appData.position_info.push({
            card_info: [],
            card_value: 0,
            chip:{total:0,my_bet:0},
        });
    }

    for (var i = 0; i < 8; i++) {
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
            is_banker: false,
            is_tianmen: false,
            messageOn: false,
            messageText: "",
            coins: []
        });
    }

    for (var i = 0; i < appData.player.length; i++) {
        appData.player[i].coins = [];
        for (var j = 0; j <= 7; j++) {
            appData.player[i].coins.push("memberCoin" + appData.player[i].num + j);
        }
    }

    httpModule.getInfo();
};

var resetAllPlayerData = function resetAllPlayerData() {
    appData.player = [];
    appData.game.is_break=false;

    for (var i = 0; i < 8; i++) {
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
            card_info: [],
            card_value: "",
            is_banker: false,
            is_tianmen: false,
            animate:0,
            messageOn: false,
            messageText: "",
            coins: []
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
        for (var j = 0; j <= 7; j++) {
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
    appData.game.score = 0;
    appData.game.currentScore = 0;
    appData.game.cardDeal = 0;
    appData.game.can_open = 0;
    appData.game.current_win = 0;
    appData.game.is_play = false;

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
            appData.player[i].is_banker = false;
            appData.player[i].multiples = 0;
            appData.player[i].bankerMultiples = 0,
                appData.player[i].combo_point = 0;
            appData.player[i].timesImg = "";
            appData.player[i].bankerTimesImg = "",
                appData.player[i].robImg = "";
            appData.player[i].single_score = 0;
            appData.player[i].num = i + 1;

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
                card_type: 0,
                is_banker: false,
                multiples: 0,
                bankerMultiples: 0,
                combo_point: 0,
                timesImg: "",
                bankerTimesImg: "",
                robImg: "",
                single_score: 0,
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
        // console.log('appData.socketStatus',appData.socketStatus)
        if (appData.socketStatus > 1) {
            appData.connectOrNot = false;
        }else{
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
    changeTitle(userData.nickname,globalData.roomNumber);
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
        } else if (obj.operation == wsOperation.ActiveRoom) {
            if (obj.result == 1){
                viewMethods.clickShowAlert(1, obj.result_message);
            } else {
                socketModule.sendPrepareJoinRoom();
            }
        } else if (obj.operation == wsOperation.CreateRoom) {
            if (obj.result == -1) {
                window.location.href=window.location.href+"&id="+10000*Math.random();
            } else if (obj.result == 1){
                viewMethods.clickShowAlert(1, obj.result_message);
            }

        } else if (obj.operation == wsOperation.RefreshRoom) {
            window.location.href=window.location.href+"&id="+10000*Math.random();
        }

        appData.player[0].is_operation = false;
    } else {
        if (obj.operation == wsOperation.PrepareJoinRoom) {
            socketModule.processPrepareJoinRoom(obj);
        } else if (obj.operation == wsOperation.GameHistory) {
            socketModule.processGameHistory(obj);
        } else if (obj.operation == wsOperation.JoinRoom) {
            socketModule.processJoinRoom(obj);
        } else if (obj.operation == wsOperation.ActiveRoom) {
            socketModule.processActiveRoom(obj);
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
        } else if (obj.operation == wsOperation.MyCards) {
            socketModule.processMyCards(obj);
        } else if (obj.operation == wsOperation.BreakRoom) {
            socketModule.processBreakRoom(obj);
        }
        else if (obj.operation == "NotyShuffle") {
            socketModule.processNotyShuffle(obj);
        }
        else if (obj.operation == "ShufflingCard") {
            socketModule.processShufflingCard(obj);
        }
        else if (obj.operation == "MovingCard") {
            socketModule.processMovingCard(obj);
        }
        else if (obj.operation == "UpdateAccountChip") {
            socketModule.processUpdateAccountChip(obj);
        }
        else if (obj.operation == "NotyDealCard") {
            socketModule.processNotyDealCard(obj);
        }
        else if (obj.operation == "DealingCard") {
            socketModule.processDealingCard(obj);
        } else if (obj.operation == "getScoreBoard") {
            socketModule.processGetScoreBoard(obj);
        } else if (obj.operation == "setIndividuality") {
            socketModule.processSetIndividuality(obj);
        } else if (obj.operation == "getAccountInfo") {
            socketModule.pGAI(obj);
        }else if (obj.operation == "getAccountCard") {
            socketModule.pGAC(obj);
        }

        else {
            logMessage(obj.operation);
        }
    }
}

var wsCloseCallback = function wsCloseCallback(data) {
    if(!appData.game.is_break){
        logMessage("websocket closed：");
        logMessage(data);
        appData.connectOrNot = false;
        setTimeout(function () {
            reconnectSocket();
        },2500)
    }
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
//	return 0;
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
    initSound: function (arrayBuffer, name) {
        this.audioContext.decodeAudioData(arrayBuffer, function (buffer) {
            audioModule.audioBuffers[name] = {
                "name": name,
                "buffer": buffer,
                "source": null
            };

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
            "bullfour.m4a","bullhulu.m4a","bullshunzi.m4a","bulltonghua.m4a","bulltonghuashun.m4a",
            "times1.m4a", "times2.m4a", "times3.m4a", "times4.m4a", "times8.m4a", "times5.m4a", "times10.m4a", "times6.m4a", "coin.mp3", "audio1.m4a"];
        var audioName = ["audioNoBanker", "audioRobBanker", "audioBull0", "audioBull1", "audioBull2", "audioBull3", "audioBull4", "audioBull5", "audioBull6", "audioBull7",
            "audioBull8", "audioBull9", "audioBull10", "audioBull11", "audioBull12", "audioBull13",
            "audioBull14","audioBull15","audioBull16","audioBull17","audioBull18",
            "audioTimes1", "audioTimes2", "audioTimes3", "audioTimes4", "audioTimes8", "audioTimes5", "audioTimes10", "audioTimes6", "audioCoin", "audio1"];
        for (var i = 0; i < audioUrl.length; i++) {
            this.loadAudioFile(this.audioUrl + 'fiesc/audio/bull61013/' + audioUrl[i], audioName[i]);
        }

        var audioUrl1 = ["nobanker_1.m4a", "robbanker_1.m4a", "nobull_1.m4a", "bull1_1.m4a", "bull2_1.m4a", "bull3_1.m4a", "bull4_1.m4a", "bull5_1.m4a", "bull6_1.m4a", "bull7_1.m4a",
            "bull8_1.m4a", "bull9_1.m4a", "bull10_1.m4a", "bullflower_1.m4a", "bullbomb_1.m4a", "bulltiny_1.m4a",
            "bullfour_1.m4a","bullhulu_1.m4a","bullshunzi_1.m4a","bulltonghua_1.m4a","bulltonghuashun_1.m4a",
            "times1_1.m4a", "times2_1.m4a", "times3_1.m4a", "times4_1.m4a", "times8_1.m4a", "times5_1.m4a", "times10_1.m4a", "times6_1.m4a", "coin_1.mp3", "audio1_1.m4a"];
        var audioName1 = ["audioNoBanker_1", "audioRobBanker_1", "audioBull0_1", "audioBull1_1", "audioBull2_1", "audioBull3_1", "audioBull4_1", "audioBull5_1", "audioBull6_1", "audioBull7_1",
            "audioBull8_1", "audioBull9_1", "audioBull10_1", "audioBull11_1", "audioBull12_1", "audioBull13_1",
            "audioBull14_1","audioBull15_1","audioBull16_1","audioBull17_1","audioBull18_1",
            "audioTimes1_1", "audioTimes2_1", "audioTimes3_1", "audioTimes4_1", "audioTimes8_1", "audioTimes5_1", "audioTimes10_1", "audioTimes6_1", "audioCoin_1", "audio1_1"];
        for (var i = 0; i < audioUrl1.length; i++) {
            this.loadAudioFile(this.audioUrl + 'fiesc/audio/bull61013/' + audioUrl1[i], audioName1[i]);
        }

        var audioMessageUrl = [ "message0.m4a","message1.m4a", "message2.m4a", "message3.m4a", "message4.m4a", "message5.m4a", "message6.m4a", "message7.m4a", "message8.m4a","message9.m4a", "message10.m4a", "message11.m4a", "message12.m4a", "message13.m4a", "message14.m4a", "message15.m4a", "message16.m4a", "message17.m4a", "message18.m4a", "message19.m4a", "message20.m4a", "message21.m4a"];
        var audioMessageName = ["message0", "message1", "message2", "message3", "message4", "message5", "message6", "message7", "message8", "message9", "message10", "message11", "message12", "message13", "message14", "message15", "message16", "message17", "message18", "message19", "message20", "message21"];
        for (var i = 0; i < audioMessageUrl.length; i++) {
            this.loadAudioFile(this.audioUrl + 'fiesc/audio/sound61013/' + audioMessageUrl[i], audioMessageName[i]);
        }
        var audioMessageUrl1 = [ "message0_1.m4a","message1_1.m4a", "message2_1.m4a", "message3_1.m4a", "message4_1.m4a", "message5_1.m4a", "message6_1.m4a", "message7_1.m4a", "message8_1.m4a","message9_1.m4a", "message10_1.m4a", "message11_1.m4a", "message12_1.m4a"];
        var audioMessageName1 = ["message0_1", "message1_1", "message2_1", "message3_1", "message4_1", "message5_1", "message6_1", "message7_1", "message8_1", "message9_1", "message10_1", "message11_1", "message12_1"];
        for (var i = 0; i < audioMessageUrl1.length; i++) {
            this.loadAudioFile(this.audioUrl + 'fiesc/audio/sound61013/' + audioMessageUrl1[i], audioMessageName1[i]);
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
        var divs = ['table', 'vinvite', 'valert', 'vmessage', 'vshop', 'vcreateRoom', 'vroomRule'];
        var divLength = divs.length;

        for (var i = 0; i < divLength; i++) {
            var tempDiv = document.getElementById(divs[i]);
            if (tempDiv) {
                tempDiv.addEventListener('touchmove', function (event) {
                    event.preventDefault();
                }, false);
            }
        }

        // var member4Top = (window.innerHeight * 0.195 - 28 - 89) / 2 + 26;
        // member4Top = (member4Top / window.innerHeight) * 100;

        // $('.member4').css('top', member4Top + '%');
    };
};

function checkIndividuality(e){
    return!!/^[0-9a-zA-Z]*$/g.test(e);
}

//Vue方法
var methods = {
    setUserData(obj){
        var info = {
            "account_id":obj.account_id,
            "nickname":obj.nickname,
            "headimgurl":obj.headimgurl,
            "card":obj.ticket_count,
            "individuality":obj.individuality,
            "user_id":obj.user_id,
        };
        userData = info;
        appData.userData = info;
        changeTitle(userData.nickname,globalData.roomNumber);
        socketModule.sendPrepareJoinRoom();
        return JSON.stringify(info)
    },
    showResultTextFunc(text){
        appData.isShowTipsText=true;
        appData.tipsText=text;
        setTimeout(function(){
            appData.isShowTipsText=false;
        },1500)
    },
    clickVoice: function(){
        if(globalData.p_type==2){
            audioModule.loadAudioFile(globalData.fileUrl + 'files/audio/paijiu/dy_button.mp3', 'clickVoice');
            setTimeout(function () {
                m4aAudioPlay('clickVoice');
            }, 100)
        }
    },
    showHomeAlert: viewMethods.showHomeAlert,
    test: viewMethods.test,
    test1: viewMethods.test1,
    quitCommit: viewMethods.quitCommit,
    gameover: socketModule.sendGameOver,
    positionSort: viewMethods.positionSort,
    showCoinArea: viewMethods.showCoinArea ,
    hideCoinArea: viewMethods.hideCoinArea ,
    selectCoin: viewMethods.selectCoin ,
    xiPai: viewMethods.xiPai,
    faPai: viewMethods.faPai,
    qiePai: viewMethods.qiePai,
    clickGameOver: viewMethods.clickGameOver,

    showIndividuality: function () {
        appData.individualityError="";
        appData.isShowIndividuality = true;
    },
    closeHomeAlert: function(){
        appData.isShowHomeAlert = false;
    },
    hideIndividuality: function () {
        appData.isShowIndividuality = false;
    },
    setIndividuality:function(){
        if(appData.inputIndiv.length>6||appData.inputIndiv.length<1){
            appData.individualityError="请输入1-6位英文或数字防伪码";
            appData.isShowIndividualityError=!0;
        } else if(checkIndividuality(appData.inputIndiv)){
            appData.individualityError="";
            socketModule.setIndividuality();
        } else {
            appData.individualityError="请输入1-6位英文或数字防伪码";
            appData.isShowIndividualityError=!0;
        }
    },
    individualityChange:function(){
        if(appData.inputIndiv.length>6){
            appData.inputIndiv=appData.inputIndiv.substring(0,6);
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

    showInvite: viewMethods.clickShowInvite,
    showIntro: viewMethods.clickShowIntro,
    showAlert: viewMethods.clickShowAlert,
    showMessage: viewMethods.showMessage,
    closeInvite: viewMethods.clickCloseInvite,
    closeIntro: viewMethods.clickCloseIntro,
    closeAlert: viewMethods.clickCloseAlert,
    createRoom: viewMethods.clickCreateRoom,
    sitDown: viewMethods.clickSitDown,
    seeMyCard: viewMethods.seeMyCard,
    seeAllCard: viewMethods.seeAllCard,
    imReady: viewMethods.clickReady,
    robBanker: viewMethods.clickRobBanker,
    showCard: viewMethods.clickShowCard,
    hideMessage: viewMethods.hideMessage,
    closeEnd: viewMethods.closeEnd,
    messageOn: viewMethods.messageOn,
    // 自动准备
    autoReady() {
        if(appData.game.is_break==true){
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
            if(appData.game.status==1){
                viewMethods.clickReady();
            }
        }
        if (localStorage.messageMusic == 1) {
            methods.clickVoice();
        }
    },
    hall: function(){
        DynLoading.goto('/');
    },
    applyClub: function () {
        httpModule.applyClub();
    },
    reviewCard: function () {
        window.location.href = Htmls.getReviewUrl(globalData.gameType, globalData.roomNumber); 
    },
    notRobBanker: viewMethods.clickNotRobBanker,
    selectCard: viewMethods.selectCard,
    createCommit: function () {
        logMessage(appData.createInfo.type);
        if (appData.createInfo.type == 1) { //创建房间
            socketModule.sendCreateRoom();
        } else if (appData.createInfo.type == 2) { //激活房间
            socketModule.sendActiveRoom();
        }

        appData.createInfo.isShow = false;
    },
    cancelCreateRoom: function () {
        appData.createInfo.isShow = false;
    },
    selectChange: function (type, num) {
        if (type == 1) {
            appData.createInfo.baseScore = num;
        } else if (type == 2) {
            appData.createInfo.timesType = num;
        } else if (type == 3) {
            if (num == 1) {
                if (appData.createInfo.isCardfive == 0) {
                    appData.createInfo.isCardfive = 1;
                } else {
                    appData.createInfo.isCardfive = 0;
                }
            } else if (num == 2) {
                if (appData.createInfo.isCardbomb == 0) {
                    appData.createInfo.isCardbomb = 1;
                } else {
                    appData.createInfo.isCardbomb = 0;
                }
            } else if (num == 3) {
                if (appData.createInfo.isCardtiny == 0) {
                    appData.createInfo.isCardtiny = 1;
                } else {
                    appData.createInfo.isCardtiny = 0;
                }
            }
        } else if (type == 4) {
            appData.createInfo.ticket = num;
        } else if (type == 5) {
            appData.createInfo.banker_score = num;
        }
    },
    showGameRule: function () {
        if (appData.roomStatus == 4) {
            return;
        }

        $('.createRoom .mainPart').css('height', '60vh');
        $('.createRoom .mainPart .blueBack').css('height', '51vh');
        appData.ruleInfo.isShowNewRule = true;
    },
    cancelGameRule: function () {
        appData.ruleInfo.isShowNewRule = false;
        $('.createRoom .mainPart').css('height', '65vh');
        $('.createRoom .mainPart .blueBack').css('height', '46vh');
    },
    showGameHistory: function () {
        socketModule.sendGameHistory();
    },
    closeRecord: function () {
        appData.isShowRecord = false;
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
    reloadView: function() {
        window.location.href = window.location.href ;
    },
	applyToJoin:function(){
        httpModule.applyToJoin();
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

var shareContent = '';

function getShareContent() {
    shareContent = "\n";


    if (appData.ruleInfo.ticket == 1) {
        shareContent = shareContent + '  局数：4×2局x1张房卡';
    } else {
        shareContent = shareContent + '  局数：8×2局x2张房卡';
    }

    if(appData.ruleInfo.banker_mode==2){
        shareContent = shareContent + '  模式：固定庄家';
        if (appData.ruleInfo.score_type == 1) {
            shareContent = shareContent + '  上庄分数：500';
        } else if (appData.ruleInfo.score_type == 2) {
            shareContent = shareContent + '  上庄分数：1000';
        } else if (appData.ruleInfo.score_type == 3) {
            shareContent = shareContent + '  上庄分数：1500';
        } else if (appData.ruleInfo.score_type == 4) {
            shareContent = shareContent + '  上庄分数：无限制';
        }
    }
    else if(appData.ruleInfo.banker_mode==1){
        shareContent = shareContent + '  模式：自由抢庄';
        if (appData.ruleInfo.chip_type == 1) {
            shareContent = shareContent + '  筹码：10,20,30,50';
        } else if (appData.ruleInfo.chip_type == 2) {
            shareContent = shareContent + '  筹码：20,30,50,80';
        } else if (appData.ruleInfo.chip_type == 3) {
            shareContent = shareContent + '  筹码：30,50,80,100';
        } else if (appData.ruleInfo.chip_type == 0) {
            shareContent = shareContent + '  筹码：5,10,20,30';
        }

    }

    if (appData.ruleInfo.rule_type == 1) {
        shareContent = shareContent + '  无二八杠';
    } else if (appData.ruleInfo.rule_type == 2) {
        shareContent = shareContent + '  二八杠2倍';
    } else if (appData.ruleInfo.rule_type == 3) {
        shareContent = shareContent + '  二八杠3倍';
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
        title: "二八杠" + '(房间号:' + globalData.roomNumber + ')',
        desc: shareContent,
        link: globalData.roomUrl,
        imgUrl: globalData.fileUrl + "files/images/erba/coin.png",
        success: function () {},
        cancel: function () {}
    });
    wx.onMenuShareAppMessage({
        title: "二八杠" + '(房间号:' + globalData.roomNumber + ')',
        desc: shareContent,
        link: globalData.roomUrl,
        imgUrl: globalData.fileUrl + "files/images/erba/coin.png",
        success: function () {},
        cancel: function () {}
    });
});

wx.error(function (a) {});

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

function cardText(value){
    var num,num1,numText;
    num=parseInt(value.substr(1,2));
    num1=parseInt(value.substr(0,1));
    numText="";
    if(value==29900||value==30000){
        numText="二八杠";
    }
    else if(num1>2){
        numText="对子";
    }
    else if(num==0){
        numText="零点";
    }
    else if(num==5){
        numText="半点";
    }
    else if(num==10){
        numText="一点";
    }
    else if(num==15){
        numText="一点半";
    }
    else if(num==20){
        numText="两点";
    }
    else if(num==25){
        numText="两点半";
    }
    else if(num==30){
        numText="三点";
    }
    else if(num==35){
        numText="三点半";
    }
    else if(num==40){
        numText="四点";
    }
    else if(num==45){
        numText="四点半";
    }
    else if(num==50){
        numText="五点";
    }
    else if(num==55){
        numText="五点半";
    }
    else if(num==60){
        numText="六点";
    }
    else if(num==65){
        numText="六点半";
    }
    else if(num==70){
        numText="七点";
    }
    else if(num==75){
        numText="七点半";
    }
    else if(num==80){
        numText="八点";
    }
    else if(num==85){
        numText="八点半";
    }
    else if(num==90){
        numText="九点";
    }
    else if(num==95){
        numText="九点半";
    }
    return numText;
}

function by(new1){
    return function(o, p){
        var a, b;
        if (typeof o === "object" && typeof p === "object" && o && p) {
            a = o[new1];
            b = p[new1];
            if (a === b) {
                return false;
            }
            if (typeof a === typeof b) {
                return a < b ? -1 : 1;
            }
            return typeof a < typeof b ? -1 : 1;
        }
        else {
            throw ("error");
        }
    }
}
//新画布
function canvas() {
  $('body').css("overflow-x","hidden")
  $("#loading").css("z-index","999");
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
              DynLoading.goto('/');
          });

          getRankingSix();
        $('#ranking').remove();
		$('.ranking-img').css({'position': 'absolute','top': '0','right': '0','bottom': '0','z-index': '999999','width': '100%','background-color': '#000'});
          $("#loading").css({'background':'#071a45'});
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

  var room_number = globalData.roomNumber;
  var num = data.round;
  var sum = appData.game.total_num;
  var datetime = data.record;
  var width = 750;
  var height = 1216;
  var pics = [globalData.fileUrl+'files/images/erba/rank_erba.jpg', globalData.fileUrl+'files/images/common/people_bg.png', globalData.fileUrl+'files/images/common/ranking_icon.png'];
  if (users.length > 6) {
    pics.push(globalData.fileUrl+'files/images/erba/people_bg2.jpg');
    pics.push(globalData.fileUrl+'files/images/erba/people_bg4.jpg');
    height += 102 * (users.length - 6);
  } else {
    pics.push(globalData.fileUrl+'files/images/erba/people_bg4.jpg');
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

function getLocalTime(nS) {
    var data = new Date(parseInt(nS) * 1000);
    var N = data.getFullYear() + "年";
    var Y = data.getMonth() + 1 + "月";
    var R = data.getDate() + "日 ";
    var H = data.getHours();
    var M = data.getMinutes();
    var Z = ":";
    if (M < 10)
        Z = Z + 0;
    return N + Y + R + H + Z + M;
};

//随机字符串
function randomString(len) {
    len = len || 32;
    var $chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
    var maxPos = $chars.length;
    var pwd = "";

    for (i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }

    return pwd;
};

function logMessage(message) {
    // console.log(message);
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