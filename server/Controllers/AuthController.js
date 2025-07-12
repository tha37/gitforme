const User = require('../models/UserModel');
const axios = require('axios');
const jwt = require("jsonwebtoken");
const { createSecretToken } = require('../util/SecretToken');

// This handles the GitHub OAuth callback
exports.githubCallback = async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send('Error: No authorization code received.');

    try {
        // 1. Exchange code for access token
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
        }, { headers: { Accept: 'application/json' } });

        const accessToken = tokenResponse.data.access_token;
        if (!accessToken) return res.status(500).send('Error: Could not retrieve access token.');

        // 2. Get user profile from GitHub
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${accessToken}` },
        });
        const githubUser = userResponse.data;

        // 3. Find or create user in your database
        let user = await User.findOne({ githubId: githubUser.id });
        if (!user) {
            user = await User.create({
                githubId: githubUser.id,
                username: githubUser.login,
                email: githubUser.email || `${githubUser.login}@users.noreply.github.com`,
                githubAccessToken: accessToken,
            });
        } else {
            user.githubAccessToken = accessToken; // Update token for existing user
            await user.save();
        }

        // 4. Create JWT and establish session
        const token = createSecretToken(user._id);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24,
        });

        req.session.userId = user._id; // IMPORTANT: This creates the session
        
        // 5. Redirect back to the frontend
        res.redirect('http://localhost:5173/');
    } catch (error) {
        console.error('Error during GitHub authentication:', error.message);
        res.redirect('http://localhost:5173/login?error=auth_failed');
    }
};

// Verifies the user's JWT token for frontend auth state
exports.verifyUser = async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.json({ status: false });

    try {
        const data = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await User.findById(data.id);
        if (user) return res.json({ status: true, user });
        return res.json({ status: false });
    } catch (err) {
        return res.json({ status: false });
    }
};
