// PaymentButton.tsx
import React from 'react';

interface PaymentButtonProps {
  id: string;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ id }) => {
  const handlePaymentClick = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/reservations/${id}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Payment initiation failed');
      }

      const data = await response.json();

      if (data.paymentLink) {
        window.location.href = data.paymentLink; // Redirect to the payment page
      } else {
        throw new Error('Payment link not received');
      }
    } catch (error) {
      console.error('Error:', error);
      // Implement error handling logic, like displaying an error message to the user
    }
  };

  return (
   <button
  onClick={handlePaymentClick}
  className="btn btn-dark d-flex align-items-center"
>
  <i className="ti ti-circle-arrow-left me-1" />
  pay
</button>

  );
};

export default PaymentButton;
