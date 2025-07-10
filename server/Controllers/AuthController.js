const User = require("../models/User");
const { createSecretToken } = require("../utils/token");
const bcrypt = require("bcrypt");

exports.signup = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.json({ message: "User already exists" });

    const user = await User.create({ email, password, username });
    const token = createSecretToken(user._id);

    res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
    res.status(201).json({ message: "Signup successful", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.json({ message: "All fields required" });

    const user = await User.findOne({ email });
    if (!user) return res.json({ message: "Incorrect email or password" });

    const auth = await bcrypt.compare(password, user.password);
    if (!auth) return res.json({ message: "Incorrect email or password" });

    const token = createSecretToken(user._id);
    res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyUser = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ status: false });

  try {
    const data = jwt.verify(token, process.env.TOKEN_SECRET);
    const user = await User.findById(data.id);
    if (user) return res.json({ status: true, user: user.username });
    else return res.json({ status: false });
  } catch {
    return res.json({ status: false });
  }
};
