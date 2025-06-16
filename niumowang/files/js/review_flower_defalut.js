var ws;
var viewMethods = {};
var viewStyle = {};
var appData = {
    'gameScoreList': [],
    'gameDetailList': [],
    'ruleText': '',
    'ruleStartTime': '',
    'ruleEndTime': '',
    'player_array': {},
    'player_avatar': [],
    isReconnect:true,
    'connectOrNot': true,
    'socketStatus': 0,
    'heartbeat': null,
    maxCount:6
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

    }
};
audioModule.initModule(globalData.fileUrl);

//Vue方法
var methods = {
    showDetail(index){
        audioModule.loadAudioFile(globalData.fileUrl + 'files/audio/paijiu/dy_button.mp3', 'clickVoice');
        setTimeout(function () {
            audioModule.playSound('clickVoice');
        }, 100);
        appData.gameDetailList[index].show_detail=!appData.gameDetailList[index].show_detail;
    },
    gotoHall(){
        if(getQueryString('t')==1){
            window.location.replace(globalData.baseUrl + cr('oc',new Date().getTime()));
        }else if(getQueryString('t')==2){
            window.location.replace(globalData.baseUrl + cr('pc',new Date().getTime()));
        }else{
            window.location.replace('/');
        }
    },
    gotoGame(type){
        window.location.href=cgr('ga',globalData.roomNumber,'04',appData.maxCount)
    }
};
var socketModule = {
    getScoreDetail: function () {
        rd({
            operation: "getScoreDetail",
            session: globalData.session,
            data: {
                type: globalData.gameType,
                num: globalData.roomNumber,
            }
        });
    },
    processGetScoreDetail: function (obj) {
        var data = obj.data;
        appData.maxCount = data.mc;
        appData.ruleStartTime = data.ct;
        appData.ruleEndTime = data.et;
        appData.ruleText = data.rt;


        appData.player_avatar=data.p;

        appData.gameDetailList = new Array();

        for (var i = 0; i < data.pa.length; i++) {
            var item = data.pa[i];
            var detailArray = new Array();

            for (var j = 0; j < item.pc.length; j++) {
                var value = item.pc[j];

                if (value.score > 0) {
                    value.score = '+' + value.score;
                }
                if(data.p[value.aid].h.indexOf("http://")==-1&&data.p[value.aid].h.indexOf("https://")==-1){
                    data.p[value.aid].h=data.wh+"/"+data.p[value.aid].h
                }
                detailArray.push({
                    "avatar": data.p[value.aid].h,
                    "name": data.p[value.aid].n,
                    "card_type": value.cts,
                    "chip": value.c,
                    "is_banker": value.ib,
                    "is_join": value.ij,
                    "score": value.s,
                    "cards": value.ca.concat(),
                    "is_giveup":value.ig,
                    "pf":value.pf,
                    "account_id": value.aic
                });
            }
            appData.gameDetailList.push({
                "gnum": item.gn,
                "tnum": item.tn,
                "detail": detailArray,
                "show_detail":false,
            });


        }

        for(var i=0;i<appData.gameDetailList.length;i++){
            for(var j=0;j<appData.gameDetailList[i].detail.length;j++){
                if(appData.gameDetailList[i].detail[j].account_id==globalData.accountId){
                    appData.gameDetailList[i].my_score=appData.gameDetailList[i].detail[j].score;
                }
            }


        }
        setTimeout(function () {
            $("#loading").hide();
        },500)

    }
}
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
                window.location.reload();
            }
        }

        if (ws.readyState == WebSocket.OPEN) {
            // ws.send('@');
            shb('@');
        }
    }, 25000);

    socketModule.getScoreDetail();
}

var dealMessageFunc = function dealMessage(obj) {
    appData.connectOrNot = true;

    if (obj.result != 0) {
        alert(obj.result_message);
    } else {
        if (obj.operation == "getScoreDetail") {
            socketModule.processGetScoreDetail(obj);
        } else {
            logMessage(obj.operation);
        }
    }
}


var wsCloseCallback = function wsCloseCallback(data) {
    if(!appData.gameover){
        logMessage("websocket closed：");
        logMessage(data);
        appData.connectOrNot = false;
        reconnectSocket();
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

    if (ws) {
        logMessage(ws.readyState);
        if (ws.readyState == 1) { //websocket已经连接
            return;
        }

        ws = null;
    }

    logMessage('reconnectSocket');
    connectSocket(globalData.socket, wsOpenCallback, mc, wsCloseCallback, wsErrorCallback);
}
//Vue生命周期
var vueLife = {
    vmCreated: function () {
        logMessage('vmCreated')
        $(".main").show();
        reconnectSocket();
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


wx.ready(function () {
    wx.hideOptionMenu();
});
wx.error(function (a) {
});

function logMessage(message) {
    // console.log(message);
};
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}
