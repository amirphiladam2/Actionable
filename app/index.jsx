import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from "expo-router"; // Added Redirect import
import React from 'react';
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { landingStyles } from '../styles/landingStyles';

const { width, height } = Dimensions.get('window');
    
export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth(); // Fixed destructuring syntax

  // Handle loading state
  if (loading) {
    return null; // Root layout will show loading spinner
  }

  // Handle authenticated user
  if (user) {
    return <Redirect href="/(screens)/home" />;
  }
  
  const handleGetStarted = () => {
    router.push('/auth/AuthScreen');
  };

  return (
    <SafeAreaView style={landingStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={landingStyles.contentWrapper}>
          {/* Header Section */}
          <View style={landingStyles.headerSection}>
            <View style={landingStyles.iconContainer}>
              <Text style={landingStyles.lightningIcon}>⚡</Text>
            </View>

            <Text style={landingStyles.appTitle}>
              <Text style={landingStyles.appTitleFirst}>Action</Text>
              <Text style={landingStyles.appTitleSecond}>able</Text>
            </Text>
            <Text style={landingStyles.tagline}>Turn Intentions Into Actions</Text>
          </View>

          {/* Main Content Card */}
          <View style={landingStyles.mainContent}>
            <View style={landingStyles.contentCard}>
              <Text style={landingStyles.heroSubtitle}>Simple task management for busy people</Text>

              {/* Feature Highlights */}
              <View style={landingStyles.featuresContainer}>
                <View style={landingStyles.featureItem}>
                  <View style={landingStyles.featureIconContainer}>
                    <Text style={landingStyles.featureIcon}>✓</Text>
                  </View>
                  <Text style={landingStyles.featureText}>Task Management</Text>
                </View>
                <View style={landingStyles.featureItem}>
                  <View style={landingStyles.featureIconContainer}>
                    <Text style={landingStyles.featureIcon}>📊</Text>
                  </View>
                  <Text style={landingStyles.featureText}>Progress Tracking</Text>
                </View>
                <View style={landingStyles.featureItem}>
                  <View style={landingStyles.featureIconContainer}>
                    <Text style={landingStyles.featureIcon}>🎯</Text>
                  </View>
                  <Text style={landingStyles.featureText}>Goal Achievement</Text>
                </View>
              </View>

              {/* Progress Indicator */}
              <View style={landingStyles.progressSection}>
                <View style={landingStyles.progressCircle}>
                  <Text style={landingStyles.progressText}>75%</Text>
                </View>
                <Text style={landingStyles.progressLabel}>Daily Progress</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={landingStyles.actionContainer}>
            <TouchableOpacity
              style={landingStyles.primaryButton}
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#06b6d4', '#0891b2']}
                style={landingStyles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={landingStyles.primaryButtonText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20, 
  },
});