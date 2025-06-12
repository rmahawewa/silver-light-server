const express = require("express");
const userRouter = express.Router();
const Image = require("../models/photos");
const PhotoReaction = require("../models/photo-reaction");
const { userAuth } = require("../middleware/auth");

userRouter.get("/feed", async (req, res) => {
	try {
		const loggedUser = "6841738705c90d15f9f0b308";
		const categoriesObjectArray = await Image.find({
			uploadedUserId: loggedUser,
		}).select("category");
		console.log(categoriesObjectArray);
		const categoriesArray = new Set();
		categoriesObjectArray.forEach((categ) => {
			categ.category.forEach((c) => {
				categoriesArray.add(c);
			});
		});
		console.log(categoriesArray);
		const releventImages = await Image.find({
			category: { $in: Array.from(categoriesArray) },
		});
		// console.log(releventImages);
		const imageIds = new Array();
		releventImages.forEach((img) => {
			// console.log(img._id);
			imageIds.push(img._id);
		});
		console.log(imageIds);
		const releventReactions = await PhotoReaction.find({
			photoId: { $in: Array.from(imageIds) },
		});
		res.json({ imageData: releventImages, reactionData: releventReactions });
	} catch (err) {
		console.error(err.message);
	}
});

module.exports = userRouter;
