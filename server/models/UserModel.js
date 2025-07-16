const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, sparse: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    githubId: { type: String, unique: true, sparse: true },
    githubAccessToken: { type: String },
    createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

module.exports = mongoose.model("User", userSchema);
