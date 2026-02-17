
import React, { useState } from 'react';
import { School } from '../types';
import { Plus, Search, MapPin, Phone, User, CreditCard as CreditIcon, X } from 'lucide-react';

interface SchoolsProps {
  schools: School[];
  onAdd: (school: Partial<School>) => void;
}

const Schools: React.FC<SchoolsProps> = ({ schools, onAdd }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSchool, setNewSchool] = useState<Partial<School>>({
    name: '',
    principalName: '',
    phoneNumber: '',
    contactDetails: '',
    creditLimit: 0,
  });

  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.principalName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (!newSchool.name || !newSchool.principalName) return;
    onAdd(newSchool);
    setShowModal(false);
    setNewSchool({ name: '', principalName: '', phoneNumber: '', contactDetails: '', creditLimit: 0 });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search schools or principals..." 
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all font-bold"
        >
          <Plus size={20} />
          <span>Register New Institution</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchools.map((school) => (
          <div key={school.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <User size={24} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                  school.outstandingBalance > school.creditLimit 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {school.outstandingBalance > school.creditLimit ? 'Limit Exceeded' : 'Active Account'}
                </span>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-1">{school.name}</h3>
              <p className="text-sm font-bold text-slate-400 flex items-center space-x-2 mb-6 uppercase tracking-tight">
                <User size={14} className="text-indigo-400" />
                <span>{school.principalName || 'Principal Unassigned'}</span>
              </p>
              
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center space-x-3 text-sm text-slate-600 font-medium">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <Phone size={16} />
                  </div>
                  <span>{school.phoneNumber || 'No contact number'}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-slate-600 font-medium">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <MapPin size={16} />
                  </div>
                  <span className="truncate">{school.contactDetails || 'No location provided'}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-slate-600 font-medium">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <CreditIcon size={16} />
                  </div>
                  <span>Credit Limit: <span className="font-bold text-slate-900">Ksh {school.creditLimit.toLocaleString()}</span></span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-slate-100 border-t border-slate-100">
              <div className="bg-white p-4">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Outstanding</p>
                <p className={`text-lg font-black ${school.outstandingBalance > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                  Ksh {school.outstandingBalance.toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-4">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Remitted</p>
                <p className="text-lg font-black text-emerald-600">
                  Ksh {school.totalPaid.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-in zoom-in duration-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900">Institution Registration</h3>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Client Enrollment Portal</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2"><X size={24} /></button>
            </div>
            
            <div className="p-8 space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">School Full Name</label>
                  <input 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                    placeholder="e.g. Alliance High School"
                    value={newSchool.name}
                    onChange={(e) => setNewSchool({...newSchool, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Principal Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold"
                        placeholder="Name of Head"
                        value={newSchool.principalName}
                        onChange={(e) => setNewSchool({...newSchool, principalName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold"
                        placeholder="+254..."
                        value={newSchool.phoneNumber}
                        onChange={(e) => setNewSchool({...newSchool, phoneNumber: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Credit Limit (Ksh)</label>
                    <div className="relative">
                      <CreditIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="number"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-black"
                        placeholder="50000"
                        value={newSchool.creditLimit || ''}
                        onChange={(e) => setNewSchool({...newSchool, creditLimit: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Location / Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold"
                        placeholder="Nairobi, Kenya"
                        value={newSchool.contactDetails}
                        onChange={(e) => setNewSchool({...newSchool, contactDetails: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 flex space-x-3 bg-slate-50/50">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
              >
                Discard
              </button>
              <button 
                onClick={handleAdd}
                disabled={!newSchool.name || !newSchool.principalName}
                className="flex-1 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-100 transition-all"
              >
                Register Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schools;
