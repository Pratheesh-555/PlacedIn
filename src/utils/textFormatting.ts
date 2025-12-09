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
    const href = url.startsWith('http') ? url : `https://${url}`;
    
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors">${url}</a>`;
  });
};

/**
 * Convert markdown formatting to HTML
 * @param text - Text with markdown formatting
 * @returns HTML string with formatted text
 */
export const formatMarkdown = (text: string): string => {
  if (!text) return '';
  
  let formatted = text;
  
  formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, linkText, url) => {
    const href = url.startsWith('http') ? url : `https://${url}`;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors">${linkText}</a>`;
  });
  
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
  
  formatted = formatted.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em class="italic">$1</em>');
  
  formatted = formatted.replace(/_(.*?)_/g, '<u class="underline">$1</u>');
  
  formatted = linkifyText(formatted);
  
  return formatted;
};
