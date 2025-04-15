const Reservation = require('../models/reservation.model.js');
const ParkingSpot = require('../models/parkingSpot.model');
const cron = require('node-cron');



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

exports.createReservation = async (req, res) => {
    try {
        const { userId, parkingId, parkingSpot,vehicule, startDate, endDate, totalPrice } = req.body;

        // Vérifier si la place de parking est déjà réservée pour cette période
        const existingReservation = await Reservation.findOne({
            parkingSpot,
            $or: [
                { startDate: { $lt: endDate }, endDate: { $gt: startDate } }, // Chevauchement de dates
            ]
        });

        if (existingReservation) {
            return res.status(400).json({ message: 'La place de parking est déjà réservée pour cette période.' });
        }


        // Créer une nouvelle réservation
        const newReservation = new Reservation({
            userId,
            parkingId,
            parkingSpot,
            vehicule,
            startDate,
            endDate,
            totalPrice
        });
        await newReservation.save();

        res.status(201).json({ message: 'Réservation créée avec succès', data: newReservation });

    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création de la réservation', error: error.message });
    }
};
exports.reservationPayment = async (req, res) => {
    try {
        const { id } = req.params; // Get reservation ID from request params

        // Fetch the reservation details from the database
        const reservation = await Reservation.findById(id);
        if (!reservation) {
            return res.status(404).json({ error: "Reservation not found" });
        }
        const trackingId = `order-${Date.now()}`;  // Generate a tracking ID using the current timestamp
        
        // Ensure `newReservation` is properly created before using `newReservation._id`
    
        const response = await fetch("https://developers.flouci.com/api/generate_payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                app_token: process.env.APP_TOKEN,
                app_secret: process.env.PRIVATE_KEY,
                amount: Math.round(reservation.totalPrice * 1000),
                accept_card: true,
                session_timeout_secs: 1200,
                success_link: `http://localhost:4000/api/reservations/success?trackingId=${trackingId}&reservationId=${id}`,
                fail_link: `http://localhost:4000/api/reservations/fail?trackingId=${trackingId}&reservationId=${reservation._id}`,
                developer_tracking_id: trackingId
            }),
        });
    
        if (!response.ok) {
            const errorBody = await response.text();
            console.error("💥 Flouci returned error:", errorBody); // Add this
            throw new Error("Failed to create payment on Flouci");
          }
    
        const data = await response.json();
    
        if (data.result && data.result.link) {
            return res.json({ paymentLink: data.result.link });
        }
    
        // If the response does not contain a valid payment link
        return res.status(400).json({ error: "Failed to create payment" });
    
    } catch (error) {
        console.error("💥 Error creating payment:", error);
      
        if (error.response) {
          const errorText = await error.response.text();
          console.error("💥 Flouci error response:", errorText);
        }
      
        return res.status(500).json({
          error: "Payment creation failed",
          message: error.message
        });
      }
}
exports.paymentSuccess = async (req, res) => {
    const { trackingId, reservationId, payment_id } = req.query;
    
    if (!trackingId || !reservationId) return res.send("Invalid request");

    try {
        // Update the reservation payment status to "confirmed"
        const reservation = await Reservation.findByIdAndUpdate(
            reservationId,
            { status: 'confirmed' },
            { new: true } // Return the updated reservation
        );

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Find the associated parking spot
        const parkingSpot = await ParkingSpot.findById(reservation.parkingSpot);

        if (!parkingSpot) {
            return res.status(404).json({ message: 'Parking spot not found' });
        }

        // Mark the parking spot as unavailable
        parkingSpot.disponibilite = false;
        await parkingSpot.save();

        const frontendSuccessUrl = `http://localhost:3000/payment-success`;
        return res.redirect(frontendSuccessUrl);

    } catch (error) {
        console.error("Error processing payment success:", error);
        return res.status(500).json({
            message: 'Erreur lors du traitement du succès de paiement',
            error: error.message
        });
    }
};
exports.paymentFail = async (req, res) => {
        const frontendErrorUrl = `http://localhost:3000/payment-error`;
        return res.redirect(frontendErrorUrl);
}

exports.getAllReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find();

        // Check for expired reservations and update their status to 'over'
        const now = new Date();
        const expiredReservations = await Reservation.updateMany(
            { endDate: { $lt: now }, status: { $ne: 'over' } },
            { $set: { status: 'over' } }
        );

        console.log(`Updated ${expiredReservations.modifiedCount} expired reservations to over.`);

        res.status(200).json({ data: reservations });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des réservations', error: error.message });
    }
};


exports.getReservationById = async (req, res) => {
    try {
        const { id } = req.params;

        const reservation = await Reservation.findById(id);

        if (!reservation) {
            return res.status(404).json({ message: 'Réservation non trouvée.' });
        }

        res.status(200).json({ data: reservation });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération de la réservation', error: error.message });
    }
};

exports.updateReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate, status, totalPrice } = req.body;

        // Vérifier si la réservation existe
        const reservation = await Reservation.findById(id);
        if (!reservation) {
            return res.status(404).json({ message: 'Réservation non trouvée.' });
        }

        // Mettre à jour les champs
        if (startDate) reservation.startDate = startDate;
        if (endDate) reservation.endDate = endDate;
        if (status) reservation.status = status;
        if (totalPrice) reservation.totalPrice = totalPrice;

        await reservation.save();

        res.status(200).json({ message: 'Réservation mise à jour avec succès', data: reservation });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la réservation', error: error.message });
    }
};

exports.deleteReservation = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedReservation = await Reservation.findByIdAndDelete(id);

        if (!deletedReservation) {
            return res.status(404).json({ message: 'Réservation non trouvée.' });
        }

        res.status(200).json({ message: 'Réservation supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression de la réservation', error: error.message });
    }
};

// Récupérer toutes les réservations d'un utilisateur
exports.getAllReservationsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const reservations = await Reservation.find({ userId });

        if (reservations.length === 0) {
            return res.status(404).json({ message: 'Aucune réservation trouvée pour cet utilisateur.' });
        }

        res.status(200).json({ data: reservations });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des réservations', error: error.message });
    }
};

// Récupérer toutes les réservations d'un parking
exports.getAllReservationsByParking = async (req, res) => {
    try {
        const { parkingId } = req.params;

        const reservations = await Reservation.find({ parkingId })

        if (reservations.length === 0) {
            return res.status(404).json({ message: 'Aucune réservation trouvée pour ce parking.' });
        }

        res.status(200).json({ data: reservations });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des réservations', error: error.message });
    }
};

// Récupérer toutes les réservations d'une place de parking
exports.getAllReservationsByParkingSpot = async (req, res) => {
    try {
        const { parkingSpotId } = req.params;

        const reservations = await Reservation.find({ parkingSpot: parkingSpotId })

        if (reservations.length === 0) {
            return res.status(404).json({ message: 'Aucune réservation trouvée pour cette place de parking.' });
        }

        res.status(200).json({ data: reservations });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des réservations', error: error.message });
    }
};
exports.getConfirmedReservations = async (req, res) => {
    try {
        const confirmedReservations = await Reservation.find({ status: 'confirmed' });

        if (confirmedReservations.length === 0) {
            return res.status(404).json({ message: 'Aucune réservation confirmée trouvée.' });
        }

        res.status(200).json({ data: confirmedReservations });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des réservations confirmées', error: error.message });
    }
};
exports.getPendingReservations = async (req, res) => {
    try {
        const pendingReservations = await Reservation.find({ status: 'pending' });

        if (pendingReservations.length === 0) {
            return res.status(404).json({ message: 'Aucune réservation pending trouvée.' });
        }

        res.status(200).json({ data: pendingReservations });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des réservations pending', error: error.message });
    }
};
exports.getOverReservations = async (req, res) => {
    try {
        const overReservations = await Reservation.find({ status: 'over' });

        if (overReservations.length === 0) {
            return res.status(404).json({ message: 'Aucune réservation over trouvée.' });
        }

        res.status(200).json({ data: overReservations });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des réservations over', error: error.message });
    }
};
exports.getTotalPriceOfAllReservations = async (req, res) => {
    try {
        // Fetch all reservations from the database
        const reservations = await Reservation.find();

        // Calculate the total price by summing up the 'totalPrice' field of each reservation
        const totalPrice = reservations.reduce((total, reservation) => total + reservation.totalPrice, 0);

        res.status(200).json({ totalPrice });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du prix total des réservations', error: error.message });
    }
};



// Dans votre fichier de contrôleur (reservation.controller.js)
exports.getReservationCount = async (req, res) => {
    try {
      const count = await Reservation.countDocuments();
      res.status(200).json({ count });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

module.exports = {
    createReservation: exports.createReservation,
    reservationPayment: exports.reservationPayment,
    getAllReservations: exports.getAllReservations,
    getReservationById: exports.getReservationById,
    updateReservation: exports.updateReservation,
    deleteReservation: exports.deleteReservation,
    getAllReservationsByUser: exports.getAllReservationsByUser,
    getAllReservationsByParking: exports.getAllReservationsByParking,
    getAllReservationsByParkingSpot: exports.getAllReservationsByParkingSpot,
    paymentSuccess: exports.paymentSuccess,
    paymentFail: exports.paymentFail,
    getReservationCount: exports.getReservationCount,
    getConfirmedReservations: exports.getConfirmedReservations,
    getPendingReservations:  exports.getPendingReservations,
    getOverReservations: exports.getOverReservations,
    getTotalPriceOfAllReservations: exports.getTotalPriceOfAllReservations,

};