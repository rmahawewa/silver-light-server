const validator = require("validator");

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

module.exports = { validateSignUpData, validateLoginData, validateImageData };
