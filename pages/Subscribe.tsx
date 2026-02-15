import React from 'react';
import { PageView } from '../types';

interface SubscribeProps {
  navigate: (page: PageView) => void;
}

const Subscribe: React.FC<SubscribeProps> = ({ navigate }) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row animate-fade-in font-display">
        {/* Left Visual */}
        <div className="lg:w-1/2 relative bg-primary-light dark:bg-slate-900 flex items-center justify-center p-12 lg:p-20 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary rounded-full blur-[120px] mix-blend-multiply filter opacity-40"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-400 rounded-full blur-[120px] mix-blend-multiply filter opacity-40"></div>
            </div>
            
            <div className="relative z-10 w-full max-w-md transform transition-transform duration-700 hover:scale-[1.02]">
                <div className="relative aspect-[3/4] rounded-lg shadow-2xl bg-white overflow-hidden group">
                     <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop" alt="Magazine Cover" className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
                        <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2 text-primary">Volume 12 • October 2023</p>
                        <h2 className="text-4xl font-bold leading-tight mb-2">The Future is Female Led</h2>
                        <p className="text-sm text-gray-200">Exclusive interviews with Rwanda's top tech CEOs.</p>
                     </div>
                </div>
                <div className="mt-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl border border-white/50 shadow-sm">
                    <div className="flex items-center gap-1 text-yellow-500 mb-2">
                        {[1,2,3,4,5].map(i => <span key={i} className="material-icons text-sm">star</span>)}
                    </div>
                    <p className="text-sm italic text-slate-600 dark:text-slate-300">"The definitive source for insights into the region's rapidly growing women-led business ecosystem. Essential reading."</p>
                    <div className="mt-4 flex items-center gap-3">
                        <img src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=100&auto=format&fit=crop" className="w-8 h-8 rounded-full border border-primary object-cover" alt="Sarah K" />
                        <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">Sarah K.</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Tech Entrepreneur, Kigali</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Form */}
        <div className="lg:w-1/2 flex flex-col justify-center px-8 py-20 lg:px-20 bg-background-light dark:bg-background-dark overflow-y-auto">
            <div className="max-w-md mx-auto w-full">
                <header className="mb-10">
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">Subscribe to <span className="text-primary">Excellence.</span></h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">Join a community of visionaries. Select your preferred subscription plan below.</p>
                </header>

                <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="relative group cursor-pointer">
                            <input type="radio" name="plan" value="digital" className="peer sr-only" />
                            <div className="h-full p-5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-all peer-checked:border-slate-900 dark:peer-checked:border-slate-400 hover:border-slate-300">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="material-icons text-slate-400 text-3xl">tablet_mac</span>
                                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 peer-checked:border-primary peer-checked:bg-primary"></div>
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Digital Access</h3>
                                <p className="text-sm text-slate-500 mt-1">PDF & Online Portal</p>
                                <p className="mt-4 font-bold text-xl">$5<span className="text-sm font-normal text-slate-500">/mo</span></p>
                            </div>
                        </label>

                        <label className="relative group cursor-pointer">
                            <input type="radio" name="plan" value="corporate" className="peer sr-only" defaultChecked />
                            <div className="h-full p-5 rounded-xl border-2 border-primary/30 bg-primary/5 dark:bg-primary/10 transition-all peer-checked:border-primary peer-checked:shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">Best Value</div>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="material-icons text-primary text-3xl">business_center</span>
                                    <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-primary/50">
                                        <div className="w-2.5 h-2.5 rounded-full bg-primary block"></div>
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg text-primary">Corporate Print</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Physical Copy + Branding</p>
                                <p className="mt-4 font-bold text-xl text-slate-900 dark:text-white">$45<span className="text-sm font-normal text-slate-500">/mo</span></p>
                            </div>
                        </label>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                            <input type="text" className="block w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary py-3 px-4" placeholder="Jane Doe" />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Work Email</label>
                            <input type="email" className="block w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary py-3 px-4" placeholder="jane@company.com" />
                        </div>
                         <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Company / Organization</label>
                            <input type="text" className="block w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary py-3 px-4" placeholder="Acme Corp" />
                        </div>
                    </div>

                    <button className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform active:scale-[0.98]">
                        COMPLETE SUBSCRIPTION
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-4"><span className="material-icons text-xs align-middle mr-1">lock</span> Secure SSL Encryption. Cancel anytime.</p>
                </form>

                <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Included in Membership</h4>
                    <ul className="space-y-4">
                        {['Exclusive Executive Interviews', 'VIP Event Invitations', 'Business Directory Listing'].map((item) => (
                             <li key={item} className="flex items-start">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5"><span className="material-icons text-primary text-sm font-bold">check</span></div>
                                <div className="ml-3"><p className="text-sm font-semibold text-slate-900 dark:text-white">{item}</p></div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Subscribe;