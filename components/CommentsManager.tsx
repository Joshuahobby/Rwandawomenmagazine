import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Comment {
    id: string;
    name: string;
    email: string;
    comment: string;
    isApproved: boolean;
    createdAt: string;
    article: {
        title: string;
    };
}

const CommentsManager: React.FC = () => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/comments');
            setComments(response.data || []);
        } catch (err) {
            console.error('Failed to fetch comments:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await api.patch(`/comments/${id}/approve`);
            setComments(comments.map(c => c.id === id ? { ...c, isApproved: true } : c));
        } catch (err) {
            console.error('Failed to approve comment:', err);
            alert('Failed to approve comment.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        try {
            await api.delete(`/comments/${id}`);
            setComments(comments.filter(c => c.id !== id));
        } catch (err) {
            console.error('Failed to delete comment:', err);
            alert('Failed to delete comment.');
        }
    };

    useEffect(() => {
        fetchComments();
    }, []);

    const filteredComments = comments.filter(c => activeTab === 'pending' ? !c.isApproved : c.isApproved);

    return (
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Comment Moderation</h2>

                <div className="flex bg-gray-100 dark:bg-black/20 p-1 rounded-lg w-fit">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'pending' ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Pending ({comments.filter(c => !c.isApproved).length})
                    </button>
                    <button
                        onClick={() => setActiveTab('approved')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'approved' ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Approved ({comments.filter(c => c.isApproved).length})
                    </button>
                </div>
            </div>

            <div className="p-0">
                {isLoading ? (
                    <div className="py-20 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-2 text-sm text-gray-500">Loading comments...</p>
                    </div>
                ) : filteredComments.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredComments.map((comment) => (
                            <div key={comment.id} className="p-6 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-gray-900 dark:text-white">{comment.name}</h4>
                                            <span className="text-xs text-gray-400">• {comment.email}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <span className="material-icons text-xs">article</span>
                                            On: <span className="font-medium text-primary-light">{comment.article?.title}</span>
                                            <span className="mx-2">•</span>
                                            {new Date(comment.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!comment.isApproved && (
                                            <button
                                                onClick={() => handleApprove(comment.id)}
                                                className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                <span className="material-icons text-xs">check</span>
                                                Approve
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="flex items-center gap-1 bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-red-200 dark:border-red-900/30"
                                        >
                                            <span className="material-icons text-xs">delete</span>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-gray-800 leading-relaxed italic">
                                    "{comment.comment}"
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <span className="material-icons text-4xl text-gray-200 dark:text-gray-700 mb-2">chat_bubble_outline</span>
                        <p className="text-gray-500">No {activeTab} comments found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentsManager;
