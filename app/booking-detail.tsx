import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { BASE_URL } from "./config";
import useProfileStore from "./store/profileStore";
import { getErrorMessage } from "./services/error";
import { SafeAreaView } from "react-native-safe-area-context";
import { rms, rs, rvs } from "@/constants/responsive";

export default function BookingDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookingId?: string }>();
  const profileId = useProfileStore((s) => s.phone);
  const bookingId = Array.isArray(params.bookingId) ? params.bookingId[0] : params.bookingId ?? "";
  const [booking, setBooking] = useState<any | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!profileId || !bookingId) return;
      try {
        setErrorText(null);
        const res = await axios.get(`${BASE_URL}/service/order/${profileId}/${bookingId}`);
        setBooking(res.data ?? null);
      } catch (error) {
        setErrorText(getErrorMessage(error, "Unable to fetch booking details."));
        setBooking(null);
      }
    };
    run();
  }, [profileId, bookingId]);

  const dateTimeLabel = useMemo(() => {
    if (!booking?.date) return "--";
    const dateObj = new Date(booking.date);
    const dateLabel = Number.isNaN(dateObj.getTime())
      ? String(booking.date)
      : dateObj.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    return `${dateLabel} · ${booking?.timeSlot ?? "--"}`;
  }, [booking]);

  const displayStatus = useMemo(() => {
    const rawOrderStatus = String(booking?.orderStatus ?? "CREATED").toUpperCase();
    const rawVhsStatus = String(booking?.vhsStatus ?? "").toUpperCase();
    if (
      rawOrderStatus === "CREATED" &&
      (rawVhsStatus === "BOOKED" || rawVhsStatus === "ASSIGNING" || rawVhsStatus === "ASSIGNING_SERVICE_PERSON")
    ) {
      return "ASSIGNING_SERVICE_PERSON";
    }
    return rawOrderStatus;
  }, [booking]);

  if (!booking) {
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
            </View>
          </View>
          <View style={{ padding: rs(16) }}>
            <Text style={styles.infoLabel}>{errorText ?? "Loading..."}</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

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
            <View style={[styles.statusPill, displayStatus === "COMPLETED" ? styles.completedPill : styles.confirmedPill]}>
              <Text
                style={[
                  styles.statusText,
                  displayStatus === "COMPLETED" ? styles.completedText : styles.confirmedText,
                ]}
              >
                {displayStatus === "ASSIGNING_SERVICE_PERSON" || displayStatus === "CREATED"
                  ? "Assigning service person"
                  : displayStatus}
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
                <Text style={styles.mainSub}>{booking.orderType}</Text>
              </View>
            </View>
            <View style={styles.line} />
            <InfoRow label="Booking ID" value={booking.orderId} />
            <InfoRow label="Date & Time" value={dateTimeLabel} />
            <InfoRow label="Professional" value={booking.vhsServicePersonName ?? booking.servicePersonName ?? "Assigning service person"} valueColor="#2899CF" />
            <InfoRow label="Amount Paid" value={`₹${booking.amount}`} />
            <View style={styles.actionRow}>
              <Pressable
                style={styles.secondaryBtn}
                onPress={() =>
                  router.push({
                    pathname: "/service-schedule",
                    params: {
                      bookingId: booking.orderId,
                      optionId: booking.optionId,
                      optionTitle: booking.optionTitle,
                      optionPrice: String(booking.amount ?? 0),
                    },
                  } as never)
                }
              >
                <Text style={styles.secondaryBtnText}>Change Date/Slot</Text>
              </Pressable>
              <Pressable
                style={[styles.secondaryBtn, { borderColor: "#FCA5A5" }]}
                onPress={async () => {
                  try {
                    await axios.patch(`${BASE_URL}/service/order/${profileId}/${booking.orderId}/cancel`, {
                      cancelReason: "Customer requested cancellation",
                    });
                    router.replace("/my-bookings");
                  } catch (error) {
                    setErrorText(getErrorMessage(error, "Unable to cancel booking."));
                  }
                }}
              >
                <Text style={[styles.secondaryBtnText, { color: "#DC2626" }]}>Cancel</Text>
              </Pressable>
            </View>
            {errorText ? <Text style={styles.issueSub}>{errorText}</Text> : null}
          </View>

          <View style={styles.profCard}>
            <View style={styles.profAvatar}>
              <Text style={styles.profAvatarText}>RK</Text>
            </View>
            <View style={styles.profBody}>
              <View style={styles.profNameRow}>
              <Text style={styles.profName}>{booking.vhsServicePersonName ?? booking.servicePersonName ?? "Assigning service person"}</Text>
                <Text style={styles.verifyBadge}>Nestiti Verified</Text>
              </View>
              <Text style={styles.profRating}>{booking.vhsServicePersonPhone ?? booking.servicePersonPhone ?? "Awaiting assignment"}</Text>
            </View>
            <Pressable style={styles.callBtn}>
              <MaterialCommunityIcons name="phone-outline" size={18} color="#2899CF" />
            </Pressable>
          </View>

          <View style={styles.issueCard}>
            <Text style={styles.issueHeading}>Report a Problem</Text>
            <Text style={styles.issueSub}>Not satisfied with the service? We&apos;ll fix it.</Text>

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
    borderBottomLeftRadius: rs(24),
    borderBottomRightRadius: rs(24),
    paddingHorizontal: rs(16),
    paddingTop: rvs(12),
    paddingBottom: rvs(14),
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: rs(8) },
  iconBtn: { padding: rs(2) },
  headerTitle: { fontSize: rms(18), fontWeight: "500", color: "#000" },
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
  actionRow: { flexDirection: "row", gap: rs(8), marginTop: rvs(10) },
  secondaryBtn: {
    flex: 1,
    minHeight: rvs(40),
    borderRadius: rs(10),
    borderWidth: 1,
    borderColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  secondaryBtnText: { color: "#1D4ED8", fontSize: rms(12), fontWeight: "600" },
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
