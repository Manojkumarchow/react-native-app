import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";

export default function HomeServicesScreen() {
  const router = useRouter();

  // Will come from backend later → static for now
  const DEFAULT_SERVICE_PHONE = "9666499643";

  const services = [
    {
      name: "Plumbing",
      image: require("./../assets/images/plumber.png"),
      phone: DEFAULT_SERVICE_PHONE,
    },
    {
      name: "Electrical",
      image: require("./../assets/images/electrician.png"),
      phone: DEFAULT_SERVICE_PHONE,
    },
    {
      name: "Cleaning",
      image: require("./../assets/images/cleaner.jpg"),
      phone: DEFAULT_SERVICE_PHONE,
    },
    {
      name: "Carpenter",
      image: require("./../assets/images/carpenter.jpg"),
      phone: DEFAULT_SERVICE_PHONE,
    },
  ];

  const callService = (phone: string, serviceName: string) => {
    console.log(`Calling ${serviceName} at ${phone}`);
    Linking.openURL(`tel:${phone}`);
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

          <Text style={styles.headerTitle}>Home Services</Text>
        </View>

        {/* MAIN CONTENT */}
        <View style={styles.container}>
          <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
            {/* AD Banner */}
            <View style={styles.adBanner}>
              <Image
                source={require("./../assets/images/home.jpg")}
                style={styles.adImage}
                resizeMode="contain"
              />
            </View>

            {/* SERVICES GRID */}
            <View style={styles.grid}>
              {services.map((s, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.card}
                  onPress={() => callService(s.phone, s.name)}
                >
                  <Image
                    source={s.image}
                    style={styles.serviceImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.cardTitle}>{s.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}

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

  headerIcons: { flexDirection: "row", marginLeft: "auto" },

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
    backgroundColor: "rgba(28,152,237,0.15)",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#1C98ED",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },

  adImage: { width: 120, height: 120, opacity: 0.7 },

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
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
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
});
