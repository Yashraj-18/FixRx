import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const PlaceholderScreen = ({ title }: { title?: string }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={styles.text}>{title || 'Loading...'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default PlaceholderScreen;
