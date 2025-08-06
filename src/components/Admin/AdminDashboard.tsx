import React, { useState, useEffect } from 'react';
import { Check, Eye, Calendar, User, Building2, AlertCircle, Trash2, Users, Bell } from 'lucide-react';
import { Experience, GoogleUser } from '../../types';
import { API_ENDPOINTS } from '../../config/api';
import NotificationManager from './NotificationManager';

interface AdminDashboardProps {
  user: GoogleUser | null;
  onUpdate: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onUpdate }) => {
  const [pendingExperiences, setPendingExperiences] = useState<Experience[]>([]);
  const [approvedExperiences, setApprovedExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'notifications'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchExperiences();
    }
  }, [user]);

  const fetchExperiences = async () => {
    try {
      const [pendingResponse, approvedResponse] = await Promise.all([
        fetch(`${API_ENDPOINTS.ADMIN}/pending-experiences`),
        fetch(`${API_ENDPOINTS.ADMIN}/experiences`)
      ]);

      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingExperiences(pendingData);
      }

      if (approvedResponse.ok) {
        const allData = await approvedResponse.json();
        setApprovedExperiences(allData.filter((exp: Experience) => exp.isApproved));
      }
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      // Remove artificial loading delay for faster response
      setLoading(false);
    }
  };

  const handleApprove = async (experience: Experience) => {
    if (!user) return;
    
    setProcessingId(experience._id!);
    try {
      const response = await fetch(`${API_ENDPOINTS.ADMIN}/experiences/${experience._id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postedBy: {
            googleId: user.googleId,
            name: user.name,
            email: user.email,
            picture: user.picture
          }
        })
      });
      
      if (response.ok) {
        setPendingExperiences(prev => prev.filter(exp => exp._id !== experience._id));
        fetchExperiences(); // Refresh to get updated approved list
        onUpdate();
      }
    } catch (error) {
      console.error('Error approving experience:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (experience: Experience) => {
    if (!confirm(`Are you sure you want to delete this experience by ${experience.studentName}?`)) {
      return;
    }

    setProcessingId(experience._id!);
    try {
      const response = await fetch(`${API_ENDPOINTS.ADMIN}/experiences/${experience._id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        if (experience.isApproved) {
          setApprovedExperiences(prev => prev.filter(exp => exp._id !== experience._id));
        } else {
          setPendingExperiences(prev => prev.filter(exp => exp._id !== experience._id));
        }
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const viewExperienceText = (experience: Experience) => {
    // Create a modal to display the experience text
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
    const isDark = document.documentElement.classList.contains('dark');
    modal.innerHTML = `
      <div class="${isDark ? 'bg-gray-800 text-gray-100' : 'bg-white'} rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div class="flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}">
          <h2 class="text-xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}">Experience by ${experience.studentName}</h2>
          <button onclick="this.closest('.fixed').remove()" class="${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="p-6 overflow-y-auto max-h-[70vh]">
          <div class="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong>Company:</strong> ${experience.company}</div>
            <div><strong>Graduation Year:</strong> ${experience.graduationYear}</div>
            <div><strong>Type:</strong> ${experience.type}</div>
            <div><strong>Email:</strong> ${experience.email}</div>
          </div>
          <div class="border-t ${isDark ? 'border-gray-700' : ''} pt-4">
            <h3 class="font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-3">Experience Content:</h3>
            <div class="prose max-w-none ${isDark ? 'text-gray-200' : 'text-gray-700'} whitespace-pre-wrap">${experience.experienceText || 'No experience text available'}</div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 animate-pulse">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-300 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage and review student experiences</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending Approval</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{pendingExperiences.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <AlertCircle className="text-orange-600 dark:text-orange-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Approved Experiences</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{approvedExperiences.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Users className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Pending Approval ({pendingExperiences.length})
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'approved'
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Approved Experiences ({approvedExperiences.length})
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Bell size={16} className="inline-block mr-2" />
                Notifications
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'pending' ? (
              pendingExperiences.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Pending Experiences</h3>
                  <p className="text-gray-600 dark:text-gray-300">All experiences have been reviewed.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {pendingExperiences.map((experience) => (
                    <ExperienceCard
                      key={experience._id}
                      experience={experience}
                      isPending={true}
                      onApprove={handleApprove}
                      onDelete={handleDelete}
                      onViewExperience={viewExperienceText}
                      isProcessing={processingId === experience._id}
                    />
                  ))}
                </div>
              )
            ) : activeTab === 'approved' ? (
              approvedExperiences.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Approved Experiences</h3>
                  <p className="text-gray-600">No experiences have been approved yet.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {approvedExperiences.map((experience) => (
                    <ExperienceCard
                      key={experience._id}
                      experience={experience}
                      isPending={false}
                      onApprove={handleApprove}
                      onDelete={handleDelete}
                      onViewExperience={viewExperienceText}
                      isProcessing={processingId === experience._id}
                    />
                  ))}
                </div>
              )
            ) : (
              <NotificationManager />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ExperienceCardProps {
  experience: Experience;
  isPending: boolean;
  onApprove: (experience: Experience) => void;
  onDelete: (experience: Experience) => void;
  onViewExperience: (experience: Experience) => void;
  isProcessing: boolean;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({
  experience,
  isPending,
  onApprove,
  onDelete,
  onViewExperience,
  isProcessing
}) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <User size={20} className="text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{experience.studentName}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              isPending 
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' 
                : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
            }`}>
              {isPending ? 'Pending' : 'Approved'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
            <div className="flex items-center space-x-2">
              <Building2 size={16} />
              <span>{experience.company}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar size={16} />
              <span>{experience.graduationYear}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="capitalize font-medium">{experience.type}</span>
            </div>
          </div>

          {/* Experience Preview */}
          {experience.experienceText && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Experience Preview:</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                {experience.experienceText.length > 150 
                  ? `${experience.experienceText.substring(0, 150)}...` 
                  : experience.experienceText}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onViewExperience(experience)}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            <Eye size={16} />
            <span>View Full Experience</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {isPending && (
            <button
              onClick={() => onApprove(experience)}
              disabled={isProcessing}
              className="flex items-center space-x-1 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              <Check size={16} />
              <span>Approve</span>
            </button>
          )}
          
          <button
            onClick={() => onDelete(experience)}
            disabled={isProcessing}
            className="flex items-center space-x-1 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
