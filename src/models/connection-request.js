const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
	{
		fromUserId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			require: true,
		},
		toUserId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			require: true,
		},
		status: {
			type: String,
			require: true,
			enum: {
				values: ["sent", "accepted", "rejected"],
				message: `{VALUE} is an incorrect status type`,
			},
		},
	},
	{ timestamps: true }
);

//indexing the schema to find the relevent record easily
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

connectionRequestSchema.pre("save", function (next) {
	const connectionRequest = this;
	//Check if the fromUserId is same as toUserId
	if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
		throw new Error("Cannot send connection request to yourself");
	}
	next();
});

const ConnectionRequestModel = new mongoose.model(
	"ConnectionRequest",
	connectionRequestSchema
);

module.exports = ConnectionRequestModel;
