import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

interface RatingStats {
  stats: Array<{
    _id: number;
    count: number;
    label: string;
  }>;
  totalRatings: number;
  averageRating: number;
}

interface Rating {
  _id: string;
  rating: number;
  label: string;
  timestamp: string;
  userAgent?: string;
}

const RatingsDashboard: React.FC = () => {
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [recentRatings, setRecentRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatingData();
  }, []);

  const fetchRatingData = async () => {
    try {
      const [statsResponse, ratingsResponse] = await Promise.all([
        fetch(`${API_ENDPOINTS.RATINGS}/stats`),
        fetch(`${API_ENDPOINTS.RATINGS}/all`)
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (ratingsResponse.ok) {
        const ratingsData = await ratingsResponse.json();
        setRecentRatings(ratingsData.slice(0, 10)); // Show last 10 ratings
      }
    } catch (error) {
      console.error('Error fetching rating data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}
      />
    ));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Ratings</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <BarChart3 className="mr-2" size={20} />
        User Ratings Dashboard
      </h3>

      {stats && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Ratings</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalRatings}</p>
                </div>
                <Users className="text-blue-500" size={24} />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Average Rating</p>
                  <p className="text-2xl font-bold text-green-900">
                    {stats.averageRating.toFixed(1)} / 5
                  </p>
                </div>
                <TrendingUp className="text-green-500" size={24} />
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Star Rating</p>
                  <div className="flex items-center mt-1">
                    {getStarRating(Math.round(stats.averageRating))}
                  </div>
                </div>
                <Star className="text-yellow-500" size={24} />
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Rating Distribution</h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const ratingData = stats.stats.find(s => s._id === rating);
                const count = ratingData?.count || 0;
                const percentage = stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center">
                    <div className="flex items-center w-20">
                      <span className="text-sm text-gray-600 mr-2">{rating}</span>
                      <Star size={14} className="text-yellow-500 fill-current" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-16 text-right">
                      <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Recent Ratings */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Recent Ratings</h4>
        {recentRatings.length > 0 ? (
          <div className="space-y-3">
            {recentRatings.map((rating) => (
              <div
                key={rating._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex">
                    {getStarRating(rating.rating)}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{rating.label}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(rating.timestamp).toLocaleDateString()} {new Date(rating.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No ratings submitted yet</p>
        )}
      </div>
    </div>
  );
};

export default RatingsDashboard;
