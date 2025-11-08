import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { leadsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from '../components/ui/LoadingSpinner';

import { professionalClasses, transitions, shadows } from '../utils/professionalDarkMode';
const RepeatCustomersPage = () => {
  const { user } = useAuth();
  const [repeatCustomers, setRepeatCustomers] = useState([]);
  const [stats, setStats] = useState({ totalRepeatCustomers: 0, totalLeads: 0, averageCoursesPerCustomer: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  useEffect(() => {
    fetchRepeatCustomers();
  }, []);

  const fetchRepeatCustomers = async () => {
    try {
      setLoading(true);
      const response = await leadsAPI.getRepeatCustomers();
      
      if (response.data.success) {
        setRepeatCustomers(response.data.data);
        setStats(response.data.stats);
        setError(null);
      } else {
        setError("Failed to load repeat customer data");
      }
    } catch (err) {
      console.error("Error fetching repeat customers:", err);
      setError("Failed to load repeat customer data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Toggle expanded customer view
  const toggleCustomerExpansion = (index) => {
    if (expandedCustomer === index) {
      setExpandedCustomer(null);
    } else {
      setExpandedCustomer(index);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Repeat Customers</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out p-6 rounded-lg shadow-md dark:shadow-2xl shadow-sm">
            <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Total Repeat Customers</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalRepeatCustomers}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out p-6 rounded-lg shadow-md dark:shadow-2xl shadow-sm">
            <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Total Courses Purchased</p>
            <p className="text-3xl font-bold text-green-600">{stats.totalLeads}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out p-6 rounded-lg shadow-md dark:shadow-2xl shadow-sm">
            <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Avg. Courses per Customer</p>
            <p className="text-3xl font-bold text-purple-600">{stats.averageCoursesPerCustomer}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {/* Loading Indicator */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner 
              size={55}
              text="Loading repeat customers..."
              particleCount={2}
              speed={1.4}
              hueRange={[240, 300]}
            />
          </div>
        ) : (
          <>
            {/* Customer List */}
            {repeatCustomers.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out p-6 rounded-lg shadow-md dark:shadow-2xl text-center shadow-sm">
                <p className="text-slate-500 dark:text-gray-400">No repeat customers found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {repeatCustomers.map((customer, index) => (
                  <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-2xl overflow-hidden shadow-sm">
                    {/* Customer Header - Always Visible */}
                    <div 
                      className="p-4 bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out border-b border-slate-200 dark:border-slate-700 flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={() => toggleCustomerExpansion(index)}
                    >
                      <div>
                        <h3 className="text-lg font-medium">{customer.customerInfo.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-gray-400">
                          {customer.customerInfo.email && (
                            <span className="mr-3">{customer.customerInfo.email}</span>
                          )}
                          {customer.customerInfo.phone && (
                            <span>{customer.customerInfo.countryCode} {customer.customerInfo.phone}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 mr-3">
                          {customer.leads.length} courses
                        </span>
                        <svg
                          className={`h-5 w-5 text-gray-500 dark:text-gray-400 dark:text-gray-400 transform ${expandedCustomer === index ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Expandable Details Section */}
                    {expandedCustomer === index && (
                      <div className="p-4">
                        <h4 className="text-md font-medium mb-2">Course History</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                                  Course
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                                  Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                                  Sales Person
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out divide-y divide-slate-200 dark:divide-slate-700">
                              {customer.leads.map((lead, leadIndex) => (
                                <tr key={leadIndex} className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 transition-all duration-200 ease-out">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {lead.course}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
                                    {formatDate(lead.createdAt)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
                                    {lead.salesPerson}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default RepeatCustomersPage; 