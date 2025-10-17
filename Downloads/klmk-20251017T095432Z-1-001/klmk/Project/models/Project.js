const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    supervisor: String,
    students: [String],
    images: [String],
    location: {
        lat: Number,
        lng: Number
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);