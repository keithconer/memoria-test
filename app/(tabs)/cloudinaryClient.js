import { Platform } from 'react-native';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dzkgahvft/image/upload';
const UPLOAD_PRESET = 'memoria'; // This must match the upload preset created in Cloudinary

export const uploadImageToCloudinary = async (imageUri) => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg', // Adjust the MIME type based on your image type
      name: 'upload.jpg',
    });
    formData.append('upload_preset', UPLOAD_PRESET); // Make sure this line exists and points to the correct preset
    
    // Log the formData to check if it's correctly formed
    console.log("Form data before upload: ", formData);

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(`Failed to upload image: ${data.error.message}`);
    }

    return data.secure_url; // Returns the URL of the uploaded image
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};
