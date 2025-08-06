import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import CompanySelector from './CompanySelector';
import ExperienceTextEditor from './ExperienceTextEditor';
import { GoogleUser } from '../../types';

interface PostExperienceProps {
  onSuccess: () => void;
  user: GoogleUser | null;
}

const PostExperience: React.FC<PostExperienceProps> = ({ onSuccess, user }) => {
  const [formData, setFormData] = useState({
    studentName: user?.name || '',
    email: user?.email || '',
    company: '',
    graduationYear: new Date().getFullYear(),
    type: 'placement' as 'placement' | 'internship',
    experienceText: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [emailValidationProgress, setEmailValidationProgress] = useState(0);

  const validateEmail = async (email: string): Promise<boolean> => {
    setIsValidatingEmail(true);
    setEmailValidationProgress(0);
    
    // Simulate email validation with progress
    const steps = [
      { progress: 20, message: 'Checking email format...' },
      { progress: 40, message: 'Validating domain...' },
      { progress: 60, message: 'Verifying SASTRA domain...' },
      { progress: 80, message: 'Confirming institutional email...' },
      { progress: 100, message: 'Validation complete!' }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setEmailValidationProgress(step.progress);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    setIsValidatingEmail(false);
    
    // Check if email ends with sastra.ac.in
    return email.toLowerCase().endsWith('@sastra.ac.in');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setErrors({});

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.studentName.trim()) newErrors.studentName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.company.trim()) newErrors.company = 'Company is required';
    if (!formData.experienceText.trim()) newErrors.experienceText = 'Experience text is required';
    if (formData.experienceText.trim().length < 50) newErrors.experienceText = 'Experience must be at least 50 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Email validation with progress bar
      const isValidEmail = await validateEmail(formData.email);
      
      if (!isValidEmail) {
        setError('Please use your SASTRA institutional email address (@sastra.ac.in)');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(API_ENDPOINTS.EXPERIENCES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          postedBy: user ? {
            googleId: user.googleId,
            name: user.name,
            email: user.email,
            picture: user.picture
          } : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit experience');
      }

      setSubmitted(true);
      setTimeout(() => {
        setFormData({
          studentName: user?.name || '',
          email: user?.email || '',
          company: '',
          graduationYear: new Date().getFullYear(),
          type: 'placement',
          experienceText: ''
        });
        setSubmitted(false);
        onSuccess();
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompanySelect = (company: string) => {
    setFormData(prev => ({ ...prev, company }));
    if (errors.company) {
      setErrors(prev => ({ ...prev, company: '' }));
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTextChange = (value: string) => {
    setFormData(prev => ({ ...prev, experienceText: value }));
    if (errors.experienceText) {
      setErrors(prev => ({ ...prev, experienceText: '' }));
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-green-900/20 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Experience Submitted!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Thank you for sharing your experience! It will be reviewed and published shortly.
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-green-600 dark:bg-green-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-2">Share Your Experience</h1>
            <p className="text-blue-100 dark:text-blue-200">
              Help fellow students by sharing your placement or internship journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle size={20} className="text-red-500 dark:text-red-400 flex-shrink-0" />
                <span className="text-red-700 dark:text-red-300">{error}</span>
              </div>
            )}

            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => handleInputChange('studentName', e.target.value)}
                  className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                    errors.studentName ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/30' : ''
                  }`}
                  placeholder="Enter your full name"
                  disabled={!!user?.name}
                />
                {errors.studentName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.studentName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                    errors.email ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/30' : ''
                  }`}
                  placeholder="your.email@example.com"
                  disabled={!!user?.email}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Company Selection */}
            <div>
              <CompanySelector
                value={formData.company}
                onChange={handleCompanySelect}
                error={errors.company}
              />
            </div>

            {/* Academic Year and Type */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Graduation Year *
                </label>
                <select
                  value={formData.graduationYear}
                  onChange={(e) => handleInputChange('graduationYear', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() + i - 5).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Experience Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="placement">Placement</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </div>

            {/* Experience Text Editor */}
            <ExperienceTextEditor
              value={formData.experienceText}
              onChange={handleTextChange}
              error={errors.experienceText}
            />

            {/* Submit Button */}
            <div className="pt-6">
              {/* Email Validation Progress Bar */}
              {isValidatingEmail && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Validating Email Address...
                    </span>
                    <span className="text-sm font-bold text-blue-800 dark:text-blue-200">
                      {emailValidationProgress}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-3 mb-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 h-3 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${emailValidationProgress}%` }}
                    >
                      <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    {emailValidationProgress <= 20 && '🔍 Checking email format...'}
                    {emailValidationProgress > 20 && emailValidationProgress <= 40 && '🌐 Validating domain...'}
                    {emailValidationProgress > 40 && emailValidationProgress <= 60 && '🏫 Verifying SASTRA domain...'}
                    {emailValidationProgress > 60 && emailValidationProgress <= 80 && '✅ Confirming institutional email...'}
                    {emailValidationProgress > 80 && '🎉 Validation complete!'}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || isValidatingEmail}
                className={`w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  isSubmitting || isValidatingEmail
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 transform hover:scale-105 shadow-lg hover:shadow-xl'
                }`}
              >
                {isValidatingEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500 dark:border-gray-400"></div>
                    <span>Validating Email...</span>
                  </>
                ) : isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500 dark:border-gray-400"></div>
                    <span>Submitting Experience...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Share My Experience</span>
                  </>
                )}
              </button>
            </div>

            {/* Disclaimer */}
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                <strong>Requirements:</strong>
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Use your SASTRA institutional email (@sastra.ac.in)</li>
                <li>• Your experience will be reviewed before publication</li>
                <li>• This helps maintain a helpful and professional community</li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostExperience;
