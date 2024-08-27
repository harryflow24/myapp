// CheckoutForm.js
import React from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement),
        });

        if (!error) {
            const { id } = paymentMethod;
            const response = await axios.post('http://localhost:3000/payment/create-payment-intent', {
                amount: 1000, // Amount in cents
                payment_method: id,
            });

            const { clientSecret } = response.data;
            const confirmPayment = await stripe.confirmCardPayment(clientSecret);

            if (confirmPayment.error) {
                console.error(confirmPayment.error.message);
            } else {
                console.log('Payment successful');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardElement />
            <button type="submit" disabled={!stripe}>Pay</button>
        </form>
    );
}

export default CheckoutForm;