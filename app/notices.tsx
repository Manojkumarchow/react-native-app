import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const STATIC_NOTIFICATIONS = [
  {
    id: 1,
    title: "Maintenance Bill",
    message: "Hi, greeting from Maintes. We noticed your bill is not paid yet!",
    timestamp: "2025-11-20 14:30",
    read: false,
  },
  {
    id: 2,
    title: "Upcoming Maintenance",
    message: "Scheduled water maintenance in your building tomorrow.",
    timestamp: "2025-11-21 09:12",
    read: false,
  },
  {
    id: 3,
    title: "Apartment Updates",
    message: "New visitor gate pass feature is live. Check it out!",
    timestamp: "2025-11-19 17:50",
    read: false,
  },
  // Add more notifications if needed
];

export default function Notices() {
  const [selected, setSelected] = useState(null);
  const [notifications, setNotifications] = useState(STATIC_NOTIFICATIONS);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Mark notification as read & open modal
  const handleNotificationPress = (item) => {
    setSelected(item);
    if (!item.read) {
      setNotifications((prev) =>
        prev.map((n) => n.id === item.id ? { ...n, read: true } : n)
      );
    }
  };

  // Filtered and highlighted notifications for search
  const filteredNotifications = notifications.filter(
    n =>
      n.title.toLowerCase().includes(searchText.toLowerCase()) ||
      n.message.toLowerCase().includes(searchText.toLowerCase())
  );

  // Render notification card (highlights if search matches)
  const renderCard = ({ item }) => {
    // Is search active + does this card match?
    const isMatch = searchText && (
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.message.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
      <TouchableOpacity onPress={() => handleNotificationPress(item)}>
        <View style={[
          styles.card, 
          item.read ? styles.cardRead : styles.cardUnread,
          isMatch && styles.cardHighlighted
        ]}>
          {item.read && (
            <View style={styles.greenDot} />
          )}

          <Text style={[styles.cardTitle, !item.read && styles.unreadTitle]}>
            {item.title}
          </Text>
          <Text style={styles.cardBody}>{item.message}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with bell and search */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notification</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => setSearchVisible(!searchVisible)}>
            <Ionicons name="search-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 18 }}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Search input bar */}
      {searchVisible && (
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#1C98ED" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notifications..."
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons name="close-circle-outline" size={20} color="#1C98ED" />
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {/* Notification List (filtered if searching) */}
      <FlatList
        data={searchText ? filteredNotifications : notifications}
        keyExtractor={item => item.id.toString()}
        renderItem={renderCard}
        contentContainerStyle={{ paddingBottom: 90 }}
      />
      
      {/* Modal for notification detail */}
      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setSelected(null)} style={styles.closeBtn}>
              <Ionicons name="close" size={30} color="#1C98ED" />
            </TouchableOpacity>
            {selected && (
              <>
                <Text style={styles.modalTitle}>{selected.title}</Text>
                <Text style={styles.modalBody}>{selected.message}</Text>
                <Text style={styles.modalTimestamp}>{selected.timestamp}</Text>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Bar, NO bell icon */}
      <View style={styles.bottomBar}>
        <TouchableOpacity>
          <Ionicons name="home-outline" size={27} color="#1C98ED" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="grid-outline" size={27} color="#1C98ED" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="person-outline" size={27} color="#1C98ED" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e3f1fe" },
  header: {
    backgroundColor: "#1C98ED",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  headerIcons: { flexDirection: "row", alignItems: "center" },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 12,
    paddingHorizontal: 12,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.09,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginHorizontal: 8,
    color: "#1C98ED",
    paddingVertical: 8,
  },

  card: {
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
    position: "relative",
  },
  cardUnread: { backgroundColor: "#fff", borderLeftWidth: 5, borderLeftColor: "#1C98ED" },
  cardRead:   { backgroundColor: "#f1f1f1", borderLeftWidth: 5, borderLeftColor: "#b1b1b1" },
  cardHighlighted: { borderColor: "#1C98ED", borderWidth: 2 },
  cardTitle:  { fontWeight: "bold", fontSize: 16, color: "#258cff" },
  unreadTitle: { color: "#1C98ED" },
  cardBody:   { fontSize: 14, color: "#444", marginTop: 6 },
  timestamp:  { fontSize: 12, color: "#b1b1b1", textAlign: "right", marginTop: 8 },
  greenDot: {
    position: "absolute",
    top: 12,
    right: 14,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#00C853",
    borderWidth: 2,
    borderColor: "#fff",
    zIndex: 10,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#1C98ED",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    height: 56,
    elevation: 10,
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "flex-start",
    position: "relative",
    elevation: 10,
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#1C98ED", marginBottom: 12 },
  modalBody: { fontSize: 15, color: "#333", marginBottom: 10 },
  modalTimestamp: { fontSize: 13, color: "#b1b1b1", alignSelf: "flex-end" },
});
