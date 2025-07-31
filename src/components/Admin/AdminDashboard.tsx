import React, { useState, useEffect } from 'react';
import { ScaleLoader } from 'react-spinners';
import { Check, Eye, Download, Calendar, User, Building2, AlertCircle, Trash2, Users, BarChart3 } from 'lucide-react';
import { Experience, GoogleUser } from '../../types';
import { API_ENDPOINTS } from '../../config/api';
import RatingsDashboard from './RatingsDashboard';
import AnalyticsDashboard from './AnalyticsDashboard';

interface AdminDashboardProps {
  user: GoogleUser | null;
  onUpdate: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onUpdate }) => {
  const [pendingExperiences, setPendingExperiences] = useState<Experience[]>([]);
  const [approvedExperiences, setApprovedExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'ratings' | 'analytics'>('pending');
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
      // Add minimum loading time for better UX
      setTimeout(() => {
        setLoading(false);
      }, 1000);
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

  const viewDocument = (experience: Experience) => {
    const documentUrl = `${API_ENDPOINTS.ADMIN}/document/${experience._id}`;
    window.open(documentUrl, '_blank', 'width=800,height=600,scrollbars=yes,toolbar=no,menubar=no');
  };

  const downloadDocument = (experience: Experience) => {
    const link = document.createElement('a');
    link.href = `${API_ENDPOINTS.ADMIN}/document/${experience._id}`;
    link.download = experience.documentName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ScaleLoader color="#2563eb" height={35} width={4} radius={2} margin={2} />
          <p className="text-gray-600 mt-4 animate-pulse">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage and review student experiences</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-3xl font-bold text-orange-600">{pendingExperiences.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="text-orange-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Experiences</p>
                <p className="text-3xl font-bold text-green-600">{approvedExperiences.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Pending Approval ({pendingExperiences.length})
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'approved'
                    ? 'bg-green-50 text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Approved Experiences ({approvedExperiences.length})
              </button>
              <button
                onClick={() => setActiveTab('ratings')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'ratings'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <BarChart3 size={16} className="inline-block mr-2" />
                User Ratings
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Eye size={16} className="inline-block mr-2" />
                Site Analytics
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'pending' ? (
              pendingExperiences.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Experiences</h3>
                  <p className="text-gray-600">All experiences have been reviewed.</p>
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
                      onViewDocument={viewDocument}
                      onDownloadDocument={downloadDocument}
                      isProcessing={processingId === experience._id}
                    />
                  ))}
                </div>
              )
            ) : activeTab === 'approved' ? (
              approvedExperiences.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Experiences</h3>
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
                      onViewDocument={viewDocument}
                      onDownloadDocument={downloadDocument}
                      isProcessing={processingId === experience._id}
                    />
                  ))}
                </div>
              )
            ) : activeTab === 'ratings' ? (
              <RatingsDashboard />
            ) : (
              <AnalyticsDashboard />
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
  onViewDocument: (experience: Experience) => void;
  onDownloadDocument: (experience: Experience) => void;
  isProcessing: boolean;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({
  experience,
  isPending,
  onApprove,
  onDelete,
  onViewDocument,
  onDownloadDocument,
  isProcessing
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <User size={20} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">{experience.studentName}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              isPending 
                ? 'bg-orange-100 text-orange-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {isPending ? 'Pending' : 'Approved'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
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
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onViewDocument(experience)}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <Eye size={16} />
            <span>View PDF</span>
          </button>
          
          <button
            onClick={() => onDownloadDocument(experience)}
            className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download size={16} />
            <span>Download</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {isPending && (
            <button
              onClick={() => onApprove(experience)}
              disabled={isProcessing}
              className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Check size={16} />
              <span>Approve</span>
            </button>
          )}
          
          <button
            onClick={() => onDelete(experience)}
            disabled={isProcessing}
            className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
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
