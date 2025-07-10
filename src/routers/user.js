const express = require("express");
const userRouter = express.Router();
const Image = require("../models/photos");
const Post = require("../models/post");
const PhotoReaction = require("../models/photo-reaction");
const PostReaction = require("../models/post-reaction");
const { userAuth } = require("../middleware/auth");

userRouter.post("/feed/", userAuth, async (req, res) => {
	try {
		const loggedUser = req.user._id;
		console.log("logged user:" + loggedUser);
		const { categ } = req.body;
		const distinctCategories = "";
		const postCategories = "";
		if (categ === "") {
			// Find categories for images uploaded by the logged user
			distinctCategories = await Image.distinct("category", {
				uploadedUserId: loggedUser,
			});
			// Find categories for posts uploaded by the logged user
			postCategories = await Post.distinct("category", {
				createdUserId: loggedUser,
			});
		} else {
			// Find categories for images uploaded by the logged user
			distinctCategories = categ;
			// Find categories for posts uploaded by the logged user
			postCategories = categ;
		}

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
					from: "images",
					localField: "photos",
					foreignField: "_id",
					as: "photoDetails",
				},
			},
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
					images: "$photoDetails",
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

		res.json({
			imageData: feedImageData,
			postData: feedPostData,
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

userRouter.get("/feed/get-uploaded-images", userAuth, async (req, res) => {
	try {
		const loggedUser = req.user;
		// const userId = "684196fc23f574b6b043f5f4";
		const images = await Image.find(
			{ uploadedUserId: loggedUser._id },
			"_id uploadedUserId url"
		);
		if (!images) {
			throw new Error("Images not found for the user");
		}
		res.json({ data: images });
	} catch (err) {
		console.log(err.message);
		res.status(400).send(err.message);
	}
});

module.exports = userRouter;
