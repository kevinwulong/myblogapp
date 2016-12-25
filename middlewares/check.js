module.exports = {
	checkLogin : function checkLogin( req , res ,next ){
		if(!req.session.user ){
			req.flash('error' , '你并没有登录！！！');
			return res.redirect('/signin');
		} 
		next();
	},
	checkNotLogin : function checkNoLogin(req ,res , next){
		if(req.session.user){
			req.flash('error' ,'你好呀！！！');
			return res.redirect('back');
		}
		next();
	}
}
