import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Nomination {
    id: string;
    nomineeName: string;
    nomineeTitle: string;
    nomineeOrganization: string;
    sector?: string;
    achievements: string | null;
    measurableResults: string | null;
    nominatorName: string;
    nominatorEmail: string;
    nominatorPhone: string | null;
    supportingDocUrl: string | null;
    status: string;
    manualVotes?: number;
    createdAt: string;
    category: {
        id?: number;
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
    slug?: string;
    description?: string;
    criteria?: string;
    icon?: string;
    group?: string;
    sortOrder?: number;
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
    const [activeTab, setActiveTab] = useState<'LIST' | 'CATEGORIES' | 'ANALYTICS' | 'SETTINGS' | 'AUDIT'>('LIST');
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

    // Audit Log state
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [isAuditLoading, setIsAuditLoading] = useState(false);

    // Selection state for bulk actions
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Category CRUD state
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryOption | null>(null);
    const [catForm, setCatForm] = useState({ name: '', description: '', criteria: '', icon: 'emoji_events', group: 'INDIVIDUAL', sortOrder: 0 });

    // Nomination CRUD state
    const [isNomModalOpen, setIsNomModalOpen] = useState(false);
    const [editingNomination, setEditingNomination] = useState<Nomination | null>(null);
    const [nomForm, setNomForm] = useState({ categoryId: '', nomineeName: '', nomineeTitle: '', nomineeOrganization: '', sector: '', achievements: '', measurableResults: '', status: 'finalist', manualVotes: 0 });
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'category' | 'nomination'; id: string | number } | null>(null);

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
            setSettings((prev: Record<string, string>) => ({ ...prev, [key]: value }));
        } catch (err) {
            console.error('Failed to update setting:', err);
            alert('Failed to update setting.');
        } finally {
            setIsSettingsUpdating(false);
        }
    };

    const fetchAuditLogs = async () => {
        setIsAuditLoading(true);
        try {
            const res = await api.get('/votes/admin/audit-log');
            setAuditLogs(res.data || []);
        } catch (err) {
            console.error('Failed to fetch audit log:', err);
        } finally {
            setIsAuditLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/nominations/${id}/status`, { status: newStatus });
            setNominations(nominations.map((n: Nomination) => n.id === id ? { ...n, status: newStatus } : n));
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Failed to update status.');
        }
    };

    const handleBulkUpdateStatus = async (newStatus: string) => {
        if (selectedIds.size === 0) return;
        try {
            await api.patch('/nominations/admin/bulk-status', {
                ids: Array.from(selectedIds),
                status: newStatus
            });
            setNominations(nominations.map((n: Nomination) =>
                selectedIds.has(n.id) ? { ...n, status: newStatus } : n
            ));
            setSelectedIds(new Set());
            alert(`Successfully updated ${selectedIds.size} nominations to ${newStatus}.`);
        } catch (err) {
            console.error('Failed to bulk update status:', err);
            alert('Failed to bulk update status.');
        }
    };

    const toggleSelection = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const toggleAllSelection = () => {
        if (selectedIds.size === nominations.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(nominations.map((n: Nomination) => n.id)));
        }
    };

    // --- Category CRUD handlers ---
    const openCatModal = (cat?: CategoryOption) => {
        if (cat) {
            setEditingCategory(cat);
            setCatForm({ name: cat.name, description: cat.description || '', criteria: cat.criteria || '', icon: cat.icon || 'emoji_events', group: cat.group || 'INDIVIDUAL', sortOrder: cat.sortOrder || 0 });
        } else {
            setEditingCategory(null);
            setCatForm({ name: '', description: '', criteria: '', icon: 'emoji_events', group: 'INDIVIDUAL', sortOrder: 0 });
        }
        setIsCatModalOpen(true);
    };

    const handleSaveCategory = async () => {
        try {
            if (editingCategory) {
                await api.patch(`/nominations/categories/${editingCategory.id}`, catForm);
            } else {
                await api.post('/nominations/categories', catForm);
            }
            setIsCatModalOpen(false);
            fetchData();
        } catch (err) {
            console.error('Failed to save category:', err);
            alert('Failed to save category.');
        }
    };

    const handleDeleteCategory = async (id: number) => {
        try {
            await api.delete(`/nominations/categories/${id}`);
            setDeleteConfirm(null);
            fetchData();
        } catch (err) {
            console.error('Failed to delete category:', err);
            alert('Failed to delete category. It may have nominations linked to it.');
        }
    };

    // --- Nomination CRUD handlers ---
    const openNomModal = (nom?: Nomination) => {
        if (nom) {
            setEditingNomination(nom);
            setNomForm({
                categoryId: String(nom.category.id || ''),
                nomineeName: nom.nomineeName,
                nomineeTitle: nom.nomineeTitle || '',
                nomineeOrganization: nom.nomineeOrganization || '',
                sector: nom.sector || '',
                achievements: nom.achievements || '',
                measurableResults: nom.measurableResults || '',
                status: nom.status,
                manualVotes: nom.manualVotes || 0,
            });
        } else {
            setEditingNomination(null);
            setNomForm({ categoryId: '', nomineeName: '', nomineeTitle: '', nomineeOrganization: '', sector: '', achievements: '', measurableResults: '', status: 'finalist', manualVotes: 0 });
        }
        setIsNomModalOpen(true);
    };

    const handleSaveNomination = async () => {
        try {
            if (editingNomination) {
                await api.patch(`/nominations/${editingNomination.id}`, nomForm);
            } else {
                await api.post('/nominations/admin', nomForm);
            }
            setIsNomModalOpen(false);
            fetchData();
        } catch (err) {
            console.error('Failed to save nomination:', err);
            alert('Failed to save nomination.');
        }
    };

    const handleDeleteNomination = async (id: string) => {
        try {
            await api.delete(`/nominations/${id}`);
            setDeleteConfirm(null);
            fetchData();
        } catch (err) {
            console.error('Failed to delete nomination:', err);
            alert('Failed to delete nomination.');
        }
    };

    // Export Nominations
    const exportNominationsToCSV = () => {
        if (!nominations.length) return alert('No data to export');
        const headers = ['Nominee', 'Title', 'Organization', 'Category', 'Group', 'Status', 'Votes', 'Nominator', 'Nominator Email', 'Date'];
        const csvRows = [headers.join(',')];

        nominations.forEach((n: Nomination) => {
            const row = [
                `"${n.nomineeName.replace(/"/g, '""')}"`,
                `"${n.nomineeTitle ? n.nomineeTitle.replace(/"/g, '""') : ''}"`,
                `"${n.nomineeOrganization ? n.nomineeOrganization.replace(/"/g, '""') : ''}"`,
                `"${n.category.name.replace(/"/g, '""')}"`,
                `"${n.category.group}"`,
                `"${n.status}"`,
                n._count.votes,
                `"${n.nominatorName.replace(/"/g, '""')}"`,
                `"${n.nominatorEmail.replace(/"/g, '""')}"`,
                `"${new Date(n.createdAt).toLocaleDateString()}"`
            ];
            csvRows.push(row.join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nominations_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportNominationsToPDF = () => {
        if (!nominations.length) return alert('No data to export');
        const doc = new jsPDF();
        doc.text('RWIBA 2026 Nominations', 14, 15);
        autoTable(doc, {
            startY: 20,
            head: [['Nominee', 'Category', 'Status', 'Votes']],
            body: nominations.map((n: Nomination) => [
                `${n.nomineeName}\n${n.nomineeOrganization || ''}`,
                `${n.category.name} (${n.category.group})`,
                n.status,
                n._count.votes
            ]),
        });
        doc.save(`nominations_export_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const exportSingleNominationToPDF = (nom: Nomination) => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('Nomination Profile', 14, 20);
        doc.setFontSize(12);

        doc.text(`Nominee: ${nom.nomineeName}`, 14, 35);
        doc.text(`Title: ${nom.nomineeTitle || 'N/A'}`, 14, 45);
        doc.text(`Organization: ${nom.nomineeOrganization || 'N/A'}`, 14, 55);
        doc.text(`Category: ${nom.category.name} (${nom.category.group})`, 14, 65);
        doc.text(`Status: ${nom.status.toUpperCase()}`, 14, 75);

        doc.text('Nominator Information:', 14, 95);
        doc.text(`Name: ${nom.nominatorName}`, 14, 105);
        doc.text(`Email: ${nom.nominatorEmail}`, 14, 115);
        if (nom.nominatorPhone) doc.text(`Phone: ${nom.nominatorPhone}`, 14, 125);

        doc.text('Impact & Achievements:', 14, 145);
        const splitAchievements = doc.splitTextToSize(nom.achievements || 'No specific achievements listed.', 180);
        doc.text(splitAchievements, 14, 155);

        doc.save(`nomination_${nom.nomineeName.replace(/\s+/g, '_')}.pdf`);
    };

    // Export Analytics
    const exportResultsToCSV = () => {
        if (!analyticsData.length) return alert('No data to export');
        const headers = ['Category', 'Group', 'Nominee', 'Votes', 'Percentage'];
        const csvRows = [headers.join(',')];

        analyticsData.forEach((cat: CategoryResult) => {
            const totalVotes = cat.nominees.reduce((sum: number, n: NomineeResult) => sum + n.votes, 0);
            cat.nominees.forEach((n: NomineeResult) => {
                const pct = totalVotes > 0 ? ((n.votes / totalVotes) * 100).toFixed(1) : '0';
                csvRows.push([
                    `"${cat.categoryName.replace(/"/g, '""')}"`,
                    `"${cat.group}"`,
                    `"${n.nomineeName.replace(/"/g, '""')}"`,
                    n.votes,
                    `${pct}%`
                ].join(','));
            });
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `voting_results_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportResultsToPDF = () => {
        if (!analyticsData.length) return alert('No data to export');
        const doc = new jsPDF();
        doc.text('RWIBA 2026 Voting Results', 14, 15);
        let currentY = 20;

        analyticsData.forEach((cat: CategoryResult) => {
            const totalVotes = cat.nominees.reduce((sum: number, n: NomineeResult) => sum + n.votes, 0);
            if (currentY > 250) {
                doc.addPage();
                currentY = 20;
            }
            doc.setFontSize(14);
            doc.text(`${cat.categoryName} (${cat.group}) - Total: ${totalVotes} votes`, 14, currentY);
            currentY += 5;

            autoTable(doc, {
                startY: currentY,
                head: [['Nominee', 'Votes', 'Percentage']],
                body: cat.nominees.sort((a: NomineeResult, b: NomineeResult) => b.votes - a.votes).map((n: NomineeResult) => {
                    const pct = totalVotes > 0 ? ((n.votes / totalVotes) * 100).toFixed(1) : '0';
                    return [n.nomineeName, n.votes, `${pct}%`];
                }),
            });
            currentY = (doc as any).lastAutoTable?.finalY
                ? (doc as any).lastAutoTable!.finalY + 15
                : currentY + 15;
        });

        doc.save(`voting_results_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    useEffect(() => {
        if (activeTab === 'LIST' || activeTab === 'CATEGORIES') fetchData();
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

                    <div className="flex bg-gray-100 dark:bg-black/20 p-1 rounded-xl flex-wrap">
                        <button onClick={() => setActiveTab('LIST')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'LIST' ? 'bg-white dark:bg-white/10 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Nominations</button>
                        <button onClick={() => setActiveTab('CATEGORIES')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'CATEGORIES' ? 'bg-white dark:bg-white/10 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Categories</button>
                        <button onClick={() => setActiveTab('ANALYTICS')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'ANALYTICS' ? 'bg-white dark:bg-white/10 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Live Results</button>
                        <button onClick={() => setActiveTab('SETTINGS')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'SETTINGS' ? 'bg-white dark:bg-white/10 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Phase Control</button>
                        <button onClick={() => { setActiveTab('AUDIT'); fetchAuditLogs(); }} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'AUDIT' ? 'bg-white dark:bg-white/10 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Audit Log</button>
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
                        <div className="ml-auto flex items-center gap-2">
                            <button onClick={() => openNomModal()} className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1 text-xs font-bold shadow-md shadow-primary/20">
                                <span className="material-icons text-sm">add</span> Add Nominee
                            </button>
                            <button onClick={exportNominationsToCSV} className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors flex items-center gap-1 text-xs font-bold" title="Export CSV">
                                <span className="material-icons text-sm">text_snippet</span> <span className="hidden sm:inline">CSV</span>
                            </button>
                            <button onClick={exportNominationsToPDF} className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1 text-xs font-bold" title="Export PDF">
                                <span className="material-icons text-sm">picture_as_pdf</span> <span className="hidden sm:inline">PDF</span>
                            </button>
                            <button onClick={fetchData} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors" title="Refresh">
                                <span className="material-icons text-sm">refresh</span>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'ANALYTICS' && (
                    <div className="flex justify-between items-center animate-fade-in">
                        <p className="text-sm font-medium text-gray-500">Live voting tallies across all categories</p>
                        <div className="flex items-center gap-2">
                            <button onClick={exportResultsToCSV} className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors flex items-center gap-1 text-xs font-bold" title="Export CSV">
                                <span className="material-icons text-sm">text_snippet</span> <span className="hidden sm:inline">CSV</span>
                            </button>
                            <button onClick={exportResultsToPDF} className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1 text-xs font-bold" title="Export PDF">
                                <span className="material-icons text-sm">picture_as_pdf</span> <span className="hidden sm:inline">PDF</span>
                            </button>
                            <button onClick={fetchAnalytics} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors" title="Refresh">
                                <span className="material-icons text-sm">refresh</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {activeTab === 'LIST' && (
                <div className="animate-fade-in">
                    {selectedIds.size > 0 && (
                        <div className="mx-6 mb-4 p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between animate-fade-in">
                            <div className="flex items-center gap-3">
                                <span className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full">{selectedIds.size} SELECTED</span>
                                <span className="text-xs font-medium text-primary/80">Bulk action for selected nominees:</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleBulkUpdateStatus('shortlisted')} className="px-3 py-1.5 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-blue-600 transition-colors">Shortlist</button>
                                <button onClick={() => handleBulkUpdateStatus('finalist')} className="px-3 py-1.5 bg-purple-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-purple-600 transition-colors">Make Finalist</button>
                                <button onClick={() => handleBulkUpdateStatus('approved')} className="px-3 py-1.5 bg-green-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-green-600 transition-colors">Approve</button>
                                <button onClick={() => setSelectedIds(new Set())} className="px-3 py-1.5 bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">Cancel</button>
                            </div>
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-black/10 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 dark:border-gray-800">
                                    <th className="px-6 py-4 w-10">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                                            checked={selectedIds.size === nominations.length && nominations.length > 0}
                                            onChange={toggleAllSelection}
                                            aria-label="Select all nominations"
                                        />
                                    </th>
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
                                        <tr key={nom.id} className={`transition-colors group ${selectedIds.has(nom.id) ? 'bg-primary/5' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                                                    checked={selectedIds.has(nom.id)}
                                                    onChange={() => toggleSelection(nom.id)}
                                                    aria-label={`Select ${nom.nomineeName}`}
                                                />
                                            </td>
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
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => { setSelectedNomination(nom); setIsModalOpen(true); }} className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center" title="View">
                                                        <span className="material-icons text-sm">visibility</span>
                                                    </button>
                                                    <button onClick={() => openNomModal(nom)} className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center" title="Edit">
                                                        <span className="material-icons text-sm">edit</span>
                                                    </button>
                                                    <button onClick={() => setDeleteConfirm({ type: 'nomination', id: nom.id })} className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center" title="Delete">
                                                        <span className="material-icons text-sm">delete</span>
                                                    </button>
                                                    <select aria-label="Change nomination status" className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-tight focus:outline-none focus:border-primary text-gray-600 dark:text-gray-400" value={nom.status} onChange={(e) => handleUpdateStatus(nom.id, e.target.value)}>
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
                                        <td colSpan={6} className="px-6 py-20 text-center text-gray-500 italic text-sm">
                                            No nominations found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'CATEGORIES' && (
                <div className="p-6 animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-sm font-medium text-gray-500">{categories.length} award categories configured</p>
                        <button onClick={() => openCatModal()} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5 text-xs font-bold shadow-md shadow-primary/20">
                            <span className="material-icons text-sm">add</span> Add Category
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map(cat => (
                            <div key={cat.id} className="bg-gray-50 dark:bg-black/10 rounded-xl p-5 border border-gray-100 dark:border-white/5 group hover:border-primary/30 transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="material-icons text-primary text-lg">{cat.icon || 'emoji_events'}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-primary/60 bg-primary/10 px-2 py-0.5 rounded-full">{cat.group}</span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openCatModal(cat)} className="w-7 h-7 rounded-full bg-white dark:bg-white/10 text-gray-400 hover:text-blue-500 flex items-center justify-center transition-all shadow-sm" title="Edit">
                                            <span className="material-icons text-[14px]">edit</span>
                                        </button>
                                        <button onClick={() => setDeleteConfirm({ type: 'category', id: cat.id })} className="w-7 h-7 rounded-full bg-white dark:bg-white/10 text-gray-400 hover:text-red-500 flex items-center justify-center transition-all shadow-sm" title="Delete">
                                            <span className="material-icons text-[14px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{cat.name}</h4>
                                <p className="text-xs text-gray-500 line-clamp-2">{cat.description || 'No description'}</p>
                                <div className="mt-3 text-[9px] font-bold uppercase text-gray-400">Sort: {cat.sortOrder || 0}</div>
                            </div>
                        ))}
                    </div>
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
                                    <p className="text-xs text-gray-500">Control if users can submit new nominees, and when the phase concludes.</p>
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
                            <div className="mt-4 border-t border-gray-100 dark:border-white/5 pt-4">
                                <label htmlFor="nomEnd" className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-2">Phase Countdown End Date</label>
                                <input
                                    id="nomEnd"
                                    type="datetime-local"
                                    className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-700 dark:text-gray-300"
                                    value={settings.NOMINATION_END_DATE || ''}
                                    onChange={(e) => handleUpdateSetting('NOMINATION_END_DATE', e.target.value)}
                                    disabled={isSettingsUpdating}
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-black/10 p-6 rounded-2xl border border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                    <span className="material-icons">how_to_vote</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">Voting Phase</h4>
                                    <p className="text-xs text-gray-500">Control if the public can cast votes, and when the voting concludes.</p>
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
                            <div className="mt-4 border-t border-gray-100 dark:border-white/5 pt-4 space-y-4">
                                <div>
                                    <label htmlFor="voteStart" className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-2">Phase Opening Date</label>
                                    <input
                                        id="voteStart"
                                        type="datetime-local"
                                        className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-700 dark:text-gray-300"
                                        value={settings.VOTING_START_DATE || ''}
                                        onChange={(e) => handleUpdateSetting('VOTING_START_DATE', e.target.value)}
                                        disabled={isSettingsUpdating}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="voteEnd" className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-2">Phase Closing Date (Countdown)</label>
                                    <input
                                        id="voteEnd"
                                        type="datetime-local"
                                        className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-700 dark:text-gray-300"
                                        value={settings.VOTING_END_DATE || ''}
                                        onChange={(e) => handleUpdateSetting('VOTING_END_DATE', e.target.value)}
                                        disabled={isSettingsUpdating}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'AUDIT' && (
                <div className="p-6 animate-fade-in max-h-[600px] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Voter Audit Log</h3>
                            <p className="text-[10px] text-gray-500 uppercase font-medium">Monitoring recent 200 voting activities</p>
                        </div>
                        <button onClick={fetchAuditLogs} className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all">
                            <span className={`material-icons text-sm ${isAuditLoading ? 'animate-spin' : ''}`}>refresh</span>
                        </button>
                    </div>

                    <div className="overflow-hidden bg-gray-50 dark:bg-black/10 rounded-2xl border border-gray-100 dark:border-white/5">
                        <table className="w-full text-left">
                            <thead className="bg-white/50 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">Timestamp</th>
                                    <th className="px-6 py-3">Nominee</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">IP Address</th>
                                    <th className="px-6 py-3">Fingerprint</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-[11px]">
                                {isAuditLoading && auditLogs.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center"><div className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></td></tr>
                                ) : auditLogs.length > 0 ? (
                                    auditLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-3 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                                            <td className="px-6 py-3 font-bold text-gray-900 dark:text-white">{log.nomination.nomineeName}</td>
                                            <td className="px-6 py-3 text-gray-500">{log.nomination.category.name}</td>
                                            <td className="px-6 py-3"><code className="bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-primary font-bold">{log.voterIp}</code></td>
                                            <td className="px-6 py-3 text-gray-400 font-mono text-[9px]">{log.voterFingerprint || 'No footprint'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">No voting records found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {isModalOpen && selectedNomination && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl h-[90vh] rounded-[2.5rem] shadow-2xl relative z-10 animate-fade-in-up border border-white/10 flex flex-col overflow-hidden">
                        <div className="p-8 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50 backdrop-blur-md">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-2">Nomination Details</h2>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${getStatusColor(selectedNomination.status)}`}>
                                        {selectedNomination.status}
                                    </span>
                                    <span className="text-gray-400 text-xs font-medium">Ref: INV-{selectedNomination.id.slice(0, 8).toUpperCase()}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => exportSingleNominationToPDF(selectedNomination)}
                                    className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all text-xs font-bold flex items-center gap-1"
                                    title="Export PDF"
                                >
                                    <span className="material-icons text-sm">picture_as_pdf</span> Export
                                </button>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all text-gray-500"
                                >
                                    <span className="material-icons text-lg">close</span>
                                </button>
                            </div>
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
                </div>,
                document.body
            )}
            {/* Category CRUD Modal */}
            {isCatModalOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsCatModalOpen(false)} />
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl relative z-10 animate-fade-in-up border border-white/5">
                        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
                            <h2 className="font-bold text-lg text-gray-900 dark:text-white">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
                            <button onClick={() => setIsCatModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all text-gray-400"><span className="material-icons text-sm">close</span></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="cat-name" className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1">Name *</label>
                                <input id="cat-name" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} placeholder="e.g. Woman of the Year" />
                            </div>
                            <div>
                                <label htmlFor="cat-description" className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1">Description</label>
                                <textarea id="cat-description" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary h-20 resize-none" value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="cat-group" className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1">Group</label>
                                    <select id="cat-group" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" value={catForm.group} onChange={e => setCatForm({ ...catForm, group: e.target.value })}>
                                        <option value="INDIVIDUAL">Individual</option>
                                        <option value="CORPORATE">Corporate</option>
                                        <option value="SME">SME</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="cat-icon" className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1">Icon</label>
                                    <input id="cat-icon" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" value={catForm.icon} onChange={e => setCatForm({ ...catForm, icon: e.target.value })} />
                                </div>
                                <div>
                                    <label htmlFor="cat-sort" className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1">Sort Order</label>
                                    <input id="cat-sort" type="number" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" value={catForm.sortOrder} onChange={e => setCatForm({ ...catForm, sortOrder: Number(e.target.value) })} />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 dark:border-white/10 flex justify-end gap-3">
                            <button onClick={() => setIsCatModalOpen(false)} className="px-6 py-2.5 bg-gray-200 dark:bg-white/10 rounded-lg text-xs font-bold uppercase tracking-widest">Cancel</button>
                            <button onClick={handleSaveCategory} className="px-6 py-2.5 bg-primary text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-md shadow-primary/20 hover:bg-primary/90">{editingCategory ? 'Update' : 'Create'}</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {isNomModalOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsNomModalOpen(false)} />
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 animate-fade-in-up border border-white/5 max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
                            <h2 className="font-bold text-lg text-gray-900 dark:text-white">{editingNomination ? 'Edit Nominee' : 'Add Nominee'}</h2>
                            <button onClick={() => setIsNomModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all text-gray-400"><span className="material-icons text-sm">close</span></button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto flex-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="nom-category" className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1">Category *</label>
                                    <select id="nom-category" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" value={nomForm.categoryId} onChange={e => setNomForm({ ...nomForm, categoryId: e.target.value })}>
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.group})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="nom-status" className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1">Status</label>
                                    <select id="nom-status" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" value={nomForm.status} onChange={e => setNomForm({ ...nomForm, status: e.target.value })}>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="shortlisted">Shortlisted</option>
                                        <option value="finalist">Finalist</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="nom-name" className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1">Nominee Name *</label>
                                <input id="nom-name" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" value={nomForm.nomineeName} onChange={e => setNomForm({ ...nomForm, nomineeName: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="nom-title" className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1">Title</label>
                                    <input id="nom-title" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" value={nomForm.nomineeTitle} onChange={e => setNomForm({ ...nomForm, nomineeTitle: e.target.value })} />
                                </div>
                                <div>
                                    <label htmlFor="nom-org" className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1">Organization</label>
                                    <input id="nom-org" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" value={nomForm.nomineeOrganization} onChange={e => setNomForm({ ...nomForm, nomineeOrganization: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="nom-achievements" className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1">Achievements</label>
                                <textarea id="nom-achievements" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary h-20 resize-none" value={nomForm.achievements} onChange={e => setNomForm({ ...nomForm, achievements: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="nom-sector" className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1">Sector</label>
                                    <input id="nom-sector" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" value={nomForm.sector} onChange={e => setNomForm({ ...nomForm, sector: e.target.value })} />
                                </div>
                                <div>
                                    <label htmlFor="nom-manual-votes" className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1">Manual Votes</label>
                                    <input id="nom-manual-votes" type="number" min="0" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" value={nomForm.manualVotes} onChange={e => setNomForm({ ...nomForm, manualVotes: Number(e.target.value) })} />
                                    <p className="text-[9px] text-gray-400 mt-1">Added to actual vote count in results</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 dark:border-white/10 flex justify-end gap-3">
                            <button onClick={() => setIsNomModalOpen(false)} className="px-6 py-2.5 bg-gray-200 dark:bg-white/10 rounded-lg text-xs font-bold uppercase tracking-widest">Cancel</button>
                            <button onClick={handleSaveNomination} className="px-6 py-2.5 bg-primary text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-md shadow-primary/20 hover:bg-primary/90">{editingNomination ? 'Update' : 'Create'}</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {deleteConfirm && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl shadow-2xl relative z-10 animate-fade-in-up border border-white/5 p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                            <span className="material-icons text-red-500 text-3xl">warning</span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Confirm Delete</h3>
                        <p className="text-sm text-gray-500 mb-6">This action cannot be undone. Are you sure you want to delete this {deleteConfirm.type}?</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setDeleteConfirm(null)} className="px-6 py-2.5 bg-gray-200 dark:bg-white/10 rounded-lg text-xs font-bold uppercase tracking-widest">Cancel</button>
                            <button onClick={() => deleteConfirm.type === 'category' ? handleDeleteCategory(deleteConfirm.id as number) : handleDeleteNomination(deleteConfirm.id as string)} className="px-6 py-2.5 bg-red-500 text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-md shadow-red-500/20 hover:bg-red-600">Delete</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default NominationsManager;
