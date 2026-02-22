import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const PRIMARY = "#1C98ED";

export default function CcTv() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="chevron-back"
              size={24}
              color="#fff"
              style={styles.arrowButton}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CC TV</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.center}>
          <Text style={styles.infoText}>Coming Soon</Text>
          <Text style={styles.paymentEmoji}>🎥</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    height: 120,
    backgroundColor: PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 70,
  },
  arrowButton: {
    marginTop: 70,
  },

  /* Content */
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  paymentEmoji: {
    fontSize: 40,
    marginVertical: 12,
  },
  upiText: {
    fontSize: 16,
    fontWeight: "700",
    color: PRIMARY,
  },
  helperText: {
    fontSize: 12,
    color: "#888",
    marginTop: 6,
  },
});
