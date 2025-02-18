const User = require("../models/user.model.js");
const argon2 = require('argon2'); 
const jwt = require("jsonwebtoken");


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
