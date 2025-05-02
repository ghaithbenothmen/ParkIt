const ReservationController = require('../../../controllers/reservation.controller');
const httpMocks = require('node-mocks-http');
const Reservation = require('../../../models/reservation.model.js');
const ParkingSpot = require('../../../models/parkingSpot.model');
const User = require('../../../models/user.model.js');

// Mock des modèles
jest.mock('../../../models/reservation.model.js');
jest.mock('../../../models/parkingSpot.model.js');
jest.mock('../../../models/user.model.js');
jest.mock('node-fetch', () => jest.fn());

describe('Reservation Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

 

  describe('reservationPayment', () => {
    it('should generate payment link successfully', async () => {
      const mockReservation = {
        _id: 'res123',
        totalPrice: 10
      };

      Reservation.findById.mockResolvedValue(mockReservation);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          result: { link: 'https://payment.link' }
        })
      });

      const req = httpMocks.createRequest({
        params: { id: 'res123' }
      });
      const res = httpMocks.createResponse();

      await ReservationController.reservationPayment(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        paymentLink: 'https://payment.link'
      });
    });

    it('should handle reservation not found', async () => {
      Reservation.findById.mockResolvedValue(null);

      const req = httpMocks.createRequest({
        params: { id: 'invalid123' }
      });
      const res = httpMocks.createResponse();

      await ReservationController.reservationPayment(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({
        error: "Reservation not found"
      });
    });
  });

  describe('paymentSuccess', () => {
    it('should update reservation and parking spot on success', async () => {
      const mockReservation = {
        _id: 'res123',
        parkingSpot: 'spot123',
        save: jest.fn().mockResolvedValue(true)
      };

      const mockParkingSpot = {
        _id: 'spot123',
        disponibilite: true,
        save: jest.fn().mockResolvedValue(true)
      };

      Reservation.findByIdAndUpdate.mockResolvedValue(mockReservation);
      ParkingSpot.findById.mockResolvedValue(mockParkingSpot);

      const req = httpMocks.createRequest({
        query: {
          trackingId: 'track123',
          reservationId: 'res123'
        }
      });
      const res = httpMocks.createResponse();

      await ReservationController.paymentSuccess(req, res);

      expect(res.statusCode).toBe(302);
      expect(res._getRedirectUrl()).toBe('http://localhost:3000/payment-success');
      expect(mockParkingSpot.disponibilite).toBe(false);
    });
  });

  describe('getAllReservations', () => {
    it('should return all reservations', async () => {
      const mockReservations = [
        { _id: 'res1', status: 'confirmed' },
        { _id: 'res2', status: 'pending' }
      ];

      Reservation.find.mockResolvedValue(mockReservations);
      Reservation.updateMany.mockResolvedValue({ modifiedCount: 0 });

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await ReservationController.getAllReservations(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        data: mockReservations
      });
    });
  });

  describe('getReservationById', () => {
    it('should return reservation by ID', async () => {
      const mockReservation = {
        _id: 'res123',
        userId: 'user123'
      };

      Reservation.findById.mockResolvedValue(mockReservation);

      const req = httpMocks.createRequest({
        params: { id: 'res123' }
      });
      const res = httpMocks.createResponse();

      await ReservationController.getReservationById(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        data: mockReservation
      });
    });

    it('should handle reservation not found', async () => {
      Reservation.findById.mockResolvedValue(null);

      const req = httpMocks.createRequest({
        params: { id: 'invalid123' }
      });
      const res = httpMocks.createResponse();

      await ReservationController.getReservationById(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({
        message: 'Réservation non trouvée.'
      });
    });
  });

  describe('updateReservation', () => {
    it('should update reservation successfully', async () => {
      const mockReservation = {
        _id: 'res123',
        startDate: new Date(),
        endDate: new Date(Date.now() + 3600000),
        save: jest.fn().mockResolvedValue(true)
      };

      Reservation.findById.mockResolvedValue(mockReservation);

      const req = httpMocks.createRequest({
        params: { id: 'res123' },
        body: {
          startDate: new Date(Date.now() + 7200000),
          endDate: new Date(Date.now() + 10800000)
        }
      });
      const res = httpMocks.createResponse();

      await ReservationController.updateReservation(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toHaveProperty('message', 'Réservation mise à jour avec succès');
    });
  });

  describe('deleteReservation', () => {
    it('should delete reservation successfully', async () => {
      Reservation.findByIdAndDelete.mockResolvedValue({ _id: 'res123' });

      const req = httpMocks.createRequest({
        params: { id: 'res123' }
      });
      const res = httpMocks.createResponse();

      await ReservationController.deleteReservation(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: 'Réservation supprimée avec succès'
      });
    });
  });

  describe('getAllReservationsByUser', () => {
    it('should return user reservations', async () => {
      const mockReservations = [
        { _id: 'res1', userId: 'user123' },
        { _id: 'res2', userId: 'user123' }
      ];

      Reservation.find.mockResolvedValue(mockReservations);

      const req = httpMocks.createRequest({
        params: { userId: 'user123' }
      });
      const res = httpMocks.createResponse();

      await ReservationController.getAllReservationsByUser(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        data: mockReservations
      });
    });
  });

  describe('getReservationCount', () => {
    it('should return reservation count', async () => {
      Reservation.countDocuments.mockResolvedValue(5);

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await ReservationController.getReservationCount(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({ count: 5 });
    });
  });

  describe('getReservationStatistics', () => {
    it('should return reservation statistics', async () => {
      const mockReservations = [
        { status: 'confirmed' },
        { status: 'confirmed' },
        { status: 'pending' },
        { status: 'over' }
      ];

      Reservation.find.mockResolvedValue(mockReservations);

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await ReservationController.getReservationStatistics(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        count: [50, 25, 25] // [confirmed%, over%, pending%]
      });
    });
  });

  describe('getTopUsers', () => {
    it('should return top users by reservations', async () => {
      Reservation.aggregate.mockResolvedValue([
        { userId: 'user1', totalReservations: 5, name: 'User One', email: 'user1@test.com' }
      ]);

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await ReservationController.getTopUsers(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toHaveProperty('topUsers');
    });
  });

  describe('getTopParkings', () => {
    it('should return top parkings by reservations', async () => {
      Reservation.aggregate.mockResolvedValue([
        { parkingId: 'parking1', totalReservations: 10, name: 'Parking One', adresse: '123 Street' }
      ]);

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await ReservationController.getTopParkings(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toHaveProperty('topParkings');
    });
  });
});