import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import StoriesPage from './pages/StoriesPage';
import StoryDetailPage from './pages/StoryDetailPage';
import AboutPage from './pages/AboutPage';
import AuthPage from './pages/AuthPage';
import AdminStoriesPage from './pages/AdminStoriesPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import { useEffect } from 'react';

function ScrollToTop() {

  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/story/:slug" element={<StoryDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/admin" element={<AdminStoriesPage />} />
          <Route path="/admin/stories" element={<AdminStoriesPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <AnimatedRoutes />
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
