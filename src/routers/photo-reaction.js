const express = require("express");
const PhotoReactionRouter = express.Router();
const PhotoReaction = require("../models/photo-reaction");
const { userAuth } = require("../middleware/auth");
const Image = require("../models/photos");

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
		res.status(400).send(err.message);
	}
});

module.exports = PhotoReactionRouter;
