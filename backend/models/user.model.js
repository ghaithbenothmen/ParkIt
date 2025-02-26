const mongoose = require("mongoose");
const argon2 = require("argon2");

const UserSchema = new mongoose.Schema(
  {
    image:  String,
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
      required: true,
      unique: true,
      match: [/^(2|5|9)\d{7}$/, 'Please enter a valid Tunisian mobile phone number.']
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address.']
    },
    password: { 
      type: String, 
      /* required: true, */ 
      minlength: 8,  

      match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    },
    role: { 
      type: String, 
      enum: ["user", "admin"], 
      default: "user" 
    },

    twoFactorSecret: { 
      type: String, 
      default: null 
    }, // ✅ Ajout de cette propriété
    twoFactorEnabled: { 
      type: Boolean, 
      default: false 
    },
    twoFactorCode: {
      type: String,
      default: null
  },
    twoFactorExpires: {
      type: Date,
      default: null
  }  ,

    resetToken: { 
      type: String, default: null
     },
    resetTokenExpire: { 
      type: Date, default: null
     },

  },
  { timestamps: true }
);


UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  
  this.password = await argon2.hash(this.password);
  next();
});



module.exports = mongoose.model("User", UserSchema);
