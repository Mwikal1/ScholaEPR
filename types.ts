
export type LPOStatus = 'Pending' | 'Partial' | 'Completed';
export type ExpenseCategory = 'Rent' | 'Utilities' | 'Transport' | 'Salaries' | 'Misc';
export type TransactionType = 'Purchase' | 'Sale' | 'Expense' | 'Payment';

export interface School {
  id: string;
  name: string;
  creditLimit: number;
  principalName: string;
  phoneNumber: string;
  contactDetails: string; // Used for physical address/location
  totalInvoiced: number;
  totalPaid: number;
  outstandingBalance: number;
  paymentDaysHistory: number[]; // days it took for each payment
}

export interface LPOItem {
  id: string;
  itemName: string;
  quantityOrdered: number;
  quantityDelivered: number;
}

export interface LPO {
  id: string;
  schoolId: string;
  lpoNumber: string;
  dateReceived: string;
  items: LPOItem[];
  status: LPOStatus;
}

export interface InventoryBatch {
  id: string;
  itemName: string;
  size: string;
  supplier: string;
  purchasePrice: number;
  quantityProcured: number;
  quantityRemaining: number;
  procurementDate: string;
}

export interface InvoiceItem {
  id: string;
  itemName: string;
  batchId: string;
  quantity: number;
  sellingPrice: number;
  costPrice: number; // captured from batch at time of invoice
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  deliveryDate: string;
  schoolId: string;
  lpoId?: string;
  items: InvoiceItem[];
  extraCost: number;
  totalRevenue: number;
  totalCOGS: number;
  grossProfit: number;
  marginPercent: number;
  amountPaid: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: string;
  chequeDate?: string;
  bankName?: string;
  paymentDate: string;
}

export interface Expense {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  type: TransactionType;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface AIInsight {
  itemName: string;
  predictedDemand: number;
  suggestedReorder: number;
  estimatedStockoutDate: string;
  insight: string;
}
