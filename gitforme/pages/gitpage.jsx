import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const RepoPage = () => {
  const { username, reponame } = useParams();
  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchrepo() {
    try {
      const response = await axios.get(`http://localhost:3000/api/github/${username}/${reponame}`);
      console.log(response);
      setRepoData(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to fetch repository data");
      setLoading(false);
      toast.error(err.message || "Failed to fetch repository data");
    }
  }

  useEffect(() => {
    fetchrepo();
  }, [username, reponame]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="repo-details">
        <h1>{repoData.full_name}</h1>
        <p>{repoData.description || "No description provided."}</p>
        <p>Stars: {repoData.stargazers_count}</p>
        <p>Forks: {repoData.forks_count}</p>
        <p>Open Issues: {repoData.open_issues_count}</p>
        {/* Add more repo details and gamified UI here */}
      </div>
      <ToastContainer />
    </>
  );
};

export default RepoPage;
