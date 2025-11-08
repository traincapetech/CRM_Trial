import React from 'react';
import { format } from 'date-fns';
import { FaSortUp, FaSortDown, FaEllipsisV } from 'react-icons/fa';

const SalesTable = ({ loading, data, sortConfig, handleSort }) => {
  return (
    <div className="sales-card overflow-x-auto">
      <table className="sales-table">
        <thead>
          <tr>
            <th>
              <button
                onClick={() => handleSort('date')}
                className="flex items-center space-x-1"
              >
                <span>Date</span>
                {sortConfig.key === 'date' && (
                  sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                )}
              </button>
            </th>
            <th>Customer</th>
            <th>
              <button
                onClick={() => handleSort('amount')}
                className="flex items-center space-x-1"
              >
                <span>Amount</span>
                {sortConfig.key === 'amount' && (
                  sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                )}
              </button>
            </th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array(5).fill(0).map((_, index) => (
              <tr key={index}>
                <td><div className="skeleton h-4 w-24"></div></td>
                <td><div className="skeleton h-4 w-32"></div></td>
                <td><div className="skeleton h-4 w-20"></div></td>
                <td><div className="skeleton h-4 w-16"></div></td>
                <td><div className="skeleton h-4 w-24"></div></td>
              </tr>
            ))
          ) : (
            data.map((sale) => (
              <tr key={sale.id}>
                <td>{format(new Date(sale.date), 'MMM dd, yyyy')}</td>
                <td>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center mr-3">
                      {sale.customerName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{sale.customerName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{sale.email}</div>
                    </div>
                  </div>
                </td>
                <td>${sale.amount.toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${
                    sale.status === 'completed' ? 'status-active' :
                    sale.status === 'pending' ? 'status-pending' :
                    'status-closed'
                  }`}>
                    {sale.status}
                  </span>
                </td>
                <td>
                  <div className="flex items-center space-x-3">
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <FaEllipsisV />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;
