require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const RedisStore = require("connect-redis").default;
const redisClient = require("./util/RediaClient"); 
const authRoute = require("./Routes/AuthRoute");
const repoRoute = require("./Routes/RepoRoutes");
const insightsRoutes = require('./Routes/InsightRoutes'); 
const { requireAuth } = require("./Middlewares/AuthMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;
app.set('trust proxy', 1); 
// Redis client setup
redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Connected to Redis'));
const redisStore = new RedisStore({ client: redisClient, prefix: "session:" });

// --- Middleware Registration ---

// 1. CORS - Must come early
app.use(cors({
  origin: ['https://thankful-dune-02c682800.2.azurestaticapps.net'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// 2. Body Parsers
app.use(express.json());
app.use(cookieParser());

// 3. Session Management
app.use(
  session({
    store: redisStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
  secure: true, 
  httpOnly: true,
  maxAge: 1000 * 60 * 60 * 24, // 1 day
  sameSite: 'none', 
},
  })
);

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URL, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// --- API Routes ---
app.use((req, res, next) => {
  console.log('Incoming cookies:', req.cookies);
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  next();
});

app.use("/api/auth", authRoute);
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/github", requireAuth);

app.use("/api/github", insightsRoutes);
app.use("/api/github", repoRoute);     

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('token'); 
    res.json({ status: true });
  });
});

app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// --- Server Start ---
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
