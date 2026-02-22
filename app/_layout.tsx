import React from "react";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { Buffer } from "buffer";
import "./notifications/notificationConfig";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
export default function RootLayout() {
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("🔔 Foreground notification received:", notification);

        // Later: refresh notification list
      },
    );

    return () => subscription.remove();
  }, []);
  useEffect(() => {
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;

        console.log("👉 Notification tapped:", data);

        /**
         * Example routing logic (later):
         * if (data.type === "NOTICE") {
         *   router.push(`/notice/${data.entityId}`);
         * }
         */
      });

    return () => responseListener.remove();
  }, []);
  global.Buffer = Buffer;
  return (
    <>
      <Stack initialRouteName="splash" screenOptions={{ headerShown: false }} />
      <Toast />
    </>
  );
}
