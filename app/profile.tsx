import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { Stack, useRouter } from "expo-router";

import SectionCard from "./profile/SectionCard";
import Row from "./profile/Row";
import AppPreferencesSection from "./profile/AppPreferencesSection";
import SecurityPrivacySection from "./profile/SecurityPrivacySection";
import ProfileAvatar from "./components/ProfileAvatar";
import BottomNav from "./components/BottomNav";
import useProfileStore from "./store/profileStore";
import useAuthStore from "./store/authStore";
import CustomAlert from "./components/CustomAlert";

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/heic",
  "image/heif",
];

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useProfileStore();
  const { username } = useAuthStore();

  const [uploading, setUploading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const resetProfile = useProfileStore((s) => s.setProfile);
  const resetAuth = useAuthStore((s) => s.reset);

  /* ----------------------------
     IMAGE PICK + UPLOAD
  ---------------------------- */
  const pickAndUploadImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow photo access to upload profile picture"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];

      if (asset.mimeType && !ALLOWED_TYPES.includes(asset.mimeType)) {
        Alert.alert(
          "Invalid file",
          "Only PNG, JPG, JPEG, HEIC images are allowed"
        );
        return;
      }

      setUploading(true);

      const formData = new FormData();
      formData.append("file", {
        uri: asset.uri,
        name: `profile_${username}.jpg`,
        type: asset.mimeType || "image/jpeg",
      } as any);

      await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}/profile/${username}/image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      profile.setProfile({
        ...profile,
        avatarUri: `${
          process.env.EXPO_PUBLIC_BASE_URL
        }/uploads/profiles/${username}.jpg?ts=${Date.now()}`,
      });
    } catch (error) {
      console.error("Profile image upload failed:", error);
      Alert.alert("Upload failed", "Unable to upload profile image");
    } finally {
      setUploading(false);
    }
  };

  /* ----------------------------
     EDIT ACCOUNT
  ---------------------------- */
  const onEditAccount = () => {
    router.push({
      pathname: "/profile/edit-account",
      params: {
        name: profile.name,
        phone: profile.phone,
        email: profile.email,
        upiId: profile.upiId, // ✅ PASS UPI ID
        flat: profile.flat,
        building: profile.building,
        address: profile.address,
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.screen}>
        <View style={styles.topSpacing} />

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {/* AVATAR */}
            <ProfileAvatar
              avatarUri={profile.avatarUri}
              onAvatarChange={pickAndUploadImage}
            />

            <Text style={styles.name}>{profile.name}</Text>
            <View style={{ height: 20 }} />

            {/* ACCOUNT DETAILS */}
            <SectionCard title="Account Details" onEdit={onEditAccount}>
              {profile.name && <Row icon="account" label={profile.name} />}
              {profile.phone && <Row icon="phone" label={profile.phone} />}
              {profile.email && <Row icon="email" label={profile.email} />}

              {/* ✅ UPI ID ADDED HERE */}
              {profile.upiId && (
                <Row icon="bank" label={`UPI: ${profile.upiId}`} />
              )}

              {profile.flat && <Row icon="home" label={profile.flat} />}
              {profile.building && (
                <Row icon="office-building" label={profile.building} />
              )}
              {profile.address && (
                <Row icon="map-marker" label={profile.address} />
              )}
            </SectionCard>

            <AppPreferencesSection />
            <SecurityPrivacySection />

            {/* LOGOUT */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => setShowAlert(true)}
            >
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            <View style={styles.versionRow}>
              <Text style={styles.versionTitle}>App Version</Text>
              <Text style={styles.versionValue}>2.4.1 (Build 241)</Text>
            </View>

            <Text style={styles.copy}>
              2025 FinTech Pro. All rights reserved.
            </Text>
          </View>
        </ScrollView>

        {/* LOGOUT CONFIRMATION */}
        <CustomAlert
          visible={showAlert}
          title="Logout"
          message="Are you sure you want to logout?"
          onCancel={() => setShowAlert(false)}
          onConfirm={() => {
            resetProfile({
              userId: null,
              name: null,
              email: null,
              phone: null,
              flat: null,
              building: null,
              address: null,
              avatarUri: null,
              role: null,
              upiId: null, // ✅ RESET UPI ID
            });
            resetAuth();
            setShowAlert(false);
            router.replace("/login");
          }}
        />

        <BottomNav />
      </View>
    </>
  );
}

/* ================= STYLES ================= */

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
