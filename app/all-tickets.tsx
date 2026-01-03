import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Pressable,
  useWindowDimensions,
  Platform,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import axios from "axios";

import TicketCard from "./components/TicketCard";
import FrostedCard from "./components/FrostedCard";
import useProfileStore from "./store/profileStore";
import useBuildingStore from "./store/buildingStore";

/* ---------------------------------
   TYPES
---------------------------------- */
type Ticket = {
  id: number;
  title: string;
  description: string;
  status: string;
  imageUrls: string[];
  raisedBy?: string;
  flatNumber?: string;
};

export default function AllTicketsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // ---- PROFILE DATA ----
  const username = useProfileStore((s) => s.phone);
  const role = useProfileStore((s) => s.role);
  const profileId = useBuildingStore((s) => s.adminPhone);

  // ---- STATE ----
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ---- MODAL STATE ----
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [resolving, setResolving] = useState(false);

  /* ---------------------------------
     FETCH TICKETS
  ---------------------------------- */
  const fetchTickets = async (
    resolvedUsername?: string | null,
    resolvedProfileId?: string | null
  ) => {
    try {
      setLoading(true);

      let url = "";
      if (role === "ADMIN") {
        url = `${process.env.EXPO_PUBLIC_BASE_URL}/issues/assignee/${resolvedProfileId}`;
      } else {
        url = `${process.env.EXPO_PUBLIC_BASE_URL}/issues/profile/${resolvedUsername}`;
      }

      const res = await axios.get(url);

      const mapped: Ticket[] = Array.isArray(res.data)
        ? res.data.filter(Boolean).map((item: any) => ({
          id: item.complaintId,
          title: item.title ?? "Untitled Complaint",
          description: item.description ?? "",
          status: item.resolved ? "Resolved" : "Under Review",
          imageUrls: item.imageUrls ?? [],
          raisedBy: item.raisedBy ?? "-",
          flatNumber: item.flatNumber ?? "-",
        }))
        : [];

      setTickets(mapped);
    } catch (err) {
      console.error("Fetch tickets error:", err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!username) return;
    if (role === "ADMIN" && !profileId) return;

    fetchTickets(username, profileId);
  }, [role, username, profileId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTickets(username, profileId).finally(() =>
      setRefreshing(false)
    );
  }, [username, profileId, role]);

  /* ---------------------------------
     MODAL HANDLERS
  ---------------------------------- */
  const openTicketModal = (ticket: Ticket) => {
    if (role !== "ADMIN") return;
    setSelectedTicket(ticket);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedTicket(null);
  };

  const markAsResolved = async () => {
    if (!selectedTicket) return;

    try {
      setResolving(true);

      await axios.put(
        `${process.env.EXPO_PUBLIC_BASE_URL}/issues/${selectedTicket.id}`
      );

      closeModal();
      fetchTickets(username, profileId);
    } catch (err) {
      console.error("Resolve ticket error:", err);
    } finally {
      setResolving(false);
    }
  };

  /* ---------------------------------
     RENDER
  ---------------------------------- */
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.bg}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={26} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {role === "ADMIN" ? "Assigned Tickets" : "All Tickets"}
          </Text>
        </View>

        {/* CONTENT */}
        <View style={styles.cardContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#1C98ED" style={{ marginTop: 40 }} />
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {tickets.length === 0 ? (
                <Text style={styles.noTickets}>
                  {role === "ADMIN"
                    ? "No tickets assigned to you"
                    : "No tickets found"}
                </Text>
              ) : (
                tickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onPress={() => openTicketModal(ticket)}
                  />
                ))
              )}
            </ScrollView>
          )}
        </View>
      </View>

      {/* ================= ADMIN MODAL ================= */}
      {role === "ADMIN" && (
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={closeModal}
        >
          <Pressable style={styles.modalOverlay} onPress={closeModal}>
            <Pressable
              style={[styles.modalContent, { maxWidth: width * 0.9 }]}
              onPress={() => { }}
            >
              <FrostedCard>
                {/* HEADER */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {selectedTicket?.title}
                  </Text>
                  <TouchableOpacity onPress={closeModal}>
                    <Feather name="x" size={20} color="#222" />
                  </TouchableOpacity>
                </View>

                {/* STATUS */}
                <Text style={styles.modalStatus}>
                  Status: {selectedTicket?.status}
                </Text>

                {/* META INFO */}
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Raised By:</Text>
                  <Text style={styles.metaValue}>
                    {selectedTicket?.raisedBy}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Flat No:</Text>
                  <Text style={styles.metaValue}>
                    {selectedTicket?.flatNumber}
                  </Text>
                </View>

                {/* DESCRIPTION */}
                {!!selectedTicket?.description && (
                  <Text style={styles.modalDesc}>
                    {selectedTicket.description}
                  </Text>
                )}

                {/* IMAGE GALLERY */}
                {(selectedTicket?.imageUrls ?? []).length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.imageRow}
                  >
                    {selectedTicket?.imageUrls.map((url, idx) => (
                      <View key={idx} style={styles.imageWrapper}>
                        <Image
                          source={{ uri: url }}
                          style={styles.image}
                          resizeMode="cover"
                        />
                      </View>
                    ))}
                  </ScrollView>
                )}

                {/* RESOLVE BUTTON */}
                {selectedTicket?.status !== "Resolved" && (
                  <TouchableOpacity
                    style={[
                      styles.resolveBtn,
                      resolving && { opacity: 0.6 },
                    ]}
                    onPress={markAsResolved}
                    disabled={resolving}
                  >
                    {resolving ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.resolveText}>
                        Mark as Resolved
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </FrostedCard>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#7CA9FF",
  },

  headerRow: {
    marginTop: Platform.OS === "ios" ? 55 : 40,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  headerTitle: {
    marginLeft: 14,
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },

  cardContainer: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingBottom: 20,
  },

  noTickets: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#777",
    fontWeight: "600",
  },

  /* -------- MODAL -------- */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  modalContent: {
    width: "100%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    flex: 1,
    marginRight: 8,
  },

  modalStatus: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C98ED",
    marginBottom: 12,
  },

  metaRow: {
    flexDirection: "row",
    marginBottom: 6,
  },

  metaLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
    width: 90,
  },

  metaValue: {
    fontSize: 13,
    color: "#555",
    flex: 1,
  },

  modalDesc: {
    marginTop: 10,
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },

  imageRow: {
    marginTop: 14,
  },

  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 10,
    backgroundColor: "#eee",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  resolveBtn: {
    marginTop: 20,
    backgroundColor: "#1C98ED",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  resolveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
