import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import NetworkImage from './NetworkImage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(900, width - 32);

const LOCAL_HERO = require('./../../assets/images/hero.png'); // local asset in assets/

export default function AdsCarousel() {
  const [index, setIndex] = useState(0);
  // remote images (example). If none, NetworkImage will fall back to local hero.
  const slides = [
    // example remote URL (replace with real ad URLs)
    'https://placehold.co/900x260?text=Ad+1',
    'https://placehold.co/900x260?text=Ad+2',
  ];

  const next = () => setIndex(i => (i + 1) % slides.length);
  const prev = () => setIndex(i => (i - 1 + slides.length) % slides.length);

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <NetworkImage
          uri={slides[index]}
          localFallback={LOCAL_HERO}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.pagerRow}>
        <TouchableOpacity onPress={prev} style={styles.chev}><Text>{'<'}</Text></TouchableOpacity>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <TouchableOpacity onPress={next} style={styles.chev}><Text>{'>'}</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginVertical: 24, alignItems: 'center' },
  card: {
    width: CARD_WIDTH,
    height: Math.round(CARD_WIDTH * 0.28),
    backgroundColor: 'rgba(28,152,237,0.12)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#1C98ED',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '70%', height: '70%' },
  pagerRow: {
    marginTop: 12,
    width: CARD_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { flexDirection: 'row', alignItems: 'center' },
  dot: {
    width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: '#fff', marginHorizontal: 6, backgroundColor: 'transparent',
  },
  dotActive: { backgroundColor: '#fff' },
  chev: { paddingHorizontal: 12, paddingVertical: 6 },
});
