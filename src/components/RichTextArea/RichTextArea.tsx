import React, { useRef } from 'react';
import FormattingToolbar from '../FormattingToolbar';

interface RichTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  disabled?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
  error?: string;
}

const RichTextArea: React.FC<RichTextAreaProps> = ({
  value,
  onChange,
  placeholder = '',
  className = '',
  rows = 4,
  disabled = false,
  id,
  name,
  required = false,
  error
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${
      error ? 'border-red-300 dark:border-red-600' : ''
    } ${className}`}>
      {/* Formatting Toolbar */}
      <FormattingToolbar
        textareaRef={textareaRef}
        value={value}
        onChange={onChange}
      />
      
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        required={required}
        className={`w-full px-4 py-3 resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border-0 rounded-none ${
          disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
        }`}
        style={{ minHeight: '100px' }}
      />
      
      {/* Format Guide - Mobile */}
      <div className="sm:hidden px-4 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="text-xs text-gray-500 dark:text-gray-400 space-x-4">
          <span>**bold**</span>
          <span>*italic*</span>
          <span>_underline_</span>
          <span>[link](url)</span>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="px-4 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-t border-red-200 dark:border-red-800">
          {error}
        </p>
      )}
    </div>
  );
};

export default RichTextArea;
