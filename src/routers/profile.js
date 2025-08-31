const express = require("express");
const { userAuth } = require("../middleware/auth.js");
const {
	validateEditProfileData,
	validatePassword,
} = require("../utils/validation.js");
const bcrypt = require("bcrypt");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
	try {
		const user = req.user;
		res.send(user);
	} catch (err) {
		res.send("ERROR: " + err.message);
	}
});

// profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
// 	try {
// 		if (!validateEditProfileData(req)) {
// 			throw new Error("Invalid Edit Request");
// 		}

// 		const loggedInUser = req.user;

// 		Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
// 		await loggedInUser.save();

// 		res.json({
// 			message: `${loggedInUser.firstName}, your Profile updated successfully`,
// 			data: loggedInUser,
// 		});
// 	} catch (err) {
// 		res.status(400).send("ERROR: " + err.message);
// 	}
// });

// profileRouter.patch("/profile/editPassword", userAuth, async (req, res) => {
// 	try {
// 		const response = await validatePassword(req);
// 		if (response !== "Proceed") {
// 			throw new Error(response);
// 		}
// 		const passwordHash = await bcrypt.hash(req.body.newPassword, 10);
// 		const loggedInUser = req.user;
// 		loggedInUser.password = passwordHash;
// 		await loggedInUser.save();
// 		res.send(`${loggedInUser.firstName}, your password updated successfully`);
// 	} catch (err) {
// 		res.status(400).send("ERROR: " + err.message);
// 	}
// });

module.exports = profileRouter;
