// app/(tabs)/home.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // For icons
import SettingsIcon from "../../components/SettingsIcon"; // Go back two levels, then into components

const Home = () => {
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [folders, setFolders] = useState([
    { id: "1", name: "Vacation Photos" },
    { id: "2", name: "Family Events" },
    { id: "3", name: "Personal Projects" },
  ]); // Dummy data for folders
  const [images, setImages] = useState([
    { id: "1", uri: "https://via.placeholder.com/150" },
    { id: "2", uri: "https://via.placeholder.com/150" },
    { id: "3", uri: "https://via.placeholder.com/150" },
  ]); // Dummy data for uploaded images

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleFavoritePress = () => {
    // Placeholder function for future favorite functionality
    console.log("Heart icon pressed! Implement functionality for favorites.");
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
            </View>
          )}
          contentContainerStyle={styles.foldersList}
        />
      </View>

      {/* Displaying Uploaded Images Below Folders */}
      <View style={styles.imagesContainer}>
        <Text style={styles.imagesTitle}>Your Uploaded Images:</Text>
        <FlatList
          data={images}
          keyExtractor={(item) => item.id}
          horizontal
          renderItem={({ item }) => (
            <View style={styles.imageItem}>
              <Image source={{ uri: item.uri }} style={styles.image} />
            </View>
          )}
          contentContainerStyle={styles.imagesList}
        />
      </View>

      {/* Create Folder Button */}
      <TouchableOpacity style={styles.floatingButton} onPress={toggleModal}>
        <MaterialCommunityIcons name="folder-plus" size={30} color="white" />
      </TouchableOpacity>

      {/* Heart Icon for Favorites */}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={handleFavoritePress}
      >
        <MaterialCommunityIcons name="heart" size={30} color="white" />
      </TouchableOpacity>

      {/* Modal for Folder Creation */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Action</Text>
            <TouchableOpacity onPress={toggleModal} style={styles.modalButton}>
              <MaterialCommunityIcons name="folder" size={20} color="white" />
              <Text style={styles.modalButtonText}>Create a New Folder</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleModal} style={styles.modalButton}>
              <MaterialCommunityIcons name="image" size={20} color="white" />
              <Text style={styles.modalButtonText}>Upload an Image</Text>
            </TouchableOpacity>
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
    borderWidth: 1, // Border for the "Your Memories" section
    borderColor: "#444444", // Dark border color
    borderRadius: 8, // Rounded corners for the border
    backgroundColor: "#2c2c2c", // Dark background for the section
    padding: 20,
    shadowColor: "#000", // Shadow for the section
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
  },
  folderText: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
  },
  foldersList: {
    paddingBottom: 20,
  },
  imagesContainer: {
    marginTop: 30, // Space between folders and images
    width: "100%",
    paddingHorizontal: 20,
  },
  imagesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  imageItem: {
    marginRight: 15, // Space between images
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 8,
    backgroundColor: "#444444", // Background color in case the image doesn't load
  },
  imagesList: {
    paddingBottom: 20,
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
  favoriteButton: {
    position: "absolute",
    bottom: 100, // Adjust the bottom position so it's above the Create Folder button
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
    width: 320,
    padding: 20,
    backgroundColor: "#2c2c2c",
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 25,
  },
  modalButton: {
    flexDirection: "row",
    backgroundColor: "#444444",
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: "center",
    width: "100%",
  },
  modalButtonText: {
    color: "white",
    marginLeft: 10,
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 20,
    backgroundColor: "#333333", // Dark color for the Cancel button
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },

  cancelButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default Home;
