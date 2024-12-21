// cloudinaryClient.js
export const uploadImageToCloudinary = async (file) => {
  const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dzkgahvft/image/upload";
  const uploadPreset = "memoria"; // Your upload preset name

  // Create a FormData object to prepare the file and upload preset
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    // Send a POST request to Cloudinary
    const response = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image to Cloudinary");
    }

    const data = await response.json(); // Parse response JSON
    return data.secure_url; // Return the secure URL of the uploaded image
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
};
