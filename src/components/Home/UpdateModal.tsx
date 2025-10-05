import React from 'react';
import { X } from 'lucide-react';

interface Update {
  _id: string;
  title: string;
  content: string;
  companyName: string;
  createdAt: string;
  viewCount: number;
}

interface UpdateModalProps {
  update: Update;
  onClose: () => void;
}

const UpdateModal: React.FC<UpdateModalProps> = ({ update, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex-1">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
              {update.companyName}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {update.title}
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {new Date(update.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div
              className="whitespace-pre-wrap text-gray-900 dark:text-gray-100 leading-relaxed"
              style={{
                fontFamily: 'inherit',
                fontSize: '1rem',
                lineHeight: '1.75'
              }}
            >
              {update.content}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateModal;
