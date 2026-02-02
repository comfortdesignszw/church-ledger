import React, { useState } from 'react';
import { CloudIcon, RefreshIcon, DownloadIcon, CheckCircleIcon } from '../icons/Icons';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'finance_officer' | 'viewer';
}

interface SettingsViewProps {
  churchName: string;
  onChurchNameChange: (name: string) => void;
  onBackup: () => Promise<void>;
  onRestore: (data: any) => Promise<void>;
  backupStatus: 'idle' | 'backing-up' | 'success' | 'error';
  lastBackupTime: string | null;
  user?: User | null;
  onLogout?: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  churchName,
  onChurchNameChange,
  onBackup,
  onRestore,
  backupStatus,
  lastBackupTime,
  user,
  onLogout
}) => {
  const [localChurchName, setLocalChurchName] = useState(churchName);
  const [currency, setCurrency] = useState('USD');
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onChurchNameChange(localChurchName);
    localStorage.setItem('ccas_settings', JSON.stringify({
      churchName: localChurchName,
      currency,
      autoBackup,
      backupFrequency
    }));
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await onRestore(data);
    } catch (error) {
      alert('Invalid backup file format');
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Administrator' },
      finance_officer: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Finance Officer' },
      viewer: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Viewer' }
    };
    return badges[role as keyof typeof badges] || badges.viewer;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Configure your church accounting system preferences.</p>
      </div>

      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircleIcon size={20} className="text-green-600" />
          <span className="text-green-700 font-medium">Settings saved successfully!</span>
        </div>
      )}

      {/* User Profile Section */}
      {user && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Profile</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xl">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded ${getRoleBadge(user.role).bg} ${getRoleBadge(user.role).text}`}>
                {getRoleBadge(user.role).label}
              </span>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Role Permissions:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              {user.role === 'admin' && (
                <>
                  <li>• Full access to all features</li>
                  <li>• Manage users and permissions</li>
                  <li>• Configure system settings</li>
                </>
              )}
              {user.role === 'finance_officer' && (
                <>
                  <li>• Add and edit transactions</li>
                  <li>• Generate and export reports</li>
                  <li>• Manage events and contributions</li>
                </>
              )}
              {user.role === 'viewer' && (
                <>
                  <li>• View dashboard and reports</li>
                  <li>• Read-only access to transactions</li>
                </>
              )}
            </ul>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="mt-4 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>
      )}

      {/* General Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Church/Organization Name</label>
            <input
              type="text"
              value={localChurchName}
              onChange={(e) => setLocalChurchName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your church name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="USD">USD - US Dollar ($)</option>
              <option value="EUR">EUR - Euro (€)</option>
              <option value="GBP">GBP - British Pound (£)</option>
              <option value="KES">KES - Kenyan Shilling (Ksh)</option>
              <option value="NGN">NGN - Nigerian Naira (₦)</option>
              <option value="ZAR">ZAR - South African Rand (R)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <CloudIcon size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Backup & Restore</h2>
            <p className="text-sm text-gray-500">Secure your financial data with cloud backups</p>
          </div>
        </div>

        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <div>
            <p className="font-medium text-gray-900">Automatic Backups</p>
            <p className="text-sm text-gray-500">Automatically backup data to cloud storage</p>
          </div>
          <button
            onClick={() => setAutoBackup(!autoBackup)}
            className={`relative w-12 h-6 rounded-full transition-colors ${autoBackup ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${autoBackup ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {autoBackup && (
          <div className="py-4 border-b border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
            <select
              value={backupFrequency}
              onChange={(e) => setBackupFrequency(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="hourly">Every Hour</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        )}

        <div className="py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Last Backup</p>
              <p className="text-sm text-gray-500">
                {lastBackupTime ? new Date(lastBackupTime).toLocaleString() : 'No backups yet'}
              </p>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded ${lastBackupTime ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {lastBackupTime ? 'SYNCED' : 'NOT SYNCED'}
            </span>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap gap-3">
          <button
            onClick={onBackup}
            disabled={backupStatus === 'backing-up'}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshIcon size={18} className={backupStatus === 'backing-up' ? 'animate-spin' : ''} />
            {backupStatus === 'backing-up' ? 'Backing up...' : 'Backup Now'}
          </button>
          <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
            <DownloadIcon size={18} />
            Restore from File
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>End-to-end encrypted financial data for your ministry.</span>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
