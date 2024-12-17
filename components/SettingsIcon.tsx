// components/SettingsIcon.tsx
import React, { useState } from "react";
import { TouchableOpacity, Modal, View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const SettingsIcon = ({ onThemeChange }) => {
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  const toggleThemeModal = () => {
    setThemeModalVisible(!themeModalVisible);
  };

  const handleThemeChange = (selectedTheme: string) => {
    onThemeChange(selectedTheme); // Call the parent function to change the theme
    setThemeModalVisible(false); // Close the modal after selecting
  };

  return (
    <>
      {/* Settings Icon */}
      <TouchableOpacity style={styles.settingsIcon} onPress={toggleThemeModal}>
        <MaterialCommunityIcons name="settings" size={30} color="white" />
      </TouchableOpacity>

      {/* Theme Selection Modal */}
      <Modal
        transparent={true}
        visible={themeModalVisible}
        animationType="fade"
        onRequestClose={toggleThemeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Theme</Text>
            <TouchableOpacity
              onPress={() => handleThemeChange("dark")}
              style={styles.modalButton}
            >
              <MaterialCommunityIcons
                name="moon-waning-crescent"
                size={20}
                color="white"
              />
              <Text style={styles.modalButtonText}>Dark Theme</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleThemeChange("light")}
              style={styles.modalButton}
            >
              <MaterialCommunityIcons
                name="weather-sunny"
                size={20}
                color="white"
              />
              <Text style={styles.modalButtonText}>Light Theme</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleThemeChange("system")}
              style={styles.modalButton}
            >
              <MaterialCommunityIcons
                name="theme-light-dark"
                size={20}
                color="white"
              />
              <Text style={styles.modalButtonText}>System Default</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleThemeModal}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  settingsIcon: {
    position: "absolute",
    top: 40,
    right: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#2c2c2c", // Dark background for modal
    padding: 30,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    color: "white",
    marginBottom: 20,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#444444", // Dark color for buttons
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalButtonText: {
    color: "white",
    marginLeft: 10,
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 20,
    backgroundColor: "#333333", // Dark color for cancel button
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

export default SettingsIcon;
