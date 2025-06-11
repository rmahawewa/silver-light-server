const mongoose = require("mongoose");

const photoReactionSchema = new mongoose.Schema(
	{
		photoId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Image",
			require: true,
		},
		reactionType: {
			type: String,
			require: true,
			enum: {
				values: [
					"like",
					"familier",
					"true",
					"love",
					"wonderful",
					"I feel jelousy",
					"undo",
				],
				message: `${VALUE} is an incorrect status type`,
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

module.exports = mongoose.model("PhotoReaction", photoReactionSchema);
