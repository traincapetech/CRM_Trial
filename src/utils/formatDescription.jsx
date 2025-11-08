import React from 'react';

/**
 * Formats a description text with proper numbering and bullet points
 * Detects numbered lists (1., 2., 3., etc.) and bullet points (-, *, •)
 * and renders them as proper HTML lists
 */
export const formatDescription = (description) => {
  if (!description) return null;

  // Split by newlines
  const lines = description.split('\n').filter(line => line.trim().length > 0);
  
  if (lines.length === 0) return null;

  // Check if it's a numbered list (starts with number followed by period or parenthesis)
  const isNumberedList = lines.some(line => {
    const trimmed = line.trim();
    return /^\d+[\.\)]\s/.test(trimmed);
  });

  // Check if it's a bullet list (starts with -, *, •, or similar)
  const isBulletList = lines.some(line => {
    const trimmed = line.trim();
    return /^[-*•]\s/.test(trimmed);
  });

  // If it's a numbered list, render as ordered list
  if (isNumberedList) {
    return (
      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300 ml-4">
        {lines.map((line, idx) => {
          // Remove the number prefix (e.g., "1. " or "1) ")
          const cleanedLine = line.trim().replace(/^\d+[\.\)]\s*/, '');
          
          // Check if line has sub-items with colons (e.g., "User Management: description")
          const hasSubItems = /^[A-Za-z\s]+:/.test(cleanedLine);
          
          if (hasSubItems) {
            // Split by colon to get main item and sub-items
            const colonIndex = cleanedLine.indexOf(':');
            const mainItem = cleanedLine.substring(0, colonIndex).trim();
            const subItemsText = cleanedLine.substring(colonIndex + 1).trim();
            
            return (
              <li key={idx} className="mb-3">
                <div className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  {mainItem}:
                </div>
                {subItemsText && (
                  <div className="ml-4 text-gray-600 dark:text-gray-400">
                    {subItemsText}
                  </div>
                )}
              </li>
            );
          }
          
          return (
            <li key={idx} className="mb-2">
              {cleanedLine}
            </li>
          );
        })}
      </ol>
    );
  }

  // If it's a bullet list, render as unordered list
  if (isBulletList) {
    return (
      <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
        {lines.map((line, idx) => {
          // Remove the bullet prefix
          const cleanedLine = line.trim().replace(/^[-*•]\s*/, '');
          
          return (
            <li key={idx} className="mb-1">
              {cleanedLine}
            </li>
          );
        })}
      </ul>
    );
  }

  // If it's plain text with line breaks, preserve them
  return (
    <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
      {description}
    </div>
  );
};

