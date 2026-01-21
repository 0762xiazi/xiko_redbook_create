// Serverless Function entry point for Vercel
// Import the server app using dynamic import to handle ES modules
import { createServer } from 'http';

// Cache the app instance to avoid reloading on every request
let appInstance = null;
let serverInstance = null;

export default async (req, res) => {
  try {
    console.time('Request processing time');
    
    // Load app instance if not cached
    if (!appInstance) {
      console.log('Loading server app...');
      console.time('App loading time');
      const { default: app } = await import('../server/dist/index.js');
      appInstance = app;
      serverInstance = createServer(app);
      console.timeEnd('App loading time');
      console.log('Server app loaded successfully');
    }
    
    // Handle the request
    console.log('Handling request:', req.method, req.url);
    console.log('Request body:', req.body);
    
    // Set a timeout to avoid Vercel's 300s timeout
    const timeoutId = setTimeout(() => {
      console.error('Request processing timed out');
      res.statusCode = 504;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Request processing timed out' }));
    }, 290000); // 290 seconds
    
    // Handle the request and clear the timeout when done
    serverInstance.emit('request', req, res);
    
    // Clear the timeout if the request completes
    res.on('finish', () => {
      clearTimeout(timeoutId);
      console.timeEnd('Request processing time');
    });
  } catch (error) {
    console.error('Error handling request:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
};