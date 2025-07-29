import React, { useState, useEffect } from 'react';
import { Check, X, Eye } from 'lucide-react';
import { Experience } from '../types';
import { API_ENDPOINTS } from '../config/api';

interface AdminPanelProps {
  onUpdate: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onUpdate }) => {
  const [pendingExperiences, setPendingExperiences] = useState<Experience[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingExperiences();
  }, []);

  const fetchPendingExperiences = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ADMIN}/pending-experiences`);
      const data = await response.json();
      setPendingExperiences(data);
    } catch (error) {
      console.error('Error fetching pending experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ADMIN}/experiences/${id}/approve`, {
        method: 'PUT',
      });
      
      if (response.ok) {
        setPendingExperiences(prev => prev.filter(exp => exp._id !== id));
        onUpdate();
      }
    } catch (error) {
      console.error('Error approving experience:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ADMIN}/experiences/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setPendingExperiences(prev => prev.filter(exp => exp._id !== id));
      }
    } catch (error) {
      console.error('Error rejecting experience:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-4">Admin Panel</h1>
          <p className="text-gray-600">
            Review and moderate pending experience submissions ({pendingExperiences.length} pending)
          </p>
        </div>

        {pendingExperiences.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">All caught up!</h3>
            <p className="text-gray-500">No pending experiences to review at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingExperiences.map((experience) => (
              <div key={experience._id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-blue-900 mb-2">
                      {experience.company}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{experience.studentName}</span>
                      <span>{experience.graduationYear}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        experience.type === 'placement' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {experience.type.charAt(0).toUpperCase() + experience.type.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-600 text-sm line-clamp-4">
                    {experience.experienceText}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedExperience(experience)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye size={16} />
                    <span>View Full</span>
                  </button>
                  
                  <button
                    onClick={() => handleApprove(experience._id!)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check size={16} />
                    <span>Approve</span>
                  </button>
                  
                  <button
                    onClick={() => handleReject(experience._id!)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <X size={16} />
                    <span>Reject</span>
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>Email: {experience.email}</span>
                    <span>
                      {new Date(experience.createdAt || '').toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for viewing full experience */}
        {selectedExperience && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-blue-600 text-white p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedExperience.company}</h2>
                    <div className="flex items-center space-x-4 text-blue-100">
                      <span>{selectedExperience.studentName}</span>
                      <span>{selectedExperience.graduationYear}</span>
                      <span className="capitalize">{selectedExperience.type}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedExperience(null)}
                    className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed mb-6">
                  {selectedExperience.experienceText}
                </div>

                <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleApprove(selectedExperience._id!);
                      setSelectedExperience(null);
                    }}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check size={20} />
                    <span>Approve</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      handleReject(selectedExperience._id!);
                      setSelectedExperience(null);
                    }}
                    className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <X size={20} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;