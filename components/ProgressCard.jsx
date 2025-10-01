// components/ProgressCard/ProgressCard.js
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { calculateProgress } from '../utils/taskUtils';

const ProgressCard = ({ tasks, title = "Today's Progress", subtitle = "Keep up the great work!" }) => {
  const { completed, total, percentage } = calculateProgress(tasks);
  const { colors } = React.useContext(ThemeContext);

  return (
    <View style={[styles.progressCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.progressHeader}>
        <View>
          <Text style={[styles.progressTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.progressSubtitle, { color: colors.muted }]}>{subtitle}</Text>
        </View>
        <View style={styles.progressStats}>
          <Text style={[styles.progressNumber, { color: colors.text }]}>{completed}</Text>
          <Text style={[styles.progressTotal, { color: colors.muted }]}>/{total}</Text>
        </View>
      </View>
      <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
        <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: colors.primary }]} />
      </View>
      <Text style={[styles.progressPercent, { color: colors.primary }]}>{percentage}% Complete</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  progressCard: {
    borderRadius: 16,
    marginTop: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 12,
    borderWidth: 1,
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
  },
  progressSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  progressNumber: {
    fontSize: 32,
    fontWeight: '800',
  },
  progressTotal: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
});

export default ProgressCard;