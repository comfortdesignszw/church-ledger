export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  description: string;
  color: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category_id: string;
  payment_method: string;
  transaction_date: string;
  description: string;
  event_id: string | null;
  status: 'pending' | 'verified' | 'rejected';
  receipt_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface ChurchEvent {
  id: string;
  name: string;
  description: string;
  image_url: string;
  target_per_member: number;
  collection_goal: number;
  actual_collections: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'upcoming' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  member_id: string;
  created_at: string;
}

export interface Contribution {
  id: string;
  member_id: string;
  event_id: string;
  amount: number;
  contribution_date: string;
  status: 'pending' | 'verified' | 'processing';
  transaction_id: string | null;
  created_at: string;
  member?: Member;
  event?: ChurchEvent;
}

export interface BackupLog {
  id: string;
  backup_type: string;
  status: string;
  file_url: string | null;
  file_size: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_data: any;
  new_data: any;
  user_id: string;
  ip_address: string;
  created_at: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  incomeChange: number;
  expenseChange: number;
  lastMonthIncome: number;
  lastMonthExpenses: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

export interface CategoryDistribution {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}
