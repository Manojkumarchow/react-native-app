import React, { useMemo } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getBookings } from "./data/homeServicesData";

export default function BookingDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookingId?: string }>();
  const booking = useMemo(
    () => getBookings().find((item) => item.id === params.bookingId) ?? getBookings()[0],
    [params.bookingId]
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Pressable style={styles.iconBtn} onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#181818" />
            </Pressable>
            <Text style={styles.headerTitle}>Booking Details</Text>
            <View style={styles.spacer} />
            <View style={[styles.statusPill, booking.status === "COMPLETED" ? styles.completedPill : styles.confirmedPill]}>
              <Text
                style={[
                  styles.statusText,
                  booking.status === "COMPLETED" ? styles.completedText : styles.confirmedText,
                ]}
              >
                {booking.status === "COMPLETED" ? "Completed" : booking.status}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.mainCard}>
            <View style={styles.topInfo}>
              <View style={styles.iconBubble}>
                <MaterialCommunityIcons name="tools" size={18} color="#1C98ED" />
              </View>
              <View>
                <Text style={styles.mainTitle}>{booking.optionTitle}</Text>
                <Text style={styles.mainSub}>{booking.serviceKey}</Text>
              </View>
            </View>
            <View style={styles.line} />
            <InfoRow label="Booking ID" value={booking.id} />
            <InfoRow label="Date & Time" value={`${booking.dateLabel} · ${booking.timeLabel}`} />
            <InfoRow label="Professional" value={booking.providerName} valueColor="#2899CF" />
            <InfoRow label="Amount Paid" value={`₹${booking.amount}`} />
          </View>

          <View style={styles.profCard}>
            <View style={styles.profAvatar}>
              <Text style={styles.profAvatarText}>RK</Text>
            </View>
            <View style={styles.profBody}>
              <View style={styles.profNameRow}>
                <Text style={styles.profName}>{booking.providerName}</Text>
                <Text style={styles.verifyBadge}>Nestiti Verified</Text>
              </View>
              <Text style={styles.profRating}>★ {booking.providerRating}</Text>
            </View>
            <Pressable style={styles.callBtn}>
              <MaterialCommunityIcons name="phone-outline" size={18} color="#2899CF" />
            </Pressable>
          </View>

          <View style={styles.issueCard}>
            <Text style={styles.issueHeading}>Report a Problem</Text>
            <Text style={styles.issueSub}>Not satisfied with the service? We'll fix it.</Text>

            {booking.issueStatus ? (
              <View style={styles.issueRaisedWrap}>
                <View style={styles.issueRaisedTop}>
                  <Text style={styles.issueRaisedLabel}>Issue Raised</Text>
                  <View style={styles.issueStatusPill}>
                    <Text style={styles.issueStatusText}>{booking.issueStatus}</Text>
                  </View>
                </View>
                <Text style={styles.issueRaisedText}>{booking.issueText || "Issue reported for this booking."}</Text>
                <View style={styles.issueRaisedMeta}>
                  <Text style={styles.issueRaisedAt}>{booking.issueRaisedAt || "Recently"}</Text>
                  <Text style={styles.issueRaisedEta}>Our team will respond within 24 hrs</Text>
                </View>
              </View>
            ) : (
              <Pressable
                style={styles.problemBtn}
                onPress={() =>
                  router.push({ pathname: "/booking-report-problem", params: { bookingId: booking.id } } as never)
                }
              >
                <Text style={styles.problemBtnText}>Report a Problem</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor ? { color: valueColor } : undefined]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAFAFA" },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: { padding: 2 },
  headerTitle: { fontSize: 18, fontWeight: "500", color: "#000" },
  spacer: { flex: 1 },
  statusPill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  completedPill: { backgroundColor: "rgba(5,150,105,0.1)" },
  confirmedPill: { backgroundColor: "rgba(39,153,206,0.1)" },
  statusText: { fontSize: 14, fontWeight: "500" },
  completedText: { color: "#059669" },
  confirmedText: { color: "#1C98ED" },
  content: { padding: 16, gap: 12, paddingBottom: 30 },
  mainCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderTopColor: "#1C98ED",
    borderTopWidth: 1.5,
    borderRadius: 24,
    padding: 16,
  },
  topInfo: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(40,153,207,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  mainTitle: { fontSize: 16, color: "#0F172A", fontWeight: "600" },
  mainSub: { fontSize: 14, color: "#64748B" },
  line: { height: 1, backgroundColor: "#F1F5F9", marginBottom: 8 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 8 },
  infoLabel: { fontSize: 12, color: "#64748B" },
  infoValue: { fontSize: 14, color: "#0F172A", fontWeight: "500" },
  profCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  profAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2899CF",
    alignItems: "center",
    justifyContent: "center",
  },
  profAvatarText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  profBody: { flex: 1 },
  profNameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  profName: { fontSize: 14, color: "#0F172A", fontWeight: "500" },
  verifyBadge: { color: "#1C98ED", fontSize: 14, backgroundColor: "#F1F5F9", paddingHorizontal: 6, borderRadius: 8 },
  profRating: { fontSize: 10, color: "#475569" },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(40,153,207,0.2)",
    backgroundColor: "rgba(40,153,207,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  issueCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 24,
    padding: 16,
  },
  issueHeading: { fontSize: 14, color: "#0F172A", fontWeight: "600" },
  issueSub: { marginTop: 2, fontSize: 12, color: "#64748B" },
  problemBtn: {
    marginTop: 12,
    backgroundColor: "rgba(220,38,38,0.12)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  problemBtnText: { color: "#C81616", fontSize: 14, fontWeight: "500" },
  issueRaisedWrap: {
    marginTop: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFE4E6",
    padding: 14,
  },
  issueRaisedTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  issueRaisedLabel: { color: "#E11D48", fontSize: 14, fontWeight: "600" },
  issueStatusPill: { backgroundColor: "#FFE4E6", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  issueStatusText: { color: "#E11D48", fontSize: 14, fontWeight: "500" },
  issueRaisedText: { marginTop: 8, color: "#334155", fontSize: 12 },
  issueRaisedMeta: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(254,205,211,0.5)",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  issueRaisedAt: { color: "#777", fontSize: 10 },
  issueRaisedEta: { color: "rgba(225,29,72,0.8)", fontSize: 12 },
});
