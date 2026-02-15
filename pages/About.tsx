import React from 'react';
import { PageView } from '../types';
import { TEAM } from '../constants';

interface AboutProps {
  navigate: (page: PageView) => void;
}

const About: React.FC<AboutProps> = ({ navigate }) => {
  return (
    <div className="animate-fade-in">
        {/* Hero */}
        <header className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
             <div className="absolute inset-0 bg-black/40 z-10"></div>
             <img src="https://images.unsplash.com/photo-1573164574572-cb89e39749b4?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover object-center grayscale contrast-125" alt="Team" />
             <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-4">
                <h1 className="text-5xl md:text-7xl lg:text-8xl text-white font-light italic mb-6 drop-shadow-lg tracking-tight font-display">
                    Amplifying Voices,<br/> <span className="not-italic font-normal">Shaping Futures.</span>
                </h1>
                <p className="text-white/90 text-lg md:text-xl max-w-2xl font-light tracking-wide font-sans">
                    The premier digital platform celebrating the resilience, innovation, and leadership of Rwandan women.
                </p>
             </div>
        </header>

        {/* Mission */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
             <div className="prose prose-lg prose-stone dark:prose-invert mx-auto">
                <p className="text-2xl md:text-3xl leading-relaxed text-gray-800 dark:text-gray-200 font-light font-display first-letter:float-left first-letter:text-7xl first-letter:pr-3 first-letter:font-light first-letter:text-primary">
                    We are dedicated to spotlighting the resilience, innovation, and leadership of Rwandan women. In a rapidly evolving digital landscape, our mission is to create a sanctuary of thought leadership where stories are not just told, but honored. We believe that by amplifying the narratives of women entrepreneurs, artists, and executives, we are not only documenting history but actively shaping the economic and cultural future of our nation. Rwanda Women Magazine stands as a testament to the power of female ambition.
                </p>
                <div className="mt-12 flex justify-center"><span className="block w-24 h-1 bg-primary/30 rounded-full"></span></div>
             </div>
        </section>

        {/* Impact Stats */}
        <section className="py-20 bg-white dark:bg-surface-dark border-y border-primary/10">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                 <div className="mb-16">
                     <span className="text-primary uppercase tracking-[0.2em] text-sm font-semibold">Our Reach</span>
                     <h2 className="text-4xl md:text-5xl mt-3 text-gray-900 dark:text-white font-medium font-display">Impact by the Numbers</h2>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                     {[{ num: '500+', label: 'Stories Told', icon: 'auto_stories' }, { num: '50+', label: 'Business Grants', icon: 'volunteer_activism' }, { num: '10k+', label: 'Monthly Readers', icon: 'groups' }].map((stat, idx) => (
                         <div key={idx} className="p-8 group hover:bg-background-light dark:hover:bg-background-dark rounded-xl transition-all duration-500">
                             <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform"><span className="material-icons text-3xl">{stat.icon}</span></div>
                             <div className="text-6xl font-light text-gray-900 dark:text-white mb-2 font-display">{stat.num}</div>
                             <p className="text-xl text-gray-500 dark:text-gray-400 italic">{stat.label}</p>
                         </div>
                     ))}
                 </div>
             </div>
        </section>

        {/* Team */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                <div>
                     <span className="text-primary uppercase tracking-[0.2em] text-sm font-semibold">Behind the Scenes</span>
                     <h2 className="text-4xl md:text-5xl mt-3 text-gray-900 dark:text-white font-medium font-display">The Editorial Team</h2>
                </div>
                <p className="max-w-md text-gray-600 dark:text-gray-400 text-lg italic text-right md:text-left font-serif">Curating excellence and driving the conversation forward.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {TEAM.map((member) => (
                    <div key={member.name} className="group cursor-pointer">
                        <div className="relative overflow-hidden rounded-lg aspect-[3/4] mb-6 bg-gray-200">
                            <img src={member.image} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300"></div>
                        </div>
                        <h3 className="text-2xl text-gray-900 dark:text-white font-medium group-hover:text-primary transition-colors font-display">{member.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400 italic mt-1 font-serif">{member.role}</p>
                    </div>
                ))}
            </div>
        </section>
    </div>
  );
};

export default About;