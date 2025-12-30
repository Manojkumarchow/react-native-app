import React, { ReactNode } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

export default function FrostedCard({ children }: { children: ReactNode }) {
  return (
    <View style={styles.container}>
      {/* 🔧 FIX: Blur only on iOS */}
      {Platform.OS === "ios" && (
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
      )}

      <LinearGradient
        colors={["#FFFFFF", "rgba(255,255,255,0.7)"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 30,
    overflow: "hidden",
  },
  inner: {
    padding: 28,
  },
});
