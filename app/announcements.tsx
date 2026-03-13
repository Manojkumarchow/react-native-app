import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { BASE_URL } from "./config";
import useBuildingStore from "./store/buildingStore";
import { getErrorMessage } from "./services/error";

type UpdateKind = "Notice" | "Announcements" | "Events";
type FeedFilter = "All" | UpdateKind;

const FEED_FILTERS: FeedFilter[] = ["All", "Notice", "Announcements", "Events"];
const FEED_ITEMS: Array<{
  id: string;
  type: UpdateKind;
  title: string;
  body: string;
  time: string;
}> = [
  {
    id: "notice-1",
    type: "Notice",
    title: "Water Supply Maintenance",
    body: "Regular cleaning of overhead tanks scheduled for tomorrow between 10 AM to 2 PM.",
    time: "2 hours ago",
  },
  {
    id: "notice-2",
    type: "Notice",
    title: "Lift Service Window",
    body: "Tower B lift maintenance is scheduled between 3 PM and 5 PM this evening.",
    time: "1 hour ago",
  },
  {
    id: "announcement-1",
    type: "Announcements",
    title: "Treasurer for the community is Mr. Govindh Ayyar",
    body: "Flag hoisting followed by cultural activities at the main clubhouse lawn.",
    time: "Aug 15, 09:00 AM",
  },
  {
    id: "event-1",
    type: "Events",
    title: "Independence Day Celebration",
    body: "Join all residents tomorrow at 10 AM near clubhouse for flag hoisting.",
    time: "2 hours ago",
  },
];

export default function Announcement() {
  const router = useRouter();
  const buildingId = useBuildingStore((s) => s.buildingId);
  const [activeTopTab, setActiveTopTab] = useState<"Updates" | "Chat">("Updates");
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("All");
  const [items, setItems] = useState(FEED_ITEMS);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchFeed = async () => {
      if (!buildingId) {
        setItems(FEED_ITEMS);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/community/feed/${buildingId}`);
        const feedItems = Array.isArray(res.data?.items) ? res.data.items : [];
        if (!feedItems.length) {
          setItems(FEED_ITEMS);
          return;
        }
        const mapped = feedItems.map((item: any) => ({
          id: String(item.id ?? `${item.type}-${Math.random()}`),
          type:
            item.type === "Announcements" || item.type === "Events" || item.type === "Notice"
              ? item.type
              : "Notice",
          title: item.title ?? "Untitled update",
          body: item.body ?? "",
          time: item.createdAt
            ? new Date(item.createdAt).toLocaleString()
            : "Just now",
        }));
        setItems(mapped);
      } catch (error) {
        console.log("Community feed error:", getErrorMessage(error));
        setItems(FEED_ITEMS);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, [buildingId]);

  const filteredItems = useMemo(() => {
    if (activeFilter === "All") return items;
    return items.filter((item) => item.type === activeFilter);
  }, [activeFilter, items]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#181818" />
            </Pressable>
            <Text style={styles.headerTitle}>Community</Text>
          </View>

          <View style={styles.topTabWrap}>
            <Pressable
              style={[styles.topTab, activeTopTab === "Updates" && styles.topTabActive]}
              onPress={() => setActiveTopTab("Updates")}
            >
              <Text
                style={[
                  styles.topTabText,
                  activeTopTab === "Updates" && styles.topTabTextActive,
                ]}
              >
                Updates
              </Text>
            </Pressable>
            <Pressable
              style={[styles.topTab, activeTopTab === "Chat" && styles.topTabActive]}
              onPress={() => setActiveTopTab("Chat")}
            >
              <Text
                style={[styles.topTabText, activeTopTab === "Chat" && styles.topTabTextActive]}
              >
                Chat
              </Text>
            </Pressable>
          </View>
        </View>

        {activeTopTab === "Updates" ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {FEED_FILTERS.map((item) => {
                const active = activeFilter === item;
                return (
                  <Pressable
                    key={item}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => setActiveFilter(item)}
                  >
                    <Text style={[styles.filterText, active && styles.filterTextActive]}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {loading ? (
              <ActivityIndicator size="large" color="#1C98ED" style={{ marginTop: 24 }} />
            ) : (
              filteredItems.map((item) => {
              const isAnnouncement = item.type === "Announcements";
              const isEvent = item.type === "Events";
              const accentColor = isAnnouncement
                ? "#A16207"
                : isEvent
                  ? "#1C98ED"
                  : "#C81616";
              const badgeStyle = isAnnouncement
                ? styles.badgeWarning
                : isEvent
                  ? styles.badgeBlue
                  : styles.badgeRed;

                return (
                <View key={item.id} style={styles.noticeCard}>
                  <View style={[styles.noticeAccent, { backgroundColor: accentColor }]} />
                  <View style={styles.noticeBody}>
                    <View style={styles.noticeTop}>
                      <Text style={[styles.noticeBadge, badgeStyle]}>{item.type}</Text>
                      <Text style={styles.noticeTime}>{item.time}</Text>
                    </View>
                    <Text style={styles.noticeTitle}>{item.title}</Text>
                    <Text style={styles.noticeDescription}>{item.body}</Text>
                    {isAnnouncement ? (
                      <View style={styles.metaRow}>
                        <View style={styles.metaChip}>
                          <Text style={styles.metaText}>Clubhouse</Text>
                        </View>
                        <View style={styles.metaChip}>
                          <Text style={styles.metaText}>+14 Participating</Text>
                        </View>
                      </View>
                    ) : null}
                  </View>
                </View>
                );
              })
            )}
          </ScrollView>
        ) : (
          <View style={styles.chatPlaceholder}>
            <View style={styles.chatIconCircle}>
              <Ionicons name="chatbubble-ellipses-outline" size={26} color="#1C98ED" />
            </View>
            <Text style={styles.chatTitle}>Community Chat</Text>
            <Text style={styles.chatText}>
              Chat will be enabled soon. For now, use the Updates tab to view notices,
              announcements, and events.
            </Text>
          </View>
        )}

        <View style={styles.bottomNav}>
          <Pressable style={styles.navItem} onPress={() => router.replace("/home")}>
            <Ionicons name="home-outline" size={20} color="#A1A1AA" />
            <Text style={styles.navLabel}>Home</Text>
          </Pressable>
          <Pressable style={styles.navItem} onPress={() => router.push("/payments")}>
            <Ionicons name="card-outline" size={20} color="#A1A1AA" />
            <Text style={styles.navLabel}>Payments</Text>
          </Pressable>
          <Pressable style={styles.navItem} onPress={() => router.replace("/announcements")}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#1C98ED" />
            <Text style={styles.navLabelActive}>Community</Text>
          </Pressable>
          <Pressable style={styles.navItem} onPress={() => router.push("/profile")}>
            <Ionicons name="person-outline" size={20} color="#A1A1AA" />
            <Text style={styles.navLabel}>Profile</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  headerCard: {
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backBtn: {
    padding: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
  },
  topTabWrap: {
    marginTop: 14,
    backgroundColor: "#F1F5F9",
    borderRadius: 24,
    padding: 4,
    flexDirection: "row",
  },
  topTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 10,
  },
  topTabActive: {
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  topTabText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  topTabTextActive: {
    color: "#2899CF",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 110,
  },
  filterRow: {
    gap: 10,
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: "#1C98ED",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 10,
    minWidth: 106,
    alignItems: "center",
  },
  filterChipActive: {
    backgroundColor: "#1C98ED",
  },
  filterText: {
    fontSize: 16,
    color: "#1C98ED",
    fontWeight: "400",
  },
  filterTextActive: {
    color: "#FAFAFA",
  },
  noticeCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    overflow: "hidden",
    marginBottom: 12,
    flexDirection: "row",
  },
  noticeAccent: {
    width: 6,
  },
  noticeBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  noticeTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  noticeBadge: {
    fontSize: 14,
    fontWeight: "500",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeRed: {
    backgroundColor: "rgba(220,38,38,0.12)",
    color: "#DC2626",
  },
  badgeWarning: {
    backgroundColor: "rgba(255,232,131,0.33)",
    color: "#A16207",
  },
  badgeBlue: {
    backgroundColor: "rgba(40,153,207,0.1)",
    color: "#2899CF",
  },
  noticeTime: {
    fontSize: 10,
    color: "#94A3B8",
  },
  noticeTitle: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
    marginBottom: 4,
  },
  noticeDescription: {
    fontSize: 10,
    color: "#64748B",
    lineHeight: 15,
  },
  metaRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
  },
  metaChip: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  metaText: {
    fontSize: 10,
    color: "#0F172A",
    fontWeight: "500",
  },
  chatPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingBottom: 100,
  },
  chatIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E6F4FA",
    marginBottom: 12,
  },
  chatTitle: {
    fontSize: 18,
    color: "#181818",
    fontWeight: "600",
    marginBottom: 6,
  },
  chatText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 86,
    backgroundColor: "#FBFDFF",
    borderTopWidth: 1,
    borderTopColor: "#E6E6E6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 12,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minWidth: 72,
  },
  navLabel: {
    fontSize: 12,
    color: "#A1A1AA",
    fontWeight: "500",
  },
  navLabelActive: {
    fontSize: 12,
    color: "#1C98ED",
    fontWeight: "500",
  },
});
