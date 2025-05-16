import { Keypair, Server, Networks, Operation, TransactionBuilder, Asset } from 'stellar-sdk';

// Initialize Stellar server
const horizonUrl = process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';
const server = new Server(horizonUrl);
const networkPassphrase = process.env.NETWORK_PASSPHRASE || Networks.TESTNET;

/**
 * Create a new Stellar account
 */
export const createAccount = async () => {
  // Generate a new keypair
  const keypair = Keypair.random();
  const publicKey = keypair.publicKey();
  const secret = keypair.secret();
  
  try {
    // Fund the account using friendbot (testnet only)
    await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
    
    // In a real app, you would encrypt the secret with the user's PIN
    // For now, we'll just return it (encrypt in a real implementation)
    const encryptedSecret = secret; // Replace with actual encryption
    
    return { publicKey, encryptedSecret };
  } catch (error) {
    console.error('Error funding account:', error);
    throw new Error('Failed to create and fund account');
  }
};

/**
 * Get balance for a Stellar account
 */
export const getAccountBalance = async (publicKey: string) => {
  try {
    const account = await server.loadAccount(publicKey);
    
    // Find XLM balance
    const xlmBalance = account.balances.find(
      (balance: any) => balance.asset_type === 'native'
    );
    
    return xlmBalance?.balance || '0';
  } catch (error) {
    console.error('Error fetching account balance:', error);
    throw new Error('Failed to fetch account balance');
  }
};

/**
 * Build and submit a payment transaction
 */
export const buildPaymentTx = async (
  sourceKeypair: string,
  destination: string,
  amount: string,
  assetCode?: string
) => {
  try {
    // Convert secret key to keypair
    const keypair = Keypair.fromSecret(sourceKeypair);
    
    // Load account
    const account = await server.loadAccount(keypair.publicKey());
    
    // Define asset (XLM by default)
    const asset = assetCode 
      ? new Asset(assetCode, keypair.publicKey()) 
      : Asset.native();
    
    // Generate a unique link ID
    const linkId = generateLinkId();
    
    // Build transaction with claimable balance
    const transaction = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase
    })
      .addOperation(
        Operation.createClaimableBalance({
          asset,
          amount,
          claimants: [
            {
              destination,
              predicate: { unconditional: true }
            },
            {
              // Add the sender as a claimant for potential refund
              destination: keypair.publicKey(),
              predicate: {
                // Can claim back after 1 day (for demo purposes)
                relBefore: '86400'
              }
            }
          ]
        })
      )
      .setTimeout(30)
      .build();
    
    // Sign transaction
    transaction.sign(keypair);
    
    // Submit transaction
    const txResult = await server.submitTransaction(transaction);
    
    return {
      linkId,
      tx: txResult
    };
  } catch (error) {
    console.error('Error building/submitting transaction:', error);
    throw new Error('Failed to build or submit transaction');
  }
};

/**
 * Claim a claimable balance
 */
export const claimBalance = async (linkId: string) => {
  // In a real implementation, you would fetch the balance ID
  // from your database using the linkId
  const balanceId = 'mock-balance-id';
  
  try {
    // Temporary mock response
    return {
      success: true,
      balanceId
    };
    
    // Real implementation would:
    // 1. Look up the claimable balance ID using linkId
    // 2. Create claim operation
    // 3. Submit and return transaction
  } catch (error) {
    console.error('Error claiming balance:', error);
    throw new Error('Failed to claim balance');
  }
};

/**
 * Generate a unique link ID
 */
function generateLinkId(): string {
  return `link_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}
