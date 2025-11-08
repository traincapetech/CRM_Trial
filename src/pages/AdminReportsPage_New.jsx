import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { salesAPI, leadsAPI, authAPI, currencyAPI } from '../services/api';
import { FaFilter, FaCalendar, FaChartBar, FaChartPie, FaChartLine, FaFileExport, FaTable, FaSortDown, FaSortUp, FaSort, FaDollarSign, FaGraduationCap, FaDownload, FaCalendarAlt, FaCheckCircle } from '../components/icons';
import { formatCurrency, convertCurrency, getCurrencySettings, setCurrencySettings, BASE_CURRENCY } from '../utils/helpers';
import RealTimeCurrencyConverter from '../components/RealTimeCurrencyConverter';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminReportsPage = () => {
  // State for loading status and errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for sales and lead data
  const [sales, setSales] = useState([]);
  const [leads, setLeads] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  
  // State for exchange rates
  const [exchangeRates, setExchangeRates] = useState({});
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    console.log('🚀 AdminReportsPage: Component mounted, loading data...');
    loadAllReports();
    loadExchangeRates();
  }, []);

  // Reload exchange rates when refresh trigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('🔄 Refresh trigger activated, reloading exchange rates...');
      loadExchangeRates();
    }
  }, [refreshTrigger]);

  // Monitor exchange rates changes
  useEffect(() => {
    console.log('📊 AdminReportsPage: Exchange rates changed:', exchangeRates);
    if (exchangeRates && typeof exchangeRates === 'object' && Object.keys(exchangeRates).length > 0) {
      console.log('✅ AdminReportsPage: Exchange rates loaded successfully');
    }
  }, [exchangeRates]);

  const loadAllReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load sales data
      const salesResponse = await salesAPI.getAll();
      console.log('AdminReportsPage - Full sales response:', salesResponse);
      console.log('AdminReportsPage - Sales count from direct axios call:', salesResponse.data.data.length);
      
      if (salesResponse.data.success) {
        setSales(salesResponse.data.data);
        setFilteredSales(salesResponse.data.data);
      } else {
        setError('Failed to load sales data');
      }

    } catch (err) {
      console.error('Error loading reports:', err);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadExchangeRates = async () => {
    try {
      console.log('🔄 Loading exchange rates from API...');
      const response = await currencyAPI.getRates();
      console.log('📊 API Response:', response.data);
      
      if (response.data && response.data.rates) {
        console.log('✅ Using live exchange rates from API:', response.data.rates);
        setExchangeRates(response.data.rates);
        console.log('✅ Exchange rates state updated:', response.data.rates);
      } else {
        console.log('⚠️ API response missing rates, using fallback');
        throw new Error('No rates in API response');
      }
    } catch (error) {
      console.error('❌ Error loading exchange rates from API:', error);
      console.log('🔄 Using fallback exchange rates...');
      
      // Use default rates as fallback (updated with current rates)
      const fallbackRates = {
        'USD': 1,
        'EUR': 0.92,
        'GBP': 0.79,
        'INR': 83.15, // Updated to current rate
        'CAD': 1.37,
        'AUD': 1.51,
        'JPY': 150.25,
        'CNY': 7.15,
        'SGD': 1.35,
        'CHF': 0.90,
        'AED': 3.67,
        'ZAR': 18.39,
        'BRL': 5.14,
        'MXN': 17.04,
        'HKD': 7.81,
        'SEK': 10.58,
        'NZD': 1.64,
        'THB': 36.25,
        'IDR': 15928.30,
        'MYR': 4.72,
        'PHP': 56.25,
        'SAR': 3.75,
        'KRW': 1362.26,
        'VND': 25162.50
      };
      
      console.log('📊 Fallback rates set:', fallbackRates);
      setExchangeRates(fallbackRates);
      console.log('✅ Fallback exchange rates state updated');
    }
  };

  // Helper function to convert amount to selected currency
  const convertAmountToSelectedCurrency = (amount, fromCurrency) => {
    if (!amount) return 0;

    // Defensive: ensure exchangeRates is always an object
    const rates = (exchangeRates && typeof exchangeRates === 'object') ? exchangeRates : {
      'USD': 1,
      'EUR': 0.92,
      'GBP': 0.79,
      'INR': 83.15,
      'CAD': 1.37,
      'AUD': 1.51,
      'JPY': 150.25,
      'CNY': 7.15
    };
    
    // Debug logging
    if (!exchangeRates || Object.keys(exchangeRates).length === 0) {
      console.warn('⚠️ convertAmountToSelectedCurrency: No exchange rates available, using fallback rates');
    }

    // If currencies match, no conversion needed
    if (fromCurrency === selectedCurrency) return amount;

    // Convert to USD first (if not already USD)
    let amountInUSD;
    if (fromCurrency === 'USD') {
      amountInUSD = amount;
    } else {
      // If rate is available, use it, otherwise use a default 1:1 rate
      const fromRate = (rates[fromCurrency] !== undefined && !isNaN(rates[fromCurrency])) ? rates[fromCurrency] : 1;
      amountInUSD = amount / fromRate;
    }

    // If selected currency is USD, return the USD amount directly
    if (selectedCurrency === 'USD') {
      return amountInUSD;
    }

    // Convert from USD to selected currency
    const toRate = (rates[selectedCurrency] !== undefined && !isNaN(rates[selectedCurrency])) ? rates[selectedCurrency] : 1;
    return amountInUSD * toRate;
  };

  // Calculate comprehensive currency breakdown from sales data
  const calculateCurrencyBreakdown = () => {
    if (!sales || sales.length === 0) return {};
    
    // Safety check for exchange rates
    if (!exchangeRates || typeof exchangeRates !== 'object' || Object.keys(exchangeRates).length === 0) {
      console.warn('⚠️ calculateCurrencyBreakdown: No exchange rates available, using fallback rates');
    }

    const breakdown = {};

    sales.forEach(sale => {
      // Get the primary currency for this sale (use currency field as primary)
      const primaryCurrency = sale.currency || 'USD';
      const totalCost = sale.totalCost || 0;
      const tokenAmount = sale.tokenAmount || 0;
      const pendingAmount = sale.pendingAmount || 0;

      // Initialize currency entry if not exists
      if (!breakdown[primaryCurrency]) {
        breakdown[primaryCurrency] = {
          totalSales: 0,
          totalRevenue: 0,
          totalTokens: 0,
          totalPending: 0,
          revenueUSD: 0,
          tokensUSD: 0,
          pendingUSD: 0
        };
      }

      // Count sales
      breakdown[primaryCurrency].totalSales += 1;
      
      // Add amounts in original currency
      breakdown[primaryCurrency].totalRevenue += totalCost;
      breakdown[primaryCurrency].totalTokens += tokenAmount;
      breakdown[primaryCurrency].totalPending += pendingAmount;
      
      // Convert to USD - these are components of the same sale, not separate revenue streams
      breakdown[primaryCurrency].revenueUSD += convertAmountToSelectedCurrency(totalCost, primaryCurrency);
      breakdown[primaryCurrency].tokensUSD += convertAmountToSelectedCurrency(tokenAmount, primaryCurrency);
      breakdown[primaryCurrency].pendingUSD += convertAmountToSelectedCurrency(pendingAmount, primaryCurrency);
    });

    // Calculate totals for validation
    let totalRevenueUSD = 0;
    let totalTokensUSD = 0;
    let totalPendingUSD = 0;
    let totalSalesCount = 0;

    Object.values(breakdown).forEach(currencyData => {
      totalRevenueUSD += currencyData.revenueUSD;
      totalTokensUSD += currencyData.tokensUSD;
      totalPendingUSD += currencyData.pendingUSD;
      totalSalesCount += currencyData.totalSales;
    });

    // Comprehensive validation and debugging
    console.log('🔍 COMPREHENSIVE SALES VALIDATION:');
    console.log('Total sales processed:', sales.length);
    console.log('Total sales count (validation):', totalSalesCount);
    console.log('Total Revenue USD:', totalRevenueUSD.toFixed(2));
    console.log('Total Tokens USD:', totalTokensUSD.toFixed(2));
    console.log('Total Pending USD:', totalPendingUSD.toFixed(2));
    console.log('Full Payments USD:', (totalRevenueUSD - totalTokensUSD - totalPendingUSD).toFixed(2));
    console.log('Exchange rates available:', exchangeRates ? Object.keys(exchangeRates) : 'No exchange rates loaded');
    console.log('Exchange rates values:', exchangeRates);
    console.log('Selected currency:', selectedCurrency);
    
    // Detailed sales breakdown by currency
    console.log('📊 DETAILED SALES BREAKDOWN BY CURRENCY:');
    Object.entries(breakdown).forEach(([currency, data]) => {
      if (currency !== '_totals') {
        console.log(`${currency}:`, {
          sales: data.totalSales,
          revenue: data.totalRevenue,
          revenueUSD: data.revenueUSD.toFixed(2),
          tokens: data.totalTokens,
          tokensUSD: data.tokensUSD.toFixed(2),
          pending: data.totalPending,
          pendingUSD: data.pendingUSD.toFixed(2),
          fullPayments: (data.revenueUSD - data.tokensUSD - data.pendingUSD).toFixed(2)
        });
      }
    });
    
    // Sample sales data validation (first 5 sales)
    console.log('🔍 SAMPLE SALES DATA VALIDATION (First 5 sales):');
    sales.slice(0, 5).forEach((sale, index) => {
      const currency = sale.currency || 'USD';
      const totalCost = sale.totalCost || 0;
      const tokenAmount = sale.tokenAmount || 0;
      const pendingAmount = sale.pendingAmount || 0;
      const totalCostUSD = convertAmountToSelectedCurrency(totalCost, currency);
      const tokenAmountUSD = convertAmountToSelectedCurrency(tokenAmount, currency);
      const pendingAmountUSD = convertAmountToSelectedCurrency(pendingAmount, currency);
      
      console.log(`Sale ${index + 1}:`, {
        id: sale._id,
        currency: currency,
        totalCost: totalCost,
        totalCostUSD: totalCostUSD.toFixed(2),
        tokenAmount: tokenAmount,
        tokenAmountUSD: tokenAmountUSD.toFixed(2),
        pendingAmount: pendingAmount,
        pendingAmountUSD: pendingAmountUSD.toFixed(2),
        fullPayment: (totalCostUSD - tokenAmountUSD - pendingAmountUSD).toFixed(2)
      });
    });
    
    // Test conversion for debugging
    if (exchangeRates && exchangeRates.INR) {
      console.log('🧪 Test conversion: 1000 INR to USD:', convertAmountToSelectedCurrency(1000, 'INR'));
      console.log('🧪 Test conversion: 712085 INR to USD:', convertAmountToSelectedCurrency(712085, 'INR'));
      console.log('🧪 Current INR rate:', exchangeRates.INR);
    }

    // Add validation totals to breakdown
    breakdown._totals = {
      totalRevenueUSD,
      totalTokensUSD,
      totalPendingUSD,
      totalSalesCount,
      lastCalculated: new Date().toISOString()
    };

    return breakdown;
  };

  // Manual verification function for sales data accuracy
  const verifySalesDataAccuracy = () => {
    console.log('🔍 MANUAL SALES DATA VERIFICATION:');
    console.log('=====================================');
    
    let manualTotalRevenue = 0;
    let manualTotalTokens = 0;
    let manualTotalPending = 0;
    let manualSalesCount = 0;
    
    // Process each sale manually
    sales.forEach((sale, index) => {
      const currency = sale.currency || 'USD';
      const totalCost = sale.totalCost || 0;
      const tokenAmount = sale.tokenAmount || 0;
      const pendingAmount = sale.pendingAmount || 0;
      
      // Convert to USD
      const totalCostUSD = convertAmountToSelectedCurrency(totalCost, currency);
      const tokenAmountUSD = convertAmountToSelectedCurrency(tokenAmount, currency);
      const pendingAmountUSD = convertAmountToSelectedCurrency(pendingAmount, currency);
      
      // Add to manual totals
      manualTotalRevenue += totalCostUSD;
      manualTotalTokens += tokenAmountUSD;
      manualTotalPending += pendingAmountUSD;
      manualSalesCount += 1;
      
      // Log every 50th sale for verification
      if ((index + 1) % 50 === 0 || index < 5) {
        console.log(`Sale ${index + 1}:`, {
          id: sale._id?.substring(0, 8) + '...',
          currency: currency,
          totalCost: totalCost,
          totalCostUSD: totalCostUSD.toFixed(2),
          tokenAmount: tokenAmount,
          tokenAmountUSD: tokenAmountUSD.toFixed(2),
          pendingAmount: pendingAmount,
          pendingAmountUSD: pendingAmountUSD.toFixed(2)
        });
      }
    });
    
    console.log('📊 MANUAL CALCULATION RESULTS:');
    console.log('Total Sales Count:', manualSalesCount);
    console.log('Total Revenue USD:', manualTotalRevenue.toFixed(2));
    console.log('Total Tokens USD:', manualTotalTokens.toFixed(2));
    console.log('Total Pending USD:', manualTotalPending.toFixed(2));
    console.log('Full Payments USD:', (manualTotalRevenue - manualTotalTokens - manualTotalPending).toFixed(2));
    
    // Compare with breakdown calculation
    const breakdown = calculateCurrencyBreakdown();
    const totals = breakdown._totals;
    
    console.log('🔍 COMPARISON WITH BREAKDOWN CALCULATION:');
    console.log('Sales Count - Manual:', manualSalesCount, 'Breakdown:', totals?.totalSalesCount, 'Match:', manualSalesCount === totals?.totalSalesCount);
    console.log('Revenue USD - Manual:', manualTotalRevenue.toFixed(2), 'Breakdown:', totals?.totalRevenueUSD.toFixed(2), 'Match:', Math.abs(manualTotalRevenue - totals?.totalRevenueUSD) < 0.01);
    console.log('Tokens USD - Manual:', manualTotalTokens.toFixed(2), 'Breakdown:', totals?.totalTokensUSD.toFixed(2), 'Match:', Math.abs(manualTotalTokens - totals?.totalTokensUSD) < 0.01);
    console.log('Pending USD - Manual:', manualTotalPending.toFixed(2), 'Breakdown:', totals?.totalPendingUSD.toFixed(2), 'Match:', Math.abs(manualTotalPending - totals?.totalPendingUSD) < 0.01);
    
    return {
      manual: {
        salesCount: manualSalesCount,
        totalRevenue: manualTotalRevenue,
        totalTokens: manualTotalTokens,
        totalPending: manualTotalPending,
        fullPayments: manualTotalRevenue - manualTotalTokens - manualTotalPending
      },
      breakdown: totals
    };
  };

  // Render comprehensive currency breakdown
  const renderComprehensiveCurrencyBreakdown = () => {
    // Safety check - don't render if sales data isn't loaded yet
    if (!sales || sales.length === 0) {
      return <div className="text-center py-4 text-gray-500">Loading sales data...</div>;
    }

    const breakdown = calculateCurrencyBreakdown();
    const currencies = Object.keys(breakdown).filter(key => key !== '_totals').sort();
    const totals = breakdown._totals;

    if (currencies.length === 0) {
      return <div className="text-center py-4 text-gray-500">No sales data available</div>;
    }

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center">
              <FaChartBar className="text-blue-600 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Currencies</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{currencies.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center">
              <FaDollarSign className="text-green-600 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Sales Value (USD)</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(totals?.totalRevenueUSD || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center">
              <FaChartLine className="text-yellow-600 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Tokens Component (USD)</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {formatCurrency(totals?.totalTokensUSD || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center">
              <FaCalendar className="text-red-600 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Pending Component (USD)</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {formatCurrency(totals?.totalPendingUSD || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center">
              <FaDollarSign className="text-purple-600 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Full Payments (USD)</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {formatCurrency((totals?.totalRevenueUSD || 0) - (totals?.totalTokensUSD || 0) - (totals?.totalPendingUSD || 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Validation Summary */}
        {totals && (
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaCheckCircle className="text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Calculation Validation
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Last calculated: {new Date(totals.lastCalculated).toLocaleTimeString()}
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Sales Count:</span>
                <span className="ml-1 font-semibold">{totals.totalSalesCount}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Total Sales Value:</span>
                <span className="ml-1 font-semibold text-green-600">${totals.totalRevenueUSD.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Tokens Component:</span>
                <span className="ml-1 font-semibold text-yellow-600">${totals.totalTokensUSD.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Pending Component:</span>
                <span className="ml-1 font-semibold text-red-600">${totals.totalPendingUSD.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Full Payments:</span>
                <span className="ml-1 font-semibold text-purple-600">${(totals.totalRevenueUSD - totals.totalTokensUSD - totals.totalPendingUSD).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Currency Breakdown Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out p-6 rounded-lg shadow-md dark:shadow-2xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Live Currency Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Currency</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Sales</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Revenue (Original)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Revenue (USD)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Tokens (Original)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Tokens (USD)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Pending (Original)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Pending (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {currencies.map(currency => {
                  const data = breakdown[currency];
                  return (
                    <tr key={currency} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="px-4 py-2 font-medium">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {currency}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-semibold">{data.totalSales}</td>
                      <td className="px-4 py-2">{formatCurrency(data.totalRevenue, currency)}</td>
                      <td className="px-4 py-2 font-semibold text-green-600 dark:text-green-400">{formatCurrency(data.revenueUSD)}</td>
                      <td className="px-4 py-2">{formatCurrency(data.totalTokens, currency)}</td>
                      <td className="px-4 py-2 font-semibold text-yellow-600 dark:text-yellow-400">{formatCurrency(data.tokensUSD)}</td>
                      <td className="px-4 py-2">{formatCurrency(data.totalPending, currency)}</td>
                      <td className="px-4 py-2 font-semibold text-red-600 dark:text-red-400">{formatCurrency(data.pendingUSD)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Calculate sales person pending amounts
  const calculateSalesPersonPending = () => {
    if (!sales || sales.length === 0) return {};

    const salesPersonData = {};

    sales.forEach(sale => {
      // Get sales person info
      const salesPerson = sale.salesPerson || sale.assignedTo || sale.createdBy;
      const salesPersonName = salesPerson?.fullName || salesPerson?.name || 'Unknown';
      const salesPersonId = salesPerson?._id || salesPerson?.id || 'unknown';

      // Initialize sales person entry if not exists
      if (!salesPersonData[salesPersonId]) {
        salesPersonData[salesPersonId] = {
          name: salesPersonName,
          totalSales: 0,
          totalRevenue: 0,
          totalPending: 0,
          totalTokens: 0,
          revenueUSD: 0,
          pendingUSD: 0,
          tokensUSD: 0,
          sales: []
        };
      }

      // Add sale data
      const currency = sale.currency || 'USD';
      const totalCost = sale.totalCost || 0;
      const tokenAmount = sale.tokenAmount || 0;
      const pendingAmount = sale.pendingAmount || 0;

      salesPersonData[salesPersonId].totalSales += 1;
      salesPersonData[salesPersonId].totalRevenue += totalCost;
      salesPersonData[salesPersonId].totalPending += pendingAmount;
      salesPersonData[salesPersonId].totalTokens += tokenAmount;

      // Convert to USD
      salesPersonData[salesPersonId].revenueUSD += convertAmountToSelectedCurrency(totalCost, currency);
      salesPersonData[salesPersonId].pendingUSD += convertAmountToSelectedCurrency(pendingAmount, currency);
      salesPersonData[salesPersonId].tokensUSD += convertAmountToSelectedCurrency(tokenAmount, currency);

      // Add sale details
      salesPersonData[salesPersonId].sales.push({
        id: sale._id,
        customerName: sale.customerName || 'Unknown',
        course: sale.course || 'Unknown',
        totalCost: totalCost,
        pendingAmount: pendingAmount,
        tokenAmount: tokenAmount,
        currency: currency,
        date: sale.date || sale.createdAt
      });
    });

    return salesPersonData;
  };

  // Render sales person pending amounts
  const renderSalesPersonPending = () => {
    const salesPersonData = calculateSalesPersonPending();
    const salesPersons = Object.values(salesPersonData).sort((a, b) => b.pendingUSD - a.pendingUSD);

    if (salesPersons.length === 0) {
      return <div className="text-center py-4 text-gray-500">No sales person data available</div>;
    }

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center">
              <FaChartBar className="text-blue-600 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Sales Persons</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{salesPersons.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center">
              <FaDollarSign className="text-red-600 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Pending Amount</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {formatCurrency(salesPersons.reduce((sum, sp) => sum + sp.pendingUSD, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center">
              <FaChartLine className="text-green-600 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Revenue</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(salesPersons.reduce((sum, sp) => sum + sp.revenueUSD, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Person Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out p-6 rounded-lg shadow-md dark:shadow-2xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Sales Person Pending Amounts</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Sales Person</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Total Sales</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Total Revenue (USD)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Pending Amount (USD)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Tokens (USD)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Pending %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {salesPersons.map((salesPerson, index) => {
                  const pendingPercentage = salesPerson.revenueUSD > 0 ? (salesPerson.pendingUSD / salesPerson.revenueUSD) * 100 : 0;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="px-4 py-2 font-medium text-slate-900 dark:text-slate-100">
                        {salesPerson.name}
                      </td>
                      <td className="px-4 py-2 text-slate-900 dark:text-slate-100">
                        {salesPerson.totalSales}
                      </td>
                      <td className="px-4 py-2 font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(salesPerson.revenueUSD)}
                      </td>
                      <td className="px-4 py-2 font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(salesPerson.pendingUSD)}
                      </td>
                      <td className="px-4 py-2 font-semibold text-yellow-600 dark:text-yellow-400">
                        {formatCurrency(salesPerson.tokensUSD)}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pendingPercentage > 50 ? 'bg-red-100 text-red-800' :
                          pendingPercentage > 25 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {pendingPercentage.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Financial Reports</h2>
          <button
            onClick={loadAllReports}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm dark:shadow-xl hover:shadow-md transition-all duration-200 text-white py-2 px-4 rounded-md transition duration-300 flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <FaDownload className="mr-2" />
            )}
            Refresh Reports
          </button>
        </div>

        {/* Real-Time Currency Converter */}
        <div className="mb-6">
          <RealTimeCurrencyConverter onRatesUpdate={(rates) => {
            console.log('🔄 Exchange rates updated in AdminReportsPage:', rates);
            if (rates && typeof rates === 'object' && Object.keys(rates).length > 0) {
              setExchangeRates(rates);
              // Trigger recalculation of currency breakdown
              if (sales && sales.length > 0) {
                // Force re-render by updating a state that triggers recalculation
                setRefreshTrigger(prev => prev + 1);
              }
            } else {
              console.warn('⚠️ Invalid rates received from RealTimeCurrencyConverter:', rates);
            }
          }} />
        </div>

        {/* Comprehensive Currency Breakdown Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-2xl p-6 mb-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
              <FaDollarSign className="mr-2 text-purple-600" />
              Live Currency Breakdown
            </h3>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Real-time data from {sales.length} sales records
              </div>
              <button
                onClick={verifySalesDataAccuracy}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium transition-colors"
              >
                Verify Data Accuracy
              </button>
            </div>
          </div>
          {renderComprehensiveCurrencyBreakdown()}
        </div>

        {/* Sales Person Pending Amounts Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
              <FaChartBar className="mr-2 text-orange-600" />
              Sales Person Pending Amounts
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Pending amounts by sales person
            </div>
          </div>
          {renderSalesPersonPending()}
        </div>
      </div>
    </Layout>
  );
};

export default AdminReportsPage;
