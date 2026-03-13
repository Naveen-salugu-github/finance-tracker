import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Obligation, UserProfile, FSIBreakdown } from '../types';
import { storageService } from '../services/storage';
import { supabaseProfile } from '../services/supabaseProfile';
import { supabaseObligations } from '../services/supabaseObligations';
import { fsiCalculator } from '../services/fsiCalculator';
import { notificationService } from '../services/notifications';
import { useAuth } from './AuthContext';

interface DataContextType {
  obligations: Obligation[];
  profile: UserProfile | null;
  fsiBreakdown: FSIBreakdown | null;
  loading: boolean;
  addObligation: (obligation: Omit<Obligation, 'id'>) => Promise<void>;
  updateObligation: (id: string, updates: Partial<Obligation>) => Promise<void>;
  deleteObligation: (id: string) => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  resetFinancialData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fsiBreakdown, setFsiBreakdown] = useState<FSIBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const remote = await supabaseProfile.getProfile(session.user.id);
        if (!cancelled && remote) {
          setProfile((prev) => {
            const base = prev || { monthlyIncome: 0, emergencySavings: 0, incomeType: 'Salaried' as const };
            const merged: UserProfile = {
              monthlyIncome: remote.monthlyIncome,
              emergencySavings: remote.emergencySavings,
              incomeType: remote.incomeType,
              firstName: remote.firstName ?? base.firstName,
              lastName: remote.lastName ?? base.lastName,
            };
            storageService.saveProfile(merged).catch(console.error);
            return merged;
          });
        }
      } catch (e) {
        console.error('Error loading Supabase profile:', e);
      }
    })();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const remoteObligations = await supabaseObligations.getObligations(session.user.id);
        if (cancelled) return;
        if (remoteObligations.length > 0) {
          setObligations(remoteObligations);
          await storageService.saveObligations(remoteObligations);
        } else {
          const localObligations = await storageService.getObligations();
          if (localObligations.length > 0) {
            await supabaseObligations.upsertObligations(session.user.id, localObligations);
          }
        }
      } catch (e) {
        console.error('Error loading Supabase obligations:', e);
      }
    })();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  useEffect(() => {
    if (profile && obligations.length >= 0) {
      const breakdown = fsiCalculator.calculateFSI(obligations, profile);
      setFsiBreakdown(breakdown);
    }
  }, [obligations, profile]);

  const requestNotificationPermissions = async () => {
    await notificationService.requestPermissions();
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [loadedObligations, loadedProfile] = await Promise.all([
        storageService.getObligations(),
        storageService.getProfile(),
      ]);

      setObligations(loadedObligations);
      setProfile(loadedProfile || {
        monthlyIncome: 0,
        emergencySavings: 0,
        incomeType: 'Salaried',
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  const addObligation = async (obligation: Omit<Obligation, 'id'>) => {
    try {
      const newObligation: Obligation = {
        ...obligation,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };
      
      const updatedObligations = [...obligations, newObligation];
      await storageService.saveObligations(updatedObligations);
      setObligations(updatedObligations);
      if (session?.user?.id) {
        await supabaseObligations.upsertObligation(session.user.id, newObligation);
      }
      
      // Schedule notification if due date is set
      if (newObligation.dueDate) {
        await notificationService.scheduleObligationNotification(newObligation);
      }
    } catch (error) {
      console.error('Error adding obligation:', error);
      throw error;
    }
  };

  const updateObligation = async (id: string, updates: Partial<Obligation>) => {
    try {
      const updatedObligations = obligations.map(obl =>
        obl.id === id ? { ...obl, ...updates } : obl
      );
      await storageService.saveObligations(updatedObligations);
      setObligations(updatedObligations);
      if (session?.user?.id) {
        const updatedObligation = updatedObligations.find((obl) => obl.id === id);
        if (updatedObligation) {
          await supabaseObligations.upsertObligation(session.user.id, updatedObligation);
        }
      }
      
      // Update notification
      const updatedObligation = updatedObligations.find(obl => obl.id === id);
      if (updatedObligation?.dueDate) {
        await notificationService.scheduleObligationNotification(updatedObligation);
      } else if (updatedObligation) {
        await notificationService.cancelObligationNotification(id);
      }
    } catch (error) {
      console.error('Error updating obligation:', error);
      throw error;
    }
  };

  const deleteObligation = async (id: string) => {
    try {
      const updatedObligations = obligations.filter(obl => obl.id !== id);
      await storageService.saveObligations(updatedObligations);
      setObligations(updatedObligations);
      if (session?.user?.id) {
        await supabaseObligations.deleteObligation(session.user.id, id);
      }
      
      // Cancel notification
      await notificationService.cancelObligationNotification(id);
    } catch (error) {
      console.error('Error deleting obligation:', error);
      throw error;
    }
  };

  const updateProfile = async (newProfile: UserProfile) => {
    try {
      await storageService.saveProfile(newProfile);
      setProfile(newProfile);
      if (session?.user) {
        await supabaseProfile.upsertProfile(
          session.user.id,
          session.user.email ?? undefined,
          newProfile
        );
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const resetFinancialData = async () => {
    const emptyProfile: UserProfile = {
      monthlyIncome: 0,
      emergencySavings: 0,
      incomeType: 'Salaried',
      firstName: undefined,
      lastName: undefined,
    };
    const currentObligations = obligations;

    await storageService.saveProfile(emptyProfile);
    await storageService.saveObligations([]);
    setProfile(emptyProfile);
    setObligations([]);

    // Clear scheduled notifications for old obligations
    await Promise.all(
      currentObligations.map((obl) => notificationService.cancelObligationNotification(obl.id))
    );

    if (session?.user) {
      await supabaseProfile.upsertProfile(
        session.user.id,
        session.user.email ?? undefined,
        emptyProfile
      );
      await supabaseObligations.clearObligations(session.user.id);
    }
  };

  return (
    <DataContext.Provider
      value={{
        obligations,
        profile,
        fsiBreakdown,
        loading,
        addObligation,
        updateObligation,
        deleteObligation,
        updateProfile,
        resetFinancialData,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
