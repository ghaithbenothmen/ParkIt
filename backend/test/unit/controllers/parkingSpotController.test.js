const ParkingSpotController = require('../../../controllers/parkingSpot.controller');
const httpMocks = require('node-mocks-http');
const ParkingSpot = require('../../../models/parkingSpot.model');

// Mock du modèle ParkingSpot
jest.mock('../../../models/parkingSpot.model');

describe('ParkingSpot Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createParkingSpot', () => {
    it('should create a new parking spot successfully', async () => {
      const mockParkingSpot = {
        _id: 'spot123',
        parkingId: 'parking123',
        numero: 'A1',
        disponibilite: true,
        save: jest.fn().mockResolvedValue(true)
      };

      ParkingSpot.findOne.mockResolvedValue(null);
      ParkingSpot.prototype.save.mockResolvedValue(mockParkingSpot);

      const req = httpMocks.createRequest({
        body: {
          parkingId: 'parking123',
          numero: 'A1',
          disponibilite: true
        }
      });
      const res = httpMocks.createResponse();

      await ParkingSpotController.createParkingSpot(req, res);

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData()).toEqual({
        message: 'Place de parking créée avec succès',
        data: mockParkingSpot
      });
    });

    it('should reject duplicate parking spot', async () => {
      ParkingSpot.findOne.mockResolvedValue({
        _id: 'existing123',
        parkingId: 'parking123',
        numero: 'A1'
      });

      const req = httpMocks.createRequest({
        body: {
          parkingId: 'parking123',
          numero: 'A1',
          disponibilite: true
        }
      });
      const res = httpMocks.createResponse();

      await ParkingSpotController.createParkingSpot(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        message: 'Cette place de parking existe déjà.'
      });
    });
  });

  describe('getAllParkingSpots', () => {
    it('should return all parking spots', async () => {
      const mockParkingSpots = [
        { _id: 'spot1', numero: 'A1', disponibilite: true },
        { _id: 'spot2', numero: 'A2', disponibilite: false }
      ];

      ParkingSpot.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockParkingSpots)
      });

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await ParkingSpotController.getAllParkingSpots(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        data: mockParkingSpots
      });
    });

    it('should handle empty parking spots list', async () => {
      ParkingSpot.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      });

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await ParkingSpotController.getAllParkingSpots(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        data: []
      });
    });
  });

  describe('getParkingSpotById', () => {
    it('should return parking spot by ID', async () => {
      const mockParkingSpot = {
        _id: 'spot123',
        numero: 'A1',
        disponibilite: true
      };

      ParkingSpot.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockParkingSpot)
      });

      const req = httpMocks.createRequest({
        params: { id: 'spot123' }
      });
      const res = httpMocks.createResponse();

      await ParkingSpotController.getParkingSpotById(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        data: mockParkingSpot
      });
    });

    it('should handle parking spot not found', async () => {
      ParkingSpot.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      const req = httpMocks.createRequest({
        params: { id: 'invalid123' }
      });
      const res = httpMocks.createResponse();

      await ParkingSpotController.getParkingSpotById(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({
        message: 'Place de parking non trouvée.'
      });
    });
  });

  describe('updateParkingSpot', () => {
    it('should update parking spot successfully', async () => {
      const mockUpdatedSpot = {
        _id: 'spot123',
        numero: 'A1',
        disponibilite: false
      };

      ParkingSpot.findByIdAndUpdate.mockResolvedValue(mockUpdatedSpot);

      const req = httpMocks.createRequest({
        params: { id: 'spot123' },
        body: {
          numero: 'A1',
          disponibilite: false
        }
      });
      const res = httpMocks.createResponse();

      await ParkingSpotController.updateParkingSpot(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: 'Place de parking mise à jour avec succès',
        data: mockUpdatedSpot
      });
    });

    it('should handle parking spot not found during update', async () => {
      ParkingSpot.findByIdAndUpdate.mockResolvedValue(null);

      const req = httpMocks.createRequest({
        params: { id: 'invalid123' },
        body: {
          numero: 'A1',
          disponibilite: false
        }
      });
      const res = httpMocks.createResponse();

      await ParkingSpotController.updateParkingSpot(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({
        message: 'Place de parking non trouvée.'
      });
    });
  });

  describe('deleteParkingSpot', () => {
    it('should delete parking spot successfully', async () => {
      ParkingSpot.findByIdAndDelete.mockResolvedValue({ _id: 'spot123' });

      const req = httpMocks.createRequest({
        params: { id: 'spot123' }
      });
      const res = httpMocks.createResponse();

      await ParkingSpotController.deleteParkingSpot(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: 'Place de parking supprimée avec succès'
      });
    });

    it('should handle parking spot not found during deletion', async () => {
      ParkingSpot.findByIdAndDelete.mockResolvedValue(null);

      const req = httpMocks.createRequest({
        params: { id: 'invalid123' }
      });
      const res = httpMocks.createResponse();

      await ParkingSpotController.deleteParkingSpot(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({
        message: 'Place de parking non trouvée.'
      });
    });
  });

  describe('getAllParkingSpotsByParking', () => {
    it('should return parking spots for a specific parking', async () => {
      const mockParkingSpots = [
        { _id: 'spot1', parkingId: 'parking123', numero: 'A1' },
        { _id: 'spot2', parkingId: 'parking123', numero: 'A2' }
      ];

      ParkingSpot.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockParkingSpots)
      });

      const req = httpMocks.createRequest({
        params: { parkingId: 'parking123' }
      });
      const res = httpMocks.createResponse();

      await ParkingSpotController.getAllParkingSpotsByParking(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        data: mockParkingSpots
      });
    });

    it('should handle no parking spots found for parking', async () => {
      ParkingSpot.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      });

      const req = httpMocks.createRequest({
        params: { parkingId: 'parking123' }
      });
      const res = httpMocks.createResponse();

      await ParkingSpotController.getAllParkingSpotsByParking(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({
        message: 'Aucune place de parking trouvée pour ce parking.'
      });
    });
  });
});