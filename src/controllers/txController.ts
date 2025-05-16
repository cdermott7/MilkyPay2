import { Request, Response } from 'express';
import StellarSdk, { Keypair, Server, Asset, Operation, TransactionBuilder, Claimant } from 'stellar-sdk';

// Config
const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = process.env.NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';

// Initialize Stellar server connection
const server = new Server(HORIZON_URL);

/**
 * Send a payment
 */
export const sendPayment = async (req: Request, res: Response) => {
  try {
    const { sourceSecret, destination, amount, memo } = req.body;
    
    if (!sourceSecret || !destination || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sourceSecret, destination, amount',
      });
    }
    
    // Create source keypair from secret
    const sourceKeypair = Keypair.fromSecret(sourceSecret);
    const sourcePublicKey = sourceKeypair.publicKey();
    
    // Load the source account
    const sourceAccount = await server.loadAccount(sourcePublicKey);
    
    // Build the transaction
    let transaction = new TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.payment({
          destination,
          asset: Asset.native(),
          amount: amount.toString(),
        })
      );
    
    // Add memo if provided
    if (memo) {
      transaction = transaction.addMemo(StellarSdk.Memo.text(memo));
    }
    
    // Build and sign transaction
    const builtTx = transaction.setTimeout(30).build();
    builtTx.sign(sourceKeypair);
    
    // Submit the transaction
    const txResult = await server.submitTransaction(builtTx);
    
    return res.status(200).json({
      success: true,
      data: {
        hash: txResult.hash,
        ledger: txResult.ledger,
        source: sourcePublicKey,
        destination,
        amount,
      },
    });
  } catch (error: any) {
    console.error('Payment error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send payment',
    });
  }
};

/**
 * Create a claimable balance
 */
export const createClaimableBalance = async (req: Request, res: Response) => {
  try {
    const { sourceSecret, claimant, amount, pin, expiresInDays = 7 } = req.body;
    
    if (!sourceSecret || !claimant || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }
    
    // Create source keypair from secret
    const sourceKeypair = Keypair.fromSecret(sourceSecret);
    const sourcePublicKey = sourceKeypair.publicKey();
    
    // Load the source account
    const sourceAccount = await server.loadAccount(sourcePublicKey);
    
    // Set up expiration date
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + expiresInDays);
    
    // Create claim predicate (can claim before expiration date)
    const predicate = Claimant.predicateBeforeAbsoluteTime(
      expirationDate.toISOString()
    );
    
    // Create claimants array
    const claimants = [new Claimant(claimant, predicate)];
    
    // Build the transaction
    let transaction = new TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.createClaimableBalance({
          asset: Asset.native(),
          amount: amount.toString(),
          claimants,
        })
      );
    
    // Add memo with PIN if provided
    if (pin) {
      transaction = transaction.addMemo(StellarSdk.Memo.text(`PIN:${pin}`));
    }
    
    // Build and sign transaction
    const builtTx = transaction.setTimeout(30).build();
    builtTx.sign(sourceKeypair);
    
    // Submit the transaction
    const txResult = await server.submitTransaction(builtTx);
    
    // Get the claimable balance ID from the operation
    const operationsResponse = await server
      .operations()
      .forTransaction(txResult.hash)
      .call();
    
    const balanceId = operationsResponse.records.find(
      (op: any) => op.type === 'create_claimable_balance'
    )?.id;
    
    return res.status(200).json({
      success: true,
      data: {
        hash: txResult.hash,
        ledger: txResult.ledger,
        claimableBalanceId: balanceId,
        claimant,
        amount,
        expirationDate: expirationDate.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Claimable balance error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create claimable balance',
    });
  }
};

/**
 * Claim a balance
 */
export const claimBalance = async (req: Request, res: Response) => {
  try {
    const { claimantSecret, balanceId } = req.body;
    
    if (!claimantSecret || !balanceId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: claimantSecret, balanceId',
      });
    }
    
    // Create claimant keypair from secret
    const claimantKeypair = Keypair.fromSecret(claimantSecret);
    const claimantPublicKey = claimantKeypair.publicKey();
    
    // Fetch the claimable balance to verify the claimer
    const claimableBalance = await server
      .claimableBalances()
      .claimableBalance(balanceId)
      .call();
    
    // Check if the claimant is allowed to claim this balance
    const canClaim = claimableBalance.claimants.some(
      (claimant: any) => claimant.destination === claimantPublicKey
    );
    
    if (!canClaim) {
      return res.status(403).json({
        success: false,
        error: 'This account is not authorized to claim this balance',
      });
    }
    
    // Load the claimant account
    const claimantAccount = await server.loadAccount(claimantPublicKey);
    
    // Build the transaction
    const transaction = new TransactionBuilder(claimantAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.claimClaimableBalance({
          balanceId,
        })
      )
      .setTimeout(30)
      .build();
    
    // Sign the transaction
    transaction.sign(claimantKeypair);
    
    // Submit the transaction
    const txResult = await server.submitTransaction(transaction);
    
    return res.status(200).json({
      success: true,
      data: {
        hash: txResult.hash,
        ledger: txResult.ledger,
        balanceId,
        claimant: claimantPublicKey,
        amount: claimableBalance.amount,
        asset: claimableBalance.asset,
      },
    });
  } catch (error: any) {
    console.error('Claim balance error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to claim balance',
    });
  }
};

/**
 * Process fiat off-ramp (withdrawal)
 * This is a mock implementation for the hackathon
 */
export const processOffRamp = async (req: Request, res: Response) => {
  try {
    const { sourceSecret, amount, method, details } = req.body;
    
    if (!sourceSecret || !amount || !method || !details) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }
    
    // Create random reference code for tracking
    const refCode = `WD${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Calculate fee based on method
    let feePercentage = 0.01; // Default 1%
    
    switch (method) {
      case 'bank':
        feePercentage = 0.015; // 1.5%
        break;
      case 'card':
        feePercentage = 0.025; // 2.5%
        break;
      case 'mobile':
        feePercentage = 0.01; // 1%
        break;
      case 'pickup':
        feePercentage = 0.03; // 3%
        break;
    }
    
    const fee = parseFloat(amount) * feePercentage;
    const netAmount = parseFloat(amount) - fee;
    
    // In a real implementation, you would:
    // 1. Validate the source account has sufficient funds
    // 2. Take payment by transferring XLM to an anchor account
    // 3. Initiate the off-ramp through an anchor service
    
    // For demo purposes, we'll simulate success with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return res.status(200).json({
      success: true,
      data: {
        referenceCode: refCode,
        method,
        grossAmount: amount,
        fee: fee.toFixed(2),
        netAmount: netAmount.toFixed(2),
        destination: formatDestination(method, details),
        status: 'processing',
        estimatedArrival: getEstimatedArrival(method),
      },
    });
  } catch (error: any) {
    console.error('Off-ramp error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process withdrawal',
    });
  }
};

/**
 * Get transaction history for an account
 */
export const getTransactionHistory = async (req: Request, res: Response) => {
  try {
    const { publicKey } = req.params;
    const { limit = 10, cursor } = req.query;
    
    // Get payments for the account
    const paymentsCall = server
      .payments()
      .forAccount(publicKey)
      .limit(Number(limit));
    
    // Add cursor if provided
    if (cursor) {
      paymentsCall.cursor(cursor as string);
    }
    
    const payments = await paymentsCall.call();
    
    // Format the results
    const history = await Promise.all(
      payments.records.map(async (payment: any) => {
        let type = 'unknown';
        let otherAccount = '';
        let amount = '';
        let assetCode = 'XLM';
        let direction = '';
        
        // Determine transaction type and direction
        if (payment.type === 'payment') {
          if (payment.from === publicKey) {
            type = 'sent';
            direction = 'out';
            otherAccount = payment.to;
          } else {
            type = 'received';
            direction = 'in';
            otherAccount = payment.from;
          }
          amount = payment.amount;
          assetCode = payment.asset_code || 'XLM';
        } else if (payment.type === 'create_claimable_balance') {
          type = 'claimable_balance_created';
          direction = 'out';
          // For claimable balances, we need to get more details
          try {
            const txDetails = await server
              .transactions()
              .transaction(payment.transaction_hash)
              .call();
            
            // Extract memo if available
            const memo = txDetails.memo ? txDetails.memo : '';
            
            return {
              id: payment.id,
              type,
              direction,
              amount: payment.amount,
              asset: payment.asset_code || 'XLM',
              claimants: payment.claimants,
              createdAt: payment.created_at,
              transactionHash: payment.transaction_hash,
              memo,
            };
          } catch (error) {
            console.error('Error fetching tx details:', error);
          }
        } else if (payment.type === 'claim_claimable_balance') {
          type = 'claimable_balance_claimed';
          direction = 'in';
        }
        
        return {
          id: payment.id,
          type,
          direction,
          amount,
          asset: assetCode,
          otherAccount,
          createdAt: payment.created_at,
          transactionHash: payment.transaction_hash,
        };
      })
    );
    
    return res.status(200).json({
      success: true,
      data: {
        history,
        nextCursor: payments.records.length > 0 ? payments.records[payments.records.length - 1].paging_token : null,
      },
    });
  } catch (error: any) {
    console.error('Transaction history error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get transaction history',
    });
  }
};

// Helper functions

/**
 * Format destination for display based on withdrawal method
 */
function formatDestination(method: string, details: any): string {
  switch (method) {
    case 'bank':
      return `Bank account ending in ${details.accountNumber?.slice(-4) || 'XXXX'}`;
    case 'card':
      return `Card ending in ${details.cardNumber?.slice(-4) || 'XXXX'}`;
    case 'mobile':
      return `${details.provider || 'Mobile Money'} (${details.phoneNumber || 'Unknown'})`;
    case 'pickup':
      return `Cash pickup in ${details.country || 'Unknown'}`;
    default:
      return 'Unknown destination';
  }
}

/**
 * Get estimated arrival time based on withdrawal method
 */
function getEstimatedArrival(method: string): string {
  const now = new Date();
  
  switch (method) {
    case 'bank':
      // 1-2 business days
      const bankDate = new Date(now);
      bankDate.setDate(bankDate.getDate() + 2);
      return bankDate.toISOString();
    case 'card':
      // 10-30 minutes
      const cardDate = new Date(now);
      cardDate.setMinutes(cardDate.getMinutes() + 30);
      return cardDate.toISOString();
    case 'mobile':
      // 5-15 minutes
      const mobileDate = new Date(now);
      mobileDate.setMinutes(mobileDate.getMinutes() + 15);
      return mobileDate.toISOString();
    case 'pickup':
      // Same day
      const pickupDate = new Date(now);
      pickupDate.setHours(pickupDate.getHours() + 3);
      return pickupDate.toISOString();
    default:
      return new Date().toISOString();
  }
}