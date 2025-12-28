import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import Toast from "react-native-toast-message";
import axios from "axios";
import FrostedCard from "./components/FrostedCard";
import useAuthStore from "./store/authStore";
import { getProfile } from "./services/profile.service";
import useProfileStore from "./store/profileStore";
import useBuildingStore from "./store/buildingStore";

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setProfile = useProfileStore((state) => state.setProfile);
  const setBuildingData = useBuildingStore((state) => state.setBuildingData);

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Phone number and password are required",
      });
      return;
    }

    try {
      setLoading(true);

      // 1. LOGIN REQUEST
      const payload = { phone, password };

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}/users/login`,
        payload
      );

      const { jwtToken } = response.data;

      // 2. STORE AUTH
      setAuth(jwtToken, phone);

      Toast.show({ type: "success", text1: "Login Successful" });

      // 3. FETCH USER PROFILE
      const profileData = await getProfile(phone);
      setProfile(profileData);

      // 4. FETCH BUILDING DATA
      try {
        const buildingRes = await axios.get(
          `${process.env.EXPO_PUBLIC_BASE_URL}/building/profile/${phone}`
        );

        setBuildingData(buildingRes.data);
        console.log("Building data loaded:", buildingRes.data);
      } catch (err) {
        console.log("Building fetch failed", err);
      }

      // 5. NAVIGATE TO HOME
      setTimeout(() => router.replace("/home"), 1000);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: "Invalid credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <View style={styles.bg}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            showsVerticalScrollIndicator={false}
          >
            <FrostedCard>
              <Text style={styles.title}>Welcome!</Text>
              <Text style={styles.subtitle}>Login to your account</Text>

              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#555"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ""))}
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#555"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity
                style={styles.forgotContainer}
                onPress={() => router.push("/forgot-password")}
              >
                <Text style={styles.forgotText}>Forget Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>

              <View style={styles.signinRow}>
                <Text style={styles.signinText}>Don’t have an account?</Text>
                <TouchableOpacity onPress={() => router.replace("/signup")}>
                  <Text style={styles.signinLink}> Sign up</Text>
                </TouchableOpacity>
              </View>
            </FrostedCard>
          </ScrollView>
        </KeyboardAvoidingView>

        <Toast />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#B3D6F7",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0A174E",
  },
  subtitle: {
    fontSize: 14,
    color: "#444",
    marginBottom: 25,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#6C63FF",
    fontSize: 16,
    paddingVertical: 10,
    marginBottom: 20,
    color: "#222",
    outlineColor: "transparent",
  },
  forgotContainer: {
    alignSelf: "flex-end",
    marginBottom: 18,
  },
  forgotText: {
    fontSize: 14,
    color: "#5956E9",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#3B5BFE",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 14,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  signinRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  signinText: {
    color: "#222",
    fontSize: 14,
  },
  signinLink: {
    color: "#0A174E",
    fontSize: 14,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
