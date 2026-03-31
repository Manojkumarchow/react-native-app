import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import useProfileStore from "./store/profileStore";
import { acceptServiceOrder, rejectServiceOrder } from "./services/service-person-pool.service";
import { getErrorMessage } from "./services/error";
import { rms, rs, rvs } from "@/constants/responsive";

const BRAND_BLUE = "#1c98ed";

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

export default function ServicePersonOrderDetailScreen() {
  const router = useRouter();
  const phone = useProfileStore((s) => s.phone);

  const params = useLocalSearchParams<{
    orderId?: string;
    category?: string;
    subcategory?: string;
    description?: string;
    location?: string;
    date?: string;
    timeSlot?: string;
    buildingName?: string;
    bookingPersonName?: string;
    bookingPersonPhone?: string;
    optionId?: string;
    amount?: string;
  }>();

  const [submitting, setSubmitting] = useState(false);

  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId ?? "";

  const dateTimeLabel = useMemo(() => {
    const dateStr = Array.isArray(params.date) ? params.date[0] : params.date;
    const timeSlot = Array.isArray(params.timeSlot) ? params.timeSlot[0] : params.timeSlot;
    if (!dateStr) return `-- · ${timeSlot ?? "--"}`;
    const d = new Date(dateStr);
    const dateLabel = Number.isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    return `${dateLabel} · ${timeSlot ?? "--"}`;
  }, [params.date, params.timeSlot]);

  const category = useMemo(() => (Array.isArray(params.category) ? params.category[0] : params.category ?? "Service"), [params.category]);
  const subcategory = useMemo(() => (Array.isArray(params.subcategory) ? params.subcategory[0] : params.subcategory ?? ""), [params.subcategory]);
  const description = useMemo(() => (Array.isArray(params.description) ? params.description[0] : params.description ?? ""), [params.description]);
  const location = useMemo(() => (Array.isArray(params.location) ? params.location[0] : params.location ?? ""), [params.location]);

  const buildingName = useMemo(
    () => (Array.isArray(params.buildingName) ? params.buildingName[0] : params.buildingName ?? ""),
    [params.buildingName],
  );
  const bookingPersonName = useMemo(
    () => (Array.isArray(params.bookingPersonName) ? params.bookingPersonName[0] : params.bookingPersonName ?? ""),
    [params.bookingPersonName],
  );
  const bookingPersonPhone = useMemo(
    () => (Array.isArray(params.bookingPersonPhone) ? params.bookingPersonPhone[0] : params.bookingPersonPhone ?? ""),
    [params.bookingPersonPhone],
  );

  const amount = useMemo(() => {
    const raw = Array.isArray(params.amount) ? params.amount[0] : params.amount;
    const n = raw ? Number(raw) : 0;
    return Number.isNaN(n) ? 0 : n;
  }, [params.amount]);

  const onAccept = async () => {
    if (!phone || !orderId) return;
    try {
      setSubmitting(true);
      await acceptServiceOrder(phone, orderId);
      Toast.show({ type: "success", text1: "Order accepted", text2: "You are assigned for this request." });
      router.replace("/service-person-orders");
    } catch (e) {
      Toast.show({ type: "error", text1: "Unable to accept", text2: getErrorMessage(e, "Please try again.") });
    } finally {
      setSubmitting(false);
    }
  };

  const onReject = async () => {
    if (!phone || !orderId) return;
    try {
      setSubmitting(true);
      await rejectServiceOrder(phone, orderId);
      Toast.show({ type: "success", text1: "Order rejected", text2: "This request will no longer be shown to you." });
      router.replace("/service-person-orders");
    } catch (e) {
      Toast.show({ type: "error", text1: "Unable to reject", text2: getErrorMessage(e, "Please try again.") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerCard}>
            <View style={styles.headerRow}>
              <Pressable style={styles.iconBtn} onPress={() => router.back()}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#181818" />
              </Pressable>
              <Text style={styles.headerTitle}>Order Summary</Text>
              <View style={styles.spacer} />
            </View>
          </View>

          <View style={styles.mainCard}>
            <View style={styles.topInfo}>
              <View style={styles.iconBubble}>
                <MaterialCommunityIcons name="tools" size={18} color={BRAND_BLUE} />
              </View>
              <View>
                <Text style={styles.mainTitle}>{subcategory || "Service Request"}</Text>
                <Text style={styles.mainSub}>{category}</Text>
              </View>
            </View>

            <View style={styles.line} />

            <InfoRow label="Category" value={category} />
            <InfoRow label="Subcategory" value={subcategory || "--"} />
            <InfoRow label="Description" value={description || "--"} />
            <InfoRow label="Location" value={location || "--"} />
            <InfoRow label="Date & Time" value={dateTimeLabel} />
            <InfoRow label="Building Name" value={buildingName || "--"} />
            <InfoRow
              label="Booking Person"
              value={`${bookingPersonName || "--"}${bookingPersonPhone ? ` (${bookingPersonPhone})` : ""}`}
              valueColor="#2899CF"
            />
            <InfoRow label="Amount" value={`₹${amount}`} />
          </View>

          <View style={styles.actionsWrap}>
            <Pressable style={[styles.secondaryBtn, styles.acceptBtn]} onPress={onAccept} disabled={submitting}>
              <Text style={styles.acceptText}>{submitting ? "Processing..." : "Accept Order"}</Text>
            </Pressable>
            <Pressable style={styles.rejectBtn} onPress={onReject} disabled={submitting}>
              <Text style={styles.rejectText}>Reject Order</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  content: { padding: rs(16), paddingBottom: rvs(24) },
  headerCard: {
    marginTop: rvs(8),
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: rs(24),
    borderBottomRightRadius: rs(24),
    borderBottomColor: "#F1F5F9",
    borderBottomWidth: 1,
    paddingHorizontal: rs(16),
    paddingTop: rvs(10),
    paddingBottom: rvs(14),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  headerTitle: { flex: 1, fontSize: rms(20), fontWeight: "700", color: "#0F172A", textAlign: "center" },
  iconBtn: { padding: rs(2) },
  spacer: { width: rs(24) },
  mainCard: {
    backgroundColor: "#fff",
    borderRadius: rs(18),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: rs(16),
    marginTop: rvs(16),
  },
  topInfo: { flexDirection: "row", gap: rs(12), alignItems: "center" },
  iconBubble: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    backgroundColor: "rgba(39,153,206,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  mainTitle: { fontSize: rms(18), fontWeight: "700", color: "#0F172A", marginBottom: rvs(2) },
  mainSub: { fontSize: rms(13), color: "#64748B", fontWeight: "600" },
  line: { height: 1, backgroundColor: "#E5E7EB", marginVertical: rvs(12) },
  infoRow: { marginBottom: rvs(12) },
  infoLabel: { fontSize: rms(12), color: "#64748B", fontWeight: "600", marginBottom: rvs(4) },
  infoValue: { fontSize: rms(14), color: "#0F172A" },
  actionsWrap: { marginTop: rvs(18), gap: rvs(12) },
  secondaryBtn: {
    borderRadius: rs(14),
    paddingVertical: rvs(14),
    alignItems: "center",
    justifyContent: "center",
  },
  acceptBtn: { backgroundColor: BRAND_BLUE },
  acceptText: { color: "#fff", fontSize: rms(15), fontWeight: "700" },
  rejectBtn: {
    borderRadius: rs(14),
    paddingVertical: rvs(14),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  rejectText: { color: "#DC2626", fontSize: rms(15), fontWeight: "700" },
});

