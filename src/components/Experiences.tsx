import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, User, Eye } from 'lucide-react';
import { Experience, FilterOptions } from '../types';
import { API_ENDPOINTS } from '../config/api';

interface ExperiencesProps {
  experiences: Experience[];
}

const Experiences: React.FC<ExperiencesProps> = ({ experiences }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    company: '',
    student: '',
    graduationYear: '',
    type: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Function to open PDF document directly
  const openPDF = (experience: Experience) => {
    const documentUrl = `${API_ENDPOINTS.EXPERIENCES}/${experience._id}/document`;
    try {
      window.open(documentUrl, '_blank', 'width=800,height=600,scrollbars=yes,toolbar=no,menubar=no');
    } catch (error) {
      console.error('Error opening PDF:', error);
      alert('Unable to open document. Please try again.');
    }
  };

  const filteredExperiences = useMemo(() => {
    return experiences.filter(exp => {
      if (!exp.isApproved) return false;
      
      const matchesCompany = !filters.company || exp.company.toLowerCase().includes(filters.company.toLowerCase());
      const matchesStudent = !filters.student || exp.studentName.toLowerCase().includes(filters.student.toLowerCase());
      const matchesYear = !filters.graduationYear || exp.graduationYear.toString() === filters.graduationYear;
      const matchesType = !filters.type || exp.type === filters.type;
      const matchesSearch = !filters.search || 
        exp.company.toLowerCase().includes(filters.search.toLowerCase()) ||
        exp.studentName.toLowerCase().includes(filters.search.toLowerCase()) ||
        exp.experienceText.toLowerCase().includes(filters.search.toLowerCase());

      return matchesCompany && matchesStudent && matchesYear && matchesType && matchesSearch;
    });
  }, [experiences, filters]);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      company: '',
      student: '',
      graduationYear: '',
      type: '',
      search: ''
    });
  };

  const uniqueCompanies = [...new Set(experiences.map(exp => exp.company))].sort();
  const uniqueYears = [...new Set(experiences.map(exp => exp.graduationYear))].sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-4">Student Experiences</h1>
          <p className="text-gray-600">
            Discover insights from {filteredExperiences.length} placement and internship experiences
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search experiences, companies, or students..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Filter size={20} />
              <span>Filters</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <select
                    value={filters.company}
                    onChange={(e) => handleFilterChange('company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Companies</option>
                    {uniqueCompanies.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Graduation Year</label>
                  <select
                    value={filters.graduationYear}
                    onChange={(e) => handleFilterChange('graduationYear', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Years</option>
                    {uniqueYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    <option value="placement">Placement</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:scale-105"
              onClick={() => openPDF(experience)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-blue-900 mb-2">{experience.company}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {experience.type.charAt(0).toUpperCase() + experience.type.slice(1)}
                  </div>
                </div>

                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {experience.experienceText}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    {new Date(experience.createdAt || '').toLocaleDateString()}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openPDF(experience);
                    }}
                    className="flex items-center space-x-1 text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors"
                  >
                    <Eye size={14} />
                    <span>View Document</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredExperiences.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {experiences.length === 0 ? 'No experiences shared yet' : 'No experiences match your filters'}
            </h3>
            <p className="text-gray-500 mb-6">
              {experiences.length === 0 
                ? 'Be the first to share your placement or internship journey with fellow students!'
                : 'Try adjusting your search criteria or filters'
              }
            </p>
            {experiences.length === 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 max-w-md mx-auto">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-blue-600" />
                  </div>
                </div>
                <h4 className="font-semibold text-blue-900 mb-2">Share Your Experience</h4>
                <p className="text-sm text-blue-700 mb-4">
                  Help other students by sharing your placement or internship experience. Your story could inspire someone!
                </p>
                <a 
                  href="/post-experience" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Share Your Story
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Experiences;