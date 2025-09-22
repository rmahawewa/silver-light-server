const express = require("express");
require("dotenv").config();
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const path = require("path");
const socket = require("socket.io");

// Routers
const authRouter = require("./routers/auth");
const ImageRouter = require("./routers/photos");
const userRouter = require("./routers/user");
const categoryRouter = require("./routers/category");
const PhotoReactionRouter = require("./routers/photo-reaction");
const postRouter = require("./routers/post");
const postReactionRouter = require("./routers/post-reaction");
const postCommentRouter = require("./routers/post-comment");
const requestRouter = require("./routers/request");
const chatRouter = require("./routers/chat");
const lastVisitedRouter = require("./routers/last-visited");
const profileRouter = require("./routers/profile");
const notificationRouter = require("./routers/notifications");
const { initializeSocket } = require("./utils/socket");

const app = express();
const server = http.createServer(app);
// const io = initializeSocket(server); // Store the returned io instance
initializeSocket(server);

// Middleware
// The order of these is important.
// They should be at the top, before any route definitions.
app.use(express.json());
const corsOptions = { origin: "http://localhost:5173", credentials: true };
app.use(cors(corsOptions));
app.use(cookieParser());

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routers
app.use("/", authRouter);
app.use("/", ImageRouter);
app.use("/", userRouter);
app.use("/", categoryRouter);
// app.use("/", PhotoReactionRouter(io)); //Pass io here
app.use("/", PhotoReactionRouter);
app.use("/", postRouter);
app.use("/", postReactionRouter);
app.use("/", postCommentRouter);
app.use("/", requestRouter);
app.use("/", chatRouter);
app.use("/", lastVisitedRouter);
app.use("/", profileRouter);
app.use("/", notificationRouter);

connectDB()
	.then(() => {
		console.log("Database connection established");
		server.listen(process.env.PORT, () => {
			console.log("Server is successfully listening on port 1111 ...");
		});
	})
	.catch((err) => {
		console.error(err.message);
	});
