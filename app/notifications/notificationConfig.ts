import Constants from "expo-constants";

const isExpoGo = Constants.appOwnership === "expo";

if (!isExpoGo) {
  // Keep notifications module runtime-only to avoid Expo Go Android SDK 53+ warning paths.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Notifications = require("expo-notifications");
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}
