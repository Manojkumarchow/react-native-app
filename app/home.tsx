import React from 'react';
import { ScrollView, SafeAreaView, StyleSheet, View } from 'react-native';
import Header from './components/Header';
import TopAdsSlider from './components/TopAdsSlider';
import QuickActions from './components/QuickActions';
import ServicesGrid from './components/ServicesGrid';
import BottomAds from './components/BottomAds';
import BottomNav from './components/BottomNav';
import { Stack } from 'expo-router';

export default function Home() {
  return (
    <>
    <Stack.Screen options={{ headerShown: false }} />
    <SafeAreaView style={styles.safe}>
      <Header />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <TopAdsSlider />
        <QuickActions />
        <ServicesGrid />
        <BottomAds />
        <View style={{ height: 90 }} />
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
});
