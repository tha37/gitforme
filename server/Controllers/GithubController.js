const axios = require('axios');
const User = require('../models/UserModel');
const redisClient = require('../util/RediaClient');

// Helper to create an authenticated GitHub API instance
const createGithubApi = async (session) => {
    const headers = { 'Accept': 'application/vnd.github.v3+json' };
    
    if (session && session.userId) {
        const user = await User.findById(session.userId);
        if (user && user.githubAccessToken) {
            headers['Authorization'] = `token ${user.githubAccessToken}`;
            console.log(`Making authenticated GitHub API request for user ${user.username}.`);
        }
    } else {
        console.log('Making unauthenticated GitHub API request.');
    }
    
    return axios.create({ baseURL: 'https://api.github.com', headers });
};

// Fetches main repository details
exports.fetchRepoDetails = async (req, res) => {
    const { username, reponame } = req.params;
    const cacheKey = `repo:${username}:${reponame}`;

    try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) return res.json(JSON.parse(cachedData));

        const githubApi = await createGithubApi(req.session);
        const response = await githubApi.get(`/repos/${username}/${reponame}`);
        
        await redisClient.set(cacheKey, JSON.stringify(response.data), { EX: 3600 });
        res.json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        res.status(status).json({ message: 'Error fetching repository data from GitHub.' });
    }
};

// Add other controller functions for contributors, readme, etc., following the same pattern.
