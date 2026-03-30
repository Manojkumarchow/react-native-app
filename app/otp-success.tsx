import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Stack, useRouter } from "expo-router";

const BRAND_BLUE = "#1c98ed";
const CARD_BG = "#ffffff";

export default function OTPSuccess() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: "Success" }} />

      <View style={styles.bg}>
        <View style={styles.header}>
          <Image
            source={require("./../assets/images/nestiti-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.card}>
          <View style={styles.circle}>
            <Text style={styles.check}>✓</Text>
          </View>

          <Text style={styles.title}>Successfully Verified</Text>
          <Text style={styles.subtitle}>
            Your verification has been completed successfully
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: BRAND_BLUE },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 22,
    paddingBottom: 12,
  },
  logo: {
    width: 235,
    height: 235,
  },
  card: {
    marginTop: 4,
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 19,
    paddingTop: 20,
    paddingBottom: 88,
    alignItems: "center",
  },

  circle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: BRAND_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  check: { fontSize: 40, color: BRAND_BLUE, lineHeight: 42 },

  title: {
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
    color: "#000",
  },
  subtitle: {
    marginTop: 8,
    textAlign: "center",
    color: "#666",
    marginBottom: 22,
  },

  button: {
    backgroundColor: BRAND_BLUE,
    height: 48,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
