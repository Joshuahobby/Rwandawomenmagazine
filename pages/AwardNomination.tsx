/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { PageView } from '../types';

interface AwardNominationProps {
    /* eslint-disable */
    navigate: (view: PageView) => void;
}

interface CategoryOption {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    criteria: string | null;
    icon: string;
    group: string;
}

const API = '';

// Fallback static categories for when API isn't available yet
const STATIC_CATEGORIES: { INDIVIDUAL: CategoryOption[]; CORPORATE: CategoryOption[]; SME: CategoryOption[] } = {
    INDIVIDUAL: [
        { id: 1, name: 'Women Breaking Barriers in Male Dominated Sectors', slug: 'women-breaking-barriers', description: 'Women excelling in construction, manufacturing, transport, logistics, ICT hardware, or agri-mechanization.', criteria: 'Leadership, innovation, measurable impact, sector disruption, inspiring others, overcoming barriers.', icon: 'construction', group: 'INDIVIDUAL' },
        { id: 2, name: 'Gender Transformative Enterprise Award', slug: 'gender-transformative', description: 'Women-led businesses engaging men to promote equality and transform workplace culture.', criteria: 'Policies promoting equality, male allyship initiatives, staff inclusivity, measurable gender outcomes.', icon: 'diversity_3', group: 'INDIVIDUAL' },
        { id: 3, name: 'Inclusive Innovation for Community Transformation', slug: 'inclusive-innovation', description: 'Women-led businesses developing innovative solutions with social impact in underserved communities.', criteria: 'Innovation, scalability, social impact, sustainability, community engagement.', icon: 'lightbulb', group: 'INDIVIDUAL' },
        { id: 4, name: 'Sustainability Trailblazer Award', slug: 'sustainability-trailblazer', description: 'Women advancing environmental sustainability, green business, or circular economy.', criteria: 'Environmental impact, innovation, business growth, sustainability integration.', icon: 'eco', group: 'INDIVIDUAL' },
        { id: 5, name: 'Emerging Woman Founder Under 30 (Future Shaper)', slug: 'emerging-founder', description: 'Young women entrepreneurs demonstrating leadership, innovation, and growth potential.', criteria: 'Creativity, scalability, resilience, leadership, measurable progress.', icon: 'trending_up', group: 'INDIVIDUAL' },
        { id: 6, name: 'Transformational Agripreneur of the Year', slug: 'transformational-agripreneur', description: 'Women transforming agriculture value chains through technology and innovation.', criteria: 'Market impact, adoption of modern practices, economic empowerment of women, sustainability.', icon: 'agriculture', group: 'INDIVIDUAL' },
        { id: 7, name: 'Digital Acceleration & Tech Inclusion Award', slug: 'digital-acceleration', description: 'Women leveraging technology to scale businesses and promote digital inclusion.', criteria: 'Tech adoption, business transformation, innovation, measurable digital impact.', icon: 'devices', group: 'INDIVIDUAL' },
        { id: 8, name: 'Export Readiness & Market Linkage Champion', slug: 'export-readiness', description: 'Women achieving cross-border trade, regional exports, or strong market linkages.', criteria: 'Market expansion, quality standards, export growth, economic contribution.', icon: 'public', group: 'INDIVIDUAL' },
        { id: 9, name: 'Resilience & Business Continuity Leadership Award', slug: 'resilience-leadership', description: 'Women who navigated crises, adapted operations, or diversified to survive shocks.', criteria: 'Resilience, adaptability, business continuity plans, innovation under pressure.', icon: 'shield', group: 'INDIVIDUAL' },
        { id: 10, name: 'Women Led Impact Enterprise (High Social ROI)', slug: 'women-led-impact', description: 'Enterprises prioritizing social impact alongside profitability.', criteria: 'Social ROI, measurable outcomes, sustainability, replicability.', icon: 'volunteer_activism', group: 'INDIVIDUAL' },
        { id: 11, name: 'Creative Economy Powerhouse Award', slug: 'creative-economy', description: 'Women excelling in fashion, arts, design, media, and entertainment.', criteria: 'Creativity, innovation, brand impact, business growth, sector leadership.', icon: 'palette', group: 'INDIVIDUAL' },
        { id: 12, name: 'Health & Wellness Industry Leadership Award', slug: 'health-wellness', description: 'Women transforming health, wellness, or lifestyle sectors.', criteria: 'Service quality, innovation, community impact, scalability.', icon: 'health_and_safety', group: 'INDIVIDUAL' },
        { id: 13, name: 'Manufacturing & Production Excellence Award', slug: 'manufacturing-excellence', description: 'Women achieving excellence in production efficiency, quality, and innovation.', criteria: 'Production standards, innovation, business growth, sector leadership.', icon: 'precision_manufacturing', group: 'INDIVIDUAL' },
        { id: 14, name: 'Women in Green & Climate Smart Business Award', slug: 'green-climate', description: 'Women contributing to climate resilience through green solutions.', criteria: 'Environmental impact, innovation, scalability, community or sector influence.', icon: 'forest', group: 'INDIVIDUAL' },
        { id: 15, name: 'Niche Tourism & Experience Curator', slug: 'niche-tourism', description: 'Women creating unique tourism or hospitality experiences showcasing Rwandan heritage.', criteria: 'Creativity, uniqueness, cultural impact, business sustainability.', icon: 'tour', group: 'INDIVIDUAL' },
        { id: 16, name: 'Employee Wellbeing & Human Capital Advocate', slug: 'employee-wellbeing', description: 'Women leaders with exceptional employee mental health and development policies.', criteria: 'Employee policies, wellbeing outcomes, staff development, measurable impact.', icon: 'favorite', group: 'INDIVIDUAL' },
        { id: 17, name: 'Most Gender-Intentionally Designed Product/Service', slug: 'gender-intentional', description: 'Products or services explicitly designed to address gender-specific needs.', criteria: 'Intentional design, gender impact, innovation, scalability.', icon: 'design_services', group: 'INDIVIDUAL' },
        { id: 18, name: 'Male Champion for Gender Equity', slug: 'male-champion', description: 'Male leaders who have actively championed gender equality and women\'s advancement.', criteria: 'Active advocacy, mentorship, measurable impact, public commitment.', icon: 'handshake', group: 'INDIVIDUAL' },
    ],
    CORPORATE: [
        { id: 19, name: 'Corporate Allyship & Inclusive Leadership Champion', slug: 'corporate-allyship', description: 'Measurable commitment to gender-inclusive leadership and institutional accountability.', criteria: 'Leadership diversity, accountability structures, measurable outcomes.', icon: 'corporate_fare', group: 'CORPORATE' },
        { id: 20, name: 'Corporate Excellence in Workplace Culture', slug: 'corporate-workplace', description: 'Leadership in building a safe, inclusive, and high-performing workplace.', criteria: 'Workplace policies, inclusivity, employee satisfaction, safety.', icon: 'apartment', group: 'CORPORATE' },
        { id: 21, name: 'Corporate Champion for Women in Leadership', slug: 'corporate-women-leadership', description: 'Advancing women into senior leadership through structured talent pipelines.', criteria: 'Women in leadership %, talent pipeline structures, measurable progress.', icon: 'supervisor_account', group: 'CORPORATE' },
        { id: 22, name: 'Corporate Leader in Gender-Intentional Governance', slug: 'corporate-governance', description: 'Embedding inclusive principles within corporate governance frameworks.', criteria: 'Governance frameworks, HR policies, remuneration equity, compliance.', icon: 'gavel', group: 'CORPORATE' },
        { id: 23, name: 'Corporate Inclusive Value Chain Innovator', slug: 'corporate-value-chain', description: 'Expanding economic participation for women within supply chains and procurement.', criteria: 'Supply chain inclusivity, procurement practices, women\'s participation.', icon: 'hub', group: 'CORPORATE' },
    ],
    SME: [
        { id: 24, name: 'SME Inclusive Business Leader', slug: 'sme-inclusive', description: 'Outstanding SME demonstrating inclusive leadership and equitable workplace structures.', criteria: 'Inclusive practices, equitable structures, leadership quality.', icon: 'storefront', group: 'SME' },
        { id: 25, name: 'SME Excellence in Workplace Culture', slug: 'sme-workplace', description: 'Commitment to fairness, dignity, and supportive workplace systems.', criteria: 'Workplace fairness, dignity, support systems, employee outcomes.', icon: 'groups', group: 'SME' },
        { id: 26, name: 'SME Champion for Women\'s Enterprise Growth', slug: 'sme-women-growth', description: 'Active investment in mentorship and leadership opportunities for women.', criteria: 'Mentorship programs, growth opportunities, measurable development.', icon: 'trending_up', group: 'SME' },
        { id: 27, name: 'SME Leader in Fair & Equitable Business Practice', slug: 'sme-fair-practice', description: 'Transparent recruitment, equal opportunity, and fair evaluation practices.', criteria: 'Recruitment fairness, equal opportunity, evaluation transparency.', icon: 'balance', group: 'SME' },
        { id: 28, name: 'SME Community Impact & Inclusion Champion', slug: 'sme-community', description: 'Strategic engagement strengthening inclusive economic participation.', criteria: 'Community engagement, inclusive participation, strategic impact.', icon: 'diversity_1', group: 'SME' },
    ],
};

const JUDGING_CRITERIA = [
    { label: 'Impact & Results', pct: 30 },
    { label: 'Innovation', pct: 20 },
    { label: 'Leadership & Vision', pct: 20 },
    { label: 'Sustainability', pct: 15 },
    { label: 'Inclusion & Allyship', pct: 15 },
];

const AwardNomination: React.FC<AwardNominationProps> = ({ navigate }) => {
    const [categories, setCategories] = useState(STATIC_CATEGORIES);
    const [activeTab, setActiveTab] = useState<'INDIVIDUAL' | 'CORPORATE' | 'SME'>('INDIVIDUAL');
    const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);
    const [formData, setFormData] = useState({
        nomineeName: '',
        nomineeTitle: '',
        nomineeOrganization: '',
        sector: '',
        nominatorName: '',
        nominatorEmail: '',
        nominatorPhone: '',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Try to load categories from API
    useEffect(() => {
        fetch(`${API}/api/nominations/categories`)
            .then((r) => r.json())
            .then((data) => {
                if (data.INDIVIDUAL) setCategories(data);
            })
            .catch(() => { /* Fall back to static */ });
    }, []);

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory) return;
        setIsSubmitting(true);
        setError('');

        try {
            // 1. Get a short-lived security ticket
            const ticketRes = await fetch(`${API}/api/nominations/ticket`);
            if (!ticketRes.ok) {
                setError('Failed to initialize secure session. Please refresh.');
                setIsSubmitting(false);
                return;
            }
            const { ticket } = await ticketRes.json();

            if (!ticket) {
                setError('Security ticket missing. Please refresh.');
                setIsSubmitting(false);
                return;
            }

            // 2. Submit with ticket and security signals
            const res = await fetch(`${API}/api/nominations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    categoryId: selectedCategory.id,
                    ticket,
                    hp_field: '' // Honey-pot
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Submission failed');
            }

            setIsSubmitted(true);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to submit. Please try again.';
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Success state
    if (isSubmitted) {
        return (
            <div className="animate-fade-in font-sans min-h-[70vh] flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="text-center max-w-lg mx-auto px-4">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-icons text-5xl text-primary">check_circle</span>
                    </div>
                    <h2 className="font-display text-4xl font-bold uppercase mb-4 text-text-light dark:text-text-dark">Nomination Submitted!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
                        Your nomination for <strong className="text-text-light dark:text-text-dark">{formData.nomineeName}</strong> in the category
                    </p>
                    <p className="text-primary font-bold text-sm uppercase tracking-widest mb-6">{selectedCategory?.name}</p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm mb-8">
                        Our team will review the nomination. You&apos;ll receive updates at <strong>{formData.nominatorEmail}</strong>.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <button
                            onClick={() => {
                                setIsSubmitted(false);
                                setSelectedCategory(null);
                                setFormData({ nomineeName: '', nomineeTitle: '', nomineeOrganization: '', sector: '', nominatorName: '', nominatorEmail: '', nominatorPhone: '' });
                            }}
                            className="border border-black dark:border-white text-text-light dark:text-text-dark px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all"
                        >
                            Submit Another
                        </button>
                        <button
                            onClick={() => navigate('EVENTS')}
                            className="bg-primary text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-opacity-90 transition-opacity"
                        >
                            View Event Details
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const activeCats = categories[activeTab] || [];

    return (
        <>
            <div className="animate-fade-in font-sans">

                {/* Hero */}
                <section className="relative bg-black text-white py-24 lg:py-32 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-black/50 to-black"></div>
                    <div className="absolute inset-0 opacity-20 noise-pattern"></div>
                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <div className="inline-flex items-center gap-3 mb-6 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">Nominations Open until March 10</span>
                        </div>
                        <h1 className="font-display text-5xl lg:text-7xl font-black uppercase leading-none tracking-tighter mb-6">
                            Nominate a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-pink-400">Leader</span>
                        </h1>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            Recognize an outstanding Rwandan woman, male champion, or organization making a difference. Choose from <span className="text-white font-bold">28 award categories</span> across Individual, Corporate, and SME sectors.
                        </p>
                    </div>
                </section >

                <div className="container mx-auto px-4 py-16 lg:py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* Left Sidebar - Context & Info */}
                        <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">

                            {/* Selected Category Info (Sticky) */}
                            <div className="lg:sticky lg:top-8 space-y-8">

                                {/* Intro/Welcome (if no category selected) */}
                                {!selectedCategory && (
                                    <div className="bg-surface-light dark:bg-zinc-900/50 border border-gray-200 dark:border-white/10 p-8 rounded-2xl">
                                        <h3 className="font-display text-xl font-bold uppercase mb-4 text-primary">How to Nominate</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                            Select a category from the right to view details and submit your nomination. You can nominate multiple candidates across different categories.
                                        </p>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">1</span>
                                                <span>Choose a Category</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">2</span>
                                                <span>Fill Nominee Details</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">3</span>
                                                <span>Submit Nomination</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Selected Category Details */}
                                {selectedCategory && (
                                    <div className="bg-primary text-white p-8 rounded-2xl animate-fade-in shadow-xl shadow-primary/20">
                                        <div className="flex items-center gap-3 mb-6">
                                            <span className="material-icons text-3xl bg-white/20 p-2 rounded-lg">{selectedCategory.icon}</span>
                                            <h3 className="font-display text-lg font-bold uppercase leading-tight">{selectedCategory.name}</h3>
                                        </div>
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-2">Description</h4>
                                                <p className="text-sm leading-relaxed opacity-90">{selectedCategory.description}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-2">Criteria</h4>
                                                <p className="text-sm leading-relaxed opacity-90">{selectedCategory.criteria}</p>
                                            </div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="w-full bg-white text-primary py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <span className="material-icons text-sm">edit</span>
                                                Nominate Now
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Judging Weights */}
                                <div className="bg-surface-light dark:bg-zinc-900/50 border border-gray-200 dark:border-white/10 p-8 rounded-2xl">
                                    <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-6 text-text-light dark:text-text-dark flex items-center gap-2">
                                        <span className="material-icons text-primary text-lg">scale</span>
                                        Judging Criteria
                                    </h3>
                                    <div className="space-y-5">
                                        {JUDGING_CRITERIA.map((j) => (
                                            <div key={j.label}>
                                                <div className="flex justify-between text-xs mb-2">
                                                    <span className="font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">{j.label}</span>
                                                    <span className="font-bold text-primary">{j.pct}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-primary h-full rounded-full transition-all duration-1000 ease-out progress-bar-fill"
                                                        /* eslint-disable-next-line react/forbid-component-props, react/forbid-dom-props */
                                                        style={{ '--progress-width': `${j.pct}%` } as React.CSSProperties}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Key Dates */}
                                <div className="bg-surface-light dark:bg-zinc-900/50 border border-gray-200 dark:border-white/10 p-8 rounded-2xl">
                                    <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-6 text-text-light dark:text-text-dark flex items-center gap-2">
                                        <span className="material-icons text-primary text-lg">event</span>
                                        Timeline
                                    </h3>
                                    <div className="space-y-6">
                                        {[
                                            { date: 'Feb 15, 2026', label: 'Nominations Open', active: true },
                                            { date: 'Mar 10, 2026', label: 'Nominations Close' },
                                            { date: 'Mar 15, 2026', label: 'Public Voting Opens' },
                                            { date: 'Mar 27, 2026', label: 'Awards Ceremony' },
                                        ].map((item, i) => (
                                            <div key={i} className={`flex gap-4 relative ${item.active ? 'opacity-100' : 'opacity-60'}`}>
                                                {i !== 3 && <div className="absolute left-[11px] top-7 bottom-[-24px] w-px bg-gray-200 dark:bg-white/10"></div>}
                                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${item.active ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-500'}`}>
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${item.active ? 'text-primary' : 'text-gray-500'}`}>{item.date}</div>
                                                    <div className="text-sm font-medium text-text-light dark:text-text-dark">{item.label}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Right Content - Categories */}
                        <div className="lg:col-span-8 order-1 lg:order-2">

                            {/* Section Header */}
                            <div className="mb-10">
                                <h2 className="font-display text-3xl font-bold uppercase tracking-tight mb-4 text-text-light dark:text-text-dark">
                                    Select a Category
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Choose the most appropriate category for your nominee. Click on any card to view details and start the nomination.
                                </p>
                            </div>

                            {/* Tabs */}
                            <div className="flex flex-wrap gap-2 mb-8 bg-gray-100 dark:bg-white/5 p-1.5 rounded-xl inline-flex">
                                {([['INDIVIDUAL', 'Individual'], ['CORPORATE', 'Corporate'], ['SME', 'SME']] as const).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => { setActiveTab(key); setSelectedCategory(null); }}
                                        className={`px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === key
                                            ? 'bg-white dark:bg-primary text-primary dark:text-white shadow-md'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        {label} <span className="opacity-50 ml-1 text-[10px]">({categories[key]?.length || 0})</span>
                                    </button>
                                ))}
                            </div>

                            {/* Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activeCats.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => { setSelectedCategory(cat); setIsModalOpen(true); }}
                                        className={`group relative text-left p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${selectedCategory?.id === cat.id
                                            ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-lg shadow-primary/10'
                                            : 'border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 hover:border-primary/30'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${selectedCategory?.id === cat.id
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 dark:bg-white/5 text-gray-500 group-hover:bg-primary group-hover:text-white'
                                                }`}>
                                                <span className="material-icons text-2xl">{cat.icon}</span>
                                            </div>
                                            {selectedCategory?.id === cat.id && (
                                                <span className="material-icons text-primary animate-scale-in">check_circle</span>
                                            )}
                                        </div>

                                        <h4 className="font-display text-sm font-bold uppercase tracking-wide mb-2 text-text-light dark:text-text-dark group-hover:text-primary transition-colors pr-4">
                                            {cat.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                                            {cat.description}
                                        </p>

                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center text-primary text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span>Nominate in this category</span>
                                            <span className="material-icons text-sm ml-1">arrow_forward</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* Nomination Modal */}
            {
                isModalOpen && selectedCategory && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                        <div
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                            onClick={() => setIsModalOpen(false)}
                        ></div>
                        <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl min-h-[500px] max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative z-10 animate-fade-in-up">

                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-zinc-900/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <span className="material-icons">{selectedCategory.icon}</span>
                                    </div>
                                    <div>
                                        <h2 className="font-display text-lg font-bold uppercase tracking-tight text-text-light dark:text-text-dark">Nominate Candidate</h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{selectedCategory.name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                                >
                                    <span className="material-icons text-sm">close</span>
                                </button>
                            </div>

                            {/* Modal Body (Scrollable) */}
                            <div className="flex-1 overflow-y-auto p-6 sm:p-8">

                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 mb-6 text-sm rounded-lg flex items-center gap-2">
                                        <span className="material-icons text-sm">error</span>
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-8">

                                    {/* Section 1: Nominee Details */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-2">1. Nominee Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Full Name *</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.nomineeName}
                                                    onChange={(e) => handleChange('nomineeName', e.target.value)}
                                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                    placeholder="Enter full name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Current Title/Position</label>
                                                <input
                                                    type="text"
                                                    value={formData.nomineeTitle}
                                                    onChange={(e) => handleChange('nomineeTitle', e.target.value)}
                                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                    placeholder="e.g. CEO, Director"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Organization</label>
                                                <input
                                                    type="text"
                                                    value={formData.nomineeOrganization}
                                                    onChange={(e) => handleChange('nomineeOrganization', e.target.value)}
                                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                    placeholder="Organization Name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Sector / Industry *</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.sector}
                                                    onChange={(e) => handleChange('sector', e.target.value)}
                                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                    placeholder="e.g. Technology, Finance"
                                                />
                                            </div>
                                        </div>
                                    </div>



                                    {/* Section 3: Nominator Info */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-2">2. Your Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Your Name *</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.nominatorName}
                                                    onChange={(e) => handleChange('nominatorName', e.target.value)}
                                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                    placeholder="Full Name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Email Address *</label>
                                                <input
                                                    required
                                                    type="email"
                                                    value={formData.nominatorEmail}
                                                    onChange={(e) => handleChange('nominatorEmail', e.target.value)}
                                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                    placeholder="email@example.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    value={formData.nominatorPhone}
                                                    onChange={(e) => handleChange('nominatorPhone', e.target.value)}
                                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                    placeholder="+250..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="bg-primary text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit Nomination'}
                                            {!isSubmitting && <span className="material-icons text-sm">send</span>}
                                        </button>
                                    </div>

                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default AwardNomination;
