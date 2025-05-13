const mongoose = require('mongoose');
const Claim = require('../models/claim.model');
const Parking = require('../models/parking.model');

const multer = require('multer');
const path = require('path');
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { send } = require('process');

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


const upload = multer({ storage }).single('image');

exports.createClaim = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: "Image upload failed", error: err.message });
    }

    console.log('FormData received: ', req.body);
    console.log('File uploaded: ', req.file);

    try {
      const { userId, parkingId, claimType, message } = req.body;
      const user = await mongoose.model('User').findById(userId);
      const parking = await Parking.findById(parkingId);

      if (!user) return res.status(404).json({ message: 'User not found.' });
      if (!parking) return res.status(404).json({ message: 'Parking not found.' });

      const imageUrl = req.file.path;

      // Function to send image to classifier and get result
      async function sendImageFromUrl(imageUrl) {
        try {
          const response = await axios({
            method: 'get',
            url: imageUrl,
            responseType: 'stream',
          });

          const form = new FormData();
          form.append('file', response.data, {
            filename: 'uploaded_image.jpg',
            contentType: response.headers['content-type'],
          });

          const result = await axios.post('http://classifier:8000/classify', form, {
            headers: form.getHeaders(),
          });

          return result.data; // Returns {available: bool, occupied: bool, wrong_parking: bool, accident: bool, others: bool}
        } catch (err) {
          console.error('Error sending image:', err.message);
          return null;
        }
      }

      // Get classification result
      const classificationResult = await sendImageFromUrl(imageUrl);

      // Map classifier labels to claimType
      const claimTypeMap = {
        'Spot Occupied': ['occupied', 'wrong_parking'], // Matches "occupied" or "wrong_parking"
        'Payment Issue': ['others'], // Assuming payment issues might fall under "others"
        'Security': ['accident'],   // Matches "accident"
        'Other': ['others'],       // Catch-all for other cases
      };

      let status = 'Pending';
      if (classificationResult) {
        const predictedTypes = Object.keys(classificationResult).filter(key => classificationResult[key]);
        const matchingClaimType = claimTypeMap[claimType];
        if (matchingClaimType && predictedTypes.some(type => matchingClaimType.includes(type))) {
          status = 'Valid';
        }
      }

      const claim = new Claim({
        userId,
        parkingId,
        claimType,
        message,
        image: imageUrl,
        status, // Set based on classification match
      });

      await claim.save();

      res.status(201).json({
        message: 'Claim created successfully.',
        claim,
        notification: 'Your claim has been sent to the administration.',
      });
    } catch (error) {
      console.error(error.stack);
      res.status(500).json({ message: 'Error creating the claim.', error });
    }
  });
};


exports.getAllClaims = async (req, res) => {
  try {
    const claims = await Claim.find()
      .sort({ priority: -1, submissionDate: -1 })
      .populate('userId', 'firstname lastname role')
      .populate('parkingId', 'nom adresse');
    res.status(200).json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching claims.', error });
  }
};

exports.getClaimByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const claims = await Claim.find({ userId })
      .sort({ priority: -1, submissionDate: -1 })
      .populate('userId', 'firstname lastname role')
      .populate('parkingId', 'nom adresse');

    if (!claims || claims.length === 0) {
      return res.status(404).json({ message: 'No claims found for this user.' });
    }

    res.status(200).json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user claims.', error });
  }
};

exports.getClaimById = async (req, res) => {
  try {
    const { id } = req.params;

    const claim = await Claim.findById(id)
      .populate('userId', 'firstname lastname role')
      .populate('parkingId', 'nom adresse');

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found.' });
    }

    res.status(200).json({ data: claim });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching the claim.', error });
  }
};

exports.getArchivedClaims = async (req, res) => {
  try {
    const archivedClaims = await Claim.find({ status: 'Pending' })
      .sort({ submissionDate: -1 })
      .populate('userId', 'firstname lastname role')
      .populate('parkingId', 'nom adresse');
    res.status(200).json(archivedClaims);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching archived claims.', error });
  }
};

exports.updateClaimStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback, image, message, userId} = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid claim ID format.' });
    }

    const validStatuses = ['Valid', 'Pending', 'Resolved', 'Rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const claim = await Claim.findById(id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found.' });
    }

    if (status) claim.status = status;
    if (feedback) claim.feedback = feedback;
    if (image) claim.image = image;
    if (message) claim.message = message;
    if (userId) claim.userId = userId;
    await claim.save();
    const updatedClaim = await Claim.findById(id);

    let notificationMessage = '';
    if (updatedClaim.status === 'Resolved') {
      notificationMessage = 'Your claim has been resolved. Feedback: ' + (updatedClaim.feedback || 'N/A');
    } else if (updatedClaim.status === 'Rejected') {
      notificationMessage = 'Your claim has been rejected. Feedback: ' + (updatedClaim.feedback || 'N/A');
    } else if (updatedClaim.status === 'Valid') {
      notificationMessage = 'Your claim is being processed.';
    }

    res.status(200).json({
      message: 'Claim updated successfully.',
      claim: updatedClaim,
      notification: notificationMessage
    });
  } catch (error) {
    console.error('Error updating claim:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error.', error: error.message });
    }
    res.status(500).json({ message: 'Error updating the claim.', error: error.message });
  }
};

exports.deleteClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const claim = await Claim.findByIdAndDelete(id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found.' });
    }
    res.status(200).json({ message: 'Claim deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting the claim.', error });
  }
};
