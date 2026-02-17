
import React, { useState } from 'react';
import { InventoryBatch } from '../types';
import { Plus, Search, Filter, Layers, AlertCircle } from 'lucide-react';

interface InventoryProps {
  inventory: InventoryBatch[];
  onProcure: (batch: Partial<InventoryBatch>) => void;
}

const Inventory: React.FC<InventoryProps> = ({ inventory, onProcure }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newBatch, setNewBatch] = useState<Partial<InventoryBatch>>({
    itemName: '',
    size: '',
    supplier: '',
    purchasePrice: 0,
    quantityProcured: 0,
    procurementDate: new Date().toISOString().split('T')[0]
  });

  const filteredInventory = inventory.filter(i => 
    i.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    onProcure({
      ...newBatch,
      quantityRemaining: newBatch.quantityProcured
    });
    setShowModal(false);
    setNewBatch({
      itemName: '',
      size: '',
      supplier: '',
      purchasePrice: 0,
      quantityProcured: 0,
      procurementDate: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search batches..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          <span>New Procurement</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Item Details</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Batch Info</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cost Price</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInventory.map((batch) => (
              <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
                      <Layers size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{batch.itemName}</p>
                      <p className="text-xs text-slate-400">{batch.size}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <p className="text-slate-700">{batch.supplier}</p>
                  <p className="text-xs text-slate-400 italic">{batch.procurementDate}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold ${batch.quantityRemaining < (batch.quantityProcured * 0.1) ? 'text-red-600' : 'text-slate-900'}`}>
                      {batch.quantityRemaining} left
                    </span>
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${batch.quantityRemaining < (batch.quantityProcured * 0.1) ? 'bg-red-500' : 'bg-indigo-500'}`}
                        style={{ width: `${(batch.quantityRemaining / batch.quantityProcured) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-700">
                  Ksh {batch.purchasePrice.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900">
                  Ksh {(batch.quantityRemaining * batch.purchasePrice).toLocaleString()}
                </td>
              </tr>
            ))}
            {filteredInventory.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  No inventory batches found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold flex items-center space-x-2">
                <Plus className="text-indigo-600" />
                <span>Add Procurement Batch</span>
              </h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                <input 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newBatch.itemName}
                  onChange={(e) => setNewBatch({...newBatch, itemName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Size (e.g. 50kg bag)</label>
                <input 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newBatch.size}
                  onChange={(e) => setNewBatch({...newBatch, size: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
                <input 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newBatch.supplier}
                  onChange={(e) => setNewBatch({...newBatch, supplier: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Price (Ksh)</label>
                <input 
                  type="number"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newBatch.purchasePrice}
                  onChange={(e) => setNewBatch({...newBatch, purchasePrice: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity Procured</label>
                <input 
                  type="number"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newBatch.quantityProcured}
                  onChange={(e) => setNewBatch({...newBatch, quantityProcured: Number(e.target.value)})}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Procurement Date</label>
                <input 
                  type="date"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newBatch.procurementDate}
                  onChange={(e) => setNewBatch({...newBatch, procurementDate: e.target.value})}
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex space-x-3">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleAdd}
                className="flex-1 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-lg"
              >
                Log Procurement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
