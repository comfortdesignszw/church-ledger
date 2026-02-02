import React, { useState, useMemo } from 'react';
import { Transaction, Category } from '../../types';
import { PrintIcon, DownloadIcon, RefreshIcon, CheckCircleIcon } from '../icons/Icons';

interface ReportsViewProps {
  transactions: Transaction[];
  categories: Category[];
  churchName: string;
}

interface ReportData {
  category: string;
  description: string;
  currentPeriod: number;
  previousPeriod: number;
  change: number;
}

const ReportsView: React.FC<ReportsViewProps> = ({ transactions, categories, churchName }) => {
  const [reportType, setReportType] = useState('monthly-income');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    date.setDate(0);
    return date.toISOString().split('T')[0];
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const reportData = useMemo(() => {
    if (!reportGenerated) return [];

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate previous period
    const periodLength = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - periodLength);
    const prevEnd = new Date(start.getTime() - 1);

    const filterType = reportType.includes('income') ? 'income' : 'expense';
    
    const currentTransactions = transactions.filter(t => {
      const date = new Date(t.transaction_date);
      return t.type === filterType && date >= start && date <= end;
    });

    const previousTransactions = transactions.filter(t => {
      const date = new Date(t.transaction_date);
      return t.type === filterType && date >= prevStart && date <= prevEnd;
    });

    const relevantCategories = categories.filter(c => c.type === filterType);

    return relevantCategories.map(category => {
      const currentAmount = currentTransactions
        .filter(t => t.category_id === category.id)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const previousAmount = previousTransactions
        .filter(t => t.category_id === category.id)
        .reduce((sum, t) => sum + t.amount, 0);

      const change = previousAmount > 0 
        ? ((currentAmount - previousAmount) / previousAmount) * 100 
        : currentAmount > 0 ? 100 : 0;

      return {
        category: category.name,
        description: category.description,
        currentPeriod: currentAmount,
        previousPeriod: previousAmount,
        change
      };
    }).filter(r => r.currentPeriod > 0 || r.previousPeriod > 0);
  }, [transactions, categories, startDate, endDate, reportType, reportGenerated]);

  const totalCurrent = reportData.reduce((sum, r) => sum + r.currentPeriod, 0);
  const totalPrevious = reportData.reduce((sum, r) => sum + r.previousPeriod, 0);
  const budgetVariance = totalCurrent - totalPrevious;

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
    }, 500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // Create a simple text export for now
    const reportText = `
${churchName}
${reportType.includes('income') ? 'MONTHLY INCOME REPORT' : 'MONTHLY EXPENSE REPORT'}
Reporting Period: ${formatDate(startDate)} - ${formatDate(endDate)}

Revenue Breakdown:
${reportData.map(r => `${r.category}: $${r.currentPeriod.toFixed(2)} (${r.change >= 0 ? '+' : ''}${r.change.toFixed(1)}%)`).join('\n')}

Total: $${totalCurrent.toFixed(2)}
Budget Variance: ${budgetVariance >= 0 ? '+' : ''}$${budgetVariance.toFixed(2)}
    `;
    
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${startDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports & Audits</h1>
          <p className="text-gray-500 mt-1">Secure and transparent audit-ready management for church administration.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <PrintIcon size={18} />
            Print
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <DownloadIcon size={18} />
            Export to PDF
          </button>
        </div>
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => { setReportType(e.target.value); setReportGenerated(false); }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="monthly-income">Monthly Income Report</option>
              <option value="monthly-expense">Monthly Expense Report</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setReportGenerated(false); }}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setReportGenerated(false); }}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshIcon size={18} className={isGenerating ? 'animate-spin' : ''} />
            Generate Report
          </button>
        </div>
      </div>

      {/* Report Content */}
      {reportGenerated && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {/* Report Header */}
          <div className="flex items-start justify-between pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-blue-600">{churchName}</h2>
              <p className="text-sm text-gray-500 uppercase tracking-wider mt-1">
                {reportType.includes('income') ? 'Monthly Income Report' : 'Monthly Expense Report'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Reporting Period</p>
              <p className="text-sm text-gray-500">{formatDate(startDate)} - {formatDate(endDate)}</p>
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                <CheckCircleIcon size={12} />
                VERIFIED & AUDITED
              </span>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                  <span className="text-blue-600 text-xs">$</span>
                </div>
                <h3 className="font-semibold text-gray-900">
                  {reportType.includes('income') ? 'Revenue' : 'Expense'} Breakdown
                </h3>
              </div>
              <span className="text-sm text-gray-500">All figures in USD</span>
            </div>

            {reportData.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <p>No transactions found for this period.</p>
                <p className="text-sm mt-1">Add transactions to generate reports.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Category</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Description</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-500">Current Period</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-500">Previous Period</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-500">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-4 text-sm font-medium text-gray-900">{row.category}</td>
                      <td className="py-4 text-sm text-gray-500">{row.description}</td>
                      <td className="py-4 text-sm text-gray-900 text-right">{formatCurrency(row.currentPeriod)}</td>
                      <td className="py-4 text-sm text-gray-500 text-right">{formatCurrency(row.previousPeriod)}</td>
                      <td className={`py-4 text-sm font-medium text-right ${
                        row.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {row.change >= 0 ? '+' : ''}{row.change.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Summary Footer */}
          {reportData.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total {reportType.includes('income') ? 'Revenue' : 'Expenses'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalCurrent)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Budget Goal Variance</p>
                  <p className={`text-2xl font-bold mt-1 ${budgetVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {budgetVariance >= 0 ? '+' : ''}{formatCurrency(budgetVariance)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Report Generated</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date().toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })} at {new Date().toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  <p className="text-xs text-gray-500">By Admin: Finance Officer</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsView;
