import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Home/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import { Experience, GoogleUser } from './types';
import { API_ENDPOINTS } from './config/api';

// Lazy load components for better performance
const Home = lazy(() => import('./components/Home/Home'));
const PostExperience = lazy(() => import('./components/Experience/PostExperience'));
const Experiences = lazy(() => import('./components/Experience/Experiences'));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const ExperienceModal = lazy(() => import('./components/Experience/ExperienceModal'));

function App() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
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
    
    // Remove artificial loading delay for faster startup
    const initializeApp = async () => {
      await fetchExperiences();
      // Set loading to false immediately after fetching
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  const fetchExperiences = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.EXPERIENCES);
      const data = await response.json();
      setExperiences(data);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    }
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

  // Show loading screen with custom loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-blue-900 font-semibold">Loading PlacedIn...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation user={user} onLogin={handleLogin} onLogout={handleLogout} />
        
        <main className="pt-16">
          <Suspense fallback={
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                element={
                  <Experiences 
                    experiences={experiences}
                  />
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute user={user} onLogin={handleLogin} onLogout={handleLogout}>
                    <AdminDashboard user={user} onUpdate={fetchExperiences} />
                  </ProtectedRoute>
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
  );
}

export default App;