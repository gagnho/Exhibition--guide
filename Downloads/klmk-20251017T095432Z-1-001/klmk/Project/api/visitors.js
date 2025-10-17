const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    count: { type: Number, default: 0 },
    visitorDetails: [{
        entryTime: Date,
        exitTime: Date,
        location: String
    }]
});

const Visitor = mongoose.models.Visitor || mongoose.model('Visitor', visitorSchema);

module.exports = async (req, res) => {
    await mongoose.connect(process.env.MONGODB_URI);
    let visitor = await Visitor.findOne();
    if (!visitor) {
        visitor = new Visitor({ count: 0 });
        await visitor.save();
    }
    res.status(200).json({ count: visitor.count });
};
