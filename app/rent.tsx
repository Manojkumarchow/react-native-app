import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useProfileStore from "./store/profileStore";

export default function RentScreen() {
  const router = useRouter();
  const profile = useProfileStore((state) => state.profile);

  const role = profile?.role; // ADMIN | USER

  // SAFETY GUARD
  if (role !== "ADMIN") {
    return (
      <View style={styles.screen}>
        <Text style={styles.restricted}>This feature is only for Owners</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.screen}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Rent</Text>

          <View style={styles.headerIcons}>
            <MaterialCommunityIcons name="magnify" size={22} color="#fff" />
            <View style={styles.badgeWrap}>
              <MaterialCommunityIcons
                name="bell-outline"
                size={22}
                color="#fff"
              />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>5</Text>
              </View>
            </View>
          </View>
        </View>

        {/* CONTENT */}
        <View style={styles.container}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="key-outline"
              size={28}
              color="#1C98ED"
            />
          </View>

          <Text style={styles.title}>This Feature only for Tenants</Text>

          <Text style={styles.subtitle}>
            Your payment has been successfully processed.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.outlineBtn}>
              <Text style={styles.outlineText}>
                Add Reminder for Your Tenant
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.outlineBtn}>
              <Text style={styles.outlineText}>Chat with Tenant</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#1C98ED",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
  },

  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 12,
  },

  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  badgeWrap: {
    position: "relative",
  },

  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 4,
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: "center",
    paddingTop: 80,
  },

  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#DFF8DF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    fontWeight: "300",
    marginBottom: 30,
  },

  actions: {
    flexDirection: "row",
    gap: 12,
  },

  outlineBtn: {
    borderWidth: 1,
    borderColor: "#1C98ED",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  outlineText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1C98ED",
  },

  restricted: {
    marginTop: 200,
    textAlign: "center",
    fontSize: 16,
    color: "#fff",
  },
});
