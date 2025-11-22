import React, { useEffect } from "react";
import useAuthStore from "./store/authStore";
import useProfileStore from "./store/profileStore";
import { Stack } from "expo-router";
import api from "./services/api";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  
  return (
    <>
      <Stack initialRouteName="splash" screenOptions={{ headerShown: false }} />
      <Toast />
    </>
  );
}
