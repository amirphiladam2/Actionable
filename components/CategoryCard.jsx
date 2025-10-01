// components/CategoryCard/CategoryCard.js
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

const CategoryCard = ({ category, onPress, isSelected = false }) => {
  const { colors } = React.useContext(ThemeContext);
  const handlePress = () => onPress?.(category);

  return (
    <TouchableOpacity 
      style={styles.categoryCard} 
      onPress={handlePress}
      accessibilityLabel={`${category.name} category`}
      accessibilityRole="button"
    >
      <View style={[
        styles.categoryIcon, 
        { backgroundColor: category.color + '20' },
        isSelected && { backgroundColor: category.color }
      ]}>
        <Ionicons 
          name={category.icon} 
          size={24} 
          color={isSelected ? '#fff' : category.color} 
        />
      </View>
      <Text style={[
        styles.categoryName,
        { color: colors.muted },
        isSelected && { color: category.color, fontWeight: '700' }
      ]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  categoryCard: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 72,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CategoryCard;