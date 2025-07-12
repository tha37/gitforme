// ../api/githubApi.js

const axios = require('axios');
const redis = require('redis');
const redisClient = require('../util/RediaClient');
const User = require('../models/UserModel');



// Create a single, reusable axios instance for the GitHub API
const githubApi = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    // 'Authorization': `token ${process.env.GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
  },
});

// --- FIX ---
// This function is now a self-contained Express controller.
// It handles req, res, and all logic internally.
exports.fetchRepoDetailsController = async (req, res) => {
    const { username, reponame } = req.params;
  const cacheKey = `github:repo:${username}:${reponame}:${req.session.userId || 'public'}`;
    try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log('Cache hit');
            return res.json(JSON.parse(cachedData));
        }

        console.log('Cache miss');
        let userToken = null;

        // Check if a user is logged into your app via session
        if (req.session && req.session.userId) {
            const user = await User.findById(req.session.userId);
            // Use the user's token if it exists
            if (user && user.githubAccessToken) {
                userToken = user.githubAccessToken; // Remember to decrypt if you encrypted it
            }
        }

        // Configure headers conditionally
        const headers = { Accept: 'application/vnd.github.v3+json' };
        if (userToken) {
          headers.Authorization = `token ${userToken}`;
            console.log(`Making authenticated request for ${username}/${reponame}`);
        } else {
           console.log(`Making unauthenticated request for ${username}/${reponame}`);
        }

        const response = await axios.get(
            `https://api.github.com/repos/${username}/${reponame}`,
            { headers }
        );

        const repoData = response.data;
        await redisClient.set(cacheKey, JSON.stringify(repoData), { EX: 3600 });
        res.json(repoData);
  } catch (error) {
    // Provide more detailed error feedback
    console.error("GitHub API Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || "Error fetching data from GitHub API",
    });
  }
};

exports.fetchUserReposController = async (req, res) => {
    const userId = req.session.userId; // Get user ID from the authenticated session
    const cacheKey = `github:repos:${userId}`; // User-specific cache key

    try {
        // 1. Check Redis for a cached list of the user's repositories
        const cachedRepos = await redisClient.get(cacheKey);
        if (cachedRepos) {
            console.log(`Cache hit for user ${userId} repos`);
            return res.json(JSON.parse(cachedRepos));
        }

        console.log(`Cache miss for user ${userId} repos`);

        // 2. If not cached, get the user's GitHub token from the database
        const user = await User.findById(userId);
        if (!user || !user.githubAccessToken) {
            return res.status(403).json({ message: "GitHub account not linked or access token missing." });
        }
        
        const userToken = user.githubAccessToken; // Decrypt if you have encrypted it

        // 3. Fetch the repository list from the GitHub API using the user's token
        // The `/user/repos` endpoint automatically gets repos for the authenticated user
        const response = await axios.get('https://api.github.com/user/repos?sort=updated&per_page=100', {
            headers: {
                Authorization: `token ${userToken}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        const userRepos = response.data;

        // 4. Store the fetched list in Redis for 1 hour
        await redisClient.set(cacheKey, JSON.stringify(userRepos), {
            EX: 3600, // Cache for 1 hour
        });

        res.json(userRepos);

    } catch (error) {
        console.error("Error fetching user repositories:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            message: "Failed to fetch repositories from GitHub.",
        });
    }
};