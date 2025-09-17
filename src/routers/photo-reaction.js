const express = require("express");
const PhotoReactionRouter = express.Router();
const PhotoReaction = require("../models/photo-reaction");
const Notifications = require("../models/notification");
const { userAuth } = require("../middleware/auth");
const Image = require("../models/photos");
const User = require("../models/user");

// module.exports = PhotoReactionRouter;

module.exports = (io) => {
	PhotoReactionRouter.post("/reaction/save", userAuth, async (req, res) => {
		try {
			// const loggedUser = "684196fc23f574b6b043f5f4";
			const loggedUser = req.user._id;
			const { photoId, reaction } = req.body;
			const photo = await Image.findById({ _id: photoId });
			if (!photo) {
				throw new Error("Image does not exist");
			}
			const photoOwnerId = photo.uploadedUserId;
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

				//Create and save a new notification
				const newNotification = new Notifications({
					recipientId: photoOwnerId,
					senderId: loggedUser,
					postOrImage: "image",
					imageId: photoId,
					type: "reaction",
					isRead: false,
				});

				const savedNotification = await newNotification.save();

				//Emit the real-time notification
				io.to(photoOwnerId.toString()).emit("newNotification", {
					notification_id: savedNotification._id,
					senderId: loggedUser,
					sender_name: req.user.userName,
					imageId: photoId,
					type: "reaction",
					isRead: false,
					time: savedNotification.createdAt,
				});

				res.json({ message: "Reaction record saved successfully", data: save });
			}
		} catch (err) {
			console.log(err.message);
			res.send(err.message);
		}
	});

	PhotoReactionRouter.post(
		"/reaction/getreactor",
		userAuth,
		async (req, res) => {
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
		}
	);
	return PhotoReactionRouter;
};
