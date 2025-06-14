const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
	{
		createdUserId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			require: true,
		},
		title: {
			type: String,
		},
		photos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }],
		category: [{}],
		description: {
			type: String,
		},
	},
	{ timestamps: true }
);

postSchema.methods.addCategoriesFromImages = async function () {
	try {
		// Populate the 'photos' field to get the actual Image documents
		//and select only the 'category' field from the Image documents
		const categoriesPopulatedPost = await this.populate({
			path: "photos",
			select: "category",
		});

		//A set to store unique categories
		const newCategories = new Set();

		//Iterate through the populated photos and add their categories
		categoriesPopulatedPost.photos.forEach((photo) => {
			if (photo.category && Array.isArray(photo.category)) {
				photo.category.forEach((categ) => newCategories.add(categ));
			}
		});

		this.category = Array.from(newCategories);

		await this.save();

		console.log(`Categories updated for post: ${this._id}`);
		await this.save();
	} catch (err) {
		console.error(`Error updating the post with id: ${this._id}:`, err.message);
		throw err;
	}
};

module.exports = mongoose.model("Post", postSchema);
