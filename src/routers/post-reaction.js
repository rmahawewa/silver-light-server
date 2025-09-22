const express = require("express");
const postReactionRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const Post = require("../models/post");
const PostReaction = require("../models/post-reaction");
const { emitNewNotification } = require("../utils/socket");
const Notifications = require("../models/notification");

postReactionRouter.post("/postreaction/save", userAuth, async (req, res) => {
	try {
		const loggedUser = req.user._id;
		// const loggedUser = "684196fc23f574b6b043f5f4";
		const { postId, reaction } = req.body;
		const post = await Post.findById({ _id: postId });
		if (!post) {
			throw new Error("Post does not exist");
		}
		const updateExistingPostReaction = await PostReaction.findOne({
			postId: postId,
			reactedById: loggedUser,
		});
		if (updateExistingPostReaction) {
			updateExistingPostReaction.reactionType = reaction;
			const save = await updateExistingPostReaction.save();

			if (reaction !== "undo") {
				// console.log("ee");
				//Create and save a new notification
				// const newNotification = new Notifications({
				// 	recipientId: post.createdUserId,
				// 	senderId: loggedUser,
				// 	postOrImage: "post",
				// 	postId: postId,
				// 	type: "reaction",
				// 	isRead: false,
				// });

				const newNotification = new Notifications({
					recipientId: post.createdUserId,
					senderId: loggedUser,
					category: "post",
					postId: postId,
					type: "reaction",
					value: reaction,
					isRead: false,
				});

				const savedNotification = await newNotification.save();

				// Call the new function to emit the notification
				// emitNewNotification(post.createdUserId.toString(), {
				// 	notification_id: savedNotification._id,
				// 	senderId: loggedUser,
				// 	sender_name: req.user.userName,
				// 	imageId: "",
				// 	postId: postId,
				// 	type: "reaction",
				// 	value: reaction,
				// 	// isRead: false,
				// 	category: "post",
				// 	time: savedNotification.createdAt,
				// });

				emitNewNotification(post.createdUserId.toString(), {
					_id: savedNotification._id,
					recipientId: post.createdUserId,
					senderId: { _id: loggedUser, userName: req.user.userName },
					postId: postId,
					type: "reaction",
					value: reaction,
					isRead: false,
					category: "post",
					createdAt: savedNotification.createdAt,
				});
			}

			res.json({ message: "Reaction record updated successfully", data: save });
		} else {
			const postReaction = new PostReaction({
				postId: postId,
				reactionType: reaction,
				reactedById: loggedUser,
			});
			const save = await postReaction.save();

			// const newNotification = new Notifications({
			// 	recipientId: post.createdUserId,
			// 	senderId: loggedUser,
			// 	postOrImage: "post",
			// 	postId: postId,
			// 	type: "reaction",
			// 	isRead: false,
			// });

			const newNotification = new Notifications({
				recipientId: post.createdUserId,
				senderId: loggedUser,
				category: "post",
				postId: postId,
				type: "reaction",
				value: reaction,
				isRead: false,
			});

			const savedNotification = await newNotification.save();

			// Call the new function to emit the notification
			// emitNewNotification(post.createdUserId.toString(), {
			// 	notification_id: savedNotification._id,
			// 	senderId: loggedUser,
			// 	sender_name: req.user.userName,
			// 	imageId: "",
			// 	postId: postId,
			// 	type: "reaction",
			// 	value: reaction,
			// 	// isRead: false,
			// 	category: "post",
			// 	time: savedNotification.createdAt,
			// });

			emitNewNotification(post.createdUserId.toString(), {
				_id: savedNotification._id,
				recipientId: post.createdUserId,
				senderId: { _id: loggedUser, userName: req.user.userName },
				postId: postId,
				type: "reaction",
				value: reaction,
				isRead: false,
				category: "post",
				createdAt: savedNotification.createdAt,
			});

			res.json({ message: "Reaction record saved successfully", data: save });
		}
	} catch (err) {
		res.send(err.message);
	}
});

module.exports = postReactionRouter;
