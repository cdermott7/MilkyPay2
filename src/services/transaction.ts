import api from './api';
import { sendClaimLinkSMS } from './sms';
import { toast } from 'react-hot-toast';

/**
 * Service to handle transaction operations with SMS integration
 */

/**
 * Process a phone transfer by creating a claimable balance and sending SMS
 * @param publicKey Sender's public key
 * @param secretKey Sender's secret key
 * @param phoneNumber Recipient's phone number
 * @param amount Amount to send
 * @param senderName Optional sender name to display in the SMS
 * @param memo Optional memo for the transaction
 */
export const sendPhoneTransfer = async (
  claimableBalanceResult: any,
  phoneNumber: string,
  amount: string,
  senderName?: string
) => {
  try {
    // Extract the data from the claimable balance result
    const { balanceId, pin } = claimableBalanceResult;
    
    if (!balanceId || !pin) {
      throw new Error('Missing balanceId or PIN from claimable balance result');
    }
    
    // Generate a random claimId to use in the SMS link
    const claimId = `claim-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Send SMS with claim link
    const smsResult = await sendClaimLinkSMS(
      phoneNumber,
      amount,
      pin,
      claimId,
      senderName
    );
    
    if (!smsResult.success) {
      // SMS failed, but transaction succeeded
      toast.warning('Transaction successful, but SMS notification failed to send');
      console.error('SMS notification failed:', smsResult.error);
      
      // Return the successful transaction with a warning flag
      return {
        ...claimableBalanceResult,
        smsStatus: 'failed',
        smsError: smsResult.error
      };
    }
    
    // Return combined result
    return {
      ...claimableBalanceResult,
      smsStatus: 'sent',
      claimId
    };
  } catch (error) {
    console.error('Phone transfer processing error:', error);
    throw error;
  }
};

/**
 * Process a direct Stellar address transfer
 * Simply a pass-through to the payment API for now
 */
export const sendAddressTransfer = async (
  sourceKeypair: string,
  destination: string,
  amount: string,
  memo?: string
) => {
  try {
    const result = await api.post('/tx/send', {
      sourceKeypair,
      destination,
      amount,
      memo
    });
    
    return result.data;
  } catch (error) {
    console.error('Direct transfer error:', error);
    throw error;
  }
};

export default {
  sendPhoneTransfer,
  sendAddressTransfer
};