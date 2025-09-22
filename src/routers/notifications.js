const express = require("express");
const { userAuth } = require("../middleware/auth");
const Notifications = require("../models/notification");

const notificationRouter = express.Router();

notificationRouter.get("/notifications/unread", userAuth, async (req, res) => {
	try {
		const recipientId = req.user._id;

		const unreadNotifications = await Notifications.find({
			recipientId: recipientId,
			isRead: false,
		}).populate({ path: "senderId", select: "userName" });
		res.json({ message: "unread notifications", data: unreadNotifications });
	} catch (err) {
		res.status(400).send(err.message);
	}
});

module.exports = notificationRouter;
