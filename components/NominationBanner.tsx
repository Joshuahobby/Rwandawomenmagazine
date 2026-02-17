import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const NominationBanner = () => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="bg-primary text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: `url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"1\" fill-rule=\"evenodd\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"3\"/%3E%3Ccircle cx=\"13\" cy=\"13\" r=\"3\"/%3E%3C/g%3E%3C/svg%3E')` }}
            ></div>

            <div className="container mx-auto px-4 py-3 sm:py-4 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="flex-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                        <span className="animate-pulse w-2 h-2 bg-white rounded-full"></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">Action Required</span>
                    </div>
                    <p className="font-display font-bold text-lg leading-tight">
                        Nominations for RWIBA 2026 are Open!
                    </p>
                    <p className="text-xs text-white/90 hidden sm:block">
                        Recognize outstanding women leaders in our community.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        to="/nomination"
                        className="bg-white text-primary px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors shadow-lg shadow-black/10 whitespace-nowrap"
                    >
                        Nominate Now
                    </Link>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        aria-label="Close banner"
                    >
                        <span className="material-icons text-sm">close</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NominationBanner;
