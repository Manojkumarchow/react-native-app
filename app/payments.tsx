import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useProfileStore from "./store/profileStore";
import Toast from "react-native-toast-message";

const PRIMARY = "#1C98ED";
const GREEN = "#49bf09ff";

export default function Payments() {
  const upiId = useProfileStore((s) => s.upiId);

  const handleUpiPress = async () => {
    if (upiId == undefined || !upiId || upiId == null || upiId == "") {
      Toast.show({
        type: "UPI ID not available",
        text1: "Please add UPI ID in the profile",
      });
      return;
    }

    const upiUrl = `upi://pay?pa=${upiId}&pn=Apartment%20Payment&cu=INR`;

    const supported = await Linking.canOpenURL(upiUrl);

    if (!supported) {
      Toast.show({
        type: "No UPI App Found",
        text1:
          "Please install a UPI app like Google Pay, PhonePe, Paytm or BHIM",
      });
      return;
    }

    await Linking.openURL(upiUrl);
  };

  return (
    <>
      {/* Hide default header */}
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.safe}>
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Payments</Text>

          {/* Spacer for symmetry */}
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.center}>
          <Text style={styles.infoText}>Pay using UPI ID</Text>

          {/* Payment Indicator */}
          <Text style={styles.paymentEmoji}>💸</Text>

          <TouchableOpacity onPress={handleUpiPress}>
            <Text style={styles.upiText}>👉 {upiId}</Text>
          </TouchableOpacity>

          <Text style={styles.helperText}>
            Tap the UPI ID to open your payment app
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },

  /* Header */
  header: {
    height: 56,
    backgroundColor: PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  /* Content */
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  paymentEmoji: {
    fontSize: 40,
    marginVertical: 12,
  },
  upiText: {
    fontSize: 16,
    fontWeight: "700",
    color: GREEN,
  },
  helperText: {
    fontSize: 12,
    color: "#888",
    marginTop: 6,
  },
});
