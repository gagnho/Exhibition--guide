const multer = require('multer');
const path = require('path');
const fs = require('fs');

class ImageService {
    constructor() {
        this.storage = multer.diskStorage({
            destination: (req, file, cb) => {
                const dir = path.join(__dirname, '../uploads/projects');
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                cb(null, dir);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
            }
        });

        this.upload = multer({
            storage: this.storage,
            limits: {
                fileSize: 5 * 1024 * 1024 // 5MB limit
            },
            fileFilter: (req, file, cb) => {
                const allowedTypes = /jpeg|jpg|png|gif/;
                const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
                const mimetype = allowedTypes.test(file.mimetype);
                
                if (extname && mimetype) {
                    return cb(null, true);
                } else {
                    cb('Error: Images only!');
                }
            }
        });
    }

    async saveImage(file) {
        return new Promise((resolve, reject) => {
            this.upload.single('image')(file, null, async (err) => {
                if (err) reject(err);
                resolve({
                    filename: file.filename,
                    path: `/uploads/projects/${file.filename}`
                });
            });
        });
    }

    async deleteImage(filename) {
        const filepath = path.join(__dirname, '../uploads/projects', filename);
        return new Promise((resolve, reject) => {
            fs.unlink(filepath, (err) => {
                if (err) reject(err);
                resolve(true);
            });
        });
    }
}

module.exports = new ImageService();
