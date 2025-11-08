// Dark mode utility classes for consistent theming across the application

export const darkModeClasses = {
  // Background classes
  bg: {
    primary: "bg-white dark:bg-gray-900",
    secondary: "bg-gray-50 dark:bg-gray-800", 
    card: "bg-white dark:bg-gray-800",
    modal: "bg-white dark:bg-gray-800",
    input: "bg-white dark:bg-gray-700",
    button: "bg-blue-600 dark:bg-blue-700",
    buttonSecondary: "bg-gray-200 dark:bg-gray-600",
    table: "bg-white dark:bg-gray-800",
    tableRow: "bg-white dark:bg-gray-800",
    tableHeader: "bg-gray-50 dark:bg-gray-700",
    hover: "hover:bg-gray-50 dark:hover:bg-gray-700"
  },
  
  // Text classes
  text: {
    primary: "text-gray-900 dark:text-white",
    secondary: "text-gray-700 dark:text-gray-300",
    muted: "text-gray-500 dark:text-gray-400",
    light: "text-gray-400 dark:text-gray-500 dark:text-gray-400",
    heading: "text-gray-900 dark:text-white",
    label: "text-gray-700 dark:text-gray-300",
    placeholder: "text-gray-500 dark:text-gray-400"
  },
  
  // Border classes
  border: {
    primary: "border-gray-200 dark:border-gray-600",
    secondary: "border-gray-300 dark:border-gray-500",
    input: "border-gray-300 dark:border-gray-600",
    table: "border-gray-200 dark:border-gray-700"
  },
  
  // Shadow classes
  shadow: {
    card: "shadow-md dark:shadow-lg dark:shadow-2xl dark:shadow-black/25",
    modal: "shadow-lg dark:shadow-2xl",
    button: "shadow-sm dark:shadow-md dark:shadow-xl dark:shadow-black/25"
  },
  
  // Ring/Focus classes
  ring: {
    focus: "focus:ring-blue-500 dark:focus:ring-blue-400",
    border: "focus:border-blue-500 dark:focus:border-blue-400"
  }
};

// Helper function to get combined classes
export const getDarkModeClass = (category, type) => {
  return darkModeClasses[category]?.[type] || '';
};

// Common component class combinations
export const componentClasses = {
  card: `${darkModeClasses.bg.card} ${darkModeClasses.shadow.card} ${darkModeClasses.border.primary}`,
  modal: `${darkModeClasses.bg.modal} ${darkModeClasses.shadow.modal}`,
  input: `${darkModeClasses.bg.input} ${darkModeClasses.border.input} ${darkModeClasses.text.primary} ${darkModeClasses.ring.focus} ${darkModeClasses.ring.border}`,
  button: `${darkModeClasses.bg.button} text-white ${darkModeClasses.shadow.button}`,
  buttonSecondary: `${darkModeClasses.bg.buttonSecondary} ${darkModeClasses.text.primary} ${darkModeClasses.shadow.button}`,
  table: `${darkModeClasses.bg.table} ${darkModeClasses.border.table}`,
  tableHeader: `${darkModeClasses.bg.tableHeader} ${darkModeClasses.text.secondary}`,
  tableRow: `${darkModeClasses.bg.tableRow} ${darkModeClasses.border.table} ${darkModeClasses.bg.hover}`,
  heading: `${darkModeClasses.text.heading}`,
  label: `${darkModeClasses.text.label}`,
  muted: `${darkModeClasses.text.muted}`
};

// Transition classes for smooth theme switching
export const transitionClasses = "transition-colors duration-300";

// Complete class builder function
export const buildDarkModeClasses = (baseClasses, darkModeOverrides = {}) => {
  let classes = baseClasses;
  
  // Add transition by default
  if (!classes.includes('transition')) {
    classes += ` ${transitionClasses}`;
  }
  
  // Apply dark mode overrides
  Object.entries(darkModeOverrides).forEach(([key, value]) => {
    if (darkModeClasses[key]) {
      classes += ` ${value}`;
    }
  });
  
  return classes;
}; 