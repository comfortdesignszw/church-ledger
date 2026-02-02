import React, { useState } from 'react';
import { Category, ChurchEvent } from '../../types';
import { CheckCircleIcon } from '../icons/Icons';

interface TransactionFormProps {
  categories: Category[];
  events: ChurchEvent[];
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export interface TransactionFormData {
  type: 'income' | 'expense';
  amount: number;
  category_id: string;
  payment_method: string;
  transaction_date: string;
  description: string;
  event_id: string | null;
}

const paymentMethods = [
  'Cash',
  'Check',
  'Online Transfer',
  'Mobile Money',
  'Bank Deposit',
  'Credit Card',
  'Debit Card'
];

const TransactionForm: React.FC<TransactionFormProps> = ({
  categories,
  events,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<TransactionFormData>({
    type: 'income',
    amount: 0,
    category_id: '',
    payment_method: 'Cash',
    transaction_date: new Date().toISOString().split('T')[0],
    description: '',
    event_id: null
  });

  const [saveAnother, setSaveAnother] = useState(false);

  const filteredCategories = categories.filter(c => c.type === formData.type);
  const activeEvents = events.filter(e => e.status === 'active' || e.status === 'upcoming');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    
    if (saveAnother) {
      setFormData(prev => ({
        ...prev,
        amount: 0,
        category_id: '',
        description: '',
        event_id: null
      }));
    }
  };

  const handleSaveAndAddAnother = async () => {
    setSaveAnother(true);
    const form = document.getElementById('transaction-form') as HTMLFormElement;
    form?.requestSubmit();
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-2 text-sm text-gray-500">
        Accounting <span className="mx-2">/</span> <span className="text-gray-900">New Transaction Entry</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Record New Transaction</h1>
        <p className="text-gray-500 mt-1">Submit financial entries with precision and transparency.</p>
      </div>

      <form id="transaction-form" onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Entry Type Toggle */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Entry Type</label>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'income', category_id: '' }))}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                formData.type === 'income'
                  ? 'bg-blue-50 text-blue-600 border-r border-gray-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              </svg>
              Income
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category_id: '' }))}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                formData.type === 'expense'
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
              </svg>
              Expense
            </button>
          </div>
        </div>

        {/* Date and Amount Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Date</label>
            <input
              type="date"
              value={formData.transaction_date}
              onChange={(e) => setFormData(prev => ({ ...prev, transaction_date: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Category and Payment Method Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              required
            >
              <option value="">Select Category</option>
              {filteredCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              required
            >
              {paymentMethods.map(method => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Link to Event */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Link to Church Event (Optional)
          </label>
          <select
            value={formData.event_id || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, event_id: e.target.value || null }))}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
          >
            <option value="">General (No specific event)</option>
            {activeEvents.map(event => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description / Remarks
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Add any specific details about this transaction..."
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAndAddAnother}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            Save & Add Another
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <CheckCircleIcon size={18} />
            {isSubmitting ? 'Posting...' : 'Post Transaction'}
          </button>
        </div>
      </form>

      {/* Audit Tip */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-blue-600 text-xs font-bold">i</span>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800">Audit Tip</p>
            <p className="text-sm text-blue-600 mt-0.5">
              Ensure you upload a receipt image after saving for transactions over $500 to maintain high transparency rankings for your diocese.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;
