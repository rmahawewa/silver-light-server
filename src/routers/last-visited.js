const express = require("express");
const lastVisitedRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const LastVisited = require("../models/last-visited");

lastVisitedRouter.post("/lastvisited/save", userAuth, async (req, res) => {
	try {
		const loggedUserId = req.user._id;
		const { siteUrl } = req.body;
		const LastVisited = new LastVisited({
			userId: loggedUserId,
			visitedURL: siteUrl,
		});
		const lastvisited = await LastVisited.save();
		res.json({
			message: "Page visited data saved successfully",
			data: lastvisited,
		});
	} catch (err) {
		res.status(400).send(err.message);
	}
});

module.exports = lastVisitedRouter;
