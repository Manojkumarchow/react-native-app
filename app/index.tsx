import { Stack } from "expo-router";
import SplashScreen from "./splash";

export default function Index() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SplashScreen />
    </>
  );
}
