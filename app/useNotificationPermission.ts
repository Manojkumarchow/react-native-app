import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";

export type PushRegistrationResult = {
  expoPushToken: string | null;
  fcmToken: string | null;
};

export async function requestNotificationPermission(): Promise<PushRegistrationResult | null> {
  const isExpoGo = Constants.appOwnership === "expo";
  if (Platform.OS === "android" && isExpoGo) {
    console.warn(
      "Push notifications are unavailable in Expo Go on Android (SDK 53+). Use a development or production build.",
    );
    return null;
  }

  if (!Device.isDevice) {
    console.log("Must use physical device");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#1C98ED",
    });
  }

  let expoPushToken: string | null = null;
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (projectId) {
    try {
      expoPushToken = (
        await Notifications.getExpoPushTokenAsync({ projectId })
      ).data;
    } catch (e) {
      console.warn("Expo push token error:", e);
    }
  } else {
    console.warn("EAS projectId not found. Expo push token will be skipped.");
  }

  let fcmToken: string | null = null;
  if (!isExpoGo) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const messaging = require("@react-native-firebase/messaging").default;
      if (Platform.OS === "ios") {
        await messaging().registerDeviceForRemoteMessages();
      }
      fcmToken = await messaging().getToken();
    } catch (e) {
      console.warn("FCM token error:", e);
    }
  }

  if (!expoPushToken && !fcmToken) {
    return null;
  }

  return { expoPushToken, fcmToken };
}
