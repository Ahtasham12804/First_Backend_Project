import multer from "multer";


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/public/temp/'); // Specify the destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Generate a unique suffix for the file name
        cb(null, file.originalname ); // Use the original file name for the uploaded file
    }
});

export const upload = multer({storage })