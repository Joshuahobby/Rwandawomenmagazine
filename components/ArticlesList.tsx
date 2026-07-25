import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import api from '../services/api';

interface ArticlesListProps {
    onEdit: (id: string) => void;
}

const ArticlesList: React.FC<ArticlesListProps> = ({ onEdit }) => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

    const fetchArticles = async (page = 1) => {
        setIsLoading(true);
        try {
            // 'all' is an explicit server-side filter — sending an empty status
            // makes the API fall back to its public 'published' default.
            let url = `/articles?page=${page}&limit=10&status=${filter}`;
            if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

            const response = await api.get(url);
            setArticles(response.data.articles);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Failed to fetch articles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles(1);
    }, [filter, searchTerm]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to archive this article?')) {
            try {
                await api.delete(`/articles/${id}`);
                fetchArticles(pagination.page);
            } catch (_error) {
                alert('Failed to delete article');
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'review': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            case 'draft': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400';
            case 'archived': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-3 py-2 rounded-lg flex-1 max-w-md">
                    <span className="material-icons text-slate-400 text-sm">search</span>
                    <input
                        type="text"
                        placeholder="Search articles..."
                        className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                    {['all', 'published', 'review', 'draft'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all ${filter === s
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4 text-center">Stats</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Published</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            <p>Fetching articles...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : articles.length > 0 ? (
                                articles.map((article) => (
                                    <tr key={article.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-14 rounded bg-slate-100 overflow-hidden flex-shrink-0">
                                                    {article.featuredImage && (
                                                        <img src={article.featuredImage} alt="" className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[250px]">{article.title}</p>
                                                    <p className="text-xs text-slate-500">{article.category.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-center">
                                                <span className="text-slate-900 dark:text-white font-medium">0</span>
                                                <span className="text-[10px] text-slate-500 uppercase">Views</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(article.status)}`}>
                                                {article.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs">
                                            {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => onEdit(article.id)}
                                                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <span className="material-icons text-lg">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(article.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <span className="material-icons text-lg">delete_outline</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">No articles found matching your criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                        <p className="text-xs text-slate-500">Page {pagination.page} of {pagination.totalPages}</p>
                        <div className="flex gap-2">
                            <button
                                disabled={pagination.page === 1}
                                onClick={() => fetchArticles(pagination.page - 1)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-30"
                            >
                                <span className="material-icons text-sm">chevron_left</span>
                            </button>
                            <button
                                disabled={pagination.page === pagination.totalPages}
                                onClick={() => fetchArticles(pagination.page + 1)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-30"
                            >
                                <span className="material-icons text-sm">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArticlesList;
