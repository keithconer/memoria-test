// app/app.tsx

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Home from "./home"; // Import Home from the same folder (tabs)
import FolderScreen from "./FolderScreen"; // Import FolderScreen from the same folder (tabs)

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="FolderScreen" component={FolderScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
