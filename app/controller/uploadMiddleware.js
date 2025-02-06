import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'images'; // Default folder for images

    if (/mp4|mov|avi/.test(file.mimetype)) {
      folder = 'videos';
    } else if (/mp3|wav/.test(file.mimetype)) {
      folder = 'audio';
    }

    const destinationPath = path.resolve(__dirname, `../../../frontend/public/assets/${folder}`);
    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif|mp3|wav|mp4|mov|avi|pdf/;
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));

    if (mimeType && extname) {
      return cb(null, true);
    }
    cb(new Error('Unsupported file format'));
  },
}).single('file');