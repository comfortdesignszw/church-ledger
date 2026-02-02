import React from 'react';
import { TrendUpIcon, TrendDownIcon } from '../icons/Icons';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  badge?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  variant = 'default',
  badge
}) => {
  const variantStyles = {
    default: 'bg-white border border-gray-200',
    primary: 'bg-blue-600 text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-500 text-white',
    danger: 'bg-red-600 text-white'
  };

  const isPositive = change !== undefined && change >= 0;
  const isWhiteText = variant !== 'default';

  return (
    <div className={`rounded-xl p-5 ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-medium uppercase tracking-wider ${isWhiteText ? 'text-white/80' : 'text-gray-500'}`}>
          {title}
        </span>
        {icon && (
          <div className={`${isWhiteText ? 'text-white/60' : 'text-gray-400'}`}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl lg:text-3xl font-bold ${isWhiteText ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </span>
            {badge && (
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                isWhiteText ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
              }`}>
                {badge}
              </span>
            )}
          </div>
          
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-1 text-sm ${
              isWhiteText 
                ? 'text-white/80' 
                : isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? <TrendUpIcon size={14} /> : <TrendDownIcon size={14} />}
              <span>{isPositive ? '+' : ''}{change.toFixed(1)}%</span>
              {changeLabel && (
                <span className={isWhiteText ? 'text-white/60' : 'text-gray-500'}>
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
