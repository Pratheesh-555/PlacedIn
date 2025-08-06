import React, { useState } from 'react';
import { FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface ExperienceTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  error?: string;
}

const ExperienceTextEditor: React.FC<ExperienceTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Share your detailed experience here...",
  minLength = 50,
  maxLength = 10000,
  error
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  const isValid = value.length >= minLength;
  const characterCount = value.length;
  const remainingChars = maxLength - characterCount;

  const getCharacterCountColor = () => {
    if (characterCount < minLength) return 'text-red-500 dark:text-red-400';
    if (remainingChars < 100) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-green-500 dark:text-green-400';
  };

  return (
    <div className="w-full space-y-2">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        <FileText size={16} className="inline mr-2" />
        Your Experience Story *
      </label>
      
      <div className={`relative border-2 rounded-lg transition-colors duration-200 ${
        error 
          ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/30' 
          : isFocused 
            ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
            : isValid 
              ? 'border-green-300 dark:border-green-600 bg-white dark:bg-gray-700'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
      }`}>
        <textarea
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full h-64 p-4 bg-transparent border-none outline-none resize-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 text-sm leading-relaxed"
          style={{ 
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
            lineHeight: '1.6'
          }}
        />
        
        {/* Status indicator */}
        <div className="absolute top-3 right-3">
          {isValid ? (
            <CheckCircle size={20} className="text-green-500 dark:text-green-400" />
          ) : (
            <AlertCircle size={20} className="text-gray-400 dark:text-gray-500" />
          )}
        </div>
      </div>

      {/* Character count and validation */}
      <div className="flex justify-between items-center text-xs">
        <div className="space-y-1">
          {characterCount < minLength ? (
            <p className="text-red-500 dark:text-red-400">
              Minimum {minLength} characters required ({minLength - characterCount} more needed)
            </p>
          ) : (
            <p className="text-green-600 dark:text-green-400 flex items-center">
              <CheckCircle size={12} className="mr-1" />
              Great! Your experience looks detailed
            </p>
          )}
          
          {error && (
            <p className="text-red-500 dark:text-red-400 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {error}
            </p>
          )}
        </div>
        
        <div className={`font-medium ${getCharacterCountColor()}`}>
          {characterCount.toLocaleString()} / {maxLength.toLocaleString()}
        </div>
      </div>

      {/* Writing tips */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">💡 Writing Tips:</h4>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Describe the interview process step by step</li>
          <li>• Share specific questions you were asked</li>
          <li>• Mention company culture and work environment</li>
          <li>• Include preparation tips and resources</li>
          <li>• Add salary/stipend details if comfortable</li>
          <li>• Provide advice for future candidates</li>
        </ul>
      </div>
    </div>
  );
};

export default ExperienceTextEditor;
