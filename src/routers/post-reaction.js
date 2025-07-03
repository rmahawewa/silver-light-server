const express = require("express");
const postReactionRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const Post = require("../models/post");
const PostReaction = require("../models/post-reaction");

postReactionRouter.post("/postreaction/save", userAuth, async (req, res) => {
	try {
		const loggedUser = req.user._id;
		// const loggedUser = "684196fc23f574b6b043f5f4";
		const { postId, reaction } = req.body;
		const post = await Post.findById({ _id: postId });
		if (!post) {
			throw new Error("Post does not exist");
		}
		const updateExistingPostReaction = await PostReaction.findOne({
			postId: postId,
			reactedById: loggedUser,
		});
		if (updateExistingPostReaction) {
			updateExistingPostReaction.reactionType = reaction;
			const save = await updateExistingPostReaction.save();
			res.json({ message: "Reaction record updated successfully", data: save });
		} else {
			const postReaction = new PostReaction({
				postId: postId,
				reactionType: reaction,
				reactedById: loggedUser,
			});
			const save = await postReaction.save();
			res.json({ message: "Reaction record saved successfully", data: save });
		}
	} catch (err) {
		res.send(err.message);
	}
});

module.exports = postReactionRouter;
