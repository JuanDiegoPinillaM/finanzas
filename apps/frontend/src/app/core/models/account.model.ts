export interface Account {
  _id: string;
  userId: string;
  name: string;
  amount: number;
  isRecurring: boolean;
  period: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountSummary {
  totalAmount: number;
  count: number;
}

export interface CreateAccount {
  name: string;
  amount: number;
  isRecurring?: boolean;
  period: string;
}
