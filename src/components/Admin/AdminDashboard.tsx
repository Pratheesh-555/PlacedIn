import React, { useState, useEffect } from 'react';
import { Check, Eye, Calendar, User, Building2, AlertCircle, Trash2, Users, Search, Filter, X, CheckSquare, Square, Shield, Megaphone } from 'lucide-react';
import { Experience, GoogleUser } from '../../types';
import { API_ENDPOINTS } from '../../config/api';
import { formatMarkdown } from '../../utils/textFormatting';
import ExperienceModal from '../Experience/ExperienceModal';
import AdminManagement from './AdminManagement';
import UpdateManagement from './UpdateManagement';
import ADMIN_CONFIG from '../../config/adminConfig';

interface AdminDashboardProps {
  user: GoogleUser | null;
  onUpdate: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onUpdate }) => {
  const [pendingExperiences, setPendingExperiences] = useState<Experience[]>([]);
  const [approvedExperiences, setApprovedExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'manage-admins' | 'updates'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Check if user is super admin
  const isSuperAdmin = ADMIN_CONFIG.isSuperAdmin(user?.email || '');
  
  // Check if user is any admin
  const isAdmin = ADMIN_CONFIG.isAdminEmail(user?.email || '');
  
  // Experience modal state
  const [viewingExperience, setViewingExperience] = useState<Experience | null>(null);
  
  // Rejection modal state
  const [rejectingExperience, setRejectingExperience] = useState<Experience | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [companyFilter, setCompanyFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Bulk operation states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchExperiences();
    }
  }, [user]);

  // Filter experiences based on search and filter criteria
  const filterExperiences = (experiences: Experience[]) => {
    return experiences.filter(experience => {
      const matchesSearch = searchTerm === '' || 
        experience.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        experience.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        experience.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCompany = companyFilter === '' || experience.company === companyFilter;
      const matchesYear = yearFilter === '' || experience.graduationYear.toString() === yearFilter;
      const matchesType = typeFilter === '' || experience.type === typeFilter;
      
      return matchesSearch && matchesCompany && matchesYear && matchesType;
    });
  };

  // Get unique filter options
  const getFilterOptions = (experiences: Experience[]) => {
    const companies = [...new Set(experiences.map(exp => exp.company))].sort();
    const years = [...new Set(experiences.map(exp => exp.graduationYear.toString()))].sort();
    const types = [...new Set(experiences.map(exp => exp.type))];
    return { companies, years, types };
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setCompanyFilter('');
    setYearFilter('');
    setTypeFilter('');
    setSelectedIds(new Set());
  };

  // Bulk operations
  const handleSelectAll = (experiences: Experience[]) => {
    const allIds = new Set(experiences.map(exp => exp._id!));
    setSelectedIds(selectedIds.size === experiences.length ? new Set() : allIds);
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0 || !user) return;
    
    const confirmMessage = `Are you sure you want to approve ${selectedIds.size} experience(s)?`;
    if (!confirm(confirmMessage)) return;

    setBulkProcessing(true);
    try {
      const promises = Array.from(selectedIds).map(id => 
        fetch(`${API_ENDPOINTS.ADMIN}/experiences/${id}/approve`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postedBy: {
              googleId: user.googleId,
              name: user.name,
              email: user.email,
              picture: user.picture
            }
          })
        })
      );
      
      await Promise.all(promises);
      await fetchExperiences();
      setSelectedIds(new Set());
      onUpdate();
    } catch {
      // Handle bulk approval error
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    const confirmMessage = `Are you sure you want to delete ${selectedIds.size} experience(s)? This action cannot be undone.`;
    if (!confirm(confirmMessage)) return;

    setBulkProcessing(true);
    try {
      const promises = Array.from(selectedIds).map(id => 
        fetch(`${API_ENDPOINTS.ADMIN}/experiences/${id}`, {
          method: 'DELETE'
        })
      );
      
      await Promise.all(promises);
      await fetchExperiences();
      setSelectedIds(new Set());
      onUpdate();
    } catch {
      // Handle bulk delete error
    } finally {
      setBulkProcessing(false);
    }
  };

  const fetchExperiences = async () => {
    try {
      // Mobile-friendly fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for admin

      const [pendingResponse, approvedResponse] = await Promise.all([
        fetch(`${API_ENDPOINTS.ADMIN}/pending-experiences`, {
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        }),
        fetch(`${API_ENDPOINTS.ADMIN}/experiences?limit=200`, {
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        })
      ]);

      clearTimeout(timeoutId);

      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingExperiences(pendingData);
      }

      if (approvedResponse.ok) {
        const allData = await approvedResponse.json();
        // Handle new API response format with pagination
        const allExperiences = allData.experiences || allData; // Support both formats
        const approved = allExperiences.filter((exp: Experience) => exp.isApproved === true);
        setApprovedExperiences(approved);
      }
    } catch {
      // Handle fetch error silently
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
    } catch {
      // Handle approval error
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
    } catch {
      // Handle delete error
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (experience: Experience, reason: string) => {
    setProcessingId(experience._id!);
    try {
      const response = await fetch(`${API_ENDPOINTS.ADMIN}/experiences/${experience._id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rejectionReason: reason.trim()
        }),
      });
      
      if (response.ok) {
        // Remove from pending list as it's now rejected
        setPendingExperiences(prev => prev.filter(exp => exp._id !== experience._id));
        setRejectingExperience(null);
        setRejectionReason('');
        onUpdate();
      }
    } catch {
      // Handle rejection error
    } finally {
      setProcessingId(null);
    }
  };

  const viewExperienceText = (experience: Experience) => {
    setViewingExperience(experience);
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

        {/* Search and Filter Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  id="adminSearch"
                  name="adminSearch"
                  type="text"
                  placeholder="Search by name, company, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  showFilters 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Filter size={20} />
                <span>Filters</span>
              </button>

              {(searchTerm || companyFilter || yearFilter || typeFilter) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-2 px-4 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  <X size={20} />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="adminCompanyFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company</label>
                  <select
                    id="adminCompanyFilter"
                    name="adminCompanyFilter"
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">All Companies</option>
                    {getFilterOptions([...pendingExperiences, ...approvedExperiences]).companies.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="adminYearFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Graduation Year</label>
                  <select
                    id="adminYearFilter"
                    name="adminYearFilter"
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">All Years</option>
                    {getFilterOptions([...pendingExperiences, ...approvedExperiences]).years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="adminTypeFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                  <select
                    id="adminTypeFilter"
                    name="adminTypeFilter"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">All Types</option>
                    {getFilterOptions([...pendingExperiences, ...approvedExperiences]).types.map(type => (
                      <option key={type} value={type} className="capitalize">{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
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
                onClick={() => setActiveTab('updates')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors flex items-center justify-center space-x-2 ${
                  activeTab === 'updates'
                    ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Megaphone size={18} />
                <span>Updates</span>
              </button>
              {isSuperAdmin && (
                <button
                  onClick={() => setActiveTab('manage-admins')}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-colors flex items-center justify-center space-x-2 ${
                    activeTab === 'manage-admins'
                      ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Shield size={18} />
                  <span>Manage Admins</span>
                </button>
              )}
            </nav>
          </div>

          <div className="p-6">
            <>
              {/* Bulk Operations Controls */}
                {selectedIds.size > 0 && (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          {selectedIds.size} item(s) selected
                        </span>
                        <button
                          onClick={() => setSelectedIds(new Set())}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
                        >
                          Clear selection
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {activeTab === 'pending' && (
                          <button
                            onClick={handleBulkApprove}
                            disabled={bulkProcessing}
                            className="flex items-center space-x-1 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 transition-colors"
                          >
                            <Check size={16} />
                            <span>Approve Selected</span>
                          </button>
                        )}
                        
                        <button
                          onClick={handleBulkDelete}
                          disabled={bulkProcessing}
                          className="flex items-center space-x-1 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 transition-colors"
                        >
                          <Trash2 size={16} />
                          <span>Delete Selected</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>

            {activeTab === 'pending' ? (
              (() => {
                const filteredPending = filterExperiences(pendingExperiences);
                return filteredPending.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {pendingExperiences.length === 0 ? 'No Pending Experiences' : 'No Matching Results'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {pendingExperiences.length === 0 
                        ? 'All experiences have been reviewed.' 
                        : 'Try adjusting your search or filter criteria.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Select All Checkbox */}
                    <div className="flex items-center space-x-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleSelectAll(filteredPending)}
                        className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                      >
                        {selectedIds.size === filteredPending.length && filteredPending.length > 0 ? (
                          <CheckSquare size={16} className="text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Square size={16} />
                        )}
                        <span>Select All ({filteredPending.length})</span>
                      </button>
                      
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {filteredPending.length} of {pendingExperiences.length} experiences
                      </span>
                    </div>

                    <div className="grid gap-6">
                      {filteredPending.map((experience) => (
                        <ExperienceCard
                          key={experience._id}
                          experience={experience}
                          isPending={true}
                          onApprove={handleApprove}
                          onReject={(exp) => setRejectingExperience(exp)}
                          onDelete={handleDelete}
                          onViewExperience={viewExperienceText}
                          isProcessing={processingId === experience._id}
                          isSelected={selectedIds.has(experience._id!)}
                          onSelect={handleSelectOne}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()
            ) : activeTab === 'approved' ? (
              (() => {
                const filteredApproved = filterExperiences(approvedExperiences);
                return filteredApproved.length === 0 ? (
                  <div className="text-center py-12">
                    <Users size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {approvedExperiences.length === 0 ? 'No Approved Experiences' : 'No Matching Results'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {approvedExperiences.length === 0 
                        ? 'No experiences have been approved yet.' 
                        : 'Try adjusting your search or filter criteria.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Select All Checkbox */}
                    <div className="flex items-center space-x-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleSelectAll(filteredApproved)}
                        className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                      >
                        {selectedIds.size === filteredApproved.length && filteredApproved.length > 0 ? (
                          <CheckSquare size={16} className="text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Square size={16} />
                        )}
                        <span>Select All ({filteredApproved.length})</span>
                      </button>
                      
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {filteredApproved.length} of {approvedExperiences.length} experiences
                      </span>
                    </div>

                    <div className="grid gap-6">
                      {filteredApproved.map((experience) => (
                        <ExperienceCard
                          key={experience._id}
                          experience={experience}
                          isPending={false}
                          onApprove={handleApprove}
                          onReject={() => {}} // No reject for approved experiences
                          onDelete={handleDelete}
                          onViewExperience={viewExperienceText}
                          isProcessing={processingId === experience._id}
                          isSelected={selectedIds.has(experience._id!)}
                          onSelect={handleSelectOne}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()
            ) : activeTab === 'manage-admins' ? (
              // Admin Management Tab (Super Admin Only)
              user ? <AdminManagement currentUser={user} /> : null
            ) : activeTab === 'updates' ? (
              // Updates Management Tab (All Admins)
              user && isAdmin ? <UpdateManagement currentUser={user} /> : null
            ) : null}
          </div>
        </div>
      </div>

      {/* Experience Modal */}
      {viewingExperience && (
        <ExperienceModal
          experience={viewingExperience}
          onClose={() => setViewingExperience(null)}
        />
      )}

      {/* Rejection Modal */}
      {rejectingExperience && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Reject Experience
                </h3>
                <button
                  onClick={() => {
                    setRejectingExperience(null);
                    setRejectionReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  You are rejecting the experience by <strong>{rejectingExperience.studentName}</strong> at <strong>{rejectingExperience.company}</strong>.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please provide a reason for rejection. The student will be able to see this feedback and resubmit their experience.
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please explain why this experience is being rejected and what needs to be improved..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setRejectingExperience(null);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (rejectionReason.trim()) {
                      handleReject(rejectingExperience, rejectionReason);
                    }
                  }}
                  disabled={!rejectionReason.trim() || processingId === rejectingExperience._id}
                  className="px-4 py-2 bg-orange-600 dark:bg-orange-700 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  {processingId === rejectingExperience._id ? 'Rejecting...' : 'Reject Experience'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ExperienceCardProps {
  experience: Experience;
  isPending: boolean;
  onApprove: (experience: Experience) => void;
  onReject: (experience: Experience) => void;
  onDelete: (experience: Experience) => void;
  onViewExperience: (experience: Experience) => void;
  isProcessing: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({
  experience,
  isPending,
  onApprove,
  onReject,
  onDelete,
  onViewExperience,
  isProcessing,
  isSelected = false,
  onSelect
}) => {
  return (
    <div className={`border rounded-lg p-6 hover:shadow-md transition-all ${
      isSelected 
        ? 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          {/* Selection Checkbox */}
          {onSelect && (
            <button
              onClick={() => onSelect(experience._id!)}
              className="mt-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              {isSelected ? (
                <CheckSquare size={20} className="text-blue-600 dark:text-blue-400" />
              ) : (
                <Square size={20} className="text-gray-400 dark:text-gray-500" />
              )}
            </button>
          )}
          
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
                <div 
                  className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3"
                  dangerouslySetInnerHTML={{
                    __html: formatMarkdown(
                      experience.experienceText.length > 150 
                        ? `${experience.experienceText.substring(0, 150)}...` 
                        : experience.experienceText
                    )
                  }}
                />
              </div>
            )}
          </div>
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
            <>
              <button
                onClick={() => onApprove(experience)}
                disabled={isProcessing}
                className="flex items-center space-x-1 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                <Check size={16} />
                <span>Approve</span>
              </button>
              
              <button
                onClick={() => onReject(experience)}
                disabled={isProcessing}
                className="flex items-center space-x-1 px-4 py-2 bg-orange-600 dark:bg-orange-700 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                <X size={16} />
                <span>Reject</span>
              </button>
            </>
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
