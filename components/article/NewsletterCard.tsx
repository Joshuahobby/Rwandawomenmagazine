import React, { useState } from 'react';
import axios from 'axios';
import api from '../../services/api';

/**
 * Sidebar subscribe form. Posts to the same endpoint as the homepage
 * newsletter section, tagged with its own source so signups can be attributed.
 */
const NewsletterCard: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [subscribeError, setSubscribeError] = useState<string | null>(null);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || isSubscribing) return;

        setIsSubscribing(true);
        setSubscribeError(null);

        try {
            await api.post('/subscribers', { email, source: 'article_sidebar' });
            setSubscribed(true);
        } catch (err: unknown) {
            console.error('Subscription failed:', err);
            if (axios.isAxiosError(err) && err.response?.status === 409) {
                setSubscribeError('Already subscribed!');
                setSubscribed(true);
            } else {
                setSubscribeError('Failed. Please try again.');
            }
        } finally {
            setIsSubscribing(false);
        }
    };

    return (
        <section className="rounded-2xl bg-primary text-white p-6">
            <span className="material-icons text-3xl mb-3 block opacity-80" aria-hidden="true">
                mail
            </span>
            <h3 className="font-display text-lg font-bold uppercase mb-2">Stay Updated</h3>
            <p className="text-sm text-white/80 mb-4">
                Get our latest stories delivered straight to your inbox.
            </p>

            {subscribed ? (
                <p className="text-sm font-bold animate-fade-in">
                    {subscribeError || 'You are on the list.'}
                </p>
            ) : (
                <form onSubmit={handleSubscribe} className="space-y-3">
                    <label htmlFor="sidebar-newsletter-email" className="sr-only">
                        Email address
                    </label>
                    <input
                        id="sidebar-newsletter-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-white/10 border-2 border-white/30 rounded-full px-5 py-3 text-sm text-white placeholder:text-white/60 outline-none focus:border-white transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={isSubscribing}
                        className="w-full bg-white text-primary px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50"
                    >
                        {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                    </button>
                    {subscribeError && (
                        <p className="text-xs font-bold text-white/90">{subscribeError}</p>
                    )}
                </form>
            )}
        </section>
    );
};

export default NewsletterCard;
