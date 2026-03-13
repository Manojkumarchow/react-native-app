import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import useProfileStore from "./store/profileStore";
import useBuildingStore from "./store/buildingStore";
import { BASE_URL } from "./config";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
type FilterTab = "OPEN" | "IN_PROGRESS" | "RESOLVED";

type Ticket = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  raisedBy: string;
  flatNumber: string;
  imageUrl: string;
};

const HALLWAY_PHOTO =
  "https://www.figma.com/api/mcp/asset/d254e125-014c-43ea-b7a1-01f8f35dc9ba";

const FALLBACK_TICKETS: Ticket[] = [
  {
    id: "ISS123567",
    title: "Staircase light not working on 3rd floor.",
    description:
      "All three lights in the 3rd floor corridor are off. Emergency lights are on, but main lights are not switching on.",
    status: "OPEN",
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    raisedBy: "RAHUL",
    flatNumber: "302",
    imageUrl: HALLWAY_PHOTO,
  },
  {
    id: "ISS123568",
    title: "Water leakage near Block B lift lobby.",
    description:
      "Water seepage observed near the lift area. Requires maintenance inspection and immediate fix.",
    status: "IN_PROGRESS",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 60000).toISOString(),
    raisedBy: "KIRAN",
    flatNumber: "204",
    imageUrl: HALLWAY_PHOTO,
  },
  {
    id: "ISS123569",
    title: "Main gate lock issue fixed",
    description:
      "Main gate lock mechanism has been repaired and tested successfully.",
    status: "RESOLVED",
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 60000).toISOString(),
    raisedBy: "PRIYA",
    flatNumber: "401",
    imageUrl: HALLWAY_PHOTO,
  },
];

const tabOptions: { key: FilterTab; label: string }[] = [
  { key: "OPEN", label: "Open" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "RESOLVED", label: "Resolved" },
];

const normalizeStatus = (item: any): TicketStatus => {
  const raw = String(item?.status || item?.issueStatus || "").toUpperCase();
  if (item?.resolved === true || raw.includes("RESOLVED")) return "RESOLVED";
  if (raw.includes("PROGRESS") || raw.includes("PENDING")) return "IN_PROGRESS";
  return "OPEN";
};

const timeLabel = (dateStr: string, status: TicketStatus) => {
  const t = new Date(dateStr).getTime();
  if (Number.isNaN(t)) return status === "OPEN" ? "Posted just now" : "Updated just now";
  const min = Math.max(1, Math.floor((Date.now() - t) / 60000));
  if (min < 60) return `${status === "OPEN" ? "Posted" : "Updated"} ${min}min ago`;
  const hr = Math.floor(min / 60);
  return `${status === "OPEN" ? "Posted" : "Updated"} ${hr}h ago`;
};

export default function AllTicketsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    status?: string;
    updatedId?: string;
    updatedStatus?: string;
  }>();

  const username = useProfileStore((s) => s.phone);
  const role = useProfileStore((s) => s.role);
  const profileId = useBuildingStore((s) => s.adminPhone);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("OPEN");

  const fetchTickets = async (resolvedUsername?: string | null, resolvedProfileId?: string | null) => {
    try {
      setLoading(true);
      const url =
        role === "ADMIN"
          ? `${BASE_URL}/issues/assignee/${resolvedProfileId}`
          : `${BASE_URL}/issues/profile/${resolvedUsername}`;

      const res = await axios.get(url);
      const mapped: Ticket[] = Array.isArray(res.data)
        ? res.data.filter(Boolean).map((item: any, index: number) => ({
            id: String(item.complaintId ?? item.id ?? `ISS${index + 1000}`),
            title: item.title ?? "Untitled issue",
            description: item.description ?? "",
            status: normalizeStatus(item),
            createdAt: item.createdAt ?? new Date().toISOString(),
            updatedAt: item.updatedAt ?? item.createdAt ?? new Date().toISOString(),
            raisedBy: item.raisedBy ?? "-",
            flatNumber: String(item.flatNumber ?? "-"),
            imageUrl:
              Array.isArray(item.imageUrls) && item.imageUrls.length
                ? String(item.imageUrls[0]).startsWith("http")
                  ? item.imageUrls[0]
                  : `${BASE_URL}${item.imageUrls[0]}`
                : HALLWAY_PHOTO,
          }))
        : [];

      if (mapped.length === 0) {
        setTickets(FALLBACK_TICKETS);
        setUsingFallback(true);
      } else {
        setTickets(mapped);
        setUsingFallback(false);
      }
    } catch (err) {
      console.error("Fetch tickets error:", err);
      setTickets(FALLBACK_TICKETS);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!username) return;
    if (role === "ADMIN" && !profileId) return;
    fetchTickets(username, profileId);
  }, [username, profileId, role]);

  useEffect(() => {
    if (params.status && ["OPEN", "IN_PROGRESS", "RESOLVED"].includes(params.status.toUpperCase())) {
      setActiveTab(params.status.toUpperCase() as FilterTab);
    }
  }, [params.status]);

  useEffect(() => {
    if (!params.updatedId || !params.updatedStatus) return;
    const nextStatus = params.updatedStatus.toUpperCase() as TicketStatus;
    setTickets((prev) =>
      prev.map((item) =>
        item.id === params.updatedId
          ? {
              ...item,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
    if (["OPEN", "IN_PROGRESS", "RESOLVED"].includes(nextStatus)) {
      setActiveTab(nextStatus);
    }
  }, [params.updatedId, params.updatedStatus]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTickets(username, profileId).finally(() => setRefreshing(false));
  }, [username, profileId, role]);

  const filteredTickets = useMemo(
    () => tickets.filter((item) => item.status === activeTab),
    [tickets, activeTab],
  );

  const renderCard = ({ item }: { item: Ticket }) => {
    const statusConfig =
      item.status === "OPEN"
        ? {
            idColor: "#C81616",
            pillBg: "rgba(255,86,86,0.1)",
            pillText: "#C81616",
            label: "Open",
          }
        : item.status === "IN_PROGRESS"
          ? {
              idColor: "#A16207",
              pillBg: "rgba(255,232,131,0.33)",
              pillText: "#A16207",
              label: "In Progress",
            }
          : {
              idColor: "#36A033",
              pillBg: "#DCFCE7",
              pillText: "#36A033",
              label: "Resolved",
            };

    return (
      <Pressable
        style={styles.ticketCard}
        onPress={() =>
          router.push({
            pathname: "/ticket-detail",
            params: {
              id: item.id,
              title: item.title,
              description: item.description,
              status: item.status,
              raisedBy: item.raisedBy,
              flatNumber: item.flatNumber,
              postedAt: timeLabel(item.createdAt, "OPEN"),
              imageUrl: item.imageUrl,
            },
          } as never)
        }
      >
        <View style={styles.ticketTop}>
          <Text style={[styles.ticketId, { color: statusConfig.idColor }]}>{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.pillBg }]}>
            <Text style={[styles.statusDot, { color: statusConfig.pillText }]}>•</Text>
            <Text style={[styles.statusText, { color: statusConfig.pillText }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>
        <Text style={styles.ticketTitle}>{item.title}</Text>
        <Text style={styles.ticketTime}>
          {timeLabel(item.status === "OPEN" ? item.createdAt : item.updatedAt, item.status)}
        </Text>
      </Pressable>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerCard}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#181818" />
          </Pressable>
          <Text style={styles.headerTitle}>Issues</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {tabOptions.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {usingFallback && (
          <Text style={styles.fallbackHint}>
            Showing sample issues because backend returned empty/error.
          </Text>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#1C98ED" style={{ marginTop: 28 }} />
        ) : (
          <FlatList
            data={filteredTickets}
            keyExtractor={(item) => item.id}
            renderItem={renderCard}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyTitle}>No issues found</Text>
                <Text style={styles.emptySub}>Try a different status filter.</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAFAFA" },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  backBtn: { marginRight: 8, padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "500", color: "#000000" },
  tabRow: { paddingTop: 14, paddingHorizontal: 16, gap: 10, paddingBottom: 12 },
  filterChip: {
    minWidth: 138,
    height: 44,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1C98ED",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFA",
  },
  filterChipActive: { backgroundColor: "#1C98ED" },
  filterText: { color: "#1C98ED", fontSize: 16, fontWeight: "400" },
  filterTextActive: { color: "#FAFAFA" },
  fallbackHint: { color: "#64748B", fontSize: 12, marginHorizontal: 16, marginBottom: 6 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  ticketCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 8,
    padding: 12,
    minHeight: 109,
    justifyContent: "center",
  },
  ticketTop: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  ticketId: { flex: 1, fontSize: 14, fontWeight: "500" },
  statusBadge: {
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  statusDot: { fontSize: 10, fontWeight: "700" },
  statusText: { fontSize: 10, fontWeight: "400" },
  ticketTitle: { fontSize: 14, fontWeight: "500", color: "#000000", marginBottom: 7 },
  ticketTime: { fontSize: 10, color: "#A1A1AA", fontWeight: "400" },
  emptyWrap: { alignItems: "center", marginTop: 48 },
  emptyTitle: { color: "#111827", fontWeight: "600", fontSize: 16, marginBottom: 4 },
  emptySub: { color: "#6B7280", fontSize: 13 },
});
