// config/multer.js
import multer from 'multer';

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    console.log('Multer processing file:', file); // Add logging
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

const storage = multer.memoryStorage();

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

export default upload;
