import { useState, useCallback } from 'react';

// Result interface
interface NLUResult {
  intent: string;
  confidence: number;
  entities: Record<string, string>;
  response: string;
}

/**
 * Hook for Natural Language Understanding
 * This is a simplified version for the hackathon
 */
export const useNLU = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  /**
   * Process a command using basic NLU
   */
  const processCommand = useCallback(async (text: string): Promise<NLUResult> => {
    setIsProcessing(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Normalize input
      const normalizedText = text.toLowerCase().trim().replace(/\s+/g, ' ');
      console.log('Processing:', normalizedText);
      
      // Default result with fallback intent
      let result: NLUResult = {
        intent: 'unknown',
        confidence: 0.5,
        entities: {},
        response: "I'm not sure what you mean. Try saying 'Send $20 to +1-905-805-2755' or 'What's my balance?'"
      };
      
      // Phone number pattern (highest priority)
      // This will match formats like +1-905-805-2755
      if (/send|pay|transfer/.test(normalizedText) && /\+?\d[\d\s\-()]{8,}/.test(normalizedText)) {
        // Extract the amount
        const amountMatch = normalizedText.match(/\$?(\d+)/);
        const amount = amountMatch ? amountMatch[1] : "20";
        
        // Extract the phone number - get the whole match
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
      
      // Balance check
      if (/balance|how much|money|have|account/.test(normalizedText)) {
        return {
          intent: 'check_balance',
          confidence: 0.9,
          entities: {},
          response: `Your current balance is available in your wallet.`
        };
      }
      
      // Help intent
      if (/help|assist|what can you do/.test(normalizedText)) {
        return {
          intent: 'help',
          confidence: 0.9,
          entities: {},
          response: `I can help you send money, check your balance, and more. Try typing "Send $20 to +1-905-805-2755" or "What's my balance?"`
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