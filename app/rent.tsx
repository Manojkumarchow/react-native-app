import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import BottomNav from "./components/BottomNav";

// TEMP role (replace later)
type Role = "tenant" | "owner" | "flatOwner";
const userRole: Role = "tenant";

export default function RentScreen() {
  const router = useRouter();

  const renderContent = () => {
    // 🏠 TENANT
    if (userRole === "tenant") {
      return (
        <>
          <Text style={styles.info}>
            Tenant : This Feature only for Tenants
          </Text>

          <TouchableOpacity style={styles.primaryBtn}>
            <Text style={styles.primaryText}>Pay Rent</Text>
          </TouchableOpacity>
        </>
      );
    }

    // 👨‍💼 OWNER
    if (userRole === "owner") {
      return (
        <>
          <Text style={styles.info}>
            Owner : This Feature only for Tenants
          </Text>

          <TouchableOpacity style={styles.outlineBtn}>
            <Text style={styles.outlineText}>
              Add Reminder for Your Tenant
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.outlineBtn}>
            <Text style={styles.outlineText}>Chat with Tenant</Text>
          </TouchableOpacity>
        </>
      );
    }

    // 🚫 FLAT OWNER
    return (
      <>
        <Text style={styles.infoCenter}>
          Flat Owner : Access to this feature is restricted. Only flat owners who
          have rented out their flats can use it.
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace("/home")}
        >
          <Text style={styles.primaryText}>Return to Home</Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* 🔷 RENT HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.replace("/home")}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
              color="#fff"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Rent</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons
              name="magnify"
              size={22}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/notifications")}
          >
            <View style={{ position: "relative" }}>
              <MaterialCommunityIcons
                name="bell-outline"
                size={22}
                color="#fff"
              />
              <View style={styles.dot} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>{renderContent()}</View>

      {/* BOTTOM NAV */}
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  /* Header */
  header: {
    height: 100,
    backgroundColor: "#1C98ED",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 6,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    marginLeft: 16,
  },
  dot: {
    position: "absolute",
    right: -4,
    top: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF4B4B",
  },

  /* Content */
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  info: {
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  infoCenter: {
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },

  /* Buttons */
  primaryBtn: {
    backgroundColor: "#1C98ED",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "600",
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: "#1C98ED",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  outlineText: {
    color: "#1C98ED",
    fontWeight: "600",
    textAlign: "center",
  },
});
