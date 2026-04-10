export type InvestmentType = 'cdt' | 'currency';

export interface Investment {
  _id: string;
  userId: string;
  type: InvestmentType;
  name: string;
  value: number;
  monthlyReturn: number | null;
  annualReturn: number | null;
  valueCOP: number | null;
  exchangeRate: number | null;
  period: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentSummary {
  cdts: { totalValue: number; totalMonthlyReturn: number; totalAnnualReturn: number; count: number };
  currencies: { totalValue: number; totalValueCOP: number; count: number };
}

export interface CreateInvestment {
  type: InvestmentType;
  name: string;
  value: number;
  monthlyReturn?: number;
  annualReturn?: number;
  valueCOP?: number;
  exchangeRate?: number;
  period: string;
}
