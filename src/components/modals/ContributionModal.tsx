import React, { useState } from 'react';
import { CloseIcon } from '../icons/Icons';
import { ChurchEvent, Member } from '../../types';

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContributionFormData) => Promise<void>;
  isSubmitting: boolean;
  events: ChurchEvent[];
  members: Member[];
  selectedEventId?: string;
}

export interface ContributionFormData {
  member_id: string;
  member_name: string;
  event_id: string;
  amount: number;
  contribution_date: string;
  payment_method: string;
}

const paymentMethods = ['Cash', 'Check', 'Online Transfer', 'Mobile Money', 'Bank Deposit'];

const ContributionModal: React.FC<ContributionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  events,
  members,
  selectedEventId
}) => {
  const [formData, setFormData] = useState<ContributionFormData>({
    member_id: '',
    member_name: '',
    event_id: selectedEventId || '',
    amount: 0,
    contribution_date: new Date().toISOString().split('T')[0],
    payment_method: 'Cash'
  });
  const [isNewMember, setIsNewMember] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({
      member_id: '',
      member_name: '',
      event_id: selectedEventId || '',
      amount: 0,
      contribution_date: new Date().toISOString().split('T')[0],
      payment_method: 'Cash'
    });
    setIsNewMember(false);
  };

  const activeEvents = events.filter(e => e.status === 'active' || e.status === 'upcoming');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Record Contribution</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <CloseIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Member Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Member</label>
              <button
                type="button"
                onClick={() => setIsNewMember(!isNewMember)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {isNewMember ? 'Select Existing' : 'Add New Member'}
              </button>
            </div>
            {isNewMember ? (
              <input
                type="text"
                value={formData.member_name}
                onChange={(e) => setFormData(prev => ({ ...prev, member_name: e.target.value, member_id: '' }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter member name"
                required
              />
            ) : (
              <select
                value={formData.member_id}
                onChange={(e) => setFormData(prev => ({ ...prev, member_id: e.target.value, member_name: '' }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                required={!isNewMember}
              >
                <option value="">Select Member</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Event Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event</label>
            <select
              value={formData.event_id}
              onChange={(e) => setFormData(prev => ({ ...prev, event_id: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              required
            >
              <option value="">Select Event</option>
              {activeEvents.map(event => (
                <option key={event.id} value={event.id}>{event.name}</option>
              ))}
            </select>
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-2 gap-4">
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
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={formData.contribution_date}
                onChange={(e) => setFormData(prev => ({ ...prev, contribution_date: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              {paymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Record Contribution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContributionModal;
