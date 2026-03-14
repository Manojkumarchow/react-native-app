import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import { BASE_URL } from "./config";
import { SafeAreaView } from "react-native-safe-area-context";
import { rms, rs, rvs } from "@/constants/responsive";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

const HALLWAY_PHOTO =
  "https://www.figma.com/api/mcp/asset/d254e125-014c-43ea-b7a1-01f8f35dc9ba";

const normalizeStatus = (status?: string): TicketStatus => {
  const raw = String(status || "").toUpperCase();
  if (raw.includes("RESOLVED")) return "RESOLVED";
  if (raw.includes("PROGRESS") || raw.includes("PENDING")) return "IN_PROGRESS";
  return "OPEN";
};

export default function TicketDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    description?: string;
    status?: string;
    raisedBy?: string;
    flatNumber?: string;
    postedAt?: string;
    imageUrl?: string;
  }>();

  const ticketId = params.id || "ISS123567";
  const title = params.title || "Staircase light not working on 3rd floor.";
  const description =
    params.description ||
    "All three lights in the 3rd floor corridor are off. Emergency lights are on, but main lights are not switching on.";
  const raisedBy = params.raisedBy || "RAHUL";
  const flatNumber = params.flatNumber || "302";
  const postedAt = params.postedAt || "Posted 5min ago";
  const imageUrl = params.imageUrl || HALLWAY_PHOTO;

  const [status, setStatus] = useState<TicketStatus>(normalizeStatus(params.status));
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastUpdatedStatus, setLastUpdatedStatus] = useState<TicketStatus>(status);

  const statusStyle = useMemo(() => {
    if (status === "RESOLVED") {
      return {
        idColor: "#36A033",
        pillBg: "#DCFCE7",
        pillText: "#36A033",
        label: "Resolved",
      };
    }
    if (status === "IN_PROGRESS") {
      return {
        idColor: "#A16207",
        pillBg: "rgba(255,232,131,0.33)",
        pillText: "#A16207",
        label: "In Progress",
      };
    }
    return {
      idColor: "#C81616",
      pillBg: "rgba(255,86,86,0.1)",
      pillText: "#C81616",
      label: "Open",
    };
  }, [status]);

  const updateStatus = async (nextStatus: TicketStatus) => {
    try {
      setSaving(true);
      await axios.patch(`${BASE_URL}/issues/${ticketId}/status`, {
        status: nextStatus,
      });

      setStatus(nextStatus);
      setLastUpdatedStatus(nextStatus);
      setShowStatusPicker(false);
      setShowSuccess(true);
    } catch (error) {
      console.error("Failed to update issue status", error);
      setShowStatusPicker(false);
    } finally {
      setSaving(false);
    }
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

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.topCard}>
            <View style={styles.ticketTop}>
              <Text style={[styles.ticketId, { color: statusStyle.idColor }]}>{ticketId}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.pillBg }]}>
                <Text style={[styles.statusDot, { color: statusStyle.pillText }]}>•</Text>
                <Text style={[styles.statusText, { color: statusStyle.pillText }]}>
                  {statusStyle.label}
                </Text>
              </View>
            </View>
            <Text style={styles.ticketTitle}>{title}</Text>
            <Text style={styles.meta}>Reported by : {raisedBy} , Floor {flatNumber}</Text>
            <Text style={styles.time}>{postedAt}</Text>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Evidence Photo</Text>
            <Image source={{ uri: imageUrl }} style={styles.photo} resizeMode="cover" />
          </View>
        </ScrollView>

        <View style={styles.actionsRow}>
          <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.primaryBtn, saving && { opacity: 0.7 }]}
            onPress={() => setShowStatusPicker(true)}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>Update Status</Text>
            )}
          </Pressable>
        </View>
      </SafeAreaView>

      <Modal visible={showStatusPicker} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>Select status update</Text>
            <Pressable style={styles.pickerOption} onPress={() => updateStatus("IN_PROGRESS")}>
              <Text style={styles.pickerOptionText}>Move to Pending</Text>
            </Pressable>
            <Pressable style={styles.pickerOption} onPress={() => updateStatus("RESOLVED")}>
              <Text style={styles.pickerOptionText}>Move to Resolved</Text>
            </Pressable>
            <Pressable onPress={() => setShowStatusPicker(false)} style={styles.pickerCancel}>
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="checkmark" size={38} color="#16A34A" />
            </View>
            <Text style={styles.modalTitle}>
              {lastUpdatedStatus === "RESOLVED" ? "Issue Resolved" : "Issue Marked Pending"}
            </Text>
            <Text style={styles.modalDesc}>
              {lastUpdatedStatus === "RESOLVED"
                ? "Issue has been successfully resolved and notification update has been sent."
                : "Issue has been marked pending and notification update has been sent."}
            </Text>
            <Pressable
              style={styles.modalPrimary}
              onPress={() => {
                setShowSuccess(false);
                router.replace("/home");
              }}
            >
              <Text style={styles.modalPrimaryText}>Back to Dashboard</Text>
            </Pressable>
            <Pressable
              style={styles.modalSecondary}
              onPress={() => {
                setShowSuccess(false);
                router.replace({
                  pathname: "/all-tickets",
                  params: { updatedId: ticketId, updatedStatus: lastUpdatedStatus, status: lastUpdatedStatus },
                } as never);
              }}
            >
              <Text style={styles.modalSecondaryText}>View Issues</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAFAFA" },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: rs(24),
    borderBottomRightRadius: rs(24),
    paddingHorizontal: rs(16),
    paddingTop: rvs(10),
    paddingBottom: rvs(14),
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  backBtn: { marginRight: rs(8), padding: rs(4) },
  headerTitle: { fontSize: rms(18), fontWeight: "500", color: "#000000" },
  content: { paddingHorizontal: rs(16), paddingTop: rvs(16), paddingBottom: rvs(112), gap: rs(14) },
  topCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    padding: 12,
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
  ticketTitle: { fontSize: 16, lineHeight: 24, color: "#000000", marginBottom: 10 },
  meta: { fontSize: 12, color: "#000000", marginBottom: 10 },
  time: { fontSize: 10, color: "#A1A1AA" },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 17,
  },
  sectionTitle: { color: "#0F172A", fontSize: 14, fontWeight: "500", marginBottom: 12 },
  description: { color: "#334155", fontSize: 16, lineHeight: 24 },
  photo: { width: "100%", aspectRatio: 16 / 9, borderRadius: 16, backgroundColor: "#E2E8F0" },
  actionsRow: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 22,
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 100,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F4F4F5",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { color: "#777777", fontSize: 14, fontWeight: "500" },
  primaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 100,
    backgroundColor: "#1C98ED",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "#FAFAFA", fontSize: 14, fontWeight: "500" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(157,157,157,0.71)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  pickerCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
  },
  pickerTitle: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 10 },
  pickerOption: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  pickerOptionText: { color: "#1C98ED", fontWeight: "600", fontSize: 14 },
  pickerCancel: { marginTop: 14, alignItems: "center" },
  pickerCancelText: { color: "#777777", fontSize: 14, fontWeight: "500" },
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
  modalTitle: { color: "#1A1A1A", fontSize: 20, fontWeight: "700", marginBottom: 10 },
  modalDesc: {
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
