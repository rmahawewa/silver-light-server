const express = require("express");
const categoryRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const Image = require("../models/photos");
const Post = require("../models/post");

categoryRouter.get("/allCategories", userAuth, async (req, res) => {
	try {
		const imageCategoriesObjectArray = await Image.distinct("category");
		console.log(imageCategoriesObjectArray);
		res.json({ categories: imageCategoriesObjectArray });
	} catch (err) {
		res.status(400).send(err.message);
	}
});

categoryRouter.post("/category/allByCategory", userAuth, async (req, res) => {
	try {
		let { categoryName } = req.body;
		categoryName = categoryName.trim().toLowerCase();
		// console.log(categoryName);
		let images = await Image.find({
			category: { $in: [categoryName] },
		});
		let posts = await Post.find({
			category: { $in: [categoryName] },
		});

		if (posts?.length === 0 && images?.length === 0) {
			return res
				.status(404)
				.json({ message: "No items found for the category" });
		}
		res.status(200).json({ images: images, posts: posts });
	} catch (err) {
		res.status(400).send(err.message);
	}
});

module.exports = categoryRouter;
