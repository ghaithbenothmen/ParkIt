const User = require("../models/user.model.js");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const FormData = require('form-data');
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

const { 
  generatePasswordResetEmail, 
  generateAccountActivationEmail 
} = require('../utils/emailTemplates');

exports.register = async (req, res) => {
  // Add CORS headers for debugging cross-origin issues
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
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
        password: password,
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

     const activationLink = `${process.env.BACKEND_URL}/api/auth/verify/${activationToken}`;

      // Send activation email
      const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: user.email,
        subject: "Account Activation",
        html: generateAccountActivationEmail(activationLink)
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
      // Always return JSON
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
};

exports.login = async (req, res) => {
  console.log('logiinnn')
  try {
    
    
    console.log('hi')
    const { email, password,faceData  } = req.body;

    if (faceData) {
      const response = await axios.post('http://host.docker.internal:8000/verify-face/', { face_data: faceData });

      if (response.data.isMatch) {
        // If face recognition is successful, log in the user
        const user = await User.findOne({ email });
        if (!user || !user.isActive) {
          return res.status(400).json({ message: "Account is not activated or does not exist" });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN,
        });

        return res.json({ token, user });
      } else {
        return res.status(400).json({ message: "Face recognition failed" });
      }
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("User activation status:", user.isActive);
    if (!user) {
      // Throw a 400 error if the user is not found
      throw { status: 400, message: "Email not found. Please check your email address." };
    }
    console.log(user)
    // Check if the account is activated
    if (!user.isActive) {
      return res.status(400).json({ message: "Account is not activated. Please check your email." });
    }

    
      if (!user.isActive) {
        console.log("Account not activated for email:", email);
        return res.status(400).json({ message: "Account is not activated. Please check your email." });
      }

    // Vérifier le fournisseur d'authentification
    if (user.authUser === "google") {
      return res.status(400).json({ message: "Please log in with Google" });
    }

    // Vérifier le mot de passe pour les utilisateurs locaux
    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Si la 2FA est activée, exiger une vérification 2FA
    if (user.twoFactorEnabled) {
      return res.status(200).json({ message: "2FA required", user });
    }

    // Générer un token JWT
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
exports.loginWithFace = async (req, res) => {
  try {
    const response = await axios.post('http://host.docker.internal:8000/verify-face/'); // FastAPI camera scan

    const { isMatch, userId } = response.data;

    if (!isMatch) {
      return res.status(401).json({ message: 'Face not recognized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Face login failed' });
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
        const frontendErrorUrl = `${process.env.FRONTEND_URL}/activation-error`;
        return res.redirect(frontendErrorUrl);
      }
    console.log("User Before Activation:", user);

    // Activate the user
    user.isActive = true;
    await user.save();
    console.log("User After Activation:", user);

    // Redirect to the frontend success page
    const frontendSuccessUrl = `${process.env.FRONTEND_URL}/activation-success`;
    res.redirect(frontendSuccessUrl);
    
  } catch (error) {
    console.error("Error verifying account:", error);

    const frontendErrorUrl = `${process.env.FRONTEND_URL}/activation-error`;
    res.redirect(frontendErrorUrl);
  }
};


exports.updateProfile = async (req, res) => {
  console.log("Request Body:", req.body);
  console.log("Request File:", req.file);
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: "Image upload failed", error: err.message });
    }

    try {
      const { firstname, lastname, phone, email } = req.body;

      let updatedData = { firstname, lastname, phone, email };

      if (req.file) {
        updatedData.image = req.file.path; // Cloudinary URL
      }


      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        updatedData,
        { new: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: error.message });
    }
  });
};

exports.logout = async (req, res) => {
  try {
    // Clear any server-side session data if needed
    res.clearCookie('token');
    
    // Send a success response
    res.status(200).json({ 
      success: true,
      message: "Logout successful" 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error during logout" 
    });
  }
};

exports.register_face_data = async (req, res) => {
  const { userId } = req.body;

  try {
    const formData = new FormData();
    formData.append('name', userId); // must match what FastAPI expects

    const response = await axios.post('http://host.docker.internal:8000/register-face/', formData, {
      headers: formData.getHeaders(),
    });

    if (response.data.message) {
      return res.json({ message: response.data.message });
    }

    res.status(500).json({ error: 'Face registration failed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error registering face' });
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
      // Create a new user without setting password field at all
      user = new User({
        firstname: name.split(" ")[0],
        lastname: name.split(" ")[1] || "",
        email,
        image: picture,
        isActive: true,
        authUser: "google",
        // Don't include phone or password fields
      });
      
      await user.save();
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });

    res.status(200).json({ 
      message: "Google authentication successful", 
      token, 
      user: {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        image: user.image,
        role: user.role,
        authUser: user.authUser
      }
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ 
      message: "Internal Server Error",
      error: error.message 
    });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10m", 
    });

    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send the reset link via email
    const resetLink = `${process.env.FRONTEND_URL}/authentication/emailForgetPassword?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: generatePasswordResetEmail(resetLink)

    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset link sent to your email", resetLink });
  } catch (error) {
    console.error("Request Password Reset Error:", error);

    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { token } = req.query; 

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }
    
    const user = await User.findOne({
      resetToken: token, 
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Ne pas hacher ici, car le middleware pre-save le fera automatiquement
    user.password = newPassword; 
    user.resetToken = null;
    user.resetTokenExpire = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
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

exports.disable2FA = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.twoFactorSecret = null;
    user.twoFactorEnabled = false;
    await user.save();

    res.status(200).json({ message: "2FA has been disabled" });
  } catch (error) {
    console.error("Disable 2FA Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id; // Ensure this is correctly populated by the middleware

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Verify the current password using argon2
    const isMatch = await argon2.verify(user.password, currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    // Assign the new password directly (hashing will be handled by the pre-save middleware)
    user.password = newPassword;
    await user.save();

    // Return success response
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
};