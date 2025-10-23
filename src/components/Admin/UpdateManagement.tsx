import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, AlertCircle, CheckCircle, ToggleLeft, ToggleRight, X, Sparkles, Loader2, Shield, TrendingUp, AlertTriangle } from 'lucide-react';
import API_BASE_URL from '../../config/api';
import { GoogleUser, Update } from '../../types';

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
  
  // AI features
  const [extracting, setExtracting] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [aiModeration, setAiModeration] = useState<{
    approved: boolean;
    confidence: number;
    issues: string[];
    category: string;
  } | null>(null);

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

  const handleAIExtract = async () => {
    if (!pastedText.trim()) {
      setError('Please paste some text first');
      return;
    }

    setExtracting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/updates/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: pastedText,
          postedBy: currentUser
        }),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success && result.data) {
        setFormData({
          ...formData,
          companyName: result.data.companyName || '',
          title: result.data.title || '',
          content: result.data.content || pastedText
        });
        setSuccess('✨ AI extracted information successfully!');
        setShowPasteArea(false);
        setPastedText('');
      } else {
        setError(result.message || 'AI extraction failed. Please fill manually.');
        setFormData({
          ...formData,
          content: pastedText
        });
      }
    } catch {
      setError('Failed to extract information. Please fill manually.');
      setFormData({
        ...formData,
        content: pastedText
      });
    } finally {
      setExtracting(false);
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
    setAiModeration(null);

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

      // Show AI moderation results if available
      if (data.moderation) {
        setAiModeration(data.moderation);
      }

      setSuccess(
        data.moderation?.autoActivated 
          ? '✅ Update created and auto-activated! AI approved with high confidence.'
          : data.moderation?.approved
          ? '⏰ Update created! Will auto-activate in 24h if not manually reviewed.'
          : '✅ Update created successfully!'
      );
      
      setFormData({ title: '', content: '', companyName: '', priority: 0 });
      setPastedText('');
      fetchUpdates();
      
      // Keep form open to show moderation results
      setTimeout(() => {
        setShowForm(false);
        setAiModeration(null);
      }, 5000);
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

      const data = await response.json();

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
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Post announcements and updates for users
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setShowPasteArea(false);
              setPastedText('');
              setAiModeration(null);
            }}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {showForm ? <X size={20} /> : <Plus size={20} />}
            <span className="font-medium">{showForm ? 'Cancel' : 'New Update'}</span>
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
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-6">
            {/* AI Paste Area */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="text-blue-600 dark:text-blue-400" size={20} />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Quick Post with AI</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Paste announcement text to auto-extract details
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasteArea(!showPasteArea)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {showPasteArea ? 'Hide' : 'Show'}
                </button>
              </div>

              {showPasteArea && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste announcement text here... AI will extract company name, title, and content automatically."
                    rows={6}
                    className="w-full px-3 py-2 border border-blue-200 dark:border-blue-800 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm resize-none"
                  />
                  <button
                    type="button"
                    onClick={handleAIExtract}
                    disabled={extracting || !pastedText.trim()}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md font-medium flex items-center justify-center space-x-2"
                  >
                    {extracting ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Extracting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        <span>Extract with AI</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* AI Moderation Results */}
            {aiModeration && (
              <div className={`rounded-lg p-4 border animate-in slide-in-from-top-2 duration-200 ${
                aiModeration.approved
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    aiModeration.approved
                      ? 'bg-green-100 dark:bg-green-800/40'
                      : 'bg-yellow-100 dark:bg-yellow-800/40'
                  }`}>
                    {aiModeration.approved ? (
                      <Shield className="text-green-600 dark:text-green-400" size={20} />
                    ) : (
                      <TrendingUp className="text-yellow-600 dark:text-yellow-400" size={20} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium mb-2 ${
                      aiModeration.approved
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-yellow-900 dark:text-yellow-100'
                    }`}>
                      AI Safety Check
                    </h4>
                    
                    {/* Confidence */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className={aiModeration.approved ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}>
                          Confidence
                        </span>
                        <span className="font-medium">{aiModeration.confidence}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            aiModeration.confidence >= 85
                              ? 'bg-green-500'
                              : aiModeration.confidence >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${aiModeration.confidence}%` }}
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div className="text-sm mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        aiModeration.category === 'SAFE'
                          ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                          : 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {aiModeration.category}
                      </span>
                    </div>

                    {/* Issues */}
                    {aiModeration.issues && aiModeration.issues.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium mb-1 text-yellow-800 dark:text-yellow-200">
                          Issues:
                        </p>
                        <ul className="list-disc list-inside text-xs space-y-1 text-yellow-700 dark:text-yellow-300">
                          {aiModeration.issues.map((issue: string, idx: number) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Auto-approval */}
                    {aiModeration.approved && aiModeration.confidence >= 85 && (
                      <div className="mt-2 text-xs text-green-700 dark:text-green-300">
                        ✓ Will be auto-activated
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Regular Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g., Google, Microsoft, Amazon"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
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
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    required
                    maxLength={200}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter your content here... Line breaks will be preserved."
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm resize-none transition-all"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center space-x-1">
                  <Sparkles size={12} />
                  <span>Tip: Use the AI assistant above for quick extraction from pasted announcements</span>
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md font-medium flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      <span>Create Update</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ title: '', content: '', companyName: '', priority: 0 });
                    setPastedText('');
                    setShowPasteArea(false);
                    setAiModeration(null);
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
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
            <Loader2 className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">Loading updates...</p>
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
                className={`p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white dark:hover:from-gray-700/30 dark:hover:to-gray-800 transition-all duration-200 ${
                  !update.isActive ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
                        {update.companyName}
                      </span>
                      {update.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 text-xs font-medium rounded">
                          Inactive
                        </span>
                      )}
                      {update.autoApproved && (
                        <span className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded">
                          AI Auto-Approved
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {update.title}
                    </h4>

                    {/* Content Preview */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {update.content.substring(0, 150)}{update.content.length > 150 && '...'}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>{new Date(update.createdAt).toLocaleDateString()}</span>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <span className="flex items-center space-x-1">
                        <Eye size={12} />
                        <span>{update.viewCount} views</span>
                      </span>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <span>By: {update.postedBy.name}</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Toggle */}
                    <button
                      onClick={() => handleToggleActive(update._id, update.isActive)}
                      className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                        update.isActive
                          ? 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                          : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                      title={update.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {update.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>

                    {/* Hide */}
                    {update.isActive && (
                      <button
                        onClick={() => handleDelete(update._id)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-110"
                        title="Hide"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}

                    {/* Delete Forever */}
                    {!update.isActive && (
                      <button
                        onClick={() => handlePermanentDelete(update._id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                        title="Delete Forever"
                      >
                        <AlertTriangle size={20} />
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
