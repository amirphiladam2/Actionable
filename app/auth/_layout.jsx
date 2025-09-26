// app/(auth)/_layout.js
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthScreen" />
      <Stack.Screen name="callback" />
      {/* Remove SignIn and SignUp screens since they're not components */}
    </Stack>
  );
}