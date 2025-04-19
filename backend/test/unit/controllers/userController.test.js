const UserController = require('../../../controllers/user.controller');
const httpMocks = require('node-mocks-http');

// Mock complet du modèle User
jest.mock('../../../models/user.model', () => {
    const mockUser = {
        save: jest.fn().mockImplementation(function() {
            return Promise.resolve(this);
        })
    };
    
    return {
        find: jest.fn().mockReturnThis(),
        findById: jest.fn().mockReturnThis(),
        findOne: jest.fn().mockReturnThis(),
        findByIdAndUpdate: jest.fn().mockReturnThis(),
        findByIdAndDelete: jest.fn(),
        countDocuments: jest.fn(),
        select: jest.fn().mockReturnThis(),
        create: jest.fn(),
        prototype: mockUser
    };
});

const User = require('../../../models/user.model');

describe('User Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllUsers', () => {
        it('should return 200 and users list', async () => {
            const mockUsers = [{ _id: '1', name: 'Test' }];
            User.find.mockReturnThis();
            User.select.mockResolvedValue(mockUsers);

            const req = httpMocks.createRequest();
            const res = httpMocks.createResponse();

            await UserController.getAllUsers(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual(mockUsers);
            expect(User.find).toHaveBeenCalled();
            expect(User.select).toHaveBeenCalledWith('-password');
        });

        it('should return 500 on database error', async () => {
            User.find.mockReturnThis();
            User.select.mockRejectedValue(new Error('DB Error'));

            const req = httpMocks.createRequest();
            const res = httpMocks.createResponse();

            await UserController.getAllUsers(req, res);

            expect(res.statusCode).toBe(500);
        });
    });

    describe('getUserById', () => {
        it('should return 200 and user when found', async () => {
            const mockUser = { 
                _id: '6802e38822af624032e6af4a',
                name: 'Test',
                email: 'test@test.com'
            };
            User.findById.mockReturnThis();
            User.select.mockResolvedValue(mockUser);

            const req = httpMocks.createRequest({ params: { id: mockUser._id } });
            const res = httpMocks.createResponse();

            await UserController.getUserById(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual(mockUser);
            expect(User.findById).toHaveBeenCalledWith(mockUser._id);
        });

        it('should return 404 when user not found', async () => {
            User.findById.mockReturnThis();
            User.select.mockResolvedValue(null);

            const req = httpMocks.createRequest({ params: { id: '123' } });
            const res = httpMocks.createResponse();

            await UserController.getUserById(req, res);

            expect(res.statusCode).toBe(404);
            expect(res._getJSONData()).toEqual({ message: 'User not found' });
        });

        it('should return 500 on database error', async () => {
            User.findById.mockReturnThis();
            User.select.mockRejectedValue(new Error('DB Error'));

            const req = httpMocks.createRequest({ params: { id: '123' } });
            const res = httpMocks.createResponse();

            await UserController.getUserById(req, res);

            expect(res.statusCode).toBe(500);
        });
    });

    describe('updateUser', () => {
        it('should update user and return 200', async () => {
            const updatedUser = { 
                _id: '123', 
                firstname: 'Updated',
                email: 'updated@test.com'
            };
            User.findByIdAndUpdate.mockReturnThis();
            User.select.mockResolvedValue(updatedUser);

            const req = httpMocks.createRequest({
                params: { id: '123' },
                body: { firstname: 'Updated', email: 'updated@test.com' }
            });
            const res = httpMocks.createResponse();

            await UserController.updateUser(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual(updatedUser);
            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                '123',
                { firstname: 'Updated', email: 'updated@test.com' },
                { new: true, runValidators: true }
            );
        });

        it('should return 404 when user not found', async () => {
            User.findByIdAndUpdate.mockReturnThis();
            User.select.mockResolvedValue(null);

            const req = httpMocks.createRequest({
                params: { id: '123' },
                body: { firstname: 'Updated' }
            });
            const res = httpMocks.createResponse();

            await UserController.updateUser(req, res);

            expect(res.statusCode).toBe(404);
            expect(res._getJSONData()).toEqual({ message: 'User not found' });
        });

        it('should return 500 on database error', async () => {
            User.findByIdAndUpdate.mockReturnThis();
            User.select.mockRejectedValue(new Error('DB Error'));

            const req = httpMocks.createRequest({
                params: { id: '123' },
                body: { firstname: 'Updated' }
            });
            const res = httpMocks.createResponse();

            await UserController.updateUser(req, res);

            expect(res.statusCode).toBe(500);
        });
    });

    describe('deleteUser', () => {
        it('should delete user and return 200', async () => {
            const deletedUser = { _id: '123' };
            User.findByIdAndDelete.mockResolvedValue(deletedUser);

            const req = httpMocks.createRequest({ params: { id: '123' } });
            const res = httpMocks.createResponse();

            await UserController.deleteUser(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({ message: 'User deleted successfully' });
            expect(User.findByIdAndDelete).toHaveBeenCalledWith('123');
        });

        it('should return 404 when user not found', async () => {
            User.findByIdAndDelete.mockResolvedValue(null);

            const req = httpMocks.createRequest({ params: { id: '123' } });
            const res = httpMocks.createResponse();

            await UserController.deleteUser(req, res);

            expect(res.statusCode).toBe(404);
            expect(res._getJSONData()).toEqual({ message: 'User not found' });
        });

        it('should return 500 on database error', async () => {
            User.findByIdAndDelete.mockRejectedValue(new Error('DB Error'));

            const req = httpMocks.createRequest({ params: { id: '123' } });
            const res = httpMocks.createResponse();

            await UserController.deleteUser(req, res);

            expect(res.statusCode).toBe(500);
        });
    });

    describe('totalUser', () => {
        it('should return user count', async () => {
            User.countDocuments.mockResolvedValue(5);

            const req = httpMocks.createRequest();
            const res = httpMocks.createResponse();

            await UserController.totalUser(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({ count: 5 });
            expect(User.countDocuments).toHaveBeenCalled();
        });

        it('should return 500 on database error', async () => {
            User.countDocuments.mockRejectedValue(new Error('DB Error'));

            const req = httpMocks.createRequest();
            const res = httpMocks.createResponse();

            await UserController.totalUser(req, res);

            expect(res.statusCode).toBe(500);
        });
    });

    describe('checkUser', () => {
        it('should return hasPhone status when user exists', async () => {
            const mockUser = { phone: '12345678' };
            User.findOne.mockResolvedValue(mockUser);

            const req = httpMocks.createRequest({ body: { email: 'test@test.com' } });
            const res = httpMocks.createResponse();

            await UserController.checkUser(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({ hasPhone: true });
            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@test.com' });
        });

        it('should return false when user has no phone', async () => {
            const mockUser = { phone: null };
            User.findOne.mockResolvedValue(mockUser);

            const req = httpMocks.createRequest({ body: { email: 'test@test.com' } });
            const res = httpMocks.createResponse();

            await UserController.checkUser(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({ hasPhone: false });
        });

        it('should return 404 when user not found', async () => {
            User.findOne.mockResolvedValue(null);

            const req = httpMocks.createRequest({ body: { email: 'test@test.com' } });
            const res = httpMocks.createResponse();

            await UserController.checkUser(req, res);

            expect(res.statusCode).toBe(404);
            expect(res._getJSONData()).toEqual({ message: 'User not found' });
        });

        it('should return 500 on database error', async () => {
            User.findOne.mockRejectedValue(new Error('DB Error'));

            const req = httpMocks.createRequest({ body: { email: 'test@test.com' } });
            const res = httpMocks.createResponse();

            await UserController.checkUser(req, res);

            expect(res.statusCode).toBe(500);
        });
    });

    describe('updatePhone', () => {
        it('should validate Tunisian phone format', async () => {
            const req = httpMocks.createRequest({
                body: { email: 'test@test.com', phone: '123' }
            });
            const res = httpMocks.createResponse();

            await UserController.updatePhone(req, res);

            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toEqual({ message: 'Invalid Tunisian phone number format.' });
        });

        it('should reject when email is missing', async () => {
            const req = httpMocks.createRequest({
                body: { phone: '20000000' }
            });
            const res = httpMocks.createResponse();

            await UserController.updatePhone(req, res);

            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toEqual({ message: 'Email is required.' });
        });

        it('should reject duplicate phone numbers', async () => {
            User.findOne
                .mockResolvedValueOnce({ email: 'other@test.com' }) // Existing user with same phone
                .mockResolvedValueOnce({ email: 'test@test.com' }); // User to update

            const req = httpMocks.createRequest({
                body: { email: 'test@test.com', phone: '98765432' }
            });
            const res = httpMocks.createResponse();

            await UserController.updatePhone(req, res);

            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toEqual({ message: 'This phone number is already registered.' });
        });

        it('should update phone successfully', async () => {
            const mockUser = {
                email: 'test@test.com',
                phone: '20000000',
                save: jest.fn().mockResolvedValue(true)
            };

            User.findOne
                .mockResolvedValueOnce(null) // No duplicate found
                .mockResolvedValueOnce(mockUser); // User found

            const req = httpMocks.createRequest({
                body: { email: 'test@test.com', phone: '20000000' }
            });
            const res = httpMocks.createResponse();

            await UserController.updatePhone(req, res);

            expect(mockUser.phone).toBe('20000000');
            expect(mockUser.save).toHaveBeenCalled();
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({ message: 'Phone number updated successfully.' });
        });

        it('should return 404 when user not found', async () => {
            User.findOne.mockResolvedValue(null);

            const req = httpMocks.createRequest({
                body: { email: 'test@test.com', phone: '20000000' }
            });
            const res = httpMocks.createResponse();

            await UserController.updatePhone(req, res);

            expect(res.statusCode).toBe(404);
            expect(res._getJSONData()).toEqual({ message: 'User not found.' });
        });

        it('should handle save errors', async () => {
            const mockUser = {
                email: 'test@test.com',
                phone: '20000000',
                save: jest.fn().mockRejectedValue(new Error('Save failed'))
            };
            
            User.findOne
                .mockResolvedValueOnce(null) // No duplicate found
                .mockResolvedValueOnce(mockUser); // User found

            const req = httpMocks.createRequest({
                body: { email: 'test@test.com', phone: '20000000' }
            });
            const res = httpMocks.createResponse();

            await UserController.updatePhone(req, res);

            expect(res.statusCode).toBe(500);
            expect(res._getJSONData()).toEqual({ message: 'Server error. Please try again later.' });
        });
    });
});