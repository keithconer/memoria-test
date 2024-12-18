// FolderScreen.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

type FolderScreenProps = {
  route: any; // Expecting the folderId and folderName in the route params
};

const FolderScreen: React.FC<FolderScreenProps> = ({ route }) => {
  const { folderId, folderName } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.folderName}>{folderName}</Text>
      <Text style={styles.folderDetails}>
        Folder ID: {folderId} - Images can be added here.
      </Text>
      {/* Future functionality like image uploading will go here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1c1c1c",
  },
  folderName: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
  folderDetails: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginTop: 20,
  },
});

export default FolderScreen;
