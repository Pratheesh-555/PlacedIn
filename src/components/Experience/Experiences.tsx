import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Filter, Calendar, User, Eye, RefreshCw } from 'lucide-react';
import { Experience, FilterOptions } from '../../types';
import { API_ENDPOINTS } from '../../config/api';

import ExperienceModal from './ExperienceModal';

const Experiences: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    company: '',
    student: '',
    graduationYear: '',
    type: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const ITEMS_PER_PAGE = 20; // Optimized for better performance and faster loading

  // Debounced search to improve performance
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Optimized fetch with better error handling and performance
  const fetchExperiences = useCallback(async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
        setExperiences([]);
        setPage(1);
        setHasMore(true);
      }
      
      // Build query parameters for filtering
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: ITEMS_PER_PAGE.toString()
      });
      
      // Add filters if they exist
      if (filters.company && filters.company !== 'all') params.append('company', filters.company);
      if (filters.graduationYear && filters.graduationYear !== 'all') params.append('graduationYear', filters.graduationYear);
      if (filters.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters.search && filters.search.trim()) params.append('search', filters.search);
      
      const url = `${API_ENDPOINTS.EXPERIENCES}?${params}`;
      
      // Mobile-friendly fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for mobile
      
      let result;
      try {
        const response = await fetch(url, {
          headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        result = await response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout - please check your internet connection');
        }
        throw error;
      }
      
      // Handle both new and old response formats
      let experiencesArray;
      let hasMoreData = true;
      
      if (result.experiences && result.pagination) {
        // New format with metadata
        experiencesArray = result.experiences;
        hasMoreData = result.pagination.hasNext || false;
      } else if (Array.isArray(result)) {
        // Old format - direct array
        experiencesArray = result;
        hasMoreData = result.length >= ITEMS_PER_PAGE;
      } else {
        experiencesArray = [];
        hasMoreData = false;
      }
      
      // All experiences from API are already approved, no need to filter again
      if (refresh || pageNum === 1) {
        setExperiences(experiencesArray);
      } else {
        setExperiences(prev => [...prev, ...experiencesArray]);
      }
      
      setHasMore(hasMoreData);
      
    } catch {
      // Error handling - no console output for production
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters.company, filters.graduationYear, filters.type, filters.search]);

  // Initial fetch and filter dependency
  useEffect(() => {
    fetchExperiences(1, true);
  }, [fetchExperiences, filters]);

  // Function to open experience (modal for text, fallback for files)
  const openExperience = (experience: Experience) => {
    if (experience.experienceText && experience.experienceText.trim()) {
      // Text-based experience - open in modal
      setSelectedExperience(experience);
    } else {
      // Fallback for older file-based entries
      const documentUrl = `${API_ENDPOINTS.EXPERIENCES}/${experience._id}/document`;
      try {
        // Use simple window.open without features to avoid COOP issues
        const newWindow = window.open(documentUrl, '_blank');
        if (!newWindow) {
          // Popup blocked - fallback to same window
          window.location.href = documentUrl;
        }
      } catch (error) {
        console.error('Error opening document:', error);
        // Fallback: navigate to document URL
        window.location.href = documentUrl;
      }
    }
  };

  // Optimized filtering with debouncing
  const filteredExperiences = useMemo(() => {
    // API already returns only approved experiences, no need to filter again
    let filtered = experiences;
    
    // Company filter
    if (filters.company) {
      filtered = filtered.filter(exp => 
        exp.company.toLowerCase().includes(filters.company.toLowerCase())
      );
    }
    
    // Student filter
    if (filters.student) {
      filtered = filtered.filter(exp => 
        exp.studentName.toLowerCase().includes(filters.student.toLowerCase())
      );
    }
    
    // Year filter
    if (filters.graduationYear) {
      filtered = filtered.filter(exp => 
        exp.graduationYear.toString() === filters.graduationYear
      );
    }
    
    // Type filter
    if (filters.type) {
      filtered = filtered.filter(exp => exp.type === filters.type);
    }
    
    // Search filter (optimized for performance)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(exp => 
        exp.company.toLowerCase().includes(searchLower) ||
        exp.studentName.toLowerCase().includes(searchLower) ||
        (exp.experienceText && exp.experienceText.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  }, [experiences, filters]);

  // Debounced filter handler
  const handleFilterChange = useCallback((key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      company: '',
      student: '',
      graduationYear: '',
      type: '',
      search: ''
    });
    setSearchInput('');
  }, []);

  // Load more data
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchExperiences(nextPage, false);
    }
  }, [isLoading, hasMore, page, fetchExperiences]);

  // Refresh data
  const refreshData = useCallback(() => {
    fetchExperiences(1, true);
  }, [fetchExperiences]);

  // Memoized computed values for better performance
  const uniqueCompanies = useMemo(() => 
    [...new Set(experiences.map(exp => exp.company))].sort(),
    [experiences]
  );
  
  const uniqueYears = useMemo(() => 
    [...new Set(experiences.map(exp => exp.graduationYear))].sort((a, b) => b - a),
    [experiences]
  );

  // Show loading state
  if (isLoading && experiences.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="ml-3 text-blue-900 dark:text-blue-100 font-medium mt-4">Loading experiences...</span>
            <span className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              {window.navigator.userAgent.includes('Mobile') ? 'Please ensure you have a stable internet connection' : 'This should only take a moment'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100">Student Experiences</h1>
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
              title="Refresh experiences"
            >
              <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Discover insights from {filteredExperiences.length} placement and internship experiences
            {experiences.length !== filteredExperiences.length && ` (${experiences.length} total)`}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                id="searchExperiences"
                name="searchExperiences"
                type="text"
                placeholder="Search experiences, companies, or students..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Filter size={20} />
              <span>Filters</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="filterCompany" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company</label>
                  <select
                    id="filterCompany"
                    name="filterCompany"
                    value={filters.company}
                    onChange={(e) => handleFilterChange('company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">All Companies</option>
                    {uniqueCompanies.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="filterGraduationYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Graduation Year</label>
                  <select
                    id="filterGraduationYear"
                    name="filterGraduationYear"
                    value={filters.graduationYear}
                    onChange={(e) => handleFilterChange('graduationYear', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">All Years</option>
                    {uniqueYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                  <select
                    id="filterType"
                    name="filterType"
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">All Types</option>
                    <option value="placement">Placement</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiences.map((experience) => (
            <div
              key={experience._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl dark:hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">{experience.company}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center space-x-1">
                        <User size={14} />
                        <span>{experience.studentName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{experience.graduationYear}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    experience.type === 'placement' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                  }`}>
                    {experience.type.charAt(0).toUpperCase() + experience.type.slice(1)}
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                  {experience.experienceText}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(experience.createdAt || '').toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => openExperience(experience)}
                    className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    <Eye size={14} />
                    <span>{experience.experienceText ? 'Read Experience' : 'View Document'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && !isLoading && filteredExperiences.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                'Load More Experiences'
              )}
            </button>
          </div>
        )}

        {filteredExperiences.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              {experiences.length === 0 ? 'No experiences shared yet' : 'No experiences match your filters'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {experiences.length === 0 
                ? 'Be the first to share your placement or internship journey with fellow students!'
                : 'Try adjusting your search criteria or filters'
              }
            </p>
            
          </div>
        )}
      </div>

      {/* Experience Modal */}
      {selectedExperience && (
        <ExperienceModal
          experience={selectedExperience}
          onClose={() => setSelectedExperience(null)}
        />
      )}
    </div>
  );
};

export default Experiences;
