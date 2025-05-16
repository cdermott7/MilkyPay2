import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = 5001; // Fixed port for development

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use API routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'BridgeBotPay API is running' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 BridgeBotPay API server running on port ${port}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌟 Stellar Network: ${process.env.NETWORK_PASSPHRASE ? 'Public' : 'Testnet'}`);
});