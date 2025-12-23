import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Stack, router } from "expo-router";
import Toast from "react-native-toast-message";
import axios from "axios";
import Ionicons from "react-native-vector-icons/Ionicons";
import useProfileStore from "./store/profileStore";

export default function CreateNotice() {
  const profile = useProfileStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"INFO" | "ALERT" | "">("");
  const [showDropdown, setShowDropdown] = useState(false);

  const isValid = title.trim() && description.trim() && type;

  const sendNotice = async () => {
    try {
      await axios.post(`${process.env.EXPO_PUBLIC_BASE_URL}/notices/create`, {
        title,
        description,
        type,
        profileId: profile.phone,
      });

      router.replace("/notices");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Some error occurred while sending notice",
      });
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.heading}>Create a Notice</Text>

          <TouchableOpacity onPress={() => router.replace("/notices")}>
            <Text style={styles.allNotices}>All Notices</Text>
          </TouchableOpacity>
        </View>

        {/* TITLE */}
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />

        {/* CATEGORY DROPDOWN */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowDropdown(!showDropdown)}
          activeOpacity={0.8}
        >
          <Text style={[styles.dropdownText, !type && styles.placeholder]}>
            {type || "Select Category"}
          </Text>
          <Ionicons
            name={showDropdown ? "chevron-up" : "chevron-down"}
            size={20}
            color="#1C98ED"
          />
        </TouchableOpacity>

        {showDropdown && (
          <View style={styles.dropdownMenu}>
            {["INFO", "ALERT"].map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.dropdownItem}
                onPress={() => {
                  setType(option as "INFO" | "ALERT");
                  setShowDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* DESCRIPTION */}
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Subject"
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {/* SEND BUTTON */}
        <TouchableOpacity
          style={[styles.sendBtn, !isValid && { opacity: 0.5 }]}
          disabled={!isValid}
          onPress={sendNotice}
        >
          <Text style={styles.sendText}>Send Notice</Text>
        </TouchableOpacity>
      </View>

      <Toast />
    </>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  heading: {
    fontSize: 20,
    fontWeight: "700",
  },

  allNotices: {
    color: "#1C98ED",
    fontWeight: "600",
    fontSize: 13,
  },

  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#1C98ED",
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 20,
  },

  textArea: {
    height: 100,
    textAlignVertical: "top",
  },

  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1C98ED",
    paddingVertical: 12,
    marginBottom: 10,
  },

  dropdownText: {
    fontSize: 15,
    color: "#000",
  },

  placeholder: {
    color: "#999",
  },

  dropdownMenu: {
    borderWidth: 1,
    borderColor: "#1C98ED",
    borderRadius: 10,
    marginBottom: 20,
    overflow: "hidden",
  },

  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },

  dropdownItemText: {
    fontSize: 14,
    color: "#1C98ED",
    fontWeight: "600",
  },

  sendBtn: {
    backgroundColor: "#1C98ED",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 30,
  },

  sendText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
