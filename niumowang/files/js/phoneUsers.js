var httpModule={
    getPhoneAccountList:function(){
        var e={
            account_id:userData.accountId,
            page:appData.page,
            token:globalData.tk
        };
        Vue.http.post(BaseUrl+"/transfer/phoneAccountList",e).then(function(e){
            logMessage(e.body);
            var t=e.body;
            if(0==t.result){
                var n=t.data;
                appData.page=t.page;
                appData.sumPage=t.sum_page;
                for(var r=0;r<n.length;r++){
                    var i=n[r];
                    appData.members.push({
                        name:i.nickname,
                        avatar:i.headimgurl,
                        account_id:i.account_id,
                        ticket:i.ticket_count,
                        is_cantransfer:i.can_transfer_out,
                        checked:!1
                    })
                }
            } else
                console.log(t.result_message);
            //refreshBScroll();
            appData.canLoadMore=!0;
            appData.page<appData.sumPage?
                ($("#moretext").text("上拉加载更多"),$("#moretext").show(),console.log("加载更多啊")):
                ($("#moretext").text("没有更多内容"),$("#moretext").hide(),console.log("没有更多内容"))
        }, function(e){
            appData.canLoadMore=!0;
            logMessage(e.body)
        })
    },
    confirmTranfer:function(e){
        var t={
            account_id:userData.accountId,
            transfer_aid:appData.selectedItem.account_id,
            receive_aid:appData.receiveItem.account_id
        };
        console.log(t);
        Vue.http.post(BaseUrl+"/transfer/transferPhoneTicket",t).then(function(e){
            viewMethods.clickCloseAlert();
            var t=e.body;
            var n=appData.selectedItem.ticket;
            var r=appData.receiveItem.ticket;
            if(0==t.result){
                appData.showTranfer=!1;
                for(var i=0;i<appData.members.length;i++){
                    var o=appData.members[i];
                    if(o.account_id==appData.receiveItem.account_id){
                        o.ticket=parseInt(n)+parseInt(r);
                        o.is_cantransfer=1;
                    } else if(o.account_id==appData.selectedItem.account_id){
                        o.ticket=0;
                        o.is_cantransfer=0;
                    }
                }
                methods.showAlertInfo(2,"转移成功")
            } else
                methods.showAlertInfo(1,t.result_message)
        }, function(e){
            viewMethods.clickCloseAlert();
            logMessage(e.body)
        })
    }
};

var viewMethods={
    clickShowAlert:function(e,t){
        appData.alertType=e;
        appData.alertText=t;
        appData.isShowAlert=!0;
        setTimeout(function(){
            var t=$(".alertText").height(),n=t;
            t<.15*height&&(t=.15*height),
            t>.8*height&&(t=.8*height);
            var r=t+.056*height*2+.022*height+.056*height;
            8==e&&(r=r-.022*height-.056*height);
            var i=t+.034*height*2,o=.022*height+(i-n)/2;
            $(".alert .mainPart").css("height",r+"px"),
                $(".alert .mainPart").css("margin-top","-"+r/2+"px"),
                $(".alert .mainPart .backImg .blackImg").css("height",i+"px"),
                $(".alert .mainPart .alertText").css("top",o+"px")
        },0)
    },
    clickCloseAlert:function(){
        appData.isShowAlert=!1;
    },

    showMessage:function(){$(".message .textPart").animate({height:"400px"}),appData.isShowMessage=!0},
    hideMessage:function(){$(".message .textPart").animate({height:0},function(){appData.isShowMessage=!1})},
};

var width=window.innerWidth;
var height=window.innerHeight;

var appData={
    width:window.innerWidth,
    height:window.innerHeight,
    roomCard:Math.ceil(globalData.card),
    user:userData,
    activity:[],
    isShowAlert:!1,
    isShowMessage:!1,
    alertType:0,
    alertText:"",
    roomCardInfo:[],
    select:1,
    ticket_count:0,
    isShowAlert:!1,
    alertType:1,
    alertText:"",
    members:[],
    tMembers:[],
    searchText:"",
    page:1,
    sumPage:1,
    selectedItem:"",
    receiveItem:"",
    receiveID:"",
    bScroll:null,
    tBScroll:null,
    canLoadMore:!0,
    showTranfer:!1,
    alert:{text:"",isShow:!1}
};

var methods={
    showAlert:viewMethods.clickShowAlert,
    closeAlert:viewMethods.clickCloseAlert,
    showMessage:viewMethods.showMessage,
    hideMessage:viewMethods.hideMessage,

    clickTranfer:function(){
        if(null==appData.receiveItem||void 0==appData.receiveItem)
            return void viewMethods.clickShowAlert(7,"请先选择转移账号");
        viewMethods.clickShowAlert(17,"是否确定转移至"+appData.receiveItem.name+"?")
    },
    confirmTranfer:function(){
        if(null==appData.receiveItem||void 0==appData.receiveItem)
            return void viewMethods.clickShowAlert(7,"请先选择转移到哪个账号");
        httpModule.confirmTranfer();
    },
    clickShowTranfer:function(e){
        appData.tMembers=[];
        for(var t=0;t<appData.members.length;t++){
            var n=appData.members[t];
            if(n.account_id!=e.account_id){
                n.checked=!1;
                appData.tMembers.push(n);
            }
        }
        appData.showTranfer=!0;
        appData.selectedItem=e;
        appData.receiveItem=null;
        appData.receiveID="";
        console.log(e);
    },
    hideTranfer:function(){
        appData.showTranfer=!1
    },
    clickTMember:function(e){
        for(var t=0;t<appData.tMembers.length;t++){
            appData.tMembers[t].checked=!1
        }
        appData.receiveItem=e;
        appData.receiveID=e.account_id;
        console.log(e.account_id);
        e.checked=!0
    },
    showAlertInfo:function(e,t){
        appData.alert.text=t,
            appData.alert.type=e,
            appData.alert.isShow=!0,
            setTimeout(function(){
                appData.alert.isShow=!1
            },1500)
    }
};

var vueLife={
    vmCreated:function(){
        logMessage("vmCreated"),
            $("#loading").hide(),
            $(".main").show(),
            httpModule.getPhoneAccountList()
    },
    vmUpdated:function(){
        logMessage("vmUpdated")
    },
    vmMounted:function(){logMessage("vmMounted")},
    vmDestroyed:function(){logMessage("vmDestroyed")}
};

var vm=new Vue({
    el:"#app-main",
    data:appData,
    methods:methods,
    created:vueLife.vmCreated,
    updated:vueLife.vmUpdated,
    mounted:vueLife.vmMounted,
    destroyed:vueLife.vmDestroyed
});

scrollDisable=!1;
memberDiv=document.querySelector("#memberDiv");
wx.config({
    debug:!1,
    appId:configData.appId,
    timestamp:configData.timestamp,
    nonceStr:configData.nonceStr,
    signature:configData.signature,
    jsApiList:["onMenuShareTimeline","onMenuShareAppMessage","hideMenuItems"]
});
wx.ready(function(){
    wx.hideOptionMenu()
});
wx.error(function(e){});

function loadMoreData(){
    appData.page<appData.sumPage?
        (appData.page=appData.page+1,httpModule.getPhoneAccountList(),
            $("#moretext").show(),$("#moretext").text("加载中...")):
        ($("#moretext").hide(),$("#moretext").text("上拉加载更多"))
}
function refreshBScroll(){}
function refreshTBScroll(){}
function logMessage(e){console.log(e)}