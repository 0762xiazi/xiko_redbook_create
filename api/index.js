// Serverless Function entry point for Vercel
// Import the server app using dynamic import to handle ES modules
export default async (req, res) => {
  const { default: app } = await import('../server/dist/index.js');
  return app(req, res);
};