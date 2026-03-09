import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';

interface AIInsightsProps {
  insights?: string | null;
  loading?: boolean;
  error?: string | null;
}

function parseInsightLines(insights?: string | null): string[] {
  if (!insights) {
    return [];
  }

  const lines = insights
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*•]\s*/, ''));

  return lines.length > 0 ? lines : [insights.trim()];
}

export const AIInsights: React.FC<AIInsightsProps> = ({ insights, loading, error }) => {
  const items = parseInsightLines(insights);

  if (!loading && !error && items.length === 0) {
    return null;
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <Ionicons name="sparkles-outline" size={20} color="#8b5cf6" />
        </View>
        <Text style={styles.title}>AI Insights</Text>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Analyzing your finances...</Text>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.list}>
          {items.map((item, index) => (
            <View key={`${item}-${index}`} style={styles.listItem}>
              <Text style={styles.bullet}>{'\u2022'}</Text>
              <Text style={styles.insightText}>{item}</Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  list: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 18,
    color: '#8b5cf6',
    marginRight: 10,
    lineHeight: 24,
  },
  insightText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
  },
  loadingText: {
    fontSize: 15,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 15,
    color: '#ef4444',
  },
});
