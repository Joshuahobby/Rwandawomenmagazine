import React from 'react';
import { useAuth } from '../context/AuthContext';

interface DashboardSettingsProps {
    navigate: (page: any) => void;
}

const DashboardSettings: React.FC<DashboardSettingsProps> = ({ navigate }) => {
    const { user } = useAuth();

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pl-1">
            {/* Header */}
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-white/5 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 relative z-10">Profile Settings</h3>
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-surface-dark shadow-md shrink-0">
                        {user?.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white truncate">{user?.fullName}</h4>
                        <p className="text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                {user?.role}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('MEMBER_PROFILE')}
                        className="px-5 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors font-medium text-sm whitespace-nowrap"
                    >
                        View Public Profile
                    </button>
                </div>
            </div>

            {/* Application Settings */}
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-white/5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Application Preferences</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Customize your dashboard experience</p>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {/* Dark Mode Toggle */}
                    <div className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                                <span className="material-icons text-xl">dark_mode</span>
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white">Theme Preference</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Toggle between light and dark modes</p>
                            </div>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                            <span className="sr-only">Enable dark mode</span>
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1 dark:translate-x-6"></span>
                        </button>
                    </div>

                    {/* Email Notifications */}
                    <div className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                                <span className="material-icons text-xl">notifications</span>
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white">Email Notifications</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Receive weekly activity digests</p>
                            </div>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                            <span className="sr-only">Enable notifications</span>
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
                        </button>
                    </div>

                    {/* Compact Mode */}
                    <div className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                                <span className="material-icons text-xl">view_compact</span>
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white">Compact Mode</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Reduce whitespace in lists</p>
                            </div>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                            <span className="sr-only">Enable compact mode</span>
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="text-center pt-8 border-t border-slate-100 dark:border-white/5">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Rwanda Women Magazine Platform</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Version 1.2.0 • Build 2026.02.15</p>
            </div>
        </div>
    );
};

export default DashboardSettings;
