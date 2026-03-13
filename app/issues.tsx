import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { BASE_URL } from "./config";
import useProfileStore from "./store/profileStore";
import useBuildingStore from "./store/buildingStore";
import { getErrorMessage } from "./services/error";

type TopTab = "NEW" | "MY_ISSUES";
type IssueStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
type IssueItem = {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  timeLabel: string;
  images: string[];
};

const MAX_IMAGES = 5;
const STATUS_FILTERS: { key: IssueStatus; label: string }[] = [
  { key: "OPEN", label: "Open" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "RESOLVED", label: "Resolved" },
];

const SAMPLE_ISSUES: IssueItem[] = [
  {
    id: "ISS123567",
    title: "Staircase light not working on 3rd floor.",
    description: "The light near Flat 3B has been off since yesterday night.",
    status: "OPEN",
    timeLabel: "Posted 5min ago",
    images: [
      "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "ISS123568",
    title: "Plumber fixing water leakage in Block A.",
    description: "Water leakage near the corridor has been reported.",
    status: "IN_PROGRESS",
    timeLabel: "Posted 24hrs ago",
    images: [
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "ISS123569",
    title: "Drain blockage cleared.",
    description: "Maintenance team cleared the drain blockage near Tower C.",
    status: "RESOLVED",
    timeLabel: "Posted 5min ago",
    images: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

const statusTheme = (status: IssueStatus) =>
  status === "OPEN"
    ? { idColor: "#C81616", pillBg: "rgba(255,86,86,0.1)", pillColor: "#C81616", dot: "#C81616", label: "Open" }
    : status === "IN_PROGRESS"
      ? { idColor: "#A16207", pillBg: "rgba(234,179,8,0.12)", pillColor: "#A16207", dot: "#A16207", label: "Processing" }
      : { idColor: "#1C98ED", pillBg: "rgba(144,203,243,0.27)", pillColor: "#1C98ED", dot: "#1C98ED", label: "Closed" };

export default function IssuesScreen() {
  const router = useRouter();
  const profilePhone = useProfileStore((s) => s.phone);
  const buildingId = useBuildingStore((s) => s.buildingId);
  const [activeTab, setActiveTab] = useState<TopTab>("NEW");
  const [activeStatus, setActiveStatus] = useState<IssueStatus>("OPEN");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pickedImages, setPickedImages] = useState<string[]>([]);
  const [issues, setIssues] = useState<IssueItem[]>(SAMPLE_ISSUES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchIssues = async () => {
      if (!profilePhone) {
        setIssues(SAMPLE_ISSUES);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/issues/profile/${profilePhone}`);
        const apiData = Array.isArray(res.data) ? res.data : [];
        if (!apiData.length) {
          setIssues(SAMPLE_ISSUES);
          return;
        }
        const mapped: IssueItem[] = apiData.map((item: any) => ({
          id: String(item.complaintId ?? item.id),
          title: item.title ?? "Untitled issue",
          description: item.description ?? "",
          status:
            String(item.status).toUpperCase() === "RESOLVED"
              ? "RESOLVED"
              : String(item.status).toUpperCase().includes("PROGRESS")
                ? "IN_PROGRESS"
                : "OPEN",
          timeLabel: "Posted recently",
          images: Array.isArray(item.imageUrls)
            ? item.imageUrls.map((url: string) =>
                url.startsWith("http") ? url : `${BASE_URL}${url}`
              )
            : [],
        }));
        setIssues(mapped);
      } catch {
        setIssues(SAMPLE_ISSUES);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [profilePhone]);

  const filteredIssues = useMemo(
    () => issues.filter((item) => item.status === activeStatus),
    [issues, activeStatus]
  );

  const pickImages = async () => {
    if (pickedImages.length >= MAX_IMAGES) {
      Alert.alert("Limit reached", `You can attach up to ${MAX_IMAGES} images only.`);
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow gallery access to attach images.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - pickedImages.length,
      quality: 0.85,
    });
    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setPickedImages((prev) => [...prev, ...uris].slice(0, MAX_IMAGES));
    }
  };

  const createIssue = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Missing fields", "Please enter issue title and description.");
      return;
    }
    if (!profilePhone) {
      Alert.alert("Profile missing", "Please login again and retry.");
      return;
    }
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append(
        "complaint",
        JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          username: profilePhone,
          timestamp: new Date().toISOString(),
          type: "ALERT",
          isResolved: false,
          assigneeProfile: null,
          buildingId: buildingId ? String(buildingId) : null,
          status: "OPEN",
        })
      );

      pickedImages.forEach((uri, index) => {
        const name = uri.split("/").pop() || `issue-${index}.jpg`;
        formData.append("files", {
          uri,
          name,
          type: "image/jpeg",
        } as any);
      });

      const res = await axios.post(`${BASE_URL}/issues/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const created = res.data;
      const nextIssue: IssueItem = {
        id: String(created?.complaintId ?? `ISS${Date.now()}`),
        title: created?.title ?? title.trim(),
        description: created?.description ?? description.trim(),
        status: "OPEN",
        timeLabel: "Posted just now",
        images: Array.isArray(created?.imageUrls)
          ? created.imageUrls.map((url: string) =>
              url.startsWith("http") ? url : `${BASE_URL}${url}`
            )
          : [],
      };
      setIssues((prev) => [nextIssue, ...prev]);
      setTitle("");
      setDescription("");
      setPickedImages([]);
      setActiveTab("MY_ISSUES");
      setActiveStatus("OPEN");
      Alert.alert("Issue raised", "Your issue has been submitted successfully.");
    } catch (error) {
      Alert.alert("Issue creation failed", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.iconBtn}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#181818" />
            </Pressable>
            <Text style={styles.headerTitle}>Raise Issue</Text>
          </View>
          <View style={styles.topTabWrap}>
            <Pressable style={[styles.topTab, activeTab === "NEW" && styles.topTabActive]} onPress={() => setActiveTab("NEW")}>
              <Text style={[styles.topTabText, activeTab === "NEW" && styles.topTabTextActive]}>New</Text>
            </Pressable>
            <Pressable style={[styles.topTab, activeTab === "MY_ISSUES" && styles.topTabActive]} onPress={() => setActiveTab("MY_ISSUES")}>
              <Text style={[styles.topTabText, activeTab === "MY_ISSUES" && styles.topTabTextActive]}>My Issues</Text>
            </Pressable>
          </View>
        </View>

        {activeTab === "NEW" ? (
          <ScrollView style={styles.scroll} contentContainerStyle={styles.newContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput value={title} onChangeText={setTitle} placeholder="Title of the issue" placeholderTextColor="#A1A1AA" style={styles.input} />
            <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the issue..."
              placeholderTextColor="#A1A1AA"
              multiline
              textAlignVertical="top"
              style={styles.textArea}
            />
            <Pressable style={styles.attachBox} onPress={pickImages}>
              <Text style={styles.attachText}>Add photos (Optional)</Text>
              <Text style={styles.attachSubText}>{pickedImages.length}/{MAX_IMAGES} selected</Text>
            </Pressable>
            <View style={styles.imageGrid}>
              {pickedImages.map((uri, idx) => (
                <View key={`${uri}-${idx}`} style={styles.thumbWrap}>
                  <Image source={{ uri }} style={styles.thumb} />
                  <Pressable style={styles.removePill} onPress={() => setPickedImages((prev) => prev.filter((_, i) => i !== idx))}>
                    <Ionicons name="close" size={14} color="#fff" />
                  </Pressable>
                </View>
              ))}
            </View>
            <Pressable style={styles.raiseBtn} onPress={createIssue} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#FAFAFA" />
              ) : (
                <Text style={styles.raiseBtnText}>Raise Issue</Text>
              )}
            </Pressable>
          </ScrollView>
        ) : (
          <View style={styles.listLayout}>
            <View style={styles.filterRowWrap}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {STATUS_FILTERS.map((f) => (
                  <Pressable key={f.key} style={[styles.filterChip, activeStatus === f.key && styles.filterChipActive]} onPress={() => setActiveStatus(f.key)}>
                    <Text style={[styles.filterText, activeStatus === f.key && styles.filterTextActive]}>{f.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
            <ScrollView style={styles.issueListScroll} contentContainerStyle={styles.issueList} showsVerticalScrollIndicator={false}>
              {loading ? <ActivityIndicator size="large" color="#1C98ED" style={{ marginTop: 24 }} /> : null}
              {filteredIssues.map((issue) => {
                const theme = statusTheme(issue.status);
                return (
                  <Pressable
                    key={issue.id}
                    style={styles.issueCard}
                    onPress={() =>
                      router.push({
                        pathname: "/tenant-issue-detail",
                        params: {
                          id: issue.id,
                          title: issue.title,
                          status: issue.status,
                          timeLabel: issue.timeLabel,
                          images: JSON.stringify(issue.images),
                        },
                      } as never)
                    }
                  >
                    <View style={styles.issueTop}>
                      <Text style={[styles.issueId, { color: theme.idColor }]}>{issue.id}</Text>
                      <View style={[styles.pill, { backgroundColor: theme.pillBg }]}>
                        <View style={[styles.dot, { backgroundColor: theme.dot }]} />
                        <Text style={[styles.pillText, { color: theme.pillColor }]}>{theme.label}</Text>
                      </View>
                    </View>
                    <Text style={styles.issueTitle}>{issue.title}</Text>
                    <Text style={styles.issueTime}>{issue.timeLabel}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
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
          <Pressable style={styles.navCenterBtn}>
            <MaterialCommunityIcons name="plus" size={24} color="#FAFAFA" />
          </Pressable>
          <Pressable style={styles.navItem} onPress={() => router.push("/announcements" as never)}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#A1A1AA" />
            <Text style={styles.navLabel}>Community</Text>
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
  safe: { flex: 1, backgroundColor: "#FAFAFA" },
  headerCard: { backgroundColor: "#FFF", borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  iconBtn: { padding: 2 },
  headerTitle: { fontSize: 18, color: "#000", fontWeight: "500" },
  topTabWrap: { backgroundColor: "#F1F5F9", borderRadius: 24, padding: 4, flexDirection: "row" },
  topTab: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 16, paddingVertical: 10 },
  topTabActive: { backgroundColor: "#FFF", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  topTabText: { fontSize: 14, fontWeight: "500", color: "#64748B" },
  topTabTextActive: { color: "#2899CF" },
  scroll: { flex: 1 },
  newContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 120 },
  fieldLabel: { fontSize: 14, color: "#0F172A", fontWeight: "500", marginBottom: 8 },
  input: { height: 42, borderRadius: 12, backgroundColor: "#FFF", paddingHorizontal: 12, fontSize: 16, color: "#0F172A" },
  textArea: { minHeight: 180, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#FFF", paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, color: "#0F172A" },
  attachBox: { borderWidth: 1, borderStyle: "dashed", borderColor: "#A1A1AA", borderRadius: 4, minHeight: 44, alignItems: "center", justifyContent: "center", marginTop: 14 },
  attachText: { fontSize: 12, color: "#A1A1AA" },
  attachSubText: { fontSize: 10, color: "#94A3B8", marginTop: 2 },
  imageGrid: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 10 },
  thumbWrap: { width: 72, height: 72, borderRadius: 10, overflow: "hidden" },
  thumb: { width: "100%", height: "100%" },
  removePill: { position: "absolute", right: 4, top: 4, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.6)" },
  raiseBtn: { marginTop: 26, height: 48, borderRadius: 100, backgroundColor: "#1C98ED", alignItems: "center", justifyContent: "center" },
  raiseBtnText: { color: "#FAFAFA", fontSize: 22, fontWeight: "500" },
  listLayout: { flex: 1, paddingTop: 14, minHeight: 0 },
  filterRowWrap: { flexShrink: 0 },
  filterRow: { gap: 10, paddingHorizontal: 16, paddingBottom: 12 },
  issueListScroll: { flex: 1, minHeight: 0 },
  filterChip: {
    minWidth: 140,
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: "#1C98ED", 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    alignItems: "center" 
  },
  filterChipActive: { backgroundColor: "#1C98ED" },
  filterText: { fontSize: 16, color: "#1C98ED", fontWeight: "400" },
  filterTextActive: { color: "#FAFAFA" },
  issueList: { paddingHorizontal: 16, paddingBottom: 120, gap: 12 },
  issueCard: { borderWidth: 1, borderColor: "#E6E6E6", borderRadius: 8, backgroundColor: "#FFF", padding: 12 },
  issueTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  issueId: { fontSize: 14, fontWeight: "500" },
  pill: { borderRadius: 16, paddingHorizontal: 8, paddingVertical: 4, flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 10 },
  issueTitle: { color: "#000", fontSize: 14, fontWeight: "500", marginBottom: 4 },
  issueTime: { fontSize: 10, color: "#A1A1AA" },
  bottomNav: { position: "absolute", left: 0, right: 0, bottom: 0, height: 86, backgroundColor: "#FBFDFF", borderTopWidth: 1, borderTopColor: "#E6E6E6", flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingHorizontal: 12 },
  navItem: { alignItems: "center", justifyContent: "center", gap: 4, minWidth: 64 },
  navLabel: { fontSize: 12, color: "#A1A1AA", fontWeight: "500" },
  navCenterBtn: { width: 56, height: 56, borderRadius: 28, borderWidth: 4, borderColor: "#FBFDFF", backgroundColor: "#1C98ED", alignItems: "center", justifyContent: "center", marginTop: -20 },
});
