import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import PopupBanner from './PopupBanner';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage }) => {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar currentPage={currentPage} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      {/* Exclude PopupBanner from the admin panel to avoid visual overlap */}
      {!currentPage.startsWith('/dashboard') && <PopupBanner />}
    </div>
  );
};

export default Layout;