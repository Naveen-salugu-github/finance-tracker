import AsyncStorage from '@react-native-async-storage/async-storage';
import { Obligation, UserProfile } from '../types';

const OBLIGATIONS_KEY = '@stabilityScore_obligations';
const PROFILE_KEY = '@stabilityScore_profile';

export const storageService = {
  // Obligations
  async getObligations(): Promise<Obligation[]> {
    try {
      const data = await AsyncStorage.getItem(OBLIGATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading obligations:', error);
      return [];
    }
  },

  async saveObligations(obligations: Obligation[]): Promise<void> {
    try {
      await AsyncStorage.setItem(OBLIGATIONS_KEY, JSON.stringify(obligations));
    } catch (error) {
      console.error('Error saving obligations:', error);
      throw error;
    }
  },

  // User Profile
  async getProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(PROFILE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading profile:', error);
      return null;
    }
  },

  async saveProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  },
};
