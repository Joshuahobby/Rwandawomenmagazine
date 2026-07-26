import React from 'react';

/**
 * Reserved advertising space.
 *
 * Every slot reserves its height up front so filling it later never shifts the
 * page (no layout shift). Until real inventory exists it renders a neutral
 * labelled placeholder.
 *
 * TO PLUG IN A REAL AD: this is the only file that needs to change. Replace the
 * placeholder markup below with the ad script/iframe/sponsor image — the sizes,
 * spacing and responsive behaviour already work everywhere the slot is used.
 */

export type AdSize = 'rectangle' | 'halfpage' | 'inline';

interface AdSlotProps {
    /**
     * rectangle — 300x250 medium rectangle, the standard sidebar unit
     * halfpage  — 300x600 half page, for further down the rail
     * inline    — full-width responsive banner for inside the article flow
     */
    size?: AdSize;
    /** Where this slot sits, e.g. "sidebar-top". Useful for wiring ad targeting later. */
    placement?: string;
    className?: string;
}

const SIZE_CLASSES: Record<AdSize, string> = {
    // Reserve exact IAB dimensions, centred inside the rail.
    rectangle: 'h-[250px] w-full max-w-[300px] mx-auto',
    halfpage: 'h-[600px] w-full max-w-[300px] mx-auto',
    // Shorter on phones, taller once there is room for a leaderboard-style unit.
    inline: 'h-[200px] sm:h-[120px] w-full',
};

const AdSlot: React.FC<AdSlotProps> = ({ size = 'rectangle', placement, className = '' }) => {
    return (
        <div className={className} data-ad-placement={placement}>
            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-2 text-center">
                Advertisement
            </span>
            <div
                className={`${SIZE_CLASSES[size]} flex items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40`}
            >
                <span className="text-xs font-medium text-slate-400 dark:text-slate-600">
                    Ad space available
                </span>
            </div>
        </div>
    );
};

export default AdSlot;
