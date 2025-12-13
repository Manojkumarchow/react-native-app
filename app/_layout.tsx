import React, { useEffect } from "react";
import useAuthStore from "./store/authStore";
import useProfileStore from "./store/profileStore";
import { Stack } from "expo-router";
import api from "./services/api";
import Toast from "react-native-toast-message";
import { Buffer } from "buffer";

export default function RootLayout() {
  global.Buffer = Buffer;
  return (
    <>
      <Stack initialRouteName="splash" screenOptions={{ headerShown: false }} />
      <Toast />
    </>
  );
}
