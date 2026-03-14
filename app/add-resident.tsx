import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { rms, rs, rvs } from "@/constants/responsive";

type Role = "owner" | "tenant" | "admin";

const roleCards: Array<{
  key: Role;
  title: string;
  description: string[];
  icon: React.ReactNode;
}> = [
  {
    key: "owner",
    title: "Owner",
    description: ["Flat owner who resides in the", "society."],
    icon: <Ionicons name="home-outline" size={22} color="#2799CE" />,
  },
  {
    key: "tenant",
    title: "Tenant",
    description: ["Renter with app access and rent", "payment."],
    icon: <Ionicons name="key-outline" size={22} color="#64748B" />,
  },
  {
    key: "admin",
    title: "President / Admin",
    description: ["Full management access for the", "society."],
    icon: <MaterialCommunityIcons name="shield-account-outline" size={22} color="#64748B" />,
  },
];

export default function AddResidentScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>("owner");

  const handleContinue = () => {
    if (selectedRole === "owner") {
      router.push("/add-owner" as never);
      return;
    }
    if (selectedRole === "tenant") {
      router.push("/add-tenant" as never);
      return;
    }
    router.push("/add-admin" as never);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="arrow-left" size={24} color="#181818" />
            </Pressable>
            <Text style={styles.headerTitle}>Add New Resident</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Select Role</Text>
          <Text style={styles.sectionSubtitle}>
            Select the type of resident you want to add to{"\n"}the society.
          </Text>

          <View style={styles.cardsWrap}>
            {roleCards.map((role) => {
              const selected = selectedRole === role.key;
              return (
                <Pressable
                  key={role.key}
                  onPress={() => setSelectedRole(role.key)}
                  style={[styles.roleCard, selected && styles.roleCardSelected]}
                >
                  <View style={[styles.roleIconWrap, selected && styles.roleIconWrapSelected]}>
                    {role.icon}
                  </View>

                  <View style={styles.roleTextWrap}>
                    <Text style={styles.roleTitle}>{role.title}</Text>
                    <Text style={styles.roleDescription}>
                      {role.description[0]}
                      {"\n"}
                      {role.description[1]}
                    </Text>
                  </View>

                  <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                    {selected ? <View style={styles.radioInner} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueText}>Continue</Text>
        </Pressable>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  headerCard: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: rs(24),
    borderBottomRightRadius: rs(24),
    minHeight: rvs(98),
    justifyContent: "center",
    paddingHorizontal: rs(14),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: rs(8) },
  backBtn: {
    width: rs(28),
    height: rs(28),
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: rms(30),
    color: "#000",
    fontWeight: "500",
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: "500",
    color: "#0F172A",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#64748B",
    marginBottom: 18,
  },
  cardsWrap: {
    gap: 16,
  },
  roleCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 24,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
  },
  roleCardSelected: {
    backgroundColor: "rgba(39,153,206,0.05)",
    borderColor: "#2799CE",
  },
  roleIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  roleIconWrapSelected: {
    backgroundColor: "rgba(39,153,206,0.1)",
  },
  roleTextWrap: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "400",
    lineHeight: 24,
  },
  roleDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    fontWeight: "500",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  radioOuterSelected: {
    borderColor: "#2799CE",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2799CE",
  },
  continueBtn: {
    marginHorizontal: 16,
    marginBottom: 24,
    marginTop: "auto",
    backgroundColor: "#1C98ED",
    borderRadius: 100,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  continueText: {
    fontSize: 14,
    color: "#FAFAFA",
    fontWeight: "500",
  },
});
