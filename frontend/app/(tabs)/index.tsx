import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useData } from '../context/DataContext';
import { AIInsights } from '../components/AIInsights';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CircularProgress } from '../components/CircularProgress';
import { WhatIfAnalysis } from '../components/WhatIfAnalysis';
import { generateAIInsights } from '../services/aiInsights';
import { fsiCalculator } from '../services/fsiCalculator';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const { obligations, profile, fsiBreakdown, loading } = useData();
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [aiInsightsProvider, setAiInsightsProvider] = useState<string | null>(null);
  const [aiInsightsError, setAiInsightsError] = useState<string | null>(null);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  const handleShareFSI = async () => {
    if (!fsiBreakdown || !profile) return;

    const riskCategory = fsiCalculator.getRiskCategory(fsiBreakdown.totalFSI);
    const totalObligations = obligations.reduce(
      (sum, obl) => sum + obl.monthlyAmount,
      0
    );
    const disposableIncome = profile.monthlyIncome - totalObligations;

    const message = `📊 My Financial Stability Index (FSI): ${fsiBreakdown.totalFSI}/100

Risk Category: ${riskCategory.label} ${getEmojiForRisk(riskCategory.label)}

💰 Monthly Income: ₹${profile.monthlyIncome.toLocaleString('en-IN')}
📝 Total Obligations: ₹${totalObligations.toLocaleString('en-IN')}
✨ Disposable Income: ₹${disposableIncome.toLocaleString('en-IN')}

Calculate your FSI: https://financial-risk-scan.preview.emergentagent.com

#FinancialHealth #StabilityScore`;

    try {
      await Share.share({
        message: message,
        title: 'My Financial Stability Index',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getEmojiForRisk = (label: string): string => {
    switch (label) {
      case 'Structurally Strong':
        return '🎉';
      case 'Stable':
        return '✅';
      case 'Sensitive':
        return '⚠️';
      case 'High Exposure':
        return '🔴';
      case 'Fragile':
        return '🚨';
      default:
        return '📊';
    }
  };

  const buildExpensePayload = () =>
    obligations.reduce<Record<string, number>>((accumulator, obligation) => {
      const key = obligation.category.toLowerCase().replace(/\s+/g, '_');
      accumulator[key] = (accumulator[key] || 0) + obligation.monthlyAmount;
      return accumulator;
    }, {});

  const handleGenerateAIInsights = async () => {
    if (!profile) {
      return;
    }

    try {
      setGeneratingInsights(true);
      setAiInsightsError(null);

      const result = await generateAIInsights({
        income: profile.monthlyIncome,
        expenses: buildExpensePayload(),
      });

      setAiInsights(result.insights);
      setAiInsightsProvider(result.provider ?? null);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      setAiInsights(null);
      setAiInsightsProvider(null);
      setAiInsightsError('AI insights unavailable.');
    } finally {
      setGeneratingInsights(false);
    }
  };

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
        <Text style={styles.title}>
          {profile?.lastName ? `Welcome, ${profile.lastName}` : 'Financial Stability'}
        </Text>
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
          
          {/* Share Button */}
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareFSI}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social" size={18} color="#3b82f6" />
            <Text style={styles.shareButtonText}>Share My FSI</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <Card style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="list" size={20} color="#3b82f6" />
          </View>
          <Text style={styles.statValue}>{obligations.length}</Text>
          <Text style={styles.statLabel}>Obligations</Text>
        </Card>

        <Card style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="trending-up" size={20} color="#10b981" />
          </View>
          <Text style={styles.statValue}>
            {disposableIncome >= 0 ? '+' : ''}{Math.round((disposableIncome / profile.monthlyIncome) * 100)}%
          </Text>
          <Text style={styles.statLabel}>Savings Rate</Text>
        </Card>

        <Card style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="shield-checkmark" size={20} color="#8b5cf6" />
          </View>
          <Text style={styles.statValue}>
            {totalObligations > 0 ? Math.round(profile.emergencySavings / totalObligations) : 0}x
          </Text>
          <Text style={styles.statLabel}>Coverage</Text>
        </Card>
      </View>

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

      <Card style={styles.aiActionCard}>
        <Text style={styles.aiActionTitle}>AI Financial Insights</Text>
        <Text style={styles.aiActionSubtitle}>
          Generate short spending tips based on your income and saved obligations.
        </Text>
        <Button
          title="Generate AI Insights"
          onPress={handleGenerateAIInsights}
          loading={generatingInsights}
        />
      </Card>

      <AIInsights
        insights={aiInsights}
        loading={generatingInsights}
        error={aiInsightsError}
        provider={aiInsightsProvider}
      />

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
  aiActionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  aiActionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  aiActionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
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
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 6,
    marginTop: 16,
  },
  shareButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});
