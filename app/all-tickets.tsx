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
import TicketCard from "./components/TicketCard";
import axios from "axios";
import useProfileStore from "./store/profileStore";

export default function AllTicketsScreen() {
  const router = useRouter();
  const username = useProfileStore((s) => s.phone); // username is phone

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Convert timestamp → “X days ago"
  const getTimeAgo = (timestamp: string) => {
    const created = new Date(timestamp);
    const now = new Date();
    let diff = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 3600 * 24)
    );
    diff = 1;
    if (diff <= 0) return "Today";
    if (diff === 1) return "Yesterday";
    return `${diff} Days Ago`;
  };

  // Fetch backend tickets
  const fetchTickets = async () => {
    if (!username) return;

    try {
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_BASE_URL}/issues/profile/${username}`
      );

      const data = res.data || [];

      // Transform backend response → UI format
      const mapped = data.map((item: any) => ({
        id: item.complaintId,
        title: item.title,
        description: item.description,
        status: item.resolved ? "Resolved" : "Under Review",
        timeAgo: getTimeAgo(item.timestamp),
      }));

      setTickets(mapped);
    } catch (err) {
      console.log("Fetch issues error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTickets().finally(() => setRefreshing(false));
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.bg}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={26} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>All Tickets</Text>

          <Feather
            name="search"
            size={24}
            color="#fff"
            style={{ marginLeft: "auto" }}
          />
          <Feather
            name="bell"
            size={24}
            color="#fff"
            style={{ marginLeft: 18 }}
          />
        </View>

        {/* WHITE CONTENT AREA */}
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
                <Text style={styles.noTickets}>No tickets found</Text>
              ) : (
                tickets.map((t, index) => <TicketCard key={index} ticket={t} />)
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </>
  );
}

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
