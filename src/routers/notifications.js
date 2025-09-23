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

notificationRouter.patch(
	"/notifications/changeReadState",
	userAuth,
	async (req, res) => {
		try {
			const { notificationId } = req.body;
			const notification = await Notifications.findById({
				_id: notificationId,
			});
			notification.isRead = true;
			const updatedNotification = await notification.save();
			res.json({
				message: "read state changed successfully",
				data: updatedNotification,
			});
		} catch (err) {
			res.status(400).send(err.message);
		}
	}
);

module.exports = notificationRouter;
