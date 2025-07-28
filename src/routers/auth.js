const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const authRouter = express.Router();
const {
	validateSignUpData,
	validateLoginData,
} = require("../utils/validation");
const { userAuth } = require("../middleware/auth");

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
		const token = await savedUser.getJWT();

		//Add the token to the cookie and send the response back to the user
		res.cookie("token", token, {
			expires: new Date(Date.now() + 7 * 24 * 3600000),
		});

		res.json({ message: "User added successfully", data: savedUser });
	} catch (err) {
		res.status(400).send(err.message);
	}
});

authRouter.patch("/update", userAuth, async (req, res) => {
	try {
		const {
			firstName,
			lastName,
			userName,
			birthday,
			email,
			gender,
			photoUrl,
			country,
			reagion,
			about,
		} = req.body;
		const loggedInUser = req.user?._id;
		console.log(loggedInUser);
		const record = await User.find({ _id: loggedInUser });
		if (!record) {
			throw new Error("Not a valid User");
		}
		record.firstName = firstName;
		record.lastName = lastName;
		record.userName = userName;
		record.birthday = birthday;
		record.email = email;
		record.gender = gender;
		record.photoUrl = photoUrl;
		record.country = country;
		record.reagion = reagion;
		record.about = about;
		record.save();
		res.json({ message: "User updated successfully", data: record });
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
			const token = await loginUser.getJWT();

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

authRouter.post("/logout", async (req, res) => {
	res.cookie("token", null, { expires: new Date(Date.now()) });
	res.send("Logout successfull");
});

module.exports = authRouter;
