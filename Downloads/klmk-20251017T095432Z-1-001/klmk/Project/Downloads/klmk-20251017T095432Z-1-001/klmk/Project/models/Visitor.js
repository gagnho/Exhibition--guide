const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    entryTime: { type: Date, default: Date.now },
    exitTime: { type: Date },
    phoneNumber: String,
    visitNumber: Number,
    location: {
        lat: Number,
        lng: Number
    }
});

module.exports = mongoose.model('Visitor', visitorSchema);