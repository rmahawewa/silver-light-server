const mongoose = require("mongoose");

const reactionNotifications = new mongoose.Schema(
	{
		imageId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Image",
			require: true,
		},
		reactedUserId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			require: true,
		},
		reactionType: {
			type: String,
			require: true,
			enum: {
				values: [
					"like",
					"familier",
					"aTrue",
					"love",
					"wonderful",
					"iFeelJelousy",
					"undo",
				],
				message: `{VALUE} is an incorrect status type`,
			},
		},
		reactedById: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			require: true,
		},
	},
	{ timestamps: true }
);
