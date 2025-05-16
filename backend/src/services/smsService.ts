import twilio from 'twilio';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

// Log Twilio configuration (redacted for security)
console.log('SMS Service: Twilio Configuration');
console.log('Account SID exists:', !!accountSid);
console.log('Auth Token exists:', !!authToken);
console.log('From Number exists:', !!fromNumber);
console.log('Account SID starts with AC:', accountSid?.startsWith('AC'));

// Initialize Twilio client if credentials are available
let twilioClient = null;
try {
  if (accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken);
    console.log('Twilio client initialized successfully');
  } else {
    console.log('Twilio client not initialized due to missing credentials');
  }
} catch (error) {
  console.error('Failed to initialize Twilio client:', error);
}

/**
 * Format a phone number to E.164 format
 * @param phoneNumber Phone number to format
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters except the + prefix
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Ensure it starts with +
  if (!cleaned.startsWith('+')) {
    // If it's a North American number without country code, add +1
    if (cleaned.length === 10) {
      cleaned = `+1${cleaned}`;
    } else {
      cleaned = `+${cleaned}`;
    }
  }
  
  // Special case for Canadian/US numbers with format 905-xxx-xxxx
  // If number starts with +1905, ensure proper formatting
  if (cleaned.startsWith('+1905') && cleaned.length === 12) {
    console.log('Detected Canadian number with 905 area code');
  }
  
  // Log the formatted number
  console.log(`Phone number formatting: "${phoneNumber}" → "${cleaned}"`);
  
  return cleaned;
};

/**
 * Validate a phone number
 * @param phoneNumber The phone number to validate
 */
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Remove all non-digit characters except + for validation
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Simple validation: should start with + and be at least 10 digits
  if (cleaned.startsWith('+')) {
    return cleaned.length >= 11; // + and at least 10 digits
  } else {
    return cleaned.length >= 10; // at least 10 digits
  }
};

/**
 * Generate a claim link
 */
const generateClaimLink = (claimId: string): string => {
  // Get the app URL from environment variables
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  
  // In a real-world app, you might use a URL shortener here
  return `${appUrl}/claim/${claimId}`;
};

/**
 * Send an SMS message
 * @param to Recipient phone number
 * @param body Message body
 */
export const sendSMS = async (to: string, body: string): Promise<{success: boolean; sid?: string; error?: string}> => {
  try {
    // Check if Twilio is configured
    if (!twilioClient || !fromNumber) {
      console.log('--------------------------------------------------');
      console.log('Twilio not configured or missing "from" number');
      console.log('Twilio Client exists:', !!twilioClient);
      console.log('From Number exists:', !!fromNumber);
      console.log('Mock sending SMS to:', to);
      console.log('SMS Body:', body);
      console.log('--------------------------------------------------');
      
      // Return mock success for development
      return { 
        success: true, 
        sid: `MOCK_${Date.now()}` 
      };
    }
    
    // Format the phone number
    const formattedPhone = formatPhoneNumber(to);
    console.log('Sending real SMS via Twilio');
    console.log('To:', formattedPhone);
    console.log('From:', fromNumber);
    console.log('Body length:', body.length);
    
    // Send the SMS
    console.log('Attempting to send SMS via Twilio API');
    try {
      const message = await twilioClient.messages.create({
        body,
        from: fromNumber,
        to: formattedPhone
      });
      console.log('Twilio API call successful');
      return {
        success: true,
        sid: message.sid
      };
    } catch (error: any) {
      // Cast the error to any to get properties
      const twilioError = error as any;
      
      console.error('Twilio API Error:');
      console.error('- Code:', twilioError.code);
      console.error('- Message:', twilioError.message);
      console.error('- Status:', twilioError.status);
      console.error('- More Info:', twilioError.moreInfo);
      
      // Check for common Twilio errors
      if (twilioError.code === 21211) {
        return {
          success: false,
          error: 'Invalid phone number format. Please check the number and try again.'
        };
      } else if (twilioError.code === 21608) {
        return {
          success: false,
          error: 'The Twilio phone number is not capable of sending to this destination.'
        };
      } else if (twilioError.code === 20003) {
        return {
          success: false,
          error: 'Authentication failed. Please check your Twilio credentials.'
        };
      }
      
      // Return a generic error response instead of re-throwing
      return {
        success: false,
        error: twilioError.message || 'Unknown error from Twilio API'
      };
    }
    
    // This code is unreachable now as the return statements are in the try/catch blocks
  } catch (error: any) {
    console.error('--------------------------------------------------');
    console.error('Failed to send SMS:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error status:', error.status);
    console.error('--------------------------------------------------');
    return {
      success: false,
      error: error.message || 'Unknown error sending SMS'
    };
  }
};

/**
 * Send a claim link via SMS
 * @param phoneNumber Recipient's phone number
 * @param amount Amount sent
 * @param pin PIN for claiming
 * @param claimId Claimable balance ID
 * @param senderName Sender's name (optional)
 */
export const sendClaimLinkSMS = async (
  phoneNumber: string,
  amount: string,
  pin: string,
  claimId: string,
  senderName?: string
): Promise<{success: boolean; sid?: string; error?: string}> => {
  try {
    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number format');
    }
    
    // Generate claim link
    const claimLink = generateClaimLink(claimId);
    
    // Format the amount for display (ensure it has $ if not already)
    const formattedAmount = amount.startsWith('$') ? amount : `$${amount}`;
    
    // Create the message
    let message: string;
    if (senderName) {
      message = `${senderName} sent you ${formattedAmount} via MilkyPay! Use PIN: ${pin} to claim your funds at ${claimLink}`;
    } else {
      message = `You received ${formattedAmount} via MilkyPay! Use PIN: ${pin} to claim your funds at ${claimLink}`;
    }
    
    // Send the SMS
    return await sendSMS(phoneNumber, message);
  } catch (error: any) {
    console.error('Failed to send claim link SMS:', error);
    return {
      success: false,
      error: error.message || 'Unknown error sending claim link SMS'
    };
  }
};

/**
 * Send a status update SMS for a claim or payment
 * @param phoneNumber Recipient's phone number
 * @param status Status of the transaction (success, pending, failed)
 * @param amount Amount involved
 * @param type Type of transaction (claim, payment)
 */
export const sendStatusSMS = async (
  phoneNumber: string,
  status: 'success' | 'pending' | 'failed',
  amount: string,
  type: 'claim' | 'payment'
): Promise<{success: boolean; sid?: string; error?: string}> => {
  try {
    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number format');
    }
    
    // Format the amount for display
    const formattedAmount = amount.startsWith('$') ? amount : `$${amount}`;
    
    // Create the message based on status and type
    let message: string;
    
    if (type === 'claim') {
      if (status === 'success') {
        message = `Success! Your claim of ${formattedAmount} has been processed and added to your MilkyPay wallet.`;
      } else if (status === 'pending') {
        message = `Your claim of ${formattedAmount} is being processed. You'll receive confirmation shortly.`;
      } else {
        message = `Your claim of ${formattedAmount} could not be processed. Please try again or contact support.`;
      }
    } else { // payment
      if (status === 'success') {
        message = `Your payment of ${formattedAmount} has been successfully processed.`;
      } else if (status === 'pending') {
        message = `Your payment of ${formattedAmount} is being processed. You'll receive confirmation shortly.`;
      } else {
        message = `Your payment of ${formattedAmount} could not be processed. Please try again or contact support.`;
      }
    }
    
    // Send the SMS
    return await sendSMS(phoneNumber, message);
  } catch (error: any) {
    console.error('Failed to send status SMS:', error);
    return {
      success: false,
      error: error.message || 'Unknown error sending status SMS'
    };
  }
};

export default {
  sendSMS,
  sendClaimLinkSMS,
  sendStatusSMS,
  validatePhoneNumber,
  formatPhoneNumber,
};