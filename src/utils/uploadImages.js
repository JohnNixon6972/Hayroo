
import { ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../firebase";

export const uploadImages = async (files) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      const filePath = `products/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        null,
        (error) => reject(error),
        () => {
          resolve(filePath);
        }
      );
    });
  });

  try {
    const imagePaths = await Promise.all(uploadPromises);
    return imagePaths;
  } catch (error) {
    console.error("Image upload failed", error);
    throw error;
  }
};
