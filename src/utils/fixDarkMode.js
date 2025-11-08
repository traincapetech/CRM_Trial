// Utility script to fix dark mode classes across the application
// This script provides regex patterns and replacement functions

export const darkModeReplacements = [
  // Background replacements
  {
    pattern: /className="([^"]*?)bg-white dark:bg-slate-900(?!\s+dark:)([^"]*?)"/g,
    replacement: 'className="$1bg-white dark:bg-gray-800$2"'
  },
  {
    pattern: /className="([^"]*?)bg-gray-50 dark:bg-slate-800(?!\s+dark:)([^"]*?)"/g,
    replacement: 'className="$1bg-gray-50 dark:bg-gray-700$2"'
  },
  
  // Text color replacements
  {
    pattern: /className="([^"]*?)text-gray-900 dark:text-white(?!\s+dark:)([^"]*?)"/g,
    replacement: 'className="$1text-gray-900 dark:text-white$2"'
  },
  {
    pattern: /className="([^"]*?)text-gray-700 dark:text-gray-300 dark:text-gray-400(?!\s+dark:)([^"]*?)"/g,
    replacement: 'className="$1text-gray-700 dark:text-gray-500$2"'
  },
  {
    pattern: /className="([^"]*?)text-gray-500 dark:text-gray-400(?!\s+dark:)([^"]*?)"/g,
    replacement: 'className="$1text-gray-500 dark:text-gray-500$2"'
  },
  {
    pattern: /className="([^"]*?)text-gray-400 dark:text-gray-500(?!\s+dark:)([^"]*?)"/g,
    replacement: 'className="$1text-gray-400 dark:text-gray-500$2"'
  },
  
  // Border replacements
  {
    pattern: /className="([^"]*?)border-gray-200 dark:border-slate-700(?!\s+dark:)([^"]*?)"/g,
    replacement: 'className="$1border-gray-200 dark:border-gray-600$2"'
  },
  {
    pattern: /className="([^"]*?)border-gray-300 dark:border-slate-600(?!\s+dark:)([^"]*?)"/g,
    replacement: 'className="$1border-gray-300 dark:border-gray-600$2"'
  },
  
  // Divide replacements
  {
    pattern: /className="([^"]*?)divide-gray-200 dark:divide-slate-700(?!\s+dark:)([^"]*?)"/g,
    replacement: 'className="$1divide-gray-200 dark:divide-gray-700$2"'
  }
];

// Function to apply dark mode fixes to a string
export const applyDarkModeFixes = (content) => {
  let fixedContent = content;
  
  darkModeReplacements.forEach(({ pattern, replacement }) => {
    fixedContent = fixedContent.replace(pattern, replacement);
  });
  
  return fixedContent;
};

// Common class combinations for quick replacement
export const commonReplacements = {
  // Card components
  'bg-white dark:bg-slate-900 rounded-lg shadow': 'bg-white dark:bg-gray-800 rounded-lg shadow transition-colors duration-300',
  'bg-white dark:bg-slate-900 rounded-lg shadow-md dark:shadow-xl dark:shadow-black/25': 'bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-xl dark:shadow-black/25 transition-colors duration-300',
  'bg-white dark:bg-slate-900 p-6 rounded-lg shadow-md dark:shadow-xl dark:shadow-black/25': 'bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-xl dark:shadow-black/25 transition-colors duration-300',
  
  // Table components
  'bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700': 'bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300',
  'bg-gray-50 dark:bg-slate-800': 'bg-gray-50 dark:bg-gray-700 transition-colors duration-300',
  
  // Text components
  'text-gray-900 dark:text-white': 'text-gray-900 dark:text-white',
  'text-gray-700 dark:text-gray-300 dark:text-gray-400': 'text-gray-700 dark:text-gray-300',
  'text-gray-500 dark:text-gray-400': 'text-gray-500 dark:text-gray-400',
  
  // Border components
  'border-gray-200 dark:border-slate-700': 'border-gray-200 dark:border-gray-600',
  'border-gray-300 dark:border-slate-600': 'border-gray-300 dark:border-gray-600'
};

// Function to apply common replacements
export const applyCommonReplacements = (content) => {
  let fixedContent = content;
  
  Object.entries(commonReplacements).forEach(([oldClass, newClass]) => {
    const regex = new RegExp(`className="([^"]*?)${oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^"]*?)"`, 'g');
    fixedContent = fixedContent.replace(regex, `className="$1${newClass}$2"`);
  });
  
  return fixedContent;
};

// List of files that need dark mode fixes
export const filesToFix = [
  'src/pages/ProfilePage.jsx',
  'src/pages/RepeatCustomersPage.jsx',
  'src/pages/ManagerDashboard.jsx',
  'src/pages/LeadSalesUpdatePage.jsx',
  'src/pages/SalesPage.jsx',
  'src/pages/SalesCreatePage.jsx',
  'src/pages/TutorialsPage.jsx',
  'src/pages/LeadsPage.jsx',
  'src/pages/LeadSalesSheet.jsx',
  'src/pages/ManagementContactsPage.jsx',
  'src/pages/ProspectsPage.jsx',
  'src/pages/TokenDebugPage.jsx',
  'src/pages/TaskManagementPage.jsx',
  'src/pages/TestNotificationsPage.jsx',
  'src/pages/HomePage.jsx',
  'src/pages/AdminLeadsPage.jsx',
  'src/pages/AdminReportsPage.jsx',
  'src/pages/AdminImportPage.jsx'
];

// Priority fixes for most commonly used components
export const priorityFixes = [
  // Modal backgrounds
  {
    find: 'className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out-colors duration-300'
  },
  
  // Table headers
  {
    find: 'className="bg-gray-50 dark:bg-slate-800', replace: 'className="bg-gray-50 dark:bg-gray-700 transition-colors duration-300'
  },
  
  // Card containers
  {
    find: 'className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out-colors duration-300'
  },
  
  // Form inputs
  {
    find: 'className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md', replace: 'className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300'
  }
];

export default {
  darkModeReplacements,
  applyDarkModeFixes,
  commonReplacements,
  applyCommonReplacements,
  filesToFix,
  priorityFixes
}; 