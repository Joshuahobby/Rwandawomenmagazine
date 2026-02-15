import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Article from './pages/Article';
import Search from './pages/Search';
import Archive from './pages/Archive';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Subscribe from './pages/Subscribe';
import Contact from './pages/Contact';
import About from './pages/About';
import Partners from './pages/Partners';
import MemberProfile from './pages/MemberProfile';
import Login from './pages/Login';
import Events from './pages/Events';
import AwardNomination from './pages/AwardNomination';
import Newsletter from './pages/Newsletter';
import CategoryPage from './pages/CategoryPage';
import Voting from './pages/Voting';
import { PageView } from './types';
import { useAuth } from './context/AuthContext';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('HOME');
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const { isAuthenticated, isLoading } = useAuth();


  // Simple scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const navigate = (page: PageView, id?: string | null) => {
    if (id) {
      setEditingArticleId(id);
    } else if (page !== 'EDITOR') {
      setEditingArticleId(null);
    }
    setCurrentPage(page);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle protected routes
  if ((currentPage === 'DASHBOARD' || currentPage === 'EDITOR') && !isAuthenticated) {
    return <Login navigate={navigate} />;
  }

  if (currentPage === 'LOGIN') {
    return <Login navigate={navigate} />;
  }

  // Editor and Dashboard typically don't share the main public layout in full
  if (currentPage === 'DASHBOARD' && isAuthenticated) {
    return <Dashboard navigate={navigate} />;
  }

  if (currentPage === 'EDITOR' && isAuthenticated) {
    return <Editor navigate={navigate} articleId={editingArticleId} />;
  }


  // The rest use the standard public layout
  return (
    <Layout navigate={navigate} currentPage={currentPage}>
      {currentPage === 'HOME' && <Home navigate={navigate} />}
      {currentPage === 'ARTICLE' && <Article navigate={navigate} articleId={editingArticleId} />}
      {currentPage === 'SEARCH' && <Search navigate={navigate} />}
      {currentPage === 'ARCHIVE' && <Archive navigate={navigate} />}
      {currentPage === 'SUBSCRIBE' && <Subscribe navigate={navigate} />}
      {currentPage === 'CONTACT' && <Contact navigate={navigate} />}
      {currentPage === 'ABOUT' && <About navigate={navigate} />}
      {currentPage === 'PARTNERS' && <Partners navigate={navigate} />}
      {currentPage === 'MEMBER_PROFILE' && <MemberProfile navigate={navigate} />}
      {currentPage === 'EVENTS' && <Events navigate={navigate} />}
      {currentPage === 'NOMINATION' && <AwardNomination navigate={navigate} />}
      {currentPage === 'NEWSLETTER' && <Newsletter navigate={navigate} />}
      {currentPage === 'CATEGORY' && <CategoryPage navigate={navigate} categorySlug={editingArticleId} />}
      {currentPage === 'VOTING' && <Voting navigate={navigate} />}
    </Layout>
  );
}