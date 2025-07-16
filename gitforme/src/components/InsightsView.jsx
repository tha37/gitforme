

export const InsightsView = ({ insights }) => {
    const formatDuration = (ms) => {
        if (ms === null || ms === undefined) return 'N/A';
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return `${days}d ${hours}h`;
    };

    return (
        <div className="p-4">
            <h3 className="text-2xl font-bold mb-4">Pull Request Insights</h3>
            {insights ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#FEF9F2] p-4 border-2 border-black rounded-lg">
                        <p className="text-base text-gray-600">Average Merge Time</p>
                        <p className="text-3xl font-bold">{formatDuration(insights.averageMergeTime)}</p>
                    </div>
                    <div className="bg-[#FEF9F2] p-4 border-2 border-black rounded-lg">
                        <p className="text-base text-gray-600">PR Acceptance Rate</p>
                        <p className="text-3xl font-bold">{insights.acceptanceRate || '0'}%</p>
                    </div>
                    <div className="bg-gray-100 p-4 border-2 border-black rounded-lg col-span-1 md:col-span-2 text-center">
                        <p className="text-base text-gray-600">Based on the last {insights.totalClosed || 0} closed PRs ({insights.mergedCount || 0} merged).</p>
                    </div>
                </div>
            ) : <p>No pull request data to analyze.</p>}
        </div>
    );
};
