import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Home from "./home"; // Your main screen component
import FolderScreen from "./FolderScreen"; // Your folder screen component

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="FolderScreen" component={FolderScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
