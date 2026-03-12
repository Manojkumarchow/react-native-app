import React, { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getBookings, raiseIssue } from "./data/homeServicesData";

export default function BookingReportProblemScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookingId?: string }>();
  const booking = useMemo(
    () => getBookings().find((item) => item.id === params.bookingId) ?? getBookings()[0],
    [params.bookingId]
  );
  const [problem, setProblem] = useState("Describe the problem with the service.");

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
            <View style={[styles.statusPill, styles.completedPill]}>
              <Text style={[styles.statusText, styles.completedText]}>Completed</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.mainCard}>
            <View style={styles.mainTop}>
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

          <View style={styles.issueCard}>
            <Text style={styles.issueTitle}>Report a Problem</Text>
            <Text style={styles.issueSub}>Not satisfied with the service? We'll fix it.</Text>

            <TextInput
              multiline
              style={styles.textArea}
              value={problem}
              onChangeText={setProblem}
              placeholder="Describe the problem with the service."
              placeholderTextColor="#777"
            />

            <View style={styles.actionRow}>
              <Pressable style={styles.ghostBtn} onPress={() => router.back()}>
                <Text style={styles.ghostText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.ghostBtn}
                onPress={() => {
                  raiseIssue(booking.id, problem);
                  router.replace({ pathname: "/booking-problem-success", params: { bookingId: booking.id } } as never);
                }}
              >
                <Text style={styles.ghostText}>Submit Issue</Text>
              </Pressable>
            </View>
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
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "500", color: "#000" },
  statusPill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  completedPill: { backgroundColor: "rgba(5,150,105,0.1)" },
  statusText: { fontSize: 14, fontWeight: "500" },
  completedText: { color: "#059669" },
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
  mainTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
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
  issueCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 24,
    padding: 16,
  },
  issueTitle: { fontSize: 14, color: "#0F172A", fontWeight: "600" },
  issueSub: { marginTop: 2, fontSize: 12, color: "#64748B" },
  textArea: {
    marginTop: 12,
    minHeight: 96,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingVertical: 14,
    textAlignVertical: "top",
    fontSize: 14,
    color: "#181818",
  },
  actionRow: { marginTop: 12, flexDirection: "row", gap: 12 },
  ghostBtn: {
    flex: 1,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#F4F4F5",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  ghostText: { color: "#777", fontSize: 14, fontWeight: "500" },
});
