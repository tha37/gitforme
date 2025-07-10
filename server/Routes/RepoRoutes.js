const express = require("express");
const { fetchRepoDetails } = require("../api/githubApi");


const router = express.Router();

router.get("/:username/:reponame", async (req, res) => {
  const { username, reponame } = req.params;
  try {
    const repoData = await fetchRepoDetails(username, reponame);
    res.json(repoData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
