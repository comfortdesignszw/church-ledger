import React from 'react';
import { CategoryDistribution as CategoryDistributionType } from '../../types';

interface CategoryDistributionProps {
  data: CategoryDistributionType[];
  onViewReport: () => void;
}

const CategoryDistribution: React.FC<CategoryDistributionProps> = ({ data, onViewReport }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Category Distribution</h3>
      
      {data.length === 0 ? (
        <div className="py-8 text-center text-gray-400">
          <p>No income data available.</p>
          <p className="text-sm mt-1">Add transactions to see distribution.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((category, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">{category.name}</span>
                <span className="text-sm font-medium text-blue-600">{category.percentage}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${category.percentage}%`,
                    backgroundColor: category.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onViewReport}
        className="w-full mt-6 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        View Full Report
      </button>
    </div>
  );
};

export default CategoryDistribution;
