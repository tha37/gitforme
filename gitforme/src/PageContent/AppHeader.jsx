// AppHeader.jsx
import { GitHubIcon } from "../components/Iconsfile";

export const AppHeader = ({ isAuthenticated, user, onLogout, onLogin, repoUrl, setRepoUrl, oncook }) => (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b-2 border-black">
        <div className="container mx-auto px-4 md:px-8 py-3">
            <div className="flex justify-between items-center gap-4">
                <a 
                    href="/" 
                    className="text-2xl sm:text-3xl font-bold tracking-tighter hidden sm:block 
                               font-space-mono text-gray-900 
                               hover:text-amber-600 transition-colors" 
                >
                    GitForMe
                </a>

                <div className="flex-grow flex gap-2">
                    <input
                        type="text"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && oncook()}
                        placeholder="Paste a GitHub repo URL to analyze..."
                        className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-500"
                        aria-label="Repository URL"
                    />
                    <button onClick={oncook} className="bg-[#F9C79A] text-black font-bold px-6 py-2 border-2 border-black rounded-lg hover:bg-amber-400 transition-colors shadow-[3px_3px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 whitespace-nowrap">
                        cook
                    </button>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                    <a 
                        href="https://github.com/herin7/gitforme"
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black rounded-lg hover:bg-gray-100 transition-colors font-semibold shadow-[3px_3px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                    >
                        <GitHubIcon />
                        <span className="hidden md:inline">Star on GitHub</span>
                    </a>
                    
                    {isAuthenticated ? (
                        <>
                            <span className="font-semibold hidden lg:inline">Hi, {user?.username}!</span>
                            <button onClick={onLogout} className="px-3 py-1.5 bg-white border-2 border-black rounded-lg hover:bg-gray-100 transition-colors font-semibold shadow-[3px_3px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5">
                                Logout
                            </button>
                        </>
                    ) : (
                        <button onClick={onLogin} className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black rounded-lg hover:bg-gray-100 transition-colors font-semibold shadow-[3px_3px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5">
                            <GitHubIcon />
                            <span className="hidden md:inline">Login</span>
                        </button>
                        
                    )}
        <div className="flex flex-col items-center">
          {/* Product Hunt Badge */}
          <a href="https://www.producthunt.com/products/gitforme?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-gitforme" target="_blank" rel="noopener noreferrer">
            <img 
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=995370&theme=neutral&t=1753038206402" 
              alt="GitForme - Understand any GitHub repository in minutes, not days. | Product Hunt" 
              style={{width: '150px', height: '35px'}} 
              width="250" 
              height="54" 
            />
          </a>
        </div>
                </div>
            </div>
        </div>
    </header>
);