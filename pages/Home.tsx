import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import api from '../services/api';
import axios from 'axios';
import { Link } from 'react-router-dom';
import VotingBanner from '../components/VotingBanner';
import { useQuery } from '@tanstack/react-query';
import SEO from '../components/SEO';

interface HomeProps {
}

const Home: React.FC<HomeProps> = () => {
  // Newsletter state
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  // Fetcher function
  const fetchArticles = async (params: string) => {
    const { data } = await api.get(`/articles?${params}`);
    return data.articles || [];
  };

  // Queries
  const { data: featuredArticleData, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['articles', 'featured'],
    queryFn: () => fetchArticles('featured=true&limit=1'),
  });

  const { data: latestArticles = [], isLoading: isLatestLoading } = useQuery({
    queryKey: ['articles', 'latest'],
    queryFn: () => fetchArticles('limit=4'),
  });

  const { data: leadershipArticles = [], isLoading: isLeadershipLoading } = useQuery({
    queryKey: ['articles', 'leadership'],
    queryFn: () => fetchArticles('category=leadership-empowerment&limit=3'),
  });

  const { data: businessArticles = [], isLoading: isBusinessLoading } = useQuery({
    queryKey: ['articles', 'business'],
    queryFn: () => fetchArticles('category=business-economy&limit=4'),
  });

  const { data: cultureArticles = [], isLoading: isCultureLoading } = useQuery({
    queryKey: ['articles', 'culture'],
    queryFn: () => fetchArticles('category=culture-heritage&limit=3'),
  });

  const { data: healthArticles = [], isLoading: isHealthLoading } = useQuery({
    queryKey: ['articles', 'health'],
    queryFn: () => fetchArticles('category=health-wellness&limit=3'),
  });

  const { data: techArticles = [], isLoading: isTechLoading } = useQuery({
    queryKey: ['articles', 'tech'],
    queryFn: () => fetchArticles('category=tech-innovation&limit=3'),
  });

  const { data: educationArticles = [], isLoading: isEducationLoading } = useQuery({
    queryKey: ['articles', 'education'],
    queryFn: () => fetchArticles('category=education&limit=3'),
  });

  const featuredArticle = featuredArticleData?.[0] || null;
  const isLoading = isFeaturedLoading || isLatestLoading || isLeadershipLoading || isBusinessLoading || isCultureLoading || isHealthLoading || isTechLoading || isEducationLoading;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    setSubscribeError(null);

    try {
      await api.post('/subscribers', { email, source: 'home_page' });
      setSubscribed(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error('Subscription failed:', err);
        if (err.response?.status === 409) {
          setSubscribeError('Already subscribed!');
          setSubscribed(true);
        } else {
          setSubscribeError('Failed. Please try again.');
        }
      } else {
        console.error('Subscription failed:', err);
        setSubscribeError('Failed. Please try again.');
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Loading Magazine...</p>
        </div>
      </div>
    );
  }

  const fallbackImage = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop";

  // Reusable: Section header
  const SectionHeader = ({ title, viewAllPath, dark = false }: { title: string; viewAllPath: string; dark?: boolean }) => (
    <div className={`flex justify-between items-end mb-10 border-b pb-4 ${dark ? 'border-gray-700' : 'border-gray-200 dark:border-gray-700'}`}>
      <h2 className={`font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight ${dark ? 'text-white' : 'text-text-light dark:text-text-dark'}`}>{title}</h2>
      <Link to={viewAllPath} className={`hidden sm:flex items-center gap-2 text-xs uppercase tracking-widest hover:text-primary transition-colors ${dark ? 'text-gray-400' : 'text-text-light dark:text-text-dark'}`}>
        View All <span className="material-icons text-sm">north_east</span>
      </Link>
    </div>
  );

  // Reusable: Article card (horizontal)
  const ArticleCardHorizontal: React.FC<{ article: Article }> = ({ article }) => (
    <Link to={`/article/${article.slug}`} className="flex gap-4 group cursor-pointer text-inherit decoration-none">
      <div className="w-1/3 aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
        <img alt={article.title} className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500" src={article.featuredImage || fallbackImage} />
      </div>
      <div className="w-2/3 flex flex-col justify-center">
        <span className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">{article.category?.name}</span>
        <h4 className="font-display text-lg font-medium mb-1 group-hover:text-primary transition-colors text-text-light dark:text-text-dark">{article.title}</h4>
        <span className="text-[10px] text-gray-500 block">{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
      </div>
    </Link>
  );

  // Reusable: Article card (compact list item)
  const ArticleListItem = ({ article, dark = false }: { article: Article; dark?: boolean }) => (
    <Link to={`/article/${article.slug}`} className="group cursor-pointer block text-inherit decoration-none">
      <div className="flex items-center gap-3 mb-1">
        <span className={`text-[10px] font-bold uppercase ${dark ? 'text-gray-400' : 'text-gray-400'}`}>{article.category?.name}</span>
        <span className="text-[10px] text-gray-500">{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
      </div>
      <h4 className={`font-display text-lg font-medium leading-snug group-hover:text-primary transition-colors ${dark ? 'text-white' : 'text-text-light dark:text-text-dark'}`}>{article.title}</h4>
  return (
    <div className="animate-fade-in font-sans">
      <SEO />
      {/* Voting Banner */}
      <VotingBanner />

      {/* Secondary Nav / Categories */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark overflow-x-auto">
        <div className="container mx-auto px-4 py-3 flex gap-6 whitespace-nowrap text-xs font-bold text-gray-500 dark:text-gray-400">
          <Link to="/search" className="text-primary border-b-2 border-primary pb-0.5 tracking-widest decoration-none">ALL</Link>
          <Link to="/category/leadership-empowerment" className="hover:text-primary transition-colors tracking-widest uppercase decoration-none">Leadership</Link>
          <Link to="/category/business-economy" className="hover:text-primary transition-colors tracking-widest uppercase decoration-none">Business</Link>
          <Link to="/category/culture-heritage" className="hover:text-primary transition-colors tracking-widest uppercase decoration-none">Culture</Link>
          <Link to="/category/health-wellness" className="hover:text-primary transition-colors tracking-widest uppercase decoration-none">Health</Link>
          <Link to="/category/tech-innovation" className="hover:text-primary transition-colors tracking-widest uppercase decoration-none">Tech & Innovation</Link>
          <Link to="/category/education" className="hover:text-primary transition-colors tracking-widest uppercase decoration-none">Education</Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-12">

        {/* ═══════════════════════════════════════════════════════════════
            HERO STORIES GRID
        ═══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          {/* Column 1: Title + Vertical Story */}
          <div className="lg:col-span-2">
            <h1 className="font-display font-black text-6xl lg:text-7xl uppercase leading-[0.85] tracking-tighter mb-6 break-words text-blue-900 dark:text-white">
              Sto-<br />ries
            </h1>
            {latestArticles[0] && (
              <Link to={`/article/${latestArticles[0].slug}`} className="group cursor-pointer block text-inherit decoration-none">
                <div className="aspect-[3/4] overflow-hidden mb-4 relative bg-gray-100 dark:bg-gray-800">
                  <img alt={latestArticles[0].title} className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700" src={latestArticles[0].featuredImage || fallbackImage} />
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest border border-gray-300 dark:border-gray-600 px-2 py-0.5 text-text-light dark:text-text-dark">{latestArticles[0].category?.name}</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">{new Date(latestArticles[0].publishedAt || latestArticles[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()}</span>
                </div>
                <h3 className="font-display text-lg leading-tight group-hover:underline decoration-primary underline-offset-4 text-text-light dark:text-text-dark">
                  {latestArticles[0].title}
                </h3>
              </Link>
            )}
          </div>

          {/* Column 2: Main Featured Story */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            {featuredArticle && (
              <Link to={`/article/${featuredArticle.slug}`} className="h-full flex flex-col group cursor-pointer text-inherit decoration-none">
                <div className="flex-grow relative overflow-hidden mb-6 aspect-[4/3] lg:aspect-auto bg-gray-100 dark:bg-gray-800">
                  <img alt={featuredArticle.title} className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700" src={featuredArticle.featuredImage || fallbackImage} />
                  <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 text-xs font-bold uppercase tracking-widest">Featured</div>
                </div>
                <div className="border-l-2 border-primary pl-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest border border-gray-300 dark:border-gray-600 px-2 py-0.5 text-text-light dark:text-text-dark">{featuredArticle.category.name}</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">{new Date(featuredArticle.publishedAt || featuredArticle.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()}</span>
                  </div>
                  <h2 className="font-display text-3xl lg:text-4xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors text-text-light dark:text-text-dark">
                    {featuredArticle.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                    <span className="material-icons text-sm text-primary">auto_awesome</span>
                    Written by <span className="text-text-light dark:text-text-dark">{featuredArticle.author.fullName}</span>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* Column 3: Latest List */}
          <div className="lg:col-span-4 border-l border-gray-200 dark:border-gray-700 pl-0 lg:pl-8">
            <div className="flex justify-between items-end mb-6 border-b border-black dark:border-white pb-2">
              <h2 className="font-display text-4xl font-bold uppercase text-text-light dark:text-text-dark">Latest</h2>
            </div>
            <div className="space-y-8">
              {latestArticles.map((item, i) => (
                <React.Fragment key={item.id}>
                  <ArticleListItem article={item} />
                  {i < latestArticles.length - 1 && <hr className="border-gray-100 dark:border-gray-800" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            1. LEADERSHIP & EMPOWERMENT — Dark full-bleed section
        ═══════════════════════════════════════════════════════════════ */}
        <section className="bg-surface-dark dark:bg-black text-white -mx-4 px-4 py-16 mb-20">
          <div className="container mx-auto">
            <SectionHeader title="Leadership & Empowerment" viewAllPath="/category/leadership-empowerment" dark />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
              {leadershipArticles[0] && (
                <Link to={`/article/${leadershipArticles[0].slug}`} className="lg:col-span-7 group cursor-pointer text-inherit decoration-none block">
                  <div className="overflow-hidden mb-6 relative aspect-[16/9] bg-gray-900">
                    <img alt={leadershipArticles[0].title} className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" src={leadershipArticles[0].featuredImage || fallbackImage} />
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-bold uppercase bg-white text-black px-2 py-0.5">{leadershipArticles[0].category.name}</span>
                    <span className="text-[10px] text-gray-400">{new Date(leadershipArticles[0].publishedAt || leadershipArticles[0].createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-display text-3xl lg:text-4xl font-medium leading-tight mb-4 group-hover:text-primary transition-colors">{leadershipArticles[0].title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="material-icons text-xs text-primary">auto_awesome</span>
                    <span>Written by {leadershipArticles[0].author.fullName}</span>
                  </div>
                </Link>
              )}
              <div className="lg:col-span-5 flex flex-col gap-8">
                {leadershipArticles.slice(1).map((item) => (
                  <ArticleCardHorizontal key={item.id} article={item} />
                ))}
                {leadershipArticles.length <= 1 && (
                  <div className="flex items-center justify-center h-full text-gray-500 italic text-sm">More stories coming soon...</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            2. BUSINESS & ECONOMY — Card grid layout
        ═══════════════════════════════════════════════════════════════ */}
        <section className="mb-20">
          <SectionHeader title="Business & Economy" viewAllPath="/category/business-economy" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {businessArticles.map((article) => (
              <Link to={`/article/${article.slug}`} key={article.id} className="group cursor-pointer block text-inherit decoration-none">
                <div className="aspect-[4/3] overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                  <img alt={article.title} className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700" src={article.featuredImage || fallbackImage} />
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-bold uppercase border border-gray-300 dark:border-gray-600 px-2 py-0.5 text-text-light dark:text-text-dark">{article.category?.name}</span>
                  <span className="text-[10px] text-gray-500">{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-display text-xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors text-text-light dark:text-text-dark">{article.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{article.excerpt}</p>
              </Link>
            ))}
            {businessArticles.length === 0 && (
              <div className="col-span-3 text-center py-16 text-gray-400 italic">No articles in Business & Economy yet. Check back soon!</div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            3. CULTURE & HERITAGE — Alternating editorial layout
        ═══════════════════════════════════════════════════════════════ */}
        <section className="mb-20 border-t border-gray-200 dark:border-gray-700 pt-16">
          <SectionHeader title="Culture & Heritage" viewAllPath="/category/culture-heritage" />
          {cultureArticles[0] && (
            <Link to={`/article/${cultureArticles[0].slug}`} className="group relative aspect-[21/9] w-full overflow-hidden mb-8 cursor-pointer block text-inherit decoration-none">
              <img alt={cultureArticles[0].title} className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-1000" src={cultureArticles[0].featuredImage || fallbackImage} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 lg:p-12">
                <div className="max-w-2xl">
                  <span className="bg-white text-black px-3 py-1 text-xs font-bold uppercase tracking-widest inline-block mb-4">{cultureArticles[0].category?.name}</span>
                  <h3 className="font-display text-3xl lg:text-5xl font-bold text-white mb-2 leading-tight">{cultureArticles[0].title}</h3>
                  <p className="text-white/80 hidden lg:block line-clamp-2">{cultureArticles[0].excerpt}</p>
                </div>
              </div>
            </Link>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cultureArticles.slice(1).map((item) => (
              <Link to={`/article/${item.slug}`} key={item.id} className="flex gap-4 group cursor-pointer text-inherit decoration-none">
                <div className="w-1/2 aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img alt={item.title} className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500" src={item.featuredImage || fallbackImage} />
                </div>
                <div className="w-1/2 flex flex-col justify-center">
                  <span className="text-[10px] font-bold uppercase text-gray-500 mb-2">{item.category?.name}</span>
                  <h4 className="font-display text-2xl font-bold mb-2 group-hover:text-primary transition-colors text-text-light dark:text-text-dark">{item.title}</h4>
                  <span className="text-xs text-gray-400">Written by {item.author.fullName}</span>
                </div>
              </Link>
            ))}
          </div>
          {cultureArticles.length === 0 && (
            <div className="text-center py-16 text-gray-400 italic">No articles in Culture & Heritage yet. Check back soon!</div>
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            4. HEALTH & WELLNESS — Accent-colored sidebar layout
        ═══════════════════════════════════════════════════════════════ */}
        <section className="mb-20 bg-emerald-50 dark:bg-emerald-950/20 -mx-4 px-4 py-16 border-y border-emerald-100 dark:border-emerald-900/30">
          <div className="container mx-auto">
            <div className="flex justify-between items-end mb-10 border-b border-emerald-200 dark:border-emerald-800 pb-4">
              <h2 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight text-emerald-900 dark:text-emerald-100">
                <span className="material-icons text-4xl text-emerald-600 mr-3 align-middle">favorite</span>
                Health & Wellness
              </h2>
              <Link to="/category/health-wellness" className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-widest hover:text-emerald-600 transition-colors text-emerald-700 dark:text-emerald-300 decoration-none">
                View All <span className="material-icons text-sm">north_east</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {healthArticles.map((article) => (
                <Link to={`/article/${article.slug}`} key={article.id} className="group cursor-pointer bg-white dark:bg-gray-900 p-6 border border-emerald-100 dark:border-emerald-900/30 hover:shadow-lg transition-shadow duration-300 block text-inherit decoration-none">
                  <div className="aspect-[16/9] overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                    <img alt={article.title} className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700" src={article.featuredImage || fallbackImage} />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-2 block">{article.category?.name}</span>
                  <h4 className="font-display text-xl font-bold leading-tight mb-2 group-hover:text-emerald-600 transition-colors text-text-light dark:text-text-dark">{article.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{article.excerpt}</p>
                </Link>
              ))}
              {healthArticles.length === 0 && (
                <div className="col-span-3 text-center py-16 text-gray-400 italic">No articles in Health & Wellness yet. Check back soon!</div>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            5. TECH & INNOVATION — Modern split layout
        ═══════════════════════════════════════════════════════════════ */}
        <section className="mb-20">
          <div className="flex justify-between items-end mb-10 border-b border-gray-200 dark:border-gray-700 pb-4">
            <h2 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight text-text-light dark:text-text-dark">
              <span className="material-icons text-3xl text-indigo-500 mr-3 align-middle">rocket_launch</span>
              Tech & Innovation
            </h2>
            <Link to="/category/tech-innovation" className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-widest hover:text-primary transition-colors text-text-light dark:text-text-dark decoration-none">
              View All <span className="material-icons text-sm">north_east</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {techArticles[0] && (
              <Link to={`/article/${techArticles[0].slug}`} className="group cursor-pointer block text-inherit decoration-none">
                <div className="aspect-[16/9] overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                  <img alt={techArticles[0].title} className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700" src={techArticles[0].featuredImage || fallbackImage} />
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-bold uppercase border border-indigo-300 dark:border-indigo-600 px-2 py-0.5 text-indigo-600 dark:text-indigo-400">{techArticles[0].category?.name}</span>
                  <span className="text-[10px] text-gray-500">{new Date(techArticles[0].publishedAt || techArticles[0].createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-display text-2xl lg:text-3xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors text-text-light dark:text-text-dark">{techArticles[0].title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{techArticles[0].excerpt}</p>
              </Link>
            )}
            <div className="flex flex-col gap-6">
              {techArticles.slice(1).map((item, i) => (
                <React.Fragment key={item.id}>
                  <ArticleCardHorizontal article={item} />
                  {i < techArticles.slice(1).length - 1 && <hr className="border-gray-200 dark:border-gray-700" />}
                </React.Fragment>
              ))}
              {techArticles.length === 0 && (
                <div className="flex items-center justify-center h-full text-gray-400 italic">No articles in Tech & Innovation yet. Check back soon!</div>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            6. EDUCATION — Compact list with accent
        ═══════════════════════════════════════════════════════════════ */}
        <section className="mb-20 bg-surface-light dark:bg-surface-dark -mx-4 px-4 py-16 border-y border-gray-200 dark:border-gray-800">
          <div className="container mx-auto">
            <div className="flex justify-between items-end mb-10 border-b border-gray-300 dark:border-gray-600 pb-4">
              <h2 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight text-text-light dark:text-text-dark">
                <span className="material-icons text-3xl text-violet-500 mr-3 align-middle">school</span>
                Education
              </h2>
              <Link to="/category/education" className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-widest hover:text-primary transition-colors text-text-light dark:text-text-dark decoration-none">
                View All <span className="material-icons text-sm">north_east</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {educationArticles.map((article) => (
                <Link to={`/article/${article.slug}`} key={article.id} className="group cursor-pointer block text-inherit decoration-none">
                  <div className="aspect-[16/9] overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                    <img alt={article.title} className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500" src={article.featuredImage || fallbackImage} />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-violet-600 dark:text-violet-400 mb-1 block">{article.category?.name}</span>
                  <h4 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition-colors text-text-light dark:text-text-dark">{article.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{article.excerpt}</p>
                </Link>
              ))}
              {educationArticles.length === 0 && (
                <div className="col-span-3 text-center py-16 text-gray-400 italic">No articles in Education yet. Check back soon!</div>
              )}
            </div>
          </div>
        </section>

      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SUBSCRIBE SECTION (Full Width)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-8 lg:p-20 flex flex-col justify-center">
            <h2 className="font-display text-6xl lg:text-8xl font-black uppercase leading-[0.8] tracking-tighter mb-4 text-text-light dark:text-text-dark">
              Subscribe<br />Now
            </h2>
            <p className="mb-8 text-gray-600 dark:text-gray-400 max-w-md">
              Get the latest stories on women empowerment, leadership, business, and culture delivered straight to your inbox. Join our community of changemakers.
            </p>
            {!subscribed ? (
              <form className="flex flex-col w-full max-w-md gap-2" onSubmit={handleSubscribe}>
                <div className="flex w-full">
                  <input
                    className="flex-grow bg-transparent border border-gray-400 dark:border-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-primary placeholder-gray-500 dark:text-white disabled:opacity-50"
                    placeholder="E-MAIL ADDRESS"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubscribing}
                  />
                  <button
                    className="bg-primary text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                    type="submit"
                    disabled={isSubscribing}
                  >
                    {isSubscribing && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                    Subscribe
                  </button>
                </div>
                {subscribeError && <p className="text-red-500 text-xs font-medium">{subscribeError}</p>}
              </form>
            ) : (
              <div className="flex items-center gap-3 text-green-600 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 px-6 py-4 max-w-md">
                <span className="material-icons">check_circle</span>
                <span className="text-sm font-bold">Thank you for subscribing!</span>
              </div>
            )}
          </div>
          <div className="bg-[#a84020] relative min-h-[400px]">
            <img
              alt="Stylish woman looking back"
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
              src="/uploads/pictures/RWIBA GALLERY (11).jpg"
              loading="lazy"
            />
            <img
              alt="Stylish woman looking back"
              className="absolute bottom-0 right-0 h-[90%] object-contain object-right-bottom drop-shadow-2xl grayscale contrast-125 hover:grayscale-0 transition-all duration-700"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkA5-iE4J7cG2TUpozJxS2zWeKmiFbma8VFM-dIZ4fF6iJm2UnhYTUd3y_9Ra730a8D8jegj4on_VQFSnQSrRNr3qproEkx2TwnzyknyOD3B1Dcb0JrKkCLbt1NaVm3Xns-ZZJM4gt07NHGUG5bwdS6bCZKMxHBjN3KW6ZXvVqCvzR7F0xW_hrnANADKMsh2oO28U5r-UaGfxMRUg28vjn_xPFP-qJfsPkkjiKE61DauXWhsB1v8NUjZNT8wa-C85CZ4fR4tkrBqM"
            />
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;