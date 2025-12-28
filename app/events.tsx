import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";
import { useRouter } from "expo-router";
import useAuthStore from "./store/authStore";
import useProfileStore from "./store/profileStore";
import useBuildingStore from "./store/buildingStore";

interface EventItem {
  eventId: string;
  title: string;
  description: string;
  type: "INFO" | "ALERT";
  profileId: string;
  createdAt: string;
}

export default function Events() {
  const router = useRouter();
  const buildingId = useBuildingStore((s) => s.buildingId); // username is phone

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_BASE_URL}/events/${buildingId}`
      );
      setEvents(res.data || []);
    } catch (error) {
      console.error("Error fetching events", error);
    } finally {
      setLoading(false);
    }
  };

  const daysAgo = (dateStr: string) => {
    const created = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    );
    return `${diff} Days Ago`;
  };

  const renderItem = ({ item }: { item: EventItem }) => (
    <View style={styles.card}>
      <View style={styles.iconWrapper}>
        <Ionicons name="information-circle-outline" size={22} color="#1B5E20" />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.daysAgo}>{daysAgo(item.createdAt)}</Text>
        </View>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Events</Text>

        <View style={{ width: 24 }} />
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#1C98ED" />
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.eventId}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 140 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C98ED",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 12,
  },

  content: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#EBFFF3",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },

  iconWrapper: {
    marginRight: 12,
    marginTop: 2,
  },

  cardContent: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B5E20",
    flex: 1,
    paddingRight: 10,
  },

  daysAgo: {
    fontSize: 12,
    color: "#555",
  },

  description: {
    marginTop: 6,
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
});
