var path = require('path');
var sha1 = require('sha1');
var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signup 注册页
router.get('/', checkNotLogin, function(req, res, next) {
  res.render('signup');
});

// POST /signup 用户注册
router.post('/', checkNotLogin, function(req, res, next) {
  var name = req.fields.name;
  var gender = req.fields.gender;
  var bio = req.fields.bio;
  var avatar = req.files.avatar.path.split(path.sep).pop();
  var password = req.fields.password;
  var repassword = req.fields.repassword;

  try {
  	if(!(name.length>=1 &&name.length<=12)){
  		throw new Error('用户名请输入1-12个字符');
  	}
  	if( ['m', 'f' ,'x'].indexOf(gender) ===-1 ){
  		throw new Error('求性别');
  	}
  	if(!(bio.length>=1 && bio.length <=30)){
  		throw new Error('介绍不要少于1一个或者超过30个字！');
  	}
  	if(!req.files.avatar.name){
  		throw new Error('你没头像怎么装逼？');
  	}
  	if(password.length <6){
  		throw new Error('密码太短了！');
  	}
  	if(password !== repassword){
  		throw new Error('两次密码都不一样你怎么注册');
  	}
  }
  catch(e){
  	req.flash('error',e.message);
  	return res.redirect('/signup')
  };
  //加密
  password = sha1(password);
  //写入数据库的信息
  var user = {
  	name:name,
  	password:password,
  	gender:gender,
  	bio:bio,
  	avatar:avatar
  };
 UserModel.create(user)
    .then(function (result) {
      // 此 user 是插入 mongodb 后的值，包含 _id
      user = result.ops[0];
      // 将用户信息存入 session
      delete user.password;
      req.session.user = user;
      // 写入 flash
      req.flash('success', '注册成功');
      // 跳转到首页
      res.redirect('/posts');
    })
  .catch(function(e){
  	if(e.message.match('E11000 duplicate key')){
  		req.flash('error' ,'用户名已被占用');
  		return res.redirect('/signup');
  	}
  	next(e);
  });
});

module.exports = router;