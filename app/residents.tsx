import React, { useMemo, useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
type Resident = {
  id: string;
  name: string;
  flat: string;
  subtitle: string;
  phone?: string;
};

const avatarUri =
  "https://www.figma.com/api/mcp/asset/84d44808-4b5b-40ca-9c62-df413083a57f";

const allData: Resident[] = [
  { id: "1", name: "Ravi Kumar", flat: "A-102", subtitle: "Tenant - 102", phone: "9876543210" },
  { id: "2", name: "Kiran Rao", flat: "A-103", subtitle: "Owner - 103", phone: "9876543211" },
  { id: "3", name: "Priya Sharma", flat: "B-204", subtitle: "Tenant - 204", phone: "9876543212" },
  { id: "4", name: "Amit Verma", flat: "B-205", subtitle: "Owner - 205", phone: "9876543213" },
  { id: "5", name: "Nisha Reddy", flat: "C-301", subtitle: "Tenant - 301", phone: "9876543214" },
  { id: "6", name: "Sandeep N", flat: "C-302", subtitle: "Owner - 302", phone: "9876543215" },
  { id: "7", name: "Meena Iyer", flat: "D-401", subtitle: "Tenant - 401", phone: "9876543216" },
  { id: "8", name: "Arjun K", flat: "D-402", subtitle: "Owner - 402", phone: "9876543217" },
  { id: "9", name: "Pooja Das", flat: "E-501", subtitle: "Tenant - 501", phone: "9876543218" },
  { id: "10", name: "Rahul Jain", flat: "E-502", subtitle: "Owner - 502", phone: "9876543219" },
];

const pendingData: Resident[] = [
  { id: "p1", name: "Ravi Kumar", flat: "A-102", subtitle: "Tenant - 102" },
  { id: "p2", name: "Ravi Kumar", flat: "A-102", subtitle: "Tenant - 102" },
];

export default function ResidentsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "pending">("all");
  const [search, setSearch] = useState("");

  const sourceData = activeTab === "all" ? allData : pendingData;
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sourceData;
    return sourceData.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.flat.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
    );
  }, [search, sourceData]);

  const callUser = (phone?: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="arrow-left" size={24} color="#181818" />
            </Pressable>
            <Text style={styles.headerTitle}>Residents</Text>
            <Pressable
              style={styles.addButton}
              onPress={() => router.push("/add-resident" as never)}
            >
              <Text style={styles.addButtonText}>Add New</Text>
            </Pressable>
          </View>

          <View style={styles.tabWrap}>
            <Pressable
              style={[styles.tabButton, activeTab === "all" && styles.tabButtonActive]}
              onPress={() => setActiveTab("all")}
            >
              <Text style={[styles.tabText, activeTab === "all" && styles.tabTextActive]}>
                All({allData.length})
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tabButton, activeTab === "pending" && styles.tabButtonActive]}
              onPress={() => setActiveTab("pending")}
            >
              <Text
                style={[styles.tabText, activeTab === "pending" && styles.tabTextActive]}
              >
                Pending({pendingData.length})
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <Feather name="search" size={18} color="#777" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search resident name or flat number"
            placeholderTextColor="#777"
            style={styles.searchInput}
          />
          <MaterialCommunityIcons name="tune-variant" size={18} color="#777" />
        </View>

        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {filtered.map((item) => (
            <View key={item.id} style={styles.card}>
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
              <View style={styles.cardTextWrap}>
                <Text style={styles.nameText}>{`${item.name}(Flat ${item.flat})`}</Text>
                <Text style={styles.subText}>{item.subtitle}</Text>
              </View>

              {activeTab === "all" ? (
                <Pressable
                  style={styles.phoneBtn}
                  onPress={() => callUser(item.phone)}
                >
                  <Ionicons name="call-outline" size={18} color="#1C98ED" />
                </Pressable>
              ) : (
                <View style={styles.inviteBadge}>
                  <Text style={styles.inviteText}>Invite Sent</Text>
                </View>
              )}
            </View>
          ))}

          {filtered.length === 0 && (
            <Text style={styles.emptyText}>No records found.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  headerCard: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    marginLeft: 4,
    fontSize: 30,
    color: "#000",
    fontWeight: "500",
  },
  addButton: {
    backgroundColor: "#1C98ED",
    borderRadius: 100,
    height: 28,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#FAFAFA",
    fontSize: 14,
    fontWeight: "500",
  },
  tabWrap: {
    backgroundColor: "#F1F5F9",
    borderRadius: 24,
    padding: 4,
    flexDirection: "row",
    gap: 6,
  },
  tabButton: {
    flex: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  tabButtonActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },
  tabTextActive: {
    color: "#2899CF",
  },
  searchWrap: {
    marginTop: 12,
    marginHorizontal: 14,
    backgroundColor: "#fff",
    borderRadius: 28,
    minHeight: 42,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 10,
    color: "#181818",
    paddingVertical: 8,
  },
  listContainer: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderRadius: 24,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    backgroundColor: "#E2E8F0",
  },
  cardTextWrap: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#0F172A",
    lineHeight: 24,
  },
  subText: {
    fontSize: 10,
    color: "#A1A1AA",
    marginTop: 2,
  },
  phoneBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(40,153,207,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  inviteBadge: {
    backgroundColor: "rgba(40,153,207,0.1)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  inviteText: {
    color: "#2899CF",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#777",
  },
});
