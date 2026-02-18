import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { PageView } from './types';

// Lazy Load Pages
const Home = React.lazy(() => import('./pages/Home'));
const Article = React.lazy(() => import('./pages/Article'));
const Search = React.lazy(() => import('./pages/Search'));
const Archive = React.lazy(() => import('./pages/Archive'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Editor = React.lazy(() => import('./pages/Editor'));
const Subscribe = React.lazy(() => import('./pages/Subscribe'));
const Contact = React.lazy(() => import('./pages/Contact'));
const About = React.lazy(() => import('./pages/About'));
const Partners = React.lazy(() => import('./pages/Partners'));
const MemberProfile = React.lazy(() => import('./pages/MemberProfile'));
const Login = React.lazy(() => import('./pages/Login'));
const Events = React.lazy(() => import('./pages/Events'));
const AwardNomination = React.lazy(() => import('./pages/AwardNomination'));
const Newsletter = React.lazy(() => import('./pages/Newsletter'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const Voting = React.lazy(() => import('./pages/Voting'));

export default function App() {
  const navigateHook = useNavigate();
  const location = useLocation();
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const { isAuthenticated, isLoading } = useAuth();


  // Simple scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navigate = (page: PageView, slugOrId?: string | null) => {
    if (slugOrId && page === 'EDITOR') {
      setEditingArticleId(slugOrId);
    }

    switch (page) {
      case 'HOME': navigateHook('/'); break;
      case 'ARTICLE': navigateHook(`/article/${slugOrId}`); break;
      case 'CATEGORY': navigateHook(`/category/${slugOrId}`); break;
      case 'SEARCH': navigateHook('/search'); break;
      case 'EVENTS': navigateHook('/events'); break;
      case 'VOTING': navigateHook('/voting'); break;
      case 'NOMINATION': navigateHook('/nomination'); break;
      case 'LOGIN': navigateHook('/login'); break;
      case 'DASHBOARD': navigateHook('/dashboard'); break;
      case 'EDITOR': navigateHook(`/editor${slugOrId ? `/${slugOrId}` : ''}`); break;
      case 'NEWSLETTER': navigateHook('/newsletter'); break;
      case 'ABOUT': navigateHook('/about'); break;
      case 'CONTACT': navigateHook('/contact'); break;
      case 'SUBSCRIBE': navigateHook('/subscribe'); break;
      case 'PARTNERS': navigateHook('/partners'); break;
      case 'MEMBER_PROFILE': navigateHook('/member-profile'); break;
      case 'ARCHIVE': navigateHook('/archive'); break;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle protected routes (simplified for now, ideally use a ProtectedRoute component)
  const isProtectedPath = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/editor');
  if (isProtectedPath && !isAuthenticated) {
    return <Login navigate={navigate} />;
  }

  // Dashboard and Editor layouts
  if (location.pathname === '/dashboard' && isAuthenticated) {
    return <Dashboard navigate={navigate} />;
  }

  if (location.pathname.startsWith('/editor') && isAuthenticated) {
    // Extract ID from path if possible, or use editingArticleId
    const pathParts = location.pathname.split('/');
    const idFromPath = pathParts.length > 2 ? pathParts[2] : null;
    return <Editor navigate={navigate} articleId={idFromPath || editingArticleId} />;
  }

  if (location.pathname === '/login') {
    return <Login navigate={navigate} />;
  }


  // The rest use the standard public layout
  // The rest use the standard public layout
  return (
    <Layout currentPage={location.pathname}>
      <React.Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/article/:slug" element={<Article />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/search" element={<Search navigate={navigate} />} />
          <Route path="/archive" element={<Archive navigate={navigate} />} />
          <Route path="/subscribe" element={<Subscribe navigate={navigate} />} />
          <Route path="/contact" element={<Contact navigate={navigate} />} />
          <Route path="/about" element={<About navigate={navigate} />} />
          <Route path="/partners" element={<Partners navigate={navigate} />} />
          <Route path="/member-profile" element={<MemberProfile navigate={navigate} />} />
          <Route path="/events" element={<Events navigate={navigate} />} />
          <Route path="/nomination" element={<AwardNomination navigate={navigate} />} />
          <Route path="/newsletter" element={<Newsletter navigate={navigate} />} />
          <Route path="/voting" element={<Voting navigate={navigate} />} />
        </Routes>
      </React.Suspense>
    </Layout>
  );
}