import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;
const isSmallScreen = screenWidth < 375;

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  updatingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f9ff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e7ff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  scrollContentTablet: {
    paddingBottom: 48,
    paddingHorizontal: isTablet ? Math.max(20, (screenWidth - 600) / 2) : 0,
  },