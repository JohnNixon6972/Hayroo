import React, { Fragment, useContext, useState, useEffect } from "react";
import { CategoryContext } from "./index";
import { createCategory, getAllCategory } from "./FetchApi";
import { uploadImages } from "../../../utils/uploadImages";

const AddCategoryModal = (props) => {
  const { data, dispatch } = useContext(CategoryContext);
  const [loading, setLoading] = useState(false);

  const alert = (msg, type) => (
    <div className={`bg-${type}-200 py-2 px-4 w-full`}>{msg}</div>
  );

  const [fData, setFdata] = useState({
    cName: "",
    cDescription: "",
    cImages: null,
    cStatus: "Active",
    success: false,
    error: false,
  });

  const fetchData = async () => {
    let responseData = await getAllCategory();
    if (responseData.Categories) {
      dispatch({
        type: "fetchCategoryAndChangeState",
        payload: responseData.Categories,
      });
    }
  };

  const removeImage = () => {
    setFdata({
      ...fData,
      cImages: null,
    });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    e.target.reset();

    if (!fData.cName || !fData.cDescription) {
      setFdata({ ...fData, error: "Please fill all required fields" });
      setTimeout(() => {
        setFdata({ ...fData, error: false });
      }, 2000);
      return;
    }

    if (!fData.cImages) {
      setFdata({ ...fData, error: "Please upload an image" });
      setTimeout(() => {
        setFdata({ ...fData, error: false });
      }, 2000);
      return;
    }

    setLoading(true);

    try {
      const imageUrls = await uploadImages([fData.cImages], "category");

      const updatedCategoryData = {
        ...fData,
        cImage: imageUrls[0],
        cImages: imageUrls,
      };

      let responseData = await createCategory(updatedCategoryData);

      if (responseData.success) {
        fetchData();
        setFdata({
          cName: "",
          cDescription: "",
          cImages: null,
          cStatus: "Active",
          success: responseData.success,
          error: false,
        });
        setTimeout(() => {
          setFdata((prev) => ({ ...prev, success: false }));
        }, 2000);
      } else if (responseData.error) {
        setFdata({ ...fData, success: false, error: responseData.error });
        setTimeout(() => {
          setFdata({ ...fData, error: false, success: false });
        }, 2000);
      }
    } catch (error) {
      console.error("Category creation failed", error);
      setFdata({ ...fData, error: "Category creation failed", success: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <div
        onClick={() => dispatch({ type: "addCategoryModal", payload: false })}
        className={`${data.addCategoryModal ? "" : "hidden"} fixed top-0 left-0 z-30 w-full h-full bg-black opacity-50`}
      />
      <div
        className={`${data.addCategoryModal ? "" : "hidden"} fixed inset-0 flex items-center z-30 justify-center overflow-auto`}
      >
        <div className="mt-32 md:mt-0 relative bg-white w-11/12 md:w-3/6 shadow-lg flex flex-col items-center space-y-4 px-4 py-4 md:px-8">
          <div className="flex items-center justify-between w-full pt-4">
            <span className="text-left font-semibold text-2xl tracking-wider">Add Category</span>
            <span
              style={{ background: "#303031" }}
              onClick={() => dispatch({ type: "addCategoryModal", payload: false })}
              className="cursor-pointer text-gray-100 py-2 px-2 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          </div>

          {fData.error ? alert(fData.error, "red") : ""}
          {fData.success ? alert(fData.success, "green") : ""}

          <form className="w-full" onSubmit={submitForm}>
            <div className="flex flex-col space-y-1 w-full py-4">
              <label>Category Name *</label>
              <input
                value={fData.cName}
                onChange={(e) => setFdata({ ...fData, error: false, success: false, cName: e.target.value })}
                className="px-4 py-2 border focus:outline-none"
                type="text"
              />
            </div>
            <div className="flex flex-col space-y-1 w-full">
              <label>Category Description *</label>
              <textarea
                value={fData.cDescription}
                onChange={(e) => setFdata({ ...fData, error: false, success: false, cDescription: e.target.value })}
                className="px-4 py-2 border focus:outline-none"
                cols={5}
                rows={5}
              />
            </div>
            <div className="flex flex-col mt-4">
              <label>Category Image *</label>
              <input
                onChange={(e) => {
                  if (e.target.files.length > 0) {
                    setFdata({
                      ...fData,
                      error: false,
                      success: false,
                      cImages: e.target.files[0], // Only one image allowed
                    });
                  }
                }}
                type="file"
                accept=".jpg, .jpeg, .png"
                className="px-4 py-2 border focus:outline-none"
                id="image"
              />

              {fData.cImages && (
                <div className="mt-2">
                  <p className="text-sm">Selected file:</p>
                  <div className="flex items-center bg-gray-100 px-2 py-1 rounded mt-1">
                    <span className="text-sm mr-2">{fData.cImages.name}</span>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col space-y-1 w-full">
              <label>Category Status *</label>
              <select
                value={fData.cStatus}
                onChange={(e) => setFdata({ ...fData, error: false, success: false, cStatus: e.target.value })}
                className="px-4 py-2 border focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>
            <div className="flex flex-col space-y-1 w-full pb-4 md:pb-6 mt-4">
              <button
                style={{ background: "#303031" }}
                type="submit"
                className="rounded-full text-gray-100 text-lg font-medium py-2 flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <Fragment>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Category...
                  </Fragment>
                ) : (
                  "Create category"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Fragment>
  );
};

export default AddCategoryModal;
