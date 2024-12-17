// components/ThemedView.tsx
import React from "react";
import { View, ViewProps } from "react-native";

type ThemedViewProps = ViewProps;

const ThemedView: React.FC<ThemedViewProps> = ({
  style,
  children,
  ...props
}) => {
  return (
    <View style={[{ flex: 1, padding: 16 }, style]} {...props}>
      {children}
    </View>
  );
};

export { ThemedView };
