import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './components/Home';
import PostExperience from './components/PostExperience';
import Experiences from './components/Experiences';
import AdminPanel from './components/AdminPanel';
import ExperienceModal from './components/ExperienceModal';
import { Experience } from './types';
import { API_ENDPOINTS } from './config/api';

function App() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
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
        <Navigation user={user} setUser={setUser} />
        
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/post" 
              element={<PostExperience onSuccess={fetchExperiences} />} 
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
              element={<AdminPanel onUpdate={fetchExperiences} />} 
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