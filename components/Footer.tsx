import React from 'react';
import { PageView } from '../types';

interface FooterProps {
  navigate: (page: PageView) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-background-light dark:bg-background-dark py-12 border-t border-gray-200 dark:border-gray-800 text-xs">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">

          <div className="max-w-xs">
            <div
              className="font-display font-bold text-3xl mb-4 text-blue-900 dark:text-blue-300 cursor-pointer"
              onClick={() => navigate('HOME')}
            >
              Rwanda<span className="text-primary italic">Women</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
              Rwanda Women Magazine amplifies women-led business and leadership through high-quality editorial content, inspiring the next generation of female leaders.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 md:gap-16">
            <div className="flex flex-col gap-3">
              <h4 className="font-bold uppercase tracking-widest mb-2">Menu</h4>
              <button className="text-left text-gray-500 dark:text-gray-400 hover:text-primary" onClick={() => navigate('HOME')}>Home</button>
              <button className="text-left text-gray-500 dark:text-gray-400 hover:text-primary" onClick={() => navigate('SEARCH')}>Empowerment</button>
              <button className="text-left text-gray-500 dark:text-gray-400 hover:text-primary" onClick={() => navigate('EVENTS')}>Events</button>
              <button className="text-left text-gray-500 dark:text-gray-400 hover:text-primary" onClick={() => navigate('NEWSLETTER')}>Newsletter</button>
              <button className="text-left text-gray-500 dark:text-gray-400 hover:text-primary" onClick={() => navigate('ARCHIVE')}>Gallery</button>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="font-bold uppercase tracking-widest mb-2">About</h4>
              <button className="text-left text-gray-500 dark:text-gray-400 hover:text-primary" onClick={() => navigate('ABOUT')}>Our Story</button>
              <button className="text-left text-gray-500 dark:text-gray-400 hover:text-primary">Privacy Policy</button>
              <button className="text-left text-gray-500 dark:text-gray-400 hover:text-primary">Terms of Service</button>
              <button className="text-left text-gray-500 dark:text-gray-400 hover:text-primary" onClick={() => navigate('CONTACT')}>FAQ</button>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="font-bold uppercase tracking-widest mb-2">Contact</h4>
              <p className="text-gray-500 dark:text-gray-400">Kigali, Rwanda</p>
              <p className="text-gray-500 dark:text-gray-400">info@rwandawomen.com</p>
              <p className="text-gray-500 dark:text-gray-400">+250 788 000 000</p>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="font-bold uppercase tracking-widest mb-2">Follow</h4>
              <a className="text-gray-500 dark:text-gray-400 hover:text-primary" href="#">Instagram</a>
              <a className="text-gray-500 dark:text-gray-400 hover:text-primary" href="#">Twitter</a>
              <a className="text-gray-500 dark:text-gray-400 hover:text-primary" href="#">Facebook</a>
              <a className="text-gray-500 dark:text-gray-400 hover:text-primary" href="#">LinkedIn</a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center text-gray-400">
          <p>© 2023 Rwanda Women Magazine. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <button className="hover:text-primary">Privacy</button>
            <button className="hover:text-primary">Terms</button>
            <button className="hover:text-primary" onClick={() => navigate('DASHBOARD')}>Editor Login</button>
          </div>
        </div>
      </div>
    </footer>
  );
};