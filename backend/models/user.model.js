const mongoose = require("mongoose");
const argon2 = require("argon2");

const UserSchema = new mongoose.Schema(
  {

    firstname: { 
      type: String, 
      required: true, 
      minlength: 2, 
      maxlength: 50 
    },
    lastname: { 
      type: String, 
      required: true, 
      minlength: 2, 
      maxlength: 50 
    },
    phone: {
      type: String,
      required: function () {
        return this.authUser === "local"; // Phone is required only for local users
      },
      match: [/^(2|5|9)\d{7}$/, "Please enter a valid Tunisian mobile phone number."],
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address.']
    },
    password: { 
      type: String, 
      required: function () {
        return this.authUser === "local"; // Password is required only for local users
      },
      minlength: 8,  

      match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    },
    role: { 
      type: String, 
      enum: ["user", "admin"], 
      default: "user" 
    },
    authUser: { type: String, enum: ["local", "google","face_recognition"], default: "local" }, // Track authentication provider
    
    image: { type: String, default: "" }, 
    faceData: { type: String }, // Or use Array, depending on the structure of the encoding (vector)
    isActive: { type: Boolean},

    vehicules: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicule"
    }],

    twoFactorSecret: { 
      type: String, 
      default: null 
    }, // ✅ Ajout de cette propriété
    twoFactorEnabled: { 
      type: Boolean, 
      default: false 
    },


    resetToken: { 
      type: String, default: null
     },
    resetTokenExpire: { 
      type: Date, default: null
     },
     badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge",
      default: null
    },
    weeklyPoints: {
      type: Number,
      default: 0
    },
    lastBadgeUpdate: {
      type: Date,
      default: null
    },


  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  // Only hash the password if it's modified and not empty/null
  if (!this.isModified('password') || !this.password) return next();

  try {
    this.password = await argon2.hash(this.password);
    next();
  } catch (err) {
    console.error('Error hashing password:', err); // Log the error
    next(err);
  }
});



module.exports = mongoose.model("User", UserSchema);
