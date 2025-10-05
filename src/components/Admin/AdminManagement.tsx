import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import API_BASE_URL from '../../config/api';
import { GoogleUser } from '../../types';
import ADMIN_CONFIG from '../../config/adminConfig';

interface Admin {
  email: string;
  isSuperAdmin: boolean;
  addedBy: {
    email: string;
    name?: string;
  };
  createdAt: string;
  permissions: {
    canApprove: boolean;
    canDelete: boolean;
    canManageAdmins: boolean;
  };
}

interface AdminManagementProps {
  currentUser: GoogleUser;
}

const AdminManagement: React.FC<AdminManagementProps> = ({ currentUser }) => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);

  const isSuperAdmin = ADMIN_CONFIG.isSuperAdmin(currentUser.email);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdmins();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin]);

  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/manage-admins?user=${encodeURIComponent(JSON.stringify(currentUser))}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }

      const data = await response.json();
      setAdmins(data);
      
      // Update the admin cache
      await ADMIN_CONFIG.fetchAdminList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdminEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    if (!newAdminEmail.toLowerCase().endsWith('@sastra.ac.in')) {
      setError('Only SASTRA email addresses (@sastra.ac.in) can be added as admin');
      return;
    }

    setAddingAdmin(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/manage-admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newAdminEmail.trim(),
          addedBy: {
            email: currentUser.email,
            name: currentUser.name
          }
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add admin');
      }

      setSuccess(`Successfully added ${newAdminEmail} as admin`);
      setNewAdminEmail('');
      fetchAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add admin');
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from admin list?`)) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/manage-admins/${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: currentUser
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove admin');
      }

      setSuccess(`Successfully removed ${email} from admin list`);
      fetchAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove admin');
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={24} />
          <div>
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Access Denied</h3>
            <p className="text-yellow-700 dark:text-yellow-400 text-sm">
              Only super admin can manage administrators.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="text-blue-600 dark:text-blue-400" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Management</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Manage admin access and permissions</p>
          </div>
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

        {/* Add Admin Form */}
        <form onSubmit={handleAddAdmin} className="mb-6">
          <div className="flex gap-3">
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="admin.email@sastra.ac.in"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={addingAdmin}
            />
            <button
              type="submit"
              disabled={addingAdmin}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <UserPlus size={20} />
              <span>{addingAdmin ? 'Adding...' : 'Add Admin'}</span>
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Only SASTRA email addresses (@sastra.ac.in) can be added as administrators
          </p>
        </form>
      </div>

      {/* Admin List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Current Administrators ({admins.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Loading admins...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No administrators found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Added By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Added On
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {admins.map((admin) => (
                  <tr key={admin.email} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {admin.email}
                        </span>
                        {admin.email === currentUser.email && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {admin.isSuperAdmin ? (
                        <span className="inline-flex items-center space-x-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full">
                          <Shield size={12} />
                          <span>Super Admin</span>
                        </span>
                      ) : (
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                          Admin
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {admin.addedBy.name || admin.addedBy.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {!admin.isSuperAdmin && (
                        <button
                          onClick={() => handleRemoveAdmin(admin.email)}
                          className="inline-flex items-center space-x-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={16} />
                          <span>Remove</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManagement;
