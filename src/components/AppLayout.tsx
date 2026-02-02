import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useChurchData } from '../hooks/useChurchData';
import { supabase } from '@/lib/supabase';

// Layout Components
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';

// View Components
import DashboardView from './dashboard/DashboardView';
import TransactionForm, { TransactionFormData } from './transactions/TransactionForm';
import TransactionsView from './transactions/TransactionsView';
import ReportsView from './reports/ReportsView';
import EventsView from './events/EventsView';
import AssetsView from './assets/AssetsView';
import SettingsView from './settings/SettingsView';

// Modal Components
import EventModal, { EventFormData } from './modals/EventModal';
import ContributionModal, { ContributionFormData } from './modals/ContributionModal';

// Icons
import { CloseIcon, BuildingIcon } from './icons/Icons';

// User type
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'finance_officer' | 'viewer';
}

// Auth Modal Component
const AuthModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
}> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'finance_officer' | 'viewer'>('viewer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('auth', {
        body: {
          action: mode,
          email,
          password,
          name: mode === 'signup' ? name : undefined,
          role: mode === 'signup' ? role : undefined
        }
      });

      if (fnError) throw fnError;
      if (!data.success) throw new Error(data.error);

      onSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <BuildingIcon className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">CCAS</h2>
              <p className="text-blue-100 text-sm">Computerised Church Accounting System</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-4">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                mode === 'login' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                mode === 'signup' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@church.org"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
              minLength={6}
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="admin">Admin (Full Access)</option>
                <option value="finance_officer">Finance Officer (Transactions & Reports)</option>
                <option value="viewer">Viewer (Read Only)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {role === 'admin' && 'Full access to all features including user management'}
                {role === 'finance_officer' && 'Can manage transactions and generate reports'}
                {role === 'viewer' && 'Can view dashboard and reports only'}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useAppContext();
  const isMobile = useIsMobile();
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('ccas_token'));
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Church data hook
  const {
    transactions,
    categories,
    events,
    members,
    contributions,
    loading,
    error,
    addTransaction,
    deleteTransaction,
    verifyTransaction,
    addEvent,
    addContribution,
    backupData,
    restoreData,
    getDashboardStats,
    getMonthlyData,
    getCategoryDistribution
  } = useChurchData();

  // UI State
  const [activeView, setActiveView] = useState('dashboard');
  const [churchName, setChurchName] = useState(() => {
    const saved = localStorage.getItem('ccas_church_name');
    return saved || 'St. Andrews Church Administration';
  });
  const [backupStatus, setBackupStatus] = useState<'idle' | 'backing-up' | 'success' | 'error'>('idle');
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(() => {
    return localStorage.getItem('ccas_last_backup');
  });

  // Modal State
  const [showEventModal, setShowEventModal] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!authToken) {
        setAuthLoading(false);
        return;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke('auth', {
          body: { action: 'verify', token: authToken }
        });

        if (fnError || !data.success) {
          localStorage.removeItem('ccas_token');
          setAuthToken(null);
          setUser(null);
        } else {
          setUser(data.user);
        }
      } catch (err) {
        localStorage.removeItem('ccas_token');
        setAuthToken(null);
      } finally {
        setAuthLoading(false);
      }
    };

    verifyToken();
  }, [authToken]);

  // Save church name to localStorage
  useEffect(() => {
    localStorage.setItem('ccas_church_name', churchName);
  }, [churchName]);

  // Handle auth success
  const handleAuthSuccess = (newUser: User, token: string) => {
    setUser(newUser);
    setAuthToken(token);
    localStorage.setItem('ccas_token', token);
  };

  // Handle logout
  const handleLogout = async () => {
    if (authToken) {
      await supabase.functions.invoke('auth', {
        body: { action: 'logout', token: authToken }
      });
    }
    localStorage.removeItem('ccas_token');
    setAuthToken(null);
    setUser(null);
  };

  // Check permissions based on role
  const canEdit = user?.role === 'admin' || user?.role === 'finance_officer';
  const canManageUsers = user?.role === 'admin';

  // Get view title
  const getViewTitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Dashboard';
      case 'transactions': return 'Transactions';
      case 'new-transaction': return 'New Transaction';
      case 'reports': return 'Reports';
      case 'events': return 'Events';
      case 'assets': return 'Assets';
      case 'settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  // Handle backup
  const handleBackup = async () => {
    try {
      setBackupStatus('backing-up');
      const result = await backupData();
      
      const blob = new Blob([JSON.stringify(result.backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ccas-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      const now = new Date().toISOString();
      setLastBackupTime(now);
      localStorage.setItem('ccas_last_backup', now);
      setBackupStatus('success');
      setTimeout(() => setBackupStatus('idle'), 3000);
    } catch (err) {
      console.error('Backup failed:', err);
      setBackupStatus('error');
      setTimeout(() => setBackupStatus('idle'), 3000);
    }
  };

  // Handle transaction submit
  const handleTransactionSubmit = async (data: TransactionFormData) => {
    if (!canEdit) {
      alert('You do not have permission to add transactions.');
      return;
    }
    try {
      setIsSubmitting(true);
      await addTransaction({ ...data, user_id: user?.id });
      setActiveView('transactions');
    } catch (err) {
      console.error('Failed to add transaction:', err);
      alert('Failed to add transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle event submit
  const handleEventSubmit = async (data: EventFormData) => {
    if (!canEdit) {
      alert('You do not have permission to add events.');
      return;
    }
    try {
      setIsSubmitting(true);
      await addEvent(data);
      setShowEventModal(false);
    } catch (err) {
      console.error('Failed to add event:', err);
      alert('Failed to add event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle contribution submit
  const handleContributionSubmit = async (data: ContributionFormData) => {
    if (!canEdit) {
      alert('You do not have permission to record contributions.');
      return;
    }
    try {
      setIsSubmitting(true);
      await addContribution(data);
      setShowContributionModal(false);
      setSelectedEventId(undefined);
    } catch (err) {
      console.error('Failed to add contribution:', err);
      alert('Failed to add contribution. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle record contribution from event
  const handleRecordContribution = (eventId: string) => {
    setSelectedEventId(eventId);
    setShowContributionModal(true);
  };

  // Render current view
  const renderView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-2">Error loading data</p>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView
            stats={getDashboardStats()}
            monthlyData={getMonthlyData(6)}
            categoryDistribution={getCategoryDistribution()}
            transactions={transactions}
            categories={categories}
            onViewReports={() => setActiveView('reports')}
          />
        );

      case 'new-transaction':
        if (!canEdit) {
          return (
            <div className="text-center py-12">
              <p className="text-gray-500">You do not have permission to add transactions.</p>
            </div>
          );
        }
        return (
          <TransactionForm
            categories={categories}
            events={events}
            onSubmit={handleTransactionSubmit}
            onCancel={() => setActiveView('dashboard')}
            isSubmitting={isSubmitting}
          />
        );

      case 'transactions':
        return (
          <TransactionsView
            transactions={transactions}
            categories={categories}
            onEdit={(transaction) => console.log('Edit transaction:', transaction)}
            onDelete={canEdit ? deleteTransaction : () => alert('No permission')}
            onVerify={canEdit ? verifyTransaction : () => alert('No permission')}
          />
        );

      case 'reports':
        return (
          <ReportsView
            transactions={transactions}
            categories={categories}
            churchName={churchName}
          />
        );

      case 'events':
        return (
          <EventsView
            events={events}
            contributions={contributions}
            members={members}
            onAddEvent={() => canEdit ? setShowEventModal(true) : alert('No permission')}
            onRecordContribution={canEdit ? handleRecordContribution : () => alert('No permission')}
          />
        );

      case 'assets':
        return <AssetsView />;

      case 'settings':
        return (
          <SettingsView
            churchName={churchName}
            onChurchNameChange={setChurchName}
            onBackup={handleBackup}
            onRestore={restoreData}
            backupStatus={backupStatus}
            lastBackupTime={lastBackupTime}
            user={user}
            onLogout={handleLogout}
          />
        );

      default:
        return null;
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading CCAS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isMobile={isMobile}
        isOpen={sidebarOpen}
        onClose={toggleSidebar}
        user={user}
        canEdit={canEdit}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          title={getViewTitle()}
          breadcrumb="Overview"
          onMenuClick={toggleSidebar}
          onBackupClick={handleBackup}
          backupStatus={backupStatus}
          user={user}
          onLoginClick={() => setShowAuthModal(true)}
          onLogoutClick={handleLogout}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderView()}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-4 lg:px-6 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>End-to-end encrypted financial data for your ministry.</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="hover:text-gray-700 transition-colors">Help Center</button>
              <button className="hover:text-gray-700 transition-colors">Privacy Policy</button>
              <button className="hover:text-gray-700 transition-colors">Audit Logs</button>
              <span>&copy; {new Date().getFullYear()} CCAS Admin</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Event Modal */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSubmit={handleEventSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Contribution Modal */}
      <ContributionModal
        isOpen={showContributionModal}
        onClose={() => {
          setShowContributionModal(false);
          setSelectedEventId(undefined);
        }}
        onSubmit={handleContributionSubmit}
        isSubmitting={isSubmitting}
        events={events}
        members={members}
        selectedEventId={selectedEventId}
      />
    </div>
  );
};

export default AppLayout;
