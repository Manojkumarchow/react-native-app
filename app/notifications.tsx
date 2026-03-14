import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { BASE_URL } from "./config";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import useProfileStore from "./store/profileStore";
import { getErrorMessage } from "./services/error";

type BackendNotification = {
  id: number;
  title: string;
  message: string;
  type: string;
  createdAt: string;
};

type UIType = "ALERT" | "SUCCESS" | "INFO";
type FilterType = "ALL" | UIType;

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  type: UIType;
  timeLabel: string;
};

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "ALERT", label: "Alerts" },
  { key: "SUCCESS", label: "Success" },
  { key: "INFO", label: "Info" },
];

const FIGMA_AD_IMAGE =
  "https://www.figma.com/api/mcp/asset/d254e125-014c-43ea-b7a1-01f8f35dc9ba";

export default function NotificationsScreen() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const phone = useProfileStore((s) => s.phone);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      if (!phone) {
        setItems([]);
        setErrorText("Profile phone is missing. Please login again.");
        setLoading(false);
        return;
      }
      try {
        setErrorText(null);
        const res = await axios.get(`${BASE_URL}/notifications`, {
          params: { phone },
        });
        const mapped = Array.isArray(res.data)
          ? (res.data as BackendNotification[]).map((n) => ({
              id: String(n.id),
              title: n.title || "Notification",
              description: n.message || "",
              type: mapBackendTypeToUI(n.type),
              timeLabel: toRelativeTime(n.createdAt),
            }))
          : [];
        setItems(mapped);
      } catch (error) {
        setItems([]);
        setErrorText(getErrorMessage(error, "Unable to fetch notifications."));
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [phone]);

  const filtered = useMemo(
    () => (activeFilter === "ALL" ? items : items.filter((x) => x.type === activeFilter)),
    [items, activeFilter],
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.screen}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#181818" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {FILTERS.map((f) => {
              const active = activeFilter === f.key;
              return (
                <Pressable
                  key={f.key}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setActiveFilter(f.key)}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>{f.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.adCard}>
            <Image source={{ uri: FIGMA_AD_IMAGE }} style={styles.adImage} resizeMode="cover" />
            <View style={styles.adOverlay}>
              <Text style={styles.adTitle}>Sponsored</Text>
              <Text style={styles.adSub}>Ad placeholder</Text>
            </View>
          </View>

          {errorText ? <Text style={styles.hintText}>{errorText}</Text> : null}

          {loading ? (
            <ActivityIndicator size="large" color="#1C98ED" style={{ marginTop: 22 }} />
          ) : filtered.length === 0 ? (
            <Text style={styles.hintText}>No notifications available.</Text>
          ) : (
            filtered.map((item) => {
            const isAlert = item.type === "ALERT";
            const isSuccess = item.type === "SUCCESS";
            const color = isAlert ? "#C1282D" : isSuccess ? "#15803D" : "#1C98ED";
            const badgeBg = isAlert
              ? "rgba(220,38,38,0.12)"
              : isSuccess
                ? "rgba(22,163,74,0.12)"
                : "rgba(28,152,237,0.12)";
              return (
              <View key={item.id} style={styles.card}>
                <View style={[styles.leftAccent, { backgroundColor: color }]} />
                <View style={styles.cardBody}>
                  <View style={styles.rowTop}>
                    <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                      <Text style={[styles.badgeText, { color }]}>
                        {isAlert ? "Alert" : isSuccess ? "Success" : "Info"}
                      </Text>
                    </View>
                    <Text style={styles.time}>{item.timeLabel}</Text>
                  </View>
                  <Ionicons
                    name={
                      isAlert
                        ? "alert-circle-outline"
                        : isSuccess
                          ? "checkmark-circle-outline"
                          : "information-circle-outline"
                    }
                    size={20}
                    color={color}
                    style={styles.icon}
                  />
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.desc}>{item.description}</Text>
                </View>
              </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function mapBackendTypeToUI(type: string): UIType {
  switch ((type || "").toUpperCase()) {
    case "ALERT":
      return "ALERT";
    case "SUCCESS":
      return "SUCCESS";
    default:
      return "INFO";
  }
}

function toRelativeTime(date: string): string {
  const t = new Date(date).getTime();
  if (Number.isNaN(t)) return "Just now";
  const mins = Math.max(1, Math.floor((Date.now() - t) / 60000));
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FAFAFA" },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  backBtn: { marginRight: 8, padding: 4 },
  headerTitle: { color: "#000000", fontSize: 18, fontWeight: "500" },
  content: { paddingTop: 14, paddingHorizontal: 12, paddingBottom: 28 },
  filterRow: { gap: 10, paddingHorizontal: 4, paddingBottom: 12 },
  filterChip: {
    borderWidth: 1,
    borderColor: "#1C98ED",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    minWidth: 92,
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  filterChipActive: { backgroundColor: "#1C98ED" },
  filterText: { fontSize: 14, color: "#1C98ED", fontWeight: "500" },
  filterTextActive: { color: "#FAFAFA" },
  adCard: {
    height: 118,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  adImage: { width: "100%", height: "100%" },
  adOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  adTitle: { color: "#FFF", fontSize: 12, fontWeight: "700" },
  adSub: { color: "#F8FAFC", fontSize: 11, marginTop: 2 },
  hintText: { fontSize: 12, color: "#64748B", marginBottom: 10, marginLeft: 2 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    marginBottom: 12,
    flexDirection: "row",
  },
  leftAccent: { width: 6 },
  cardBody: { flex: 1, paddingHorizontal: 14, paddingVertical: 12 },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  time: { fontSize: 11, color: "#94A3B8" },
  icon: { marginBottom: 8 },
  title: { fontSize: 14, fontWeight: "600", color: "#0F172A" },
  desc: { fontSize: 12, color: "#64748B", marginTop: 6, lineHeight: 18 },
});
