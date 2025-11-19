import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

import { ReactNode } from 'react';

interface FrostedCardProps {
  children: ReactNode;
}

export default function FrostedCard({ children }: FrostedCardProps) {
  return (
    <View style={styles.wrapper}>
      <BlurView intensity={40} tint="light" style={styles.blurLayer} />

      <LinearGradient
        colors={['#FFFFFF', 'rgba(255,255,255,0.45)']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientLayer}
      />

      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: width * 0.1425,
    right: width * 0.1469,
    top: height * 0.2315,
    bottom: height * 0.261,
  },

  blurLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
  },

  gradientLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
  },

  inner: {
    flex: 1,
    borderRadius: 30,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
});
