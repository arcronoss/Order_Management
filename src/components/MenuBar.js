// import React from "react";
// import "./MenuBar.css";
// import { FaBars, FaShoppingCart } from "react-icons/fa";
// import logo from "../images/Logo.png";

// const MenuBar = ({ toggleOrderSummary }) => {
//   return (
//     <div className="menu-bar">
//       <button className="icon-button category-button">
//         <FaBars />
//       </button>
//       <img src={logo} alt="Logo" className="logo" />
//       <button className="icon-button cart-button" onClick={toggleOrderSummary}>
//         <FaShoppingCart />
//       </button>
//     </div>
//   );
// };

// export default MenuBar;
//---------------------------------------------------------------------------------
import React from "react";
import "./MenuBar.css";
import { FaShoppingCart, FaReceipt } from "react-icons/fa";
import logo from "../images/Logo.png";

const MenuBar = ({ cartItemCount, toggleOrderSummary, invoiceOrder }) => {
  return (
    <div className="body-menu-bar">
      <div className="menu-bar">
        <button className="icon-button category-button" onClick={invoiceOrder}>
          <FaReceipt />
        </button>
        <img src={logo} alt="Logo" className="logo" />
        <button
          className="icon-button cart-button"
          onClick={toggleOrderSummary}
        >
          <FaShoppingCart />
          {cartItemCount > 0 && (
            <span className="cart-badge">{cartItemCount}</span> // Badge to show the count
          )}
        </button>
      </div>{" "}
    </div>
  );
};

export default MenuBar;
