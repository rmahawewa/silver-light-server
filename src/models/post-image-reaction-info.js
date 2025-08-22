const mongoose = require("mongoose");

const reactionNotifications = new mongoose.Schema(
	{
		postOrImgId: {},
		createdUserId: {},
		reactedUserId: {},
		reaction: {},
	},
	{ timestamps: true }
);
