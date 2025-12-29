import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import FrostedCard from "../components/FrostedCard";

const EMAIL = "manojchow72@gmail.com";
const PHONE = "+91-9666499643";

export default function ContactUsScreen() {
  const router = useRouter();

  const openEmail = () => {
    Linking.openURL(`mailto:${EMAIL}`);
  };

  const openPhone = () => {
    Linking.openURL(`tel:${PHONE.replace(/[^0-9+]/g, "")}`);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safe}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact Us</Text>
        </View>

        {/* CONTENT */}
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <FrostedCard>
            <Text style={styles.title}>Contact Details</Text>

            {/* EMAIL */}
            <TouchableOpacity
              style={styles.contactRow}
              onPress={openEmail}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="email-outline"
                size={22}
                color="#1C98ED"
              />
              <Text style={styles.contactText}>{EMAIL}</Text>
            </TouchableOpacity>

            {/* PHONE */}
            <TouchableOpacity
              style={styles.contactRow}
              onPress={openPhone}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="phone-outline"
                size={22}
                color="#1C98ED"
              />
              <Text style={styles.contactText}>{PHONE}</Text>
            </TouchableOpacity>
          </FrostedCard>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#B3D6F7",
  },

  header: {
    backgroundColor: "#1C98ED",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerTitle: {
    marginLeft: 14,
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0A174E",
    marginBottom: 20,
    textAlign: "center",
  },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.6)",
    marginBottom: 14,
  },

  contactText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#0A174E",
    fontWeight: "600",
  },
});
