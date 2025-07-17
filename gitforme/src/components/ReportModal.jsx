import ReactMarkdown from 'react-markdown';
export const ReportModal = ({ isOpen, onClose, reportContent, isLoading }) => {
    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(reportContent);
        toast.success("Report copied to clipboard!");
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white p-6 border-2 border-black rounded-xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-[8px_8px_0px_rgba(0,0,0,1)]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-black flex-shrink-0">
                    <h3 className="font-bold text-2xl">Generated Repository Report</h3>
                    <div className="flex items-center gap-4">
                        <button onClick={handleCopy} disabled={isLoading || !reportContent} className="px-4 py-2 bg-amber-400 text-black rounded-lg hover:bg-amber-500 text-base font-bold border-2 border-black disabled:bg-gray-300 disabled:cursor-not-allowed">Copy Report</button>
                        <button onClick={onClose} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-base font-bold border-2 border-red-700">Close</button>
                    </div>
                </div>
                <div className="overflow-y-auto min-h-0">
                    {isLoading ? (
                        <div className="flex flex-col justify-center items-center h-full p-10 text-center">
                            <svg className="animate-spin h-8 w-8 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <p className="text-lg font-semibold animate-pulse">Generating your report...</p>
                        </div>
                    ) : (
                        <div className="prose prose-lg max-w-none p-2">
                           <ReactMarkdown>{reportContent}</ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
