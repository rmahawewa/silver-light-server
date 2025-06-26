const express = require("express");
const PhotoReactionRouter = express.Router();
const PhotoReaction = require("../models/photo-reaction");
const { userAuth } = require("../middleware/auth");
const Image = require("../models/photos");
const User = require("../models/user");

PhotoReactionRouter.post("/reaction/save", async (req, res) => {
	try {
		const loggedUser = "684196fc23f574b6b043f5f4";
		const { photoId, reaction } = req.body;
		const photo = await Image.findById({ _id: photoId });
		if (!photo) {
			throw new Error("Image does not exist");
		}
		const existingEntry = await PhotoReaction.findOne({
			photoId: photoId,
			reactedById: loggedUser,
		});
		if (existingEntry) {
			existingEntry.reactionType = reaction;
			const save = await existingEntry.save();
			res.json({ message: "Reaction record saved successfully", data: save });
		} else {
			const photoReactionEnrty = new PhotoReaction({
				photoId: photoId,
				reactionType: reaction,
				reactedById: loggedUser,
			});
			const save = await photoReactionEnrty.save();
			if (!save) {
				throw new Error("Failed to save the user reaction");
			}
			res.json({ message: "Reaction record saved successfully", data: save });
		}
	} catch (err) {
		res.send(err.message);
	}
});

PhotoReactionRouter.post("/reaction/getreactor", async (req, res) => {
	try {
		const { reactedByIds } = req.body;
		// console.log(reactedByIds);
		const users = await User.find(
			{ _id: { $in: reactedByIds } },
			"_id userName photoUrl"
		);
		// console.log(users);
		res.json({ message: "Reactors fetched successfully", data: users });
	} catch (err) {
		console.log(err.message);
		res.send(err.message);
	}
});

module.exports = PhotoReactionRouter;
