import React, { useMemo } from 'react';
import { FaDownload, FaTrash, FaEdit, FaSpinner } from 'react-icons/fa';

const PayrollSummaryTable = ({ 
  payrollRecords, 
  onDownloadSlip, 
  downloadingSlip,
  onDelete,
  onEdit,
  deletingPayroll,
  editingPayroll,
  userRole = 'Employee' // Default to Employee if not provided
}) => {
  // Calculate totals for all numeric columns
  const totals = useMemo(() => {
    return payrollRecords.reduce((acc, record) => {
      acc.baseSalary += parseFloat(record.baseSalary) || 0;
      acc.calculatedSalary += parseFloat(record.calculatedSalary) || 0;
      acc.hra += parseFloat(record.hra) || 0;
      acc.da += parseFloat(record.da) || 0;
      acc.conveyanceAllowance += parseFloat(record.conveyanceAllowance) || 0;
      acc.medicalAllowance += parseFloat(record.medicalAllowance) || 0;
      acc.specialAllowance += parseFloat(record.specialAllowance) || 0;
      acc.overtimeAmount += parseFloat(record.overtimeAmount) || 0;
      acc.performanceBonus += parseFloat(record.performanceBonus) || 0;
      acc.projectBonus += parseFloat(record.projectBonus) || 0;
      acc.attendanceBonus += parseFloat(record.attendanceBonus) || 0;
      acc.festivalBonus += parseFloat(record.festivalBonus) || 0;
      acc.pf += parseFloat(record.pf) || 0;
      acc.esi += parseFloat(record.esi) || 0;
      acc.tax += parseFloat(record.tax) || 0;
      acc.loan += parseFloat(record.loan) || 0;
      acc.other += parseFloat(record.other) || 0;
      acc.netSalary += parseFloat(record.netSalary) || 0;
      return acc;
    }, {
      baseSalary: 0,
      calculatedSalary: 0,
      hra: 0,
      da: 0,
      conveyanceAllowance: 0,
      medicalAllowance: 0,
      specialAllowance: 0,
      overtimeAmount: 0,
      performanceBonus: 0,
      projectBonus: 0,
      attendanceBonus: 0,
      festivalBonus: 0,
      pf: 0,
      esi: 0,
      tax: 0,
      loan: 0,
      other: 0,
      netSalary: 0
    });
  }, [payrollRecords]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-600 bg-green-100';
      case 'PAID':
        return 'text-blue-600 bg-blue-100';
      case 'CANCELLED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Base Salary</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Days Present</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Allowances</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bonuses</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Deductions</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Net Salary</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
          {payrollRecords.map((record) => {
            const totalAllowances = (
              parseFloat(record.hra) +
              parseFloat(record.da) +
              parseFloat(record.conveyanceAllowance) +
              parseFloat(record.medicalAllowance) +
              parseFloat(record.specialAllowance) +
              parseFloat(record.overtimeAmount)
            ) || 0;

            const totalBonuses = (
              parseFloat(record.performanceBonus) +
              parseFloat(record.projectBonus) +
              parseFloat(record.attendanceBonus) +
              parseFloat(record.festivalBonus)
            ) || 0;

            const totalDeductions = (
              parseFloat(record.pf) +
              parseFloat(record.esi) +
              parseFloat(record.tax) +
              parseFloat(record.loan) +
              parseFloat(record.other)
            ) || 0;

            // Get employee name from either employeeId object or userId object
            const employeeName = record.employeeId?.fullName || record.userId?.fullName || 'Unknown';
            const employeeId = record.employeeId?._id || record.userId?._id || 'N/A';

            return (
              <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{employeeName}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{employeeId}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(record.baseSalary)}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {record.daysPresent}/{record.workingDays}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(totalAllowances)}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(totalBonuses)}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(totalDeductions)}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(record.netSalary)}
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex justify-center space-x-2">
                    {/* Download Button */}
                    <button
                      onClick={() => onDownloadSlip(record._id)}
                      disabled={downloadingSlip === record._id}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Download Salary Slip"
                    >
                      {downloadingSlip === record._id ? (
                        <FaSpinner className="animate-spin h-4 w-4" />
                      ) : (
                        <FaDownload className="h-4 w-4" />
                      )}
                    </button>

                    {/* Edit Button - Only show for Admin/HR */}
                    {(userRole === 'Admin' || userRole === 'HR') && (
                      <button
                        onClick={() => onEdit(record)}
                        disabled={editingPayroll === record._id}
                        className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                        title="Edit Payroll"
                      >
                        {editingPayroll === record._id ? (
                          <FaSpinner className="animate-spin h-4 w-4" />
                        ) : (
                          <FaEdit className="h-4 w-4" />
                        )}
                      </button>
                    )}

                    {/* Delete Button - Only show for Admin/HR */}
                    {(userRole === 'Admin' || userRole === 'HR') && (
                      <button
                        onClick={() => onDelete(record)}
                        disabled={deletingPayroll === record._id}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete Payroll"
                      >
                        {deletingPayroll === record._id ? (
                          <FaSpinner className="animate-spin h-4 w-4" />
                        ) : (
                          <FaTrash className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
          
          {/* Totals row */}
          <tr className="bg-gray-50 dark:bg-gray-700 font-semibold">
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white" colSpan={2}>Total</td>
            <td className="px-4 py-3 text-right whitespace-nowrap text-sm text-gray-900 dark:text-white">
              {formatCurrency(totals.baseSalary)}
            </td>
            <td className="px-4 py-3 text-right whitespace-nowrap text-sm text-gray-900 dark:text-white">-</td>
            <td className="px-4 py-3 text-right whitespace-nowrap text-sm text-gray-900 dark:text-white">
              {formatCurrency(totals.hra + totals.da + totals.conveyanceAllowance + totals.medicalAllowance + totals.specialAllowance + totals.overtimeAmount)}
            </td>
            <td className="px-4 py-3 text-right whitespace-nowrap text-sm text-gray-900 dark:text-white">
              {formatCurrency(totals.performanceBonus + totals.projectBonus + totals.attendanceBonus + totals.festivalBonus)}
            </td>
            <td className="px-4 py-3 text-right whitespace-nowrap text-sm text-gray-900 dark:text-white">
              {formatCurrency(totals.pf + totals.esi + totals.tax + totals.loan + totals.other)}
            </td>
            <td className="px-4 py-3 text-right whitespace-nowrap text-sm text-gray-900 dark:text-white font-bold">
              {formatCurrency(totals.netSalary)}
            </td>
            <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-500">-</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PayrollSummaryTable; 