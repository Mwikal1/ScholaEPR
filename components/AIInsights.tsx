
import React, { useState, useEffect } from 'react';
import { getDemandForecast } from '../services/geminiService';
import { Invoice, InventoryBatch, AIInsight } from '../types';
import { BrainCircuit, RefreshCcw, TrendingUp, ShoppingCart, Calendar } from 'lucide-react';

interface AIInsightsProps {
  invoices: Invoice[];
  inventory: InventoryBatch[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ invoices, inventory }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    const itemNames = Array.from(new Set(inventory.map(i => i.itemName)));
    const data = await getDemandForecast(invoices, inventory, itemNames);
    setInsights(data);
    setLoading(false);
  };

  useEffect(() => {
    if (insights.length === 0 && invoices.length > 0) {
      fetchInsights();
    }
  }, [invoices, inventory]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
            <BrainCircuit className="text-indigo-600" />
            <span>Operational Intelligence</span>
          </h2>
          <p className="text-slate-500 mt-1">AI-driven demand forecasting based on historical sales cycles</p>
        </div>
        <button 
          onClick={fetchInsights}
          disabled={loading}
          className="flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-all font-bold disabled:opacity-50"
        >
          <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          <span>Regenerate Forecast</span>
        </button>
      </div>

      {/* Fix: Removed explicit process.env.API_KEY check as per SDK guidelines to assume it's pre-configured */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insights.map((insight, idx) => (
          <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <BrainCircuit size={80} />
            </div>
            
            <div className="relative">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Predictive Model v1</span>
              <h3 className="text-2xl font-bold mt-4 text-slate-900">{insight.itemName}</h3>
              
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                    <TrendingUp size={12} />
                    <span>30D Demand</span>
                  </p>
                  <p className="text-2xl font-black text-slate-900">{insight.predictedDemand} units</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                    <ShoppingCart size={12} />
                    <span>Reorder Qty</span>
                  </p>
                  <p className="text-2xl font-black text-indigo-600">{insight.suggestedReorder} units</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="flex items-center space-x-3 text-slate-500 mb-4">
                  <Calendar size={18} className="text-amber-500" />
                  <span className="text-sm font-semibold">Estimated Stockout: <span className="text-slate-900">{insight.estimatedStockoutDate}</span></span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed italic bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100/30">
                  “{insight.insight}”
                </p>
              </div>
            </div>
          </div>
        ))}
        {insights.length === 0 && !loading && (
          <div className="col-span-full py-20 bg-slate-50 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400">
            <RefreshCcw size={48} className="mb-4 opacity-10" />
            <p className="font-medium">No intelligence reports generated yet. Click regenerate to begin analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
