import React from "react";
import { Route, Redirect } from "react-router-dom";
import { isAuthenticate } from "./fetchApi";

const CartProtectedRoute = ({ component: Component, ...rest }) => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  return (
    <Route
      {...rest}
      render={(props) =>
        cart.length !== 0 && isAuthenticate() ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/",
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
};


export default CartProtectedRoute;
