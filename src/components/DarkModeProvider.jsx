import React from 'react';
import { useTheme } from '../hooks/useTheme';

// Higher-order component to automatically apply dark mode classes
const DarkModeProvider = ({ children, className = "", ...props }) => {
  const { theme } = useTheme();
  
  // Automatically add dark mode classes based on existing classes
  const enhanceClassName = (originalClassName) => {
    if (!originalClassName) return "transition-colors duration-300";
    
    let enhanced = originalClassName;
    
    // Add transition if not present
    if (!enhanced.includes('transition')) {
      enhanced += ' transition-colors duration-300';
    }
    
    // Auto-enhance common patterns
    const enhancements = {
      'bg-white dark:bg-slate-900': 'bg-white dark:bg-gray-800',
      'bg-gray-50 dark:bg-slate-800': 'bg-gray-50 dark:bg-gray-700',
      'text-gray-900 dark:text-white': 'text-gray-900 dark:text-white',
      'text-gray-700 dark:text-gray-300 dark:text-gray-400': 'text-gray-700 dark:text-gray-300',
      'text-gray-500 dark:text-gray-400': 'text-gray-500 dark:text-gray-400',
      'border-gray-200 dark:border-slate-700': 'border-gray-200 dark:border-gray-600',
      'border-gray-300 dark:border-slate-600': 'border-gray-300 dark:border-gray-600',
      'divide-gray-200 dark:divide-slate-700': 'divide-gray-200 dark:divide-gray-700'
    };
    
    Object.entries(enhancements).forEach(([pattern, replacement]) => {
      if (enhanced.includes(pattern) && !enhanced.includes('dark:')) {
        enhanced = enhanced.replace(pattern, replacement);
      }
    });
    
    return enhanced;
  };
  
  const enhancedClassName = enhanceClassName(className);
  
  return (
    <div className={enhancedClassName} {...props}>
      {children}
    </div>
  );
};

// Hook to get enhanced classes
export const useDarkModeClasses = (baseClasses) => {
  const { theme } = useTheme();
  
  const enhanceClasses = (classes) => {
    if (!classes) return "transition-colors duration-300";
    
    let enhanced = classes;
    
    // Add transition
    if (!enhanced.includes('transition')) {
      enhanced += ' transition-colors duration-300';
    }
    
    // Common dark mode patterns
    const patterns = [
      { from: /bg-white dark:bg-slate-900(?!\s+dark:)/g, to: 'bg-white dark:bg-gray-800' },
      { from: /bg-gray-50 dark:bg-slate-800(?!\s+dark:)/g, to: 'bg-gray-50 dark:bg-gray-700' },
      { from: /text-gray-900 dark:text-white(?!\s+dark:)/g, to: 'text-gray-900 dark:text-white' },
      { from: /text-gray-700 dark:text-gray-300 dark:text-gray-400(?!\s+dark:)/g, to: 'text-gray-700 dark:text-gray-300' },
      { from: /text-gray-500 dark:text-gray-400(?!\s+dark:)/g, to: 'text-gray-500 dark:text-gray-400' },
      { from: /border-gray-200 dark:border-slate-700(?!\s+dark:)/g, to: 'border-gray-200 dark:border-gray-600' },
      { from: /border-gray-300 dark:border-slate-600(?!\s+dark:)/g, to: 'border-gray-300 dark:border-gray-600' },
      { from: /divide-gray-200 dark:divide-slate-700(?!\s+dark:)/g, to: 'divide-gray-200 dark:divide-gray-700' }
    ];
    
    patterns.forEach(({ from, to }) => {
      enhanced = enhanced.replace(from, to);
    });
    
    return enhanced;
  };
  
  return enhanceClasses(baseClasses);
};

export default DarkModeProvider; 