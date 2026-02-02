import React from 'react';
import { MonthlyData } from '../../types';

interface IncomeExpenseChartProps {
  data: MonthlyData[];
  period: string;
  onPeriodChange: (period: string) => void;
}

const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ data, period, onPeriodChange }) => {
  // Calculate max value for scaling
  const maxValue = Math.max(
    ...data.map(d => Math.max(d.income, d.expenses)),
    1
  );

  // Generate SVG path for the line chart
  const generatePath = (values: number[], color: string) => {
    if (values.length === 0) return null;
    
    const width = 100;
    const height = 60;
    const padding = 5;
    
    const points = values.map((value, index) => {
      const x = padding + (index / (values.length - 1 || 1)) * (width - padding * 2);
      const y = height - padding - (value / maxValue) * (height - padding * 2);
      return `${x},${y}`;
    });

    return (
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.join(' ')}
      />
    );
  };

  const incomeValues = data.map(d => d.income);
  const expenseValues = data.map(d => d.expenses);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Income vs Expenses Trend</h3>
          <p className="text-sm text-gray-500">Comparison over the selected period</p>
        </div>
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="3">Last 3 Months</option>
          <option value="6">Last 6 Months</option>
          <option value="12">Last 12 Months</option>
        </select>
      </div>

      {/* Chart Area */}
      <div className="relative h-48 mt-4">
        {data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <p>No data available. Add transactions to see trends.</p>
          </div>
        ) : (
          <svg viewBox="0 0 100 60" className="w-full h-full" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="5" y1="15" x2="95" y2="15" stroke="#E5E7EB" strokeWidth="0.5" />
            <line x1="5" y1="30" x2="95" y2="30" stroke="#E5E7EB" strokeWidth="0.5" />
            <line x1="5" y1="45" x2="95" y2="45" stroke="#E5E7EB" strokeWidth="0.5" />
            
            {/* Income line (blue) */}
            {generatePath(incomeValues, '#3B82F6')}
            
            {/* Expenses line (red) */}
            {generatePath(expenseValues, '#EF4444')}
          </svg>
        )}
      </div>

      {/* X-axis labels */}
      {data.length > 0 && (
        <div className="flex justify-between mt-2 px-2">
          {data.map((d, i) => (
            <span key={i} className="text-xs text-gray-400">{d.month}</span>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-sm text-gray-600">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-sm text-gray-600">Expenses</span>
        </div>
      </div>
    </div>
  );
};

export default IncomeExpenseChart;
