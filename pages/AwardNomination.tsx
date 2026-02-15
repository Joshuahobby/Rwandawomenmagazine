import React, { useState, useEffect } from 'react';
import { PageView } from '../types';

interface AwardNominationProps {
    navigate: (page: PageView) => void;
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

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
        achievements: '',
        measurableResults: '',
        nominatorName: '',
        nominatorEmail: '',
        nominatorPhone: '',
    });
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
        } catch (err: any) {
            setError(err.message || 'Failed to submit. Please try again.');
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
                                setFormData({ nomineeName: '', nomineeTitle: '', nomineeOrganization: '', sector: '', achievements: '', measurableResults: '', nominatorName: '', nominatorEmail: '', nominatorPhone: '' });
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
        <div className="animate-fade-in font-sans">

            {/* Hero */}
            <section className="relative bg-surface-dark dark:bg-black text-white py-20 lg:py-28 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-primary text-white px-3 py-1">Nominations Open</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 text-white/90 px-3 py-1">RWIBA 2026 — 5th Anniversary</span>
                    </div>
                    <h1 className="font-display text-5xl lg:text-7xl font-black uppercase leading-[0.85] tracking-tighter mb-6">
                        Nominate a<br /><span className="text-primary">Leader</span>
                    </h1>
                    <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
                        Recognize an outstanding Rwandan woman, male champion, or organization making a difference. Choose from 27 award categories across Individual, Corporate, and SME sectors.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 py-16 lg:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Category Selection */}
                        <h2 className="font-display text-3xl font-bold uppercase tracking-tight mb-6 text-text-light dark:text-text-dark">
                            1. Select Award Category
                        </h2>

                        {/* Tab Switcher */}
                        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 mb-6">
                            {([['INDIVIDUAL', 'Individual (18)'], ['CORPORATE', 'Corporate (5)'], ['SME', 'SME (5)']] as const).map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => { setActiveTab(key); setSelectedCategory(null); }}
                                    className={`flex-1 px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === key
                                        ? 'bg-primary text-white'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-text-light dark:hover:text-text-dark'
                                        }`}
                                >{label}</button>
                            ))}
                        </div>

                        {/* Category Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-16">
                            {activeCats.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`text-left p-4 border transition-all duration-200 group ${selectedCategory?.id === cat.id
                                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className={`material-icons text-xl flex-shrink-0 transition-colors ${selectedCategory?.id === cat.id ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`}>{cat.icon}</span>
                                        <div>
                                            <h4 className="font-display text-xs font-bold uppercase tracking-wider mb-1 text-text-light dark:text-text-dark leading-snug">{cat.name}</h4>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{cat.description}</p>
                                        </div>
                                    </div>
                                    {selectedCategory?.id === cat.id && (
                                        <span className="material-icons text-primary text-sm mt-2 block">check_circle</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Nomination Form */}
                        <h2 className="font-display text-3xl font-bold uppercase tracking-tight mb-8 text-text-light dark:text-text-dark">
                            2. Nomination Details
                        </h2>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 mb-6 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Nominee */}
                            <div className="border-l-2 border-primary pl-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Nominee Information</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Full Name *</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.nomineeName}
                                            onChange={(e) => handleChange('nomineeName', e.target.value)}
                                            className="w-full bg-transparent border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-primary text-text-light dark:text-text-dark placeholder-gray-400"
                                            placeholder="e.g. Marie Uwimana"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Title / Position</label>
                                        <input
                                            type="text"
                                            value={formData.nomineeTitle}
                                            onChange={(e) => handleChange('nomineeTitle', e.target.value)}
                                            className="w-full bg-transparent border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-primary text-text-light dark:text-text-dark placeholder-gray-400"
                                            placeholder="e.g. CEO, Founder"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Organization</label>
                                        <input
                                            type="text"
                                            value={formData.nomineeOrganization}
                                            onChange={(e) => handleChange('nomineeOrganization', e.target.value)}
                                            className="w-full bg-transparent border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-primary text-text-light dark:text-text-dark placeholder-gray-400"
                                            placeholder="e.g. Tech Innovations Rwanda"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Sector / Industry *</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.sector}
                                            onChange={(e) => handleChange('sector', e.target.value)}
                                            className="w-full bg-transparent border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-primary text-text-light dark:text-text-dark placeholder-gray-400"
                                            placeholder="e.g. Technology, Agriculture, Finance"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Achievements */}
                            <div className="border-l-2 border-primary pl-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Achievements & Impact</h3>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Description of Achievements *</label>
                                    <textarea
                                        required
                                        rows={5}
                                        value={formData.achievements}
                                        onChange={(e) => handleChange('achievements', e.target.value)}
                                        className="w-full bg-transparent border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-primary text-text-light dark:text-text-dark placeholder-gray-400 resize-none"
                                        placeholder="Describe the nominee's key achievements, leadership, and contributions..."
                                    />
                                </div>
                                <div className="mt-4">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Measurable Results / Impact</label>
                                    <textarea
                                        rows={3}
                                        value={formData.measurableResults}
                                        onChange={(e) => handleChange('measurableResults', e.target.value)}
                                        className="w-full bg-transparent border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-primary text-text-light dark:text-text-dark placeholder-gray-400 resize-none"
                                        placeholder="e.g. Created 200 jobs, increased revenue by 150%, impacted 5,000 women..."
                                    />
                                </div>
                            </div>

                            {/* Nominator Info */}
                            <div className="border-l-2 border-gray-300 dark:border-gray-600 pl-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">Your Information (Nominator)</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Your Name *</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.nominatorName}
                                            onChange={(e) => handleChange('nominatorName', e.target.value)}
                                            className="w-full bg-transparent border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-primary text-text-light dark:text-text-dark placeholder-gray-400"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Email *</label>
                                        <input
                                            required
                                            type="email"
                                            value={formData.nominatorEmail}
                                            onChange={(e) => handleChange('nominatorEmail', e.target.value)}
                                            className="w-full bg-transparent border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-primary text-text-light dark:text-text-dark placeholder-gray-400"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Phone</label>
                                        <input
                                            type="tel"
                                            value={formData.nominatorPhone}
                                            onChange={(e) => handleChange('nominatorPhone', e.target.value)}
                                            className="w-full bg-transparent border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-primary text-text-light dark:text-text-dark placeholder-gray-400"
                                            placeholder="+250 7XX XXX XXX"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !selectedCategory}
                                className="bg-primary text-white px-10 py-4 text-sm font-bold uppercase tracking-widest hover:bg-opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-icons text-sm">send</span>
                                        Submit Nomination
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        {/* Selected Category Detail */}
                        {selectedCategory && (
                            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 p-6 mb-8 animate-fade-in">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="material-icons text-primary text-xl">{selectedCategory.icon}</span>
                                    <h3 className="font-display text-sm font-bold uppercase tracking-wider text-text-light dark:text-text-dark">{selectedCategory.name}</h3>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{selectedCategory.description}</p>
                                {selectedCategory.criteria && (
                                    <div>
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Evaluation Criteria</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{selectedCategory.criteria}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Judging Criteria */}
                        <div className="bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-800 p-6 mb-8">
                            <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-6 text-text-light dark:text-text-dark">
                                <span className="material-icons text-primary mr-2 align-middle text-base">score</span>
                                Judging Weights
                            </h3>
                            <div className="space-y-4">
                                {JUDGING_CRITERIA.map((j) => (
                                    <div key={j.label}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">{j.label}</span>
                                            <span className="font-bold text-primary">{j.pct}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5">
                                            <div
                                                className="bg-primary h-full transition-all duration-700"
                                                ref={(el) => { if (el) el.style.width = `${j.pct}%`; }}
                                            ></div>
                                        </div>


                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Key Dates */}
                        <div className="bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-800 p-6 mb-8">
                            <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-6 text-text-light dark:text-text-dark">
                                <span className="material-icons text-primary mr-2 align-middle text-base">timeline</span>
                                Key Dates
                            </h3>
                            <div className="space-y-5">
                                {[
                                    { date: 'Feb 15, 2026', label: 'Nominations Open' },
                                    { date: 'Mar 10, 2026', label: 'Nominations Close' },
                                    { date: 'Mar 15, 2026', label: 'Public Voting Opens' },
                                    { date: 'Mar 24, 2026', label: 'Voting Closes' },
                                    { date: 'Mar 27, 2026', label: 'Awards Ceremony' },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="flex-shrink-0 w-7 h-7 bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">{i + 1}</div>
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-primary">{item.date}</div>
                                            <div className="text-sm text-text-light dark:text-text-dark">{item.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Guidelines */}
                        <div className="bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-800 p-6 mb-8">
                            <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-4 text-text-light dark:text-text-dark">
                                <span className="material-icons text-primary mr-2 align-middle text-base">info</span>
                                Nomination Guidelines
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    'Nominee name and organization required',
                                    'Specify sector / industry',
                                    'Describe achievements and measurable impact',
                                    'Supporting documents encouraged',
                                    'Self-nominations accepted',
                                    'Nominations close March 10, 2026',
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                                        <span className="material-icons text-primary text-xs mt-0.5">check</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Need Help */}
                        <div className="bg-primary text-white p-6">
                            <h3 className="font-display text-lg font-bold uppercase mb-3">Need Help?</h3>
                            <p className="text-sm text-white/80 mb-4">Questions about the nomination process or award categories?</p>
                            <button
                                onClick={() => navigate('CONTACT')}
                                className="border border-white text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-primary transition-all w-full"
                            >
                                Contact Us
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AwardNomination;
