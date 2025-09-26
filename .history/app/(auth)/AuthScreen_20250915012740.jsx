import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthStyles from "../../styles/AuthStyles";
import { useRouter } from "expo-router";
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { authService } from '../../services/authService';

WebBrowser.maybeCompleteAuthSession();
const { width } = Dimensions.get("window");

const AuthScreen = () => {
  // State management
  const [activeTab, setActiveTab] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [initializing, setInitializing] = useState(true);
  
  // Separate form data for each tab
  const [signinData, setSigninData] = useState({
    email: '',
    password: ''
  });
  
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    terms: false
  });

  const router = useRouter();
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;

  // Get current form data based on active tab
  const currentFormData = activeTab === "signin" ? signinData : signupData;

  useEffect(() => {
    // Check if user is already authenticated
    checkAuthState();
    
    // Set up auth state listener
    const { data: { subscription } } = authService.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session && session.user) {
          router.replace('/(screens)/home');
        }
        
        if (initializing) {
          setInitializing(false);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkAuthState = async () => {
    try {
      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        router.replace('/(screens)/home');
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setInitializing(false);
    }
  };

  // Handle deep linking for OAuth callback
  useEffect(() => {
    const handleUrl = async (url) => {
      if (url?.includes('#access_token=')) {
        console.log('OAuth callback received:', url);
        const result = await authService.handleAuthCallback(url);
        if (result.success) {
          router.replace('/(screens)/home');
        }
      }
    };

    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    return () => subscription?.remove();
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (activeTab === "signin") {
      if (!signinData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!signinData.email.includes('@')) {
        newErrors.email = "Please enter a valid email address";
      }
      
      if (!signinData.password) {
        newErrors.password = "Password is required";
      }
    } else {
      if (!signupData.name.trim()) {
        newErrors.name = "Name is required";
      }
      
      if (!signupData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!signupData.email.includes('@')) {
        newErrors.email = "Please enter a valid email address";
      }
      
      if (!signupData.password) {
        newErrors.password = "Password is required";
      } else if (signupData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }
      
      if (!signupData.terms) {
        newErrors.terms = "Please accept the terms and conditions";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [activeTab, signinData, signupData]);

  const handleChange = useCallback((name, value) => {
    if (activeTab === "signin") {
      setSigninData(prev => ({ ...prev, [name]: value }));
    } else {
      setSignupData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [activeTab, errors]);

  const shakeForm = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  }, [shakeAnimation]);

  const handleSubmit = useCallback(async () => {
    console.log('Submit button pressed, activeTab:', activeTab);
    console.log('Current form data:', currentFormData);
    
    if (!validateForm()) {
      console.log('Validation failed, errors:', errors);
      shakeForm();
      return;
    }

    setLoading(true);

    try {
      let result;
      
      if (activeTab === "signin") {
        console.log('Attempting sign in with:', signinData);
        result = await authService.signIn(signinData.email, signinData.password);
      } else {
        console.log('Attempting sign up with:', signupData);
        result = await authService.signUp(signupData.email, signupData.password);
      }

      console.log('Auth result:', result);

      if (result?.success) {
        if (activeTab === "signup" && result.needsConfirmation) {
          Alert.alert(
            'Check Your Email',
            'We sent you a confirmation link. Please check your email and click the link to verify your account.',
            [{ text: 'OK', onPress: () => setActiveTab("signin") }]
          );
        }
        // Navigation will be handled by auth state listener
      } else {
        Alert.alert(
          activeTab === "signin" ? 'Sign In Failed' : 'Sign Up Failed', 
          result.error.message
        );
      }
    } catch (error) {
      console.error("Auth error:", error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [validateForm, activeTab, signinData, signupData]);

  const handleForgotPassword = useCallback(async () => {
    if (!signinData.email) {
      Alert.alert("Error", "Please enter your email first");
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await authService.resetPassword(signinData.email);
      
      if (result.success) {
        Alert.alert(
          'Password Reset',
          'Check your email for password reset instructions'
        );
      } else {
        Alert.alert('Reset Failed', result.error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  }, [signinData.email]);

  const switchTab = useCallback((tab) => {
    if (tab === activeTab || loading) return;

    Animated.timing(fadeAnimation, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tab);
      setErrors({});
      
      // Reset form data for the target tab
      if (tab === "signin") {
        setSigninData({ email: '', password: '' });
      } else {
        setSignupData({ name: '', email: '', password: '', terms: false });
      }
      
      setShowPassword(false);
      setShowSignupPassword(false);

      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  }, [activeTab, loading, fadeAnimation]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      const result = await authService.signInWithGoogle();

      if (result.success && result.url) {
        await WebBrowser.openAuthSessionAsync(result.url, 'actionable://auth');
      } else {
        Alert.alert('Google Sign-In Failed', result.error?.message || 'Failed to initiate Google sign in');
      }
    } catch (error) {
      Alert.alert('Error', 'Google sign-in failed. Please try again.');
      console.error('Google sign-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <SafeAreaView style={AuthStyles.safeAreaContainer}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={AuthStyles.safeAreaContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={AuthStyles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={AuthStyles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={AuthStyles.headerSection}>
            <View style={AuthStyles.iconContainer}>
              <Text style={AuthStyles.lightningIcon}>⚡</Text>
            </View>
            <Text style={AuthStyles.appTitle}>
              <Text style={AuthStyles.appTitleFirst}>Action</Text>
              <Text style={AuthStyles.appTitleSecond}>able</Text>
            </Text>
            <Text style={AuthStyles.tagline}>
              {activeTab === "signin" ? "Welcome back!" : "Create your account"}
            </Text>
          </View>

          {/* Auth Form */}
          <Animated.View
            style={[AuthStyles.authForm, { transform: [{ translateX: shakeAnimation }] }]}
          >
            {/* Tab Switcher */}
            <View style={AuthStyles.tabSwitcher}>
              <TouchableOpacity
                style={[AuthStyles.tabButton, activeTab === "signin" && AuthStyles.activeTab]}
                onPress={() => switchTab("signin")}
                disabled={loading}
              >
                <Text style={[AuthStyles.tabButtonText, activeTab === "signin" && AuthStyles.activeTabText]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[AuthStyles.tabButton, activeTab === "signup" && AuthStyles.activeTab]}
                onPress={() => switchTab("signup")}
                disabled={loading}
              >
                <Text style={[AuthStyles.tabButtonText, activeTab === "signup" && AuthStyles.activeTabText]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Content */}
            <Animated.View style={[AuthStyles.formContainer, { opacity: fadeAnimation }]}>
              {activeTab === "signin" ? (
                <View>
                  {/* Email Input */}
                  <View style={AuthStyles.inputGroup}>
                    <Text style={AuthStyles.inputLabel}>Email</Text>
                    <View style={[AuthStyles.inputWrapper, errors.email && AuthStyles.inputWrapperError]}>
                      <Ionicons name="mail" size={20} color="#9CA3AF" style={AuthStyles.inputIcon} />
                      <TextInput
                        style={AuthStyles.textInput}
                        placeholder="Enter your email"
                        value={signinData.email}
                        onChangeText={(text) => handleChange("email", text)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!loading}
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                    {errors.email && <Text style={AuthStyles.errorText}>{errors.email}</Text>}
                  </View>

                  {/* Password Input */}
                  <View style={AuthStyles.inputGroup}>
                    <Text style={AuthStyles.inputLabel}>Password</Text>
                    <View style={[AuthStyles.inputWrapper, errors.password && AuthStyles.inputWrapperError]}>
                      <Ionicons name="lock-closed" size={20} color="#9CA3AF" style={AuthStyles.inputIcon} />
                      <TextInput
                        style={AuthStyles.textInput}
                        placeholder="Enter your password"
                        value={signinData.password}
                        onChangeText={(text) => handleChange("password", text)}
                        editable={!loading}
                        secureTextEntry={!showPassword}
                        placeholderTextColor="#9CA3AF"
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={AuthStyles.passwordToggle}
                      >
                        <Ionicons 
                          name={showPassword ? "eye" : "eye-off"} 
                          size={20} 
                          color="#9CA3AF" 
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.password && <Text style={AuthStyles.errorText}>{errors.password}</Text>}
                  </View>

                  <TouchableOpacity
                    style={AuthStyles.forgotPassword}
                    onPress={handleForgotPassword}
                    disabled={loading}
                  >
                    <Text style={AuthStyles.forgotPasswordText}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  {/* Name Input */}
                  <View style={AuthStyles.inputGroup}>
                    <Text style={AuthStyles.inputLabel}>Full Name</Text>
                    <View style={[AuthStyles.inputWrapper, errors.name && AuthStyles.inputWrapperError]}>
                      <Ionicons name="person" size={20} color="#9CA3AF" style={AuthStyles.inputIcon} />
                      <TextInput
                        style={AuthStyles.textInput}
                        placeholder="Enter your full name"
                        value={signupData.name}
                        onChangeText={(text) => handleChange("name", text)}
                        editable={!loading}
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                    {errors.name && <Text style={AuthStyles.errorText}>{errors.name}</Text>}
                  </View>

                  {/* Email Input */}
                  <View style={AuthStyles.inputGroup}>
                    <Text style={AuthStyles.inputLabel}>Email</Text>
                    <View style={[AuthStyles.inputWrapper, errors.email && AuthStyles.inputWrapperError]}>
                      <Ionicons name="mail" size={20} color="#9CA3AF" style={AuthStyles.inputIcon} />
                      <TextInput
                        style={AuthStyles.textInput}
                        placeholder="Enter your email"
                        value={signupData.email}
                        onChangeText={(text) => handleChange("email", text)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!loading}
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                    {errors.email && <Text style={AuthStyles.errorText}>{errors.email}</Text>}
                  </View>

                  {/* Password Input */}
                  <View style={AuthStyles.inputGroup}>
                    <Text style={AuthStyles.inputLabel}>Password</Text>
                    <View style={[AuthStyles.inputWrapper, errors.password && AuthStyles.inputWrapperError]}>
                      <Ionicons name="lock-closed" size={20} color="#9CA3AF" style={AuthStyles.inputIcon} />
                      <TextInput
                        style={AuthStyles.textInput}
                        placeholder="Min. 8 characters"
                        value={signupData.password}
                        onChangeText={(text) => handleChange("password", text)}
                        editable={!loading}
                        secureTextEntry={!showSignupPassword}
                        placeholderTextColor="#9CA3AF"
                      />
                      <TouchableOpacity
                        onPress={() => setShowSignupPassword(!showSignupPassword)}
                        style={AuthStyles.passwordToggle}
                      >
                        <Ionicons 
                          name={showSignupPassword ? "eye" : "eye-off"} 
                          size={20} 
                          color="#9CA3AF" 
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.password && <Text style={AuthStyles.errorText}>{errors.password}</Text>}
                  </View>

                  {/* Terms Checkbox */}
                  <View style={AuthStyles.termsContainer}>
                    <TouchableOpacity
                      style={[
                        AuthStyles.checkbox,
                        signupData.terms && AuthStyles.checkboxChecked,
                        errors.terms && AuthStyles.checkboxError,
                      ]}
                      onPress={() => handleChange("terms", !signupData.terms)}
                      disabled={loading}
                    >
                      {signupData.terms && <Ionicons name="checkmark" size={16} color="white" />}
                    </TouchableOpacity>
                    <Text style={AuthStyles.termsText}>
                      I agree to the <Text style={AuthStyles.termsLink}>Terms</Text> and{" "}
                      <Text style={AuthStyles.termsLink}>Privacy Policy</Text>
                    </Text>
                  </View>
                  {errors.terms && <Text style={AuthStyles.errorText}>{errors.terms}</Text>}
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[AuthStyles.submitButton, loading && AuthStyles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={AuthStyles.submitButtonText}>
                  {loading 
                    ? activeTab === "signin" 
                      ? "Signing In..." 
                      : "Creating Account..."
                    : activeTab === "signin" 
                      ? "Sign In" 
                      : "Create Account"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {/* Social Login Divider */}
          <View style={AuthStyles.socialDivider}>
            <View style={AuthStyles.dividerLine} />
            <Text style={AuthStyles.dividerText}>or continue with</Text>
            <View style={AuthStyles.dividerLine} />
          </View>

          {/* Google Sign In Button */}
          <TouchableOpacity
            style={AuthStyles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Image
              source={{ uri: "https://developers.google.com/identity/images/g-logo.png" }}
              style={AuthStyles.googleIcon}
            />
            <Text style={AuthStyles.googleButtonText}>Continue with Google</Text>
          </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthScreen;