import { ref, deleteObject, uploadBytesResumable } from "firebase/storage";
import { storage } from "../firebase";

export const replaceImages = async (deletedTokens = [], newFiles = [], path = "products") => {
  console.log('Starting image replacement', { deletedTokens, newFiles, path });

  // Validate path
  const validPaths = ["products", "category", "customize"];
  if (!validPaths.includes(path)) {
    throw new Error(`Invalid path specified. Allowed paths: ${validPaths.join(', ')}`);
  }

  if (!Array.isArray(deletedTokens)) {
    console.warn('deletedTokens should be an array');
    deletedTokens = [];
  }
  
  if (!Array.isArray(newFiles)) {
    console.warn('newFiles should be an array');
    newFiles = [];
  }

  const deletePromises = deletedTokens.map((token) => {
    try {
      let filePath = token;
      if (token.includes('firebasestorage.googleapis.com')) {
        const url = new URL(token);
        filePath = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
      }
      
      const fileRef = ref(storage, filePath);
      return deleteObject(fileRef).catch((err) => {
        if (err.code === 'storage/object-not-found') {
          console.warn(`Image already deleted: ${filePath}`);
          return Promise.resolve();
        }
        console.error(`Failed to delete ${filePath}:`, err);
        throw err;
      });
    } catch (err) {
      console.error('Error processing delete for token:', token, err);
      return Promise.resolve(); 
    }
  });

  const uploadPromises = newFiles.map((file) => {
    if (!file) {
      console.warn('Skipping empty file');
      return Promise.resolve(null);
    }

    return new Promise((resolve, reject) => {
      try {
        const filePath = `${path}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const storageRef = ref(storage, filePath);
        console.log('Starting upload:', file.name, 'to path:', path);

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload ${file.name} is ${progress}% done`);
          },
          (error) => {
            console.error('Upload failed:', file.name, error);
            reject(error);
          },
          () => {
            console.log('Upload completed:', file.name);
            resolve(filePath);
          }
        );
      } catch (err) {
        console.error('Error setting up upload:', err);
        reject(err);
      }
    });
  });

  try {
    console.log('Executing delete operations...');
    await Promise.all(deletePromises);
    console.log('All deletions completed, starting uploads...');
    
    const uploadedPaths = (await Promise.all(uploadPromises)).filter(path => path !== null);
    console.log('All operations completed successfully. New paths:', uploadedPaths);
    
    return uploadedPaths;
  } catch (error) {
    console.error('Image replacement failed completely:', error);
    
    if (uploadPromises.length > 0) {
      console.log('Attempting to rollback uploads...');
      try {
        const uploadedPaths = await Promise.allSettled(uploadPromises);
        const successfulUploads = uploadedPaths
          .filter(result => result.status === 'fulfilled' && result.value)
          .map(result => result.value);
        
        if (successfulUploads.length > 0) {
          await Promise.allSettled(
            successfulUploads.map(path => deleteObject(ref(storage, path)))
          ).catch(rollbackError => {
            console.error('Rollback failed:', rollbackError);
          });
        }
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError);
      }
    }
    
    throw new Error(`Image replacement failed: ${error.message}`);
  }
};