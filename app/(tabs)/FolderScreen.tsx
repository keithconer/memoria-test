import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import supabase from "./supabaseClient";
import { useNavigation } from "@react-navigation/native";

const FolderScreen = ({ route }) => {
  const { folderId } = route.params;
  const navigation = useNavigation();
  const [items, setItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.storage
        .from("memoriabucket")
        .list(folderId);

      if (error) throw error;

      const folders = data.filter(
        (item) => item.metadata && item.metadata.isDirectory
      );
      const files = data
        .filter((item) => !item.metadata?.isDirectory)
        .map(
          (file) =>
            supabase.storage
              .from("memoriabucket")
              .getPublicUrl(`${folderId}/${file.name}`).publicURL
        );

      setItems([...folders, ...files]);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setLoading(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = uri.split("/").pop();
      const fileExtension = fileName?.split(".").pop();

      const { error } = await supabase.storage
        .from("memoriabucket")
        .upload(`${folderId}/${Date.now()}.${fileExtension}`, blob);

      if (error) throw error;

      fetchItems();
      setShowModal(false);
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

    if (!result.canceled && result.assets) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const openFolder = (folderName: string) => {
    navigation.push("FolderScreen", { folderId: `${folderId}/${folderName}` });
  };

  useEffect(() => {
    fetchItems();
  }, [folderId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Folder: {folderId}</Text>
      <Text style={styles.subtitle}>Content</Text>

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
              <TouchableOpacity
                style={styles.folderContainer}
                onPress={() => openFolder(item.name)}
              >
                <Text style={styles.folderText}>{item.name}</Text>
              </TouchableOpacity>
            )
          }
          numColumns={3}
          columnWrapperStyle={{ justifyContent: "space-between" }}
        />
      )}

      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.uploadButtonText}>Upload Image</Text>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Upload Image</Text>
            <TouchableOpacity
              style={styles.pickImageButton}
              onPress={pickImage}
            >
              <Text style={styles.pickImageText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#1c1c1c",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#aaa",
    marginBottom: 10,
  },
  loading: {
    color: "#aaa",
    fontSize: 16,
  },
  imageContainer: {
    margin: 5,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  folderContainer: {
    margin: 5,
    padding: 10,
    backgroundColor: "#444444",
    borderRadius: 8,
    alignItems: "center",
  },
  folderText: {
    color: "white",
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: "#333333",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  uploadButtonText: {
    color: "white",
    fontSize: 16,
  },
  modalOverlay: {
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
    color: "white",
    marginBottom: 20,
  },
  pickImageButton: {
    backgroundColor: "#444444",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
    width: "100%",
  },
  pickImageText: {
    color: "white",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#999999",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default FolderScreen;
