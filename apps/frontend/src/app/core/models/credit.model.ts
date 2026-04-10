export interface Credit {
  _id: string;
  userId: string;
  location: string;
  amount: number;
  type: string;
  period: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditSummary {
  totalAmount: number;
  count: number;
}

export interface CreateCredit {
  location: string;
  amount: number;
  type: string;
  period: string;
}
