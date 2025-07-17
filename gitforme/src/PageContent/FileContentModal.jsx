import React, { useState, useEffect, useMemo, useRef } from 'react';

import axios from 'axios';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Icon } from '../components/Iconsfile';
export const FileContentModal = ({ content, fileName, fileUrl, onClose }) => {
    const isMarkdown = fileName?.toLowerCase().endsWith('.md');
    const language = fileName?.split('.').pop() || 'text';
    const displayContent = useMemo(() => {
        if (typeof content === 'string') return content;
        if (typeof content === 'object' && content !== null) {
            try { return JSON.stringify(content, null, 2); } 
            catch (e) { return '[Could not display complex object]'; }
        }
        return String(content ?? '');
    }, [content]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white p-5 border-2 border-black rounded-xl max-w-5xl w-full max-h-[85vh] flex flex-col shadow-[8px_8px_0px_rgba(0,0,0,1)]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-black flex-shrink-0">
                    <h3 className="font-bold text-xl truncate" title={fileName}>{fileName}</h3>
                    <div className="flex items-center gap-4">
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-base font-semibold text-amber-700 hover:underline">View on GitHub</a>
                        <button onClick={onClose} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-base font-bold border-2 border-red-700">Close</button>
                    </div>
                </div>
                <div className="overflow-y-auto min-h-0 text-base">
                    {content != null ? (
                        isMarkdown ? (
                            <div className="prose prose-lg max-w-none p-2">
                                <ReactMarkdown>{displayContent}</ReactMarkdown>
                            </div>
                        ) : (
                            <SyntaxHighlighter style={atomDark} language={language} PreTag="div" customStyle={{ margin: 0, borderRadius: '0.5rem', fontSize: '1rem' }}>
                                {displayContent}
                            </SyntaxHighlighter>
                        )
                    ) : (
                        <div className="text-center p-8 text-gray-500">
                            <p className="font-semibold text-lg">No Content</p>
                            <p className="text-base">The content for this file is empty or could not be loaded.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
