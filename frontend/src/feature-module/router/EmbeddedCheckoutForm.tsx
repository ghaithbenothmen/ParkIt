import React from 'react';

export default function EmbeddedCheckoutForm() {
  const handleCheckoutClick = async () => {

    const response = await fetch('http://localhost:4000/api/payment/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reservationId: '67d0e8cf6a48b72dddbde074' }), 
    });

    const session = await response.json();

  const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

if (!stripePublicKey) {
  throw new Error('Stripe public key is not defined in environment variables.');
}

if (typeof window !== "undefined" && window.Stripe) {
  const stripe = window.Stripe(stripePublicKey);
  await stripe.redirectToCheckout({ sessionId: session.id });

} else {
  throw new Error('Stripe.js is not loaded.');
}
  };

  return (
    <div>
      <button onClick={handleCheckoutClick}className="btn btn-dark me-2">Checkout</button>
    </div>
  );
}
