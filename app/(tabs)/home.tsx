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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ref, get, push, set, remove, update } from "firebase/database";
import { database } from "./firebaseConfig";
import * as ImagePicker from "expo-image-picker";
import { uploadImageToCloudinary } from "./cloudinaryClient";
import * as LocalAuthentication from "expo-local-authentication";

interface Folder {
  id: string;
  name: string;
  createdAt: number;
}

interface ImageItem {
  id: string;
  url: string;
}

const Home = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderName, setFolderName] = useState("");
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [isFolderNameVisible, setIsFolderNameVisible] = useState(false);
  const [imageUploadModalVisible, setImageUploadModalVisible] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [selectedFolderName, setSelectedFolderName] = useState("");
  const [selectedFolderDate, setSelectedFolderDate] = useState("");
  const [items, setItems] = useState<ImageItem[]>([]);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [uploadSuccessModalVisible, setUploadSuccessModalVisible] =
    useState(false);
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [commentSuccessModalVisible, setCommentSuccessModalVisible] =
    useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<ImageItem[]>([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [noResultsModalVisible, setNoResultsModalVisible] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [selectedTransferFolderId, setSelectedTransferFolderId] = useState("");
  const [transferSuccessModalVisible, setTransferSuccessModalVisible] =
    useState(false);

  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [secureLoading, setSecureLoading] = useState(false);
  const [secureImages, setSecureImages] = useState<ImageItem[]>([]);

  const [secureImageViewerVisible, setSecureImageViewerVisible] =
    useState(false);
  const [selectedSecureImageId, setSelectedSecureImageId] = useState<
    string | null
  >(null);
  const [selectedSecureImageUrl, setSelectedSecureImageUrl] = useState("");
  const [longPressedImageId, setLongPressedImageId] = useState<string | null>(
    null
  );
  const [selectedImagesForDeletion, setSelectedImagesForDeletion] = useState<
    string[]
  >([]);

  useEffect(() => {
    const loadFolders = async () => {
      const folderData = await fetchFolders();
      setFolders(folderData);
    };
    loadFolders();
  }, []);

  const handleImageLongPress = (imageId: string) => {
    console.log("Long press detected on image:", imageId);
    setSelectedImagesForDeletion((prevSelected) => {
      if (prevSelected.includes(imageId)) {
        return prevSelected.filter((id) => id !== imageId);
      } else {
        return [...prevSelected, imageId];
      }
    });
  };

  const handleDeleteImages = () => {
    Alert.alert(
      "Delete Images",
      "Are you sure you want to delete the selected images?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: confirmDeleteImages,
        },
      ],
      { cancelable: false }
    );
  };

  const confirmDeleteImages = async () => {
    try {
      const promises = selectedImagesForDeletion.map((imageId) => {
        const imageRef = ref(
          database,
          `folders/${selectedFolderId}/images/${imageId}`
        );
        return remove(imageRef);
      });

      await Promise.all(promises);
      console.log("Images deleted successfully");

      // Refresh the images list
      const imagesRef = ref(database, `folders/${selectedFolderId}/images`);
      const snapshot = await get(imagesRef);
      if (snapshot.exists()) {
        const images = snapshot.val();
        const imageItems = Object.keys(images).map((key) => ({
          id: key,
          url: images[key].url,
        }));
        setItems(imageItems);
      } else {
        setItems([]);
      }
      setSelectedImagesForDeletion([]); // Clear selection after deletion
    } catch (error) {
      console.error("Error deleting images:", error);
    }
  };

  const openSecureContentModal = async () => {
    setAuthModalVisible(true);
    setSecureLoading(true);

    try {
      const imagesRef = ref(database, "folders/secure/images");
      const snapshot = await get(imagesRef);

      if (snapshot.exists()) {
        const imagesData = snapshot.val();
        const imageItems = Object.keys(imagesData).map((key) => ({
          id: key,
          url: imagesData[key].url,
        }));
        setSecureImages(imageItems);
      } else {
        setSecureImages([]);
      }
    } catch (error) {
      console.error("Error fetching secure images:", error);
      setSecureImages([]);
    } finally {
      setSecureLoading(false);
    }
  };

  const handleSecureImageClick = async (imageId: string, imageUrl: string) => {
    setSelectedSecureImageId(imageId);
    setSelectedSecureImageUrl(imageUrl);
    setSecureImageViewerVisible(true);
    // No need to fetch comments
  };

  const handleCommentIconPress = async (imageId: string) => {
    setSelectedImageId(imageId);
    await fetchComments(imageId);
    setCommentModalVisible(true);
  };

  const authenticateFingerprint = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      alert("Your device does not support biometric authentication");
      return;
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      alert("No biometric authentication methods are registered");
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate",
      fallbackLabel: "Enter Password",
      disableDeviceFallback: true,
    });

    if (result.success) {
      alert("Authentication successful!");
      await openSecureContentModal(); // Open the secure content modal and fetch images
    } else {
      alert("Authentication failed");
    }
  };

  const handleTransferImage = async () => {
    if (!selectedTransferFolderId) return;

    try {
      const imageRef = ref(
        database,
        `folders/${selectedFolderId}/images/${selectedImageId}`
      );
      const snapshot = await get(imageRef);

      if (snapshot.exists()) {
        const imageData = snapshot.val();

        const newImageRef = push(
          ref(database, `folders/${selectedTransferFolderId}/images`)
        );
        await set(newImageRef, imageData);

        await remove(imageRef);

        console.log("Image transferred successfully!");

        const folderData = await fetchFolders();
        setFolders(folderData);
        setTransferModalVisible(false);
        setImageViewerVisible(false);
        setTransferSuccessModalVisible(true);
      } else {
        console.log("Image not found in the current folder.");
      }
    } catch (error) {
      console.error("Error transferring image:", error);
    }
  };

  useEffect(() => {
    if (transferSuccessModalVisible) {
      const timer = setTimeout(() => {
        setTransferSuccessModalVisible(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [transferSuccessModalVisible]);

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  const fetchFolders = async (): Promise<Folder[]> => {
    try {
      const folderRef = ref(database, "folders");
      const snapshot = await get(folderRef);

      if (snapshot.exists()) {
        const folders = snapshot.val();
        return Object.keys(folders)
          .map((key) => {
            const folder = folders[key];
            // Ensure the folder has a name and does not include the secure folder
            if (folder.name && key !== "secure") {
              return {
                id: key,
                name: folder.name,
                createdAt: folder.createdAt,
              };
            }
          })
          .filter(Boolean); // Remove any undefined entries
      } else {
        console.log("No folders found.");
        return [];
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
      return [];
    }
  };

  const handleImageClick = async (imageId: string, imageUrl: string) => {
    setSelectedImageId(imageId);
    setSelectedImageUrl(imageUrl);
    setImageViewerVisible(true);
    await fetchComments(imageId);
  };

  const handleCreateFolder = async () => {
    if (folderName.trim() === "") {
      console.log("Folder name is required.");
      return;
    }

    try {
      const folderRef = push(ref(database, "folders"));
      const newFolder = {
        name: folderName,
        createdAt: Date.now(),
      };
      await set(folderRef, newFolder);

      console.log("Folder created successfully!");

      const folderData = await fetchFolders();
      setFolders(folderData);
      setFolderName("");
      setIsFolderNameVisible(false);
      toggleModal();
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleRenameFolder = async () => {
    if (newFolderName.trim() === "") {
      console.log("New folder name is required.");
      return;
    }

    try {
      const folderRef = ref(database, `folders/${currentFolderId}`);
      await update(folderRef, { name: newFolderName });
      console.log("Folder renamed successfully!");

      const folderData = await fetchFolders();
      setFolders(folderData);
      setRenameModalVisible(false);
      setNewFolderName("");
    } catch (error) {
      console.error("Error renaming folder:", error);
    }
  };

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;

    try {
      const folderRef = ref(database, `folders/${folderToDelete.id}`);
      await remove(folderRef);

      console.log("Folder deleted successfully!");

      const folderData = await fetchFolders();
      setFolders(folderData);
      setDeleteModalVisible(false);
      setFolderToDelete(null);
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

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
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const formattedTime = folderDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setSelectedFolderDate(`${formattedDate}, ${formattedTime}`);
    }

    try {
      const imagesRef = ref(database, `folders/${folderId}/images`);
      const snapshot = await get(imagesRef);

      if (snapshot.exists()) {
        const images = snapshot.val();
        const imageItems = Object.keys(images).map((key) => ({
          id: key,
          url: images[key].url,
        }));
        setItems(imageItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      setItems([]);
    }

    setImageUploadModalVisible(true);
  };

  const uploadImage = async (uri, folderId) => {
    try {
      if (folderId === "secure") {
        setSecureLoading(true);
      } else {
        setLoading(true);
      }

      console.log(`Uploading image to Cloudinary: ${uri}`);
      const imageUrl = await uploadImageToCloudinary(uri);
      if (!imageUrl) {
        throw new Error("Failed to get image URL from Cloudinary");
      }

      console.log(`Image uploaded to Cloudinary, URL: ${imageUrl}`);
      const imageRef = push(ref(database, `folders/${folderId}/images`));
      await set(imageRef, { url: imageUrl });

      const newImage = { id: imageRef.key, url: imageUrl };
      console.log(`Image saved to Firebase, ID: ${imageRef.key}`);

      if (folderId === "secure") {
        setSecureImages((prevImages) => [...prevImages, newImage]);
        console.log("Secure image list updated");
      } else {
        setItems((prevImages) => [...prevImages, newImage]);
        setImageUploadModalVisible(false);
        console.log("Public image list updated");
      }

      setUploadSuccessModalVisible(true);
      setTimeout(() => setUploadSuccessModalVisible(false), 2000);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      if (folderId === "secure") {
        setSecureLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      console.log("Image picked for public folder:", result.assets[0].uri);
      await uploadImage(result.assets[0].uri, selectedFolderId);
    }
  };

  const pickSecureImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      console.log("Image picked for secure folder:", result.assets[0].uri);
      await uploadImage(result.assets[0].uri, "secure");
    }
  };

  const fetchComments = async (imageId: string) => {
    try {
      const folderId =
        selectedFolderId === "secure" ? "secure" : selectedFolderId;
      const commentRef = ref(
        database,
        `folders/${folderId}/images/${imageId}/comments`
      );
      const snapshot = await get(commentRef);

      if (snapshot.exists()) {
        const commentsData = snapshot.val();
        console.log("Fetched comments: ", commentsData);
        setComments(Object.values(commentsData));
      } else {
        console.log("No comments found.");
        setComments([]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      setComments([]);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      const folderId =
        selectedFolderId === "secure" ? "secure" : selectedFolderId;
      const commentRef = push(
        ref(database, `folders/${folderId}/images/${selectedImageId}/comments`)
      );
      await set(commentRef, newComment);

      setNewComment("");
      setCommentModalVisible(false);
      setCommentSuccessModalVisible(true);
      setTimeout(() => setCommentSuccessModalVisible(false), 2000);

      await fetchComments(selectedImageId);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const searchComments = async () => {
    setLoading(true);
    try {
      const foldersSnapshot = await get(ref(database, "folders"));
      if (foldersSnapshot.exists()) {
        const foldersData = foldersSnapshot.val();
        let searchResults: ImageItem[] = [];

        for (const folderId in foldersData) {
          if (folderId === "secure") {
            continue; // Skip the secure folder
          }

          const imagesSnapshot = await get(
            ref(database, `folders/${folderId}/images`)
          );

          if (imagesSnapshot.exists()) {
            const imagesData = imagesSnapshot.val();

            for (const imageId in imagesData) {
              const commentsSnapshot = await get(
                ref(database, `folders/${folderId}/images/${imageId}/comments`)
              );

              if (commentsSnapshot.exists()) {
                const commentsData = commentsSnapshot.val();
                const commentsArray = Object.values(commentsData) as string[];

                if (
                  commentsArray.some((comment) =>
                    comment.toLowerCase().includes(searchKeyword.toLowerCase())
                  )
                ) {
                  searchResults.push({
                    id: imageId,
                    url: imagesData[imageId].url,
                  });
                }
              }
            }
          }
        }

        if (searchResults.length > 0) {
          setSearchResults(searchResults);
          const firstResult = searchResults[0];
          setSelectedImageId(firstResult.id);
          setSelectedImageUrl(firstResult.url);
          setImageViewerVisible(true);
        } else {
          setNoResultsModalVisible(true);
        }
      }
    } catch (error) {
      console.error("Error searching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        {isSearchVisible && (
          <TextInput
            style={styles.searchInput}
            placeholder="Search comments"
            value={searchKeyword}
            onChangeText={setSearchKeyword}
          />
        )}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={isSearchVisible ? searchComments : toggleSearch}
        >
          <MaterialCommunityIcons name="magnify" size={30} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>memoria.</Text>
        <Text style={styles.tagline}>
          Let's keep your memories organized and treasured.
        </Text>
      </View>
      <View style={styles.foldersContainer}>
        <Text style={styles.foldersTitle}>
          Here are your lovely memories so far
        </Text>
        <FlatList
          data={folders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const folderDate = new Date(item.createdAt);
            const formattedDate = folderDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            const formattedTime = folderDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });
            return (
              <View style={styles.folderItem}>
                <View style={styles.folderTextContainer}>
                  <Text style={styles.folderText}>{item.name}</Text>
                  <Text
                    style={styles.folderDate}
                  >{`${formattedDate}, ${formattedTime}`}</Text>
                </View>
                <View style={styles.folderActions}>
                  <TouchableOpacity
                    onPress={() => handleFolderClick(item.id)}
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
      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.floatingButton} onPress={toggleModal}>
          <MaterialCommunityIcons name="folder-plus" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={authenticateFingerprint}
        >
          <MaterialCommunityIcons name="fingerprint" size={30} color="white" />
        </TouchableOpacity>
      </View>
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
              <TouchableOpacity
                onPress={() => setIsFolderNameVisible(true)}
                style={styles.modalButton}
              >
                <MaterialCommunityIcons name="folder" size={20} color="white" />
                <Text style={styles.modalButtonText}>Create Folder</Text>
              </TouchableOpacity>
            ) : (
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
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.imageContainer,
                      selectedImagesForDeletion.includes(item.id) &&
                        styles.selectedImageContainer,
                    ]}
                    onLongPress={() => handleImageLongPress(item.id)}
                  >
                    <Image source={{ uri: item.url }} style={styles.image} />
                  </TouchableOpacity>
                )}
                numColumns={3}
                columnWrapperStyle={{ justifyContent: "space-between" }}
              />
            )}
            {selectedImagesForDeletion.length > 0 && (
              <View style={styles.deleteButtonContainer}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDeleteImages}
                >
                  <Text style={styles.deleteButtonText}>
                    Delete Selected Images
                  </Text>
                </TouchableOpacity>
              </View>
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

      <Modal
        transparent={true}
        visible={imageViewerVisible}
        animationType="fade"
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <View style={styles.imageViewerOverlay}>
          <TouchableOpacity
            style={styles.closeImageViewer}
            onPress={() => setImageViewerVisible(false)}
          >
            <MaterialCommunityIcons name="close" size={30} color="white" />
          </TouchableOpacity>
          {selectedImageUrl && (
            <Image
              source={{ uri: selectedImageUrl }}
              style={styles.fullScreenImage}
            />
          )}
          <TouchableOpacity
            style={styles.commentIcon}
            onPress={() => {
              setCommentModalVisible(true);
              fetchComments(selectedImageId);
            }}
          >
            <MaterialCommunityIcons name="comment" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.transferIcon}
            onPress={() => setTransferModalVisible(true)}
          >
            <MaterialCommunityIcons
              name="folder-move"
              size={30}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </Modal>
      {/* Transfer Image Modal */}
      <Modal
        transparent={true}
        visible={transferModalVisible}
        animationType="fade"
        onRequestClose={() => setTransferModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Transfer Image</Text>
            <FlatList
              data={folders}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.folderItem}
                  onPress={() => setSelectedTransferFolderId(item.id)}
                >
                  <Text style={styles.folderText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={handleTransferImage}
              style={styles.modalButton}
            >
              <MaterialCommunityIcons
                name="folder-move"
                size={20}
                color="white"
              />
              <Text style={styles.modalButtonText}>Transfer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTransferModalVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        transparent={true}
        visible={transferSuccessModalVisible}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.successModalContent}>
            <MaterialCommunityIcons
              name="check-circle"
              size={50}
              color="green"
            />
            <Text style={styles.successText}>
              Your image has been transferred to the new folder successfully!
            </Text>
          </View>
        </View>
      </Modal>
      <Modal
        transparent={true}
        visible={commentModalVisible}
        animationType="fade"
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Comments</Text>
            <FlatList
              data={comments}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Text style={styles.commentText}>{item}</Text>
                </View>
              )}
            />
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment"
              value={newComment}
              onChangeText={setNewComment}
            />
            <TouchableOpacity onPress={addComment} style={styles.modalButton}>
              <MaterialCommunityIcons name="send" size={20} color="white" />
              <Text style={styles.modalButtonText}>Add Comment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setCommentModalVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        transparent={true}
        visible={commentSuccessModalVisible}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.successModalContent}>
            <MaterialCommunityIcons
              name="check-circle"
              size={50}
              color="green"
            />
            <Text style={styles.successText}>Comment added successfully!</Text>
          </View>
        </View>
      </Modal>
      <Modal
        transparent={true}
        visible={uploadSuccessModalVisible}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.successModalContent}>
            <MaterialCommunityIcons
              name="check-circle"
              size={50}
              color="green"
            />
            <Text style={styles.successText}>Image uploaded successfully!</Text>
          </View>
        </View>
      </Modal>
      <Modal
        transparent={true}
        visible={authModalVisible}
        animationType="fade"
        onRequestClose={() => setAuthModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.fullScreenModalContent}>
            <Text style={styles.modalTitle}>Secure Content</Text>
            <Text style={styles.modalText}>
              You have accessed the secure area.
            </Text>
            {secureLoading ? (
              <Text style={styles.loading}>Loading...</Text>
            ) : (
              <FlatList
                data={secureImages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.imageContainer}
                    onPress={() => handleSecureImageClick(item.id, item.url)}
                  >
                    <Image source={{ uri: item.url }} style={styles.image} />
                  </TouchableOpacity>
                )}
                numColumns={4}
                columnWrapperStyle={{ justifyContent: "space-between" }}
              />
            )}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={pickSecureImage}
            >
              <MaterialCommunityIcons
                name="image-plus"
                size={20}
                color="white"
                style={styles.uploadIcon}
              />
              <Text style={styles.uploadButtonText}>Upload Image</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAuthModalVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        transparent={true}
        visible={secureImageViewerVisible}
        animationType="fade"
        onRequestClose={() => setSecureImageViewerVisible(false)}
      >
        <View style={styles.imageViewerOverlay}>
          <TouchableOpacity
            style={styles.closeImageViewer}
            onPress={() => setSecureImageViewerVisible(false)}
          >
            <MaterialCommunityIcons name="close" size={30} color="white" />
          </TouchableOpacity>
          {selectedSecureImageUrl && (
            <Image
              source={{ uri: selectedSecureImageUrl }}
              style={styles.fullScreenImage}
            />
          )}
        </View>
      </Modal>
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
  iconContainer: {
    flexDirection: "column",
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  floatingButton: {
    backgroundColor: "#333333",
    borderRadius: 25,
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#444444",
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 5,
    paddingHorizontal: 10,
    width: "90%",
    alignSelf: "center",
  },
  searchInput: {
    flex: 1,
    padding: 10,
    color: "white",
  },
  searchButton: {
    padding: 10,
  },
  fullScreenModalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.8)" },
  fullScreenModalContent: { flex: 1, padding: 10 },
  imageContainer: { margin: 5 },
  image: { width: 100, height: 100, borderRadius: 5 },
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  imageViewerCloseButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
  fullImage: { width: "90%", height: "90%", resizeMode: "contain" },
  logoContainer: {
    marginTop: 10,
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
  },
  foldersContainer: {
    marginTop: 5,
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
    fontSize: 16,
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
    fontSize: 14,
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
    width: "95%", // Increase the width
    height: "95%", // Increase the height
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
  successModalContent: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    borderRadius: 10,
    elevation: 5,
  },
  successText: {
    fontSize: 18,
    color: "green",
    marginTop: 10,
    fontWeight: "normal",
  },
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },

  closeImageViewer: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },

  fullScreenImage: {
    width: "90%",
    height: "90%",
    resizeMode: "contain",
  },

  commentIcon: {
    position: "absolute",
    bottom: 20, // Adjust the position as needed
    right: 20,
    zIndex: 10,
  },

  transferIcon: {
    position: "absolute",
    bottom: 20, // Make sure this matches the commentIcon to align them
    right: 70, // Adjust the distance between the icons as needed
    zIndex: 10,
  },

  commentItem: {
    backgroundColor: "#444444",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
  },
  commentText: {
    color: "white",
    fontSize: 14,
  },
  selectedImageContainer: {
    borderColor: "red",
    borderWidth: 2,
  },
  commentInput: {
    width: "100%",
    padding: 10,
    backgroundColor: "#444444",
    borderRadius: 8,
    color: "white",
    marginBottom: 15,
  },
  deleteButtonContainer: {
    padding: 10,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 8,
    width: "90%",
    alignItems: "center",
    marginVertical: 10,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default Home;
