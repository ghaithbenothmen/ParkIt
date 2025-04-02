const Reservation = require('../models/reservation.model.js');

exports.createReservation = async (req, res) => {
    try {
        const { userId, parkingId, parkingSpot, startDate, endDate, totalPrice } = req.body;

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
            startDate,
            endDate,
            totalPrice
        });
        await newReservation.save();try {
            const amount = 1000; // Amount to pay (modify as needed)
            const trackingId = `order-${Date.now()}`;  // Generate a tracking ID using the current timestamp
            
            // Ensure `newReservation` is properly created before using `newReservation._id`
            if (!newReservation || !newReservation._id) {
                return res.status(400).json({ error: "Reservation not found or invalid" });
            }
        
            const response = await fetch("https://developers.flouci.com/api/generate_payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    app_token: "a85c8b00-781c-401a-be6f-5c596aba1676",
                    app_secret: "1020d467-11ca-4fbe-b120-afdd7004044d",
                    amount: amount,
                    accept_card: true,
                    session_timeout_secs: 1200,
                    success_link: `http://localhost:4000/api/reservations/success?trackingId=${trackingId}&reservationId=${newReservation._id}`,
                    fail_link: `http://localhost:4000/api/reservations/fail?trackingId=${trackingId}&reservationId=${newReservation._id}`,
                    developer_tracking_id: trackingId
                }),
            });
        
            if (!response.ok) {
                throw new Error("Failed to create payment on Flouci");
            }
        
            const data = await response.json();
        
            if (data.result && data.result.link) {
                console.log("Payment link:", data.result.link);
                // Redirect to Flouci payment page
                return res.redirect(data.result.link);
            }
        
            // If the response does not contain a valid payment link
            return res.status(400).json({ error: "Failed to create payment" });
        
        } catch (error) {
            console.error("Error creating payment:", error);
            return res.status(500).json({ error: "Payment creation failed", message: error.message });
        }
        


        res.status(201).json({ message: 'Réservation créée avec succès', data: newReservation });

    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création de la réservation', error: error.message });
    }
};
exports.paymentSuccess = async (req, res) => {
    const { trackingId, reservationId, payment_id } = req.query;
    
    if (!trackingId || !reservationId) return res.send("Invalid request");

    // Update the reservation payment status to "confirmed"
    await Reservation.findByIdAndUpdate(reservationId, { status: 'confirmed' });
        const frontendSuccessrUrl = `http://localhost:3000/activation-success`;
        return res.redirect(frontendSuccessrUrl);
}
exports.paymentFail = async (req, res) => {
        const frontendErrorUrl = `http://localhost:3000/activation-error`;
        return res.redirect(frontendErrorUrl);
}

exports.getAllReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find();

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

module.exports = {
    createReservation: exports.createReservation,
    getAllReservations: exports.getAllReservations,
    getReservationById: exports.getReservationById,
    updateReservation: exports.updateReservation,
    deleteReservation: exports.deleteReservation,
    getAllReservationsByUser: exports.getAllReservationsByUser,
    getAllReservationsByParking: exports.getAllReservationsByParking,
    getAllReservationsByParkingSpot: exports.getAllReservationsByParkingSpot,
    paymentSuccess: exports.paymentSuccess,
    paymentFail: exports.paymentFail
};