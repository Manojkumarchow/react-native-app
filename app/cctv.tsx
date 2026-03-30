import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { rms, rs, rvs } from "@/constants/responsive";

export default function CctvScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backTap}>
              <Feather name="arrow-left" size={22} color="#181818" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>CCTV - Live View</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.cameraTile} />
          <View style={styles.cameraTile} />
          <View style={styles.cameraTile} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: rs(24),
    borderBottomRightRadius: rs(24),
    borderBottomColor: "#F1F5F9",
    borderBottomWidth: 1,
    paddingHorizontal: rs(16),
    paddingTop: rvs(10),
    paddingBottom: rvs(14),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backTap: {
    marginRight: rs(8),
    padding: rs(4),
  },
  headerTitle: {
    color: "#000000",
    fontSize: rms(18),
    fontWeight: "500",
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 26,
    paddingBottom: 34,
    gap: 22,
  },
  cameraTile: {
    width: "100%",
    minHeight: 187,
    borderRadius: 12,
    backgroundColor: "#0E324B",
  },
});
