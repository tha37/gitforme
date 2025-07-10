const axios = require("axios");

exports.fetchRepoDetails = async (username, reponame) => {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${username}/${reponame}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "GitHub API error");
  }
};
