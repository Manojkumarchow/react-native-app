import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Linking,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import axios from "axios";
import Toast from "react-native-toast-message";
import useBuildingStore from "./store/buildingStore";
import useProfileStore from "./store/profileStore";

export default function WatchmenScreen() {
  const router = useRouter();

  /* -------- STORE DATA -------- */
  const buildingStore = useBuildingStore();
  const watchmen = buildingStore.watchmen;
  const buildingId = buildingStore.buildingId;

  const role = useProfileStore((s) => s.role);
  const isAdmin = role === "ADMIN";

  const phoneNumber = watchmen?.phone ?? "1234567890";

  /* -------- MODAL STATE -------- */
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState(watchmen?.name ?? "");
  const [phone, setPhone] = useState(watchmen?.phone ?? "");
  const [saving, setSaving] = useState(false);

  const callWatchman = () => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const isValidPhone = (p: string) => /^[0-9]{10}$/.test(p);

  /* -------- SAVE HANDLER -------- */
  const saveWatchman = async () => {
    if (!buildingId) {
      Toast.show({
        type: "error",
        text1: "Missing Building",
        text2: "Building information not available",
      });
      return;
    }

    if (!name.trim() || !isValidPhone(phone)) {
      Toast.show({
        type: "error",
        text1: "Invalid Details",
        text2: "Enter valid name and 10-digit phone number",
      });
      return;
    }

    try {
      setSaving(true);

      const watchmenPayload = {
        name: name.trim(),
        phone,
      };

      await axios.put(
        `${process.env.EXPO_PUBLIC_BASE_URL}/building/update/services`,
        {
          buildingId: buildingId,
          watchmen: watchmenPayload,
        }
      );

      // ✅ Correct store update
      buildingStore.setBuildingData({
        ...buildingStore,
        watchmen: watchmenPayload,
      });

      Toast.show({
        type: "success",
        text1: "Updated",
        text2: "Watchmen details updated successfully",
      });

      setShowModal(false);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Could not update watchmen details",
      });
    } finally {
      setSaving(false);
    }
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

          <Text style={styles.headerTitle}>Watchmen</Text>
        </View>

        {/* CONTENT */}
        <View style={styles.container}>
          <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
            <View style={styles.adBanner}>
              <Image
                source={require("./../assets/images/home.jpg")}
                style={styles.adImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.securityEmoji}>👮‍♂️</Text>

            <Text style={styles.description}>
              Quickly connect with the watchman{"\n"}
              for any assistance or support.
            </Text>

            <TouchableOpacity style={styles.callBtn} onPress={callWatchman}>
              <Feather name="phone" size={18} color="#1C98ED" />
              <Text style={styles.callText}>Call Watchman</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* ADMIN ACTION */}
          {isAdmin && (
            <TouchableOpacity
              style={styles.adminBtn}
              onPress={() => setShowModal(true)}
            >
              <Text style={styles.adminBtnText}>
                Add / Update Watchmen Details
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {/* -------- MODAL -------- */}
      <Modal transparent visible={showModal} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Watchmen Details</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Phone Number"
              keyboardType="number-pad"
              maxLength={10}
              value={phone}
              onChangeText={(v) => setPhone(v.replace(/[^0-9]/g, ""))}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowModal(false)}
                disabled={saving}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={saveWatchman}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast />
    </>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#1C98ED" },

  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    height: 90,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 12,
  },

  headerIcons: {
    flexDirection: "row",
    marginLeft: "auto",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  adBanner: {
    width: "90%",
    height: 160,
    borderWidth: 2,
    borderColor: "#1C98ED",
    borderStyle: "dashed",
    backgroundColor: "rgba(28,152,237,0.4)",
    borderRadius: 14,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  adImage: { width: 100, height: 100, opacity: 0.7 },

  securityEmoji: {
    fontSize: 80,
    textAlign: "center",
    marginTop: 30,
  },

  description: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    color: "#000",
    marginTop: 10,
    lineHeight: 28,
  },

  callBtn: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: 25,
    borderWidth: 1,
    borderColor: "#1C98ED",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: "center",
  },

  callText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C98ED",
    marginLeft: 10,
  },

  adminBtn: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#1C98ED",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  adminBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },

  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },

  modalInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#1C98ED",
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 15,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },

  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 12,
  },

  cancelText: { color: "#777", fontSize: 15 },

  saveBtn: {
    backgroundColor: "#1C98ED",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },

  saveText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
