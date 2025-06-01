import React, { Fragment } from "react";
import { useHistory } from "react-router-dom";

const Submenu = (props) => {
  const { categoryId, category, product } = props.value;
  const history = useHistory();
  return (
    <Fragment>
      {/* Submenu Section */}
      <section className="mx-4 mt-24 md:mx-12 md:mt-32 lg:mt-24">
        <div className="flex justify-between items-center">
          <div className="text-sm flex items-center space-x-2">
            <span
              className="hover:text-yellow-700 cursor-pointer"
              onClick={(e) => history.push("/")}
            >
              Shop
            </span>
            <span className="text-gray-400">/</span>
            <span
              className="hover:text-yellow-700 cursor-pointer"
              onClick={(e) => history.push(`/products/category/${categoryId}`)}
            >
              {category}
            </span>
            {product && (
              <>
                <span className="text-gray-400">/</span>
                <span className="text-yellow-700 cursor-default">{product}</span>
              </>
            )}
          </div>
        </div>
      </section>
      {/* Submenu Section */}
    </Fragment>
  );
};

export default Submenu;
