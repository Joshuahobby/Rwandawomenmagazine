import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PageView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  navigate: (page: PageView) => void;
  currentPage: PageView;
}

const Layout: React.FC<LayoutProps> = ({ children, navigate, currentPage }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar navigate={navigate} currentPage={currentPage} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer navigate={navigate} />
    </div>
  );
};

export default Layout;