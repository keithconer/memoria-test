// cloudinaryClient.js
export const uploadImageToCloudinary = async (fileUri) => {
  const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dzkgahvft/image/upload";
  const uploadPreset = "memoria"; // Your upload preset name

  const formData = new FormData();
  formData.append("file", {
    uri: fileUri,
    type: "image/jpeg", // or the appropriate image type
    name: "upload.jpg",
  });
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image to Cloudinary");
    }

    const data = await response.json();
    console.log("Cloudinary upload successful, URL:", data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
};