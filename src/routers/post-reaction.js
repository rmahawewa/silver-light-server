const express = require("express");
const postReactionRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const Post = require("../models/post");

module.exports = postReactionRouter;
