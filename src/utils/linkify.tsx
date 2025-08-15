import React from 'react';
import { formatMarkdown, linkifyText } from './textFormatting';

/**
 * React component to render text with markdown formatting and clickable links
 */
export const FormattedText: React.FC<{ 
  children: string; 
  className?: string; 
}> = ({ children, className = '' }) => {
  const htmlContent = formatMarkdown(children);
  
  return (
    <div 
      className={`whitespace-pre-wrap ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

/**
 * React component to render text with clickable links only
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
