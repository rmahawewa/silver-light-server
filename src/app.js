const express = require("express");
require("dotenv").config();
const connectDB = require("./config/database");
const authRouter = require("./routers/auth");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const ImageRouter = require("./routers/photos");
const userRouter = require("./routers/user");
const categoryRouter = require("./routers/category");
const PhotoReactionRouter = require("./routers/photo-reaction");
const postRouter = require("./routers/post");
const postReactionRouter = require("./routers/post-reaction");
const postCommentRouter = require("./routers/post-comment");
const requestRouter = require("./routers/request");
const path = require("path"); // Node.js built-in module for path manipulation

const app = express();

app.use(express.json());
const corsOptions = { origin: "http://localhost:5173", credentials: true };
app.use(cors(corsOptions));
app.use(cookieParser());
// console.log(__dirname);
// return;

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", authRouter);
app.use("/", ImageRouter);
app.use("/", userRouter);
app.use("/", categoryRouter);
app.use("/", PhotoReactionRouter);
app.use("/", postRouter);
app.use("/", postReactionRouter);
app.use("/", postCommentRouter);
app.use("/", requestRouter);

const server = httpProxyClient.createServer(app);
initializeSocket(server);

connectDB()
	.then(() => {
		console.log("Database connection established");
		// app.listen(process.env.PORT, () => {
		server.listen(process.env.PORT, () => {
			console.log("Server is successfully listening on port 1111 ...");
		});
	})
	.catch((err) => {
		console.error(err.message);
	});
