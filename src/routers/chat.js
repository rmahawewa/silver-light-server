const express = require("express");
const { userAuth } = require("../middleware/auth");
const { Chat } = require("../models/chat");

const chatRouter = express.Router();

chatRouter.get("/chat/allChats", userAuth, async (req, res) => {
	const userId = req.user._id;

	try {
		// 1. Find all chats the user is a participant in.
		// We use the correct path 'participants.user' for your new schema.
		let chats = await Chat.find({
			"participants.user": userId,
		})
			.populate({
				// Populate the nested 'user' field within the participants array
				path: "participants.user",
				select: "_id userName photoUrl",
			})
			.lean(); // Use .lean() to convert Mongoose documents to plain JS objects for modification

		// 2. Iterate through each chat to calculate the unread count for the userId.
		const chatsWithUnreadCount = chats.map((chat) => {
			let unreadCount = 0;

			// Find the logged-in user's participant object in this chat
			const loggedInParticipant = chat.participants.find(
				(p) => p.user._id.toString() === userId.toString()
			);

			if (loggedInParticipant) {
				const lastReadId = loggedInParticipant.lastReadMessageId;

				// If no lastReadId exists, all messages not sent by the user are unread.
				if (!lastReadId) {
					unreadCount = chat.messages.filter(
						(msg) => msg.senderId.toString() !== userId.toString()
					).length;
				} else {
					// Find the index of the last read message.
					let lastReadIndex = -1;
					for (let i = 0; i < chat.messages.length; i++) {
						if (chat.messages[i]._id.equals(lastReadId)) {
							lastReadIndex = i;
							break;
						}
					}

					if (lastReadIndex !== -1) {
						// Count messages sent AFTER the last read index, excluding those sent by the current user.
						const subsequentMessages = chat.messages.slice(lastReadIndex + 1);

						unreadCount = subsequentMessages.filter(
							(msg) => msg.senderId.toString() !== userId.toString()
						).length;
					}
				}
			}

			// Attach the calculated count to the chat object
			chat.unreadCount = unreadCount;
			return chat;
		});

		// 3. Send the modified list of chats.
		res.json(chatsWithUnreadCount);
	} catch (err) {
		console.error("Error fetching all chats:", err);
		res.status(500).send("Error fetching chats data.");
	}
});

// chatRouter.get("/chat/allChats", userAuth, async (req, res) => {
// 	try {
// 		const userId = req.user._id;
// 		let chats = await Chat.find({
// 			participants: userId,
// 		}).populate({
// 			path: "participants",
// 			select: "_id userName photoUrl",
// 		});
// 		res.json(chats);
// 	} catch (err) {
// 		res.status(400).send(err.message);
// 	}
// });

// chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
// 	const { targetUserId } = req.params;
// 	const userId = req.user._id;

// 	try {
// 		let chat = await Chat.findOne({
// 			participants: { $all: [userId, targetUserId] },
// 		}).populate({
// 			path: "messages.senderId",
// 			select: "firstName lastName userName",
// 		});
// 		if (!chat) {
// 			chat = new Chat({ participants: [userId, targetUserId], messages: [] });
// 			await chat.save();
// 		}
// 		res.json(chat);
// 	} catch (err) {
// 		res.status(400).send(err.message);
// 	}
// });

// chatRouter.get("/chat/:targetUserId", ...
chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
	const { targetUserId } = req.params;
	const userId = req.user._id;

	try {
		// 1. Find the chat using the correct query for the new structure
		let chat = await Chat.findOne({
			// Find the chat where the nested 'user' field in the 'participants' array
			// contains BOTH the logged-in user and the target user.
			"participants.user": { $all: [userId, targetUserId] },
		}).populate({
			path: "messages.senderId",
			select: "firstName lastName userName",
		});

		// 2. If no chat exists, create a new one with the correct structure
		if (!chat) {
			chat = new Chat({
				participants: [
					// Ensure the participants are created as objects
					{ user: userId },
					{ user: targetUserId },
				],
				messages: [],
			});
			await chat.save();
		}

		// 3. Optional but Recommended: Calculate Unread Count (if you need it here)
		// If you need to send the unread count for this specific chat, you'd calculate it here
		// based on the loggedInUser's lastReadMessageId and return it with the chat data.

		res.json(chat);
	} catch (err) {
		console.error("Error fetching or creating chat:", err);
		res.status(500).send("Error fetching chat data.");
	}
});

module.exports = chatRouter;
