import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function TicketCard({ ticket }) {
  const isResolved = ticket.status === "Resolved";

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: isResolved ? "#EBFFF3" : "#FFEBEB" },
      ]}
    >
      <View style={styles.row}>
        <Feather
          name={isResolved ? "check-circle" : "alert-circle"}
          size={22}
          color={isResolved ? "#08401E" : "#FF0606"}
        />
        <Text
          style={[styles.title, { color: isResolved ? "#08401E" : "#FF0606" }]}
        >
          {ticket.title}
        </Text>

        <Text style={styles.time}>{ticket.timeAgo}</Text>
      </View>

      <Text style={styles.desc}>{ticket.description}</Text>

      <View style={styles.footer}>
        <Text
          style={[
            styles.ticketId,
            { color: isResolved ? "#08401E" : "#FF0606" },
          ]}
        >
          Ticket ID : {ticket.id}
        </Text>

        <Text
          style={[styles.status, { color: isResolved ? "#08401E" : "#FF0606" }]}
        >
          {ticket.status}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
    marginBottom: 18,
    width: "95%",
    alignSelf: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  time: {
    fontSize: 11,
    color: "#555",
  },
  desc: {
    marginTop: 10,
    fontSize: 13,
    color: "#444",
  },
  footer: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "space-between",
  },
  ticketId: {
    fontSize: 12,
    fontWeight: "600",
  },
  status: {
    fontSize: 12,
    fontWeight: "700",
  },
});
