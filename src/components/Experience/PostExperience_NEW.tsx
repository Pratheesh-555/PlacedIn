import React, { useState, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle, Shield, Users, ArrowRight, Bold, Italic, Underline, ChevronDown, ChevronRight, Target, Clock } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import CompanySelector from './CompanySelector';
import { GoogleUser, Experience } from '../../types';

interface PostExperienceProps {
  onSuccess: () => void;
  user: GoogleUser | null;
  editingExperience?: Experience;
  onViewSubmissions?: () => void;
}

const PostExperience: React.FC<PostExperienceProps> = ({ 
  onSuccess, 
  user, 
  editingExperience,
  onViewSubmissions 
}) => {
  // Progressive flow states
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false]);
  const [showForm, setShowForm] = useState(false);

  // Round interface for dynamic rounds
  interface Round {
    id: string;
    name: string;
    content: string;
  }

  const [rounds, setRounds] = useState<Round[]>([
    { id: '1', name: 'Online Assessment/Written Test', content: '' },
    { id: '2', name: 'Technical Interview', content: '' },
    { id: '3', name: 'HR Interview', content: '' }
  ]);

  const [expandedRounds, setExpandedRounds] = useState<string[]>(['1']); // First round expanded by default

  const [formData, setFormData] = useState({
    studentName: user?.name || '',
    email: user?.email || '',
    company: '',
    graduationYear: new Date().getFullYear(),
    type: 'placement' as 'placement' | 'internship',
    linkedinUrl: '',
    otherDiscussions: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Effect to handle editing mode
  useEffect(() => {
    if (editingExperience) {
      // Pre-fill form with existing data
      setFormData({
        studentName: editingExperience.studentName || user?.name || '',
        email: editingExperience.email || user?.email || '',
        company: editingExperience.company || '',
        graduationYear: editingExperience.graduationYear || new Date().getFullYear(),
        type: editingExperience.type || 'placement',
        linkedinUrl: editingExperience.linkedinUrl || '',
        otherDiscussions: editingExperience.otherDiscussions || ''
      });

      // Pre-fill rounds if available
      if (editingExperience.rounds && editingExperience.rounds.length > 0) {
        setRounds(editingExperience.rounds);
      }

      // Show form directly when editing
      setShowForm(true);
      setCurrentStep(3); // Skip to form step
    }
  }, [editingExperience, user]);

  // Initialize progressive flow on component mount
  useEffect(() => {
    if (user) {
      const sessionKey = `postExperienceOnboarding_${user.googleId}`;
      const hasCompletedOnboarding = sessionStorage.getItem(sessionKey);
      
      if (!hasCompletedOnboarding) {
        setCurrentStep(0);
        setShowForm(false);
      } else {
        setShowForm(true);
        setCompletedSteps([true, true, true]);
      }
    }
  }, [user]);

  // Complete a step in the progressive flow
  const completeStep = (stepIndex: number) => {
    const newCompletedSteps = [...completedSteps];
    newCompletedSteps[stepIndex] = true;
    setCompletedSteps(newCompletedSteps);
    
    if (stepIndex < 2) {
      setCurrentStep(stepIndex + 1);
    } else {
      // All steps completed, show form
      setShowForm(true);
      if (user) {
        const sessionKey = `postExperienceOnboarding_${user.googleId}`;
        sessionStorage.setItem(sessionKey, 'true');
      }
    }
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
    if (!formData.otherDiscussions.trim()) newErrors.otherDiscussions = 'Additional insights and tips are required';
    
    // Validate LinkedIn URL format if provided
    if (formData.linkedinUrl.trim() && !formData.linkedinUrl.includes('linkedin.com')) {
      newErrors.linkedinUrl = 'Please enter a valid LinkedIn URL';
    }

    // Validate rounds content
    const mandatoryRounds = rounds.slice(0, 3);
    const emptyMandatoryRounds = mandatoryRounds.filter(round => !round.content.trim());
    
    if (emptyMandatoryRounds.length > 0) {
      newErrors.rounds = 'First 3 rounds are mandatory and must have content';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Combine all rounds content for backward compatibility
      const experienceText = rounds.map(round => 
        `**${round.name}**\n${round.content}`
      ).join('\n\n');

      // Determine if this is an edit or new submission
      const isEditing = !!editingExperience;
      const url = isEditing 
        ? `/api/user-experiences/${editingExperience._id}`
        : API_ENDPOINTS.EXPERIENCES;
      const method = isEditing ? 'PUT' : 'POST';

      // Create FormData for multipart submission (required by server)
      const submitData = new FormData();
      
      // Add all form fields
      submitData.append('studentName', formData.studentName);
      submitData.append('email', formData.email);
      submitData.append('company', formData.company);
      submitData.append('graduationYear', formData.graduationYear.toString());
      submitData.append('type', formData.type);
      submitData.append('experienceText', experienceText);
      submitData.append('linkedinUrl', formData.linkedinUrl);
      submitData.append('otherDiscussions', formData.otherDiscussions);
      submitData.append('rounds', JSON.stringify(rounds));
      
      // Add user data if available
      if (user) {
        submitData.append('postedBy', JSON.stringify({
          googleId: user.googleId,
          name: user.name,
          email: user.email,
          picture: user.picture
        }));
      }

      const response = await fetch(url, {
        method,
        body: submitData, // Send as FormData, no Content-Type header needed
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
          linkedinUrl: '',
          otherDiscussions: ''
        });
        // Reset rounds to initial state
        setRounds([
          { id: '1', name: 'Online Assessment/Written Test', content: '' },
          { id: '2', name: 'Technical Interview', content: '' },
          { id: '3', name: 'HR Interview', content: '' }
        ]);
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

  const handleTextChange = (roundId: string, content: string) => {
    setRounds(prev => prev.map(round => 
      round.id === roundId ? { ...round, content } : round
    ));
    // Clear round errors when content is added
    if (errors.rounds && content.trim()) {
      setErrors(prev => ({ ...prev, rounds: '' }));
    }
  };

  const handleRoundNameChange = (roundId: string, name: string) => {
    setRounds(prev => prev.map(round => 
      round.id === roundId ? { ...round, name } : round
    ));
  };

  const toggleRoundExpansion = (roundId: string) => {
    setExpandedRounds(prev => 
      prev.includes(roundId) 
        ? prev.filter(id => id !== roundId)
        : [...prev, roundId]
    );
  };

  // Progressive Step 1: Requirements & Guidelines
  const Step1Requirements = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Step 1: Requirements & Guidelines
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please read these essential requirements carefully
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600"></div>
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-sm font-bold">2</span>
              </div>
              <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600"></div>
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-sm font-bold">3</span>
              </div>
            </div>
          </div>

          {/* Requirements List */}
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center">
                <CheckCircle size={20} className="mr-2" />
                Essential Requirements
              </h3>
              <ul className="space-y-3 text-sm text-green-700 dark:text-green-200">
                <li className="flex items-start space-x-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span><strong>SASTRA Account Required:</strong> Only verified SASTRA students can share experiences</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span><strong>Minimum 50 Characters:</strong> Provide meaningful content, not just company name</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span><strong>Admin Review Required:</strong> All experiences are reviewed before publication</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span><strong>Professional Tone:</strong> Keep content helpful and respectful to fellow students</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => completeStep(0)}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center space-x-2 mx-auto"
            >
              <span>Continue</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Progressive Step 2: Quality Tips & Best Practices
  const Step2QualityTips = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Step 2: Quality Tips & Best Practices
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Learn how to write experiences that help other students
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle size={16} className="text-white" />
              </div>
              <div className="w-8 h-1 bg-green-600"></div>
              <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600"></div>
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-sm font-bold">3</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4">
                What Makes Great Experiences
              </h3>
              <ul className="space-y-3 text-sm text-blue-700 dark:text-blue-200">
                <li><strong>Interview Process:</strong> Describe rounds, types of questions, difficulty level</li>
                <li><strong>Preparation Tips:</strong> What resources helped, how long you prepared</li>
                <li><strong>Company Culture:</strong> Work environment, team dynamics, learning opportunities</li>
                <li><strong>Practical Advice:</strong> Do's and don'ts for future applicants</li>
              </ul>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => completeStep(1)}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center space-x-2 mx-auto"
            >
              <span>Continue</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Progressive Step 3: Your Impact
  const Step3YourImpact = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Step 3: Your Impact Matters
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Ready to help your fellow students succeed
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle size={16} className="text-white" />
              </div>
              <div className="w-8 h-1 bg-green-600"></div>
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle size={16} className="text-white" />
              </div>
              <div className="w-8 h-1 bg-green-600"></div>
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">3</span>
              </div>
            </div>
          </div>

          {/* Impact Content */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                <Users size={20} className="mr-2 text-green-600" />
                Your Impact Matters
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Your experience can guide hundreds of students in their placement journey. 
                By sharing detailed insights, you're contributing to the success of future SASTRA students.
              </p>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  "The experience shared by seniors helped me prepare better and get placed in my dream company!" 
                  - Anonymous Student
                </p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
                <Target size={20} className="mr-2 text-blue-600" />
                What You'll Share
              </h3>
              <ul className="space-y-3 text-sm text-blue-700 dark:text-blue-200">
                <li className="flex items-start space-x-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span><strong>Company & Role Details:</strong> Help students target similar opportunities</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span><strong>Round-by-Round Process:</strong> Detailed breakdown of each interview stage</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span><strong>Preparation Tips:</strong> What worked and what didn't in your journey</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span><strong>Key Insights:</strong> Important advice for future candidates</span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-4 flex items-center">
                <Clock size={20} className="mr-2 text-yellow-600" />
                Ready to Begin?
              </h3>
              <p className="text-yellow-700 dark:text-yellow-200 text-sm">
                The form is designed to be user-friendly with dynamic rounds for different interview stages. 
                Take your time to provide detailed, helpful information that will benefit your fellow students.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => completeStep(2)}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center space-x-2 mx-auto"
            >
              <span>Continue</span>
              <ArrowRight size={20} />
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {editingExperience ? 'Experience Updated!' : 'Experience Submitted!'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {editingExperience 
              ? 'Your updated experience has been resubmitted for review. Thank you for the improvements!'
              : 'Thank you for sharing your experience! It will be reviewed and published shortly.'
            }
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
      {/* Progressive Steps */}
      {!showForm && currentStep === 0 && <Step1Requirements />}
      {!showForm && currentStep === 1 && <Step2QualityTips />}
      {!showForm && currentStep === 2 && <Step3YourImpact />}
      
      {/* Main Form */}
      {showForm && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 px-8 py-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {editingExperience ? 'Edit Your Experience' : 'Share Your Experience'}
                  </h1>
                  <p className="text-blue-100 dark:text-blue-200">
                    {editingExperience 
                      ? 'Update your placement or internship experience based on feedback'
                      : 'Help fellow students by sharing your placement or internship journey'
                    }
                  </p>
                </div>
                {onViewSubmissions && !editingExperience && (
                  <button
                    onClick={onViewSubmissions}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>My Submissions</span>
                  </button>
                )}
              </div>
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
                    placeholder="your.email@sastra.ac.in"
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

              {/* LinkedIn URL */}
              <div>
                <label htmlFor="linkedinUrl" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  id="linkedinUrl"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="https://linkedin.com/in/your-profile"
                />
                {errors.linkedinUrl && (
                  <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                    <AlertCircle size={16} />
                    <span>{errors.linkedinUrl}</span>
                  </p>
                )}
              </div>

              {/* Experience Rounds */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Experience Details by Rounds
                  </label>
                  
                  {/* Formatting Tools */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Format:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const activeTextarea = document.activeElement as HTMLTextAreaElement;
                        if (activeTextarea && activeTextarea.tagName === 'TEXTAREA') {
                          const start = activeTextarea.selectionStart;
                          const end = activeTextarea.selectionEnd;
                          const selectedText = activeTextarea.value.substring(start, end);
                          const newText = activeTextarea.value.substring(0, start) + `**${selectedText}**` + activeTextarea.value.substring(end);
                          const roundId = activeTextarea.id.replace('round-', '');
                          handleTextChange(roundId, newText);
                        }
                      }}
                      className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      title="Bold (Ctrl+B)"
                    >
                      <Bold size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const activeTextarea = document.activeElement as HTMLTextAreaElement;
                        if (activeTextarea && activeTextarea.tagName === 'TEXTAREA') {
                          const start = activeTextarea.selectionStart;
                          const end = activeTextarea.selectionEnd;
                          const selectedText = activeTextarea.value.substring(start, end);
                          const newText = activeTextarea.value.substring(0, start) + `*${selectedText}*` + activeTextarea.value.substring(end);
                          const roundId = activeTextarea.id.replace('round-', '');
                          handleTextChange(roundId, newText);
                        }
                      }}
                      className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      title="Italic (Ctrl+I)"
                    >
                      <Italic size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const activeTextarea = document.activeElement as HTMLTextAreaElement;
                        if (activeTextarea && activeTextarea.tagName === 'TEXTAREA') {
                          const start = activeTextarea.selectionStart;
                          const end = activeTextarea.selectionEnd;
                          const selectedText = activeTextarea.value.substring(start, end);
                          const newText = activeTextarea.value.substring(0, start) + `__${selectedText}__` + activeTextarea.value.substring(end);
                          const roundId = activeTextarea.id.replace('round-', '');
                          handleTextChange(roundId, newText);
                        }
                      }}
                      className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      title="Underline (Ctrl+U)"
                    >
                      <Underline size={12} />
                    </button>
                  </div>
                </div>
                
                {/* Rounds Accordion */}
                {rounds.map((round, index) => {
                  const isExpanded = expandedRounds.includes(round.id);
                  return (
                    <div key={round.id} className="rounded-lg overflow-hidden">
                      {/* Round Header - Always Visible */}
                      <div 
                        className="px-2 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg"
                        onClick={() => toggleRoundExpansion(round.id)}
                      >
                        <div className="flex items-center space-x-3">
                          {/* Expand/Collapse Icon */}
                          {isExpanded ? (
                            <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                          ) : (
                            <ChevronRight size={16} className="text-gray-500 dark:text-gray-400" />
                          )}
                          
                          {/* Round Default Name */}
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Round {index + 1}
                          </span>
                          
                          {/* Custom Name Input */}
                          <input
                            type="text"
                            value={round.name.replace(`Round ${index + 1}`, '').trim()}
                            onChange={(e) => {
                              const baseName = `Round ${index + 1}`;
                              const customName = e.target.value.trim();
                              const fullName = customName ? `${baseName} - ${customName}` : baseName;
                              handleRoundNameChange(round.id, fullName);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-600 dark:text-gray-400 w-32"
                            placeholder="Custom name"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {index < 3 && <span className="text-red-500 dark:text-red-400">*</span>}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {round.content.length} chars
                          </span>
                        </div>
                      </div>

                      {/* Round Content - Expandable */}
                      {isExpanded && (
                        <div className="px-2 py-4">
                          <textarea
                            id={`round-${round.id}`}
                            value={round.content}
                            onChange={(e) => handleTextChange(round.id, e.target.value)}
                            className="w-full h-32 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm leading-relaxed"
                            placeholder={`Describe your experience for ${round.name}...`}
                            onKeyDown={(e) => {
                              if (e.ctrlKey || e.metaKey) {
                                if (e.key === 'b') {
                                  e.preventDefault();
                                  const textarea = e.target as HTMLTextAreaElement;
                                  const start = textarea.selectionStart;
                                  const end = textarea.selectionEnd;
                                  const selectedText = textarea.value.substring(start, end);
                                  const newText = textarea.value.substring(0, start) + `**${selectedText}**` + textarea.value.substring(end);
                                  handleTextChange(round.id, newText);
                                } else if (e.key === 'i') {
                                  e.preventDefault();
                                  const textarea = e.target as HTMLTextAreaElement;
                                  const start = textarea.selectionStart;
                                  const end = textarea.selectionEnd;
                                  const selectedText = textarea.value.substring(start, end);
                                  const newText = textarea.value.substring(0, start) + `*${selectedText}*` + textarea.value.substring(end);
                                  handleTextChange(round.id, newText);
                                } else if (e.key === 'u') {
                                  e.preventDefault();
                                  const textarea = e.target as HTMLTextAreaElement;
                                  const start = textarea.selectionStart;
                                  const end = textarea.selectionEnd;
                                  const selectedText = textarea.value.substring(start, end);
                                  const newText = textarea.value.substring(0, start) + `__${selectedText}__` + textarea.value.substring(end);
                                  handleTextChange(round.id, newText);
                                }
                              }
                            }}
                          />
                          {index < 3 && !round.content.trim() && (
                            <p className="text-red-500 text-xs mt-1">This round is required</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {errors.rounds && (
                  <p className="text-red-500 text-sm flex items-center space-x-1">
                    <AlertCircle size={16} />
                    <span>{errors.rounds}</span>
                  </p>
                )}
              </div>

              {/* Other Discussions */}
              <div>
                <label htmlFor="otherDiscussions" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Share Your Journey & Tips *
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Any additional insights, preparation tips, resources, or advice that helped you succeed? Your fellow students would love to know!
                </p>
                <textarea
                  id="otherDiscussions"
                  name="otherDiscussions"
                  value={formData.otherDiscussions}
                  onChange={(e) => handleInputChange('otherDiscussions', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-y min-h-[100px]"
                  placeholder="e.g., Resources you used, preparation timeline, mistakes to avoid, encouragement for juniors..."
                />
                {errors.otherDiscussions && (
                  <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                    <AlertCircle size={16} />
                    <span>{errors.otherDiscussions}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    isSubmitting
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 transform hover:scale-105 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500 dark:border-gray-400"></div>
                      <span>Submitting Experience...</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>{editingExperience ? 'Update Experience' : 'Share My Experience'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostExperience;
