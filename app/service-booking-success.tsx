import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { rms, rs, rvs } from "@/constants/responsive";

export default function ServiceBookingSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    bookingId?: string;
    optionTitle?: string;
    dateLabel?: string;
    timeLabel?: string;
  }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Pressable style={styles.iconBtn} onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#181818" />
            </Pressable>
            <Text style={styles.headerTitle}>Booking Status</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.successCard}>
            <View style={styles.successCircle}>
              <MaterialCommunityIcons name="check-circle-outline" size={34} color="#16A34A" />
            </View>
            <Text style={styles.successTitle}>Booking Confirmed!</Text>
            <Text style={styles.successSubtitle}>
              Your service has been scheduled successfully. A professional will arrive at your
              doorstep as per the slot.
            </Text>
          </View>

          <Text style={styles.detailsHeading}>Booking Details</Text>
          <View style={styles.detailTable}>
            <DetailRow label="Service" value={params.optionTitle || "Full Home Deep Clean"} />
            <DetailRow label="Date" value={params.dateLabel || "Sunday, March 15, 2026"} />
            <DetailRow label="Time" value={params.timeLabel || "10:00 AM - 2:00 PM"} />
            <DetailRow label="Booking ID" value={params.bookingId || "#NST-88291"} noBorder />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.replace({ pathname: "/my-bookings", params: { tab: "history" } } as never)}
          >
            <Text style={styles.primaryText}>Back to Dashboard</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}

function DetailRow({ label, value, noBorder = false }: { label: string; value: string; noBorder?: boolean }) {
  return (
    <View style={[styles.detailRow, noBorder && { borderBottomWidth: 0 }]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAFAFA" },
  headerCard: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: rs(16),
    paddingTop: rvs(12),
    paddingBottom: rvs(14),
    borderBottomLeftRadius: rs(24),
    borderBottomRightRadius: rs(24),
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: rs(8) },
  iconBtn: { padding: rs(2) },
  headerTitle: { fontSize: rms(18), fontWeight: "500", color: "#000" },
  content: { padding: 16, paddingBottom: 120 },
  successCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: { marginTop: 14, color: "#1A1A1A", fontSize: 20, fontWeight: "600" },
  successSubtitle: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 17,
  },
  detailsHeading: { marginTop: 20, fontSize: 26, color: "#1A1A1A", fontWeight: "500" },
  detailTable: { marginTop: 8 },
  detailRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(229,231,235,0.5)",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: { fontSize: 14, color: "#777", fontWeight: "500" },
  detailValue: { fontSize: 14, color: "#1A1A1A", fontWeight: "500" },
  footer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 18,
  },
  primaryBtn: {
    backgroundColor: "#1C98ED",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  primaryText: { color: "#FAFAFA", fontSize: 14, fontWeight: "500" },
});
