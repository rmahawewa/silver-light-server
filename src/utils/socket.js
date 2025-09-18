const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
// const { Server } = require("http");

let ioInstance = null; // Store the instance here

const getSecretRoomId = (userId, targetUserId) => {
	return crypto
		.createHash("sha256")
		.update([userId, targetUserId].sort().join("_"))
		.digest("hex");
};

const initializeSocket = (server) => {
	const io = socket(server, {
		cors: {
			origin: "http://localhost:5173",
			methods: ["GET", "POST", "PATCH"],
			credentials: true,
		},
	});

	// Store the io instance for later use
	ioInstance = io;

	io.on("connection", (socket) => {
		//Handle events
		socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
			const roomId = getSecretRoomId(userId, targetUserId);

			console.log("Joining Room: " + roomId);
			console.log(firstName + " " + "joined the room " + roomId);
			socket.join(roomId);
		});

		socket.on(
			"sendMessage",
			async ({ firstName, lastName, userId, targetUserId, text }) => {
				try {
					const roomId = getSecretRoomId(userId, targetUserId);

					let chat = await Chat.findOne({
						participants: { $all: [userId, targetUserId] },
					});
					if (!chat) {
						chat = new Chat({
							participants: [userId, targetUserId],
							messages: [],
						});
					}

					chat.messages.push({
						senderId: userId,
						text: text,
					});
					///home/rdm/Desktop/namaste%20dev/namasteNodeJS/dev-tinder-server/src/utils/socket.js

					file: await chat.save();

					io.to(roomId).emit("messageReceived", {
						senderId: userId,
						firstName,
						lastName,
						text,
					});
				} catch (err) {
					console.log(err);
				}
			}
		);

		socket.on("joinNotifications", ({ userId }) => {
			//Each user joins a private room based on their ID
			socket.join(userId);
			console.log("joinNotifications Event");
		});

		socket.on("disconnect", () => {
			console.log("User disconnected");
		});
	});
	return io; //Return the io instance
};

const emitNewNotification = (recipientId, data) => {
	// Check if the server instance is active
	if (ioInstance) {
		// Use the global ioInstance to emit the event to the recipient's room
		ioInstance.to(recipientId).emit("newNotification", data);
		console.log(`Emitted newNotification to room: ${recipientId}`);
	} else {
		// Log an error if the server is not initialized
		console.error("Socket.IO not initialized, cannot emit notification.");
	}
};

module.exports = { initializeSocket, emitNewNotification };
