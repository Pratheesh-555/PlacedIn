import React, { useState, useEffect } from 'react';
import { Bell, ChevronRight, Clock, X } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [hasViewedUpdates, setHasViewedUpdates] = useState(false);

  useEffect(() => {
    fetchUpdates();
    // Check if user has viewed updates before
    const viewed = localStorage.getItem('updatesViewed');
    if (viewed) {
      setHasViewedUpdates(true);
    }
  }, []);

  // Auto-hide on idle, show on scroll
  useEffect(() => {
    let hideTimeout: number;

    const handleScroll = () => {
      // Show button when scrolling
      setIsVisible(true);

      // Clear previous timeout
      clearTimeout(hideTimeout);

      // Hide after 3 seconds of no scrolling
      hideTimeout = window.setTimeout(() => {
        if (!isOpen) {
          setIsVisible(false);
        }
      }, 3000);
    };

    const handleMouseMove = () => {
      // Show button on mouse movement
      setIsVisible(true);
      clearTimeout(hideTimeout);

      // Hide after 3 seconds of no activity
      hideTimeout = window.setTimeout(() => {
        if (!isOpen) {
          setIsVisible(false);
        }
      }, 3000);
    };

    // Initial hide after 3 seconds
    hideTimeout = window.setTimeout(() => {
      if (!isOpen) {
        setIsVisible(false);
      }
    }, 3000);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(hideTimeout);
    };
  }, [isOpen]);

  const fetchUpdates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/updates?limit=10`);
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

  const handleButtonClick = () => {
    if (!hasViewedUpdates) {
      // Mark as viewed on first click
      localStorage.setItem('updatesViewed', 'true');
      setHasViewedUpdates(true);
    }
    setIsOpen(!isOpen);
    setIsVisible(true); // Keep visible when interacting
  };

  if (loading || updates.length === 0) {
    return null;
  }

  return (
    <>
      {/* Floating Button - Elegant & Professional with Auto-hide */}
      <button
        onClick={handleButtonClick}
        className={`fixed bottom-6 right-6 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 dark:from-blue-600 dark:via-indigo-600 dark:to-purple-600 dark:hover:from-blue-700 dark:hover:via-indigo-700 dark:hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center z-50 group border-2 border-white/10 transition-all duration-500 ease-in-out ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-24 opacity-0 pointer-events-none'
        }`}
        aria-label="View Recent Updates"
      >
        <div className="relative">
          <Bell size={20} className="sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform duration-200" />
          {!hasViewedUpdates && updates.length > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md ring-2 ring-white dark:ring-gray-800 animate-in zoom-in duration-300">
              {updates.length > 9 ? '9+' : updates.length}
            </span>
          )}
        </div>
      </button>

      {/* Expandable Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[45] animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed bottom-24 right-6 w-[90vw] sm:w-96 max-w-md z-50 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-100 dark:border-gray-700 transform transition-all duration-300">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="text-white" size={20} />
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white">Recent Updates</h3>
                      <p className="text-xs text-white/80">{updates.length} {updates.length === 1 ? 'update' : 'updates'} available</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                    className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Updates List - Scrollable with smooth scrollbar */}
              <div className="max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
                {updates.map((update, index) => (
                  <button
                    key={update._id}
                    onClick={() => {
                      handleUpdateClick(update);
                      setIsOpen(false);
                    }}
                    className={`w-full p-4 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-all duration-200 text-left group ${
                      index !== updates.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between space-x-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1.5">
                          <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
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
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        size={18}
                        className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1"
                      />
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer with scroll hint */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    Click to read full details
                  </span>
                  {updates.length > 3 && (
                    <span className="text-gray-500 dark:text-gray-500 flex items-center space-x-1">
                      <span>Scroll for more</span>
                      <svg className="w-3 h-3 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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
