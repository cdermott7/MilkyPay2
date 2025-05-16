const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Twilio credentials - from environment variables only
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

// Check for required environment variables
if (!accountSid || !authToken || !fromNumber) {
  console.warn('WARNING: Missing Twilio credentials.');
  console.warn('SMS functionality will be simulated only.');
}

// Initialize Twilio client if credentials are available
const twilioClient = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-sms.html'));
});

app.post('/api/sms/claim-link', async (req, res) => {
  try {
    const { phoneNumber, amount, pin, claimId, senderName } = req.body;
    
    if (!phoneNumber || !amount || !pin || !claimId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: phoneNumber, amount, pin, claimId'
      });
    }
    
    console.log('Request body:', req.body);
    
    // Generate claim link
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const claimLink = `${appUrl}/claim/${claimId}`;
    
    // Create the message content
    let message;
    if (senderName) {
      message = `${senderName} sent you ${amount} via MilkyPay! Use PIN: ${pin} to claim your funds at ${claimLink}`;
    } else {
      message = `You received ${amount} via MilkyPay! Use PIN: ${pin} to claim your funds at ${claimLink}`;
    }
    
    console.log(`Sending SMS to ${phoneNumber.substring(0, 5)}*****:`, message);
    
    // Check if Twilio client is available
    if (!twilioClient) {
      console.log('SIMULATED: SMS would be sent (Twilio credentials not configured)');
      
      return res.json({
        success: true,
        simulated: true,
        message: 'SMS simulated (Twilio credentials not configured)'
      });
    }
    
    // Send the SMS via Twilio
    const twilioMessage = await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to: phoneNumber
    });
    
    console.log('SMS sent successfully!');
    console.log('SID:', twilioMessage.sid);
    console.log('Status:', twilioMessage.status);
    
    res.json({
      success: true,
      sid: twilioMessage.sid,
      status: twilioMessage.status
    });
  } catch (error) {
    console.error('Failed to send SMS:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error sending SMS'
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Simple SMS test server running at http://localhost:${port}`);
  console.log(`Access the test page at http://localhost:${port}`);
});