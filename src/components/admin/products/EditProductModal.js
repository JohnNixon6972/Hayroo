import React, { Fragment, useContext, useState, useEffect } from "react";
import { ProductContext } from "./index";
import { editProduct, getAllProduct } from "./FetchApi";
import { getAllCategory } from "../categories/FetchApi";
import { replaceImages } from "../../../utils/replaceImages";

const EditProductModal = (props) => {
  const { data, dispatch } = useContext(ProductContext);
  const [categories, setCategories] = useState(null);
  const [deletedImages, setDeletedImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editformData, setEditformdata] = useState({
    pId: "",
    pName: "",
    pDescription: "",
    pImages: [],
    pStatus: "",
    pCategory: "",
    pQuantity: "",
    pPrice: "",
    pOffer: "",
    error: false,
    success: false,
  });

  // Fetch categories and initialize form data
  useEffect(() => {
    const fetchCategoryData = async () => {
      const responseData = await getAllCategory();
      if (responseData.Categories) {
        setCategories(responseData.Categories);
      }
    };
    fetchCategoryData();

    if (data.editProductModal.pImages) {
      setEditformdata({
        ...data.editProductModal,
        pImages: data.editProductModal.pImages || []
      });
      setDeletedImages([]);
      setNewImages([]);
      setImagePreviews([]);
    }
  }, [data.editProductModal]);

  const handleDeleteImage = (index) => {
    const updatedImages = [...editformData.pImages];
    const deletedImage = updatedImages.splice(index, 1)[0];
    setDeletedImages([...deletedImages, deletedImage]);
    setEditformdata({ ...editformData, pImages: updatedImages });
  };

  const handleNewImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = editformData.pImages.length + files.length;

    if (totalImages > 2) {
      setEditformdata({
        ...editformData,
        error: "Maximum 2 images allowed",
        success: false,
      });
      return;
    }

    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...previews]);
    setNewImages([...newImages, ...files]);
    e.target.value = ''; // Reset file input
  };

  const removeNewImage = (index) => {
    const updatedPreviews = [...imagePreviews];
    const updatedFiles = [...newImages];

    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    updatedFiles.splice(index, 1);

    setImagePreviews(updatedPreviews);
    setNewImages(updatedFiles);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImages = [...editformData.pImages];

      if (deletedImages.length > 0 || newImages.length > 0) {
        const uploadedPaths = await replaceImages(deletedImages, newImages, "products")

        finalImages = [...finalImages, ...uploadedPaths];
        finalImages = finalImages.slice(0, 2);
      }

      const productData = {
        _id: editformData.pId,
        pName: editformData.pName,
        pDescription: editformData.pDescription,
        pImages: finalImages,
        pStatus: editformData.pStatus,
        pCategory: editformData.pCategory,
        pQuantity: editformData.pQuantity,
        pPrice: editformData.pPrice,
        pOffer: editformData.pOffer
      };

      const responseData = await editProduct(productData);

      if (responseData.success) {
        const updatedProducts = await getAllProduct();
        dispatch({
          type: "fetchProductsAndChangeState",
          payload: updatedProducts.Products,
        });

        setEditformdata({ ...editformData, success: "Product updated successfully!" });
        setTimeout(() => {
          dispatch({ type: "editProductModalClose", payload: false });
        }, 1500);
      } else {
        setEditformdata({ ...editformData, error: responseData.error });
      }
    } catch (error) {
      console.error("Product update failed:", error);
      setEditformdata({
        ...editformData,
        error: "Failed to update product. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  return (
    <Fragment>
      {/* Modal Overlay */}
      <div
        onClick={() => dispatch({ type: "editProductModalClose", payload: false })}
        className={`${data.editProductModal.modal ? "" : "hidden"} fixed inset-0 bg-black opacity-50 z-30`}
      />

      {/* Modal Content */}
      <div className={`${data.editProductModal.modal ? "" : "hidden"} fixed inset-0 flex items-center justify-center z-40`}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Product</h3>
              <button
                onClick={() => dispatch({ type: "editProductModalClose", payload: false })}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            {editformData.error && (
              <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">
                {editformData.error}
              </div>
            )}
            {editformData.success && (
              <div className="bg-green-100 text-green-700 p-3 mb-4 rounded">
                {editformData.success}
              </div>
            )}

            <form onSubmit={submitForm}>
              {/* Product Details Form Fields */}
              <div className="flex space-x-1 py-4">
                <div className="w-1/2 flex flex-col space-y-1 space-x-1">
                  <label htmlFor="name">Product Name *</label>
                  <input
                    value={editformData.pName}
                    onChange={(e) =>
                      setEditformdata({
                        ...editformData,
                        error: false,
                        success: false,
                        pName: e.target.value,
                      })
                    }
                    className="px-4 py-2 border focus:outline-none"
                    type="text"
                  />
                </div>
                <div className="w-1/2 flex flex-col space-y-1 space-x-1">
                  <label htmlFor="price">Product Price *</label>
                  <input
                    value={editformData.pPrice}
                    onChange={(e) =>
                      setEditformdata({
                        ...editformData,
                        error: false,
                        success: false,
                        pPrice: e.target.value,
                      })
                    }
                    type="number"
                    className="px-4 py-2 border focus:outline-none"
                    id="price"
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <label htmlFor="description">Product Description *</label>
                <textarea
                  value={editformData.pDescription}
                  onChange={(e) =>
                    setEditformdata({
                      ...editformData,
                      error: false,
                      success: false,
                      pDescription: e.target.value,
                    })
                  }
                  className="px-4 py-2 border focus:outline-none"
                  name="description"
                  id="description"
                  cols={5}
                  rows={2}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Product Images (Max 2)
                </label>

                <div className="flex flex-wrap gap-4 mb-4">
                  {editformData.pImages.map((img, index) => (
                    <div key={`existing-${index}`} className="relative">
                      <img
                        src={`https://firebasestorage.googleapis.com/v0/b/${process.env.REACT_APP_STORAGE_BUCKET}/o/${encodeURIComponent(img)}?alt=media`}
                        alt={`Product ${index}`}
                        className="w-24 h-24 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center transform translate-x-1/2 -translate-y-1/2 hover:bg-red-600"
                        aria-label="Delete image"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {imagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <img
                        src={preview}
                        alt={`New image ${index}`}
                        className="w-24 h-24 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex flex-col items-center px-4 py-2 bg-white rounded border border-gray-300 cursor-pointer hover:bg-gray-50">
                    <span className="text-sm">Upload Images</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleNewImageUpload}
                      className="hidden"
                      disabled={editformData.pImages.length + newImages.length >= 2}
                    />
                  </label>
                  <span className="text-sm text-gray-500">
                    {editformData.pImages.length + newImages.length}/2 images selected
                  </span>
                </div>
              </div>
              <div className="w-1/2 flex flex-col space-y-1">
                <label htmlFor="status">Product Category *</label>
                <select
                  onChange={(e) =>
                    setEditformdata({
                      ...editformData,
                      error: false,
                      success: false,
                      pCategory: e.target.value,
                    })
                  }
                  name="status"
                  className="px-4 py-2 border focus:outline-none"
                  id="status"
                >
                  <option disabled value="">
                    Select a category
                  </option>
                  {categories && categories.length > 0
                    ? categories.map((elem) => {
                      return (
                        <Fragment key={elem?._id}>
                          {editformData.pCategory?._id &&
                            editformData.pCategory?._id === elem?._id ? (
                            <option
                              name="status"
                              value={elem?._id}
                              key={elem?._id}
                              selected
                            >
                              {elem?.cName}
                            </option>
                          ) : (
                            <option
                              name="status"
                              value={elem?._id}
                              key={elem?._id}
                            >
                              {elem?.cName}
                            </option>
                          )}
                        </Fragment>
                      );
                    })
                    : ""}
                </select>
              </div>
              <div className="flex space-x-1 py-4">
                <div className="w-1/2 flex flex-col space-y-1">
                  <label htmlFor="quantity">Product in Stock *</label>
                  <input
                    value={editformData.pQuantity}
                    onChange={(e) =>
                      setEditformdata({
                        ...editformData,
                        error: false,
                        success: false,
                        pQuantity: e.target.value,
                      })
                    }
                    type="number"
                    className="px-4 py-2 border focus:outline-none"
                    id="quantity"
                  />
                </div>
                <div className="w-1/2 flex flex-col space-y-1">
                  <label htmlFor="offer">Product Offfer (%) *</label>
                  <input
                    value={editformData.pOffer}
                    onChange={(e) =>
                      setEditformdata({
                        ...editformData,
                        error: false,
                        success: false,
                        pOffer: e.target.value,
                      })
                    }
                    type="number"
                    className="px-4 py-2 border focus:outline-none"
                    id="offer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => dispatch({ type: "editProductModalClose", payload: false })}
                  className="px-4 py-2 border border-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default EditProductModal;