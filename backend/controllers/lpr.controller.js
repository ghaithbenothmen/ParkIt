const Vehicule = require('../models/vehicule.model');
const Reservation = require('../models/reservation.model');

exports.checkPlate = async (req, res) => {
    // Add raw body logging for debugging
    console.log("Raw request body:", req.body);
    
    try {
        // Ensure proper JSON parsing
        if (typeof req.body !== 'object' || !req.body.immatriculation) {
            return res.status(400).json({ 
                message: "Invalid request format",
                expected: { immatriculation: "string" },
                received: req.body
            });
        }

        const { immatriculation } = req.body;
        console.log("Checking plate:", immatriculation);

        const vehicle = await Vehicule.findOne({ immatriculation });
        if (!vehicle) {
            return res.status(404).json({ message: "Véhicule non trouvé." });
        }

        const now = new Date();
        const activeReservation = await Reservation.findOne({
            vehicule: vehicle._id,
            startDate: { $lte: now },
            endDate: { $gte: now },
            status: { $in: ['pending', 'confirmed'] }
        });

        if (activeReservation) {
            return res.status(200).json({ 
                authorized: true, 
                message: "Accès autorisé",
                vehicle,
                reservation: activeReservation
            });
        } else {
            return res.status(200).json({ 
                authorized: false, 
                message: "Aucune réservation active.",
                currentTime: now
            });
        }
    } catch (error) {
        console.error("Error in checkPlate:", error);
        return res.status(500).json({ 
            message: "Erreur serveur", 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.checkExitVehicle = async (req, res) => {
    try {
        const { immatriculation } = req.body;

        // First find the vehicle by plate number
        const vehicle = await Vehicule.findOne({ immatriculation });
        if (!vehicle) {
            return res.status(404).json({
                authorized: false,
                message: 'Vehicle not found'
            });
        }

        // Then find active reservation for this vehicle using its ObjectId
        const reservation = await Reservation.findOne({
            'vehicule': vehicle._id,
            'status': 'confirmed',
            'exitTime': null
        }).populate('parkingSpot').populate({
            path: 'parkingId',
            select: 'tarif_horaire'
        });

        if (!reservation) {
            return res.status(404).json({
                authorized: false,
                message: 'No active reservation found for this vehicle'
            });
        }

        const now = new Date();
        const endDate = new Date(reservation.endDate);
        let additionalFee = 0;
        let needsPayment = false;
        let overstayHours = 0;
        let overstayMinutes = 0;

        // Calculate additional fees if vehicle stayed longer than reservation
        if (now > endDate) {
            overstayMinutes = Math.ceil((now - endDate) / (1000 * 60));
            overstayHours = Math.ceil(overstayMinutes / 60);
            
            // Calculate additional fee based on parking's hourly rate
            const hourlyRate = reservation.parkingId.tarif_horaire;
            additionalFee = overstayHours * hourlyRate;
            
            // Check if additional fees are already paid
            if (reservation.additionalPaymentStatus !== 'confirmed') {
                needsPayment = true;
            }
        }

        // Format dates for better readability
        const formatDate = (date) => {
            return new Date(date).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        };

        // Prepare detailed response
        const response = {
            authorized: !needsPayment,
            message: needsPayment ? 'Additional fees required' : 'Exit authorized',
            reservationDetails: {
                startTime: formatDate(reservation.startDate),
                endTime: formatDate(reservation.endDate),
                currentTime: formatDate(now),
                originalPrice: reservation.totalPrice,
                hourlyRate: reservation.parkingId.tarif_horaire,
                vehicle: {
                    plate: immatriculation,
                    marque: vehicle.marque,
                    modele: vehicle.modele
                }
            },
            overstayDetails: {
                minutes: overstayMinutes,
                hours: overstayHours,
                additionalFee: additionalFee,
                needsPayment: needsPayment
            }
        };

        // If no additional fees or fees are paid, allow exit
        if (!needsPayment) {
            // Update reservation with exit time
            reservation.exitTime = now;
            await reservation.save();

            return res.status(200).json(response);
        }

        // If additional fees are needed but not paid
        return res.status(200).json({
            ...response,
            reservationId: reservation._id
        });

    } catch (error) {
        console.error('Error checking exit vehicle:', error);
        res.status(500).json({
            authorized: false,
            message: 'Internal server error'
        });
    }
};
