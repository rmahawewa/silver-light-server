const mongoose = require("mongoose");

const postCommentSchema = new mongoose.Schema(
	{
		postId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Post",
			require: true,
		},
		parentCommentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "PostComment",
			default: null,
		},
		commentByUser: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			require: true,
		},
		comment: {
			type: String,
			require: true,
		},
		childCommentIds: [
			{ type: mongoose.Schema.Types.ObjectId, ref: "PostComment" },
		],
	},
	{ timestamps: true }
);

module.exports = mongoose.model("PostComment", postCommentSchema);
