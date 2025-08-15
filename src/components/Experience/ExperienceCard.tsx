import React, { useState } from 'react';
import PostExperience from './PostExperience_NEW';
import UserSubmissions from './UserSubmissions';
import { GoogleUser, Experience } from '../../types';

interface ExperienceCardProps {
  user: GoogleUser;
  onSuccess?: () => void;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({ user, onSuccess }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | undefined>(undefined);

  const handleSubmissionSuccess = () => {
    setIsFlipped(true); // Flip to show submissions after successful submission
    if (onSuccess) onSuccess();
  };

  const handleEditExperience = (experience: Experience) => {
    setEditingExperience(experience);
    setIsFlipped(false); // Flip back to form for editing
  };

  const handleViewSubmissions = () => {
    setIsFlipped(true);
  };

  const handleBackToForm = () => {
    setEditingExperience(undefined);
    setIsFlipped(false);
  };

  return (
    <div className="w-full min-h-screen">
      {/* Simple transition between components */}
      <div className={`transition-all duration-700 ease-in-out ${isFlipped ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {!isFlipped && (
          <PostExperience 
            user={user}
            onSuccess={handleSubmissionSuccess}
            editingExperience={editingExperience}
            onViewSubmissions={handleViewSubmissions}
          />
        )}
      </div>

      <div className={`transition-all duration-700 ease-in-out ${!isFlipped ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {isFlipped && (
          <UserSubmissions 
            user={user}
            onEditExperience={handleEditExperience}
            onBackToForm={handleBackToForm}
          />
        )}
      </div>
    </div>
  );
};

export default ExperienceCard;
