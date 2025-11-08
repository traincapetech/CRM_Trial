import React, { useState, useEffect } from 'react';
import { getCurrencySettings, setCurrencySettings } from '../utils/helpers';
import axios from 'axios';
import { currencyAPI } from '../services/api';

// Expanded currency list with more options
const currencyInfo = {
  USD: { locale: 'en-US', label: 'USD ($)', symbol: '$' },
  INR: { locale: 'en-IN', label: 'INR (₹)', symbol: '₹' },
  EUR: { locale: 'en-EU', label: 'EUR (€)', symbol: '€' },
  GBP: { locale: 'en-GB', label: 'GBP (£)', symbol: '£' },
  JPY: { locale: 'ja-JP', label: 'JPY (¥)', symbol: '¥' },
  CAD: { locale: 'en-CA', label: 'CAD ($)', symbol: 'C$' },
  AUD: { locale: 'en-AU', label: 'AUD ($)', symbol: 'A$' },
  CNY: { locale: 'zh-CN', label: 'CNY (¥)', symbol: '¥' },
  SGD: { locale: 'en-SG', label: 'SGD ($)', symbol: 'S$' },
  CHF: { locale: 'de-CH', label: 'CHF (Fr)', symbol: 'Fr' },
  AED: { locale: 'ar-AE', label: 'AED (د.إ)', symbol: 'د.إ' }
};

// Fallback rates if API fails
const initialRates = {
  USD: 1,
  INR: 84.62,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 151.15,
  CAD: 1.37,
  AUD: 1.52,
  CNY: 7.24,
  SGD: 1.35,
  CHF: 0.90,
  AED: 3.67
};

/**
 * Currency selector component that allows users to change the currency format globally
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Whether to use dark mode styling (white text)
 */
const CurrencySelector = ({ darkMode = true }) => {
  const [currentCurrency, setCurrentCurrency] = useState(() => getCurrencySettings().currency);
  const [exchangeRates, setExchangeRates] = useState(initialRates);
  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Text colors based on mode
  const textColor = darkMode ? 'text-white' : 'text-gray-700 dark:text-gray-300 dark:text-gray-400';
  const subTextColor = darkMode ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400';
  const errorTextColor = darkMode ? 'text-yellow-200' : 'text-yellow-600';
  const bgColor = darkMode ? 'bg-blue-700' : 'bg-white dark:bg-slate-900';
  const borderColor = darkMode ? 'border-blue-600' : 'border-gray-300 dark:border-slate-600';

  // Fetch latest exchange rates from our backend API
  useEffect(() => {
    fetchExchangeRates();
    
    // Refresh rates periodically if user stays on the page
    const intervalId = setInterval(fetchExchangeRates, 60 * 60 * 1000); // Every hour
    
    return () => clearInterval(intervalId);
  }, []);

  const fetchExchangeRates = async () => {
    try {
      // Use our server-side endpoint which implements caching and fallbacks
      const response = await currencyAPI.getRates();
      
      if (response.data && response.data.rates) {
        const rates = response.data.rates;
        
        // Update with the latest rates
        setExchangeRates(rates);
        
        // Generate available currencies based on the rates we received
        const currencies = Object.keys(rates)
          .filter(code => currencyInfo[code]) // Only use currencies we have info for
          .map(code => ({
            code,
            ...currencyInfo[code],
            rate: rates[code]
          }))
          .sort((a, b) => {
            // Sort with USD first, then alphabetically
            if (a.code === 'USD') return -1;
            if (b.code === 'USD') return 1;
            return a.code.localeCompare(b.code);
          });
        
        setAvailableCurrencies(currencies);
        setLastUpdated(new Date(response.data.date || new Date()));
        setFetchError(response.data.source === 'fallback' ? 'Using backup rates' : null);
        
        // Update global currency settings
        setCurrencySettings({
          ...getCurrencySettings(),
          exchangeRates: rates,
          lastUpdated: response.data.date || new Date().toISOString()
        });
        

        
        // Store in localStorage for additional persistence
        localStorage.setItem('exchange_rates', JSON.stringify(rates));
        localStorage.setItem('rates_last_updated', response.data.date || new Date().toISOString());
        
        // Show notification if rates are fallback rates
        if (response.data.source === 'fallback') {
          // Using fallback exchange rates - all APIs failed
        }
      } else {
        throw new Error('Invalid response format from currency API');
      }
    } catch (error) {
      setFetchError('Using last known rates');
      
      // Try to load from localStorage as a fallback
      const storedRates = localStorage.getItem('exchange_rates');
      const storedLastUpdated = localStorage.getItem('rates_last_updated');
      
      if (storedRates) {
        try {
          const parsedRates = JSON.parse(storedRates);
          setExchangeRates(parsedRates);
          
          // Generate available currencies from fallback
          const currencies = Object.keys(parsedRates)
            .filter(code => currencyInfo[code])
            .map(code => ({
              code,
              ...currencyInfo[code],
              rate: parsedRates[code]
            }))
            .sort((a, b) => {
              if (a.code === 'USD') return -1;
              if (b.code === 'USD') return 1;
              return a.code.localeCompare(b.code);
            });
          
          setAvailableCurrencies(currencies);
          setLastUpdated(new Date(storedLastUpdated));
          
          setCurrencySettings({
            ...getCurrencySettings(),
            exchangeRates: parsedRates,
            lastUpdated: storedLastUpdated
          });
        } catch (e) {
          // If parsing fails, use initialRates
          setExchangeRates(initialRates);
          
          // Create currencies from initialRates
          const currencies = Object.keys(initialRates)
            .filter(code => currencyInfo[code])
            .map(code => ({
              code,
              ...currencyInfo[code],
              rate: initialRates[code]
            }))
            .sort((a, b) => {
              if (a.code === 'USD') return -1;
              if (b.code === 'USD') return 1;
              return a.code.localeCompare(b.code);
            });
          
          setAvailableCurrencies(currencies);
        }
      }
    }
  };

  useEffect(() => {
    if (availableCurrencies.length === 0) return;
    
    // Initialize with stored settings if available
    const storedCurrency = localStorage.getItem('preferred_currency');
    if (storedCurrency) {
      const currency = availableCurrencies.find(c => c.code === storedCurrency);
      if (currency) {
        setCurrencySettings({ 
          currency: currency.code, 
          locale: currency.locale,
          rate: exchangeRates[currency.code] || currency.rate,
          exchangeRates
        });
        setCurrentCurrency(currency.code);
      }
    } else {
      // Set default currency settings with exchange rates
      const defaultCurrency = availableCurrencies.find(c => c.code === 'USD') || availableCurrencies[0];
      setCurrencySettings({
        currency: defaultCurrency.code,
        locale: defaultCurrency.locale,
        rate: exchangeRates[defaultCurrency.code] || defaultCurrency.rate,
        exchangeRates
      });
    }
  }, [availableCurrencies, exchangeRates]);

  const handleCurrencyChange = (e) => {
    const selectedCode = e.target.value;
    const currency = availableCurrencies.find(c => c.code === selectedCode);
    
    if (currency) {
      // Update global currency settings
      setCurrencySettings({ 
        currency: currency.code, 
        locale: currency.locale,
        rate: exchangeRates[currency.code] || currency.rate,
        exchangeRates
      });
      setCurrentCurrency(currency.code);
      
      // Store preference
      localStorage.setItem('preferred_currency', currency.code);
      
      // Reload the page to apply changes everywhere
      window.location.reload();
    }
  };

  const formatLastUpdated = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  // If we have no currencies yet, show a loading state
  if (availableCurrencies.length === 0) {
    return (
      <div className={`flex items-center ${textColor} text-sm`}>
        <span className="mr-2">Loading currencies...</span>
        <div className={`animate-spin h-4 w-4 border-2 ${textColor} rounded-full border-t-transparent`}></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center">
        <label htmlFor="currency-selector" className={`text-sm ${textColor} mr-2`}>
          Currency:
        </label>
        <select
          id="currency-selector"
          value={currentCurrency}
          onChange={handleCurrencyChange}
          className={`text-sm border ${borderColor} rounded p-1 focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 ${bgColor} ${textColor} font-medium`}
          style={{ 
            WebkitAppearance: 'menulist', // For Safari
            MozAppearance: 'menulist',    // For Firefox
            appearance: 'menulist'        // Standard 
          }}
        >
          {availableCurrencies.map((currency) => (
            <option 
              key={currency.code} 
              value={currency.code}
              style={{ backgroundColor: '#fff', color: '#333', padding: '6px' }}
            >
              {currency.label} {currency.code !== 'USD' && `(1 USD = ${currency.rate.toFixed(2)})`}
            </option>
          ))}
        </select>
      </div>
      <div className={`text-xs ${subTextColor} mt-1`}>
        {fetchError && <span className={`${errorTextColor} mr-2`}>{fetchError}</span>}
        {lastUpdated && `Rates updated: ${formatLastUpdated(lastUpdated)}`}
      </div>
    </div>
  );
};

export default CurrencySelector; 