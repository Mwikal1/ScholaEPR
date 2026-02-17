
import React, { useState, useMemo } from 'react';
import { Expense, ExpenseCategory } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';
import { Plus, Search, TrendingDown, Receipt, Calendar, Tag, Banknote } from 'lucide-react';

interface ExpensesProps {
  expenses: Expense[];
  onAdd: (expense: Partial<Expense>) => void;
}

const Expenses: React.FC<ExpensesProps> = ({ expenses, onAdd }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    name: '',
    category: 'Misc',
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  });

  const filteredExpenses = useMemo(() => {
    return [...expenses]
      .filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.category.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, searchTerm]);

  const totalSpent = useMemo(() => expenses.reduce((acc, curr) => acc + curr.amount, 0), [expenses]);

  const handleAdd = () => {
    if (!newExpense.name || (newExpense.amount || 0) <= 0) return;
    onAdd(newExpense);
    setShowModal(false);
    setNewExpense({
      name: '',
      category: 'Misc',
      amount: 0,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const getCategoryColor = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'Rent': return 'bg-purple-100 text-purple-700';
      case 'Utilities': return 'bg-blue-100 text-blue-700';
      case 'Transport': return 'bg-amber-100 text-amber-700';
      case 'Salaries': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <TrendingDown className="text-red-500" />
            <span>Operational Expenses</span>
          </h3>
          <p className="text-slate-500 text-sm">Track overheads and maintain healthy cash flows</p>
        </div>
        
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter expenses..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all font-bold shrink-0"
          >
            <Plus size={20} />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Expenditure</p>
          <p className="text-3xl font-black text-slate-900">Ksh {totalSpent.toLocaleString()}</p>
          <div className="mt-4 flex items-center text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded w-fit">
            <TrendingDown size={12} className="mr-1" />
            <span>Net Outflow</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Expense Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                    {expense.date}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-100 text-slate-400 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <Receipt size={18} />
                      </div>
                      <span className="font-bold text-slate-900">{expense.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getCategoryColor(expense.category)}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-black text-slate-900">
                      Ksh {expense.amount.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic">
                    <TrendingDown size={48} className="mx-auto mb-4 opacity-10" />
                    <p>No operational expenses matched your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in duration-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900">Log Operational Expense</h3>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">New Disbursement</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors text-2xl">&times;</button>
            </div>
            
            <div className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Expense Title</label>
                <div className="relative">
                  <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold"
                    placeholder="e.g. Office Rent Feb 2026"
                    value={newExpense.name}
                    onChange={(e) => setNewExpense({...newExpense, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Category</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <select 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold appearance-none"
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({...newExpense, category: e.target.value as ExpenseCategory})}
                    >
                      {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Amount (Ksh)</label>
                  <div className="relative">
                    <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="number"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-black"
                      placeholder="0.00"
                      value={newExpense.amount || ''}
                      onChange={(e) => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Date of Transaction</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="date"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 flex space-x-3 bg-slate-50/50">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAdd}
                disabled={!newExpense.name || (newExpense.amount || 0) <= 0}
                className="flex-1 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-100 transition-all"
              >
                Post Disbursement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
