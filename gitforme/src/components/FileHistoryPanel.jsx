import { SkeletonLoader } from "../../Loaders/SkeletonLoader";
import { Icon } from "./icons";


export const FileHistoryPanel = ({ file, history, isLoading, onClose }) => {
    if (!file) return null;
    return (
        <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l-2 border-black shadow-2xl z-50 transform transition-transform duration-300 ease-in-out" style={{ transform: file ? 'translateX(0)' : 'translateX(100%)' }}>
            <div className="p-4 border-b-2 border-black flex justify-between items-center bg-gray-50">
                <div>
                    <h3 className="font-bold text-xl truncate" title={file.path}>{file.path}</h3>
                    <p className="text-base text-gray-500">Commit History</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                    <Icon path="M6.225 4.811a1 1 0 00-1.414 1.414L10.586 12 4.81 17.775a1 1 0 101.414 1.414L12 13.414l5.775 5.775a1 1 0 001.414-1.414L13.414 12l5.775-5.775a1 1 0 00-1.414-1.414L12 10.586 6.225 4.811z" />
                </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-82px)]">
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="space-y-2 p-2">
                                <SkeletonLoader className="h-5 w-3/4" />
                                <SkeletonLoader className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : history.map(commit => (
                    <div key={commit.sha} className="mb-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <p className="font-semibold text-base text-gray-800">{commit.commit.message}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            by <span className="font-medium">{commit.commit.author.name}</span> on {new Date(commit.commit.author.date).toLocaleDateString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
