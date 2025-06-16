var httpModule = {
    loadMoreScoreList: function () {
        var data = {
            "account_id": userData.accountId,
            "page": appData.page,
            "game_type": appData.selectedGame.type,
            "wid":globalData.wid
        };

        Vue.http.post(globalData.baseUrl + 'game/roomStatusList', data).then(function(response) {
            var bodyData = response.body;

            appData.isHttpRequest = false;

            if (bodyData.result == 0) {
                appData.page = bodyData.page;
                appData.sumPage = bodyData.sum_page;

                for (var i = 0; i < bodyData.data.length;i++) {
                    var item = bodyData.data[i];
                    appData.gameScoreList.push({"number":item.room_number,"time":item.start_time,"status":item.status});
                }
                console.log(appData.gameScoreList);

            } else {
                console.log(bodyData.result_message);
            }

            appData.canLoadMore = true;
            if (bodyData.data.length>0) {
                $('#moretext').text('点击加载更多');
                $('#moretext').show();
            } else {
                appData.canLoadMore = false;
                $('#moretext').text('没有更多内容');
                $('#moretext').hide();
            }

        }, function(response) {
            appData.canLoadMore = true;
            appData.isHttpRequest = false;
        });
    },
};

var viewMethods = {
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
        appData.isShowAlert = false;
    },

};

var width = window.innerWidth;
var height = window.innerHeight;
var isTimeLimitShow = false;
var viewOffset = 4;
var itemOffset = 4;
var itemHeight = 66 / 320 * width;
var leftOffset = 8 / 320 * width;
var userViewHeight = 0.25 * width;
var avatarWidth = 0.21875 * width;
var avatarY = (userViewHeight - avatarWidth) / 2;
var itemY = (80 + 44 * 2 + 40) / 320 * width + viewOffset * 3 + itemOffset;

var groupOffset = 20;

var viewStyle = {
    sendRedpackage: {
        top: width * 0.25 + groupOffset + 'px',
    },
    redpackage: {
        top: width * 0.25 + viewOffset + groupOffset + 44 / 320 * width + 'px',
    },
    userList: {
        top: width * 0.25 + viewOffset * 1 + groupOffset + 44 / 320 * width * 1 + 'px',
    },
    groupMenu: {
        top:'0px',
    },
    groupMenuDetail: {
        top:'0px',
    },
    datepicker: {
        top: (80 + 44 * 2) / 320 * width + viewOffset * 3 * 4,
    },
    gameMenu: {
        top: (80 + 44 * 2) / 320 * width + viewOffset * 3 * 4,
        width: width,
    },
    gameScoreTitle: {
        top:0,
    },
};

var appData = {
    'viewStyle': viewStyle,
    'width': window.innerWidth,
    'height': window.innerHeight,
    'roomCard': Math.ceil(globalData.card),
    'user': userData,
    'activity': [],
    'isShowInvite': false,
    'isShowAlert': false,

    'alertType': 0,
    'alertText': '',
    'roomCardInfo': [],
    'select': 1,
    'ticket_count': 0,
    'isDealing': false,
    'gameItems':[],
    itemY:itemY,
    itemHeight: 66 / 320 * width,
    itemOffset: itemOffset,
    'isShowGroupMenu':0,
    'gameScoreList':[],
    bScroll:null,
    page:1,
    sumPage:1,
    canLoadMore:true,
    selectedGame:null,
    isHttpRequest:false,
    cardText:globalData.cardText,
};

function loadMoreScoreList() {
    appData.page = parseInt(appData.page) + 1;
    console.log(appData.page);
    httpModule.loadMoreScoreList();
    $('#moretext').show();
    $('#moretext').text('加载中...');
    return
    if (appData.page < appData.sumPage) {
        appData.page = parseInt(appData.page) + 1;
        console.log(appData.page);
        httpModule.loadMoreScoreList();
        $('#moretext').show();
        $('#moretext').text('加载中...');
    } else {
        $('#moretext').hide();
        $('#moretext').text('点击加载更多');
    }
};

function refreshBScroll() {
    Vue.nextTick(function () {
        if (!appData.bScroll) {
            appData.bScroll = new BScroll(document.getElementById('memberDiv'), {
                startX: 0,
                startY: 0,
                scrollY: false,
                scrollX: true,
                click: true,
                bounceTime: 500,
            });
        } else {
            appData.bScroll.refresh();
        }
    });
};

refreshBScroll();

for (var i = 0; i < globalData.gameList.length; i++) {
    appData.gameItems.push({
        "avatar":globalData.fileUrl+"files/images/gameicon/"+globalData.gameList[i].game_icon,
        "name":globalData.gameList[i].game_name,
        "isChecked":0,
        "type":globalData.gameList[i].game_type
    });
}


function refreshView() {
    if (appData.isShowGroupMenu) {
        if(appData.isPhone) {
            var topOffset = (0.25 + 0.1375 * 2) * width + viewOffset * 2 + groupOffset;
            topOffset = 0.02 * width;
            if (userData.groupOpen == 1) {
                viewStyle.groupMenu.top = topOffset + groupOffset;
                viewStyle.groupMenuDetail.top = viewStyle.groupMenu.top + viewOffset + 0.1375 * width;
                viewStyle.datepicker.top = viewStyle.groupMenuDetail.top + 0.275 * width + groupOffset;
                appData.itemY = viewStyle.datepicker.top + 0.125 * width + itemOffset;
            } else {
                viewStyle.groupMenu.top = topOffset + groupOffset;
                viewStyle.datepicker.top = viewStyle.groupMenu.top + 0.1375 * width + groupOffset;
                appData.itemY = viewStyle.datepicker.top + 0.125 * width + itemOffset;
            }

        } else {
            var topOffset = (0.25 + 0.1375 * 1) * width + viewOffset + 20;
            topOffset = 0.02 * width;
            if (userData.groupOpen == 1) {
                viewStyle.groupMenu.top = topOffset + groupOffset;
                viewStyle.groupMenuDetail.top = viewStyle.groupMenu.top + viewOffset + 0.1375 * width;
                viewStyle.datepicker.top = viewStyle.groupMenuDetail.top + 0.275 * width + groupOffset;
                appData.itemY = viewStyle.datepicker.top + 0.125 * width + itemOffset;
            } else {
                viewStyle.groupMenu.top = topOffset + groupOffset;
                viewStyle.datepicker.top = viewStyle.groupMenu.top + 0.1375 * width + groupOffset;
                appData.itemY = viewStyle.datepicker.top + 0.125 * width + itemOffset;
            }
        }

        viewStyle.gameMenu.top = viewStyle.datepicker.top;
        viewStyle.gameScoreTitle.top = viewStyle.gameMenu.top + 0.25 * width + itemOffset;
        appData.itemY = viewStyle.gameScoreTitle.top + 0.13 * width + itemOffset;
    } else {
        if(appData.isPhone) {
            var topOffset = (0.25 + 0.1375 * 2) * width + viewOffset * 2 + groupOffset;
            topOffset = 0.02 * width;
            if (userData.groupOpen == 1) {
                viewStyle.groupMenu.top = topOffset + groupOffset;
                viewStyle.datepicker.top = topOffset + groupOffset;
                appData.itemY = viewStyle.datepicker.top + 0.125 * width + itemOffset;
            } else {
                viewStyle.datepicker.top = topOffset + groupOffset;
                appData.itemY = viewStyle.datepicker.top + 0.125 * width + itemOffset;
            }

        } else {
            var topOffset = (0.25 + 0.1375 * 1) * width + viewOffset + 20;
            topOffset = 0.02 * width;
            if (userData.groupOpen == 1) {
                viewStyle.datepicker.top = topOffset + groupOffset;
                appData.itemY = viewStyle.datepicker.top + 0.125 * width + itemOffset;
            } else {
                viewStyle.datepicker.top = topOffset + groupOffset;
                appData.itemY = viewStyle.datepicker.top + 0.125 * width + itemOffset;
            }
        }

        viewStyle.gameMenu.top = viewStyle.datepicker.top;
        viewStyle.gameScoreTitle.top = viewStyle.gameMenu.top + 0.25 * width + itemOffset;
        appData.itemY = viewStyle.gameScoreTitle.top + 0.13 * width + itemOffset;
    }
};

//refreshView();

Date.prototype.format = function(fmt) {
 var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt)) {
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
         fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
     }
 }
 return fmt;
};


//Vue方法
var methods = {
    showAlert: viewMethods.clickShowAlert,
    closeAlert: viewMethods.clickCloseAlert,
    gotoHall:function () {
        window.location.href = DynLoading.getPath('/');
    },
    clickMore:function () {
        if (appData.canLoadMore) {
            $('#moretext').text('加载中...');
            $('#moretext').show();
            appData.canLoadMore = false;
            setTimeout(function() {
                appData.canLoadMore = true;
                $('#moretext').text('点击加载更多');
            }, 5000);

            loadMoreScoreList();
        }
    },
    clickGame:function (item) {
        try {
            if (appData.selectedGame) {
                if (appData.selectedGame.type == item.type) {
                    return;
                }
            }

            if (appData.isHttpRequest) {
                return;
            }

            for (var i = 0; i < globalData.gameList.length; i++) {
                var type = globalData.gameList[i].game_type;
                type = 'game' + type;
                var obj = $('#' + type);
                $('#' + type).css("opacity", "0.3");
            }

            var selectGame = 'game' + item.type;
            $('#' + selectGame).css("opacity", "1");
            appData.selectedGame = item;
            appData.gameScoreList = [];
            appData.page = 1;
            appData.sumPage = 1;
            httpModule.loadMoreScoreList();

            appData.isHttpRequest = true;

            setTimeout(function() {
                appData.isHttpRequest = false;
            }, 5000);
        } catch (error) {
            console.log(error);
        }
    },

    clickScoreItem: function (item) {
        if (!appData.selectedGame) {
            return;
        }
        var url = globalData.baseUrl + 'game/queryCard?type=' + appData.selectedGame.type + '&num='+item.number;
        window.location.href = url;
    },
};

//Vue生命周期
var vueLife = {
    vmCreated: function () {
        logMessage('vmCreated')
        $("#loading").hide();
        $(".main").show();
    },
    vmUpdated: function () {
        logMessage('vmUpdated');
    },
    vmMounted: function () {
        logMessage('vmMounted');
        // if (appData.gameItems.length >= 1) {
        //     if (globalData.gameType.length >= 1) {
        //         for (var i = 0; i < appData.gameItems.length;i++) {
        //             var item = appData.gameItems[i];
        //             if (item.type == globalData.gameType) {
        //                 methods.clickGame(item);
        //                 break;
        //             }
        //         }
        //     } else {
        //         methods.clickGame(appData.gameItems[0]);
        //     }
        // }
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

//微信配置
wx.config({
    debug:false,
    appId:configData.appId,
    timestamp:configData.timestamp,
    nonceStr:configData.nonceStr,
    signature:configData.signature,
    jsApiList:[ "onMenuShareTimeline", "onMenuShareAppMessage", "hideMenuItems" ]
});
wx.ready(function() {
    wx.hideOptionMenu();
});
wx.error(function(a) {});

function logMessage(message) {
    console.log(message);
};

