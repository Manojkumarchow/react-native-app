// notices.tsx
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
import { router } from "expo-router";
import useBuildingStore from "./store/buildingStore";

interface Notice {
  noticeId: string;
  title: string;
  description: string;
  type: "ALERT" | "INFO";
  createdAt: string;
}

export default function Notices() {
  const buildingId = useBuildingStore((s) => s.buildingId);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!buildingId) return;

    const fetchNotices = async () => {
      try {
        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_BASE_URL}/notices/${buildingId}`,
        );
        setNotices(res.data);
      } catch (error) {
        console.error("Failed to fetch notices", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, [buildingId]);

  const getDaysAgo = (dateStr: string) => {
    const created = new Date(dateStr).getTime();
    const diff = Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
    return diff === 0 ? "Today" : `${diff} Days Ago`;
  };

  const renderItem = ({ item }: { item: Notice }) => {
    const isAlert = item.type === "ALERT";

    return (
      <View style={[styles.card, isAlert ? styles.alertCard : styles.infoCard]}>
        <Ionicons
          name="alert-circle-outline"
          size={22}
          color={isAlert ? "#c62828" : "#1b5e20"}
          style={{ marginRight: 10 }}
        />
        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.daysAgo}>{getDaysAgo(item.createdAt)}</Text>
          </View>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="#fff"
            style={styles.arrowButton}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notices</Text>

        <TouchableOpacity onPress={() => router.push("/create-notice")}>
          <Text style={styles.createText}>Create</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#4c97e8"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={notices}
          keyExtractor={(i) => i.noticeId}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eaf4ff" },
  header: {
    backgroundColor: "#4c97e8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 120,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: -60,
  },
  createText: {
    color: "#29ec14ff",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 60,
  },
  arrowButton: {
    marginTop: 60,
  },
  card: {
    flexDirection: "row",
    margin: 14,
    padding: 16,
    borderRadius: 18,
  },
  alertCard: { backgroundColor: "#fdecea" },
  infoCard: { backgroundColor: "#e8f5e9" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  title: { fontSize: 16, fontWeight: "600" },
  description: { marginTop: 6, fontSize: 14, color: "#555" },
  daysAgo: { fontSize: 12, color: "#777" },
});
