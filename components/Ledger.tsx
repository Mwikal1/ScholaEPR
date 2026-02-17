
import React from 'react';
import { LedgerEntry } from '../types';
import { History, ArrowUpRight, ArrowDownLeft, FileText } from 'lucide-react';

interface LedgerProps {
  entries: LedgerEntry[];
}

const Ledger: React.FC<LedgerProps> = ({ entries }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Financial Transaction Ledger</h3>
        <div className="text-right">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Running Balance</p>
          <p className="text-2xl font-black text-slate-900">
            Ksh {entries.length > 0 ? entries[entries.length - 1].balance.toLocaleString() : '0'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Transaction / Reference</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Debit (-)</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Credit (+)</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[...entries].reverse().map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4 text-sm text-slate-500">
                  {entry.date}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded-full ${
                      entry.credit > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                    }`}>
                      {entry.credit > 0 ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{entry.type}</p>
                      <p className="text-xs text-slate-400 font-mono tracking-tight">{entry.reference}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  {entry.debit > 0 && (
                    <span className="text-sm font-bold text-slate-600">
                      - {entry.debit.toLocaleString()}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {entry.credit > 0 && (
                    <span className="text-sm font-bold text-emerald-600">
                      + {entry.credit.toLocaleString()}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-black text-slate-900">
                    {entry.balance.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center opacity-20">
                    <History size={48} />
                    <p className="mt-4 text-sm font-medium">Starting from zero. No transactions recorded yet.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ledger;
