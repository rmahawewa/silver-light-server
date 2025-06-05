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

module.exports = validateSignUpData;
