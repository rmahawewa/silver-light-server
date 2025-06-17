const mongoose = require("mongoose");

const postCommentSchema = new mongoose.Schema({
	postId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Post",
		require: true,
	},
	parentCommentId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "PostComment",
		require: true,
		default: function () {
			//'this' refers to the document being saved
			return this.postId;
		},
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
});

module.exports = mongoose.model("PostComment", postCommentSchema);
