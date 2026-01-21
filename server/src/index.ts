import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file first
dotenv.config();

// Then import routes after environment variables are loaded
import { authRoutes } from './routes/auth';
import { apiKeyRoutes } from './routes/apiKey';
import { generationRoutes } from './routes/generation';

// Create Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://192.168.110.97:3000'], // Allow frontend to access
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/api-keys', apiKeyRoutes);
app.use('/api/generations', generationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});