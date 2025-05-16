/**
 * Recurring Payments Service
 * 
 * This service handles the creation, management, and execution of recurring payments
 * in the MilkyPay application. It uses local storage for now but could be extended
 * to use a backend database in a production environment.
 */

export interface RecurringPayment {
  id: string;
  recipientType: 'phone' | 'address';
  recipient: string;
  amount: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  nextPaymentDate: string;
  name: string;
  memo?: string;
  active: boolean;
  createdAt: string;
  lastExecuted?: string;
}

// Local storage key
const RECURRING_PAYMENTS_KEY = 'milkypay_recurring_payments';

/**
 * Get all recurring payments
 */
export const getAllRecurringPayments = (): RecurringPayment[] => {
  const paymentsData = localStorage.getItem(RECURRING_PAYMENTS_KEY);
  if (!paymentsData) {
    return [];
  }
  
  return JSON.parse(paymentsData);
};

/**
 * Get a recurring payment by ID
 */
export const getRecurringPaymentById = (id: string): RecurringPayment | null => {
  const payments = getAllRecurringPayments();
  return payments.find(payment => payment.id === id) || null;
};

/**
 * Create a new recurring payment
 */
export const createRecurringPayment = (
  payment: Omit<RecurringPayment, 'id' | 'createdAt' | 'active'>
): RecurringPayment => {
  const payments = getAllRecurringPayments();
  
  // Create a new payment object
  const newPayment: RecurringPayment = {
    ...payment,
    id: `rp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
    active: true
  };
  
  // Add to the list and save
  payments.push(newPayment);
  localStorage.setItem(RECURRING_PAYMENTS_KEY, JSON.stringify(payments));
  
  return newPayment;
};

/**
 * Update a recurring payment
 */
export const updateRecurringPayment = (
  id: string,
  updates: Partial<RecurringPayment>
): RecurringPayment | null => {
  const payments = getAllRecurringPayments();
  const paymentIndex = payments.findIndex(payment => payment.id === id);
  
  if (paymentIndex === -1) {
    return null;
  }
  
  // Update the payment
  payments[paymentIndex] = {
    ...payments[paymentIndex],
    ...updates
  };
  
  // Save changes
  localStorage.setItem(RECURRING_PAYMENTS_KEY, JSON.stringify(payments));
  
  return payments[paymentIndex];
};

/**
 * Delete a recurring payment
 */
export const deleteRecurringPayment = (id: string): boolean => {
  const payments = getAllRecurringPayments();
  const filteredPayments = payments.filter(payment => payment.id !== id);
  
  if (filteredPayments.length === payments.length) {
    return false; // Nothing was deleted
  }
  
  localStorage.setItem(RECURRING_PAYMENTS_KEY, JSON.stringify(filteredPayments));
  return true;
};

/**
 * Toggle the active status of a recurring payment
 */
export const toggleRecurringPaymentStatus = (id: string): RecurringPayment | null => {
  const payment = getRecurringPaymentById(id);
  
  if (!payment) {
    return null;
  }
  
  return updateRecurringPayment(id, { active: !payment.active });
};

/**
 * Update the next payment date based on frequency
 */
export const updateNextPaymentDate = (payment: RecurringPayment): RecurringPayment => {
  const nextDate = new Date(payment.nextPaymentDate);
  
  switch (payment.frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
  }
  
  return updateRecurringPayment(payment.id, { 
    nextPaymentDate: nextDate.toISOString(),
    lastExecuted: new Date().toISOString()
  }) as RecurringPayment;
};

/**
 * Get payments due for execution
 */
export const getDuePayments = (): RecurringPayment[] => {
  const now = new Date();
  const allPayments = getAllRecurringPayments();
  
  return allPayments.filter(payment => {
    if (!payment.active) return false;
    
    const nextPaymentDate = new Date(payment.nextPaymentDate);
    return nextPaymentDate <= now;
  });
};

export default {
  getAllRecurringPayments,
  getRecurringPaymentById,
  createRecurringPayment,
  updateRecurringPayment,
  deleteRecurringPayment,
  toggleRecurringPaymentStatus,
  updateNextPaymentDate,
  getDuePayments
};