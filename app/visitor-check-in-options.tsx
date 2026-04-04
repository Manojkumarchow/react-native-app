import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { rms, rs, rvs } from "@/constants/responsive";

const BRAND = "#1C98ED";

type CheckoutMode = "register" | "guest";

export default function VisitorCheckInOptionsScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<CheckoutMode>("register");

  const onContinue = () => {
    router.push({
      pathname: "/visitor-registration",
      params: { mode },
    } as never);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Text style={styles.title}>Visitor Registration</Text>
        <Text style={styles.heading}>How would you like to proceed?</Text>
        <Text style={styles.sub}>Choose how you want to check in as a visitor.</Text>

        <Pressable
          style={[styles.card, mode === "register" && styles.cardSelected]}
          onPress={() => setMode("register")}
        >
          <MaterialCommunityIcons
            name={mode === "register" ? "radiobox-marked" : "radiobox-blank"}
            size={24}
            color={mode === "register" ? BRAND : "#A1A1AA"}
          />
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, mode === "register" && styles.cardTitleSelected]}>
              Register with us
            </Text>
            <Text style={styles.cardSub}>
              Create an account for faster check-ins every time you visit.
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={[styles.card, mode === "guest" && styles.cardSelected]}
          onPress={() => setMode("guest")}
        >
          <MaterialCommunityIcons
            name={mode === "guest" ? "radiobox-marked" : "radiobox-blank"}
            size={24}
            color={mode === "guest" ? BRAND : "#A1A1AA"}
          />
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, mode === "guest" && styles.cardTitleSelected]}>
              Proceed as guest
            </Text>
            <Text style={styles.cardSub}>Fill the form manually, no account needed.</Text>
          </View>
        </Pressable>

        <View style={styles.footer}>
          <Pressable style={styles.continueBtn} onPress={onContinue}>
            <Text style={styles.continueText}>Continue</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: rs(24),
    paddingTop: rvs(16),
  },
  title: {
    fontSize: rms(13),
    fontWeight: "600",
    color: "#64748B",
    textAlign: "center",
    marginBottom: rvs(20),
  },
  heading: {
    fontSize: rms(22),
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: rvs(8),
  },
  sub: {
    fontSize: rms(15),
    color: "#64748B",
    textAlign: "center",
    marginBottom: rvs(28),
    lineHeight: rms(22),
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rs(12),
    padding: rs(18),
    borderRadius: rs(16),
    borderWidth: 2,
    borderColor: "#E4E4E7",
    backgroundColor: "#FFFFFF",
    marginBottom: rvs(14),
  },
  cardSelected: {
    borderColor: BRAND,
    backgroundColor: "#F0F9FF",
  },
  cardText: { flex: 1 },
  cardTitle: {
    fontSize: rms(17),
    fontWeight: "600",
    color: "#475569",
    marginBottom: rvs(6),
  },
  cardTitleSelected: { color: BRAND },
  cardSub: {
    fontSize: rms(14),
    color: "#64748B",
    lineHeight: rms(20),
  },
  footer: {
    marginTop: "auto",
    paddingBottom: rvs(28),
    paddingTop: rvs(16),
  },
  continueBtn: {
    backgroundColor: BRAND,
    borderRadius: rs(14),
    paddingVertical: rvs(16),
    alignItems: "center",
  },
  continueText: {
    fontSize: rms(16),
    fontWeight: "600",
    color: "#FAFAFA",
  },
});
