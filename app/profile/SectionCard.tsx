import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SectionCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>

        {onEdit ? (
          <TouchableOpacity onPress={onEdit} style={styles.editIcon}>
            <MaterialCommunityIcons
              name="pencil-outline"
              size={20}
              color="#C1282D"
            />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.childrenWrapper}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 12,
    marginTop: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 15, fontWeight: '600', color: '#333' },
  editIcon: { padding: 4 },
  childrenWrapper: { marginTop: 8 },
});
