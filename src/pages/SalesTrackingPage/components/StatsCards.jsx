import React from 'react';
import { FaChartLine, FaMoneyBillWave, FaChartBar, FaUsers } from 'react-icons/fa';

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Sales',
      value: stats.totalSales,
      icon: FaChartLine,
      color: 'blue',
      increase: '12%'
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      icon: FaMoneyBillWave,
      color: 'purple',
      increase: '8%'
    },
    {
      title: 'Avg. Order Value',
      value: `$${stats.averageOrderValue.toLocaleString()}`,
      icon: FaChartBar,
      color: 'green',
      increase: '5%'
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate.toFixed(1)}%`,
      icon: FaUsers,
      color: 'yellow',
      increase: '3%'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="stats-card sales-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {card.value}
              </h3>
            </div>
            <div className={`w-12 h-12 rounded-full bg-${card.color}-100 dark:bg-${card.color}-900/30 flex items-center justify-center`}>
              <card.icon className={`text-${card.color}-600 dark:text-${card.color}-400 text-xl`} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-green-600 dark:text-green-400 flex items-center">
              <span className="text-xs">↑</span> {card.increase} increase
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
