require("dotenv").config({ debug: true })
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require('cookie-parser');

//routes import
const authRoute = require("./Routes/AuthRoute");
const RepoRoute = require("./Routes/RepoRoutes")

const app = express();
const PORT = 3000;

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

//DB Connection
mongoose.connect(process.env.MONGO_URL, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));
// Routes
app.use("/api/auth", authRoute);
app.use("/api/github", RepoRoute);
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// 404 Handler
app.use((req, res) => res.status(404).json({ error: "Not found" }));
// 404 Handler
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));