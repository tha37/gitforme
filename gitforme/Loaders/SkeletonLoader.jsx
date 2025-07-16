export const SkeletonLoader = ({ className }) => <div className={`bg-gray-200 rounded animate-pulse ${className}`} />;
export const FullPageLoader = () => (
    <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex flex-col items-center justify-center z-[100]">
        <div className="flex space-x-2">
            <div className="w-4 h-4 bg-amber-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
            <div className="w-4 h-4 bg-amber-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
            <div className="w-4 h-4 bg-amber-500 rounded-full animate-pulse"></div>
        </div>
        <p className="text-center font-bold text-xl text-gray-700 mt-4">Loading Repository...</p>
    </div>
);
