const Parking = require("../models/parking.model");
const ParkingSpot = require("../models/parkingSpot.model");
const Reservation = require("../models/reservation.model");
const Vehicule = require("../models/vehicule.model");
const User = require("../models/user.model");
const parkingController = require("../controllers/parking.controller");
const reservationController = require("../controllers/reservation.controller");
const vehiculeController = require("../controllers/vehicule.controller");

const express = require('express');
const { getAccessToken } = require('../utils/googleAuth.js');

exports.dialogflow = async (req, res) => {
    try {
        // Get the access token
        const accessToken = await getAccessToken();
        console.log('Access token retrieved:', accessToken);

        // Send request to Dialogflow with the access token
        const dialogflowRes = await fetch(`https://dialogflow.googleapis.com/v2/projects/parkingassistantbot-exkj/agent/sessions/${req.body.session}:detectIntent`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                queryInput: {
                    text: {
                        text: req.body.query,
                        languageCode: 'en-US'
                    }
                }
            }),
        });

        // Check if the response is OK
        if (!dialogflowRes.ok) {
            const errorText = await dialogflowRes.text();
            console.error('Dialogflow API error:', errorText);
            return res.status(500).send('Failed to reach Dialogflow');
        }

        // Process the successful response
        const json = await dialogflowRes.json();
  console.log('Dialogflow response:', json);

  const fulfillmentText = json.queryResult?.fulfillmentText || '';
  const redirect = json.queryResult?.webhookPayload?.redirect || null;

  res.json({
    queryResult: {
      fulfillmentText,
      redirect,
    },
  });

    } catch (err) {
        console.error('Error in voiceAsync:', err);
        res.status(500).send('Failed to reach Dialogflow');
    }
};

exports.booking = async (req, res) => {
    const { lot, start, end ,userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationHours = (endDate - startDate) / (1000 * 60 * 60);

    try {
        const parking = await Parking.findOne({ nom: lot });
        if (!parking) return res.json({ reply: "Parking not found." });

        const mockReq = { body: { parkingId: parking._id, startDate, endDate } };
        let availableSpots;
        const mockRes = {
            json: ({ spots }) => {
                availableSpots = spots.filter(s => s.disponibilite);
            }
        };

        await parkingController.available(mockReq, mockRes);
        if (!availableSpots || !availableSpots.length) {
            return res.json({ reply: "No available spots for this time." });
        }

        const chosenSpot = availableSpots[0];
        const mockReqv = { params: { userId } };
        let userVehicules;
        const mockResv = {
            status: () => mockResv,
            json: ({ vehicules }) => {
                userVehicules = vehicules;
            }
        };

        await vehiculeController.getAllVehiculesByUser(mockReqv, mockResv);
        if (!userVehicules || !userVehicules.length) {
            return res.json({ reply: "No vehicles found for this user." });
        }

        const chosenVehicule = userVehicules[0];
        const totalPrice = durationHours * 2;

        req.body = {
            userId,
            parkingId: parking._id,
            parkingSpot: chosenSpot._id,
            vehicule: chosenVehicule._id,
            startDate,
            endDate,
            totalPrice
        };

        return reservationController.createReservation(req, res);

    } catch (error) {
        console.error("Error in voice handler:", error);
        return res.status(500).json({ reply: "Internal server error." });
    }
};
