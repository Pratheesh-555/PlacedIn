import React from 'react';

/**
 * Convert URLs in text to clickable links that open in new tabs
 * @param text - Plain text that may contain URLs
 * @returns HTML string with clickable links
 */
export const linkifyText = (text: string): string => {
  if (!text) return '';
  
  // Regex to detect URLs (http, https, www)
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  
  return text.replace(urlRegex, (url) => {
    // Ensure URL has protocol
    const href = url.startsWith('http') ? url : `https://${url}`;
    
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors">${url}</a>`;
  });
};

/**
 * React component to render text with clickable links
 */
export const LinkifiedText: React.FC<{ 
  children: string; 
  className?: string; 
}> = ({ children, className = '' }) => {
  const htmlContent = linkifyText(children);
  
  return (
    <div 
      className={`whitespace-pre-wrap ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};
