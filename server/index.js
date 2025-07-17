  require("dotenv").config();
  const express = require("express");
  const mongoose = require("mongoose");
  const cors = require("cors");
  const cookieParser = require('cookie-parser');
  const session = require('express-session');
const RedisStore = require("connect-redis").default;
const escomplex = require('typhonjs-escomplex');
const redisClient = require("./util/RediaClient"); 
const authRoute = require("./Routes/AuthRoute");
const repoRoute = require("./Routes/RepoRoutes");
const { requireAuth } = require("./Middlewares/AuthMiddleware");
const { fetchRepoInsights } = require("./Controllers/GithubController");
 const app = express();
const PORT = process.env.PORT || 3000;
const insightsRoutes = require('./Routes/InsightRoutes'); 

  redisClient.on('error', (err) => console.error('Redis Client Error:', err));
  redisClient.on('connect', () => console.log('Connected to Redis'));
  const redisStore = new RedisStore({ client: redisClient, prefix: "session:" });

  app.use(cors({
    origin: ['https://thankful-dune-02c682800.2.azurestaticapps.net'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }));
app.use('/api/github', insightsRoutes); 
  app.use(express.json());
  app.use(cookieParser());

  app.use(
    session({
      store: redisStore,
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: 'lax',
      },
    })
  );
app.use('/api/github', insightsRoutes); 

  mongoose.connect(process.env.MONGO_URL, {})
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error(err));

  app.use("/api/auth", authRoute);
  app.use("/api/github", requireAuth, repoRoute);
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: 'Logout failed' });
      res.clearCookie('token');
      res.json({ status: true });
    });
  });
  // 404 Handler
  app.use((req, res) => res.status(404).json({ error: "Route not found" }));

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
