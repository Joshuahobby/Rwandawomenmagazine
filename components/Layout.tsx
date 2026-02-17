import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';


interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar currentPage={currentPage} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;