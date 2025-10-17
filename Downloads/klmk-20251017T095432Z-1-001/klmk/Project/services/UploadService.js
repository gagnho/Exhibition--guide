const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

class UploadService {
    constructor() {
        this.createUploadDirectories();
        this.storage = this.configureStorage();
        this.upload = this.configureMulter();
    }

    createUploadDirectories() {
        const dirs = ['uploads', 'uploads/projects', 'uploads/temp'];
        dirs.forEach(dir => {
            const dirPath = path.join(__dirname, '..', dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        });
    }

    configureStorage() {
        return multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, path.join(__dirname, '..', process.env.UPLOAD_PATH, 'temp'));
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
            }
        });
    }

    configureMulter() {
        return multer({
            storage: this.storage,
            limits: {
                fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB default
            },
            fileFilter: (req, file, cb) => {
                const allowedTypes = process.env.ALLOWED_FILE_TYPES.split(',');
                if (allowedTypes.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new Error('Invalid file type. Only images are allowed.'));
                }
            }
        });
    }

    async uploadToCloud(filePath) {
        try {
            const result = await cloudinary.uploader.upload(filePath, {
                folder: 'exhibition/projects'
            });
            // Delete local file after upload
            fs.unlinkSync(filePath);
            return result.secure_url;
        } catch (error) {
            console.error('Cloud upload error:', error);
            throw error;
        }
    }

    async deleteFromCloud(publicId) {
        try {
            await cloudinary.uploader.destroy(publicId);
            return true;
        } catch (error) {
            console.error('Cloud delete error:', error);
            throw error;
        }
    }

    getUploadMiddleware() {
        return this.upload;
    }
}

module.exports = new UploadService();