import React, { useState } from 'react';
import { Transaction, Category, DashboardStats, MonthlyData, CategoryDistribution } from '../../types';
import StatCard from './StatCard';
import IncomeExpenseChart from './IncomeExpenseChart';
import CategoryDistributionChart from './CategoryDistribution';
import RecentTransactions from './RecentTransactions';
import { TrendUpIcon, TrendDownIcon, WalletIcon } from '../icons/Icons';

interface DashboardViewProps {
  stats: DashboardStats;
  monthlyData: MonthlyData[];
  categoryDistribution: CategoryDistribution[];
  transactions: Transaction[];
  categories: Category[];
  onViewReports: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  monthlyData,
  categoryDistribution,
  transactions,
  categories,
  onViewReports
}) => {
  const [chartPeriod, setChartPeriod] = useState('6');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Income"
          value={formatCurrency(stats.totalIncome)}
          change={stats.incomeChange}
          changeLabel={`vs last month (${formatCurrency(stats.lastMonthIncome)})`}
          icon={<TrendUpIcon size={20} />}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(stats.totalExpenses)}
          change={-stats.expenseChange}
          changeLabel={`vs last month (${formatCurrency(stats.lastMonthExpenses)})`}
          icon={<TrendDownIcon size={20} />}
        />
        <StatCard
          title="Net Balance"
          value={formatCurrency(stats.netBalance)}
          badge={stats.netBalance >= 0 ? 'SURPLUS' : 'DEFICIT'}
          icon={<WalletIcon size={20} />}
          variant={stats.netBalance >= 0 ? 'success' : 'danger'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <IncomeExpenseChart
            data={monthlyData}
            period={chartPeriod}
            onPeriodChange={setChartPeriod}
          />
        </div>
        <div>
          <CategoryDistributionChart
            data={categoryDistribution}
            onViewReport={onViewReports}
          />
        </div>
      </div>

      {/* Recent Transactions */}
      <RecentTransactions
        transactions={transactions}
        categories={categories}
        onFilter={() => {}}
        onExport={() => {
          const csvContent = [
            ['Date', 'Type', 'Category', 'Amount', 'Status'].join(','),
            ...transactions.slice(0, 10).map(t => [
              t.transaction_date,
              t.type,
              categories.find(c => c.id === t.category_id)?.name || 'Unknown',
              t.amount,
              t.status
            ].join(','))
          ].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `recent-transactions-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        }}
      />
    </div>
  );
};

export default DashboardView;
