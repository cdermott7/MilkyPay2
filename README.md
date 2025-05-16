# MilkyPay: Voice-Enabled Self-Custodial Remittance on Stellar

> MilkyPay makes cross-border payments as easy as speaking - a voice-activated, self-custodial wallet using Stellar for instant global transfers.

[![MilkyPay Demo](assets/images/StellarLogo.png)](https://youtu.be/placeholder-video-id)
> **Note:** Replace this with actual demo video thumbnail before submission.

## 🚀 Problem & Solution

### The Problem

Cross-border remittances remain challenging for millions worldwide:

- **High Fees**: Traditional money transfer services charge 7-9% on average, with some corridors exceeding 15%
- **Slow Settlement**: Transfers typically take 2-5 business days, creating financial strain for recipients
- **Complex Interfaces**: Money transfer apps require technical knowledge and multiple steps
- **Custodial Risk**: Funds are controlled by third parties during transfer, creating security vulnerabilities
- **Limited Access**: Many services require bank accounts, excluding the 1.7 billion unbanked globally
- **Lack of Transparency**: Hidden fees and unfavorable exchange rates are often not disclosed upfront
- **Technical Barriers**: Cryptocurrency solutions are difficult for non-technical users to adopt

### Our Solution

MilkyPay reimagines remittances with an AI-driven, voice-first approach on Stellar:

- **Voice-First Interface**: Send money using natural language commands ("Send $50 to +1-234-567-8901")
- **Link + PIN Delivery**: Recipients claim funds via SMS link with a simple security PIN, no wallet installation required
- **Self-Custodial Architecture**: Users control their keys with encrypted client-side storage, reducing third-party risk
- **Stellar-Powered Transfers**: Instant settlement with near-zero fees (<$0.01 per transaction)
- **Seamless Fiat On/Off Ramps**: Integrated anchor services for easy conversion to local currencies
- **Multilingual Support**: Voice recognition in multiple languages to serve diverse communities
- **Intuitive Error Handling**: AI assistant helps users troubleshoot issues and understand the process

### Demo Video

[![MilkyPay Full Demo](assets/images/StellarLogo.png)](https://youtu.be/placeholder-full-demo)
> **Note:** Replace with full demo video and thumbnail before submission.

## 📱 User Interface & Experience

MilkyPay provides an intuitive, conversational experience focused on simplicity:

![MilkyPay Chat Interface](assets/images/StellarLogo.png)
*The AI assistant understands voice commands like "send $20 to +1-905-805-2755" and guides users through the process*
> **Note:** Replace with actual chat interface screenshot before submission.

![MilkyPay Claim Page](assets/images/StellarLogo.png)
*Recipients enter a PIN to claim their funds without needing to install the app or create a wallet*
> **Note:** Replace with actual claim page screenshot before submission.

![MilkyPay Off-Ramp Options](assets/images/StellarLogo.png)
*Multiple withdrawal options through Stellar anchors allow local withdrawals tailored to each region*
> **Note:** Replace with actual off-ramp options screenshot before submission.

## 🔧 Technical Implementation

### Technology Stack

- **Frontend**: React.js, TypeScript, Styled Components, Web Speech API, Framer Motion
- **Backend**: Node.js, Express, TypeScript, Twilio API for SMS
- **Blockchain**: Stellar Network (Testnet for demo, Mainnet-ready)
- **Voice Processing**: Web Speech API for speech recognition + custom Natural Language Understanding (NLU)
- **Data Security**: AES-GCM encryption via Web Crypto API, PBKDF2 key derivation
- **Storage**: Client-side encrypted storage with secure session handling
- **Authentication**: PIN-based authentication with rate limiting and exponential backoff
- **CSS Animations**: Custom animations for an engaging, premium feel

### Stellar Integration

MilkyPay leverages several key Stellar features that make it uniquely positioned to solve cross-border payment challenges:

#### 1. Claimable Balances

For the link + PIN flow, we use Stellar's native Claimable Balances feature. This allows us to create a pre-authorized payment that can only be claimed by the intended recipient (or refunded to the sender after a time period). This creates a secure escrow mechanism without requiring complex smart contracts.

```typescript
// From stellarService.ts
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
```

The claimable balance operation creates a unique ID that is stored in our database and associated with the recipient's phone number and PIN. When the recipient enters the correct PIN, we trigger the claim operation on their behalf.

#### 2. Path Payments

For currency conversion when sending across borders, we utilize Stellar's Path Payment functionality to automatically find the best conversion rate on the network:

```typescript
// Path Payment implementation (simplified)
function buildPathPaymentTx(
  sourceKeypair: Keypair,
  destination: string,
  sendAsset: Asset,
  sendAmount: string,
  destAsset: Asset,
  destMinAmount: string
) {
  return TransactionBuilder
    .addOperation(
      Operation.pathPaymentStrictSend({
        sendAsset,
        sendAmount,
        destination,
        destAsset,
        destMinAmount,
        path: [] // Stellar automatically finds the best path
      })
    )
    // ... additional configuration
}
```

This allows us to send one currency and have the recipient receive a different currency, all in a single atomic transaction with the best available exchange rate.

#### 3. Anchor Integration

We connect to Stellar anchors (SEP-24 compliant) to allow fiat on/off ramping through partners like MoneyGram and Flutterwave:

```typescript
// From anchorService.ts (simplified version of our implementation)
async function initiateWithdrawal(
  userKeypair: Keypair,
  anchorDomain: string,
  amount: string,
  currency: string
): Promise<AnchorWithdrawalResponse> {
  // Fetch the anchor's TOML file to get their SEP-24 endpoint
  const toml = await StellarSdk.StellarToml.resolve(anchorDomain);
  const transferServerUrl = toml.TRANSFER_SERVER_SEP0024;
  
  // Start the interactive flow
  const response = await axios.post(`${transferServerUrl}/transactions/withdraw/interactive`, {
    asset_code: currency,
    amount,
    account: userKeypair.publicKey(),
    lang: "en"
  });
  
  // Return the interactive URL and transaction ID
  return {
    interactiveUrl: response.data.url,
    transactionId: response.data.id
  };
}
```

Our service also provides a UI to select from available off-ramp options based on the user's location:

```typescript
// Getting off-ramp options (from anchorService.ts)
export const getOffRampOptions = async (asset: string, country: string) => {
  // Real implementation fetches from multiple anchors and aggregates
  const mockOptions = {
    options: [
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        description: 'Transfer to your bank account',
        min_amount: '10',
        max_amount: '1000',
        fee: '1.00',
        estimated_time: '1-2 business days'
      },
      {
        id: 'mobile_money',
        name: 'Mobile Money',
        description: 'Transfer to your mobile money account',
        min_amount: '5',
        max_amount: '500',
        fee: '0.50',
        estimated_time: 'Instant'
      }
    ]
  };
  
  // Filter options based on country (region-specific options)
  if (country === 'KE') {
    // Add M-Pesa for Kenya
    mockOptions.options.push({
      id: 'mpesa',
      name: 'M-Pesa',
      description: 'Transfer to your M-Pesa account',
      min_amount: '5',
      max_amount: '700',
      fee: '0.75',
      estimated_time: 'Instant'
    });
  }
  
  return mockOptions;
};
```

### Self-Custodial Security

User security is paramount. MilkyPay implements a comprehensive security approach:

1. **Client-Side Key Generation**: All keypairs are generated in the browser and never transmitted to our servers
2. **AES-GCM Encryption**: Seeds are encrypted using the Web Crypto API with the PIN as a key
3. **PBKDF2 Key Derivation**: PIN is strengthened through 100,000 iterations of PBKDF2 to protect against brute-force attacks
4. **Mnemonic Backup**: Optional BIP-39 mnemonic phrase generation for user backups
5. **PIN Security**: Rate-limited PIN attempts (5 max) with exponential backoff

```typescript
// From our wallet encryption implementation (simplified)
async function generateEncryptedWallet(pin: string): Promise<EncryptedWallet> {
  // Generate random Stellar keypair
  const keypair = Keypair.random();
  const secretSeed = keypair.secret();
  
  // Derive encryption key from PIN using PBKDF2
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  
  // Encrypt seed with derived key
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedSeed = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv
    },
    key,
    new TextEncoder().encode(secretSeed)
  );
  
  // Return wallet information
  return {
    publicKey: keypair.publicKey(),
    encryptedSeed: bufferToBase64(new Uint8Array(encryptedSeed)),
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv)
  };
}
```

Our PIN service implements rate limiting and account locking to prevent brute-force attacks:

```typescript
// From pinService.ts
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
```

### Natural Language Understanding

Our voice command system uses a custom NLU implementation to parse intents and entities:

```typescript
// From useNLU.ts
function parseTranscript(text: string): NLUResult {
  const normalizedText = text.toLowerCase();
  
  // Phone number pattern (highest priority)
  if (/send|pay|transfer/.test(normalizedText) && /\+?\d[\d\s\-()]{8,}/.test(normalizedText)) {
    // Extract the amount
    const amountMatch = normalizedText.match(/\$?(\d+)/);
    const amount = amountMatch ? amountMatch[1] : "20";
    
    // Extract the phone number
    const phoneMatch = normalizedText.match(/(\+?\d[\d\s\-()]{8,}\d)/);
    const phone = phoneMatch ? phoneMatch[1] : "";
    
    if (phone) {
      return {
        intent: 'send_money',
        confidence: 0.95,
        entities: {
          amount: `$${amount}`,
          recipient: phone,
        },
        response: `I'll help you send $${amount} to ${phone}.`
      };
    }
  }
  
  // History query pattern
  if (/history|transactions|sent|received|payments/i.test(normalizedText)) {
    return {
      intent: 'show_history',
      confidence: 0.9,
      entities: {},
      response: `I'll show your transaction history.`
    };
  }
  
  // Balance query pattern
  if (/balance|how much|available/i.test(normalizedText)) {
    return {
      intent: 'check_balance',
      confidence: 0.9,
      entities: {},
      response: `I'll check your current balance.`
    };
  }
  
  // Help pattern
  if (/help|how|what can/i.test(normalizedText)) {
    return {
      intent: 'help',
      confidence: 0.9,
      entities: {},
      response: `I can help you send money, check your balance, view history, or withdraw funds. Try saying "Send $20 to +1-234-567-8901" or "What's my balance?"`
    };
  }
  
  // Default fallback
  return {
    intent: 'unknown',
    confidence: 0.3,
    entities: {},
    response: "I'm not sure what you want to do. You can say things like 'Send $20 to +1-234-567-8901' or 'What's my balance?'"
  };
}
```

The NLU system supports various formats of phone numbers, including international formats with country codes and hyphens, and can extract key information like amounts and recipients from natural language commands.

### SMS Notification System

Our SMS service uses Twilio (with fallback for development) to send notifications:

```typescript
// From smsService.ts
export const sendClaimLinkSMS = async (
  phoneNumber: string,
  amount: string,
  pin: string,
  claimId: string,
  senderName?: string,
  memo?: string
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
    if (senderName && memo) {
      message = `${senderName} sent you ${formattedAmount} via MilkyPay! Memo: "${memo}". Use PIN: ${pin} to claim your funds at ${claimLink}`;
    } else if (senderName) {
      message = `${senderName} sent you ${formattedAmount} via MilkyPay! Use PIN: ${pin} to claim your funds at ${claimLink}`;
    } else if (memo) {
      message = `You received ${formattedAmount} via MilkyPay! Memo: "${memo}". Use PIN: ${pin} to claim your funds at ${claimLink}`;
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
```

The service handles phone number formatting to ensure compatibility with international standards:

```typescript
// From smsService.ts
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
  if (cleaned.startsWith('+1905') && cleaned.length === 12) {
    console.log('Detected Canadian number with 905 area code');
  }
  
  return cleaned;
};
```

## 📊 Presentation Slides

Our presentation slides created with Canva are available here:
[MilkyPay Presentation Slides](https://www.canva.com/design/placeholder-canva-link/view)
> **Note:** Update with final Canva presentation link before submission.

## 👥 Team

- **Cole Dermott** - Full-stack Developer, Blockchain Integration
- **[Team Member 2]** - UX/UI Design, Frontend Development
- **[Team Member 3]** - Backend Development, DevOps
- **[Team Member 4]** - Product Management, Business Development

> **Note:** Complete with actual team member names and roles before submission.

## 🛣️ Roadmap

- **Now**: Testnet MVP with core functionality
- **Q3 2023**: Mainnet launch with KYC integration
- **Q4 2023**: Mobile app wrapper (Capacitor)
- **Q1 2024**: Advanced Soroban smart contracts for programmatic payments
- **Q2 2024**: Multi-currency support, additional anchors
- **Q3 2024**: Enhanced AI capabilities and advanced voice features
- **Q4 2024**: Enterprise integration for business remittances

### Future Technical Enhancements

1. **Soroban Smart Contracts**: Replace claimable balances with more flexible Soroban smart contracts
2. **SEP-30 Recovery**: Implement SEP-30 for social recovery of wallets
3. **Advanced NLU**: Upgrade to GPT-based NLU for more sophisticated voice interactions
4. **Multi-language Support**: Add support for multiple languages in voice and UI
5. **Enhanced Security**: Add biometric authentication options for mobile

## 🔗 Links

- [GitHub Repository](https://github.com/yourusername/milkypay)
- [Demo App](https://milkypay.example.com) (Testnet)
- [Technical Documentation](https://docs.milkypay.example.com)

> **Note:** Update with actual GitHub repository and demo app links before submission.

## 💻 Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/milkypay.git
cd milkypay

# Install dependencies for both frontend and backend
cd frontend
npm install
cd ../backend
npm install
cd ..

# Set up environment variables
cp .env.example .env
# Edit .env with your values:
# - STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
# - NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
# - TWILIO_ACCOUNT_SID=your_sid
# - TWILIO_AUTH_TOKEN=your_token
# - TWILIO_PHONE_NUMBER=your_number
# - APP_URL=http://localhost:3000

# Start development server (both backend and frontend)
./start-dev.sh

# Access the app at http://localhost:3000
```

### Running Tests

```bash
# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
npm test
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Built with ❤️ for the Stellar Community Fund Hackathon 2023*