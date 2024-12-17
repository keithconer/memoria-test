// app/_layout.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Home from "./(tabs)/home"; // Home screen
import Explore from "./(tabs)/explore"; // Explore screen

export default function Layout() {
  return (
    <View style={styles.container}>
      {/* You can choose which screen you want to display */}
      <Home /> {/* Or <Explore /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // Vertically center content
    alignItems: "center", // Horizontally center content
  },
});
