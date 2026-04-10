export type TransactionType = 'income' | 'expense';

export interface Transaction {
  _id: string;
  userId: string;
  type: TransactionType;
  source: string;
  amount: number;
  isPaid: boolean;
  isRecurring: boolean;
  dueDate: string;
  paidDate: string | null;
  period: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionSummary {
  income: { total: number; totalPaid: number; totalPending: number; count: number };
  expenses: { total: number; totalPaid: number; totalPending: number; count: number };
  balance: number;
  balancePaid: number;
}

export interface CreateTransaction {
  type: TransactionType;
  source: string;
  amount: number;
  isPaid?: boolean;
  isRecurring?: boolean;
  dueDate: string;
  paidDate?: string;
  period: string;
  notes?: string;
}
