import React, { useState, useRef, useEffect } from 'react';
import { PageView } from '../types';
import { useAuth } from '../context/AuthContext';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

interface NavbarProps {
  currentPage: string;
}

interface DropdownItem {
  label: string;
  page: PageView;
  id?: string;
  icon?: string;
}

interface DropdownGroup {
  label: string;
  items: DropdownItem[];
}

const categoriesDropdown: DropdownItem[] = [
  { label: 'Leadership', page: 'CATEGORY', id: 'leadership-empowerment', icon: 'emoji_events' },
  { label: 'Business', page: 'CATEGORY', id: 'business-economy', icon: 'trending_up' },
  { label: 'Culture', page: 'CATEGORY', id: 'culture-heritage', icon: 'auto_stories' },
];

const rwibaDropdown: DropdownItem[] = [
  { label: 'Award Nomination', page: 'NOMINATION', icon: 'military_tech' },
  { label: 'Vote Now', page: 'VOTING', icon: 'how_to_vote' },
];

const moreDropdown: DropdownItem[] = [
  { label: 'About Us', page: 'ABOUT', icon: 'info' },
  { label: 'Contact', page: 'CONTACT', icon: 'mail' },
  { label: 'Partners', page: 'PARTNERS', icon: 'handshake' },
  { label: 'Gallery', page: 'ARCHIVE', icon: 'photo_library' },
];

const mobileGroups: DropdownGroup[] = [
  { label: 'Categories', items: categoriesDropdown },
  { label: 'RWIBA Awards', items: rwibaDropdown },
  { label: 'More', items: moreDropdown },
];

/* ─── Desktop Dropdown ─── */
const DesktopDropdown: React.FC<{
  label: string;
  items: DropdownItem[];
  currentPage: string;
}> = ({ label, items, currentPage }) => {
  const [open, setOpen] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const enter = () => { if (timeout.current) clearTimeout(timeout.current); setOpen(true); };
  const leave = () => { timeout.current = setTimeout(() => setOpen(false), 150); };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getUrl = (item: DropdownItem) => {
    switch (item.page) {
      case 'CATEGORY': return `/category/${item.id}`;
      case 'NOMINATION': return '/nomination';
      case 'VOTING': return '/voting';
      case 'ABOUT': return '/about';
      case 'CONTACT': return '/contact';
      case 'PARTNERS': return '/partners';
      case 'ARCHIVE': return '/archive';
      default: return '/';
    }
  };

  const isActive = items.some(
    (i) => currentPage === getUrl(i) || (i.page === 'CATEGORY' && currentPage.startsWith('/category/')),
  );

  return (
    <div ref={ref} className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 hover:text-primary transition-colors ${isActive ? 'text-primary' : ''}`}
      >
        {label}
        <span className={`material-icons text-sm transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {open && (
        <div className="navbar-dropdown">
          {items.map((item) => (
            <Link
              key={item.label}
              to={getUrl(item)}
              onClick={() => setOpen(false)}
              className={`navbar-dropdown-item ${currentPage === getUrl(item) ? 'text-primary' : ''}`}
            >
              {item.icon && <span className="material-icons text-base opacity-60">{item.icon}</span>}
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Mobile Collapsible Section ─── */
const MobileSection: React.FC<{
  group: DropdownGroup;
  onClose: () => void;
  currentPath: string;
}> = ({ group, onClose, currentPath }) => {
  const [expanded, setExpanded] = useState(false);

  const getUrl = (item: DropdownItem) => {
    switch (item.page) {
      case 'CATEGORY': return `/category/${item.id}`;
      case 'NOMINATION': return '/nomination';
      case 'VOTING': return '/voting';
      case 'ABOUT': return '/about';
      case 'CONTACT': return '/contact';
      case 'PARTNERS': return '/partners';
      case 'ARCHIVE': return '/archive';
      default: return '/';
    }
  };

  return (
    <div className="border-b border-gray-100 dark:border-gray-800">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-3 text-xs font-bold uppercase tracking-widest text-gray-400"
      >
        {group.label}
        <span className={`material-icons text-sm transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-96' : 'max-h-0'}`}
      >
        {group.items.map((item) => (
          <Link
            key={item.label}
            to={getUrl(item)}
            onClick={onClose}
            className={`flex items-center gap-3 w-full text-left py-3 pl-2 text-sm font-medium hover:text-primary transition-colors ${currentPath === getUrl(item) ? 'text-primary' : ''}`}
          >
            {item.icon && <span className="material-icons text-lg opacity-50">{item.icon}</span>}
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

/* ─── Main Navbar ─── */
export const Navbar: React.FC<NavbarProps> = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigateHook = useNavigate();
  const currentPath = location.pathname;

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigateHook('/');
  };

  const closeMobile = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md min-h-[64px] lg:min-h-[80px]">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">

          {/* Hamburger Button (mobile) */}
          <button
            className="lg:hidden flex flex-col justify-center items-center w-8 h-8 relative z-[60]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${isMobileMenuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
            <span className={`hamburger-line my-[4px] ${isMobileMenuOpen ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`hamburger-line ${isMobileMenuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={closeMobile}>
            <img
              src="/uploads/logo.png"
              alt="Rwanda Women Magazine"
              className="h-10 sm:h-12 lg:h-14 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold tracking-widest uppercase">
            <NavLink
              to="/"
              className={({ isActive }) => `hover:text-primary transition-colors ${isActive ? 'text-primary' : ''}`}
            >
              Home
            </NavLink>

            <DesktopDropdown label="Categories" items={categoriesDropdown} currentPage={currentPath} />
            <DesktopDropdown label="RWIBA" items={rwibaDropdown} currentPage={currentPath} />

            <NavLink
              to="/events"
              className={({ isActive }) => `hover:text-primary transition-colors ${isActive ? 'text-primary' : ''}`}
            >
              Events
            </NavLink>

            <NavLink
              to="/newsletter"
              className={({ isActive }) => `hover:text-primary transition-colors ${isActive ? 'text-primary' : ''}`}
            >
              Newsletter
            </NavLink>

            <DesktopDropdown label="More" items={moreDropdown} currentPage={currentPath} />

            {isAuthenticated && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `hover:text-primary transition-colors ${isActive ? 'text-primary' : ''}`}
              >
                Dashboard
              </NavLink>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/search" className="text-text-light dark:text-text-dark hover:text-primary transition-colors">
              <span className="material-icons text-xl">search</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-bold text-text-light dark:text-text-dark uppercase">{user?.fullName}</span>
                  <span className="text-[8px] text-gray-500 uppercase tracking-widest">{user?.role}</span>
                </div>
                <button onClick={handleLogout} className="text-gray-400 hover:text-primary transition-colors" title="Logout">
                  <span className="material-icons text-xl">logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/subscribe"
                  className="hidden sm:inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  <span className="material-icons text-sm">subscriptions</span>
                  Subscribe
                </Link>
                <Link
                  to="/login"
                  className="text-gray-400 hover:text-primary transition-colors"
                  title="Login"
                >
                  <span className="material-icons text-xl">admin_panel_settings</span>
                </Link>
              </>
            )}
          </div>
        </div>

      </header>

      {/* ─── Mobile Menu Overlay (Outside Header for correct stacking) ─── */}
      <div
        className={`mobile-menu-backdrop ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeMobile}
      />
      <div className={`mobile-menu-panel ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Mobile Logo */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <img src="/uploads/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
          <div>
            <p className="font-display font-bold text-sm text-text-light dark:text-text-dark">Rwanda Women</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Magazine</p>
          </div>
        </div>

        {/* Mobile Nav Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
          {/* Top-level links */}
          <Link
            to="/"
            onClick={closeMobile}
            className={`flex items-center gap-3 w-full text-left py-3 text-sm font-semibold uppercase tracking-widest hover:text-primary transition-colors ${currentPath === '/' ? 'text-primary' : ''}`}
          >
            <span className="material-icons text-lg opacity-50">home</span>
            Home
          </Link>
          <Link
            to="/events"
            onClick={closeMobile}
            className={`flex items-center gap-3 w-full text-left py-3 text-sm font-semibold uppercase tracking-widest hover:text-primary transition-colors ${currentPath === '/events' ? 'text-primary' : ''}`}
          >
            <span className="material-icons text-lg opacity-50">event</span>
            Events
          </Link>
          <Link
            to="/newsletter"
            onClick={closeMobile}
            className={`flex items-center gap-3 w-full text-left py-3 text-sm font-semibold uppercase tracking-widest hover:text-primary transition-colors border-b border-gray-100 dark:border-gray-800 ${currentPath === '/newsletter' ? 'text-primary' : ''}`}
          >
            <span className="material-icons text-lg opacity-50">newspaper</span>
            Newsletter
          </Link>

          {/* Collapsible groups */}
          {mobileGroups.map((g) => (
            <MobileSection key={g.label} group={g} onClose={closeMobile} currentPath={currentPath} />
          ))}

          {isAuthenticated && (
            <Link
              to="/dashboard"
              onClick={closeMobile}
              className={`flex items-center gap-3 w-full text-left py-3 text-sm font-semibold uppercase tracking-widest hover:text-primary transition-colors mt-2 ${currentPath === '/dashboard' ? 'text-primary' : ''}`}
            >
              <span className="material-icons text-lg opacity-50">dashboard</span>
              Dashboard
            </Link>
          )}
        </div>

        {/* Mobile Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          {isAuthenticated ? (
            <button
              onClick={() => { handleLogout(); closeMobile(); }}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
            >
              <span className="material-icons text-lg">logout</span>
              Sign Out
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                to="/subscribe"
                onClick={closeMobile}
                className="w-full bg-primary text-white py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity text-center"
              >
                Subscribe Now
              </Link>
              <Link
                to="/login"
                onClick={closeMobile}
                className="w-full text-center text-xs text-gray-400 hover:text-primary transition-colors uppercase tracking-wider"
              >
                Editor Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};