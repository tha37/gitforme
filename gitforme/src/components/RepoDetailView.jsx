import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
// --- Sub-components for better organization ---

const AnalysisSummary = ({ repoData }) => (
  <div className="bg-[#FEF9F2] p-4 border-2 border-black rounded-lg h-full overflow-y-auto">
    <h3 className="font-bold mb-2">Analysis Summary:</h3>
    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
      <li>Language: {repoData.language || 'N/A'}</li>
      <li>Total files: {repoData.size}</li>
      <li>Files analyzed: 2</li>
      <li>Total size: {repoData.size} KB</li>
      <li>Functions found: 21</li>
    </ul>
  </div>
);

const DirectoryStructure = ({ tree }) => {
  const [expandedDirs, setExpandedDirs] = useState(new Set());

  const handleDirClick = (path) => {
    setExpandedDirs((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(path)) {
        newExpanded.delete(path);
      } else {
        newExpanded.add(path);
      }
      return newExpanded;
    });
  };

  const renderedTree = useMemo(() => {
    const renderNode = (node, depth = 0) => (
      <li key={node.path} className="font-mono text-sm leading-6">
        <div
          className={`flex items-center ${node.type === 'tree' ? 'cursor-pointer hover:text-amber-500' : ''}`}
          onClick={() => node.type === 'tree' && handleDirClick(node.path)}
          aria-expanded={node.type === 'tree' ? expandedDirs.has(node.path) : undefined}
          aria-label={node.type === 'tree' ? `${expandedDirs.has(node.path) ? 'Collapse' : 'Expand'} ${node.name}` : node.name}
        >
          <span className="mr-1 w-4 inline-block">
            {node.type === 'tree' ? (expandedDirs.has(node.path) ? '▼' : '▶') : ''}
          </span>
          <span>{node.type === 'tree' ? '📁' : '📄'}</span>
<span className="ml-2 text-gray-900">{node.name}</span>
        </div>
        {node.children && node.children.length > 0 && expandedDirs.has(node.path) && (
          <ul className="pl-4 border-l border-gray-300 ml-2">{node.children.map((child) => renderNode(child, depth + 1))}</ul>
        )}
      </li>
    );

    return <ul>{tree.map((node) => renderNode(node))}</ul>;
  }, [tree, expandedDirs]);

  return (
    <div className="bg-[#FEF9F2] p-4 border-2 border-black rounded-lg h-full overflow-y-auto">
      <h3 className="font-bold mb-2">Directory structure:</h3>
      {tree.length > 0 ? renderedTree : <p className="text-sm text-gray-500">No directory structure available.</p>}
    </div>
  );
};

const ContributorsList = ({ contributors }) => (
  <div className="mt-8">
    <h2 className="font-bold text-xl mb-4">Top Contributors</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {contributors.map((contributor) => (
        <div key={contributor.id} className="bg-[#FEF9F2] p-4 border-2 border-black rounded-lg flex items-center gap-4 hover:shadow-lg transition-shadow">
          <img src={contributor.avatar_url} alt={`${contributor.login}'s avatar`} className="w-16 h-16 rounded-full border-2 border-black" />
          <div>
            <a href={contributor.html_url} target="_blank" rel="noopener noreferrer" className="font-bold hover:underline">{contributor.login}</a>
            <p className="text-sm text-gray-600">{contributor.contributions} contributions</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- Main View Component ---
const RepoDetailView = () => {
  const { username, reponame } = useParams();
  const [repoData, setRepoData] = useState({});
  const [readmeContent, setReadmeContent] = useState('');
  const [tree, setTree] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReadmeVisible, setIsReadmeVisible] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [repoRes, readmeRes, treeRes, contributorsRes] = await Promise.all([
          axios.get(`https://api.github.com/repos/${username}/${reponame}`),
          axios.get(`https://api.github.com/repos/${username}/${reponame}/readme`),
          axios.get(`https://api.github.com/repos/${username}/${reponame}/git/trees/main?recursive=1`).catch(() => ({ data: { tree: [] } })),
          axios.get(`https://api.github.com/repos/${username}/${reponame}/contributors`)
        ]);

        setRepoData(repoRes.data);
        setReadmeContent(atob(readmeRes.data.content));
        setContributors(contributorsRes.data);

    
        // --- CORRECTED AND IMPROVED TREE BUILDING LOGIC ---
        const buildTree = (paths) => {
          const tree = [];
          const map = {};

          // First, create a map of all nodes, correctly setting the 'name' property
          paths.forEach(item => {
            const name = item.path.substring(item.path.lastIndexOf('/') + 1);
            map[item.path] = { ...item, name, children: [] };
          });

          // Then, link children to their parents
          Object.values(map).forEach(item => {
            const parentPath = item.path.substring(0, item.path.lastIndexOf('/'));
            if (parentPath && map[parentPath]) {
              map[parentPath].children.push(item);
            } else {
              tree.push(item); // This is a root node
            }
          });
          return tree;
        };

        setTree(buildTree(treeRes.data.tree || []));

      } catch (err) {
        setError('Failed to fetch repository data. The repository might be private, or the name is incorrect.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [username, reponame]);
  // --- NEW: Custom renderers for ReactMarkdown ---
  const markdownComponents = {
    h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-4 mb-3" {...props} />,
    p: ({node, ...props}) => <p className="mb-4" {...props} />,
    a: ({node, ...props}) => <a className="text-amber-600 hover:underline" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4" {...props} />,
    code({node, inline, className, children, ...props}) {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <SyntaxHighlighter style={atomDark} language={match[1]} PreTag="div" {...props}>
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-gray-200 text-red-500 font-mono px-1 rounded" {...props}>
          {children}
        </code>
      )
    }
  }

  if (isLoading) return <div className="text-center p-10">Loading Repository...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
      <div className="bg-white p-4 border-2 border-black rounded-xl shadow-[8px_8px_0px_rgba(0,0,0,1)]">
        <div className="flex border-b-2 border-black mb-4">
          <button className="font-bold py-2 px-4 border-b-4 border-black">Summary</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64">
          <AnalysisSummary repoData={repoData} />
          <DirectoryStructure tree={tree} />
        </div>
      </div>
      <ContributorsList contributors={contributors} />
      {isReadmeVisible && (
        <div className="mt-8 bg-white p-4 border-2 border-black rounded-xl shadow-[8px_8px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-center border-b-2 border-black mb-4 pb-2">
            <h2 className="font-bold text-lg">README.md</h2>
            <button onClick={() => setIsReadmeVisible(false)} className="bg-[#FEF9F2] text-sm font-semibold px-4 py-1 border-2 border-black rounded-lg hover:bg-amber-100">Hide</button>
          </div>
          <div className="prose max-w-none p-4 bg-[#FEF9F2] rounded-lg overflow-y-auto">
            <ReactMarkdown components={markdownComponents}>
              {readmeContent}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepoDetailView;
