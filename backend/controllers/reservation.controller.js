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

        await newReservation.save();

        res.status(201).json({ message: 'Réservation créée avec succès', data: newReservation });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création de la réservation', error: error.message });
    }
};

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
    getAllReservationsByParkingSpot: exports.getAllReservationsByParkingSpot
};