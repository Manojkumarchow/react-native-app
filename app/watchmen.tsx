import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Linking,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import useBuildingStore from "./store/buildingStore";

export default function WatchmenScreen() {
  const router = useRouter();

  // Dynamic watchman details from backend store
  const watchman = useBuildingStore((s) => s.watchmen);
  const phoneNumber = watchman?.phone ?? "9666499643";

  const callWatchman = () => {
    Linking.openURL(`tel:${phoneNumber}`);
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

          <View style={styles.headerIcons}>
            <Feather name="search" size={22} color="#fff" />
            <Feather
              name="bell"
              size={22}
              color="#fff"
              style={{ marginLeft: 20 }}
            />
          </View>
        </View>

        {/* White Container */}
        <View style={styles.container}>
          <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
            {/* AD BANNER */}
            <View style={styles.adBanner}>
              <Image
                source={require("./../assets/images/home.jpg")}
                style={styles.adImage}
                resizeMode="contain"
              />
            </View>

            {/* SECURITY EMOJI or icon */}
            <Text style={styles.securityEmoji}>👮‍♂️</Text>

            {/* DESCRIPTION */}
            <Text style={styles.description}>
              Quickly connect with the watchman
              {"\n"}
              for any assistance or support.
            </Text>

            {/* CALL BUTTON */}
            <TouchableOpacity style={styles.callBtn} onPress={callWatchman}>
              <Feather name="phone" size={18} color="#1C98ED" />
              <Text style={styles.callText}>Call Watchman</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#7CA9FF",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
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
    paddingTop: 20,
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
  },

  adImage: {
    width: 100,
    height: 100,
    opacity: 0.7,
  },

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
});
