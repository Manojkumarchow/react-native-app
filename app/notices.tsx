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
import useAuthStore from "./store/authStore";
import { router } from "expo-router";

interface Notice {
  noticeId: string;
  title: string;
  description: string;
  type: "ALERT" | "INFO";
  createdAt: string;
}

export default function Notices({ navigation }: any) {
  const { username } = useAuthStore();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    const fetchNotices = async () => {
      try {
        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_BASE_URL}/notices/${username}`
        );
        setNotices(res.data);
      } catch (error) {
        console.error("Failed to fetch notices", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, [username]);

  const getDaysAgo = (dateStr: string) => {
    const created = new Date(dateStr).getTime();
    const now = Date.now();
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? "Today" : `${diffDays} Days Ago`;
  };

  const renderItem = ({ item }: { item: Notice }) => {
    const isAlert = item.type === "ALERT";

    return (
      <View style={[styles.card, isAlert ? styles.alertCard : styles.infoCard]}>
        <View style={styles.iconWrapper}>
          <Ionicons
            name="alert-circle-outline"
            size={22}
            color={isAlert ? "#c62828" : "#1b5e20"}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.row}>
            <Text
              style={[
                styles.title,
                isAlert ? styles.alertTitle : styles.infoTitle,
              ]}
            >
              {item.title}
            </Text>
            <Text style={styles.daysAgo}>{getDaysAgo(item.createdAt)}</Text>
          </View>

          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notices</Text>

        <View style={{ width: 24 }} />
      </View>

      {/* Loader */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#4c97e8"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={notices}
          keyExtractor={(item) => item.noticeId}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomBar}>
        <Ionicons name="home-outline" size={26} color="#fff" />
        <Ionicons name="grid-outline" size={26} color="#fff" />
        <View style={styles.fab}>
          <Ionicons name="layers-outline" size={28} color="#fff" />
        </View>
        <Ionicons name="chatbubble-outline" size={26} color="#fff" />
        <Ionicons name="person-outline" size={26} color="#fff" />
      </View>
    </View>
  );
}

/* ================== STYLES ================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaf4ff",
  },

  header: {
    backgroundColor: "#4c97e8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  card: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 22,
    padding: 16,
  },
  alertCard: {
    backgroundColor: "#fdecea",
  },
  infoCard: {
    backgroundColor: "#e8f5e9",
  },

  iconWrapper: {
    marginRight: 12,
    marginTop: 2,
  },

  content: {
    flex: 1,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  alertTitle: {
    color: "#c62828",
  },
  infoTitle: {
    color: "#1b5e20",
  },

  description: {
    marginTop: 6,
    fontSize: 14,
    color: "#555",
  },

  daysAgo: {
    fontSize: 12,
    color: "#777",
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: "#4c97e8",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4256ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
});
