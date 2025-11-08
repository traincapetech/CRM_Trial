import { useState, useEffect } from 'react';
import { salesAPI } from '../../../services/api';

export const useSalesData = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    monthlyRevenue: 0,
    averageOrderValue: 0,
    conversionRate: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const response = await salesAPI.getSalesData();
      setSalesData(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.reduce((sum, sale) => sum + sale.amount, 0);
    const monthly = data
      .filter(sale => {
        const saleDate = new Date(sale.date);
        const currentDate = new Date();
        return saleDate.getMonth() === currentDate.getMonth() &&
               saleDate.getFullYear() === currentDate.getFullYear();
      })
      .reduce((sum, sale) => sum + sale.amount, 0);
    
    setStats({
      totalSales: data.length,
      monthlyRevenue: monthly,
      averageOrderValue: total / data.length || 0,
      conversionRate: (data.filter(sale => sale.status === 'completed').length / data.length) * 100 || 0
    });
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const sortedData = () => {
    const sorted = [...salesData].sort((a, b) => {
      if (sortConfig.key === 'date') {
        return sortConfig.direction === 'asc'
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
      return sortConfig.direction === 'asc'
        ? a[sortConfig.key] - b[sortConfig.key]
        : b[sortConfig.key] - a[sortConfig.key];
    });

    return sorted.filter(sale =>
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterStatus === 'all' || sale.status === filterStatus)
    );
  };

  return {
    salesData,
    loading,
    stats,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    sortConfig,
    setSortConfig,
    dateRange,
    setDateRange,
    handleSort,
    sortedData
  };
};
