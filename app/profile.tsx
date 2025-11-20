import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";

import SectionCard from "./profile/SectionCard";
import Row from "./profile/Row";
import AppPreferencesSection from "./profile/AppPreferencesSection";
import SecurityPrivacySection from "./profile/SecurityPrivacySection";
import ProfileAvatar from "./components/ProfileAvatar";
import BottomNav from "./components/BottomNav";

export default function ProfileScreen() {
  const router = useRouter();

  // Static profile data for now (backend integration later)
  const [profile, setProfile] = useState<{
    name: string;
    phone: string;
    email: string;
    flat: string;
    building: string;
    address: string;
    avatarUri: string | null;
  }>({
    name: "John Doe William",
    phone: "+1 (555) 123-4567",
    email: "john.anderson@email.com",
    flat: "Flat No: 301",
    building: "Mahadev Apartments",
    address: "Some address line, City, State",
    avatarUri: require("./../assets/images/hero.png"),
  });

  const onEditAccount = () => {
    router.push({
      pathname: "/profile/edit-account",
      params: {
        name: profile.name,
        phone: profile.phone,
        email: profile.email,
        flat: profile.flat,
        building: profile.building,
        address: profile.address,
      },
    });
  };

  const onLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.screen}>
        {/* Blue curved top */}
        <View style={styles.topSpacing} />

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {/* Avatar */}
            <ProfileAvatar
              avatarUri={profile.avatarUri}
              onAvatarChange={(uri: string | null) =>
                setProfile((prev) => ({ ...prev, avatarUri: uri }))
              }
            />

            {/* Name */}
            <Text style={styles.name}>{profile.name}</Text>
            <View style={{ height: 20 }} />

            {/* ACCOUNT DETAILS CARD */}
            <SectionCard title="Account Details" onEdit={onEditAccount}>
              <Row icon="account" label={profile.name} />
              <Row icon="phone" label={profile.phone} />
              <Row icon="email" label={profile.email} />
              <Row icon="home" label={profile.flat} />
              <Row icon="office-building" label={profile.building} />
              <Row icon="map-marker" label={profile.address} />
            </SectionCard>

            {/* APP PREFERENCES */}
            <AppPreferencesSection />

            {/* SECURITY & PRIVACY */}
            <SecurityPrivacySection />

            {/* LOGOUT */}
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            {/* VERSION */}
            <View style={styles.versionRow}>
              <Text style={styles.versionTitle}>App Version</Text>
              <Text style={styles.versionValue}>2.4.1 (Build 241)</Text>
            </View>

            <Text style={styles.copy}>
              2025 FinTech Pro. All rights reserved.
            </Text>
          </View>
        </ScrollView>
        <BottomNav />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f9fb" },

  topSpacing: {
    height: 12,
    backgroundColor: "#1C98ED",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  container: {
    paddingBottom: 40,
    alignItems: "center",
  },

  card: {
    width: "92%",
    backgroundColor: "#fff",
    marginTop: 12,
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  name: {
    fontSize: 16,
    color: "#333",
    marginTop: 8,
  },

  logoutBtn: {
    marginTop: 20,
    width: "90%",
    height: 46,
    borderRadius: 6,
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutText: {
    color: "#DC2626",
    fontSize: 15,
    fontWeight: "500",
  },

  versionRow: {
    flexDirection: "row",
    width: "90%",
    justifyContent: "space-between",
    marginTop: 18,
  },
  versionTitle: { color: "#333", fontSize: 14 },
  versionValue: { color: "#666", fontSize: 12 },

  copy: { color: "#666", fontSize: 11, marginTop: 10 },
});
