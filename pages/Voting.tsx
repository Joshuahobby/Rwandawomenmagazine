import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PageView } from '../types';

interface VotingProps {
    navigate: (page: PageView, id?: string | null) => void;
}


interface NomineeResult {
    nominationId: string;
    nomineeName: string;
    nomineeOrganization: string | null;
    sector: string | null;
    votes: number;
    percentage?: number;
    achievements?: string;
}

interface CategoryResult {
    categoryId: number;
    categoryName: string;
    categorySlug: string;
    group: string;
    nominees: NomineeResult[];
}

const API = '';

const GROUP_LABELS: Record<string, string> = {
    INDIVIDUAL: 'Individual Awards',
    CORPORATE: 'Top 5 Corporate Awards',
    SME: 'Top 5 SME Awards',
};

const Voting: React.FC<VotingProps> = ({ navigate }) => {
    const location = useLocation();
    const [results, setResults] = useState<CategoryResult[]>([]);
    const [selectedCat, setSelectedCat] = useState<CategoryResult | null>(null);
    const [activeGroup, setActiveGroup] = useState<string>('INDIVIDUAL');
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState<string | null>(null);
    const [votedCategories, setVotedCategories] = useState<Set<number>>(new Set());
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [fingerprint, setFingerprint] = useState<string>('');
    const [votingStatus, setVotingStatus] = useState<string>('OPEN');

    useEffect(() => {
        loadResults();
        initFingerprint();
        fetchStatus();
    }, []);

    // Handle initial scrolling if navigated with a hash
    useEffect(() => {
        if (location.hash === '#main-content') {
            const el = document.getElementById('main-content');
            if (el) {
                setTimeout(() => {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    }, [location.hash]);

    const fetchStatus = async () => {
        try {
            const res = await fetch(`${API}/api/settings`);
            const data = await res.json();

            // Normalize to uppercase for UI comparisons
            let status = (data.VOTING_STATUS || 'closed').toUpperCase();
            const now = new Date();

            if (data.VOTING_START_DATE) {
                const start = new Date(data.VOTING_START_DATE);
                if (now < start) {
                    status = 'UPCOMING';
                }
            }

            if (data.VOTING_END_DATE) {
                const end = new Date(data.VOTING_END_DATE);
                if (now > end) {
                    status = 'CLOSED';
                }
            }

            setVotingStatus(status);
        } catch { /* Fall back to OPEN */ }
    };

    const initFingerprint = async () => {
        try {
            // Simple robust fingerprint using canvas + signals
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const txt = 'rwiba2026-fraud-prevention';
            if (ctx) {
                ctx.textBaseline = "top";
                ctx.font = "14px 'Arial'";
                ctx.fillStyle = "#f60";
                ctx.fillRect(125, 1, 62, 20);
                ctx.fillStyle = "#069";
                ctx.fillText(txt, 2, 15);
                ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
                ctx.fillText(txt, 4, 17);
                const str = canvas.toDataURL();
                let hash = 0;
                for (let i = 0; i < str.length; i++) {
                    hash = ((hash << 5) - hash) + str.charCodeAt(i);
                    hash |= 0;
                }
                setFingerprint(Math.abs(hash).toString(16) + '-' + navigator.hardwareConcurrency + '-' + screen.colorDepth);
            }
        } catch {
            setFingerprint('fp-' + Math.random().toString(36).substring(2, 9));
        }
    };

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        try {
            const res = await fetch(`${API}/api/votes/results`);
            const data = await res.json();
            setResults(data);
            // Select first category with nominees
            if (data.length > 0) {
                const first = data.find((c: CategoryResult) => c.nominees.length > 0) || data[0];
                setSelectedCat(first);
                setActiveGroup(first.group);
            }
        } catch {
            // Silently fail — show empty state
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (nominationId: string, categoryId: number) => {
        if (votedCategories.has(categoryId)) {
            setFeedback({ type: 'error', msg: 'You have already voted in this category.' });
            return;
        }

        setVoting(nominationId);
        setFeedback(null);

        try {
            // 1. Get a short-lived voting ticket
            const ticketRes = await fetch(`${API}/api/votes/ticket`);
            if (!ticketRes.ok) {
                setFeedback({ type: 'error', msg: 'Failed to initialize secure session. Please refresh.' });
                setVoting(null);
                return;
            }
            const { ticket } = await ticketRes.json();

            if (!ticket) {
                setFeedback({ type: 'error', msg: 'Security ticket missing. Please refresh.' });
                setVoting(null);
                return;
            }

            // 2. Cast the vote with all security signals
            const res = await fetch(`${API}/api/votes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nominationId,
                    fingerprint,
                    ticket,
                    hp_field: '' // Honey-pot
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setFeedback({ type: 'error', msg: data.error || 'Failed to vote.' });
                if (res.status === 409) {
                    setVotedCategories((prev) => new Set(prev).add(categoryId));
                }
                return;
            }

            setFeedback({ type: 'success', msg: 'Your vote has been recorded! Thank you.' });
            setVotedCategories((prev) => new Set(prev).add(categoryId));
            // Refresh results
            await loadResults();
        } catch {
            setFeedback({ type: 'error', msg: 'Connection error. Please try again.' });
        } finally {
            setVoting(null);
        }
    };


    const totalVotesInCategory = selectedCat?.nominees.reduce((s, n) => s + n.votes, 0) || 0;

    return (
        <div className="animate-fade-in font-sans">

            {/* Hero */}
            <section className="relative bg-surface-dark dark:bg-black text-white py-8 lg:py-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-transparent"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 ${votingStatus === 'OPEN' ? 'bg-primary' : (votingStatus === 'UPCOMING' ? 'bg-blue-500' : 'bg-red-500')} text-white`}>
                            {votingStatus === 'OPEN' ? 'Public Voting' : (votingStatus === 'UPCOMING' ? 'Voting Opens March 5' : 'Voting Closed')}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 text-white/90 px-3 py-1">RWIBA 2026</span>
                    </div>
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-black uppercase leading-[0.85] tracking-tighter mb-6">
                        Vote for<br /><span className="text-primary">Excellence</span>
                    </h1>
                    <p className="text-base lg:text-lg text-gray-300 max-w-2xl leading-relaxed">
                        {votingStatus === 'OPEN'
                            ? "Cast your vote for the nominees who inspire you most. You can vote once per category. Support the women and organizations driving Rwanda's transformation."
                            : (votingStatus === 'UPCOMING'
                                ? "Public voting for RWIBA 2026 will open on March 5, 2026. Get ready to support your favorite nominees!"
                                : "The public voting phase for RWIBA 2026 has concluded. Thank you for your participation. Winners will be announced at the awards ceremony.")}
                    </p>
                </div>
            </section>

            <div id="main-content" className="container mx-auto px-4 py-12 lg:py-16">

                {/* Feedback Banner */}
                {feedback && (
                    <div className={`mb-8 px-5 py-4 text-sm font-medium flex items-center gap-3 animate-fade-in ${feedback.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                        }`}>
                        <span className="material-icons text-base">{feedback.type === 'success' ? 'check_circle' : 'error'}</span>
                        {feedback.msg}
                        <button onClick={() => setFeedback(null)} className="ml-auto material-icons text-base opacity-60 hover:opacity-100">close</button>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : results.length === 0 ? (
                    /* Empty state - no nominees yet */
                    <div className="text-center py-24">
                        <span className="material-icons text-6xl text-gray-300 dark:text-gray-600 mb-6">how_to_vote</span>
                        <h2 className="font-display text-3xl font-bold uppercase mb-4 text-text-light dark:text-text-dark">Voting Opens Soon</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
                            The nomination period is currently active. Public voting will open once nominees are approved and shortlisted.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <button
                                onClick={() => navigate('NOMINATION')}
                                className="bg-primary text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-opacity-90 transition-opacity"
                            >
                                Nominate Now
                            </button>
                            <button
                                onClick={() => navigate('EVENTS')}
                                className="border border-black dark:border-white text-text-light dark:text-text-dark px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all"
                            >
                                View Event Details
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Voting UI */
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                        {/* Left sidebar — Category List */}
                        <div className="lg:col-span-1">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">Select Category</h3>

                            {/* Accordion-style Category Groups */}
                            <div className="space-y-2">
                                {(['INDIVIDUAL', 'CORPORATE', 'SME'] as const).map((g) => (
                                    <div key={g} className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                                        <button
                                            onClick={() => setActiveGroup(activeGroup === g ? '' : g)}
                                            className={`w-full flex items-center justify-between py-4 px-4 text-xs font-bold uppercase tracking-widest transition-all ${activeGroup === g
                                                ? 'bg-primary text-white'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            <span>{GROUP_LABELS[g]}</span>
                                            <span className={`material-icons text-sm transition-transform duration-300 ${activeGroup === g ? 'rotate-180' : ''}`}>
                                                expand_more
                                            </span>
                                        </button>

                                        <div className={`transition-all duration-300 ease-in-out ${activeGroup === g ? 'max-h-[800px] opacity-100 py-2' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                                            <div className="space-y-1">
                                                {results.filter(c => c.group === g).map((cat) => (
                                                    <button
                                                        key={cat.categoryId}
                                                        onClick={() => { setSelectedCat(cat); setFeedback(null); }}
                                                        className={`w-full text-left px-6 py-3 text-[11px] transition-all flex items-center justify-between ${selectedCat?.categoryId === cat.categoryId
                                                            ? 'text-primary font-bold bg-primary/5 border-r-4 border-primary'
                                                            : 'text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary'
                                                            }`}
                                                    >
                                                        <span className="leading-snug pr-2">{cat.categoryName}</span>
                                                        {cat.nominees.length > 0 && (
                                                            <span className={`flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded font-bold ${selectedCat?.categoryId === cat.categoryId ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                                                {cat.nominees.length}
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Voting rules */}
                            <div className="mt-8 bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-800 p-5">
                                <h4 className="font-display text-sm font-bold uppercase tracking-wider mb-3 text-text-light dark:text-text-dark">Voting Rules</h4>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                                        <span className="material-icons text-primary text-[10px] mt-0.5">{votingStatus === 'OPEN' ? 'check' : 'lock'}</span>
                                        {votingStatus === 'OPEN' ? 'One vote per category' : 'Voting is now closed'}
                                    </li>
                                    <li className="flex items-start gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                                        <span className="material-icons text-primary text-[10px] mt-0.5">check</span>
                                        All votes are anonymous
                                    </li>
                                    <li className="flex items-start gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                                        <span className="material-icons text-primary text-[10px] mt-0.5">check</span>
                                        Results announced at ceremony
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Main — Nominees for selected category */}
                        <div className="lg:col-span-3">
                            {selectedCat ? (
                                <>
                                    <div className="mb-8">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">{GROUP_LABELS[selectedCat.group]}</span>
                                        <h2 className="font-display text-2xl lg:text-3xl font-bold text-text-light dark:text-text-dark mb-2">{selectedCat.categoryName}</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {selectedCat.nominees.length} nominee{selectedCat.nominees.length !== 1 ? 's' : ''} • {totalVotesInCategory} total vote{totalVotesInCategory !== 1 ? 's' : ''}
                                        </p>
                                    </div>

                                    {selectedCat.nominees.length === 0 ? (
                                        <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-700">
                                            <span className="material-icons text-4xl text-gray-300 dark:text-gray-600 mb-3">person_search</span>
                                            <p className="text-gray-500 dark:text-gray-500 text-sm">No approved nominees in this category yet.</p>
                                            <button onClick={() => navigate('NOMINATION')} className="mt-4 text-primary text-xs font-bold uppercase tracking-widest hover:underline">
                                                Submit a Nomination →
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {selectedCat.nominees
                                                .sort((a, b) => b.votes - a.votes)
                                                .map((nominee, idx) => {
                                                    const pct = totalVotesInCategory > 0 ? Math.round((nominee.votes / totalVotesInCategory) * 100) : 0;
                                                    const hasVoted = votedCategories.has(selectedCat.categoryId);

                                                    return (
                                                        <div key={nominee.nominationId} className="border border-gray-200 dark:border-gray-800 p-5 hover:border-primary/30 transition-colors">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        {idx === 0 && totalVotesInCategory > 0 && (
                                                                            <span className="material-icons text-yellow-500 text-base">star</span>
                                                                        )}
                                                                        <h3 className="font-display text-lg font-bold text-text-light dark:text-text-dark">{nominee.nomineeName}</h3>
                                                                    </div>
                                                                    {nominee.nomineeOrganization && (
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{nominee.nomineeOrganization}</p>
                                                                    )}
                                                                    {nominee.sector && (
                                                                        <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5">{nominee.sector}</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-4 flex-shrink-0">
                                                                    <div className="text-right">
                                                                        <div className="font-display text-2xl font-bold text-text-light dark:text-text-dark">{nominee.votes}</div>
                                                                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">votes</div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleVote(nominee.nominationId, selectedCat.categoryId)}
                                                                        disabled={votingStatus !== 'OPEN' || hasVoted || voting === nominee.nominationId}
                                                                        className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${votingStatus !== 'OPEN' || hasVoted
                                                                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                                                            : 'bg-primary text-white hover:bg-opacity-90'
                                                                            }`}
                                                                    >
                                                                        {voting === nominee.nominationId ? (
                                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                        ) : votingStatus !== 'OPEN' ? (
                                                                            <>
                                                                                <span className="material-icons text-sm">lock</span>
                                                                                Closed
                                                                            </>
                                                                        ) : hasVoted ? (
                                                                            <>
                                                                                <span className="material-icons text-sm">check</span>
                                                                                Voted
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <span className="material-icons text-sm">how_to_vote</span>
                                                                                Vote
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            {/* Progress bar */}
                                                            <div className="mt-4">
                                                                <div className="flex justify-between text-[10px] mb-1">
                                                                    <span className="text-gray-400 uppercase tracking-widest">{pct}% of votes</span>
                                                                </div>
                                                                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5">
                                                                    <div
                                                                        className="bg-primary h-full transition-all duration-700"
                                                                        ref={(el) => { if (el) el.style.width = `${pct}%`; }}
                                                                    ></div>


                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-20">
                                    <span className="material-icons text-5xl text-gray-300 dark:text-gray-600">ballot</span>
                                    <p className="text-gray-500 dark:text-gray-500 mt-4">Select a category to view nominees and vote.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* CTA */}
                <section className="mt-16 bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-800 p-10 lg:p-14 text-center">
                    <span className="material-icons text-4xl text-primary mb-3">emoji_events</span>
                    <h2 className="font-display text-2xl lg:text-4xl font-bold uppercase tracking-tight mb-4 text-text-light dark:text-text-dark">RWIBA 2026 Awards Ceremony</h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-6 text-sm leading-relaxed">
                        Winners will be announced at the RWIBA 5th Anniversary celebration on March 27, 2026 at Lemigo Hotel, Kigali.
                    </p>
                    <button
                        onClick={() => navigate('EVENTS')}
                        className="bg-primary text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-opacity-90 transition-opacity"
                    >
                        View Full Event Details
                    </button>
                </section>
            </div>
        </div>
    );
};

export default Voting;
