import React from 'react';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { Icon } from '../components/Iconsfile';

export const RepoHeaderCard = ({ username, reponame, repoData, deployments, onFastClone, onGenerateReport, isReportLoading, onAiChatClick }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
        <div className="bg-white p-6 border-2 border-black rounded-xl shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <h1 className="text-4xl font-bold tracking-tighter mb-2">
                <a href={`https://github.com/${username}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{username}</a> / 
                <a href={`https://github.com/${username}/${reponame}`} target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:underline"> {reponame}</a>
            </h1>
            <p className="text-lg text-gray-600 mb-4">{repoData.description}</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-5 text-gray-800 text-lg">
                <span className="font-semibold flex items-center gap-1.5">
                    <Icon path="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" className="w-5 h-5 text-yellow-500" />
                    {repoData.stargazers_count?.toLocaleString() || 0}
                </span>
                <span className="font-semibold flex items-center gap-1.5">
                    <Icon path="M10.061 19.061A7.5 7.5 0 1019.061 10.06a7.5 7.5 0 00-9.001 9.001zM11.25 11.25a.75.75 0 00-1.5 0v2.548a.75.75 0 001.5 0V11.25zm-2.13-3.06a.75.75 0 10-1.06-1.06 3.75 3.75 0 013.18-1.688 1.5 1.5 0 011.06 2.563 4.501 4.501 0 00-2.12 2.12 .75.75 0 001.06 1.06 6 6 0 01-2.12-3.994z" className="w-5 h-5" />
                    {repoData.forks_count?.toLocaleString() || 0} Forks
                </span>
                <span className="font-semibold flex items-center gap-1.5">
                    <Icon path="M17.25 6.75c0 3.142-2.558 5.69-5.69 5.69s-5.69-2.548-5.69-5.69c0-3.142 2.558-5.69 5.69-5.69s5.69 2.548 5.69 5.69z" className="w-5 h-5 text-blue-500" />
                    {repoData.language || 'N/A'}
                </span>
            </div>
            <div className="flex flex-wrap gap-3">
                {deployments && deployments.length > 0 && (
                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setIsDropdownOpen(prev => !prev)} className="px-6 py-3 bg-green-100 text-green-800 font-bold border-2 border-green-800 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_rgba(45,155,90,1)] active:shadow-none active:translate-x-1 active:translate-y-1 text-base">
                            🌐 Deployments ({deployments.length})
                            <svg className={`w-4 h-4 transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute top-full mt-2 w-max min-w-full bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,1)] z-10 overflow-hidden">
                                <ul className="divide-y-2 divide-black">
                                    {deployments.map((dep) => (<li key={dep.url}><a href={dep.url} target="_blank" rel="noopener noreferrer" className="block w-full text-left px-4 py-3 hover:bg-amber-100 transition-colors font-semibold text-base"><span className="mr-2 capitalize">{dep.environment}</span></a></li>))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
                <button onClick={onFastClone} className="px-6 py-3 bg-white text-black font-bold border-2 border-black rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 text-base">🚀 FastClone</button>
                <button
                    onClick={onGenerateReport}
                    disabled={isReportLoading}
                    className="px-6 py-3 bg-blue-100 text-blue-800 font-bold border-2 border-blue-800 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_rgba(29,78,216,1)] active:shadow-none active:translate-x-1 active:translate-y-1 disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-400 disabled:cursor-wait disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 text-base"
                >
                    {isReportLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Generating...
                        </>
                    ) : ( "📄 Generate Report" )}
                </button>
                        </div>
        </div>
    );
};

