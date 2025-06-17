const express = require("express");
const postCommentRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const PostComment = require("../models/post-comment");

postCommentRouter.post("/postcomment/save", userAuth, async (req, res) => {
	try {
		const loggedUser = req.user;
		const { postId, parentCommentId, commentByUser, comment } = req.body;
		if (commentByUser !== loggedUser) {
			throw new Error("Permission denied");
		}
		const postcomment = new PostComment({
			postId: postId,
			parentCommentId: parentCommentId,
			commentByUser: commentByUser,
			comment: comment,
		});
		const save = await postcomment.save();
		res.json({ message: "Comment successfully saved", data: save });
	} catch (err) {
		res.send(err.message);
	}
});

postCommentRouter.patch("/postcomment/update", userAuth, async (req, res) => {
	try {
		const loggedUser = req.user;
		const { commentId, comment } = req.body();
	} catch (err) {}
});
