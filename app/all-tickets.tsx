import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import TicketCard from "./components/TicketCard";

export default function AllTicketsScreen() {
  const router = useRouter();
  const [tickets, setTickets] = useState([
    {
      id: "27576063",
      title: "Lift Not Working",
      description:
        "We are pleased to invite all residents to celebrate the auspicious Vinayaka Chavithi Festival together at our apartment community.",
      status: "Under Review",
      timeAgo: "1 Day Ago",
    },
    {
      id: "27576063",
      title: "Lift Not Working",
      description:
        "We are pleased to invite all residents to celebrate the auspicious Vinayaka Chavithi Festival together at our apartment community.",
      status: "Resolved",
      timeAgo: "10 Days Ago",
    },
  ]);

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

        {/* WHITE AREA */}
        <View style={styles.cardContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {tickets.map((t, index) => (
              <TicketCard key={index} ticket={t} />
            ))}
          </ScrollView>
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
  },
});
