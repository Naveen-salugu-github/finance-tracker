import { supabase } from '../lib/supabase';
import type { Obligation, ObligationCategory } from '../types';

const TABLE = 'obligations';

export type SupabaseObligationRow = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  monthly_amount: number;
  due_date: number | null;
  created_at?: string;
};

function rowToObligation(row: SupabaseObligationRow): Obligation {
  return {
    id: row.id,
    name: row.name,
    category: row.category as ObligationCategory,
    monthlyAmount: Number(row.monthly_amount) || 0,
    dueDate: row.due_date ?? undefined,
  };
}

function obligationToRow(obl: Obligation, userId: string): Partial<SupabaseObligationRow> {
  return {
    id: obl.id,
    user_id: userId,
    name: obl.name,
    category: obl.category,
    monthly_amount: obl.monthlyAmount,
    due_date: obl.dueDate ?? null,
  };
}

export const supabaseObligations = {
  async getObligations(userId: string): Promise<Obligation[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) return [];
    return (data || []).map((row) => rowToObligation(row as SupabaseObligationRow));
  },

  async saveObligations(userId: string, obligations: Obligation[]): Promise<void> {
    if (obligations.length === 0) {
      await supabase.from(TABLE).delete().eq('user_id', userId);
      return;
    }
    const rows = obligations.map((obl) => obligationToRow(obl, userId));
    const { error: deleteErr } = await supabase.from(TABLE).delete().eq('user_id', userId);
    if (deleteErr) console.error('Error clearing obligations:', deleteErr);
    const { error: insertErr } = await supabase.from(TABLE).insert(rows);
    if (insertErr) throw insertErr;
  },
};
