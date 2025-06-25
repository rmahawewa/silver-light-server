const express = require("express");
const userRouter = express.Router();
const Image = require("../models/photos");
const Post = require("../models/post");
const PhotoReaction = require("../models/photo-reaction");
const PostReaction = require("../models/post-reaction");
const { userAuth } = require("../middleware/auth");

// userRouter.get("/feed", async (req, res) => {
// 	try {
// 		const loggedUser = "6841738705c90d15f9f0b308";
// 		const categoriesObjectArray = await Image.find({
// 			uploadedUserId: loggedUser,
// 		}).select("category");
// 		const categoriesArray = new Set();
// 		categoriesObjectArray.forEach((categ) => {
// 			categ.category.forEach((c) => {
// 				categoriesArray.add(c);
// 			});
// 		});
// 		const releventImages = await Image.find({
// 			category: { $in: Array.from(categoriesArray) },
// 		});
// 		const imageIds = new Array();
// 		releventImages.forEach((img) => {
// 			imageIds.push(img._id);
// 		});
// 		const releventReactions = await PhotoReaction.find({
// 			photoId: { $in: Array.from(imageIds) },
// 		});
// 		const like = new Array();
// 		const familier = new Array();
// 		const aTrue = new Array();
// 		const love = new Array();
// 		const wonderful = new Array();
// 		const iFeelJelousy = new Array();
// 		releventReactions.forEach((r) => {
// 			if (r.reactionType === "like") like.push(r);
// 			if (r.reactionType === "familier") familier.push(r);
// 			if (r.reactionType === "aTrue") aTrue.push(r);
// 			if (r.reactionType === "love") love.push(r);
// 			if (r.reactionType === "wonderful") wonderful.push(r);
// 			if (r.reactionType === "iFeelJelousy") iFeelJelousy.push(r);
// 		});

// 		res.json({
// 			imageData: releventImages,
// 			like: like,
// 			familier: familier,
// 			aTrue: aTrue,
// 			love: love,
// 			wonderful: wonderful,
// 			iFeelJelousy: iFeelJelousy,
// 		});
// 	} catch (err) {
// 		console.error(err.message);
// 	}
// });

userRouter.get("/feed", userAuth, async (req, res) => {
	try {
		// const loggedUser = req.user._id;
		const loggedUser = "6841738705c90d15f9f0b308";
		// Find categories for images uploaded by the logged user
		const distinctCategories = await Image.distinct("category", {
			uploadedUserId: loggedUser,
		});
		// Find categories for posts uploaded by the logged user
		const postCategories = await Post.distinct("category", {
			uploadedUserId: loggedUser,
		});
		//Find relevent images and their reactions using aggregation
		const feedImageData = await Image.aggregate([
			{ $match: { category: { $in: distinctCategories } } },
			// Lookup reactions for these images
			{
				$lookup: {
					from: "photoreactions",
					localField: "_id",
					foreignField: "photoId",
					as: "reactions",
				},
			},
			//Project the required fields and restructure data for the client
			{
				$project: {
					_id: 1,
					uploadedUserId: 1,
					fileName: 1,
					url: 1,
					photoTitle: 1,
					category: 1,
					photoDescription: 1,
					//photo-reaction fields
					reactions: {
						_id: 1,
						reactionType: 1,
						reactedById: 1,
					},
				},
			},
		]);
		//Find relevent posts and their reactions using aggregation
		const feedPostData = await Post.aggregate([
			{ $match: { category: { $in: postCategories } } },
			//Lookup reactions for these posts
			{
				$lookup: {
					from: "postreactions",
					localField: "_id",
					foreignField: "postId",
					as: "post_reactions",
				},
			},
			//Project the required fields and restructure post-reaction data for the client
			{
				$project: {
					_id: 1,
					createdUserId: 1,
					title: 1,
					photos: 1,
					category: 1,
					description: 1,
					post_reactions: {
						_id: 1,
						reactionType: 1,
						reactedById: 1,
					},
				},
			},
		]);
		//Process reactions to get counts an seperate arrays
		// const allReactions = [];
		// feedImageData.forEach((image) => {
		// 	if (image.reactions) {
		// 		allReactions.push(...image.reactions);
		// 	}
		// });
		// const like = [];
		// const familier = [];
		// const aTrue = [];
		// const love = [];
		// const wonderful = [];
		// const iFeelJelousy = [];

		// allReactions.forEach((r) => {
		// 	if (r.reactionType === "like") like.push(r);
		// 	else if (r.reactionType === "familier") familier.push(r);
		// 	else if (r.reactionType === "aTrue") aTrue.push(r);
		// 	else if (r.reactionType === "love") love.push(r);
		// 	else if (r.reactionType === "wonderful") wonderful.push(r);
		// 	else if (r.reactionType === "iFeelJelousy") iFeelJelousy.push(r);
		// });

		//Process post reactions to get counts an seperate arrays
		// const allPostReactions = [];
		// feedPostData.forEach((post) => {
		// 	if (post.post_reactions) {
		// 		allPostReactions.push(...post.post_reactions);
		// 	}
		// });
		// const postLike = [];
		// const postFamilier = [];
		// const postAtrue = [];
		// const postLove = [];
		// const postWonderful = [];
		// const postIfeelJelousy = [];

		// allPostReactions.forEach((r) => {
		// 	if (r.reactionType === "like") postLike.push(r);
		// 	else if (r.reactionType === "familier") postFamilier.push(r);
		// 	else if (r.reactionType === "aTrue") postAtrue.push(r);
		// 	else if (r.reactionType === "love") postLove.push(r);
		// 	else if (r.reactionType === "wonderful") postWonderful.push(r);
		// 	else if (r.reactionType === "iFeelJelousy") postIfeelJelousy.push(r);
		// });

		res.json({
			imageData: feedImageData,
			// imageData: feedImageData.map(
			// 	({ reactions, ...imageFields }) => imageFields
			// ),
			// reactions: {
			// 	like: like,
			// 	familier: familier,
			// 	atrue: aTrue,
			// 	love: love,
			// 	wonderful: wonderful,
			// 	iFeelJelousy: iFeelJelousy,
			// },
			postData: feedPostData,
			// postData: feedPostData.map(
			// 	({ post_reactions, ...postFields }) => postFields
			// ),
			// postReactions: {
			// 	like: postLike,
			// 	familier: postFamilier,
			// 	atrue: postAtrue,
			// 	love: postLove,
			// 	wonderful: postWonderful,
			// 	iFeelJelousy: postIfeelJelousy,
			// },
		});
	} catch (err) {
		console.log(err.message);
		res.status(400).send(err.message);
	}
});

userRouter.get("/feed/postcomments", userAuth, async (req, res) => {
	try {
		const loggedUser = req.user;
		const postCategories = await Post.distinct("category", {
			uploadedUserId: loggedUser,
		});
		const feedPostData = await Post.aggregate([
			{ $match: { category: { $in: postCategories } } },
			//Lookup comments for these posts
			{
				$lookup: {
					from: "postcomments",
					localField: "_id",
					foreignField: "postId",
					as: "comments",
				},
			},
			//Project the required fields and restructure data for the client
			{
				$project: {
					_id: 1,
					comments: {
						_id: 1,
						postId: 1,
						parentCommentId: 1,
						commentByUser: 1,
						comment: 1,
					},
				},
			},
		]);
		//Process comments to store in a seperate array
		const commentsArray = [];
		feedPostData.forEach((comment) => {
			if (comment.comments) {
				commentsArray.push(...comment.comments);
			}
		});

		res.json({
			postData: feedPostData.map(({ comments, ...postContent }) => postContent),
			comments: commentsArray,
		});
	} catch (err) {
		res.status(400).send(err.message);
	}
});

module.exports = userRouter;
