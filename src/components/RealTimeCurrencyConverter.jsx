import React, { useState, useEffect } from 'react';
import { currencyAPI } from '../services/api';
import { FaSync, FaClock, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const RealTimeCurrencyConverter = ({ onRatesUpdate }) => {
  const [exchangeRates, setExchangeRates] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [source, setSource] = useState('Unknown');
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Load initial rates
  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    try {
      setError(null);
      console.log('🔄 RealTimeCurrencyConverter: Loading exchange rates...');
      const response = await currencyAPI.getRates();
      console.log('📊 RealTimeCurrencyConverter: API Response:', response.data);
      
      if (response.data && response.data.rates) {
        setExchangeRates(response.data.rates);
        setLastUpdated(new Date(response.data.date));
        setSource(response.data.source || 'API');
        
        console.log('✅ RealTimeCurrencyConverter: Exchange rates loaded:', response.data.rates);
        
        // Notify parent component of rate updates
        if (onRatesUpdate && response.data.rates && typeof response.data.rates === 'object') {
          onRatesUpdate(response.data.rates);
        }
      } else {
        throw new Error('No rates in response');
      }
    } catch (err) {
      console.error('❌ RealTimeCurrencyConverter: Error loading exchange rates:', err);
      setError('Failed to load exchange rates');
    }
  };

  const refreshRates = async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      const response = await currencyAPI.refreshRates();
      
      if (response.data && response.data.success) {
        setExchangeRates(response.data.rates);
        setLastUpdated(new Date(response.data.date));
        setSource(response.data.source || 'API');
        
        // Notify parent component of rate updates
        if (onRatesUpdate && response.data.rates && typeof response.data.rates === 'object') {
          onRatesUpdate(response.data.rates);
        }
        
        console.log('✅ Exchange rates refreshed successfully');
      } else {
        throw new Error(response.data?.message || 'Refresh failed');
      }
    } catch (err) {
      console.error('Error refreshing exchange rates:', err);
      setError('Failed to refresh exchange rates');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return 'Unknown';
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTimeAgo = (date) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const getStatusIcon = () => {
    if (error) return <FaExclamationTriangle className="text-red-500" />;
    if (source === 'fallback') return <FaInfoCircle className="text-yellow-500" />;
    return <FaCheckCircle className="text-green-500" />;
  };

  const getStatusText = () => {
    if (error) return 'Error';
    if (source === 'fallback') return 'Using Backup Rates';
    return 'Live Rates';
  };

  const getStatusColor = () => {
    if (error) return 'text-red-600';
    if (source === 'fallback') return 'text-yellow-600';
    return 'text-green-600';
  };

  if (!exchangeRates || typeof exchangeRates !== 'object' || Object.keys(exchangeRates).length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading exchange rates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Real-Time Currency Converter
          </h3>
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshRates}
            disabled={isRefreshing}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              isRefreshing
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800'
            }`}
          >
            <FaSync className={`${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FaInfoCircle />
          </button>
        </div>
      </div>

      {/* Key Exchange Rates Display */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {[
          { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
          { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
          { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
          { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' }
        ].map(currency => (
          <div key={currency.code} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1">
                  <span className="text-lg">{currency.flag}</span>
                  <span className="font-semibold text-sm">{currency.code}</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{currency.name}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-blue-600 dark:text-blue-400">
                  {exchangeRates[currency.code]?.toFixed(4) || 'N/A'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">per USD</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Last Updated Info */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-1">
          <FaClock />
          <span>Last updated: {formatTime(lastUpdated)} ({getTimeAgo(lastUpdated)})</span>
        </div>
        <div className="text-xs">
          Source: {source}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex items-center space-x-2">
            <FaExclamationTriangle className="text-red-500" />
            <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Detailed Rates (Collapsible) */}
      {showDetails && (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            All Exchange Rates (per USD)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
            {Object.entries(exchangeRates)
              .filter(([code]) => code !== 'USD')
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([code, rate]) => (
                <div key={code} className="flex justify-between items-center py-1 px-2 bg-gray-50 dark:bg-slate-700 rounded">
                  <span className="font-medium">{code}</span>
                  <span className="text-blue-600 dark:text-blue-400">{rate.toFixed(4)}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeCurrencyConverter;
