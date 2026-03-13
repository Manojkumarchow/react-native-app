import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import useBuildingStore from "./store/buildingStore";
import useProfileStore from "./store/profileStore";
import { BASE_URL } from "./config";

type BackendNoticeType = "ALERT" | "INFO" | "HIGH" | "MEDIUM" | "LOW" | "EVENT";
type NoticeCategory = "NOTICE" | "ANNOUNCEMENT" | "EVENT";
type Audience = "ALL_RESIDENTS" | "ALL_OWNERS" | "ALL_TENANTS";
type RootTab = "NEW" | "HISTORY";

interface Notice {
  noticeId: string;
  title: string;
  description: string;
  type: BackendNoticeType;
  createdAt: string;
}

const NOTICE_FILTERS: NoticeCategory[] = ["NOTICE", "ANNOUNCEMENT", "EVENT"];
const AUDIENCE_OPTIONS: { key: Audience; label: string }[] = [
  { key: "ALL_RESIDENTS", label: "All Residents" },
  { key: "ALL_OWNERS", label: "All Owners" },
  { key: "ALL_TENANTS", label: "All Tenants" },
];

const STATIC_NOTICES: Notice[] = [
  {
    noticeId: "static-1",
    title: "Lift Maintenance for 3 days",
    description:
      "Due to continuous power cuts, the lift doors are stuck and are not opening, so the lift is under maintenance for the next 3 days.",
    type: "HIGH",
    createdAt: new Date().toISOString(),
  },
  {
    noticeId: "static-2",
    title: "Water Supply Maintenance",
    description:
      "Regular cleaning of overhead tanks scheduled for tomorrow between 10 AM to 2 PM.",
    type: "ALERT",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    noticeId: "static-3",
    title: "Community Hall Booking Update",
    description:
      "The online booking process for the community hall is now available in the app.",
    type: "INFO",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mapNoticeTypeToCategory = (type: string): NoticeCategory => {
  const value = type?.toUpperCase();
  if (value === "HIGH" || value === "ALERT" || value === "NOTICE")
    return "NOTICE";
  if (value === "EVENT" || value === "LOW") return "EVENT";
  return "ANNOUNCEMENT";
};

const mapCategoryToCreateType = (
  category: NoticeCategory,
): "HIGH" | "MEDIUM" | "LOW" => {
  if (category === "NOTICE") return "HIGH";
  if (category === "EVENT") return "LOW";
  return "MEDIUM";
};

const timeAgo = (dateStr?: string) => {
  const createdMs = dateStr ? new Date(dateStr).getTime() : Date.now();
  if (Number.isNaN(createdMs)) return "Just now";
  const diffMin = Math.floor((Date.now() - createdMs) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return diffHr === 1 ? "1 hour ago" : `${diffHr} hours ago`;
  const diffDay = Math.floor(diffHr / 24);
  return diffDay === 1 ? "1 day ago" : `${diffDay} days ago`;
};

export default function Notices() {
  const profile = useProfileStore();
  const buildingId = useBuildingStore((s) => s.buildingId);

  const [activeRootTab, setActiveRootTab] = useState<RootTab>("HISTORY");
  const [historyFilter, setHistoryFilter] = useState<NoticeCategory>("NOTICE");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<NoticeCategory>("NOTICE");
  const [audience, setAudience] = useState<Audience>("ALL_RESIDENTS");
  const [scheduleLater, setScheduleLater] = useState(false);

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchNotices = async () => {
    if (!buildingId) {
      setNotices(STATIC_NOTICES);
      setUsingFallback(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/notices/${buildingId}`);
      const apiData = Array.isArray(res.data) ? (res.data as Notice[]) : [];
      if (!apiData.length) {
        setNotices(STATIC_NOTICES);
        setUsingFallback(true);
      } else {
        setNotices(apiData);
        setUsingFallback(false);
      }
    } catch (error) {
      console.error("Failed to fetch notices", error);
      setNotices(STATIC_NOTICES);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [buildingId]);

  const filteredHistory = useMemo(
    () =>
      notices.filter(
        (item) => mapNoticeTypeToCategory(item.type) === historyFilter,
      ),
    [notices, historyFilter],
  );

  const isValid = title.trim() && category;

  const clearForm = () => {
    setTitle("");
    setDescription("");
    setCategory("NOTICE");
    setAudience("ALL_RESIDENTS");
    setScheduleLater(false);
  };

  const sendNotice = async () => {
    if (!isValid || sending) return;

    try {
      setSending(true);
      await axios.post(`${BASE_URL}/notices/create`, {
        title,
        description,
        type: mapCategoryToCreateType(category),
        profileId: profile.phone,
        buildingId,
        audience,
      });

      setShowSuccessModal(true);
      clearForm();
      fetchNotices();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Some error occurred while sending notice",
      });
    } finally {
      setSending(false);
    }
  };

  const renderHistoryItem = ({ item }: { item: Notice }) => {
    const categoryLabel = mapNoticeTypeToCategory(item.type);
    const isNotice = categoryLabel === "NOTICE";
    const pillBg = isNotice
      ? "rgba(220, 38, 38, 0.12)"
      : "rgba(28, 152, 237, 0.12)";
    const pillText = isNotice ? "#DC2626" : "#1C98ED";
    const leftBar = isNotice ? "#C81616" : "#1C98ED";

    return (
      <View style={styles.noticeCard}>
        <View style={[styles.noticeSide, { backgroundColor: leftBar }]} />
        <View style={styles.noticeCardContent}>
          <View style={styles.noticeCardTop}>
            <View style={[styles.noticeTypePill, { backgroundColor: pillBg }]}>
              <Text style={[styles.noticeTypePillText, { color: pillText }]}>
                {categoryLabel === "ANNOUNCEMENT"
                  ? "Announcement"
                  : categoryLabel}
              </Text>
            </View>
            <Text style={styles.noticeTime}>{timeAgo(item.createdAt)}</Text>
          </View>
          <Text style={styles.noticeTitle}>
            {item.title || "Untitled notice"}
          </Text>
          <Text numberOfLines={3} style={styles.noticeDescription}>
            {item.description || "No description available."}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.safeArea}
        >
          <View style={styles.screen}>
            <View style={styles.headerCard}>
              <View style={styles.headerTop}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.iconTap}
                >
                  <Ionicons name="arrow-back" size={22} color="#181818" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Post Notice</Text>
              </View>

              <View style={styles.rootTabWrap}>
                <Pressable
                  style={[
                    styles.rootTab,
                    activeRootTab === "NEW" && styles.rootTabActive,
                  ]}
                  onPress={() => setActiveRootTab("NEW")}
                >
                  <Text
                    style={[
                      styles.rootTabText,
                      activeRootTab === "NEW" && styles.rootTabTextActive,
                    ]}
                  >
                    New
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.rootTab,
                    activeRootTab === "HISTORY" && styles.rootTabActive,
                  ]}
                  onPress={() => setActiveRootTab("HISTORY")}
                >
                  <Text
                    style={[
                      styles.rootTabText,
                      activeRootTab === "HISTORY" && styles.rootTabTextActive,
                    ]}
                  >
                    History
                  </Text>
                </Pressable>
              </View>
            </View>

            {activeRootTab === "NEW" ? (
              <ScrollView
                style={styles.content}
                contentContainerStyle={styles.newTabContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Category</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipRow}
                  >
                    {NOTICE_FILTERS.map((item) => {
                      const active = category === item;
                      return (
                        <Pressable
                          key={item}
                          style={[styles.chip, active && styles.chipActive]}
                          onPress={() => setCategory(item)}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              active && styles.chipTextActive,
                            ]}
                          >
                            {item ===
                              `${item.charAt(0).toUpperCase() + item.slice(1)}`}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Title</Text>
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Title of the issue"
                    placeholderTextColor="#A1A1AA"
                    style={styles.input}
                  />
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>
                    Description (Optional)
                  </Text>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe the issue..."
                    placeholderTextColor="#A1A1AA"
                    multiline
                    textAlignVertical="top"
                    style={styles.textarea}
                  />
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Send To</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipRow}
                  >
                    {AUDIENCE_OPTIONS.map((item) => {
                      const active = audience === item.key;
                      return (
                        <Pressable
                          key={item.key}
                          style={[styles.chip, active && styles.chipActiveBlue]}
                          onPress={() => setAudience(item.key)}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              active && styles.chipTextPrimary,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* <View style={styles.scheduleCard}>
                  <View style={styles.scheduleLeft}>
                    <View style={styles.scheduleIconWrap}>
                      <Ionicons name="time-outline" size={20} color="#2899CF" />
                    </View>
                    <View>
                      <Text style={styles.scheduleTitle}>
                        Schedule for later
                      </Text>
                      <Text style={styles.scheduleSub}>
                        Set a specific date and time
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={scheduleLater}
                    onValueChange={setScheduleLater}
                    trackColor={{ false: "#E2E8F0", true: "#9CD8FA" }}
                    thumbColor="#FFFFFF"
                  />
                </View> */}

                <View style={styles.actionsRow}>
                  <Pressable style={styles.cancelBtn} onPress={clearForm}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.sendBtn, !isValid && styles.disabledBtn]}
                    onPress={sendNotice}
                    disabled={!isValid || sending}
                  >
                    {sending ? (
                      <ActivityIndicator color="#FAFAFA" />
                    ) : (
                      <Text style={styles.sendBtnText}>Send Now</Text>
                    )}
                  </Pressable>
                </View>
              </ScrollView>
            ) : loading ? (
              <ActivityIndicator
                size="large"
                color="#1C98ED"
                style={{ marginTop: 28 }}
              />
            ) : (
              <View style={styles.content}>
                {filteredHistory.length > 0 && (
                  <View style={styles.historyFilterRowWrap}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.historyFilterRow}
                    >
                      {NOTICE_FILTERS.map((item) => {
                        const active = historyFilter === item;
                        return (
                          <Pressable
                            key={item}
                            style={[
                              styles.historyFilterChip,
                              active && styles.historyFilterChipActive,
                            ]}
                            onPress={() => setHistoryFilter(item)}
                          >
                            <Text
                              style={[
                                styles.historyFilterText,
                                active && styles.historyFilterTextActive,
                              ]}
                            >
                              {item ===
                                `${item.charAt(0).toUpperCase() + item.slice(1)}s`}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}

                {usingFallback && (
                  <Text style={styles.fallbackHint}>
                    Showing sample notices because backend returned empty/error.
                  </Text>
                )}

                <View style={styles.historyListWrap}>
                  <FlatList
                    data={filteredHistory}
                    keyExtractor={(item) => item.noticeId}
                    renderItem={renderHistoryItem}
                    contentContainerStyle={styles.historyList}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                      <View style={styles.emptyState}>
                        <Text style={styles.emptyTitle}>No notices found</Text>
                        <Text style={styles.emptySub}>
                          Try another type filter or create a new notice.
                        </Text>
                      </View>
                    }
                  />
                </View>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="checkmark" size={38} color="#16A34A" />
            </View>
            <Text style={styles.modalTitle}>Notice Posted!</Text>
            <Text style={styles.modalDescription}>
              Your notice has been successfully broadcasted to residents.
            </Text>
            <Pressable
              style={styles.modalPrimary}
              onPress={() => {
                setShowSuccessModal(false);
                router.replace("/home");
              }}
            >
              <Text style={styles.modalPrimaryText}>Back to Dashboard</Text>
            </Pressable>
            <Pressable
              style={styles.modalSecondary}
              onPress={() => {
                setShowSuccessModal(false);
                setActiveRootTab("HISTORY");
                fetchNotices();
              }}
            >
              <Text style={styles.modalSecondaryText}>View Post</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FAFAFA" },
  screen: { flex: 1, backgroundColor: "#FAFAFA" },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  headerTop: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  iconTap: { marginRight: 8, paddingVertical: 6, paddingRight: 6 },
  headerTitle: { color: "#000000", fontSize: 18, fontWeight: "500" },
  rootTabWrap: {
    backgroundColor: "#F1F5F9",
    borderRadius: 24,
    padding: 4,
    flexDirection: "row",
  },
  rootTab: {
    flex: 1,
    minHeight: 36,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  rootTabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  rootTabText: { color: "#64748B", fontSize: 14, fontWeight: "500" },
  rootTabTextActive: { color: "#2899CF" },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16, minHeight: 0 },
  historyFilterRowWrap: { flexShrink: 0 },
  historyListWrap: { flex: 1, minHeight: 0 },
  newTabContent: { paddingBottom: 30 },
  section: { marginBottom: 16 },
  sectionLabel: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 10,
  },
  chipRow: { gap: 10, paddingRight: 16 },
  chip: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderWidth: 1,
    borderRadius: 28,
    paddingHorizontal: 18,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: { borderColor: "#1C98ED" },
  chipActiveBlue: { backgroundColor: "#1C98ED", borderColor: "#1C98ED" },
  chipText: { color: "#777777", fontSize: 14, fontWeight: "500" },
  chipTextActive: { color: "#1C98ED" },
  chipTextPrimary: { color: "#FAFAFA" },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 44,
    paddingHorizontal: 14,
    color: "#09090B",
    fontSize: 16,
  },
  textarea: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 180,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#09090B",
    fontSize: 16,
  },
  scheduleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderColor: "#F1F5F9",
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  scheduleLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  scheduleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "rgba(40,153,207,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  scheduleTitle: { color: "#1E293B", fontSize: 14, fontWeight: "500" },
  scheduleSub: { color: "#64748B", fontSize: 12, marginTop: 2 },
  actionsRow: { flexDirection: "row", gap: 12 },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#F4F4F5",
    minHeight: 48,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: { color: "#777777", fontSize: 14, fontWeight: "500" },
  sendBtn: {
    flex: 1,
    backgroundColor: "#1C98ED",
    minHeight: 48,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledBtn: { opacity: 0.5 },
  sendBtnText: { color: "#FAFAFA", fontSize: 14, fontWeight: "500" },
  historyFilterRow: { gap: 10, paddingHorizontal: 16, paddingBottom: 12 },
  historyFilterChip: {
    minWidth: 140,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1C98ED",
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
  },
  historyFilterChipActive: { backgroundColor: "#1C98ED" },
  historyFilterText: { fontSize: 16, color: "#1C98ED", fontWeight: "400" },
  historyFilterTextActive: { color: "#FAFAFA" },
  fallbackHint: {
    color: "#64748B",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 2,
  },
  historyList: { paddingBottom: 18, gap: 12 },
  noticeCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 24,
    overflow: "hidden",
    flexDirection: "row",
  },
  noticeSide: { width: 6 },
  noticeCardContent: { flex: 1, paddingHorizontal: 16, paddingVertical: 14 },
  noticeCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  noticeTypePill: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 3 },
  noticeTypePillText: { fontSize: 14, fontWeight: "500" },
  noticeTime: { color: "#94A3B8", fontSize: 10, fontWeight: "500" },
  noticeTitle: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  noticeDescription: { color: "#64748B", fontSize: 10, lineHeight: 15 },
  emptyState: { paddingVertical: 48, alignItems: "center" },
  emptyTitle: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 6,
  },
  emptySub: {
    color: "#6B7280",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(157,157,157,0.71)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: "center",
  },
  modalIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 999,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    color: "#1A1A1A",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  modalDescription: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 18,
  },
  modalPrimary: {
    width: "100%",
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: "#1C98ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  modalPrimaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  modalSecondary: {
    width: "100%",
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSecondaryText: { color: "#2799CE", fontSize: 14, fontWeight: "600" },
});
