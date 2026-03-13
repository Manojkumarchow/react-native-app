import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { createProfile } from "../services/profile.service";
import { getErrorMessage } from "../services/error";
import useBuildingStore from "../store/buildingStore";
import Toast from "react-native-toast-message";

type Variant = "owner" | "tenant" | "admin";

type Props = {
  variant: Variant;
};

const blocks = ["Block A", "Block B", "Block C"];
const floors = ["1st Floor", "2nd Floor", "3rd Floor"];
const flats = ["101", "102", "103"];
const designations = ["President", "Vice President", "Secretary"];
const permissions = ["All", "Billing", "Notices", "Maintenance"];
const successIllustration =
  "https://www.figma.com/api/mcp/asset/4d3b2ff0-05d6-4277-a4a4-dc167ee4fcc5";

export default function AddResidentFormScreen({ variant }: Props) {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [blockIdx, setBlockIdx] = useState(0);
  const [floorIdx, setFloorIdx] = useState(0);
  const [flatIdx, setFlatIdx] = useState(0);
  const [email, setEmail] = useState("");
  const [leaseEnd, setLeaseEnd] = useState("");
  const [designationIdx, setDesignationIdx] = useState(0);
  const [instantAccess, setInstantAccess] = useState(true);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const buildingId = useBuildingStore((s) => s.buildingId);

  const title = useMemo(() => {
    if (variant === "owner") return "Add Owner";
    if (variant === "tenant") return "Add Tenant";
    return "Add President";
  }, [variant]);

  const submitLabel = useMemo(() => {
    if (variant === "owner") return "Create Owner";
    if (variant === "tenant") return "Create Tenant";
    return "Create Admin";
  }, [variant]);

  const backendRole = useMemo(() => {
    if (variant === "owner") return "OWNER" as const;
    if (variant === "tenant") return "USER" as const;
    return "SYSTEM_ADMIN" as const;
  }, [variant]);

  const togglePermission = (item: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item],
    );
  };

  const handleCreateResident = async () => {
    if (!fullName.trim()) {
      Toast.show({
        type: "error",
        text1: "Name required",
        text2: "Please enter full name.",
      });
      return;
    }
    if (phone.trim().length !== 10) {
      Toast.show({
        type: "error",
        text1: "Invalid phone number",
        text2: "Please enter a valid 10-digit mobile number.",
      });
      return;
    }
    if (!buildingId) {
      Toast.show({
        type: "error",
        text1: "Building missing",
        text2: "Building data is missing. Please try again.",
      });
      return;
    }

    try {
      setSubmitting(true);
      const floorValue = floors[floorIdx].replace(/\D/g, "");
      const tempPassword = `${phone.slice(-4)}`;
      await createProfile(
        fullName.trim(),
        phone.trim(),
        tempPassword,
        backendRole,
        String(buildingId),
        floorValue,
        flats[flatIdx],
      );
      setShowSuccess(true);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to add resident",
        text2: getErrorMessage(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#181818" />
          </Pressable>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      </View>

      <View style={styles.formWrap}>
        <Label text="Full Name" />
        <Input
          placeholder="Enter full name"
          value={fullName}
          onChangeText={setFullName}
        />

        <Label text="Phone Number" top={12} />
        <View style={styles.phoneWrap}>
          <View style={styles.countryCode}>
            <Text style={styles.countryCodeText}>+91</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder="98765 43210"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            maxLength={10}
            value={phone}
            onChangeText={(v) => setPhone(v.replace(/[^0-9]/g, ""))}
          />
        </View>

        {variant === "admin" ? (
          <>
            <Label text="Designation" top={12} />
            <Selector
              value={designations[designationIdx]}
              onPress={() =>
                setDesignationIdx((i) => (i + 1) % designations.length)
              }
            />
          </>
        ) : null}

        <View style={[styles.row, { marginTop: 12 }]}>
          <View style={styles.rowItem}>
            <Label text="Block" />
            <Selector
              value={blocks[blockIdx]}
              onPress={() => setBlockIdx((i) => (i + 1) % blocks.length)}
            />
          </View>
          <View style={styles.rowItem}>
            <Label text="Floor" />
            <Selector
              value={floors[floorIdx]}
              onPress={() => setFloorIdx((i) => (i + 1) % floors.length)}
            />
          </View>
          <View style={styles.rowItem}>
            <Label text="Flat No." />
            <Selector
              value={flats[flatIdx]}
              onPress={() => setFlatIdx((i) => (i + 1) % flats.length)}
            />
          </View>
        </View>

        {variant === "owner" ? (
          <>
            <Label text="Email Address" top={12} optional />
            <Input
              placeholder="owner@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.sectionTitle}>Access Level</Text>
            <View style={styles.accessCard}>
              <View style={styles.accessIconWrap}>
                <Ionicons name="key-outline" size={18} color="#2899CF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.accessTitle}>Grant instant app access</Text>
                <Text style={styles.accessSubtitle}>
                  Owner can log in and manage property immediately
                </Text>
              </View>
              <Switch
                value={instantAccess}
                onValueChange={setInstantAccess}
                trackColor={{ false: "#CBD5E1", true: "#2899CF" }}
                thumbColor="#fff"
              />
            </View>
          </>
        ) : null}

        {variant === "tenant" ? (
          <>
            <Label text="Lease End Date" top={12} optional />
            <Input
              placeholder="dd/mm/yyyy"
              value={leaseEnd}
              onChangeText={setLeaseEnd}
            />

            <View style={styles.infoCard}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#2899CF"
              />
              <Text style={styles.infoText}>
                By adding a tenant, they will receive an invitation link via SMS
                to join the society portal and manage their profile.
              </Text>
            </View>
          </>
        ) : null}

        {variant === "admin" ? (
          <>
            <Text style={styles.sectionTitle}>Permissions</Text>
            <View style={styles.permissionWrap}>
              {permissions.map((item) => {
                const active = selectedPermissions.includes(item);
                return (
                  <Pressable
                    key={item}
                    style={[
                      styles.permissionChip,
                      active && styles.permissionChipActive,
                    ]}
                    onPress={() => togglePermission(item)}
                  >
                    <Text
                      style={[
                        styles.permissionText,
                        active && styles.permissionTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.warningCard}>
              <MaterialCommunityIcons
                name="alert-outline"
                size={22}
                color="#DC2626"
              />
              <Text style={styles.warningText}>
                This user will have administrative access to society data.
                Please ensure the information is correct.
              </Text>
            </View>
          </>
        ) : null}
      </View>

      <Pressable
        style={styles.primaryBtn}
        onPress={handleCreateResident}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#FAFAFA" />
        ) : (
          <Text style={styles.primaryBtnText}>{submitLabel}</Text>
        )}
      </Pressable>

      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.successIconWrap}>
              <Ionicons name="checkmark-circle" size={44} color="#22C55E" />
            </View>
            <Text style={styles.modalTitle}>Invite Sent successfully!</Text>
            <View style={styles.illustrationBox}>
              <Image
                source={{ uri: successIllustration }}
                style={styles.modalImage}
              />
            </View>
            <Text style={styles.modalSubtitle}>
              An invitation with app download link has been sent to the
              resident&apos;s mobile number.
            </Text>

            <Pressable
              style={styles.modalPrimary}
              onPress={() => {
                setShowSuccess(false);
                router.replace("/home");
              }}
            >
              <Text style={styles.modalPrimaryText}>Go to Dashboard</Text>
            </Pressable>
            <Pressable onPress={() => setShowSuccess(false)}>
              <Text style={styles.modalLink}>Add Another Resident</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Label({
  text,
  optional,
  top,
}: {
  text: string;
  optional?: boolean;
  top?: number;
}) {
  return (
    <View style={[styles.labelRow, top ? { marginTop: top } : null]}>
      <Text style={styles.label}>{text}</Text>
      {optional ? <Text style={styles.optional}>Optional</Text> : null}
    </View>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      {...props}
      style={[styles.input, props.style]}
      placeholderTextColor="#94A3B8"
    />
  );
}

function Selector({ value, onPress }: { value: string; onPress: () => void }) {
  return (
    <Pressable style={styles.selector} onPress={onPress}>
      <Text style={styles.selectorText}>{value}</Text>
      <Feather name="chevron-down" size={18} color="#64748B" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  headerCard: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    minHeight: 98,
    justifyContent: "center",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    color: "#000",
    fontWeight: "500",
  },
  formWrap: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
  },
  optional: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
  },
  input: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#0F172A",
  },
  phoneWrap: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  countryCode: {
    width: 58,
    height: 56,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  countryCodeText: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
  phoneInput: {
    flex: 1,
    height: 56,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#0F172A",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  selector: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectorText: {
    fontSize: 14,
    color: "#0F172A",
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  accessCard: {
    backgroundColor: "rgba(40,153,207,0.05)",
    borderWidth: 1,
    borderColor: "rgba(40,153,207,0.1)",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  accessIconWrap: {
    width: 32,
    height: 40,
    borderRadius: 999,
    backgroundColor: "rgba(40,153,207,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  accessTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  accessSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  infoCard: {
    marginTop: 16,
    backgroundColor: "rgba(40,153,207,0.05)",
    borderWidth: 1,
    borderColor: "rgba(40,153,207,0.1)",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
  },
  permissionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  permissionChip: {
    paddingVertical: 9,
    paddingHorizontal: 17,
    borderRadius: 999,
    backgroundColor: "#F4F4F5",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  permissionChipActive: {
    borderColor: "#1C98ED",
    backgroundColor: "rgba(40,153,207,0.1)",
  },
  permissionText: {
    fontSize: 14,
    color: "#777",
    fontWeight: "500",
  },
  permissionTextActive: {
    color: "#1C98ED",
  },
  warningCard: {
    marginTop: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    backgroundColor: "#FEF2F2",
    padding: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#DC2626",
    lineHeight: 20,
    fontWeight: "500",
  },
  primaryBtn: {
    marginHorizontal: 16,
    marginTop: "auto",
    marginBottom: 24,
    borderRadius: 100,
    height: 48,
    backgroundColor: "#1C98ED",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    fontSize: 14,
    color: "#FAFAFA",
    fontWeight: "500",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(157,157,157,0.53)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 342,
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 24,
    alignItems: "center",
  },
  successIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(34,197,94,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    color: "#1A1A1A",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  illustrationBox: {
    width: "100%",
    borderRadius: 24,
    height: 160,
    backgroundColor: "rgba(39,153,206,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  modalImage: {
    width: 96,
    height: 96,
    resizeMode: "contain",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 18,
  },
  modalPrimary: {
    width: "100%",
    borderRadius: 14,
    height: 52,
    backgroundColor: "#1C98ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  modalPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalLink: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C98ED",
  },
});
