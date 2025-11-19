import { Stack } from 'expo-router';
import SignupScreen from './signup';

export default function Index() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SignupScreen />
    </>
  );
}
