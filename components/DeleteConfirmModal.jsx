import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

const DeleteConfirmModal = ({ 
  visible, 
  onClose, 
  onConfirm, 
  taskTitle = 'this task',
  isPermanent = false 
}) => {
  const { colors } = React.useContext(ThemeContext);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.error + '20' }]}>
            <Ionicons name="trash-outline" size={32} color={colors.error} />
          </View>
          
          <Text style={[styles.title, { color: colors.text }]}>
            {isPermanent ? 'Delete Task Permanently?' : 'Delete Task?'}
          </Text>
          
          <Text style={[styles.message, { color: colors.muted }]}>
            {isPermanent 
              ? `Are you sure you want to permanently delete "${taskTitle}"? This action cannot be undone.`
              : `Are you sure you want to delete "${taskTitle}"?`
            }
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.deleteButton, { backgroundColor: colors.error }]}
              onPress={handleConfirm}
            >
              <Ionicons name="trash" size={16} color="#fff" />
              <Text style={[styles.buttonText, styles.deleteButtonText, { color: '#fff' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 6,
  },
  cancelButton: {
    borderWidth: 1,
  },
  deleteButton: {
    // backgroundColor set dynamically
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#fff',
  },
});

export default DeleteConfirmModal;
