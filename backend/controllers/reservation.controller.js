const Reservation = require('../models/reservation.model.js');
const User = require('../models/user.model.js');

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
                amount: reservation.totalPrice,
                accept_card: true,
                session_timeout_secs: 1200,
                success_link: `http://localhost:4000/api/reservations/success?trackingId=${trackingId}&reservationId=${id}`,
                fail_link: `http://localhost:4000/api/reservations/fail?trackingId=${trackingId}&reservationId=${reservation._id}`,
                developer_tracking_id: trackingId
            }),
        });
    
        if (!response.ok) {
            throw new Error("Failed to create payment on Flouci");
        }
    
        const data = await response.json();
    
        if (data.result && data.result.link) {
            return res.json({ paymentLink: data.result.link });
        }
    
        // If the response does not contain a valid payment link
        return res.status(400).json({ error: "Failed to create payment" });
    
    } catch (error) {
        console.error("Error creating payment:", error);
        return res.status(500).json({ error: "Payment creation failed", message: error.message });
    }
}
exports.paymentSuccess = async (req, res) => {
    const { trackingId, reservationId, payment_id } = req.query;
    
    if (!trackingId || !reservationId) return res.send("Invalid request");

    // Update the reservation payment status to "confirmed"
    await Reservation.findByIdAndUpdate(reservationId, { status: 'confirmed' });
        const frontendSuccessrUrl = `http://localhost:3000/payment-success`;
        return res.redirect(frontendSuccessrUrl);
}
exports.paymentFail = async (req, res) => {
        const frontendErrorUrl = `http://localhost:3000/payment-error`;
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
        const { startDate, endDate, status, totalPrice,userId } = req.body;

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
exports.getReservationSummary = async(req, res)=>{
    const reservations = await Reservation.find({
        startDate:{
            $gte: new Date(new Date().setMonth(-1)),
            $lte: new Date(new Date().setMonth(12))
        },
    });   
    const numbers = [0,0,0,0,0,0,0,0,0,0,0,0];
    reservations.forEach(myFunction);
    function myFunction(reservation){
        price = reservation.totalPrice;
        index = reservation.startDate.getMonth();
        numbers[index]+=price;
    }
    return res.status(200).json({ count: numbers });


};
exports.getReservationStatistics = async(req, res)=>{
    const reservations = await Reservation.find();
    var confirmed=0;
    var pending=0;
    var canceled=0;
    const total = reservations.length;
    reservations.forEach(myFunction);
    function myFunction(reservation){
        switch(reservation.status){
            case "confirmed":
                confirmed+=1;
                break;
            case "pending":
                pending+=1;
                break;
            case "canceled":
                canceled+=1;
                break;
        }
    }
    const stat = [Math.floor(confirmed*100/total),Math.floor(canceled*100/total),Math.floor(pending*100/total)];
    return res.status(200).json({count:stat});
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
    return res.status(200).json({topUsers:topUsers});
  } catch (error) {
    console.error('Error fetching top users:', error);
    res.status(500).json({ error: 'Internal server error' });
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
    getReservationSummary: exports.getReservationSummary,
    getReservationStatistics: exports.getReservationStatistics,
    getTopUsers: exports.getTopUsers
};