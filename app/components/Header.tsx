import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <Image
          source={{ uri: "https://placehold.co/48x48" }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.greeting}>Hello Sarah</Text>
          <Text style={styles.sub}>Welcome Back........!</Text>
        </View>
      </View>

      <View style={styles.right}>
        <MaterialCommunityIcons
          name="magnify"
          size={22}
          color="#fff"
          style={{ marginRight: 12 }}
        />
        <View style={{ position: "relative" }}>
          <MaterialCommunityIcons name="bell-outline" size={22} color="#fff" />
          <View style={styles.dot}>
            <Text style={styles.dotText}></Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 110,
    backgroundColor: "#1C98ED",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 18,
    paddingTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: "#fff",
  },
  greeting: { color: "#fff", fontSize: 18, fontWeight: "700" },
  sub: { color: "rgba(255,255,255,0.9)", fontSize: 12, marginTop: 2 },
  right: { flexDirection: "row", alignItems: "center" },
  dot: {
    position: "absolute",
    right: -6,
    top: -6,
    backgroundColor: "#FF4B4B",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  dotText: { color: "#fff", fontSize: 10, fontWeight: "700" },
});
