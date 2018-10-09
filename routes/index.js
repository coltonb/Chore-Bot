const express = require('express');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

// GET

// homepage
router.get('/', dashboardController.get);

// POST

// bot response
router.post('/', dashboardController.post);

module.exports = router;
