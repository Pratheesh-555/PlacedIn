import React, { useEffect } from 'react';
import { X, Calendar, User, Mail, Linkedin } from 'lucide-react';
import { Experience } from '../../types';
import { FormattedText } from '../../utils/linkify';

interface ExperienceModalProps {
  experience: Experience;
  onClose: () => void;
}

const ExperienceModal: React.FC<ExperienceModalProps> = ({ experience, onClose }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 dark:bg-blue-700 text-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{experience.company}</h2>
              <div className="flex items-center space-x-6 text-blue-100 dark:text-blue-200">
                <div className="flex items-center space-x-2">
                  <User size={16} />
                  <span>{experience.studentName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Class of {experience.graduationYear}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="capitalize">{experience.type}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-700 dark:hover:bg-blue-600 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="prose max-w-none">
            <FormattedText className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {experience.experienceText}
            </FormattedText>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div>
                Posted on {new Date(experience.createdAt || '').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center space-x-4">
                <span>Contact:</span>
                <div className="flex items-center space-x-3">
                  <a 
                    href={`mailto:${experience.email}`}
                    className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                    title="Send Email"
                  >
                    <Mail size={16} />
                    <span>Email</span>
                  </a>
                  {experience.linkedinUrl && (
                    <a 
                      href={experience.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                      title="View LinkedIn Profile"
                    >
                      <Linkedin size={16} />
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceModal;
