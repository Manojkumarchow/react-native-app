import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from "react-native";
import NetworkImage from "./NetworkImage";
import { Linking } from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = Math.min(1000, width - 36);

export default function TopAdsSlider({ autoPlay = true, autoMs = 4000 }) {
  const slides = [
    {
      image: require("./../../assets/images/real-estate.jpeg"),
      link: "https://varka.in/",
    },
    {
      image: require("./../../assets/images/real-estate.jpeg"),
      link: "https://varka.in/",
    },
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

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => Linking.openURL(slides[index].link)}
      >
        <View style={styles.card}>
          <NetworkImage
            uri={slides[index].image}
            localFallback={slides[index].image}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
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
