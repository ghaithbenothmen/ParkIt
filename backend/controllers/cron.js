const cron = require('node-cron');
const Reservation = require('../models/reservation.model'); // Adjust path if necessary

// Schedule a cron job to run every day at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('Checking for expired reservations...');

    try {
        const now = new Date();
        const expiredReservations = await Reservation.updateMany(
            { endDate: { $lt: now }, status: { $ne: 'over' } },
            { $set: { status: 'over' } }
        );

        console.log(`Updated ${expiredReservations.modifiedCount} expired reservations to over.`);
    } catch (error) {
        console.error('Error updating expired reservations:', error);
    }
});
