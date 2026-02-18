/* eslint-disable */
import React from 'react';
import { PageView } from '../types';

interface ContactProps {
    navigate: (_: PageView) => void;
}

const Contact: React.FC<ContactProps> = () => {
    return (
        <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">Contact the <span className="text-primary">Editorial Team</span></h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">Whether you have a breaking story, a partnership proposal, or just want to say hello, we are here to listen. Help us amplify the voices of women in leadership.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                {/* Left Col */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-10">
                    <div className="space-y-8">
                        {[
                            { title: 'Editorial Department', desc: 'For pitches, op-eds, and press releases.', email: 'management.thousandhillsevents@gmail.com', icon: 'edit_note' },
                            { title: 'Advertising & Partnerships', desc: 'Media kits, sponsorships, and events.', email: 'management.thousandhillsevents@gmail.com', icon: 'campaign' },
                            { title: 'General Inquiries', desc: 'General information and inquiries.', email: 'management.thousandhillsevents@gmail.com', icon: 'contact_support' }
                        ].map((item) => (
                            <div key={item.title} className="group bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 transition-all">
                                <div className="flex items-start gap-5">
                                    <span className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors"><span className="material-icons">{item.icon}</span></span>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{item.desc}</p>
                                        <a href="#" className="text-primary font-medium hover:underline flex items-center gap-1">{item.email} <span className="material-icons text-sm">arrow_outward</span></a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Form */}
                <div className="lg:col-span-7">
                    <div className="bg-white dark:bg-surface-dark p-8 lg:p-10 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send us a message</h2>
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Name</label>
                                    <input type="text" className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Jane Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                    <input type="email" className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="jane@example.com" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                                <select id="subject" title="Subject" className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                    <option>Story Pitch: Leadership</option>
                                    <option>Advertising Inquiry</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                                <textarea className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" rows={5} placeholder="Tell us about your story idea or inquiry..."></textarea>
                            </div>
                            <button className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 px-6 rounded-lg transition duration-300 shadow-lg shadow-primary/30 flex items-center justify-center gap-2 group">
                                Send Message <span className="material-icons group-hover:translate-x-1 transition-transform">send</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Map Placeholder */}
            <section className="mt-20 w-full border-t border-gray-200 dark:border-gray-800 pt-10">
                <div className="relative h-80 lg:h-96 w-full bg-gray-100 dark:bg-gray-900 overflow-hidden rounded-2xl">
                    <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop" alt="Map" className="w-full h-full object-cover filter grayscale contrast-125 opacity-80" />
                    <div className="absolute bottom-6 right-6 bg-white dark:bg-surface-dark px-6 py-4 rounded-lg shadow-xl border-l-4 border-primary">
                        <div className="flex items-start gap-3">
                            <span className="material-icons text-primary mt-1">location_on</span>
                            <div>
                                <h5 className="font-bold text-gray-900 dark:text-white">Visit our Office</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">CHIC Building, Kigali<br />Rwanda</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;