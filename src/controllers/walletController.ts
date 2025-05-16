import { Request, Response } from 'express';
import StellarSdk, { Keypair, Server } from 'stellar-sdk';

// Config
const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = process.env.NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';

// Initialize Stellar server connection
const server = new Server(HORIZON_URL);

/**
 * Create a new Stellar wallet
 */
export const createWallet = async (req: Request, res: Response) => {
  try {
    // Generate new keypair
    const keypair = Keypair.random();
    const publicKey = keypair.publicKey();
    const secretKey = keypair.secret();
    
    // Fund the account on testnet
    if (!process.env.NETWORK_PASSPHRASE || process.env.NETWORK_PASSPHRASE.includes('Test')) {
      try {
        const friendbotResponse = await fetch(
          `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
        );
        
        if (!friendbotResponse.ok) {
          return res.status(500).json({
            success: false,
            error: 'Failed to fund account with Friendbot',
          });
        }
      } catch (fundError) {
        console.error('Friendbot error:', fundError);
        // Continue anyway as this might be temporary
      }
    }
    
    return res.status(201).json({
      success: true,
      data: {
        publicKey,
        secretKey,
      },
    });
  } catch (error) {
    console.error('Error creating wallet:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create wallet',
    });
  }
};

/**
 * Get wallet details
 */
export const getWallet = async (req: Request, res: Response) => {
  try {
    const { publicKey } = req.params;
    
    // Load account from Horizon
    try {
      const account = await server.loadAccount(publicKey);
      
      return res.status(200).json({
        success: true,
        data: {
          publicKey,
          sequence: account.sequence,
          balances: account.balances,
        },
      });
    } catch (error) {
      // If account doesn't exist yet
      return res.status(404).json({
        success: false,
        error: 'Account not found',
      });
    }
  } catch (error) {
    console.error('Error getting wallet:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get wallet details',
    });
  }
};

/**
 * Get wallet balance
 */
export const getBalance = async (req: Request, res: Response) => {
  try {
    const { publicKey } = req.params;
    
    // Load account from Horizon
    try {
      const account = await server.loadAccount(publicKey);
      
      // Get native (XLM) balance
      const xlmBalance = account.balances.find(
        (balance: any) => balance.asset_type === 'native'
      );
      
      // Get other asset balances
      const otherBalances = account.balances.filter(
        (balance: any) => balance.asset_type !== 'native'
      );
      
      return res.status(200).json({
        success: true,
        data: {
          publicKey,
          xlmBalance: xlmBalance || { asset_type: 'native', balance: '0' },
          otherBalances,
        },
      });
    } catch (error) {
      // If account doesn't exist yet
      return res.status(404).json({
        success: false,
        error: 'Account not found',
      });
    }
  } catch (error) {
    console.error('Error getting balance:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get wallet balance',
    });
  }
};