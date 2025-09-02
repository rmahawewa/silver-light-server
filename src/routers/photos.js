const express = require("express");
const ImageRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const upload = require("../config/storage");
const Image = require("../models/photos");
const User = require("../models/user");
const { validateImageData } = require("../utils/validation");

ImageRouter.post(
	"/image/upload",
	userAuth,
	upload.single("image"),
	async (req, res) => {
		try {
			if (!req.file) {
				return res.status(400).json({ message: "No file uploaded" });
			}

			const loggedInUser = req.user._id;

			validateImageData(req);

			//Access file details from req.file after multer process it
			const { filename, originalname, path: filePath } = req.file;
			const { photoTitle, category, photoDescription } = req.body;

			//Image will be accesible from this URL
			// const imageUrl = `http://localhost:${process.env.PORT}/uploads/${filename}`;
			const SERVER_IP = process.env.SERVER_IP;
			const imageUrl = `http://${SERVER_IP}/api/uploads/${filename}`;

			//Save the image metadata to mongo db
			const image = new Image({
				uploadedUserId: loggedInUser,
				fileName: filename,
				originalName: originalname,
				path: filePath,
				url: imageUrl,
				photoTitle: photoTitle,
				category: category.split(","),
				photoDescription: photoDescription,
			});
			const savedImage = await image.save();
			if (!savedImage) {
				throw new Error("Unable to save image data");
			}
			res
				.status(200)
				.json({ message: "File successfully uploaded", data: savedImage });
		} catch (err) {
			console.error(err.message);
			res.status(500).send(err.message);
		}
	}
);

ImageRouter.get("/image/:imageId", userAuth, async (req, res) => {
	try {
		const imageId = req.params.imageId;
		let image = await Image.findById({ _id: imageId });
		if (!image) {
			throw new Error("Image not found");
		}
		res.status(200).json({ data: image });
	} catch (err) {
		res.status(400).send(err.message);
	}
});

ImageRouter.patch("/image/update", userAuth, async (req, res) => {
	try {
		const userId = req.user._id;
		const { _id, photoTitle, category, photoDescription } = req.body;
		const img = await Image.findById({ _id: _id });
		console.log(img);
		console.log(img.uploadedUserId != userId);
		console.log({ _id, photoTitle, category, photoDescription });
		if (img.uploadedUserId != userId) {
			throw new Error("Permission denied");
		}
		console.log(category);
		img.photoTitle = photoTitle;
		img.category = category;
		img.photoDescription = photoDescription;
		const updatedImage = await img.save();
		if (!updatedImage) {
			throw new Error("Failed to update the image");
		}
		res.send(updatedImage);
	} catch (err) {
		res.status(400).send(err.message);
	}
});

module.exports = ImageRouter;
