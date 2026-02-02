import React from 'react';
import { SearchIcon, BellIcon, HelpIcon, MenuIcon, CloudIcon } from '../icons/Icons';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'finance_officer' | 'viewer';
}

interface HeaderProps {
  title: string;
  breadcrumb?: string;
  onMenuClick: () => void;
  onBackupClick: () => void;
  backupStatus: 'idle' | 'backing-up' | 'success' | 'error';
  user?: User | null;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  breadcrumb, 
  onMenuClick, 
  onBackupClick, 
  backupStatus,
  user,
  onLoginClick,
  onLogoutClick
}) => {
  const getRoleBadge = (role: string) => {
    const badges = {
      admin: 'bg-purple-100 text-purple-700',
      finance_officer: 'bg-blue-100 text-blue-700',
      viewer: 'bg-gray-100 text-gray-700'
    };
    const labels = {
      admin: 'Admin',
      finance_officer: 'Finance',
      viewer: 'Viewer'
    };
    return { style: badges[role as keyof typeof badges], label: labels[role as keyof typeof labels] };
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <MenuIcon size={20} />
          </button>
          
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">{breadcrumb || 'Home'}</span>
            <span className="text-gray-300">&gt;</span>
            <span className="font-medium text-gray-900">{title}</span>
          </div>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search ledger..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBackupClick}
            disabled={backupStatus === 'backing-up'}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              backupStatus === 'backing-up' ? 'bg-blue-50 text-blue-600' : 
              backupStatus === 'success' ? 'bg-green-50 text-green-600' :
              backupStatus === 'error' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CloudIcon size={18} className={backupStatus === 'backing-up' ? 'animate-pulse' : ''} />
            <span className="hidden sm:inline">
              {backupStatus === 'backing-up' ? 'Backing up...' : 
               backupStatus === 'success' ? 'Backed up' :
               backupStatus === 'error' ? 'Backup failed' : 'Backup'}
            </span>
          </button>

          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <BellIcon size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <HelpIcon size={20} />
          </button>

          {user ? (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded ${getRoleBadge(user.role).style}`}>
                  {getRoleBadge(user.role).label}
                </span>
              </div>
              <button
                onClick={onLogoutClick}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                title="Sign Out"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
