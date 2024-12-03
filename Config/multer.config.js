// multerConfig.js
import multer from 'multer';


const storage = multer.memoryStorage(); // Store file in memory temporarily
const upload = multer({ storage });

export default upload;
