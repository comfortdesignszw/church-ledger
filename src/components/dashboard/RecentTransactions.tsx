import React from 'react';
import { Transaction, Category } from '../../types';
import { FilterIcon, DownloadIcon } from '../icons/Icons';

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  onFilter: () => void;
  onExport: () => void;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  categories,
  onFilter,
  onExport
}) => {
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6B7280';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatAmount = (amount: number, type: string) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
    return type === 'income' ? `+${formatted}` : `-${formatted}`;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      verified: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onFilter}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <FilterIcon size={16} />
              Filter
            </button>
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <DownloadIcon size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          <p>No transactions yet.</p>
          <p className="text-sm mt-1">Click "Add Transaction" to record your first entry.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction Date
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm text-gray-900">
                    {formatDate(transaction.transaction_date)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getCategoryColor(transaction.category_id) }}
                      />
                      <span className="text-sm text-gray-900">
                        {getCategoryName(transaction.category_id)}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {transaction.payment_method}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(transaction.status)}`}>
                      {transaction.status.toUpperCase()}
                    </span>
                  </td>
                  <td className={`px-5 py-4 text-sm font-medium text-right ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatAmount(transaction.amount, transaction.type)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
