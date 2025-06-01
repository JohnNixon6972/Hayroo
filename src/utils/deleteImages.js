import { ref, deleteObject } from "firebase/storage";
import { storage } from "../firebase";

export const deleteImages = async (filePaths=[]) => {
  const deletePromises = filePaths.map((filePath) => {
    return new Promise(async (resolve, reject) => {
      try {
        const storageRef = ref(storage, filePath);
        await deleteObject(storageRef);
        resolve();
      } catch (error) {
        console.error(`Failed to delete image: ${filePath}`, error);
        reject(error);
      }
    });
  });

  try {
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error("Some images failed to delete", error);
    throw error;
  }
};