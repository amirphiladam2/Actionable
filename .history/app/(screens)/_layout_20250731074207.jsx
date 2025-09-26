// app/(screens)/_layout.js
import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { Redirect } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import CustomDrawer from '../../components/CustomDrawer';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function ScreenLayout() {
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: '#fff',
            width: 280,
          },
          drawerType: 'front',
          drawerPosition: 'left',
        }}
        drawerContent={(props) => <CustomDrawer {...props} />}
      >
      <Drawer.Screen 
        name="home" 
        options={{
          drawerLabel: 'Home',
          title: 'Home',
        }}
      />
      <Drawer.Screen 
        name="profile" 
        options={{
          drawerLabel: 'Profile',
          title: 'Profile',
        }}
      />
      <Drawer.Screen 
        name="notifications" 
        options={{
          drawerLabel: 'Notifications',
          title: 'Notifications',
        }}
      />
      <Drawer.Screen 
        name="privacy" 
        options={{
          drawerLabel: 'Privacy & Security',
          title: 'Privacy & Security',
        }}
      />
      <Drawer.Screen 
        name="settings" 
        options={{
          drawerLabel: 'Settings',
          title: 'Settings',
        }}
      />
      <Drawer.Screen 
        name="support" 
        options={{
          drawerLabel: 'Help & Support',
          title: 'Help & Support',
        }}
      />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});