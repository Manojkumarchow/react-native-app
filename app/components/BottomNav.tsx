import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function BottomNav() {
  const router = useRouter();
  return (
    <View style={[styles.bar, { width }]}>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => router.replace("/home")}
      >
        <Text style={styles.icon}>🏠</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity style={styles.tab} onPress={() => router.push("/grid")}>
        <Text style={styles.icon}>▦</Text>
      </TouchableOpacity> */}

      {/* <View style={styles.fabWrap}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/central")}
        >
          <Text style={{ color: "#fff", fontSize: 18 }}>≡</Text>
        </TouchableOpacity>
      </View> */}

      {/* <TouchableOpacity style={styles.tab} onPress={() => router.push("/chat")}>
        <Text style={styles.icon}>💬</Text>
      </TouchableOpacity> */}

      <TouchableOpacity
        style={styles.tab}
        onPress={() => router.push("/profile")}
      >
        <Text style={styles.icon}>👤</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    bottom: 0,
    height: 78,
    backgroundColor: "#1C98ED",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 28, color: "#fff" },
  fabWrap: {
    position: "absolute",
    left: width / 2 - 32,
    top: -28,
    width: 64,
    alignItems: "center",
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#5956E9",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
});
