import React, { Fragment, useContext, useEffect, useState } from "react";
import { getAllProduct, deleteProduct,deleteMultipleProducts } from "./FetchApi";
import moment from "moment";
import { ProductContext } from "./index";
import { deleteImages } from "../../../utils/deleteImages";
import { deleteMultipleImagesBatch } from "../../../utils/deleteMultipleImages";
const apiURL = process.env.REACT_APP_API_URL;

const AllProduct = () => {
  const { data, dispatch } = useContext(ProductContext);
  const { products } = data;

  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    let responseData = await getAllProduct();
    setTimeout(() => {
      if (responseData && responseData.Products) {
        dispatch({
          type: "fetchProductsAndChangeState",
          payload: responseData.Products,
        });
        setLoading(false);
      }
    }, 1000);
  };

  const deleteProductReq = async (pId) => {
    try {
      const productToDelete = products.find((product) => product._id === pId);
      if (!productToDelete) return;

      if (productToDelete.pImages?.length > 0) {
        await deleteImages(productToDelete.pImages);
      }

      let deleteC = await deleteProduct(pId);
      if (deleteC?.success) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

const deleteMultipleProductsHandler = async (productIds) => {
  if (!productIds || productIds.length === 0) return;
  setLoading(true);
  try {
    const imagesArrays = productIds
      .map((pId) => products.find((p) => p._id === pId)?.pImages || [])
      .filter((imgs) => imgs.length > 0);

    if (imagesArrays.length > 0) {
      await deleteMultipleImagesBatch(imagesArrays);
    }

    const response = await deleteMultipleProducts(productIds);

    if (response?.success) {
      console.log("Multiple products deleted successfully");
      await fetchData();
      setSelectedProducts([]);
    } else if (response?.error) {
      console.log("Error deleting multiple products:", response.error);
    }
  } catch (error) {
    console.error("Error deleting multiple products:", error);
  } finally {
    setLoading(false);
  }
};




  const toggleSelectProduct = (pId) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(pId)
        ? prevSelected.filter((id) => id !== pId)
        : [...prevSelected, pId]
    );
  };

  const isSelected = (pId) => selectedProducts.includes(pId);

  const editProduct = (pId, product, type) => {
    if (type) {
      dispatch({
        type: "editProductModalOpen",
        product: { ...product, pId: pId },
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <svg
          className="w-12 h-12 animate-spin text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          ></path>
        </svg>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="col-span-1 overflow-auto bg-white shadow-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">All Products</h2>
          {selectedProducts.length > 0 && (
            <button
              onClick={()=>deleteMultipleProductsHandler(selectedProducts)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
            >
              Delete Selected ({selectedProducts.length})
            </button>
          )}
        </div>

        <table className="table-auto border w-full my-2">
          <thead>
            <tr>
              <th className="px-4 py-2 border">
                <input
                  type="checkbox"
                  checked={
                    products?.length > 0 &&
                    selectedProducts?.length === products?.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProducts(products.map((p) => p._id));
                    } else {
                      setSelectedProducts([]);
                    }
                  }}
                />
              </th>
              <th className="px-4 py-2 border">Product</th>
              <th className="px-4 py-2 border">Description</th>
              <th className="px-4 py-2 border">Image</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Stock</th>
              <th className="px-4 py-2 border">Category</th>
              <th className="px-4 py-2 border">Offer</th>
              <th className="px-4 py-2 border">Created at</th>
              <th className="px-4 py-2 border">Updated at</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products && products?.length > 0 ? (
              products?.map((item, key) => (
                <ProductTable
                  key={item._id}
                  product={item}
                  isSelected={isSelected(item._id)}
                  toggleSelect={toggleSelectProduct}
                  editProduct={editProduct}
                  deleteProduct={deleteProductReq}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan="11"
                  className="text-xl text-center font-semibold py-8"
                >
                  No product found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="text-sm text-gray-600 mt-2">
          Total {products?.length} product(s) found
        </div>
      </div>
    </Fragment>
  );
};

/* Single Product Row */
const ProductTable = ({
  product,
  isSelected,
  toggleSelect,
  editProduct,
  deleteProduct,
}) => {
  return (
    <tr>
      <td className="p-2 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleSelect(product._id)}
        />
      </td>
      <td className="p-2 text-left">
        {product.pName.length > 15
          ? product.pName.substring(0, 15) + "..."
          : product.pName}
      </td>
      <td className="p-2 text-left">
        {product.pDescription.slice(0, 15)}...
      </td>
      <td className="p-2 text-center">
        <img
          className="w-12 h-12 object-cover object-center"
          src={`https://firebasestorage.googleapis.com/v0/b/${process.env.REACT_APP_STORAGE_BUCKET}/o/${encodeURIComponent(
            product.pImages[0]
          )}?alt=media`}
          alt="product"
        />
      </td>
      <td className="p-2 text-center">
        {product.pStatus === "Active" ? (
          <span className="bg-green-200 rounded-full text-xs px-2 font-semibold">
            {product.pStatus}
          </span>
        ) : (
          <span className="bg-red-200 rounded-full text-xs px-2 font-semibold">
            {product.pStatus}
          </span>
        )}
      </td>
      <td className="p-2 text-center">{product.pQuantity}</td>
      <td className="p-2 text-center">{product.pCategory?.cName}</td>
      <td className="p-2 text-center">{product.pOffer}</td>
      <td className="p-2 text-center">
        {moment(product.createdAt).format("lll")}
      </td>
      <td className="p-2 text-center">
        {moment(product.updatedAt).format("lll")}
      </td>
      <td className="p-2 flex items-center justify-center">
        <span
          onClick={() => editProduct(product._id, product, true)}
          className="cursor-pointer hover:bg-gray-200 rounded-lg p-2 mx-1"
        >
          <svg
            className="w-6 h-6 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
            <path
              fillRule="evenodd"
              d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <span
          onClick={() => deleteProduct(product._id)}
          className="cursor-pointer hover:bg-gray-200 rounded-lg p-2 mx-1"
        >
          <svg
            className="w-6 h-6 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </td>
    </tr>
  );
};

export default AllProduct;
