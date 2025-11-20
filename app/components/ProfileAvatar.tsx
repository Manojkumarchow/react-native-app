import React from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  avatarUri?: string | null;
  onAvatarChange?: (uri: string | null) => void;
};

export default function ProfileAvatar({ avatarUri, onAvatarChange }: Props) {
  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permission required",
        "Please allow access to photos to select an avatar."
      );
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!res.canceled) onAvatarChange?.(res.assets?.[0]?.uri ?? null);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permission required",
        "Please allow access to camera to take a photo."
      );
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!res.canceled) onAvatarChange?.(res.assets?.[0]?.uri ?? null);
  };

  const onPressAvatar = () => {
    Alert.alert("Update Avatar", "Choose photo source", [
      { text: "Camera", onPress: takePhoto },
      { text: "Gallery", onPress: pickFromLibrary },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        onPress={onPressAvatar}
        accessibilityLabel="Change avatar"
      >
        <Image
          source={
            avatarUri
              ? { uri: avatarUri }
              : require("./../../assets/images/hero.png")
          }
          style={styles.avatar}
        />
        <View style={styles.camera}>
          <MaterialCommunityIcons
            name="camera-outline"
            color="#fff"
            size={14}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ddd",
  },
  camera: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2E5077",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
});
