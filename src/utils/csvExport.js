/**
 * Utility function to export data to CSV format
 * Compatible with Google Sheets
 */

/**
 * Escapes CSV fields properly
 * @param {string} field - The field value to escape
 * @returns {string} - Escaped field value
 */
const escapeCSVField = (field) => {
  if (field === null || field === undefined) {
    return '';
  }
  
  // Convert to string
  const str = String(field);
  
  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
};

/**
 * Converts sales data to CSV format
 * @param {Array} sales - Array of sale objects
 * @returns {string} - CSV formatted string
 */
export const convertSalesToCSV = (sales) => {
  if (!sales || sales.length === 0) {
    return '';
  }

  // Define CSV headers
  const headers = [
    'Date',
    'Customer Name',
    'Email',
    'Contact Number',
    'Product/Course',
    'Country',
    'Status',
    'Total Cost',
    'Token Amount',
    'Pending',
    'Currency',
    'Login ID',
    'Sales Person',
    'Lead Person',
    'Lead By',
    'Reference Sale',
    'Created At',
    'Updated At'
  ];

  // Create CSV rows
  const rows = sales.map((sale) => {
    // Helper function to safely extract nested values
    const safeGet = (obj, path, defaultValue = '') => {
      try {
        return path.split('.').reduce((current, prop) => current?.[prop], obj) || defaultValue;
      } catch {
        return defaultValue;
      }
    };

    // Extract sales person name
    let salesPersonName = '';
    if (sale.salesPerson) {
      if (typeof sale.salesPerson === 'object') {
        salesPersonName = sale.salesPerson.fullName || sale.salesPerson.name || '';
      } else {
        salesPersonName = sale.salesPerson || '';
      }
    }

    // Extract lead person name
    let leadPersonName = '';
    if (sale.leadPerson) {
      if (typeof sale.leadPerson === 'object') {
        leadPersonName = sale.leadPerson.fullName || sale.leadPerson.name || '';
      } else {
        leadPersonName = sale.leadPerson || '';
      }
    }

    // Format date
    const formatDate = (date) => {
      if (!date) return '';
      try {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      } catch {
        return '';
      }
    };

    // Get customer name
    const customerName = sale.customerName || 
                        safeGet(sale, 'leadId.name', '') || 
                        safeGet(sale, 'leadId.fullName', '');

    // Get product/course
    const product = sale.product || 
                    sale.course || 
                    safeGet(sale, 'leadId.course', '') ||
                    safeGet(sale, 'leadId.product', '');

    // Get contact number
    const contactNumber = sale.contactNumber || 
                         safeGet(sale, 'leadId.phone', '');

    return [
      formatDate(sale.date || sale.createdAt || sale.saleDate),
      customerName,
      sale.email || safeGet(sale, 'leadId.email', ''),
      contactNumber,
      product,
      sale.country || safeGet(sale, 'leadId.country', ''),
      sale.status || '',
      sale.totalCost || sale.amount || 0,
      sale.tokenAmount || 0,
      sale.pending || 0,
      sale.currency || sale.totalCostCurrency || 'USD',
      sale.loginId || '',
      salesPersonName,
      leadPersonName,
      sale.leadBy || '',
      sale.isReference ? 'Yes' : 'No',
      formatDate(sale.createdAt),
      formatDate(sale.updatedAt)
    ].map(escapeCSVField);
  });

  // Combine headers and rows
  const csvRows = [
    headers.map(escapeCSVField).join(','),
    ...rows.map(row => row.join(','))
  ];

  return csvRows.join('\n');
};

/**
 * Downloads CSV file with UTF-8 BOM for Google Sheets compatibility
 * @param {string} csvContent - CSV formatted string
 * @param {string} filename - Filename for the download
 */
export const downloadCSV = (csvContent, filename = 'sales-export.csv') => {
  // Add UTF-8 BOM for Excel/Google Sheets compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up URL
  URL.revokeObjectURL(url);
};

/**
 * Exports sales data to CSV and downloads it
 * @param {Array} sales - Array of sale objects
 * @param {string} filename - Optional custom filename
 */
export const exportSalesToCSV = (sales, filename) => {
  if (!sales || sales.length === 0) {
    throw new Error('No sales data to export');
  }

  const csvContent = convertSalesToCSV(sales);
  const exportFilename = filename || `sales-export-${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(csvContent, exportFilename);
};

