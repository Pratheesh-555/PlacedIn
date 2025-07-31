import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ScaleLoader } from 'react-spinners';
import Navigation from './components/Home/Navigation';
import Home from './components/Home/Home';
import PostExperience from './components/Experience/PostExperience';
import Experiences from './components/Experience/Experiences';
import AdminDashboard from './components/Admin/AdminDashboard';
import ExperienceModal from './components/Experience/ExperienceModal';
import ProtectedRoute from './components/ProtectedRoute';
import RatingPopup from './components/Home/RatingPopup';
import PageTracker from './components/PageTracker';
import { Experience, GoogleUser } from './types';
import { API_ENDPOINTS } from './config/api';

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
    
    // Add loading delay for better UX
    const initializeApp = async () => {
      await fetchExperiences();
      // Reduced loading time for faster app startup
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
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

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-3xl">S</span>
            </div>
            <h1 className="text-4xl font-bold text-blue-900 mb-2">SASTRA</h1>
            <p className="text-gray-600 text-lg">Student Portal</p>
          </div>
          <ScaleLoader color="#2563eb" height={40} width={4} radius={2} margin={2} />
          <p className="text-gray-600 mt-6 animate-pulse">Loading your experience portal...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <PageTracker user={user} />
      <div className="min-h-screen bg-gray-50">
        <Navigation user={user} onLogin={handleLogin} onLogout={handleLogout} />
        
        <main className="pt-16">
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
        </main>

        {isModalOpen && selectedExperience && (
          <ExperienceModal 
            experience={selectedExperience} 
            onClose={closeModal} 
          />
        )}

        {/* Rating popup for first-time visitors */}
        <RatingPopup />
      </div>
    </Router>
  );
}

export default App;