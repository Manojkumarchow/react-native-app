import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileSectionCard({ title, children, onEdit }: { title: string; children: React.ReactNode; onEdit?: () => void }) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        {onEdit ? (
          <TouchableOpacity onPress={onEdit} style={styles.editBtn} accessibilityLabel={`Edit ${title}`}>
            <MaterialCommunityIcons name="pencil-outline" size={20} color="#C1282D" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.body}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    marginTop: 18,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    padding: 12,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '600', color: '#333' },
  editBtn: { padding: 6 },
  body: { marginTop: 8 },
});
