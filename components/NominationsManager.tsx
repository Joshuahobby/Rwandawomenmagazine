import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Nomination {
    id: string;
    nomineeName: string;
    nomineeTitle: string;
    nomineeOrganization: string;

    achievements: string | null;
    measurableResults: string | null;
    nominatorName: string;
    nominatorEmail: string;
    nominatorPhone: string | null;
    supportingDocUrl: string | null;
    status: string;
    createdAt: string;
    category: {
        name: string;
        group: string;
    };
    _count: {
        votes: number;
    };
}

interface CategoryOption {
    id: number;
    name: string;
    group?: string;
}

interface NomineeResult {
    nominationId: string;
    nomineeName: string;
    votes: number;
}

interface CategoryResult {
    categoryId: number;
    categoryName: string;
    group: string;
    nominees: NomineeResult[];
}

const NominationsManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'LIST' | 'ANALYTICS' | 'SETTINGS'>('LIST');
    const [nominations, setNominations] = useState<Nomination[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [selectedNomination, setSelectedNomination] = useState<Nomination | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Analytics state
    const [analyticsData, setAnalyticsData] = useState<CategoryResult[]>([]);
    const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

    // Settings state
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [isSettingsUpdating, setIsSettingsUpdating] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [nomRes, catRes] = await Promise.all([
                api.get(`/nominations?status=${statusFilter}&categoryId=${categoryFilter}`),
                api.get('/nominations/categories')
            ]);
            setNominations(nomRes.data.nominations || []);

            const cats = [
                ...(catRes.data.INDIVIDUAL || []),
                ...(catRes.data.CORPORATE || []),
                ...(catRes.data.SME || [])
            ];
            setCategories(cats);
        } catch (err) {
            console.error('Failed to fetch nominations:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        setIsAnalyticsLoading(true);
        try {
            const res = await api.get('/votes/results');
            setAnalyticsData(res.data || []);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
        } finally {
            setIsAnalyticsLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            setSettings(res.data || {});
        } catch (err) {
            console.error('Failed to fetch settings:', err);
        }
    };

    const handleUpdateSetting = async (key: string, value: string) => {
        setIsSettingsUpdating(true);
        try {
            await api.patch('/settings', { key, value });
            setSettings(prev => ({ ...prev, [key]: value }));
        } catch (err) {
            console.error('Failed to update setting:', err);
            alert('Failed to update setting.');
        } finally {
            setIsSettingsUpdating(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/nominations/${id}/status`, { status: newStatus });
            setNominations(nominations.map(n => n.id === id ? { ...n, status: newStatus } : n));
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Failed to update status.');
        }
    };

    useEffect(() => {
        if (activeTab === 'LIST') fetchData();
        if (activeTab === 'ANALYTICS') fetchAnalytics();
        if (activeTab === 'SETTINGS') fetchSettings();
    }, [statusFilter, categoryFilter, activeTab]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case 'shortlisted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'finalist': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    return (
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden animate-fade-in mb-8">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-icons text-primary">emoji_events</span>
                            RWIBA 2026 Admin Panel
                        </h2>
                        <p className="text-sm text-gray-500">Manage competition phases and track voting results</p>
                    </div>

                    <div className="flex bg-gray-100 dark:bg-black/20 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('LIST')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'LIST' ? 'bg-white dark:bg-white/10 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Nominations
                        </button>
                        <button
                            onClick={() => setActiveTab('ANALYTICS')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'ANALYTICS' ? 'bg-white dark:bg-white/10 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Live Results
                        </button>
                        <button
                            onClick={() => setActiveTab('SETTINGS')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'SETTINGS' ? 'bg-white dark:bg-white/10 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Phase Control
                        </button>
                    </div>
                </div>

                {activeTab === 'LIST' && (
                    <div className="flex flex-wrap gap-4 animate-fade-in">
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5">
                            <span className="material-icons text-gray-400 text-sm">filter_list</span>
                            <select
                                aria-label="Filter by status"
                                className="bg-transparent text-sm focus:outline-none text-gray-700 dark:text-gray-300"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="finalist">Finalist</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5">
                            <span className="material-icons text-gray-400 text-sm">category</span>
                            <select
                                aria-label="Filter by category"
                                className="bg-transparent text-sm focus:outline-none text-gray-700 dark:text-gray-300"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <button onClick={fetchData} className="ml-auto p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                            <span className="material-icons text-sm">refresh</span>
                        </button>
                    </div>
                )}

                {activeTab === 'ANALYTICS' && (
                    <div className="flex justify-between items-center animate-fade-in">
                        <p className="text-sm font-medium text-gray-500">Live voting tallies across all categories</p>
                        <button onClick={fetchAnalytics} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                            <span className="material-icons text-sm">refresh</span>
                        </button>
                    </div>
                )}
            </div>

            {activeTab === 'LIST' && (
                <div className="overflow-x-auto animate-fade-in">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-black/10 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 dark:border-gray-800">
                                <th className="px-6 py-4">Nominee</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Votes</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    </td>
                                </tr>
                            ) : nominations.length > 0 ? (
                                nominations.map((nom) => (
                                    <tr key={nom.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{nom.nomineeName}</div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-tight line-clamp-1">{nom.nomineeTitle} • {nom.nomineeOrganization}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{nom.category.name}</div>
                                            <div className="text-[9px] uppercase font-black text-primary/60 tracking-widest">{nom.category.group}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusColor(nom.status)}`}>
                                                {nom.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-icons text-[14px] text-primary">how_to_vote</span>
                                                <span className="text-sm font-black text-gray-900 dark:text-white">{nom._count.votes}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => { setSelectedNomination(nom); setIsModalOpen(true); }}
                                                    className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center"
                                                    title="View Details"
                                                >
                                                    <span className="material-icons text-sm">visibility</span>
                                                </button>
                                                <select
                                                    aria-label="Change nomination status"
                                                    className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-tight focus:outline-none focus:border-primary text-gray-600 dark:text-gray-400"
                                                    value={nom.status}
                                                    onChange={(e) => handleUpdateStatus(nom.id, e.target.value)}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="approved">Approved</option>
                                                    <option value="shortlisted">Shortlisted</option>
                                                    <option value="finalist">Finalist</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-500 italic text-sm">
                                        No nominations found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'ANALYTICS' && (
                <div className="p-6 space-y-8 animate-fade-in max-h-[600px] overflow-y-auto">
                    {isAnalyticsLoading ? (
                        <div className="py-20 text-center"><div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                    ) : analyticsData.length > 0 ? (
                        analyticsData.map((category) => {
                            const totalVotes = category.nominees.reduce((sum, n) => sum + n.votes, 0);
                            return (
                                <div key={category.categoryId} className="bg-gray-50 dark:bg-black/10 rounded-xl p-5 border border-gray-100 dark:border-white/5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{category.group}</span>
                                            <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{category.categoryName}</h3>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-black text-primary">{totalVotes}</div>
                                            <div className="text-[9px] uppercase font-bold text-gray-400">Total Votes</div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {category.nominees.length > 0 ? (
                                            category.nominees
                                                .sort((a, b) => b.votes - a.votes)
                                                .map((nominee) => {
                                                    const pct = totalVotes > 0 ? Math.round((nominee.votes / totalVotes) * 100) : 0;
                                                    return (
                                                        <div key={nominee.nominationId}>
                                                            <div className="flex justify-between text-[11px] mb-1.5">
                                                                <span className="font-bold text-gray-700 dark:text-gray-300">{nominee.nomineeName}</span>
                                                                <span className="font-black text-gray-900 dark:text-white">{nominee.votes} ({pct}%)</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                                                                <div
                                                                    className="bg-primary h-full rounded-full transition-all duration-1000 dynamic-progress"
                                                                    ref={(el) => { if (el) el.style.setProperty('width', `${pct}%`); }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">No approved nominees currently.</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-20 text-center text-gray-500">No results available yet.</div>
                    )}
                </div>
            )}

            {activeTab === 'SETTINGS' && (
                <div className="p-8 animate-fade-in max-w-4xl">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">Competition Phase Control</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-50 dark:bg-black/10 p-6 rounded-2xl border border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                    <span className="material-icons">assignment</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">Nomination Phase</h4>
                                    <p className="text-xs text-gray-500">Control if users can submit new nominees</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleUpdateSetting('NOMINATION_STATUS', 'open')}
                                    disabled={isSettingsUpdating}
                                    className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${settings.NOMINATION_STATUS === 'open' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-gray-200 dark:bg-white/5 text-gray-500 hover:bg-gray-300'}`}
                                >
                                    {settings.NOMINATION_STATUS === 'open' && <span className="material-icons text-[10px] mr-1">check_circle</span>}
                                    Open
                                </button>
                                <button
                                    onClick={() => handleUpdateSetting('NOMINATION_STATUS', 'closed')}
                                    disabled={isSettingsUpdating}
                                    className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${settings.NOMINATION_STATUS === 'closed' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-gray-200 dark:bg-white/5 text-gray-500 hover:bg-gray-300'}`}
                                >
                                    {settings.NOMINATION_STATUS === 'closed' && <span className="material-icons text-[10px] mr-1">block</span>}
                                    Closed
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-black/10 p-6 rounded-2xl border border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                    <span className="material-icons">how_to_vote</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">Voting Phase</h4>
                                    <p className="text-xs text-gray-500">Control if the public can cast votes</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleUpdateSetting('VOTING_STATUS', 'open')}
                                    disabled={isSettingsUpdating}
                                    className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${settings.VOTING_STATUS === 'open' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-gray-200 dark:bg-white/5 text-gray-500 hover:bg-gray-300'}`}
                                >
                                    {settings.VOTING_STATUS === 'open' && <span className="material-icons text-[10px] mr-1">check_circle</span>}
                                    Open
                                </button>
                                <button
                                    onClick={() => handleUpdateSetting('VOTING_STATUS', 'closed')}
                                    disabled={isSettingsUpdating}
                                    className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${settings.VOTING_STATUS === 'closed' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-gray-200 dark:bg-white/5 text-gray-500 hover:bg-gray-300'}`}
                                >
                                    {settings.VOTING_STATUS === 'closed' && <span className="material-icons text-[10px] mr-1">block</span>}
                                    Closed
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {isModalOpen && selectedNomination && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsModalOpen(false)}
                    ></div>
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative z-10 animate-fade-in-up border border-white/5">
                        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-zinc-900/50">
                            <div>
                                <h2 className="font-display text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Nomination Profile</h2>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest text-primary/80 mt-1">{selectedNomination.category.name}</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all text-gray-500"
                            >
                                <span className="material-icons text-lg">close</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-10">
                            {/* Nominee Info */}
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6 border-b border-primary/10 pb-2">Nominee Identity</h3>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">Full Name</label>
                                        <p className="font-bold text-gray-900 dark:text-white text-lg">{selectedNomination.nomineeName}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">Organization</label>
                                        <p className="font-bold text-gray-900 dark:text-white text-lg">{selectedNomination.nomineeOrganization}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">Professional Title</label>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedNomination.nomineeTitle}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Impact Info */}
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6 border-b border-primary/10 pb-2">Evidence of Impact</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-2">Key Achievements</label>
                                        <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/5">
                                            {selectedNomination.achievements || <span className="italic text-gray-500">No achievements recorded in the application.</span>}
                                        </div>
                                    </div>
                                    {selectedNomination.measurableResults && (
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-2">Measurable Results</label>
                                            <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/5">
                                                {selectedNomination.measurableResults}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Nominator Info */}
                            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4 block underline underline-offset-8 decoration-2 decoration-primary/20">Source Nominator</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider block mb-0.5">Contact Name</label>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">{selectedNomination.nominatorName}</p>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider block mb-0.5">Email Address</label>
                                        <p className="font-bold text-primary text-sm underline underline-offset-2">{selectedNomination.nominatorEmail}</p>
                                    </div>
                                    {selectedNomination.nominatorPhone && (
                                        <div>
                                            <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider block mb-0.5">Phone Number</label>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">{selectedNomination.nominatorPhone}</p>
                                        </div>
                                    )}
                                    <div className="col-span-full">
                                        <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider block mb-0.5">Submission Timestamp</label>
                                        <p className="text-xs text-gray-400">{new Date(selectedNomination.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 dark:border-white/10 flex justify-end gap-3 bg-gray-50 dark:bg-zinc-900/50">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-8 py-3 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NominationsManager;
