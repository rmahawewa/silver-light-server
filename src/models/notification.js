const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
	{
		recipientId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		category: {
			type: String,
			require: true,
			enum: {
				values: ["post", "image"],
				message: `{VALUE} is an incorrect status type`,
			},
		},
		postId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Post",
		},
		imageId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Image",
		},
		commentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "PostComment",
		},
		type: {
			type: String,
			require: true,
			enum: {
				values: ["reaction", "comment"],
				message: `{VALUE} is an incorrect status type`,
			},
		},
		value: {
			type: String,
		},
		isRead: {
			type: Boolean,
			require: true,
			default: false,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Notifications", notificationSchema);
