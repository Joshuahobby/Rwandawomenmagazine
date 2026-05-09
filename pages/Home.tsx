import React, { useState } from 'react';
import { Article } from '../types';
import api from '../services/api';
import axios from 'axios';
import { Link } from 'react-router-dom';
import VotingBanner from '../components/VotingBanner';
import { useQuery } from '@tanstack/react-query';
import SEO from '../components/SEO';
import { FeaturedSkeleton, ArticleCardSkeleton } from '../components/Skeleton';
import { optimizeImage } from '../utils/image';

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

  if (isLoading && !featuredArticle) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark pt-24 pb-20">
        <div className="container mx-auto px-4 space-y-20">
          <FeaturedSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => <ArticleCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

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
        <img alt={article.title} className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500" src={optimizeImage(article.featuredImage, 400, 400)} />
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
    </Link>
  );

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

        {/* HERO STORIES GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          {/* Column 1: Title + Vertical Story */}
          <div className="lg:col-span-2">
            <h1 className="font-display font-black text-6xl lg:text-7xl uppercase leading-[0.85] tracking-tighter mb-6 break-words text-blue-900 dark:text-white">
              Sto-<br />ries
            </h1>
            {latestArticles[0] && (
              <Link to={`/article/${latestArticles[0].slug}`} className="group cursor-pointer block text-inherit decoration-none">
                <div className="aspect-[3/4] overflow-hidden mb-4 relative bg-gray-100 dark:bg-gray-800">
                  <img alt={latestArticles[0].title} className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700" src={optimizeImage(latestArticles[0].featuredImage, 400, 600)} />
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
                  <img alt={featuredArticle.title} className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700" src={optimizeImage(featuredArticle.featuredImage, 1200, 800)} />
                  <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 text-xs font-bold uppercase tracking-widest">Featured</div>
                </div>
                <div className="border-l-2 border-primary pl-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest border border-gray-300 dark:border-gray-600 px-2 py-0.5 text-text-light dark:text-text-dark">{featuredArticle.category.name}</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">{new Date(featuredArticle.publishedAt || featuredArticle.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()}</span>
                  </div>
                  <h2 className="font-display text-4xl lg:text-5xl font-black mb-3 leading-tight group-hover:text-primary transition-colors text-text-light dark:text-text-dark uppercase italic tracking-tighter">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 leading-relaxed italic">
                    {featuredArticle.excerpt}
                  </p>
                </div>
              </Link>
            )}
          </div>

          {/* Column 3: Secondary Featured Stories */}
          <div className="lg:col-span-4 space-y-8 flex flex-col">
            {latestArticles.slice(1, 4).map((article) => (
              <ArticleCardHorizontal key={article.id} article={article} />
            ))}
          </div>
        </div>

        {/* Section: Leadership & Empowerment */}
        <section className="mb-24">
          <SectionHeader title="Leadership" viewAllPath="/category/leadership-empowerment" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {leadershipArticles.map((article) => (
              <Link key={article.id} to={`/article/${article.slug}`} className="group cursor-pointer block text-inherit decoration-none">
                <div className="aspect-[16/9] overflow-hidden mb-5 bg-gray-100 dark:bg-gray-800">
                  <img alt={article.title} className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700" src={optimizeImage(article.featuredImage, 800, 450)} />
                </div>
                <h3 className="font-display text-2xl font-bold mb-2 group-hover:text-primary transition-colors text-text-light dark:text-text-dark italic">{article.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 italic">{article.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Section: Business (Dark Themed) */}
        <section className="mx-[-1rem] px-4 py-20 mb-24 bg-slate-900 text-white rounded-[3rem]">
          <div className="container mx-auto">
            <SectionHeader title="Business" viewAllPath="/category/business-economy" dark />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {businessArticles.map((article) => (
                <Link key={article.id} to={`/article/${article.slug}`} className="group cursor-pointer block text-inherit decoration-none">
                  <div className="aspect-square overflow-hidden mb-5 bg-gray-800">
                    <img alt={article.title} className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" src={optimizeImage(article.featuredImage, 400, 400)} />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition-colors text-white italic">{article.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Multi-Category Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
          <div className="lg:col-span-8">
            <SectionHeader title="Culture" viewAllPath="/category/culture-heritage" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {cultureArticles.slice(0, 2).map((article) => (
                <div key={article.id}>
                   <Link to={`/article/${article.slug}`} className="group cursor-pointer block text-inherit decoration-none">
                    <div className="aspect-[4/3] overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                      <img alt={article.title} className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700" src={optimizeImage(article.featuredImage, 600, 450)} />
                    </div>
                    <h3 className="font-display text-2xl font-bold mb-2 group-hover:text-primary transition-colors text-text-light dark:text-text-dark italic">{article.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 italic">{article.excerpt}</p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-4 bg-gray-50 dark:bg-gray-900/50 p-8 rounded-[2.5rem]">
            <SectionHeader title="Health" viewAllPath="/category/health-wellness" />
            <div className="space-y-8">
              {healthArticles.map((article) => (
                <ArticleListItem key={article.id} article={article} />
              ))}
            </div>
          </div>
        </div>

        {/* NEWSLETTER SECTION */}
        <section className="bg-primary py-20 rounded-[4rem] text-white text-center px-4 mb-24 shadow-2xl shadow-primary/20">
          <div className="max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.4em] mb-4 block opacity-80">STAY INFORMED</span>
            <h2 className="font-display text-5xl lg:text-6xl font-black mb-8 italic tracking-tighter">DAILY INTELLIGENCE</h2>
            <p className="text-lg mb-10 opacity-90 font-serif italic">Join 5,000+ subscribers receiving our curated narrative on leadership, business, and heritage.</p>
            
            {subscribed ? (
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl animate-fade-in">
                <span className="material-icons text-4xl mb-2">check_circle</span>
                <p className="text-xl font-bold tracking-tight">YOU ARE ON THE LIST.</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="ENTER YOUR EMAIL" 
                  className="flex-grow bg-white/10 border-2 border-white/20 rounded-full px-8 py-4 text-white placeholder:text-white/50 outline-none focus:border-white transition-colors text-sm font-bold tracking-widest"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button 
                  type="submit" 
                  disabled={isSubscribing}
                  className="bg-white text-primary px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50 shadow-lg shadow-black/10"
                >
                  {isSubscribing ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
                </button>
              </form>
            )}
            {subscribeError && !subscribed && <p className="mt-4 text-sm font-bold text-red-200">{subscribeError}</p>}
          </div>
        </section>

        {/* Final Row: Tech & Education */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          <div>
            <SectionHeader title="Tech" viewAllPath="/category/tech-innovation" />
            <div className="space-y-6">
              {techArticles.map((article) => (
                <ArticleCardHorizontal key={article.id} article={article} />
              ))}
            </div>
          </div>
          <div>
            <SectionHeader title="Education" viewAllPath="/category/education" />
            <div className="space-y-6">
              {educationArticles.map((article) => (
                <ArticleCardHorizontal key={article.id} article={article} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;