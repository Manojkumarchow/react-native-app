import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ Add this

export default function HomeScreen() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Failed to load user data", err);
      }
    };
    fetchUserData();
  }, []);

  const handleAction = (name) => {
    alert(`${name} is under construction`);
  };

  const handleProfilePress = () => {
    router.push("/profile");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/user.png")}
          style={styles.profileImage}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || "Guest"}</Text>
          <Text style={styles.apartment}>{user?.email || "No Email"}</Text>
          <Text style={styles.flat}>{user?.phone || "No Phone"}</Text>
        </View>
        <View style={styles.headerIcons}>
          <Ionicons name="notifications" size={22} color="#fff" />
          <Ionicons
            name="menu"
            size={22}
            color="#fff"
            style={{ marginLeft: 10 }}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Products</Text>
          <View style={styles.iconGrid}>
            {[
              { name: "Residents", icon: "home" },
              { name: "Maintenance", icon: "build" },
              { name: "Whistle up", icon: "megaphone" },
              { name: "Raise Ticket", icon: "clipboard", onPress: () => router.push("/issues") },
              { name: "Watch Man", icon: "shield" },
              { name: "Home services", icon: "people" },
              { name: "Renting", icon: "business" },
              { name: "PollPage", icon: "list", onPress: () => router.push("/PollPage") },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.iconCard}
                activeOpacity={0.8}
                onPress={() =>
                  item.onPress ? item.onPress() : handleAction(item.name)
                }
              >
                <View style={styles.iconCircle}>
                  <Ionicons name={item.icon} size={28} color="#5271ff" />
                </View>
                <Text style={styles.iconLabel}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {[
          { name: "Profile", icon: "person", onPress: handleProfilePress },
          { name: "Home", icon: "home", onPress: () => router.push("/tabs/home") },
          { name: "Cart", icon: "cart", onPress: () => handleAction("Cart") },
          { name: "Ledger", icon: "book", onPress: () => handleAction("Ledger") },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={item.onPress}
          >
            <Ionicons name={item.icon} size={22} color="#5271ff" />
            <Text style={styles.navText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// same styles as your version
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FB" },
  header: {
    backgroundColor: "#5271ff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  profileImage: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: "#fff" },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { color: "#fff", fontWeight: "bold", fontSize: 17, marginBottom: 2 },
  apartment: { color: "#e0f7fa", fontSize: 13 },
  flat: { color: "#e0f7fa", fontSize: 13 },
  headerIcons: { flexDirection: "row", alignItems: "center" },
  section: { padding: 20 },
  sectionTitle: { fontSize: 22, fontWeight: "bold", color: "#3A2D2D", marginBottom: 14 },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  iconCard: {
    backgroundColor: "#fff",
    width: "30%",
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 17,
    marginBottom: 17,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#5271ff",
  },
  iconCircle: {
    backgroundColor: "#e8f0ff",
    borderRadius: 14,
    padding: 10,
    marginBottom: 7,
    borderWidth: 2,
    borderColor: "#5271ff",
  },
  iconLabel: {
    color: "#5271ff",
    marginTop: 6,
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    elevation: 9,
  },
  navItem: { alignItems: "center", paddingHorizontal: 3 },
  navText: { fontSize: 12, color: "#5271ff", marginTop: 2, fontWeight: "600" },
});
