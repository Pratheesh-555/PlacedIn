import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Edit3, Eye, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { GoogleUser, Experience } from '../../types';

interface UserSubmissionsProps {
  user: GoogleUser;
  onEditExperience: (experience: Experience) => void;
  onBackToForm: () => void;
}

interface SubmissionStats {
  count: number;
  canSubmitMore: boolean;
  maxSubmissions: number;
}

const UserSubmissions: React.FC<UserSubmissionsProps> = ({ 
  user, 
  onEditExperience, 
  onBackToForm 
}) => {
  const [submissions, setSubmissions] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionStats, setSubmissionStats] = useState<SubmissionStats | null>(null);

  const fetchUserSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user-experiences/user/${user.googleId}`);
      
      if (!response.ok) throw new Error('Failed to fetch submissions');
      
      const data = await response.json();
      setSubmissions(data.experiences || []);
      setSubmissionStats({
        count: data.submissionCount,
        canSubmitMore: data.canSubmitMore,
        maxSubmissions: data.maxSubmissions
      });
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  }, [user.googleId]);

  useEffect(() => {
    fetchUserSubmissions();
  }, [fetchUserSubmissions]);

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved': return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'rejected': return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      default: return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToForm}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Form</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Submissions
            </h1>
          </div>
          
          {submissionStats && (
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {submissionStats.count} / {submissionStats.maxSubmissions} submissions used
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(submissionStats.count / submissionStats.maxSubmissions) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No submissions yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You haven't shared any experiences yet. Start by sharing your placement or internship story!
            </p>
            <button
              onClick={onBackToForm}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Share Your First Experience
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission: Experience) => (
              <div 
                key={submission._id}
                className={`border rounded-lg p-6 transition-all duration-200 hover:shadow-lg ${getStatusColor(submission.approvalStatus)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {getStatusIcon(submission.approvalStatus)}
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {submission.company}
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-200">
                        {submission.type}
                      </span>
                      {(submission.version && submission.version > 1) && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-700 dark:text-blue-200">
                          v{submission.version}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div>Graduation Year: {submission.graduationYear}</div>
                      <div>Submitted: {submission.createdAt ? new Date(submission.createdAt).toLocaleDateString() : 'Unknown'}</div>
                    </div>

                    {submission.approvalStatus === 'rejected' && submission.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 dark:bg-red-900/20 dark:border-red-800">
                        <div className="flex items-start space-x-2">
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-red-800 dark:text-red-200">
                              Feedback from Admin:
                            </div>
                            <div className="text-sm text-red-700 dark:text-red-300 mt-1">
                              {submission.rejectionReason}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="capitalize">{submission.approvalStatus}</span>
                      {submission.approvalStatus === 'approved' && (
                        <span>• Live on platform</span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    {submission.approvalStatus === 'approved' && (
                      <button className="flex items-center space-x-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:hover:bg-blue-900/20">
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    )}
                    
                    {(submission.approvalStatus === 'rejected' || submission.approvalStatus === 'pending') && (
                      <button 
                        onClick={() => onEditExperience(submission)}
                        className="flex items-center space-x-1 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors dark:hover:bg-green-900/20"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add New Submission Button */}
        {submissionStats?.canSubmitMore && (
          <div className="mt-8 text-center">
            <button
              onClick={onBackToForm}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Share Another Experience
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSubmissions;
