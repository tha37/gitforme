import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ChatbotPanel from './Chatbot';
import RepoDetailView from './RepoDetailView';
import LandingPageContent from '../PageContent/LandingPageContent';
import { AppHeader } from '../PageContent/AppHeader';

// --- Icon Components (Consider moving to Iconsfile.jsx if they grow) ---
const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const LaptopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55A1 1 0 0 1 20.28 20H3.72a1 1 0 0 1-.98-1.45L4 16"/>
  </svg>
);

// --- Main Gitforme UI Component ---
const GitformeUi = () => {
    // Authentication and Navigation Hooks
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const { username, reponame } = useParams();

    // State for Repo URL and Chat Panel
    const [repoUrl, setRepoUrl] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Environment variable for API server URL
    const apiServerUrl = import.meta.env.VITE_API_URL;

    // Update repoUrl state when URL parameters change
    useEffect(() => {
        if (username && reponame) {
            setRepoUrl(`https://github.com/${username}/${reponame}`);
        }
    }, [username, reponame]); // Dependency array ensures this runs only when username or reponame changes

    // GitHub Login Handler
    const handleGitHubLogin = () => {
        window.location.href = `${apiServerUrl}/api/auth/github`;
    };

    // Logout Handler
    const handleLogout = async () => {
        await logout();
        navigate('/'); // Redirect to landing page after logout
    };

    // Handle "cook" button/Enter key for repo URL
    const handleCookRepoUrl = () => {
        if (!repoUrl) {
            alert('Please enter a GitHub repository URL.');
            return;
        }
        try {
            const url = new URL(repoUrl);
            const pathParts = url.pathname.split('/').filter(part => part);
            // Expecting format like github.com/owner/repo
            if (pathParts.length >= 2) {
                navigate(`/${pathParts[0]}/${pathParts[1]}`);
            } else {
                alert('Invalid GitHub repository URL format. Example: https://github.com/owner/repo');
            }
        } catch (e) {
            alert('Invalid URL format. Please enter a valid URL.');
        }
    };

 return (
        <div className="bg-[#FDFCFB] bg-[radial-gradient(#d1d1d1_1px,transparent_1px)] [background-size:24px_24px] min-h-screen font-sans text-gray-800 relative">
              <canvas id="codeCanvas" className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-20"></canvas>
            <AppHeader 
                isAuthenticated={isAuthenticated} 
                user={user} 
                onLogout={handleLogout} 
                onLogin={handleGitHubLogin} 
                repoUrl={repoUrl} 
                setRepoUrl={setRepoUrl} 
                oncook={handleCookRepoUrl} 
            />

            {/* Unique UI: Portal to Repository Transition */}
            {/* The outer motion.div applies effects to the whole content area */}
            <AnimatePresence mode="wait">
                <motion.div 
                    key={username && reponame ? "repo-view-active" : "landing-view-active"} // Key helps AnimatePresence detect change
                    initial={{ opacity: 0, scale: 0.98, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.98, filter: 'blur(5px)', transition: { duration: 0.5 } }} // Transition out quickly
                    transition={{ duration: 0.7, ease: "easeOut" }} // Transition in smoothly
                    className="flex-grow" // Ensures it takes available space
                >
                    {!username || !reponame ? (
                        <LandingPageContent key="landing" />
                    ) : (
                        <motion.main 
                            key="repo-detail" 
                            className="container mx-auto" 
                            initial={{opacity: 0}} 
                            animate={{opacity: 1}} 
                            exit={{opacity: 0}} // Inner fade for RepoDetailView itself
                        >
                            <RepoDetailView />
                        </motion.main>
                    )}
                </motion.div>
            </AnimatePresence>
            
            {/* Footer - Updated from previous response */}
            <footer className="text-center py-8 px-4 mt-16 border-t-2 border-black bg-white/50">
                <div className="flex flex-col items-center gap-3">
                    <p className="flex items-center gap-2 text-gray-600 font-medium">
                        Inspired by: <a href="https://gitingest.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Gitingest.com</a>
                    </p>
                    <p className="flex items-center gap-2 text-gray-600 font-medium">
                        <LaptopIcon />
                        Created by <a href="https://github.com/herin7" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Herin</a>
                    </p>
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} GitForMe. All Rights Reserved.
                    </p>
                </div>
            </footer>

            {/* Floating Chatbot Button */}
            <AnimatePresence>
                {!isChatOpen && (
                    <motion.button
                        onClick={() => setIsChatOpen(true)}
                        className="fixed bottom-6 right-6 bg-[#F9C79A] text-black p-4 rounded-full border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] z-40"
                        initial={{ scale: 0, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, y: 50 }}
                        whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}
                        aria-label="Open Chat"
                    >
                        <ChatIcon />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chatbot Panel */}
            <AnimatePresence>
                {isChatOpen && <ChatbotPanel onClose={() => setIsChatOpen(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default GitformeUi;