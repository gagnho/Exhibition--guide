const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');

// Get visitor count
router.get('/count', async (req, res) => {
    try {
        const count = await Visitor.countDocuments();
        res.json({ totalVisitors: count });
    } catch (error) {
        console.error('Error getting visitor count:', error);
        res.status(500).json({ error: 'Failed to get visitor count' });
    }
});

// Record new visitor
router.post('/record', async (req, res) => {
    try {
        const count = await Visitor.countDocuments();
        const visitor = new Visitor({
            visitorNumber: count + 1,
            entryTime: new Date()
        });
        await visitor.save();
        res.json({ 
            message: 'Visitor recorded successfully',
            visitorNumber: count + 1
        });
    } catch (error) {
        console.error('Error recording visitor:', error);
        res.status(500).json({ error: 'Failed to record visitor' });
    }
});

module.exports = router;