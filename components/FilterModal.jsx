import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { TASK_CATEGORIES } from '../constants';
import { ThemeContext } from '../context/ThemeContext';

const FilterModal = ({ visible, onClose, onApplyFilters, currentFilters = {} }) => {
  const { colors } = React.useContext(ThemeContext);
  const [filters, setFilters] = useState({
    category: currentFilters.category || null,
    priority: currentFilters.priority || null,
    status: currentFilters.status || null,
    dateRange: currentFilters.dateRange || null,
    sortBy: currentFilters.sortBy || 'created_at',
    sortOrder: currentFilters.sortOrder || 'desc',
  });

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType] === value ? null : value
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClearAll = () => {
    setFilters({
      category: null,
      priority: null,
      status: null,
      dateRange: null,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== null && value !== 'created_at' && value !== 'desc'
  );

  const FilterOption = ({ title, options, selectedValue, onSelect, type = 'single' }) => (
    <View style={styles.filterSection}>
      <Text style={[styles.filterTitle, { color: colors.text }]}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterOption,
              { 
                backgroundColor: selectedValue === option.value ? colors.primary : colors.surface,
                borderColor: colors.border,
              }
            ]}
            onPress={() => onSelect(option.value)}
          >
            <Text style={[
              styles.filterOptionText,
              { 
                color: selectedValue === option.value ? '#fff' : colors.text 
              }
            ]}>
              {option.label}
            </Text>
            {selectedValue === option.value && (
              <Ionicons name="checkmark" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Filter Tasks</Text>
          <TouchableOpacity 
            onPress={handleApplyFilters} 
            style={[styles.headerButton, !hasActiveFilters && styles.disabledButton]}
            disabled={!hasActiveFilters}
          >
            <Text style={[
              styles.headerButtonText, 
              { color: hasActiveFilters ? colors.primary : colors.muted }
            ]}>
              Apply
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <FilterOption
            title="Category"
            options={[
              { label: 'All Categories', value: null },
              ...TASK_CATEGORIES.map(cat => ({ label: cat.name, value: cat.id }))
            ]}
            selectedValue={filters.category}
            onSelect={(value) => handleFilterChange('category', value)}
          />

          <FilterOption
            title="Priority"
            options={[
              { label: 'All Priorities', value: null },
              { label: 'High', value: 'high' },
              { label: 'Medium', value: 'medium' },
              { label: 'Low', value: 'low' },
            ]}
            selectedValue={filters.priority}
            onSelect={(value) => handleFilterChange('priority', value)}
          />

          <FilterOption
            title="Status"
            options={[
              { label: 'All Tasks', value: null },
              { label: 'Completed', value: 'completed' },
              { label: 'Pending', value: 'pending' },
            ]}
            selectedValue={filters.status}
            onSelect={(value) => handleFilterChange('status', value)}
          />

          <FilterOption
            title="Sort By"
            options={[
              { label: 'Date Created', value: 'created_at' },
              { label: 'Due Date', value: 'due_date' },
              { label: 'Priority', value: 'priority' },
              { label: 'Title', value: 'title' },
            ]}
            selectedValue={filters.sortBy}
            onSelect={(value) => handleFilterChange('sortBy', value)}
          />

          <FilterOption
            title="Sort Order"
            options={[
              { label: 'Newest First', value: 'desc' },
              { label: 'Oldest First', value: 'asc' },
            ]}
            selectedValue={filters.sortOrder}
            onSelect={(value) => handleFilterChange('sortOrder', value)}
          />
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.clearButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleClearAll}
          >
            <Ionicons name="refresh" size={20} color={colors.muted} />
            <Text style={[styles.clearButtonText, { color: colors.muted }]}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSection: {
    marginVertical: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FilterModal;
