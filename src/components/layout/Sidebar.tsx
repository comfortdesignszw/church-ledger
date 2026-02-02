import React from 'react';
import {
  DashboardIcon,
  TransactionsIcon,
  ReportsIcon,
  EventsIcon,
  AssetsIcon,
  SettingsIcon,
  PlusIcon,
  BuildingIcon
} from '../icons/Icons';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'finance_officer' | 'viewer';
}

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  canEdit?: boolean;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  { id: 'transactions', label: 'Transactions', icon: TransactionsIcon },
  { id: 'reports', label: 'Reports', icon: ReportsIcon },
  { id: 'events', label: 'Events', icon: EventsIcon },
  { id: 'assets', label: 'Assets', icon: AssetsIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isMobile, isOpen, onClose, user, canEdit }) => {
  const handleNavClick = (viewId: string) => {
    setActiveView(viewId);
    if (isMobile) {
      onClose();
    }
  };

  return (
    <>
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      )}
      
      <aside className={`
        ${isMobile ? 'fixed' : 'relative'} 
        ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
        w-64 bg-white border-r border-gray-200 h-screen flex flex-col z-50 transition-transform duration-300
      `}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <BuildingIcon className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm leading-tight">CCAS</h1>
              <p className="text-xs text-gray-500">Church Admin Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {canEdit && (
          <div className="p-4">
            <button
              onClick={() => handleNavClick('new-transaction')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <PlusIcon size={18} />
              Add Transaction
            </button>
          </div>
        )}

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              <span className="text-gray-600 font-medium text-sm">
                {user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'G'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Guest'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role?.replace('_', ' ') || 'Not signed in'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
