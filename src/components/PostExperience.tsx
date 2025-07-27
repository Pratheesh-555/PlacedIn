import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle, Upload, FileText } from 'lucide-react';
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
    experienceText: '',
    type: 'placement' as 'placement' | 'internship'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (!formData.experienceText.trim()) newErrors.experienceText = 'Experience text is required';
    if (formData.experienceText.length < 100) {
      newErrors.experienceText = 'Experience text must be at least 100 characters';
    }
    if (!selectedFile) newErrors.document = 'Please upload a document';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // First upload the document
      const formDataFile = new FormData();
      if (selectedFile) {
        formDataFile.append('document', selectedFile);
      }

      const uploadResponse = await fetch(`${API_ENDPOINTS.EXPERIENCES}/upload`, {
        method: 'POST',
        body: formDataFile,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload document');
      }

      const uploadResult = await uploadResponse.json();

      // Then submit the experience
             const experienceData = {
         ...formData,
         documentUrl: uploadResult.documentUrl,
         documentName: selectedFile?.name || '',
         postedBy: {
           googleId: user?.googleId,
           name: user?.name,
           email: user?.email,
           picture: user?.picture
         }
       };

      const response = await fetch(API_ENDPOINTS.EXPERIENCES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(experienceData),
      });

      if (response.ok) {
        setSubmitted(true);
        onSuccess();
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            studentName: user?.name || '',
            email: user?.email || '',
            company: '',
            graduationYear: new Date().getFullYear(),
            experienceText: '',
            type: 'placement'
          });
          setSelectedFile(null);
        }, 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit experience');
      }
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
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  id="document"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="document" className="cursor-pointer">
                  <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    {selectedFile ? selectedFile.name : 'Click to upload document'}
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF or Word document (max 5MB)
                  </p>
                </label>
              </div>
              {errors.document && (
                <p className="text-red-500 text-sm mt-1">{errors.document}</p>
              )}
            </div>

            <div>
              <label htmlFor="experienceText" className="block text-sm font-medium text-gray-700 mb-2">
                Experience Summary *
              </label>
              <textarea
                id="experienceText"
                name="experienceText"
                value={formData.experienceText}
                onChange={handleChange}
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.experienceText ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Provide a brief summary of your experience (minimum 100 characters)..."
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  {formData.experienceText.length}/5000 characters
                </span>
                {errors.experienceText && (
                  <span className="text-red-500 text-sm">{errors.experienceText}</span>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle size={20} className="text-red-500" />
                <span className="text-red-700">{error}</span>
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
                  <span>Submitting...</span>
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