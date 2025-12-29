import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface RowProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
}

export default function Row({ icon, label, onPress }: RowProps) {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <MaterialCommunityIcons name={icon} size={18} color="#1C98ED" />

      <Text style={styles.label}>{label}</Text>

      <MaterialCommunityIcons name="chevron-right" size={20} color="#666" />
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    width: "100%",
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  label: {
    flex: 1,
    marginLeft: 12,
    color: "#333",
    fontSize: 14,
  },
});
