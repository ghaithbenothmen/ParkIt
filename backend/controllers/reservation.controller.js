const Reservation = require('../models/reservation.model.js');
const ParkingSpot = require('../models/parkingSpot.model');
const Badge = require('../models/badge.model.js');
const cron = require('node-cron');
const NotificationController = require('./notification.controller.js');
const mongoose = require('mongoose');

/* cron.schedule('0 0 * * *', async () => {
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
cron.schedule('0 0 1 * *', async () => {  // Runs at midnight on the first day of every month
    console.log('Resetting user points for the new month...');

    try {
        const users = await User.find();
        
        for (const user of users) {
            user.weeklyPoints = 0;  // Reset points to 0 at the beginning of each month
            user.badge = null; // Optionally reset the badge to null
            user.lastBadgeUpdate = null; // Optionally reset the badge update time
            await user.save();  // Save the updated user
        }

        console.log('User points and badges reset successfully.');
    } catch (error) {
        console.error('Error resetting user points and badges:', error);
    }
});


const User = require('../models/user.model.js');
 */
const User = require('../models/user.model.js');
exports.createReservation = async (req, res) => {
    try {
        const { userId, parkingId, parkingSpot, vehicule, startDate, endDate, totalPrice } = req.body;

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
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Increment the user's points by 1 (1 point per reservation)
        user.weeklyPoints += 1;

        // Assign badge based on the user's points
        let badge = null;
        if (user.weeklyPoints >= 101) {
            badge = await Badge.findOne({ minPoints: { $lte: user.weeklyPoints }, maxPoints: { $gte: user.weeklyPoints }, name: 'Gold' });
        } else if (user.weeklyPoints >= 11) {
            badge = await Badge.findOne({ minPoints: { $lte: user.weeklyPoints }, maxPoints: { $gte: user.weeklyPoints }, name: 'Silver' });
        } else if (user.weeklyPoints >= 1) {
            badge = await Badge.findOne({ minPoints: { $lte: user.weeklyPoints }, maxPoints: { $gte: user.weeklyPoints }, name: 'Bronze' });
        }

        if (badge) {
            user.badge = badge._id; // Assign the badge to the user
        }

        await user.save();

        // Créer une notification après la création de la réservation
        NotificationController.createNotification(newReservation);

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
        const reservations = await Reservation.find().sort({ createdAt: -1 });

        // Check for expired reservations and update their status to 'over'
     /*    const now = new Date();
        const expiredReservations = await Reservation.updateMany(
            { endDate: { $lt: now }, status: { $ne: 'over' } },
            { $set: { status: 'over' } }
        );

        console.log(`Updated ${expiredReservations.modifiedCount} expired reservations to over.`);
 */
        res.status(200).json({ data: reservations });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des réservations', error: error.message });
    }
};


exports.getReservationById = async (req, res) => {
    try {
        const { id } = req.params;

        // Populate parkingId and parkingSpot to include parking and spot details
        const reservation = await Reservation.findById(id)
            .populate('parkingId') // Populate parking details
            .populate('parkingSpot'); // Populate parking spot details

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
        const { startDate, endDate, status, totalPrice, userId } = req.body;

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
        if (userId) reservation.userId = userId;

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

        const reservations = await Reservation.find({ userId }).sort({ createdAt: -1 });

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
        res.status  (500).json({ message: 'Erreur lors de la récupération des réservations confirmées', error: error.message });
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
exports.getReservationSummary = async (req, res) => {
    const reservations = await Reservation.find({
        startDate: {
            $gte: new Date(new Date().setMonth(-1)),
            $lte: new Date(new Date().setMonth(12))
        },
    });
    const numbers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    reservations.forEach(myFunction);
    function myFunction(reservation) {
        price = reservation.totalPrice;
        index = reservation.startDate.getMonth();
        numbers[index] += price;
    }
    return res.status(200).json({ count: numbers });


};
exports.getReservationStatistics = async (req, res) => {
    const reservations = await Reservation.find();
    var confirmed = 0;
    var pending = 0;
    var over = 0;
    const total = reservations.length;
    reservations.forEach(myFunction);
    function myFunction(reservation) {
        switch (reservation.status) {
            case "confirmed":
                confirmed += 1;
                break;
            case "pending":
                pending += 1;
                break;
            case "over":
                over += 1;
                break;
        }
    }
    const stat = [Math.floor(confirmed * 100 / total), Math.floor(over * 100 / total), Math.floor(pending * 100 / total)];
    return res.status(200).json({ count: stat });
};
exports.getWeekendReservationStats = async (req, res) => {
    try {
        const reservations = await Reservation.find();

        let weekend = 0;
        let weekday = 0;

        const total = reservations.length;

        reservations.forEach((reservation) => {
            const day = new Date(reservation.startDate).getDay(); // 0 = Sunday, 6 = Saturday
            if (day === 0 || day === 6) {
                weekend++;
            } else {
                weekday++;
            }
        });
        const stat = [Math.floor(weekend * 100 / total), Math.floor(weekday * 100 / total)];
        return res.status(200).json({ count: stat });
    } catch (error) {
        console.error("Error in getWeekendReservationStats:", error);
        return res.status(500).json({ error: "Failed to fetch weekend stats" });
    }
};



exports.getTopUsers = async (req, res) => {
    try {
        const topUsers = await Reservation.aggregate([
            {
                $group: {
                    _id: '$userId', // group by userId (replace with your user field)
                    totalReservations: { $sum: 1 },
                },
            },
            { $sort: { totalReservations: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users', // this should match your actual collection name
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo',
                },
            },
            {
                $unwind: '$userInfo',
            },
            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    totalReservations: 1,
                    name: {
                        $concat: ['$userInfo.firstname', ' ', '$userInfo.lastname'],
                    },
                    email: '$userInfo.email',
                },
            },
        ]);
        console.log(topUsers);
        return res.status(200).json({ topUsers: topUsers });
    } catch (error) {
        console.error('Error fetching top users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getTopParkings = async (req, res) => {
    try {
        const topParkings = await Reservation.aggregate([
            {
                $group: {
                    _id: '$parkingId', // group by userId (replace with your user field)
                    totalReservations: { $sum: 1 },
                },
            },
            { $sort: { totalReservations: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'parkings', // this should match your actual collection name
                    localField: '_id',
                    foreignField: '_id',
                    as: 'parkingInfo',
                },
            },
            {
                $unwind: '$parkingInfo',
            },
            {
                $project: {
                    _id: 0,
                    parkingId: '$_id',
                    totalReservations: 1,
                    name: '$parkingInfo.nom',
                    adresse: '$parkingInfo.adresse',
                },
            },
        ]);
        console.log(topParkings);
        return res.status(200).json({ topParkings: topParkings });
    } catch (error) {
        console.error('Error fetching top users:', error);
        res.status(500).json({ error: 'Internal server error' })
            ;
    }
}
// Get all reservations by user ID and start date
exports.getReservationsByUserAndStartDate = async (req, res) => {
    try {
        const { userId, startDate } = req.query;

        if (!userId || !startDate) {
            return res.status(400).json({ message: 'userId and startDate are required.' });
        }

        const start = new Date(startDate);
        start.setUTCHours(0, 0, 0, 0); // 00:00 UTC
        const end = new Date(startDate);
        end.setUTCHours(23, 59, 59, 999); // 23:59:59 UTC

        const reservations = await Reservation.find({
            userId,
            startDate: { $gte: start, $lte: end }
        });

        if (reservations.length === 0) {
            return res.status(404).json({ message: 'Aucune réservation trouvée pour cet utilisateur à cette date.' });
        }

        res.status(200).json({ data: reservations });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des réservations', error: error.message });
    }
};
exports.getWeeklyReservationCountsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const today = new Date();

        // Get start (Monday) and end (Sunday) of the current week
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (7 - today.getDay())); // Sunday
        endOfWeek.setHours(23, 59, 59, 999);

        // Fetch reservations for the user in this week
        const reservations = await Reservation.find({
            userId,
            startDate: { $gte: startOfWeek, $lte: endOfWeek }
        });

        const dayCounts = {
            Monday: 0,
            Tuesday: 0,
            Wednesday: 0,
            Thursday: 0,
            Friday: 0,
            Saturday: 0,
            Sunday: 0
        };

        reservations.forEach(reservation => {
            const day = reservation.startDate.toLocaleDateString('en-US', { weekday: 'long' });
            if (dayCounts.hasOwnProperty(day)) {
                dayCounts[day]++;
            }
        });

        return res.status(200).json({ data: dayCounts });

    } catch (error) {
        console.error('Error fetching weekly reservations:', error);
        return res.status(500).json({ message: 'Erreur lors de la récupération des réservations de la semaine', error: error.message });
    }
};
exports.getReservationCountByUserForEachParking = async (req, res) => {
    try {
        const { userId } = req.params;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Aggregate reservations by parkingId and count the number of reservations
        const reservationCounts = await Reservation.aggregate([
            { 
                $match: { userId: userObjectId }  // Filter reservations by userId
            },
            {
                $group: {
                    _id: "$parkingId", // Group by parkingId
                    count: { $sum: 1 } // Count the number of reservations for each parkingId
                }
            },
            {
                $lookup: {
                    from: "parkings", // Look up the parking details from the "Parking" collection
                    localField: "_id", // Matching parkingId
                    foreignField: "_id", // Foreign field to match
                    as: "parkingDetails"
                }
            },
            {
                $unwind: "$parkingDetails" // Unwind the parkingDetails array
            },
            {
                $project: {
                    parkingName: "$parkingDetails.nom", // Assuming "name" is the field for the parking name
                    count: 1
                }
            }
        ]);

        // Format the response
        const result = reservationCounts.reduce((acc, curr) => {
            acc[curr.parkingName] = curr.count;
            return acc;
        }, {});

        res.status(200).json({ data: result });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving reservation counts",
            error: error.message
        });
    }
};exports.payAdditionalFee = async (req, res) => {
    try {
        const { reservationId } = req.body; // Get reservation ID from request body

        // Fetch the reservation details from the database
        const reservation = await Reservation.findById(reservationId).populate('parkingId');
        if (!reservation) {
            return res.status(404).json({ error: "Reservation not found" });
        }

        // Validate reservation status and additional fee
        if (reservation.status !== 'overdue' || !reservation.additionalFee) {
            return res.status(400).json({ error: "Reservation is not eligible for additional fee payment" });
        }

        const trackingId = `additional-fee-${Date.now()}`; // Generate a tracking ID

        const response = await fetch("https://developers.flouci.com/api/generate_payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                app_token: process.env.APP_TOKEN,
                app_secret: process.env.PRIVATE_KEY,
                amount: Math.round(reservation.additionalFee * 1000), // Convert to millimes
                accept_card: true,
                session_timeout_secs: 1200,
                success_link: `http://localhost:4000/api/reservations/additional-fee-success/${reservationId}?trackingId=${trackingId}`,
                fail_link: `http://localhost:4000/api/reservations/additional-fee-fail/${reservationId}?trackingId=${trackingId}`,
                developer_tracking_id: trackingId
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("💥 Flouci returned error:", errorBody);
            throw new Error("Failed to create payment on Flouci");
        }

        const data = await response.json();

        if (data.result && data.result.link) {
            return res.json({ paymentLink: data.result.link });
        }

        return res.status(400).json({ error: "Failed to create payment" });

    } catch (error) {
        console.error("💥 Error creating additional fee payment:", error);

        if (error.response) {
            const errorText = await error.response.text();
            console.error("💥 Flouci error response:", errorText);
        }

        return res.status(500).json({
            error: "Additional fee payment creation failed",
            message: error.message
        });
    }
}

exports.additionalFeeSuccess = async (req, res) => {
    const { reservationId } = req.params; // Get from URL params
    const { trackingId, payment_id } = req.query;

    if (!reservationId) {
        return res.status(400).json({ message: "Reservation ID is required" });
    }

    try {
        const reservation = await Reservation.findById(reservationId).populate('parkingId');
        
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Rest of your success logic...
        const hourlyRate = reservation.parkingId?.tarif_horaire;
        const additionalHours = reservation.additionalFee / hourlyRate;
        
        reservation.extendedEndDate = new Date(new Date(reservation.extendedEndDate || reservation.endDate).getTime() + additionalHours * 60 * 60 * 1000);
        reservation.status = 'checked-in';
        reservation.additionalPaymentStatus = 'confirmed';
        reservation.paymentId = payment_id;
        
        await reservation.save();

        const frontendSuccessUrl = `http://localhost:3000/payment-success`;
        return res.redirect(frontendSuccessUrl);

    } catch (error) {
        console.error("Error processing additional fee success:", error);
        return res.status(500).json({
            message: 'Error processing payment',
            error: error.message
        });
    }
};

exports.additionalFeeFail = async (req, res) => {
    const { reservationId } = req.params;
    console.log(`Payment failed for reservation ${reservationId}`);
    
    const frontendErrorUrl = `http://localhost:3000/payment-error`;
    return res.redirect(frontendErrorUrl);
};

exports.getOverdueReservationsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const overdueReservations = await Reservation.find({
            userId,
            status: 'overdue'
        });

        if (overdueReservations.length === 0) {
            return res.status(404).json({ message: 'Aucune réservation en retard trouvée.' });
        }

        res.status(200).json({ data: overdueReservations });
    } catch (error) {
        console.error('Erreur lors de la récupération des réservations en retard :', error);
        res.status(500).json({ message: 'Erreur interne du serveur', error: error.message });
    }
};




