const User = require("../models/user.model.js");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

const axios = require('axios');
const { oauth2Client } = require('../utils/googleClients.js');


// Configure the transporter object for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER, 
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
      const { firstname, lastname, phone, email, password, enable2FA } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        return res.status(400).json({ message: "Phone number already exists" });
      }

        // Validate password
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
          return res.status(400).json({
            message:
              "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
          });
        }

      // Hash the password
      const hashedPassword = await argon2.hash(password);

      let twoFactorSecret = null;
      let qrCodeUrl = null;

      if (enable2FA) {
        // Generate 2FA secret
        const secret = speakeasy.generateSecret({
          name: `ParkIt (${email})`,
        });

        twoFactorSecret = secret.base32;

        // Generate QR code for 2FA
        qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
      }

      // Create the user
      const user = new User({
        firstname,
        lastname,
        phone,
        email,
        password: hashedPassword,
        isActive: false,
        twoFactorSecret,
        twoFactorEnabled: enable2FA || false,
        authUser: "local", // Set authentication provider to "local"
      });

      await user.save();

      // Generate activation token
      const activationToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      const activationLink = `http://localhost:4000/api/auth/verify/${activationToken}`;

      // Send activation email
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

      res.status(201).json({
        message: "User registered. Check your email to activate your account.",
        qrCodeUrl,
        twoFactorSecret,
      });
    } catch (error) {
      console.error("Register Error:", error);
      res.status(500).json({ message: error.message });
    }
  });
};

exports.login = async (req, res) => {
  console.log('logiinnn')
  try {
    
    
    console.log('hi')
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user) {
      // Throw a 400 error if the user is not found
      throw { status: 400, message: "Email not found. Please check your email address." };
    }
    console.log(user)
    // Check if the account is activated
    if (!user.isActive) {
      return res.status(400).json({ message: "Account is not activated. Please check your email." });
    }

    // Check the authentication provider
    if (user.authUser === "google") {
      return res.status(400).json({ message: "Please log in with Google" });
    }

    // Verify the password for regular users
    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // If 2FA is enabled, require 2FA verification
    if (user.twoFactorEnabled) {
      return res.status(200).json({ message: "2FA required", user });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Return token and user data
    res.json({ token, user });
  } catch (error) {
    // Catch and handle errors
    console.error("Error in login function:", error.message || error);

    // Check if the error has a status code
    const statusCode = error.status || 500;
    const message = error.message || "Server error";

    // Send the appropriate response
    res.status(statusCode).json({ message });
  }
};

exports.verifyActivation = async (req, res) => {
  try {
    const { token } = req.params;
    console.log("Activation Token:", token);

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);

    // Find the user by ID
    const user = await User.findById(decoded.id);
    if (!user) {
      const frontendErrorUrl = `http://localhost:3000/activation-error`;
      return res.redirect(frontendErrorUrl);
    }
    console.log("User Before Activation:", user);

    // Activate the user
    user.isActive = true;
    await user.save();
    console.log("User After Activation:", user);

    // Redirect to the frontend success page
    const frontendSuccessUrl = `http://localhost:3000/activation-success`;
    res.redirect(frontendSuccessUrl);
    
  } catch (error) {
    console.error("Error verifying account:", error);

    const frontendErrorUrl = `http://localhost:3000/activation-error`;
    res.redirect(frontendErrorUrl);
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

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10m", // 10 minutes
    });

    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send the reset link via email
    const resetLink = `http://localhost:3000/react/template/authentication/emailForgetPassword?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h1 style="color: #333;">Reset Your Password</h1>
            <p style="color: #555;">You requested a password reset. Click the button below to reset your password:</p>
            <a href="${resetLink}" style="display: inline-block; background-color: #007bff; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">Reset Password</a>
            <p style="color: #999; font-size: 14px;">This link will expire in 10 minutes.</p>
            <p style="color: #777; font-size: 12px;">If you did not request this, please ignore this email or contact support.</p>
            <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">&copy; 2025 Your Company. All rights reserved.</p>
          </div>
            `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset link sent to your email", resetLink });
  } catch (error) {
    console.error("Request Password Reset Error:", error);

    res.status(500).json({ message: "Server error" });
  }
};



exports.googleAuth = async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ message: "Authorization code is required" });
  }

  try {
    // Exchange the authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch user info from Google
    const { data } = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
    );

    const { email, name, picture } = data;

    // Check if the user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user
      user = await User.create({
        firstname: name.split(" ")[0],
        lastname: name.split(" ")[1] || "",
        phone: null, // Default phone number for Google users
        email,
        password: null, // No password for Google-authenticated users
        image: picture,
        isActive: true, // Automatically activate Google-authenticated users
        authUser: "google", // Set authentication provider to "google"
      });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });

    res.status(200).json({ message: "Google authentication successful", token, user });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { token } = req.query; 

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded.id,
      resetToken: token, 
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await argon2.hash(newPassword);

    // Update the user's password and clear the reset token
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpire = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Token has expired" });
    }
    res.status(500).json({ message: "Server error" });

  }
};

exports.enable2FA = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate 2FA secret
    const secret = speakeasy.generateSecret({
      name: `ParkIt (${user.email})`,
    });

    user.twoFactorSecret = secret.base32;
    user.twoFactorEnabled = true;
    await user.save();

    // Generate QR code for 2FA
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.status(200).json({ qrCodeUrl, twoFactorSecret: secret.base32 });
  } catch (error) {
    console.error("Enable 2FA Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verify2FA = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Email and 2FA code are required" });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if 2FA is enabled for the user
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ message: "2FA is not enabled for this user" });
    }

    // Verify the 2FA code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: code,
      window: 1, // Allow a 30-second window for code validation
    });
    console.log("2FA Verification Result:", verified);
    console.log("2FA Verification Code:", code);
    console.log("2FA user:", user);
    console.log("2FA Secret:", user.twoFactorSecret);

    if (!verified) {
      return res.status(400).json({ message: "Invalid 2FA code" });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });

    res.status(200).json({ message: "2FA verification successful", token, user });
  } catch (error) {
    console.error("2FA Verification Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

