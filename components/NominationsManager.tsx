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

const NominationsManager: React.FC = () => {
    const [nominations, setNominations] = useState<Nomination[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [categories, setCategories] = useState<any[]>([]);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [selectedNomination, setSelectedNomination] = useState<Nomination | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [nomRes, catRes] = await Promise.all([
                api.get(`/nominations?status=${statusFilter}&categoryId=${categoryFilter}`),
                api.get('/nominations/categories')
            ]);
            setNominations(nomRes.data.nominations || []);

            // Flatten grouped categories for the dropdown
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
        fetchData();
    }, [statusFilter, categoryFilter]);

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
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">RWIBA 2026 Nominations</h2>
                        <p className="text-sm text-gray-500">Manage and track award candidates</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <select
                        aria-label="Filter by status"
                        className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary text-gray-700 dark:text-gray-300"
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

                    <select
                        aria-label="Filter by category"
                        className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary text-gray-700 dark:text-gray-300"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-black/10 text-xs font-bold uppercase tracking-wider text-gray-500">
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
                                <tr key={nom.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">{nom.nomineeName}</div>
                                        <div className="text-xs text-gray-500">{nom.nomineeTitle} at {nom.nomineeOrganization}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-700 dark:text-gray-300">{nom.category.name}</div>
                                        <div className="text-[10px] uppercase font-bold text-gray-400">{nom.category.group}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(nom.status)}`}>
                                            {nom.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="material-icons text-xs text-primary">how_to_vote</span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{nom._count.votes}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => { setSelectedNomination(nom); setIsModalOpen(true); }}
                                            className="text-gray-400 hover:text-primary transition-colors"
                                            title="View Details"
                                        >
                                            <span className="material-icons">visibility</span>
                                        </button>
                                        <select
                                            aria-label="Change nomination status"
                                            className="bg-transparent border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-primary text-gray-600 dark:text-gray-400"
                                            value={nom.status}
                                            onChange={(e) => handleUpdateStatus(nom.id, e.target.value)}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="shortlisted">Shortlisted</option>
                                            <option value="finalist">Finalist</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center">
                                    <p className="text-gray-500">No nominations found.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Details Modal */}
            {isModalOpen && selectedNomination && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsModalOpen(false)}
                    ></div>
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative z-10 animate-fade-in-up">
                        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-zinc-900/50">
                            <div>
                                <h2 className="font-display text-lg font-bold uppercase tracking-tight text-gray-900 dark:text-white">Nomination Details</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{selectedNomination.category.name}</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                            >
                                <span className="material-icons text-sm">close</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Nominee Info */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 border-b border-primary/20 pb-2">Nominee</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-gray-400">Name</label>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedNomination.nomineeName}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-gray-400">Organization</label>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedNomination.nomineeOrganization}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold uppercase text-gray-400">Title / Position</label>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedNomination.nomineeTitle}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Impact Info */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 border-b border-primary/20 pb-2">Impact & Achievements</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-gray-400">Key Achievements</label>
                                        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap mt-1 bg-gray-50 dark:bg-white/5 p-4 rounded-lg">
                                            {selectedNomination.achievements || <span className="italic text-gray-400">No achievements recorded</span>}
                                        </p>
                                    </div>
                                    {selectedNomination.measurableResults && (
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-gray-400">Measurable Results</label>
                                            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap mt-1 bg-gray-50 dark:bg-white/5 p-4 rounded-lg">
                                                {selectedNomination.measurableResults}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Nominator Info */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 border-b border-primary/20 pb-2">Nominator</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-gray-400">Name</label>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedNomination.nominatorName}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-gray-400">Email</label>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedNomination.nominatorEmail}</p>
                                    </div>
                                    {selectedNomination.nominatorPhone && (
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-gray-400">Phone</label>
                                            <p className="font-medium text-gray-900 dark:text-white">{selectedNomination.nominatorPhone}</p>
                                        </div>
                                    )}
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold uppercase text-gray-400">Submitted On</label>
                                        <p className="font-medium text-gray-900 dark:text-white">{new Date(selectedNomination.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 dark:border-white/10 flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NominationsManager;
