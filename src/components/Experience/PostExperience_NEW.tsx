import React, { useState, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle, X, BookOpen, Shield, Users, Star } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import CompanySelector from './CompanySelector';
import ExperienceTextEditor from './ExperienceTextEditor';
import { GoogleUser } from '../../types';

interface PostExperienceProps {
  onSuccess: () => void;
  user: GoogleUser | null;
}

const PostExperience: React.FC<PostExperienceProps> = ({ onSuccess, user }) => {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
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

  // Check if welcome modal should be shown (every time user visits this tab after logging in)
  useEffect(() => {
    if (user) {
      // Create a session key based on user and current session
      const sessionKey = `postExperienceWelcome_${user.googleId}`;
      const hasSeenInThisSession = sessionStorage.getItem(sessionKey);
      
      // Always show modal if user hasn't seen it in this login session
      if (!hasSeenInThisSession) {
        setShowWelcomeModal(true);
      }
    }
  }, [user]);

  // Handle modal close - mark as seen for this session only
  const handleCloseModal = () => {
    setShowWelcomeModal(false);
    if (user) {
      const sessionKey = `postExperienceWelcome_${user.googleId}`;
      sessionStorage.setItem(sessionKey, 'true');
    }
  };

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

  // Welcome Modal Component
  const WelcomeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 px-8 py-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to Experience Sharing! 🎉</h2>
              <p className="text-blue-100 dark:text-blue-200">
                Help your fellow SASTRA students by sharing your journey
              </p>
            </div>
            <button
              onClick={handleCloseModal}
              className="text-white hover:text-blue-200 transition-colors p-1"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Guidelines Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <BookOpen size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Sharing Guidelines</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">What makes a great experience post</p>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                <li className="flex items-start space-x-2">
                  <Star size={16} className="mt-0.5 flex-shrink-0" />
                  <span><strong>Interview Process:</strong> Share specific questions, rounds, and preparation tips</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Star size={16} className="mt-0.5 flex-shrink-0" />
                  <span><strong>Company Culture:</strong> Describe work environment, team dynamics, and learning opportunities</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Star size={16} className="mt-0.5 flex-shrink-0" />
                  <span><strong>Preparation Resources:</strong> Mention books, courses, platforms that helped you</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Star size={16} className="mt-0.5 flex-shrink-0" />
                  <span><strong>Practical Advice:</strong> Tips for future candidates and lessons learned</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Requirements Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Shield size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Requirements</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Please ensure you meet these criteria</p>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <ul className="space-y-2 text-sm text-green-800 dark:text-green-300">
                <li className="flex items-start space-x-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span><strong>SASTRA Email Required:</strong> Use your institutional email (@sastra.ac.in)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span><strong>Detailed Content:</strong> Minimum 50 characters with meaningful insights</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span><strong>Admin Review:</strong> All experiences are reviewed before publication</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span><strong>Professional Tone:</strong> Keep content helpful and respectful</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Community Impact */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <Users size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Community Impact</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your contribution makes a difference</p>
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <p className="text-sm text-purple-800 dark:text-purple-300">
                By sharing your experience, you're helping hundreds of SASTRA students prepare better for their 
                career opportunities. Your insights about interview processes, company culture, and preparation 
                strategies become valuable resources for the entire community.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-6 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ready to share your experience and help others?
            </p>
            <button
              onClick={handleCloseModal}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              Let's Get Started! 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
      {/* Welcome Modal */}
      {showWelcomeModal && <WelcomeModal />}
      
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
                <label htmlFor="studentName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  id="studentName"
                  name="studentName"
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
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
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
                <label htmlFor="graduationYear" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Graduation Year *
                </label>
                <select
                  id="graduationYear"
                  name="graduationYear"
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
                <label htmlFor="experienceType" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Experience Type *
                </label>
                <select
                  id="experienceType"
                  name="experienceType"
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostExperience;
