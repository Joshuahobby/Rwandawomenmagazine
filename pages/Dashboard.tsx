import React, { useState, useEffect } from 'react';
import { PageView } from '../types';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface DashboardProps {
    navigate: (page: PageView, id?: string) => void;
}

import ArticlesList from '../components/ArticlesList';
import MediaLibrary from '../components/MediaLibrary';
import SubscriberList from '../components/SubscriberList';
import CommentsManager from '../components/CommentsManager';
import NominationsManager from '../components/NominationsManager';
import UsersManager from '../components/UsersManager';
import DashboardSettings from '../components/DashboardSettings';

const Dashboard: React.FC<DashboardProps> = ({ navigate }) => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ARTICLES' | 'MEDIA' | 'USERS' | 'COMMENTS' | 'SUBSCRIBERS' | 'NOMINATIONS' | 'SETTINGS'>('OVERVIEW');
    const [stats, setStats] = useState({
        totalArticles: 0,
        pendingReview: 0,
        monthlyViews: 0,
        viewTrend: '0%'
    });
    const [recentArticles, setRecentArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/analytics/dashboard');
                const data = response.data;

                setStats({
                    totalArticles: data.publishedArticles || 0,
                    pendingReview: data.pendingReview || 0,
                    monthlyViews: data.totalViews || 0,
                    viewTrend: 'Live'
                });

                setRecentArticles(data.recentArticles || []);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('HOME');
    };

    const handleEditArticle = (id: string) => {
        navigate('EDITOR', id);
    };

    return (
        <div className="flex h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 font-display overflow-hidden animate-fade-in">
            {/* Sidebar */}
            <aside className="w-64 bg-background-dark flex flex-col h-full border-r border-white/5">
                <div className="h-24 flex items-center justify-center px-4 border-b border-white/10 cursor-pointer" onClick={() => navigate('HOME')}>
                    <img
                        src="/uploads/logo.png"
                        alt="Rwanda Women Magazine"
                        className="h-12 w-auto object-contain brightness-0 invert"
                    />
                </div>
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
                    <button
                        onClick={() => setActiveTab('OVERVIEW')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'OVERVIEW' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <span className="material-icons text-xl">dashboard</span>
                        <span className="font-medium text-sm">Overview</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('ARTICLES')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'ARTICLES' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <span className="material-icons text-xl">article</span>
                        <span className="font-medium text-sm">Articles</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('MEDIA')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'MEDIA' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <span className="material-icons text-xl">perm_media</span>
                        <span className="font-medium text-sm">Media Library</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('COMMENTS')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'COMMENTS' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <span className="material-icons text-xl">forum</span>
                        <span className="font-medium text-sm">Comments</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('SUBSCRIBERS')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'SUBSCRIBERS' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <span className="material-icons text-xl">mail</span>
                        <span className="font-medium text-sm">Subscribers</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('NOMINATIONS')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'NOMINATIONS' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <span className="material-icons text-xl">emoji_events</span>
                        <span className="font-medium text-sm">RWIBA 2026</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('USERS')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'USERS' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <span className="material-icons text-xl">people</span>
                        <span className="font-medium text-sm">Users</span>
                    </button>
                    <div className="pt-6 mt-6 border-t border-white/10">
                        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Settings</p>
                        <button
                            onClick={() => setActiveTab('SETTINGS')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'SETTINGS' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="material-icons text-xl">settings</span>
                            <span className="font-medium text-sm">General</span>
                        </button>
                    </div>
                </nav>
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 group transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold border-2 border-primary/50">
                                {user?.fullName.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
                                <p className="text-xs text-slate-400 truncate">{user?.role.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-slate-500 hover:text-red-400 transition-colors"
                            title="Logout"
                        >
                            <span className="material-icons text-xl">logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 p-8 overflow-y-auto bg-background-light dark:bg-background-dark">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-100 dark:border-white/5">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {(() => {
                                switch (activeTab) {
                                    case 'OVERVIEW': return `Welcome back, ${user?.fullName.split(' ')[0]}!`;
                                    case 'ARTICLES': return 'Content Management';
                                    case 'MEDIA': return 'Media Library';
                                    case 'USERS': return 'Team Management';
                                    case 'COMMENTS': return 'Comments Moderation';
                                    case 'SUBSCRIBERS': return 'Newsletter Subscribers';
                                    case 'NOMINATIONS': return 'RWIBA 2026 Awards';
                                    case 'SETTINGS': return 'Settings';
                                    default: return 'Dashboard';
                                }
                            })()}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
                            {(() => {
                                switch (activeTab) {
                                    case 'OVERVIEW': return "Here's what's happening with your content today.";
                                    case 'ARTICLES': return "Manage your articles, drafts, and archives.";
                                    case 'MEDIA': return "Manage and organize your visual assets.";
                                    case 'USERS': return "Manage platform users, roles, and access.";
                                    case 'COMMENTS': return "Review and manage community discussions.";
                                    case 'SUBSCRIBERS': return "View and export your audience list.";
                                    case 'NOMINATIONS': return "Manage nominations and voting progress.";
                                    case 'SETTINGS': return "Manage your dashboard preferences.";
                                    default: return "Access your administrative tools.";
                                }
                            })()}
                        </p>
                    </div>
                    {(activeTab === 'OVERVIEW' || activeTab === 'ARTICLES') && (
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('EDITOR')} className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/30 transition-all active:scale-95">
                                <span className="material-icons text-sm">add</span> Create New Article
                            </button>
                        </div>
                    )}
                </header>

                {activeTab === 'OVERVIEW' ? (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-slate-100 dark:border-white/5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2.5 bg-primary-light dark:bg-primary/20 rounded-lg text-primary"><span className="material-icons block">description</span></div>
                                    <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full flex items-center gap-1">↑ Live</span>
                                </div>
                                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Published</h3>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white font-display">{stats.totalArticles}</p>
                            </div>
                            <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-slate-100 dark:border-white/5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2.5 bg-orange-50 dark:bg-orange-500/20 rounded-lg text-orange-500"><span className="material-icons block">rate_review</span></div>
                                    <span className="text-xs font-medium text-slate-500 bg-slate-50 dark:bg-white/10 px-2 py-1 rounded-full">Action Needed</span>
                                </div>
                                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Pending Review</h3>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white font-display">{stats.pendingReview}</p>
                            </div>
                            <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-slate-100 dark:border-white/5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2.5 bg-blue-50 dark:bg-blue-500/20 rounded-lg text-blue-500"><span className="material-icons block">visibility</span></div>
                                    <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full flex items-center gap-1">↑ {stats.viewTrend}</span>
                                </div>
                                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Monthly Views</h3>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white font-display">{(stats.monthlyViews / 1000).toFixed(1)}k</p>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Activity</h3>
                                <button onClick={() => setActiveTab('ARTICLES')} className="text-sm text-primary font-medium hover:underline">View All</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
                                            <th className="px-6 py-4">Article Details</th>
                                            <th className="px-6 py-4">Author</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                                        {recentArticles.length > 0 ? (
                                            recentArticles.map((article: any) => (
                                                <tr key={article.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-14 rounded bg-slate-200 overflow-hidden">
                                                                {article.featuredImage && (
                                                                    <img src={article.featuredImage} alt="" className="w-full h-full object-cover" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">{article.title}</p>
                                                                <p className="text-xs text-slate-500">{article.category?.name}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4"><span className="text-slate-700 dark:text-slate-300">{article.author?.fullName}</span></td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${article.status === 'published' ? 'bg-green-100 text-green-800' :
                                                            article.status === 'review' ? 'bg-orange-100 text-orange-800' :
                                                                'bg-slate-100 text-slate-800'
                                                            }`}>
                                                            {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500">
                                                        {new Date(article.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-slate-400 hover:text-primary">
                                                            <span className="material-icons">more_vert</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">
                                                    {isLoading ? 'Loading content...' : 'No articles found.'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : activeTab === 'ARTICLES' ? (
                    <ArticlesList onEdit={handleEditArticle} />
                ) : activeTab === 'MEDIA' ? (
                    <MediaLibrary />
                ) : activeTab === 'COMMENTS' ? (
                    <CommentsManager />
                ) : activeTab === 'SUBSCRIBERS' ? (
                    <SubscriberList />
                ) : activeTab === 'NOMINATIONS' ? (
                    <NominationsManager />
                ) : activeTab === 'USERS' ? (
                    <UsersManager />
                ) : activeTab === 'SETTINGS' ? (
                    <DashboardSettings navigate={navigate} />
                ) : null}
            </main>
        </div>
    );
};

export default Dashboard;