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
import { ref, get, push, set, remove, update } from "firebase/database"; // Firebase Realtime Database functions
import { database } from "./firebaseConfig"; // Import the database from firebaseConfig
import * as ImagePicker from "expo-image-picker"; // Image picker for uploading images
import { uploadImageToCloudinary } from "./cloudinaryClient"; // Path to your cloudinaryClient.js file

// Type for Folder
interface Folder {
  id: string;
  name: string;
  createdAt: number;
}

const Home = () => {
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [folders, setFolders] = useState<Folder[]>([]); // State for folders
  const [folderName, setFolderName] = useState(""); // State for storing the folder name input
  const [renameModalVisible, setRenameModalVisible] = useState(false); // State for renaming modal visibility
  const [currentFolderId, setCurrentFolderId] = useState(""); // State to store the id of the folder being renamed
  const [newFolderName, setNewFolderName] = useState(""); // State to store the new folder name
  const [isFolderNameVisible, setIsFolderNameVisible] = useState(false); // State to toggle folder name input field
  const [imageUploadModalVisible, setImageUploadModalVisible] = useState(false); // State for image upload modal
  const [selectedFolderId, setSelectedFolderId] = useState(""); // State to store the selected folder ID for image upload
  const [selectedFolderName, setSelectedFolderName] = useState(""); // State to store the selected folder name
  const [selectedFolderDate, setSelectedFolderDate] = useState(""); // State to store the selected folder date
  const [items, setItems] = useState<any[]>([]); // State for items in the folder
  const [loading, setLoading] = useState(false); // State for loading
  const [deleteModalVisible, setDeleteModalVisible] = useState(false); // State for delete confirmation modal visibility
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null); // State to store the folder to be deleted

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
          createdAt: folders[key].createdAt, // Folder creation date
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
      const folderRef = push(ref(database, "folders"));
      const newFolder = {
        name: folderName,
        createdAt: Date.now(), // This line records the creation time
      };
      await set(folderRef, newFolder); // Save folder data to Firebase

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
  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;

    try {
      const folderRef = ref(database, `folders/${folderToDelete.id}`); // Reference to the folder to be deleted
      await remove(folderRef); // Delete the folder from Firebase

      console.log("Folder deleted successfully!");

      // Fetch updated folders after deletion
      const folderData = await fetchFolders();
      setFolders(folderData); // Update folders state with new data

      // Close delete confirmation modal and clear folder to delete
      setDeleteModalVisible(false);
      setFolderToDelete(null);
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  // Function to open the delete confirmation modal
  const openDeleteModal = (folder: Folder) => {
    setFolderToDelete(folder);
    setDeleteModalVisible(true);
  };

  const handleFolderClick = async (folderId: string) => {
    setSelectedFolderId(folderId);
    const folder = folders.find((f) => f.id === folderId);
    if (folder) {
      setSelectedFolderName(folder.name);
      const folderDate = new Date(folder.createdAt);
      const formattedDate = folderDate.toLocaleDateString("en-US", {
        weekday: "long", //
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const formattedTime = folderDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // Ensures 12-hour format (AM/PM)
      });
      setSelectedFolderDate(`${formattedDate}, ${formattedTime}`);
    }
    setImageUploadModalVisible(true);
  };

  const uploadImage = async (uri: string) => {
    try {
      setLoading(true);
      const imageUrl = await uploadImageToCloudinary(uri);

      if (!imageUrl) {
        throw new Error("Failed to get image URL from Cloudinary");
      }

      console.log("Image uploaded successfully:", imageUrl);

      // Here you can save the image URL to Firebase under the selected folder
      const imageRef = push(
        ref(database, `folders/${selectedFolderId}/images`)
      );
      await set(imageRef, { url: imageUrl });

      handleFolderClick(selectedFolderId); // Refresh items after upload
      setImageUploadModalVisible(false);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await uploadImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Memoria Logo and Tagline (Top-Left) */}
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>memoria.</Text>
        <Text style={styles.tagline}>
          Let's keep your memories organized and treasured.
        </Text>
      </View>
      {/* Displaying Folders Section with Border and Shadow */}
      <View style={styles.foldersContainer}>
        <Text style={styles.foldersTitle}>
          Here are your lovely memories so far
        </Text>
        <FlatList
          data={folders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            // Format the createdAt date using JavaScript's Date object
            const folderDate = new Date(item.createdAt);

            const formattedDate = folderDate.toLocaleDateString("en-US", {
              weekday: "long", //
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            const formattedTime = folderDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true, // Ensures 12-hour format (AM/PM)
            });

            return (
              <View style={styles.folderItem}>
                {/* Folder Name and Date Section */}
                <View style={styles.folderTextContainer}>
                  <Text style={styles.folderText}>{item.name}</Text>
                  <Text
                    style={styles.folderDate}
                  >{`${formattedDate}, ${formattedTime}`}</Text>{" "}
                  {/* Display date and time */}
                </View>

                {/* Folder Actions (edit and delete buttons) */}
                <View style={styles.folderActions}>
                  <TouchableOpacity
                    onPress={() => handleFolderClick(item.id)} // Trigger folder click handler
                    style={styles.folderActionButton}
                  >
                    <MaterialCommunityIcons
                      name="folder-open"
                      size={20}
                      color="white"
                    />
                  </TouchableOpacity>
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
                    onPress={() => openDeleteModal(item)}
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
            );
          }}
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
              // Folder Name Input (when button is clicked)
              <>
                <TextInput
                  style={styles.folderInput}
                  placeholder="Enter folder name"
                  value={folderName}
                  onChangeText={setFolderName}
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
                  <Text style={styles.modalButtonText}>Create</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity onPress={toggleModal} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Image Upload Modal */}
      <Modal
        transparent={true}
        visible={imageUploadModalVisible}
        animationType="slide"
        onRequestClose={() => setImageUploadModalVisible(false)}
      >
        <View style={styles.fullScreenModalOverlay}>
          <View style={styles.fullScreenModalContent}>
            <Text style={styles.modalTitle}>{selectedFolderName}</Text>
            <Text style={styles.modalSubtitle}>{selectedFolderDate}</Text>

            {loading ? (
              <Text style={styles.loading}>Loading...</Text>
            ) : (
              <FlatList
                data={items}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) =>
                  typeof item === "string" ? (
                    <View style={styles.imageContainer}>
                      <Image source={{ uri: item }} style={styles.image} />
                    </View>
                  ) : (
                    <View style={styles.folderContainer}>
                      <Text style={styles.folderText}>{item.name}</Text>
                    </View>
                  )
                }
                numColumns={3}
                columnWrapperStyle={{ justifyContent: "space-between" }}
              />
            )}

            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <MaterialCommunityIcons
                name="image-plus"
                size={20}
                color="white"
                style={styles.uploadIcon}
              />
              <Text style={styles.uploadButtonText}>Upload Image</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setImageUploadModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        transparent={true}
        visible={deleteModalVisible}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Folder</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete this folder and all of the images
              inside it?
            </Text>

            <TouchableOpacity
              onPress={handleDeleteFolder}
              style={styles.modalButton}
            >
              <MaterialCommunityIcons name="delete" size={20} color="white" />
              <Text style={styles.modalButtonText}>Delete Folder</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDeleteModalVisible(false)}
              style={styles.cancelButton}
            >
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
    fontSize: 15,
    fontStyle: "italic",
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
    maxHeight: "60%", // You can adjust this value to fit your layout needs
    overflow: "scroll", // Makes the content scrollable when it exceeds the maxHeight
  },
  foldersTitle: {
    fontSize: 18,
    fontWeight: "medium",
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
  folderTextContainer: {
    flex: 1,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  folderDate: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 5,
  },
  folderActionButton: {
    marginLeft: 10,
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
  fullScreenModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  fullScreenModalContent: {
    backgroundColor: "#333333",
    padding: 20,
    borderRadius: 8,
    width: "90%",
    height: "90%",
    alignItems: "center",
  },
  modalHeader: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#aaa",
    marginBottom: 10,
  },
  loading: {
    color: "#aaa",
    fontSize: 16,
  },
  folderContainer: {
    margin: 5,
    padding: 10,
    backgroundColor: "#444444",
    borderRadius: 8,
    alignItems: "center",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center", // Vertically centers children along the cross axis
    justifyContent: "center", // Horizontally centers children along the main axis
    backgroundColor: "#444444",
    padding: 20,
    width: "100%",
    marginBottom: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  modalText: {
    color: "white",
    marginBottom: 10,
    textAlign: "center",
  },
  uploadButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
  },
  uploadIcon: {
    marginRight: 10,
  },
});

export default Home;
