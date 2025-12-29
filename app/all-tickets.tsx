import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import axios from "axios";

import TicketCard from "./components/TicketCard";
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
};

export default function AllTicketsScreen() {
  const router = useRouter();

  // ---- PROFILE DATA ----
  const username = useProfileStore((s) => s.phone);
  const role = useProfileStore((s) => s.role);
  const profileId = useBuildingStore((s) => s.adminPhone);

  // ---- STATE ----
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* ---------------------------------
     FETCH TICKETS
  ---------------------------------- */
  const fetchTickets = async () => {
    if (!username) return;

    try {
      setLoading(true);

      let url = "";

      if (role === "ADMIN") {
        if (!profileId) return;
        url = `${process.env.EXPO_PUBLIC_BASE_URL}/issues/assignee/${profileId}`;
      } else {
        url = `${process.env.EXPO_PUBLIC_BASE_URL}/issues/profile/${username}`;
      }

      const res = await axios.get(url);
      const data = res.data;

      const mapped: Ticket[] = Array.isArray(data)
        ? data
            .filter(Boolean) // ⛑️ removes null / undefined items
            .map((item: any) => ({
              id: item.complaintId,
              title: item.title ?? "Untitled Complaint",
              description: item.description ?? "",
              status: item.isResolved ? "Resolved" : "Under Review",
              imageUrls: item.imageUrls ?? [],
            }))
        : [];

      setTickets(mapped);
    } catch (err) {
      console.log("Fetch tickets error:", err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------
     INITIAL LOAD
  ---------------------------------- */
  useEffect(() => {
    fetchTickets();
  }, [role, username, profileId]);

  /* ---------------------------------
     PULL TO REFRESH
  ---------------------------------- */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTickets().finally(() => setRefreshing(false));
  }, [role, username, profileId]);

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
            <ActivityIndicator
              size="large"
              color="#1C98ED"
              style={{ marginTop: 40 }}
            />
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
                    onPress={() =>
                      router.push(`/ticket-details?id=${ticket.id}`)
                    }
                  />
                ))
              )}
            </ScrollView>
          )}
        </View>
      </View>
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
    marginTop: 55,
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
});
