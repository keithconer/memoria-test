// components/ThemedText.tsx
import React from "react";
import { Text, TextProps } from "react-native";

type ThemedTextProps = TextProps & {
  type?: "title" | "body" | "link"; // You can extend this as needed
};

const ThemedText: React.FC<ThemedTextProps> = ({
  type = "body",
  style,
  children,
  ...props
}) => {
  const textStyle = {
    title: { fontSize: 24, fontWeight: "bold" },
    body: { fontSize: 16 },
    link: { fontSize: 16, color: "blue" },
  };

  return (
    <Text style={[textStyle[type], style]} {...props}>
      {children}
    </Text>
  );
};

export { ThemedText };
