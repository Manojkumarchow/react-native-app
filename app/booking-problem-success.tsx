import React from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function BookingProblemSuccessScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerWrap}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="check-circle-outline" size={36} color="#16A34A" />
          </View>
          <Text style={styles.title}>Problem Reported</Text>
          <Text style={styles.subtitle}>
            Your issue has been submitted successfully. Our support team will contact you shortly.
          </Text>

          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.replace({ pathname: "/my-bookings", params: { tab: "issues" } } as never)}
          >
            <Text style={styles.primaryText}>Go to My Bookings</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAFAFA" },
  centerWrap: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: "600", color: "#1A1A1A", marginBottom: 10 },
  subtitle: { fontSize: 12, color: "#6B7280", lineHeight: 18, textAlign: "center" },
  primaryBtn: {
    marginTop: 24,
    width: "100%",
    borderRadius: 999,
    backgroundColor: "#1C98ED",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  primaryText: { color: "#FAFAFA", fontSize: 14, fontWeight: "500" },
});
