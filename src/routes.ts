import { Router } from 'express';
import * as walletController from './controllers/walletController';
import * as txController from './controllers/txController';
import * as smsController from './controllers/smsController';

const router = Router();

// Wallet routes
router.post('/wallet/new', walletController.createWallet);
router.get('/wallet/:publicKey', walletController.getWallet);
router.get('/wallet/:publicKey/balance', walletController.getBalance);

// Transaction routes
router.post('/tx/send', txController.sendPayment);
router.post('/tx/claim', txController.claimBalance);
router.post('/tx/offramp', txController.processOffRamp);
router.get('/tx/history/:publicKey', txController.getTransactionHistory);

// SMS routes
router.post('/sms/claim-link', smsController.sendClaimLink);
router.post('/sms/status-update', smsController.sendStatusUpdate);
router.post('/sms/verify-phone', smsController.verifyPhoneNumber);

export default router;