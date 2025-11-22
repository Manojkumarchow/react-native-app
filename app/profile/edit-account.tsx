import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import api from "../services/api";
import useProfileStore from "../store/profileStore";

export default function EditAccount() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [name, setName] = useState(params.name as string);
  const [phone, setPhone] = useState(params.phone as string);
  const [email, setEmail] = useState(params.email as string);
  const [flat, setFlat] = useState(params.flat as string);
  const [building, setBuilding] = useState(params.building as string);
  const [address, setAddress] = useState(params.address as string);
  
  const [loading, setLoading] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const setProfile = useProfileStore((state) => state.setProfile);

  const updateProfile = async () => {
    setLoading(true);
    try {
      const res = await api.patch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/profile/update`,
        {
          userId: "12345", // later replace with actual logged in id
          name,
          email,
          phone,
          password: null,
          role: "ADMIN",
        }
      );

      if (res.status === 200) {
        setPopupMessage("Profile updated successfully");
        setProfile({
          name,
          email,
          phone,
          flat,
          building,
          address,
        });
        setPopupVisible(true);

        setTimeout(() => {
          setPopupVisible(false);
          router.back();
        }, 1500);
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setPopupMessage("Profile not found");
      } else {
        setPopupMessage("Error occurred. Please try after some time");
      }
      setPopupVisible(true);

      setTimeout(() => setPopupVisible(false), 1800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.screen}>
        <Text style={styles.heading}>Edit Account Details</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} />

        <Text style={styles.label}>Flat</Text>
        <TextInput style={styles.input} value={flat} onChangeText={setFlat} />

        <Text style={styles.label}>Building</Text>
        <TextInput
          style={styles.input}
          value={building}
          onChangeText={setBuilding}
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={address}
          onChangeText={setAddress}
          multiline
        />

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={updateProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Success / Error popup modal */}
      <Modal transparent visible={popupVisible} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>{popupMessage}</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 18, backgroundColor: "#fff" },
  heading: { fontSize: 20, fontWeight: "700", marginBottom: 14 },
  label: { marginTop: 12, fontSize: 14, color: "#333" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  saveBtn: {
    backgroundColor: "#1C98ED",
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalBox: {
    padding: 20,
    width: "70%",
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C98ED",
    textAlign: "center",
  },
});

