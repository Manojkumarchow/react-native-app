import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from "react-native";
import NetworkImage from "./NetworkImage";

const { width } = Dimensions.get("window");
const CARD_WIDTH = Math.min(1000, width - 36);
const LOCAL_HERO = require("./../../assets/images/real-estate.jpeg");

export default function TopAdsSlider({ autoPlay = true, autoMs = 4000 }) {
  const slides = [
    "https://placehold.co/900x260?text=Ad+1",
    "https://placehold.co/900x260?text=Ad+2",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || slides.length < 2) return;
    const t = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      autoMs
    );
    return () => clearInterval(t);
  }, [autoPlay, autoMs]);

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <NetworkImage
          uri={slides[index]}
          localFallback={LOCAL_HERO}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.pagerRow}>
        <TouchableOpacity onPress={prev} style={styles.chev}>
          <Text>{"<"}</Text>
        </TouchableOpacity>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>
        <TouchableOpacity onPress={next} style={styles.chev}>
          <Text>{">"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginVertical: 20, alignItems: "center" },
  card: {
    width: CARD_WIDTH,
    height: Math.round(CARD_WIDTH * 0.28),
    backgroundColor: "rgba(255,255, 255)",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  pagerRow: {
    marginTop: 12,
    width: CARD_WIDTH,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dots: { flexDirection: "row", alignItems: "center" },
  dot: {
    width: 6,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#fff",
    marginHorizontal: 6,
    backgroundColor: "transparent",
  },
  dotActive: { backgroundColor: "#fff" },
  chev: { paddingHorizontal: 12, paddingVertical: 6 },
});
