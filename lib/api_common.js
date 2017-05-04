'use strict';

const urllib = require('urllib');
const url = require('url');
const util = require('./util');
const wrapper = util.wrapper;
const crypto = require('crypto');
const queryString = require("querystring");
var checkConfig = require('./checkConfig.json');

/**
 * API构造函数
 * 
 * @param {String} accountSid 开发者账号ID,注册云之讯官网，在控制台中即可获取此参数
 * @param {String} authToken 账户授权令牌,相当于开发者账号ID（Account Sid）的密码,注册云之讯官网，在控制台中即可获取此参数
 */


const API = function (accountSid, authToken) {
    this.accountSid = accountSid;
    this.authToken = authToken;
};

/**
 * API-发送验证码接口
 * 
 * @param {String} appId 云之讯不同应用都会有一个唯一的AppId
 * @param {String} code 验证码信息，如果有多个参数则需要写在同一个字符串中，以逗号分隔. （如：param=“a,b,c”）
 * @param {String} templateId 短信模板Id
 * @param {String} phoneNo 接收短信的手机号码
 * @param {Function} callback 回调函数的参数(err, data, res)
 */
API.prototype.checkConfig = checkConfig;
API.prototype.identifyingCode = function (appId, code, templateId, phoneNo, callback) {
    let url = this.getIdentifyingCodeURL();
    let date = new Date().Format("yyyyMMddhhmmss");
    let Authorization = this.accountSid + ":" + date;
    var Authorization_buffer = new Buffer(Authorization);
    var Authorization_base64 = Authorization_buffer.toString('base64');

    urllib.request(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Authorization': Authorization_base64
        },
        data:
        {
            "templateSMS":
            {
                "appId": appId,
                "param": code,
                "templateId": templateId,
                "to": phoneNo
            }
        }
    }, function (err, data, res) {
        if (err) {
            callback(err, data, res);
        }
        callback(null, data, res);
    });
};
/**
 * API-获取发送验证码URL接口
 * 
 * @param null
 */
API.prototype.getIdentifyingCodeURL = function () {
    let opts = {
        version: "/2014-06-30",
        type: "/Messages",
        accountSid: this.accountSid,
        authToken: this.authToken,
        Accounts: "/Accounts",
        operation: "/templateSMS"
    };
    return this._getIdentifyingCodeURL(opts);
};
/**
 * API-获取发送验证码URL参数版接口
 * 
 * @param {object} opts={version,type,accountSid,authToken,Accounts,operation}
 */
API.prototype._getIdentifyingCodeURL = function (opts) {
    let md5 = crypto.createHash('md5');
    let date = new Date().Format("yyyyMMddhhmmss");
    md5.update(opts.accountSid + opts.authToken + date);
    let md5_sig = md5.digest('hex');
    let md5_sig_upper = md5_sig.toUpperCase();

    var localquerystring = queryString.stringify({
        sig: md5_sig_upper
    });


    var urlObj = {
        protocol: "https",
        slashes: true,
        hostname: "api.ucpaas.com",
        pathname: _getPathname(opts),
        search: localquerystring
    }

    var urlresult = url.format(urlObj);
    return urlresult;
};

const _getPathname = function (opts) {
    return opts.version + opts.Accounts + "/" + opts.accountSid + opts.type + opts.operation;
};

module.exports = API;

Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

