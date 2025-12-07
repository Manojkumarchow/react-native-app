import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Linking,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import BottomNav from "./components/BottomNav";

export default function EmergencyContactsScreen() {
  const router = useRouter(); // <-- useRouter hook for navigation

  const [contacts, setContacts] = useState([
    { id: 1, label: "Mom", phone: "9999999999" },
    { id: 2, label: "Father", phone: "9999999999" },
    { id: 3, label: "Brother", phone: "9999999999" },
    { id: 4, label: "Sister", phone: "9999999999" },
  ]);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuContact, setMenuContact] = useState(null);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [editId, setEditId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredContacts = contacts.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  // ---------- CALL ----------
  const makeCall = (phone) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  // ---------- DELETE ----------
  const deleteContact = () => {
    if (!menuContact) return;
    setContacts((prev) => prev.filter((c) => c.id !== menuContact.id));
    setMenuContact(null);
  };

  // ---------- EDIT ----------
  const startEdit = () => {
    if (!menuContact) return;
    setNewName(menuContact.label);
    setNewPhone(menuContact.phone);
    setEditId(menuContact.id);
    setMenuContact(null);
    setIsAddModalOpen(true);
  };

  // ---------- ADD / UPDATE ----------
  const saveContact = () => {
    if (!newName.trim() || !newPhone.trim()) {
      Alert.alert("Error", "Please enter both name and phone number");
      return;
    }

    if (!/^\d{10}$/.test(newPhone)) {
      Alert.alert("Error", "Phone number must be 10 digits");
      return;
    }

    if (editId) {
      // UPDATE CONTACT
      setContacts((prev) =>
        prev.map((c) =>
          c.id === editId
            ? { ...c, label: newName.trim(), phone: newPhone.trim() }
            : c
        )
      );
    } else {
      // ADD NEW CONTACT
      if (contacts.length >= 4) {
        Alert.alert("Limit Reached", "You can only add 4 contacts");
        return;
      }
      setContacts((prev) => [
        ...prev,
        { id: Date.now(), label: newName.trim(), phone: newPhone.trim() },
      ]);
    }

    // RESET
    setNewName("");
    setNewPhone("");
    setEditId(null);
    setIsAddModalOpen(false);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.safe}>
        {/* HEADER */}
        <View style={styles.blueHeader}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back(); // go to previous page
                } else {
                  router.push("/"); // go to home page if no previous page
                }
              }}
            >
              <Text style={styles.backArrow}>‹ Back </Text>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Contacts</Text>

            <View style={styles.rightIcons}>
              <TouchableOpacity onPress={() => setIsSearchOpen(!isSearchOpen)}>
                <Text style={styles.icon}>🔍</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* SEARCH */}
          {isSearchOpen && (
            <TextInput
              style={styles.searchInput}
              placeholder="Search contacts..."
              placeholderTextColor="#999"
              value={query}
              onChangeText={setQuery}
            />
          )}
        </View>

        {/* CONTACT GRID */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.blueCard}>
            <View style={styles.whiteCard}>
              <View style={styles.grid}>
                {filteredContacts.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.gridItem}
                    onLongPress={() => makeCall(c.phone)}
                  >
                    <Text style={styles.gridLabel}>{c.label}</Text>

                    {/* 3 DOT MENU */}
                    <TouchableOpacity
                      style={styles.dotsBtn}
                      onPress={() => setMenuContact(c)}
                    >
                      <Text style={styles.dots}>⋮</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* ADD BUTTON */}
        <TouchableOpacity
          style={[
            styles.addContactBtn,
            contacts.length >= 4 && { backgroundColor: "#ccc" },
          ]}
          onPress={() => {
            if (contacts.length >= 4) {
              Alert.alert("Limit Reached", "You can only add 4 contacts");
              return;
            }
            setEditId(null);
            setNewName("");
            setNewPhone("");
            setIsAddModalOpen(true);
          }}
        >
          <Text style={styles.addContactText}>Add Contact</Text>
        </TouchableOpacity>

        <BottomNav />

        {/* 3 DOT MENU MODAL */}
        <Modal
          visible={!!menuContact}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuContact(null)}
        >
          {menuContact && (
            <View style={styles.menuOverlay}>
              <View style={styles.menuBox}>
                <TouchableOpacity style={styles.menuItem} onPress={startEdit}>
                  <Text style={styles.menuText}>✏️ Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.menuItem, { backgroundColor: "#ff4d4d" }]}
                  onPress={deleteContact}
                >
                  <Text style={[styles.menuText, { color: "#fff" }]}>
                    ❌ Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Modal>

        {/* ADD / EDIT CONTACT MODAL */}
        <Modal
          visible={isAddModalOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setIsAddModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>
                {editId ? "Edit Contact" : "Add Contact"}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Name"
                value={newName}
                onChangeText={setNewName}
              />

              <TextInput
                style={styles.input}
                placeholder="Phone (10 digits)"
                keyboardType="number-pad"
                maxLength={10}
                value={newPhone}
                onChangeText={setNewPhone}
              />

              <TouchableOpacity style={styles.modalBtn} onPress={saveContact}>
                <Text style={styles.modalBtnText}>
                  {editId ? "Save Changes" : "Add Contact"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                <Text style={styles.closeText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  blueHeader: {
    backgroundColor: "#18a5ff",
    paddingTop: 25,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },

  headerRow: { flexDirection: "row", alignItems: "center" },

  backArrow: { color: "#fff", fontSize: 28 },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: -20,
  },

  rightIcons: { flexDirection: "row", alignItems: "center" },

  icon: { color: "#fff", fontSize: 22 },

  searchInput: {
    marginTop: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    fontSize: 16,
  },

  blueCard: { backgroundColor: "#18a5ff", marginTop: 10 },

  whiteCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 16,
    marginTop: 20,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  gridItem: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: "#f5fbff",
    borderWidth: 1,
    borderColor: "#d0e6ff",
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  gridLabel: { fontSize: 12, color: "#374151" },

  dotsBtn: { position: "absolute", right: 6, top: 6 },
  dots: { fontSize: 18, color: "#333" },

  addContactBtn: {
    position: "absolute",
    alignSelf: "center",
    bottom: 74,
    width: 180,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#18a5ff",
    justifyContent: "center",
    alignItems: "center",
  },

  addContactText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  // MENU MODAL
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  menuBox: {
    width: 200,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
  },

  menuItem: {
    padding: 12,
    backgroundColor: "#f1faff",
    marginBottom: 6,
    borderRadius: 8,
  },

  menuText: { fontSize: 16 },

  // ADD/EDIT MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  modalBtn: {
    backgroundColor: "#18a5ff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  modalBtnText: { color: "#fff", fontSize: 16, textAlign: "center" },

  closeText: {
    textAlign: "center",
    marginTop: 10,
    color: "#555",
    fontSize: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
});
