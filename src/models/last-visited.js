const mongoose = require("mongoose");

const lastVisitedSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User", //reference to the User collection
			required: true,
		},
		visitedURL: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);
module.exports = mongoose.model("LastVisited", lastVisitedSchema);
