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
		const parentComment = await PostComment.findById({ _id: parentCommentId });
		if (parentComment) {
			parentComment.childCommentIds.push(save._id);
			await parentComment.save();
		}
		res.json({
			message: "Comment successfully saved",
			data: save,
			parent: parentComment,
		});
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

			//Execute the recursive deletion process
			const deletionResult = await deleteRecurcively(id);

			if (deletionResult.deletedCount < 1) {
				//This might happen if the initial comment ID wasn't found
				throw new Error("Comment not found or couldn't be deleted.");
			}

			res.json({ message: "Comment successfully deleted" });
		} catch (err) {
			console.error(err.message);
			res.send(err.message);
		}
	}
);

deleteRecurcively = async (commentId) => {
	try {
		const comment = await PostComment.findById({ _id: commentId });
		if (!comment) {
			//Comment not found, nothing to delete for this ID
			return { deletedCount: 0 };
		}

		//Recursively delete child comments
		if (comment.childCommentIds && comment.childCommentIds.length > 0) {
			//Use Promise.all to wait for all child deletions to complete
			await Promise.all(
				comment.childCommentIds.map(async (childId) => {
					await deleteCommentAndChildren(childId);
				})
			);
		}

		//Remove the comment's ID from its parent's childCommentIds array
		if (comment.parentCommentId) {
			await PostComment.updateOne(
				{ _id: comment.parentCommentId },
				{ $pull: { childCommentIds: commentId } }
			);
		}

		//Delete the comment itself
		const result = await PostComment.deleteOne({ _id: commentId });
		return result;
	} catch (err) {
		throw new Error(err.message);
	}
};

module.exports = postCommentRouter;
