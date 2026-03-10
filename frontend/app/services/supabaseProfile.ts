import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types';
import type { IncomeType } from '../types';

const TABLE = 'profiles';

export type SupabaseProfileRow = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  monthly_income: number;
  emergency_savings: number;
  income_type: string;
  created_at?: string;
  updated_at?: string;
};

function rowToProfile(row: SupabaseProfileRow): UserProfile {
  return {
    monthlyIncome: Number(row.monthly_income) || 0,
    emergencySavings: Number(row.emergency_savings) || 0,
    incomeType: (row.income_type as IncomeType) || 'Salaried',
    firstName: row.first_name ?? undefined,
    lastName: row.last_name ?? undefined,
  };
}

function profileToRow(profile: UserProfile, userId: string, email: string | undefined): Partial<SupabaseProfileRow> {
  return {
    id: userId,
    email: email ?? null,
    first_name: profile.firstName ?? null,
    last_name: profile.lastName ?? null,
    monthly_income: profile.monthlyIncome,
    emergency_savings: profile.emergencySavings,
    income_type: profile.incomeType,
    updated_at: new Date().toISOString(),
  };
}

export const supabaseProfile = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', userId)
      .single();
    if (error || !data) return null;
    return rowToProfile(data as SupabaseProfileRow);
  },

  async upsertProfile(userId: string, email: string | undefined, profile: UserProfile): Promise<void> {
    const row = profileToRow(profile, userId, email);
    const { error } = await supabase.from(TABLE).upsert(row, {
      onConflict: 'id',
    });
    if (error) throw error;
  },
};
