const User = require('../models/UserModel');
const axios = require('axios');
const { createSecretToken } = require('../util/SecretToken');

exports.githubCallback = async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).send('Error: No authorization code received.');
    }

    try {
        // Exchange code for access token
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
        }, { headers: { Accept: 'application/json' } });

        const accessToken = tokenResponse.data.access_token;
        if (!accessToken) {
            return res.status(500).send('Error: Could not retrieve access token.');
        }

        // Get user info from GitHub
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${accessToken}` },
        });
        const githubUser = userResponse.data;

        // Find or create user in your database
        let user = await User.findOne({ githubId: githubUser.id });
        if (!user) {
            user = await User.create({
                githubId: githubUser.id,
                username: githubUser.login,
                email: githubUser.email || `${githubUser.login}@users.noreply.github.com`,
                githubAccessToken: accessToken,
            });
        } else {
            user.githubAccessToken = accessToken;
            await user.save();
        }

        // --- IMPORTANT: Session is created here ---
        // This is the primary way your app knows the user is logged in.
        req.session.userId = user._id;

        // Redirect back to the frontend
        res.redirect('https://thankful-dune-02c682800.2.azurestaticapps.net');

    } catch (error) {
        console.error('Error during GitHub authentication:', error.message);
        res.redirect('https://thankful-dune-02c682800.2.azurestaticapps.net/login?error=auth_failed');
    }
};

// --- FIX: This function now uses the session, just like the requireAuth middleware ---
exports.verifyUser = async (req, res) => {
    if (req.session && req.session.userId) {
        // If a session exists, the user is logged in.
        try {
            const user = await User.findById(req.session.userId).select('-password -githubAccessToken');
            if (user) {
                return res.json({ status: true, user: user });
            }
        } catch (error) {
            console.error("Error fetching user for verification:", error);
            return res.json({ status: false, message: "Error verifying user." });
        }
    }
    // If no session, the user is not logged in.
    return res.json({ status: false, message: "No active session." });
};
