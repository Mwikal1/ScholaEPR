
import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Schools from './components/Schools';
import Inventory from './components/Inventory';
import Invoicing from './components/Invoicing';
import Ledger from './components/Ledger';
import AIInsights from './components/AIInsights';
import LPOs from './components/LPOs';
import Payments from './components/Payments';
import Expenses from './components/Expenses';
import { 
  School, LPO, InventoryBatch, Invoice, Payment, Expense, LedgerEntry 
} from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Firestore State
  const [schools, setSchools] = useState<School[]>([]);
  const [lpos, setLpos] = useState<LPO[]>([]);
  const [inventory, setInventory] = useState<InventoryBatch[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);

  // Real-time Data Subscriptions
  useEffect(() => {
    setLoading(true);

    const unsubSchools = onSnapshot(collection(db, "schools"), (snapshot) => {
      setSchools(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School)));
    }, (error) => console.error("Schools Permission Error:", error));

    const unsubInventory = onSnapshot(collection(db, "inventory"), (snapshot) => {
      setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryBatch)));
    }, (error) => console.error("Inventory Permission Error:", error));

    const unsubLPOs = onSnapshot(collection(db, "lpos"), (snapshot) => {
      setLpos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LPO)));
    }, (error) => console.error("LPOs Permission Error:", error));

    const unsubInvoices = onSnapshot(collection(db, "invoices"), (snapshot) => {
      setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice)));
    }, (error) => console.error("Invoices Permission Error:", error));

    const unsubPayments = onSnapshot(collection(db, "payments"), (snapshot) => {
      setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment)));
    }, (error) => console.error("Payments Permission Error:", error));

    const unsubExpenses = onSnapshot(collection(db, "expenses"), (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
    }, (error) => console.error("Expenses Permission Error:", error));

    const unsubLedger = onSnapshot(query(collection(db, "ledger"), orderBy("date", "asc")), (snapshot) => {
      setLedger(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LedgerEntry)));
      setLoading(false);
    }, (error) => {
      console.error("Ledger Permission Error:", error);
      setLoading(false);
    });

    return () => {
      unsubSchools();
      unsubInventory();
      unsubLPOs();
      unsubInvoices();
      unsubPayments();
      unsubExpenses();
      unsubLedger();
    };
  }, []);

  const addLedgerEntry = async (type: string, reference: string, debit: number, credit: number) => {
    const currentBalance = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0;
    const newEntry = {
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp(),
      type,
      reference,
      debit,
      credit,
      balance: currentBalance + credit - debit
    };
    await addDoc(collection(db, "ledger"), newEntry);
  };

  const handleAddSchool = async (s: Partial<School>) => {
    const newSchool = {
      ...s,
      totalInvoiced: 0,
      totalPaid: 0,
      outstandingBalance: 0,
      paymentDaysHistory: []
    };
    await addDoc(collection(db, "schools"), newSchool);
  };

  const handleProcure = async (batch: Partial<InventoryBatch>) => {
    const newBatch = { ...batch, quantityRemaining: batch.quantityProcured };
    await addDoc(collection(db, "inventory"), newBatch);
    await addLedgerEntry('Purchase', `Procurement: ${batch.supplier} - ${batch.itemName}`, (batch.quantityProcured || 0) * (batch.purchasePrice || 0), 0);
  };

  const handleAddLPO = async (lpo: Partial<LPO>) => {
    await addDoc(collection(db, "lpos"), lpo);
  };

  const handleAddPayment = async (p: Partial<Payment>) => {
    await addDoc(collection(db, "payments"), p);

    const invoice = invoices.find(inv => inv.id === p.invoiceId);
    let targetSchoolId = invoice?.schoolId;

    if (targetSchoolId) {
      const school = schools.find(s => s.id === targetSchoolId);
      if (school) {
        await updateDoc(doc(db, "schools", school.id), {
          totalPaid: school.totalPaid + (p.amount || 0),
          outstandingBalance: school.outstandingBalance - (p.amount || 0)
        });
      }
    }

    if (invoice) {
      await updateDoc(doc(db, "invoices", invoice.id), {
        amountPaid: invoice.amountPaid + (p.amount || 0)
      });
    }

    const schoolObj = schools.find(sch => sch.id === targetSchoolId);
    await addLedgerEntry('Payment', `Received: ${schoolObj?.name || 'School Settlement'}`, 0, p.amount || 0);
  };

  const handleAddInvoice = async (inv: Partial<Invoice>) => {
    const invoiceNumber = `INV-${Math.floor(Math.random()*10000).toString().padStart(4, '0')}`;
    const invoiceData = { ...inv, invoiceNumber };
    await addDoc(collection(db, "invoices"), invoiceData);
    
    // Update Inventory
    for (const item of (inv.items || [])) {
      const batch = inventory.find(b => b.id === item.batchId);
      if (batch) {
        await updateDoc(doc(db, "inventory", batch.id), {
          quantityRemaining: Math.max(0, batch.quantityRemaining - item.quantity)
        });
      }
    }

    // Update LPO Status if linked
    if (inv.lpoId) {
      const lpo = lpos.find(l => l.id === inv.lpoId);
      if (lpo) {
        const updatedItems = lpo.items.map(lItem => {
          const deliveredInThisInvoice = inv.items?.find(i => i.itemName === lItem.itemName);
          if (deliveredInThisInvoice) {
            return { ...lItem, quantityDelivered: lItem.quantityDelivered + deliveredInThisInvoice.quantity };
          }
          return lItem;
        });
        const allCompleted = updatedItems.every(item => item.quantityDelivered >= item.quantityOrdered);
        await updateDoc(doc(db, "lpos", lpo.id), {
          items: updatedItems,
          status: allCompleted ? 'Completed' : 'Partial'
        });
      }
    }

    // Update School
    const school = schools.find(s => s.id === inv.schoolId);
    if (school) {
      await updateDoc(doc(db, "schools", school.id), {
        totalInvoiced: (school.totalInvoiced || 0) + (inv.totalRevenue || 0),
        outstandingBalance: (school.outstandingBalance || 0) + (inv.totalRevenue || 0)
      });
    }

    await addLedgerEntry('Sale', `Invoice: ${invoiceNumber}`, 0, inv.totalRevenue || 0);
  };

  const handleAddExpense = async (exp: Partial<Expense>) => {
    await addDoc(collection(db, "expenses"), exp);
    await addLedgerEntry('Expense', `${exp.category}: ${exp.name}`, exp.amount || 0, 0);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Connecting to ScholaERP Cloud...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard schools={schools} invoices={invoices} expenses={expenses} inventory={inventory} ledger={ledger} />;
      case 'schools': return <Schools schools={schools} onAdd={handleAddSchool} />;
      case 'inventory': return <Inventory inventory={inventory} onProcure={handleProcure} />;
      case 'lpos': return <LPOs schools={schools} lpos={lpos} onAdd={handleAddLPO} />;
      case 'invoices': return <Invoicing schools={schools} inventory={inventory} lpos={lpos} invoices={invoices} onAdd={handleAddInvoice} />;
      case 'payments': return <Payments schools={schools} invoices={invoices} payments={payments} onAdd={handleAddPayment} />;
      case 'ledger': return <Ledger entries={ledger} />;
      case 'ai': return <AIInsights invoices={invoices} inventory={inventory} />;
      case 'expenses': return <Expenses expenses={expenses} onAdd={handleAddExpense} />;
      default: return <div className="p-20 text-center text-slate-400">Section Under Development</div>;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
