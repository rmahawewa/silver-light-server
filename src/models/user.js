const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true,
			minLength: 3,
			maxLength: 50,
			index: true,
		},
		lastName: {
			type: String,
		},
		userName: {
			type: String,
			required: true,
			unique: true,
		},
		birthday: {
			type: Date,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			validate(value) {
				if (!validator.isEmail(value)) {
					throw new Error("Email address is not valid");
				}
			},
		},
		password: {
			type: String,
			required: true,
			validate(value) {
				if (!validator.isStrongPassword(value)) {
					throw new Error("Enter a strong password");
				}
			},
		},
		gender: {
			type: String,
			validate(value) {
				if (!["male", "female", "others"].includes(value)) {
					throw new Error("Gender type is not valid");
				}
			},
		},
		photoUrl: {
			type: String,
			default:
				"https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg",
			validate(value) {
				if (!validator.isURL(value)) {
					throw new Error("Profile photo URL is not valid: ", value);
				}
			},
		},
		country: {
			type: String,
		},
		reagion: {
			type: String,
		},
		about: {
			type: String,
		},
		life_saticefaction: {
			type: Number,
		},
	},
	{ timestamps: true }
);

(module.exports = mongoose), model("User", userSchema);
