import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { RegisteredToast } from '../components/RegisteredToast';
import { IncomeType } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useData();
  const { signOut, guestMode, clearGuestMode } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    monthlyIncome: '',
    emergencySavings: '',
    incomeType: 'Salaried' as IncomeType,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showRegisteredToast, setShowRegisteredToast] = useState(false);

  const incomeTypes: IncomeType[] = ['Salaried', 'Business', 'Freelance'];

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        monthlyIncome: profile.monthlyIncome > 0 ? profile.monthlyIncome.toString() : '',
        emergencySavings: profile.emergencySavings > 0 ? profile.emergencySavings.toString() : '',
        incomeType: profile.incomeType,
      });
    }
  }, [profile]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const income = parseFloat(formData.monthlyIncome);
    if (!formData.monthlyIncome || isNaN(income) || income <= 0) {
      newErrors.monthlyIncome = 'Valid monthly income is required';
    }

    const savings = parseFloat(formData.emergencySavings);
    if (formData.emergencySavings && (isNaN(savings) || savings < 0)) {
      newErrors.emergencySavings = 'Valid savings amount is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      await updateProfile({
        firstName: formData.firstName.trim() || undefined,
        lastName: formData.lastName.trim() || undefined,
        monthlyIncome: parseFloat(formData.monthlyIncome),
        emergencySavings: formData.emergencySavings ? parseFloat(formData.emergencySavings) : 0,
        incomeType: formData.incomeType,
      });
      setShowRegisteredToast(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Profile',
      'Are you sure you want to reset your profile? This will clear all your financial information.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateProfile({
                monthlyIncome: 0,
                emergencySavings: 0,
                incomeType: 'Salaried',
              });
              setFormData({
                firstName: '',
                lastName: '',
                monthlyIncome: '',
                emergencySavings: '',
                incomeType: 'Salaried',
              });
              Alert.alert('Success', 'Profile has been reset');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset profile');
            }
          },
        },
      ]
    );
  };

  const getIncomeTypeIcon = (type: IncomeType) => {
    switch (type) {
      case 'Salaried':
        return 'briefcase-outline';
      case 'Business':
        return 'business-outline';
      case 'Freelance':
        return 'laptop-outline';
      default:
        return 'cash-outline';
    }
  };

  const getIncomeTypeColor = (type: IncomeType) => {
    switch (type) {
      case 'Salaried':
        return '#10b981';
      case 'Business':
        return '#3b82f6';
      case 'Freelance':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getIncomeTypeDescription = (type: IncomeType) => {
    switch (type) {
      case 'Salaried':
        return 'Stability Score: 90/100';
      case 'Business':
        return 'Stability Score: 70/100';
      case 'Freelance':
        return 'Stability Score: 50/100';
      default:
        return '';
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Financial Profile</Text>
          <Text style={styles.subtitle}>Your financial information</Text>
        </View>

        <View style={styles.content}>
          {/* Name */}
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBadge}>
                <Ionicons name="person-outline" size={24} color="#8b5cf6" />
              </View>
              <Text style={styles.cardTitle}>Name</Text>
            </View>
            <Input
              label="First name"
              value={formData.firstName}
              onChangeText={(text) => setFormData({ ...formData, firstName: text })}
              placeholder="First name"
            />
            <Input
              label="Last name"
              value={formData.lastName}
              onChangeText={(text) => setFormData({ ...formData, lastName: text })}
              placeholder="Last name"
            />
          </Card>

          {/* Monthly Income */}
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBadge}>
                <Ionicons name="wallet-outline" size={24} color="#10b981" />
              </View>
              <Text style={styles.cardTitle}>Monthly Income</Text>
            </View>
            <Input
              label="Amount (₹)"
              value={formData.monthlyIncome}
              onChangeText={(text) => setFormData({ ...formData, monthlyIncome: text })}
              placeholder="e.g., 50000"
              keyboardType="numeric"
              error={errors.monthlyIncome}
            />
          </Card>

          {/* Emergency Savings */}
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBadge}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.cardTitle}>Emergency Savings</Text>
            </View>
            <Input
              label="Total Savings (₹)"
              value={formData.emergencySavings}
              onChangeText={(text) => setFormData({ ...formData, emergencySavings: text })}
              placeholder="e.g., 100000"
              keyboardType="numeric"
              error={errors.emergencySavings}
            />
            <Text style={styles.helperText}>
              Ideally 6-12 months of expenses for financial security
            </Text>
          </Card>

          {/* Income Type */}
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBadge}>
                <Ionicons name="trending-up-outline" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.cardTitle}>Income Type</Text>
            </View>
            <View style={styles.incomeTypeContainer}>
              {incomeTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.incomeTypeCard,
                    formData.incomeType === type && styles.incomeTypeCardActive,
                    { borderColor: getIncomeTypeColor(type) },
                  ]}
                  onPress={() => setFormData({ ...formData, incomeType: type })}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.incomeTypeIcon,
                      {
                        backgroundColor:
                          formData.incomeType === type
                            ? getIncomeTypeColor(type)
                            : getIncomeTypeColor(type) + '20',
                      },
                    ]}
                  >
                    <Ionicons
                      name={getIncomeTypeIcon(type) as any}
                      size={28}
                      color={
                        formData.incomeType === type ? '#ffffff' : getIncomeTypeColor(type)
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.incomeTypeName,
                      formData.incomeType === type && styles.incomeTypeNameActive,
                    ]}
                  >
                    {type}
                  </Text>
                  <Text style={styles.incomeTypeDescription}>
                    {getIncomeTypeDescription(type)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <Button title="Save Profile" onPress={handleSave} loading={saving} />
          </View>

          {/* Reset Profile Button */}
          {profile && profile.monthlyIncome > 0 && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh-outline" size={20} color="#ef4444" />
                <Text style={styles.resetButtonText}>Reset Profile</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Sign out */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={() => {
                Alert.alert(
                  guestMode ? 'Leave guest mode' : 'Sign out',
                  guestMode ? 'You will need to sign in or skip again to return.' : 'Are you sure?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: guestMode ? 'Leave' : 'Sign out',
                      style: 'destructive',
                      onPress: async () => {
                        if (guestMode) {
                          await clearGuestMode();
                          router.replace('/login');
                        } else {
                          await signOut();
                          if (typeof window !== 'undefined') {
                            window.location.pathname = '/login';
                          }
                        }
                      },
                    },
                  ]
                );
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={20} color="#6b7280" />
              <Text style={styles.signOutButtonText}>
                {guestMode ? 'Leave guest mode' : 'Sign out'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      <RegisteredToast
        visible={showRegisteredToast}
        onHide={() => setShowRegisteredToast(false)}
        message="You're registered!"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: -8,
  },
  incomeTypeContainer: {
    gap: 12,
  },
  incomeTypeCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  incomeTypeCardActive: {
    backgroundColor: '#f9fafb',
  },
  incomeTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  incomeTypeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  incomeTypeNameActive: {
    color: '#1f2937',
  },
  incomeTypeDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  buttonContainer: {
    marginTop: 8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#ef4444',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  resetButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  signOutButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
});
