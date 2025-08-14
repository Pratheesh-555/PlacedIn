import React, { useState, useEffect, useCallback } from 'react';
import { Edit3, Eye, Clock, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import { GoogleUser, Experience } from '../../types';

interface UserDashboardProps {
  user: GoogleUser | null;
  onEditExperience?: (experience: Experience) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, onEditExperience }) => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUserExperiences = useCallback(async () => {
    if (!user?.googleId) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.EXPERIENCES}/user/${user.googleId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch experiences');
      }

      const data = await response.json();
      setExperiences(data.experiences || []);
    } catch (err) {
      console.error('Error fetching user experiences:', err);
      setError('Failed to load your experiences');
    } finally {
      setLoading(false);
    }
  }, [user?.googleId]);

  useEffect(() => {
    if (user?.googleId) {
      fetchUserExperiences();
    }
  }, [user?.googleId, fetchUserExperiences]);

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'rejected':
        return <XCircle size={20} className="text-red-500" />;
      default:
        return <Clock size={20} className="text-yellow-500" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'rejected':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'Approved & Published';
      case 'rejected':
        return 'Needs Changes';
      default:
        return 'Under Review';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canEdit = (experience: Experience) => {
    return experience.approvalStatus === 'rejected' || experience.approvalStatus === 'pending';
  };

  const canAddNew = () => {
    return experiences.length < 3;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Please Sign In
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need to be signed in to view your submission dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                My Submissions
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your experience submissions and their approval status
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {experiences.length} of 3 submissions used
              </div>
              <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${(experiences.length / 3) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle size={20} className="text-red-500 dark:text-red-400" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}

        {/* Add New Button */}
        {canAddNew() && (
          <div className="mb-6">
            <a
              href="/post"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Plus size={20} />
              <span>Share New Experience</span>
            </a>
          </div>
        )}

        {/* Experiences List */}
        {experiences.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Eye size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Submissions Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You haven't shared any experiences yet. Help your fellow students by sharing your placement or internship journey!
            </p>
            <a
              href="/post"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Plus size={20} />
              <span>Share Your First Experience</span>
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {experiences.map((experience) => (
              <div
                key={experience._id}
                className={`bg-white dark:bg-gray-800 rounded-lg border-2 p-6 transition-all duration-200 ${getStatusColor(experience.approvalStatus)}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(experience.approvalStatus)}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {experience.company} - {experience.type === 'placement' ? 'Placement' : 'Internship'}
                      </h3>
                      {experience.version && experience.version > 1 && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                          v{experience.version}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">{getStatusText(experience.approvalStatus)}</span>
                      {experience.submissionCount && experience.submissionCount > 1 && (
                        <span className="ml-2">• Resubmitted {experience.submissionCount - 1} time(s)</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {canEdit(experience) && (
                      <button
                        onClick={() => onEditExperience?.(experience)}
                        className="flex items-center space-x-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        <Edit3 size={16} />
                        <span>Edit</span>
                      </button>
                    )}
                    {experience.approvalStatus === 'approved' && (
                      <a
                        href="/experiences"
                        className="flex items-center space-x-1 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                      >
                        <Eye size={16} />
                        <span>View Live</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Content Preview */}
                <div className="mb-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <strong>Graduation Year:</strong> {experience.graduationYear} | 
                    <strong className="ml-2">Submitted:</strong> {formatDate(experience.createdAt)}
                  </div>
                  
                  {experience.rounds && experience.rounds.length > 0 ? (
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Rounds covered:</strong> {experience.rounds.map(r => r.name).join(', ')}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {experience.experienceText.substring(0, 150)}
                      {experience.experienceText.length > 150 && '...'}
                    </div>
                  )}
                </div>

                {/* Rejection Reason */}
                {experience.approvalStatus === 'rejected' && experience.rejectionReason && (
                  <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle size={16} className="text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                          Changes Requested:
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-200">
                          {experience.rejectionReason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tips for pending/rejected */}
                {(experience.approvalStatus === 'pending' || experience.approvalStatus === 'rejected') && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      {experience.approvalStatus === 'pending' ? (
                        <>
                          <strong>Under Review:</strong> Your experience is being reviewed by our admin team. 
                          This usually takes 1-2 business days.
                        </>
                      ) : (
                        <>
                          <strong>Action Required:</strong> Please review the feedback above and click "Edit" 
                          to resubmit your experience with the requested changes.
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Usage Limit Warning */}
        {experiences.length >= 3 && (
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  Submission Limit Reached
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                  You've reached the maximum of 3 experience submissions. You can still edit existing submissions 
                  if they need changes.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
