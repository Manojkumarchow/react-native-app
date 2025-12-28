import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Linking,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import axios from "axios";
import useBuildingStore from "./store/buildingStore";

export default function ResidentsScreen() {
  const router = useRouter();

  const { buildingId, buildingName } = useBuildingStore();

  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [showFloorDropdown, setShowFloorDropdown] = useState(false);
  const floors = Array.from({ length: 10 }, (_, i) => i + 1);

  const [allResidents, setAllResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!buildingId) return;

    const fetchResidents = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_BASE_URL}/residents/building/${buildingId}`
        );
        setAllResidents(res.data || []);
      } catch (err) {
        console.log("Failed to fetch residents", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResidents();
  }, [buildingId]);

  /* ---------------------------------
     Client-side Floor Filter
  ---------------------------------- */
  const residents = useMemo(() => {
    return allResidents.filter(
      (r) => Number(r.floorNo) === Number(selectedFloor)
    );
  }, [allResidents, selectedFloor]);

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

          <Text style={styles.headerTitle}>
            Residents{buildingName ? ` · ${buildingName}` : ""}
          </Text>

          {/* <View style={styles.rightIcons}>
            <Feather
              name="search"
              size={22}
              color="#fff"
              style={{ marginRight: 18 }}
            />
            <Feather name="bell" size={22} color="#fff" />
          </View> */}
        </View>

        {/* FLOOR FILTER */}
        <View style={styles.filterRow}>
          <View>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowFloorDropdown(!showFloorDropdown)}
            >
              <Text style={styles.selectorText}>{selectedFloor} Floor</Text>
              <Feather name="chevron-down" size={18} color="#1C98ED" />
            </TouchableOpacity>

            {showFloorDropdown && (
              <View style={styles.dropdownList}>
                {floors.map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedFloor(f);
                      setShowFloorDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownText}>{f} Floor</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* RESIDENTS GRID */}
        <ScrollView contentContainerStyle={styles.scroll}>
          {loading ? (
            <ActivityIndicator size="large" color="#1C98ED" />
          ) : residents.length === 0 ? (
            <Text style={styles.emptyText}>
              No residents found on this floor
            </Text>
          ) : (
            <View style={styles.grid}>
              {residents.map((res, index) => (
                <View key={index} style={styles.card}>
                  <Text style={styles.name}>{res.name}</Text>

                  <View style={styles.line} />

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
                      <Text style={styles.actionText}>Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.chatBtn}>
                      <Feather
                        name="message-circle"
                        size={14}
                        color="#08401E"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.actionText}>Chat</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

/* ---------------------------------
   Styles (UNCHANGED VISUALLY)
---------------------------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#A3C9FF" },

  header: {
    paddingHorizontal: 18,
    paddingVertical: 14,
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
    marginLeft: "auto",
    alignItems: "center",
  },

  filterRow: {
    paddingHorizontal: 20,
    marginTop: 18,
  },

  selector: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#1C98ED",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 140,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  selectorText: {
    color: "#1C98ED",
    fontWeight: "600",
    fontSize: 14,
  },

  dropdownList: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1C98ED",
    marginTop: 6,
    width: 140,
    elevation: 5,
  },

  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  dropdownText: {
    fontSize: 14,
    color: "#1C98ED",
    fontWeight: "600",
  },

  scroll: { padding: 20 },

  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
    marginTop: 30,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "47%",
    backgroundColor: "#EBFFF3",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
    borderRadius: 20,
    padding: 12,
    marginBottom: 18,
  },

  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#08401E",
  },

  line: {
    height: 1,
    backgroundColor: "#000",
    opacity: 0.2,
    marginVertical: 8,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },

  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#08401E",
  },

  callBtn: { flexDirection: "row", alignItems: "center" },
  chatBtn: { flexDirection: "row", alignItems: "center" },
});
