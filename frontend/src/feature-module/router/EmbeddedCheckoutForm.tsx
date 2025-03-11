import React, { useState, useRef, useCallback, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";

const stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
if (!stripeKey) {
  console.error("Stripe publishable key is missing!");
}
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;


const EmbeddedCheckoutButton = () => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const modalRef = useRef<HTMLDialogElement | null>(null);
  const navigate = useNavigate();

  const fetchClientSecret = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:4000/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: "price_1OtHkdBF7AptWZlcIjbBpS8r" }), // Replace with actual price ID
      });
      const data = await response.json();
      setClientSecret(data.client_secret);
    } catch (error) {
      console.error("Error fetching client secret:", error);
    }
  }, []);

  const handleCheckoutClick = async () => {
    setShowCheckout(true);
    await fetchClientSecret(); // Fetch client secret before showing checkout
    modalRef.current?.showModal();
  };

  const handleCloseModal = () => {
    setShowCheckout(false);
    modalRef.current?.close();
  };

  return (
    <div>
      <button onClick={handleCheckoutClick}>Start Checkout</button>
      <dialog ref={modalRef}>
        <div>
          <h2>Stripe Checkout</h2>
          {showCheckout && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              {/* Add your Stripe form here */}
            </Elements>
          )}
          <button onClick={handleCloseModal}>Close</button>
        </div>
      </dialog>
    </div>
  );
};

export default EmbeddedCheckoutButton;
