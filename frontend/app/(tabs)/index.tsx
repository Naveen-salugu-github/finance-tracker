import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useData } from '../context/DataContext';
import { Card } from '../components/Card';
import { CircularProgress } from '../components/CircularProgress';
import { WhatIfAnalysis } from '../components/WhatIfAnalysis';
import { fsiCalculator } from '../services/fsiCalculator';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const { obligations, profile, fsiBreakdown, loading } = useData();
  const [showWhatIf, setShowWhatIf] = useState(false);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!profile || profile.monthlyIncome === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="person-outline" size={64} color="#9ca3af" />
        <Text style={styles.emptyTitle}>Set Up Your Profile</Text>
        <Text style={styles.emptyText}>
          Go to the Profile tab to enter your financial information
        </Text>
      </View>
    );
  }

  const totalObligations = obligations.reduce(
    (sum, obl) => sum + obl.monthlyAmount,
    0
  );
  const disposableIncome = profile.monthlyIncome - totalObligations;
  const riskCategory = fsiBreakdown
    ? fsiCalculator.getRiskCategory(fsiBreakdown.totalFSI)
    : { label: 'Unknown', color: '#6b7280', range: '0-0' };

  return (
    <>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Financial Stability</Text>
        <Text style={styles.subtitle}>Your complete financial overview</Text>
      </View>

      {/* What-If Analysis Button */}
      {profile && profile.monthlyIncome > 0 && (
        <TouchableOpacity
          style={styles.whatIfButton}
          onPress={() => setShowWhatIf(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="analytics-outline" size={20} color="#ffffff" />
          <Text style={styles.whatIfButtonText}>What-If Analysis</Text>
          <Ionicons name="sparkles" size={16} color="#fbbf24" />
        </TouchableOpacity>
      )}

      {/* FSI Score Card */}
      <Card style={styles.fsiCard}>
        <View style={styles.fsiContent}>
          <CircularProgress
            size={180}
            strokeWidth={16}
            progress={fsiBreakdown?.totalFSI || 0}
            color={riskCategory.color}
          />
          <View style={styles.fsiInfo}>
            <Text style={[styles.riskLabel, { color: riskCategory.color }]}>
              {riskCategory.label}
            </Text>
            <Text style={styles.riskRange}>Score Range: {riskCategory.range}</Text>
          </View>
        </View>
      </Card>

      {/* Financial Summary */}
      <View style={styles.summaryGrid}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Monthly Income</Text>
          <Text style={styles.summaryValue}>
            ₹{profile.monthlyIncome.toLocaleString('en-IN')}
          </Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Obligations</Text>
          <Text style={[styles.summaryValue, { color: '#ef4444' }]}>
            ₹{totalObligations.toLocaleString('en-IN')}
          </Text>
        </Card>
      </View>

      <Card style={styles.summaryCardFull}>
        <Text style={styles.summaryLabel}>Disposable Income</Text>
        <Text
          style={[
            styles.summaryValueLarge,
            { color: disposableIncome >= 0 ? '#10b981' : '#ef4444' },
          ]}
        >
          ₹{disposableIncome.toLocaleString('en-IN')}
        </Text>
      </Card>

      {/* Score Breakdown */}
      {fsiBreakdown && (
        <Card style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Score Breakdown</Text>
          
          <View style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Text style={styles.breakdownLabel}>Obligation Pressure</Text>
              <Text style={styles.breakdownWeight}>(35%)</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${fsiBreakdown.obligationScore}%`,
                    backgroundColor: getScoreColor(fsiBreakdown.obligationScore),
                  },
                ]}
              />
            </View>
            <Text style={styles.breakdownScore}>
              {fsiBreakdown.obligationScore}/100
            </Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Text style={styles.breakdownLabel}>Liquidity Coverage</Text>
              <Text style={styles.breakdownWeight}>(30%)</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${fsiBreakdown.liquidityScore}%`,
                    backgroundColor: getScoreColor(fsiBreakdown.liquidityScore),
                  },
                ]}
              />
            </View>
            <Text style={styles.breakdownScore}>
              {fsiBreakdown.liquidityScore}/100
            </Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Text style={styles.breakdownLabel}>EMI Concentration</Text>
              <Text style={styles.breakdownWeight}>(20%)</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${fsiBreakdown.emiScore}%`,
                    backgroundColor: getScoreColor(fsiBreakdown.emiScore),
                  },
                ]}
              />
            </View>
            <Text style={styles.breakdownScore}>
              {fsiBreakdown.emiScore}/100
            </Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Text style={styles.breakdownLabel}>Income Stability</Text>
              <Text style={styles.breakdownWeight}>(15%)</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${fsiBreakdown.incomeScore}%`,
                    backgroundColor: getScoreColor(fsiBreakdown.incomeScore),
                  },
                ]}
              />
            </View>
            <Text style={styles.breakdownScore}>
              {fsiBreakdown.incomeScore}/100
            </Text>
          </View>
        </Card>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>

    {/* What-If Analysis Modal */}
    <WhatIfAnalysis visible={showWhatIf} onClose={() => setShowWhatIf(false)} />
  </>
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 65) return '#34d399';
  if (score >= 50) return '#fbbf24';
  if (score >= 35) return '#f97316';
  return '#ef4444';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
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
  fsiCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  fsiContent: {
    alignItems: 'center',
  },
  fsiInfo: {
    alignItems: 'center',
    marginTop: 24,
  },
  riskLabel: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  riskRange: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  summaryGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
  },
  summaryCardFull: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  summaryValueLarge: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  breakdownCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  breakdownItem: {
    marginBottom: 20,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  breakdownWeight: {
    fontSize: 12,
    color: '#9ca3af',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'right',
  },
  whatIfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  whatIfButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
