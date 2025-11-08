import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { salesAPI, leadsAPI, authAPI, currencyAPI } from '../services/api';
import { FaFilter, FaCalendar, FaChartBar, FaChartPie, FaChartLine, FaFileExport, FaTable, FaSortDown, FaSortUp, FaSort, FaDollarSign, FaGraduationCap, FaDownload, FaCalendarAlt, FaCheckCircle } from '../components/icons';
import { formatCurrency, convertCurrency, getCurrencySettings, setCurrencySettings, BASE_CURRENCY } from '../utils/helpers';
// Lazy load XLSX only when needed for Excel export functionality
import CurrencySelector from '../components/CurrencySelector';
import RealTimeCurrencyConverter from '../components/RealTimeCurrencyConverter';
import axios from 'axios';
import { toast } from 'react-toastify';

// Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

import { professionalClasses, transitions, shadows } from '../utils/professionalDarkMode';
// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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
  
  // State for time-based filters
  const [timeFrame, setTimeFrame] = useState('monthly'); // 'monthly', 'quarterly', 'yearly'
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentQuarter, setCurrentQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'sales', 'courses', 'detailed'
  
  // State for table sorting
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Years for year selection
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);
  
  // Months for month selection
  const months = useMemo(() => [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ], []);
  
  // Quarters for quarter selection
  const quarters = useMemo(() => [
    { value: 1, label: 'Q1 (Jan-Mar)' },
    { value: 2, label: 'Q2 (Apr-Jun)' },
    { value: 3, label: 'Q3 (Jul-Sep)' },
    { value: 4, label: 'Q4 (Oct-Dec)' }
  ], []);
  
  // Course analysis filter options
  const courseFilterOptions = [
    { value: 'monthly', label: 'Month wise (Last 12 months)' },
    { value: 'quarterly', label: '3 Months (Quarterly)' },
    { value: 'half-yearly', label: 'Half Yearly (6 months)' },
    { value: 'yearly', label: 'Yearly (Last 3 years)' }
  ];

  // Revenue analysis filter options
  const revenueFilterOptions = [
    { value: '1month', label: '1 Month' },
    { value: '3month', label: '3 Months' },
    { value: '6month', label: '6 Months' },
    { value: '1year', label: '1 Year' }
  ];

  // Listen for currency setting changes
  useEffect(() => {
    const settings = getCurrencySettings();
    setSelectedCurrency(settings.currency);
    setExchangeRates(settings.exchangeRates);
    
    // Define a handler function for storage events
    const handleStorageChange = () => {
      const newSettings = getCurrencySettings();
      setSelectedCurrency(newSettings.currency);
      setExchangeRates(newSettings.exchangeRates);
    };
    
    // Add event listener for changes in localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);
  
  // Update filtered sales when timeframe or filters change
  useEffect(() => {
    if (sales.length > 0) {
      filterSalesByTimeFrame();
    }
  }, [sales, timeFrame, currentYear, currentMonth, currentQuarter, selectedCurrency]);

  // Function to fetch all required data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch sales data with robust error handling
      let salesData = [];
      try {
        // Use direct axios for more reliable data fetching with full=true to get all sales
        const isDevelopment = import.meta.env.DEV && import.meta.env.MODE !== 'production';
        const apiUrl = isDevelopment ? 'http://localhost:8080' : 'https://crm-backend-o36v.onrender.com/api';
        const token = localStorage.getItem('token');
        const salesResponse = await axios.get(`${apiUrl}${isDevelopment ? '/api' : ''}/sales?full=true&nocache=${new Date().getTime()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Log the full response for debugging
        console.log("AdminReportsPage - Full sales response:", salesResponse);
        
        // Check if we have data in the expected format
        if (salesResponse.data && salesResponse.data.success && salesResponse.data.data && Array.isArray(salesResponse.data.data)) {
          salesData = salesResponse.data.data;
          console.log("AdminReportsPage - Sales count from direct axios call:", salesData.length);
        } else if (salesResponse.data && Array.isArray(salesResponse.data)) {
          // Handle case where data might be directly in the response
          salesData = salesResponse.data;
          console.log("AdminReportsPage - Sales count from direct array response:", salesData.length);
        } else {
          console.warn("AdminReportsPage - Unexpected sales response format:", salesResponse.data);
          // Fallback to empty array
          salesData = [];
        }
      } catch (salesError) {
        console.error('AdminReportsPage - Error fetching sales with direct axios:', salesError);
        
        // Fallback to the API service as a second attempt
        try {
          const fallbackResponse = await salesAPI.getAllForced();
          if (fallbackResponse.data && fallbackResponse.data.success) {
            salesData = fallbackResponse.data.data;
            console.log("AdminReportsPage - Sales count from fallback API:", salesData.length);
          }
        } catch (fallbackError) {
          console.error("AdminReportsPage - Fallback sales fetch also failed:", fallbackError);
          salesData = []; // Ensure we have an empty array as fallback
        }
      }
      
      // Fetch leads data
      const leadsResponse = await leadsAPI.getAll();
      const leadsData = leadsResponse.data.success ? leadsResponse.data.data : [];
      
      // Fetch exchange rates
      const ratesResponse = await currencyAPI.getRates();
      let ratesData = {};
      if (ratesResponse.data.success) {
        ratesData = ratesResponse.data.data;
        // Update currency settings with latest rates
        setCurrencySettings({ exchangeRates: ratesData });
      } else {
        // Use default rates if API fails
        ratesData = getCurrencySettings().exchangeRates;
      }
      
      // Process the sales data to ensure consistency
      const processedSales = salesData.map(sale => {
        return {
          ...sale,
          // Ensure we have standard field names
          id: sale._id,
          date: new Date(sale.date || sale.createdAt),
          customerName: sale.customerName || (sale.leadId && (sale.leadId.name || sale.leadId.NAME)) || 'Unknown',
          course: sale.course || sale.product || 'Unknown',
          // Ensure financial fields are consistent and numbers
          totalCost: parseFloat(sale.totalCost || sale.amount || 0),
          tokenAmount: parseFloat(sale.tokenAmount || sale.token || 0),
          pendingAmount: parseFloat(sale.status === 'Completed' ? 0 : 
            (sale.pendingAmount || (sale.totalCost || sale.amount || 0) - (sale.tokenAmount || sale.token || 0))),
          // Ensure we have the currency
          currency: sale.currency || 'USD'
        };
      });
      
      // Set state with the data
      setSales(processedSales);
      setLeads(leadsData);
      setExchangeRates(ratesData);
      
      // Initial filtering
      filterSalesByTimeFrame(processedSales);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to filter sales by the selected time frame
  const filterSalesByTimeFrame = (salesData = sales) => {
    // Use passed salesData or fall back to state
    const data = salesData || [];
    
    let filteredData = [];
    
    switch (timeFrame) {
      case 'monthly':
        // Filter by selected month and year
        filteredData = data.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate.getMonth() + 1 === currentMonth && 
                 saleDate.getFullYear() === currentYear;
        });
        break;
        
      case 'quarterly':
        // Filter by selected quarter and year
        filteredData = data.filter(sale => {
          const saleDate = new Date(sale.date);
          const saleMonth = saleDate.getMonth() + 1;
          const saleQuarter = Math.ceil(saleMonth / 3);
          return saleQuarter === currentQuarter && 
                 saleDate.getFullYear() === currentYear;
        });
        break;
        
      case 'yearly':
        // Filter by selected year
        filteredData = data.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate.getFullYear() === currentYear;
        });
        break;
        
      default:
        filteredData = data;
    }
    
    // Apply sorting
    filteredData = sortSalesData(filteredData, sortField, sortDirection);
    
    // Update state
    setFilteredSales(filteredData);
  };
  
  // Function to sort sales data
  const sortSalesData = (data, field, direction) => {
    return [...data].sort((a, b) => {
      let valueA, valueB;
      
      // Handle different field types
      switch (field) {
        case 'date':
          valueA = new Date(a.date).getTime();
          valueB = new Date(b.date).getTime();
          break;
        case 'totalCost':
        case 'tokenAmount':
        case 'pendingAmount':
          // Convert all to a common currency for sorting
          valueA = convertCurrency(a[field], 'USD');
          valueB = convertCurrency(b[field], 'USD');
          break;
        default:
          valueA = a[field] || '';
          valueB = b[field] || '';
      }
      
      // String comparison for non-numeric fields
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return direction === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      
      // Numeric comparison
      return direction === 'asc' ? valueA - valueB : valueB - valueA;
    });
  };
  
  // Handle sort column change
  const handleSort = (field) => {
    const newDirection = 
      field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    
    setSortField(field);
    setSortDirection(newDirection);
    
    // Re-sort the data
    const sorted = sortSalesData(filteredSales, field, newDirection);
    setFilteredSales(sorted);
  };
  
  // Get sort icon for a column
  const getSortIcon = (field) => {
    if (field !== sortField) return <FaSort className="ml-1" />;
    return sortDirection === 'asc' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />;
  };
  
  // Calculate summary statistics from filtered sales
  const calculateSummaryStats = () => {
    if (!filteredSales.length) return { totalSales: 0, totalRevenue: 0, totalToken: 0, totalPending: 0, averageSaleValue: 0 };
    
    // Initialize values
    let totalRevenue = 0;
    let totalToken = 0;
    let totalPending = 0;
    
    // Process each sale
    filteredSales.forEach(sale => {
      // Convert amounts to the selected currency
      const totalCostInSelectedCurrency = convertAmountToSelectedCurrency(sale.totalCost, sale.currency);
      const tokenAmountInSelectedCurrency = convertAmountToSelectedCurrency(sale.tokenAmount, sale.currency);
      const pendingAmountInSelectedCurrency = convertAmountToSelectedCurrency(sale.pendingAmount, sale.currency);
      
      // Add to totals
      totalRevenue += totalCostInSelectedCurrency;
      totalToken += tokenAmountInSelectedCurrency;
      totalPending += pendingAmountInSelectedCurrency;
    });
    
    // Calculate average sale value
    const averageSaleValue = filteredSales.length ? totalRevenue / filteredSales.length : 0;
    
    return {
      totalSales: filteredSales.length,
      totalRevenue,
      totalToken,
      totalPending,
      averageSaleValue
    };
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

    // Otherwise, convert from USD to selected currency
    const toRate = (rates[selectedCurrency] !== undefined && !isNaN(rates[selectedCurrency])) ? rates[selectedCurrency] : 1;
    return amountInUSD * toRate;
  };
  
  // Group sales by course and calculate metrics
  const calculateCourseMetrics = () => {
    if (!filteredSales.length) return [];
    
    const courseData = {};
    
    // Process each sale
    filteredSales.forEach(sale => {
      const course = sale.course || 'Unknown';
      const totalCostInSelectedCurrency = convertAmountToSelectedCurrency(sale.totalCost, sale.currency);
      
      // Initialize course data if it doesn't exist
      if (!courseData[course]) {
        courseData[course] = {
          name: course,
          count: 0,
          totalRevenue: 0
        };
      }
      
      // Update course metrics
      courseData[course].count += 1;
      courseData[course].totalRevenue += totalCostInSelectedCurrency;
    });
    
    // Convert to array and sort by count (most popular first)
    return Object.values(courseData).sort((a, b) => b.count - a.count);
  };
  
  // Group sales by month/quarter/year for trend analysis
  const calculateTimeTrends = () => {
    if (!filteredSales.length) return [];
    
    const timeData = {};
    let timeFormat = '';
    
    // Determine format based on time frame
    switch (timeFrame) {
      case 'monthly':
        timeFormat = 'day'; // Group by day within month
        break;
      case 'quarterly':
        timeFormat = 'month'; // Group by month within quarter
        break;
      case 'yearly':
        timeFormat = 'month'; // Group by month within year
        break;
      default:
        timeFormat = 'month';
    }
    
    // Process each sale
    filteredSales.forEach(sale => {
      const saleDate = new Date(sale.date);
      let timeKey;
      
      // Format the time key based on time frame
      if (timeFormat === 'day') {
        timeKey = saleDate.getDate().toString(); // Day of month (1-31)
      } else if (timeFormat === 'month') {
        timeKey = (saleDate.getMonth() + 1).toString(); // Month (1-12)
      } else {
        timeKey = saleDate.getFullYear().toString(); // Year
      }
      
      const totalCostInSelectedCurrency = convertAmountToSelectedCurrency(sale.totalCost, sale.currency);
      
      // Initialize time data if it doesn't exist
      if (!timeData[timeKey]) {
        timeData[timeKey] = {
          timeKey,
          count: 0,
          totalRevenue: 0
        };
      }
      
      // Update time metrics
      timeData[timeKey].count += 1;
      timeData[timeKey].totalRevenue += totalCostInSelectedCurrency;
    });
    
    // Convert to array and sort by time key
    return Object.values(timeData).sort((a, b) => {
      return parseInt(a.timeKey) - parseInt(b.timeKey);
    });
  };
  
  // Format trend data for chart display
  const formatTrendDataForChart = () => {
    const trendData = calculateTimeTrends();
    
    // Format labels based on time frame
    let labels = [];
    if (timeFrame === 'monthly') {
      // Days in month
      labels = trendData.map(item => `Day ${item.timeKey}`);
    } else if (timeFrame === 'quarterly') {
      // Months in quarter
      labels = trendData.map(item => months.find(m => m.value === parseInt(item.timeKey))?.label || item.timeKey);
    } else {
      // Months in year
      labels = trendData.map(item => months.find(m => m.value === parseInt(item.timeKey))?.label || item.timeKey);
    }
    
    // Dataset for revenue
    const revenueData = trendData.map(item => item.totalRevenue);
    
    // Dataset for count
    const countData = trendData.map(item => item.count);
    
    return {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: revenueData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          yAxisID: 'y',
        },
        {
          label: 'Number of Sales',
          data: countData,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          yAxisID: 'y1',
        },
      ],
    };
  };
  
  // Format course data for chart display
  const formatCourseDataForChart = () => {
    if (!courseAnalysisData || !courseAnalysisData.courseAnalysis) {
      return { labels: [], countData: [], revenueData: [] };
    }
    const courseEntries = Object.entries(courseAnalysisData.courseAnalysis).map(([course, periods]) => {
      let totalSales = 0;
      let totalRevenue = 0;
      Object.values(periods).forEach(periodData => {
        totalSales += periodData.totalSales || 0;
        totalRevenue += periodData.totalRevenue || 0;
      });
      return { name: course, count: totalSales, totalRevenue };
    });
    // Sort by sales count descending, but do NOT slice to top 10
    const sortedCourses = courseEntries.sort((a, b) => b.count - a.count);
    return {
      labels: sortedCourses.map(c => c.name),
      countData: sortedCourses.map(c => c.count),
      revenueData: sortedCourses.map(c => c.totalRevenue),
    };
  };
  
  // Function to handle exporting data to Excel
  const exportToExcel = async () => {
    try {
      // Dynamically import XLSX only when needed
      const XLSX = await import('xlsx');
      
      // Prepare data for export
      const exportData = filteredSales.map(sale => ({
        Date: new Date(sale.date).toLocaleDateString(),
        Customer: sale.customerName,
        Course: sale.course,
        'Total Cost': formatCurrency(convertAmountToSelectedCurrency(sale.totalCost, sale.currency)),
        'Token Amount': formatCurrency(convertAmountToSelectedCurrency(sale.tokenAmount, sale.currency)),
        'Pending Amount': formatCurrency(convertAmountToSelectedCurrency(sale.pendingAmount, sale.currency)),
        Status: sale.status,
        'Original Currency': sale.currency
      }));
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');
      
      // Generate filename based on current filter
      let filename;
      if (timeFrame === 'monthly') {
        filename = `Sales_Report_${months.find(m => m.value === currentMonth)?.label}_${currentYear}.xlsx`;
      } else if (timeFrame === 'quarterly') {
        filename = `Sales_Report_Q${currentQuarter}_${currentYear}.xlsx`;
      } else {
        filename = `Sales_Report_${currentYear}.xlsx`;
      }
      
      // Export to file
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel. Please try again.');
    }
  };

  const [courseAnalysisData, setCourseAnalysisData] = useState(null);
  const [revenueAnalysisData, setRevenueAnalysisData] = useState(null);
  const [topCoursesData, setTopCoursesData] = useState(null);
  const [statusAnalysisData, setStatusAnalysisData] = useState(null);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('monthly');
  const [selectedRevenueFilter, setSelectedRevenueFilter] = useState('1month');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('1month');
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [courseChartMode, setCourseChartMode] = useState('count');

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

  useEffect(() => {
    loadCourseAnalysis();
  }, [selectedCourseFilter]);

  useEffect(() => {
    loadRevenueAnalysis();
  }, [selectedRevenueFilter]);

  useEffect(() => {
    loadStatusAnalysis();
  }, [selectedStatusFilter, selectedStatus]);

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

  const loadCourseAnalysis = async () => {
    try {
      setLoading(true);
      const response = await salesAPI.getCourseAnalysis(selectedCourseFilter);
      if (response.data && response.data.success) {
        setCourseAnalysisData(response.data.data);
      }
    } catch (error) {
      console.error('Error loading course analysis:', error);
      toast.error('Failed to load course analysis');
    } finally {
      setLoading(false);
    }
  };

  const loadRevenueAnalysis = async () => {
    try {
      setLoading(true);
      const response = await salesAPI.getRevenueAnalysis(selectedRevenueFilter);
      if (response.data && response.data.success) {
        setRevenueAnalysisData(response.data.data);
      }
    } catch (error) {
      console.error('Error loading revenue analysis:', error);
      toast.error('Failed to load revenue analysis');
    } finally {
      setLoading(false);
    }
  };

  const loadTopCourses = async () => {
    try {
      const response = await salesAPI.getTopCourses('all', 10);
      if (response.data && response.data.success) {
        setTopCoursesData(response.data.data);
      }
    } catch (error) {
      console.error('Error loading top courses:', error);
      toast.error('Failed to load top courses');
    }
  };

  const loadStatusAnalysis = async () => {
    try {
      setLoading(true);
      const response = await salesAPI.getStatusAnalysis(selectedStatusFilter, selectedStatus);
      if (response.data && response.data.success) {
        setStatusAnalysisData(response.data.data);
      }
    } catch (error) {
      console.error('Error loading status analysis:', error);
      toast.error('Failed to load status analysis');
    } finally {
      setLoading(false);
    }
  };

  const loadAllReports = async () => {
    await Promise.all([
      loadCourseAnalysis(),
      loadRevenueAnalysis(),
      loadTopCourses(),
      loadStatusAnalysis()
    ]);
  };

  const renderCourseAnalysisTable = () => {
    if (!courseAnalysisData || !courseAnalysisData.courseAnalysis) {
      return <div className="text-center py-4">No course analysis data available</div>;
    }

    const courses = Object.keys(courseAnalysisData.courseAnalysis);
    const periods = new Set();
    
    // Collect all periods
    courses.forEach(course => {
      Object.keys(courseAnalysisData.courseAnalysis[course]).forEach(period => {
        periods.add(period);
      });
    });

    const sortedPeriods = Array.from(periods).sort().reverse();

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-slate-900 transition-all duration-200 ease-out border border-slate-200 dark:border-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                Course
              </th>
              {sortedPeriods.map(period => (
                <th key={period} className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                  {period}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                Total Sales
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out divide-y divide-slate-200 dark:divide-slate-700">
            {courses.map(course => {
              const courseData = courseAnalysisData.courseAnalysis[course];
              const totalSales = Object.values(courseData).reduce((sum, period) => sum + period.totalSales, 0);
              
              return (
                <tr key={course} className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 transition-all duration-200 ease-out">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                    {course}
                  </td>
                  {sortedPeriods.map(period => {
                    const periodData = courseData[period];
                    return (
                      <td key={period} className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
                        {periodData ? (
                          <div>
                            <div className="font-semibold">{periodData.totalSales} sales</div>
                            <div className="text-xs text-gray-400 dark:text-gray-400">
                              ${periodData.totalRevenue?.toFixed(2) || '0.00'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-500">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                    {totalSales}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
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
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Currency</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Sales Count</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Revenue (Original)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Revenue (USD)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Tokens (Original)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Tokens (USD)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Pending (Original)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Pending (USD)</th>
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

  const renderRevenueAnalysis = () => {
    if (!revenueAnalysisData) {
      return <div className="text-center py-4">No revenue analysis data available</div>;
    }

    const { summary, currencyBreakdown, dailyBreakdown } = revenueAnalysisData;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <FaChartBar className="text-blue-600 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-600">Total Sales</p>
                <p className="text-2xl font-bold text-blue-900">{summary.totalSales}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-center">
              <FaDollarSign className="text-green-600 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-green-600">Total Revenue (USD)</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(summary.totalRevenueUSD)}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <FaChartLine className="text-yellow-600 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-600">Tokens Received (USD)</p>
                <p className="text-2xl font-bold text-yellow-900">{formatCurrency(summary.totalTokensUSD)}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <div className="flex items-center">
              <FaCalendarAlt className="text-red-600 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-red-600">Pending Amount (USD)</p>
                <p className="text-2xl font-bold text-red-900">{formatCurrency(summary.pendingAmountUSD)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Currency Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out p-6 rounded-lg shadow-md dark:shadow-2xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Revenue by Currency</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Currency</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Sales</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Revenue (Original)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Revenue (USD)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Tokens (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {Object.entries(currencyBreakdown).map(([currency, data]) => (
                  <tr key={currency}>
                    <td className="px-4 py-2 font-medium">{currency}</td>
                    <td className="px-4 py-2">{data.totalSales}</td>
                    <td className="px-4 py-2">{formatCurrency(data.totalRevenue, currency)}</td>
                    <td className="px-4 py-2">{formatCurrency(data.revenueUSD)}</td>
                    <td className="px-4 py-2">{formatCurrency(data.tokensUSD)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Daily Breakdown Chart */}
        {dailyBreakdown && dailyBreakdown.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out p-6 rounded-lg shadow-md dark:shadow-2xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Daily Sales Trend</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Sales</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Revenue</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Tokens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {dailyBreakdown.slice(-10).map(day => (
                    <tr key={day.date}>
                      <td className="px-4 py-2 font-medium">{day.date}</td>
                      <td className="px-4 py-2">{day.sales}</td>
                      <td className="px-4 py-2">${day.revenue?.toFixed(2) || '0.00'}</td>
                      <td className="px-4 py-2">${day.tokens?.toFixed(2) || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTopCourses = () => {
    if (!topCoursesData || !topCoursesData.topCourses) {
      return <div className="text-center py-4">No top courses data available</div>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-slate-900 transition-all duration-200 ease-out border border-slate-200 dark:border-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                Total Sales
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                Total Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                Average Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                Completion Rate
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out divide-y divide-slate-200 dark:divide-slate-700">
            {topCoursesData.topCourses.map((course, index) => (
              <tr key={course.course} className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 transition-all duration-200 ease-out">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                  #{index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  {course.course}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                  {course.totalSales}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                  ${course.totalRevenue}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                  ${course.averagePrice}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 dark:bg-slate-600 rounded-full h-2 mr-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${course.completionRate}%` }}
                      ></div>
                    </div>
                    <span>{course.completionRate}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderStatusAnalysis = () => {
    if (!statusAnalysisData) {
      return <div className="text-center py-4">No status analysis data available</div>;
    }

    const { statusSummary, detailedSales, selectedStatus: currentStatus } = statusAnalysisData;

    return (
      <div className="space-y-6">
        {/* Status Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {statusSummary.map((statusData, index) => (
            <div 
              key={statusData.status} 
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                selectedStatus === statusData.status 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-gray-300 dark:border-slate-600'
              }`}
              onClick={() => setSelectedStatus(selectedStatus === statusData.status ? null : statusData.status)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-500">{statusData.status}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statusData.totalSales}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400">sales</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">{formatCurrency(statusData.totalRevenueUSD)}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400">revenue</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex justify-between text-xs text-slate-500 dark:text-gray-400">
                  <span>Avg: {formatCurrency(statusData.averageOrderValueUSD)}</span>
                  <span>Pending: {formatCurrency(statusData.pendingAmountUSD)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Sales Table (shown when a status is selected) */}
        {currentStatus && detailedSales && detailedSales.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out p-6 rounded-lg shadow-md dark:shadow-2xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">
              Detailed Sales for "{currentStatus}" Status ({detailedSales.length} sales)
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Customer</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Course</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Country</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Sales Person</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Total Cost</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Token</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Pending</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {detailedSales.map(sale => (
                    <tr key={sale._id} className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 transition-all duration-200 ease-out">
                      <td className="px-4 py-2 text-sm">{new Date(sale.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-sm font-medium">{sale.customerName}</td>
                      <td className="px-4 py-2 text-sm">{sale.course}</td>
                      <td className="px-4 py-2 text-sm">{sale.country}</td>
                      <td className="px-4 py-2 text-sm">{sale.salesPerson}</td>
                      <td className="px-4 py-2 text-sm">${sale.totalCost?.toFixed(2) || '0.00'}</td>
                      <td className="px-4 py-2 text-sm">${sale.tokenAmount?.toFixed(2) || '0.00'}</td>
                      <td className="px-4 py-2 text-sm">${sale.pendingAmount?.toFixed(2) || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>💡 Tip:</strong> Click on any status card above to view detailed sales data for that status. 
            The cards show total sales count, revenue, and pending amounts for each status.
          </p>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Sales Reports & Analytics</h2>
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

        {/* Course Analysis Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-2xl p-6 mb-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
              <FaGraduationCap className="mr-2 text-blue-600" />
              Course Sales Analysis
            </h3>
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2"
            >
              {courseFilterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {/* Toggle for Sales Count / Revenue */}
          <div className="flex items-center mb-4">
            <label className="mr-2 font-medium">Show:</label>
            <select
              value={courseChartMode}
              onChange={e => setCourseChartMode(e.target.value)}
              className="border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1 text-sm"
            >
              <option value="count">Sales Count</option>
              <option value="revenue">Revenue</option>
            </select>
          </div>
          {/* Chart rendering */}
          {(() => {
            const chartData = formatCourseDataForChart();
            return (
              <>
                {chartData.labels.length > 20 && (
                  <div className="text-xs text-gray-500 mb-2">Too many courses to fit: scroll horizontally to see all.</div>
                )}
                <div className="w-full overflow-x-auto">
                  <Bar data={{
                    labels: chartData.labels,
                    datasets: [
                      {
                        label: courseChartMode === 'count' ? 'Sales Count' : 'Revenue',
                        data: courseChartMode === 'count' ? chartData.countData : chartData.revenueData,
                        backgroundColor: 'rgba(37, 99, 235, 0.7)',
                        borderColor: 'rgba(37, 99, 235, 1)',
                        borderWidth: 1,
                      },
                    ],
                  }} options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      title: { display: false },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            if (courseChartMode === 'revenue') {
                              return `Revenue: $${context.parsed.y.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                            } else {
                              return `Sales: ${context.parsed.y}`;
                            }
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return courseChartMode === 'revenue' ? `$${value}` : value;
                          }
                        }
                      }
                    }
                  }} height={300} />
                </div>
              </>
            );
          })()}
          {/* Table removed: replaced with chart above */}
          {/* {renderCourseAnalysisTable()} */}
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

        {/* Revenue Analysis Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-2xl p-6 mb-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
              <FaDollarSign className="mr-2 text-green-600" />
              Revenue Analysis
            </h3>
            <select
              value={selectedRevenueFilter}
              onChange={(e) => setSelectedRevenueFilter(e.target.value)}
              className="border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2"
            >
              {revenueFilterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {renderRevenueAnalysis()}
        </div>

        {/* Top Courses Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-2xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
            <FaChartBar className="mr-2 text-purple-600" />
            Top Performing Courses (All Time)
          </h3>
          {renderTopCourses()}
        </div>

        {/* Status Analysis Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
              <FaChartPie className="mr-2 text-pink-600" />
              Status Analysis
            </h3>
            <div className="flex space-x-4">
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2"
              >
                <option value="1month">1 Month</option>
                <option value="3month">3 Months</option>
                <option value="6month">6 Months</option>
                <option value="1year">1 Year</option>
                <option value="all">All Time</option>
              </select>
              {selectedStatus && (
                <button
                  onClick={() => setSelectedStatus(null)}
                  className="bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out0 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>
          {renderStatusAnalysis()}
        </div>
      </div>
    </Layout>
  );
};

export default AdminReportsPage; 