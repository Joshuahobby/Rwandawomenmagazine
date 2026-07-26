import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Article } from '../types';
import api from '../services/api';

interface CategoryPageProps {
}

const CATEGORY_META: Record<string, { label: string; description: string; accent: string; icon: string }> = {
    'leadership-empowerment': {
        label: 'Leadership & Empowerment',
        description: 'Profiles, insights, and stories of Rwandan women leading with vision and courage in business, governance, and public life.',
        accent: 'bg-amber-600',
        icon: 'military_tech',
    },
    'business-economy': {
        label: 'Business & Economy',
        description: 'Success stories, market analysis, and the entrepreneurial journeys of women shaping Rwanda\'s economic landscape.',
        accent: 'bg-blue-700',
        icon: 'trending_up',
    },
    'culture-heritage': {
        label: 'Culture & Heritage',
        description: 'Celebrating Rwanda\'s rich traditions, women\'s historical roles, and the cultural fabric that defines who we are.',
        accent: 'bg-orange-700',
        icon: 'museum',
    },
    'health-wellness': {
        label: 'Health & Wellness',
        description: 'Well-being, mental health, and the policies and practices improving the quality of life for women across Rwanda.',
        accent: 'bg-emerald-700',
        icon: 'favorite',
    },
    'tech-innovation': {
        label: 'Tech & Innovation',
        description: 'Women at the forefront of Rwanda\'s digital transformation — from Kigali Innovation City to global tech stages.',
        accent: 'bg-indigo-700',
        icon: 'rocket_launch',
    },
    'education': {
        label: 'Education',
        description: 'Stories of academic excellence, scholarship opportunities, and women redefining Rwanda\'s educational landscape.',
        accent: 'bg-violet-700',
        icon: 'school',
    },
};

const ALL_CATEGORIES = Object.keys(CATEGORY_META);

const CategoryPage: React.FC<CategoryPageProps> = () => {
    const { slug: categorySlug } = useParams<{ slug: string }>();
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const slug = categorySlug || 'leadership-empowerment';
    const meta = CATEGORY_META[slug] || CATEGORY_META['leadership-empowerment'];

    useEffect(() => {
        const fetchArticles = async () => {
            setIsLoading(true);
            try {
                const res = await api.get(`/articles?category=${slug}&limit=9&page=${page}`);
                setArticles(res.data.articles || []);
                setTotalPages(res.data.pagination?.totalPages || 1);
            } catch (error) {
                console.error('Failed to fetch category articles:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchArticles();
    }, [slug, page]);

    // Reset page when category changes
    useEffect(() => {
        setPage(1);
    }, [slug]);

    const fallbackImage = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop";

    return (
        <div className="animate-fade-in font-sans">

            {/* Hero */}
            <section className={`${meta.accent} text-white py-16 lg:py-24`}>
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-icons text-4xl opacity-80">{meta.icon}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1">Category</span>
                    </div>
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-black uppercase leading-[0.85] tracking-tighter mb-6 break-words">
                        {meta.label}
                    </h1>
                    <p className="text-lg text-white/80 max-w-2xl leading-relaxed">
                        {meta.description}
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-sm text-gray-500 uppercase tracking-widest">Loading articles...</p>
                                </div>
                            </div>
                        ) : articles.length === 0 ? (
                            <div className="text-center py-20">
                                <span className="material-icons text-6xl text-gray-300 dark:text-gray-700 mb-4 block">article</span>
                                <h3 className="font-display text-2xl font-bold text-text-light dark:text-text-dark mb-2">No Articles Yet</h3>
                                <p className="text-gray-500">We're working on stories for {meta.label}. Check back soon!</p>
                            </div>
                        ) : (
                            <>
                                {/* Featured first article */}
                                {articles[0] && (
                                    <Link
                                        to={`/article/${articles[0].slug}`}
                                        className="group cursor-pointer mb-12 pb-12 border-b border-gray-200 dark:border-gray-800 block text-inherit decoration-none"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
                                                <img alt={articles[0].title} src={articles[0].featuredImage || fallbackImage} className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700" />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest border border-gray-300 dark:border-gray-600 px-2 py-0.5 text-text-light dark:text-text-dark">{articles[0].category?.name}</span>
                                                    <span className="text-[10px] text-gray-400">{new Date(articles[0].publishedAt || articles[0].createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <h2 className="font-display text-3xl lg:text-4xl font-bold leading-tight mb-4 group-hover:text-primary transition-colors text-text-light dark:text-text-dark">{articles[0].title}</h2>
                                                <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">{articles[0].excerpt}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span className="material-icons text-sm text-primary">auto_awesome</span>
                                                    Written by {articles[0].author.fullName}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                )}

                                {/* Article grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {articles.slice(1).map((article) => (
                                        <Link
                                            to={`/article/${article.slug}`}
                                            key={article.id}
                                            className="group cursor-pointer block text-inherit decoration-none"
                                        >
                                            <div className="aspect-[16/9] overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                                                <img alt={article.title} src={article.featuredImage || fallbackImage} className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                                            <h3 className="font-display text-lg font-bold leading-tight mb-2 group-hover:text-primary transition-colors text-text-light dark:text-text-dark">{article.title}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{article.excerpt}</p>
                                        </Link>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-3 mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                                        <button
                                            onClick={() => setPage(Math.max(1, page - 1))}
                                            disabled={page === 1}
                                            className="flex items-center gap-1 px-4 py-2 text-xs font-bold uppercase tracking-widest border border-gray-300 dark:border-gray-600 hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-text-light dark:text-text-dark"
                                        >
                                            <span className="material-icons text-sm">chevron_left</span>
                                            Prev
                                        </button>
                                        <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                                        <button
                                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                                            disabled={page === totalPages}
                                            className="flex items-center gap-1 px-4 py-2 text-xs font-bold uppercase tracking-widest border border-gray-300 dark:border-gray-600 hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-text-light dark:text-text-dark"
                                        >
                                            Next
                                            <span className="material-icons text-sm">chevron_right</span>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        {/* Browse Categories */}
                        <div className="border border-gray-200 dark:border-gray-800 p-6 mb-8">
                            <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-4 text-text-light dark:text-text-dark">Browse Categories</h3>
                            <div className="space-y-2">
                                {ALL_CATEGORIES.map((catSlug) => {
                                    const catMeta = CATEGORY_META[catSlug];
                                    const isActive = catSlug === slug;
                                    return (
                                        <Link
                                            key={catSlug}
                                            to={`/category/${catSlug}`}
                                            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm transition-colors decoration-none ${isActive
                                                ? 'bg-primary/10 text-primary font-bold border-l-2 border-primary'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                                }`}
                                        >
                                            <span className={`material-icons text-sm ${isActive ? 'text-primary' : 'text-gray-400'}`}>{catMeta.icon}</span>
                                            {catMeta.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Subscribe CTA */}
                        <div className="bg-primary text-white p-6">
                            <span className="material-icons text-3xl mb-3 block opacity-80">mail</span>
                            <h3 className="font-display text-lg font-bold uppercase mb-2">Stay Updated</h3>
                            <p className="text-sm text-white/80 mb-4">Get the latest stories from {meta.label} delivered to your inbox.</p>
                            <Link
                                to="/newsletter"
                                className="border border-white text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-primary transition-all w-full decoration-none inline-block text-center"
                            >
                                Subscribe
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
