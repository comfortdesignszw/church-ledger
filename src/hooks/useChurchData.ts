import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Transaction, 
  Category, 
  ChurchEvent, 
  Member, 
  Contribution,
  DashboardStats,
  MonthlyData,
  CategoryDistribution
} from '../types';

export const useChurchData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        transactionsRes,
        categoriesRes,
        eventsRes,
        membersRes,
        contributionsRes
      ] = await Promise.all([
        supabase.from('transactions').select('*').order('transaction_date', { ascending: false }),
        supabase.from('categories').select('*'),
        supabase.from('events').select('*').order('created_at', { ascending: false }),
        supabase.from('members').select('*'),
        supabase.from('contributions').select('*').order('contribution_date', { ascending: false })
      ]);

      if (transactionsRes.error) throw transactionsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (eventsRes.error) throw eventsRes.error;
      if (membersRes.error) throw membersRes.error;
      if (contributionsRes.error) throw contributionsRes.error;

      setTransactions(transactionsRes.data || []);
      setCategories(categoriesRes.data || []);
      setEvents(eventsRes.data || []);
      setMembers(membersRes.data || []);
      setContributions(contributionsRes.data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Add transaction
  const addTransaction = async (data: Partial<Transaction>) => {
    try {
      const { data: newTransaction, error } = await supabase
        .from('transactions')
        .insert([{
          ...data,
          status: 'pending',
          created_by: 'Admin'
        }])
        .select()
        .single();

      if (error) throw error;
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err: any) {
      console.error('Error adding transaction:', err);
      throw err;
    }
  };

  // Update transaction
  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    try {
      const { data: updated, error } = await supabase
        .from('transactions')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setTransactions(prev => prev.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err: any) {
      console.error('Error updating transaction:', err);
      throw err;
    }
  };

  // Delete transaction
  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      console.error('Error deleting transaction:', err);
      throw err;
    }
  };

  // Verify transaction
  const verifyTransaction = async (id: string) => {
    return updateTransaction(id, { status: 'verified' });
  };

  // Add event
  const addEvent = async (data: Partial<ChurchEvent>) => {
    try {
      const { data: newEvent, error } = await supabase
        .from('events')
        .insert([{
          ...data,
          actual_collections: 0
        }])
        .select()
        .single();

      if (error) throw error;
      setEvents(prev => [newEvent, ...prev]);
      return newEvent;
    } catch (err: any) {
      console.error('Error adding event:', err);
      throw err;
    }
  };

  // Add member
  const addMember = async (name: string) => {
    try {
      const { data: newMember, error } = await supabase
        .from('members')
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;
      setMembers(prev => [...prev, newMember]);
      return newMember;
    } catch (err: any) {
      console.error('Error adding member:', err);
      throw err;
    }
  };

  // Add contribution
  const addContribution = async (data: {
    member_id?: string;
    member_name?: string;
    event_id: string;
    amount: number;
    contribution_date: string;
    payment_method: string;
  }) => {
    try {
      let memberId = data.member_id;

      // Create new member if needed
      if (!memberId && data.member_name) {
        const newMember = await addMember(data.member_name);
        memberId = newMember.id;
      }

      // Create contribution
      const { data: newContribution, error: contribError } = await supabase
        .from('contributions')
        .insert([{
          member_id: memberId,
          event_id: data.event_id,
          amount: data.amount,
          contribution_date: data.contribution_date,
          status: 'verified'
        }])
        .select()
        .single();

      if (contribError) throw contribError;

      // Update event actual_collections
      const event = events.find(e => e.id === data.event_id);
      if (event) {
        await supabase
          .from('events')
          .update({ actual_collections: event.actual_collections + data.amount })
          .eq('id', data.event_id);

        setEvents(prev => prev.map(e => 
          e.id === data.event_id 
            ? { ...e, actual_collections: e.actual_collections + data.amount }
            : e
        ));
      }

      // Also create a transaction for this contribution
      const incomeCategory = categories.find(c => c.type === 'income' && c.name === 'Special Events');
      if (incomeCategory) {
        await addTransaction({
          type: 'income',
          amount: data.amount,
          category_id: incomeCategory.id,
          payment_method: data.payment_method,
          transaction_date: data.contribution_date,
          description: `Contribution for ${event?.name || 'Event'}`,
          event_id: data.event_id
        });
      }

      setContributions(prev => [newContribution, ...prev]);
      return newContribution;
    } catch (err: any) {
      console.error('Error adding contribution:', err);
      throw err;
    }
  };

  // Calculate dashboard stats
  const getDashboardStats = useCallback((): DashboardStats => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const thisMonthTransactions = transactions.filter(t => {
      const date = new Date(t.transaction_date);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });

    const lastMonthTransactions = transactions.filter(t => {
      const date = new Date(t.transaction_date);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });

    const totalIncome = thisMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = thisMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthIncome = lastMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthExpenses = lastMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const incomeChange = lastMonthIncome > 0 
      ? ((totalIncome - lastMonthIncome) / lastMonthIncome) * 100 
      : totalIncome > 0 ? 100 : 0;

    const expenseChange = lastMonthExpenses > 0 
      ? ((totalExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
      : totalExpenses > 0 ? 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      incomeChange,
      expenseChange,
      lastMonthIncome,
      lastMonthExpenses
    };
  }, [transactions]);

  // Get monthly trend data
  const getMonthlyData = useCallback((months: number = 6): MonthlyData[] => {
    const data: MonthlyData[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.transaction_date);
        return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
      });

      data.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        income: monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        expenses: monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
      });
    }

    return data;
  }, [transactions]);

  // Get category distribution
  const getCategoryDistribution = useCallback((): CategoryDistribution[] => {
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const total = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

    if (total === 0) return [];

    const categoryTotals: { [key: string]: number } = {};
    incomeTransactions.forEach(t => {
      categoryTotals[t.category_id] = (categoryTotals[t.category_id] || 0) + t.amount;
    });

    return Object.entries(categoryTotals)
      .map(([categoryId, amount]) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          name: category?.name || 'Unknown',
          amount,
          percentage: Math.round((amount / total) * 100),
          color: category?.color || '#6B7280'
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions, categories]);

  // Backup data
  const backupData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('backup-data');
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error backing up data:', err);
      throw err;
    }
  };

  // Restore data
  const restoreData = async (backupData: any) => {
    // This would restore data from a backup file
    // For now, just refresh the data
    await fetchData();
  };

  return {
    // Data
    transactions,
    categories,
    events,
    members,
    contributions,
    loading,
    error,

    // Actions
    fetchData,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    verifyTransaction,
    addEvent,
    addMember,
    addContribution,
    backupData,
    restoreData,

    // Computed
    getDashboardStats,
    getMonthlyData,
    getCategoryDistribution
  };
};
