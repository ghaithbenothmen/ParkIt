const ParkingController = require('../../../controllers/parking.controller');
const httpMocks = require('node-mocks-http');
const Parking = require('../../../models/parking.model.js');

// Mock du modèle Parking
jest.mock('../../../models/parking.model', () => {
    return {
        find: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn(),
        countDocuments: jest.fn(),
        prototype: {
            save: jest.fn()
        }
    };
});

describe('Parking Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock console.error pour éviter les sorties dans les tests
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

   
    describe('getAllParkings', () => {
        it('should return all parkings and return 200', async () => {
            const mockParkings = [
                { _id: '1', nom: 'Parking Central' },
                { _id: '2', nom: 'Parking Nord' }
            ];
            Parking.find.mockResolvedValue(mockParkings);

            const req = httpMocks.createRequest();
            const res = httpMocks.createResponse();

            await ParkingController.getAllParkings(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual(mockParkings);
            expect(Parking.find).toHaveBeenCalled();
        });

        it('should return 500 on database error', async () => {
            Parking.find.mockRejectedValue(new Error('DB Error'));

            const req = httpMocks.createRequest();
            const res = httpMocks.createResponse();

            await ParkingController.getAllParkings(req, res);

            expect(res.statusCode).toBe(500);
        });
    });

    describe('getParkingById', () => {
        it('should return a parking by id and return 200', async () => {
            const mockParking = {
                _id: '1',
                nom: 'Parking Central'
            };
            Parking.findById.mockResolvedValue(mockParking);

            const req = httpMocks.createRequest({
                params: { id: '1' }
            });
            const res = httpMocks.createResponse();

            await ParkingController.getParkingById(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual(mockParking);
            expect(Parking.findById).toHaveBeenCalledWith('1');
        });

        it('should return 404 when parking not found', async () => {
            Parking.findById.mockResolvedValue(null);

            const req = httpMocks.createRequest({
                params: { id: '1' }
            });
            const res = httpMocks.createResponse();

            await ParkingController.getParkingById(req, res);

            expect(res.statusCode).toBe(404);
            expect(res._getJSONData()).toEqual({ message: "Parking non trouvé" });
        });

        it('should return 500 on database error', async () => {
            Parking.findById.mockRejectedValue(new Error('DB Error'));

            const req = httpMocks.createRequest({
                params: { id: '1' }
            });
            const res = httpMocks.createResponse();

            await ParkingController.getParkingById(req, res);

            expect(res.statusCode).toBe(500);
        });
    });

    describe('modifierParking', () => {
        it('should update a parking and return 200', async () => {
            const mockUpdatedParking = {
                _id: '1',
                nom: 'Parking Central Modifié'
            };
            Parking.findByIdAndUpdate.mockResolvedValue(mockUpdatedParking);

            const req = httpMocks.createRequest({
                params: { id: '1' },
                body: { nom: 'Parking Central Modifié' }
            });
            const res = httpMocks.createResponse();

            await ParkingController.modifierParking(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({
                message: "Parking modifié avec succès",
                parking: mockUpdatedParking
            });
            expect(Parking.findByIdAndUpdate).toHaveBeenCalledWith(
                '1',
                { nom: 'Parking Central Modifié' },
                { new: true }
            );
        });

        it('should return 404 when parking not found', async () => {
            Parking.findByIdAndUpdate.mockResolvedValue(null);

            const req = httpMocks.createRequest({
                params: { id: '1' },
                body: { nom: 'Parking Central Modifié' }
            });
            const res = httpMocks.createResponse();

            await ParkingController.modifierParking(req, res);

            expect(res.statusCode).toBe(404);
            expect(res._getJSONData()).toEqual({ message: "Parking non trouvé" });
        });

        it('should return 500 on database error', async () => {
            Parking.findByIdAndUpdate.mockRejectedValue(new Error('DB Error'));

            const req = httpMocks.createRequest({
                params: { id: '1' },
                body: { nom: 'Parking Central Modifié' }
            });
            const res = httpMocks.createResponse();

            await ParkingController.modifierParking(req, res);

            expect(res.statusCode).toBe(500);
        });
    });

    describe('supprimerParking', () => {
        it('should delete a parking and return 200', async () => {
            const mockDeletedParking = {
                _id: '1',
                nom: 'Parking Central'
            };
            Parking.findByIdAndDelete.mockResolvedValue(mockDeletedParking);

            const req = httpMocks.createRequest({
                params: { id: '1' }
            });
            const res = httpMocks.createResponse();

            await ParkingController.supprimerParking(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({
                message: "Parking supprimé avec succès"
            });
            expect(Parking.findByIdAndDelete).toHaveBeenCalledWith('1');
        });

        it('should return 404 when parking not found', async () => {
            Parking.findByIdAndDelete.mockResolvedValue(null);

            const req = httpMocks.createRequest({
                params: { id: '1' }
            });
            const res = httpMocks.createResponse();

            await ParkingController.supprimerParking(req, res);

            expect(res.statusCode).toBe(404);
            expect(res._getJSONData()).toEqual({ message: "Parking non trouvé" });
        });

        it('should return 500 on database error', async () => {
            Parking.findByIdAndDelete.mockRejectedValue(new Error('DB Error'));

            const req = httpMocks.createRequest({
                params: { id: '1' }
            });
            const res = httpMocks.createResponse();

            await ParkingController.supprimerParking(req, res);

            expect(res.statusCode).toBe(500);
        });
    });

    describe('totalParc', () => {
        it('should return parking count and return 200', async () => {
            Parking.countDocuments.mockResolvedValue(5);

            const req = httpMocks.createRequest();
            const res = httpMocks.createResponse();

            await ParkingController.totalParc(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({ count: 5 });
            expect(Parking.countDocuments).toHaveBeenCalled();
        });

        it('should return 500 on database error', async () => {
            Parking.countDocuments.mockRejectedValue(new Error('DB Error'));

            const req = httpMocks.createRequest();
            const res = httpMocks.createResponse();

            await ParkingController.totalParc(req, res);

            expect(res.statusCode).toBe(500);
        });
    });
});
