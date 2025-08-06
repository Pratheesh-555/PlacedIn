import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Home/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import { ThemeProvider } from './contexts/ThemeContext';
import { Experience, GoogleUser } from './types';
import { PropagateLoader } from 'react-spinners';

// Lazy load components for better performance
const Home = lazy(() => import('./components/Home/Home'));
const PostExperience = lazy(() => import('./components/Experience/PostExperience_NEW'));
const Experiences = lazy(() => import('./components/Experience/Experiences'));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const ExperienceModal = lazy(() => import('./components/Experience/ExperienceModal'));

function App() {
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore user from localStorage to persist login across refreshes
    const savedUser = localStorage.getItem('googleUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('googleUser');
      }
    }
    
    // Show nice loading screen for 1.5 seconds for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const fetchExperiences = async () => {
    // This function is kept for PostExperience component compatibility
    // Individual components now fetch their own data
    console.log('Experience added successfully');
  };

  const handleLogin = (user: GoogleUser) => {
    setUser(user);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const closeModal = () => {
    setSelectedExperience(null);
    setIsModalOpen(false);
  };

  // Show loading screen with PropagateLoader
  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center transition-colors duration-300">
          <div className="text-center">
            <div className="mb-8">
              <PropagateLoader 
                color="#2563eb" 
                size={15}
                speedMultiplier={1.2}
              />
            </div>
            
            <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-3">PlacedIn</h2>
            <p className="text-blue-700 dark:text-blue-300 font-medium text-lg">Loading your experience hub...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <Navigation user={user} onLogin={handleLogin} onLogout={handleLogout} />
          
          <main className="pt-16">
            <Suspense fallback={
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route 
                  path="/post" 
                  element={
                    <ProtectedRoute user={user} onLogin={handleLogin} onLogout={handleLogout}>
                      <PostExperience onSuccess={fetchExperiences} user={user} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/experiences" 
                  element={<Experiences />} 
                />
                <Route 
                  path="/admin" 
                  element={
                    <AdminProtectedRoute user={user} onLogin={handleLogin} onLogout={handleLogout}>
                      <AdminDashboard user={user} onUpdate={fetchExperiences} />
                    </AdminProtectedRoute>
                  } 
                />
              </Routes>
            </Suspense>
          </main>

          {isModalOpen && selectedExperience && (
            <Suspense fallback={<div>Loading...</div>}>
              <ExperienceModal 
                experience={selectedExperience} 
                onClose={closeModal} 
              />
            </Suspense>
          )}
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;