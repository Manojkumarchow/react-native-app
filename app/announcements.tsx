import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useProfileStore from "./store/profileStore";

const PRIMARY = "#1C98ED";

export default function Announcement() {
  const router = useRouter();
  const role = useProfileStore((state) => state.role);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.screen}>
        {/* HEADER (ALWAYS SHOWN) */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Announcements</Text>
        </View>

        {/* ROLE-BASED CONTENT */}
        {role !== "USER" ? (
          /* RESTRICTED VIEW (OWNER / ADMIN) */
          <View style={styles.restrictedContainer}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="account-lock-outline"
                size={28}
                color={PRIMARY}
              />
            </View>

            <Text style={styles.title}>Coming Soon</Text>

            <Text style={styles.subtitle}>
              This feature will be available in the upcoming release.
            </Text>
          </View>
        ) : (
          /* TENANT VIEW */
          <View style={styles.container}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="key-outline"
                size={28}
                color={PRIMARY}
              />
            </View>

            <Text style={styles.title}>Rent Payment</Text>

            <Text style={styles.subtitle}>
              Your rent payment has been successfully processed.
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.outlineBtn}>
                <Text style={styles.outlineText}>Add Reminder for Owner</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.outlineBtn}>
                <Text style={styles.outlineText}>Chat with Owner</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PRIMARY,
  },

  /* Header */
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

  /* Restricted */
  restrictedContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  /* Tenant Content */
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
    textAlign: "center",
  },

  actions: {
    flexDirection: "row",
    gap: 12,
  },

  outlineBtn: {
    borderWidth: 1,
    borderColor: PRIMARY,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  outlineText: {
    fontSize: 12,
    fontWeight: "700",
    color: PRIMARY,
  },
});
