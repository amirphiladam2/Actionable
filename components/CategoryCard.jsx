// components/CategoryCard/CategoryCard.js
import React from 'react';
import { TouchableOpacity, View, Text ,StyleSheet} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CategoryCard = ({ category, onPress, isSelected = false }) => {
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
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default CategoryCard;