const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const ConnectionRequest = require("../models/connection-request");
const User = require("../models/user");

requestRouter.post("/request/send", userAuth, async (req, res) => {
	try {
		const fromUserId = req.user._id;
		const { toUserId } = req.body;
		const status = "sent";

		const toUser = await User.findById(toUserId);
		if (!toUser) {
			return res.status(400).json({ message: "User not found" });
		}

		const existingConnectionRequest = await ConnectionRequest.findOne({
			$or: [
				{ fromUserId: fromUserId, toUserId: toUserId },
				{ fromUserId: toUserId, toUserId: fromUserId },
			],
		});
		if (existingConnectionRequest) {
			return res
				.status(400)
				.send({ message: "Connection Request already exist" });
		}
		const connectionRequest = new ConnectionRequest({
			fromUserId: fromUserId,
			toUserId: toUserId,
			status: status,
		});
		const savedConnectionRequest = await connectionRequest.save();
		res.json({
			message: "Connection Request Sent Successfully!",
			data: savedConnectionRequest,
		});
	} catch (err) {
		res.status(400).send(err.message);
	}
});

requestRouter.post(
	"/request/received/:response/:requestId",
	userAuth,
	async (req, res) => {
		try {
			const loggedInUser = req.user;
			const allowedResponces = ["accepted", "rejected"];
			const { response, requestId } = req.params;
			if (!allowedResponces.includes(response)) {
				return res.status(400).json({ message: "Status is not valid" });
			}
			const connectionRequest = await ConnectionRequest.findOne({
				_id: requestId,
				toUserId: loggedInUser,
				status: "sent",
			});
			if (!connectionRequest) {
				return res
					.status(404)
					.json({ message: "Connection request not found" });
			}
			connectionRequest.status = response;
			const save = await connectionRequest.save();
			res.json({ message: "Connection request " + response, data: save });
		} catch (err) {
			res.status(400).send(err.message);
		}
	}
);

requestRouter.get("/request/user-requests", userAuth, async (req, res) => {
	try {
		const loggedInUser = req.user._id;
		const connRequests = await ConnectionRequest.find({
			$or: [
				{
					fromUserId: loggedInUser,
					toUserId: { $ne: loggedInUser },
				},
				{
					toUserId: loggedInUser,
					fromUserId: { $ne: loggedInUser },
				},
			],
		});
		res.json({ connections: connRequests });
	} catch (err) {
		res.status(400).send(err.message);
	}
});

module.exports = requestRouter;
