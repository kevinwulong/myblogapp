var marked = require('marked');
var Post = require('../lib/mongo').Post;
var CommentModel = require('./comments');

//content转换成markdown
Post.plugin('contentToHtml',{
	afterFind: function(posts){
		return posts.map(function (post){
			post.content = marked(post.content);
			return post;
		});
	},
	afterFindOne :function(post){
		if(post){
			post.content = marked(post.content);
		}
		return post;
	}
});
//给post添加留言数commentcount
Post.plugin('addCommentsCount' , {
	afterFind: function( posts){
		return Promise.all(posts.map(function(post){
			return CommentModel.getCommentsCount(post._id)
				.then(function(commentsCount){
					post.commentsCount = commentsCount;
					return post;
				});
		}));
	},
	afterFindOne: function(post){
		if(post){
			return CommentModel.getCommentsCount(post._id)
			.then(function(count){
				post.commentsCount = count;
				return post;
			});
		}
		return post;
	}
})
module.exports = {
	//创建文章了
	create: function(post){
		return Post.create(post).exec();
	},

	//文章ID获取文章
	getPostById: function getPostById(postId){
		return Post.findOne({_id:postId})
		.populate({path:'author' , model: 'User'})
		.addCreatedAt()
		.addCommentsCount()
		.contentToHtml()
		.exec();
	},

	//创建时间降序获取所有用户文章或者某个特定用户的所有文章
	getPosts: function getPosts(author){
		var query = {};
		if(author){
			query.author = author;
		}
		return Post.find(query)
		.populate({path:'author',model: 'User'})
		.sort({_id : -1 })
		.addCreatedAt()
		.addCommentsCount()
		.contentToHtml()
		.exec();
	},

	//通过文章id给pv加1
	incPv: function incPv(postId){
		return Post
		.update({_id: postId} , {$inc: { pv:1 }})
		.exec();
	},

	//通过id获取原生文章
	getRawPostById : function getRawPostById(postId) {
		return Post
			.findOne({ _id :postId})
			.populate({ path: 'author' , model: 'User' })
			.exec();
	},
	//通过用户id和文章id更新一篇文章
	updatePostById :function updatePostById(postId , author , data) {
		return Post.update({ author : author , _id : postId} ,{$set :data  }).exec();
	},
	delPostById: function delPostById(postId , author){
		return Post.remove({author : author , _id : postId}) .exec();
	}

};

