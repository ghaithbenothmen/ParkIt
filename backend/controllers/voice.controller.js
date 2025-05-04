const Parking = require("../models/parking.model");
const ParkingSpot = require("../models/parkingSpot.model");
const Reservation = require("../models/reservation.model");
const Vehicule = require("../models/vehicule.model");
const User = require("../models/user.model");
const parkingController = require("../controllers/parking.controller");
const reservationController = require("../controllers/reservation.controller");
const vehiculeController = require("../controllers/vehicule.controller");

exports.Parse = async (req, res) => {
    const { message} = req.body;
    const userId = req.user.id;
    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    const lower = message.toLowerCase();;

    const match = lower.match(
        /(?:book|reserve).*parking\s+(.+?)\s+on\s+((?:\d{4}-\d{2}-\d{2})|(?:[a-z]+ \d{1,2}, \d{4}))\s+at\s+(\d{2}:\d{2})\s+for\s+(\d+)\s+hours/
      );
          if (!match) {
        return res.json({ reply: "Please provide details in the format: reserve parking [name] on [YYYY-MM-DD] at [HH:MM] for [X] hours." });
    }

    const [, parkingName, date, time, durationHours] = match;
    const startDate = new Date(`${date}T${time}`);
    const endDate = new Date(startDate.getTime() + Number(durationHours) * 60 * 60 * 1000);

    try {
        const parking = await Parking.findOne({ nom: { $regex: new RegExp(parkingName, "i") } });
        if (!parking) return res.json({ reply: "Parking not found." });
        const mockReq = { body: { parkingId: parking._id, startDate, endDate } };
        let availableSpots;
        const mockRes = {
            json: ({ spots }) => { availableSpots = spots.filter(s => s.disponibilite); }
        };
        await parkingController.available(mockReq, mockRes);
        if (!availableSpots || !availableSpots.length) {
            return res.json({ reply: "No available spots for this time." });
        }

        const chosenSpot = availableSpots[0];
        const mockReqv = {   params: { userId }    };
        let userVehicules;
        const mockResv = {
            status: (statusCode) => {
                mockResv.statusCode = statusCode;  // Store the status code if needed
                return mockResv;  // Return the mock res itself for chaining
            },
            json: ({ vehicules }) => {
                userVehicules = vehicules;
            }
        };
        
        await vehiculeController.getAllVehiculesByUser(mockReqv, mockResv);
        
        if (!userVehicules.length) return res.json({ reply: "No vehicles found for this user." });
        const chosenVehicule = userVehicules[0];
        
        const totalPrice = durationHours * 2;

        // ⬇ Call the createReservation controller
        req.body = {
            userId,
            parkingId: parking._id,
            parkingSpot: chosenSpot._id,
            vehicule: chosenVehicule._id,
            startDate,
            endDate,
            totalPrice
        };

        // Reuse the controller
        return reservationController.createReservation(req, res);

    } catch (error) {
        console.error("Error in voice handler:", error);
        res.status(500).json({ reply: "Internal server error." });
    }
};