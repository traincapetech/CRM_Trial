import api from './api';

export const stripeInvoiceAPI = {
  // Create Stripe invoice
  create: async (invoiceData) => {
    const response = await api.post('/stripe-invoices', invoiceData);
    return response.data;
  },

  // Get all Stripe invoices
  getAll: async (params = {}) => {
    const response = await api.get('/stripe-invoices', { params });
    return response.data;
  },

  // Get single Stripe invoice
  getById: async (id) => {
    const response = await api.get(`/stripe-invoices/${id}`);
    return response.data;
  },

  // Get invoice statistics
  getStats: async () => {
    const response = await api.get('/stripe-invoices/stats');
    return response.data;
  },

  // Send invoice reminder
  sendReminder: async (id) => {
    const response = await api.post(`/stripe-invoices/${id}/remind`);
    return response.data;
  }
}; 