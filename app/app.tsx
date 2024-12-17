// app/App.tsx or index.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native"; // Import NavigationContainer
import Layout from "./_layout"; // Import the layout with the tab navigator

export default function App() {
  return (
    <NavigationContainer>
      <Layout />
    </NavigationContainer>
  );
}
