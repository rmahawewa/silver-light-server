const express = require("express");
const PhotoReactionRouter = express.Router();
const PhotoReaction = require("../models/photo-reaction");
const { userAuth } = require("../middleware/auth");
const Image = require("../models/photos");

PhotoReactionRouter.post("/reaction/save", async (req, res) => {
	try {
		const loggedUser = "";
		const { photoId, reaction } = req.body;
		const photo = await Image.findById({ _id: photoId });
		if (!photo) {
			throw new Error("Image does not exist");
		}
		const photoReaction = new photoReaction({
			photoId: photoId,
			reactionType: reaction,
			reactedById: loggedUser,
		});
		const save = await photoReaction.save();
		if (!save) {
			throw new Error("Failed to save the user reaction");
		}
		res.json({ message: "Reaction record saved successfully", data: save });
	} catch (err) {
		res.status(400).send(err.message);
	}
});
