import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getBookings, type BookingRecord } from "./data/homeServicesData";
import { SafeAreaView } from "react-native-safe-area-context";
import { rms, rs, rvs } from "@/constants/responsive";

type TabKey = "issues" | "history";

export default function MyBookingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<TabKey>(params.tab === "issues" ? "issues" : "history");
  const [historyFilter, setHistoryFilter] = useState<"ALL" | "COMPLETED" | "CANCELLED" | "CONFIRMED">("ALL");
  const [issueFilter, setIssueFilter] = useState<"ALL" | "OPEN" | "CLOSED" | "RESOLVED">("ALL");

  const bookings = getBookings();
  const historyItems = useMemo(
    () =>
      bookings.filter((item) =>
        historyFilter === "ALL" ? true : item.status === historyFilter
      ),
    [bookings, historyFilter]
  );
  const issueItems = useMemo(
    () =>
      bookings.filter((item) =>
        item.issueStatus ? (issueFilter === "ALL" ? true : item.issueStatus === issueFilter) : false
      ),
    [bookings, issueFilter]
  );

  const items = tab === "history" ? historyItems : issueItems;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Pressable style={styles.iconBtn} onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#181818" />
            </Pressable>
            <Text style={styles.headerTitle}>My Bookings</Text>
          </View>
          <View style={styles.tabWrap}>
            <Pressable style={[styles.tab, tab === "issues" && styles.tabActive]} onPress={() => setTab("issues")}>
              <Text style={[styles.tabText, tab === "issues" && styles.tabTextActive]}>Issues</Text>
            </Pressable>
            <Pressable style={[styles.tab, tab === "history" && styles.tabActive]} onPress={() => setTab("history")}>
              <Text style={[styles.tabText, tab === "history" && styles.tabTextActive]}>History</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {(tab === "history"
              ? [
                  { key: "ALL", label: "All" },
                  { key: "COMPLETED", label: "Completed" },
                  { key: "CANCELLED", label: "Canceled" },
                  { key: "CONFIRMED", label: "Scheduled" },
                ]
              : [
                  { key: "ALL", label: "All" },
                  { key: "OPEN", label: "Open" },
                  { key: "CLOSED", label: "Closed" },
                  { key: "RESOLVED", label: "Resolved" },
                ]
            ).map((chip) => {
              const active = tab === "history" ? historyFilter === chip.key : issueFilter === chip.key;
              return (
                <Pressable
                  key={chip.key}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() =>
                    tab === "history"
                      ? setHistoryFilter(chip.key as any)
                      : setIssueFilter(chip.key as any)
                  }
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>{chip.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {items.length ? (
            items.map((booking) => (
              <Pressable
                key={booking.id}
                style={[
                  styles.bookingCard,
                  tab === "issues" && booking.issueStatus === "OPEN" ? styles.issueCardBorder : undefined,
                ]}
                onPress={() => router.push({ pathname: "/booking-detail", params: { bookingId: booking.id } } as never)}
              >
                <View style={styles.cardTop}>
                  <View style={styles.leftTop}>
                    <View style={styles.iconCircle}>
                      <MaterialCommunityIcons name="tools" size={18} color="#2563EB" />
                    </View>
                    <View>
                      <Text style={styles.cardTitle}>{booking.optionTitle}</Text>
                      <Text style={styles.cardSub}>{booking.providerName}</Text>
                    </View>
                  </View>
                  <StatusPill booking={booking} />
                </View>
                <View style={styles.cardBottom}>
                  <Text style={styles.dateText}>
                    {booking.dateLabel} · {booking.timeLabel}
                  </Text>
                  <Text style={styles.amountText}>₹{booking.amount}</Text>
                </View>

                {tab === "issues" && booking.issueStatus ? (
                  <View style={styles.issueInfo}>
                    <Text style={styles.issueInfoText}>Issue Raised .{booking.issueStatus}</Text>
                  </View>
                ) : null}
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No bookings found for this filter.</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function StatusPill({ booking }: { booking: BookingRecord }) {
  if (booking.status === "CONFIRMED") {
    return (
      <View style={[styles.statusPill, { backgroundColor: "rgba(39,153,206,0.1)" }]}>
        <Text style={[styles.statusText, { color: "#1C98ED" }]}>Confirmed</Text>
      </View>
    );
  }
  if (booking.status === "COMPLETED") {
    return (
      <View style={[styles.statusPill, { backgroundColor: "rgba(5,150,105,0.1)" }]}>
        <Text style={[styles.statusText, { color: "#059669" }]}>Completed</Text>
      </View>
    );
  }
  return (
    <View style={[styles.statusPill, { backgroundColor: "rgba(220,38,38,0.12)" }]}>
      <Text style={[styles.statusText, { color: "#DC2626" }]}>Cancelled</Text>
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
    paddingBottom: rvs(12),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: rs(8) },
  iconBtn: { padding: rs(2) },
  headerTitle: { fontSize: rms(18), fontWeight: "500", color: "#000" },
  tabWrap: {
    marginTop: rvs(12),
    backgroundColor: "#F1F5F9",
    borderRadius: rs(24),
    padding: rs(4),
    flexDirection: "row",
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: rs(16), paddingVertical: rvs(8) },
  tabActive: { backgroundColor: "#FFFFFF" },
  tabText: { color: "#64748B", fontSize: rms(14), fontWeight: "500" },
  tabTextActive: { color: "#2899CF" },
  content: { paddingHorizontal: rs(16), paddingTop: rvs(14), paddingBottom: rvs(28), gap: rvs(14) },
  filterRow: { gap: rs(10), paddingBottom: rvs(4) },
  filterChip: {
    borderWidth: 1,
    borderColor: "#1C98ED",
    borderRadius: rs(24),
    minWidth: rs(110),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rvs(10),
    paddingHorizontal: rs(16),
    backgroundColor: "#FFFFFF",
  },
  filterChipActive: { backgroundColor: "#1C98ED" },
  filterText: { fontSize: rms(14), color: "#1C98ED" },
  filterTextActive: { color: "#FAFAFA" },
  bookingCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: rs(24),
    backgroundColor: "#FFFFFF",
    padding: rs(16),
    gap: rvs(10),
  },
  issueCardBorder: { borderColor: "#DC2626" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  leftTop: { flexDirection: "row", alignItems: "center", gap: rs(12), flex: 1, paddingRight: rs(8) },
  iconCircle: {
    width: rs(48),
    height: rs(48),
    borderRadius: rs(16),
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: rms(16), color: "#0F172A", fontWeight: "600", flexShrink: 1 },
  cardSub: { fontSize: rms(13), color: "#64748B", marginTop: rvs(2) },
  statusPill: { borderRadius: rs(8), paddingHorizontal: rs(8), paddingVertical: rvs(2), maxWidth: rs(96), alignSelf: "flex-start" },
  statusText: { fontSize: rms(11), fontWeight: "500" },
  cardBottom: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: rvs(12),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: { fontSize: rms(13), color: "#475569", fontWeight: "500" },
  amountText: { fontSize: rms(22), color: "#0F172A", fontWeight: "700" },
  issueInfo: {
    backgroundColor: "rgba(220,38,38,0.12)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  issueInfoText: { fontSize: 14, color: "#C81616", fontWeight: "500" },
  emptyWrap: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { fontSize: 14, color: "#64748B" },
});
