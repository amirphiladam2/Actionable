// styles/AllUpcomingTasksStyles.js
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const allTasksStyles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 15,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Search and Filter Container
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginRight: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  searchIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 0,
  },

  clearSearchButton: {
    padding: 5,
    marginLeft: 5,
  },

  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  filterButtonActive: {
    backgroundColor: '#EBF4FF',
    borderColor: '#4A90E2',
  },

  // Active Filters
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#F59E0B',
  },

  activeFiltersText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500',
  },

  clearFiltersText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // Task List
  taskList: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  tasksContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },

  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 100,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },

  createTaskButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  createTaskButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Task Card Base Styles (if TaskCard doesn't have its own styles)
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },

  taskCardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },

  taskCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  taskCardContent: {
    flex: 1,
    marginRight: 15,
  },

  taskCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
    lineHeight: 24,
  },

  taskCardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },

  taskCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },

  taskCardDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  taskCardDateText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },

  taskCardTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  taskCardTimeText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },

  taskCardCategory: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#EBF4FF',
  },

  taskCardCategoryText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  taskCardPriority: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  taskCardPriorityHigh: {
    backgroundColor: '#FEE2E2',
  },

  taskCardPriorityMedium: {
    backgroundColor: '#FEF3C7',
  },

  taskCardPriorityLow: {
    backgroundColor: '#D1FAE5',
  },

  taskCardPriorityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  taskCardPriorityTextHigh: {
    color: '#DC2626',
  },

  taskCardPriorityTextMedium: {
    color: '#D97706',
  },

  taskCardPriorityTextLow: {
    color: '#059669',
  },

  taskCardActions: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },

  taskCardCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  taskCardCheckboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },

  taskCardMenu: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Completed Task Styles
  taskCardCompleted: {
    opacity: 0.7,
    backgroundColor: '#F9FAFB',
  },

  taskCardTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },

  // Overdue Task Styles
  taskCardOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },

  taskCardDateOverdue: {
    color: '#DC2626',
    fontWeight: '600',
  },

  // Responsive Design
  '@media (max-width: 375)': {
    headerTitle: {
      fontSize: 20,
    },
    taskCardTitle: {
      fontSize: 16,
    },
    searchContainer: {
      height: 44,
    },
    filterButton: {
      width: 44,
      height: 44,
    },
  },
});

// Helper function to get priority styles
export const getPriorityStyles = (priority) => {
  switch (priority) {
    case 'high':
      return {
        container: allTasksStyles.taskCardPriorityHigh,
        text: allTasksStyles.taskCardPriorityTextHigh,
      };
    case 'medium':
      return {
        container: allTasksStyles.taskCardPriorityMedium,
        text: allTasksStyles.taskCardPriorityTextMedium,
      };
    case 'low':
      return {
        container: allTasksStyles.taskCardPriorityLow,
        text: allTasksStyles.taskCardPriorityTextLow,
      };
    default:
      return {
        container: allTasksStyles.taskCardPriorityMedium,
        text: allTasksStyles.taskCardPriorityTextMedium,
      };
  }
};

// Animation configurations
export const animationConfig = {
  taskCard: {
    duration: 200,
    useNativeDriver: true,
  },
  search: {
    duration: 150,
    useNativeDriver: false,
  },
};

export default allTasksStyles;