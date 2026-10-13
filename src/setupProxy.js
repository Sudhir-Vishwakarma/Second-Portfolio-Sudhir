// Dev only: CRA's dev server (`npm start`) loads this file automatically.
// It serves the Vercel function in api/contact.js locally, using SMTP_USER and
// SMTP_PASS from .env.local. On Vercel the function runs on its own.
const express = require('express');
const contact = require('../api/contact');

module.exports = (app) => {
  app.post('/api/contact', express.json(), contact);
};
