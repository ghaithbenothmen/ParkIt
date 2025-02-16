const mongoose = require("mongoose");
const argon2 = require("argon2");

const UserSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    // Use argon2 to hash the password
    this.password = await argon2.hash(this.password);
    next();
});

module.exports = mongoose.model("User", UserSchema);
