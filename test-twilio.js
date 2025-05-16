// Simple script to test Twilio directly
// Make sure to set environment variables before running

// These credentials should come from environment variables only
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;
const toNumber = process.env.TARGET_PHONE_NUMBER; // Never hardcode phone numbers

// Check for required environment variables
if (!accountSid || !authToken || !fromNumber || !toNumber) {
  console.error('ERROR: Missing required environment variables');
  console.error('Required variables:');
  console.error('- TWILIO_ACCOUNT_SID');
  console.error('- TWILIO_AUTH_TOKEN');
  console.error('- TWILIO_PHONE_NUMBER');
  console.error('- TARGET_PHONE_NUMBER');
  process.exit(1);
}

const twilio = require('twilio');
const client = twilio(accountSid, authToken);

console.log('Twilio Test Script');
console.log('------------------');
console.log('Account SID:', accountSid.substring(0, 5) + '...');
console.log('Auth Token:', '********');
console.log('From Number:', fromNumber);
console.log('To Number:', toNumber.substring(0, 5) + '...');
console.log('------------------');
console.log('Sending test message...');

client.messages
  .create({
     body: 'This is a test message from MilkyPay',
     from: fromNumber,
     to: toNumber
   })
  .then(message => {
    console.log('SUCCESS!');
    console.log('Message SID:', message.sid);
    console.log('Status:', message.status);
  })
  .catch(error => {
    console.error('ERROR!');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('More info:', error.moreInfo);
  });