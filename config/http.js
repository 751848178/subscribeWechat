const wechat = {
    accessToken: `${config.wechat.prefix}/token?grant_type=client_credential`,
    qrcode: `${config.wechat.prefix}/qrcode/create?`,
    /*upload: `${config.wechat.prefix}/media/upload?`,
    upload: `${config.wechat.prefix}/media/upload?`*/
}

module.exports = {
    wechat
};