import React from 'react';
import type { Article } from '../../types';
import { optimizeImage } from '../../utils/image';

interface AuthorCardProps {
    author: Article['author'];
}

const AuthorCard: React.FC<AuthorCardProps> = ({ author }) => {
    if (!author?.fullName) return null;

    return (
        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
                About the Author
            </h3>
            <div className="flex items-center gap-4">
                {author.profileImage ? (
                    <img
                        src={optimizeImage(author.profileImage, 96, 96)}
                        alt={author.fullName}
                        loading="lazy"
                        decoding="async"
                        className="w-14 h-14 rounded-full object-cover shrink-0"
                    />
                ) : (
                    <div className="w-14 h-14 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary font-bold text-xl uppercase">
                        {author.fullName.charAt(0)}
                    </div>
                )}
                <h4 className="font-display text-lg font-bold leading-tight">{author.fullName}</h4>
            </div>
            {author.bio && (
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {author.bio}
                </p>
            )}
        </section>
    );
};

export default AuthorCard;
