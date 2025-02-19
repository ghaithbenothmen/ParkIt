const User = require("../models/user.model.js");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Configure the transporter object for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASSWORD, 
  },
});

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
      const validationErrors = Object.values(error.errors).map((err) => err.message);
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

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

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

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d", 
    });

    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    await user.save();

    // Send the reset link via email
    const resetLink = `http://localhost:4000/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click the link below to reset your password:</p>
             <a href="${resetLink}">Reset Password</a>
             <p>This link will expire in 10 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Request Password Reset Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

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