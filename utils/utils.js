const sha1 = require('sha1');
const request = require('request');


//检查微信签名认证中间件  
const sign = function (query, config) {
    config = config || {};
    var token = config.wechat.token;
    var signature = query.signature; //微信加密签名
    var nonce = query.nonce; //随机数
    var timestamp = query.timestamp; //时间戳
    var echostr = query.echostr; //随机字符串
    /*
     1）将token、timestamp、nonce三个参数进行字典序排序
     2）将三个参数字符串拼接成一个字符串进行sha1加密
     3）开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
     */
    var str = [token, timestamp, nonce].sort().join('');
    var sha = sha1(str);
    if (sha == signature) {
        return echostr + '';
    } else {
        return 'err';
    }
};


//Promise化request
const http = function (opts) {
    opts = opts || {};
    return new Promise(function (resolve, reject) {
        request(opts, function (error, response, body) {

            if (error) {
                return reject(error);
            }
            resolve(body);
        })

    })

};


module.exports = {
    request: http,
    sign,
};