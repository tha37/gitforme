import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FileGraph } from './FileGraph';
import { DirectoryStructure } from './DirectoryStructure';
import { Icon } from './Iconsfile';
import { FullPageLoader, SkeletonLoader } from '../../Loaders/SkeletonLoader';
import { FileHistoryPanel } from './FileHistoryPanel';
import { FileContentModal } from '../PageContent/FileContentModal';
import { RepoHeaderCard } from '../cards/RepoHeaderCard';
import { AccordionCard } from '../cards/AccordionCard';
import { ContributorsList } from './ContributorList';
import { IssuesView } from './RepoIssues';
import { InsightsView } from './InsightsView';
import { FeatureStoryModal } from './FeatureStoryModal';
import { ReportModal } from './ReportModal';
import { GoodFirstIssues } from '../cards/GoodFirstIssues';
import { DependencyDashboard } from './DependencyDashboard';

const RepoDetailView = () => {
    const { username, reponame } = useParams();

    const [repoData, setRepoData] = useState({});
    const [readmeContent, setReadmeContent] = useState('');
    const [hierarchicalTree, setHierarchicalTree] = useState([]);
    const [flatTree, setFlatTree] = useState([]);
    const [contributors, setContributors] = useState([]);
    const [deployments, setDeployments] = useState([]);
    const [issues, setIssues] = useState({ open: [], closed: [] });
    const [goodFirstIssues, setGoodFirstIssues] = useState([]);
    const [insights, setInsights] = useState(null);
    const [hotspots, setHotspots] = useState([]);
    const [dependencyHealth, setDependencyHealth] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('directory'); // Default to directory view
    const [focusedNode, setFocusedNode] = useState(null);
    const [selectedFileForHistory, setSelectedFileForHistory] = useState(null);
    const [commitHistory, setCommitHistory] = useState([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [modalState, setModalState] = useState({ isOpen: false, content: '', fileName: '', fileUrl: '' });
    const [storyModalIssue, setStoryModalIssue] = useState(null);
    const [llmContext, setLlmContext] = useState('');
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportContent, setReportContent] = useState('');
    const [isReportLoading, setIsReportLoading] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);


    useEffect(() => {
        const buildHierarchy = (flatList) => {
            if (!flatList || flatList.length === 0) return [];
            const tree = [];
            const map = new Map(flatList.map(node => [node.path, { ...node, name: node.path.split('/').pop(), children: [] }]));
            map.forEach(node => {
                const parentPath = node.path.substring(0, node.path.lastIndexOf('/'));
                const parent = map.get(parentPath);
                if (parent) parent.children.push(node);
                else tree.push(node);
            });
            map.forEach(node => { if (node.children.length === 0) delete node.children; });
            return tree;
        };

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const apiServerUrl = import.meta.env.VITE_API_URL;
        
        const apiBase = `${apiServerUrl}/api/github/${username}/${reponame}`;
                const repoRes = await axios.get(apiBase, { withCredentials: true });
                const defaultBranch = repoRes.data.default_branch || 'main';

                const [readmeRes, treeRes, contributorsRes, deploymentsRes, issuesRes, goodFirstIssuesRes, insightsRes, hotspotsRes, dependenciesRes] = await Promise.all([
                    axios.get(`${apiBase}/readme`, { withCredentials: true }).catch(() => ({ data: { content: '' } })),
                    axios.get(`${apiBase}/git/trees/${defaultBranch}?recursive=1`, { withCredentials: true }).catch(() => ({ data: { tree: [] } })),
                    axios.get(`${apiBase}/contributors`, { withCredentials: true }).catch(() => ({ data: [] })),
                    axios.get(`${apiBase}/deployments`, { withCredentials: true }).catch(() => ({ data: [] })),
                    axios.get(`${apiBase}/issues`, { withCredentials: true }).catch(() => ({ data: { open: [], closed: [] } })),
                    axios.get(`${apiBase}/good-first-issues`, { withCredentials: true }).catch(() => ({ data: [] })),
                    axios.get(`${apiBase}/insights`, { withCredentials: true }).catch(() => ({ data: null })),
                    axios.get(`${apiBase}/hotspots`, { withCredentials: true }).catch(() => ({ data: [] })),
                    axios.get(`${apiBase}/insights/dependencies`, { withCredentials: true }).catch(() => ({ data: null }))
                ]);

                setRepoData(repoRes.data);
                setReadmeContent(readmeRes.data.content ? atob(readmeRes.data.content) : '# No README found');
                const treeData = treeRes.data.tree || [];
                setFlatTree(treeData);
                setHierarchicalTree(buildHierarchy(treeData));
                setContributors(contributorsRes.data || []);
                setIssues(issuesRes.data);
                setGoodFirstIssues(goodFirstIssuesRes.data);
                setInsights(insightsRes.data);
                setHotspots(hotspotsRes.data);
                setDependencyHealth(dependenciesRes.data);

                const activeDeployments = [];
                if (repoRes.data.homepage) {
                    activeDeployments.push({ url: repoRes.data.homepage, environment: 'Homepage' });
                }
                if (deploymentsRes.data && deploymentsRes.data.length > 0) {
                    deploymentsRes.data.forEach(dep => {
                        if (!activeDeployments.some(d => d.url === dep.url)) {
                            activeDeployments.push(dep);
                        }
                    });
                }
                setDeployments(activeDeployments);

            } catch (err) {
                setError(err.message || 'Failed to fetch repository data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [username, reponame]);

    const handleAddSingleIssueToContext = (issue) => {
        const issueContext = `
--- ISSUE #${issue.number}: ${issue.title} ---
State: ${issue.state}
URL: ${issue.html_url}
BODY: ${issue.body || 'No description.'}
----------------------------------
`;
        setLlmContext(prev => prev + issueContext);
        toast.success(`Added Issue #${issue.number} to context!`);
    };

    const handleAddFullStoryToContext = (fullContext) => {
        setLlmContext(prev => prev + fullContext);
        toast.success("Full feature story added to context!");
    };

    const handleFastClone = () => {
        const url = `vscode://vscode.git/clone?url=https://github.com/${username}/${reponame}`;
        window.location.href = url;
        toast.info('Launching VS Code to clone repository...');
    };

    const handleGenerateReport = () => {
        setIsReportLoading(true);
        setIsReportModalOpen(true);
        setReportContent('');

        const formatDuration = (ms) => {
            if (ms === null || ms === undefined) return 'N/A';
            const days = Math.floor(ms / (1000 * 60 * 60 * 24));
            const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            return `${days}d ${hours}h`;
        };

        setTimeout(() => {
            let md = `# 📊 Repository Report: ${repoData.full_name}\n\n`;
            md += `_${repoData.description}_\n\n`;
            md += `**URL:** [${repoData.html_url}](${repoData.html_url})\n`;
            md += `**Language:** ${repoData.language} | **Stars:** ${repoData.stargazers_count?.toLocaleString()} | **Forks:** ${repoData.forks_count?.toLocaleString()}\n\n`;

            md += `## 🚀 Key Insights\n`;
            if (insights) {
                md += `- **Average PR Merge Time:** ${formatDuration(insights.averageMergeTime)}\n`;
                md += `- **PR Acceptance Rate:** ${insights.acceptanceRate || '0'}%\n`;
                md += `_Based on the last ${insights.totalClosed || 0} closed PRs._\n\n`;
            } else {
                md += `_No PR insights available._\n\n`;
            }

            md += `## 📦 Dependency Health\n`;
            if (dependencyHealth && !dependencyHealth.error) {
                md += `- **Total Dependencies:** ${dependencyHealth.summary.total}\n`;
                md += `- **Outdated:** ${dependencyHealth.summary.outdated}\n`;
                md += `- **Deprecated:** ${dependencyHealth.summary.deprecated}\n\n`;
            } else {
                md += `_Dependency health could not be determined._\n\n`;
            }

            md += `## 🔥 Code Hotspots (Top 5)\n`;
            if (hotspots && hotspots.length > 0) {
                const topHotspots = [...hotspots].sort((a, b) => b.churn - a.churn).slice(0, 5);
                topHotspots.forEach(h => { md += `- **${h.path}** (${h.churn} changes)\n`; });
                md += `\n`;
            } else {
                md += `_No hotspot data available._\n\n`;
            }

            md += `## 👥 Top Contributors (Top 5)\n`;
            if (contributors && contributors.length > 0) {
                const topContributors = contributors.slice(0, 5);
                topContributors.forEach(c => { md += `- **${c.login}** (${c.contributions} contributions)\n`; });
                md += `\n`;
            } else {
                md += `_No contributor data available._\n\n`;
            }

            md += `## 📄 README Summary\n`;
            if (readmeContent && readmeContent !== '# No README found') {
                const summary = readmeContent.substring(0, 400);
                md += `\`\`\`\n${summary}...\n\`\`\`\n`;
            } else {
                md += `_No README found._\n\n`;
            }

            setReportContent(md);
            setIsReportLoading(false);
        }, 500);
    };

    const handleCreateSuperContext = () => {
        toast.info("Generating Super Context...");
        let context = `## 🚀 Repository Overview: ${repoData.full_name}\n`;
        context += `**Description:** ${repoData.description}\n`;
        context += `**Primary Language:** ${repoData.language}\n`;
        context += `**URL:** ${repoData.html_url}\n\n`;

        if (insights) {
            context += `## 📊 Project Insights\n`;
            const formatDuration = (ms) => {
                if (ms === null || ms === undefined) return 'N/A';
                const days = Math.floor(ms / (1000 * 60 * 60 * 24));
                const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                return `${days}d ${hours}h`;
            };
            context += `- **Average PR Merge Time:** ${formatDuration(insights.averageMergeTime)}\n`;
            context += `- **PR Acceptance Rate:** ${insights.acceptanceRate || '0'}%\n\n`;
        }

        if (hotspots && hotspots.length > 0) {
            context += `## 🔥 Code Hotspots (Most Changed Files)\n`;
            const topHotspots = [...hotspots].sort((a, b) => b.churn - a.churn).slice(0, 10);
            topHotspots.forEach(h => { context += `- ${h.path} (${h.churn} changes)\n`; });
            context += `\n`;
        }

        if (flatTree && flatTree.length > 0) {
            context += `## 📁 File Structure\n`;
            const filesToList = flatTree.map(file => `- ${file.path}`);
            context += filesToList.join('\n') + '\n\n';
        }

        if (dependencyHealth && !dependencyHealth.error) {
            context += `## 📦 Dependencies\n`;
            context += `**Summary:** Total: ${dependencyHealth.summary.total}, Outdated: ${dependencyHealth.summary.outdated}, Deprecated: ${dependencyHealth.summary.deprecated}\n`;
            if (dependencyHealth.dependencies.length > 0) {
                const allDeps = dependencyHealth.dependencies.map(d => `- ${d.name}: ${d.version}`);
                context += `**Dependency List:**\n${allDeps.join('\n')}\n`;
            }
            context += `\n`;
        }

        if (goodFirstIssues && goodFirstIssues.length > 0) {
            context += `## 🌱 Good First Issues\n`;
            const issuesToList = goodFirstIssues.slice(0, 5).map(issue => `- #${issue.number}: ${issue.title}`);
            context += issuesToList.join('\n') + '\n\n';
        }

        if (readmeContent) {
            context += `## 📄 README.md\n`;
            context += '```\n' + readmeContent + '\n```\n';
        }

        setLlmContext(context);
        toast.success("Super Context created and ready to copy!");
    };


    const handleFileSelect = async (fileNode) => {
        if (fileNode.type === 'tree') {
            setFocusedNode(fileNode);
            return;
        }

        try {
            const contentRes = await axios.get(`https://api.github.com/repos/${username}/${reponame}/contents/${fileNode.path}`, {
                headers: { Accept: 'application/vnd.github.v3.raw' }
            });
            const fileUrl = `https://github.com/${username}/${reponame}/blob/HEAD/${fileNode.path}`;
            setModalState({ isOpen: true, content: contentRes.data, fileName: fileNode.path, fileUrl });
        } catch (err) {
            console.error("Failed to fetch file content:", err);
            toast.error("Could not load file content. It might be binary or empty.");
        }

        setSelectedFileForHistory({ ...fileNode, owner: username, repo: reponame });
        setIsHistoryLoading(true);
        setCommitHistory([]);
        try {
        const apiServerUrl = import.meta.env.VITE_API_URL;

            const historyRes = await axios.get(`${apiServerUrl}/api/github/${username}/${reponame}/commits`, {
                params: { path: fileNode.path },
                withCredentials: true,
            });
            setCommitHistory(historyRes.data);
        } catch (err) {
            console.error("Failed to fetch commit history:", err);
            toast.error("Could not load commit history for this file.");
        } finally {
            setIsHistoryLoading(false);
        }
    };

    if (isLoading) return <FullPageLoader />;

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-4">
            <div className="text-5xl mb-4">🚫</div>
            <p className="text-center text-red-600 font-semibold text-2xl">Login to start cooking : </p>
            <p className="text-gray-600 mt-2 text-lg">{error}</p>
        </div>
    );

    const TabButton = ({ name, label }) => (
        <button onClick={() => setActiveTab(name)} className={`font-bold py-3 px-5 transition-colors duration-200 relative text-lg ${activeTab === name ? 'text-black' : 'text-gray-500 hover:text-black'}`}>
            {label}
            {activeTab === name && <div className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-t-full"></div>}
        </button>
    );

    return (
        <div className="w-full max-w-screen-2xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen font-sans text-gray-800">
            <ToastContainer theme="dark" position="bottom-right" />
            {modalState.isOpen && <FileContentModal {...modalState} onClose={() => setModalState({ ...modalState, isOpen: false })} />}
            <FileHistoryPanel file={selectedFileForHistory} history={commitHistory} isLoading={isHistoryLoading} onClose={() => setSelectedFileForHistory(null)} />
            {storyModalIssue && <FeatureStoryModal issue={storyModalIssue} username={username} reponame={reponame} onClose={() => setStoryModalIssue(null)} onAddContext={handleAddFullStoryToContext} />}
            <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} reportContent={reportContent} isLoading={isReportLoading} />


            <RepoHeaderCard {...{ username, reponame, repoData, deployments, onFastClone: handleFastClone, onGenerateReport: handleGenerateReport, isReportLoading, onAiChatClick: () => setIsChatOpen(true) }} />

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-black rounded-xl shadow-[8px_8px_0px_rgba(0,0,0,1)] h-full flex flex-col">
                        <div className="flex border-b-2 border-black mb-1 flex-shrink-0">
                            <TabButton name="directory" label="Directory" />
                            <TabButton name="graph" label="File Map" />
                            <TabButton name="issues" label="Issues" />
                            <TabButton name="insights" label="Insights" />
                        </div>
                        <div className="flex-grow overflow-y-auto p-2 sm:p-4 min-h-[40rem]">
                            {activeTab === 'directory' && <DirectoryStructure tree={hierarchicalTree} onFileSelect={handleFileSelect} hotspots={hotspots} />}
                            {activeTab === 'graph' && <FileGraph treeData={flatTree} onFileSelect={handleFileSelect} onFolderSelect={setFocusedNode} focusedNode={focusedNode} hotspots={hotspots} />}
                            {activeTab === 'issues' && <IssuesView issues={issues} onAddContext={handleAddSingleIssueToContext} onShowStory={setStoryModalIssue} />}
                            {activeTab === 'insights' && (
                                <div>
                                    <InsightsView insights={insights} />
                                    <div className="my-6 border-t-2 border-dashed border-gray-300"></div>
                                    <DependencyDashboard dependencyHealth={dependencyHealth} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 flex flex-col gap-8">
                    <div className="bg-white p-4 sm:p-6 border-2 border-black rounded-xl shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                        <h3 className="font-bold text-xl border-b-2 border-black mb-4 pb-2">LLM Context Builder</h3>
                        <textarea
                            value={llmContext}
                            onChange={(e) => setLlmContext(e.target.value)}
                            placeholder="Click 'Add Context' on an issue or 'Create Super Context' to start building a prompt..."
                            className="w-full h-48 p-3 bg-[#FEF9F2] border-2 border-gray-400 rounded-lg resize-none font-mono text-base focus:ring-amber-500 focus:border-amber-500"
                        />
                        <div className="mt-2 flex flex-col sm:flex-row gap-2">
                            <button
                                onClick={handleCreateSuperContext}
                                className="w-full px-4 py-3 bg-amber-400 text-black font-bold rounded-lg border-2 border-black hover:bg-amber-500 transition-colors text-base"
                            >
                                ✨ Create Super Context
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(llmContext);
                                    toast.success("Context copied to clipboard!");
                                }}
                                disabled={!llmContext}
                                className="w-full px-4 py-3 bg-black text-white font-bold rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed text-base"
                            >
                                Copy Context
                            </button>
                        </div>
                    </div>

                    <AccordionCard title={`Find an Issue to Work On (${goodFirstIssues.length})`} icon="🌱" defaultOpen={true}>
                        <GoodFirstIssues issues={goodFirstIssues} />
                    </AccordionCard>

                    <AccordionCard title={`Contributors (${contributors.length})`} icon="👥" defaultOpen={false}>
                        <ContributorsList contributors={contributors} />
                    </AccordionCard>

            <AccordionCard title="README.md" icon="📄" defaultOpen={false}>
    <div className="prose prose-lg max-w-none overflow-y-auto max-h-[60vh] bg-[#FEF9F2] p-4 rounded-lg border-2 border-gray-200">
        <ReactMarkdown>{readmeContent}</ReactMarkdown>
    </div>
</AccordionCard>
                </div>
            </div>
        </div>
    );
};

export default RepoDetailView;
