import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useProfileStore from "./store/profileStore";
import useAuthStore from "./store/authStore";
import useBuildingStore from "./store/buildingStore";
import CustomAlert from "./components/CustomAlert";
import { STORAGE_KEYS } from "@/constants/storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { rms, rs, rvs } from "@/constants/responsive";

type ProfileAction = {
  key: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  iconBg?: string;
  iconColor?: string;
  titleColor?: string;
  onPress?: () => void;
};

const PRIMARY = "#1C98ED";
const LIGHT_ICON_BG = "rgba(39,153,206,0.1)";

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useProfileStore();
  const building = useBuildingStore();
  const resetProfile = useProfileStore((s) => s.setProfile);
  const resetAuth = useAuthStore((s) => s.resetAuth);
  const resetBuilding = useBuildingStore((s) => s.resetBuilding);

  const [showAlert, setShowAlert] = useState(false);

  const isTenant = profile.role === "USER" || profile.role === "TENANT";

  const initials = useMemo(() => {
    if (!profile.name) return isTenant ? "SG" : "GR";
    const parts = profile.name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }, [profile.name, isTenant]);

  const roleLabel = isTenant ? "Tenant" : "Owner";
  const flatLabel = profile.flatNo || profile.flat || "202";
  const phoneLabel = profile.phone || "+91-8919998087";
  const buildingLabel = building.buildingName || profile.buildingName || "Sunrise Residency";

  const goToFlatDetails = () => router.push("/apartment-details");
  const goToEmergency = () => router.push("/emergency");
  const goToChangePin = () => router.push("/reset-pin" as never);

  const ownerActions: ProfileAction[] = [
    {
      key: "flat-details",
      icon: "home-outline",
      title: "My Flat Details",
      subtitle: `Flat ${flatLabel}, ${buildingLabel}`,
      // onPress: goToFlatDetails,
    },
    {
      key: "emergency",
      icon: "shield-account-outline",
      title: "Emergency Contacts",
      subtitle: "Security, maintenance office",
      onPress: goToEmergency,
    },
    {
      key: "documents",
      icon: "file-document-outline",
      title: "Documents",
      subtitle: "Receipts and records",
      onPress: () => router.push("/ledger"),
    },
    {
      key: "change-pin",
      icon: "lock-reset",
      title: "Change PIN",
      subtitle: "Update your security PIN",
      onPress: goToChangePin,
    },
  ];

  const tenantActions: ProfileAction[] = [
    {
      key: "flat-details",
      icon: "home-outline",
      title: "My Flat Details",
      subtitle: `Flat ${flatLabel}, ${buildingLabel}`,
      // onPress: goToFlatDetails,
    },
    {
      key: "agreement",
      icon: "home-outline",
      title: "Rental Agreement",
      subtitle: "View your tenancy agreements",
      onPress: () => router.push("/rent"),
    },
    {
      key: "emergency",
      icon: "shield-account-outline",
      title: "Emergency Contacts",
      subtitle: "Security, maintenance office",
      onPress: goToEmergency,
    },
    {
      key: "payments-receipts",
      icon: "file-document-outline",
      title: "Payments and Receipts",
      subtitle: "Rent and maintenance history",
      onPress: () => router.push("/payments"),
    },
    {
      key: "change-pin",
      icon: "lock-reset",
      title: "Change PIN",
      subtitle: "Update your security PIN",
      onPress: goToChangePin,
    },
  ];

  const doLogout = async () => {
    resetProfile({
      userId: null,
      name: null,
      email: null,
      phone: null,
      flat: null,
      buildingId: null,
      address: null,
      avatarUri: null,
      role: null,
      upiId: null,
      buildingName: null,
      flatNo: null,
    });
    resetAuth();
    resetBuilding();
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.LAST_LOGIN_PHONE);
    } catch {
      // continue logout flow even if local storage cleanup fails
    }
    setShowAlert(false);
    router.replace("/login");
  };

  const actions = isTenant ? tenantActions : ownerActions;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backTap}>
              <Feather name="arrow-left" size={22} color="#181818" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <View style={styles.initialsBox}>
              <Text style={styles.initialsText}>{initials}</Text>
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroRole}>Flat - {flatLabel} {roleLabel}</Text>
              <Text style={styles.heroPhone}>{phoneLabel}</Text>
            </View>
          </View>

          {actions.map((item) => (
            <ProfileActionRow key={item.key} item={item} />
          ))}

          <ProfileActionRow
            item={{
              key: "logout",
              icon: "logout",
              title: "Logout",
              subtitle: "Sign out of Nestiti",
              iconBg: "rgba(220,38,38,0.1)",
              iconColor: "#DC2626",
              titleColor: "#DC2626",
              onPress: () => setShowAlert(true),
            }}
          />
        </ScrollView>
      </SafeAreaView>

      <CustomAlert
        visible={showAlert}
        title="Logout"
        message="Are you sure you want to logout?"
        onCancel={() => setShowAlert(false)}
        onConfirm={doLogout}
      />
    </>
  );
}

function ProfileActionRow({ item }: { item: ProfileAction }) {
  return (
    <TouchableOpacity
      style={styles.actionRow}
      activeOpacity={0.82}
      onPress={() => {
        try {
          item.onPress();
        } catch {
          Alert.alert("Coming soon", "This option will be available soon.");
        }
      }}
    >
      <View style={[styles.actionIconWrap, { backgroundColor: item.iconBg || LIGHT_ICON_BG }]}>
        <MaterialCommunityIcons
          name={item.icon}
          size={20}
          color={item.iconColor || PRIMARY}
        />
      </View>
      <View style={styles.actionTextWrap}>
        <Text style={[styles.actionTitle, item.titleColor ? { color: item.titleColor } : null]}>
          {item.title}
        </Text>
        <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={18} color="#94A3B8" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAFAFA" },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: rs(24),
    borderBottomRightRadius: rs(24),
    borderBottomColor: "#F1F5F9",
    borderBottomWidth: 1,
    paddingHorizontal: rs(16),
    paddingTop: rvs(10),
    paddingBottom: rvs(14),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backTap: { marginRight: rs(8), padding: rs(4) },
  headerTitle: {
    color: "#000000",
    fontSize: rms(18),
    fontWeight: "500",
  },
  content: {
    padding: 16,
    paddingBottom: 28,
    gap: 12,
  },
  heroCard: {
    minHeight: 111,
    borderRadius: 20,
    backgroundColor: PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#2899CF",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  initialsBox: {
    width: 56,
    height: 56,
    borderRadius: 11,
    borderWidth: 1.2,
    borderColor: "#FAFAFA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  initialsText: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "600",
  },
  heroInfo: {
    flex: 1,
  },
  heroRole: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  heroPhone: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  actionRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  actionSubtitle: {
    color: "#64748B",
    fontSize: 14,
  },
});
