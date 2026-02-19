import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  type: "ALERT" | "SUCCESS" | "INFO";
  daysAgo: string;
};

const DATA: NotificationItem[] = [
  {
    id: "1",
    title: "Maintenance Payment Information",
    description:
      "The amount collected helps maintain common amenities and overall property upkeep.",
    type: "ALERT",
    daysAgo: "3 Days Ago",
  },
  {
    id: "2",
    title: "Lift Not Working",
    description:
      "Ticket Successfully Submitted. Your Ticket ID: 27576063. Check Updates by clicking this notification.",
    type: "SUCCESS",
    daysAgo: "180 Days Ago",
  },
  {
    id: "3",
    title: "Maintenance Payment Alert",
    description:
      "Please complete your maintenance payment to avoid service interruptions.",
    type: "ALERT",
    daysAgo: "33 Days Ago",
  },
  {
    id: "4",
    title: "Monthly Apartment Meeting",
    description:
      "Tomorrow at 6:00 PM we have our monthly meeting; all residents are requested to attend.",
    type: "INFO",
    daysAgo: "35 Days Ago",
  },
  {
    id: "5",
    title: "Vinayaka Chavithi Festival Information",
    description:
      "We are pleased to invite all residents to celebrate the auspicious Vinayaka Chavithi Festival together at our apartment community.",
    type: "INFO",
    daysAgo: "180 Days Ago",
  },
];

export default function NotificationsScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.screen}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Notifications</Text>

          <View style={{ width: 24 }} />
        </View>

        {/* CONTENT */}
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {DATA.map((item) => {
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
    height: 130
  },

  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 12,
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
