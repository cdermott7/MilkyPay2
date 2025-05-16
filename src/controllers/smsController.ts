import { Request, Response } from 'express';
import * as smsService from '../services/smsService';

/**
 * Send a claim link via SMS
 */
export const sendClaimLink = async (req: Request, res: Response) => {
  console.log('SMS Controller: Received claim link request');
  console.log('Request body:', req.body);
  
  try {
    const { phoneNumber, amount, pin, claimId, senderName } = req.body;
    
    console.log('SMS Controller: Extracted data:');
    console.log('- Phone:', phoneNumber);
    console.log('- Amount:', amount);
    console.log('- PIN:', pin);
    console.log('- Claim ID:', claimId);
    console.log('- Sender:', senderName || 'Not provided');
    
    if (!phoneNumber || !amount || !pin || !claimId) {
      console.log('SMS Controller: Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: phoneNumber, amount, pin, claimId',
      });
    }
    
    // Validate phone number
    console.log('SMS Controller: Validating phone number:', phoneNumber);
    if (!smsService.validatePhoneNumber(phoneNumber)) {
      console.log('SMS Controller: Invalid phone number format');
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format',
      });
    }
    
    // Send the SMS
    console.log('SMS Controller: Calling smsService.sendClaimLinkSMS()');
    const result = await smsService.sendClaimLinkSMS(
      phoneNumber,
      amount,
      pin,
      claimId,
      senderName
    );
    
    console.log('SMS Controller: Result from sendClaimLinkSMS:', result);
    
    if (result.success) {
      console.log('SMS Controller: SMS sent successfully, SID:', result.sid);
      return res.status(200).json({
        success: true,
        data: {
          sid: result.sid,
          phoneNumber: smsService.formatPhoneNumber(phoneNumber),
          claimId,
        },
      });
    } else {
      console.log('SMS Controller: Failed to send SMS:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to send SMS',
      });
    }
  } catch (error: any) {
    console.error('SMS controller error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send claim link SMS',
    });
  }
};

/**
 * Send a status update SMS
 */
export const sendStatusUpdate = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, status, amount, type } = req.body;
    
    if (!phoneNumber || !status || !amount || !type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: phoneNumber, status, amount, type',
      });
    }
    
    // Validate phone number
    if (!smsService.validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format',
      });
    }
    
    // Validate status and type
    if (!['success', 'pending', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: success, pending, failed',
      });
    }
    
    if (!['claim', 'payment'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid type. Must be one of: claim, payment',
      });
    }
    
    // Send the SMS
    const result = await smsService.sendStatusSMS(
      phoneNumber,
      status as 'success' | 'pending' | 'failed',
      amount,
      type as 'claim' | 'payment'
    );
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        data: {
          sid: result.sid,
          phoneNumber: smsService.formatPhoneNumber(phoneNumber),
          status,
        },
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to send SMS',
      });
    }
  } catch (error: any) {
    console.error('SMS controller error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send status SMS',
    });
  }
};

/**
 * Verify a phone number
 */
export const verifyPhoneNumber = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: phoneNumber',
      });
    }
    
    // Validate and format the phone number
    const isValid = smsService.validatePhoneNumber(phoneNumber);
    const formattedNumber = isValid ? smsService.formatPhoneNumber(phoneNumber) : null;
    
    return res.status(200).json({
      success: true,
      data: {
        isValid,
        formattedNumber,
        original: phoneNumber,
      },
    });
  } catch (error: any) {
    console.error('Phone verification error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify phone number',
    });
  }
};