import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import CompanySelector from './CompanySelector';
import CloudinaryUpload from '../CloudinaryUpload';
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
    type: 'placement' as 'placement' | 'internship'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setErrors({});
    setUploadProgress(0);

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.studentName.trim()) newErrors.studentName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.company.trim()) newErrors.company = 'Company is required';
    if (!selectedFile) newErrors.document = 'Please upload a document';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Small delay to show "Preparing upload..." state
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      // Submit the experience with the file directly using XMLHttpRequest for progress
      const formDataFile = new FormData();
      if (selectedFile) {
        formDataFile.append('document', selectedFile);
      }
      
      // Add other form data
      Object.entries(formData).forEach(([key, value]) => {
        formDataFile.append(key, value.toString());
      });
      
      // Add user data
      if (user) {
        formDataFile.append('postedBy', JSON.stringify({
          googleId: user.googleId,
          name: user.name,
          email: user.email,
          picture: user.picture
        }));
      }

      // Use XMLHttpRequest for upload progress
      const xhr = new XMLHttpRequest();
      
      // Set initial progress to show the bar
      setUploadProgress(1);
      
      await new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setUploadProgress(Math.round(percentComplete));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setSubmitted(true);
            setIsSubmitting(false); // Move here
            onSuccess();
            setTimeout(() => {
              setSubmitted(false);
              setFormData({
                studentName: user?.name || '',
                email: user?.email || '',
                company: '',
                graduationYear: new Date().getFullYear(),
                type: 'placement'
              });
              setSelectedFile(null);
              setUploadProgress(0);
            }, 3000);
            resolve(xhr.response);
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              setError(errorData.error || 'Failed to submit experience');
            } catch {
              setError('Failed to submit experience. Please try again.');
            }
            setIsSubmitting(false); // Move here
            setUploadProgress(0);
            reject(new Error('Failed to submit experience'));
          }
        });

        xhr.addEventListener('error', () => {
          setError('Network error occurred. Please try again.');
          setIsSubmitting(false); // Move here
          setUploadProgress(0);
          reject(new Error('Network error occurred'));
        });

        xhr.open('POST', API_ENDPOINTS.EXPERIENCES);
        xhr.send(formDataFile);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit experience. Please try again.');
      setIsSubmitting(false); // Also here for any other errors
      setUploadProgress(0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'graduationYear' ? parseInt(value) : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileUploadSuccess = (file: File) => {
    setSelectedFile(file);
    setErrors(prev => ({ ...prev, document: '' }));
  };

  const handleFileUploadError = (error: string) => {
    setErrors(prev => ({ ...prev, document: error }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-900 mb-4">Experience Submitted!</h2>
          <p className="text-gray-600">
            Thank you for sharing your experience. It will be reviewed and published soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-4">Share Your Experience</h1>
          <p className="text-gray-600">
            Help fellow students by sharing your placement or internship journey
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="studentName"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.studentName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.studentName && (
                  <p className="text-red-500 text-sm mt-1">{errors.studentName}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <CompanySelector
                value={formData.company}
                onChange={(company) => {
                  setFormData(prev => ({ ...prev, company }));
                  if (errors.company) {
                    setErrors(prev => ({ ...prev, company: '' }));
                  }
                }}
                error={errors.company}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 mb-2">
                  Graduation Year *
                </label>
                <select
                  id="graduationYear"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="placement">Placement</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Experience Document *
              </label>
              <CloudinaryUpload
                onUploadSuccess={handleFileUploadSuccess}
                onUploadError={handleFileUploadError}
                uploadLabel="Upload Experience Document"
                maxSize={5}
              />
              {errors.document && (
                <p className="text-red-500 text-sm mt-1">{errors.document}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle size={20} className="text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {/* Upload Progress Bar */}
            {isSubmitting && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-lg font-semibold text-blue-800">
                      {uploadProgress === 0 || uploadProgress === 1 ? 'Preparing upload...' : 
                       uploadProgress < 100 ? 'Uploading your document' : 'Processing...'}
                    </span>
                  </div>
                  <span className="text-xl font-bold text-blue-800">{uploadProgress}%</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-blue-200 rounded-full h-4 mb-3 overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-300 ease-out shadow-sm"
                    style={{ width: `${Math.max(uploadProgress, 2)}%` }}
                  >
                    <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                  </div>
                </div>
                
                {/* Progress Text */}
                <div className="flex justify-between text-sm text-blue-700">
                  <span>
                    {(uploadProgress === 0 || uploadProgress === 1) && 'Getting ready...'}
                    {uploadProgress > 1 && uploadProgress < 30 && 'Starting upload...'}
                    {uploadProgress >= 30 && uploadProgress < 70 && 'Uploading document...'}
                    {uploadProgress >= 70 && uploadProgress < 100 && 'Almost done...'}
                    {uploadProgress === 100 && 'Processing...'}
                  </span>
                  <span>{uploadProgress < 100 ? 'Please wait' : 'Finalizing'}</span>
                </div>
                
                {uploadProgress > 1 && (
                  <p className="text-xs text-blue-600 mt-3 text-center font-medium">
                    📄 Your experience is being uploaded securely
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                isSubmitting 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 transform'
              } text-white shadow-lg`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>
                    {uploadProgress === 0 && 'Preparing...'}
                    {uploadProgress > 0 && uploadProgress < 100 && `Uploading ${uploadProgress}%`}
                    {uploadProgress === 100 && 'Processing...'}
                  </span>
                </>
              ) : (
                <>
                  <Send size={20} />
                  <span>Submit Experience</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostExperience;