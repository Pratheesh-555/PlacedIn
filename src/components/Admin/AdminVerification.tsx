import React, { useState, useEffect } from 'react';
import { Check, X, Eye, Download, Calendar, User, AlertCircle } from 'lucide-react';
import { Experience, GoogleUser } from '../../types';
import { API_ENDPOINTS } from '../../config/api';

interface AdminVerificationProps {
  user: GoogleUser | null;
  onUpdate: () => void;
}

const AdminVerification: React.FC<AdminVerificationProps> = ({ user, onUpdate }) => {
  const [pendingExperiences, setPendingExperiences] = useState<Experience[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPendingExperiences();
    }
  }, [user]);

  const fetchPendingExperiences = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ADMIN}/pending-experiences`);
      if (response.ok) {
        const data = await response.json();
        setPendingExperiences(data);
      } else {
        console.error('Failed to fetch pending experiences');
      }
    } catch (error) {
      console.error('Error fetching pending experiences:', error);
    } finally {
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
          postedBy: user
        }),
      });
      
      if (response.ok) {
        setPendingExperiences(prev => prev.filter(exp => exp._id !== experience._id));
        onUpdate();
        alert('Experience approved successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to approve: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error approving experience:', error);
      alert('Failed to approve experience');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (experience: Experience) => {
    if (!user || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    setProcessingId(experience._id!);
    try {
      const response = await fetch(`${API_ENDPOINTS.ADMIN}/experiences/${experience._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rejectionReason: rejectionReason.trim(),
          rejectedBy: user
        }),
      });
      
      if (response.ok) {
        setPendingExperiences(prev => prev.filter(exp => exp._id !== experience._id));
        onUpdate();
        setRejectionReason('');
        setShowRejectionModal(false);
        alert('Experience rejected successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to reject: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error rejecting experience:', error);
      alert('Failed to reject experience');
    } finally {
      setProcessingId(null);
    }
  };

  const downloadDocument = (experience: Experience) => {
    const documentUrl = `${API_ENDPOINTS.EXPERIENCES}/${experience._id}/document`;
    window.open(documentUrl, '_blank', 'width=800,height=600,scrollbars=yes,toolbar=no,menubar=no');
  };

  const downloadDocumentFile = (experience: Experience) => {
    const link = document.createElement('a');
    link.href = `${API_ENDPOINTS.EXPERIENCES}/${experience._id}/document`;
    link.download = experience.documentName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <h1 className="text-3xl font-bold text-blue-900 mb-4">Admin Verification Panel</h1>
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
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-blue-900 mb-2">
                      {experience.company}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <User size={14} />
                        <span>{experience.studentName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{experience.graduationYear}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        experience.type === 'placement' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {experience.type.charAt(0).toUpperCase() + experience.type.slice(1)}
                      </span>
                    </div>
                    
                    {experience.postedBy && (
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <img 
                          src={experience.postedBy.picture} 
                          alt={experience.postedBy.name}
                          className="w-4 h-4 rounded-full"
                        />
                        <span>Posted by {experience.postedBy.name}</span>
                        <span>•</span>
                        <span>{new Date(experience.createdAt || '').toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {experience.experienceText}
                  </p>
                </div>

                <div className="flex items-center space-x-3 mb-4">
                  <button
                    onClick={() => downloadDocument(experience)}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    title="View Document"
                  >
                    <Eye size={16} />
                    <span className="text-xs">View PDF</span>
                  </button>
                  
                  <button
                    onClick={() => downloadDocumentFile(experience)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Download Document"
                  >
                    <Download size={16} />
                    <span className="text-xs">Download</span>
                  </button>
                  
                  <button
                    onClick={() => setSelectedExperience(experience)}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <Eye size={16} />
                    <span>View Full</span>
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleApprove(experience)}
                    disabled={processingId === experience._id}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {processingId === experience._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Check size={16} />
                    )}
                    <span>Approve</span>
                  </button>
                  
                  <button
                    onClick={() => setShowRejectionModal(true)}
                    disabled={processingId === experience._id}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <X size={16} />
                    <span>Reject</span>
                  </button>
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
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Experience Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Student:</span>
                      <span className="ml-2">{selectedExperience.studentName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Email:</span>
                      <span className="ml-2">{selectedExperience.email}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Company:</span>
                      <span className="ml-2">{selectedExperience.company}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Graduation Year:</span>
                      <span className="ml-2">{selectedExperience.graduationYear}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Type:</span>
                      <span className="ml-2 capitalize">{selectedExperience.type}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Document:</span>
                      <div className="ml-2 flex items-center space-x-2">
                        <button
                          onClick={() => downloadDocument(selectedExperience)}
                          className="text-blue-600 hover:underline flex items-center space-x-1"
                        >
                          <Eye size={14} />
                          <span>View PDF</span>
                        </button>
                        <button
                          onClick={() => downloadDocumentFile(selectedExperience)}
                          className="text-green-600 hover:underline flex items-center space-x-1"
                        >
                          <Download size={14} />
                          <span>Download</span>
                        </button>
                        <span className="text-gray-500">({selectedExperience.documentName})</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Experience Summary</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedExperience.experienceText}
                    </p>
                  </div>
                </div>

                {selectedExperience.postedBy && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Posted By</h3>
                    <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-4">
                      <img 
                        src={selectedExperience.postedBy.picture} 
                        alt={selectedExperience.postedBy.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{selectedExperience.postedBy.name}</p>
                        <p className="text-sm text-gray-600">{selectedExperience.postedBy.email}</p>
                        <p className="text-xs text-gray-500">
                          Posted on {new Date(selectedExperience.createdAt || '').toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center space-x-2 mb-4">
                <AlertCircle size={24} className="text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900">Reject Experience</h3>
              </div>
              
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejecting this experience submission:
              </p>
              
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                rows={4}
              />
              
              <div className="flex items-center space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowRejectionModal(false);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedExperience) {
                      handleReject(selectedExperience);
                    }
                  }}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVerification; 