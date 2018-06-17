const Koa = require("koa");
const router = require("koa-router")();

const config = require("./config/config");
const utils = require("./utils/utils");
const redis = require("./utils/redis");
const wechatApi = require("./utils/wechat");
const wechat = require("co-wechat");

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
	ctx.body = res;
});

router.get("/wx/subscribe", async (ctx, next) => {
	await next();
	let query = ctx.request.query;
	// wechatApi.getQrcode(query);
	// {"expire_seconds": 604800, "action_name": "QR_SCENE", "action_info": {"scene": {"scene_id": 123}}}
	await redis.hmset("userInfo", Object.assign({}, {name: "xingbo", age: 21}, query), 7180);
	// let res = await redis.hmget("userInfo");
	let res = utils.sign({
		FromUserName: query.FromUserName,
		CreateTime: query.CreateTime
	}, config);
    ctx.body = res;
});

router.post("/wx/wechat", wechat(config.wechat).middleware(async (msg, ctx) => {
	console.log(JSON.stringify(msg));
	await redis.hmset("msgInfo", msg, 7180);
	// 微信输入信息就是这个 message
	if (message.FromUserName === 'diaosi') {
		// 回复屌丝(普通回复)
		return 'hehe';
	} else if (message.FromUserName === 'text') {
		//你也可以这样回复text类型的信息
		return {
			content: 'text object',
			type: 'text'
		};
	} else if (message.FromUserName === 'hehe') {
		// 回复一段音乐
		return {
			type: "music",
			content: {
				title: "来段音乐吧",
				description: "一无所有",
				musicUrl: "http://mp3.com/xx.mp3",
				hqMusicUrl: "http://mp3.com/xx.mp3"
			}
		};
	} else if (message.FromUserName === 'kf') {
		// 转发到客服接口
		return {
			type: "customerService",
			kfAccount: "test1@test"
		};
	} else {
		// 回复高富帅(图文回复)
		return [
			{
				title: '你来我家接我吧',
				description: '这是女神与高富帅之间的对话',
				picurl: 'http://nodeapi.cloudfoundry.com/qrcode.jpg',
				url: 'http://nodeapi.cloudfoundry.com/'
			}
		];
	}
}));

app.use(router.routes());

app.listen(3001);