import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Linking,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";

export default function ResidentsScreen() {
  const router = useRouter();

  // Floors dropdown state
  const [floors, setFloors] = useState<string[]>([]);
  const [selectedFloor, setSelectedFloor] = useState("1st Floor");
  const [showDropdown, setShowDropdown] = useState(false);

  // Residents list - STATIC for now, later will be dynamic from backend
  const [residents, setResidents] = useState<any[]>([]);

  useEffect(() => {
    loadFloors();
    loadResidents();
  }, []);

  const loadFloors = async () => {
    // Later replace with backend call: /floors
    const generatedFloors = Array.from(
      { length: 10 },
      (_, i) => `${i + 1}st Floor`
    );
    setFloors(generatedFloors);
  };

  const loadResidents = async () => {
    // Later replace with: GET /residents?floor=x
    // Hardcoded sample data
    setResidents([
      { name: "Raghuveer", flat: "101", phone: "9666499643" },
      { name: "Abhinav", flat: "102", phone: "9666499643" },
      { name: "Raghuveer", flat: "103", phone: "9666499643" },
      { name: "Raghuveer", flat: "105", phone: "9666499643" },
    ]);
  };

  const callUser = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safe}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Residents</Text>

          <View style={styles.rightIcons}>
            <Feather
              name="search"
              size={22}
              color="#fff"
              style={{ marginRight: 18 }}
            />
            <Feather name="bell" size={22} color="#fff" />
          </View>
        </View>

        {/* FLOOR SELECTOR */}
        <View style={styles.floorContainer}>
          <TouchableOpacity
            style={styles.floorButton}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Text style={styles.floorText}>{selectedFloor}</Text>
            <Feather name="chevron-down" size={18} color="#1C98ED" />
          </TouchableOpacity>

          {showDropdown && (
            <View style={styles.dropdown}>
              {floors.map((f, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedFloor(f);
                    setShowDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* RESIDENT LIST */}
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.grid}>
            {residents.map((res, index) => (
              <View key={index} style={styles.card}>
                {/* Name + Flat */}
                <Text style={styles.name}>{res.name}</Text>
                <Text style={styles.flat}>Flat No: {res.flat}</Text>

                <View style={styles.line} />

                {/* CALL & CHAT */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => callUser(res.phone)}
                  >
                    <Feather
                      name="phone"
                      size={14}
                      color="#08401E"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.callText}>Call</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.chatBtn}>
                    <Feather
                      name="message-circle"
                      size={14}
                      color="#08401E"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.chatText}>Chat</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#A3C9FF" },

  header: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 16,
    backgroundColor: "#7BA7FF",
    flexDirection: "row",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "700",
    marginLeft: 12,
  },

  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },

  floorContainer: { paddingHorizontal: 20, marginTop: 15 },

  floorButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#1C98ED",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    width: 140,
    justifyContent: "space-between",
  },

  floorText: { fontSize: 14, fontWeight: "600", color: "#1C98ED" },

  dropdown: {
    backgroundColor: "#fff",
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1C98ED",
    width: 140,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },

  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#1C98ED",
    fontWeight: "600",
  },

  scroll: { paddingHorizontal: 20, paddingVertical: 20 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "47%",
    backgroundColor: "#EBFFF3",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
    padding: 14,
    marginBottom: 18,
  },

  name: {
    fontSize: 13,
    fontWeight: "600",
    color: "#08401E",
  },

  flat: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },

  line: {
    height: 1,
    backgroundColor: "#000",
    marginVertical: 10,
    opacity: 0.3,
  },

  actionRow: { flexDirection: "row", justifyContent: "space-between" },

  callBtn: { flexDirection: "row", alignItems: "center" },
  chatBtn: { flexDirection: "row", alignItems: "center" },

  callText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#08401E",
  },
  chatText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#08401E",
  },
});
