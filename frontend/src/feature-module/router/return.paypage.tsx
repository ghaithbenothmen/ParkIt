import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface StripeSession {
  customer?: string;
}

const PaymentSuccess = () => {
  const [session, setSession] = useState<StripeSession | null>(null);
  const location = useLocation();
  const sessionId = new URLSearchParams(location.search).get("session_id");

  useEffect(() => {
    if (sessionId) {
      fetch(`http://localhost:4000/api/payment/checkoutsession/${sessionId}`)
        .then((res) => res.json())
        .then((data: StripeSession) => setSession(data))
        .catch((error) => console.error("Error fetching session:", error));
    }
  }, [sessionId]);

  if (!session) return <div>Loading...</div>;

  return (
    <div>
      <h1>Payment Success!</h1>
      <p>Your payment was successful. Customer ID: {session.customer ?? "N/A"}</p>
    </div>
  );
};

export default PaymentSuccess;
