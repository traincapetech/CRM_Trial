/**
 * Currency formatting utility functions
 */

import axios from 'axios';
import { salesAPI } from '../services/api';

/**
 * Utility function to combine class names
 * @param {...any} classes - Class names to combine
 * @returns {string} Combined class names
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Default currency settings
let currencySettings = {
  currency: 'USD',  // Default currency code
  locale: 'en-US',  // Default locale for formatting
  rate: 1,          // Exchange rate multiplier (1 for base currency USD)
  exchangeRates: {  // Exchange rates relative to USD
    USD: 1,
    INR: 84.62,     // 1 USD = 84.62 INR (updated rate)
    EUR: 0.92,      // 1 USD = 0.92 EUR
    GBP: 0.79       // 1 USD = 0.79 GBP
  }
};

// Original base currency that amounts are stored in
export const BASE_CURRENCY = 'INR';

/**
 * Convert amount from base currency to target currency
 * @param {number} amount - Amount in base currency
 * @param {string} targetCurrency - Target currency code
 * @returns {number} - Converted amount
 */
export const convertCurrency = (amount, targetCurrency = currencySettings.currency) => {
  if (!amount || isNaN(amount)) return 0;
  
  // Get exchange rates
  const rates = currencySettings.exchangeRates || {
    USD: 1,
    INR: 84.62,
    EUR: 0.92,
    GBP: 0.79
  };
  
  // If base currency is already the target currency, return amount
  if (BASE_CURRENCY === targetCurrency) {
    return amount;
  }
  
  // Convert from base currency to USD first (if not already USD)
  let amountInUSD;
  if (BASE_CURRENCY === 'USD') {
    amountInUSD = amount;
  } else {
    amountInUSD = amount / rates[BASE_CURRENCY];
  }
  
  // Then convert from USD to target currency
  return amountInUSD * rates[targetCurrency];
};

/**
 * Format a date string in the specified format
 * @param {string|Date} date - The date to format
 * @param {string} format - Format string (default: 'DD/MM/YYYY')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  if (format === 'DD/MM/YYYY') {
    return `${day}/${month}/${year}`;
  } else if (format === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`;
  } else if (format === 'MMM DD, YYYY') {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[d.getMonth()]} ${day}, ${year}`;
  }
  
  return `${day}/${month}/${year}`;
};

/**
 * Format currency value based on current currency settings
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currencyOverride, localeOverride) => {
  if (amount === null || amount === undefined) return 'N/A';

  const settings = getCurrencySettings();
  const currency = currencyOverride || settings.currency || 'USD';
  const locale = localeOverride || (currency === 'INR' ? 'en-IN' : settings.locale || 'en-US');

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    const fallbackSymbolMap = { USD: '$', INR: '₹', EUR: '€', GBP: '£' };
    const symbol = fallbackSymbolMap[currency] || settings.symbol || '';
    return `${symbol}${Number(amount).toFixed(2)}`;
  }
};

/**
 * Update global currency settings
 * @param {Object} settings - New currency settings
 * @param {string} settings.currency - Currency code (e.g., 'USD', 'INR')
 * @param {string} settings.locale - Locale string (e.g., 'en-US', 'en-IN')
 * @param {number} settings.rate - Exchange rate
 * @param {Object} settings.exchangeRates - Exchange rates object
 */
export const setCurrencySettings = (settings) => {
  currencySettings = { ...currencySettings, ...settings };
};

/**
 * Get current currency settings
 * @returns {Object} Current currency settings
 */
export const getCurrencySettings = () => {
  const settings = localStorage.getItem('currencySettings');
  return settings ? JSON.parse(settings) : { currency: 'USD', symbol: '$', locale: 'en-US' };
};

// Add a new utility function to get a direct sales count
export const getDirectSalesCount = async () => {
  try {
    // Strategy 1: Try the dedicated count endpoint
    try {
      const response = await salesAPI.getCount();
      
      if (response.data && response.data.success && typeof response.data.count === 'number') {
        const salesCount = response.data.count;
        return salesCount;
      } else {
        throw new Error('Invalid count response format');
      }
    } catch (countError) {
      // Strategy 2: Fallback to getting all sales and counting them
      try {
        const response = await salesAPI.getAllForced();
        
        if (response.data && response.data.success) {
          let salesCount = 0;
          
          if (response.data.count && typeof response.data.count === 'number') {
            salesCount = response.data.count;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            salesCount = response.data.data.length;
          } else if (Array.isArray(response.data)) {
            salesCount = response.data.length;
          }
          
          return salesCount;
        } else {
          throw new Error('Invalid sales response format');
        }
      } catch (fullFetchError) {
        throw new Error(`All strategies failed. Count error: ${countError.message}, Full fetch error: ${fullFetchError.message}`);
      }
    }
  } catch (error) {
    throw error;
  }
};
