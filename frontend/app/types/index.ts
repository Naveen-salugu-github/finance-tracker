export type ObligationCategory = 'EMI' | 'Subscription' | 'Insurance' | 'Fixed Expense';

export type IncomeType = 'Salaried' | 'Business' | 'Freelance';

export interface Obligation {
  id: string;
  name: string;
  category: ObligationCategory;
  monthlyAmount: number;
  dueDate?: number; // Day of month (1-31)
}

export interface UserProfile {
  monthlyIncome: number;
  emergencySavings: number;
  incomeType: IncomeType;
}

export interface FSIBreakdown {
  obligationScore: number;
  liquidityScore: number;
  emiScore: number;
  incomeScore: number;
  totalFSI: number;
}

export interface RiskCategory {
  label: string;
  color: string;
  range: string;
}
