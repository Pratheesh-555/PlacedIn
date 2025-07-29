import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle, Upload } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import CompanySelector from './CompanySelector';
import { GoogleUser } from '../types';

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
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setUploadProgress(Math.round(percentComplete));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setSubmitted(true);
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
            const errorData = JSON.parse(xhr.responseText);
            throw new Error(errorData.error || 'Failed to submit experience');
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred'));
        });

        xhr.open('POST', API_ENDPOINTS.EXPERIENCES);
        xhr.send(formDataFile);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit experience. Please try again.');
    } finally {
      setIsSubmitting(false);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, document: 'Please upload a PDF or Word document' }));
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, document: 'File size must be less than 5MB' }));
        return;
      }
      
      setSelectedFile(file);
      setErrors(prev => ({ ...prev, document: '' }));
    }
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
              <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-2">
                Upload Experience Document *
              </label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
                selectedFile 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}>
                <input
                  type="file"
                  id="document"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="document" className="cursor-pointer">
                  {selectedFile ? (
                    <div className="animate-pulse">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload size={24} className="text-green-600" />
                      </div>
                      <p className="text-lg font-medium text-green-700 mb-2">
                        ✓ {selectedFile.name}
                      </p>
                      <p className="text-sm text-green-600">
                        File ready for upload ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Click to change file
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        Click to upload document
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF or Word document (max 5MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
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
            {isSubmitting && uploadProgress > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700">Uploading...</span>
                  <span className="text-sm font-medium text-blue-700">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-blue-600 mt-2">Please wait while we upload your document...</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Submitting...'}</span>
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