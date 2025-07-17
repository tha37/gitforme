import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ChatbotPanel from './Chatbot';
import RepoDetailView from './RepoDetailView';
import LandingPageContent from '../PageContent/LandingPageContent';
import { AppHeader } from '../PageContent/AppHeader';
import { ChatIcon, LaptopIcon } from './icons';

const GitformeUi = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const { username, reponame } = useParams();
    const [repoUrl, setRepoUrl] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const apiServerUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (username && reponame) {
            setRepoUrl(`https://github.com/${username}/${reponame}`);
        }
    }, [username, reponame]);

    const handleGitHubLogin = () => {
        window.location.href = `${apiServerUrl}/api/auth/github`;
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handlecook = () => {
        if (!repoUrl) {
            alert('Please enter a GitHub repository URL.');
            return;
        }
        try {
            const url = new URL(repoUrl);
            const pathParts = url.pathname.split('/').filter(part => part);
            if (pathParts.length >= 2) {
                navigate(`/${pathParts[0]}/${pathParts[1]}`);
            } else {
                alert('Invalid GitHub repository URL format.');
            }
        } catch (e) {
            alert('Invalid URL format.');
        }
    };

    return (
        <div className="bg-[#FDFCFB] bg-[radial-gradient(#d1d1d1_1px,transparent_1px)] [background-size:24px_24px] min-h-screen font-sans text-gray-800 relative">
            <AppHeader 
                isAuthenticated={isAuthenticated} 
                user={user} 
                onLogout={handleLogout} 
                onLogin={handleGitHubLogin} 
                repoUrl={repoUrl} 
                setRepoUrl={setRepoUrl} 
                oncook={handlecook}
            />

            <AnimatePresence mode="wait">
                {!username || !reponame ? (
                    <LandingPageContent key="landing" />
                ) : (
                    <motion.main key="repo-detail" className="container mx-auto" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                        <RepoDetailView />
                    </motion.main>
                )}
            </AnimatePresence>
            
            <footer className="text-center py-8 px-4 mt-16 border-t-2 border-black bg-white/50">
                <div className="flex flex-col items-center gap-3">
                    <p className="flex items-center gap-2 text-gray-600 font-medium">
                        <LaptopIcon />
                        <span>Built by Herin</span>
                    </p>
                    <p className="text-gray-500 text-sm">&copy; 2025 GitForMe. All Rights Reserved.</p>
                </div>
            </footer>

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
            <AnimatePresence>
                {isChatOpen && <ChatbotPanel onClose={() => setIsChatOpen(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default GitformeUi;
