import React from "react";
import "./MenuBar.css";
import { FaBars, FaShoppingCart } from "react-icons/fa"; 
import logo from "../images/Logo.png";


const MenuBar = ({ toggleOrderSummary }) => {
  return (
    <div className="menu-bar">
      <button className="icon-button category-button">
        <FaBars />
      </button>
      <img src={logo} alt="Logo" className="logo" />
      <button className="icon-button cart-button" onClick={toggleOrderSummary}>
        <FaShoppingCart />
      </button>
    </div>
  );
};

export default MenuBar;
