import { Ionicons } from "@expo/vector-icons";
import * as Linking from 'expo-linking';
import { useRouter } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthStyles from "../../styles/AuthStyles";
import { useAuth } from "../../hooks/useAuth"; // Use the updated hook

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get("window");

const AuthScreen = () => {
  // Use the updated useAuth hook
  const { 
    signIn, 
    signUp, 
    signInWithGoogle, 
    resetPassword, 
    loading, 
    isAuthenticating, // OAuth loading state
    error 
  } = useAuth();
  
  // State management
  const [activeTab, setActiveTab] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Form data
  const [signinData, setSigninData] = useState({
    email: "",
    password: "",
  });
  
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    terms: false,
  });
  
  const router = useRouter();
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;

  // Form validation functions
  const validateSigninForm = () => {
    const errors = {};
    
    if (!signinData.email.trim()) {
      errors.email = "Please enter your email";
    } else if (!signinData.email.includes('@')) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!signinData.password) {
      errors.password = "Please enter your password";
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
  };
  
  const validateSignupForm = () => {
    const errors = {};
    
    if (!signupData.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!signupData.email.trim()) {
      errors.email = "Please enter your email";
    } else if (!signupData.email.includes('@')) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!signupData.password) {
      errors.password = "Please enter your password";
    } else if (signupData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    
    if (!signupData.terms) {
      errors.terms = "You must accept the terms and conditions";
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const validateForm = useCallback(() => {
    let validationResult;
    
    if (activeTab === "signin") {
      validationResult = validateSigninForm();
    } else {
      validationResult = validateSignupForm();
    }
    
    const newErrors = validationResult.errors || {};
    setFormErrors(newErrors);
    
    return validationResult.isValid;
  }, [activeTab, signinData, signupData]);

  const handleChange = useCallback((name, value) => {
    if (activeTab === "signin") {
      setSigninData(prev => ({ ...prev, [name]: value }));
    } else {
      setSignupData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [activeTab, formErrors]);

  const shakeForm = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  }, [shakeAnimation]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      shakeForm();
      return;
    }

    try {
      let result;
      
      if (activeTab === "signin") {
        result = await signIn(signinData.email, signinData.password);
      } else {
        result = await signUp(signupData.email, signupData.password);
      }

      if (result.success) {
        if (activeTab === "signup" && result.needsConfirmation) {
          Alert.alert(
            "Check Your Email", 
            "We've sent a confirmation email. Please verify your account before signing in."
          );
          setActiveTab("signin");
        }
        // Navigation is handled by the layout automatically
      } else {
        Alert.alert("Error", result.error.message);
      }
    } catch (error) {
      console.error("Auth error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    }
  }, [validateForm, activeTab, signinData, signupData, signIn, signUp]);

  const handleForgotPassword = useCallback(async () => {
    if (!signinData.email) {
      Alert.alert("Error", "Please enter your email first");
      return;
    }
    
    try {
      const result = await resetPassword(signinData.email);
      if (result.success) {
        Alert.alert("Success", "Password reset email sent. Please check your inbox.");
      } else {
        Alert.alert("Error", result.error.message);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      Alert.alert("Error", "Failed to send reset email");
    }
  }, [signinData.email, resetPassword]);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      const result = await signInWithGoogle();
      if (!result.error) {
        console.log('Google OAuth initiated successfully');
        // The useAuth hook manages the loading state automatically
      } else {
        Alert.alert("Error", result.error.message || "Failed to sign in with Google");
      }
    } catch (error) {
      console.error("Google sign in error:", error);
      Alert.alert("Error", "Failed to sign in with Google");
    }
  }, [signInWithGoogle]);

  const switchTab = useCallback((tab) => {
    if (tab === activeTab || loading || isAuthenticating) return;

    Animated.timing(fadeAnimation, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tab);
      setFormErrors({});
      
      // Reset form data for the target tab
      if (tab === "signin") {
        setSigninData({
          email: "",
          password: "",
        });
      } else {
        setSignupData({
          name: "",
          email: "",
          password: "",
          terms: false,
        });
      }
      
      setShowPassword(false);
      setShowSignupPassword(false);

      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  }, [activeTab, loading, isAuthenticating, fadeAnimation]);

  // Check if any loading state is active
  const isAnyLoading = loading || isAuthenticating;

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
                disabled={isAnyLoading}
              >
                <Text style={[AuthStyles.tabButtonText, activeTab === "signin" && AuthStyles.activeTabText]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[AuthStyles.tabButton, activeTab === "signup" && AuthStyles.activeTab]}
                onPress={() => switchTab("signup")}
                disabled={isAnyLoading}
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
                    <View style={[AuthStyles.inputWrapper, formErrors.email && AuthStyles.inputWrapperError]}>
                      <Ionicons name="mail" size={20} color="#9CA3AF" style={AuthStyles.inputIcon} />
                      <TextInput
                        style={AuthStyles.textInput}
                        placeholder="Enter your email"
                        value={signinData.email}
                        onChangeText={(text) => handleChange("email", text)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!isAnyLoading}
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                    {formErrors.email && <Text style={AuthStyles.errorText}>{formErrors.email}</Text>}
                  </View>

                  {/* Password Input */}
                  <View style={AuthStyles.inputGroup}>
                    <Text style={AuthStyles.inputLabel}>Password</Text>
                    <View style={[AuthStyles.inputWrapper, formErrors.password && AuthStyles.inputWrapperError]}>
                      <Ionicons name="lock-closed" size={20} color="#9CA3AF" style={AuthStyles.inputIcon} />
                      <TextInput
                        style={AuthStyles.textInput}
                        placeholder="Enter your password"
                        value={signinData.password}
                        onChangeText={(text) => handleChange("password", text)}
                        editable={!isAnyLoading}
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
                    {formErrors.password && <Text style={AuthStyles.errorText}>{formErrors.password}</Text>}
                  </View>

                  <TouchableOpacity
                    style={AuthStyles.forgotPassword}
                    onPress={handleForgotPassword}
                    disabled={isAnyLoading}
                  >
                    <Text style={AuthStyles.forgotPasswordText}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  {/* Name Input */}
                  <View style={AuthStyles.inputGroup}>
                    <Text style={AuthStyles.inputLabel}>Full Name</Text>
                    <View style={[AuthStyles.inputWrapper, formErrors.name && AuthStyles.inputWrapperError]}>
                      <Ionicons name="person" size={20} color="#9CA3AF" style={AuthStyles.inputIcon} />
                      <TextInput
                        style={AuthStyles.textInput}
                        placeholder="Enter your full name"
                        value={signupData.name}
                        onChangeText={(text) => handleChange("name", text)}
                        editable={!isAnyLoading}
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                    {formErrors.name && <Text style={AuthStyles.errorText}>{formErrors.name}</Text>}
                  </View>

                  {/* Email Input */}
                  <View style={AuthStyles.inputGroup}>
                    <Text style={AuthStyles.inputLabel}>Email</Text>
                    <View style={[AuthStyles.inputWrapper, formErrors.email && AuthStyles.inputWrapperError]}>
                      <Ionicons name="mail" size={20} color="#9CA3AF" style={AuthStyles.inputIcon} />
                      <TextInput
                        style={AuthStyles.textInput}
                        placeholder="Enter your email"
                        value={signupData.email}
                        onChangeText={(text) => handleChange("email", text)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!isAnyLoading}
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                    {formErrors.email && <Text style={AuthStyles.errorText}>{formErrors.email}</Text>}
                  </View>

                  {/* Password Input */}
                  <View style={AuthStyles.inputGroup}>
                    <Text style={AuthStyles.inputLabel}>Password</Text>
                    <View style={[AuthStyles.inputWrapper, formErrors.password && AuthStyles.inputWrapperError]}>
                      <Ionicons name="lock-closed" size={20} color="#9CA3AF" style={AuthStyles.inputIcon} />
                      <TextInput
                        style={AuthStyles.textInput}
                        placeholder="Min. 8 characters"
                        value={signupData.password}
                        onChangeText={(text) => handleChange("password", text)}
                        editable={!isAnyLoading}
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
                    {formErrors.password && <Text style={AuthStyles.errorText}>{formErrors.password}</Text>}
                  </View>

                  {/* Terms Checkbox */}
                  <View style={AuthStyles.termsContainer}>
                    <TouchableOpacity
                      style={[
                        AuthStyles.checkbox,
                        signupData.terms && AuthStyles.checkboxChecked,
                        formErrors.terms && AuthStyles.checkboxError,
                      ]}
                      onPress={() => handleChange("terms", !signupData.terms)}
                      disabled={isAnyLoading}
                    >
                      {signupData.terms && <Ionicons name="checkmark" size={16} color="white" />}
                    </TouchableOpacity>
                    <Text style={AuthStyles.termsText}>
                      I agree to the <Text style={AuthStyles.termsLink}>Terms</Text> and{" "}
                      <Text style={AuthStyles.termsLink}>Privacy Policy</Text>
                    </Text>
                  </View>
                  {formErrors.terms && <Text style={AuthStyles.errorText}>{formErrors.terms}</Text>}
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[AuthStyles.submitButton, isAnyLoading && AuthStyles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isAnyLoading}
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

              {/* Display auth errors from the hook */}
              {error && (
                <Text style={[AuthStyles.errorText, { textAlign: 'center', marginTop: 10 }]}>
                  {error.message}
                </Text>
              )}
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
            style={[AuthStyles.googleButton, isAnyLoading && AuthStyles.submitButtonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={isAnyLoading}
          >
            {isAuthenticating ? (
              <>
                <ActivityIndicator size="small" color="#4285f4" style={{ marginRight: 8 }} />
                <Text style={AuthStyles.googleButtonText}>Signing in with Google...</Text>
              </>
            ) : (
              <>
                <Image
                  source={{ uri: "https://developers.google.com/identity/images/g-logo.png" }}
                  style={AuthStyles.googleIcon}
                />
                <Text style={AuthStyles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* OAuth Loading Overlay */}
          {isAuthenticating && (
            <View style={overlayStyles.container}>
              <View style={overlayStyles.content}>
                <ActivityIndicator size="large" color="#4285f4" />
                <Text style={overlayStyles.title}>Authenticating with Google</Text>
                <Text style={overlayStyles.subtitle}>Please wait while we sign you in...</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Overlay styles for OAuth loading
const overlayStyles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 250,
    marginHorizontal: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
};

export default AuthScreen;