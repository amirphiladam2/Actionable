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
  // Profile Header
  profileHeader: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 16,
    marginHorizontal: isSmallScreen ? 8 : 0,
    borderRadius: isSmallScreen ? 12 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '600',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#06b6d4',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileUsername: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  joinDate: {
    fontSize: 14,
    color: '#9ca3af',
  },

  // Bio Section
  bioSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 16,
    marginHorizontal: isSmallScreen ? 8 : 0,
    borderRadius: isSmallScreen ? 12 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  bioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  editIconButton: {
    padding: 4,
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  bioEmpty: {
    color: '#9ca3af',
    fontStyle: 'italic',
  },

  // Section Styles
  contactSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    marginBottom: 16,
    marginHorizontal: isSmallScreen ? 8 : 0,
    borderRadius: isSmallScreen ? 12 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  accountSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    marginHorizontal: isSmallScreen ? 8 : 0,
    borderRadius: isSmallScreen ? 12 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },

  // Info Card Styles
  infoCard: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoCardEditable: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    marginVertical: 2,
    paddingHorizontal: 12,
    borderBottomWidth: 0,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 32,
  },
  infoValueEmpty: {
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  infoValueMultiline: {
    lineHeight: 22,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalSaveButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#06b6d4',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1f2937',
    textAlignVertical: 'top',
  },
  modalInputMultiline: {
    height: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'right',
  },
});
