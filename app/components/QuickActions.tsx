import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const actions = [
  {
    key: "pay",
    label: "Pay Now",
    icon: "credit-card-outline",
    route: "/payments",
  },
  {
    key: "raise",
    label: "Raise Issues",
    icon: "alert-circle-outline",
    route: "/issues",
  },
  {
    key: "notices",
    label: "Notices",
    icon: "file-document-outline",
    route: "/notices",
  },
  {
    key: "ledger",
    label: "My Flat Ledger",
    icon: "book-open-variant",
    route: "/ledger",
  },
  {
    key: "Enroll Building",
    label: "Register Building",
    icon: "home",
    route: "/enroll",
  },
];

export default function QuickActions() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.row}>
        {actions.map((a) => (
          <TouchableOpacity
            key={a.key}
            style={styles.action}
            onPress={() => router.push(a.route)}
          >
            <View style={styles.iconPlaceholder}>
              <MaterialCommunityIcons name={a.icon} size={28} color="#1C98ED" />
            </View>
            <Text style={styles.actionText}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 14,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#333", marginBottom: 14 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  action: {
    width: "18%",
    minWidth: 64,
    alignItems: "center",
    marginBottom: 16,
  },
  iconPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: "rgba(28,152,237,0.12)",
    borderWidth: 1,
    borderColor: "rgba(28,152,237,0.25)",
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { fontSize: 12, color: "#444", textAlign: "center" },
});
