import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  SafeAreaView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import Toast from "react-native-toast-message";
import useProfileStore from "./store/profileStore";
import axios from "axios";
import useBuildingStore from "./store/buildingStore";

const { width } = Dimensions.get("window");
const MAX_IMAGES = 5;

export default function RaiseIssueScreen() {
  const router = useRouter();
  const username = useProfileStore((s) => s.phone);
  const adminPhone = useBuildingStore((s) => s.adminPhone);
  const [issue, setIssue] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const pickFile = async () => {
    if (files.length >= MAX_IMAGES) {
      Alert.alert(
        "Limit reached",
        `You can upload maximum ${MAX_IMAGES} images.`
      );
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow photo access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setFiles((prev) => [...prev, result.assets[0]]);
    }
  };

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!issue || !description) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please complete all fields",
      });
      return;
    }

    if (!username) {
      Toast.show({
        type: "error",
        text1: "User Error",
        text2: "No username found in store",
      });
      return;
    }

    setLoading(true);

    const complaintPayload = {
      title: issue,
      description,
      username,
      timestamp: new Date().toISOString(),
      type: "GENERAL",
      isResolved: false,
      assigneeProfile: adminPhone,
    };

    try {
      const formData = new FormData();

      // ✅ IMPORTANT FIX
      formData.append(
        "complaint",
        new Blob([JSON.stringify(complaintPayload)], {
          type: "application/json",
        }) as any
      );

      // Attach images
      files.forEach((file, index) => {
        formData.append("files", {
          uri: file.uri,
          name: `complaint_${username}_${index}.jpg`,
          type: file.mimeType || "image/jpeg",
        } as any);
      });

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}/issues/register`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Toast.show({
        type: "success",
        text1: "Issue Submitted",
        text2: "Your issue has been created",
      });

      setTimeout(() => router.back(), 1000);
    } catch (err: any) {
      console.error("Submit error:", err);

      Toast.show({
        type: "error",
        text1: "Failed to Submit",
        text2: err?.response?.data?.details ?? "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.bg}>
          {/* HEADER */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerLeft}
            >
              <Feather name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Raise Issue</Text>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* TOP BUTTONS */}
            <View style={styles.topButtons}>
              <TouchableOpacity
                style={styles.tabButton}
                onPress={() => router.push("/all-tickets")}
              >
                <Text style={styles.tabButtonText}>All Tickets</Text>
              </TouchableOpacity>
            </View>

            {/* CARD */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Issue</Text>
              <TextInput
                style={styles.input}
                placeholder="Write an issue"
                placeholderTextColor="#888"
                value={issue}
                onChangeText={setIssue}
              />

              <Text style={[styles.cardTitle, { marginTop: 18 }]}>
                Description
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder="Write a Description"
                placeholderTextColor="#888"
                value={description}
                onChangeText={setDescription}
                multiline
              />

              {/* UPLOAD ROW */}
              <View style={styles.uploadRow}>
                <Text style={styles.uploadLabel}>Upload Photos</Text>
                <TouchableOpacity style={styles.uploadBtn} onPress={pickFile}>
                  <Text style={styles.uploadBtnText}>Upload</Text>
                </TouchableOpacity>
              </View>

              {/* IMAGE PREVIEW GRID */}
              <View style={styles.previewGrid}>
                {files.map((f, idx) => (
                  <View key={idx} style={styles.previewItem}>
                    <Image source={{ uri: f.uri }} style={styles.previewImg} />
                    <TouchableOpacity
                      style={styles.removeBadge}
                      onPress={() => removeImage(idx)}
                    >
                      <Feather name="x" size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* SUBMIT BUTTON */}
              <TouchableOpacity
                style={[styles.submitBtn, loading && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Submit Issue</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>

      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#A3C9FF" },
  bg: { flex: 1 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 18 : 8,
    paddingHorizontal: 16,
  },
  headerLeft: { padding: 6 },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },

  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 40,
  },

  /* NEW BUTTON STYLES */
  topButtons: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  tabButton: {
    backgroundColor: "#1C98ED",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },

  tabButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  tabButtonSecondary: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1C98ED",
  },

  tabButtonSecondaryText: {
    color: "#1C98ED",
    fontSize: 14,
    fontWeight: "700",
  },

  /* CARD */
  card: {
    width: "90%",
    backgroundColor: "#F6FAFF",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 18,
    elevation: 6,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0A1F44",
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E0E6F0",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
  },

  textArea: {
    borderWidth: 1,
    borderColor: "#E0E6F0",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    minHeight: 120,
    textAlignVertical: "top",
  },

  uploadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },

  uploadLabel: {
    fontSize: 14,
    fontWeight: "600",
  },

  uploadBtn: {
    backgroundColor: "#1C98ED",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  uploadBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  previewGrid: {
    marginTop: 14,
    width: width * 0.8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  previewItem: {
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#eee",
    position: "relative",
  },

  previewImg: {
    width: "100%",
    height: "100%",
  },

  removeBadge: {
    position: "absolute",
    right: 4,
    top: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  submitBtn: {
    marginTop: 22,
    backgroundColor: "#1C98ED",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
