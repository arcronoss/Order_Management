import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import MenuBar from "./MenuBar";
import {
  FaGlassMartiniAlt,
  FaHamburger,
  FaPizzaSlice,
  FaUtensils,
} from "react-icons/fa";
import "./TablePage.css";
import Banner from "./Banner"; // เพิ่มการนำเข้า Banner Component

const TablePage = () => {
  const { tableId } = useParams();
  const [tableData, setTableData] = useState(null);
  const [allMenus, setAllMenus] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("maincourse");
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const docRef = doc(db, "Tables", `table${tableId}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTableData(docSnap.data());
        } else {
          console.error("No such table document!");
        }
      } catch (error) {
        console.error("Error fetching table data:", error);
      }
    };

    fetchTableData();
  }, [tableId]);

  useEffect(() => {
    const fetchAllMenus = async () => {
      try {
        const categoryRef = collection(db, "Menus");
        const querySnapshot = await getDocs(categoryRef);
        const menuItems = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllMenus(menuItems);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching menus:", error);
        setIsLoading(false);
      }
    };

    fetchAllMenus();
  }, []);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredMenu(allMenus);
    } else {
      setFilteredMenu(
        allMenus.filter((item) => item.category === selectedCategory)
      );
    }
  }, [selectedCategory, allMenus]);

  const handleAddToCart = (menuItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === menuItem.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...menuItem, quantity: 1 }];
      }
    });
  };

  const handleIncreaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecreaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const calculateTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateTotalQuantity = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const [successMessage, setSuccessMessage] = useState(""); // state สำหรับข้อความสำเร็จ
  const [errorMessage, setErrorMessage] = useState(""); // state สำหรับข้อความข้อผิดพลาด

  const handleSubmitOrder = async () => {
    try {
      // Prepare order data
      const orderData = {
        tableId,
        items: cartItems.map((item) => ({
          menuId: item.id,
          name: item.menu_name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: calculateTotalPrice(),
        timestamp: new Date(),
      };

      // Add order to Firestore
      await addDoc(collection(db, "Orders"), orderData);

      setCartItems([]);
      setSuccessMessage("ส่งรายการสำเร็จ"); // แสดงข้อความสำเร็จ
      setErrorMessage(""); // เคลียร์ข้อความข้อผิดพลาด
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Failed to submit order.");
      setErrorMessage("Failed to submit order."); // แสดงข้อความข้อผิดพลาด
      setSuccessMessage(""); // เคลียร์ข้อความสำเร็จ
    }
  };

  if (isLoading) return <p>Loading menu items...</p>;

  return (
    <>
      <MenuBar
        cartItemCount={calculateTotalQuantity()}
        toggleOrderSummary={() => setShowOrderSummary(!showOrderSummary)}
      />
      <div className="table-page">
        <div className="table-info">
          {tableData ? (
            <div>
              <h1>โต๊ะหมายเลข {tableData.table_number}</h1>
              <Banner />
            </div>
          ) : (
            <p>Loading table information...</p>
          )}
        </div>

        <div className="menu">
          <h2>Menu</h2>
          <div className="category-buttons">
            <button
              onClick={() => setSelectedCategory("maincourse")}
              className={`category-icon ${
                selectedCategory === "maincourse" ? "active" : ""
              }`}
            >
              <FaUtensils size={30} />
            </button>
            <button
              onClick={() => setSelectedCategory("burger")}
              className={`category-icon ${
                selectedCategory === "burger" ? "active" : ""
              }`}
            >
              <FaHamburger size={30} />
            </button>
            <button
              onClick={() => setSelectedCategory("fastfood")}
              className={`category-icon ${
                selectedCategory === "fastfood" ? "active" : ""
              }`}
            >
              <FaPizzaSlice size={30} />
            </button>
            <button
              onClick={() => setSelectedCategory("drink")}
              className={`category-icon ${
                selectedCategory === "drink" ? "active" : ""
              }`}
            >
              <FaGlassMartiniAlt size={30} />
            </button>
          </div>

          {filteredMenu.length > 0 ? (
            <div className="menu-grid">
              {filteredMenu.map((item) => (
                <div key={item.id} className="menu-card">
                  <div className="menu-image">
                    <img
                      src={item.image_url || "default-image-url.png"}
                      alt={item.menu_name}
                    />
                  </div>
                  <div className="menu-details">
                    <h3>{item.menu_name}</h3>
                    <p>{item.price} THB</p>
                    <button onClick={() => handleAddToCart(item)}>+</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No menu items available.</p>
          )}
        </div>

        {showOrderSummary && (
          <div className="order-summary">
            <h2>รายการสั่งซื้อ</h2>
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={item.id} className="order-item">
                  <span>{item.menu_name}</span>
                  <div className="order-controls">
                    <button onClick={() => handleDecreaseQuantity(item.id)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleIncreaseQuantity(item.id)}>
                      +
                    </button>
                    <button onClick={() => handleRemoveItem(item.id)}>
                      ลบรายการ
                    </button>
                  </div>
                  <span>{item.price * item.quantity} บาท</span>
                </div>
              ))
            ) : (
              <p className="no_item_selected">เชิญเลือกเมนูที่ชอบได้เลยค่ะ.</p>
            )}
            <div className="order-summary-bottom">
              {/* Submit Order Button */}
              <button
                onClick={handleSubmitOrder}
                className="submit-order-button"
                disabled={cartItems.length === 0} // Disable button if cart is empty
              >
                ส่งรายการสั่งซื้อ
              </button>
              {successMessage && (
                <p style={{ color: "green" }}>{successMessage}</p>
              )}{" "}
              {/* แสดงข้อความสำเร็จ */}
              {errorMessage && (
                <p style={{ color: "red" }}>{errorMessage}</p>
              )}{" "}
              {/* แสดงข้อความข้อผิดพลาด */}
              <div className="total-price">
                รวม: {calculateTotalPrice()} บาท
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TablePage;
