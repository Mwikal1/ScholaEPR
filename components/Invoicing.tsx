
import React, { useState, useMemo } from 'react';
import { School, InventoryBatch, Invoice, InvoiceItem, LPO } from '../types';
import { 
  Plus, Trash2, AlertTriangle, CheckCircle2, 
  FileDown, Receipt, Search, Filter, 
  Package, Calendar, User
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoicingProps {
  schools: School[];
  inventory: InventoryBatch[];
  lpos: LPO[];
  invoices: Invoice[];
  onAdd: (invoice: Partial<Invoice>) => void;
}

const Invoicing: React.FC<InvoicingProps> = ({ schools, inventory, lpos, invoices, onAdd }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Creation Form State
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [selectedLpoId, setSelectedLpoId] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<Partial<InvoiceItem>[]>([]);
  const [extraCost, setExtraCost] = useState(0);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredInvoices = useMemo(() => {
    return [...invoices]
      .filter(inv => {
        const school = schools.find(s => s.id === inv.schoolId);
        return inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
               school?.name.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
  }, [invoices, schools, searchTerm]);

  const availableBatches = useMemo(() => 
    inventory.filter(b => b.quantityRemaining > 0),
  [inventory]);

  const schoolLpos = useMemo(() => 
    lpos.filter(l => l.schoolId === selectedSchoolId && l.status !== 'Completed'),
  [lpos, selectedSchoolId]);

  const totals = useMemo(() => {
    const revenue = invoiceItems.reduce((acc, item) => acc + ((item.sellingPrice || 0) * (item.quantity || 0)), 0) + extraCost;
    const cogs = invoiceItems.reduce((acc, item) => acc + ((item.costPrice || 0) * (item.quantity || 0)), 0);
    const profit = revenue - cogs;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    return { revenue, cogs, profit, margin };
  }, [invoiceItems, extraCost]);

  const handleAddItem = () => {
    setInvoiceItems([...invoiceItems, { id: Math.random().toString(), itemName: '', batchId: '', quantity: 0, sellingPrice: 0, costPrice: 0 }]);
  };

  const updateItem = (index: number, updates: Partial<InvoiceItem>) => {
    const newItems = [...invoiceItems];
    const updatedItem = { ...newItems[index], ...updates };
    
    if (updates.batchId) {
      const batch = inventory.find(b => b.id === updates.batchId);
      if (batch) {
        updatedItem.costPrice = batch.purchasePrice;
        updatedItem.itemName = batch.itemName;
        if (!updatedItem.sellingPrice) {
          updatedItem.sellingPrice = Math.round(batch.purchasePrice * 1.15);
        }
      }
    }
    
    newItems[index] = updatedItem;
    setInvoiceItems(newItems);
  };

  const removeItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    const school = schools.find(s => s.id === selectedSchoolId);
    if (!school) return;

    if (school.outstandingBalance + totals.revenue > school.creditLimit) {
      if (!confirm(`Warning: Outstanding balance will exceed Ksh ${school.creditLimit.toLocaleString()} limit. Proceed?`)) return;
    }

    onAdd({
      schoolId: selectedSchoolId,
      lpoId: selectedLpoId || undefined,
      items: invoiceItems as InvoiceItem[],
      extraCost,
      totalRevenue: totals.revenue,
      totalCOGS: totals.cogs,
      grossProfit: totals.profit,
      marginPercent: totals.margin,
      invoiceDate: invoiceDate,
      deliveryDate: invoiceDate,
      amountPaid: 0
    });
    
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedSchoolId('');
    setSelectedLpoId('');
    setInvoiceItems([]);
    setExtraCost(0);
    setInvoiceDate(new Date().toISOString().split('T')[0]);
  };

  const downloadInvoicePDF = (inv: Invoice) => {
    const school = schools.find(s => s.id === inv.schoolId);
    if (!school) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.setFont('Inter', 'bold');
    doc.text('SCHOLA ERP', 20, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text('SCHOOL SUPPLY DISTRIBUTION INTELLIGENCE', 20, 32);

    // Invoice Meta
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text(`INVOICE: ${inv.invoiceNumber}`, pageWidth - 70, 25);
    doc.setFontSize(10);
    doc.text(`DATE: ${inv.invoiceDate}`, pageWidth - 70, 32);
    doc.text(`STATUS: ${inv.amountPaid >= inv.totalRevenue ? 'PAID' : 'PENDING'}`, pageWidth - 70, 39);

    // Bill To Section
    doc.setDrawColor(241, 245, 249);
    doc.line(20, 45, pageWidth - 20, 45);

    doc.setFontSize(10);
    doc.setFont('Inter', 'bold');
    doc.text('BILL TO:', 20, 55);
    doc.setFont('Inter', 'normal');
    doc.text(`${school.name}`, 20, 62);
    doc.text(`Attn: ${school.principalName}`, 20, 68);
    doc.text(`${school.contactDetails}`, 20, 74);
    doc.text(`${school.phoneNumber}`, 20, 80);

    // Table
    const tableData = inv.items.map(item => [
      item.itemName,
      item.quantity.toString(),
      `Ksh ${item.sellingPrice.toLocaleString()}`,
      `Ksh ${(item.quantity * item.sellingPrice).toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 90,
      head: [['ITEM DESCRIPTION', 'QTY', 'UNIT PRICE', 'TOTAL']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 5 },
      columnStyles: {
        3: { halign: 'right' }
      }
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('Inter', 'bold');
    if (inv.extraCost > 0) {
      doc.text(`Logistics/Extra:`, pageWidth - 80, finalY);
      doc.text(`Ksh ${inv.extraCost.toLocaleString()}`, pageWidth - 20, finalY, { align: 'right' });
    }
    
    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229);
    doc.text(`GRAND TOTAL:`, pageWidth - 80, finalY + 10);
    doc.text(`Ksh ${inv.totalRevenue.toLocaleString()}`, pageWidth - 20, finalY + 10, { align: 'right' });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.setFont('Inter', 'italic');
    doc.text('Thank you for your business. Payment is due within school credit terms.', pageWidth / 2, pageWidth + 20, { align: 'center' });

    doc.save(`${inv.invoiceNumber}_${school.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Receipt className="text-indigo-600" />
            <span>Sales & Invoicing</span>
          </h3>
          <p className="text-slate-500 text-sm font-medium">Manage deliveries, margins and billing</p>
        </div>
        
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Invoice # or School..." 
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all font-bold shrink-0"
          >
            <Plus size={20} />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Inv No & Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Institution</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Performance</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Value (Ksh)</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => {
                const school = schools.find(s => s.id === inv.schoolId);
                const isLowMargin = inv.marginPercent < 10;
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900">{inv.invoiceNumber}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{inv.invoiceDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <Package size={16} />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{school?.name || 'Unknown School'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight ${
                          isLowMargin ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {inv.marginPercent.toFixed(1)}% Margin
                        </div>
                        {inv.amountPaid >= inv.totalRevenue ? (
                          <div className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight">Paid</div>
                        ) : (
                          <div className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight">Pending</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900 text-sm">
                      {inv.totalRevenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => downloadInvoicePDF(inv)}
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors tooltip relative group/btn"
                        title="Download PDF"
                      >
                        <FileDown size={18} />
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-bold">Download PDF</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Receipt size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="text-slate-400 font-medium italic">No sales invoices found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Smart Invoice Generator Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col animate-in zoom-in duration-300 overflow-hidden">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                  <Receipt size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Smart Invoice Generator</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-[0.2em] font-black">Distribution Engine v4.0</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-4xl transition-colors">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 bg-white">
              {/* Basic Setup */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Invoice Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="date"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Institution (Client)</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold appearance-none"
                    value={selectedSchoolId}
                    onChange={(e) => {
                      setSelectedSchoolId(e.target.value);
                      setSelectedLpoId('');
                    }}
                  >
                    <option value="">Choose School...</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Link LPO (Optional)</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold appearance-none disabled:opacity-30"
                    disabled={!selectedSchoolId}
                    value={selectedLpoId}
                    onChange={(e) => setSelectedLpoId(e.target.value)}
                  >
                    <option value="">Direct Delivery (No LPO)</option>
                    {schoolLpos.map(l => <option key={l.id} value={l.id}>{l.lpoNumber} (Open Items)</option>)}
                  </select>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                    <Package size={14} />
                    <span>Inventory Disbursement Items</span>
                  </h4>
                  <button 
                    onClick={handleAddItem}
                    className="flex items-center space-x-1 text-indigo-600 font-black text-[10px] uppercase hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Plus size={14} />
                    <span>Append Line Item</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {invoiceItems.map((item, idx) => (
                    <div key={item.id} className="grid grid-cols-12 gap-3 items-end p-5 bg-slate-50 border border-slate-100 rounded-3xl group relative hover:border-indigo-200 transition-all">
                      <div className="col-span-12 md:col-span-4">
                        <label className="block text-[9px] font-black text-slate-400 mb-1.5 uppercase">Batch Selection (Purchase Price | Stock)</label>
                        <select 
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold"
                          value={item.batchId}
                          onChange={(e) => updateItem(idx, { batchId: e.target.value })}
                        >
                          <option value="">Select Batch...</option>
                          {availableBatches.map(b => (
                            <option key={b.id} value={b.id}>
                              {b.itemName} ({b.size}) — Ksh {b.purchasePrice} | Qty: {b.quantityRemaining}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <label className="block text-[9px] font-black text-slate-400 mb-1.5 uppercase tracking-tighter">Quantity</label>
                        <input 
                          type="number"
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-black"
                          value={item.quantity || ''}
                          placeholder="0"
                          onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                        />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <label className="block text-[9px] font-black text-slate-400 mb-1.5 uppercase tracking-tighter">Selling Price (Unit)</label>
                        <input 
                          type="number"
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-black text-indigo-600"
                          value={item.sellingPrice || ''}
                          placeholder="0"
                          onChange={(e) => updateItem(idx, { sellingPrice: Number(e.target.value) })}
                        />
                      </div>
                      <div className="col-span-3 md:col-span-3">
                        <div className="flex flex-col">
                          <label className="block text-[9px] font-black text-slate-400 mb-1.5 uppercase tracking-tighter">Line Gross Profit</label>
                          <div className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center justify-between ${
                            (item.sellingPrice || 0) < (item.costPrice || 0) ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            <span>Ksh {((item.sellingPrice || 0) - (item.costPrice || 0)) * (item.quantity || 0)}</span>
                            {(item.sellingPrice || 0) < (item.costPrice || 0) && <AlertTriangle size={14} />}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-center pb-2">
                        <button onClick={() => removeItem(idx)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {invoiceItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
                      <Package size={40} className="text-slate-200 mb-3" />
                      <p className="text-slate-400 font-bold text-sm">Add items from your inventory to begin billing.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Extra Costs & Summary Alert */}
              <div className="flex flex-col md:flex-row gap-8 items-start pt-6 border-t border-slate-100">
                <div className="w-full md:w-64">
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Logistics / Extra Cost (Ksh)</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-black"
                    placeholder="0.00"
                    value={extraCost || ''}
                    onChange={(e) => setExtraCost(Number(e.target.value))}
                  />
                </div>
                
                {totals.margin < 10 && totals.revenue > 0 && (
                  <div className="flex-1 bg-rose-50 border border-rose-100 p-5 rounded-3xl flex items-center space-x-4 animate-bounce">
                    <div className="p-3 bg-rose-600 text-white rounded-2xl">
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <p className="text-rose-700 font-black text-sm uppercase tracking-tight">Low Margin Critical Alert!</p>
                      <p className="text-rose-500 text-xs font-bold mt-0.5">Your gross margin is below the 10% threshold ({totals.margin.toFixed(1)}%). Review pricing.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Analysis Footer */}
            <div className="p-10 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 w-full lg:w-auto">
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Revenue</p>
                  <p className="text-2xl font-black tracking-tight">Ksh {totals.revenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total COGS</p>
                  <p className="text-2xl font-black tracking-tight text-slate-400">Ksh {totals.cogs.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Gross Profit</p>
                  <p className={`text-2xl font-black tracking-tight ${totals.profit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    Ksh {totals.profit.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Net Margin</p>
                  <p className={`text-2xl font-black tracking-tight ${totals.margin < 10 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {totals.margin.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 w-full md:w-auto">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-6 py-4 text-slate-400 font-black uppercase tracking-widest text-xs hover:text-white transition-colors"
                >
                  Discard
                </button>
                <button 
                  onClick={handleCreate}
                  disabled={!selectedSchoolId || invoiceItems.length === 0}
                  className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.15em] transition-all shadow-2xl shadow-indigo-900/40 flex items-center justify-center space-x-3"
                >
                  <CheckCircle2 size={20} />
                  <span>Finalize & Post Invoice</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoicing;
