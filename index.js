const Koa = require("koa");
const router = require("koa-router")();

const config = require("./config/config");
const utils = require("./utils/utils");
const redis = require("./utils/redis");
const wechatApi = require("./utils/wechat");

let app = new Koa();

//获取,验证access_token,存入redis中
app.use(async (ctx, next) => {
	//根据token从redis中获取access_token
	redis.get(config.wechat.token).then(function(data){
		//获取到值--往下传递
		if (data) {
			return Promise.resolve(data);
		}
		//没获取到值--从微信服务器端获取,并往下传递
		else{
			return wechatApi.getAccessToken();
		}
	}).then(function(data){
		//没有expire_in值--此data是redis中获取到的
		if (!data.expires_in) {
			// console.log('redis获取到值' + JSON.stringify(data));
			ctx.accessToken = data;
		}
		//有expire_in值--此data是微信端获取到的
		else{
			// console.log('redis中无值');
			/**
			 * 保存到redis中,由于微信的access_token是7200秒过期,
			 * 存到redis中的数据减少20秒,设置为7180秒过期
			 */
			redis.set(config.wechat.token,`${data.access_token}`,7180).then(function(result){
				if (result == 'OK') {
					ctx.accessToken = data.access_token;
				}
			})
		}

	})
	await next();
});

router.get("/wx", async (ctx, next) => {
	await next();
	let res = utils.sign(ctx.request.query, config);
	/* ctx.body = {
	 code: 200,
	 data: "",
	 msg: ""
	 }; */
	await redis.hmset("wechatEvent", ctx.request.query, 7180);
	console.log(res);
	ctx.body = Object.assign({}, res, ctx.request.query);
});

router.get("/wx/subscribe", async (ctx, next) => {
	await next();
	let query = ctx.request.query;
	// wechatApi.getQrcode(query);
	// {"expire_seconds": 604800, "action_name": "QR_SCENE", "action_info": {"scene": {"scene_id": 123}}}
	await redis.hmset("userInfo", Object.assign({}, {name: "xingbo", age: 21}, query), 7180);
	let res = await redis.hmget("userInfo");
    ctx.body = res;
});

app.use(router.routes());

app.listen(3001);