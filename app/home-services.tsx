import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
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

type ServiceKey =
  | "plumbingService"
  | "electricService"
  | "cleaningService"
  | "carpenterService";

const SERVICE_OPTIONS: { key: ServiceKey; label: string }[] = [
  { key: "plumbingService", label: "Plumber" },
  { key: "electricService", label: "Electrician" },
  { key: "cleaningService", label: "Cleaner" },
  { key: "carpenterService", label: "Carpenter" },
];

export default function HomeServicesScreen() {
  const router = useRouter();

  /* -------- STORE -------- */
  const buildingStore = useBuildingStore();
  const role = useProfileStore((s) => s.role);
  const isAdmin = role === "ADMIN";

  const { buildingId } = buildingStore;

  /* -------- SERVICES GRID -------- */
  const services = useMemo(
    () => [
      {
        name: "Plumbing",
        image: require("./../assets/images/plumber.png"),
        phone: buildingStore.plumbingService?.phone ?? "1234567890",
      },
      {
        name: "Electrical",
        image: require("./../assets/images/electrician.png"),
        phone: buildingStore.electricService?.phone ?? "1234567890",
      },
      {
        name: "Cleaning",
        image: require("./../assets/images/cleaner.jpg"),
        phone: buildingStore.cleaningService?.phone ?? "1234567890",
      },
      {
        name: "Carpenter",
        image: require("./../assets/images/carpenter.jpg"),
        phone: buildingStore.carpenterService?.phone ?? "1234567890",
      },
    ],
    [buildingStore]
  );

  const callService = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  /* -------- MODAL STATE -------- */
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] =
    useState<ServiceKey>("plumbingService");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const isValidPhone = (p: string) => /^[0-9]{10}$/.test(p);

  /* -------- SAVE HANDLER -------- */
  const saveService = async () => {
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
        text2: "Enter valid name and phone number",
      });
      return;
    }

    try {
      setSaving(true);

      const servicePayload = {
        name: name.trim(),
        phone,
      };

      await axios.put(
        `${process.env.EXPO_PUBLIC_BASE_URL}/building/update/services`,
        {
          buildingId: buildingId,
          [selectedService]: servicePayload,
        }
      );

      // ✅ Update store safely
      buildingStore.setBuildingData({
        ...buildingStore,
        [selectedService]: servicePayload,
      });

      Toast.show({
        type: "success",
        text1: "Updated",
        text2: "Service details updated successfully",
      });

      setShowModal(false);
      setName("");
      setPhone("");
    } catch {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Could not update service details",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Home Services</Text>
        </View>

        <View style={styles.container}>
          <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
            <View style={styles.adBanner}>
              <Image
                source={require("./../assets/images/zperm.jpeg")}
                style={styles.adImage}
              />
            </View>

            <View style={styles.grid}>
              {services.map((s, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.card}
                  onPress={() => callService(s.phone)}
                >
                  <Image source={s.image} style={styles.serviceImage} />
                  <Text style={styles.cardTitle}>{s.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* ADMIN BUTTON */}
          {isAdmin && (
            <TouchableOpacity
              style={styles.adminBtn}
              onPress={() => setShowModal(true)}
            >
              <Text style={styles.adminBtnText}>Add / Update Services</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {/* -------- MODAL -------- */}
      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Update Service</Text>

            {SERVICE_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s.key}
                style={[
                  styles.serviceOption,
                  selectedService === s.key && styles.serviceSelected,
                ]}
                onPress={() => setSelectedService(s.key)}
              >
                <Text style={styles.serviceOptionText}>{s.label}</Text>
              </TouchableOpacity>
            ))}

            <TextInput
              style={styles.modalInput}
              placeholder="Service Name"
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
                onPress={saveService}
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
  safe: { flex: 1, backgroundColor: "#7CA9FF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 12,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
  },
  adBanner: {
    width: "90%",
    height: 180,
    backgroundColor: "rgba(255,255,255)",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#ffffff",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  adImage: { width: 370, height: 180, opacity: 0.7 },
  grid: {
    marginTop: 30,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  card: {
    width: "47%",
    height: 150,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#1C98ED",
    elevation: 4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  serviceImage: { width: 80, height: 80 },
  cardTitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "700",
    color: "#1C98ED",
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
    backgroundColor: "rgba(0,0,0,0.45)",
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
    marginBottom: 12,
  },
  serviceOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#1C98ED",
    borderRadius: 8,
    marginBottom: 8,
  },
  serviceSelected: {
    backgroundColor: "rgba(28,152,237,0.15)",
  },
  serviceOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C98ED",
  },
  modalInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#1C98ED",
    paddingVertical: 10,
    marginTop: 12,
    fontSize: 15,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
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
