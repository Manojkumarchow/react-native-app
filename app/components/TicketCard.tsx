import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

/* ---------------------------------
   TYPES
---------------------------------- */
type Ticket = {
  id: number;
  title: string;
  description: string;
  status: string;
  timeAgo?: string;
};

type Props = {
  ticket: Ticket;
  onPress?: () => void;
};

export default function TicketCard({ ticket, onPress }: Props) {
  const isResolved = ticket.status === "Resolved";

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: isResolved ? "#EBFFF3" : "#FFEBEB",
          opacity: pressed ? 0.92 : 1, // subtle feedback, safe on all devices
        },
      ]}
    >
      {/* HEADER ROW */}
      <View style={styles.row}>
        <Feather
          name={isResolved ? "check-circle" : "alert-circle"}
          size={22}
          color={isResolved ? "#08401E" : "#FF0606"}
        />

        <Text
          style={[
            styles.title,
            { color: isResolved ? "#08401E" : "#FF0606" },
          ]}
          numberOfLines={2}
        >
          {ticket.title}
        </Text>

        {!!ticket.timeAgo && (
          <Text style={styles.time}>{ticket.timeAgo}</Text>
        )}
      </View>

      {/* DESCRIPTION */}
      {!!ticket.description && (
        <Text style={styles.desc} numberOfLines={3}>
          {ticket.description}
        </Text>
      )}

      {/* FOOTER */}
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
          style={[
            styles.status,
            { color: isResolved ? "#08401E" : "#FF0606" },
          ]}
        >
          {ticket.status}
        </Text>
      </View>
    </Pressable>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
    marginBottom: 18,

    width: "95%", // percentage-based → safe on all screens
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
    flex: 1, // prevents overflow on small devices
  },

  time: {
    fontSize: 11,
    color: "#555",
    marginLeft: 8,
  },

  desc: {
    marginTop: 10,
    fontSize: 13,
    color: "#444",
    lineHeight: 18,
  },

  footer: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "space-between",
    alignItems: "center",
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
