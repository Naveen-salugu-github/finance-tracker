import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useData } from '../context/DataContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Obligation, ObligationCategory } from '../types';
import { Ionicons } from '@expo/vector-icons';

export default function ObligationsScreen() {
  const { obligations, addObligation, updateObligation, deleteObligation } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingObligation, setEditingObligation] = useState<Obligation | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'EMI' as ObligationCategory,
    monthlyAmount: '',
    dueDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories: ObligationCategory[] = ['EMI', 'Subscription', 'Insurance', 'Fixed Expense'];

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'EMI',
      monthlyAmount: '',
      dueDate: '',
    });
    setErrors({});
    setEditingObligation(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (obligation: Obligation) => {
    setFormData({
      name: obligation.name,
      category: obligation.category,
      monthlyAmount: obligation.monthlyAmount.toString(),
      dueDate: obligation.dueDate?.toString() || '',
    });
    setEditingObligation(obligation);
    setModalVisible(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    const amount = parseFloat(formData.monthlyAmount);
    if (!formData.monthlyAmount || isNaN(amount) || amount <= 0) {
      newErrors.monthlyAmount = 'Valid amount is required';
    }

    if (formData.dueDate) {
      const day = parseInt(formData.dueDate);
      if (isNaN(day) || day < 1 || day > 31) {
        newErrors.dueDate = 'Due date must be between 1 and 31';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const obligationData = {
        name: formData.name.trim(),
        category: formData.category,
        monthlyAmount: parseFloat(formData.monthlyAmount),
        dueDate: formData.dueDate ? parseInt(formData.dueDate) : undefined,
      };

      if (editingObligation) {
        await updateObligation(editingObligation.id, obligationData);
      } else {
        await addObligation(obligationData);
      }

      setModalVisible(false);
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to save obligation');
    }
  };

  const handleDelete = async (obligation: Obligation) => {
    try {
      await deleteObligation(obligation.id);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete obligation');
    }
  };

  const getCategoryIcon = (category: ObligationCategory) => {
    switch (category) {
      case 'EMI':
        return 'home-outline';
      case 'Subscription':
        return 'repeat-outline';
      case 'Insurance':
        return 'shield-checkmark-outline';
      case 'Fixed Expense':
        return 'receipt-outline';
      default:
        return 'document-outline';
    }
  };

  const getCategoryColor = (category: ObligationCategory) => {
    switch (category) {
      case 'EMI':
        return '#ef4444';
      case 'Subscription':
        return '#3b82f6';
      case 'Insurance':
        return '#10b981';
      case 'Fixed Expense':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Obligations</Text>
          <Text style={styles.subtitle}>
            {obligations.length} {obligations.length === 1 ? 'item' : 'items'}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Obligations List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {obligations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No Obligations Yet</Text>
            <Text style={styles.emptyText}>
              Add your monthly obligations to track your financial commitments
            </Text>
          </View>
        ) : (
          obligations.map((obligation) => (
            <Card key={obligation.id} style={styles.obligationCard}>
              <View style={styles.obligationContent}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: getCategoryColor(obligation.category) + '20' },
                  ]}
                >
                  <Ionicons
                    name={getCategoryIcon(obligation.category) as any}
                    size={24}
                    color={getCategoryColor(obligation.category)}
                  />
                </View>
                <View style={styles.obligationInfo}>
                  <Text style={styles.obligationName}>{obligation.name}</Text>
                  <Text style={styles.obligationCategory}>{obligation.category}</Text>
                  {obligation.dueDate && (
                    <Text style={styles.dueDate}>Due: Day {obligation.dueDate}</Text>
                  )}
                </View>
                <View style={styles.obligationActions}>
                  <Text style={styles.obligationAmount}>
                    ₹{obligation.monthlyAmount.toLocaleString('en-IN')}
                  </Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      onPress={() => openEditModal(obligation)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="pencil" size={18} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(obligation)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="trash" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Card>
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingObligation ? 'Edit Obligation' : 'Add Obligation'}
            </Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Input
              label="Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="e.g., Home Loan, Netflix, Car Insurance"
              error={errors.name}
            />

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      formData.category === category && styles.categoryButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, category })}
                  >
                    <Ionicons
                      name={getCategoryIcon(category) as any}
                      size={20}
                      color={
                        formData.category === category
                          ? '#ffffff'
                          : getCategoryColor(category)
                      }
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        formData.category === category && styles.categoryTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Input
              label="Monthly Amount (₹)"
              value={formData.monthlyAmount}
              onChangeText={(text) => setFormData({ ...formData, monthlyAmount: text })}
              placeholder="e.g., 5000"
              keyboardType="numeric"
              error={errors.monthlyAmount}
            />

            <Input
              label="Due Date (Optional)"
              value={formData.dueDate}
              onChangeText={(text) => setFormData({ ...formData, dueDate: text })}
              placeholder="Day of month (1-31)"
              keyboardType="numeric"
              error={errors.dueDate}
            />

            <Button title="Save" onPress={handleSave} />
            <View style={{ height: 32 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
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
  obligationCard: {
    marginBottom: 12,
  },
  obligationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  obligationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  obligationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  obligationCategory: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  dueDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  obligationActions: {
    alignItems: 'flex-end',
  },
  obligationAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cancelText: {
    fontSize: 16,
    color: '#3b82f6',
    width: 60,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
});
