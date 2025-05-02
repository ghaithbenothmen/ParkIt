const VehiculeController = require('../../../controllers/vehicule.controller');
const httpMocks = require('node-mocks-http');
const User = require('../../../models/user.model');
const Vehicule = require('../../../models/vehicule.model');

// Mock des modèles
jest.mock('../../../models/user.model.js');
jest.mock('../../../models/vehicule.model.js');

describe('Vehicule Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    

    

    describe('getAllVehicules', () => {
        it('should return all vehicles and return 200', async () => {
            const mockVehicules = [
                { _id: '1', marque: 'Toyota' },
                { _id: '2', marque: 'Honda' }
            ];

            Vehicule.find.mockResolvedValue(mockVehicules);

            const req = httpMocks.createRequest();
            const res = httpMocks.createResponse();

            await VehiculeController.getAllVehicules(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({ vehicules: mockVehicules });
            expect(Vehicule.find).toHaveBeenCalledWith({});
        });

        it('should return 404 if no vehicles found', async () => {
            Vehicule.find.mockResolvedValue([]);

            const req = httpMocks.createRequest();
            const res = httpMocks.createResponse();

            await VehiculeController.getAllVehicules(req, res);

            expect(res.statusCode).toBe(404);
            expect(res._getJSONData()).toEqual({ message: "Aucun véhicule trouvé" });
        });

        it('should return 500 on database error', async () => {
            Vehicule.find.mockRejectedValue(new Error('DB Error'));

            const req = httpMocks.createRequest();
            const res = httpMocks.createResponse();

            await VehiculeController.getAllVehicules(req, res);

            expect(res.statusCode).toBe(500);
        });
    });

    
    describe('deleteVehicule', () => {
        it('should delete vehicle and return 200', async () => {
            const mockVehicule = {
                _id: 'vehiculeId123',
                user: 'userId123'
            };

            Vehicule.findById.mockResolvedValue(mockVehicule);
            Vehicule.findByIdAndDelete.mockResolvedValue(mockVehicule);
            User.findByIdAndUpdate.mockResolvedValue({});

            const req = httpMocks.createRequest({
                params: { id: 'vehiculeId123' }
            });
            const res = httpMocks.createResponse();

            await VehiculeController.deleteVehicule(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({ message: "Véhicule supprimé avec succès" });
            expect(Vehicule.findById).toHaveBeenCalledWith('vehiculeId123');
            expect(Vehicule.findByIdAndDelete).toHaveBeenCalledWith('vehiculeId123');
            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                'userId123',
                { $pull: { vehicules: 'vehiculeId123' } }
            );
        });

        it('should return 404 if vehicle not found', async () => {
            Vehicule.findById.mockResolvedValue(null);

            const req = httpMocks.createRequest({
                params: { id: 'vehiculeId123' }
            });
            const res = httpMocks.createResponse();

            await VehiculeController.deleteVehicule(req, res);

            expect(res.statusCode).toBe(404);
            expect(res._getJSONData()).toEqual({ message: "Véhicule non trouvé" });
        });

        it('should return 500 on database error', async () => {
            Vehicule.findById.mockRejectedValue(new Error('DB Error'));

            const req = httpMocks.createRequest({
                params: { id: 'vehiculeId123' }
            });
            const res = httpMocks.createResponse();

            await VehiculeController.deleteVehicule(req, res);

            expect(res.statusCode).toBe(500);
        });
    });
});