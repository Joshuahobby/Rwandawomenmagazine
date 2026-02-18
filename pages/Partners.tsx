/* eslint-disable */
import React from 'react';
import { PageView } from '../types';

interface PartnersProps {
    navigate: (view: PageView) => void;
}

const Partners: React.FC<PartnersProps> = () => {
    return (
        <div className="animate-fade-in font-display">
            <header className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src="/uploads/pictures/RWIBA GALLERY (12).jpg" className="w-full h-full object-cover" alt="Partners" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background-dark/90 via-background-dark/70 to-transparent"></div>
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 w-full text-white">
                    <div className="max-w-3xl">
                        <div className="inline-block px-3 py-1 bg-primary/20 border border-primary/40 backdrop-blur-sm rounded-full mb-6">
                            <span className="text-primary-300 text-xs font-semibold tracking-wider uppercase">Corporate Partnerships</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">Empowering Rwanda's <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-300">Business Landscape</span> Together</h1>
                        <p className="text-xl text-gray-200 mb-8 max-w-2xl font-light font-sans">Join the premier platform amplifying women-led innovation and leadership across East Africa.</p>
                        <div className="flex flex-col sm:flex-row gap-4 font-sans">
                            <button className="px-8 py-3.5 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-primary-dark transition-all shadow-lg shadow-primary/30">Partner With Us</button>
                            <button className="px-8 py-3.5 border border-white/30 backdrop-blur-sm text-base font-medium rounded-lg text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"><span className="material-icons text-sm">download</span> Download Media Kit</button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Why Partner */}
            <section className="py-24 bg-background-light dark:bg-background-dark relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Why Partner With Us?</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-300 font-sans">We offer more than just advertising space. We offer a platform to align your brand with the voices shaping the future.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 font-sans">
                        {[{ title: '50k+', sub: 'Monthly Digital Reach', desc: 'Engage with a vast network.', icon: 'groups' }, { title: '85%', sub: 'Executive Audience', desc: 'Decision-makers and C-suite executives.', icon: 'workspace_premium' }, { title: '12+', sub: 'Premium Events', desc: 'Networking breakfasts & galas.', icon: 'event_available' }].map((item, idx) => (
                            <div key={idx} className="bg-white dark:bg-surface-dark p-8 rounded-xl shadow-lg border-t-4 border-primary hover:-translate-y-1 transition-transform">
                                <div className="bg-primary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6"><span className="material-icons text-primary text-3xl">{item.icon}</span></div>
                                <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 font-display">{item.title}</h3>
                                <p className="text-primary font-medium mb-4">{item.sub}</p>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Form */}
            <section className="py-24 bg-white dark:bg-background-dark font-sans">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="bg-slate-50 dark:bg-surface-dark rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
                        <div className="md:w-1/3 bg-background-dark p-10 text-white flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-bold mb-4 font-display">Let's Build Something Together</h3>
                                <p className="text-gray-300 mb-8 text-sm">Fill out the form and our partnerships team will be in touch.</p>
                                <div className="space-y-6 text-sm">
                                    <div className="flex items-center gap-4"><span className="material-icons text-primary">email</span>management.thousandhillsevents@gmail.com</div>
                                    <div className="flex items-center gap-4"><span className="material-icons text-primary">phone</span>0735993326</div>
                                </div>
                            </div>
                        </div>
                        <div className="md:w-2/3 p-10">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 font-display">Inquire for Partnership</h3>
                            <form className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <input type="text" placeholder="First Name" className="rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-primary" />
                                    <input type="text" placeholder="Last Name" className="rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-primary" />
                                </div>
                                <input type="email" placeholder="Work Email" className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-primary" />
                                <textarea rows={4} placeholder="Message" className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-primary"></textarea>
                                <button className="bg-primary text-white font-bold py-3 px-8 rounded-lg">Submit Inquiry</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Partners;