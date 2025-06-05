const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const authRouter = express.Router();
const validateSignUpData = require("../utils/validation");

authRouter.post("/signup", async (req, res) => {
	try {
		//Validation of data
		validateSignUpData(req);

		const { firstName, lastName, userName, email, password } = req.body;
		//Encrypting password
		const passwordHash = await bcrypt.hash(password, 10);

		const user = new User({
			firstName,
			lastName,
			userName,
			email,
			password: passwordHash,
		});
		const savedUser = await user.save();

		//Create a JWT Token
		const token = savedUser.getJWT();

		//Add the token to the cookie and send the response back to the user
		res.cookie("token", token, {
			expires: new Date(Date.now() + 7 * 24 * 3600000),
		});

		res.json({ message: "User added successfully", data: savedUser });
	} catch (err) {
		res.status(400).send(err.message);
	}
});

module.exports = authRouter;
