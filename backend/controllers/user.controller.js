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
        const { firstname, lastname, phone, email,role,isActive } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { firstname, lastname, phone, email,role,isActive },
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


exports.totalUser = async (req, res) => {
    try {
        // Compter le nombre total d'utilisateurs dans la collection User
        const userCount = await User.countDocuments();

        // Retourner le nombre d'utilisateurs en JSON
        return res.status(200).json({ count: userCount });
    } catch (err) {
        console.error('Erreur lors du comptage des utilisateurs:', err);
        return res.status(500).json({ error: 'Une erreur est survenue lors du comptage des utilisateurs.' });
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

  exports.login_face_reco = async (req, res) => {
    const { image } = req.body; // The image is the base64-encoded image
  
    try {
      // Step 1: Send the base64 image to the Python service for face recognition
      const response = await axios.post(
        'http://127.0.0.1:8000/verify-face/', 
        new URLSearchParams({ image: image }), 
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
  
      const matchedUser = response.data.matched_user; // The matched user returned from Python
  
      if (!matchedUser) {
        return res.status(401).json({ error: "Face recognition failed" });
      }
  
      // Step 2: Find the user by the name or userId of the matched user
      // Assuming your `faceData` or `userId` is being stored in the database
      const user = await User.findOne({ userId: matchedUser });
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Step 3: Generate token or session for the authenticated user
      // Assuming you have JWT or session logic in place
      const token = generateAuthToken(user); // Replace with your token generation logic
  
      res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error processing face recognition" });
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


