import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import { invoiceAPI, salesAPI, leadsAPI, authAPI } from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaEye, FaDownload, FaFilePdf, FaFilter, FaSearch, FaTimes, FaMoneyBillWave, FaCalendarAlt, FaUser, FaBuilding } from 'react-icons/fa';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { professionalClasses, transitions, shadows } from '../utils/professionalDarkMode';
import logo from '../assets/traincape-logo.jpg';

const InvoiceManagementPage = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [sales, setSales] = useState([]);
  const [leads, setLeads] = useState([]);
  const [salesPersons, setSalesPersons] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    clientEmail: '',
    invoiceNumber: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'Bank Transfer',
    reference: '',
    notes: ''
  });

  // Form data for invoice creation/editing
  const [formData, setFormData] = useState({
    // Company Information
    companyInfo: {
      name: 'Traincape Technology',
      logo: logo,
      address: {
        street: 'Khandolia Plaza, 118C, Dabri - Palam Rd, Vaishali, Vaishali Colony, Dashrath Puri',
        city: 'New Delhi',
        state: 'Delhi',
        zipCode: '110045',
        country: 'India'
      },
      gstin: '07AAJCT0342G1ZJ',
      pan: 'AAJCT0342G',
      email: 'sales@traincapetech.in',
      phone: '+44 1253 928501',
      website: 'https://traincapetech.in/'
    },
    // Client Information
    clientInfo: {
      name: '',
      company: '',
      address: {
        street: 'N/A',
        city: 'N/A',
        state: 'N/A',
        zipCode: 'N/A',
        country: 'N/A'
      },
          email: '',
      phone: ''
    },
    // Invoice Details
    paymentTerms: 'Due on Receipt',
    customPaymentTerms: '',
    currency: 'INR',
    currencySymbol: '₹',
    // Line Items
    items: [{
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 18,
      discount: 0,
      discountType: 'percentage'
    }],
    // Notes and Terms
    notes: '',
    terms: 'Payment is due within the specified terms. Late payments may incur additional charges.',
    // Related Records
    relatedSale: '',
    relatedLead: ''
  });

  // Currency configuration - All major world currencies
  const currencyConfig = {
    // Major Global Currencies
    'USD': { symbol: '$', name: 'US Dollar' },
    'EUR': { symbol: '€', name: 'Euro' },
    'GBP': { symbol: '£', name: 'British Pound' },
    'JPY': { symbol: '¥', name: 'Japanese Yen' },
    'CNY': { symbol: '¥', name: 'Chinese Yuan' },
    'INR': { symbol: '₹', name: 'Indian Rupee' },
    
    // North America
    'CAD': { symbol: 'C$', name: 'Canadian Dollar' },
    'MXN': { symbol: 'MX$', name: 'Mexican Peso' },
    
    // Europe
    'CHF': { symbol: 'CHF', name: 'Swiss Franc' },
    'SEK': { symbol: 'kr', name: 'Swedish Krona' },
    'NOK': { symbol: 'kr', name: 'Norwegian Krone' },
    'DKK': { symbol: 'kr', name: 'Danish Krone' },
    'PLN': { symbol: 'zł', name: 'Polish Złoty' },
    'CZK': { symbol: 'Kč', name: 'Czech Koruna' },
    'HUF': { symbol: 'Ft', name: 'Hungarian Forint' },
    'RUB': { symbol: '₽', name: 'Russian Ruble' },
    'TRY': { symbol: '₺', name: 'Turkish Lira' },
    'BGN': { symbol: 'лв', name: 'Bulgarian Lev' },
    'RON': { symbol: 'lei', name: 'Romanian Leu' },
    'HRK': { symbol: 'kn', name: 'Croatian Kuna' },
    'RSD': { symbol: 'дин', name: 'Serbian Dinar' },
    'UAH': { symbol: '₴', name: 'Ukrainian Hryvnia' },
    
    // Asia Pacific
    'AUD': { symbol: 'A$', name: 'Australian Dollar' },
    'NZD': { symbol: 'NZ$', name: 'New Zealand Dollar' },
    'SGD': { symbol: 'S$', name: 'Singapore Dollar' },
    'HKD': { symbol: 'HK$', name: 'Hong Kong Dollar' },
    'KRW': { symbol: '₩', name: 'South Korean Won' },
    'TWD': { symbol: 'NT$', name: 'Taiwan Dollar' },
    'THB': { symbol: '฿', name: 'Thai Baht' },
    'MYR': { symbol: 'RM', name: 'Malaysian Ringgit' },
    'IDR': { symbol: 'Rp', name: 'Indonesian Rupiah' },
    'PHP': { symbol: '₱', name: 'Philippine Peso' },
    'VND': { symbol: '₫', name: 'Vietnamese Dong' },
    'BDT': { symbol: '৳', name: 'Bangladeshi Taka' },
    'PKR': { symbol: '₨', name: 'Pakistani Rupee' },
    'LKR': { symbol: 'Rs', name: 'Sri Lankan Rupee' },
    'NPR': { symbol: '₨', name: 'Nepalese Rupee' },
    'MMK': { symbol: 'K', name: 'Myanmar Kyat' },
    'KHR': { symbol: '៛', name: 'Cambodian Riel' },
    'LAK': { symbol: '₭', name: 'Lao Kip' },
    'MNT': { symbol: '₮', name: 'Mongolian Tugrik' },
    
    // Middle East & Africa
    'AED': { symbol: 'د.إ', name: 'UAE Dirham' },
    'SAR': { symbol: '﷼', name: 'Saudi Riyal' },
    'QAR': { symbol: 'ر.ق', name: 'Qatari Riyal' },
    'KWD': { symbol: 'د.ك', name: 'Kuwaiti Dinar' },
    'BHD': { symbol: '.د.ب', name: 'Bahraini Dinar' },
    'OMR': { symbol: 'ر.ع.', name: 'Omani Rial' },
    'JOD': { symbol: 'د.ا', name: 'Jordanian Dinar' },
    'LBP': { symbol: 'ل.ل', name: 'Lebanese Pound' },
    'EGP': { symbol: 'ج.م', name: 'Egyptian Pound' },
    'ZAR': { symbol: 'R', name: 'South African Rand' },
    'NGN': { symbol: '₦', name: 'Nigerian Naira' },
    'KES': { symbol: 'KSh', name: 'Kenyan Shilling' },
    'GHS': { symbol: 'GH₵', name: 'Ghanaian Cedi' },
    'UGX': { symbol: 'USh', name: 'Ugandan Shilling' },
    'TZS': { symbol: 'TSh', name: 'Tanzanian Shilling' },
    'ETB': { symbol: 'Br', name: 'Ethiopian Birr' },
    'MAD': { symbol: 'د.م.', name: 'Moroccan Dirham' },
    'TND': { symbol: 'د.ت', name: 'Tunisian Dinar' },
    'DZD': { symbol: 'د.ج', name: 'Algerian Dinar' },
    'LYD': { symbol: 'ل.د', name: 'Libyan Dinar' },
    'SDG': { symbol: 'ج.س.', name: 'Sudanese Pound' },
    'SOS': { symbol: 'S', name: 'Somali Shilling' },
    'DJF': { symbol: 'Fdj', name: 'Djiboutian Franc' },
    'KMF': { symbol: 'CF', name: 'Comorian Franc' },
    'MUR': { symbol: '₨', name: 'Mauritian Rupee' },
    'SCR': { symbol: '₨', name: 'Seychellois Rupee' },
    'MVR': { symbol: 'ރ.', name: 'Maldivian Rufiyaa' },
    'CVE': { symbol: '$', name: 'Cape Verdean Escudo' },
    'STD': { symbol: 'Db', name: 'São Tomé and Príncipe Dobra' },
    'GMD': { symbol: 'D', name: 'Gambian Dalasi' },
    'GNF': { symbol: 'FG', name: 'Guinean Franc' },
    'SLL': { symbol: 'Le', name: 'Sierra Leonean Leone' },
    'LRD': { symbol: 'L$', name: 'Liberian Dollar' },
    'XOF': { symbol: 'CFA', name: 'West African CFA Franc' },
    'XAF': { symbol: 'FCFA', name: 'Central African CFA Franc' },
    'XPF': { symbol: 'CFP', name: 'CFP Franc' },
    
    // South America
    'ARS': { symbol: '$', name: 'Argentine Peso' },
    'CLP': { symbol: '$', name: 'Chilean Peso' },
    'COP': { symbol: '$', name: 'Colombian Peso' },
    'PEN': { symbol: 'S/', name: 'Peruvian Sol' },
    'UYU': { symbol: '$', name: 'Uruguayan Peso' },
    'PYG': { symbol: '₲', name: 'Paraguayan Guaraní' },
    'BOB': { symbol: 'Bs.', name: 'Bolivian Boliviano' },
    'VES': { symbol: 'Bs.', name: 'Venezuelan Bolívar' },
    'GYD': { symbol: '$', name: 'Guyanese Dollar' },
    'SRD': { symbol: '$', name: 'Surinamese Dollar' },
    'FKP': { symbol: '£', name: 'Falkland Islands Pound' },
    
    // Central America & Caribbean
    'GTQ': { symbol: 'Q', name: 'Guatemalan Quetzal' },
    'HNL': { symbol: 'L', name: 'Honduran Lempira' },
    'NIO': { symbol: 'C$', name: 'Nicaraguan Córdoba' },
    'CRC': { symbol: '₡', name: 'Costa Rican Colón' },
    'PAB': { symbol: 'B/.', name: 'Panamanian Balboa' },
    'BZD': { symbol: 'BZ$', name: 'Belize Dollar' },
    'JMD': { symbol: 'J$', name: 'Jamaican Dollar' },
    'TTD': { symbol: 'TT$', name: 'Trinidad and Tobago Dollar' },
    'BBD': { symbol: 'Bds$', name: 'Barbadian Dollar' },
    'XCD': { symbol: 'EC$', name: 'East Caribbean Dollar' },
    'AWG': { symbol: 'ƒ', name: 'Aruban Florin' },
    'ANG': { symbol: 'ƒ', name: 'Netherlands Antillean Guilder' },
    'KYD': { symbol: 'CI$', name: 'Cayman Islands Dollar' },
    'BMD': { symbol: 'BD$', name: 'Bermudian Dollar' },
    
    // Other Major Currencies
    'ILS': { symbol: '₪', name: 'Israeli Shekel' },
    'CLF': { symbol: 'UF', name: 'Chilean Unit of Account' },
    'KZT': { symbol: '₸', name: 'Kazakhstani Tenge' },
    'UZS': { symbol: 'so\m', name: 'Uzbekistani Som' },
    'TJS': { symbol: 'ЅM', name: 'Tajikistani Somoni' },
    'TMT': { symbol: 'T', name: 'Turkmenistani Manat' },
    'GEL': { symbol: '₾', name: 'Georgian Lari' },
    'AMD': { symbol: '֏', name: 'Armenian Dram' },
    'AZN': { symbol: '₼', name: 'Azerbaijani Manat' },
    'BYN': { symbol: 'Br', name: 'Belarusian Ruble' },
    'MDL': { symbol: 'L', name: 'Moldovan Leu' },
    'ALL': { symbol: 'L', name: 'Albanian Lek' },
    'MKD': { symbol: 'ден', name: 'Macedonian Denar' },
    'BAM': { symbol: 'KM', name: 'Bosnia-Herzegovina Convertible Mark' },
    'MOP': { symbol: 'MOP$', name: 'Macanese Pataca' },
    'KGS': { symbol: 'с', name: 'Kyrgyzstani Som' },
    'AFN': { symbol: '؋', name: 'Afghan Afghani' },
    'IRR': { symbol: '﷼', name: 'Iranian Rial' },
    'IQD': { symbol: 'ع.د', name: 'Iraqi Dinar' },
    'YER': { symbol: '﷼', name: 'Yemeni Rial' },
    'SYP': { symbol: '£', name: 'Syrian Pound' }
  };

  // Load initial data
  useEffect(() => {
    fetchInvoices();
    fetchSales();
    fetchLeads();
    fetchSalesPersons();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceAPI.getAll(filters);
      if (response.data.success) {
        setInvoices(response.data.data);
      } else {
        setError('Failed to fetch invoices');
        toast.error('Failed to fetch invoices');
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Failed to fetch invoices');
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await salesAPI.getAll();
      if (response.data.success) {
        setSales(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching sales:', err);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await leadsAPI.getAll();
      if (response.data.success) {
        setLeads(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    }
  };

  const fetchSalesPersons = async () => {
    try {
      const response = await authAPI.getUsers('Sales Person');
      if (response.data.success) {
        setSalesPersons(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching sales persons:', err);
    }
  };

  // Apply filters
  useEffect(() => {
    fetchInvoices();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      startDate: '',
      endDate: '',
      clientEmail: '',
      invoiceNumber: ''
    });
  };

  const handleFormChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Update currency symbol when currency changes
    if (field === 'currency' && currencyConfig[value]) {
      setFormData(prev => ({
        ...prev,
        currencySymbol: currencyConfig[value].symbol
      }));
    }
  };

  const handleAddressChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        address: {
          ...prev[section].address,
          [field]: value
        }
      }
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          // Convert numeric fields to numbers
          const numericFields = ['quantity', 'unitPrice', 'taxRate', 'discount'];
          const convertedValue = numericFields.includes(field) ? parseFloat(value) || 0 : value;
          return { ...item, [field]: convertedValue };
        }
        return item;
      })
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 18,
        discount: 0,
        discountType: 'percentage'
      }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateItemTotal = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const taxRate = parseFloat(item.taxRate) || 0;
    const discount = parseFloat(item.discount) || 0;
    
    const lineTotal = quantity * unitPrice;
    const discountAmount = item.discountType === 'percentage' 
      ? (lineTotal * discount / 100)
      : discount;
    const subtotal = lineTotal - discountAmount;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    return isNaN(total) ? 0 : total;
  };

  const calculateInvoiceTotal = () => {
    const total = formData.items.reduce((total, item) => total + calculateItemTotal(item), 0);
    return isNaN(total) ? 0 : total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (!formData.clientInfo.name || !formData.clientInfo.email) {
        throw new Error('Client name and email are required');
      }

      if (formData.items.some(item => !item.description || !item.unitPrice || item.unitPrice <= 0)) {
        throw new Error('All items must have description and valid unit price');
      }

      // Ensure all numeric values are properly converted
      const invoiceData = {
        ...formData,
        items: formData.items.map(item => {
          const quantity = parseFloat(item.quantity) || 0;
          const unitPrice = parseFloat(item.unitPrice) || 0;
          const taxRate = parseFloat(item.taxRate) || 0;
          const discount = parseFloat(item.discount) || 0;
          
          const lineTotal = quantity * unitPrice;
          const discountAmount = item.discountType === 'percentage' 
            ? (lineTotal * discount / 100)
            : discount;
          const subtotal = lineTotal - discountAmount;
          const taxAmount = subtotal * (taxRate / 100);
          const total = subtotal + taxAmount;

          return {
            ...item,
            quantity,
            unitPrice,
            taxRate,
            discount,
            subtotal,
            taxAmount,
            total
          };
        })
      };

      // Calculate totals
      const subtotal = invoiceData.items.reduce((sum, item) => sum + item.subtotal, 0);
      const totalTax = invoiceData.items.reduce((sum, item) => sum + item.taxAmount, 0);
      const totalAmount = subtotal + totalTax;
      const balanceDue = totalAmount; // Initially, balance due equals total amount

      // Add missing required fields
      invoiceData.subtotal = subtotal;
      invoiceData.totalTax = totalTax;
      invoiceData.totalAmount = totalAmount;
      invoiceData.balanceDue = balanceDue;
      invoiceData.amountPaid = 0;

      // Handle empty ObjectId fields
      if (!invoiceData.relatedSale || invoiceData.relatedSale === '') {
        delete invoiceData.relatedSale;
      }
      if (!invoiceData.relatedLead || invoiceData.relatedLead === '') {
        delete invoiceData.relatedLead;
      }

      console.log('Sending invoice data:', JSON.stringify(invoiceData, null, 2));

      let response;
      if (editingInvoice) {
        response = await invoiceAPI.update(editingInvoice._id, invoiceData);
        toast.success('Invoice updated successfully');
      } else {
        response = await invoiceAPI.create(invoiceData);
        toast.success('Invoice created successfully');
      }

      if (response.data.success) {
        setShowForm(false);
        setEditingInvoice(null);
        resetForm();
        fetchInvoices();
      }
    } catch (err) {
      console.error('Error saving invoice:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      companyInfo: {
        name: 'Traincape Technology',
        logo: logo,
        address: {
          street: '123 Tech Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        gstin: '27AABCT1234Z1Z5',
        pan: 'AABCT1234G',
        email: 'info@traincapetech.in',
        phone: '+91 98765 43210',
        website: 'www.traincapetech.in'
      },
      clientInfo: {
        name: '',
        company: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India'
        },
        email: '',
        phone: ''
      },
      paymentTerms: 'Due on Receipt',
      customPaymentTerms: '',
      currency: 'INR',
      currencySymbol: '₹',
      items: [{
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 18,
        discount: 0,
        discountType: 'percentage'
      }],
      notes: '',
      terms: 'Payment is due within the specified terms. Late payments may incur additional charges.',
      relatedSale: '',
      relatedLead: ''
    });
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      companyInfo: invoice.companyInfo,
      clientInfo: invoice.clientInfo,
      paymentTerms: invoice.paymentTerms,
      customPaymentTerms: invoice.customPaymentTerms || '',
      currency: invoice.currency,
      currencySymbol: invoice.currencySymbol,
      items: invoice.items,
      notes: invoice.notes || '',
      terms: invoice.terms || '',
      relatedSale: invoice.relatedSale?._id || '',
      relatedLead: invoice.relatedLead?._id || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        console.log('Deleting invoice:', invoiceId);
        const response = await invoiceAPI.delete(invoiceId);
        console.log('Delete response:', response);
        
        if (response.data.success) {
          toast.success('Invoice deleted successfully');
          // Immediately remove from local state for better UX
          setInvoices(prevInvoices => prevInvoices.filter(invoice => invoice._id !== invoiceId));
          // Also refresh from server to ensure consistency
          fetchInvoices();
        } else {
          toast.error(response.data.message || 'Failed to delete invoice');
        }
      } catch (err) {
        console.error('Error deleting invoice:', err);
        toast.error(err.response?.data?.message || 'Failed to delete invoice');
      }
    }
  };

  const handleDownloadPDF = async (invoiceId) => {
    try {
      const response = await invoiceAPI.downloadPDF(invoiceId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully');
    } catch (err) {
      console.error('Error downloading PDF:', err);
      toast.error('Failed to download PDF');
    }
  };

  const handleViewPDF = async (invoiceId) => {
    try {
      const response = await invoiceAPI.generatePDF(invoiceId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error viewing PDF:', err);
      toast.error('Failed to view PDF');
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      const response = await invoiceAPI.recordPayment(selectedInvoice._id, paymentData);
      if (response.data.success) {
        toast.success('Payment recorded successfully');
        setShowPaymentModal(false);
        setSelectedInvoice(null);
        setPaymentData({
          amount: '',
          method: 'Bank Transfer',
          reference: '',
          notes: ''
        });
        fetchInvoices();
      }
    } catch (err) {
      console.error('Error recording payment:', err);
      toast.error('Failed to record payment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-gray-500';
      case 'Sent': return 'bg-blue-500';
      case 'Paid': return 'bg-green-500';
      case 'Overdue': return 'bg-red-500';
      case 'Partially Paid': return 'bg-yellow-500';
      case 'Cancelled': return 'bg-gray-700';
      default: return 'bg-gray-500';
    }
  };

  if (loading && invoices.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="large" text="Loading invoices..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`p-6 ${professionalClasses.container}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${professionalClasses.textPrimary}`}>
              Invoice Management
            </h1>
            <p className={`text-sm ${professionalClasses.textSecondary} mt-1`}>
              Create, manage, and track professional invoices
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className={`mt-4 sm:mt-0 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${transitions.smooth}`}
          >
            <FaPlus /> Create Invoice
          </button>
        </div>

        {/* Filters */}
        <div className={`mb-6 ${professionalClasses.card} ${shadows.medium}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className={`text-lg font-semibold ${professionalClasses.textPrimary}`}>
              Filters
            </h2>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${professionalClasses.buttonSecondary}`}
              >
                <FaFilter /> Filters
              </button>
              <button
                onClick={clearFilters}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${professionalClasses.buttonSecondary}`}
              >
                <FaTimes /> Clear
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div>
                <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                >
                  <option value="">All Status</option>
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                  Client Email
                </label>
                <input
                  type="email"
                  name="clientEmail"
                  value={filters.clientEmail}
                  onChange={handleFilterChange}
                  placeholder="Search by email"
                  className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                  Invoice Number
                </label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={filters.invoiceNumber}
                  onChange={handleFilterChange}
                  placeholder="Search by number"
                  className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Invoices List */}
        <div className={`${professionalClasses.card} ${shadows.medium}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${professionalClasses.border}`}>
                  <th className={`px-4 py-3 text-left ${professionalClasses.textSecondary} font-medium`}>
                    Invoice #
                  </th>
                  <th className={`px-4 py-3 text-left ${professionalClasses.textSecondary} font-medium`}>
                    Client
                  </th>
                  <th className={`px-4 py-3 text-left ${professionalClasses.textSecondary} font-medium`}>
                    Date
                  </th>
                  <th className={`px-4 py-3 text-left ${professionalClasses.textSecondary} font-medium`}>
                    Amount
                  </th>
                  <th className={`px-4 py-3 text-left ${professionalClasses.textSecondary} font-medium`}>
                    Status
                  </th>
                  <th className={`px-4 py-3 text-left ${professionalClasses.textSecondary} font-medium`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className={`border-b ${professionalClasses.border} hover:bg-gray-50`}>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${professionalClasses.textPrimary}`}>
                        {invoice.invoiceNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className={`font-medium ${professionalClasses.textPrimary}`}>
                          {invoice.clientInfo.name}
                        </div>
                        <div className={`text-sm ${professionalClasses.textSecondary}`}>
                          {invoice.clientInfo.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`text-sm ${professionalClasses.textSecondary}`}>
                        {new Date(invoice.invoiceDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`font-medium ${professionalClasses.textPrimary}`}>
                        {invoice.currencySymbol}{invoice.totalAmount.toFixed(2)}
                      </div>
                      {invoice.balanceDue > 0 && (
                        <div className={`text-sm ${professionalClasses.textSecondary}`}>
                          Due: {invoice.currencySymbol}{invoice.balanceDue.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewPDF(invoice._id)}
                          className={`p-2 rounded-lg ${professionalClasses.buttonSecondary}`}
                          title="View PDF"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(invoice._id)}
                          className={`p-2 rounded-lg ${professionalClasses.buttonSecondary}`}
                          title="Download PDF"
                        >
                          <FaDownload />
                        </button>
                        <button
                          onClick={() => handleEdit(invoice)}
                          className={`p-2 rounded-lg ${professionalClasses.buttonSecondary}`}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        {invoice.balanceDue > 0 && (
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowPaymentModal(true);
                            }}
                            className={`p-2 rounded-lg ${professionalClasses.buttonSecondary}`}
                            title="Record Payment"
                          >
                            <FaMoneyBillWave />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(invoice._id)}
                          className={`p-2 rounded-lg text-red-600 hover:bg-red-50`}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {invoices.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className={`text-lg ${professionalClasses.textSecondary}`}>
                No invoices found
              </p>
            </div>
          )}
        </div>

        {/* Invoice Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${professionalClasses.card}`}>
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className={`text-xl font-semibold ${professionalClasses.textPrimary}`}>
                  {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingInvoice(null);
                    resetForm();
                  }}
                  className={`p-2 rounded-lg ${professionalClasses.buttonSecondary}`}
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Company Information */}
                <div>
                  <h3 className={`text-lg font-semibold ${professionalClasses.textPrimary} mb-4`}>
                    Company Information
                  </h3>
                  
                  {/* Company Logo Display */}
                  <div className="mb-4">
                    <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-2`}>
                      Company Logo
                    </label>
                    <div className="flex items-center space-x-4">
                      <img 
                        src={formData.companyInfo.logo} 
                        alt="Company Logo" 
                        className="w-16 h-16 object-contain border rounded-lg bg-white p-2"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                handleFormChange('companyInfo', 'logo', e.target.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                        />
                        <div className="text-sm text-gray-500 mt-1">
                          Upload a new logo or keep the default Traincape Technology logo
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={formData.companyInfo.name}
                        onChange={(e) => handleFormChange('companyInfo', 'name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                        GSTIN
                      </label>
                      <input
                        type="text"
                        value={formData.companyInfo.gstin}
                        onChange={(e) => handleFormChange('companyInfo', 'gstin', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                        PAN
                      </label>
                      <input
                        type="text"
                        value={formData.companyInfo.pan}
                        onChange={(e) => handleFormChange('companyInfo', 'pan', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                        placeholder="Company PAN number"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.companyInfo.email}
                        onChange={(e) => handleFormChange('companyInfo', 'email', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                        Phone
                      </label>
                      <input
                        type="text"
                        value={formData.companyInfo.phone}
                        onChange={(e) => handleFormChange('companyInfo', 'phone', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Client Information */}
                <div>
                  <h3 className={`text-lg font-semibold ${professionalClasses.textPrimary} mb-4`}>
                    Client Address Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                        Client Name *
                      </label>
                      <input
                        type="text"
                        value={formData.clientInfo.name}
                        onChange={(e) => handleFormChange('clientInfo', 'name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                        Client Company (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.clientInfo.company}
                        onChange={(e) => handleFormChange('clientInfo', 'company', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                        placeholder="Client's company name"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                        Client Email *
                      </label>
                      <input
                        type="email"
                        value={formData.clientInfo.email}
                        onChange={(e) => handleFormChange('clientInfo', 'email', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                        Client Phone
                      </label>
                      <input
                        type="text"
                        value={formData.clientInfo.phone}
                        onChange={(e) => handleFormChange('clientInfo', 'phone', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                        placeholder="Client's phone number"
                      />
                    </div>
                  </div>

                  {/* Client Address Section */}
                  <div className="mt-6">
                    <h4 className={`text-md font-semibold ${professionalClasses.textPrimary} mb-3`}>
                      Billing Address
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={formData.clientInfo.address.street}
                          onChange={(e) => handleAddressChange('clientInfo', 'street', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                          placeholder="Client's street address"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.clientInfo.address.city}
                          onChange={(e) => handleAddressChange('clientInfo', 'city', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                          placeholder="Client's city"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                          State/Province
                        </label>
                        <input
                          type="text"
                          value={formData.clientInfo.address.state}
                          onChange={(e) => handleAddressChange('clientInfo', 'state', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                          placeholder="Client's state or province"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                          ZIP/Postal Code
                        </label>
                        <input
                          type="text"
                          value={formData.clientInfo.address.zipCode}
                          onChange={(e) => handleAddressChange('clientInfo', 'zipCode', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                          placeholder="Client's ZIP or postal code"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                          Country
                        </label>
                        <input
                          type="text"
                          value={formData.clientInfo.address.country}
                          onChange={(e) => handleAddressChange('clientInfo', 'country', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                          placeholder="Client's country"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice Details */}
                <div>
                  <h3 className={`text-lg font-semibold ${professionalClasses.textPrimary} mb-4`}>
                    Invoice Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                        Payment Terms
                      </label>
                      <select
                        value={formData.paymentTerms}
                        onChange={(e) => handleFormChange(null, 'paymentTerms', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                      >
                        <option value="Due on Receipt">Due on Receipt</option>
                        <option value="Net 7">Net 7</option>
                        <option value="Net 15">Net 15</option>
                        <option value="Net 30">Net 30</option>
                        <option value="Net 45">Net 45</option>
                        <option value="Net 60">Net 60</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                        Currency
                      </label>
                      <select
                        value={formData.currency}
                        onChange={(e) => handleFormChange(null, 'currency', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                      >
                        {Object.entries(currencyConfig).map(([code, config]) => (
                          <option key={code} value={code}>
                            {code} ({config.symbol}) - {config.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-semibold ${professionalClasses.textPrimary}`}>
                      Line Items
                    </h3>
                    <button
                      type="button"
                      onClick={addItem}
                      className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors`}
                    >
                      <FaPlus className="inline mr-2" />
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.items.map((item, index) => (
                      <div key={index} className={`p-4 border rounded-lg ${professionalClasses.border}`}>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                          <div className="md:col-span-2">
                            <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                              Description *
                            </label>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                              required
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                              Qty
                            </label>
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={item.quantity || 0}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                              required
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                              Unit Price
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice || 0}
                              onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                              required
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                              Tax %
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.taxRate || 0}
                              onChange={(e) => handleItemChange(index, 'taxRate', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                                Discount
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={item.discount || 0}
                                onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                              />
                            </div>
                            {formData.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className={`p-2 text-red-600 hover:bg-red-50 rounded-lg`}
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 text-right">
                          <span className={`text-sm ${professionalClasses.textSecondary}`}>
                            Total: {formData.currencySymbol}{calculateItemTotal(item).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className={`p-4 bg-gray-50 rounded-lg`}>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${professionalClasses.textPrimary}`}>
                      Total: {formData.currencySymbol}{calculateInvoiceTotal().toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Notes and Terms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleFormChange(null, 'notes', e.target.value)}
                      rows="3"
                      className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                      Terms & Conditions
                    </label>
                    <textarea
                      value={formData.terms}
                      onChange={(e) => handleFormChange(null, 'terms', e.target.value)}
                      rows="3"
                      className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingInvoice(null);
                      resetForm();
                    }}
                    className={`px-6 py-2 rounded-lg ${professionalClasses.buttonSecondary}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50`}
                  >
                    {loading ? 'Saving...' : (editingInvoice ? 'Update Invoice' : 'Create Invoice')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white rounded-lg shadow-xl max-w-md w-full ${professionalClasses.card}`}>
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className={`text-xl font-semibold ${professionalClasses.textPrimary}`}>
                  Record Payment
                </h2>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedInvoice(null);
                    setPaymentData({
                      amount: '',
                      method: 'Bank Transfer',
                      reference: '',
                      notes: ''
                    });
                  }}
                  className={`p-2 rounded-lg ${professionalClasses.buttonSecondary}`}
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={selectedInvoice.invoiceNumber}
                    className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input} bg-gray-50`}
                    disabled
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                    Balance Due
                  </label>
                  <input
                    type="text"
                    value={`${selectedInvoice.currencySymbol}${selectedInvoice.balanceDue.toFixed(2)}`}
                    className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input} bg-gray-50`}
                    disabled
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                    Payment Amount *
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    max={selectedInvoice.balanceDue}
                    step="0.01"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                    className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                    Payment Method *
                  </label>
                  <select
                    value={paymentData.method}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, method: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={paymentData.reference}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, reference: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                    placeholder="Transaction ID, Cheque number, etc."
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${professionalClasses.textSecondary} mb-1`}>
                    Notes
                  </label>
                  <textarea
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                    rows="3"
                    className={`w-full px-3 py-2 border rounded-lg ${professionalClasses.input}`}
                    placeholder="Additional payment notes..."
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedInvoice(null);
                      setPaymentData({
                        amount: '',
                        method: 'Bank Transfer',
                        reference: '',
                        notes: ''
                      });
                    }}
                    className={`px-6 py-2 rounded-lg ${professionalClasses.buttonSecondary}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors`}
                  >
                    Record Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InvoiceManagementPage;