// -class: Photoes
// 	-id
// 	-uploaded-user-id - ref
// 	-photo
// 	-name
// 	-description
// 	-timestamp

const mongoose = require("mongoose");

const photosSchema = new mongoose.Schema(
	{
		uploadedUserId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User", //reference to the User collection
			required: true,
		},
		fileName: {
			type: String,
		},
		originalName: {
			type: String,
		},
		path: {
			type: String,
		},
		url: {
			type: String,
		},
		photoTitle: {
			type: String,
			required: true,
		},
		photoDescription: {
			type: String,
		},
	},
	{ timestamps: true }
);
