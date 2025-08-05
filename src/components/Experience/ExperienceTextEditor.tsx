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
    if (characterCount < minLength) return 'text-red-500';
    if (remainingChars < 100) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="w-full space-y-2">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        <FileText size={16} className="inline mr-2" />
        Your Experience Story *
      </label>
      
      <div className={`relative border-2 rounded-lg transition-colors duration-200 ${
        error 
          ? 'border-red-300 bg-red-50' 
          : isFocused 
            ? 'border-blue-400 bg-blue-50' 
            : isValid 
              ? 'border-green-300 bg-white'
              : 'border-gray-300 bg-white'
      }`}>
        <textarea
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full h-64 p-4 bg-transparent border-none outline-none resize-none text-gray-700 placeholder-gray-400 text-sm leading-relaxed"
          style={{ 
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
            lineHeight: '1.6'
          }}
        />
        
        {/* Status indicator */}
        <div className="absolute top-3 right-3">
          {isValid ? (
            <CheckCircle size={20} className="text-green-500" />
          ) : (
            <AlertCircle size={20} className="text-gray-400" />
          )}
        </div>
      </div>

      {/* Character count and validation */}
      <div className="flex justify-between items-center text-xs">
        <div className="space-y-1">
          {characterCount < minLength ? (
            <p className="text-red-500">
              Minimum {minLength} characters required ({minLength - characterCount} more needed)
            </p>
          ) : (
            <p className="text-green-600 flex items-center">
              <CheckCircle size={12} className="mr-1" />
              Great! Your experience looks detailed
            </p>
          )}
          
          {error && (
            <p className="text-red-500 flex items-center">
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
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Writing Tips:</h4>
        <ul className="text-xs text-blue-700 space-y-1">
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
