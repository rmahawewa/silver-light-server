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
			// let { filename } = req.file;
			// if (filename) {
			// console.log("file name is: " + filename);
			// const { originalname, path: filePath } = req.file;
			//Image will be accesible from this URL
			// const imageUrl = `http://localhost:${process.env.PORT}/uploads/${filename}`;
			// console.log(imageUrl);
			// const SERVER_IP = process.env.SERVER_IP;
			// const imageUrl = `http://${SERVER_IP}/api/uploads/${filename}`;
			// }

			let filename = null;
			let imageUrl = null;

			if (req.file) {
				filename = req.file.filename;
				console.log("file name is: " + filename);

				const SERVER_IP = process.env.SERVER_IP;
				imageUrl = `http://${SERVER_IP}/api/uploads/${filename}`;
			}

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
			record.photoUrl = imageUrl || record.photoUrl;
			record.country = country;
			record.reagion = reagion;
			record.about = about;
			const savedRecord = await record.save();

			res.json({ message: "User updated successfully", data: savedRecord });
		} catch (err) {
			res.status(400).send(err.message);
		}
	}
);

authRouter.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;
		// Validation of data
		validateLoginData(req);

		const user = await User.findOne({ email: email });
		if (!user) {
			throw new Error("Invalid credencials");
		}

		const isValidPassword = await user.validatePassword(password);
		if (isValidPassword) {
			// Create a JWT Token
			const token = await user.getJWT();

			//Add the token to the cookie and send the response back to the user
			res.cookie("token", token, {
				expires: new Date(Date.now() + 7 * 24 * 3600000),
			});

			res.json({ data: user });
		} else {
			throw new Error("Invalid credencials");
		}
	} catch (err) {
		res.status(400).send("ERROR: " + err.message);
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
