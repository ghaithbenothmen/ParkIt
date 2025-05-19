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
            status: { $in: ['confirmed'] }
        });

        if (activeReservation) {
          // Mark the reservation as checked-in
          activeReservation.checkedInTime = now;
          activeReservation.status = 'checked-in';
          await activeReservation.save();

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

      // Vérifier si la plaque d'immatriculation est fournie
      if (!immatriculation) {
          return res.status(400).json({
              authorized: false,
              message: 'La plaque d\'immatriculation est requise.'
          });
      }

      // Trouver le véhicule par sa plaque d'immatriculation
      const vehicle = await Vehicule.findOne({ immatriculation });
      if (!vehicle) {
          return res.status(404).json({
              authorized: false,
              message: 'Véhicule non trouvé.'
          });
      }

      const now = new Date();

      // Trouver la réservation active (checked-in) sans exitTime
      let reservation = await Reservation.findOne({
          vehicule: vehicle._id,
          status: { $in: ['checked-in', 'overdue'] },
          exitTime: null
      }).populate('parkingSpot').populate({
          path: 'parkingId',
          select: 'tarif_horaire'
      });

      // Si aucune réservation active n'est trouvée
      if (!reservation) {
          return res.status(404).json({
              authorized: false,
              message: 'Aucune réservation active trouvée pour ce véhicule.'
          });
      }

      // Initialiser les variables pour les frais supplémentaires
      let additionalFee = 0;
      let needsPayment = false;

      // Vérifier si la réservation est en retard (overdue)
      if (now > reservation.endDate && (!reservation.extendedEndDate || now > reservation.extendedEndDate)) {
          const { hours, minutes } = calculateOverstay(reservation.extendedEndDate || reservation.endDate, now);
          const hourlyRate = reservation.parkingId.tarif_horaire;

          if (!hourlyRate) {
              return res.status(500).json({
                  authorized: false,
                  message: 'Impossible de calculer les frais supplémentaires : tarif horaire manquant.'
              });
          }

          // Calculer les frais supplémentaires
          additionalFee = Math.ceil(hours + (minutes > 0 ? 1 : 0)) * hourlyRate;

          // Mettre à jour la réservation avec les frais supplémentaires et le statut overdue
          if (additionalFee > 0 && reservation.additionalFee !== additionalFee) {
              reservation.additionalFee = additionalFee;
              reservation.status = 'overdue';
              await reservation.save();
          }

          // Vérifier si les frais supplémentaires ont été payés
          needsPayment = reservation.additionalPaymentStatus !== 'confirmed';
      }

      // Préparer la réponse
      const formatTime = (date) => date.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
      });

      const response = {
          authorized: !needsPayment,
          message: needsPayment ? 'Des frais supplémentaires sont requis.' : 'Sortie autorisée.',
          reservationDetails: {
              startTime: formatTime(reservation.startDate),
              endTime: formatTime(reservation.endDate),
              extendedEndTime: reservation.extendedEndDate ? formatTime(reservation.extendedEndDate) : null,
              currentTime: formatTime(now),
              originalPrice: reservation.totalPrice,
              hourlyRate: reservation.parkingId.tarif_horaire,
              vehicle: {
                  plate: immatriculation,
                  marque: vehicle.marque,
                  modele: vehicle.modele
              }
          },
          overstayDetails: {
              minutes: additionalFee > 0 ? calculateOverstay(reservation.extendedEndDate || reservation.endDate, now).minutes : 0,
              hours: additionalFee > 0 ? calculateOverstay(reservation.extendedEndDate || reservation.endDate, now).hours : 0,
              additionalFee: additionalFee,
              needsPayment: needsPayment
          }
      };

      // Si l'utilisateur est autorisé à sortir, mettre à jour le temps de sortie et le statut
      if (!needsPayment) {
          reservation.exitTime = now;
          reservation.status = 'completed';
          await reservation.save();
      }

      return res.status(200).json(response);

  } catch (error) {
      console.error('Erreur lors de la vérification de la sortie du véhicule :', error);
      res.status(500).json({
          authorized: false,
          message: 'Erreur interne du serveur.'
      });
  }
};
  
  function calculateOverstay(endDate, now) {
    const diffMs = now - endDate;
    if (diffMs <= 0) return { hours: 0, minutes: 0 };
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    
    return { hours, minutes };
  }