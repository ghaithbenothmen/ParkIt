const User = require("../models/user.model.js");
const argon2 = require('argon2'); 
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user_images",
    format: async (req, file) => "jpg",
    public_id: (req, file) => Date.now() + "-" + file.originalname,
  },
});
const upload = multer({ storage }).single("image");

exports.register = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: "Image upload failed", error: err.message });
    }
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
        isActive: false,
        image: req.file ? req.file.path : null,
      });
      
      await user.save();
      
      const activationToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      
      const activationLink = `http://localhost:3000/api/auth/verify/${activationToken}`;
      
      const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: user.email,
        subject: "Account Activation",
        html: `<p>Click <a href="${activationLink}">here</a> to activate your account.</p>`,
      };
      
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log("Error sending email:", err);
        } else {
          console.log("Activation email sent:", info.response);
        }
      });
      
      res.status(201).json({ message: "User registered. Check your email to activate your account.", imagePath: user.image });
    } catch (error) {
      console.error("Register Error:", error);
      res.status(500).json({ message: error.message });
    }
  });
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Check if the account is activated
    if (!user.isActive) {
      return res.status(400).json({ message: "Account is not activated. Please check your email." });
    }

    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.json({ token, user });

  } catch (error) {
    console.error("Error logging in:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyActivation = async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: "Invalid token or user not found." });
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({ message: "Account successfully activated." });
  } catch (error) {
    console.error("Error verifying account:", error);
    res.status(400).json({ message: "Invalid or expired activation token." });
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
