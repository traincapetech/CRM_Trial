import React, { useState, useEffect } from 'react';
import { salesAPI, authAPI, currencyAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import { FaPlus, FaSave, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import CurrencySelector from '../components/CurrencySelector';

import { professionalClasses, transitions, shadows } from '../utils/professionalDarkMode';
const SalesCreatePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [leadPersons, setLeadPersons] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({});
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    country: '',
    course: '',
    countryCode: '',
    contactNumber: '',
    email: '',
    pseudoId: '',
    leadPerson: '',
    source: '',
    clientRemark: '',
    feedback: '',
    totalCost: 0,
    totalCostCurrency: 'USD',
    tokenAmount: 0,
    tokenAmountCurrency: 'USD'
  });
  
  // Get user from auth context
  const { user } = useAuth();

  // Load lead persons and currency rates when component mounts
  useEffect(() => {
    loadLeadPersons();
    loadCurrencyRates();
  }, []);

  const loadLeadPersons = async () => {
    try {
      const res = await authAPI.getUsers('Lead Person');
      if (res.data.success) {
        setLeadPersons(res.data.data || []);
      } else {
        toast.error('Failed to load lead persons');
      }
    } catch (err) {
      console.error('Error loading lead persons:', err);
      toast.error('Failed to load lead persons');
    }
  };

  const loadCurrencyRates = async () => {
    try {
      const res = await currencyAPI.getRates();
      if (res.data.success) {
        setExchangeRates(res.data.rates || {});
      }
    } catch (err) {
      console.error('Error loading currency rates:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCurrencyChange = (field, currency) => {
    setFormData(prev => ({
      ...prev,
      [`${field}Currency`]: currency
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate the form
      if (!formData.leadPerson) {
        throw new Error('Please select a Lead Person');
      }

      // Check if user info is available
      if (!user) {
        throw new Error('User information not available. Please log in again.');
      }

      // Prepare sale data for submission
      const saleData = {
        date: formData.date,
        customerName: formData.customerName,
        country: formData.country,
        course: formData.course,
        countryCode: formData.countryCode,
        contactNumber: formData.contactNumber,
        email: formData.email,
        pseudoId: formData.pseudoId,
        totalCost: parseFloat(formData.totalCost),
        totalCostCurrency: formData.totalCostCurrency,
        tokenAmount: parseFloat(formData.tokenAmount),
        tokenAmountCurrency: formData.tokenAmountCurrency,
        source: formData.source,
        clientRemark: formData.clientRemark,
        feedback: formData.feedback
      };
      
      // Use our new API method to create a sale with a specific lead person
      const res = await salesAPI.createSaleWithLeadPerson(saleData, formData.leadPerson);
      
      if (res.data.success) {
        toast.success('Sale created successfully! This sale will appear on the lead person\'s dashboard.');
        
        // Reset form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          customerName: '',
          country: '',
          course: '',
          countryCode: '',
          contactNumber: '',
          email: '',
          pseudoId: '',
          leadPerson: '',
          source: '',
          clientRemark: '',
          feedback: '',
          totalCost: 0,
          totalCostCurrency: 'USD',
          tokenAmount: 0,
          tokenAmountCurrency: 'USD'
        });
      }
    } catch (err) {
      console.error('Error creating sale:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create sale');
      toast.error(err.response?.data?.message || err.message || 'Failed to create sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Create Sale for Lead Person</h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out shadow-md dark:shadow-2xl rounded-lg p-6 mb-6 shadow-sm">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                  required
                />
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Customer Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                  required
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                  required
                />
              </div>

              {/* Course */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course</label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                  required
                />
              </div>

              {/* Country Code */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Country Code</label>
                <input
                  type="text"
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                  placeholder="e.g. +1, +91"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                />
              </div>

              {/* Pseudo ID */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pseudo ID</label>
                <input
                  type="text"
                  name="pseudoId"
                  value={formData.pseudoId}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                />
              </div>

              {/* Lead Person - This is the key field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lead Person</label>
                <select
                  name="leadPerson"
                  value={formData.leadPerson}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                  required
                >
                  <option value="">Select Lead Person</option>
                  {leadPersons.map(person => (
                    <option key={person._id} value={person._id}>
                      {person.fullName}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">
                  The lead person will see this sale on their dashboard
                </p>
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Source</label>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                />
              </div>

              {/* Total Cost */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Cost</label>
                <div className="flex">
                  <input
                    type="number"
                    name="totalCost"
                    value={formData.totalCost}
                    onChange={handleChange}
                    className="w-2/3 p-2 border border-slate-300 dark:border-slate-600 rounded-l-md"
                    required
                  />
                  <select
                    name="totalCostCurrency"
                    value={formData.totalCostCurrency}
                    onChange={e => handleCurrencyChange('totalCost', e.target.value)}
                    className="w-1/3 p-2 border border-slate-300 dark:border-slate-600 rounded-r-md"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
              </div>

              {/* Token Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Token Amount</label>
                <div className="flex">
                  <input
                    type="number"
                    name="tokenAmount"
                    value={formData.tokenAmount}
                    onChange={handleChange}
                    className="w-2/3 p-2 border border-slate-300 dark:border-slate-600 rounded-l-md"
                    required
                  />
                  <select
                    name="tokenAmountCurrency"
                    value={formData.tokenAmountCurrency}
                    onChange={e => handleCurrencyChange('tokenAmount', e.target.value)}
                    className="w-1/3 p-2 border border-slate-300 dark:border-slate-600 rounded-r-md"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Client Remark */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client Remark</label>
              <textarea
                name="clientRemark"
                value={formData.clientRemark}
                onChange={handleChange}
                rows="2"
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
              ></textarea>
            </div>

            {/* Feedback */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Feedback</label>
              <textarea
                name="feedback"
                value={formData.feedback}
                onChange={handleChange}
                rows="2"
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
              ></textarea>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm dark:shadow-xl hover:shadow-md transition-all duration-200 text-white rounded-md disabled:bg-blue-300 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" /> Create Sale for Lead Person
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md mb-6">
          <h2 className="text-lg font-semibold mb-2">How This Works</h2>
          <p className="mb-2">
            When you create a sale using this form and select a Lead Person, the sale will:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Be credited to you as the Sales Person</li>
            <li>Appear on the Lead Person's dashboard</li>
            <li>Allow the Lead Person to track your sales progress</li>
            <li>Create transparency and collaboration between Sales and Lead teams</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default SalesCreatePage; 