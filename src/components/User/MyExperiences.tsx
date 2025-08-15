import React, { useState, useEffect, useCallback } from 'react';
import { Edit3, Eye, Clock, CheckCircle, XCircle, AlertCircle, Plus, FileText, List } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import { GoogleUser, Experience } from '../../types';
import PostExperience from '../Experience/PostExperience_NEW';

interface MyExperiencesProps {
  user: GoogleUser | null;
}

const MyExperiences: React.FC<MyExperiencesProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'form' | 'submissions'>('submissions');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

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

  const handleEditExperience = (experience: Experience) => {
    setEditingExperience(experience);
    setActiveTab('form');
  };

  const handleFormSuccess = () => {
    // Refresh experiences and switch back to submissions tab
    fetchUserExperiences();
    setEditingExperience(null);
    setActiveTab('submissions');
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'rejected':
        return <XCircle size={20} className="text-red-500" />;
      default:
        return <Clock size={20} className="text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'rejected':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    }
  };

  const getStatusText = (status: string | undefined) => {
    switch (status) {
      case 'approved':
        return 'Approved & Published';
      case 'rejected':
        return 'Needs Changes';
      default:
        return 'Under Review';
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Date not available';
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
            You need to be signed in to view your submissions and share experiences.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                My Experiences
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Share your placement journey and track your submissions
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

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex">
              <button
                onClick={() => {
                  setActiveTab('submissions');
                  setEditingExperience(null);
                }}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                  activeTab === 'submissions'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <List size={18} />
                <span>My Submissions</span>
                {experiences.length > 0 && (
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-xs">
                    {experiences.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('form')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                  activeTab === 'form'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
                disabled={!canAddNew() && !editingExperience}
              >
                <FileText size={18} />
                <span>{editingExperience ? 'Edit Experience' : 'Share Experience'}</span>
                {!canAddNew() && !editingExperience && (
                  <span className="text-xs text-gray-400">(Limit reached)</span>
                )}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[600px]">
            {activeTab === 'submissions' && (
              <div className="p-8">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <AlertCircle size={20} className="text-red-500 dark:text-red-400" />
                      <span className="text-red-700 dark:text-red-300">{error}</span>
                    </div>
                  </div>
                )}

                {loading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6 border">
                          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
                          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : experiences.length === 0 ? (
                  <div className="text-center py-12">
                    <Eye size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      No Submissions Yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      You haven't shared any experiences yet. Help your fellow students by sharing your placement or internship journey!
                    </p>
                    <button
                      onClick={() => setActiveTab('form')}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      <Plus size={20} />
                      <span>Share Your First Experience</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {experiences.map((experience) => (
                      <div
                        key={experience._id}
                        className={`rounded-lg border-2 p-6 transition-all duration-200 ${getStatusColor(experience.approvalStatus)}`}
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
                                onClick={() => handleEditExperience(experience)}
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

                    {/* Usage Limit Warning */}
                    {experiences.length >= 3 && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
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
                )}
              </div>
            )}

            {activeTab === 'form' && (
              <div>
                {!canAddNew() && !editingExperience ? (
                  <div className="p-8 text-center">
                    <AlertCircle size={48} className="mx-auto text-yellow-500 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Submission Limit Reached
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      You've reached the maximum of 3 experience submissions. You can edit existing submissions that need changes.
                    </p>
                    <button
                      onClick={() => setActiveTab('submissions')}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      View My Submissions
                    </button>
                  </div>
                ) : (
                  <PostExperience
                    onSuccess={handleFormSuccess}
                    user={user}
                    editingExperience={editingExperience || undefined}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyExperiences;
