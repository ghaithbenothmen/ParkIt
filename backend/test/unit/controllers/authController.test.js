const AuthController = require('../../../controllers/auth.controller');
const httpMocks = require('node-mocks-http');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const axios = require('axios');

// Mock des dépendances
jest.mock('../../../models/user.model');
jest.mock('argon2');
jest.mock('jsonwebtoken');
jest.mock('speakeasy');
jest.mock('qrcode');
jest.mock('axios');
jest.mock('nodemailer');
jest.mock('multer');
jest.mock('cloudinary');
jest.mock('../../../utils/googleClients.js');

const User = require('../../../models/user.model');
const { oauth2Client } = require('../../../utils/googleClients.js');

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@test.com',
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);
      argon2.hash.mockResolvedValue('hashedPassword');
      jwt.sign.mockReturnValue('activationToken');
      QRCode.toDataURL.mockResolvedValue('qrCodeUrl');

      const req = httpMocks.createRequest({
        body: {
          firstname: 'Test',
          lastname: 'User',
          phone: '20000000',
          email: 'test@test.com',
          password: 'Password123!',
          enable2FA: true
        }
      });
      const res = httpMocks.createResponse();

      await AuthController.register(req, res);

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData()).toEqual({
        message: "User registered. Check your email to activate your account.",
        qrCodeUrl: 'qrCodeUrl',
        twoFactorSecret: expect.any(String)
      });
    });

    it('should reject registration with existing email', async () => {
      User.findOne.mockResolvedValue({ email: 'test@test.com' });

      const req = httpMocks.createRequest({
        body: {
          email: 'test@test.com',
          password: 'Password123!'
        }
      });
      const res = httpMocks.createResponse();

      await AuthController.register(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({ message: "Email already exists" });
    });

    it('should reject weak passwords', async () => {
      const req = httpMocks.createRequest({
        body: {
          email: 'test@test.com',
          password: 'weak'
        }
      });
      const res = httpMocks.createResponse();

      await AuthController.register(req, res);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@test.com',
        password: 'hashedPassword',
        isActive: true,
        twoFactorEnabled: false,
        authUser: 'local'
      };
      
      User.findOne.mockResolvedValue(mockUser);
      argon2.verify.mockResolvedValue(true);
      jwt.sign.mockReturnValue('testToken');

      const req = httpMocks.createRequest({
        body: {
          email: 'test@test.com',
          password: 'Password123!'
        }
      });
      const res = httpMocks.createResponse();

      await AuthController.login(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toHaveProperty('token', 'testToken');
    });

    it('should require 2FA when enabled', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@test.com',
        password: 'hashedPassword',
        isActive: true,
        twoFactorEnabled: true,
        authUser: 'local'
      };
      
      User.findOne.mockResolvedValue(mockUser);
      argon2.verify.mockResolvedValue(true);

      const req = httpMocks.createRequest({
        body: {
          email: 'test@test.com',
          password: 'Password123!'
        }
      });
      const res = httpMocks.createResponse();

      await AuthController.login(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({ 
        message: "2FA required", 
        user: mockUser 
      });
    });

    it('should reject inactive accounts', async () => {
      const mockUser = {
        email: 'test@test.com',
        password: 'hashedPassword',
        isActive: false
      };
      
      User.findOne.mockResolvedValue(mockUser);
      argon2.verify.mockResolvedValue(true);

      const req = httpMocks.createRequest({
        body: {
          email: 'test@test.com',
          password: 'Password123!'
        }
      });
      const res = httpMocks.createResponse();

      await AuthController.login(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({ 
        message: "Account is not activated. Please check your email." 
      });
    });
  });

  describe('verifyActivation', () => {
    it('should activate user account', async () => {
      const mockUser = {
        _id: '123',
        isActive: false,
        save: jest.fn().mockResolvedValue(true)
      };
      
      jwt.verify.mockReturnValue({ id: '123' });
      User.findById.mockResolvedValue(mockUser);

      const req = httpMocks.createRequest({
        params: { token: 'validToken' }
      });
      const res = httpMocks.createResponse();

      await AuthController.verifyActivation(req, res);

      expect(mockUser.isActive).toBe(true);
      expect(res.statusCode).toBe(302);
      expect(res._getRedirectUrl()).toBe('http://localhost:3000/activation-success');
    });

    it('should handle invalid activation token', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const req = httpMocks.createRequest({
        params: { token: 'invalidToken' }
      });
      const res = httpMocks.createResponse();

      await AuthController.verifyActivation(req, res);

      expect(res.statusCode).toBe(302);
      expect(res._getRedirectUrl()).toBe('http://localhost:3000/activation-error');
    });
  });

  describe('googleAuth', () => {
    it('should authenticate with Google successfully', async () => {
      const mockTokens = { access_token: 'googleAccessToken' };
      const mockUserData = {
        email: 'test@test.com',
        name: 'Test User',
        picture: 'profile.jpg'
      };
      
      oauth2Client.getToken.mockResolvedValue({ tokens: mockTokens });
      axios.get.mockResolvedValue({ data: mockUserData });
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({ _id: '123', ...mockUserData });
      jwt.sign.mockReturnValue('jwtToken');

      const req = httpMocks.createRequest({
        query: { code: 'googleAuthCode' }
      });
      const res = httpMocks.createResponse();

      await AuthController.googleAuth(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: "Google authentication successful",
        token: 'jwtToken',
        user: expect.any(Object)
      });
    });
  });

  describe('password reset', () => {
    it('should send password reset email', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@test.com',
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('resetToken');

      const req = httpMocks.createRequest({
        body: { email: 'test@test.com' }
      });
      const res = httpMocks.createResponse();

      await AuthController.requestPasswordReset(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: "Password reset link sent to your email",
        resetLink: expect.any(String)
      });
    });

    it('should reset password with valid token', async () => {
      const mockUser = {
        _id: '123',
        resetToken: 'validToken',
        resetTokenExpire: Date.now() + 3600000,
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne.mockResolvedValue(mockUser);

      const req = httpMocks.createRequest({
        query: { token: 'validToken' },
        body: { newPassword: 'NewPassword123!' }
      });
      const res = httpMocks.createResponse();

      await AuthController.resetPassword(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: "Password reset successfully"
      });
    });
  });

  describe('2FA', () => {
    it('should enable 2FA', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@test.com',
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne.mockResolvedValue(mockUser);
      speakeasy.generateSecret.mockReturnValue({ base32: 'secret', otpauth_url: 'url' });
      QRCode.toDataURL.mockResolvedValue('qrCodeUrl');

      const req = httpMocks.createRequest({
        body: { email: 'test@test.com' }
      });
      const res = httpMocks.createResponse();

      await AuthController.enable2FA(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        qrCodeUrl: 'qrCodeUrl',
        twoFactorSecret: 'secret'
      });
    });

    it('should verify 2FA code', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@test.com',
        twoFactorEnabled: true,
        twoFactorSecret: 'secret'
      };
      
      User.findOne.mockResolvedValue(mockUser);
      speakeasy.totp.verify.mockReturnValue(true);
      jwt.sign.mockReturnValue('jwtToken');

      const req = httpMocks.createRequest({
        body: { 
          email: 'test@test.com',
          code: '123456' 
        }
      });
      const res = httpMocks.createResponse();

      await AuthController.verify2FA(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: "2FA verification successful",
        token: 'jwtToken',
        user: mockUser
      });
    });
  });

  describe('updatePassword', () => {
    it('should update password with valid current password', async () => {
      const mockUser = {
        _id: '123',
        password: 'hashedPassword',
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.findById.mockResolvedValue(mockUser);
      argon2.verify.mockResolvedValue(true);
      argon2.hash.mockResolvedValue('newHashedPassword');

      const req = httpMocks.createRequest({
        user: { id: '123' },
        body: { 
          currentPassword: 'oldPassword',
          newPassword: 'newPassword' 
        }
      });
      const res = httpMocks.createResponse();

      await AuthController.updatePassword(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        success: true,
        message: 'Password changed successfully.'
      });
    });
  });
});