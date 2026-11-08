import React, { useState, useEffect } from 'react';
import { fetchGitHubUser, fetchGitHubRepos } from './services/githubApi';
import { Search, Github, Star, GitFork, BookOpen, Code, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function App() {
  const [username, setUsername] = useState('octocat');
  const [searchInput, setSearchInput] = useState('octocat');
  const [userData, setUserData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile(username);
  }, [username]);

  const loadProfile = async (targetUser) => {
    setLoading(true);
    setError(null);
    try {
      const [user, userRepos] = await Promise.all([
        fetchGitHubUser(targetUser),
        fetchGitHubRepos(targetUser)
      ]);
      setUserData(user);
      setRepos(userRepos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setUsername(searchInput.trim());
    }
  };

  // Process language distribution for chart
  const languageCounts = repos.reduce((acc, repo) => {
    if (repo.language) {
      acc[repo.language] = (acc[repo.language] || 0) + 1;
    }
    return acc;
  }, {});

  const chartData = Object.keys(languageCounts)
    .map((lang) => ({ name: lang, count: languageCounts[lang] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header & Search */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Github size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">DevPulse</h1>
              <p className="text-sm text-slate-400">GitHub Profile Analytics & Repo Insights</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex w-full sm:w-auto gap-2">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search GitHub username..."
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition">
              Analyze
            </button>
          </form>
        </header>

        {error && (
          <div className="p-4 bg-red-950/50 border border-red-800 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64 text-slate-400 animate-pulse">
            Loading profile insights...
          </div>
        ) : userData && (
          <div className="space-y-8">
            
            {/* User Profile Overview */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 backdrop-blur">
              <img src={userData.avatar_url} alt={userData.name} className="w-24 h-24 rounded-full border-2 border-indigo-500 shadow-lg" />
              <div className="flex-1 text-center md:text-left space-y-2">
                <h2 className="text-xl font-bold">{userData.name || userData.login}</h2>
                <p className="text-sm text-slate-400">@{userData.login} {userData.bio && `• ${userData.bio}`}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-slate-300 pt-1">
                  <span className="flex items-center gap-1"><BookOpen size={14} className="text-indigo-400"/> {userData.public_repos} Repos</span>
                  <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400"/> {userData.followers} Followers</span>
                  <span className="flex items-center gap-1"><GitFork size={14} className="text-emerald-400"/> {userData.following} Following</span>
                </div>
              </div>
              <a href={userData.html_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-xl transition">
                View on GitHub <ExternalLink size={14} />
              </a>
            </div>

            {/* Grid Layout for Charts & Repos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Language Breakdown Chart */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <Code size={16} className="text-indigo-400" /> Top Languages Breakdown
                </h3>
                <div className="h-60 w-full">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-slate-500">No language data available</div>
                  )}
                </div>
              </div>

              {/* Latest Repositories */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <BookOpen size={16} className="text-indigo-400" /> Recent Repositories
                </h3>
                <div className="space-y-3 overflow-y-auto max-h-60 pr-1">
                  {repos.slice(0, 5).map((repo) => (
                    <a key={repo.id} href={repo.html_url} target="_blank" rel="noreferrer" className="block p-3 bg-slate-950/40 hover:bg-slate-800/50 border border-slate-800/60 rounded-xl transition">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-indigo-400 hover:underline">{repo.name}</span>
                        {repo.language && <span className="text-[10px] px-2 py-0.5 bg-indigo-950 text-indigo-300 rounded-full border border-indigo-800/50">{repo.language}</span>}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{repo.description || 'No description provided.'}</p>
                    </a>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
