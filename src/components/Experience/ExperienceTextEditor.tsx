import React, { useState, useRef } from 'react';
import { 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Quote,
  Type,
  Eye,
  Edit3
} from 'lucide-react';

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
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  const insertText = (before: string, after: string = '') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    if (newText.length <= maxLength) {
      onChange(newText);
      
      // Set cursor position after insertion
      setTimeout(() => {
        if (textarea) {
          const newCursorPos = start + before.length + selectedText.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
          textarea.focus();
        }
      }, 0);
    }
  };

  const formatText = (type: string) => {
    switch (type) {
      case 'bold':
        insertText('**', '**');
        break;
      case 'italic':
        insertText('*', '*');
        break;
      case 'bullet':
        insertText('\n• ');
        break;
      case 'numbered':
        insertText('\n1. ');
        break;
      case 'quote':
        insertText('\n> ');
        break;
      case 'heading':
        insertText('\n## ');
        break;
    }
  };

  // Function to render markdown-like text for preview
  const renderPreview = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^## (.*$)/gm, '<h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">$1</h3>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-blue-300 pl-4 italic text-gray-600 dark:text-gray-400 my-2">$1</blockquote>')
      .replace(/^• (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/\n/g, '<br>');
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
    <div className="w-full space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          <FileText size={16} className="inline mr-2" />
          Your Experience Story *
        </label>
        
        {/* Preview Toggle */}
        <button
          type="button"
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            isPreviewMode 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          {isPreviewMode ? <Edit3 size={14} /> : <Eye size={14} />}
          <span>{isPreviewMode ? 'Edit' : 'Preview'}</span>
        </button>
      </div>
      
      {!isPreviewMode && (
        <>
          {/* Formatting Toolbar */}
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-t-lg">
            <div className="flex flex-wrap gap-1">
              {/* Text Formatting */}
              <button
                type="button"
                onClick={() => formatText('bold')}
                className="p-2 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm rounded-md transition-colors duration-200 group"
                title="Bold (Ctrl+B)"
              >
                <Bold size={16} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </button>
              
              <button
                type="button"
                onClick={() => formatText('italic')}
                className="p-2 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm rounded-md transition-colors duration-200 group"
                title="Italic (Ctrl+I)"
              >
                <Italic size={16} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </button>
              
              <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
              
              {/* Lists */}
              <button
                type="button"
                onClick={() => formatText('bullet')}
                className="p-2 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm rounded-md transition-colors duration-200 group"
                title="Bullet List"
              >
                <List size={16} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </button>
              
              <button
                type="button"
                onClick={() => formatText('numbered')}
                className="p-2 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm rounded-md transition-colors duration-200 group"
                title="Numbered List"
              >
                <ListOrdered size={16} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </button>
              
              <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
              
              {/* Content Types */}
              <button
                type="button"
                onClick={() => formatText('quote')}
                className="p-2 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm rounded-md transition-colors duration-200 group"
                title="Quote"
              >
                <Quote size={16} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </button>
              
              <button
                type="button"
                onClick={() => formatText('heading')}
                className="p-2 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm rounded-md transition-colors duration-200 group"
                title="Heading"
              >
                <Type size={16} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </button>
            </div>
          </div>

          {/* Text Area */}
          <div className={`relative border-2 border-t-0 rounded-b-lg transition-colors duration-200 ${
            error 
              ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/30' 
              : isFocused 
                ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                : isValid 
                  ? 'border-green-300 dark:border-green-600 bg-white dark:bg-gray-700'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
          }`}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className="w-full h-64 sm:h-80 p-4 bg-transparent border-none outline-none resize-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 text-sm leading-relaxed"
              style={{ 
                fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
                lineHeight: '1.6'
              }}
              onKeyDown={(e) => {
                if (e.ctrlKey || e.metaKey) {
                  switch (e.key) {
                    case 'b':
                      e.preventDefault();
                      formatText('bold');
                      break;
                    case 'i':
                      e.preventDefault();
                      formatText('italic');
                      break;
                  }
                }
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
        </>
      )}

      {/* Preview Mode */}
      {isPreviewMode && (
        <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 p-4 min-h-[16rem]">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center">
            <Eye size={14} className="mr-1" />
            Preview Mode
          </div>
          <div 
            className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300"
            dangerouslySetInnerHTML={{ 
              __html: value.trim() ? renderPreview(value) : '<p class="text-gray-400 italic">Your formatted experience will appear here...</p>' 
            }}
          />
        </div>
      )}

      {/* Character count and validation */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs">
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

      {/* Enhanced Writing Tips */}
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3">
          💡 Writing Tips & Formatting Help
        </h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h5 className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">Content Ideas:</h5>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Interview process & specific questions</li>
              <li>• Company culture & work environment</li>
              <li>• Preparation tips & resources used</li>
              <li>• Salary/stipend details (if comfortable)</li>
              <li>• Advice for future candidates</li>
            </ul>
          </div>
          
          <div>
            <h5 className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">Formatting:</h5>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• **Bold text** for emphasis</li>
              <li>• *Italic text* for highlights</li>
              <li>• ## Headings for sections</li>
              <li>• {`>`} Quotes for important notes</li>
              <li>• • Bullet points for lists</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceTextEditor;
