import React from 'react';
import { PageView } from '../types';

interface MemberProfileProps {
  navigate: (page: PageView) => void;
}

const MemberProfile: React.FC<MemberProfileProps> = ({ navigate }) => {
  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 mb-8 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative group">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-tr from-primary to-purple-400">
                        <div className="w-full h-full rounded-full border-4 border-surface-light dark:border-surface-dark overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover" alt="Profile" />
                        </div>
                    </div>
                </div>
                <div className="flex-1 text-center md:text-left pt-2">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
                        <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Grace Umutoni</h1>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">Member since 2021</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-4">CEO at TechRwanda • Kigali, Rwanda</p>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl text-sm leading-relaxed mb-6 font-sans">Passionate about driving digital transformation in East Africa. Advocate for women in STEM.</p>
                </div>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
                <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Saved Stories</h2>
                {/* Article Items */}
                <article className="group bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col sm:flex-row h-auto sm:h-56 cursor-pointer" onClick={() => navigate('ARTICLE')}>
                    <div className="w-full sm:w-2/5 h-48 sm:h-full relative overflow-hidden">
                         <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Saved" />
                    </div>
                    <div className="p-6 flex flex-col justify-between flex-1 relative">
                        <div>
                            <span className="text-xs text-gray-500 mb-2 block">Oct 24, 2023 • 5 min read</span>
                            <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors">The Future of FinTech in Kigali</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 font-sans">How Rwanda's digital infrastructure is paving the way for a new generation.</p>
                        </div>
                         <button className="text-primary text-sm font-medium hover:underline self-end">Read Story</button>
                    </div>
                </article>
            </div>
            
            <aside className="lg:col-span-4 space-y-8">
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                    <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-4">Membership Status</h3>
                    <div className="bg-background-light dark:bg-background-dark rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-xl font-bold text-primary mb-1">Corporate Digital</p>
                        <p className="text-xs text-gray-500">Renews on Nov 14, 2023</p>
                    </div>
                    <button className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors">Manage Subscription</button>
                </div>
            </aside>
        </div>
    </div>
  );
};

export default MemberProfile;