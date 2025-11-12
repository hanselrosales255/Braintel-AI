const express = require('express');
const path = require('path');

const router = express.Router();
const publicDir = path.join(__dirname, '..', 'public');

router.get('/', (req, res) => {
  res.sendFile('index.html', { root: publicDir });
});

router.get('/auth', (req, res) => {
  res.sendFile('auth.html', { root: publicDir });
});

router.get('/dashboard', (req, res) => {
  res.sendFile('dashboard.html', { root: publicDir });
});

module.exports = router;
