const User = require("../models/user.model.js");
const argon2 = require('argon2'); 
const jwt = require("jsonwebtoken");
const axios = require('axios');
const { oauth2Client } = require('../utils/googleClients.js');

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

exports.googleAuth = async (req, res, next) => {
  const code = req.query.code;
  console.log("Received Authorization Code:", code); // Log received code

  try {
      if (!code) {
          console.error("Error: Authorization code is missing");
          return res.status(400).json({ message: "Authorization code is required" });
      }

      const googleRes = await oauth2Client.getToken(code);
      console.log("Google Token Response:", googleRes.tokens);

      oauth2Client.setCredentials(googleRes.tokens);
      const userRes = await axios.get(
          `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
      );
      console.log("Google User Info:", userRes.data);

      const { email, name, picture } = userRes.data;
      let user = await User.findOne({ email });

      if (!user) {
          user = await User.create({ name, email, image: picture });
          console.log("New user created:", user);
      } else {
          console.log("Existing user found:", user);
      }

      const { _id } = user;
      
      const token = jwt.sign({ _id, email }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_TIMEOUT || 36000,
      });

      console.log("Generated JWT Token:", token);

      res.status(200).json({ message: "success", token, user });
  } catch (err) {
      console.error("Google Auth Error:", err); // Log any error
      res.status(500).json({ message: "Internal Server Error" });
  }
};
