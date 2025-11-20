import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Row({
  icon,
  label,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.row}>
      <MaterialCommunityIcons name={icon} size={18} color="#1C98ED" />

      <Text style={styles.label}>{label}</Text>

      <MaterialCommunityIcons name="chevron-right" size={20} color="#666" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  label: {
    flex: 1,
    marginLeft: 12,
    color: '#333',
    fontSize: 14,
  },
});
