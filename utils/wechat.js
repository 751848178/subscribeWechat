/*
 *微信相关操作api
 */
const config = require('../config/config');
const httpConf = require('../config/http');
const utils = require('./utils');
const api = httpConf.wechat;
const appID = config.wechat.appID;
const appSecret = config.wechat.appSecret;

//获取access_token
const getAccessToken = () => {
    var url = `${api.accessToken}&appid=${appID}&secret=${appSecret}`;
    //console.log(url);
    var option = {
        url : url,
        json : true
    };
    return utils.request(option).then(function(data){

        return Promise.resolve(data);
    })
};

// 获取带参二维码
const getQrcode = () => {
    var url = `${api.qrcode}&access_token=${appSecret}`;
    //console.log(url);
    var option = {
        url : url,
        json : true
    };
    return utils.request(option).then(function(data){

        return Promise.resolve(data);
    })
};

const wechatApi = {
    getAccessToken,
    getQrcode,
};

module.exports = wechatApi;