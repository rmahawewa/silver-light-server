const express = require("express");
require("dotenv").config();
const connectDB = require("./config/database");
const authRouter = require("./routers/auth");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const ImageRouter = require("./routers/photos");
const userRouter = require("./routers/user");
const path = require("path");

const app = express();

app.use(express.json());
const corsOptions = { origin: "http://localhost:5173", credentials: true };
app.use(cors(corsOptions));
app.use(cookieParser());
// console.log(__dirname);
// return;

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

app.use("/", authRouter);
app.use("/", ImageRouter);
app.use("/", userRouter);

connectDB()
	.then(() => {
		console.log("Database connection established");
		app.listen(process.env.PORT, () => {
			console.log("Server is successfully listening on port 1111 ...");
		});
	})
	.catch((err) => {
		console.error(err.message);
	});
