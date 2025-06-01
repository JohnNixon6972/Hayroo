import {
  DashboardData,
  postUploadImage,
  getSliderImages,
  postDeleteImage,
} from "./FetchApi";
import { getAllOrder } from "../orders/FetchApi.js";
import { uploadImages } from "../../../utils/uploadImages";
import { deleteImages } from "../../../utils/deleteImages.js";

export const GetAllData = async (dispatch) => {
  let responseData = await DashboardData();
  if (responseData) {
    dispatch({ type: "totalData", payload: responseData });
  }
};

export const todayAllOrders = async (dispatch) => {
  let responseData = await getAllOrder();
  if (responseData) {
    dispatch({ type: "totalOrders", payload: responseData });
  }
};

export const sliderImages = async (dispatch) => {
  try {
    let responseData = await getSliderImages();
    if (responseData && responseData.Images) {
      dispatch({ type: "sliderImages", payload: responseData.Images });
    }
  } catch (error) {
    console.log(error);
  }
};

export const deleteImage = async (item, dispatch) => {
  dispatch({ type: "imageUpload", payload: true });

  try {
    await deleteImages([item.slideImage], 'customize');

    let responseData = await postDeleteImage(item._id);

    if (responseData && responseData.success) {
      setTimeout(() => {
        sliderImages(dispatch);
        dispatch({ type: "imageUpload", payload: false });
      }, 1000);
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    dispatch({ type: "imageUpload", payload: false });
  }
};

export const uploadImage = async (image, dispatch) => {
  dispatch({ type: "imageUpload", payload: true });
  
  try {
    const uploadedImages = await uploadImages([image], "customize");
    
    if (uploadedImages && uploadedImages.length > 0) {
      const responseData = await postUploadImage({ imageToken: uploadedImages[0] });
      
      if (responseData && responseData.success) {
        setTimeout(() => {
          dispatch({ type: "imageUpload", payload: false });
          sliderImages(dispatch);
        }, 1000);
      }
    }
  } catch (error) {
    console.error("Upload failed:", error);
    dispatch({ type: "imageUpload", payload: false });
  }
};
