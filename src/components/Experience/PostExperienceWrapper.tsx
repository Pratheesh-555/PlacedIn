import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PostExperience from './PostExperience_NEW';
import { API_ENDPOINTS } from '../../config/api';
import { GoogleUser, Experience } from '../../types';

interface PostExperienceWrapperProps {
  onSuccess: () => void;
  user: GoogleUser | null;
}

const PostExperienceWrapper: React.FC<PostExperienceWrapperProps> = ({ onSuccess, user }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(false);

  const editId = searchParams.get('edit');

  useEffect(() => {
    const fetchEditingExperience = async () => {
      if (editId && user) {
        setLoading(true);
        try {
          const response = await fetch(`${API_ENDPOINTS.EXPERIENCES}/${editId}`);
          if (response.ok) {
            const experience = await response.json();
            
            // Verify ownership
            if (experience.postedBy?.googleId === user.googleId) {
              setEditingExperience(experience);
            } else {
              console.error('Unauthorized to edit this experience');
              navigate('/dashboard');
            }
          }
        } catch (error) {
          console.error('Error fetching experience for editing:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEditingExperience();
  }, [editId, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading experience for editing...</p>
        </div>
      </div>
    );
  }

  return (
    <PostExperience
      onSuccess={onSuccess}
      user={user}
      editingExperience={editingExperience || undefined}
    />
  );
};

export default PostExperienceWrapper;
