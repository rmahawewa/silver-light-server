const express = require("express");
const { userAuth } = require("../middleware/auth");
const { Chat } = require("../models/chat");

const chatRouter = express.Router();

chatRouter.get("/chat/allChats", userAuth, async (req, res) => {
	try {
		const userId = req.user._id;
		let chats = await Chat.find({
			participants: userId,
		}).populate({
			path: "participants",
			select: "_id userName photoUrl",
		});
		res.json(chats);
	} catch (err) {
		res.status(400).send(err.message);
	}
});

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
	const { targetUserId } = req.params;
	const userId = req.user._id;

	try {
		let chat = await Chat.findOne({
			participants: { $all: [userId, targetUserId] },
		}).populate({
			path: "messages.senderId",
			select: "firstName lastName userName",
		});
		if (!chat) {
			chat = new Chat({ participants: [userId, targetUserId], messages: [] });
			await chat.save();
		}
		res.json(chat);
	} catch (err) {
		res.status(400).send(err.message);
	}
});

module.exports = chatRouter;
