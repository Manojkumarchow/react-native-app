import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Stack, useRouter } from "expo-router";

const BRAND_BLUE = "#1c98ed";
const CARD_BG = "#ffffff";

export default function ResetPinSuccessScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 1800);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: "PIN Reset Success" }} />
      <View style={styles.bg}>
        <View style={styles.header}>
          <Image
            source={require("./../assets/images/nestiti-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.card}>
          <View style={styles.successCircle}>
            <Text style={styles.check}>✓</Text>
          </View>
          <Text style={styles.title}>PIN Reset Successful</Text>
          <Text style={styles.subtitle}>
            Redirecting you to login screen...
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: BRAND_BLUE,
  },
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
  successCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: BRAND_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  check: {
    fontSize: 40,
    color: BRAND_BLUE,
    lineHeight: 42,
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
    textAlign: "center",
  },
  subtitle: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
});
