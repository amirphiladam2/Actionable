// components/LoadingScreen.js
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

export const LoadingScreen = ({ text }) => {
  const { colors } = React.useContext(ThemeContext);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.loadingText, { color: colors.text }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
});
