import React, { useState } from 'react';
import { PageView } from '../types';
import { useAuth } from '../context/AuthContext';


interface NavbarProps {
  navigate: (page: PageView) => void;
  currentPage: PageView;
}

export const Navbar: React.FC<NavbarProps> = ({ navigate, currentPage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const navItems: { label: string; page: PageView; id?: string }[] = [
    { label: 'Home', page: 'HOME' },
    { label: 'Leadership', page: 'CATEGORY', id: 'leadership-empowerment' },
    { label: 'Business', page: 'CATEGORY', id: 'business-economy' },
    { label: 'Culture', page: 'CATEGORY', id: 'culture-heritage' },
    { label: 'Events', page: 'EVENTS' },
    { label: 'Newsletter', page: 'NEWSLETTER' },
  ];

  const handleLogout = () => {
    logout();
    navigate('HOME');
  };

  return (
    <header className="border-b border-gray-300 dark:border-gray-700 sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-text-light dark:text-text-dark"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="material-icons">{isMobileMenuOpen ? 'close' : 'menu'}</span>
        </button>

        {/* Logo */}
        <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate('HOME')}>
          <img
            src="/uploads/logo.png"
            alt="Rwanda Women Magazine"
            className="h-12 lg:h-16 w-auto object-contain"
          />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex gap-8 text-xs font-semibold tracking-widest uppercase">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.page, item.id || null)}
              className={`hover:text-primary transition-colors ${currentPage === item.page ? 'text-primary' : ''}`}
            >
              {item.label}
            </button>
          ))}
          {isAuthenticated && (
            <button
              onClick={() => navigate('DASHBOARD')}
              className={`hover:text-primary transition-colors ${currentPage === 'DASHBOARD' ? 'text-primary' : ''}`}
            >
              Dashboard
            </button>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('SEARCH')} className="text-text-light dark:text-text-dark hover:text-primary">
            <span className="material-icons text-xl">search</span>
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-bold text-text-light dark:text-text-dark uppercase">{user?.fullName}</span>
                <span className="text-[8px] text-gray-500 uppercase tracking-widest">{user?.role.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-primary"
                title="Logout"
              >
                <span className="material-icons text-xl">logout</span>
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate('SUBSCRIBE')}
                className="hidden sm:inline-flex items-center gap-2 bg-primary text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-opacity-90 transition-opacity"
              >
                <span className="material-icons text-sm">subscriptions</span> Subscribe
              </button>
              <button
                onClick={() => navigate('LOGIN')}
                className="text-gray-400 hover:text-primary"
                title="Login"
              >
                <span className="material-icons text-xl">admin_panel_settings</span>
              </button>
            </>
          )}
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col px-4 py-4 space-y-4">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.page, item.id || null);
                  setIsMobileMenuOpen(false);
                }}
                className="text-left text-sm font-semibold tracking-widest uppercase hover:text-primary"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                navigate('SUBSCRIBE');
                setIsMobileMenuOpen(false);
              }}
              className="text-left text-sm font-bold uppercase text-primary"
            >
              Subscribe
            </button>
          </div>
        </div>
      )}
    </header>
  );
};