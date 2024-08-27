// payment.js
const express = require('express');
const stripe = require('stripe')('your_stripe_secret_key');
const router = express.Router();

router.post('/create-payment-intent', async (req, res) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'usd',
    });
    res.send({
        clientSecret: paymentIntent.client_secret,
    });
});

module.exports = router;