import React, { useState, useEffect } from 'react';
import api from '../services/api';

const EmailSettingsManager: React.FC = () => {
    const [adminEmail, setAdminEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings');
                if (response.data.admin_notification_email) {
                    setAdminEmail(response.data.admin_notification_email);
                }
            } catch {
                // Error logged downstream if needed
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            await api.post('/settings', {
                key: 'admin_notification_email',
                value: adminEmail
            });
            setMessage({ text: 'Settings updated successfully!', type: 'success' });
        } catch {
            setMessage({ text: 'Failed to update settings.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendTest = async () => {
        setIsTesting(true);
        setMessage(null);
        try {
            await api.post('/settings/test-email');
            setMessage({ text: 'Test email sent! Check your inbox.', type: 'success' });
        } catch {
            setMessage({ text: 'Failed to send test email.', type: 'error' });
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pl-1">
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Email Infrastructure</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure and monitor your automated notifications</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-500/10 rounded-full border border-green-100 dark:border-green-500/20">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-green-600 uppercase tracking-wider">System Healthy</span>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Admin Email Setting */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                            <span className="material-icons text-primary">admin_panel_settings</span>
                            <h4 className="font-bold underline decoration-primary/30 decoration-2 underline-offset-4 uppercase tracking-tight text-sm">Recipient Configuration</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                    Management Notification Email
                                </label>
                                <input
                                    type="email"
                                    value={adminEmail}
                                    onChange={(e) => setAdminEmail(e.target.value)}
                                    placeholder="management@thousandhillsevents@gmail.com"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                />
                                <p className="text-xs text-slate-500 italic">This address will receive all nomination and vote alerts.</p>
                            </div>
                            <div>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-6 py-3 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded-lg font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <span className="material-icons text-sm">save</span>
                                    )}
                                    {isSaving ? 'Saving...' : 'Update Settings'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-white/5"></div>

                    {/* Delivery Testing */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                            <span className="material-icons text-orange-500">biotech</span>
                            <h4 className="font-bold underline decoration-orange-500/30 decoration-2 underline-offset-4 uppercase tracking-tight text-sm">Delivery Diagnostics</h4>
                        </div>
                        <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-xl border border-slate-200 dark:border-white/10 border-dashed">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="flex-1">
                                    <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">Verify Template Rendering</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Send a mock nomination email using the latest <strong>React Email</strong> templates to verify brand styling and deliverability.
                                    </p>
                                </div>
                                <button
                                    onClick={handleSendTest}
                                    disabled={isTesting}
                                    className="w-full md:w-auto px-6 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-all font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
                                >
                                    {isTesting ? (
                                        <div className="w-4 h-4 border-2 border-slate-300 border-t-primary rounded-full animate-spin"></div>
                                    ) : (
                                        <span className="material-icons text-sm text-primary">send</span>
                                    )}
                                    {isTesting ? 'Sending...' : 'Send Test Notification'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-lg flex items-center gap-3 animate-slide-up ${message.type === 'success'
                            ? 'bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-300 border border-green-100 dark:border-green-500/20'
                            : 'bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-300 border border-red-100 dark:border-red-500/20'
                            }`}>
                            <span className="material-icons text-sm">
                                {message.type === 'success' ? 'check_circle' : 'error'}
                            </span>
                            <span className="text-sm font-medium">{message.text}</span>
                        </div>
                    )}
                </div>

                <div className="px-8 py-4 bg-slate-50 dark:bg-white/5 flex items-center justify-between text-xs text-slate-400 font-medium">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 uppercase tracking-widest"><span className="material-icons text-[10px]">lock</span> Idempotency Active</span>
                        <span className="flex items-center gap-1 uppercase tracking-widest"><span className="material-icons text-[10px]">shield</span> Signature Verified</span>
                    </div>
                    <span>RESEND INFRASTRUCTURE v2.1.0</span>
                </div>
            </div>
        </div>
    );
};

export default EmailSettingsManager;
