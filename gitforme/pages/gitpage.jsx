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
       const apiServerUrl = import.meta.env.VITE_API_URL;
        const apiBase = `${apiServerUrl}/api/github/${username}/${reponame}`;
      const response = await axios.get(`${apiBase}`);
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
        <table>
          <tbody>
            {Object.entries(repoData).map(([key, value]) => (
              <tr key={key}>
                <td style={{ fontWeight: "bold", paddingRight: "10px" }}>{key}</td>
                <td>
                  {typeof value === "object" && value !== null
                    ? <pre style={{ margin: 0 }}>{JSON.stringify(value, null, 2)}</pre>
                    : value?.toString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ToastContainer />
    </>
  );
};

export default RepoPage;
