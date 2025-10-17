const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const MapService = require('./services/MapService');
const multer = require('multer');
const twilio = require('twilio');
require('dotenv').config();
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MongoDB Schema
const visitorSchema = new mongoose.Schema({
    count: { type: Number, default: 0 },
    visitorDetails: [{
        entryTime: Date,
        exitTime: Date,
        location: String
    }]
});

const Visitor = mongoose.model('Visitor', visitorSchema);

// Project Schema
const projectSchema = new mongoose.Schema({
    title: String,
    students: [String],
    supervisor: String,
    location: {
        lat: Number,
        lng: Number,
        description: String
    },
    images: [String],
    description: String
});

const Project = mongoose.model('Project', projectSchema);

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Add Multer configuration for image storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/projects')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// Add authentication middleware
const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Routes
app.get('/api/visitors', async (req, res) => {
    try {
        let visitor = await Visitor.findOne();
        if (!visitor) {
            visitor = new Visitor({ count: 0 });
            await visitor.save();
        }
        res.json({ count: visitor.count });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/visitors/increment', async (req, res) => {
    try {
        let visitor = await Visitor.findOne();
        if (!visitor) {
            visitor = new Visitor({ count: 0 });
        }
        visitor.count += 1;
        await visitor.save();
        res.json({ count: visitor.count, visitorNumber: visitor.count });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Project routes
app.post('/api/projects', authenticateAdmin, upload.array('images', 5), async (req, res) => {
    try {
        const imageUrls = req.files.map(file => `/uploads/projects/${file.filename}`);
        const project = new Project({
            ...req.body,
            images: imageUrls
        });
        await project.save();
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/projects/:id/location', async (req, res) => {
    try {
        const project = await MapService.saveProjectLocation(req.params.id, req.body.location);
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/projects/:id/images', upload.array('images'), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        const images = req.files.map(file => file.path);
        project.images = project.images.concat(images);
        await project.save();
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Error uploading images' });
    }
});

app.post('/api/visitors/exit', async (req, res) => {
    try {
        const { phoneNumber, duration } = req.body;
        
        // Send SMS using Twilio
        await twilioClient.messages.create({
            body: `Thank you for visiting the STEM Exhibition! You spent ${duration} minutes exploring. We hope you enjoyed your visit!`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });

        const visitor = await Visitor.findOne();
        if (!visitor) {
            throw new Error('No visitor record found');
        }
        
        // Record exit time for the latest visitor
        if (visitor.visitorDetails.length > 0) {
            const lastVisitor = visitor.visitorDetails[visitor.visitorDetails.length - 1];
            lastVisitor.exitTime = new Date();
            await visitor.save();
        }
        
        res.json({ message: 'Exit recorded and SMS sent successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/test', async (req, res) => {
    try {
        await mongoose.connection.db.admin().ping();
        res.json({ status: 'success', message: 'Database connected!' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Add analytics endpoints
app.get('/api/analytics', authenticateAdmin, async (req, res) => {
    try {
        const analytics = await getAnalytics();
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB Connected Successfully');
        app.listen(port, () => {
            console.log(`🚀 Server running on port ${port}`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    });
