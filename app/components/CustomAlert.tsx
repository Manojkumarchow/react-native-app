import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

type CustomAlertProps = {
  visible: boolean;
  title?: string;
  message?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
};

export default function CustomAlert({ visible, title, message, onCancel, onConfirm }: CustomAlertProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.row}>
            <TouchableOpacity onPress={onCancel} style={styles.btnSecondary}>
              <Text style={styles.btnTextSecondary}>Stay</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onConfirm} style={styles.btnPrimary}>
              <Text style={styles.btnTextPrimary}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: "#444",
    textAlign: "center",
    marginBottom: 20,
  },
  row: { flexDirection: "row", gap: 10 },
  btnPrimary: {
    backgroundColor: "#DC2626",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
  },
  btnSecondary: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
  },
  btnTextPrimary: { color: "#fff", fontWeight: "600" },
  btnTextSecondary: { color: "#333", fontWeight: "600" },
});
