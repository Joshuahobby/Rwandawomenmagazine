import React, { useState } from 'react';
import type { Comment as CommentType } from '../../types';
import api from '../../services/api';

interface ArticleCommentsProps {
    articleId: string;
    comments: CommentType[];
    isLoading: boolean;
}

const ArticleComments: React.FC<ArticleCommentsProps> = ({ articleId, comments, isLoading }) => {
    const [commentForm, setCommentForm] = useState({ name: '', email: '', comment: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!articleId || isSubmitting) return;

        setIsSubmitting(true);
        setFeedback(null);

        try {
            await api.post(`/comments/${articleId}`, commentForm);
            setFeedback({
                type: 'success',
                msg: 'Thank you! Your comment has been submitted and is awaiting moderation.',
            });
            setCommentForm({ name: '', email: '', comment: '' });
        } catch {
            setFeedback({ type: 'error', msg: 'Failed to post comment. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="mt-16 bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 md:p-10 border border-gray-100 dark:border-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
                <h2 className="font-display text-2xl md:text-3xl font-black italic uppercase tracking-tight">
                    Narrative <span className="text-primary">Dialogue</span>
                </h2>
                <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-xs font-bold tracking-widest border border-primary/20">
                    {comments.length} COMMENTS
                </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 mb-14">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="comment-name" className="block text-xs font-bold uppercase tracking-widest text-slate-500 ml-4">
                            Full Name
                        </label>
                        <input
                            id="comment-name"
                            type="text"
                            placeholder="Jane Doe"
                            className="w-full bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-gray-700 rounded-full px-6 py-3 focus:border-primary outline-none transition-all font-medium"
                            value={commentForm.name}
                            onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="comment-email" className="block text-xs font-bold uppercase tracking-widest text-slate-500 ml-4">
                            Email Address
                        </label>
                        <input
                            id="comment-email"
                            type="email"
                            placeholder="jane@example.com"
                            className="w-full bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-gray-700 rounded-full px-6 py-3 focus:border-primary outline-none transition-all font-medium"
                            value={commentForm.email}
                            onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label htmlFor="comment-body" className="block text-xs font-bold uppercase tracking-widest text-slate-500 ml-4">
                        Your Perspective
                    </label>
                    <textarea
                        id="comment-body"
                        rows={5}
                        placeholder="Share your thoughts on this narrative..."
                        className="w-full bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-gray-700 rounded-[2rem] px-6 py-5 focus:border-primary outline-none transition-all font-medium resize-none"
                        value={commentForm.comment}
                        onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value })}
                        required
                    ></textarea>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                    {feedback && (
                        <p
                            className={`text-sm font-bold tracking-tight italic ${feedback.type === 'success' ? 'text-green-600 dark:text-green-500' : 'text-red-500'}`}
                        >
                            {feedback.msg}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="ml-auto bg-primary text-white px-10 py-3.5 rounded-full font-bold uppercase tracking-widest hover:bg-primary-dark transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                    >
                        {isSubmitting ? 'SUBMITTING...' : 'POST COMMENT'}
                    </button>
                </div>
            </form>

            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : comments.length > 0 ? (
                    comments.map((c) => (
                        <article
                            key={c.id}
                            className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 shrink-0 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-primary font-bold text-xl uppercase">
                                    {c.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold tracking-tight text-slate-800 dark:text-slate-100 truncate">
                                        {c.name}
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                        {new Date(c.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic break-words">
                                {c.comment}
                            </p>
                        </article>
                    ))
                ) : (
                    <div className="text-center py-12 text-slate-400 font-serif italic">
                        Be the first to join the dialogue on this story.
                    </div>
                )}
            </div>
        </section>
    );
};

export default ArticleComments;
