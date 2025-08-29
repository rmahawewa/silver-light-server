const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const authRouter = express.Router();
const {
	validateSignUpData,
	validateLoginData,
} = require("../utils/validation");
const { userAuth } = require("../middleware/auth");
const upload = require("../config/storage");

authRouter.post("/signup", async (req, res) => {
	try {
		//Validation of data
		// validateSignUpData(req);
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

authRouter.patch(
	"/update",
	userAuth,
	upload.single("image"),
	async (req, res) => {
		// console.log(req);
		try {
			// if (!req.file) {
			// 	return res.status(400).json({ message: "No file uploaded" });
			// }
			//Access file details from req.file after multer process it
			let { filename } = req.file;
			// if (filename) {
			console.log("file name is: " + filename);
			// const { originalname, path: filePath } = req.file;
			//Image will be accesible from this URL
			const imageUrl = `http://localhost:${process.env.PORT}/uploads/${filename}`;
			console.log(imageUrl);
			// }

			const {
				firstName,
				lastName,
				userName,
				birthday,
				email,
				gender,
				image,
				country,
				reagion,
				about,
			} = req.body;
			const loggedInUser = req.user?._id;
			console.log(email);

			const record = await User.findOne({ _id: loggedInUser });
			if (!record) {
				throw new Error("Not a valid User");
			}
			record.firstName = firstName;
			record.lastName = lastName;
			record.userName = userName;
			record.birthday = birthday;
			record.email = email;
			record.gender = gender;
			record.photoUrl = req.file ? imageUrl : record.photoUrl;
			record.country = country;
			record.reagion = reagion;
			record.about = about;
			await record.save();
			res.json({ message: "User updated successfully", data: record });
		} catch (err) {
			res.status(400).send(err.message);
		}
	}
);

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
			// Create a short-lived access token (e.g., 15 minutes)
			const accessToken = await loginUser.getJWT("15m");

			// Create a long-lived refresh token (e.g., 7 days)
			const refreshToken = await loginUser.getJWT("7d");

			// Set the refresh token as an HttpOnly cookie
			res.cookie("refreshToken", refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "Strict",
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			});

			// Send the access token and user data in the JSON response
			res.json({
				message: "User login successful",
				data: {
					user: loginUser,
					accessToken: accessToken,
				},
			});
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

authRouter.patch("/change-password", userAuth, async (req, res) => {
	try {
		const { oldpassword, newpassword } = req.body;
		const user = req.user;
		const isValidPassword = await user.validatePassword(oldpassword);
		if (isValidPassword) {
			const passwordHash = await bcrypt.hash(newpassword, 10);
			user.password = passwordHash;
			const savedUser = await user.save();
			res.json({ message: "Password changing successfull", data: savedUser });
		} else {
			throw new Error("Old password is invalid");
		}
	} catch (err) {
		res.status(400).send(err.message);
	}
});

module.exports = authRouter;
