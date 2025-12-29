import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import FrostedCard from "../components/FrostedCard";

export default function AboutUsScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safe}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>About Us</Text>
        </View>

        {/* CONTENT */}
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <FrostedCard>
            <Text style={styles.title}>Nestiti</Text>

            <Text style={styles.text}>
              Nestiti is a smart apartment maintenance management app that helps
              residential communities manage maintenance payments, expenses,
              complaints, and resident communication — all in one place.
            </Text>

            <Text style={styles.text}>
              Designed for apartment associations and standalone buildings,
              Nestiti replaces manual work and WhatsApp follow-ups with a
              simple, transparent, and secure digital system.
            </Text>

            <Text style={styles.text}>
              With Nestiti, managing your community becomes easier, faster, and
              more organized.
            </Text>

            <View style={styles.divider} />

            <Text style={styles.tagline}>
              Nestiti — Simple. Transparent. Stress-free apartment management
              app.
            </Text>
          </FrostedCard>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#B3D6F7",
  },

  header: {
    backgroundColor: "#1C98ED",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerTitle: {
    marginLeft: 14,
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0A174E",
    marginBottom: 16,
    textAlign: "center",
  },

  text: {
    fontSize: 15,
    color: "#333",
    lineHeight: 24,
    marginBottom: 14,
    textAlign: "left",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginVertical: 14,
  },

  tagline: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C98ED",
    textAlign: "center",
  },
});
