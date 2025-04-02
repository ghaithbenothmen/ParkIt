const express = require('express');
const router = express.Router();
const { createCheckoutSession, handleCheckoutReturn } = require('../controllers/payment.controller');


router.post('/checkout', createCheckoutSession);

router.get('/checkout-return', handleCheckoutReturn);

module.exports = router;
