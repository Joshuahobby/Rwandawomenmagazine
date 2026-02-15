import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Subscriber {
    id: string;
    email: string;
    source: string;
    createdAt: string;
}

const SubscriberList: React.FC = () => {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSubscribers = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/subscribers');
            // Backend returns { subscribers: [...], pagination: {...} }
            setSubscribers(response.data.subscribers || []);
        } catch (err) {
            console.error('Failed to fetch subscribers:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this subscriber?')) return;
        try {
            await api.delete(`/subscribers/${id}`);
            setSubscribers(subscribers.filter(s => s.id !== id));
        } catch (err) {
            console.error('Failed to delete subscriber:', err);
            alert('Failed to delete subscriber.');
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const filteredSubscribers = subscribers.filter(s =>
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.source.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Newsletter Subscribers</h2>
                    <p className="text-sm text-gray-500">Total: {subscribers.length}</p>
                </div>
                <div className="relative">
                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                    <input
                        type="text"
                        placeholder="Search subscribers..."
                        className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-primary w-full md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-black/10 text-xs font-bold uppercase tracking-wider text-gray-500">
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Source</th>
                            <th className="px-6 py-4">Join Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center">
                                    <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <p className="mt-2 text-sm text-gray-500">Loading subscribers...</p>
                                </td>
                            </tr>
                        ) : filteredSubscribers.length > 0 ? (
                            filteredSubscribers.map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{sub.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                            {sub.source}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(sub.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(sub.id)}
                                            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                            title="Unsubscribe"
                                        >
                                            <span className="material-icons text-sm">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-20 text-center">
                                    <span className="material-icons text-4xl text-gray-200 dark:text-gray-700 mb-2">person_off</span>
                                    <p className="text-gray-500">No subscribers found.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SubscriberList;
