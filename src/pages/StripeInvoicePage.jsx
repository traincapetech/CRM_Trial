import React, { useState, useEffect } from 'react';
import { stripeInvoiceAPI } from '../services/stripeInvoiceAPI';
import { invoiceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const StripeInvoicePage = () => {
  const { user } = useAuth();
  const [stripeInvoices, setStripeInvoices] = useState([]);
  const [crmInvoices, setCrmInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading invoice data...');
      
      // Load CRM invoices first
      const crmResponse = await invoiceAPI.getAll();
      console.log('CRM API response:', crmResponse);
      console.log('CRM invoices data:', crmResponse.data);
      
      // Handle different response formats
      let crmInvoicesData = [];
      if (crmResponse && crmResponse.data) {
        if (Array.isArray(crmResponse.data)) {
          crmInvoicesData = crmResponse.data;
        } else if (crmResponse.data.invoices) {
          crmInvoicesData = crmResponse.data.invoices;
        } else if (crmResponse.data.data) {
          crmInvoicesData = crmResponse.data.data;
        }
      }
      
      console.log('Processed CRM invoices:', crmInvoicesData);
      setCrmInvoices(crmInvoicesData);
      
      // Try to load Stripe invoices
      try {
        const stripeResponse = await stripeInvoiceAPI.getAll();
        console.log('Stripe invoices loaded:', stripeResponse);
        setStripeInvoices(stripeResponse || []);
      } catch (stripeError) {
        console.log('Stripe API not available:', stripeError);
        setStripeInvoices([]);
      }
      
    } catch (error) {
      console.error('Error loading invoice data:', error);
      setError('Failed to load invoice data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const createStripeInvoice = async (crmInvoiceId) => {
    setCreating(true);
    try {
      console.log('Creating Stripe invoice for CRM invoice:', crmInvoiceId);
      
      const crmInvoice = crmInvoices.find(inv => inv._id === crmInvoiceId);
      if (!crmInvoice) {
        throw new Error('CRM invoice not found');
      }

      console.log('Found CRM invoice:', crmInvoice);
      console.log('CRM invoice items:', crmInvoice.items);

      const stripeInvoiceData = {
        crmInvoiceId: crmInvoiceId,
        customerData: {
          email: crmInvoice.clientInfo?.email || 'customer@example.com',
          name: crmInvoice.clientInfo?.name || 'Customer Name',
          crmId: crmInvoice._id
        },
        items: crmInvoice.items?.map(item => {
          const mappedItem = {
            description: item.description || 'Item',
            quantity: item.quantity || 1,
            unitPrice: parseFloat(item.unitPrice) || parseFloat(item.total) || 0,
            taxRate: parseFloat(item.taxRate) || 0
          };
          console.log('Mapping item:', item, 'to:', mappedItem);
          return mappedItem;
        }) || [],
        dueDate: crmInvoice.dueDate || new Date().toISOString()
      };

      console.log('Sending Stripe invoice data:', stripeInvoiceData);
      const response = await stripeInvoiceAPI.create(stripeInvoiceData);
      console.log('Stripe invoice created:', response);
      
      // Refresh data after creation
      await loadData();
      
      alert('Stripe invoice created successfully!');
    } catch (error) {
      console.error('Error creating Stripe invoice:', error);
      alert('Failed to create Stripe invoice: ' + (error.response?.data?.message || error.message));
    } finally {
      setCreating(false);
    }
  };

  const sendReminder = async (stripeInvoiceId) => {
    try {
      await stripeInvoiceAPI.sendReminder(stripeInvoiceId);
      alert('Reminder sent successfully!');
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading invoice data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                💳 Stripe Invoice Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create and manage Stripe-powered invoices with automatic payment processing
              </p>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                loading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Loading...' : '🔄 Refresh Data'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Debug Section - Remove this after fixing */}
        {/* <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            🔍 Debug Information
          </h3>
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p><strong>CRM Invoices Loaded:</strong> {crmInvoices.length}</p>
            <p><strong>Stripe Invoices Loaded:</strong> {stripeInvoices.length}</p>
            <p><strong>Loading State:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>Creating State:</strong> {creating ? 'Yes' : 'No'}</p>
            {crmInvoices.length > 0 && (
              <div className="mt-2">
                <p><strong>First CRM Invoice:</strong></p>
                <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto">
                  {JSON.stringify(crmInvoices[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div> */}

        {/* Stripe Status */}
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
            ✅ Stripe Integration Ready
          </h3>
          <div className="text-sm text-green-800 dark:text-green-200">
            <p>Your Stripe API keys are configured and working correctly. You can now create Stripe invoices!</p>
          </div>
        </div>

        {/* Create New Stripe Invoice Section */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Create Stripe Invoice from CRM Invoice
          </h2>
          
          {crmInvoices.length > 0 ? (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Select a CRM invoice to create a Stripe invoice for payment processing:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {crmInvoices.map((invoice) => (
                  <div key={invoice._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      {invoice.invoiceNumber || 'Invoice #' + invoice._id.slice(-6)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {invoice.clientInfo?.name || 'Customer'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Amount: ${invoice.totalAmount || 0}
                    </p>
                    <button
                      onClick={() => createStripeInvoice(invoice._id)}
                      disabled={creating}
                      className={`w-full px-3 py-2 rounded-md text-sm transition-colors ${
                        creating
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {creating ? 'Creating...' : 'Create Stripe Invoice'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📄</div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No CRM invoices available. Create invoices in the Invoice Management section first.
              </p>
              <a
                href="/invoice-management"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to Invoice Management
              </a>
            </div>
          )}
        </div>

        {/* Stripe Invoices List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Stripe Invoices ({stripeInvoices.length})
          </h2>
          
          {stripeInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {stripeInvoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {invoice.customerName || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {invoice.customerEmail || 'No email'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          ${invoice.amount || 0} {invoice.currency || 'USD'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                          invoice.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status || 'unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {invoice.stripeInvoiceUrl && (
                            <a
                              href={invoice.stripeInvoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              View
                            </a>
                          )}
                          {invoice.status === 'open' && (
                            <button
                              onClick={() => sendReminder(invoice._id)}
                              className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                            >
                              Send Reminder
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Stripe Invoices Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create your first Stripe invoice by selecting a CRM invoice above.
              </p>
            </div>
          )}
        </div>

        {/* Integration Info */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            🔗 Stripe Integration Benefits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <p className="font-medium mb-2">✅ Automatic Payment Processing</p>
              <p>Customers can pay directly through Stripe's secure payment system</p>
            </div>
            <div>
              <p className="font-medium mb-2">✅ Real-time Status Updates</p>
              <p>Get instant notifications when payments are received or failed</p>
            </div>
            <div>
              <p className="font-medium mb-2">✅ Professional Invoice Templates</p>
              <p>Stripe provides beautiful, branded invoice templates</p>
            </div>
            <div>
              <p className="font-medium mb-2">✅ Automated Reminders</p>
              <p>Send payment reminders automatically to customers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripeInvoicePage; 