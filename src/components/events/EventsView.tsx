import React, { useState } from 'react';
import { ChurchEvent, Contribution, Member } from '../../types';
import { FilterIcon, DownloadIcon, PlusIcon, EditIcon, TransactionsIcon, CheckCircleIcon } from '../icons/Icons';

interface EventsViewProps {
  events: ChurchEvent[];
  contributions: Contribution[];
  members: Member[];
  onAddEvent: () => void;
  onRecordContribution: (eventId: string) => void;
}

const EventsView: React.FC<EventsViewProps> = ({
  events,
  contributions,
  members,
  onAddEvent,
  onRecordContribution
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');

  const activeEvents = events.filter(e => e.status === 'active' || e.status === 'upcoming');
  const totalProgress = activeEvents.length > 0
    ? (activeEvents.reduce((sum, e) => sum + (e.actual_collections / e.collection_goal), 0) / activeEvents.length) * 100
    : 0;
  const pendingContributions = contributions.filter(c => c.status === 'pending' || c.status === 'processing')
    .reduce((sum, c) => sum + c.amount, 0);

  const filteredEvents = events.filter(e => {
    if (filter === 'all') return true;
    return e.status === filter;
  });

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member?.name || 'Unknown Member';
  };

  const getEventName = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    return event?.name || 'Unknown Event';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-500 text-white',
      upcoming: 'bg-blue-500 text-white',
      completed: 'bg-gray-500 text-white',
      cancelled: 'bg-red-500 text-white'
    };
    const labels = {
      active: 'ONGOING',
      upcoming: 'STARTING SOON',
      completed: 'COMPLETED',
      cancelled: 'CANCELLED'
    };
    return {
      style: styles[status as keyof typeof styles] || styles.active,
      label: labels[status as keyof typeof labels] || status.toUpperCase()
    };
  };

  const getContributionStatusBadge = (status: string) => {
    const styles = {
      verified: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700'
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events & Contributions</h1>
          <p className="text-gray-500 mt-1">Track religious feasts and special project funding targets for the congregation.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <FilterIcon size={18} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <DownloadIcon size={18} />
            Export
          </button>
          <button
            onClick={onAddEvent}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Add New Event
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total Active Events</span>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon size={18} className="text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">{activeEvents.length}</p>
          <p className="text-sm text-blue-600 mt-1">
            +{events.filter(e => {
              const created = new Date(e.created_at);
              const monthAgo = new Date();
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return created > monthAgo;
            }).length} this month
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Overall Progress</span>
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 text-sm font-bold">%</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalProgress.toFixed(0)}%</p>
          <p className="text-sm text-green-600 mt-1">Up 5.4%</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Pending Contributions</span>
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 text-sm font-bold">!</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(pendingContributions)}</p>
          <p className="text-sm text-orange-600 mt-1">Action Needed</p>
        </div>
      </div>

      {/* Active Events */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Active & Upcoming Events</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
        </div>

        {filteredEvents.filter(e => e.status === 'active' || e.status === 'upcoming').length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-400">No active events.</p>
            <p className="text-sm text-gray-400 mt-1">Click "Add New Event" to create your first event.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.filter(e => e.status === 'active' || e.status === 'upcoming').map(event => {
              const progress = event.collection_goal > 0 
                ? (event.actual_collections / event.collection_goal) * 100 
                : 0;
              const statusBadge = getStatusBadge(event.status);
              
              return (
                <div key={event.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Event Image */}
                  <div className="relative h-48 bg-gradient-to-br from-orange-400 to-orange-600">
                    {event.image_url ? (
                      <img 
                        src={event.image_url} 
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white/50 text-6xl font-bold">{event.name.charAt(0)}</span>
                      </div>
                    )}
                    <span className={`absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded ${statusBadge.style}`}>
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Event Details */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{event.name}</h3>
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                          <EditIcon size={16} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                          <TransactionsIcon size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{event.description}</p>

                    {/* Targets */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Target Per Member</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          {formatCurrency(event.target_per_member)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Collection Goal</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          {formatCurrency(event.collection_goal)}
                        </p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Actual Collections</span>
                        <span className="text-sm font-medium text-blue-600">
                          {formatCurrency(event.actual_collections)} ({progress.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Record Contribution Button */}
                    <button
                      onClick={() => onRecordContribution(event.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      <PlusIcon size={18} />
                      Record Contribution
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Contributions */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Member Contributions</h2>
        </div>

        {contributions.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p>No contributions recorded yet.</p>
            <p className="text-sm mt-1">Record contributions from active events above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {contributions.slice(0, 10).map(contribution => (
                  <tr key={contribution.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-4 text-sm text-gray-900">{getMemberName(contribution.member_id)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{getEventName(contribution.event_id)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{formatDate(contribution.contribution_date)}</td>
                    <td className="px-5 py-4 text-sm font-medium text-blue-600 text-right">
                      {formatCurrency(contribution.amount)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getContributionStatusBadge(contribution.status)}`}>
                        {contribution.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-gray-100 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventsView;
