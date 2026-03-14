import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { rms, rs, rvs } from "@/constants/responsive";

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
    paddingHorizontal: rs(24),
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: rs(72),
    height: rs(72),
    borderRadius: rs(36),
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rvs(16),
  },
  title: { fontSize: rms(24), fontWeight: "600", color: "#1A1A1A", marginBottom: rvs(10) },
  subtitle: { fontSize: rms(12), color: "#6B7280", lineHeight: rvs(18), textAlign: "center" },
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
