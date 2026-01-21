// Serverless Function entry point for Vercel
const app = require('../server/dist/index.js').default;

// Export the handler function for Vercel
module.exports = app;