import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, AlertCircle, CheckCircle, ToggleLeft, ToggleRight, X } from 'lucide-react';
import API_BASE_URL from '../../config/api';
import { GoogleUser } from '../../types';

interface Update {
  _id: string;
  title: string;
  content: string;
  companyName: string;
  createdAt: string;
  viewCount: number;
  isActive: boolean;
  postedBy: {
    name: string;
    email: string;
  };
}

interface UpdateManagementProps {
  currentUser: GoogleUser;
}

const UpdateManagement: React.FC<UpdateManagementProps> = ({ currentUser }) => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    companyName: '',
    priority: 0
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUpdates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/updates/admin/all?user=${encodeURIComponent(JSON.stringify(currentUser))}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch updates');
      }

      const data = await response.json();
      setUpdates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch updates');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.companyName.trim()) {
      setError('All fields are required');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          postedBy: currentUser
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create update');
      }

      setSuccess('Update created successfully!');
      setFormData({ title: '', content: '', companyName: '', priority: 0 });
      setShowForm(false);
      fetchUpdates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to mark this update as inactive? It will be hidden from users.')) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      console.log('Marking update as inactive:', id);
      console.log('Current user:', currentUser);

      const response = await fetch(`${API_BASE_URL}/api/updates/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          postedBy: {
            googleId: currentUser.googleId,
            email: currentUser.email,
            name: currentUser.name
          }
        }),
        credentials: 'include'
      });

      console.log('Delete response status:', response.status);
      const data = await response.json();
      console.log('Delete response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to deactivate update');
      }

      // Immediately update the UI
      setUpdates(prevUpdates => 
        prevUpdates.map(update => 
          update._id === id ? { ...update, isActive: false } : update
        )
      );
      
      setSuccess('Update marked as inactive successfully!');
      
      // Fetch fresh data to ensure consistency
      setTimeout(() => {
        fetchUpdates();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate update');
      console.error('Delete error:', err);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this update?`)) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/updates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          isActive: !currentStatus,
          postedBy: {
            googleId: currentUser.googleId,
            email: currentUser.email,
            name: currentUser.name
          }
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} update`);
      }

      // Immediately update the UI
      setUpdates(prevUpdates => 
        prevUpdates.map(update => 
          update._id === id ? { ...update, isActive: !currentStatus } : update
        )
      );
      
      setSuccess(`Update ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
      
      setTimeout(() => {
        fetchUpdates();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} update`);
      console.error('Toggle active error:', err);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm('⚠️ PERMANENT DELETE: This will remove the update completely from the database. This action cannot be undone. Are you sure?')) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/updates/${id}/permanent`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          postedBy: {
            googleId: currentUser.googleId,
            email: currentUser.email,
            name: currentUser.name
          }
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to permanently delete update');
      }

      // Remove from UI immediately
      setUpdates(prevUpdates => prevUpdates.filter(update => update._id !== id));
      
      setSuccess('Update permanently deleted!');
      
      setTimeout(() => {
        fetchUpdates();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to permanently delete update');
      console.error('Permanent delete error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Updates</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Post announcements and updates for users</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>New Update</span>
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
              <p className="text-green-800 dark:text-green-300 text-sm">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
              <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g., Google, Microsoft, Amazon"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief title for the update"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Paste your content here... (You can paste formatted text, it will be displayed as-is)"
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Tip: You can paste content directly from documents. Line breaks will be preserved.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {submitting ? 'Creating...' : 'Create Update'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ title: '', content: '', companyName: '', priority: 0 });
                }}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Updates List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            All Updates ({updates.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Loading updates...</p>
          </div>
        ) : updates.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No updates found. Create your first update!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {updates.map((update) => (
              <div
                key={update._id}
                className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                  !update.isActive ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
                        {update.companyName}
                      </span>
                      {update.isActive ? (
                        <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 text-xs font-medium rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {update.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {update.content.substring(0, 150)}...
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Posted: {new Date(update.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Eye size={12} />
                        <span>{update.viewCount} views</span>
                      </span>
                      <span>•</span>
                      <span>By: {update.postedBy.name}</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="ml-4 flex items-center space-x-2">
                    {/* Toggle Active/Inactive */}
                    <button
                      onClick={() => handleToggleActive(update._id, update.isActive)}
                      className={`p-2 rounded-lg transition-colors ${
                        update.isActive
                          ? 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                          : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                      title={update.isActive ? 'Deactivate (hide from users)' : 'Activate (show to users)'}
                    >
                      {update.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>

                    {/* Soft Delete (for active updates) */}
                    {update.isActive && (
                      <button
                        onClick={() => handleDelete(update._id)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Hide update (mark as inactive)"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}

                    {/* Permanent Delete (for inactive updates) */}
                    {!update.isActive && (
                      <button
                        onClick={() => handlePermanentDelete(update._id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="⚠️ Permanently delete from database"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateManagement;
