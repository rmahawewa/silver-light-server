const express = require("express");
const postRouter = express.Router();
const Post = require("../models/post");
const { userAuth } = require("../middleware/auth");
const { validatePostPhotoData } = require("../utils/validation");

postRouter.post("/post/save", userAuth, async (req, res) => {
	try {
		const loggedInuser = req.user;
		const { images, title, description, category } = req.body;
		validatePostPhotoData(req);
		const post = new Post({
			createdUserId: loggedInuser,
			title,
			photos: images,
			category: category,
			description,
		});
		const savedPost = await post.save();
		if (savedPost && category.length === 0) {
			await savedPost.addCategoriesFromImages();
		}
		const newPostWithImages = await Post.findById({
			_id: savedPost._id,
		}).populate("photos", "_id url photoTitle");
		console.log(newPostWithImages);
		res.json({ message: "Post successfully saved", data: newPostWithImages });
	} catch (err) {
		res.status(400).send(err.message);
	}
});

postRouter.patch("/post/update", userAuth, async (req, res) => {
	try {
		const loggedInUser = req.user;
		const { _id, createdUserId, images, title, description } = req.body;
		if (loggedInUser !== createdUserId) {
			throw new Error("Permission denied");
		}
		validatePostPhotoData(req);
		const post = await Post.findById({ _id: _id });
		post.title = title;
		post.photos = images;
		post.description = description;
		const updatedPost = await post.save();
		if (updatedPost) {
			await updatedPost.addCategoriesFromImages();
		}
		res.json({ message: "Post successfully updated", data: updatedPost });
	} catch (err) {
		console.error(err.message);
		res.status(400).send(err.message);
	}
});

postRouter.get("/post/:postId", userAuth, async (req, res) => {
	try {
		const loggedInUser = req.user;
		const postId = req.params.postId;
		const post = await Post.find({ _id: postId, createdUserId: loggedInUser });
		if (!post) {
			throw new Error("The requested post is not found.");
		}
		res.json({ data: post });
	} catch (err) {
		res.status(400).send(err.message);
	}
});

module.exports = postRouter;
