const router = require('express').Router();
const { fetchRepoDetails, fetchReadme } = require('../api/githubApi');
const { Octokit } = require("@octokit/rest");
const redisClient = require('../util/RediaClient');
const axios = require('axios');
const User = require('../models/UserModel');


const {
    fetchGitTree,
    getRepoTimeline,
    fetchIssues,
    fetchRepoInsights,
    fetchPullRequests,
    fetchCodeHotspots,
    fetchIssueTimeline,
    fetchGoodFirstIssues,
    fetchContributors,
    fetchDeployments,
    fetchFileCommits,
    fetchFileContent,
} = require('../Controllers/GithubController');


const createGithubApi = async (session) => {
  const headers = { 'Accept': 'application/vnd.github.v3+json' };
  
  if (session?.userId) {
    const user = await User.findById(session.userId);
    if (user?.githubAccessToken) {
      headers['Authorization'] = `token ${user.githubAccessToken}`;
      console.log(`Making authenticated GitHub API request for user ${user.username}.`);
      return axios.create({ baseURL: 'https://api.github.com', headers });
    }
  }
  
  console.log('Making unauthenticated GitHub API request (fallback).');
  return axios.create({ baseURL: 'https://api.github.com', headers });
};


// const getRepoTimeline = async (req, res) => {
//   const { username, reponame } = req.params;
//   const userId = req.session.userId || 'public';
//   const cacheKey = `repo:timeline:${userId}:${username}:${reponame}`;

//   try {
//     const cachedData = await redisClient.get(cacheKey);
//     if (cachedData) {
//       console.log(`Cache hit for timeline of ${username}/${reponame} for user ${userId}`);
//       return res.json(JSON.parse(cachedData));
//     }

//     const githubApi = await createGithubApi(req.session);

//     // 1. Fetch all branches
//     const { data: branchesData } = await githubApi.get(`/repos/${username}/${reponame}/branches`);
    
//     // 2. Fetch all tags
//     const { data: tagsData } = await githubApi.get(`/repos/${username}/${reponame}/tags`);

//     // 3. Fetch commits (limit to 500 using per_page and pagination)
//     const commits = [];
//     let page = 1;
//     const perPage = 100;

//     while (commits.length < 500) {
//       const { data: pageCommits } = await githubApi.get(`/repos/${username}/${reponame}/commits`, {
//         params: { per_page: perPage, page },
//       });
//       if (pageCommits.length === 0) break;
//       commits.push(...pageCommits);
//       if (pageCommits.length < perPage) break;
//       page++;
//     }

//     // Map tags to SHAs
//     const tagMap = {};
//     for (const tag of tagsData) {
//       tagMap[tag.commit.sha] = tag.name;
//     }

//     const processedCommits = commits.map(commit => ({
//       sha: commit.sha,
//       message: commit.commit.message,
//       author: {
//         name: commit.commit.author.name,
//         login: commit.author ? commit.author.login : commit.commit.author.name,
//         avatar_url: commit.author ? commit.author.avatar_url : null,
//       },
//       date: commit.commit.author.date,
//       parents: commit.parents.map(p => p.sha),
//       tag: tagMap[commit.sha] || null,
//     }));

//     const responsePayload = {
//       commits: processedCommits,
//       branches: branchesData.map(b => ({ name: b.name, sha: b.commit.sha })),
//       tags: tagsData.map(t => ({ name: t.name, sha: t.commit.sha })),
//     };

//     await redisClient.set(cacheKey, JSON.stringify(responsePayload), { EX: 3600 });
//     res.json(responsePayload);

//   } catch (error) {
//     console.error("Error fetching repo timeline data:", error);
//     const status = error.response?.status || 500;
//     res.status(status).json({ message: "Failed to fetch repository timeline data from GitHub." });
//   }
// };


const { fetchDependencyHealth } = require('../Controllers/InsightController');
// router.get('/repos/:username/:reponame/file/*', fetchFileContent);
// router.get('/repos/:username/:reponame/file/*', fetchFileContent);
router.get('/repos/:username/:reponame/file/:path', fetchFileContent);
router.get('/:username/:reponame/issues/:issue_number/timeline', fetchIssueTimeline);
router.get('/:username/:reponame/insights/dependencies', fetchDependencyHealth);
router.get('/:username/:reponame', fetchRepoDetails);
router.get('/:username/:reponame/readme', fetchReadme);
router.get('/:username/:reponame/commits', fetchFileCommits);
router.get('/:username/:reponame/deployments', fetchDeployments);
router.get('/:username/:reponame/git/trees/:branch', fetchGitTree);
router.get('/:username/:reponame/contributors', fetchContributors);
router.get('/:username/:reponame/issues', fetchIssues);
router.get('/:username/:reponame/pulls', fetchPullRequests);
router.get('/:username/:reponame/good-first-issues', fetchGoodFirstIssues);
router.get('/:username/:reponame/hotspots', fetchCodeHotspots);
router.get('/:username/:reponame/timeline', getRepoTimeline);
router.get('/:username/:reponame/insights', fetchRepoInsights);

module.exports = router;

