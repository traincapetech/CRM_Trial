import React, { useState, useEffect } from 'react';
import { payrollAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SalarySlipWidget = () => {
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState(null);
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const response = await payrollAPI.getAll({
        month: selectedMonth,
        year: selectedYear
      });
      console.log('Payroll API Response:', response.data);
      setPayrollData(response.data.data);
      setDebug(response.data.debug);
      setError(null);
    } catch (error) {
      console.error('Error fetching payroll data:', error);
      setError('Failed to load salary data');
      setPayrollData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, [selectedMonth, selectedYear]);

  const handleDownload = async (id) => {
    try {
      const response = await payrollAPI.downloadSalarySlip(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `salary-slip-${selectedMonth}-${selectedYear}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading salary slip:', error);
      alert('Failed to download salary slip. Please try again.');
    }
  };

  const months = [
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
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + 1 - i);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Salary Slips
        </h2>
        <div className="flex space-x-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="text-center text-red-500 dark:text-red-400">
          <p>{error}</p>
          <button
            onClick={fetchPayrollData}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      ) : payrollData.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No salary slips available for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
          </p>
          {debug && (
            <div className="mt-4 text-xs text-gray-400">
              <p>User Role: {debug.userRole}</p>
              <p>Employee ID: {debug.employeeId}</p>
              <p>User ID: {debug.userId}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {payrollData.map((slip) => (
            <div
              key={slip._id}
              className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">
                  {months.find(m => m.value === slip.month)?.label} {slip.year}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Net Salary: ₹{slip.netSalary.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Status: {slip.status}
                </p>
                {slip._employeeMatch && (
                  <span className="text-xs text-green-500">Employee Match</span>
                )}
                {slip._userMatch && (
                  <span className="text-xs text-blue-500 ml-2">User Match</span>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownload(slip._id)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:ring-offset-gray-800"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalarySlipWidget; 