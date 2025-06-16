var rd = function (obj) {
    var co = ranN(1000, 2000);
    obj.data.timestamp = Date.parse(new Date()) / 1000;
    obj.data.token = globalData.tk;
    var p = {operation: obj.operation, s: ps.s(obj.data), data: obj.data};
    console.log('发送的数据', p);
    fi(em(JSON.stringify(p), co));
}

var em = function (k, v) {
    var encrypted = C.AES.encrypt(k, C.enc.Utf8.parse('1234567887654321'), {
        iv: C.enc.Utf8.parse('8765432112345678'),
        mode: C.mode.CBC,
        padding: C.pad.ZeroPadding,
    });
    return encrypted.toString();
}

var shb = function (k) {
    ws.send(k);
}

var sfi = function (obj) {
    try {
        console.log('websocket state：' + ws.readyState);
        if (ws.readyState == WebSocket.CLOSED) {
            //socket关闭，重新连接
            reconnectSocket();
            return;
        }
        if (ws.readyState == WebSocket.OPEN) {
            ws.send(obj);
        } else if (ws.readyState == WebSocket.CONNECTING) {
            //如果还在连接中，1秒后重新发送请求
            setTimeout(function () {
                sfi(obj);
            }, 1000);
        } else {
            console.log('websocket state：' + ws.readyState);
        }

    } catch (err) {
        console.log(err);
    }
}
var fi = function (obj) {
    sfi(obj);
}

var rec = function (evt) {  
	gS(evt);
}

var gS = function (evt) {
	//console.log(evt);
	var res = evt.data;       
	if (res == "@" || res == '') {
		appData.socketStatus = 0;
		return 0;
	}
	ob = JSON.parse(wa(res)); 
    //console.log(ob);
    dealMessageFunc(ob);      
}

var mc = function (v) {
    if (v.data != "@") {
        rec(v);
    } else {
        ws.send('@');
        console.log('socketStatus', appData.socketStatus);
        appData.socketStatus = 0;
    }
}

var wa = function (res) {
    try {
        var dec = C.AES.decrypt(res, C.enc.Utf8.parse('1234567887654321'), {
            iv: C.enc.Utf8.parse('8765432112345678'),
            padding: C.pad.ZeroPadding
        });
        return dec.toString(C.enc.Utf8);
    } catch (e) {
        alert(e)
    }

};

var ps = {
    my: '14.215.177.38',
    sortCharter: function (a, b) {
        if (a.toString().toUpperCase() > b.toString().toUpperCase()) {
            return 1;
        } else if (a.toString().toUpperCase() == b.toString().toUpperCase()) {
            return 0;
        } else {
            return -1;
        }
    },
    objKeySort: function (obj) {
        var newkey = Object.keys(obj).sort(ps.sortCharter);
        var newObj = {};
        for (var i = 0; i < newkey.length; i++) {
            newObj[newkey[i]] = obj[newkey[i]];
        }
        return newObj;
    },
    ksort: function (inputArr, sort_flags) {
        var tmp_arr = {},
            keys = [],
            sorter, i, k, that = this,
            strictForIn = false,
            populateArr = {};

        switch (sort_flags) {
            case 'SORT_STRING':
                sorter = function (a, b) {
                    return that.strnatcmp(a, b);
                };
                break;
            case 'SORT_LOCALE_STRING':
                var loc = this.i18n_loc_get_default();
                sorter = this.php_js.i18nLocales[loc].sorting;
                break;
            case 'SORT_NUMERIC':
                sorter = function (a, b) {
                    return ((a + 0) - (b + 0));
                };
                break;
            default:
                sorter = function (a, b) {
                    var aFloat = parseFloat(a),
                        bFloat = parseFloat(b),
                        aNumeric = aFloat + '' === a,
                        bNumeric = bFloat + '' === b;
                    if (aNumeric && bNumeric) {
                        return aFloat > bFloat ? 1 : aFloat < bFloat ? -1 : 0;
                    } else if (aNumeric && !bNumeric) {
                        return 1;
                    } else if (!aNumeric && bNumeric) {
                        return -1;
                    }
                    return a > b ? 1 : a < b ? -1 : 0;
                };
                break;
        }

        for (k in inputArr) {
            if (inputArr.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        keys.sort(sorter);

        this.php_js = this.php_js || {};
        this.php_js.ini = this.php_js.ini || {};
        strictForIn = this.php_js.ini['phpjs.strictForIn'] && this.php_js.ini['phpjs.strictForIn'].local_value && this.php_js
            .ini['phpjs.strictForIn'].local_value !== 'off';
        populateArr = strictForIn ? inputArr : populateArr;

        for (i = 0; i < keys.length; i++) {
            k = keys[i];
            tmp_arr[k] = inputArr[k];
            if (strictForIn) {
                delete inputArr[k];
            }
        }
        for (i in tmp_arr) {
            if (tmp_arr.hasOwnProperty(i)) {
                populateArr[i] = tmp_arr[i];
            }
        }

        return strictForIn || populateArr;
    },
    s: function (e) {
        var data = ps.ksort(e);
        var str = '';
        for (var key in data) {
            str += key.toLowerCase() + '=' + ps.urlencode(data[key]).toLowerCase();
        }
        str = str + "1aa372c1427b93d84d9e213654e546ad";
        return md5.getMd5(str);
    },
    urlencode: function (clearString) {
        var output = '';
        var x = 0;
        clearString = ps.utf16to8(clearString.toString());
        var regex = /(^[a-zA-Z0-9-_.]*)/;
        while (x < clearString.length) {
            var match = regex.exec(clearString.substr(x));
            if (match != null && match.length > 1 && match[1] != '') {
                output += match[1];
                x += match[1].length;
            } else {
                if (clearString[x] == ' ')
                    output += '+';
                else {
                    var charCode = clearString.charCodeAt(x);
                    var hexVal = charCode.toString(16);
                    output += '%' + (hexVal.length < 2 ? '0' : '') + hexVal.toUpperCase();
                }
                x++;
            }
        }
        return output;
    },
    utf16to8: function (str) {
        var out, i, len, c;
        out = "";
        len = str.length;
        for (i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                out += str.charAt(i);
            } else if (c > 0x07FF) {
                out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            } else {
                out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            }
        }
        return out;
    },
    sb: function (str) {
        var result = [];
        var list = str.split("");
        for (var i = 0; i < list.length; i++) {
            if (i != 0) {
                result.push(" ");
            }
            var item = list[i];
            var binaryStr = item.charCodeAt().toString(2);
            result.push(binaryStr);
        }
        return result.join("");
    },
    bs: function (str) {
        var result = [];
        var list = str.split(" ");
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            var asciiCode = parseInt(item, 2);
            var charValue = String.fromCharCode(asciiCode);
            result.push(charValue);
        }
        return result.join("");
    },
    t: function () {
        var arr = new Array();
        for (var i = 0; i < 16; i++) {
            if (i != 0)
                arr.push(Math.pow(8, i))
        }
        return arr
    },
    o: function (e) {
        var arr = '';
        var b = 0;
        for (var i = 0; i < e.length; i++) {
            if (e[i] == '111000' || e[i] == '101100' || e[i] == '110010') {
                b++
            } else {
                arr += (e[i]);
            }
        }
        return {b, arr};
    },
    g: function (type) {
        var e = ps.t();
        var o = ps.sb(e.toString());
        var k = ps.o(o).arr;
        var bsk = ps.bs(k);
        var l = bsk.length.toString();
        var i = l[0].toString() + l[1].toString();
        var b = '';
        var a;
        for (var i = 1; i < l[2]; i++) {
            b = i + b
        }
        a = b.split("").reverse().join("");
        if (type) {
            return a + b
        } else {
            return b + a
        }
    }
}

function changeTitle(userName, roomNumber) {
    var new_userName = "";
    var old_userNname = userName;
    if (old_userNname.length > 8) {
        new_userName = old_userNname.substring(0, 7);
        new_userName += "..."
    } else {
        new_userName = old_userNname;
    }
    if (roomNumber) {
        document.getElementsByTagName("title")[0].innerText = roomNumber + " " + new_userName + "|" + globalData.hallName;
    } else {
        document.getElementsByTagName("title")[0].innerText = new_userName + "|" + globalData.hallName;

    }
}

function setC(name, value) {
    var exp = new Date();
    exp.setTime(exp.getTime() + 30 * 24 * 60 * 60 * 30);
    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}

function getC(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}

function delC(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getC(name);
    if (cval != null) {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
}

function getQueryFirstValue() {
    var query = window.location.search.substring(1);
    var vars = query.split("&")[0].split("=")[1];
    return vars;
}

var repeatTemp = [];

function repeat(s, t) {
    t = t ? t * 1000 : 3000;
    var time = new Date().getTime();
    if (!repeatTemp[s]) {
        repeatTemp[s] = time;
        return false;
    } else {
        var ts = t - (time - repeatTemp[s]);
        ts = parseInt(ts / 1000);
        if (ts > 0) {
            return true;
        } else {
            repeatTemp[s] = time;
            return false;
        }
    }
}





