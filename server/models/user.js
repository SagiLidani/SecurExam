const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetToken: { type: String }, // קוד האיפוס
    resetTokenExpiry: { type: Date } // תאריך תפוגה של הקוד
});

module.exports = mongoose.model("User", UserSchema);
