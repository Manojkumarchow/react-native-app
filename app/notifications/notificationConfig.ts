import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // ✅ replaces shouldShowAlert
    shouldShowList: true, // ✅ shows in notification tray
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
