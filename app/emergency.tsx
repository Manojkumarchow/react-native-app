import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  FlatList,
  Linking,
} from "react-native";
import axios from "axios";
import { Stack, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import useAuthStore from "./store/authStore";
import useProfileStore from "./store/profileStore";

type Contact = {
  name: string;
  phone: string;
};

const MAX_CONTACTS = 4;

export default function AddContact() {
  const username = useProfileStore((s) => s.phone);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  /* ----------------------------------
     FETCH CONTACTS
  ---------------------------------- */
  const fetchContacts = async () => {
    try {
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_BASE_URL}/profile/${username}/contacts`
      );
      setContacts(res.data || []);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load contacts");
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  /* ----------------------------------
     SAVE CONTACT (PATCH PROFILE)
  ---------------------------------- */
  const saveContact = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Validation", "Name and phone are required");
      return;
    }

    if (contacts.length >= MAX_CONTACTS) {
      Alert.alert("Limit reached", "You can add only 4 contacts");
      return;
    }

    const updatedContacts = [...contacts, { name, phone }];

    try {
      setLoading(true);

      await axios.patch(`${process.env.EXPO_PUBLIC_BASE_URL}/profile/update`, {
        phone: username, // identifier
        contacts: updatedContacts,
      });

      setModalVisible(false);
      setName("");
      setPhone("");
      fetchContacts();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Unable to save contact");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------
     CALL CONTACT
  ---------------------------------- */
  const callContact = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  /* ----------------------------------
     RENDER GRID ITEM
  ---------------------------------- */
  const renderBox = ({ item }: { item: Contact | null }) => {
    if (!item) {
      return (
        <TouchableOpacity
          style={styles.emptyBox}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.plus}>＋</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.contactBox}
        onPress={() => callContact(item.phone)}
        activeOpacity={0.7}
      >
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactPhone}>{item.phone}</Text>
      </TouchableOpacity>
    );
  };

  // Pad empty slots
  const data: (Contact | null)[] = [
    ...contacts,
    ...Array(MAX_CONTACTS - contacts.length).fill(null),
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contacts</Text>
      </View>

      <View style={styles.container}>
        <FlatList
          data={data}
          numColumns={2}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => renderBox({ item })}
          columnWrapperStyle={{ justifyContent: "space-between" }}
        />
      </View>

      {/* ADD CONTACT MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Contact</Text>

            <TextInput
              placeholder="Name"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              placeholder="Phone"
              style={styles.input}
              keyboardType="number-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={saveContact}
                disabled={loading}
              >
                <Text style={{ color: "#fff" }}>
                  {loading ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ----------------------------------
   STYLES
---------------------------------- */
const styles = StyleSheet.create({
  header: {
    backgroundColor: "#1C98ED",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 12,
  },

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },

  contactBox: {
    width: "48%",
    height: 120,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#1C98ED",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  emptyBox: {
    width: "48%",
    height: 120,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#1C98ED",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderStyle: "dashed",
  },

  plus: {
    fontSize: 40,
    color: "#1C98ED",
  },

  contactName: {
    fontSize: 16,
    fontWeight: "700",
  },

  contactPhone: {
    marginTop: 6,
    fontSize: 14,
    color: "#666",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  cancelBtn: {
    padding: 12,
  },

  saveBtn: {
    backgroundColor: "#1C98ED",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
});
