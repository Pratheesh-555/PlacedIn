import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './components/Home';
import PostExperience from './components/PostExperience';
import Experiences from './components/Experiences';
import AdminVerification from './components/AdminVerification';
import ExperienceModal from './components/ExperienceModal';
import ProtectedRoute from './components/ProtectedRoute';
import { Experience, GoogleUser } from './types';
import { API_ENDPOINTS } from './config/api';

function App() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<GoogleUser | null>(null);

  useEffect(() => {
    // Check for existing user in localStorage
    const savedUser = localStorage.getItem('googleUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('googleUser');
      }
    }
    
    fetchExperiences();
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

  const openExperienceModal = (experience: Experience) => {
    setSelectedExperience(experience);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedExperience(null);
    setIsModalOpen(false);
  };

  return (
    <Router>
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
                  onExperienceClick={openExperienceModal}
                />
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute user={user} onLogin={handleLogin} onLogout={handleLogout}>
                  <AdminVerification user={user} onUpdate={fetchExperiences} />
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
      </div>
    </Router>
  );
}

export default App;