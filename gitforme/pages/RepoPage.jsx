import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

// Custom hook for fetching repo data
const useFetchRepo = (username, reponame) => {
  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRepo = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/github/${username}/${reponame}`);
        setRepoData(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch repository data');
        toast.error(err.message || 'Failed to fetch repository data');
      } finally {
        setLoading(false);
      }
    };
    fetchRepo();
  }, [username, reponame]);

  return { repoData, loading, error };
};

const RepoPage = () => {
  const { username, reponame } = useParams();
  const { repoData, loading, error } = useFetchRepo(username, reponame);

  if (loading) return <div aria-live="polite">Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="repo-details">
        <h1>{repoData.full_name}</h1>
        <table>
          <tbody>
            {Object.entries(repoData).map(([key, value]) => (
              <tr key={key}>
                <td style={{ fontWeight: 'bold', paddingRight: '10px' }}>{key}</td>
                <td>
                  {typeof value === 'object' && value !== null
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
