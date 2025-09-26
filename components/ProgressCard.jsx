// components/ProgressCard/ProgressCard.js
import React from 'react'; 
import { View, Text ,StyleSheet} from 'react-native';
import { calculateProgress } from '../utils/taskUtils';

const ProgressCard = ({ tasks, title = "Today's Progress", subtitle = "Keep up the great work!" }) => {
  const { completed, total, percentage } = calculateProgress(tasks);

  return (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <View>
          <Text style={styles.progressTitle}>{title}</Text>
          <Text style={styles.progressSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.progressStats}>
          <Text style={styles.progressNumber}>{completed}</Text>
          <Text style={styles.progressTotal}>/{total}</Text>
        </View>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.progressPercent}>{percentage}% Complete</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginTop: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  progressNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
  },
  progressTotal: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#06b6d4',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 12,
    color: '#06b6d4',
    fontWeight: '600',
    textAlign: 'right',
  },
});

export default ProgressCard;