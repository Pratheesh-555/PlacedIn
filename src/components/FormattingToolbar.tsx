import React, { useEffect, useCallback } from 'react';
import { Bold, Italic, Underline, Link } from 'lucide-react';

interface FormattingToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  textareaRef,
  value,
  onChange,
  className = ''
}) => {

  const applyFormat = useCallback((format: 'bold' | 'italic' | 'underline' | 'link') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let formattedText = '';
    let newCursorPos = start;

    switch (format) {
      case 'bold':
        if (selectedText) {
          formattedText = `**${selectedText}**`;
          newCursorPos = start + formattedText.length;
        } else {
          formattedText = '****';
          newCursorPos = start + 2; // Position cursor between asterisks
        }
        break;
      
      case 'italic':
        if (selectedText) {
          formattedText = `*${selectedText}*`;
          newCursorPos = start + formattedText.length;
        } else {
          formattedText = '**';
          newCursorPos = start + 1; // Position cursor between asterisks
        }
        break;
      
      case 'underline':
        if (selectedText) {
          formattedText = `_${selectedText}_`;
          newCursorPos = start + formattedText.length;
        } else {
          formattedText = '__';
          newCursorPos = start + 1; // Position cursor between underscores
        }
        break;
      
      case 'link':
        if (selectedText) {
          formattedText = `[${selectedText}](url)`;
          newCursorPos = start + formattedText.length - 4; // Position at 'url'
        } else {
          formattedText = '[text](url)';
          newCursorPos = start + 1; // Position at 'text'
        }
        break;
    }

    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    onChange(newValue);

    // Set cursor position after state update
    setTimeout(() => {
      textarea.focus();
      if (format === 'link' && !selectedText) {
        textarea.setSelectionRange(start + 1, start + 5); // Select 'text'
      } else {
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [value, onChange, textareaRef]);

  const formatButtons = [
    { id: 'bold', icon: Bold, label: 'Bold (Ctrl+B)', shortcut: 'Ctrl+B' },
    { id: 'italic', icon: Italic, label: 'Italic (Ctrl+I)', shortcut: 'Ctrl+I' },
    { id: 'underline', icon: Underline, label: 'Underline', shortcut: '' },
    { id: 'link', icon: Link, label: 'Add Link', shortcut: '' },
  ];

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            applyFormat('bold');
            break;
          case 'i':
            e.preventDefault();
            applyFormat('italic');
            break;
        }
      }
    };

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('keydown', handleKeyDown);
      return () => textarea.removeEventListener('keydown', handleKeyDown);
    }
  }, [applyFormat, textareaRef]);

  return (
    <div className={`flex items-center space-x-1 p-2 bg-gray-50 dark:bg-gray-700 rounded-t-lg border-b border-gray-200 dark:border-gray-600 ${className}`}>
      {formatButtons.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => applyFormat(id as 'bold' | 'italic' | 'underline' | 'link')}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300`}
          title={label}
          aria-label={label}
        >
          <Icon size={16} />
        </button>
      ))}
      
      {/* Format Guide */}
      <div className="hidden sm:flex ml-4 text-xs text-gray-500 dark:text-gray-400 space-x-4">
        <span>**bold**</span>
        <span>*italic*</span>
        <span>_underline_</span>
        <span>[link](url)</span>
      </div>
    </div>
  );
};

export default FormattingToolbar;
