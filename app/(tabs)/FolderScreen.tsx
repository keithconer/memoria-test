import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { ref, get } from "firebase/database"; // Firebase functions for data retrieval
import { database } from "./firebaseConfig"; // Import the database from firebaseConfig

const FolderScreen = () => {
  const route = useRoute();
  const { folderId } = route.params; // Get the folderId from navigation params

  const [folderDetails, setFolderDetails] = useState<any>(null);

  // Fetch folder details when component mounts or folderId changes
  useEffect(() => {
    const fetchFolderDetails = async () => {
      try {
        const folderRef = ref(database, `folders/${folderId}`);
        const snapshot = await get(folderRef);

        if (snapshot.exists()) {
          setFolderDetails(snapshot.val()); // Set folder details from Firebase
        } else {
          console.log("Folder not found.");
        }
      } catch (error) {
        console.error("Error fetching folder details:", error);
      }
    };

    fetchFolderDetails(); // Fetch folder details after component mounts
  }, [folderId]); // Re-fetch if folderId changes

  return (
    <View style={styles.container}>
      {folderDetails ? (
        <>
          <Text style={styles.title}>{folderDetails.name}</Text>
          <Text style={styles.createdAt}>
            Created At: {new Date(folderDetails.createdAt).toLocaleDateString()}
          </Text>
          {/* Add any additional folder data or content here */}
        </>
      ) : (
        <Text style={styles.loading}>Loading...</Text>
      )}
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
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  createdAt: {
    color: "white",
    fontSize: 16,
  },
  loading: {
    color: "white",
    fontSize: 18,
  },
});

export default FolderScreen;
