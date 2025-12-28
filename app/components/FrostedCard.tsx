import React, { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

interface FrostedCardProps {
  children: ReactNode;
}

export default function FrostedCard({ children }: FrostedCardProps) {
  return (
    <View style={styles.container}>
      <BlurView intensity={40} tint="light" style={styles.blurLayer} />

      <LinearGradient
        colors={["#FFFFFF", "rgba(255,255,255,0.45)"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientLayer}
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

  blurLayer: {
    ...StyleSheet.absoluteFillObject,
  },

  gradientLayer: {
    ...StyleSheet.absoluteFillObject,
  },

  inner: {
    padding: 28,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
});
