import React from 'react';
import { PageView } from '../types';
import api from '../services/api';

interface NewsletterProps {
    navigate: (page: PageView) => void;
}

const PAST_ISSUES = [
    { id: 1, title: 'Women Reshaping Rwanda\'s Financial Sector', date: 'February 2025', issue: '#48', preview: 'An in-depth look at female leaders driving innovation in banking, insurance, and fintech across Rwanda.' },
    { id: 2, title: 'RWIBAC 2024 Recap: The Year of Courage', date: 'January 2025', issue: '#47', preview: 'Highlights, winners, and speeches from the 4th annual Rwanda Women in Business Awards & Conference.' },
    { id: 3, title: 'Education as Empowerment: Girls Leading Change', date: 'December 2024', issue: '#46', preview: 'How Rwandan girls are breaking barriers in STEM education and redefining future career paths.' },
    { id: 4, title: 'Policy Watch: Gender Budgeting in Action', date: 'November 2024', issue: '#45', preview: 'Exploring Rwanda\'s groundbreaking approach to integrating gender perspectives into national budgets.' },
    { id: 5, title: 'Health & Wellness: A New Agenda for Working Women', date: 'October 2024', issue: '#44', preview: 'Mental health, workplace well-being, and the policies making a difference for professional women.' },
    { id: 6, title: 'Culture & Heritage: Stories from Rwanda\'s Matrilineal Past', date: 'September 2024', issue: '#43', preview: 'Rediscovering the historical roles of women in Rwandan governance and community leadership.' },
];

const FEATURES = [
    { icon: 'article', title: 'Curated Stories', description: 'Hand-picked articles on leadership, business, and empowerment.' },
    { icon: 'record_voice_over', title: 'Exclusive Interviews', description: 'In-depth conversations with Rwanda\'s top women leaders.' },
    { icon: 'event', title: 'Event Updates', description: 'First access to RWIBAC and other event announcements.' },
    { icon: 'insights', title: 'Policy Insights', description: 'Analysis of gender-related policy developments in Rwanda.' },
];

const Newsletter: React.FC<NewsletterProps> = ({ navigate }) => {
    const [email, setEmail] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [subscribed, setSubscribed] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        setError(null);

        try {
            await api.post('/subscribers', { email, source: 'newsletter_page' });
            setSubscribed(true);
        } catch (err: any) {
            console.error('Subscription failed:', err);
            if (err.response?.status === 409) {
                setError('You are already subscribed to our newsletter.');
                setSubscribed(true); // Treat as success for UI
            } else {
                setError('Failed to subscribe. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in font-sans">

            {/* Hero */}
            <section className="bg-surface-dark dark:bg-black text-white py-20 lg:py-28">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-primary text-white px-3 py-1 mb-6">Weekly Newsletter</span>
                            <h1 className="font-display text-5xl lg:text-7xl font-black uppercase leading-[0.85] tracking-tighter mb-6">
                                Stay<br />Informed
                            </h1>
                            <p className="text-lg text-gray-300 max-w-lg leading-relaxed mb-8">
                                Get curated stories, exclusive interviews, and event updates delivered to your inbox every week. Join thousands of readers who stay ahead with Rwanda Women Magazine.
                            </p>
                            {!subscribed ? (
                                <form onSubmit={handleSubscribe} className="flex flex-col w-full max-w-md gap-2">
                                    <div className="flex w-full">
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={isLoading}
                                            className="flex-grow bg-transparent border border-gray-500 px-4 py-3 text-sm focus:outline-none focus:border-primary text-white placeholder-gray-400 disabled:opacity-50"
                                            placeholder="YOUR EMAIL ADDRESS"
                                        />
                                        <button
                                            className="bg-primary text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                                            type="submit"
                                            disabled={isLoading}
                                        >
                                            {isLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                                            Subscribe
                                        </button>
                                    </div>
                                    {error && <p className="text-red-400 text-xs font-medium">{error}</p>}
                                </form>
                            ) : (
                                <div className="flex items-center gap-3 text-green-400 bg-green-900/20 border border-green-800 px-6 py-4 max-w-md">
                                    <span className="material-icons">check_circle</span>
                                    <span className="text-sm font-bold">You&apos;re subscribed! Check your inbox.</span>
                                </div>
                            )}
                        </div>
                        <div className="hidden lg:block">
                            <div className="bg-gray-800 border border-gray-700 p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-primary flex items-center justify-center">
                                        <span className="material-icons text-white text-xl">mail</span>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Rwanda Women Weekly</div>
                                        <div className="text-sm text-white">Issue #48 — February 2025</div>
                                    </div>
                                </div>
                                <hr className="border-gray-700 mb-4" />
                                <h3 className="font-display text-2xl font-bold text-white mb-3">Women Reshaping Rwanda's Financial Sector</h3>
                                <p className="text-sm text-gray-400 mb-4 line-clamp-3">An in-depth look at female leaders driving innovation in banking, insurance, and fintech across Rwanda...</p>
                                <div className="flex gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/20 text-primary px-2 py-0.5">Business</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/20 text-primary px-2 py-0.5">Finance</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-16 lg:py-20">

                {/* What You'll Get */}
                <section className="mb-20">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight text-text-light dark:text-text-dark mb-4">What You'll Get</h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">Every week, straight to your inbox — stories that matter.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {FEATURES.map((feature) => (
                            <div key={feature.title} className="text-center p-8 border border-gray-200 dark:border-gray-800 hover:border-primary transition-colors group">
                                <span className="material-icons text-4xl text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors mb-4 block">{feature.icon}</span>
                                <h3 className="font-display text-lg font-bold uppercase tracking-wider mb-2 text-text-light dark:text-text-dark">{feature.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Past Issues */}
                <section className="mb-20">
                    <div className="flex justify-between items-end mb-10 border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h2 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight text-text-light dark:text-text-dark">Past Issues</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {PAST_ISSUES.map((issue) => (
                            <article key={issue.id} className="group cursor-pointer border border-gray-200 dark:border-gray-800 hover:border-primary transition-colors">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5">{issue.issue}</span>
                                        <span className="text-xs text-gray-400">{issue.date}</span>
                                    </div>
                                    <h3 className="font-display text-xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors text-text-light dark:text-text-dark">{issue.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{issue.preview}</p>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-widest text-primary group-hover:underline">Read Issue</span>
                                    <span className="material-icons text-sm text-primary">arrow_forward</span>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Bottom CTA */}
                <section className="bg-primary text-white p-10 lg:p-16 text-center">
                    <span className="material-icons text-5xl mb-4 opacity-80">mark_email_read</span>
                    <h2 className="font-display text-3xl lg:text-5xl font-bold uppercase tracking-tight mb-4">Never Miss a Story</h2>
                    <p className="text-white/80 max-w-lg mx-auto mb-8">
                        Join our growing community of readers who care about women's leadership, business excellence, and positive change in Rwanda.
                    </p>
                    <button
                        onClick={() => navigate('SUBSCRIBE')}
                        className="border-2 border-white text-white px-10 py-4 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-primary transition-all"
                    >
                        Subscribe Now
                    </button>
                </section>

            </div>
        </div>
    );
};

export default Newsletter;
