// Serverless Function entry point for Vercel
// Import the server app using dynamic import to handle ES modules
import { createServer } from 'http';

export default async (req, res) => {
  const { default: app } = await import('../server/dist/index.js');
  // Create a server instance and handle the request
  const server = createServer(app);
  return server.emit('request', req, res);
};