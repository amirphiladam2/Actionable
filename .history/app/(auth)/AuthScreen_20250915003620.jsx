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
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import AuthStyles from "../../styles/AuthStyles";
import { useRouter } from "expo-router";
import useSignInLogic from "../../hooks/useSignInLogic";
import useSignUpLogic from "../../hooks/useSignUpLogic";

const { width } = Dimensions.get("window");

WebBrowser.maybeCompleteAuthSession();

const AuthScreen = () => {
  // Initialize auth logic hooks - ONLY ONCE
  const signin = useSignInLogic();
  const signup = useSignUpLogic();
  
  // State management
  const [activeTab, setActiveTab] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Separate form data for each tab to avoid conflicts
  const [signinData, setSigninData] = useState(signin.initialSigninState);
  const [signupData, setSignupData] = useState(signup.initialSignupState);

  const router = useRouter();
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;

  // Derived loading state
  const isLoading = activeTab === "signin" ? signin.loading : signup.loading;

  // Get current form data based on active tab
  const currentFormData = activeTab === "signin" ? signinData : signupData;

  // Handle deep linking for OAuth callback
  useEffect(() => {
    const handleDeepLink = (url) => {
      console.log('Deep link received:', url);
      
      if (url && (url.includes('#access_token=') || url.includes('?access_token='))) {
        console.log('OAuth callback detected, navigating to home...');
        setTimeout(() => {
          router.replace("/(tabs)/home");
        }, 1500);
      }
    };

    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    return () => subscription?.remove();
  }, [router]);

  const validateForm = useCallback(() => {
    let validationResult;
    
    if (activeTab === "signin") {
      validationResult = signin.validateSigninForm(signinData);
    } else {
      validationResult = signup.validateSignupForm(signupData);
    }
    
    const newErrors = validationResult.errors || {};
    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  }, [activeTab, signinData, signupData, signin, signup]);

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
  
  const onGoogleSignIn = async () => {
    console.log('Google button pressed');
    try {
      const result = await signin.handleGoogleSignIn();
      console.log('Google Sign-In result:', result);
      if (result.error) {
        Alert.alert('Google Sign-In Failed', result.error.message);
      }
    } catch (error) {
      console.error('Error calling handleGoogleSignIn:', error);
      Alert.alert('Error', 'Google sign-in failed. Please try again.');
    }
  };

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

    try {
      let result;
      
      if (activeTab === "signin") {
        console.log('Attempting sign in with:', signinData);
        result = await signin.handleEmailSignin(signinData);
      } else {
        console.log('Attempting sign up with:', signupData);
        result = await signup.handleSignup(signupData);
      }

      console.log('Auth result:', result);

      if (result?.success) {
        router.push("/(tabs)/home");
      }
    } catch (error) {
      console.error("Auth error:", error);
    }
  }, [validateForm, activeTab, signinData, signupData, router, signin, signup]);

  const handleForgotPassword = useCallback(async () => {
    if (!signinData.email) {
      Alert.alert("Error", "Please enter your email first");
      return;
    }
    await signin.handleForgotPassword(signinData.email);
  }, [signinData.email, signin]);

  const switchTab = useCallback((tab) => {
    if (tab === activeTab || isLoading) return;

    Animated.timing(fadeAnimation, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tab);
      setErrors({});
      
      // Reset form data for the target tab
      if (tab === "signin") {
        setSigninData(signin.initialSigninState);
      } else {
        setSignupData(signup.initialSignupState);
      }
      
      setShowPassword(false);
      setShowSignupPassword(false);

      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  }, [activeTab, isLoading, fadeAnimation, signin, signup]);

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
                disabled={isLoading}
              >
                <Text style={[AuthStyles.tabButtonText, activeTab === "signin" && AuthStyles.activeTabText]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[AuthStyles.tabButton, activeTab === "signup" && AuthStyles.activeTab]}
                onPress={() => switchTab("signup")}
                disabled={isLoading}
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
                        editable={!isLoading}
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
                        editable={!isLoading}
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
                    disabled={isLoading}
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
                        editable={!isLoading}
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
                        editable={!isLoading}
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
                        editable={!isLoading}
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
                      disabled={isLoading}
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
                style={[AuthStyles.submitButton, isLoading && AuthStyles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <Text style={AuthStyles.submitButtonText}>
                  {isLoading 
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
            style={[AuthStyles.googleButton, signin.loading && AuthStyles.googleButtonDisabled]}
            onPress={onGoogleSignIn}
            disabled={signin.loading}
          >
            <Image
              source={{ uri: "https://developers.google.com/identity/images/g-logo.png" }}
              style={AuthStyles.googleIcon}
            />
            <Text style={AuthStyles.googleButtonText}>
              {signin.loading ? "Loading..." : "Continue with Google"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthScreen;