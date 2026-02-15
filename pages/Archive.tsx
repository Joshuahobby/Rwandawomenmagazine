import React from 'react';
import { PageView } from '../types';
import { ISSUES } from '../constants';

interface ArchiveProps {
  navigate: (page: PageView) => void;
}

const Archive: React.FC<ArchiveProps> = ({ navigate }) => {
  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-gray-900 dark:text-white mb-4">Past Issues</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 font-light leading-relaxed">
                Explore the archive of Rwanda Women Magazine, celebrating leadership, innovation, and the stories that shape our future since 2018.
            </p>
        </div>

        {/* Year Filter */}
        <div className="flex justify-center mb-12 overflow-x-auto pb-4 no-scrollbar">
            <div className="inline-flex bg-white dark:bg-surface-dark p-1.5 rounded-full shadow-sm border border-primary/10">
                <button className="px-6 py-2 rounded-full text-sm font-medium bg-primary text-white shadow-md">2024</button>
                <button className="px-6 py-2 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary">2023</button>
                <button className="px-6 py-2 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary">2022</button>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {ISSUES.map((issue, idx) => (
                <div key={idx} className="group relative flex flex-col h-[500px] cursor-pointer" onClick={() => navigate('ARTICLE')}>
                    <div className="relative w-full h-full overflow-hidden rounded-lg shadow-lg bg-gray-200 dark:bg-gray-800">
                        <img src={issue.coverImage} alt={issue.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
                        <div className="absolute bottom-0 left-0 w-full p-6 text-white transition-transform duration-300 group-hover:-translate-y-2">
                            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-1">{issue.month} {issue.year}</p>
                            <h3 className="text-2xl font-bold font-display leading-tight">{issue.title}</h3>
                            <p className="text-sm text-gray-300 mt-2 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                {issue.description}
                            </p>
                        </div>
                        {/* Overlay Buttons */}
                        <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-4 transition-opacity duration-300 p-6">
                            <button className="w-full max-w-[200px] bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-full shadow-lg transform transition hover:-translate-y-1 flex items-center justify-center gap-2">
                                <span className="material-icons text-sm">menu_book</span> Read Digital
                            </button>
                            <button className="w-full max-w-[200px] bg-white text-gray-900 hover:bg-gray-100 font-medium py-3 px-6 rounded-full shadow-lg transform transition hover:-translate-y-1 flex items-center justify-center gap-2">
                                <span className="material-icons text-sm">shopping_cart</span> Order Print
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default Archive;