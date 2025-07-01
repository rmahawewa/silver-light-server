const validator = require("validator");
const Image = require("../models/photos");

const validateSignUpData = (req) => {
	const { firstName, lastName, userName, email, password } = req.body;

	if (!firstName) {
		throw new Error("First name is required");
	}
	if (!userName) {
		throw new Error("Username is required");
	}
	if (!validator.isEmail(email)) {
		throw new Error("Email address is not valid");
	}
	if (!validator.isStrongPassword(password)) {
		throw new Error("Please enter a strong password");
	}
};

const validateLoginData = (req) => {
	const { email, password } = req.body;

	if (!validator.isEmail(email)) {
		throw new Error("The email is not valid");
	}
	if (!validator.isStrongPassword(password)) {
		throw new Error("The password is not strong enough");
	}
};

const validateImageData = (req) => {
	const { filename, originalname, path } = req.file;
	const { photoTitle } = req.body;

	if (!filename) {
		throw new Error("Image information are missing");
	}
	if (!originalname || !path) {
		throw new Error(
			"Internal server error: file original name or path is missing"
		);
	}
	if (!photoTitle) {
		throw new Error("Photo title is required");
	}
};

const validatePostPhotoData = (req) => {
	loggedInUser = req.user._id;
	const { images } = req.body;
	images.forEach(async (img) => {
		const uploadedUserId = await Image.findById({ _id: img }).select(
			"uploadedUserId"
		);
		// console.log(loggedInUser);
		// console.log(loggedInUser == uploadedUserId.uploadedUserId);
		if (!loggedInUser.equals(uploadedUserId.uploadedUserId)) {
			throw new Error(
				"Permissions denied. You can only use images uploaded by you."
			);
		}
	});
};

module.exports = {
	validateSignUpData,
	validateLoginData,
	validateImageData,
	validatePostPhotoData,
};
