
import React, { useState } from 'react';
import { School, LPO, LPOItem } from '../types';
import { Plus, Search, FileText, CheckCircle, Clock, Package } from 'lucide-react';

interface LPOsProps {
  schools: School[];
  lpos: LPO[];
  onAdd: (lpo: Partial<LPO>) => void;
}

const LPOs: React.FC<LPOsProps> = ({ schools, lpos, onAdd }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [lpoNumber, setLpoNumber] = useState('');
  const [items, setItems] = useState<Partial<LPOItem>[]>([{ id: '1', itemName: '', quantityOrdered: 0, quantityDelivered: 0 }]);

  const filteredLPOs = lpos.filter(l => {
    const school = schools.find(s => s.id === l.schoolId);
    return (school?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            l.lpoNumber.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), itemName: '', quantityOrdered: 0, quantityDelivered: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleAdd = () => {
    if (!selectedSchoolId || !lpoNumber || items.length === 0) return;
    onAdd({
      schoolId: selectedSchoolId,
      lpoNumber,
      dateReceived: new Date().toISOString().split('T')[0],
      items: items as LPOItem[],
      status: 'Pending'
    });
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedSchoolId('');
    setLpoNumber('');
    setItems([{ id: '1', itemName: '', quantityOrdered: 0, quantityDelivered: 0 }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search LPOs..." 
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
          <span>Register LPO</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredLPOs.map((lpo) => {
          const school = schools.find(s => s.id === lpo.schoolId);
          return (
            <div key={lpo.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-900">{lpo.lpoNumber}</h3>
                  <p className="text-sm text-slate-500">{school?.name}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-bold flex items-center space-x-1 ${
                  lpo.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                  lpo.status === 'Partial' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {lpo.status === 'Completed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                  <span>{lpo.status}</span>
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                {lpo.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.itemName}</span>
                    <span className="font-medium text-slate-900">
                      {item.quantityDelivered} / {item.quantityOrdered}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
                <span>Received: {lpo.dateReceived}</span>
                <button className="text-indigo-600 hover:underline font-semibold">View Details</button>
              </div>
            </div>
          );
        })}
        {filteredLPOs.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
            <FileText size={48} className="mx-auto mb-4 opacity-10" />
            <p>No LPOs recorded yet.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">New LPO Registration</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400">&times;</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">School</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={selectedSchoolId}
                    onChange={(e) => setSelectedSchoolId(e.target.value)}
                  >
                    <option value="">Select School...</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">LPO Number</label>
                  <input 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="LPO-XXXX"
                    value={lpoNumber}
                    onChange={(e) => setLpoNumber(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-slate-700 uppercase tracking-wide">Ordered Items</label>
                  <button onClick={addItem} className="text-indigo-600 text-xs font-bold hover:underline">+ Add Item</button>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                  {items.map((item, idx) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <input 
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="Item name (e.g. Maize)"
                        value={item.itemName}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[idx].itemName = e.target.value;
                          setItems(newItems);
                        }}
                      />
                      <input 
                        type="number"
                        className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="Qty"
                        value={item.quantityOrdered || ''}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[idx].quantityOrdered = Number(e.target.value);
                          setItems(newItems);
                        }}
                      />
                      {items.length > 1 && (
                        <button onClick={() => removeItem(item.id!)} className="text-slate-300 hover:text-red-500">&times;</button>
                      )}
                    </div>
                  ))}
                </div>
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
                Save LPO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LPOs;
