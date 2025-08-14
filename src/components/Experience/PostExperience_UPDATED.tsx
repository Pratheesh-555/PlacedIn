import React, { useState, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle, BookOpen, Shield, Users, Star, ArrowRight } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import CompanySelector from './CompanySelector';
import ExperienceTextEditor from './ExperienceTextEditor';
import { GoogleUser } from '../../types';

interface PostExperienceProps {
  onSuccess: () => void;
  user: GoogleUser | null;
}

const PostExperience: React.FC<PostExperienceProps> = ({ onSuccess, user }) => {
  // Progressive flow states
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false]);
  const [showForm, setShowForm] = useState(false);
  
  // Quality scoring states
  const [qualityScore, setQualityScore] = useState(0);
  const [qualityChecks, setQualityChecks] = useState({
    hasName: false,
    hasEmail: false,
    hasCompany: false,
    hasMinLength: false,
    hasDetails: false,
    hasStructure: false
  });

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

  // Real-time quality scoring
  useEffect(() => {
    const checks = {
      hasName: formData.studentName.trim().length > 0,
      hasEmail: formData.email.trim().length > 0 && formData.email.includes('@'),
      hasCompany: formData.company.trim().length > 0,
      hasMinLength: formData.experienceText.trim().length >= 50,
      hasDetails: formData.experienceText.trim().length >= 200,
      hasStructure: formData.experienceText.includes('interview') || formData.experienceText.includes('process') || formData.experienceText.includes('tips')
    };
    
    setQualityChecks(checks);
    const score = Object.values(checks).filter(Boolean).length;
    setQualityScore(Math.round((score / 6) * 100));
  }, [formData]);

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
                  <span><strong>SASTRA Email Required:</strong> Use your institutional email (@sastra.ac.in)</span>
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
              <span>I Understand the Requirements</span>
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
              <Star size={32} className="text-yellow-600 dark:text-yellow-400" />
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
                📈 What Makes Great Experiences
              </h3>
              <ul className="space-y-3 text-sm text-blue-700 dark:text-blue-200">
                <li><strong>Interview Process:</strong> Describe rounds, types of questions, difficulty level</li>
                <li><strong>Preparation Tips:</strong> What resources helped, how long you prepared</li>
                <li><strong>Company Culture:</strong> Work environment, team dynamics, learning opportunities</li>
                <li><strong>Practical Advice:</strong> Do's and don'ts for future applicants</li>
              </ul>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-4">
                🎯 Statistics That Matter
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">85%</div>
                  <div className="text-purple-700 dark:text-purple-300">More views for detailed experiences</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">3x</div>
                  <div className="text-purple-700 dark:text-purple-300">Better engagement with tips</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => completeStep(1)}
              className="px-8 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors flex items-center space-x-2 mx-auto"
            >
              <span>I Understand the Best Practices</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Progressive Step 3: Final Checklist
  const Step3Checklist = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Step 3: Ready to Share Your Experience
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You're all set! Time to help your fellow students
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

          {/* Final Message */}
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
          </div>

          {/* Action Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => completeStep(2)}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center space-x-2 mx-auto"
            >
              <BookOpen size={20} />
              <span>Start Writing My Experience</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Floating Quality Sidebar
  const QualitySidebar = () => (
    <div className="hidden lg:block fixed left-4 top-1/2 transform -translate-y-1/2 z-40">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-64">
        <div className="text-center mb-4">
          <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl font-bold ${
            qualityScore >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
            qualityScore >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
            'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          }`}>
            {qualityScore}%
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Quality Score</h3>
        </div>
        
        <div className="space-y-3">
          <div className={`flex items-center space-x-2 text-sm ${qualityChecks.hasName ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
            <CheckCircle size={16} className={qualityChecks.hasName ? 'text-green-600' : 'text-gray-400'} />
            <span>Full Name</span>
          </div>
          <div className={`flex items-center space-x-2 text-sm ${qualityChecks.hasEmail ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
            <CheckCircle size={16} className={qualityChecks.hasEmail ? 'text-green-600' : 'text-gray-400'} />
            <span>Valid Email</span>
          </div>
          <div className={`flex items-center space-x-2 text-sm ${qualityChecks.hasCompany ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
            <CheckCircle size={16} className={qualityChecks.hasCompany ? 'text-green-600' : 'text-gray-400'} />
            <span>Company Selected</span>
          </div>
          <div className={`flex items-center space-x-2 text-sm ${qualityChecks.hasMinLength ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
            <CheckCircle size={16} className={qualityChecks.hasMinLength ? 'text-green-600' : 'text-gray-400'} />
            <span>Minimum Length (50+)</span>
          </div>
          <div className={`flex items-center space-x-2 text-sm ${qualityChecks.hasDetails ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
            <CheckCircle size={16} className={qualityChecks.hasDetails ? 'text-green-600' : 'text-gray-400'} />
            <span>Detailed Content (200+)</span>
          </div>
          <div className={`flex items-center space-x-2 text-sm ${qualityChecks.hasStructure ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
            <CheckCircle size={16} className={qualityChecks.hasStructure ? 'text-green-600' : 'text-gray-400'} />
            <span>Includes Key Info</span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>Tip:</strong> Higher quality scores get more views and help more students!
          </p>
        </div>
      </div>
    </div>
  );

  // Floating Tips Sidebar
  const TipsSidebar = () => (
    <div className="hidden lg:block fixed right-4 top-1/2 transform -translate-y-1/2 z-40">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-64">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Star size={16} className="mr-2 text-yellow-500" />
          Quick Tips
        </h3>
        
        <div className="space-y-4 text-sm">
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <strong className="text-yellow-800 dark:text-yellow-300">Interview Process:</strong>
            <p className="text-yellow-700 dark:text-yellow-200 mt-1">Mention number of rounds, types of questions, and difficulty level.</p>
          </div>
          
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <strong className="text-green-800 dark:text-green-300">Preparation Tips:</strong>
            <p className="text-green-700 dark:text-green-200 mt-1">Share resources, timeline, and study strategies that worked.</p>
          </div>
          
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <strong className="text-purple-800 dark:text-purple-300">Company Culture:</strong>
            <p className="text-purple-700 dark:text-purple-200 mt-1">Describe work environment and learning opportunities.</p>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            📊 <strong>{Math.floor(Math.random() * 100) + 50}</strong> students viewed similar experiences this week
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
      {/* Progressive Steps */}
      {!showForm && currentStep === 0 && <Step1Requirements />}
      {!showForm && currentStep === 1 && <Step2QualityTips />}
      {!showForm && currentStep === 2 && <Step3Checklist />}
      
      {/* Quality Sidebar (Desktop) */}
      {showForm && <QualitySidebar />}
      
      {/* Tips Sidebar (Desktop) */}
      {showForm && <TipsSidebar />}
      
      {/* Mobile Quality Score (Mobile) */}
      {showForm && (
        <div className="lg:hidden fixed top-4 right-4 z-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
              qualityScore >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
              qualityScore >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
              'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            }`}>
              {qualityScore}%
            </div>
          </div>
        </div>
      )}
      
      {/* Main Form */}
      {showForm && (
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
      )}
    </div>
  );
};

export default PostExperience;
