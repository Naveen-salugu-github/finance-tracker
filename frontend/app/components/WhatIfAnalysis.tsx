import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from './Input';
import { Button } from './Button';
import { Card } from './Card';
import { CircularProgress } from './CircularProgress';
import { Obligation, ObligationCategory, UserProfile, IncomeType } from '../types';
import { fsiCalculator } from '../services/fsiCalculator';
import { useData } from '../context/DataContext';

interface WhatIfAnalysisProps {
  visible: boolean;
  onClose: () => void;
}

export const WhatIfAnalysis: React.FC<WhatIfAnalysisProps> = ({ visible, onClose }) => {
  const { obligations, profile, fsiBreakdown } = useData();
  const [scenarioType, setScenarioType] = useState<'obligation' | 'income' | 'savings'>('obligation');
  const [newObligation, setNewObligation] = useState({
    name: '',
    category: 'EMI' as ObligationCategory,
    amount: '',
  });
  const [incomeChange, setIncomeChange] = useState('');
  const [savingsChange, setSavingsChange] = useState('');

  const categories: ObligationCategory[] = ['EMI', 'Subscription', 'Insurance', 'Fixed Expense'];

  const calculatePredictedFSI = () => {
    if (!profile) return null;

    let modifiedObligations = [...obligations];
    let modifiedProfile = { ...profile };

    // Apply scenario changes
    if (scenarioType === 'obligation' && newObligation.name && newObligation.amount) {
      const amount = parseFloat(newObligation.amount);
      if (!isNaN(amount) && amount > 0) {
        modifiedObligations = [
          ...obligations,
          {
            id: 'temp-whatif',
            name: newObligation.name,
            category: newObligation.category,
            monthlyAmount: amount,
          },
        ];
      }
    } else if (scenarioType === 'income' && incomeChange) {
      const change = parseFloat(incomeChange);
      if (!isNaN(change)) {
        modifiedProfile.monthlyIncome = Math.max(0, profile.monthlyIncome + change);
      }
    } else if (scenarioType === 'savings' && savingsChange) {
      const change = parseFloat(savingsChange);
      if (!isNaN(change)) {
        modifiedProfile.emergencySavings = Math.max(0, profile.emergencySavings + change);
      }
    }

    return fsiCalculator.calculateFSI(modifiedObligations, modifiedProfile);
  };

  const predictedBreakdown = calculatePredictedFSI();
  const currentFSI = fsiBreakdown?.totalFSI || 0;
  const predictedFSI = predictedBreakdown?.totalFSI || currentFSI;
  const fsiDifference = predictedFSI - currentFSI;

  const currentRisk = fsiCalculator.getRiskCategory(currentFSI);
  const predictedRisk = fsiCalculator.getRiskCategory(predictedFSI);

  const resetScenario = () => {
    setNewObligation({ name: '', category: 'EMI', amount: '' });
    setIncomeChange('');
    setSavingsChange('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>What-If Analysis</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Scenario Type Selector */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Choose Scenario</Text>
            <View style={styles.scenarioButtons}>
              <TouchableOpacity
                style={[
                  styles.scenarioButton,
                  scenarioType === 'obligation' && styles.scenarioButtonActive,
                ]}
                onPress={() => {
                  setScenarioType('obligation');
                  resetScenario();
                }}
              >
                <Ionicons
                  name="receipt-outline"
                  size={24}
                  color={scenarioType === 'obligation' ? '#ffffff' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.scenarioButtonText,
                    scenarioType === 'obligation' && styles.scenarioButtonTextActive,
                  ]}
                >
                  Add Obligation
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.scenarioButton,
                  scenarioType === 'income' && styles.scenarioButtonActive,
                ]}
                onPress={() => {
                  setScenarioType('income');
                  resetScenario();
                }}
              >
                <Ionicons
                  name="trending-up-outline"
                  size={24}
                  color={scenarioType === 'income' ? '#ffffff' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.scenarioButtonText,
                    scenarioType === 'income' && styles.scenarioButtonTextActive,
                  ]}
                >
                  Change Income
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.scenarioButton,
                  scenarioType === 'savings' && styles.scenarioButtonActive,
                ]}
                onPress={() => {
                  setScenarioType('savings');
                  resetScenario();
                }}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={24}
                  color={scenarioType === 'savings' ? '#ffffff' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.scenarioButtonText,
                    scenarioType === 'savings' && styles.scenarioButtonTextActive,
                  ]}
                >
                  Change Savings
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Input Forms */}
          <Card style={styles.card}>
            {scenarioType === 'obligation' && (
              <>
                <Text style={styles.sectionTitle}>Hypothetical Obligation</Text>
                <Input
                  label="Name"
                  value={newObligation.name}
                  onChangeText={(text) => setNewObligation({ ...newObligation, name: text })}
                  placeholder="e.g., New Car Loan"
                />
                <View style={styles.categoryGrid}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        newObligation.category === category && styles.categoryChipActive,
                      ]}
                      onPress={() => setNewObligation({ ...newObligation, category })}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          newObligation.category === category && styles.categoryChipTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Input
                  label="Monthly Amount (₹)"
                  value={newObligation.amount}
                  onChangeText={(text) => setNewObligation({ ...newObligation, amount: text })}
                  placeholder="e.g., 15000"
                  keyboardType="numeric"
                />
              </>
            )}

            {scenarioType === 'income' && (
              <>
                <Text style={styles.sectionTitle}>Income Change</Text>
                <Text style={styles.helperText}>
                  Enter positive number for increase, negative for decrease
                </Text>
                <Input
                  label="Change Amount (₹)"
                  value={incomeChange}
                  onChangeText={setIncomeChange}
                  placeholder="e.g., +10000 or -5000"
                  keyboardType="numeric"
                />
              </>
            )}

            {scenarioType === 'savings' && (
              <>
                <Text style={styles.sectionTitle}>Savings Change</Text>
                <Text style={styles.helperText}>
                  Enter positive number for increase, negative for decrease
                </Text>
                <Input
                  label="Change Amount (₹)"
                  value={savingsChange}
                  onChangeText={setSavingsChange}
                  placeholder="e.g., +50000 or -20000"
                  keyboardType="numeric"
                />
              </>
            )}
          </Card>

          {/* Results Comparison */}
          {predictedBreakdown && (
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Impact Analysis</Text>
              
              <View style={styles.comparisonContainer}>
                {/* Current FSI */}
                <View style={styles.fsiColumn}>
                  <Text style={styles.fsiLabel}>Current</Text>
                  <CircularProgress
                    size={120}
                    strokeWidth={12}
                    progress={currentFSI}
                    color={currentRisk.color}
                  />
                  <Text style={[styles.riskLabel, { color: currentRisk.color }]}>
                    {currentRisk.label}
                  </Text>
                </View>

                {/* Arrow */}
                <View style={styles.arrowContainer}>
                  <Ionicons
                    name="arrow-forward"
                    size={32}
                    color={fsiDifference >= 0 ? '#10b981' : '#ef4444'}
                  />
                  <Text
                    style={[
                      styles.changeText,
                      { color: fsiDifference >= 0 ? '#10b981' : '#ef4444' },
                    ]}
                  >
                    {fsiDifference >= 0 ? '+' : ''}{fsiDifference.toFixed(0)}
                  </Text>
                </View>

                {/* Predicted FSI */}
                <View style={styles.fsiColumn}>
                  <Text style={styles.fsiLabel}>Predicted</Text>
                  <CircularProgress
                    size={120}
                    strokeWidth={12}
                    progress={predictedFSI}
                    color={predictedRisk.color}
                  />
                  <Text style={[styles.riskLabel, { color: predictedRisk.color }]}>
                    {predictedRisk.label}
                  </Text>
                </View>
              </View>

              {/* Impact Message */}
              <View
                style={[
                  styles.impactMessage,
                  { backgroundColor: fsiDifference >= 0 ? '#d1fae5' : '#fee2e2' },
                ]}
              >
                <Ionicons
                  name={fsiDifference >= 0 ? 'trending-up' : 'trending-down'}
                  size={20}
                  color={fsiDifference >= 0 ? '#10b981' : '#ef4444'}
                />
                <Text
                  style={[
                    styles.impactMessageText,
                    { color: fsiDifference >= 0 ? '#065f46' : '#991b1b' },
                  ]}
                >
                  {fsiDifference >= 0
                    ? `This scenario improves your FSI by ${Math.abs(fsiDifference).toFixed(0)} points!`
                    : `This scenario decreases your FSI by ${Math.abs(fsiDifference).toFixed(0)} points.`}
                </Text>
              </View>

              {/* Component Breakdown */}
              <View style={styles.breakdownSection}>
                <Text style={styles.breakdownTitle}>Score Components</Text>
                
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Obligation Pressure</Text>
                  <View style={styles.breakdownValues}>
                    <Text style={styles.breakdownValue}>{fsiBreakdown?.obligationScore}</Text>
                    <Ionicons name="arrow-forward" size={16} color="#9ca3af" />
                    <Text
                      style={[
                        styles.breakdownValue,
                        {
                          color:
                            predictedBreakdown.obligationScore >= (fsiBreakdown?.obligationScore || 0)
                              ? '#10b981'
                              : '#ef4444',
                        },
                      ]}
                    >
                      {predictedBreakdown.obligationScore}
                    </Text>
                  </View>
                </View>

                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Liquidity Coverage</Text>
                  <View style={styles.breakdownValues}>
                    <Text style={styles.breakdownValue}>{fsiBreakdown?.liquidityScore}</Text>
                    <Ionicons name="arrow-forward" size={16} color="#9ca3af" />
                    <Text
                      style={[
                        styles.breakdownValue,
                        {
                          color:
                            predictedBreakdown.liquidityScore >= (fsiBreakdown?.liquidityScore || 0)
                              ? '#10b981'
                              : '#ef4444',
                        },
                      ]}
                    >
                      {predictedBreakdown.liquidityScore}
                    </Text>
                  </View>
                </View>

                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>EMI Concentration</Text>
                  <View style={styles.breakdownValues}>
                    <Text style={styles.breakdownValue}>{fsiBreakdown?.emiScore}</Text>
                    <Ionicons name="arrow-forward" size={16} color="#9ca3af" />
                    <Text
                      style={[
                        styles.breakdownValue,
                        {
                          color:
                            predictedBreakdown.emiScore >= (fsiBreakdown?.emiScore || 0)
                              ? '#10b981'
                              : '#ef4444',
                        },
                      ]}
                    >
                      {predictedBreakdown.emiScore}
                    </Text>
                  </View>
                </View>

                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Income Stability</Text>
                  <View style={styles.breakdownValues}>
                    <Text style={styles.breakdownValue}>{fsiBreakdown?.incomeScore}</Text>
                    <Ionicons name="arrow-forward" size={16} color="#9ca3af" />
                    <Text
                      style={[
                        styles.breakdownValue,
                        {
                          color:
                            predictedBreakdown.incomeScore >= (fsiBreakdown?.incomeScore || 0)
                              ? '#10b981'
                              : '#ef4444',
                        },
                      ]}
                    >
                      {predictedBreakdown.incomeScore}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  scenarioButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  scenarioButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    gap: 6,
  },
  scenarioButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  scenarioButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  scenarioButtonTextActive: {
    color: '#ffffff',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  categoryChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  comparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 20,
  },
  fsiColumn: {
    alignItems: 'center',
  },
  fsiLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  riskLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  arrowContainer: {
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 18,
    fontWeight: '700',
  },
  impactMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  impactMessageText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  breakdownSection: {
    marginTop: 24,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  breakdownValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
});
