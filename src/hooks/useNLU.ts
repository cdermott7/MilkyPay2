import { useState, useCallback } from 'react';

// Types for NLU processing
interface NLUEntity {
  value: string;
  confidence: number;
}

interface NLUResult {
  intent: string;
  confidence: number;
  entities: Record<string, string>;
  response: string;
}

/**
 * Hook for Natural Language Understanding functionality
 * This is a simplified implementation that uses regex patterns for the hackathon
 * In a production app, you would connect to a proper NLU service or LLM
 */
export const useNLU = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  /**
   * Process a command using our basic NLU
   */
  const processCommand = useCallback(async (text: string): Promise<NLUResult> => {
    setIsProcessing(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Log the input for debugging
      console.log('Processing NLU command:', text);
      
      // Normalize input - lowercase and remove extra spaces
      const normalizedText = text.toLowerCase().trim().replace(/\s+/g, ' ');
      console.log('Normalized text:', normalizedText);
      
      // Default result with fallback intent
      let result: NLUResult = {
        intent: 'unknown',
        confidence: 0.5,
        entities: {},
        response: "I'm not sure I understand that command. Try saying 'Send $20 to John' or 'What's my balance?'"
      };
      
      // Process send money intent - with multiple patterns
      
      // Pattern 1: "Send $50 to John" or "Transfer 25 dollars to +1234567890"
      const sendMoneyRegex1 = /(?:send|transfer|pay)\s+(?:[$]?(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:dollars|usd))\s+(?:to|for)\s+([+]?[\w\s]+)/i;
      
      // Pattern 2: Broader match - "Send money to John $50" or "Pay John 20 dollars"
      const sendMoneyRegex2 = /(?:send|transfer|pay)(?:\s+money)?\s+(?:to|for)?\s+([+]?[\w\s]+)(?:\s+[$]?(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:dollars|usd)?)/i;
      
      // Try first pattern
      const sendMatches1 = normalizedText.match(sendMoneyRegex1);
      console.log('Send matches pattern 1:', sendMatches1);
      
      // Try second pattern if first fails
      const sendMatches2 = normalizedText.match(sendMoneyRegex2);
      console.log('Send matches pattern 2:', sendMatches2);
      
      // First try precise pattern
      if (sendMatches1) {
        const amount = sendMatches1[1] || sendMatches1[2];
        const recipient = sendMatches1[3].trim();
        
        console.log('Matched send pattern 1. Amount:', amount, 'Recipient:', recipient);
        
        result = {
          intent: 'send_money',
          confidence: 0.95,
          entities: {
            amount: `$${amount}`,
            recipient,
          },
          response: `I'll help you send $${amount} to ${recipient}.`
        };
      }
      // Then try broader pattern
      else if (sendMatches2) {
        const recipient = sendMatches2[1].trim();
        const amount = sendMatches2[2] || sendMatches2[3] || '20'; // Default to $20 if amount not clear
        
        console.log('Matched send pattern 2. Amount:', amount, 'Recipient:', recipient);
        
        result = {
          intent: 'send_money',
          confidence: 0.85,
          entities: {
            amount: `$${amount}`,
            recipient,
          },
          response: `I'll help you send $${amount} to ${recipient}.`
        };
      }
      // Special case: if it clearly mentions send/pay/transfer but didn't match patterns
      else if (/\b(?:send|transfer|pay)\b/i.test(normalizedText)) {
        console.log('Detected send intent but could not parse details');
        
        // Extract possible recipient (any word after "to")
        const recipientMatch = normalizedText.match(/\bto\s+([+]?[\w\s]+)/i);
        const recipient = recipientMatch ? recipientMatch[1].trim() : "someone";
        
        // Extract possible amount (any number with optional $ prefix)
        const amountMatch = normalizedText.match(/[$]?(\d+(?:\.\d+)?)/);
        const amount = amountMatch ? amountMatch[1] : "20";
        
        result = {
          intent: 'send_money',
          confidence: 0.7,
          entities: {
            amount: `$${amount}`,
            recipient,
          },
          response: `I'll help you send $${amount} to ${recipient}. Is that correct?`
        };
      }
      
      // Process check balance intent - multiple patterns
      // Pattern 1: "What's my balance" or "Show my balance" or "How much money do I have"
      const balanceRegex1 = /(?:what(?:'s|s| is)|show|check|display|view|how much).+(?:balance|money|funds|have|account)/i;
      // Pattern 2: Simpler "Balance" or "Show balance" or just "Check balance"
      const balanceRegex2 = /\b(?:balance|my balance|check balance|show balance)\b/i;
      
      const balanceMatches1 = normalizedText.match(balanceRegex1);
      const balanceMatches2 = normalizedText.match(balanceRegex2);
      
      if (balanceMatches1 || balanceMatches2) {
        console.log('Detected balance check intent');
        result = {
          intent: 'check_balance',
          confidence: 0.9,
          entities: {},
          response: `Your current balance is available in your wallet. Is there anything else I can help you with?`
        };
      }
      
      // Process transaction history intent
      // Example: "Show my transactions" or "What did I send yesterday"
      const historyRegex = /(?:show|view|display|what|list|get).+(?:transactions|history|sent|received|payments)(?:\s+(?:from|in|on|during|last)\s+(.+))?/i;
      const historyMatches = normalizedText.match(historyRegex);
      
      if (historyMatches) {
        const timeframe = historyMatches[1] || 'recent';
        
        result = {
          intent: 'query_history',
          confidence: 0.8,
          entities: {
            timeframe,
          },
          response: `Here are your ${timeframe} transactions.`
        };
      }
      
      // Process help intent
      // Example: "Help" or "What can you do"
      const helpRegex = /(?:help|assist|support|what can you do|how does this work|commands|features)/i;
      const helpMatches = normalizedText.match(helpRegex);
      
      if (helpMatches) {
        result = {
          intent: 'help',
          confidence: 0.9,
          entities: {},
          response: `I can help you send money, check your balance, view transaction history, and more. Try saying "Send $20 to John" or "What's my balance?"`
        };
      }
      
      // Process withdraw/cash out intent
      // Example: "Withdraw $50" or "Cash out to my bank account"
      const withdrawRegex = /(?:withdraw|cash out|off(-|\s+)?ramp|off board|get|transfer to).+(?:(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:dollars|usd))?(?:\s+(?:to|into|via)\s+(.+))?/i;
      const withdrawMatches = normalizedText.match(withdrawRegex);
      
      if (withdrawMatches) {
        const amount = withdrawMatches[1] || withdrawMatches[2] || 'all';
        const method = withdrawMatches[3] || 'bank account';
        
        result = {
          intent: 'withdraw_funds',
          confidence: 0.85,
          entities: {
            amount: amount === 'all' ? amount : `$${amount}`,
            method,
          },
          response: `I'll help you withdraw ${amount === 'all' ? 'all your funds' : `$${amount}`} to your ${method}.`
        };
      }
      
      // Process claim funds intent
      // Example: "Claim funds" or "Redeem payment with code 123456"
      const claimRegex = /(?:claim|redeem|get|collect).+(?:funds|money|payment|transfer)(?:\s+(?:with|using|code|pin)\s+(.+))?/i;
      const claimMatches = normalizedText.match(claimRegex);
      
      if (claimMatches) {
        const code = claimMatches[1] || '';
        
        result = {
          intent: 'claim_funds',
          confidence: 0.85,
          entities: {
            code,
          },
          response: code 
            ? `I'll help you claim funds using code ${code}.`
            : `I can help you claim funds. Do you have a claim code?`
        };
      }
      
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, []);
  
  return {
    processCommand,
    isProcessing,
  };
};

export default useNLU;