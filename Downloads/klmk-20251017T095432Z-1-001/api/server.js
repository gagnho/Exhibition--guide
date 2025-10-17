const express = require('express');
const mongoose = require('mongoose');
const twilio = require('twilio');

const app = express();
app.use(express.json());

// MongoDB setup
mongoose.connect(process.env.MONGODB_URI);

const visitorSchema = new mongoose.Schema({
  count: { type: Number, default: 0 }
});
const Visitor = mongoose.models.Visitor || mongoose.model('Visitor', visitorSchema);


// Twilio setup
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);


// Serve static files
const path = require('path');
app.use('/public', express.static(path.join(__dirname, '../public')));

// Welcome route serves the UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/api/visitors', async (req, res) => {
  let visitor = await Visitor.findOne();
  if (!visitor) {
    visitor = new Visitor({ count: 0 });
    await visitor.save();
  }
  res.json({ count: visitor.count });
});

app.post('/api/visitors', async (req, res) => {
  let visitor = await Visitor.findOne();
  if (!visitor) {
    visitor = new Visitor({ count: 0 });
  }
  visitor.count += 1;
  await visitor.save();
  const { phoneNumber } = req.body;
  if (phoneNumber) {
    await twilioClient.messages.create({
      body: `Thank you for visiting! You are visitor #${visitor.count}.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
  }
  res.json({ count: visitor.count });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
