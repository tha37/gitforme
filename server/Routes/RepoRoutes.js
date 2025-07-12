const router = require('express').Router();
const { fetchRepoDetails } = require('../Controllers/GithubController');
// Import other controllers as you create them

// --- FIX ---
// Import the controller function from your API file
const { 
  fetchUserReposController
 } = require("../api/githubApi");
 const { requireAuth } = require("../Middlewares/AuthMiddleware");
 router.get("/user/repos", requireAuth, fetchUserReposController);
 // --- FIX ---
 // Assign the controller function directly to the route.
 // Express will automatically pass (req, res) to it.
 router.get('/:username/:reponame', fetchRepoDetails);

module.exports = router;
