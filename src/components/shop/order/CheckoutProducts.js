import React, { Fragment, useEffect, useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import { LayoutContext } from "../layout";
import { subTotal, quantity, totalCost } from "../partials/Mixins";
import { cartListProduct } from "../partials/FetchApi";
import { fetchData } from "./Action";
import { createOrder } from './FetchApi'

const qrImageURL = "/images/qr-code.png"; 

export const CheckoutComponent = (props) => {
  const history = useHistory();
  const { data, dispatch } = useContext(LayoutContext);

  const [state, setState] = useState({
    address: "",
    phone: "",
    error: false,
    success: false,
    utrNumber: "",
    step: 1,
  });

  useEffect(() => {
    fetchData(cartListProduct, dispatch);
  }, []);

  const handlePayNow = () => {
    if (!state.address || !state.phone) {
      setState({ ...state, error: "Please fill in both address and phone number." });
      return;
    }
    setState({ ...state, error: false, step: 2 });
  };

  const handleCompleteOrder = async () => {
    if (!state.utrNumber) {
      setState({ ...state, error: "Please enter the UPI Transaction ID." });
      return;
    }

    if (state.utrNumber.length !== 12) {
      setState({ ...state, error: "UPI Transaction ID must be exactly 12 characters." });
      return;
    }

    const user = JSON.parse(localStorage.getItem("jwt")).user;
    const orderData = {
      allProduct: data.cartProduct,
      user: user._id, 
      amount: totalCost(data.cartProduct),
      transactionId: state.utrNumber,
      address: state.address,
      phone: state.phone,
    };

    try {
      const response = await createOrder(orderData);
      if (response.success) {
        localStorage.removeItem("cart"); 
        dispatch({ type: "cartProduct", payload: [] });
        setState({ ...state, success: true });
        history.push(`/user/orders`);
      } else {
        setState({ ...state, error: response.message || "Order creation failed." });
      }
    } catch (err) {
      setState({ ...state, error: "Error creating order, please try again." });
      console.error("Error creating order:", err);
    }
  };

  if (data?.loading) {
    return (
      <div className="flex items-center justify-center h-screen">
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
        Please wait...
      </div>
    );
  }

  return (
    <Fragment>
      <section className="mx-4 mt-20 md:mx-12 md:mt-32 lg:mt-24">
        <div className="text-2xl mx-2">Order</div>
        <div className="flex flex-col md:flex md:space-x-2 md:flex-row">
          <div className="md:w-1/2">
            <CheckoutProducts products={data.cartProduct} />
          </div>
          <div className="w-full order-first md:order-last md:w-1/2 p-4 md:p-8">
            {state.error && (
              <div className="bg-red-200 py-2 px-4 rounded mb-4">
                {state.error}
              </div>
            )}

            {state.step === 1 && (
              <>
                <div className="flex flex-col py-2">
                  <label htmlFor="address" className="pb-2">
                    Delivery Address
                  </label>
                  <input
                    value={state.address}
                    onChange={(e) =>
                      setState({ ...state, address: e.target.value, error: false })
                    }
                    type="text"
                    id="address"
                    className="border px-4 py-2"
                    placeholder="Enter your address..."
                  />
                </div>
                <div className="flex flex-col py-2 mb-4">
                  <label htmlFor="phone" className="pb-2">
                    Phone
                  </label>
                  <input
                    value={state.phone}
                    onChange={(e) =>
                      setState({ ...state, phone: e.target.value, error: false })
                    }
                    type="tel"
                    id="phone"
                    className="border px-4 py-2"
                    placeholder="Enter phone number..."
                  />
                </div>
                <div
                  onClick={handlePayNow}
                  className="w-full px-4 py-2 text-center text-white font-semibold cursor-pointer"
                  style={{ background: "#303031" }}
                >
                  Pay Now
                </div>
              </>
            )}

            {state.step === 2 && (
              <>
                <div className="mb-4 text-center">
                  <p className="mb-2 font-semibold text-lg">Scan to Pay</p>
                  <img
                    src={qrImageURL}
                    alt="QR Code"
                    className="mx-auto w-48 h-48 object-contain"
                  />
                </div>
                <div className="flex flex-col py-2 mb-4">
                  <label htmlFor="utr" className="pb-2">
                    Enter UPI Transaction ID
                  </label>
                  <input
                    value={state.utrNumber}
                    onChange={(e) =>
                      setState({ ...state, utrNumber: e.target.value, error: false })
                    }
                    type="text"
                    id="utr"
                    className="border px-4 py-2"
                    placeholder="12-character UPI Transaction ID"
                    maxLength={12} 
                  />
                </div>
                <div
                  onClick={handleCompleteOrder}
                  className="w-full px-4 py-2 text-center text-white font-semibold cursor-pointer"
                  style={{ background: "#303031" }}
                >
                  Complete Order
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </Fragment>
  );
};

const CheckoutProducts = ({ products }) => {
  const history = useHistory();

  return (
    <Fragment>
      <div className="grid grid-cols-2 md:grid-cols-1">
        {products && products.length > 0 ? (
          products.map((product, index) => (
            <div
              key={index}
              className="col-span-1 m-2 md:py-6 md:border-t md:border-b md:my-2 md:mx-0 md:flex md:items-center md:justify-between"
            >
              <div className="md:flex md:items-center md:space-x-4">
                <img
                  onClick={() => history.push(`/products/${product?._id}`)}
                  className="cursor-pointer md:h-20 md:w-?20 object-cover object-center"
                  src={product?.pImages[0]}
                  alt={product?.pName}
                />
                <div className="text-lg md:ml-6 truncate">{product?.pName}</div>
                <div className="md:ml-6 font-semibold text-gray-600 text-sm">
                  Price: ${product?.pPrice}.00
                </div>
                <div className="md:ml-6 font-semibold text-gray-600 text-sm">
                  Quantity: {quantity(product?._id)}
                </div>
                <div className="font-semibold text-gray-600 text-sm">
                  Subtotal: ${subTotal(product?._id, product?.pPrice)}.00
                </div>
              </div>
            </div>
          ))
        ) : (
          <div>No product found for checkout</div>
        )}
      </div>
    </Fragment>
  );
};

export default CheckoutProducts;
