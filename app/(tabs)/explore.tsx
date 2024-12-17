// app/(tabs)/explore.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Explore = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Explore the app!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default Explore; // Correct default export
