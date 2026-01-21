// Serverless Function entry point for Vercel
// Import the server app using dynamic import to handle ES modules
import { createServer } from 'http';

// Cache the app instance to avoid reloading on every request
let appInstance = null;
let serverInstance = null;

export default async (req, res) => {
  try {
    // Load app instance if not cached
    if (!appInstance) {
      console.log('Loading server app...');
      const { default: app } = await import('../server/dist/index.js');
      appInstance = app;
      serverInstance = createServer(app);
      console.log('Server app loaded successfully');
    }
    
    // Handle the request
    console.log('Handling request:', req.method, req.url);
    serverInstance.emit('request', req, res);
  } catch (error) {
    console.error('Error handling request:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
};