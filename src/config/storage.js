const multer = require("multer");

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "src/uploads");
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + "-" + file.originalname.replaceAll(" ", ""));
	},
});

//Create the upload middleware instance using the storage config
const upload = multer({ storage: storage });

module.exports = upload;
