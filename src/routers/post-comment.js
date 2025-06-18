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
		const commentToUpdate = await PostComment.findById({ _id: commentId });
		commentToUpdate.comment = comment;
		const updatedComment = await commentToUpdate.save();
		if (!updatedComment) {
			throw new Error("Could not update the comment");
		}
		res.json({ comment: "Comment updated successfully", data: updatedComment });
	} catch (err) {
		res.send(err.message);
	}
});

postCommentRouter.delete(
	"/postcomment/delete/:id",
	userAuth,
	async (req, res) => {
		try {
			const id = req.params.id;
			const deletedComment = await postcomment.deleteOne({ _id: id });
			if (deletedComment.deletedCount !== 1) {
				throw new Error("Couldn't delete the comment");
			}
			res.json({ message: "Comment successfully deleted" });
		} catch (err) {
			console.error(err.message);
			res.send(err.message);
		}
	}
);
