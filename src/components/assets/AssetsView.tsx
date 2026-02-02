import React, { useState } from 'react';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon } from '../icons/Icons';

interface Asset {
  id: string;
  name: string;
  category: string;
  purchase_date: string;
  purchase_price: number;
  current_value: number;
  location: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  notes: string;
}

interface AssetsViewProps {
  // Assets would come from database in real implementation
}

const AssetsView: React.FC<AssetsViewProps> = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    name: '',
    category: 'Equipment',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_price: 0,
    current_value: 0,
    location: '',
    condition: 'good',
    notes: ''
  });

  const categories = ['Equipment', 'Furniture', 'Vehicles', 'Electronics', 'Musical Instruments', 'Other'];
  const conditions = [
    { value: 'excellent', label: 'Excellent', color: 'bg-green-100 text-green-700' },
    { value: 'good', label: 'Good', color: 'bg-blue-100 text-blue-700' },
    { value: 'fair', label: 'Fair', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'poor', label: 'Poor', color: 'bg-red-100 text-red-700' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleAddAsset = () => {
    if (!newAsset.name) return;
    
    const asset: Asset = {
      id: Date.now().toString(),
      name: newAsset.name || '',
      category: newAsset.category || 'Equipment',
      purchase_date: newAsset.purchase_date || new Date().toISOString().split('T')[0],
      purchase_price: newAsset.purchase_price || 0,
      current_value: newAsset.current_value || 0,
      location: newAsset.location || '',
      condition: newAsset.condition as 'excellent' | 'good' | 'fair' | 'poor' || 'good',
      notes: newAsset.notes || ''
    };

    setAssets([...assets, asset]);
    setShowAddModal(false);
    setNewAsset({
      name: '',
      category: 'Equipment',
      purchase_date: new Date().toISOString().split('T')[0],
      purchase_price: 0,
      current_value: 0,
      location: '',
      condition: 'good',
      notes: ''
    });
  };

  const handleDeleteAsset = (id: string) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      setAssets(assets.filter(a => a.id !== id));
    }
  };

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalValue = assets.reduce((sum, a) => sum + a.current_value, 0);
  const totalPurchaseValue = assets.reduce((sum, a) => sum + a.purchase_price, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assets</h1>
          <p className="text-gray-500 mt-1">Track and manage church property and equipment.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <PlusIcon size={18} />
          Add Asset
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Assets</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{assets.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Purchase Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalPurchaseValue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Current Total Value</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(totalValue)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredAssets.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p>No assets found.</p>
            <p className="text-sm mt-1">
              {assets.length === 0 
                ? 'Click "Add Asset" to register your first church asset.'
                : 'Try adjusting your search.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Name</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Price</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{asset.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{asset.category}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{asset.location || '-'}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        conditions.find(c => c.value === asset.condition)?.color
                      }`}>
                        {asset.condition.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 text-right">{formatCurrency(asset.purchase_price)}</td>
                    <td className="px-5 py-4 text-sm font-medium text-blue-600 text-right">{formatCurrency(asset.current_value)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                          <EditIcon size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Add New Asset</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Asset Name</label>
                <input
                  type="text"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Sound System"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                  <select
                    value={newAsset.condition}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, condition: e.target.value as any }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  >
                    {conditions.map(cond => (
                      <option key={cond.value} value={cond.value}>{cond.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={newAsset.location}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Main Sanctuary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newAsset.purchase_price || ''}
                      onChange={(e) => setNewAsset(prev => ({ ...prev, purchase_price: parseFloat(e.target.value) || 0 }))}
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Value</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newAsset.current_value || ''}
                      onChange={(e) => setNewAsset(prev => ({ ...prev, current_value: parseFloat(e.target.value) || 0 }))}
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
                <input
                  type="date"
                  value={newAsset.purchase_date}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, purchase_date: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={newAsset.notes}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Additional notes about this asset..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAsset}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsView;
