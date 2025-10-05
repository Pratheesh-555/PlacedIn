import React, { useState, useEffect } from 'react';
import { Bell, ChevronRight, Clock } from 'lucide-react';
import API_BASE_URL from '../../config/api';
import UpdateModal from './UpdateModal';

interface Update {
  _id: string;
  title: string;
  content: string;
  companyName: string;
  createdAt: string;
  viewCount: number;
}

const RecentUpdates: React.FC = () => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/updates?limit=5`);
      if (response.ok) {
        const data = await response.json();
        setUpdates(data);
      }
    } catch (error) {
      console.error('Error fetching updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (update: Update) => {
    setSelectedUpdate(update);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (updates.length === 0) {
    return null; // Don't show anything if no updates
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 p-4">
          <div className="flex items-center space-x-2">
            <Bell className="text-white" size={20} />
            <h3 className="text-lg font-bold text-white">Recent Updates</h3>
          </div>
        </div>

        {/* Updates List */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {updates.map((update) => (
            <button
              key={update._id}
              onClick={() => handleUpdateClick(update)}
              className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left group"
            >
              <div className="flex items-start justify-between space-x-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
                      {update.companyName}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {update.title}
                  </h4>
                  <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock size={12} />
                    <span>
                      {new Date(update.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <ChevronRight
                  size={20}
                  className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1"
                />
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        {updates.length > 0 && (
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Click any update to read more
            </span>
          </div>
        )}
      </div>

      {/* Update Modal */}
      {selectedUpdate && (
        <UpdateModal
          update={selectedUpdate}
          onClose={() => setSelectedUpdate(null)}
        />
      )}
    </>
  );
};

export default RecentUpdates;
