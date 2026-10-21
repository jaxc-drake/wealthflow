export type TransactionType = "income" | "expense";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          monthly_budget: number;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          monthly_budget?: number;
          currency?: string;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          monthly_budget?: number;
          currency?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: TransactionType;
          amount: number;
          category: string;
          description: string | null;
          source: string;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          type: TransactionType;
          amount: number;
          category: string;
          description?: string | null;
          source: string;
          date: string;
        };
        Update: {
          type?: TransactionType;
          amount?: number;
          category?: string;
          description?: string | null;
          source?: string;
          date?: string;
        };
      };
      export_logs: {
        Row: {
          id: string;
          user_id: string;
          export_year: number;
          exported_at: string;
        };
        Insert: {
          user_id: string;
          export_year: number;
        };
        Update: never;
      };
    };
  };
}

// App types
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  monthly_budget: number;
  currency: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string | null;
  source: string;
  date: string;
  created_at: string;
}

export type FinancialStatus = "healthy" | "warning" | "over_budget" | "loss";

export interface MonthlyStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  budget: number;
  budgetUsedPercent: number;
  remainingBudget: number;
  status: FinancialStatus;
}

export interface YearlyData {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
  percent: number;
}
