
import React, { useState } from 'react';
import { School, Payment, Invoice } from '../types';
import { Plus, Search, CreditCard, Banknote, Calendar, User } from 'lucide-react';

interface PaymentsProps {
  schools: School[];
  invoices: Invoice[];
  payments: Payment[];
  onAdd: (payment: Partial<Payment>) => void;
}

const Payments: React.FC<PaymentsProps> = ({ schools, invoices, payments, onAdd }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState('Cheque');
  const [bankName, setBankName] = useState('');

  const filteredPayments = payments.filter(p => {
    const invoice = invoices.find(inv => inv.id === p.invoiceId);
    const school = schools.find(s => s.id === invoice?.schoolId);
    return school?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleAdd = () => {
    if (!selectedSchoolId || amount <= 0) return;
    
    // In this simplified version, we attribute the payment to the most recent unpaid invoice
    // Or just to the school general balance if no invoice is selected.
    const schoolInvoices = invoices.filter(inv => inv.schoolId === selectedSchoolId && (inv.totalRevenue - inv.amountPaid) > 0);
    const targetInvoiceId = schoolInvoices.length > 0 ? schoolInvoices[0].id : 'general';

    onAdd({
      invoiceId: targetInvoiceId,
      amount,
      method,
      bankName,
      paymentDate: new Date().toISOString().split('T')[0]
    });
    
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedSchoolId('');
    setAmount(0);
    setMethod('Cheque');
    setBankName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search payments..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus size={20} />
          <span>Record Payment</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">School</th>
              <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">Method</th>
              <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-right">Amount Paid</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[...payments].reverse().map((payment) => {
              const invoice = invoices.find(inv => inv.id === payment.invoiceId);
              const school = invoice ? schools.find(s => s.id === invoice.schoolId) : null;
              return (
                <tr key={payment.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-500">{payment.paymentDate}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{school?.name || 'Manual Settlement'}</p>
                    <p className="text-xs text-slate-400">Ref: {payment.bankName || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 px-2 py-1 rounded text-xs">{payment.method}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600">
                    Ksh {payment.amount.toLocaleString()}
                  </td>
                </tr>
              );
            })}
            {payments.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">No payment history found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in slide-in-from-bottom-4 duration-200">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold flex items-center space-x-2">
                <CreditCard className="text-emerald-600" />
                <span>Receive Payment</span>
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select School</label>
                <select 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                >
                  <option value="">Choose School...</option>
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (Bal: Ksh {s.outstandingBalance.toLocaleString()})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount to Receive (Ksh)</label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="number"
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Method</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                  >
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bank / Ref</label>
                  <input 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. KCB / TxID"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex space-x-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-slate-600 font-medium">Cancel</button>
              <button 
                onClick={handleAdd}
                className="flex-1 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700"
              >
                Log Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
