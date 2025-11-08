import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaChevronDown, FaTimes } from 'react-icons/fa';

const SearchableDropdown = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  className = '',
  disabled = false,
  loading = false,
  emptyMessage = 'No options found',
  maxHeight = '200px'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter options based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOptions(options);
    } else {
      const searchLower = searchTerm.toLowerCase().trim();
      
      const filtered = options.filter(option => {
        if (typeof option === 'string') {
          return option.toLowerCase().includes(searchLower);
        }
        
        // Search in multiple fields for better matching
        const label = option.label || option.name || '';
        const searchableText = label.toLowerCase();
        
        // Also search in the data object if it exists (for lead data)
        let additionalSearchText = '';
        if (option.data) {
          const data = option.data;
          additionalSearchText = [
            data.name || '',
            data.course || '',
            data.email || '',
            data.contactNumber || '',
            data.status || ''
          ].join(' ').toLowerCase();
        }
        
        return searchableText.includes(searchLower) || additionalSearchText.includes(searchLower);
      });
      
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled && !loading) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  };

  const handleOptionSelect = (option) => {
    const optionValue = typeof option === 'string' ? option : option.value;
    const optionLabel = typeof option === 'string' ? option : option.label || option.name || '';
    
    onChange(optionValue, option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('', null);
    setSearchTerm('');
  };

  const getDisplayValue = () => {
    if (!value) return placeholder;
    const selectedOption = options.find(option => {
      const optionValue = typeof option === 'string' ? option : option.value;
      return optionValue === value;
    });
    
    if (selectedOption) {
      return typeof selectedOption === 'string' ? selectedOption : selectedOption.label || selectedOption.name || '';
    }
    return placeholder;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled || loading}
        className={`
          w-full px-3 py-2 text-left border border-gray-300 dark:border-gray-600 
          rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          flex items-center justify-between
        `}
      >
        <span className={`${!value ? 'text-gray-500 dark:text-gray-400' : ''}`}>
          {loading ? 'Loading...' : getDisplayValue()}
        </span>
        <div className="flex items-center space-x-1">
          {value && !disabled && (
            <FaTimes
              className="h-3 w-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={handleClear}
            />
          )}
          <FaChevronDown
            className={`h-3 w-3 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-600">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Options List */}
          <div 
            className="overflow-y-auto"
            style={{ maxHeight }}
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const optionValue = typeof option === 'string' ? option : option.value;
                const optionLabel = typeof option === 'string' ? option : option.label || option.name || '';
                const isSelected = optionValue === value;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleOptionSelect(option)}
                    className={`
                      w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600
                      ${isSelected ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}
                      focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-600
                    `}
                  >
                    {optionLabel}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
