const Reservation = require("../models/reservation.model.js");

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const durationInHours = 3;
const pricePerHour = 5000; 
const totalPrice = durationInHours * pricePerHour;

const createCheckoutSession = async (req, res) => {
  try {
    const { reservationId } = req.body; 
    const reservation = await Reservation.findById(reservationId); 
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Reservation`,
            },
            unit_amount: reservation.totalPrice,
          },          quantity: 1,
        },
      ],
      mode: 'payment', 
      success_url: `${process.env.CLIENT_URL}/`,
      cancel_url: `${process.env.CLIENT_URL}/`,
    });

    return res.status(200).json({ id: session.id, client_secret: session.client_secret });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};


const handleCheckoutReturn = async (req, res) => {
  const { session_id } = req.query;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      res.send(`
        <h1>Payment Successful!</h1>
        <p>Thank you for your purchase! Your customer ID is ${session.customer}</p>
      `);
    } else {
      res.send('<h1>Payment Failed!</h1>');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred while retrieving session.');
  }
};

module.exports = { createCheckoutSession, handleCheckoutReturn };