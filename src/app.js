const express = require("express");
require("dotenv").config();
const connectDB = require("./config/database");
const authRouter = require("./routers/auth");

const app = express();

app.use(express.json());

app.use("/", authRouter);

connectDB()
	.then(() => {
		console.log("Database connection established");
		app.listen(process.env.PORT, () => {
			console.log("Server is successfully listening on port 7777 ...");
		});
	})
	.catch((err) => {
		console.error(err.message);
	});
