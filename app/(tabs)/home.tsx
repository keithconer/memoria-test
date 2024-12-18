import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  TextInput,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // For icons

// Import Firebase functions and database reference
import { ref, get, push, set, remove, update } from "firebase/database"; // Firebase Realtime Database functions
import { database } from "./firebaseConfig"; // Import the database from firebaseConfig
import * as ImagePicker from "expo-image-picker"; // Image picker for uploading images

// Type for Folder
interface Folder {
  id: string;
  name: string;
}

const Home = () => {
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [folders, setFolders] = useState<Folder[]>([]); // State for folders
  const [folderName, setFolderName] = useState(""); // State for storing the folder name input
  const [renameModalVisible, setRenameModalVisible] = useState(false); // State for renaming modal visibility
  const [currentFolderId, setCurrentFolderId] = useState(""); // State to store the id of the folder being renamed
  const [newFolderName, setNewFolderName] = useState(""); // State to store the new folder name
  const [imageUri, setImageUri] = useState<string | null>(null); // State for the selected image URI
  const [isFolderNameVisible, setIsFolderNameVisible] = useState(false); // State to toggle folder name input field

  // Fetch folders when the component mounts
  useEffect(() => {
    const loadFolders = async () => {
      const folderData = await fetchFolders(); // Fetch folders from Firebase
      setFolders(folderData); // Update state with fetched folders
    };

    loadFolders(); // Fetch folders when the component mounts
  }, []); // Empty dependency array means it runs only once after the component mounts

  // Function to fetch folders from Firebase Realtime Database
  const fetchFolders = async (): Promise<Folder[]> => {
    try {
      const folderRef = ref(database, "folders"); // Reference to the "folders" node in Firebase
      const snapshot = await get(folderRef); // Get data from the database

      if (snapshot.exists()) {
        const folders = snapshot.val(); // Get all folders as an object
        return Object.keys(folders).map((key) => ({
          id: key,
          name: folders[key].name, // Folder name from database
        }));
      } else {
        console.log("No folders found.");
        return [];
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
      return [];
    }
  };

  // Function to create a new folder in Firebase
  const handleCreateFolder = async () => {
    if (folderName.trim() === "") {
      console.log("Folder name is required.");
      return;
    }

    try {
      const folderRef = push(ref(database, "folders")); // Create a new reference for the folder
      await set(folderRef, { name: folderName, createdAt: Date.now() }); // Save folder data to Firebase
      console.log("Folder created successfully!");

      // Fetch updated folders after creation
      const folderData = await fetchFolders();
      setFolders(folderData); // Update folders state with new data
      setFolderName(""); // Clear input field after folder creation
      setIsFolderNameVisible(false); // Hide input field
      toggleModal(); // Close modal
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  // Function to toggle the modal for creating a folder
  const toggleModal = () => {
    setModalVisible(!modalVisible); // Toggle the state of modal visibility
  };

  // Function to pick an image from the device
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === "granted") {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Corrected line
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImageUri(result.uri); // Save the selected image URI
      }
    } else {
      console.log("Permission to access media library is required.");
    }
  };

  // Function to handle the renaming of a folder
  const handleRenameFolder = async () => {
    if (newFolderName.trim() === "") {
      console.log("New folder name is required.");
      return;
    }

    try {
      const folderRef = ref(database, `folders/${currentFolderId}`); // Reference to the folder to be renamed
      await update(folderRef, { name: newFolderName }); // Update the folder name in Firebase
      console.log("Folder renamed successfully!");

      // Fetch updated folders after renaming
      const folderData = await fetchFolders();
      setFolders(folderData); // Update folders state with new data
      setRenameModalVisible(false); // Close the rename modal
      setNewFolderName(""); // Clear new folder name input
    } catch (error) {
      console.error("Error renaming folder:", error);
    }
  };

  // Function to handle folder deletion
  const handleDeleteFolder = async (id: string) => {
    try {
      const folderRef = ref(database, `folders/${id}`); // Reference to the folder to be deleted
      await remove(folderRef); // Delete the folder from Firebase
      console.log("Folder deleted successfully!");

      // Fetch updated folders after deletion
      const folderData = await fetchFolders();
      setFolders(folderData); // Update folders state with new data
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Memoria Logo and Tagline (Top-Left) */}
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>Memoria</Text>
        <Text style={styles.tagline}>Let's keep your memories organized</Text>
      </View>

      {/* Displaying Folders Section with Border and Shadow */}
      <View style={styles.foldersContainer}>
        <Text style={styles.foldersTitle}>Here are your memories so far:</Text>
        <FlatList
          data={folders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.folderItem}>
              <Text style={styles.folderText}>{item.name}</Text>
              <View style={styles.folderActions}>
                <TouchableOpacity
                  onPress={() => {
                    setCurrentFolderId(item.id);
                    setNewFolderName(item.name);
                    setRenameModalVisible(true);
                  }}
                  style={styles.folderActionButton}
                >
                  <MaterialCommunityIcons
                    name="pencil"
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteFolder(item.id)}
                  style={styles.folderActionButton}
                >
                  <MaterialCommunityIcons
                    name="delete"
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>

      {/* Create Folder Button */}
      <TouchableOpacity style={styles.floatingButton} onPress={toggleModal}>
        <MaterialCommunityIcons name="folder-plus" size={30} color="white" />
      </TouchableOpacity>

      {/* Rename Folder Modal */}
      <Modal
        transparent={true}
        visible={renameModalVisible}
        animationType="fade"
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rename Folder</Text>

            <TextInput
              style={styles.folderInput}
              placeholder="Enter new folder name"
              value={newFolderName}
              onChangeText={setNewFolderName}
            />

            <TouchableOpacity
              onPress={handleRenameFolder}
              style={styles.modalButton}
            >
              <MaterialCommunityIcons name="folder" size={20} color="white" />
              <Text style={styles.modalButtonText}>Rename</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setRenameModalVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Folder Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create a Folder</Text>

            {!isFolderNameVisible ? (
              // Create Folder Button (initial view)
              <TouchableOpacity
                onPress={() => setIsFolderNameVisible(true)}
                style={styles.modalButton}
              >
                <MaterialCommunityIcons name="folder" size={20} color="white" />
                <Text style={styles.modalButtonText}>Create Folder</Text>
              </TouchableOpacity>
            ) : (
              // Folder Name Input (after clicking "Create Folder")
              <>
                <TextInput
                  style={styles.folderInput}
                  placeholder="Enter folder name"
                  value={folderName}
                  onChangeText={setFolderName} // Update folderName state
                />
                <TouchableOpacity
                  onPress={handleCreateFolder}
                  style={styles.modalButton}
                >
                  <MaterialCommunityIcons
                    name="folder"
                    size={20}
                    color="white"
                  />
                  <Text style={styles.modalButtonText}>Create Folder</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Upload Image Button */}
            <TouchableOpacity onPress={pickImage} style={styles.modalButton}>
              <MaterialCommunityIcons name="image" size={20} color="white" />
              <Text style={styles.modalButtonText}>Upload Image</Text>
            </TouchableOpacity>

            {imageUri && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              </View>
            )}

            {imageUri && (
              <TouchableOpacity onPress={() => {}} style={styles.modalButton}>
                <MaterialCommunityIcons name="upload" size={20} color="white" />
                <Text style={styles.modalButtonText}>Upload to Firebase</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={toggleModal} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#1c1c1c",
    marginHorizontal: 20,
    paddingVertical: 40,
    width: "100%",
    height: "100%",
  },
  logoContainer: {
    position: "absolute",
    top: 40,
    left: 20,
    alignItems: "flex-start",
    marginBottom: 40,
  },
  logo: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
  },
  tagline: {
    fontSize: 16,
    color: "white",
    marginTop: 10,
    marginBottom: 30,
  },
  foldersContainer: {
    marginTop: 150,
    width: "100%",
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#444444",
    borderRadius: 8,
    backgroundColor: "#2c2c2c",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  foldersTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  folderItem: {
    backgroundColor: "#333333",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  folderText: {
    color: "white",
    fontSize: 16,
  },
  folderInput: {
    width: "100%",
    padding: 10,
    backgroundColor: "#444444",
    borderRadius: 8,
    color: "white",
    marginBottom: 15,
  },
  folderActions: {
    flexDirection: "row", // This keeps the buttons in a horizontal line
    alignItems: "center", // Align them vertically in the center
    justifyContent: "space-between", // Optional: to give space between buttons if needed
  },

  folderActionButton: {
    marginLeft: 10, // Adds space between the buttons
  },
  floatingButton: {
    position: "absolute",
    bottom: 40,
    right: 40,
    backgroundColor: "#333333",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    elevation: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#333333",
    padding: 20,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  modalButton: {
    flexDirection: "row",
    backgroundColor: "#444444",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: "#999999",
    padding: 10,
    borderRadius: 8,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
  },
  imagePreviewContainer: {
    marginTop: 10,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});

export default Home;
