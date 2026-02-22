import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "./config";
import useAuthStore from "./store/authStore";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import useProfileStore from "./store/profileStore";
type BackendNotification = {
  id: number;
  title: string;
  body: string;
  type: string; // SYSTEM | NOTICE | ALERT
  createdAt: string; // ISO string
  isRead: boolean;
};

type UIType = "ALERT" | "SUCCESS" | "INFO";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  type: UIType;
  daysAgo: string;
};

export default function NotificationsScreen() {
  const [data, setData] = useState<NotificationItem[]>([]);
  const phone = useProfileStore((profile) => profile.phone);
  useEffect(() => {
    fetchNotifications();
  }, []);
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/notifications/${phone}`);
      console.log("Response from notifications: ", res);
      const mapped: NotificationItem[] = res.data.map(
        (n: BackendNotification) => ({
          id: String(n.id),
          title: n.title,
          description: n.body,
          type: mapBackendTypeToUI(n.type),
          daysAgo: getDaysAgo(n.createdAt),
        }),
      );
      setData(mapped);
    } catch (err) {
      console.log("Failed to load notifications", err);
    }
  };

  const mapBackendTypeToUI = (type: string): UIType => {
    switch (type) {
      case "ALERT":
        return "ALERT";
      case "SUCCESS":
        return "SUCCESS";
      default:
        return "INFO";
    }
  };

  const getDaysAgo = (dateString: string): string => {
    const created = new Date(dateString).getTime();
    const now = Date.now();
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 Day Ago";
    return `${diffDays} Days Ago`;
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.screen}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" style={styles.arrowButton} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Notifications</Text>

          <View style={{ width: 24 }} />
        </View>

        {/* CONTENT */}
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {data.map((item) => {
              const isAlert = item.type === "ALERT";
              const isSuccess = item.type === "SUCCESS";

              return (
                <View
                  key={item.id}
                  style={[
                    styles.card,
                    isAlert && styles.alertCard,
                    !isAlert && styles.successCard,
                  ]}
                >
                  <View style={styles.iconRow}>
                    <Ionicons
                      name={
                        isAlert
                          ? "alert-circle-outline"
                          : isSuccess
                            ? "checkmark-circle-outline"
                            : "information-circle-outline"
                      }
                      size={22}
                      color={isAlert ? "#C1282D" : "#08401E"}
                    />

                    <Text style={styles.daysAgo}>{item.daysAgo}</Text>
                  </View>

                  <Text
                    style={[
                      styles.title,
                      { color: isAlert ? "#C1282D" : "#08401E" },
                    ]}
                  >
                    {item.title}
                  </Text>

                  <Text style={styles.desc}>{item.description}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#4C97E8",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
    height: 130,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 12,
    marginTop: 70
  },
  arrowButton: {
    marginTop: 70
  },

  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 16,
  },

  card: {
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
  },

  alertCard: {
    backgroundColor: "#FDECEA",
  },

  successCard: {
    backgroundColor: "#EBFFF3",
  },

  iconRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 6,
  },

  desc: {
    fontSize: 13,
    color: "#555",
    marginTop: 6,
    lineHeight: 18,
  },

  daysAgo: {
    fontSize: 11,
    color: "#666",
  },
});
