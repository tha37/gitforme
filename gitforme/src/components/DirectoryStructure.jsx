import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Icon } from './icons';


export const DirectoryStructure = ({ tree, onFileSelect, hotspots }) => {
    const [expandedDirs, setExpandedDirs] = useState(new Set());
    const hotspotMap = useMemo(() => new Map((hotspots || []).map(h => [h.path, h.churn])), [hotspots]);
    const maxChurn = useMemo(() => Math.max(1, ...hotspots.map(h => h.churn)), [hotspots]);

    const getHotspotIcon = (path) => {
        if (!hotspotMap.has(path)) return null;
        const churn = hotspotMap.get(path);
        const intensity = churn / maxChurn;
        if (intensity > 0.66) return <span className="ml-2 text-red-500" title={`High Churn: ${churn}`}>💥</span>;
        if (intensity > 0.33) return <span className="ml-2 text-orange-500" title={`Medium Churn: ${churn}`}>🔥</span>;
        return <span className="ml-2 text-yellow-500" title={`Low Churn: ${churn}`}>✨</span>;
    };

    const handleToggle = (path) => {
        setExpandedDirs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(path)) newSet.delete(path);
            else newSet.add(path);
            return newSet;
        });
    };

    const renderNode = (node) => {
        const isExpanded = expandedDirs.has(node.path);
        const isTree = node.type === 'tree';

        return (
            <li key={node.path} className="font-mono text-base leading-8 relative">
                <div className="absolute left-0 top-0 h-full w-px bg-gray-200 ml-[14px]"></div>
                <div 
                    className="flex items-center cursor-pointer hover:bg-amber-50 p-1 rounded relative" 
                    onClick={() => isTree ? handleToggle(node.path) : onFileSelect(node)}
                >
                    <span className="w-7 inline-block text-center text-gray-400">
                        {isTree && (isExpanded ? <Icon path="M19.5 8.25l-7.5 7.5-7.5-7.5" className="w-4 h-4 mx-auto" /> : <Icon path="M8.25 4.5l7.5 7.5-7.5 7.5" className="w-4 h-4 mx-auto" />)}
                    </span>
                    <span className="ml-1 text-xl">{isTree ? '📁' : '📄'}</span>
                    <span className="ml-2 text-gray-800">{node.name}</span>
                    {getHotspotIcon(node.path)}
                </div>
                {node.children && isExpanded && (<ul className="pl-7">{node.children.map(renderNode)}</ul>)}
            </li>
        );
    };
    
    return (
        <div>
            <ul>{tree.map(renderNode)}</ul>
            <div className="mt-6 p-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-sm text-gray-600">
                <h4 className="font-bold mb-2 text-gray-700">Hotspot Legend:</h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span><span className="text-red-500">💥</span> High Churn</span>
                    <span><span className="text-orange-500">🔥</span> Medium Churn</span>
                    <span><span className="text-yellow-500">✨</span> Low Churn</span>
                </div>
            </div>
        </div>
    );
};
