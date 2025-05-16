import crypto from 'crypto';

// In-memory store for PINs (replace with database in production)
const pinStore: Record<string, { pin: string, attempts: number, locked: boolean }> = {};

/**
 * Generate a random PIN
 */
export const generatePin = async (): Promise<string> => {
  // Generate a 6-digit PIN
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  return pin;
};

/**
 * Store a PIN for a link
 */
export const storePin = async (linkId: string, pin: string): Promise<void> => {
  pinStore[linkId] = {
    pin,
    attempts: 0,
    locked: false
  };
};

/**
 * Validate a PIN for a link
 */
export const validatePin = async (linkId: string, pin: string): Promise<boolean> => {
  const pinData = pinStore[linkId];
  
  // Check if link exists
  if (!pinData) {
    return false;
  }
  
  // Check if account is locked
  if (pinData.locked) {
    throw new Error('Too many incorrect attempts. Link is locked.');
  }
  
  // Validate PIN
  if (pinData.pin === pin) {
    // Reset attempts on successful validation
    pinData.attempts = 0;
    return true;
  } else {
    // Increment attempts
    pinData.attempts += 1;
    
    // Lock after 5 failed attempts
    if (pinData.attempts >= 5) {
      pinData.locked = true;
      throw new Error('Too many incorrect attempts. Link is now locked.');
    }
    
    return false;
  }
};

/**
 * Reset PIN attempts for a link
 */
export const resetPinAttempts = async (linkId: string): Promise<void> => {
  if (pinStore[linkId]) {
    pinStore[linkId].attempts = 0;
    pinStore[linkId].locked = false;
  }
};
