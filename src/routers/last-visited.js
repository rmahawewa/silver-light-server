const express = require("express");
const lastVisitedRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const LastVisited = require("../models/last-visited");

lastVisitedRouter.post("/lastvisited/save", userAuth, async (req, res) => {
	try {
		const loggedUserId = req.user._id;
		const { siteUrl } = req.body;
		const lastVisited = new LastVisited({
			userId: loggedUserId,
			visitedURL: siteUrl,
		});
		const lastvisitedSaved = await lastVisited.save();
		res.json({
			message: "Page visited data saved successfully",
			data: lastvisitedSaved,
		});
	} catch (err) {
		res.status(400).send(err.message);
	}
});

lastVisitedRouter.post("/lastvisited/get", userAuth, async (req, res) => {
	try {
		const { loggedInUsr, siteUrl } = req.body;
		const lastVisitedDateTime = await LastVisited.find({
			userId: loggedInUsr,
			visitedURL: siteUrl,
		})
			.sort({ createdAt: -1 })
			.limit(1);

		res.json({ data: lastVisitedDateTime });
	} catch (err) {
		res.status("400").send(err.message);
	}
});

module.exports = lastVisitedRouter;
