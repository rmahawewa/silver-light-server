const express = require("express");
require("dotenv").config();
const connectDB = require("./config/database");
const authRouter = require("./routers/auth");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(express.json());

const corsOptions = { origin: "http://localhost:5173", credentials: true };

app.use(cors(corsOptions));
app.use(express.json);
app.use(cookieParser());
app.use("/uploads", express.static(Path2D.join(__dirname, "uploads")));

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
