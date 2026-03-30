import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { rms, rs, rvs } from "@/constants/responsive";

const ILLUSTRATION_URI =
  "https://www.figma.com/api/mcp/asset/cb460ce4-5075-41b2-95e5-b2e3e7ac1fc6";

export default function ApprovalPendingScreen() {
  const router = useRouter();
  const { name, buildingName, role } = useLocalSearchParams<{
    name?: string;
    buildingName?: string;
    role?: string;
  }>();

  const resolvedName = Array.isArray(name) ? name[0] : name ?? "Resident";
  const resolvedBuilding = Array.isArray(buildingName)
    ? buildingName[0]
    : buildingName ?? "Your Building";
  const resolvedRole = (Array.isArray(role) ? role[0] : role ?? "USER").toUpperCase();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.name}>{resolvedName}</Text>
          <View style={styles.buildingRow}>
            <Feather name="map-pin" size={rs(14)} color="#64748B" />
            <Text style={styles.buildingText}>
              {resolvedBuilding} · {resolvedRole === "OWNER" ? "Owner" : "Tenant"}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <Image source={{ uri: ILLUSTRATION_URI }} style={styles.illustration} resizeMode="contain" />
          <Text style={styles.title}>Approval Pending</Text>
          <Text style={styles.subtitle}>
            Your request has been sent to the admin, let&apos;s wait for their approval.
          </Text>
        </View>

        <View style={styles.footer}>
          <Pressable style={styles.button} onPress={() => router.replace("/login")}>
            <Text style={styles.buttonText}>Go to Login</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: rs(24),
    borderBottomRightRadius: rs(24),
    paddingHorizontal: rs(24),
    paddingTop: rvs(16),
    paddingBottom: rvs(24),
  },
  greeting: {
    color: "#64748B",
    fontSize: rms(12),
    marginBottom: rvs(2),
  },
  name: {
    color: "#0F172A",
    fontSize: rms(30),
    fontWeight: "700",
    marginBottom: rvs(10),
  },
  buildingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
  },
  buildingText: {
    color: "#64748B",
    fontSize: rms(14),
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(24),
  },
  illustration: {
    width: rs(320),
    height: rvs(260),
    marginBottom: rvs(16),
  },
  title: {
    color: "#1C98ED",
    fontSize: rms(34),
    fontWeight: "600",
    marginBottom: rvs(12),
    textAlign: "center",
  },
  subtitle: {
    color: "#777777",
    fontSize: rms(16),
    lineHeight: rvs(24),
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: rs(24),
    paddingBottom: rvs(20),
  },
  button: {
    backgroundColor: "#1C98ED",
    minHeight: rvs(48),
    borderRadius: rs(100),
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: rms(14),
    fontWeight: "600",
  },
});
