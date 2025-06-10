const express = require("express");
const categoryRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const Image = require("../models/photos");

categoryRouter.get("/allCategories", async (req, res) => {
	try {
		const imageCategoriesObjectArray = await Image.find().select("category");
		console.log(imageCategoriesObjectArray);
		const categoriesArray = new Set();
		imageCategoriesObjectArray.forEach((obj) => {
			obj.category.forEach((c) => {
				categoriesArray.add(c);
			});
		});
		console.log(categoriesArray);
		res.send();
	} catch (err) {
		res.status(400).send(err.message);
	}
});

categoryRouter.post("/category/allByCategory", async (req, res) => {
	try {
		let { categoryName } = req.body;
		categoryName = categoryName.trim().toLowerCase();

		let images = await Image.find({
			category: { $in: [categoryName] },
		});
		if (!images || images.length === 0) {
			return res
				.status(404)
				.json({ message: "No images found for the category" });
		}
		res.status(200).send({ images });
	} catch (err) {
		res.status(400).send(err.message);
	}
});

module.exports = categoryRouter;
