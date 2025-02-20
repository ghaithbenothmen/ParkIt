const User = require("../models/user.model.js");
const argon2 = require('argon2'); 
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail } = require("../utils/emailService");

exports.register = async (req, res) => {
    try {
      const { firstname, lastname, phone, email, password } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = new User({
        firstname,
        lastname,
        phone,
        email,
        password,
      });

      await user.save(); 

      res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
      console.error("Register Error:", error);

      // Check for validation errors
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ message: "Validation errors", errors: validationErrors });
      }

      // General error handling
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

exports.send2FACode = async (req, res) => {
  try {
      const { email, password } = req.body;
      
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Invalid credentials" });

      const isMatch = await argon2.verify(user.password, password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

      // Génération du code 2FA
      const code = crypto.randomInt(100000, 999999).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // Expiration en 10 minutes

      user.twoFactorCode = code;
      user.twoFactorExpires = expires;
      await user.save();

      // Envoi de l'email avec le code 2FA
      await sendEmail(user.email, "Votre code de vérification", `Votre code 2FA est : ${code}`);

      res.json({ message: "2FA code sent to your email" });

  } catch (error) {
      console.error("Error sending 2FA code:", error);
      res.status(500).json({ message: "Server error" });
  }
};

exports.verify2FA = async (req, res) => {
  try {
      const { code } = req.body;

      // Recherche de l'utilisateur avec un code valide et non expiré
      const user = await User.findOne({ twoFactorCode: code, twoFactorExpires: { $gt: Date.now() } });

      if (!user) {
          return res.status(400).json({ message: "Invalid or expired 2FA code" });
      }

      // Suppression du code après validation
      user.twoFactorCode = null;
      user.twoFactorExpires = null;
      await user.save();

      // Génération du token JWT
      const authToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

      res.json({ token: authToken, user });

  } catch (error) {
      console.error("Error verifying 2FA:", error);
      res.status(500).json({ message: "Server error" });
  }
};
