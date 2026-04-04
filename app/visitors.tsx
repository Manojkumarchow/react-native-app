import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";

import { BASE_URL } from "./config";
import useBuildingStore from "./store/buildingStore";
import { getErrorMessage } from "./services/error";
import { rms, rs, rvs } from "@/constants/responsive";
import { VISITOR_PURPOSE_LABELS } from "@/constants/visitorPurposeLabels";

function istTodayYmd(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function addDaysIST(ymd: string, delta: number): string {
  const t = new Date(`${ymd}T12:00:00+05:30`).getTime() + delta * 86400000;
  return new Date(t).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function formatHeaderDate(ymd: string): string {
  if (ymd === istTodayYmd()) return "Today";
  const d = new Date(`${ymd}T12:00:00+05:30`);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function formatVisitDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

type VisitorRow = {
  id: string;
  visitorName: string;
  visitorPhone: string;
  purpose: string;
  visitedFlatNo: string;
  visitAt: string;
  notes?: string;
};

export default function VisitorsScreen() {
  const router = useRouter();
  const buildingId = useBuildingStore((s) => s.buildingId);
  const [selectedYmd, setSelectedYmd] = useState(istTodayYmd);
  const [rows, setRows] = useState<VisitorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState("");

  const fetchVisitors = useCallback(async () => {
    if (!buildingId) {
      setRows([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      setErrorText("");
      const res = await axios.get(`${BASE_URL}/visitors/building/${buildingId}`, {
        params: { date: selectedYmd },
      });
      const list = Array.isArray(res.data) ? res.data : [];
      setRows(
        list.map((item: any, idx: number) => ({
          id: String(item.id ?? idx),
          visitorName: String(item.visitorName ?? "—"),
          visitorPhone: String(item.visitorPhone ?? ""),
          purpose: String(item.purpose ?? "OTHER"),
          visitedFlatNo: String(item.visitedFlatNo ?? "—"),
          visitAt: item.visitAt != null ? String(item.visitAt) : "",
          notes: item.notes != null && String(item.notes).trim() ? String(item.notes).trim() : undefined,
        })),
      );
    } catch (error) {
      setRows([]);
      setErrorText(getErrorMessage(error, "Unable to load visitors."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [buildingId, selectedYmd]);

  useEffect(() => {
    setLoading(true);
    void fetchVisitors();
  }, [fetchVisitors]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchVisitors();
  }, [fetchVisitors]);

  const purposeLabel = useCallback(
    (code: string) => VISITOR_PURPOSE_LABELS[code] ?? code.replace(/_/g, " "),
    [],
  );

  const subtitle = useMemo(
    () => (buildingId ? `${formatHeaderDate(selectedYmd)} · ${selectedYmd}` : "Select a building"),
    [buildingId, selectedYmd],
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="arrow-left" size={24} color="#181818" />
            </Pressable>
            <View style={styles.headerTitles}>
              <Text style={styles.headerTitle}>Visitors</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.dateRow}>
            <Pressable
              style={styles.dateNavBtn}
              onPress={() => setSelectedYmd((d) => addDaysIST(d, -1))}
              hitSlop={12}
            >
              <Ionicons name="chevron-back" size={22} color="#1C98ED" />
            </Pressable>
            <View style={styles.dateCenter}>
              <MaterialCommunityIcons name="calendar-month-outline" size={18} color="#64748B" />
              <Text style={styles.dateCenterText}>{formatHeaderDate(selectedYmd)}</Text>
            </View>
            <Pressable
              style={styles.dateNavBtn}
              onPress={() => setSelectedYmd((d) => addDaysIST(d, 1))}
              hitSlop={12}
            >
              <Ionicons name="chevron-forward" size={22} color="#1C98ED" />
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1C98ED" />
          }
        >
          {!buildingId ? (
            <Text style={styles.hint}>No building selected. Switch building from home if you manage more than one.</Text>
          ) : null}

          {buildingId && loading ? (
            <ActivityIndicator size="large" color="#1C98ED" style={styles.loader} />
          ) : null}

          {!!errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

          {buildingId && !loading && !errorText && rows.length === 0 ? (
            <Text style={styles.emptyText}>No visitors logged for this day.</Text>
          ) : null}

          {rows.map((v) => (
            <View key={v.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.name}>{v.visitorName}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{purposeLabel(v.purpose)}</Text>
                </View>
              </View>
              <View style={styles.row}>
                <Ionicons name="home-outline" size={16} color="#64748B" />
                <Text style={styles.rowText}>Flat {v.visitedFlatNo}</Text>
              </View>
              <View style={styles.row}>
                <Ionicons name="time-outline" size={16} color="#64748B" />
                <Text style={styles.rowText}>{v.visitAt ? formatVisitDateTime(v.visitAt) : "—"}</Text>
              </View>
              {v.visitorPhone ? (
                <Pressable
                  style={styles.phoneRow}
                  onPress={() => Linking.openURL(`tel:${v.visitorPhone.replace(/\s+/g, "")}`)}
                >
                  <Ionicons name="call-outline" size={18} color="#1C98ED" />
                  <Text style={styles.phoneText}>{v.visitorPhone}</Text>
                </Pressable>
              ) : (
                <Text style={styles.muted}>No phone</Text>
              )}
              {v.notes ? (
                <Text style={styles.notesText} numberOfLines={4}>
                  Note: {v.notes}
                </Text>
              ) : null}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAFAFA" },
  headerCard: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: rs(16),
    paddingBottom: rvs(12),
    borderBottomLeftRadius: rs(24),
    borderBottomRightRadius: rs(24),
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: rvs(8),
    gap: rs(8),
  },
  backBtn: { padding: rs(4) },
  headerTitles: { flex: 1, minWidth: 0 },
  headerSpacer: { width: rs(32) },
  headerTitle: { fontSize: rms(20), fontWeight: "600", color: "#0F172A" },
  headerSubtitle: { fontSize: rms(13), color: "#64748B", marginTop: rvs(2) },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: rvs(14),
    paddingHorizontal: rs(4),
  },
  dateNavBtn: { padding: rs(8) },
  dateCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
  },
  dateCenterText: { fontSize: rms(16), fontWeight: "600", color: "#0F172A" },
  listContent: {
    paddingHorizontal: rs(16),
    paddingTop: rvs(16),
    paddingBottom: rvs(36),
    gap: rvs(12),
  },
  loader: { marginTop: rvs(24) },
  hint: { fontSize: rms(14), color: "#64748B", textAlign: "center", marginTop: rvs(24) },
  errorText: { fontSize: rms(14), color: "#C81616", textAlign: "center", marginTop: rvs(12) },
  emptyText: { fontSize: rms(15), color: "#64748B", textAlign: "center", marginTop: rvs(32) },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: rs(16),
    padding: rs(16),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: rvs(10),
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: rs(10),
  },
  name: { flex: 1, fontSize: rms(17), fontWeight: "600", color: "#0F172A" },
  badge: {
    backgroundColor: "rgba(28,152,237,0.12)",
    paddingHorizontal: rs(10),
    paddingVertical: rvs(4),
    borderRadius: 999,
  },
  badgeText: { fontSize: rms(11), fontWeight: "600", color: "#1C98ED" },
  row: { flexDirection: "row", alignItems: "center", gap: rs(8) },
  rowText: { fontSize: rms(14), color: "#475569" },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
    marginTop: rvs(4),
  },
  phoneText: { fontSize: rms(15), fontWeight: "500", color: "#1C98ED" },
  muted: { fontSize: rms(13), color: "#94A3B8" },
  notesText: { fontSize: rms(13), color: "#64748B", marginTop: rvs(4), fontStyle: "italic" },
});
