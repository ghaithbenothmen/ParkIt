const VehiculeController = require('../../../controllers/vehicule.controller');
const httpMocks = require('node-mocks-http');
const User = require('../../../models/user.model');
const Vehicule = require('../../../models/vehicule.model');

// Mock des modèles
jest.mock('../../../models/user.model');
jest.mock('../../../models/vehicule.model');

describe('Vehicule Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    describe('ajouterVehicule', () => {
        it('should add a new vehicle and return 201', async () => {
            const mockUser = {
                _id: 'userId123',
                vehicules: []
            };
            const mockVehicule = {
                _id: 'vehiculeId123',
                marque: 'Toyota',
                modele: 'Corolla',
                couleur: 'Rouge',
                immatriculation: 'AB-123-CD',
                user: 'userId123'
            };

            User.findById.mockResolvedValue(mockUser);
            Vehicule.prototype.save.mockResolvedValue(mockVehicule);
            User.findByIdAndUpdate.mockResolvedValue(mockUser);

            const req = httpMocks.createRequest({
                body: {
                    userId: 'userId123',
                    marque: 'Toyota',
                    modele: 'Corolla',
                    couleur: 'Rouge',
                    immatriculation: 'AB-123-CD'
                }
            });
            const res = httpMocks.createResponse();

            await VehiculeController.ajouterVehicule(req, res);

            expect(res.statusCode).toBe(201);
            expect(res._getJSONData()).toEqual({
                message: "Véhicule ajouté avec succès",
                vehicule: mockVehicule
            });
            expect(User.findById).toHaveBeenCalledWith('userId123');
            expect(Vehicule.prototype.save).toHaveBeenCalled();
            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                'userId123',
                { $push: { vehicules: 'vehiculeId123' } }
            );
        });

        it('should return 404 if user not found', async () => {
            User.findById.mockResolvedValue(null);

            const req = httpMocks.createRequest({
                body: {
                    userId: 'userId123',
                    marque: 'Toyota'
                }
            });
            const res = httpMocks.createResponse();

            await VehiculeController.ajouterVehicule(req, res);

            expect(res.statusCode).toBe(404);
            expect(res._getJSONData()).toEqual({ message: "Utilisateur non trouvé" });
        });

        it('should return 500 on database error', async () => {
            User.findById.mockRejectedValue(new Error('DB Error'));

            const req = httpMocks.createRequest({
                body: {
                    userId: 'userId123',
                    marque: 'Toyota'
                }
            });
            const res = httpMocks.createResponse();

            await VehiculeController.ajouterVehicule(req, res);

            expect(res.statusCode).toBe(500);
        });
    });

    describe('getAllVehiculesByUser', () => {
        it('should return vehicles for user and return 200', async () => {
            const mockVehicules = [
                { _id: '1', marque: 'Toyota', user: 'userId123' },
                { _id: '2', marque: 'Honda', user: 'userId123' }
            ];

            Vehicule.find.mockResolvedValue(mockVehicules);

            const req = httpMocks.createRequest({
                params: { userId: 'userId123' }
            });
            const res = httpMocks.createResponse();

            await VehiculeController.getAllVehiculesByUser(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({ vehicules: mockVehicules });
            expect(Vehicule.find).toHaveBeenCalledWith({ user: 'userId123' });
        });

        it('should return 404 if no vehicles found', async () => {
            Vehicule.find.mockResolvedValue([]);

            const req = httpMocks.createRequest({
                params: { userId: 'userId123' }
            });
            const res = httpMocks.createResponse();

            await VehiculeController.getAllVehiculesByUser(req, res);

            expect(res.statusCode).toBe(404);
            expect(res._getJSONData()).toEqual({ message: "Aucun véhicule trouvé pour cet utilisateur" });
        });

        it('should return 500 on database error', async () => {
            Vehicule.find.mockRejectedValue(new Error('DB Error'));

            const req = httpMocks.createRequest({
                params: { userId: 'userId123' }
            });
            const res = httpMocks.createResponse();

            await VehiculeController.getAllVehiculesByUser(req, res);

            expect(res.statusCode).toBe(500);
        });
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

    describe('modifierVehicule', () => {
        it('should update vehicle and return 200', async () => {
            const mockVehicule = {
                _id: 'vehiculeId123',
                marque: 'Toyota',
                save: jest.fn().mockResolvedValue(true)
            };
            const updates = { marque: 'Toyota Modifié' };

            Vehicule.findById.mockResolvedValue(mockVehicule);
            Vehicule.findByIdAndUpdate.mockResolvedValue({
                ...mockVehicule,
                ...updates
            });

            const req = httpMocks.createRequest({
                params: { id: 'vehiculeId123' },
                body: updates
            });
            const res = httpMocks.createResponse();

            await VehiculeController.modifierVehicule(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({
                message: "Véhicule modifié avec succès",
                vehicule: { ...mockVehicule, ...updates }
            });
            expect(Vehicule.findById).toHaveBeenCalledWith('vehiculeId123');
        });

        it('should return 404 if vehicle not found', async () => {
            Vehicule.findById.mockResolvedValue(null);

            const req = httpMocks.createRequest({
                params: { id: 'vehiculeId123' },
                body: { marque: 'Toyota Modifié' }
            });
            const res = httpMocks.createResponse();

            await VehiculeController.modifierVehicule(req, res);

            expect(res.statusCode).toBe(404);
            expect(res._getJSONData()).toEqual({ message: "Véhicule non trouvé" });
        });

        it('should return 500 on database error', async () => {
            Vehicule.findById.mockRejectedValue(new Error('DB Error'));

            const req = httpMocks.createRequest({
                params: { id: 'vehiculeId123' },
                body: { marque: 'Toyota Modifié' }
            });
            const res = httpMocks.createResponse();

            await VehiculeController.modifierVehicule(req, res);

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