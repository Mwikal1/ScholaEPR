
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, ComposedChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Users, 
  Package, 
  DollarSign, 
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Target
} from 'lucide-react';
import { School, Invoice, Expense, InventoryBatch, LedgerEntry } from '../types';

interface DashboardProps {
  schools: School[];
  invoices: Invoice[];
  expenses: Expense[];
  inventory: InventoryBatch[];
  ledger: LedgerEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ schools, invoices, expenses, inventory, ledger }) => {
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const stats = useMemo(() => {
    const revenue = invoices.reduce((acc, inv) => acc + inv.totalRevenue, 0);
    const cogs = invoices.reduce((acc, inv) => acc + inv.totalCOGS, 0);
    const grossProfit = revenue - cogs;
    const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    const netProfit = grossProfit - totalExpenses;
    const receivables = schools.reduce((acc, s) => acc + (s.outstandingBalance || 0), 0);
    const invValue = inventory.reduce((acc, i) => acc + (i.quantityRemaining * i.purchasePrice), 0);
    const ledgerBalance = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0;
    
    // Inventory Turnover: COGS / Current Inventory (simplified proxy for average inventory)
    const turnover = invValue > 0 ? (cogs / invValue).toFixed(2) : '0.00';

    return { revenue, cogs, grossProfit, netProfit, receivables, invValue, ledgerBalance, turnover };
  }, [invoices, expenses, schools, inventory, ledger]);

  // Top 5 Profitable Items
  const topProfitableItems = useMemo(() => {
    const itemProfits: Record<string, number> = {};
    invoices.forEach(inv => {
      inv.items.forEach(item => {
        const profit = (item.sellingPrice - item.costPrice) * item.quantity;
        itemProfits[item.itemName] = (itemProfits[item.itemName] || 0) + profit;
      });
    });
    return Object.entries(itemProfits)
      .map(([name, profit]) => ({ name, profit }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
  }, [invoices]);

  // Slowest Paying Schools (Based on average payment history)
  const slowestPayers = useMemo(() => {
    return schools
      .filter(s => s.paymentDaysHistory && s.paymentDaysHistory.length > 0)
      .map(s => {
        const avgDays = s.paymentDaysHistory.reduce((a, b) => a + b, 0) / s.paymentDaysHistory.length;
        return { name: s.name, avgDays, balance: s.outstandingBalance };
      })
      .sort((a, b) => b.avgDays - a.avgDays)
      .slice(0, 5);
  }, [schools]);

  // Receivables Aging
  const agingData = useMemo(() => {
    const now = new Date();
    let current = 0; // 0-30 days
    let mid = 0;     // 31-60 days
    let old = 0;     // 61+ days

    invoices.forEach(inv => {
      const balance = inv.totalRevenue - inv.amountPaid;
      if (balance > 0.01) {
        const invDate = new Date(inv.invoiceDate);
        const diffDays = Math.floor((now.getTime() - invDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays <= 30) current += balance;
        else if (diffDays <= 60) mid += balance;
        else old += balance;
      }
    });

    return [
      { name: '0-30 Days', value: current, fill: '#10b981' },
      { name: '31-60 Days', value: mid, fill: '#f59e0b' },
      { name: '61+ Days', value: old, fill: '#ef4444' }
    ];
  }, [invoices]);

  const monthlyTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((m, i) => {
      const monthInvoices = invoices.filter(inv => new Date(inv.invoiceDate).getMonth() === i);
      return {
        name: m,
        revenue: monthInvoices.reduce((a, b) => a + b.totalRevenue, 0),
        profit: monthInvoices.reduce((a, b) => a + b.grossProfit, 0),
      };
    });
  }, [invoices]);

  const formatCurrency = (val: number) => `Ksh ${val.toLocaleString()}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* High-Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Total Revenue" 
          value={formatCurrency(stats.revenue)} 
          icon={<TrendingUp size={20} />} 
          subtitle="All-time gross sales" 
          color="bg-indigo-600" 
        />
        <KpiCard 
          title="Gross Profit" 
          value={formatCurrency(stats.grossProfit)} 
          icon={<DollarSign size={20} />} 
          subtitle="Net sales revenue - COGS" 
          color="bg-emerald-500" 
        />
        <KpiCard 
          title="Net Profit" 
          value={formatCurrency(stats.netProfit)} 
          icon={<ShieldCheck size={20} />} 
          subtitle="Final surplus after expenses" 
          color="bg-blue-600" 
        />
        <KpiCard 
          title="Turnover Ratio" 
          value={stats.turnover} 
          icon={<Target size={20} />} 
          subtitle="Stock efficiency multiplier" 
          color="bg-purple-600" 
        />
      </div>

      {/* Assets & Receivables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <KpiCard 
          title="Receivables" 
          value={formatCurrency(stats.receivables)} 
          icon={<Clock size={20} />} 
          subtitle="Outstanding from schools" 
          color="bg-rose-600" 
        />
        <KpiCard 
          title="Inventory Cost" 
          value={formatCurrency(stats.invValue)} 
          icon={<Package size={20} />} 
          subtitle="Stock value in warehouse" 
          color="bg-slate-900" 
        />
        <KpiCard 
          title="Cash Balance" 
          value={formatCurrency(stats.ledgerBalance)} 
          icon={<Wallet size={20} />} 
          subtitle="Available liquid funds" 
          color="bg-amber-500" 
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue/Profit Trend */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Growth Trend</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Monthly Revenue vs Profit</p>
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-indigo-500 rounded-full"></div><span className="text-[10px] font-black uppercase">Revenue</span></div>
              <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div><span className="text-[10px] font-black uppercase">Profit</span></div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(val) => `Ksh ${val/1000}k`} />
                <Tooltip 
                   contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                   formatter={(value: number) => formatCurrency(value)} 
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={32} />
                <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={4} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Receivables Aging */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Debt Aging</h3>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-8">Uncollected Revenue Analysis</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingData} layout="vertical" margin={{left: 20}}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 800}} width={80} />
                <Tooltip 
                   cursor={{fill: '#f8fafc'}}
                   contentStyle={{borderRadius: '16px', border: 'none'}}
                   formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-3">
             {agingData.map((d, i) => (
               <div key={i} className="flex justify-between items-center text-xs">
                 <span className="font-bold text-slate-500">{d.name}</span>
                 <span className="font-black text-slate-900">{formatCurrency(d.value)}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Operational Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Profitable Products */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><ArrowUpRight size={20} /></div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Top Profitable Items</h3>
          </div>
          <div className="space-y-6">
            {topProfitableItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between group">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    {idx + 1}
                  </div>
                  <span className="font-bold text-slate-700">{item.name}</span>
                </div>
                <span className="font-black text-emerald-600">{formatCurrency(item.profit)}</span>
              </div>
            ))}
            {topProfitableItems.length === 0 && <p className="text-center py-10 text-slate-400 italic font-medium">Insufficient sales data</p>}
          </div>
        </div>

        {/* Slowest Payers */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl"><AlertCircle size={20} /></div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Slowest Settlements</h3>
          </div>
          <div className="space-y-6">
            {slowestPayers.map((s, idx) => (
              <div key={idx} className="flex flex-col space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">{s.name}</span>
                  <span className="text-xs font-black text-rose-600 uppercase bg-rose-50 px-2 py-1 rounded">Avg {s.avgDays.toFixed(0)} Days</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                  <span>Exposure</span>
                  <span>{formatCurrency(s.balance)}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-50 rounded-full mt-2">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, (s.balance / 100000) * 100)}%` }}></div>
                </div>
              </div>
            ))}
            {slowestPayers.length === 0 && <p className="text-center py-10 text-slate-400 italic font-medium">All schools are currently up-to-date</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
  icon: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, color, icon }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group overflow-hidden relative">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl ${color} text-white shadow-xl shadow-current/20`}>
        {icon}
      </div>
    </div>
    <div className="space-y-1 relative z-10">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
      <p className="text-[10px] text-slate-400 font-bold italic">{subtitle}</p>
    </div>
    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
  </div>
);

export default Dashboard;
