import React from 'react';
import Layout from '../../components/Layout/Layout';
import StatsCards from './components/StatsCards';
import SalesCharts from './components/SalesCharts';
import SalesTable from './components/SalesTable';
import SearchFilters from './components/SearchFilters';
import { useSalesData } from './hooks/useSalesData';
import '../styles/sales-tracking.css';

const SalesTrackingPage = () => {
  const {
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
  } = useSalesData();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Sales Tracking
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor and analyze your sales performance
            </p>
          </div>
          
          <div className="flex space-x-4 mt-4 md:mt-0">
            <button className="btn-secondary flex items-center">
              <span className="mr-2">↓</span>
              Export
            </button>
            <button className="btn-primary flex items-center">
              <span className="mr-2">📊</span>
              Generate Report
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Charts */}
        <SalesCharts />

        {/* Search and Filters */}
        <SearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />

        {/* Sales Table */}
        <SalesTable
          loading={loading}
          data={sortedData()}
          sortConfig={sortConfig}
          handleSort={handleSort}
        />
      </div>
    </Layout>
  );
};

export default SalesTrackingPage;
