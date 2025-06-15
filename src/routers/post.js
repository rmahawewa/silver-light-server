const express = require("express");
const postRouter = express.Router();
const Post = require("../models/post");
const { userAuth } = require("../middleware/auth");
const { validatePostPhotoData } = require("../utils/validation");

postRouter.post("/save", userAuth, async (req, res) => {
	try {
		const loggedInuser = req.user;
		const { images, title, description, category } = req.body;
		validatePostPhotoData(req);
		const post = new Post({
			createdUserId: loggedInuser,
			title,
			photos: images,
			description,
		});
		const savedPost = await post.save();
		if (savedPost) {
			await savedPost.addCategoriesFromImages();
		}
		res.json({ message: "Post successfully saved", data: savedPost });
	} catch (err) {
		res.status(400).send(err.message);
	}
});
