const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
	{
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		text: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const chatSchema = new mongoose.Schema(
	{
		participants: [
			// { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

			{
				// The ID of the user
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					required: true,
				},

				//This references the '_id' of the last message seen by 'user'
				lastReadMessageId: {
					type: mongoose.Schema.Types.ObjectId,

					// Note: The 'ref' should technically point to the sub-document model,
					// but since it's embedded, we just ensure it's an ObjectId.
					default: null,
				},
			},
		],
		messages: [messageSchema],
	},
	{ timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

module.exports = { Chat };
