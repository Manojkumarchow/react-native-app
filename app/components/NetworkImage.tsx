import React, { useEffect, useState } from 'react';
import { View, Image, ActivityIndicator, StyleSheet, ImageSourcePropType } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export default function NetworkImage({ uri, localFallback, style, resizeMode = 'contain' }) {
  const [isOnline, setIsOnline] = useState(null);
  const [loading, setLoading] = useState(Boolean(uri));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const sub = NetInfo.addEventListener(state => setIsOnline(state.isConnected));
    NetInfo.fetch().then(s => setIsOnline(s.isConnected));
    return () => sub();
  }, []);

  useEffect(() => {
    setLoading(Boolean(uri));
    setFailed(false);
  }, [uri]);

  // If offline or no uri, show local fallback immediately
  if (!uri || isOnline === false) {
    return <Image source={localFallback} style={style} resizeMode={resizeMode} />;
  }

  return (
    <View style={[styles.container, style]}>
      {loading && <ActivityIndicator style={styles.loader} size="small" color="#3B5BFE" />}
      <Image
        source={{ uri }}
        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
        resizeMode={resizeMode}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => { setLoading(false); setFailed(true); }}
      />
      {failed && localFallback ? (
        <Image source={localFallback} style={style} resizeMode={resizeMode} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  loader: { position: 'absolute', zIndex: 10 },
});
