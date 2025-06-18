const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
	{
		fromUserId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			require: true,
		},
		toUserId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			require: true,
		},
		status: {
			type: String,
			require: true,
			enum: {
				values: ["sent", "received", "accepted", "rejected"],
				message: `{VALUE} is an incorrect status type`,
			},
		},
	},
	{ timestamps: true }
);
