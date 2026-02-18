import React, { useState, useEffect } from 'react';
import { PageView, Article } from '../types';
import api from '../services/api';

/* eslint-disable */
interface SearchProps {
    navigate: (page: PageView, id?: string | null) => void;
}
/* eslint-enable */

const Search: React.FC<SearchProps> = ({ navigate }) => {
    const [searchQuery, setSearchQuery] = useState('Leadership');
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalResults, setTotalResults] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchResults = async (query: string, pageNum: number) => {
        if (!query.trim()) return;

        setIsLoading(true);
        try {
            const response = await api.get(`/articles?search=${encodeURIComponent(query)}&page=${pageNum}&limit=10`);
            setArticles(response.data.articles || []);
            setTotalResults(response.data.pagination?.total || 0);
            setTotalPages(response.data.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchResults(searchQuery, page);
    }, [page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchResults(searchQuery, 1);
    };

    const fallbackImage = "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=2938&auto=format&fit=crop";

    return (
        <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Search Header */}
            <div className="mb-12 border-b border-primary/10 dark:border-primary/20 pb-12">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    <form onSubmit={handleSearch} className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="material-icons text-primary text-3xl">search</span>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-14 pr-4 py-4 bg-white dark:bg-surface-dark border-2 border-primary/10 dark:border-primary/20 rounded-full text-xl placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm dark:text-white"
                            placeholder="Search articles, topics, or authors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="absolute inset-y-2 right-2 px-6 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition-colors"
                        >
                            Search
                        </button>
                    </form>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mt-8 leading-tight">
                        {isLoading ? (
                            'Searching...'
                        ) : (
                            <>
                                {totalResults} Results for <span className="text-primary italic font-display">"{searchQuery}"</span>
                            </>
                        )}
                    </h1>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Filters Sidebar */}
                <aside className="w-full lg:w-1/4 space-y-8">
                    <div className="sticky top-24 space-y-8 bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-primary/5 dark:border-primary/10">
                        <div className="flex justify-between items-center pb-4 border-b border-primary/10">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white font-display">Filters</h3>
                            <button className="text-sm text-primary hover:text-primary-dark font-medium underline" onClick={() => setSearchQuery('')}>Reset all</button>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200">Category</h4>
                            <div className="space-y-3">
                                <label className="flex items-center cursor-pointer group">
                                    <input type="checkbox" className="form-checkbox h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary" defaultChecked />
                                    <span className="ml-3 text-lg text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors">All Categories</span>
                                </label>
                                {/* Results will be filtered by search query which includes categories in backend */}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Results */}
                <div className="w-full lg:w-3/4 space-y-8">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : articles.length > 0 ? (
                        articles.map((article) => (
                            <article key={article.id} className="flex flex-col md:flex-row bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-transparent hover:border-primary/20 cursor-pointer" onClick={() => navigate('ARTICLE', article.slug)}>
                                <div className="md:w-2/5 relative overflow-hidden h-64 md:h-auto">
                                    <img src={article.featuredImage || fallbackImage} alt={article.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-primary text-white text-xs uppercase tracking-wider font-bold rounded-full">{article.category?.name}</span>
                                    </div>
                                </div>
                                <div className="md:w-3/5 p-8 flex flex-col justify-center">
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3 space-x-2">
                                        <span>By {article.author?.fullName}</span>
                                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                        <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-3 leading-snug group-hover:text-primary transition-colors">
                                        {article.title}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 text-lg mb-4 line-clamp-2">
                                        {article.excerpt}
                                    </p>
                                    <span className="inline-flex items-center text-primary font-bold text-lg hover:underline decoration-2 underline-offset-4">
                                        Read Article <span className="material-icons ml-1 text-sm">arrow_forward</span>
                                    </span>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="text-center py-20">
                            <span className="material-icons text-6xl text-gray-300 mb-4">search_off</span>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No results found</h3>
                            <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pt-12 flex justify-center items-center space-x-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-surface-dark text-gray-500 hover:text-primary border border-gray-200 dark:border-gray-700 disabled:opacity-30"
                            >
                                <span className="material-icons text-sm">chevron_left</span>
                            </button>

                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full font-bold shadow-md transition-all ${page === i + 1 ? 'bg-primary text-white' : 'bg-white dark:bg-surface-dark text-gray-700 dark:text-gray-300 hover:bg-primary/10 border border-gray-200 dark:border-gray-700'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-surface-dark text-gray-500 hover:text-primary border border-gray-200 dark:border-gray-700 disabled:opacity-30"
                            >
                                <span className="material-icons text-sm">chevron_right</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Search;