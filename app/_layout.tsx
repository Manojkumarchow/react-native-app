import React, { useEffect } from "react";
import { Stack, usePathname, useRouter } from "expo-router";
import type {
  Notification,
  NotificationResponse,
} from "expo-notifications";
import Toast from "react-native-toast-message";
import { Buffer } from "buffer";
import { BackHandler, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import useAuthStore from "./store/authStore";
import Constants from "expo-constants";

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = !!useAuthStore((s) => s.token);
  const isExpoGo = Constants.appOwnership === "expo";

  useEffect(() => {
    if (isExpoGo) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("./notifications/notificationConfig");
    } catch (error) {
      console.warn("Notification config could not be loaded:", error);
    }
  }, [isExpoGo]);

  useEffect(() => {
    if (isExpoGo) return;
    // Import lazily so Expo Go doesn't evaluate notifications at module load.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Notifications = require("expo-notifications");
    const subscription = Notifications.addNotificationReceivedListener(
      (notification: Notification) => {
        console.log("🔔 Foreground notification received:", notification);

        // Later: refresh notification list
      },
    );

    return () => subscription.remove();
  }, [isExpoGo]);
  useEffect(() => {
    if (isExpoGo) return;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Notifications = require("expo-notifications");
    const responseListener =
      Notifications.addNotificationResponseReceivedListener(
        (response: NotificationResponse) => {
        const data = response.notification.request.content.data;

        console.log("👉 Notification tapped:", data);

        /**
         * Example routing logic (later):
         * if (data.type === "NOTICE") {
         *   router.push(`/notice/${data.entityId}`);
         * }
         */
        },
      );

    return () => responseListener.remove();
  }, [isExpoGo]);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const isHome =
      pathname === "/home" ||
      pathname === "/(tabs)/home" ||
      pathname === "/(tabs)" ||
      pathname === "/";
    const isAuthEntry = pathname === "/login" || pathname === "/auth";

    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isHome) return false;

      if (router.canGoBack()) {
        router.back();
        return true;
      }

      if (!isAuthEntry && isAuthenticated) {
        router.replace("/home");
        return true;
      }

      return false;
    });

    return () => sub.remove();
  }, [isAuthenticated, pathname, router]);

  global.Buffer = Buffer;
  return (
    <SafeAreaProvider>
      <Stack initialRouteName="splash" screenOptions={{ headerShown: false }} />
      <Toast />
    </SafeAreaProvider>
  );
}
