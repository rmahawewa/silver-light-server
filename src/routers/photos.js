const express = require("express");
const ImageRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const upload = require("../config/storage");
const Image = require("../models/photos");
const User = require("../models/user");
const { validateImageData } = require("../utils/validation");

ImageRouter.post("/image/upload", upload.single("image"), async (req, res) => {
	// console.log("Request body: " + req.body);
	try {
		if (!req.file) {
			return res.status(400).json({ message: "No file uploaded" });
		}

		validateImageData(req);

		//Access file details from req.file after multer process it
		const { filename, originalname, path: filePath } = req.file;
		const { photoTitle, category, photoDescription } = req.body;

		//Image will be accesible from this URL
		const imageUrl = `http://localhost:${process.env.PORT}/uploads/${filename}`;

		//Save the image metadata to mongo db
		const image = new Image({
			uploadedUserId: "6841738705c90d15f9f0b308",
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
});

ImageRouter.get("/image/:imageId", async (req, res) => {
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

ImageRouter.patch("/image/update", async (req, res) => {
	try {
		// const userId = "6841738705c90d15f9f0b308";
		const userId = "684196fc23f574b6b043f5f4";
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
