// Professional Dark Mode Color System
// Following industry standards from GitHub, Discord, Notion, and modern design systems

export const professionalColors = {
  // Light mode colors
  light: {
    // Backgrounds
    bg: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      elevated: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.1)',
      glass: 'rgba(255, 255, 255, 0.8)',
    },
    // Text colors
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#64748b',
      muted: '#94a3b8',
      inverse: '#ffffff',
      accent: '#3b82f6',
    },
    // Border colors
    border: {
      primary: '#e2e8f0',
      secondary: '#cbd5e1',
      focus: '#3b82f6',
      error: '#ef4444',
      success: '#10b981',
    },
    // Interactive states
    interactive: {
      hover: '#f1f5f9',
      active: '#e2e8f0',
      disabled: '#f8fafc',
    }
  },
  
  // Dark mode colors (professional palette)
  dark: {
    // Backgrounds - Using sophisticated grays, not pure black
    bg: {
      primary: '#0f1419',      // Deep blue-gray (like GitHub)
      secondary: '#161b22',    // Slightly lighter
      tertiary: '#21262d',     // Card backgrounds
      elevated: '#30363d',     // Elevated elements
      overlay: 'rgba(0, 0, 0, 0.6)',
      glass: 'rgba(15, 20, 25, 0.8)',
    },
    // Text colors - High contrast, easy on eyes
    text: {
      primary: '#f0f6fc',      // Soft white
      secondary: '#c9d1d9',    // Light gray
      tertiary: '#8b949e',     // Medium gray
      muted: '#6e7681',        // Muted gray
      inverse: '#0f172a',      // Dark for light backgrounds
      accent: '#58a6ff',       // Bright blue accent
    },
    // Border colors
    border: {
      primary: '#30363d',
      secondary: '#21262d',
      focus: '#58a6ff',
      error: '#f85149',
      success: '#3fb950',
    },
    // Interactive states
    interactive: {
      hover: '#21262d',
      active: '#30363d',
      disabled: '#161b22',
    }
  }
};

// Professional component classes
export const professionalClasses = {
  // Card components
  card: {
    light: 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-lg dark:shadow-black/25 hover:shadow-md dark:shadow-xl dark:shadow-black/25 transition-all duration-200',
    dark: 'bg-gray-900 border border-gray-800 shadow-lg dark:shadow-2xl dark:shadow-black/25 hover:shadow-xl transition-all duration-200',
    unified: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-lg dark:shadow-2xl dark:shadow-black/25 hover:shadow-md dark:hover:shadow-xl transition-all duration-200'
  },
  
  // Text components
  text: {
    heading: 'text-gray-900 dark:text-gray-100 font-semibold',
    body: 'text-gray-700 dark:text-gray-300',
    muted: 'text-gray-500 dark:text-gray-400',
    accent: 'text-blue-600 dark:text-blue-400',
    inverse: 'text-white dark:text-gray-900 dark:text-white'
  },
  
  // Background components
  background: {
    primary: 'bg-white dark:bg-gray-900',
    secondary: 'bg-gray-50 dark:bg-gray-800',
    tertiary: 'bg-gray-100 dark:bg-gray-700',
    elevated: 'bg-white dark:bg-gray-800',
    overlay: 'bg-black/10 dark:bg-black/60'
  },
  
  // Interactive components
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-sm dark:shadow-lg dark:shadow-black/25 hover:shadow-md dark:shadow-xl dark:shadow-black/25 transition-all duration-200',
    secondary: 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 transition-all duration-200',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all duration-200'
  },
  
  // Form components
  input: {
    base: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200',
    error: 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400',
    success: 'border-green-500 dark:border-green-400 focus:ring-green-500 dark:focus:ring-green-400'
  },
  
  // Table components
  table: {
    container: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden shadow-sm dark:shadow-lg dark:shadow-2xl dark:shadow-black/25',
    header: 'bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700',
    row: 'border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150',
    cell: 'text-gray-900 dark:text-gray-100'
  },
  
  // Navigation components
  nav: {
    primary: 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-lg dark:shadow-2xl dark:shadow-black/25',
    sidebar: 'bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
    link: 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200'
  },
  
  // Status indicators
  status: {
    success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
  }
};

// Professional transitions
export const transitions = {
  fast: 'transition-all duration-150 ease-out',
  normal: 'transition-all duration-200 ease-out',
  slow: 'transition-all duration-300 ease-out',
  colors: 'transition-colors duration-200 ease-out',
  transform: 'transition-transform duration-200 ease-out',
  shadow: 'transition-shadow duration-200 ease-out'
};

// Professional shadows
export const shadows = {
  light: {
    sm: 'shadow-sm dark:shadow-lg dark:shadow-black/25',
    md: 'shadow-md dark:shadow-xl dark:shadow-black/25',
    lg: 'shadow-lg dark:shadow-2xl dark:shadow-black/25',
    xl: 'shadow-xl'
  },
  dark: {
    sm: 'shadow-lg dark:shadow-2xl dark:shadow-black/25 shadow-black/25',
    md: 'shadow-xl shadow-black/25',
    lg: 'shadow-2xl shadow-black/25',
    xl: 'shadow-2xl shadow-black/30'
  },
  unified: {
    sm: 'shadow-sm dark:shadow-lg dark:shadow-black/25',
    md: 'shadow-md dark:shadow-xl dark:shadow-black/25',
    lg: 'shadow-lg dark:shadow-2xl dark:shadow-black/25',
    xl: 'shadow-xl dark:shadow-2xl dark:shadow-black/30'
  }
};

// Helper function to get professional classes
export const getProClass = (component, variant = 'unified') => {
  return professionalClasses[component]?.[variant] || '';
};

// Helper function to combine classes with transitions
export const combineClasses = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Professional color palette for specific use cases
export const colorPalette = {
  // Brand colors
  brand: {
    primary: 'bg-blue-600 dark:bg-blue-500',
    secondary: 'bg-indigo-600 dark:bg-indigo-500',
    accent: 'bg-purple-600 dark:bg-purple-500'
  },
  
  // Semantic colors
  semantic: {
    success: 'bg-green-600 dark:bg-green-500',
    warning: 'bg-yellow-600 dark:bg-yellow-500',
    error: 'bg-red-600 dark:bg-red-500',
    info: 'bg-blue-600 dark:bg-blue-500'
  },
  
  // Neutral grays (professional palette)
  neutral: {
    50: 'bg-gray-50 dark:bg-gray-900',
    100: 'bg-gray-100 dark:bg-gray-800',
    200: 'bg-gray-200 dark:bg-gray-700',
    300: 'bg-gray-300 dark:bg-gray-600',
    400: 'bg-gray-400 dark:bg-gray-50 dark:bg-slate-8000',
    500: 'bg-gray-50 dark:bg-slate-8000 dark:bg-gray-400',
    600: 'bg-gray-600 dark:bg-gray-300',
    700: 'bg-gray-700 dark:bg-gray-200 dark:bg-slate-600',
    800: 'bg-gray-800 dark:bg-gray-100 dark:bg-slate-700',
    900: 'bg-gray-900 dark:bg-gray-50 dark:bg-slate-800'
  }
};

export default {
  professionalColors,
  professionalClasses,
  transitions,
  shadows,
  getProClass,
  combineClasses,
  colorPalette
}; 