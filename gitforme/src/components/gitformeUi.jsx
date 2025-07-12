import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

// --- 1. IMPORT THE CORRECT AXIOS INSTANCE 
//  your configured client


// Assuming you have these components in the specified paths
import { GitHubIcon, SparkleIcon, BlobIcon, ChatIcon } from './icons';
import Chatbot from './Chatbot';
import RepoDetailView from './RepoDetailView';
import apiClient from '../api/axiosConfig';


const gitformeUi = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const { username, reponame } = useParams();

  // State for the main page form elements
  const [sliderValue, setSliderValue] = useState(50);
  const [repoUrl, setRepoUrl] = useState('https://github.com/...');
  
  // State for the chatbot
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // State for the repository data view
  const [repoData, setRepoData] = useState(null); // This is no longer needed here, as RepoDetailView handles its own data
  const [isLoading, setIsLoading] = useState(false); // This can also be moved to RepoDetailView
  const [error, setError] = useState(null); // This can also be moved to RepoDetailView


  // --- 2. THIS ENTIRE useEffect IS NO LONGER NEEDED HERE ---
  // The data fetching logic is now correctly handled inside RepoDetailView.
  // This simplifies GitformeUi to be just a router/layout component.
  /*
  useEffect(() => {
    if (username && reponame) {
      setIsLoading(true);
      setError(null);
      // --- THIS IS THE FIX: Use apiClient instead of axios ---
      apiClient.get(`/github/${username}/${reponame}`)
        .then(response => {
          setRepoData(response.data);
        })
        .catch(err => {
          console.error('Error fetching repo:', err);
          setError('Failed to fetch repository data. Please check the URL.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setRepoData(null); 
    }
  }, [username, reponame]);
  */


  const handleGitHubLogin = () => {
    window.location.href = 'http://localhost:3000/api/auth/github';
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleProbe = () => {
    try {
        const url = new URL(repoUrl);
        const pathParts = url.pathname.split('/').filter(part => part);
        if (pathParts.length >= 2) {
            const owner = pathParts[0];
            const repo = pathParts[1];
            navigate(`/${owner}/${repo}`);
        } else {
            alert('Invalid GitHub repository URL');
        }
    } catch (e) {
        alert('Invalid URL format');
    }
  };

  return (
    <div className="bg-[#F8F8F8] min-h-screen font-sans text-gray-800 relative">
      <header className="py-4 px-8 md:px-16">
        <nav className="flex justify-between items-center">
          <a href="/" className="text-xl font-bold">GitForMe</a>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="font-semibold">Welcome, {user?.username}!</span>
                <button onClick={handleLogout} className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <button onClick={handleGitHubLogin} className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                <GitHubIcon />
                <span className="font-semibold">Login with GitHub</span>
              </button>
            )}
          </div>
        </nav>
      </header>

      <main className="flex flex-col items-center justify-center pt-10 md:pt-20 px-4">
        {!username && !reponame ? (
          <>
            {/* Hero Section */}
            <div className="relative text-center">
              <SparkleIcon className="top-[-3rem] left-[-5rem] w-20 h-20 text-red-300 rotate-[-15deg] opacity-80" />
              <SparkleIcon className="top-[-1rem] right-[-5rem] w-24 h-24 text-teal-300 rotate-[20deg] opacity-80" />
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">Code to</h1>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mt-2">LLM-context</h1>
              <p className="mt-6 text-lg text-gray-600 max-w-md mx-auto">
                Turn any Git repo into a structured summary of its architecture and logic. Perfect for giving LLMs instant context.
              </p>
            </div>

            {/* Main Interaction Card */}
            <div className="relative mt-12 w-full max-w-2xl bg-[#FEF9F2] border-2 border-black rounded-2xl p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                <BlobIcon />
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        aria-label="Repository URL"
                    />
                    <button onClick={handleProbe} className="bg-[#F9C79A] text-black font-bold px-8 py-3 border-2 border-black rounded-lg hover:bg-amber-400 transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                        Probe
                    </button>
                </div>
            </div>
          </>
        ) : (
          <RepoDetailView />
        )}
      </main>

      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-4 right-4 bg-[#F9C79A] text-black p-3 rounded-full shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-amber-400 transition-all z-50"
        aria-label="Toggle chatbot"
      >
        <ChatIcon />
      </button>

      {isChatOpen && <Chatbot onClose={() => setIsChatOpen(false)} />}
    </div>
  );
};

export default gitformeUi;
