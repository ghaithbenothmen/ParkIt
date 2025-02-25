const User = require("../models/user.model.js");
const argon2 = require('argon2'); 
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

exports.register = async (req, res) => {
  try {
    const { firstname, lastname, phone, email, password } = req.body;

    // Vérifiez si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ message: "Phone number already exists" });
    }

    // Hash du mot de passe
    const hashedPassword = await argon2.hash(password);

    // Génération du secret 2FA
    const secret = speakeasy.generateSecret({
      name: `MyApp (${email})`,
    });

    // Création de l'utilisateur avec le secret 2FA
    const user = new User({
      firstname,
      lastname,
      phone,
      email,
      password: hashedPassword,
      twoFactorSecret: secret.base32, // Assurez-vous que ce champ est bien enregistré
      twoFactorEnabled: true, // Activez la 2FA
    });

    await user.save();

    // Génération du QR code
    const otpauth_url = secret.otpauth_url;
    const qrCodeDataURL = await QRCode.toDataURL(otpauth_url);

    // Réponse avec le QR code
    res.status(201).json({
      message: "User registered successfully",
      user,
      qrCode: qrCodeDataURL,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.json({ token, user });
  } catch (error) {
    console.error("Error logging in:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token"); 
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password from the response
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verify2FA = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Recherchez l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Vérifiez que l'utilisateur a un secret 2FA configuré
    if (!user.twoFactorSecret) {
      return res.status(400).json({ message: "2FA not set up for this user" });
    }

    // Vérifiez le code 2FA
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: code,
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid 2FA code" });
    }

    // Générez un token JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, user });
  } catch (error) {
    console.error("Error verifying 2FA:", error);
    res.status(500).json({ message: "Server error" });
  }
};