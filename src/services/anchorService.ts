/**
 * Get available off-ramp options for an asset in a specific country
 */
export const getOffRampOptions = async (asset: string, country: string) => {
  // Mock implementation - replace with real anchor API calls
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
  
  // Filter options based on country
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

/**
 * Initiate an off-ramp transaction
 */
export const initiateOffRamp = async (
  asset: string, 
  amount: string, 
  method: string, 
  accountDetails: any
) => {
  // Mock implementation - replace with real anchor API calls
  return {
    success: true,
    transaction_id: `offramp_${Date.now()}`,
    status: 'pending',
    estimated_completion: new Date(Date.now() + 86400000).toISOString(),
    details: {
      asset,
      amount,
      method,
      fee: method === 'mobile_money' ? '0.50' : '1.00'
    }
  };
};
