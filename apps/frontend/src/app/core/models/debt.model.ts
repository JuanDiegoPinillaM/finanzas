export type DebtType = 'debtor' | 'creditor';

export interface Debt {
  _id: string;
  userId: string;
  type: DebtType;
  name: string;
  amount: number;
  description: string | null;
  period: string;
  createdAt: string;
  updatedAt: string;
}

export interface DebtSummary {
  debtors: { totalAmount: number; count: number };
  creditors: { totalAmount: number; count: number };
}

export interface CreateDebt {
  type: DebtType;
  name: string;
  amount: number;
  description?: string;
  period: string;
}
