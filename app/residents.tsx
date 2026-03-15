import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import axios from "axios";

import { BASE_URL } from "./config";
import useBuildingStore from "./store/buildingStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { rms, rs, rvs } from "@/constants/responsive";
import { getErrorMessage } from "./services/error";

type Resident = {
  id: string;
  name: string;
  flat: string;
  subtitle: string;
  phone?: string;
};

const avatarUri =
  "https://www.figma.com/api/mcp/asset/84d44808-4b5b-40ca-9c62-df413083a57f";

export default function ResidentsScreen() {
  const router = useRouter();
  const buildingId = useBuildingStore((s) => s.buildingId);
  const [activeTab, setActiveTab] = useState<"all" | "pending">("all");
  const [search, setSearch] = useState("");
  const [allData, setAllData] = useState<Resident[]>([]);
  const [pendingData, setPendingData] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [flatNoInput, setFlatNoInput] = useState("");

  const mapResidents = (rows: any[], fallbackPrefix: string): Resident[] =>
    rows.map((item: any, idx: number) => ({
      id: String(item.phone ?? `${fallbackPrefix}-${idx}`),
      name: item.name ?? "Unknown",
      flat: `${item.flatNo ?? "-"}`,
      subtitle: `Tenant - ${item.flatNo ?? "-"}`,
      phone: item.phone,
    }));

  const fetchResidents = async () => {
    if (!buildingId) {
      setAllData([]);
      setPendingData([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setErrorText("");
      const allRes = await axios.get(`${BASE_URL}/residents/building/${buildingId}`);
      const allRows = Array.isArray(allRes.data) ? allRes.data : [];
      setAllData(mapResidents(allRows, "all"));
      try {
        const pendingRes = await axios.get(`${BASE_URL}/residents/building/${buildingId}/pending`);
        const pendingRows = Array.isArray(pendingRes.data) ? pendingRes.data : [];
        setPendingData(
          mapResidents(pendingRows, "pending").map((r) => ({ ...r, subtitle: "Invite Sent" })),
        );
      } catch {
        // Keep all residents available even if pending endpoint fails.
        setPendingData([]);
      }
    } catch (error) {
      setAllData([]);
      setPendingData([]);
      setErrorText(getErrorMessage(error, "Unable to load residents list."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildingId]);

  const sourceData = activeTab === "all" ? allData : pendingData;
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sourceData;
    return sourceData.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.flat.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q),
    );
  }, [search, sourceData]);

  const callUser = (phone?: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const onReject = async (resident: Resident) => {
    if (!resident.phone) return;
    try {
      setActionLoading(true);
      await axios.delete(`${BASE_URL}/residents/${resident.phone}/reject`);
      await fetchResidents();
    } catch (error) {
      setErrorText(getErrorMessage(error, "Failed to reject resident."));
    } finally {
      setActionLoading(false);
    }
  };

  const openApprove = (resident: Resident) => {
    setSelectedResident(resident);
    setFlatNoInput("");
    setApproveModalVisible(true);
  };

  const onApproveSubmit = async () => {
    if (!selectedResident?.phone || !flatNoInput.trim()) return;
    try {
      setActionLoading(true);
      await axios.patch(`${BASE_URL}/residents/${selectedResident.phone}/approve`, {
        flatNo: flatNoInput.trim(),
      });
      setApproveModalVisible(false);
      setSelectedResident(null);
      setFlatNoInput("");
      await fetchResidents();
    } catch (error) {
      setErrorText(getErrorMessage(error, "Failed to approve resident."));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="arrow-left" size={24} color="#181818" />
            </Pressable>
            <Text style={styles.headerTitle}>Residents</Text>
            <Pressable
              style={styles.addButton}
              onPress={() => router.push("/add-resident" as never)}
            >
              <Text style={styles.addButtonText}>Add New</Text>
            </Pressable>
          </View>

          <View style={styles.tabWrap}>
            <Pressable
              style={[styles.tabButton, activeTab === "all" && styles.tabButtonActive]}
              onPress={() => setActiveTab("all")}
            >
              <Text style={[styles.tabText, activeTab === "all" && styles.tabTextActive]}>
                All({allData.length})
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tabButton, activeTab === "pending" && styles.tabButtonActive]}
              onPress={() => setActiveTab("pending")}
            >
              <Text style={[styles.tabText, activeTab === "pending" && styles.tabTextActive]}>
                Pending({pendingData.length})
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <Feather name="search" size={18} color="#777" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search resident name or flat number"
            placeholderTextColor="#777"
            style={styles.searchInput}
          />
          <MaterialCommunityIcons name="tune-variant" size={18} color="#777" />
        </View>

        <ScrollView
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#1C98ED" style={{ marginTop: 20 }} />
          ) : null}

          {!!errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

          {filtered.map((item) => (
            <View key={item.id} style={styles.card}>
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
              <View style={styles.cardTextWrap}>
                <Text style={styles.nameText}>{`${item.name} (Flat ${item.flat})`}</Text>
                <Text style={styles.subText}>{item.subtitle}</Text>
              </View>

              {activeTab === "all" ? (
                <Pressable style={styles.phoneBtn} onPress={() => callUser(item.phone)}>
                  <Ionicons name="call-outline" size={18} color="#1C98ED" />
                </Pressable>
              ) : (
                <View style={styles.pendingActions}>
                  <Pressable
                    style={styles.rejectBtn}
                    onPress={() => onReject(item)}
                    disabled={actionLoading}
                  >
                    <Feather name="x" size={16} color="#C81616" />
                  </Pressable>
                  <Pressable
                    style={styles.approveBtn}
                    onPress={() => openApprove(item)}
                    disabled={actionLoading}
                  >
                    <Feather name="check" size={16} color="#36A033" />
                  </Pressable>
                </View>
              )}
            </View>
          ))}

          {!loading && filtered.length === 0 ? (
            <Text style={styles.emptyText}>No records found.</Text>
          ) : null}
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={approveModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setApproveModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Approve Resident</Text>
            <Text style={styles.modalSubTitle}>
              Enter flat number for {selectedResident?.name ?? "resident"}.
            </Text>
            <TextInput
              value={flatNoInput}
              onChangeText={setFlatNoInput}
              placeholder="Flat number"
              placeholderTextColor="#777"
              style={styles.modalInput}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancel}
                onPress={() => setApproveModalVisible(false)}
                disabled={actionLoading}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalApprove,
                  (actionLoading || !flatNoInput.trim()) && styles.modalApproveDisabled,
                ]}
                onPress={onApproveSubmit}
                disabled={actionLoading || !flatNoInput.trim()}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalApproveText}>Submit</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  headerCard: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: rs(24),
    borderBottomRightRadius: rs(24),
    paddingHorizontal: rs(14),
    paddingTop: rvs(10),
    paddingBottom: rvs(14),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: rs(2),
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: rvs(12),
  },
  backBtn: {
    width: rs(28),
    height: rs(28),
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    marginLeft: rs(4),
    fontSize: rms(30),
    color: "#000",
    fontWeight: "500",
  },
  addButton: {
    backgroundColor: "#1C98ED",
    borderRadius: rs(100),
    minHeight: rvs(28),
    paddingHorizontal: rs(16),
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#FAFAFA",
    fontSize: rms(14),
    fontWeight: "500",
  },
  tabWrap: {
    backgroundColor: "#F1F5F9",
    borderRadius: rs(24),
    padding: rs(4),
    flexDirection: "row",
    gap: rs(6),
  },
  tabButton: {
    flex: 1,
    borderRadius: rs(16),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rvs(10),
  },
  tabButtonActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: rs(2),
    elevation: 1,
  },
  tabText: {
    fontSize: rms(14),
    fontWeight: "500",
    color: "#64748B",
  },
  tabTextActive: {
    color: "#2899CF",
  },
  searchWrap: {
    marginTop: rvs(12),
    marginHorizontal: rs(14),
    backgroundColor: "#fff",
    borderRadius: rs(28),
    minHeight: rvs(42),
    paddingHorizontal: rs(16),
    flexDirection: "row",
    alignItems: "center",
    gap: rs(10),
  },
  searchInput: {
    flex: 1,
    fontSize: rms(10),
    color: "#181818",
    paddingVertical: rvs(8),
  },
  listContainer: {
    paddingHorizontal: rs(14),
    paddingTop: rvs(14),
    paddingBottom: rvs(28),
    gap: rs(12),
  },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderRadius: rs(24),
    padding: rs(17),
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: rs(48),
    height: rs(48),
    borderRadius: rs(24),
    marginRight: rs(16),
    backgroundColor: "#E2E8F0",
  },
  cardTextWrap: {
    flex: 1,
    paddingRight: rs(8),
  },
  nameText: {
    fontSize: rms(16),
    fontWeight: "400",
    color: "#0F172A",
    lineHeight: rvs(24),
  },
  subText: {
    fontSize: rms(10),
    color: "#A1A1AA",
    marginTop: rvs(2),
  },
  phoneBtn: {
    width: rs(30),
    height: rs(30),
    borderRadius: rs(15),
    backgroundColor: "rgba(40,153,207,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  pendingActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
  },
  rejectBtn: {
    width: rs(30),
    height: rs(30),
    borderRadius: rs(15),
    backgroundColor: "#FCEAEA",
    alignItems: "center",
    justifyContent: "center",
  },
  approveBtn: {
    width: rs(30),
    height: rs(30),
    borderRadius: rs(15),
    backgroundColor: "#E8F8EE",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
    marginTop: rvs(20),
    color: "#777",
  },
  errorText: {
    color: "#C81616",
    fontSize: rms(12),
    marginBottom: rvs(8),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(20),
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: rs(16),
    padding: rs(16),
  },
  modalTitle: {
    fontSize: rms(18),
    fontWeight: "600",
    color: "#181818",
    marginBottom: rvs(6),
  },
  modalSubTitle: {
    fontSize: rms(13),
    color: "#777",
    marginBottom: rvs(12),
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#D4D4D8",
    borderRadius: rs(10),
    paddingHorizontal: rs(12),
    minHeight: rvs(42),
    color: "#181818",
    marginBottom: rvs(14),
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: rs(10),
  },
  modalCancel: {
    minHeight: rvs(38),
    minWidth: rs(80),
    borderRadius: rs(10),
    borderWidth: 1,
    borderColor: "#D4D4D8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(12),
  },
  modalCancelText: {
    color: "#52525B",
    fontSize: rms(13),
    fontWeight: "500",
  },
  modalApprove: {
    minHeight: rvs(38),
    minWidth: rs(88),
    borderRadius: rs(10),
    backgroundColor: "#1C98ED",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(12),
  },
  modalApproveDisabled: {
    opacity: 0.65,
  },
  modalApproveText: {
    color: "#fff",
    fontSize: rms(13),
    fontWeight: "600",
  },
});
