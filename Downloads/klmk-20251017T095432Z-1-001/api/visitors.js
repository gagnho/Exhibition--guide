
const mongoose = require('mongoose');
const twilio = require('twilio');

const visitorSchema = new mongoose.Schema({
    count: { type: Number, default: 0 }
});

const Visitor = mongoose.models.Visitor || mongoose.model('Visitor', visitorSchema);

const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

module.exports = async (req, res) => {
    await mongoose.connect(process.env.MONGODB_URI);
    let visitor = await Visitor.findOne();
    if (!visitor) {
        visitor = new Visitor({ count: 0 });
        await visitor.save();
    }

    // If POST, increment count and send SMS
    if (req.method === 'POST') {
        visitor.count += 1;
        await visitor.save();
        // Send SMS to provided phone number
        const { phoneNumber } = req.body;
        if (phoneNumber) {
            await twilioClient.messages.create({
                body: `Thank you for visiting! You are visitor #${visitor.count}.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phoneNumber
            });
        }
        return res.status(200).json({ count: visitor.count });
    }

    // If GET, just return count
    res.status(200).json({ count: visitor.count });
};
