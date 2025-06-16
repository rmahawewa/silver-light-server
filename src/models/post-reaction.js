const mongoose = require("mongoose");

const postReactionSchema = new mongoose.Schema(
	{
		postId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Post",
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

module.exports = mongoose.model("PostReaction", postReactionSchema);
