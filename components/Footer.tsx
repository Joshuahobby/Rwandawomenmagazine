import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="bg-background-light dark:bg-background-dark py-12 border-t border-gray-200 dark:border-gray-800 text-xs">
      <div className="container mx-auto px-4">
        {/* Side by side only from lg: at md the 320px brand block plus a
            four-column link grid does not fit the container. */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12">

          <div className="max-w-xs">
            <Link
              to="/"
              className="font-display font-bold text-3xl mb-4 text-blue-900 dark:text-blue-300 cursor-pointer block text-inherit decoration-none"
            >
              Rwanda<span className="text-primary italic">Women</span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
              Rwanda Women Magazine amplifies women-led business and leadership through high-quality editorial content, inspiring the next generation of female leaders.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-12 min-w-0">
            <div className="flex flex-col gap-3">
              <h4 className="font-bold uppercase tracking-widest mb-2">Menu</h4>
              <Link className="text-left text-gray-500 dark:text-gray-400 hover:text-primary decoration-none" to="/">Home</Link>
              <Link className="text-left text-gray-500 dark:text-gray-400 hover:text-primary decoration-none" to="/search">Empowerment</Link>
              <Link className="text-left text-gray-500 dark:text-gray-400 hover:text-primary decoration-none" to="/events">Events</Link>
              <Link className="text-left text-gray-500 dark:text-gray-400 hover:text-primary decoration-none" to="/newsletter">Newsletter</Link>
              <Link className="text-left text-gray-500 dark:text-gray-400 hover:text-primary decoration-none" to="/archive">Gallery</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="font-bold uppercase tracking-widest mb-2">About</h4>
              <Link className="text-left text-gray-500 dark:text-gray-400 hover:text-primary decoration-none" to="/about">Our Story</Link>
              <button className="text-left text-gray-500 dark:text-gray-400 hover:text-primary">Privacy Policy</button>
              <button className="text-left text-gray-500 dark:text-gray-400 hover:text-primary">Terms of Service</button>
              <Link className="text-left text-gray-500 dark:text-gray-400 hover:text-primary decoration-none" to="/contact">FAQ</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="font-bold uppercase tracking-widest mb-2">Contact</h4>
              <p className="text-gray-500 dark:text-gray-400">CHIC Building, Kigali, Rwanda</p>
              {/* Long unbroken address: must be allowed to wrap in a narrow column. */}
              <p className="text-gray-500 dark:text-gray-400 break-words">management.thousandhillsevents@gmail.com</p>
              <p className="text-gray-500 dark:text-gray-400">0735993326</p>
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

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col items-center text-center text-gray-400 gap-4">
          <p>© 2026 Rwanda Women Magazine. All rights reserved. <span className="mx-2">|</span> Developed by <a href="https://getrwanda.rw/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-medium">#TeamGet</a></p>
          <div className="flex gap-4">
            <button className="hover:text-primary">Privacy</button>
            <button className="hover:text-primary">Terms</button>
            <Link className="hover:text-primary decoration-none" to="/login">Editor Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};