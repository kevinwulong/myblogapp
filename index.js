var path = require('path');
var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var config = require('config-lite');
var routes = require('./routes');
var pkg = require('./package');

var app = express();
//模板目录 //模板引擎ejs
app.set('views' , path.join(__dirname , 'views'));
app.set('view engine' , 'ejs');

//开放静态文件
app.use(express.static(path.join(__dirname, 'public')));

//session
app.use(session({
	//设置cookie保存id的字段名称
	name: config.session.key,
	//通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
	secret:config.session.secret,
	cookie : {
		//过期时间，过期后 cookie 中的 session id 自动删除
		maxAge : config.session.maxAge
	},
	store: new MongoStore({
		//将session 存储到mongodb
		url: config.mongodb //地址
	})
}));

//flash中间件
app.use(flash());

//处理表单和文件上传的中间件
app.use(require('express-formidable')({
	//上传文件的目录
	uploadDir: path.join(__dirname , 'public/img'),
	//保留后缀
	keepExtensions :true
}))

// 设置模板全局常量
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
};

// 添加模板必需的三个变量
app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  res.locals.success = req.flash('success').toString();
  res.locals.error = req.flash('error').toString();
  next();
});
//router
routes(app);



app.listen(config.port , function(){
	console.log(`${pkg.name} listening on port ${config.port}`);
})