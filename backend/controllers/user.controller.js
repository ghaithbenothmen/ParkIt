const User = require("../models/user.model.js");


exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password"); 
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.updateUser = async (req, res) => {
    try {
        const { firstname, lastname, phone, email,role } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { firstname, lastname, phone, email,role },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.checkUser = async (req, res) => {
    try {
      const { email } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({ hasPhone: !!user.phone });
    } catch (error) {
      console.error("Check User Error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  exports.updatePhone = async (req, res) => {
    try {
      const { email, phone } = req.body;
  
      // Validate email
      if (!email) {
        return res.status(400).json({ message: "Email is required." });
      }
  
      // Validate phone number format (Tunisian format)
      const tunisiaPhoneRegex = /^(2|5|9)\d{7}$/;
      if (!tunisiaPhoneRegex.test(phone)) {
        return res.status(400).json({ message: "Invalid Tunisian phone number format." });
      }
  
      // Check if the phone number is already registered
      const existingUser = await User.findOne({ phone });
      if (existingUser && existingUser.email !== email) {
        return res.status(400).json({ message: "This phone number is already registered." });
      }
  
      // Update the user's phone number
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      user.phone = phone;
      await user.save();
  
      res.status(200).json({ message: "Phone number updated successfully." });
    } catch (error) {
      console.error("Update Phone Error:", error);
      res.status(500).json({ message: "Server error. Please try again later." });
    }
  };


