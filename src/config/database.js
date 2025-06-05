const mongoose = require("mongoose");

//Connect to the mongo db cluster
const connectDB = async () => {
	await mongoose.connect(process.env.DB_CONNECTION_SECRET);
};

module.exports = connectDB;
