const cron = require('node-cron');
const Reservation = require('../models/reservation.model'); // Adjust path if necessary

// Schedule a cron job to run every 15 minutes
cron.schedule('*/5 * * * *', async () => {
    console.log('Vérification des réservations expirées...');

    try {
        const now = new Date();

        // Trouver les réservations où l'utilisateur ne s'est pas présenté
        const noShowReservations = await Reservation.find({
            endDate: { $lt: now },
            checkedInTime: null, // L'utilisateur n'est pas entré
            status: 'confirmed'
        });

        for (const reservation of noShowReservations) {
            reservation.status = 'no-show';
            await reservation.save();
            console.log(`Réservation ${reservation._id} marquée comme no-show.`);
        }
    } catch (error) {
        console.error('Erreur lors de la vérification des réservations expirées :', error);
    }
});

cron.schedule('*/1 * * * *', async () => {
    console.log('Vérification des réservations en retard...');

    try {
        const now = new Date();

        // Trouver les réservations où l'utilisateur a dépassé la endDate sans quitter
        const overdueReservations = await Reservation.find({
            endDate: { $lt: now },
            exitTime: null, // L'utilisateur n'a pas encore quitté
            status: { $in: ['confirmed', 'checked-in'] }
        }).populate('parkingId'); // Assurez-vous que parkingId est peuplé

        for (const reservation of overdueReservations) {
            const hourlyRate = reservation.parkingId?.tarif_horaire;

            if (!hourlyRate || isNaN(hourlyRate)) {
                console.error(`Tarif horaire manquant ou invalide pour la réservation ${reservation._id}`);
                continue; // Ignorez cette réservation
            }

            const { hours, minutes } = calculateOverstay(reservation.endDate, now);

            if (isNaN(hours) || isNaN(minutes)) {
                console.error(`Durée de dépassement invalide pour la réservation ${reservation._id}`);
                continue; // Ignorez cette réservation
            }

            // Calculer les frais supplémentaires
            const additionalFee = Math.ceil((hours + (minutes > 0 ? 1 : 0))) * hourlyRate;

            if (isNaN(additionalFee)) {
                console.error(`Frais supplémentaires invalides pour la réservation ${reservation._id}`);
                continue; // Ignorez cette réservation
            }

            reservation.additionalFee = additionalFee;
            reservation.status = 'overdue';
            await reservation.save();

            console.log(`Réservation ${reservation._id} marquée comme overdue avec des frais supplémentaires de ${additionalFee} €.`);
        }
    } catch (error) {
        console.error('Erreur lors de la vérification des réservations en retard :', error);
    }
});

// Fonction pour calculer la durée de dépassement
function calculateOverstay(endDate, now) {
    if (!endDate || !now || isNaN(new Date(endDate)) || isNaN(new Date(now))) {
        console.error('Dates invalides pour le calcul de la durée de dépassement.');
        return { hours: 0, minutes: 0 };
    }

    const diffMs = now - endDate;
    if (diffMs <= 0) {
        console.log('Aucun dépassement détecté.');
        return { hours: 0, minutes: 0 };
    }

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;

    console.log(`Dépassement détecté : ${hours} heures et ${minutes} minutes.`);
    return { hours, minutes };
}
