const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const authRouter = express.Router();
const {
	validateSignUpData,
	validateLoginData,
} = require("../utils/validation");

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

authRouter.post("/login", async (req, res) => {
	try {
		validateLoginData(req);
		const { email, password } = req.body;
		const loginUser = await User.findOne({ email: email });
		if (!loginUser) {
			throw new Error("User not found");
		}
		const isValidPassword = await loginUser.validatePassword(password);
		if (isValidPassword) {
			//Create a JWT Token
			const token = loginUser.getJWT();

			//Add the token to the cookie and send the response back to the user
			res.cookie("token", token, {
				expires: new Date(Date.now() + 7 * 24 * 3600000),
			});
			res.json({ message: "User login successfull", data: loginUser });
		} else {
			throw new Error("Invalid credentials");
		}
	} catch (err) {
		res.status(400).send(err.message);
	}
});

module.exports = authRouter;
