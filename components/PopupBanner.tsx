import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePopupStrategy } from '../hooks/usePopupStrategy';

interface SettingsData {
    NOMINATION_STATUS?: string;
    VOTING_STATUS?: string;
    NOMINATION_END_DATE?: string;
    VOTING_END_DATE?: string;
}

const PopupBanner: React.FC = () => {
    const navigate = useNavigate();
    const { isVisible: strategySaysShow, markDismissed, markActionTaken } = usePopupStrategy();
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

    // Type of banner to show
    const [bannerType, setBannerType] = useState<'NOMINATION' | 'VOTING' | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Settings payload logic, ignoring native local storage parsing now since usePopupStrategy handles bounds.
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);

                    if (data.NOMINATION_STATUS === 'open') {
                        setBannerType('NOMINATION');
                    } else if (data.NOMINATION_STATUS === 'closed' && data.VOTING_STATUS === 'open') {
                        setBannerType('VOTING');
                    }
                }
            } catch (err) {
                console.error("Failed to load banner settings", err);
            }
        };

        fetchSettings();
    }, []);

    useEffect(() => {
        if (!strategySaysShow || !settings || !bannerType) return;

        const targetDateStr = bannerType === 'NOMINATION' ? settings.NOMINATION_END_DATE : settings.VOTING_END_DATE;
        if (!targetDateStr) return;

        const targetTime = new Date(targetDateStr).getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = targetTime - now;

            if (distance < 0) {
                setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
                return;
            }

            setTimeLeft({
                d: Math.floor(distance / (1000 * 60 * 60 * 24)),
                h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((distance % (1000 * 60)) / 1000)
            });
        };

        updateTimer(); // Initial call
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [strategySaysShow, settings, bannerType]);

    // Active bounds
    if (!strategySaysShow || !bannerType) return null;

    const isNomination = bannerType === 'NOMINATION';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-zinc-900 text-text-light dark:text-text-dark animate-fade-in-up">

                {/* Top decorative bar */}
                <div className={`h-2 w-full ${isNomination ? 'bg-primary' : 'bg-gray-800 dark:bg-white/20'}`}></div>

                <div className="relative p-8">
                    {/* Close button */}
                    <button
                        onClick={markDismissed}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        aria-label="Close banner"
                    >
                        <span className="material-icons text-sm">close</span>
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${isNomination ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white'}`}>
                            <span className="material-icons text-3xl">{isNomination ? 'emoji_events' : 'how_to_vote'}</span>
                        </div>

                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">
                            RWIBA 2026 Phase
                        </span>

                        <h3 className="font-display text-2xl font-black uppercase leading-tight mb-3 text-text-light dark:text-white">
                            {isNomination ? 'Nominations Open' : 'Public Voting Open'}
                        </h3>

                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6 px-2">
                            {isNomination
                                ? "Recognize the women shaping Rwanda's future. Submit your hero today."
                                : "Support the nominees driving excellence. Cast your vote now!"}
                        </p>

                        {timeLeft && (
                            <div className="mb-8 w-full">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-3">
                                    Time Remaining
                                </span>
                                <div className="flex gap-3 justify-center">
                                    {[
                                        { label: 'Days', value: timeLeft.d },
                                        { label: 'Hrs', value: timeLeft.h },
                                        { label: 'Min', value: timeLeft.m },
                                        { label: 'Sec', value: timeLeft.s }
                                    ].map((t, idx) => (
                                        <div key={idx} className="flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-white/5 rounded-xl w-14 py-2">
                                            <span className="font-display font-black text-xl leading-none text-gray-900 dark:text-white mb-1">{t.value.toString().padStart(2, '0')}</span>
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">{t.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                markActionTaken();
                                navigate(isNomination ? '/nomination#main-content' : '/voting#main-content');
                            }}
                            className="w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 bg-primary text-white hover:bg-opacity-90 hover:-translate-y-1 hover:shadow-primary/40"
                        >
                            {isNomination ? 'Nominate Now' : 'Vote Now'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PopupBanner;
