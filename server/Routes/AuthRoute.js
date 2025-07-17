const router = require('express').Router();
const { githubCallback, verifyUser } = require('../Controllers/AuthController');

// Redirect to GitHub for OAuth
router.get('/github', (req, res) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`;
    res.redirect(githubAuthUrl);
});

// Handle the callback from GitHub
router.get('/github/callback', githubCallback);

// Verify user token for frontend
router.get('/verifyUser', verifyUser);

module.exports = router;
