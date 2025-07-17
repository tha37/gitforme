
export const ContributorsList = ({ contributors }) => {
    if (!contributors || contributors.length === 0) {
        return <p className="text-base text-gray-500">No contributors found.</p>;
    }
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            {contributors.map((c) => (
                <a key={c.login} href={c.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50 transition-colors" title={`${c.login} (${c.contributions} contributions)`}>
                    <img src={c.avatar_url} alt={`${c.login}'s avatar`} className="w-12 h-12 rounded-full border-2 border-gray-300" />
                    <div className="overflow-hidden">
                        <p className="font-bold text-base truncate">{c.login}</p>
                        <p className="text-sm text-gray-500 truncate">{c.contributions} contributions</p>
                    </div>
                </a>
            ))}
        </div>
    );
};