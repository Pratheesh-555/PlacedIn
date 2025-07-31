import { useState, useEffect } from 'react';
import { Eye, Users, Calendar, TrendingUp, RefreshCw, BarChart3 } from 'lucide-react';
import { getAnalytics } from '../../hooks/useAnalytics';

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  dailyViews: Record<string, number>;
  pageViews: Record<string, number>;
  topUserAgents: [string, number][];
  topReferrers: [string, number][];
  todayViews: number;
}

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await getAnalytics();
      setAnalytics(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !analytics) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Unable to load analytics data</p>
          <button
            onClick={fetchAnalytics}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getPageName = (path: string) => {
    const pageNames: Record<string, string> = {
      '/': 'Home',
      '/experiences': 'Experiences',
      '/post': 'Post Experience',
      '/admin': 'Admin Dashboard'
    };
    return pageNames[path] || path;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <BarChart3 className="text-blue-600" />
            <span>Site Analytics</span>
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Views</p>
              <p className="text-3xl font-bold">{analytics.totalViews.toLocaleString()}</p>
            </div>
            <Eye size={32} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Unique Visitors</p>
              <p className="text-3xl font-bold">{analytics.uniqueVisitors.toLocaleString()}</p>
            </div>
            <Users size={32} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Today's Views</p>
              <p className="text-3xl font-bold">{analytics.todayViews.toLocaleString()}</p>
            </div>
            <Calendar size={32} className="text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Avg. Daily</p>
              <p className="text-3xl font-bold">
                {Object.keys(analytics.dailyViews).length > 0 
                  ? Math.round(analytics.totalViews / Object.keys(analytics.dailyViews).length)
                  : 0
                }
              </p>
            </div>
            <TrendingUp size={32} className="text-orange-200" />
          </div>
        </div>
      </div>

      {/* Page Views */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Page Views</h3>
        <div className="space-y-3">
          {Object.entries(analytics.pageViews).map(([path, views]) => (
            <div key={path} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">{getPageName(path)}</span>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {views.toLocaleString()} views
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ 
                      width: `${(views / Math.max(...Object.values(analytics.pageViews))) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Views Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Views (Last 7 Days)</h3>
        <div className="flex items-end space-x-2 h-32">
          {Object.entries(analytics.dailyViews)
            .slice(-7)
            .map(([date, views]) => {
              const maxViews = Math.max(...Object.values(analytics.dailyViews));
              const height = (views / maxViews) * 100;
              
              return (
                <div key={date} className="flex-1 flex flex-col items-center">
                  <div 
                    className="bg-blue-500 rounded-t w-full min-h-[4px] transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${height}%` }}
                    title={`${views} views`}
                  ></div>
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    {new Date(date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-xs font-medium text-gray-700">
                    {views}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Browser Info */}
      {analytics.topUserAgents.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Browsers</h3>
          <div className="space-y-2">
            {analytics.topUserAgents.slice(0, 3).map(([userAgent, count], index) => {
              const browserName = userAgent.includes('Chrome') ? 'Chrome' :
                                userAgent.includes('Firefox') ? 'Firefox' :
                                userAgent.includes('Safari') ? 'Safari' :
                                userAgent.includes('Edge') ? 'Edge' : 'Other';
              
              return (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-700">{browserName}</span>
                  <span className="text-sm font-medium text-blue-600">{count} visits</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
