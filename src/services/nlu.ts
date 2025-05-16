/**
 * Simple Natural Language Understanding service
 * Uses regex patterns to extract intents and entities from user utterances
 * In a real app, this would be replaced with a more sophisticated NLU service
 */

export interface NluResult {
  intent: string;
  entities: Record<string, any>;
  confidence: number;
}

// Define intent patterns
const intentPatterns = [
  {
    intent: 'send_money',
    pattern: /(?:send|transfer|pay)\s+(?:[$€£]?\s?([0-9]+(?:\.[0-9]{1,2})?)\s+(?:XLM|lumens|dollars|USD|EUR)?)\s+(?:to\s+)?([+]?[0-9]+|\w+@\w+\.\w+)/i,
    entityNames: ['amount', 'recipient']
  },
  {
    intent: 'check_balance',
    pattern: /(?:what\s+is\s+|check\s+|show\s+|see\s+)?(?:my\s+)?(?:wallet\s+)?(?:balance|funds|money|available)/i,
    entityNames: []
  },
  {
    intent: 'claim_money',
    pattern: /(?:claim|get|receive)\s+(?:my\s+)?(?:money|payment|funds|transfer)/i,
    entityNames: []
  },
  {
    intent: 'cash_out',
    pattern: /(?:cash\s+out|withdraw|take\s+out|off\s*ramp|off-ramp)\s+(?:[$€£]?\s?([0-9]+(?:\.[0-9]{1,2})?)\s+(?:XLM|lumens|dollars|USD|EUR)?)?/i,
    entityNames: ['amount']
  },
  {
    intent: 'transaction_history',
    pattern: /(?:show|see|view|get)\s+(?:my\s+)?(?:transaction|payment|transfer)\s+(?:history|list|log|record)/i,
    entityNames: []
  },
  {
    intent: 'help',
    pattern: /(?:help|assist|support|what\s+can\s+you\s+do|how\s+does\s+this\s+work)/i,
    entityNames: []
  },
];

/**
 * Parse user utterance to identify intent and extract entities
 */
export const parseUtterance = (utterance: string): NluResult => {
  // Default to 'unknown' intent
  let result: NluResult = {
    intent: 'unknown',
    entities: {},
    confidence: 0.0
  };
  
  for (const { intent, pattern, entityNames } of intentPatterns) {
    const match = utterance.match(pattern);
    
    if (match) {
      const entities: Record<string, any> = {};
      
      // Extract entities if there are any
      if (match.length > 1 && entityNames.length > 0) {
        entityNames.forEach((name, index) => {
          // match[0] is the full match, entities start at match[1]
          if (match[index + 1]) {
            entities[name] = match[index + 1];
          }
        });
      }
      
      // Calculate a simple confidence score
      // In a real app, this would be based on machine learning model confidence
      const confidence = 0.7 + (match[0].length / utterance.length) * 0.3;
      
      result = {
        intent,
        entities,
        confidence: parseFloat(confidence.toFixed(2))
      };
      
      break; // Stop after the first match
    }
  }
  
  return result;
};

/**
 * Generate a response based on the NLU result
 */
export const generateResponse = (nluResult: NluResult): string => {
  const { intent, entities } = nluResult;
  
  switch (intent) {
    case 'send_money':
      return `I'll help you send ${entities.amount || 'money'} to ${entities.recipient}. Let me set that up for you.`;
      
    case 'check_balance':
      return 'Let me check your balance for you.';
      
    case 'claim_money':
      return 'I can help you claim a payment. Do you have the payment link and PIN?';
      
    case 'cash_out':
      return `I'll help you cash out ${entities.amount ? entities.amount + ' XLM' : 'your funds'}. Let me show you the available options.`;
      
    case 'transaction_history':
      return 'Here\'s your recent transaction history.';
      
    case 'help':
      return 'I can help you send money, check your balance, claim payments, cash out funds, or view your transaction history. What would you like to do?';
      
    default:
      return "I'm sorry, I didn't understand that. You can ask me to send money, check your balance, claim a payment, cash out, or view your transaction history.";
  }
};
