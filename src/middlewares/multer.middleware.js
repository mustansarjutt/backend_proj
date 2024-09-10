import multer, { diskStorage } from "multer";

const storage = diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./public/temp");
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

const upload = multer({ storage });

export { upload }