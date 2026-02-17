
import React from 'react';
import { 
  LayoutDashboard, 
  School as SchoolIcon, 
  FileText, 
  Package, 
  Receipt, 
  CreditCard, 
  TrendingDown, 
  History, 
  Cpu 
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'schools', label: 'Schools', icon: <SchoolIcon size={20} /> },
  { id: 'lpos', label: 'LPOs', icon: <FileText size={20} /> },
  { id: 'inventory', label: 'Inventory', icon: <Package size={20} /> },
  { id: 'invoices', label: 'Invoicing', icon: <Receipt size={20} /> },
  { id: 'payments', label: 'Payments', icon: <CreditCard size={20} /> },
  { id: 'expenses', label: 'Expenses', icon: <TrendingDown size={20} /> },
  { id: 'ledger', label: 'Ledger', icon: <History size={20} /> },
  { id: 'ai', label: 'AI Insights', icon: <Cpu size={20} /> },
];

export const EXPENSE_CATEGORIES = ['Rent', 'Utilities', 'Transport', 'Salaries', 'Misc'];
