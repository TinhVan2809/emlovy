/**
 * Vercel Serverless Function Entry Point
 * This file exports the Express app for Vercel's serverless platform.
 */

const { app } = require("./server");

// Export the Express app as a Vercel serverless function
module.exports = app;
