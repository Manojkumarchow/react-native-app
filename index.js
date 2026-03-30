try {
  const messaging = require("@react-native-firebase/messaging").default;
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log("[FCM] Background message:", remoteMessage.messageId);
  });
} catch {
  /* Expo Go / missing native module — FCM runs only in dev or production builds. */
}

import "expo-router/entry";
