/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { PageView } from '../types';

interface EventsProps {
    navigate: (view: PageView) => void;
}

// ── Countdown helper ──────────────────────────────────────
const EVENT_DATE = new Date('2026-03-27T13:00:00+02:00');

function useCountdown(target: Date) {
    const calc = () => {
        const diff = target.getTime() - Date.now();
        if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        return {
            days: Math.floor(diff / 86400000),
            hours: Math.floor((diff % 86400000) / 3600000),
            minutes: Math.floor((diff % 3600000) / 60000),
            seconds: Math.floor((diff % 60000) / 1000),
        };
    };
    const [time, setTime] = useState(calc);
    useEffect(() => {
        const id = setInterval(() => setTime(calc), 1000);
        return () => clearInterval(id);
    }, []);
    return time;
}

// ── Award Categories Data ─────────────────────────────────
const INDIVIDUAL_CATEGORIES = [
    { id: 1, name: 'Women Breaking Barriers in Male Dominated Sectors', icon: 'construction', desc: 'Women excelling in construction, manufacturing, transport, logistics, ICT hardware, or agri-mechanization.' },
    { id: 2, name: 'Gender Transformative Enterprise Award', icon: 'diversity_3', desc: 'Women-led businesses engaging men to promote equality and transform workplace culture.' },
    { id: 3, name: 'Inclusive Innovation for Community Transformation', icon: 'lightbulb', desc: 'Women-led businesses developing innovative solutions with social impact in underserved communities.' },
    { id: 4, name: 'Sustainability Trailblazer Award', icon: 'eco', desc: 'Women advancing environmental sustainability, green business, or circular economy.' },
    { id: 5, name: 'Emerging Woman Founder Under 30', icon: 'trending_up', desc: 'Young women entrepreneurs demonstrating leadership, innovation, and growth potential.' },
    { id: 6, name: 'Transformational Agripreneur of the Year', icon: 'agriculture', desc: 'Women transforming agriculture value chains through technology and innovation.' },
    { id: 7, name: 'Digital Acceleration & Tech Inclusion', icon: 'devices', desc: 'Women leveraging technology to scale businesses and promote digital inclusion.' },
    { id: 8, name: 'Export Readiness & Market Linkage Champion', icon: 'public', desc: 'Women achieving cross-border trade, regional exports, or strong market linkages.' },
    { id: 9, name: 'Resilience & Business Continuity Leadership', icon: 'shield', desc: 'Women who navigated crises, adapted operations, or diversified to survive shocks.' },
    { id: 10, name: 'Women Led Impact Enterprise (High Social ROI)', icon: 'volunteer_activism', desc: 'Enterprises prioritizing social impact alongside profitability.' },
    { id: 11, name: 'Creative Economy Powerhouse Award', icon: 'palette', desc: 'Women excelling in fashion, arts, design, media, and entertainment.' },
    { id: 12, name: 'Health & Wellness Industry Leadership', icon: 'health_and_safety', desc: 'Women transforming health, wellness, or lifestyle sectors.' },
    { id: 13, name: 'Manufacturing & Production Excellence', icon: 'precision_manufacturing', desc: 'Women achieving excellence in production efficiency, quality, and innovation.' },
    { id: 14, name: 'Women in Green & Climate Smart Business', icon: 'forest', desc: 'Women contributing to climate resilience through green solutions.' },
    { id: 15, name: 'Niche Tourism & Experience Curator', icon: 'tour', desc: 'Women creating unique tourism or hospitality experiences showcasing Rwandan heritage.' },
    { id: 16, name: 'Employee Wellbeing & Human Capital Advocate', icon: 'favorite', desc: 'Women leaders with exceptional employee mental health and development policies.' },
    { id: 17, name: 'Most Gender-Intentionally Designed Product/Service', icon: 'design_services', desc: 'Products or services explicitly designed to address gender-specific needs.' },
    { id: 18, name: 'Male Champion for Gender Equity', icon: 'handshake', desc: 'Male leaders who have actively championed gender equality and women\'s advancement.' },
];

const CORPORATE_CATEGORIES = [
    { id: 19, name: 'Corporate Allyship & Inclusive Leadership Champion', icon: 'corporate_fare', desc: 'Measurable commitment to gender-inclusive leadership and institutional accountability.' },
    { id: 20, name: 'Corporate Excellence in Workplace Culture', icon: 'apartment', desc: 'Leadership in building a safe, inclusive, and high-performing workplace.' },
    { id: 21, name: 'Corporate Champion for Women in Leadership', icon: 'supervisor_account', desc: 'Advancing women into senior leadership through structured talent pipelines.' },
    { id: 22, name: 'Corporate Leader in Gender-Intentional Governance', icon: 'gavel', desc: 'Embedding inclusive principles within corporate governance frameworks.' },
    { id: 23, name: 'Corporate Inclusive Value Chain Innovator', icon: 'hub', desc: 'Expanding economic participation for women within supply chains and procurement.' },
];

const SME_CATEGORIES = [
    { id: 24, name: 'SME Inclusive Business Leader', icon: 'storefront', desc: 'Outstanding SME demonstrating inclusive leadership and equitable workplace structures.' },
    { id: 25, name: 'SME Excellence in Workplace Culture', icon: 'groups', desc: 'Commitment to fairness, dignity, and supportive workplace systems.' },
    { id: 26, name: 'SME Champion for Women\'s Enterprise Growth', icon: 'trending_up', desc: 'Active investment in mentorship and leadership opportunities for women.' },
    { id: 27, name: 'SME Leader in Fair & Equitable Business Practice', icon: 'balance', desc: 'Transparent recruitment, equal opportunity, and fair evaluation practices.' },
    { id: 28, name: 'SME Community Impact & Inclusion Champion', icon: 'diversity_1', desc: 'Strategic engagement strengthening inclusive economic participation.' },
];

// ── Summit Panels ─────────────────────────────────────────
const SUMMIT_PANELS = [
    {
        title: 'Rethinking Masculinities in Modern Rwanda',
        topics: [
            'Societal norms and harmful gender stereotypes',
            'Redefining masculinity in leadership spaces',
            'Emotional intelligence and responsible leadership',
        ],
    },
    {
        title: 'Male Allyship in Corporate & Institutional Leadership',
        topics: [
            'Mentorship vs sponsorship: what truly moves women into leadership',
            'Policy-driven inclusion (equal pay, parental leave, governance reforms)',
            'Corporate governance as a tool for gender equity',
            'Building pipelines for women in executive roles',
        ],
    },
    {
        title: 'Women in Health Leadership & Inclusive Healthcare Systems',
        topics: [
            'Women in executive hospital leadership and medical institutions',
            'Gender-responsive healthcare policies and system design',
            'Expanding maternal, reproductive, and mental health services',
            'Leadership resilience in times of health crises',
        ],
    },
    {
        title: 'Women Leading Financial Inclusion & Risk Resilience',
        topics: [
            'Women\'s leadership in auditing, compliance, and tax advisory',
            'Designing inclusive financial products for women entrepreneurs',
            'Gender-responsive lending and access to capital',
            'Role of banks in supporting women-led businesses',
        ],
    },
    {
        title: 'Agriculture & Inclusive Microfinance for Women\'s Economic Resilience',
        topics: [
            'Designing women-centered microfinance products for market traders',
            'Empowering women farmers from production to markets',
            'Climate-smart agriculture and resilience among women farmers',
            'Live beneficiary testimonies from women entrepreneurs',
        ],
    },
    {
        title: 'From Dialogue to Measurable Action',
        topics: [
            'Case studies from SMEs under RWAMREC',
            'CEOs as visible male champions',
            'What does a gender-equal Rwanda look like when men intentionally lead alongside women?',
        ],
    },
];

const PAST_EVENTS = [
    { id: 4, title: 'RWIBA 2025 — 4th Edition', date: 'March 2025', image: '/uploads/pictures/RWIBA GALLERY (2).jpg' },
    { id: 5, title: 'RWIBA 2024 — "Celebrating Excellence"', date: 'March 2024', image: '/uploads/pictures/RWIBA GALLERY (3).jpg' },
    { id: 6, title: 'RWIBA 2023 — "Trailblazers"', date: 'March 2023', image: '/uploads/pictures/RWIBA GALLERY (4).jpg' },
    { id: 7, title: 'RWIBA 2022 — Inaugural Edition', date: 'March 2022', image: '/uploads/pictures/RWIBA GALLERY (5).jpg' },
];

const STATS = [
    { label: 'Years Running', value: '5', icon: 'calendar_today' },
    { label: 'Award Categories', value: '27+', icon: 'emoji_events' },
    { label: 'Summit Panels', value: '6', icon: 'forum' },
    { label: 'Partner Orgs', value: 'RWAMREC', icon: 'handshake' },
];

const JUDGING = [
    { label: 'Impact & Results', pct: 30, color: '#a84020' },
    { label: 'Innovation', pct: 20, color: '#c9652e' },
    { label: 'Leadership & Vision', pct: 20, color: '#A38B75' },
    { label: 'Sustainability', pct: 15, color: '#6b8e56' },
    { label: 'Inclusion & Allyship', pct: 15, color: '#4a7c8c' },
];

const Events: React.FC<EventsProps> = ({ navigate }) => {
    const countdown = useCountdown(EVENT_DATE);
    const [openPanel, setOpenPanel] = useState<number | null>(0);
    const [categoryTab, setCategoryTab] = useState<'individual' | 'corporate' | 'sme'>('individual');

    const activeCats = categoryTab === 'individual' ? INDIVIDUAL_CATEGORIES : categoryTab === 'corporate' ? CORPORATE_CATEGORIES : SME_CATEGORIES;

    return (
        <div className="animate-fade-in font-sans">

            {/* ─── Hero ─────────────────────────────────────────── */}
            <section className="relative bg-surface-dark dark:bg-black text-white overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="/uploads/pictures/RWIBA GALLERY (1).jpg"
                        alt="RWIBA 2026"
                        className="w-full h-full object-cover opacity-20"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/70 to-transparent"></div>
                </div>
                <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-primary text-white px-3 py-1">5th Anniversary</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 text-white/90 px-3 py-1">27 March 2026</span>
                    </div>
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-black uppercase leading-[0.85] tracking-tighter mb-4">
                        RWIBA 2026<br /><span className="text-primary">Male Allyship</span><br />in Action
                    </h1>
                    <p className="text-base lg:text-lg text-gray-300 max-w-2xl mb-4 leading-relaxed">
                        The Rwanda Women in Business Awards celebrates five years of honoring outstanding female leaders, innovators, and entrepreneurs driving Rwanda&apos;s socio-economic transformation.
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8">
                        <span className="flex items-center gap-1.5">
                            <span className="material-icons text-primary text-base">location_on</span>
                            Lemigo Hotel, Kigali
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="material-icons text-primary text-base">schedule</span>
                            1:00 PM – 9:00 PM
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="material-icons text-primary text-base">event</span>
                            Friday, 27 March 2026
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => navigate('NOMINATION')}
                            className="bg-primary text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-opacity-90 transition-opacity"
                        >
                            Nominate Now
                        </button>
                        <button
                            onClick={() => navigate('VOTING')}
                            className="border border-white text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                        >
                            Vote Now
                        </button>
                    </div>
                </div>
            </section>

            {/* ─── Countdown + Stats ───────────────────────────── */}
            <section className="bg-primary text-white">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
                        {[
                            { v: countdown.days, l: 'Days' },
                            { v: countdown.hours, l: 'Hours' },
                            { v: countdown.minutes, l: 'Minutes' },
                            { v: countdown.seconds, l: 'Seconds' },
                        ].map((t) => (
                            <div key={t.l} className="text-center">
                                <div className="font-display text-4xl lg:text-6xl font-black tabular-nums">{String(t.v).padStart(2, '0')}</div>
                                <div className="text-[10px] uppercase tracking-widest mt-1 opacity-80">{t.l}</div>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 border-t border-white/20 pt-8">
                        {STATS.map((s) => (
                            <div key={s.label} className="text-center">
                                <span className="material-icons text-2xl mb-1 opacity-80">{s.icon}</span>
                                <div className="font-display text-2xl lg:text-3xl font-bold">{s.value}</div>
                                <div className="text-[10px] uppercase tracking-widest mt-0.5 opacity-80">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-16 lg:py-20">

                {/* ─── About RWIBA + Male Allyship Summit ──────── */}
                <section className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4 block">About RWIBA</span>
                        <h2 className="font-display text-3xl lg:text-4xl font-bold leading-tight mb-6 text-text-light dark:text-text-dark">
                            Five Years of Inspiring Women&apos;s Excellence
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                            The Rwanda Women in Business Awards (RWIBA) is an annual national platform that honors outstanding female leaders, innovators, and entrepreneurs who contribute significantly to Rwanda&apos;s socio-economic transformation. Since its inception, RWIBA has created a unique space where women from diverse sectors connect, learn, and celebrate achievements.
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            The 2026 edition marks five years of inspiring women&apos;s excellence — reflecting RWIBA&apos;s commitment to promoting gender-inclusive leadership across Rwanda.
                        </p>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4 block">&ldquo;Male Allyship in Action&rdquo; Summit</span>
                        <h2 className="font-display text-3xl lg:text-4xl font-bold leading-tight mb-6 text-text-light dark:text-text-dark">
                            From Acknowledgment to Action
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                            To commemorate its 5th anniversary, RWIBA introduces the &ldquo;Male Allyship in Action&rdquo; Summit — a strategic platform engaging men as critical partners in advancing gender equality and women&apos;s empowerment.
                        </p>
                        <div className="bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-800 p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="material-icons text-primary">handshake</span>
                                <h4 className="font-display text-sm font-bold uppercase tracking-wider text-text-light dark:text-text-dark">Organized in Partnership With RWAMREC</h4>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                The Rwanda Men&apos;s Resource Centre (RWAMREC) plays a pivotal role in championing positive masculinities nationwide, empowering SMEs and cooperatives to transform workplace cultures, adopt gender-responsive policies, and elevate women into leadership.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ─── Summit Panels Accordion ──────────────────── */}
                <section className="mb-20">
                    <div className="flex justify-between items-end mb-10 border-b border-gray-200 dark:border-gray-700 pb-4">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Summit Program</span>
                            <h2 className="font-display text-3xl lg:text-4xl font-bold uppercase tracking-tight text-text-light dark:text-text-dark">Panel Discussions</h2>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {SUMMIT_PANELS.map((panel, i) => (
                            <div key={i} className="border border-gray-200 dark:border-gray-800 overflow-hidden">
                                <button
                                    onClick={() => setOpenPanel(openPanel === i ? null : i)}
                                    className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="w-8 h-8 bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">{i + 1}</span>
                                        <h3 className="font-display text-lg font-bold text-text-light dark:text-text-dark">{panel.title}</h3>
                                    </div>
                                    <span className={`material-icons text-gray-400 transition-transform duration-300 ${openPanel === i ? 'rotate-180' : ''}`}>expand_more</span>
                                </button>
                                {openPanel === i && (
                                    <div className="px-6 pb-6 pt-2 border-t border-gray-100 dark:border-gray-800 animate-fade-in">
                                        <ul className="space-y-3 pl-12">
                                            {panel.topics.map((topic, j) => (
                                                <li key={j} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                                                    <span className="material-icons text-primary text-xs mt-1">arrow_right</span>
                                                    {topic}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* ─── Award Categories ─────────────────────────── */}
                <section className="mb-20">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 border-b border-gray-200 dark:border-gray-700 pb-4">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">RWIBA 2026</span>
                            <h2 className="font-display text-3xl lg:text-4xl font-bold uppercase tracking-tight text-text-light dark:text-text-dark">Award Categories</h2>
                        </div>
                        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1">
                            {([['individual', 'Individual (18)'], ['corporate', 'Corporate (5)'], ['sme', 'SME (5)']] as const).map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => setCategoryTab(key)}
                                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${categoryTab === key
                                        ? 'bg-primary text-white'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-text-light dark:hover:text-text-dark'
                                        }`}
                                >{label}</button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeCats.map((cat) => (
                            <div
                                key={cat.id}
                                className="p-5 border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all group cursor-pointer"
                                onClick={() => navigate('NOMINATION')}
                            >
                                <span className="material-icons text-2xl text-gray-400 group-hover:text-primary transition-colors mb-3 block">{cat.icon}</span>
                                <h4 className="font-display text-sm font-bold uppercase tracking-wider mb-2 text-text-light dark:text-text-dark leading-snug">{cat.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{cat.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => navigate('NOMINATION')}
                            className="bg-primary text-white px-10 py-4 text-sm font-bold uppercase tracking-widest hover:bg-opacity-90 transition-opacity inline-flex items-center gap-2"
                        >
                            <span className="material-icons text-sm">how_to_vote</span>
                            Nominate for RWIBA 2026
                        </button>
                    </div>
                </section>

                {/* ─── Judging Criteria ─────────────────────────── */}
                <section className="mb-20">
                    <div className="flex justify-between items-end mb-10 border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h2 className="font-display text-3xl lg:text-4xl font-bold uppercase tracking-tight text-text-light dark:text-text-dark">Judging Criteria</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                        {JUDGING.map((j) => (
                            <div key={j.label} className="text-center p-6 border border-gray-200 dark:border-gray-800">
                                <div
                                    className="font-display text-4xl font-black mb-2"
                                    ref={(el) => { if (el) el.style.color = j.color; }}
                                >
                                    {j.pct}%
                                </div>
                                <div className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">{j.label}</div>
                                <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 h-1.5">
                                    <div
                                        className="h-full transition-all duration-1000"
                                        ref={(el) => { if (el) { el.style.width = `${j.pct}%`; el.style.backgroundColor = j.color; } }}
                                    ></div>
                                </div>
                            </div>


                        ))}
                    </div>
                </section>

                {/* ─── Past Events Gallery ─────────────────────── */}
                <section className="mb-20">
                    <div className="flex justify-between items-end mb-10 border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h2 className="font-display text-3xl lg:text-4xl font-bold uppercase tracking-tight text-text-light dark:text-text-dark">Past Events</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {PAST_EVENTS.map((event) => (
                            <div key={event.id} className="group relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer">
                                <img
                                    alt={event.title}
                                    src={event.image}
                                    className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                    <h4 className="font-display text-lg font-bold text-white mb-1">{event.title}</h4>
                                    <span className="text-xs text-white/80">{event.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ─── CTA ─────────────────────────────────────── */}
                <section className="bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-800 p-10 lg:p-16 text-center">
                    <span className="material-icons text-5xl text-primary mb-4">emoji_events</span>
                    <h2 className="font-display text-3xl lg:text-5xl font-bold uppercase tracking-tight mb-4 text-text-light dark:text-text-dark">Be Part of RWIBA 2026</h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed">
                        Nominate an outstanding woman leader, entrepreneur, or organization — or cast your vote for the nominees who inspire you most.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <button
                            onClick={() => navigate('NOMINATION')}
                            className="bg-primary text-white px-10 py-4 text-sm font-bold uppercase tracking-widest hover:bg-opacity-90 transition-opacity"
                        >
                            Submit a Nomination
                        </button>
                        <button
                            onClick={() => navigate('VOTING')}
                            className="border border-black dark:border-white text-text-light dark:text-text-dark px-10 py-4 text-sm font-bold uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all"
                        >
                            Vote Now
                        </button>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Events;
